"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Check, CircleCheck, ExternalLink, Eye, EyeOff, Factory, ImagePlus, Languages, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { invokeCatalogueTranslation } from "@/lib/catalogue/translation-client";
import { ensureCatalogueAdminSession } from "@/lib/catalogue/admin-session";
import type { Partner } from "@/lib/partners/types";

type UploadAsset = { name: string; url?: string; file?: File };
type PartnerDraft = { id?: string; title: string; description: string; image: UploadAsset[]; isPublished: boolean };
type PartnerManagerProps = {
  partners: Partner[];
  onPartnersChange: (partners: Partner[]) => void;
  databaseError?: string;
};

function createDraft(partner?: Partner): PartnerDraft {
  const english = partner?.translations.en;
  return {
    id: partner?.id,
    title: english?.title ?? "",
    description: english?.description ?? "",
    image: partner?.imageUrl ? [{ name: partner.imageUrl.split("/").at(-1) ?? "partner image", url: partner.imageUrl }] : [],
    isPublished: partner?.isPublished ?? false,
  };
}

async function uploadImage(image: UploadAsset[], partnerId: string) {
  const asset = image[0];
  if (!asset) return "";
  if (asset.url) return asset.url;
  if (!asset.file) return "";
  const safeName = asset.file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const path = `partners/${partnerId}/${crypto.randomUUID()}-${safeName}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("catalogue-media").upload(path, asset.file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return supabase.storage.from("catalogue-media").getPublicUrl(path).data.publicUrl;
}

function PartnerEditor({ partner, onCancel, onSaved }: { partner?: Partner; onCancel: () => void; onSaved: (partner: Partner) => void }) {
  const [draft, setDraft] = useState(() => createDraft(partner));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canSave = Boolean(draft.title.trim() && draft.description.trim());

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    try {
      await ensureCatalogueAdminSession();
      const uploadId = draft.id || crypto.randomUUID();
      const imageUrl = await uploadImage(draft.image, uploadId);
      const data = await invokeCatalogueTranslation({
          action: "save",
          entityType: "partner",
          data: {
            id: draft.id ?? null,
            imageUrl,
            isPublished: draft.isPublished,
            title: draft.title.trim(),
            description: draft.description.trim(),
          },
      });
      const now = new Date().toISOString();
      onSaved({
        id: data.entityId,
        code: partner?.code ?? draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        imageUrl,
        isPublished: draft.isPublished,
        sortOrder: partner?.sortOrder ?? 0,
        translationStatus: data.translationStatus,
        translationError: data.translationError ?? "",
        translatedAt: data.translationStatus === "ready" ? now : partner?.translatedAt ?? "",
        translationSourceUpdatedAt: now,
        updatedAt: now,
        translations: {
          ...partner?.translations,
          en: { locale: "en", title: draft.title.trim(), description: draft.description.trim() },
        },
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The partner could not be saved.");
      setSaving(false);
    }
  };

  return <div className="admin-project-editor admin-partner-editor">
    <header>
      <button type="button" onClick={onCancel}><ArrowLeft aria-hidden="true" />Back to partners</button>
      <div><p>{partner ? "Edit partner" : "New partner"}</p><h1>{draft.title || "Untitled partner"}</h1><span>Write in English. Gemini creates the Finnish description automatically.</span></div>
      <button className="primary" type="button" disabled={!canSave || saving} onClick={save}><Check aria-hidden="true" />{saving ? "Saving & translating…" : "Save partner"}</button>
    </header>
    {error ? <div className="admin-project-error"><AlertTriangle aria-hidden="true" />{error}</div> : null}
    <section className="admin-form-card admin-partner-form-card">
      <div className="admin-form-heading"><span><Factory aria-hidden="true" /></span><div><p>Partner profile</p><h2>Company information</h2><small>The title and description are required. The logo or image is optional.</small></div></div>
      <div className="admin-project-language-note"><Languages aria-hidden="true" /><span><strong>English source content</strong><small>Finnish will be generated securely after saving.</small></span></div>
      <label className="admin-partner-visibility-toggle"><input type="checkbox" checked={draft.isPublished} onChange={(event) => setDraft((current) => ({ ...current, isPublished: event.target.checked }))} /><span><strong>Show partner on the public website</strong><small>Turn this off while discussions or agreements are still pending.</small></span></label>
      <label className="admin-field"><span>Partner title *</span><input value={draft.title} placeholder="e.g. GREINER" onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
      <label className="admin-field"><span>Partner description *</span><textarea rows={7} value={draft.description} placeholder="Introduce the company, its history and specialist expertise." onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
      <div className="admin-field-section">
        <div className="admin-section-label"><h3>Logo or company image</h3><p>Optional. Add a clear logo or representative image; it can also be added later.</p></div>
        <div className="admin-partner-upload">
          <label><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; setDraft((current) => ({ ...current, image: file ? [{ name: file.name, file }] : [] })); }} /><ImagePlus aria-hidden="true" /><span><strong>Choose image</strong><small>JPG, PNG, WebP, AVIF or SVG</small></span></label>
          {draft.image[0] ? <div><CircleCheck aria-hidden="true" /><span>{draft.image[0].name}</span><button type="button" aria-label="Remove partner image" onClick={() => setDraft((current) => ({ ...current, image: [] }))}><X aria-hidden="true" /></button></div> : null}
        </div>
      </div>
    </section>
  </div>;
}

export default function PartnerManager({ partners, onPartnersChange, databaseError }: PartnerManagerProps) {
  const [editing, setEditing] = useState<Partner | null | undefined>(undefined);
  const [retrying, setRetrying] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  if (editing !== undefined) return <PartnerEditor partner={editing ?? undefined} onCancel={() => setEditing(undefined)} onSaved={(saved) => {
    onPartnersChange(partners.some((item) => item.id === saved.id) ? partners.map((item) => item.id === saved.id ? saved : item) : [...partners, saved]);
    setEditing(undefined);
    setMessage(saved.translationStatus === "ready" ? "Partner saved with Finnish translation" : `English saved. Finnish translation failed: ${saved.translationError}`);
  }} />;

  const retry = async (partner: Partner) => {
    if (retrying.includes(partner.id)) return;
    setRetrying((current) => [...current, partner.id]);
    try {
      const data = await invokeCatalogueTranslation({ action: "retry", entityType: "partner", entityId: partner.id });
      onPartnersChange(partners.map((item) => item.id === partner.id ? { ...item, translationStatus: data.translationStatus, translationError: data.translationError ?? "" } : item));
    } catch (reason) {
      const translationError = reason instanceof Error ? reason.message : "Translation retry failed";
      onPartnersChange(partners.map((item) => item.id === partner.id ? { ...item, translationStatus: "failed", translationError } : item));
    }
    setRetrying((current) => current.filter((id) => id !== partner.id));
  };

  const remove = async (partner: Partner) => {
    if (!window.confirm(`Delete ${partner.translations.en?.title || "this partner"}? This cannot be undone.`)) return;
    const { error } = await createClient().from("partners").delete().eq("id", partner.id);
    if (error) { setMessage(error.message); return; }
    onPartnersChange(partners.filter((item) => item.id !== partner.id));
    setMessage("Partner deleted from Supabase");
  };

  const toggleVisibility = async (partner: Partner) => {
    const nextVisibility = !partner.isPublished;
    const { error } = await createClient().from("partners").update({ is_published: nextVisibility }).eq("id", partner.id);
    if (error) { setMessage(error.message); return; }
    onPartnersChange(partners.map((item) => item.id === partner.id ? { ...item, isPublished: nextVisibility } : item));
    setMessage(`${partner.translations.en?.title || "Partner"} is now ${nextVisibility ? "visible" : "hidden"} on the public website`);
  };

  return <div className="admin-page-content admin-partner-management">
    {databaseError ? <div className="admin-database-notice"><AlertTriangle aria-hidden="true" /><div><strong>Partner database setup required</strong><p>{databaseError}</p></div></div> : null}
    {message ? <div className="admin-project-message"><CircleCheck aria-hidden="true" />{message}<button type="button" onClick={() => setMessage("")}><X aria-hidden="true" /></button></div> : null}
    <section className="admin-management-card">
      <div className="admin-management-heading"><div><h2>Manufacturing partners</h2><p>{partners.filter((partner) => partner.isPublished).length} visible · {partners.filter((partner) => !partner.isPublished).length} hidden</p></div><button className="admin-inline-add-product" type="button" onClick={() => setEditing(null)}><Plus aria-hidden="true" />Add new partner</button></div>
      {partners.length ? <div className="admin-partner-grid">{partners.map((partner) => {
        const english = partner.translations.en;
        return <article className={partner.isPublished ? "" : "is-hidden"} key={partner.id}>
          <div className="admin-partner-image">{partner.imageUrl ? <Image src={partner.imageUrl} alt="" fill sizes="180px" unoptimized /> : <Factory aria-hidden="true" />}</div>
          <div className="admin-partner-copy"><div className={`admin-partner-visibility ${partner.isPublished ? "published" : "hidden"}`}>{partner.isPublished ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}{partner.isPublished ? "Visible" : "Hidden"}</div><h3>{english?.title || partner.code}</h3><p>{english?.description}</p><div className={`admin-reference-translation ${partner.translationStatus}`}>{partner.translationStatus === "ready" ? <CircleCheck aria-hidden="true" /> : <Languages aria-hidden="true" />}Finnish: {partner.translationStatus}{partner.translationStatus === "failed" ? <button type="button" disabled={retrying.includes(partner.id)} onClick={() => retry(partner)}><RefreshCw aria-hidden="true" />{retrying.includes(partner.id) ? "Retrying…" : "Retry"}</button> : null}</div></div>
          <footer><button type="button" onClick={() => setEditing(partner)}><Pencil aria-hidden="true" />Edit</button><button type="button" onClick={() => toggleVisibility(partner)}>{partner.isPublished ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}{partner.isPublished ? "Hide" : "Show"}</button>{partner.isPublished ? <Link href="/partners" target="_blank"><ExternalLink aria-hidden="true" />View</Link> : null}<button className="danger" type="button" onClick={() => remove(partner)}><Trash2 aria-hidden="true" />Delete</button></footer>
        </article>;
      })}</div> : <div className="admin-empty-state"><Factory aria-hidden="true" /><h3>No partners yet</h3><p>Add the first manufacturing partner and its company introduction.</p><button type="button" onClick={() => setEditing(null)}>Add a partner</button></div>}
    </section>
  </div>;
}
