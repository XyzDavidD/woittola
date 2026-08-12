import type { CatalogueLocale, TranslationStatus } from "@/lib/catalogue/types";

export type PartnerTranslation = {
  locale: CatalogueLocale;
  title: string;
  description: string;
};

export type Partner = {
  id: string;
  code: string;
  imageUrl: string;
  isPublished: boolean;
  sortOrder: number;
  translationStatus: TranslationStatus;
  translationError: string;
  translatedAt: string;
  translationSourceUpdatedAt: string;
  updatedAt: string;
  translations: Partial<Record<CatalogueLocale, PartnerTranslation>>;
};

export type PublicPartner = Partner & {
  translation: PartnerTranslation;
};

export type AdminPartnerData = {
  partners: Partner[];
  error?: string;
};
