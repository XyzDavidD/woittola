"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { PublicCategory } from "@/lib/catalogue/types";
import type { DeepTranslated, Messages } from "../locales";

type AllProductsCatalogueProps = {
  categories: PublicCategory[];
  ui: DeepTranslated<Messages>["catalogue"];
};

export default function AllProductsCatalogue({ categories, ui }: AllProductsCatalogueProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const visibleCategories = selectedCategories.length
    ? categories.filter((category) => selectedCategories.includes(category.slug))
    : categories;

  const toggleCategory = (slug: string) => {
    setSelectedCategories((selected) =>
      selected.includes(slug)
        ? selected.filter((categorySlug) => categorySlug !== slug)
        : [...selected, slug],
    );
  };

  return (
    <section className="catalogue-products-section all-products-section" aria-label={ui.allCategoriesAria}>
      <div className="catalogue-layout all-products-layout">
        <aside className="catalogue-filter-card all-products-filter" aria-label={ui.filterAria}>
          <div className="catalogue-filter-heading">
            <h2>{ui.filterProducts}</h2>
            <button type="button" onClick={() => setSelectedCategories([])}>
              {ui.clearAll}
            </button>
          </div>

          <fieldset className="catalogue-filter-group">
            <legend>{ui.category}</legend>
            <label className="catalogue-checkbox-row">
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => setSelectedCategories([])}
              />
              <span className="catalogue-checkmark" aria-hidden="true" />
              <span>{ui.allCategories}</span>
            </label>
            {categories.map((category) => (
              <label className="catalogue-checkbox-row" key={category.slug}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.slug)}
                  onChange={() => toggleCategory(category.slug)}
                />
                <span className="catalogue-checkmark" aria-hidden="true" />
                <span>
                  {category.translation.name} ({category.products.length})
                </span>
              </label>
            ))}
          </fieldset>

          <button
            className="catalogue-reset-button"
            type="button"
            onClick={() => setSelectedCategories([])}
          >
            {ui.resetFilter}
          </button>
        </aside>

        <div className="all-products-results">
          {visibleCategories.map((category) => (
            <section className="product-category-group" key={category.slug} aria-labelledby={`${category.slug}-title`}>
              <div className="product-category-heading">
                <div>
                  <h2 id={`${category.slug}-title`}>{category.translation.name}</h2>
                  <p>{category.translation.heroDescription}</p>
                </div>
                <Link href={`/catalogue/${category.slug}`}>
                  <span>
                    {ui.seeAll} <span className="category-button-label">{ui.fromCategory}</span>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>

              {category.products.length ? (
                <div className="catalogue-product-grid">
                {category.products.slice(0, 3).map((product) => (
                  <article className="catalogue-product-card" key={product.slug}>
                    <div className={`catalogue-product-media overview-product-media overview-product-media-${category.slug}`}>
                      {product.featured ? <span className="catalogue-bestseller">{ui.featured}</span> : null}
                      {product.primaryImageUrl ? <Image src={product.primaryImageUrl} alt={`${product.translation.name} ${product.translation.productTypeLabel || product.productType}`} fill sizes="(min-width: 1100px) 300px, (min-width: 700px) 45vw, 90vw" unoptimized /> : <span className="catalogue-overview-image-empty">{ui.imageSoon}</span>}
                    </div>
                    <div className="catalogue-product-content overview-product-content">
                      <h3>{product.translation.name}</h3>
                      {product.translation.productTypeLabel || product.productType ? <p>{product.translation.productTypeLabel || product.productType}</p> : null}
                      {product.applications.length ? <div className="overview-product-tags" aria-label={ui.applications}>
                        {product.applications.map((application, index) => (
                          <span key={application}>{product.translation.applicationLabels[index] || application}</span>
                        ))}
                      </div> : null}
                      <Link href={`/products/${product.slug}`}>
                        {ui.viewProduct} <ArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
                </div>
              ) : (
                <div className="product-category-empty">
                  <p>{ui.noCategoryProducts}</p>
                  <Link href={`/catalogue/${category.slug}`}>{ui.viewCategory} <ArrowRight aria-hidden="true" /></Link>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
