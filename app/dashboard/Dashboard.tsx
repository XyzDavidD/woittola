"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  FileText,
  FolderPlus,
  GripVertical,
  ImagePlus,
  Info,
  LayoutGrid,
  ListChecks,
  Package,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { productCategories } from "../data/catalogue";

type DashboardView = "products" | "categories";
type ProductStatus = "Published" | "Draft";
type EditorStep = "details" | "content" | "technical";

type DashboardProduct = {
  id: string;
  name: string;
  slug: string;
  type: string;
  category: string;
  image: string;
  description: string;
  status: ProductStatus;
  updated: string;
};

type DashboardCategory = {
  id: string;
  name: string;
};

type ColorOption = {
  name: string;
  value: string;
};

type Specification = {
  label: string;
  value: string;
};

type ProductDraft = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  applications: string[];
  typicalApplications: string[];
  keyFeatures: string[];
  reasons: string[];
  colors: ColorOption[];
  specifications: Specification[];
  accessories: string[];
  imageNames: string[];
  brochureName: string;
  technicalSheetName: string;
  videoFileName: string;
};

const initialCategories: DashboardCategory[] = productCategories.map((category) => ({
  id: category.slug,
  name: category.name,
}));

const initialProducts: DashboardProduct[] = productCategories.flatMap((category, categoryIndex) =>
  category.products.map((product, productIndex) => ({
    id: product.slug,
    name: product.name,
    slug: product.slug,
    type: product.type,
    category: category.name,
    image: product.image,
    description: `${product.name} is designed for dependable professional healthcare use and comfortable day-to-day care.`,
    status: categoryIndex === 7 && productIndex === 2 ? "Draft" : "Published",
    updated: productIndex === 0 ? "Today" : productIndex === 1 ? "2 days ago" : "Last week",
  })),
);

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

function createDraft(product?: DashboardProduct): ProductDraft {
  return {
    id: product?.id,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category: product?.category ?? initialCategories[1].name,
    description:
      product?.description ??
      "Describe what this product is, who it is designed for and the main value it provides to healthcare professionals.",
    applications: ["Dialysis", "Infusion Therapy", "Chemotherapy"],
    typicalApplications: [
      "Dialysis units",
      "Infusion therapy",
      "Outpatient clinics and day surgery",
    ],
    keyFeatures: [
      "Ergonomic design",
      "Electric adjustments",
      "Easy-to-clean upholstery",
      "Patient safety and comfort",
    ],
    reasons: [
      "Fully electric adjustments for optimal positioning",
      "Wide range of comfortable treatment positions",
      "Durable, removable and easy-to-clean cushions",
    ],
    colors: [
      { name: "Ocean", value: "#2d6497" },
      { name: "Graphite", value: "#59606a" },
      { name: "Taupe", value: "#8a8174" },
    ],
    specifications: [
      { label: "Adjustment", value: "Fully electric positioning" },
      { label: "Upholstery", value: "Medical-grade, removable and easy to clean" },
      { label: "Certification", value: "CE marked medical device" },
    ],
    accessories: ["Height-adjustable IV pole", "Removable side supports", "Paper roll holder"],
    imageNames: product ? [product.image.split("/").at(-1) ?? "product-image.jpg"] : [],
    brochureName: "",
    technicalSheetName: "",
    videoFileName: "",
  };
}

type ListEditorProps = {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  maxItems?: number;
};

function ListEditor({ items, onChange, placeholder, addLabel, maxItems }: ListEditorProps) {
  const isAtLimit = maxItems !== undefined && items.length >= maxItems;

  return (
    <div className="admin-list-editor">
      {items.map((item, index) => (
        <div className="admin-list-row" key={`${index}-${item}`}>
          <GripVertical aria-hidden="true" />
          <input
            aria-label={`${addLabel} ${index + 1}`}
            value={item}
            placeholder={placeholder}
            onChange={(event) =>
              onChange(items.map((current, itemIndex) => (itemIndex === index ? event.target.value : current)))
            }
          />
          <button
            type="button"
            aria-label={`Remove ${item || addLabel}`}
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      ))}
      <div className="admin-list-editor-footer">
        <button className="admin-add-row" type="button" disabled={isAtLimit} onClick={() => onChange([...items, ""])}>
          <Plus aria-hidden="true" /> {isAtLimit ? `Maximum ${maxItems} applications` : addLabel}
        </button>
        {maxItems !== undefined ? <span>{items.length} / {maxItems}</span> : null}
      </div>
    </div>
  );
}

