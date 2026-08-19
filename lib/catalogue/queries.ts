import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  AdminCatalogueData,
  CatalogueCategory,
  CatalogueLocale,
  CatalogueProduct,
  CategoryTranslation,
  ColorOption,
  ProductTranslation,
  PublicCategory,
  PublicProduct,
  Specification,
  TranslationStatus,
} from "./types";

type TranslationRow = {
  locale: CatalogueLocale;
  name: string;
  hero_title?: string;
  hero_description?: string;
  meta_title?: string;
  meta_description?: string;
  description?: string;
  product_type_label?: string;
  application_labels?: string[];
  typical_applications?: string[];
  key_features?: string[];
  reasons?: string[];
  colors?: ColorOption[];
  specifications?: Specification[];
  accessories?: string[];
};

type CategoryRow = {
  id: string;
  slug: string;
  hero_image_url: string;
  homepage_image_url?: string | null;
  finnish_name_override?: string | null;
  sort_order: number;
  is_published: boolean;
  translation_status: TranslationStatus;
  translation_error?: string | null;
  translated_at?: string | null;
  translation_source_updated_at?: string | null;
  updated_at: string;
  category_translations?: TranslationRow[];
  products?: ProductRow[];
};

type ProductRow = {
  id: string;
  category_id: string;
  slug: string;
  brand: string;
  product_type: string;
  applications: string[];
  status: "draft" | "published";
  featured: boolean;
  sort_order: number;
  primary_image_url: string | null;
  gallery_urls: string[];
  brochure_url: string | null;
  technical_sheet_url: string | null;
  color_chart_url: string | null;
  video_url: string | null;
  translation_status: TranslationStatus;
  translation_error?: string | null;
  translated_at?: string | null;
  translation_source_updated_at?: string | null;
  updated_at: string;
  product_translations?: TranslationRow[];
};

const adminCategorySelect = `
  id,
  slug,
  hero_image_url,
  homepage_image_url,
  finnish_name_override,
  sort_order,
  is_published,
  translation_status,
  translation_error,
  translated_at,
  translation_source_updated_at,
  updated_at,
  category_translations (
    locale,
    name,
    hero_title,
    hero_description,
    meta_title,
    meta_description
  ),
  products (
    id,
    category_id,
    slug,
    brand,
    product_type,
    applications,
    status,
    featured,
    sort_order,
    primary_image_url,
    gallery_urls,
    brochure_url,
    technical_sheet_url,
    color_chart_url,
    video_url,
    translation_status,
    translation_error,
    translated_at,
    translation_source_updated_at,
    updated_at,
    product_translations (
      locale,
      name,
      description,
      product_type_label,
      application_labels,
      typical_applications,
      key_features,
      reasons,
      colors,
      specifications,
      accessories
    )
  )
`;

const publicCategorySelect = `
  id,
  slug,
  hero_image_url,
  homepage_image_url,
  finnish_name_override,
  sort_order,
  is_published,
  translation_status,
  updated_at,
  category_translations (
    locale,
    name,
    hero_title,
    hero_description,
    meta_title,
    meta_description
  ),
  products (
    id,
    category_id,
    slug,
    brand,
    product_type,
    applications,
    status,
    featured,
    sort_order,
    primary_image_url,
    gallery_urls,
    brochure_url,
    technical_sheet_url,
    color_chart_url,
    video_url,
    translation_status,
    updated_at,
    product_translations (
      locale,
      name,
      description,
      product_type_label,
      application_labels,
      typical_applications,
      key_features,
      reasons,
      colors,
      specifications,
      accessories
    )
  )
`;

function mapCategoryTranslation(row: TranslationRow): CategoryTranslation {
  return {
    locale: row.locale,
    name: row.name,
    heroTitle: row.hero_title ?? row.name,
    heroDescription: row.hero_description ?? "",
    metaTitle: row.meta_title ?? row.name,
    metaDescription: row.meta_description ?? row.hero_description ?? "",
  };
}

function mapProductTranslation(row: TranslationRow): ProductTranslation {
  return {
    locale: row.locale,
    name: row.name,
    description: row.description ?? "",
    productTypeLabel: row.product_type_label ?? "",
    applicationLabels: row.application_labels ?? [],
    typicalApplications: row.typical_applications ?? [],
    keyFeatures: row.key_features ?? [],
    reasons: row.reasons ?? [],
    colors: row.colors ?? [],
    specifications: row.specifications ?? [],
    accessories: row.accessories ?? [],
  };
}

