"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Check, CircleCheck, ExternalLink, FileImage, GripVertical, ImagePlus, Languages, LayoutTemplate, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { invokeCatalogueTranslation } from "@/lib/catalogue/translation-client";
import { ensureCatalogueAdminSession } from "@/lib/catalogue/admin-session";
import type { ProjectBlockType, ProjectContentBlock, ReferenceProject } from "@/lib/references/types";

type UploadAsset = { name: string; url?: string; file?: File };
type ProjectBlockDraft = Omit<ProjectContentBlock, "imageUrls"> & { images: UploadAsset[] };
type ProjectDraft = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  projectType: string;
  completedYear: string;
  location: string;
  unit: string;
  status: "draft" | "published";
  cover: UploadAsset[];
  blocks: ProjectBlockDraft[];
};

type ProjectManagerProps = { initialProjects: ReferenceProject[]; databaseError?: string };

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const blockId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function createBlock(type: ProjectBlockType): ProjectBlockDraft {
  return { id: blockId(), type, heading: "", body: "", images: [], imageAlt: "", caption: "", imagePosition: "right" };
}

function createDraft(project?: ReferenceProject): ProjectDraft {
  const translation = project?.translations.en;
  return {
    id: project?.id,
    title: translation?.title ?? "",
    slug: project?.slug ?? "",
    summary: translation?.summary ?? "",
    projectType: translation?.projectTypeLabel ?? project?.projectType ?? "",
    completedYear: project?.completedYear?.toString() ?? "",
    location: translation?.location ?? "",
    unit: translation?.unit ?? "",
    status: project?.status ?? "draft",
    cover: project?.coverImageUrl ? [{ name: project.coverImageUrl.split("/").at(-1) ?? "cover image", url: project.coverImageUrl }] : [],
    blocks: translation?.contentBlocks.map((block) => ({ ...block, images: block.imageUrls.map((url) => ({ name: url.split("/").at(-1) ?? "project image", url })) })) ?? [createBlock("text")],
  };
}

