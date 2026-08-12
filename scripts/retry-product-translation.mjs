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
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

const productTitle = process.argv.slice(2).join(" ").trim();
if (!productTitle) throw new Error('Usage: node scripts/retry-product-translation.mjs "Product title"');

const supabase = createClient(
  required("NEXT_PUBLIC_SUPABASE_URL"),
  required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

try {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: required("E2E_ADMIN_EMAIL"),
    password: required("E2E_ADMIN_PASSWORD"),
  });
  if (signInError) throw signInError;

  const { data: englishRows, error: lookupError } = await supabase
    .from("product_translations")
    .select("product_id, name")
    .eq("locale", "en")
    .eq("name", productTitle);
  if (lookupError) throw lookupError;
  if (englishRows?.length !== 1) throw new Error(`Expected one English product named ${productTitle}; found ${englishRows?.length ?? 0}.`);
  const productId = englishRows[0].product_id;

  const { data: invokeResult, error: invokeError } = await supabase.functions.invoke("catalogue-translate", {
    body: { action: "retry", entityType: "product", entityId: productId },
  });

  let state = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const { data, error } = await supabase
      .from("products")
      .select("brand, translation_status, translation_error")
      .eq("id", productId)
      .single();
    if (error) throw error;
    state = data;
    if (state.translation_status === "ready" || state.translation_status === "failed") break;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  if (state?.translation_status !== "ready") {
    throw new Error(state?.translation_error || invokeResult?.translationError || invokeError?.message || "Finnish translation did not become ready.");
  }

  const { data: finnish, error: finnishError } = await supabase
    .from("product_translations")
    .select("name, description")
    .eq("product_id", productId)
    .eq("locale", "fi")
    .single();
  if (finnishError || !finnish) throw new Error(finnishError?.message || "The Finnish row was not created.");
  if (state.brand && !finnish.name.includes(state.brand)) throw new Error("The Finnish title does not preserve the product brand.");

  console.log("Product translation repaired and verified:", {
    productId,
    status: state.translation_status,
    brandPreserved: Boolean(!state.brand || finnish.name.includes(state.brand)),
    finnishTitle: finnish.name,
  });
} finally {
  await supabase.auth.signOut();
}
