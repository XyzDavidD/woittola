import type { CatalogueLocale, CatalogueStatus, TranslationStatus } from "@/lib/catalogue/types";

export type ProjectBlockType = "text" | "image-text";

export type ProjectContentBlock = {
  id: string;
  type: ProjectBlockType;
  heading: string;
  body: string;
  imageUrls: string[];
  imageAlt: string;
  caption: string;
  imagePosition: "left" | "right";
};

export type ReferenceProjectTranslation = {
  locale: CatalogueLocale;
  title: string;
  summary: string;
  projectTypeLabel: string;
  location: string;
  unit: string;
  metaTitle: string;
  metaDescription: string;
  contentBlocks: ProjectContentBlock[];
};

export type ReferenceProject = {
  id: string;
  slug: string;
  projectType: string;
  completedYear: number | null;
  status: CatalogueStatus;
  sortOrder: number;
  coverImageUrl: string;
  galleryUrls: string[];
  translationStatus: TranslationStatus;
  translationError: string;
  translatedAt: string;
  translationSourceUpdatedAt: string;
  updatedAt: string;
  translations: Partial<Record<CatalogueLocale, ReferenceProjectTranslation>>;
};

export type PublicReferenceProject = ReferenceProject & {
  translation: ReferenceProjectTranslation;
};

export type AdminReferenceData = {
  projects: ReferenceProject[];
  error?: string;
};
