import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import type { CatalogueLocale, TranslationStatus } from "@/lib/catalogue/types";
import { referencePlaceholders } from "./placeholders";
import type { AdminReferenceData, ProjectContentBlock, PublicReferenceProject, ReferenceProject, ReferenceProjectTranslation } from "./types";

type ProjectTranslationRow = {
  locale: CatalogueLocale;
  title: string;
  summary: string;
  project_type_label: string;
  location: string;
  unit: string;
  meta_title: string;
  meta_description: string;
  content_blocks: ProjectContentBlock[];
};

type ProjectRow = {
  id: string;
  slug: string;
  project_type: string;
  completed_year: number | null;
  status: "draft" | "published";
  sort_order: number;
  cover_image_url: string;
  gallery_urls: string[];
  translation_status: TranslationStatus;
  translation_error?: string | null;
  translated_at?: string | null;
  translation_source_updated_at?: string | null;
  updated_at: string;
  reference_project_translations?: ProjectTranslationRow[];
};

const projectSelect = `
  id, slug, project_type, completed_year, status, sort_order,
  cover_image_url, gallery_urls, translation_status, translation_error,
  translated_at, translation_source_updated_at, updated_at,
  reference_project_translations (
    locale, title, summary, project_type_label, location, unit, meta_title, meta_description, content_blocks
  )
`;

function mapTranslation(row: ProjectTranslationRow): ReferenceProjectTranslation {
  return {
    locale: row.locale,
    title: row.title,
    summary: row.summary ?? "",
    projectTypeLabel: row.project_type_label ?? "",
    location: row.location ?? "",
    unit: row.unit ?? "",
    metaTitle: row.meta_title ?? row.title,
    metaDescription: row.meta_description ?? row.summary ?? "",
    contentBlocks: Array.isArray(row.content_blocks)
      ? row.content_blocks.filter((block) => block.type === "text" || block.type === "image-text")
      : [],
  };
}

function mapProject(row: ProjectRow): ReferenceProject {
  const translations = Object.fromEntries(
    (row.reference_project_translations ?? []).map((translation) => [translation.locale, mapTranslation(translation)]),
  );
  return {
    id: row.id,
    slug: row.slug,
    projectType: row.project_type,
    completedYear: row.completed_year,
    status: row.status,
    sortOrder: row.sort_order,
    coverImageUrl: row.cover_image_url ?? "",
    galleryUrls: row.gallery_urls ?? [],
    translationStatus: row.translation_status ?? "ready",
    translationError: row.translation_error ?? "",
    translatedAt: row.translated_at ?? "",
    translationSourceUpdatedAt: row.translation_source_updated_at ?? "",
    updatedAt: row.updated_at,
    translations,
  };
}

function localizedProject(project: ReferenceProject, locale: CatalogueLocale) {
  if (locale === "fi" && project.translationStatus !== "ready") return project.translations.en;
  return project.translations[locale] ?? project.translations.en;
}

function localProjects(locale: CatalogueLocale): PublicReferenceProject[] {
  return referencePlaceholders.flatMap((project) => {
    const translation = localizedProject(project, locale);
    return translation ? [{ ...project, translation }] : [];
  });
}

export async function getPublicReferenceProjects(locale: CatalogueLocale): Promise<PublicReferenceProject[]> {
  const client = createPublicClient();
  const { data, error } = await client
    .from("reference_projects")
    .select(projectSelect)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return localProjects(locale);
  return (data as unknown as ProjectRow[]).flatMap((row) => {
    const project = mapProject(row);
    const translation = localizedProject(project, locale);
    return translation ? [{ ...project, translation }] : [];
  });
}

export async function getPublicReferenceProject(slug: string, locale: CatalogueLocale): Promise<PublicReferenceProject | null> {
  const projects = await getPublicReferenceProjects(locale);
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getAdminReferenceData(client: SupabaseClient): Promise<AdminReferenceData> {
  const { data, error } = await client
    .from("reference_projects")
    .select(projectSelect)
    .order("sort_order", { ascending: true });
  if (error) return { projects: [], error: error.message };
  return { projects: (data as unknown as ProjectRow[]).map(mapProject) };
}
