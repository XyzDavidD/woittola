"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  FileText,
  GripVertical,
  Handshake,
  ImagePlus,
  LayoutGrid,
  Languages,
  ListChecks,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  Search,
  RefreshCw,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { invokeCatalogueTranslation } from "@/lib/catalogue/translation-client";
import type { CatalogueCategory, CatalogueProduct, ColorOption, Specification } from "@/lib/catalogue/types";
import type { ReferenceProject } from "@/lib/references/types";
import type { Partner } from "@/lib/partners/types";
import DashboardLogoutButton from "./DashboardLogoutButton";
import ProjectManager from "./ProjectManager";
import PartnerManager from "./PartnerManager";

type DashboardView = "products" | "categories" | "references" | "partners";
type ProductStatus = "Published" | "Draft";
type EditorStep = "details" | "content" | "technical";

type DashboardProduct = CatalogueProduct & {
  name: string;
  type: string;
  category: string;
  image: string;
  description: string;
  displayStatus: ProductStatus;
  updated: string;
};

type DashboardCategory = CatalogueCategory & {
  name: string;
  heroTitle: string;
  heroDescription: string;
};

type UploadAsset = {
  name: string;
  url?: string;
  file?: File;
};

type ProductDraft = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  brand: string;
  productType: string;
  description: string;
  applications: string[];
  typicalApplications: string[];
  keyFeatures: string[];
  reasons: string[];
  colors: ColorOption[];
  specifications: Specification[];
  accessories: string[];
  images: UploadAsset[];
  brochure: UploadAsset[];
  technicalSheet: UploadAsset[];
  video: UploadAsset[];
};

type CategoryDraft = {
  id: string;
  slug: string;
  name: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: UploadAsset[];
  isPublished: boolean;
};

const editorSteps: Array<{
  id: EditorStep;
  label: string;
  description: string;
  icon: typeof Settings2;
}> = [
  { id: "details", label: "Product details", description: "Information, media and documents", icon: Settings2 },
  { id: "content", label: "Page content", description: "Applications, benefits and colors", icon: Sparkles },
  { id: "technical", label: "Technical details", description: "Specifications and accessories", icon: ListChecks },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function createDraft(categories: DashboardCategory[], product?: DashboardProduct): ProductDraft {
  const translation = product?.translations.en;

  return {
    id: product?.id,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    brand: product?.brand ?? "",
    productType: product?.productType ?? "",
    description: translation?.description ?? "",
    applications: product?.applications ?? [],
    typicalApplications: translation?.typicalApplications ?? [],
    keyFeatures: translation?.keyFeatures ?? [],
    reasons: translation?.reasons ?? [],
    colors: translation?.colors ?? [],
    specifications: translation?.specifications ?? [],
    accessories: translation?.accessories ?? [],
    images: product ? [product.primaryImageUrl, ...product.galleryUrls].filter(Boolean).map((url) => ({ name: url.split("/").at(-1) ?? "product image", url })) : [],
    brochure: product?.brochureUrl ? [{ name: product.brochureUrl.split("/").at(-1) ?? "brochure.pdf", url: product.brochureUrl }] : [],
    technicalSheet: product?.technicalSheetUrl ? [{ name: product.technicalSheetUrl.split("/").at(-1) ?? "technical-sheet.pdf", url: product.technicalSheetUrl }] : [],
    video: product?.videoUrl ? [{ name: product.videoUrl.split("/").at(-1) ?? "product-video", url: product.videoUrl }] : [],
  };
}

type ListEditorProps = {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  addLabel: string;
  maxItems?: number;
};

function ListEditor({ values, onChange, placeholder, addLabel, maxItems }: ListEditorProps) {
  const isAtLimit = maxItems !== undefined && values.length >= maxItems;

  return (
    <div className="admin-list-editor admin-bilingual-list-editor admin-single-list-editor">
      {values.map((value, index) => (
        <div className="admin-bilingual-list-row admin-single-list-row" key={index}>
          <GripVertical aria-hidden="true" />
          <label><span>EN</span><input aria-label={`${addLabel} ${index + 1}`} value={value} placeholder={placeholder} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>
          <button type="button" aria-label={`Remove ${value || addLabel}`} onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}><X aria-hidden="true" /></button>
        </div>
      ))}
      <div className="admin-list-editor-footer">
        <button className="admin-add-row" type="button" disabled={isAtLimit} onClick={() => onChange([...values, ""])}><Plus aria-hidden="true" /> {isAtLimit ? `Maximum ${maxItems} items` : addLabel}</button>
        {maxItems !== undefined ? <span>{values.length} / {maxItems}</span> : null}
      </div>
    </div>
  );
}

type ColorEditorProps = {
  values: ColorOption[];
  onChange: (values: ColorOption[]) => void;
};

