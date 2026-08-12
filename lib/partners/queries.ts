import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import type { CatalogueLocale, TranslationStatus } from "@/lib/catalogue/types";
import { partnerPlaceholders } from "./placeholders";
import type { AdminPartnerData, Partner, PartnerTranslation, PublicPartner } from "./types";

type PartnerTranslationRow = {
  locale: CatalogueLocale;
  title: string;
  description: string;
};

type PartnerRow = {
  id: string;
  code: string;
  image_url: string;
  is_published: boolean;
  sort_order: number;
  translation_status: TranslationStatus;
  translation_error?: string | null;
  translated_at?: string | null;
  translation_source_updated_at?: string | null;
  updated_at: string;
  partner_translations?: PartnerTranslationRow[];
};

const partnerSelect = `
  id, code, image_url, is_published, sort_order, translation_status, translation_error,
  translated_at, translation_source_updated_at, updated_at,
  partner_translations (locale, title, description)
`;

function mapTranslation(row: PartnerTranslationRow): PartnerTranslation {
  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
  };
}

function mapPartner(row: PartnerRow): Partner {
  return {
    id: row.id,
    code: row.code,
    imageUrl: row.image_url ?? "",
    isPublished: row.is_published ?? true,
    sortOrder: row.sort_order,
    translationStatus: row.translation_status ?? "ready",
    translationError: row.translation_error ?? "",
    translatedAt: row.translated_at ?? "",
    translationSourceUpdatedAt: row.translation_source_updated_at ?? "",
    updatedAt: row.updated_at,
    translations: Object.fromEntries(
      (row.partner_translations ?? []).map((translation) => [translation.locale, mapTranslation(translation)]),
    ),
  };
}

function localizedPartner(partner: Partner, locale: CatalogueLocale) {
  if (locale === "fi" && partner.translationStatus !== "ready") return partner.translations.en;
  return partner.translations[locale] ?? partner.translations.en;
}

function localPartners(locale: CatalogueLocale): PublicPartner[] {
  return partnerPlaceholders.filter((partner) => partner.isPublished).flatMap((partner) => {
    const translation = localizedPartner(partner, locale);
    return translation ? [{ ...partner, translation }] : [];
  });
}

export async function getPublicPartners(locale: CatalogueLocale): Promise<PublicPartner[]> {
  const { data, error } = await createPublicClient()
    .from("partners")
    .select(partnerSelect)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) return localPartners(locale);
  return (data as unknown as PartnerRow[]).flatMap((row) => {
    const partner = mapPartner(row);
    const translation = localizedPartner(partner, locale);
    return translation ? [{ ...partner, translation }] : [];
  });
}

export async function getAdminPartnerData(client: SupabaseClient): Promise<AdminPartnerData> {
  const { data, error } = await client
    .from("partners")
    .select(partnerSelect)
    .order("sort_order", { ascending: true });
  if (error) return { partners: [], error: error.message };
  return { partners: (data as unknown as PartnerRow[]).map(mapPartner) };
}
