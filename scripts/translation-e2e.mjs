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

const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const email = required("E2E_ADMIN_EMAIL");
const password = required("E2E_ADMIN_PASSWORD");
const supabase = createClient(supabaseUrl, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let productId = "";
let productSlug = "";

try {
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_catalogue_admin");
  if (adminError || isAdmin !== true) throw new Error("The E2E user is not listed in catalogue_admins.");

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .order("sort_order", { ascending: true })
    .limit(1)
    .single();
  if (categoryError || !category) throw new Error(categoryError?.message || "No catalogue category exists.");

  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  productSlug = `translation-test-${unique}`;
  const englishName = `Woittola Translation workflow test ${unique}`;
  const englishDescription = "A temporary clinical product used to verify automatic Finnish translation. Maximum load 120 kg.";
  let { data: result, error: invokeError } = await supabase.functions.invoke("catalogue-translate", {
    body: {
      action: "save",
      entityType: "product",
      data: {
        categoryId: category.id,
        slug: productSlug,
        brand: "Woittola",
        productType: "test-product",
        applications: ["Clinical testing"],
        status: "draft",
        primaryImageUrl: "/images/hero-products.png",
        galleryUrls: [],
        brochureUrl: "",
        technicalSheetUrl: "",
        videoUrl: "",
        name: englishName,
        description: englishDescription,
        productTypeLabel: "Test product",
        applicationLabels: ["Clinical testing"],
        typicalApplications: ["Translation quality assurance"],
        keyFeatures: ["Maximum load 120 kg"],
        reasons: ["Verifies Finnish catalogue content"],
        colors: [{ name: "Deep blue", value: "#123456" }],
        specifications: [{ label: "Maximum load", value: "120 kg" }],
        accessories: ["Test accessory"],
      },
    },
  });
  if (invokeError) {
    // Gemini can outlive the HTTP client's response window. In that case the
    // Edge Function still finishes and Supabase remains the source of truth.
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const { data: savedProduct } = await supabase
        .from("products")
        .select("id, translation_status, translation_error")
        .eq("slug", productSlug)
        .maybeSingle();
      if (savedProduct?.translation_status === "ready" || savedProduct?.translation_status === "failed") {
        productId = savedProduct.id;
        result = {
          entityId: savedProduct.id,
          translationStatus: savedProduct.translation_status,
          translationError: savedProduct.translation_error,
        };
        invokeError = null;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    if (invokeError) {
      let details = "";
      if (invokeError.context instanceof Response) {
        details = await invokeError.context.text().catch(() => "");
      }
      throw new Error(details || invokeError.message);
    }
  }
  if (!result?.entityId) throw new Error(result?.error || "The Edge Function did not return a product id.");
  productId = result.entityId;
  if (result.translationStatus !== "ready") {
    throw new Error(`Finnish translation did not become ready: ${result.translationError || "unknown error"}`);
  }

  const [{ data: product, error: productError }, { data: translations, error: translationsError }] = await Promise.all([
    supabase.from("products").select("translation_status, translation_error").eq("id", productId).single(),
    supabase.from("product_translations").select("locale, name, description, colors, specifications").eq("product_id", productId),
  ]);
  if (productError || translationsError) throw new Error(productError?.message || translationsError?.message);
  const english = translations?.find((translation) => translation.locale === "en");
  const finnish = translations?.find((translation) => translation.locale === "fi");
  if (product?.translation_status !== "ready" || !english || !finnish) {
    throw new Error("The saved product or its English/Finnish rows are incomplete.");
  }
  if (english.name !== englishName || english.description !== englishDescription) {
    throw new Error("The English source content changed unexpectedly.");
  }
  if (!finnish.name?.trim() || !finnish.description?.trim()) {
    throw new Error("The Finnish product content is empty.");
  }
  if (!finnish.name.includes("Woittola")) {
    throw new Error("The protected brand name changed inside the translated product title.");
  }
  if (finnish.colors?.[0]?.value !== "#123456" || finnish.specifications?.[0]?.value !== "120 kg") {
    throw new Error("A protected colour value, measurement or unit changed.");
  }

  console.log("Translation E2E passed: authenticated save, Gemini Finnish upsert, status and protected values verified.");
} finally {
  if (!productId && productSlug) {
    const { data: savedProduct } = await supabase
      .from("products")
      .select("id, translation_status, translation_error")
      .eq("slug", productSlug)
      .maybeSingle();
    if (savedProduct) {
      productId = savedProduct.id;
      console.error("Failed test row state:", {
        translationStatus: savedProduct.translation_status,
        translationError: savedProduct.translation_error,
      });
    }
  }
  if (productId) {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) console.error("E2E cleanup failed. Delete temporary product:", productId);
  }
  await supabase.auth.signOut();
}
