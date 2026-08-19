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

const supabase = createClient(
  required("NEXT_PUBLIC_SUPABASE_URL"),
  required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const createdIds = [];

try {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: required("E2E_ADMIN_EMAIL"),
    password: required("E2E_ADMIN_PASSWORD"),
  });
  if (signInError) throw signInError;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .order("sort_order", { ascending: true })
    .limit(1)
    .single();
  if (categoryError || !category) throw new Error(categoryError?.message || "No category exists.");

  const baseSlug = `slug-collision-test-${Date.now()}`;
  const payload = {
    categoryId: category.id,
    slug: baseSlug,
    brand: "",
    productType: "",
    applications: [],
    status: "draft",
    primaryImageUrl: "/images/hero-products.png",
    galleryUrls: [],
    brochureUrl: "",
    technicalSheetUrl: "",
    videoUrl: "",
    name: "Temporary slug collision product",
    description: "Temporary product used to verify collision-proof automatic URLs.",
    productTypeLabel: "",
    applicationLabels: [],
    typicalApplications: [],
    keyFeatures: [],
    reasons: [],
    colors: [],
    specifications: [],
    accessories: [],
  };

  for (let index = 0; index < 2; index += 1) {
    const { data: id, error } = await supabase.rpc("save_product_english", { p_payload: payload });
    if (error || !id) throw new Error(error?.message || "Test product could not be saved.");
    createdIds.push(id);
  }

  const { data: rows, error: rowsError } = await supabase
    .from("products")
    .select("id, slug")
    .in("id", createdIds)
    .order("slug", { ascending: true });
  if (rowsError) throw rowsError;
  const slugs = (rows ?? []).map((row) => row.slug);
  if (slugs.length !== 2 || slugs[0] !== baseSlug || slugs[1] !== `${baseSlug}-2`) {
    throw new Error(`Expected unique slugs ${baseSlug} and ${baseSlug}-2; received ${slugs.join(", ")}.`);
  }

  console.log("Product slug E2E passed:", slugs);
} finally {
  if (createdIds.length) await supabase.from("products").delete().in("id", createdIds);
  await supabase.auth.signOut();
}