function translationRecord<Translation extends { locale: CatalogueLocale }>(rows: Translation[]) {
  return Object.fromEntries(rows.map((row) => [row.locale, row])) as Partial<Record<CatalogueLocale, Translation>>;
}

function mapCategory(row: CategoryRow): CatalogueCategory {
  return {
    id: row.id,
    slug: row.slug,
    heroImageUrl: row.hero_image_url,
    homepageImageUrl: row.homepage_image_url ?? "",
    finnishNameOverride: row.finnish_name_override ?? "",
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    translationStatus: row.translation_status ?? "ready",
    translationError: row.translation_error ?? "",
    translatedAt: row.translated_at ?? "",
    translationSourceUpdatedAt: row.translation_source_updated_at ?? "",
    updatedAt: row.updated_at,
    translations: translationRecord((row.category_translations ?? []).map(mapCategoryTranslation)),
    productCount: row.products?.length ?? 0,
  };
}

function mapProduct(row: ProductRow, category: CatalogueCategory): CatalogueProduct {
  return {
    id: row.id,
    categoryId: row.category_id,
    categorySlug: category.slug,
    categoryName: category.translations.en?.name ?? category.slug,
    slug: row.slug,
    brand: row.brand,
    productType: row.product_type,
    applications: row.applications ?? [],
    status: row.status,
    featured: row.featured,
    sortOrder: row.sort_order,
    primaryImageUrl: row.primary_image_url ?? "",
    galleryUrls: row.gallery_urls ?? [],
    brochureUrl: row.brochure_url ?? "",
    technicalSheetUrl: row.technical_sheet_url ?? "",
    colorChartUrl: row.color_chart_url ?? "",
    videoUrl: row.video_url ?? "",
    translationStatus: row.translation_status ?? "ready",
    translationError: row.translation_error ?? "",
    translatedAt: row.translated_at ?? "",
    translationSourceUpdatedAt: row.translation_source_updated_at ?? "",
    updatedAt: row.updated_at,
    translations: translationRecord((row.product_translations ?? []).map(mapProductTranslation)),
  };
}

function localizedCategory(category: CatalogueCategory, locale: CatalogueLocale) {
  if (locale === "fi" && category.translationStatus !== "ready") return category.translations.en;
  return category.translations[locale] ?? category.translations.en;
}

function localizedProduct(product: CatalogueProduct, locale: CatalogueLocale) {
  if (locale === "fi" && product.translationStatus !== "ready") return product.translations.en;
  return product.translations[locale] ?? product.translations.en;
}

export async function getAdminCatalogueData(client: SupabaseClient): Promise<AdminCatalogueData> {
  const { data, error } = await client
    .from("categories")
    .select(adminCategorySelect)
    .order("sort_order", { ascending: true })
    .order("sort_order", { ascending: true, referencedTable: "products" });

  if (error) {
    return { categories: [], products: [], error: error.message };
  }

  const rows = (data ?? []) as unknown as CategoryRow[];
  const categories = rows.map(mapCategory);
  const products = rows.flatMap((row, index) =>
    (row.products ?? []).map((product) => mapProduct(product, categories[index])),
  );

  return { categories, products };
}

export async function getPublicCategories(locale: CatalogueLocale = "en"): Promise<PublicCategory[]> {
  const client = createPublicClient();
  const { data, error } = await client
    .from("categories")
    .select(publicCategorySelect)
    .eq("is_published", true)
    .eq("products.status", "published")
    .order("sort_order", { ascending: true })
    .order("sort_order", { ascending: true, referencedTable: "products" });

  if (error) return [];

  const rows = (data ?? []) as unknown as CategoryRow[];
  return rows.flatMap((row) => {
    const category = mapCategory(row);
    const translation = localizedCategory(category, locale);
    if (!translation) return [];

    const products = (row.products ?? []).flatMap((productRow) => {
      const product = mapProduct(productRow, category);
      const productTranslation = localizedProduct(product, locale);
      return productTranslation ? [{ ...product, categoryName: translation.name, translation: productTranslation }] : [];
    });

    return [{ ...category, translation, products }];
  });
}

export async function getPublicCategory(slug: string, locale: CatalogueLocale = "en"): Promise<PublicCategory | null> {
  const categories = await getPublicCategories(locale);
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getPublicProduct(slug: string, locale: CatalogueLocale = "en"): Promise<PublicProduct | null> {
  const categories = await getPublicCategories(locale);
  for (const category of categories) {
    const product = category.products.find((item) => item.slug === slug);
    if (product) return product;
  }
  return null;
}