function ColorEditor({ values, onChange }: ColorEditorProps) {
  return (
    <div className="admin-bilingual-color-editor admin-single-color-editor">
      {values.map((row, index) => (
        <div className="admin-bilingual-color-row admin-single-color-row" key={index}>
          <input type="color" aria-label={`Color ${index + 1}`} value={row.value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} />
          <label><span>EN</span><input aria-label={`Color name ${index + 1}`} value={row.name} placeholder="e.g. Navy blue" onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} /></label>
          <span>{row.value}</span>
          <button type="button" aria-label={`Remove ${row.name || "color"}`} onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}><X aria-hidden="true" /></button>
        </div>
      ))}
      <button className="admin-add-row" type="button" onClick={() => onChange([...values, { name: "", value: "#6d8198" }])}><Plus aria-hidden="true" /> Add color</button>
    </div>
  );
}

type SpecificationEditorProps = {
  values: Specification[];
  onChange: (values: Specification[]) => void;
};

function SpecificationEditor({ values, onChange }: SpecificationEditorProps) {
  return (
    <div className="admin-bilingual-specification-editor admin-single-specification-editor">
      {values.map((row, index) => (
        <div className="admin-bilingual-specification-row admin-single-specification-row" key={index}>
          <GripVertical aria-hidden="true" />
          <div><span>EN</span><input aria-label={`Specification label ${index + 1}`} value={row.label} placeholder="Label" onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} /><input aria-label={`Specification value ${index + 1}`} value={row.value} placeholder="Value" onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} /></div>
          <button type="button" aria-label={`Remove ${row.label || "specification"}`} onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}><X aria-hidden="true" /></button>
        </div>
      ))}
      <button className="admin-add-row" type="button" onClick={() => onChange([...values, { label: "", value: "" }])}><Plus aria-hidden="true" /> Add specification</button>
    </div>
  );
}

type UploadFieldProps = {
  icon: typeof UploadCloud;
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  files: UploadAsset[];
  onFiles: (files: UploadAsset[]) => void;
};

