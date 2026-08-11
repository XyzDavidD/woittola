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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
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

let partnerId = "";

try {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: required("E2E_ADMIN_EMAIL"),
    password: required("E2E_ADMIN_PASSWORD"),
  });
  if (signInError) throw signInError;

  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const title = `PARTNER TEST ${unique}`;
  const description = `${title} develops professional healthcare furniture for efficient and comfortable clinical environments.`;
  const imageUrl = "/images/logo.png";
  const { data: result, error: invokeError } = await supabase.functions.invoke("catalogue-translate", {
    body: { action: "save", entityType: "partner", data: { title, description, imageUrl } },
  });
  if (invokeError) {
    let details = "";
    if (invokeError.context instanceof Response) details = await invokeError.context.text().catch(() => "");
    throw new Error(details || invokeError.message);
  }
  if (!result?.entityId) throw new Error(result?.error || "The Edge Function did not return a partner id.");
  partnerId = result.entityId;
  if (result.translationStatus !== "ready") throw new Error(result.translationError || "Finnish partner translation did not become ready.");

  const [{ data: partner, error: partnerError }, { data: translations, error: translationError }] = await Promise.all([
    supabase.from("partners").select("image_url, translation_status").eq("id", partnerId).single(),
    supabase.from("partner_translations").select("locale, title, description").eq("partner_id", partnerId),
  ]);
  if (partnerError || translationError) throw new Error(partnerError?.message || translationError?.message);
  const english = translations?.find((row) => row.locale === "en");
  const finnish = translations?.find((row) => row.locale === "fi");
  if (partner?.translation_status !== "ready" || partner.image_url !== imageUrl || !english || !finnish) {
    throw new Error("The saved partner or its translation rows are incomplete.");
  }
  if (english.title !== title || finnish.title !== title || !finnish.description?.trim() || !finnish.description.includes(title)) {
    throw new Error("The partner title was changed or the Finnish description is incomplete.");
  }

  console.log("Partners E2E passed: authenticated save, optional image, brand preservation and Finnish translation verified.");
} finally {
  if (partnerId) {
    const { error } = await supabase.from("partners").delete().eq("id", partnerId);
    if (error) console.error("E2E cleanup failed. Delete temporary partner:", partnerId);
  }
  await supabase.auth.signOut();
}
