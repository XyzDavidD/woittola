"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Droplets,
  HandHeart,
  Headphones,
  HeartPulse,
  ImageOff,
  PackageOpen,
  SlidersHorizontal,
  Stethoscope,
  Syringe,
  Truck,
} from "lucide-react";
import type { PublicProduct } from "@/lib/catalogue/types";
import type { DeepTranslated, Locale, Messages } from "../locales";
import { interpolate } from "../locales";

const applicationIcons = {
  dialysis: Droplets,
  infusion: Syringe,
  "infusion therapy": Syringe,
  chemotherapy: Activity,
  chemo: Activity,
  "blood collection": HeartPulse,
  procedure: HandHeart,
  outpatient: ClipboardCheck,
} as const;

type FilterGroupProps = {
  title: string;
  allLabel: string;
  total: number;
  options: Array<{ value: string; label: string; count: number }>;
  selected: string[];
  onChange: (value: string) => void;
  onAll: () => void;
};

function FilterGroup({ title, allLabel, total, options, selected, onChange, onAll }: FilterGroupProps) {
  if (!options.length) return null;

  return (
    <fieldset className="catalogue-filter-group">
      <legend>{title}</legend>
      <label className="catalogue-checkbox-row">
        <input type="checkbox" checked={selected.length === 0} onChange={onAll} />
        <span className="catalogue-checkmark" aria-hidden="true" />
        <span>{allLabel} ({total})</span>
      </label>
      {options.map(({ value, label, count }) => (
        <label className="catalogue-checkbox-row" key={value}>
          <input type="checkbox" checked={selected.includes(value)} onChange={() => onChange(value)} />
          <span className="catalogue-checkmark" aria-hidden="true" />
          <span>{label} ({count})</span>
        </label>
      ))}
    </fieldset>
  );
}

function countValues(values: Array<{ value: string; label: string }>, locale: Locale) {
  const counts = new Map<string, { label: string; count: number }>();
  values.filter(({ value }) => Boolean(value)).forEach(({ value, label }) => {
    const current = counts.get(value);
    counts.set(value, { label: label || value, count: (current?.count ?? 0) + 1 });
  });
  return [...counts.entries()]
    .map(([value, item]) => ({ value, ...item }))
    .sort((first, second) => first.label.localeCompare(second.label, locale));
}

type ProductCatalogueProps = {
  categoryName: string;
  products: PublicProduct[];
  locale: Locale;
  ui: DeepTranslated<Messages>["catalogue"];
};