type UploadFieldProps = {
  icon: typeof UploadCloud;
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  files: string[];
  onFiles: (files: string[]) => void;
};

function UploadField({ icon: Icon, title, description, accept, multiple, files, onFiles }: UploadFieldProps) {
  return (
    <div className="admin-upload-block">
      <label className="admin-upload-zone">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(event) => onFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
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
            <span key={file}>
              <CircleCheck aria-hidden="true" /> {file}
              <button type="button" aria-label={`Remove ${file}`} onClick={() => onFiles(files.filter((name) => name !== file))}>
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
  onSave: (draft: ProductDraft, status: ProductStatus) => void;
};

function ProductEditor({ product, categories, onCancel, onSave }: ProductEditorProps) {
  const [activeStep, setActiveStep] = useState<EditorStep>("details");
  const [draft, setDraft] = useState<ProductDraft>(() => createDraft(product));

  const updateDraft = <Key extends keyof ProductDraft>(key: Key, value: ProductDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const goToNextStep = () => {
    const index = editorSteps.findIndex((step) => step.id === activeStep);
    if (index < editorSteps.length - 1) setActiveStep(editorSteps[index + 1].id);
  };

  const canSave = draft.name.trim() && draft.category && draft.description.trim();

  return (
    <div className="admin-editor-page">
      <header className="admin-editor-header">
        <div>
          <div className="admin-editor-title-row">
            <div>
              <p>{product ? "Edit product" : "New product"}</p>
              <h1>{draft.name || "Untitled product"}</h1>
            </div>
          </div>
        </div>
        <div className="admin-editor-actions">
          {product ? (
            <Link href={`/products/${product.slug}`} target="_blank">
              <ExternalLink aria-hidden="true" /> View product
            </Link>
          ) : null}
          <button type="button" className="admin-publish-product" disabled={!canSave} onClick={() => onSave(draft, "Published")}>
            <Check aria-hidden="true" /> {product ? "Save changes" : "Add product"}
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
            <Info aria-hidden="true" />
            <p><strong>Nothing is saved online yet.</strong> This form is a working visual preview for the future database connection.</p>
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
                  <span>Product name *</span>
                  <input
                    value={draft.name}
                    placeholder="e.g. MedSeat Pro"
                    onChange={(event) => {
                      updateDraft("name", event.target.value);
                      updateDraft("slug", slugify(event.target.value));
                    }}
                  />
                </label>
                <label className="admin-field">
                  <span>Category *</span>
                  <select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)}>
                    {categories.map((category) => <option key={category.id}>{category.name}</option>)}
                  </select>
                </label>
              </div>

              <label className="admin-field admin-full-field">
                <span>Product description *</span>
                <textarea rows={6} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
                <small>{draft.description.length} characters · Aim for a clear 2–3 sentence introduction.</small>
              </label>

            </section>
          ) : null}

          {activeStep === "details" ? (
            <section className="admin-form-card" aria-labelledby="media-title">
              <div className="admin-form-heading">
                <span><ImagePlus aria-hidden="true" /></span>
                <div><p>Product details</p><h2 id="media-title">Media &amp; documents</h2><small>Add the visual assets and downloadable files used on the product page.</small></div>
              </div>

              <div className="admin-field-section">
                <div className="admin-section-label"><h3>Product gallery *</h3><p>Upload up to 8 images. The first image becomes the main product image.</p></div>
                <UploadField icon={ImagePlus} title="Upload product images" description="JPG, PNG or WebP · Recommended 1600 × 1200 px" accept="image/*" multiple files={draft.imageNames} onFiles={(files) => updateDraft("imageNames", files)} />
              </div>

              <div className="admin-two-column-fields">
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Product brochure</h3><p>Displayed beside the quote button and in Downloads.</p></div>
                  <UploadField icon={FileText} title="Upload brochure" description="PDF · Maximum 20 MB" accept="application/pdf" files={draft.brochureName ? [draft.brochureName] : []} onFiles={(files) => updateDraft("brochureName", files[0] ?? "")} />
                </div>
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Technical data sheet</h3><p>Optional second document in the Downloads tab.</p></div>
                  <UploadField icon={FileText} title="Upload data sheet" description="PDF · Maximum 20 MB" accept="application/pdf" files={draft.technicalSheetName ? [draft.technicalSheetName] : []} onFiles={(files) => updateDraft("technicalSheetName", files[0] ?? "")} />
                </div>
              </div>

              <div className="admin-field-section admin-video-section">
                <div className="admin-section-label"><h3>Product video</h3><p>Upload the demonstration video shown on the product page.</p></div>
                <UploadField icon={Video} title="Upload product video" description="MP4 or WebM · Maximum 250 MB" accept="video/mp4,video/webm" files={draft.videoFileName ? [draft.videoFileName] : []} onFiles={(files) => updateDraft("videoFileName", files[0] ?? "")} />
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
                  <ListEditor items={draft.applications} onChange={(items) => updateDraft("applications", items)} placeholder="e.g. Dialysis" addLabel="Add application" maxItems={5} />
                </div>
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Typical applications</h3><p>The detailed clinical use list in Overview.</p></div>
                  <ListEditor items={draft.typicalApplications} onChange={(items) => updateDraft("typicalApplications", items)} placeholder="e.g. Outpatient clinics" addLabel="Add typical use" />
                </div>
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Key features</h3><p>Short benefits displayed as feature tiles.</p></div>
                  <ListEditor items={draft.keyFeatures} onChange={(items) => updateDraft("keyFeatures", items)} placeholder="e.g. Electric adjustments" addLabel="Add key feature" />
                </div>
                <div className="admin-field-section">
                  <div className="admin-section-label"><h3>Why choose this product?</h3><p>Reasons that help the customer compare options.</p></div>
                  <ListEditor items={draft.reasons} onChange={(items) => updateDraft("reasons", items)} placeholder="e.g. Easy-to-clean cushions" addLabel="Add reason" />
                </div>
              </div>

              <div className="admin-field-section admin-colors-section">
                <div className="admin-section-label"><h3>Available colors</h3><p>Add the upholstery or finish colors customers can request.</p></div>
                <div className="admin-color-editor">
                  {draft.colors.map((color, index) => (
                    <div className="admin-color-row" key={`${color.name}-${index}`}>
                      <input type="color" aria-label={`Color ${index + 1}`} value={color.value} onChange={(event) => updateDraft("colors", draft.colors.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} />
                      <input aria-label={`Color name ${index + 1}`} value={color.name} placeholder="Color name" onChange={(event) => updateDraft("colors", draft.colors.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} />
                      <span>{color.value}</span>
                      <button type="button" aria-label={`Remove ${color.name}`} onClick={() => updateDraft("colors", draft.colors.filter((_, itemIndex) => itemIndex !== index))}><X aria-hidden="true" /></button>
                    </div>
                  ))}
                  <button className="admin-add-row" type="button" onClick={() => updateDraft("colors", [...draft.colors, { name: "New color", value: "#6d8198" }])}><Plus aria-hidden="true" /> Add color</button>
                </div>
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
                <div className="admin-specification-editor">
                  {draft.specifications.map((specification, index) => (
                    <div className="admin-specification-row" key={`${index}-${specification.label}`}>
                      <GripVertical aria-hidden="true" />
                      <input aria-label={`Specification label ${index + 1}`} value={specification.label} placeholder="Label" onChange={(event) => updateDraft("specifications", draft.specifications.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
                      <input aria-label={`Specification value ${index + 1}`} value={specification.value} placeholder="Value" onChange={(event) => updateDraft("specifications", draft.specifications.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} />
                      <button type="button" aria-label={`Remove ${specification.label}`} onClick={() => updateDraft("specifications", draft.specifications.filter((_, itemIndex) => itemIndex !== index))}><X aria-hidden="true" /></button>
                    </div>
                  ))}
                  <button className="admin-add-row" type="button" onClick={() => updateDraft("specifications", [...draft.specifications, { label: "", value: "" }])}><Plus aria-hidden="true" /> Add specification</button>
                </div>
              </div>

              <div className="admin-field-section">
                <div className="admin-section-label"><h3>Options &amp; accessories</h3><p>List compatible accessories and optional product configurations.</p></div>
                <ListEditor items={draft.accessories} onChange={(items) => updateDraft("accessories", items)} placeholder="e.g. Additional headrest" addLabel="Add accessory" />
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
              <button type="button" disabled={!canSave} onClick={() => onSave(draft, "Published")}><Check aria-hidden="true" /> {product ? "Save changes" : "Add product"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [view, setView] = useState<DashboardView>("products");
  const [categories, setCategories] = useState<DashboardCategory[]>(initialCategories);
  const [products, setProducts] = useState<DashboardProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [newCategory, setNewCategory] = useState("");
  const [editingProduct, setEditingProduct] = useState<DashboardProduct | null | undefined>(undefined);
  const [deleteProduct, setDeleteProduct] = useState<DashboardProduct | null>(null);
  const [toast, setToast] = useState("");

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

  const categoryCount = (category: string) => products.filter((product) => product.category === category).length;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const handleSaveProduct = (draft: ProductDraft, status: ProductStatus) => {
    const slug = draft.slug || slugify(draft.name);
    const nextProduct: DashboardProduct = {
      id: draft.id ?? `${slug}-${Date.now()}`,
      name: draft.name.trim(),
      slug,
      type: products.find((product) => product.id === draft.id)?.type ?? "Healthcare product",
      category: draft.category,
      image: "/images/chair2.png",
      description: draft.description.trim(),
      status,
      updated: "Just now",
    };

    setProducts((current) =>
      draft.id ? current.map((product) => (product.id === draft.id ? nextProduct : product)) : [nextProduct, ...current],
    );
    setEditingProduct(undefined);
    showToast(draft.id ? "Product changes saved locally" : "New product added locally");
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
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank"><ExternalLink aria-hidden="true" /> View website</Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div><p>Woittola Healthcare</p><span>Visual dashboard preview</span></div>
        </header>

        {view === "products" ? (
          <div className="admin-page-content">
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
                        <div><Image src={product.image} alt="" fill sizes="58px" unoptimized /></div>
                        <span><strong>{product.name}</strong><small>{product.type}</small></span>
                      </div>
                      <span className="admin-product-category">{product.category}</span>
                      <span><span className={`admin-status ${product.status.toLowerCase()}`}><span />{product.status}</span></span>
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
        ) : (
          <div className="admin-page-content">
            <div className="admin-category-layout">
              <section className="admin-add-category-card" aria-labelledby="add-category-title">
                <span><FolderPlus aria-hidden="true" /></span>
                <div><p>New category</p><h2 id="add-category-title">Add a category</h2><small>Enter a clear category name. You can assign products to it afterward.</small></div>
                <form onSubmit={(event) => { event.preventDefault(); const name = newCategory.trim(); if (!name) return; if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) { showToast("That category already exists"); return; } setCategories((current) => [...current, { id: `${slugify(name)}-${Date.now()}`, name }]); setNewCategory(""); showToast("Category added locally"); }}>
                  <label><span>Category name</span><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="e.g. Examination Lights" autoFocus /></label>
                  <button type="submit" disabled={!newCategory.trim()}><Plus aria-hidden="true" /> Add category</button>
                </form>
                <div className="admin-category-note"><Info aria-hidden="true" /><p>Later, this will save directly to Supabase and appear automatically in the product form and website navigation.</p></div>
              </section>

              <section className="admin-category-list-card" aria-labelledby="category-list-title">
                <div><h2 id="category-list-title">Existing categories</h2><p>{categories.length} categories</p></div>
                <div className="admin-category-list">
                  {categories.map((category) => {
                    const count = categoryCount(category.name);
                    return (
                      <article key={category.id}>
                        <span className="admin-category-icon"><LayoutGrid aria-hidden="true" /></span>
                        <div><strong>{category.name}</strong><small>{count} product{count === 1 ? "" : "s"}</small></div>
                        <button type="button" aria-label={`Edit ${category.name}`} onClick={() => showToast("Category editing will connect to the database later")}><Pencil aria-hidden="true" /></button>
                        <button className="danger" type="button" disabled={count > 0} title={count > 0 ? "Move or delete products before deleting this category" : "Delete category"} aria-label={`Delete ${category.name}`} onClick={() => { setCategories((current) => current.filter((item) => item.id !== category.id)); showToast("Category deleted locally"); }}><Trash2 aria-hidden="true" /></button>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {deleteProduct ? (
        <div className="admin-modal-overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) setDeleteProduct(null); }}>
          <section className="admin-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-product-title">
            <span><AlertTriangle aria-hidden="true" /></span>
            <h2 id="delete-product-title">Delete {deleteProduct.name}?</h2>
            <p>This removes the product from this dashboard preview. When the database is connected, this action will require confirmation and remove it from the website.</p>
            <div><button type="button" onClick={() => setDeleteProduct(null)}>Cancel</button><button type="button" onClick={() => { setProducts((current) => current.filter((product) => product.id !== deleteProduct.id)); setDeleteProduct(null); showToast("Product deleted locally"); }}><Trash2 aria-hidden="true" /> Delete product</button></div>
          </section>
        </div>
      ) : null}

      {toast ? <div className="admin-toast"><CircleCheck aria-hidden="true" /> {toast}</div> : null}
    </main>
  );
}
