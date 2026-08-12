import type { SupabaseClient } from "@supabase/supabase-js";
import type { TranslationStatus } from "@/lib/catalogue/types";
import { createClient } from "@/lib/supabase/client";

export type TranslationEntityType = "category" | "product" | "referenceProject" | "partner";

export type CatalogueTranslationResult = {
  entityId: string;
  translationStatus: TranslationStatus;
  translationError: string | null;
  slug?: string;
};

type TranslationRequest = {
  action: "save" | "retry";
  entityType: TranslationEntityType;
  entityId?: string;
  data?: Record<string, unknown>;
};

type TranslationState = {
  id: string;
  translation_status: TranslationStatus;
  translation_error: string | null;
  translated_at: string | null;
  slug?: string;
};

const entityTables: Record<TranslationEntityType, string> = {
  category: "categories",
  product: "products",
  referenceProject: "reference_projects",
  partner: "partners",
};

const pause = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function resultFromResponse(value: unknown): CatalogueTranslationResult {
  if (!value || typeof value !== "object") throw new Error("The translation function returned an invalid response.");
  const response = value as Record<string, unknown>;
  if (typeof response.error === "string") throw new Error(response.error);
  if (typeof response.entityId !== "string") throw new Error("The translation function did not return the saved item id.");
  if (response.translationStatus !== "processing" && response.translationStatus !== "ready" && response.translationStatus !== "failed") {
    throw new Error("The translation function returned an invalid status.");
  }
  return {
    entityId: response.entityId,
    translationStatus: response.translationStatus,
    translationError: typeof response.translationError === "string" ? response.translationError : null,
    ...(typeof response.slug === "string" ? { slug: response.slug } : {}),
  };
}

async function readState(supabase: SupabaseClient, entityType: TranslationEntityType, entityId: string) {
  const select = entityType === "referenceProject"
    ? "id, translation_status, translation_error, translated_at, slug"
    : "id, translation_status, translation_error, translated_at";
  const { data, error } = await supabase
    .from(entityTables[entityType])
    .select(select)
    .eq("id", entityId)
    .maybeSingle();
  if (error) throw error;
  return data as TranslationState | null;
}

async function recoverSavedEntityId(
  supabase: SupabaseClient,
  request: TranslationRequest,
): Promise<string> {
  if (request.entityId) return request.entityId;
  if (typeof request.data?.id === "string" && request.data.id) return request.data.id;

  if (request.entityType === "product" && typeof request.data?.slug === "string" && request.data.slug) {
    const { data } = await supabase.from("products").select("id").eq("slug", request.data.slug).maybeSingle();
    if (data?.id) return data.id;
  }

  const title = request.entityType === "referenceProject"
    ? request.data?.title
    : request.entityType === "partner"
      ? request.data?.title
      : null;
  if (typeof title === "string" && title) {
    const table = request.entityType === "referenceProject"
      ? "reference_project_translations"
      : "partner_translations";
    const idColumn = request.entityType === "referenceProject" ? "project_id" : "partner_id";
    const { data } = await supabase
      .from(table)
      .select(idColumn)
      .eq("locale", "en")
      .eq("title", title)
      .limit(1)
      .maybeSingle();
    const recoveredId = (data as Record<string, unknown> | null)?.[idColumn];
    if (typeof recoveredId === "string") return recoveredId;
  }

  return "";
}

async function waitForCompletedTranslation(
  supabase: SupabaseClient,
  entityType: TranslationEntityType,
  entityId: string,
  previous: TranslationState | null,
) {
  let observedProcessing = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const state = await readState(supabase, entityType, entityId);
    if (state?.translation_status === "processing") observedProcessing = true;
    const translatedAgain = state?.translated_at && state.translated_at !== previous?.translated_at;
    const changedFailure = state?.translation_error !== previous?.translation_error;
    if (state?.translation_status === "ready" && (!previous || previous.translation_status !== "ready" || translatedAgain || observedProcessing)) {
      return {
        entityId,
        translationStatus: "ready" as const,
        translationError: null,
        ...(state.slug ? { slug: state.slug } : {}),
      };
    }
    if (state?.translation_status === "failed" && (!previous || previous.translation_status !== "failed" || changedFailure || observedProcessing)) {
      return {
        entityId,
        translationStatus: "failed" as const,
        translationError: state.translation_error,
        ...(state.slug ? { slug: state.slug } : {}),
      };
    }
    await pause(1500);
  }
  throw new Error("The English content was saved, but the Finnish translation is still processing. Refresh the dashboard shortly to see its status.");
}

/**
 * Invokes the authenticated translation function and recovers from a browser or
 * gateway timeout by reading the authoritative translation status from Supabase.
 */
export async function invokeCatalogueTranslation(request: TranslationRequest) {
  const supabase = createClient();
  const knownId = request.entityId || (typeof request.data?.id === "string" ? request.data.id : "");
  const previous = knownId ? await readState(supabase, request.entityType, knownId).catch(() => null) : null;
  const { data, error } = await supabase.functions.invoke("catalogue-translate", { body: request });
  if (!error) return resultFromResponse(data);

  // The Edge Function may have completed after the HTTP client timed out. The
  // database is the source of truth, so recover the saved id and poll its status.
  const entityId = await recoverSavedEntityId(supabase, request);
  if (!entityId) throw new Error(error.message || "The translation function could not be reached.");
  return waitForCompletedTranslation(supabase, request.entityType, entityId, previous);
}