export default function ProductCatalogue({ categoryName, products, locale, ui }: ProductCatalogueProps) {
  const [applications, setApplications] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [sort, setSort] = useState("recommended");
  const [visibleCount, setVisibleCount] = useState(6);

  const filterOptions = useMemo(() => ({
    applications: countValues(products.flatMap((product) => product.applications.map((value, index) => ({ value, label: product.translation.applicationLabels[index] || value }))), locale),
    productTypes: countValues(products.map((product) => ({ value: product.productType, label: product.translation.productTypeLabel || product.productType })), locale),
    brands: countValues(products.map((product) => ({ value: product.brand, label: product.brand })), locale),
  }), [locale, products]);

  const toggleFilter = (value: string, selected: string[], update: (values: string[]) => void) => {
    update(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    setVisibleCount(6);
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesApplication = applications.length === 0 || applications.some((value) => product.applications.includes(value));
      const matchesType = productTypes.length === 0 || productTypes.includes(product.productType);
      const matchesBrand = brands.length === 0 || brands.includes(product.brand);
      return matchesApplication && matchesType && matchesBrand;
    });

    if (sort === "name-asc") return [...filtered].sort((a, b) => a.translation.name.localeCompare(b.translation.name, locale));
    if (sort === "name-desc") return [...filtered].sort((a, b) => b.translation.name.localeCompare(a.translation.name, locale));
    return filtered;
  }, [applications, brands, locale, productTypes, products, sort]);

  const supportIcons = [Headphones, HandHeart, Truck, ClipboardCheck];

  const resetFilters = () => {
    setApplications([]);
    setProductTypes([]);
    setBrands([]);
    setVisibleCount(6);
  };

  return (
    <section className="catalogue-products-section" aria-label={`${categoryName} ${ui.category.toLowerCase()}`}>
      {products.length ? (
        <div className="catalogue-layout">
          <aside className="catalogue-filter-card" aria-label={ui.filterProductsAria}>
            <div className="catalogue-filter-heading">
              <h2>{ui.filterProducts}</h2>
              <button type="button" onClick={resetFilters}>{ui.clearAll}</button>
            </div>

            <FilterGroup title={ui.application} allLabel={ui.allApplications} total={products.length} options={filterOptions.applications} selected={applications} onAll={() => setApplications([])} onChange={(value) => toggleFilter(value, applications, setApplications)} />
            <FilterGroup title={ui.productType} allLabel={ui.allTypes} total={products.length} options={filterOptions.productTypes} selected={productTypes} onAll={() => setProductTypes([])} onChange={(value) => toggleFilter(value, productTypes, setProductTypes)} />
            <FilterGroup title={ui.brand} allLabel={ui.allBrands} total={products.length} options={filterOptions.brands} selected={brands} onAll={() => setBrands([])} onChange={(value) => toggleFilter(value, brands, setBrands)} />

            <button className="catalogue-reset-button" type="button" onClick={resetFilters}>{ui.resetFilters}</button>
          </aside>

          <div className="catalogue-results">
            <div className="catalogue-results-toolbar">
              <p>{interpolate(filteredProducts.length === 1 ? ui.productFound : ui.productsFound, { count: filteredProducts.length })}</p>
              <label className="catalogue-sort">
                <span>{ui.sortBy}</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="recommended">{ui.recommended}</option>
                  <option value="name-asc">{ui.nameAsc}</option>
                  <option value="name-desc">{ui.nameDesc}</option>
                </select>
                <ChevronDown aria-hidden="true" />
              </label>
            </div>

            {filteredProducts.length ? (
              <div className="catalogue-product-grid">
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <article className="catalogue-product-card" key={product.id}>
                    <div className="catalogue-product-media">
                      {product.featured ? <span className="catalogue-bestseller">{ui.featured}</span> : null}
                      {product.primaryImageUrl ? (
                        <Image src={product.primaryImageUrl} alt={`${product.translation.name} ${product.productType}`} fill sizes="(min-width: 1100px) 300px, (min-width: 700px) 45vw, 90vw" unoptimized />
                      ) : (
                        <span className="catalogue-image-placeholder"><ImageOff aria-hidden="true" /> {ui.imageSoon}</span>
                      )}
                    </div>
                    <div className="catalogue-product-content">
                      <h3>{product.translation.name}</h3>
                      {product.translation.productTypeLabel || product.productType ? <p>{product.translation.productTypeLabel || product.productType}</p> : null}
                      {product.applications.length ? <div className="catalogue-applications" aria-label={ui.applications}>
                        {product.applications.map((application, index) => {
                          const Icon = applicationIcons[application.toLowerCase() as keyof typeof applicationIcons] ?? Stethoscope;
                          const label = product.translation.applicationLabels[index] || application;
                          return <span key={application}><span className="catalogue-application-icon"><Icon aria-hidden="true" /></span>{label}</span>;
                        })}
                      </div> : null}
                      <Link href={`/products/${product.slug}`}>{ui.viewProduct} <ArrowRight aria-hidden="true" /></Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="catalogue-empty-state">
                <SlidersHorizontal aria-hidden="true" />
                <h3>{ui.noMatches}</h3>
                <p>{ui.removeFilter}</p>
                <button type="button" onClick={resetFilters}>{ui.resetFilters}</button>
              </div>
            )}

            {visibleCount < filteredProducts.length ? (
              <button className="catalogue-load-more" type="button" onClick={() => setVisibleCount((count) => count + 6)}>
                {ui.loadMore} <ChevronDown aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="catalogue-category-empty">
          <PackageOpen aria-hidden="true" />
          <span>{ui.preparing}</span>
          <h2>{interpolate(ui.comingSoon, { category: categoryName })}</h2>
          <p>{ui.preparingCopy}</p>
          <Link href="/contact#contact-form">{ui.contactSupport} <ArrowRight aria-hidden="true" /></Link>
        </div>
      )}

      <div className="catalogue-support-strip">
        {ui.supportItems.map(({ title, copy }, index) => {
          const Icon = supportIcons[index];
          return <div className="catalogue-support-item" key={title}><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{copy}</p></div></div>;
        })}
      </div>
    </section>
  );
}
