import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path) {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 1) continue;
      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env.test.local");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. Add it to .env.test.local.`);
  return value;
}

const supabase = createClient(
  required("NEXT_PUBLIC_SUPABASE_URL"),
  required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

let projectId = "";
let projectSlug = "";

try {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: required("E2E_ADMIN_EMAIL"),
    password: required("E2E_ADMIN_PASSWORD"),
  });
  if (signInError) throw signInError;

  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const sourceBlock = {
    id: "test-solution",
    type: "image-text",
    heading: "A patient-centred solution",
    body: "Woittola delivered 12 treatment chairs for a calm and efficient clinical environment.",
    imageUrls: ["/images/hero-products.png"],
    imageAlt: "Treatment chair in a clinical room",
    caption: "",
    imagePosition: "right",
  };
  const { data: result, error: invokeError } = await supabase.functions.invoke("catalogue-translate", {
    body: {
      action: "save",
      entityType: "referenceProject",
      data: {
        slug: "",
        projectType: "Health centre",
        completedYear: 2026,
        status: "draft",
        coverImageUrl: "/images/hero-products.png",
        galleryUrls: [],
        title: `Reference workflow test ${unique}`,
        summary: "A temporary project used to verify secure Finnish translation.",
        location: "Tampere, Finland",
        unit: "Outpatient care",
        metaTitle: "Reference workflow test | Woittola References",
        metaDescription: "Temporary translation quality assurance project.",
        contentBlocks: [sourceBlock],
      },
    },
  });
  if (invokeError) {
    let details = "";
    if (invokeError.context instanceof Response) details = await invokeError.context.text().catch(() => "");
    throw new Error(details || invokeError.message);
  }
  if (!result?.entityId) throw new Error(result?.error || "The Edge Function did not return a project id.");
  projectId = result.entityId;
  projectSlug = result.slug;
  if (!projectSlug?.startsWith("reference-workflow-test-")) {
    throw new Error(`The automatic project URL was not returned correctly: ${projectSlug || "missing"}`);
  }
  if (result.translationStatus !== "ready") {
    throw new Error(`Finnish translation did not become ready: ${result.translationError || "unknown error"}`);
  }

  const [{ data: project, error: projectError }, { data: translations, error: translationsError }] = await Promise.all([
    supabase.from("reference_projects").select("translation_status, cover_image_url, gallery_urls, slug").eq("id", projectId).single(),
    supabase.from("reference_project_translations").select("locale, title, summary, project_type_label, content_blocks").eq("project_id", projectId),
  ]);
  if (projectError || translationsError) throw new Error(projectError?.message || translationsError?.message);
  const english = translations?.find((translation) => translation.locale === "en");
  const finnish = translations?.find((translation) => translation.locale === "fi");
  const finnishBlock = finnish?.content_blocks?.[0];
  if (project?.translation_status !== "ready" || !english || !finnish || !finnishBlock) {
    throw new Error("The saved project or its English/Finnish rows are incomplete.");
  }
  if (!finnish.title?.trim() || !finnish.summary?.trim() || !finnish.project_type_label?.trim() || !finnishBlock.heading?.trim()) {
    throw new Error("The Finnish project content is empty.");
  }
  if (
    project.cover_image_url !== "/images/hero-products.png" ||
    project.gallery_urls?.length !== 0 ||
    project.slug !== projectSlug ||
    english.project_type_label !== "Health centre" ||
    finnishBlock.id !== sourceBlock.id ||
    finnishBlock.type !== sourceBlock.type ||
    finnishBlock.imageUrls?.[0] !== sourceBlock.imageUrls[0] ||
    finnishBlock.imagePosition !== sourceBlock.imagePosition
  ) {
    throw new Error("A protected project structure or media URL changed.");
  }

  console.log("References E2E passed: authenticated save, Gemini Finnish upsert, status, blocks and media URLs verified.");
} finally {
  if (!projectId && projectSlug) {
    const { data: savedProject } = await supabase
      .from("reference_projects")
      .select("id, translation_status, translation_error")
      .eq("slug", projectSlug)
      .maybeSingle();
    if (savedProject) {
      projectId = savedProject.id;
      console.error("Failed test row state:", {
        translationStatus: savedProject.translation_status,
        translationError: savedProject.translation_error,
      });
    }
  }
  if (projectId) {
    const { error } = await supabase.from("reference_projects").delete().eq("id", projectId);
    if (error) console.error("E2E cleanup failed. Delete temporary reference project:", projectId);
  }
  await supabase.auth.signOut();
}
