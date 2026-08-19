export type CatalogueLocale = "en" | "fi";
export type CatalogueStatus = "draft" | "published";
export type TranslationStatus = "processing" | "ready" | "failed";

export type ColorOption = {
  name: string;
  value: string;
};

export type Specification = {
  label: string;
  value: string;
};

export type CategoryTranslation = {
  locale: CatalogueLocale;
  name: string;
  heroTitle: string;
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
};

export type CatalogueCategory = {
  id: string;
  slug: string;
  heroImageUrl: string;
  homepageImageUrl: string;
  finnishNameOverride: string;
  sortOrder: number;
  isPublished: boolean;
  translationStatus: TranslationStatus;
  translationError: string;
  translatedAt: string;
  translationSourceUpdatedAt: string;
  updatedAt: string;
  translations: Partial<Record<CatalogueLocale, CategoryTranslation>>;
  productCount: number;
};

export type ProductTranslation = {
  locale: CatalogueLocale;
  name: string;
  description: string;
  productTypeLabel: string;
  applicationLabels: string[];
  typicalApplications: string[];
  keyFeatures: string[];
  reasons: string[];
  colors: ColorOption[];
  specifications: Specification[];
  accessories: string[];
};

export type CatalogueProduct = {
  id: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  slug: string;
  brand: string;
  productType: string;
  applications: string[];
  status: CatalogueStatus;
  featured: boolean;
  sortOrder: number;
  primaryImageUrl: string;
  galleryUrls: string[];
  brochureUrl: string;
  technicalSheetUrl: string;
  colorChartUrl: string;
  videoUrl: string;
  translationStatus: TranslationStatus;
  translationError: string;
  translatedAt: string;
  translationSourceUpdatedAt: string;
  updatedAt: string;
  translations: Partial<Record<CatalogueLocale, ProductTranslation>>;
};

export type PublicCategory = CatalogueCategory & {
  translation: CategoryTranslation;
  products: PublicProduct[];
};

export type PublicProduct = CatalogueProduct & {
  translation: ProductTranslation;
};

export type AdminCatalogueData = {
  categories: CatalogueCategory[];
  products: CatalogueProduct[];
  error?: string;
};
