"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { productCategories } from "../data/catalogue";

export default function AllProductsCatalogue() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const visibleCategories = selectedCategories.length
    ? productCategories.filter((category) => selectedCategories.includes(category.slug))
    : productCategories;

  const toggleCategory = (slug: string) => {
    setSelectedCategories((selected) =>
      selected.includes(slug)
        ? selected.filter((categorySlug) => categorySlug !== slug)
        : [...selected, slug],
    );
  };

  return (
    <section className="catalogue-products-section all-products-section" aria-label="All product categories">
      <div className="catalogue-layout all-products-layout">
        <aside className="catalogue-filter-card all-products-filter" aria-label="Filter products by category">
          <div className="catalogue-filter-heading">
            <h2>Filter products</h2>
            <button type="button" onClick={() => setSelectedCategories([])}>
              Clear all
            </button>
          </div>

          <fieldset className="catalogue-filter-group">
            <legend>Category</legend>
            <label className="catalogue-checkbox-row">
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => setSelectedCategories([])}
              />
              <span className="catalogue-checkmark" aria-hidden="true" />
              <span>All Categories</span>
            </label>
            {productCategories.map((category) => (
              <label className="catalogue-checkbox-row" key={category.slug}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.slug)}
                  onChange={() => toggleCategory(category.slug)}
                />
                <span className="catalogue-checkmark" aria-hidden="true" />
                <span>
                  {category.name} ({category.productCount})
                </span>
              </label>
            ))}
          </fieldset>

          <button
            className="catalogue-reset-button"
            type="button"
            onClick={() => setSelectedCategories([])}
          >
            Reset filter
          </button>
        </aside>

        <div className="all-products-results">
          {visibleCategories.map((category) => (
            <section className="product-category-group" key={category.slug} aria-labelledby={`${category.slug}-title`}>
              <div className="product-category-heading">
                <div>
                  <h2 id={`${category.slug}-title`}>{category.name}</h2>
                  <p>{category.description}</p>
                </div>
                <Link href="/catalogue/treatment-chairs">
                  <span>
                    See all products <span className="category-button-label">from this category</span>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>

              <div className="catalogue-product-grid">
                {category.products.slice(0, 3).map((product, index) => (
                  <article className="catalogue-product-card" key={product.slug}>
                    <div className={`catalogue-product-media overview-product-media overview-product-media-${category.slug}`}>
                      {category.slug === "treatment-chairs" && index === 0 ? (
                        <span className="catalogue-bestseller">Bestseller</span>
                      ) : null}
                      <Image
                        src={product.image}
                        alt={`${product.name} ${product.type}`}
                        fill
                        sizes="(min-width: 1100px) 300px, (min-width: 700px) 45vw, 90vw"
                        unoptimized
                      />
                    </div>
                    <div className="catalogue-product-content overview-product-content">
                      <h3>{product.name}</h3>
                      <p>{product.type}</p>
                      <div className="overview-product-tags" aria-label="Applications">
                        {product.applications.map((application) => (
                          <span key={application}>{application}</span>
                        ))}
                      </div>
                      <Link href={`/products/${product.slug}`}>
                        View product <ArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