function UploadField({ icon: Icon, title, description, accept, multiple, files, onFiles }: UploadFieldProps) {
  return (
    <div className="admin-upload-block">
      <label className="admin-upload-zone">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []).map((file) => ({ name: file.name, file }));
            onFiles(multiple ? [...files, ...selected] : selected.slice(0, 1));
          }}
        />
        <span className="admin-upload-icon"><Icon aria-hidden="true" /></span>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <span className="admin-upload-button">Choose file{multiple ? "s" : ""}</span>
      </label>
      {files.length ? (
        <div className="admin-upload-files">
          {files.map((file) => (
            <span key={`${file.name}-${file.url ?? "new"}`}>
              <CircleCheck aria-hidden="true" /> {file.name}
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => onFiles(files.filter((item) => item !== file))}>
                <X aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ProductEditorProps = {
  product?: DashboardProduct;
  categories: DashboardCategory[];
  onCancel: () => void;
  onSave: (draft: ProductDraft, status: ProductStatus) => Promise<boolean>;
};

function ProductEditor({ product, categories, onCancel, onSave }: ProductEditorProps) {
  const [activeStep, setActiveStep] = useState<EditorStep>("details");
  const [draft, setDraft] = useState<ProductDraft>(() => createDraft(categories, product));
  const [saving, setSaving] = useState(false);

  const updateDraft = <Key extends keyof ProductDraft>(key: Key, value: ProductDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const goToNextStep = () => {
    const index = editorSteps.findIndex((step) => step.id === activeStep);
    if (index < editorSteps.length - 1) setActiveStep(editorSteps[index + 1].id);
  };

  const canSave = Boolean(
    draft.name.trim() &&
    draft.description.trim() &&
    draft.categoryId &&
    draft.images.length,
  );
  const missingRequirements = [
    !draft.name.trim() ? "product title" : "",
    !draft.description.trim() ? "product description" : "",
    !draft.images.length ? "one product image" : "",
  ].filter(Boolean);

  const saveProduct = async (status: ProductStatus) => {
    if (!canSave || saving) return;
    setSaving(true);
    const saved = await onSave(draft, status);
    if (!saved) setSaving(false);
  };

  return (
    <div className="admin-editor-page">
      <header className="admin-editor-header">
        <div>
          <div className="admin-editor-title-row">
            <div>
              <p>{product ? "Edit product" : "New product"}</p>
              <h1>{draft.name || "Untitled product"}</h1>
              <small className={missingRequirements.length ? "admin-editor-requirements" : "admin-editor-requirements complete"}>{missingRequirements.length ? `Still required: ${missingRequirements.join(", ")}.` : "Required product information is complete."}</small>
            </div>
          </div>
        </div>
        <div className="admin-editor-actions">
          {product ? (
            <Link href={`/products/${product.slug}`} target="_blank">
              <ExternalLink aria-hidden="true" /> View product
            </Link>
          ) : null}
          <button type="button" className="admin-publish-product" disabled={!canSave || saving} onClick={() => saveProduct("Published")}>
            <Check aria-hidden="true" /> {saving ? "Saving & translating…" : product ? "Save changes" : "Add product"}
          </button>
        </div>
      </header>

      <div className="admin-editor-layout">
        <nav className="admin-editor-steps" aria-label="Product form sections">
          <p>Product setup</p>
          {editorSteps.map(({ id, label, description, icon: Icon }, index) => (
            <button className={activeStep === id ? "active" : ""} type="button" onClick={() => setActiveStep(id)} key={id}>
              <span>{activeStep === id ? <Icon aria-hidden="true" /> : index + 1}</span>
              <span><strong>{label}</strong><small>{description}</small></span>
              <ChevronRight aria-hidden="true" />
            </button>
          ))}
          <div className="admin-editor-tip">
            <Languages aria-hidden="true" />
            <p><strong>Write in English.</strong> Finnish is generated automatically after saving. Only the title, description and one image are required.</p>
          </div>
        </nav>

        <div className="admin-editor-content">
          {activeStep === "details" ? (
            <section className="admin-form-card" aria-labelledby="basics-title">
              <div className="admin-form-heading">
                <span><Settings2 aria-hidden="true" /></span>
                <div><p>Step 1 of 3</p><h2 id="basics-title">Basic information</h2><small>The main details customers see first on the product page.</small></div>
              </div>

              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>Category</span>
                  <select value={draft.categoryId} onChange={(event) => updateDraft("categoryId", event.target.value)}>
                    {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Brand <small>Optional</small></span>
                  <input value={draft.brand} placeholder="e.g. Greiner" onChange={(event) => updateDraft("brand", event.target.value)} />
                </label>
              </div>

              <div className="admin-product-language-grid admin-product-language-grid-single">
                <section className="admin-product-language-panel">
                  <div className="admin-product-language-heading"><span>EN</span><div><h3>Product content</h3><p>Finnish will be created automatically with Gemini</p></div></div>
                  <label className="admin-field"><span>Product title *</span><input value={draft.name} placeholder="e.g. MedSeat Pro" onChange={(event) => { updateDraft("name", event.target.value); if (!draft.id) updateDraft("slug", slugify(event.target.value)); }} /></label>
                  <label className="admin-field"><span>Product type <small>Optional</small></span><input value={draft.productType} placeholder="e.g. Electric treatment chair" onChange={(event) => updateDraft("productType", event.target.value)} /></label>
                  <label className="admin-field"><span>Description *</span><textarea rows={6} value={draft.description} placeholder="Describe the product, who it is for and the main value it provides." onChange={(event) => updateDraft("description", event.target.value)} /><small>{draft.description.length} characters</small></label>
                </section>
              </div>

            </section>
          ) : null}

          {activeStep === "details" ? (
            <section className="admin-form-card" aria-labelledby="media-title">
              <div className="admin-form-heading">
                <span><ImagePlus aria-hidden="true" /></span>
                <div><p>Product details</p><h2 id="media-title">Media &amp; documents</h2><small>Add the visual assets and downloadable files used on the product page.</small></div>
              </div>

              <div className="admin-field-section">
                <div className="admin-section-label"><h3>Product gallery *</h3><p>At least one image is required. Upload up to 8; the first becomes the main image.</p></div>
                <UploadField icon={ImagePlus} title="Upload product images" description="JPG, PNG or WebP · Recommended 1600 × 1200 px" accept="image/*" multiple files={draft.images} onFiles={(files) => updateDraft("images", files.slice(0, 8))} />
              </div>

              <div className="admin-two-column-fields">
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Product brochure</h3><p>Displayed beside the quote button and in Downloads.</p></div>
                  <UploadField icon={FileText} title="Upload brochure" description="PDF · Maximum 20 MB" accept="application/pdf" files={draft.brochure} onFiles={(files) => updateDraft("brochure", files.slice(0, 1))} />
                </div>
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Technical data sheet</h3><p>Optional second document in the Downloads tab.</p></div>
                  <UploadField icon={FileText} title="Upload data sheet" description="PDF · Maximum 20 MB" accept="application/pdf" files={draft.technicalSheet} onFiles={(files) => updateDraft("technicalSheet", files.slice(0, 1))} />
                </div>
              </div>

              <div className="admin-field-section admin-video-section">
                <div className="admin-section-label"><h3>Product video</h3><p>Upload the demonstration video shown on the product page.</p></div>
                <UploadField icon={Video} title="Upload product video" description="MP4 or WebM · Maximum 250 MB" accept="video/mp4,video/webm" files={draft.video} onFiles={(files) => updateDraft("video", files.slice(0, 1))} />
              </div>
            </section>
          ) : null}

          {activeStep === "content" ? (
            <section className="admin-form-card" aria-labelledby="content-title">
              <div className="admin-form-heading">
                <span><Sparkles aria-hidden="true" /></span>
                <div><p>Step 2 of 3</p><h2 id="content-title">Product page content</h2><small>Build the Overview tab using short, scannable points.</small></div>
              </div>

              <div className="admin-content-grid">
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Applications</h3><p>Shown near the product name with icons.</p></div>
                  <ListEditor values={draft.applications} onChange={(values) => updateDraft("applications", values)} placeholder="e.g. Dialysis" addLabel="Add application" maxItems={5} />
                </div>
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Typical applications</h3><p>The detailed clinical use list in Overview.</p></div>
                  <ListEditor values={draft.typicalApplications} onChange={(values) => updateDraft("typicalApplications", values)} placeholder="e.g. Outpatient clinics" addLabel="Add typical use" />
                </div>
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Key features</h3><p>Short benefits displayed as feature tiles.</p></div>
                  <ListEditor values={draft.keyFeatures} onChange={(values) => updateDraft("keyFeatures", values)} placeholder="e.g. Electric adjustments" addLabel="Add key feature" />
                </div>
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Why choose this product?</h3><p>Reasons that help the customer compare options.</p></div>
                  <ListEditor values={draft.reasons} onChange={(values) => updateDraft("reasons", values)} placeholder="e.g. Easy-to-clean cushions" addLabel="Add reason" />
                </div>
              </div>

              <div className="admin-field-section admin-colors-section">
                <div className="admin-section-label"><h3>Available colors</h3><p>Add the upholstery or finish colors customers can request.</p></div>
                <ColorEditor values={draft.colors} onChange={(values) => updateDraft("colors", values)} />
              </div>
            </section>
          ) : null}

          {activeStep === "technical" ? (
            <section className="admin-form-card" aria-labelledby="technical-title">
              <div className="admin-form-heading">
                <span><ListChecks aria-hidden="true" /></span>
                <div><p>Step 3 of 3</p><h2 id="technical-title">Technical details</h2><small>Complete the Specifications and Options &amp; Accessories tabs.</small></div>
              </div>

              <div className="admin-field-section">
                <div className="admin-section-label"><h3>Specifications</h3><p>Use a clear label and value for each technical detail.</p></div>
                <SpecificationEditor values={draft.specifications} onChange={(values) => updateDraft("specifications", values)} />
              </div>

              <div className="admin-field-section">
                <div className="admin-section-label"><h3>Options &amp; accessories</h3><p>List compatible accessories and optional product configurations.</p></div>
                <ListEditor values={draft.accessories} onChange={(values) => updateDraft("accessories", values)} placeholder="e.g. Additional headrest" addLabel="Add accessory" />
              </div>

              <div className="admin-ready-card">
                <CircleCheck aria-hidden="true" />
                <div><h3>Product content is ready</h3><p>Review any section using the menu, then save as a draft or add the product.</p></div>
              </div>
            </section>
          ) : null}

          <div className="admin-editor-footer">
            <button type="button" onClick={onCancel}>Cancel</button>
            {activeStep !== "technical" ? (
              <button type="button" onClick={goToNextStep}>Continue <ChevronRight aria-hidden="true" /></button>
            ) : (
              <button type="button" disabled={!canSave || saving} onClick={() => saveProduct("Published")}><Check aria-hidden="true" /> {saving ? "Saving & translating…" : product ? "Save changes" : "Add product"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type CategoryEditorProps = {
  category: DashboardCategory;
  onCancel: () => void;
  onSave: (draft: CategoryDraft) => Promise<boolean>;
};

function CategoryEditor({ category, onCancel, onSave }: CategoryEditorProps) {
  const [draft, setDraft] = useState<CategoryDraft>({
    id: category.id,
    slug: category.slug,
    name: category.name,
    heroTitle: category.heroTitle,
    heroDescription: category.heroDescription,
    heroImage: category.heroImageUrl ? [{ name: category.heroImageUrl.split("/").at(-1) ?? "hero image", url: category.heroImageUrl }] : [],
    isPublished: category.isPublished,
  });
  const [saving, setSaving] = useState(false);

  const update = <Key extends keyof CategoryDraft>(key: Key, value: CategoryDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.heroTitle.trim() || !draft.heroDescription.trim() || saving) return;
    setSaving(true);
    const saved = await onSave(draft);
    if (!saved) setSaving(false);
  };

  return (
    <div className="admin-modal-overlay">
      <section className="admin-category-editor" role="dialog" aria-modal="true" aria-labelledby="category-editor-title">
        <header>
          <div><p>Edit category</p><h2 id="category-editor-title">{category.name}</h2><small>/catalogue/{category.slug}</small></div>
          <button type="button" onClick={onCancel} aria-label="Close category editor"><X aria-hidden="true" /></button>
        </header>

        <div className="admin-category-editor-body">
          <div className="admin-category-language-section">
            <div className="admin-category-language-heading"><span>EN</span><div><h3>Category content</h3><p>Finnish will be created automatically with Gemini</p></div></div>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Category name *</span><input value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
              <label className="admin-field"><span>Hero title *</span><input value={draft.heroTitle} onChange={(event) => update("heroTitle", event.target.value)} /></label>
            </div>
            <label className="admin-field admin-full-field"><span>Hero description *</span><textarea rows={4} value={draft.heroDescription} onChange={(event) => update("heroDescription", event.target.value)} /></label>
          </div>

          <div className="admin-category-language-section">
            <div className="admin-category-language-heading"><ImagePlus aria-hidden="true" /><div><h3>Category hero image</h3><p>Used at the top of this category page</p></div></div>
            <UploadField icon={ImagePlus} title="Upload hero image" description="JPG, PNG, WebP or AVIF · Recommended 2000 × 900 px" accept="image/*" files={draft.heroImage} onFiles={(files) => update("heroImage", files.slice(0, 1))} />
            <label className="admin-category-publish-toggle"><input type="checkbox" checked={draft.isPublished} onChange={(event) => update("isPublished", event.target.checked)} /><span>Category is visible on the website</span></label>
          </div>
        </div>

        <footer><button type="button" onClick={onCancel}>Cancel</button><button type="button" disabled={saving || !draft.name.trim() || !draft.heroTitle.trim() || !draft.heroDescription.trim()} onClick={handleSave}><Check aria-hidden="true" /> {saving ? "Saving & translating…" : "Save category"}</button></footer>
      </section>
    </div>
  );
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function toDashboardCategory(category: CatalogueCategory): DashboardCategory {
  return {
    ...category,
    name: category.translations.en?.name ?? category.slug,
    heroTitle: category.translations.en?.heroTitle ?? category.translations.en?.name ?? category.slug,
    heroDescription: category.translations.en?.heroDescription ?? "",
  };
}

function toDashboardProduct(product: CatalogueProduct): DashboardProduct {
  const translation = product.translations.en;
  return {
    ...product,
    name: translation?.name ?? product.slug,
    type: translation?.productTypeLabel || product.productType,
    category: product.categoryName,
    image: product.primaryImageUrl,
    description: translation?.description ?? "",
    displayStatus: product.status === "published" ? "Published" : "Draft",
    updated: formatUpdatedAt(product.updatedAt),
  };
}

function cleanList(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function safeFileName(value: string) {
  const extension = value.includes(".") ? `.${value.split(".").at(-1)?.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "";
  const stem = value.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "file";
  return `${stem}${extension}`;
}

async function uploadAssets(assets: UploadAsset[], folder: string) {
  const supabase = createClient();
  const urls: string[] = [];

  for (const asset of assets) {
    if (asset.url && !asset.file) {
      urls.push(asset.url);
      continue;
    }
    if (!asset.file) continue;

    const path = `${folder}/${crypto.randomUUID()}-${safeFileName(asset.file.name)}`;
    const { error } = await supabase.storage.from("catalogue-media").upload(path, asset.file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from("catalogue-media").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

type TranslationStatusProps = {
  status: CatalogueProduct["translationStatus"];
  error: string;
  retrying: boolean;
  onRetry: () => void;
};

function TranslationStatusBadge({ status, error, retrying, onRetry }: TranslationStatusProps) {
  const label = status === "ready" ? "Finnish ready" : status === "processing" ? "Translating" : "Translation failed";
  const Icon = status === "ready" ? CircleCheck : status === "processing" ? LoaderCircle : AlertTriangle;

  return (
    <span className={`admin-translation-status ${status}`} title={error || label}>
      <Icon className={status === "processing" ? "spin" : ""} aria-hidden="true" />
      <span>{label}</span>
      {status === "failed" ? (
        <button type="button" disabled={retrying} onClick={onRetry} aria-label="Retry Finnish translation">
          <RefreshCw className={retrying ? "spin" : ""} aria-hidden="true" /> Retry
        </button>
      ) : null}
    </span>
  );
}

type DashboardProps = {
  initialCategories: CatalogueCategory[];
  initialProducts: CatalogueProduct[];
  initialProjects: ReferenceProject[];
  initialPartners: Partner[];
  databaseError?: string;
  referenceDatabaseError?: string;
  partnerDatabaseError?: string;
};

export default function Dashboard({ initialCategories, initialProducts, initialProjects, initialPartners, databaseError, referenceDatabaseError, partnerDatabaseError }: DashboardProps) {
  const [view, setView] = useState<DashboardView>("products");
  const [categories, setCategories] = useState<DashboardCategory[]>(() => initialCategories.map(toDashboardCategory));
  const [products, setProducts] = useState<DashboardProduct[]>(() => initialProducts.map(toDashboardProduct));
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [editingProduct, setEditingProduct] = useState<DashboardProduct | null | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<DashboardCategory | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<DashboardProduct | null>(null);
  const [toast, setToast] = useState("");
  const [retryingTranslations, setRetryingTranslations] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.type.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);
      const matchesCategory = categoryFilter === "All categories" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, products, search]);

  const categoryCount = (categoryId: string) => products.filter((product) => product.categoryId === categoryId).length;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const handleSaveProduct = async (draft: ProductDraft, status: ProductStatus) => {
    try {
      const slug = draft.slug || slugify(draft.name);
      const category = categories.find((item) => item.id === draft.categoryId);
      if (!category) throw new Error("Choose a valid category.");
      if (!draft.name.trim() || !draft.description.trim()) {
        throw new Error("Add the product title and description.");
      }
      if (!draft.images.length) throw new Error("Add at least one product image.");

      const imageUrls = await uploadAssets(draft.images, `products/${slug}/images`);
      const brochureUrls = await uploadAssets(draft.brochure, `products/${slug}/documents`);
      const technicalSheetUrls = await uploadAssets(draft.technicalSheet, `products/${slug}/documents`);
      const videoUrls = await uploadAssets(draft.video, `products/${slug}/video`);
      if (!imageUrls.length) throw new Error("The product image could not be saved.");

      const applications = cleanList(draft.applications);
      const englishTranslation = {
        locale: "en" as const,
        name: draft.name.trim(),
        description: draft.description.trim(),
        productTypeLabel: draft.productType.trim(),
        applicationLabels: applications,
        typicalApplications: cleanList(draft.typicalApplications),
        keyFeatures: cleanList(draft.keyFeatures),
        reasons: cleanList(draft.reasons),
        colors: draft.colors.filter((color) => color.name.trim()),
        specifications: draft.specifications.filter((item) => item.label.trim() && item.value.trim()),
        accessories: cleanList(draft.accessories),
      };

      const result = await invokeCatalogueTranslation({
        action: "save",
        entityType: "product",
        data: {
          id: draft.id ?? null,
          categoryId: category.id,
          slug,
          brand: draft.brand.trim(),
          productType: draft.productType.trim(),
          applications,
          status: status.toLowerCase(),
          primaryImageUrl: imageUrls[0],
          galleryUrls: imageUrls.slice(1),
          brochureUrl: brochureUrls[0] ?? "",
          technicalSheetUrl: technicalSheetUrls[0] ?? "",
          videoUrl: videoUrls[0] ?? "",
          name: englishTranslation.name,
          description: englishTranslation.description,
          productTypeLabel: englishTranslation.productTypeLabel,
          applicationLabels: englishTranslation.applicationLabels,
          typicalApplications: englishTranslation.typicalApplications,
          keyFeatures: englishTranslation.keyFeatures,
          reasons: englishTranslation.reasons,
          colors: englishTranslation.colors,
          specifications: englishTranslation.specifications,
          accessories: englishTranslation.accessories,
        },
      });

      const existing = products.find((product) => product.id === result.entityId);
      const now = new Date().toISOString();
      const nextCatalogueProduct: CatalogueProduct = {
        id: result.entityId,
        categoryId: category.id,
        categorySlug: category.slug,
        categoryName: category.name,
        slug,
        brand: draft.brand.trim(),
        productType: draft.productType.trim(),
        applications,
        status: status === "Published" ? "published" : "draft",
        featured: existing?.featured ?? false,
        sortOrder: existing?.sortOrder ?? 0,
        primaryImageUrl: imageUrls[0],
        galleryUrls: imageUrls.slice(1),
        brochureUrl: brochureUrls[0] ?? "",
        technicalSheetUrl: technicalSheetUrls[0] ?? "",
        videoUrl: videoUrls[0] ?? "",
        translationStatus: result.translationStatus,
        translationError: result.translationError ?? "",
        translatedAt: result.translationStatus === "ready" ? now : existing?.translatedAt ?? "",
        translationSourceUpdatedAt: now,
        updatedAt: now,
        translations: {
          ...existing?.translations,
          en: englishTranslation,
        },
      };
      const nextProduct = toDashboardProduct(nextCatalogueProduct);
      setProducts((current) => draft.id
        ? current.map((product) => product.id === result.entityId ? nextProduct : product)
        : [nextProduct, ...current]);
      setEditingProduct(undefined);
      showToast(result.translationStatus === "ready"
        ? draft.id ? "Product saved and Finnish updated" : "Product saved with Finnish translation"
        : `English saved. Finnish translation failed: ${result.translationError || "Please retry."}`);
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save the product");
      return false;
    }
  };

  const handleSaveCategory = async (draft: CategoryDraft) => {
    try {
      const heroUrls = await uploadAssets(draft.heroImage, `categories/${draft.slug}`);
      const existing = categories.find((category) => category.id === draft.id);
      const heroImageUrl = heroUrls[0] || existing?.heroImageUrl || "/images/hero-products.png";
      const englishTranslation = {
        locale: "en" as const,
        name: draft.name.trim(),
        heroTitle: draft.heroTitle.trim(),
        heroDescription: draft.heroDescription.trim(),
        metaTitle: `${draft.name.trim()} | Woittola Healthcare`,
        metaDescription: draft.heroDescription.trim(),
      };

      const result = await invokeCatalogueTranslation({
        action: "save",
        entityType: "category",
        data: {
          id: draft.id,
          heroImageUrl,
          isPublished: draft.isPublished,
          name: englishTranslation.name,
          heroTitle: englishTranslation.heroTitle,
          heroDescription: englishTranslation.heroDescription,
          metaTitle: englishTranslation.metaTitle,
          metaDescription: englishTranslation.metaDescription,
        },
      });

      const now = new Date().toISOString();
      setCategories((current) => current.map((category) => category.id === draft.id ? {
        ...category,
        name: englishTranslation.name,
        heroTitle: englishTranslation.heroTitle,
        heroDescription: englishTranslation.heroDescription,
        heroImageUrl,
        isPublished: draft.isPublished,
        translationStatus: result.translationStatus,
        translationError: result.translationError ?? "",
        translatedAt: result.translationStatus === "ready" ? now : category.translatedAt,
        translationSourceUpdatedAt: now,
        updatedAt: now,
        translations: { ...category.translations, en: englishTranslation },
      } : category));
      setProducts((current) => current.map((product) => product.categoryId === draft.id
        ? { ...product, category: englishTranslation.name, categoryName: englishTranslation.name }
        : product));
      setEditingCategory(null);
      showToast(result.translationStatus === "ready"
        ? "Category saved and Finnish updated"
        : `English saved. Finnish translation failed: ${result.translationError || "Please retry."}`);
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save the category");
      return false;
    }
  };

  const handleRetryTranslation = async (entityType: "category" | "product", entityId: string) => {
    const retryKey = `${entityType}:${entityId}`;
    if (retryingTranslations.includes(retryKey)) return;
    setRetryingTranslations((current) => [...current, retryKey]);
    if (entityType === "category") {
      setCategories((current) => current.map((category) => category.id === entityId
        ? { ...category, translationStatus: "processing", translationError: "" }
        : category));
    } else {
      setProducts((current) => current.map((product) => product.id === entityId
        ? { ...product, translationStatus: "processing", translationError: "" }
        : product));
    }

    try {
      const result = await invokeCatalogueTranslation({ action: "retry", entityType, entityId });
      const statusUpdate = {
        translationStatus: result.translationStatus,
        translationError: result.translationError ?? "",
        translatedAt: result.translationStatus === "ready" ? new Date().toISOString() : "",
      };
      if (entityType === "category") {
        setCategories((current) => current.map((category) => category.id === entityId
          ? { ...category, ...statusUpdate }
          : category));
      } else {
        setProducts((current) => current.map((product) => product.id === entityId
          ? { ...product, ...statusUpdate }
          : product));
      }
      showToast(result.translationStatus === "ready"
        ? "Finnish translation is ready"
        : `Finnish translation failed: ${result.translationError || "Please retry."}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Translation retry failed";
      if (entityType === "category") {
        setCategories((current) => current.map((category) => category.id === entityId
          ? { ...category, translationStatus: "failed", translationError: message }
          : category));
      } else {
        setProducts((current) => current.map((product) => product.id === entityId
          ? { ...product, translationStatus: "failed", translationError: message }
          : product));
      }
      showToast(message);
    } finally {
      setRetryingTranslations((current) => current.filter((key) => key !== retryKey));
    }
  };

  const handleDeleteProduct = async (product: DashboardProduct) => {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      showToast(error.message);
      return;
    }
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setDeleteProduct(null);
    showToast("Product deleted from Supabase");
  };

  if (editingProduct !== undefined) {
    return (
      <main className="admin-dashboard">
        <ProductEditor product={editingProduct ?? undefined} categories={categories} onCancel={() => setEditingProduct(undefined)} onSave={handleSaveProduct} />
        {toast ? <div className="admin-toast"><CircleCheck aria-hidden="true" /> {toast}</div> : null}
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/" aria-label="Woittola website">
          <Image src="/images/logo.png" alt="Woittola Healthcare" width={296} height={50} priority unoptimized />
        </Link>
        <nav aria-label="Dashboard sections">
          <p>Manage</p>
          <button className={view === "products" ? "active" : ""} type="button" onClick={() => setView("products")}>
            <Package aria-hidden="true" /> Products <span>{products.length}</span>
          </button>
          <button className={view === "categories" ? "active" : ""} type="button" onClick={() => setView("categories")}>
            <Tag aria-hidden="true" /> Categories <span>{categories.length}</span>
          </button>
          <button className={view === "references" ? "active" : ""} type="button" onClick={() => setView("references")}>
            <BookOpen aria-hidden="true" /> References <span>{initialProjects.length}</span>
          </button>
          <button className={view === "partners" ? "active" : ""} type="button" onClick={() => setView("partners")}>
            <Handshake aria-hidden="true" /> Partners <span>{partners.length}</span>
          </button>
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank"><ExternalLink aria-hidden="true" /> View website</Link>
          <DashboardLogoutButton />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div><p>Woittola Healthcare</p><span>Secure administrator workspace</span></div>
        </header>

        {view === "products" ? (
          <div className="admin-page-content">
            {databaseError ? <div className="admin-database-notice"><AlertTriangle aria-hidden="true" /><div><strong>Catalogue connection error</strong><p>{databaseError}</p></div></div> : null}
            <section className="admin-management-card" aria-labelledby="product-list-title">
              <div className="admin-management-heading">
                <div><h2 id="product-list-title">All products</h2><p>{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} shown</p></div>
                <div className="admin-product-heading-actions">
                  <div className="admin-product-tools">
                    <label className="admin-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." /><kbd>⌘ K</kbd></label>
                    <label className="admin-filter"><span className="sr-only">Filter by category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</select></label>
                  </div>
                  <button className="admin-inline-add-product" type="button" onClick={() => setEditingProduct(null)}><Plus aria-hidden="true" /> Add new product</button>
                </div>
              </div>

              {filteredProducts.length ? (
                <div className="admin-product-table">
                  <div className="admin-product-table-head"><span>Product</span><span>Category</span><span>Status</span><span>Last updated</span><span>Actions</span></div>
                  {filteredProducts.map((product) => (
                    <article className="admin-product-row" key={product.id}>
                      <div className="admin-product-identity">
                        <div>{product.image ? <Image src={product.image} alt="" fill sizes="58px" unoptimized /> : <ImagePlus aria-hidden="true" />}</div>
                        <span><strong>{product.name}</strong><small>{product.type}</small></span>
                      </div>
                      <span className="admin-product-category">{product.category}</span>
                      <span className="admin-product-statuses">
                        <span className={`admin-status ${product.displayStatus.toLowerCase()}`}><span />{product.displayStatus}</span>
                        <TranslationStatusBadge
                          status={product.translationStatus}
                          error={product.translationError}
                          retrying={retryingTranslations.includes(`product:${product.id}`)}
                          onRetry={() => handleRetryTranslation("product", product.id)}
                        />
                      </span>
                      <span className="admin-updated">{product.updated}</span>
                      <div className="admin-row-actions">
                        <button type="button" aria-label={`Edit ${product.name}`} onClick={() => setEditingProduct(product)}><Pencil aria-hidden="true" /></button>
                        <Link href={`/products/${product.slug}`} target="_blank" aria-label={`View ${product.name}`}><ExternalLink aria-hidden="true" /></Link>
                        <button className="danger" type="button" aria-label={`Delete ${product.name}`} onClick={() => setDeleteProduct(product)}><Trash2 aria-hidden="true" /></button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state"><Search aria-hidden="true" /><h3>No products found</h3><p>Try a different search or category filter.</p><button type="button" onClick={() => { setSearch(""); setCategoryFilter("All categories"); }}>Clear filters</button></div>
              )}
            </section>
          </div>
        ) : view === "categories" ? (
          <div className="admin-page-content">
            {databaseError ? <div className="admin-database-notice"><AlertTriangle aria-hidden="true" /><div><strong>Catalogue connection error</strong><p>{databaseError}</p></div></div> : null}
            <div className="admin-category-layout admin-category-layout-wide">
              <section className="admin-category-list-card" aria-labelledby="category-list-title">
                <div><h2 id="category-list-title">Product categories</h2><p>{categories.length} database-backed categories · write in English and translate automatically to Finnish</p></div>
                <div className="admin-category-list">
                  {categories.map((category) => {
                    const count = categoryCount(category.id);
                    return (
                      <article key={category.id}>
                        <span className="admin-category-icon"><LayoutGrid aria-hidden="true" /></span>
                        <div>
                          <strong>{category.name}</strong>
                          <small>{count} product{count === 1 ? "" : "s"} · {category.isPublished ? "Published" : "Hidden"}</small>
                          <TranslationStatusBadge
                            status={category.translationStatus}
                            error={category.translationError}
                            retrying={retryingTranslations.includes(`category:${category.id}`)}
                            onRetry={() => handleRetryTranslation("category", category.id)}
                          />
                        </div>
                        <Link href={`/catalogue/${category.slug}`} target="_blank" aria-label={`View ${category.name}`}><ExternalLink aria-hidden="true" /></Link>
                        <button type="button" aria-label={`Edit ${category.name}`} onClick={() => setEditingCategory(category)}><Pencil aria-hidden="true" /></button>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        ) : view === "references" ? <ProjectManager initialProjects={initialProjects} databaseError={referenceDatabaseError} />
          : <PartnerManager partners={partners} onPartnersChange={setPartners} databaseError={partnerDatabaseError} />}
      </div>

      {deleteProduct ? (
        <div className="admin-modal-overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) setDeleteProduct(null); }}>
          <section className="admin-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-product-title">
            <span><AlertTriangle aria-hidden="true" /></span>
            <h2 id="delete-product-title">Delete {deleteProduct.name}?</h2>
            <p>This permanently removes the product and its translations from the Supabase catalogue.</p>
            <div><button type="button" onClick={() => setDeleteProduct(null)}>Cancel</button><button type="button" onClick={() => handleDeleteProduct(deleteProduct)}><Trash2 aria-hidden="true" /> Delete product</button></div>
          </section>
        </div>
      ) : null}

      {editingCategory ? <CategoryEditor category={editingCategory} onCancel={() => setEditingCategory(null)} onSave={handleSaveCategory} /> : null}

      {toast ? <div className="admin-toast"><CircleCheck aria-hidden="true" /> {toast}</div> : null}
    </main>
  );
}