async function uploadAssets(assets: UploadAsset[], folder: string) {
  const supabase = createClient();
  const urls: string[] = [];
  for (const asset of assets) {
    if (asset.url) { urls.push(asset.url); continue; }
    if (!asset.file) continue;
    const safeName = asset.file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
    const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("catalogue-media").upload(path, asset.file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    urls.push(supabase.storage.from("catalogue-media").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

function FilePicker({ files, multiple, onChange }: { files: UploadAsset[]; multiple?: boolean; onChange: (files: UploadAsset[]) => void }) {
  return <div className="admin-project-upload">
    <label><input type="file" accept="image/*" multiple={multiple} onChange={(event) => { const selected = Array.from(event.target.files ?? []).map((file) => ({ name: file.name, file })); onChange(multiple ? [...files, ...selected] : selected.slice(0, 1)); }} /><ImagePlus aria-hidden="true" /><span><strong>Choose image{multiple ? "s" : ""}</strong><small>JPG, PNG, WebP or AVIF</small></span></label>
    {files.map((file) => <span key={`${file.name}-${file.url ?? "new"}`}><CircleCheck aria-hidden="true" />{file.name}<button type="button" aria-label={`Remove ${file.name}`} onClick={() => onChange(files.filter((item) => item !== file))}><X aria-hidden="true" /></button></span>)}
  </div>;
}

function ProjectEditor({ project, onCancel, onSaved }: { project?: ReferenceProject; onCancel: () => void; onSaved: (project: ReferenceProject) => void }) {
  const [draft, setDraft] = useState(() => createDraft(project));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateBlock = (index: number, value: ProjectBlockDraft) => update("blocks", draft.blocks.map((block, blockIndex) => blockIndex === index ? value : block));
  const canSave = Boolean(draft.title.trim() && draft.summary.trim() && draft.cover.length);

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true); setError("");
    try {
      await ensureCatalogueAdminSession();
      const uploadSlug = draft.slug || slugify(draft.title) || "reference-project";
      const coverUrls = await uploadAssets(draft.cover, `references/${uploadSlug}/cover`);
      const contentBlocks: ProjectContentBlock[] = [];
      for (const block of draft.blocks) {
        const imageUrls = await uploadAssets(block.images.slice(0, 1), `references/${uploadSlug}/blocks/${block.id}`);
        contentBlocks.push({ id: block.id, type: block.type, heading: block.heading.trim(), body: block.body.trim(), imageUrls, imageAlt: block.imageAlt.trim() || block.heading.trim() || draft.title.trim(), caption: "", imagePosition: block.imagePosition });
      }
      const data = await invokeCatalogueTranslation({ action: "save", entityType: "referenceProject", data: { id: draft.id ?? null, slug: draft.id ? draft.slug : "", projectType: draft.projectType.trim(), completedYear: draft.completedYear, status: draft.status, coverImageUrl: coverUrls[0], galleryUrls: [], title: draft.title.trim(), summary: draft.summary.trim(), location: draft.location.trim(), unit: draft.unit.trim(), metaTitle: `${draft.title.trim()} | Woittola References`, metaDescription: draft.summary.trim(), contentBlocks } });
      const now = new Date().toISOString();
      const savedSlug = data.slug || draft.slug || uploadSlug;
      onSaved({ id: data.entityId, slug: savedSlug, projectType: draft.projectType.trim(), completedYear: draft.completedYear ? Number(draft.completedYear) : null, status: draft.status, sortOrder: project?.sortOrder ?? 0, coverImageUrl: coverUrls[0], galleryUrls: [], translationStatus: data.translationStatus, translationError: data.translationError ?? "", translatedAt: data.translationStatus === "ready" ? now : project?.translatedAt ?? "", translationSourceUpdatedAt: now, updatedAt: now, translations: { ...project?.translations, en: { locale: "en", title: draft.title.trim(), summary: draft.summary.trim(), projectTypeLabel: draft.projectType.trim(), location: draft.location.trim(), unit: draft.unit.trim(), metaTitle: `${draft.title.trim()} | Woittola References`, metaDescription: draft.summary.trim(), contentBlocks } } });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The project could not be saved.");
      setSaving(false);
    }
  };

  return <div className="admin-project-editor">
    <header><button type="button" onClick={onCancel}><ArrowLeft aria-hidden="true" />Back to projects</button><div><p>{project ? "Edit reference" : "New reference"}</p><h1>{draft.title || "Untitled project"}</h1><span>Write in English. Gemini creates the Finnish version automatically.</span></div><button className="primary" type="button" disabled={!canSave || saving} onClick={save}><Check aria-hidden="true" />{saving ? "Saving & translating…" : "Save project"}</button></header>
    {error ? <div className="admin-project-error"><AlertTriangle aria-hidden="true" />{error}</div> : null}
    <div className="admin-project-form-grid">
      <section className="admin-form-card">
        <div className="admin-form-heading"><span><LayoutTemplate aria-hidden="true" /></span><div><p>Project overview</p><h2>Reference information</h2><small>The title, summary and cover image are required.</small></div></div>
        <div className="admin-project-language-note"><Languages aria-hidden="true" /><span><strong>English source content</strong><small>Finnish will be generated securely after saving.</small></span></div>
        <div className="admin-form-grid">
          <label className="admin-field"><span>Project title *</span><input value={draft.title} onChange={(e) => update("title", e.target.value)} /></label>
          <label className="admin-field"><span>Project type</span><input value={draft.projectType} placeholder="e.g. Hospital" onChange={(e) => update("projectType", e.target.value)} /></label>
          <label className="admin-field"><span>Completed year</span><input type="number" min="1900" max="2200" value={draft.completedYear} onChange={(e) => update("completedYear", e.target.value)} /></label>
          <label className="admin-field"><span>Location</span><input value={draft.location} placeholder="e.g. Tampere, Finland" onChange={(e) => update("location", e.target.value)} /></label>
          <label className="admin-field"><span>Facility area</span><input value={draft.unit} placeholder="e.g. Dialysis" onChange={(e) => update("unit", e.target.value)} /></label>
        </div>
        <label className="admin-field admin-full-field"><span>Short summary *</span><textarea rows={5} value={draft.summary} onChange={(e) => update("summary", e.target.value)} /></label>
        <label className="admin-field admin-full-field"><span>Publishing status</span><select value={draft.status} onChange={(e) => update("status", e.target.value as "draft" | "published")}><option value="draft">Draft</option><option value="published">Published</option></select></label>
        <div className="admin-field-section"><div className="admin-section-label"><h3>Cover image *</h3><p>Used in the project card and at the top of the detail page.</p></div><FilePicker files={draft.cover} onChange={(files) => update("cover", files)} /></div>
      </section>

      <section className="admin-form-card admin-project-block-builder">
        <div className="admin-form-heading"><span><FileImage aria-hidden="true" /></span><div><p>Flexible page builder</p><h2>Images and text sections</h2><small>Add, remove and reorder reusable content sections.</small></div></div>
        <div className="admin-project-block-list">
          {draft.blocks.map((block, index) => <article key={block.id}>
            <header><GripVertical aria-hidden="true" /><strong>Section {index + 1}</strong><select value={block.type} onChange={(e) => updateBlock(index, { ...block, type: e.target.value as ProjectBlockType })}><option value="text">Text</option><option value="image-text">Image + text</option></select><button type="button" aria-label={`Remove section ${index + 1}`} onClick={() => update("blocks", draft.blocks.filter((_, blockIndex) => blockIndex !== index))}><Trash2 aria-hidden="true" /></button></header>
            <label className="admin-field"><span>Section heading</span><input value={block.heading} onChange={(e) => updateBlock(index, { ...block, heading: e.target.value })} /></label>
            <label className="admin-field"><span>Section text</span><textarea rows={6} value={block.body} onChange={(e) => updateBlock(index, { ...block, body: e.target.value })} /></label>
            {block.type === "image-text" ? <FilePicker files={block.images} onChange={(files) => updateBlock(index, { ...block, images: files.slice(0, 1) })} /> : null}
            {block.type === "image-text" ? <label className="admin-field"><span>Image position</span><select value={block.imagePosition} onChange={(e) => updateBlock(index, { ...block, imagePosition: e.target.value as "left" | "right" })}><option value="right">Right</option><option value="left">Left</option></select></label> : null}
          </article>)}
        </div>
        <div className="admin-project-add-blocks"><button type="button" onClick={() => update("blocks", [...draft.blocks, createBlock("text")])}><Plus aria-hidden="true" />Text section</button><button type="button" onClick={() => update("blocks", [...draft.blocks, createBlock("image-text")])}><Plus aria-hidden="true" />Image + text</button></div>
      </section>
    </div>
  </div>;
}

export default function ProjectManager({ initialProjects, databaseError }: ProjectManagerProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState<ReferenceProject | null | undefined>(undefined);
  const [retrying, setRetrying] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  if (editing !== undefined) return <ProjectEditor project={editing ?? undefined} onCancel={() => setEditing(undefined)} onSaved={(saved) => { setProjects((current) => current.some((item) => item.id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]); setEditing(undefined); setMessage(saved.translationStatus === "ready" ? "Project saved with Finnish translation" : `English saved. Finnish translation failed: ${saved.translationError}`); }} />;

  const retry = async (project: ReferenceProject) => {
    if (retrying.includes(project.id)) return;
    setRetrying((current) => [...current, project.id]);
    try {
      const data = await invokeCatalogueTranslation({ action: "retry", entityType: "referenceProject", entityId: project.id });
      setProjects((current) => current.map((item) => item.id === project.id ? { ...item, translationStatus: data.translationStatus, translationError: data.translationError ?? "" } : item));
    } catch (reason) {
      const translationError = reason instanceof Error ? reason.message : "Translation retry failed";
      setProjects((current) => current.map((item) => item.id === project.id ? { ...item, translationStatus: "failed", translationError } : item));
    }
    setRetrying((current) => current.filter((id) => id !== project.id));
  };
  const remove = async (project: ReferenceProject) => {
    if (!window.confirm(`Delete ${project.translations.en?.title || project.slug}? This cannot be undone.`)) return;
    const { error } = await createClient().from("reference_projects").delete().eq("id", project.id);
    if (error) { setMessage(error.message); return; }
    setProjects((current) => current.filter((item) => item.id !== project.id));
  };

  return <div className="admin-page-content admin-project-management">
    {databaseError ? <div className="admin-database-notice"><AlertTriangle aria-hidden="true" /><div><strong>Reference database setup required</strong><p>{databaseError}</p></div></div> : null}
    {message ? <div className="admin-project-message"><CircleCheck aria-hidden="true" />{message}<button type="button" onClick={() => setMessage("")}><X aria-hidden="true" /></button></div> : null}
    <section className="admin-management-card">
      <div className="admin-management-heading"><div><h2>Reference projects</h2><p>{projects.length} project{projects.length === 1 ? "" : "s"} · English source with automatic Finnish translation</p></div><button className="admin-inline-add-product" type="button" onClick={() => setEditing(null)}><Plus aria-hidden="true" />Add new project</button></div>
      {projects.length ? <div className="admin-reference-grid">{projects.map((project) => { const title = project.translations.en?.title || project.slug; return <article key={project.id}><div className="admin-reference-image">{project.coverImageUrl ? <Image src={project.coverImageUrl} alt="" fill sizes="220px" unoptimized /> : <ImagePlus aria-hidden="true" />}</div><div><p>{project.translations.en?.projectTypeLabel || project.projectType || "Reference project"}</p><h3>{title}</h3><span>{project.translations.en?.summary}</span><small>{project.completedYear || "Year not set"} · {project.status === "published" ? "Published" : "Draft"}</small><div className={`admin-reference-translation ${project.translationStatus}`}>{project.translationStatus === "ready" ? <CircleCheck aria-hidden="true" /> : <Languages aria-hidden="true" />}Finnish: {project.translationStatus}{project.translationStatus === "failed" ? <button type="button" disabled={retrying.includes(project.id)} onClick={() => retry(project)}><RefreshCw aria-hidden="true" />{retrying.includes(project.id) ? "Retrying…" : "Retry"}</button> : null}</div></div><footer><button type="button" onClick={() => setEditing(project)}><Pencil aria-hidden="true" />Edit</button><Link href={`/references/${project.slug}`} target="_blank"><ExternalLink aria-hidden="true" />View</Link><button className="danger" type="button" onClick={() => remove(project)}><Trash2 aria-hidden="true" />Delete</button></footer></article>; })}</div> : <div className="admin-empty-state"><LayoutTemplate aria-hidden="true" /><h3>No reference projects yet</h3><p>Create the first past or upcoming healthcare project.</p><button type="button" onClick={() => setEditing(null)}>Add a project</button></div>}
    </section>
  </div>;
}
