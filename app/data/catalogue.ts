export type ProductCategoryNavigation = {
  name: string;
  slug: keyof typeof import("../locales/en").en.categoryNames;
};

// The eight catalogue sections are intentionally fixed in navigation.
// Editable content and products for each section live in Supabase.
export const productCategories: readonly ProductCategoryNavigation[] = [
  { name: "Patient Chairs", slug: "patient-chairs" },
  { name: "Treatment Chairs", slug: "treatment-chairs" },
  { name: "Gynecology", slug: "gynecology" },
  { name: "Patient Stretchers", slug: "patient-stretchers" },
  { name: "Medical Carts", slug: "medical-carts" },
  { name: "Medical Tables", slug: "medical-tables" },
  { name: "Work Chairs", slug: "work-stools" },
  { name: "Face Protection", slug: "face-protection" },
] as const;
