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
  SlidersHorizontal,
  Syringe,
  Truck,
} from "lucide-react";

const applicationFilters = [
  ["Dialysis", 10],
  ["Infusion Therapy", 12],
  ["Chemotherapy", 9],
  ["Blood Collection", 7],
  ["Procedure / Outpatient", 13],
] as const;

const typeFilters = [
  ["Electric", 18],
  ["Hydraulic", 6],
] as const;

const brandFilters = [
  ["Greiner", 24],
  ["Other", 0],
] as const;

const productTemplates = [
  {
    name: "MedSeat Pro",
    type: "Treatment Chair",
    applications: ["Dialysis", "Infusion", "Chemo", "Blood Collection"],
    filterApplications: ["Dialysis", "Infusion Therapy", "Chemotherapy", "Blood Collection"],
    featured: true,
  },
  {
    name: "MedSeat Classic",
    type: "Infusion Chair",
    applications: ["Infusion", "Chemo", "Procedure"],
    filterApplications: ["Infusion Therapy", "Chemotherapy", "Procedure / Outpatient"],
  },
  {
    name: "Relax 3",
    type: "Dialysis Chair",
    applications: ["Dialysis", "Infusion", "Chemo"],
    filterApplications: ["Dialysis", "Infusion Therapy", "Chemotherapy"],
  },
  {
    name: "Comfort Plus",
    type: "Chemotherapy Chair",
    applications: ["Chemo", "Infusion"],
    filterApplications: ["Chemotherapy", "Infusion Therapy"],
  },
  {
    name: "BloodLine",
    type: "Blood Collection Chair",
    applications: ["Blood Collection", "Procedure"],
    filterApplications: ["Blood Collection", "Procedure / Outpatient"],
  },
  {
    name: "MedSeat AC+",
    type: "Procedure Chair",
    applications: ["Procedure", "Outpatient"],
    filterApplications: ["Procedure / Outpatient"],
  },
] as const;

const products = Array.from({ length: 24 }, (_, index) => {
  const template = productTemplates[index % productTemplates.length];
  const edition = Math.floor(index / productTemplates.length);

  return {
    ...template,
    id: `${template.name}-${index}`,
    name: edition === 0 ? template.name : `${template.name} ${edition + 1}`,
    slug: `${template.name.toLowerCase().replaceAll(" ", "-").replaceAll("+", "plus")}-${index + 1}`,
    chairType: index % 4 === 3 ? "Hydraulic" : "Electric",
    brand: "Greiner",
  };
});

const applicationIcons = {
  Dialysis: Droplets,
  Infusion: Syringe,
  Chemo: Activity,
  "Blood Collection": HeartPulse,
  Procedure: HandHeart,
  Outpatient: ClipboardCheck,
} as const;

const supportItems = [
  {
    title: "Expert Product Support",
    description: "We help you find the right solution.",
    icon: Headphones,
  },
  {
    title: "Tailored Solutions",
    description: "Products for every healthcare need.",
    icon: HandHeart,
  },
  {
    title: "Reliable & Fast Delivery",
    description: "From our European partners.",
    icon: Truck,
  },
  {
    title: "Request a Quote",
    description: "We’ll prepare a proposal for you.",
    icon: ClipboardCheck,
  },
];

type FilterGroupProps = {
  title: string;
  allLabel: string;
  options: readonly (readonly [string, number])[];
  selected: string[];
  onChange: (value: string) => void;
  onAll: () => void;
};

function FilterGroup({
  title,
  allLabel,
  options,
  selected,
  onChange,
  onAll,
}: FilterGroupProps) {
  return (
    <fieldset className="catalogue-filter-group">
      <legend>{title}</legend>
      <label className="catalogue-checkbox-row">
        <input type="checkbox" checked={selected.length === 0} onChange={onAll} />
        <span className="catalogue-checkmark" aria-hidden="true" />
        <span>{allLabel} (24)</span>
      </label>
      {options.map(([label, count]) => (
        <label className="catalogue-checkbox-row" key={label}>
          <input
            type="checkbox"
            checked={selected.includes(label)}
            onChange={() => onChange(label)}
          />
          <span className="catalogue-checkmark" aria-hidden="true" />
          <span>
            {label} ({count})
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export default function ProductCatalogue() {
  const [applications, setApplications] = useState<string[]>([]);
  const [chairTypes, setChairTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [sort, setSort] = useState("recommended");
  const [visibleCount, setVisibleCount] = useState(6);

  const toggleFilter = (
    value: string,
    selected: string[],
    update: (values: string[]) => void,
  ) => {
    update(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    setVisibleCount(6);
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesApplication =
        applications.length === 0 ||
        applications.some((application) => product.filterApplications.includes(application as never));
      const matchesType = chairTypes.length === 0 || chairTypes.includes(product.chairType);
      const matchesBrand = brands.length === 0 || brands.includes(product.brand);

      return matchesApplication && matchesType && matchesBrand;
    });

    if (sort === "name-asc") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === "name-desc") {
      return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    }

    return filtered;
  }, [applications, brands, chairTypes, sort]);

  const resetFilters = () => {
    setApplications([]);
    setChairTypes([]);
    setBrands([]);
    setVisibleCount(6);
  };

  return (
    <section className="catalogue-products-section" aria-label="Treatment chair catalogue">
      <div className="catalogue-layout">
        <aside className="catalogue-filter-card" aria-label="Filter products">
          <div className="catalogue-filter-heading">
            <h2>Filter products</h2>
            <button type="button" onClick={resetFilters}>
              Clear all
            </button>
          </div>

          <FilterGroup
            title="Application"
            allLabel="All Applications"
            options={applicationFilters}
            selected={applications}
            onAll={() => {
              setApplications([]);
              setVisibleCount(6);
            }}
            onChange={(value) => toggleFilter(value, applications, setApplications)}
          />
          <FilterGroup
            title="Chair type"
            allLabel="All Types"
            options={typeFilters}
            selected={chairTypes}
            onAll={() => {
              setChairTypes([]);
              setVisibleCount(6);
            }}
            onChange={(value) => toggleFilter(value, chairTypes, setChairTypes)}
          />
          <FilterGroup
            title="Brand"
            allLabel="All Brands"
            options={brandFilters}
            selected={brands}
            onAll={() => {
              setBrands([]);
              setVisibleCount(6);
            }}
            onChange={(value) => toggleFilter(value, brands, setBrands)}
          />

          <button className="catalogue-reset-button" type="button" onClick={resetFilters}>
            Reset filters
          </button>
        </aside>

        <div className="catalogue-results">
          <div className="catalogue-results-toolbar">
            <p>{filteredProducts.length} products found</p>
            <label className="catalogue-sort">
              <span>Sort by:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="name-asc">Name: A–Z</option>
                <option value="name-desc">Name: Z–A</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="catalogue-product-grid">
              {filteredProducts.slice(0, visibleCount).map((product, index) => (
                <article className="catalogue-product-card" key={product.id}>
                  <div className="catalogue-product-media">
                    {index === 0 && visibleCount === 6 && applications.length === 0 ? (
                      <span className="catalogue-bestseller">Bestseller</span>
                    ) : null}
                    <Image
                      src="/images/chair2.png"
                      alt={`${product.name} ${product.type}`}
                      fill
                      sizes="(min-width: 1100px) 300px, (min-width: 700px) 45vw, 90vw"
                      unoptimized
                    />
                  </div>
                  <div className="catalogue-product-content">
                    <h3>{product.name}</h3>
                    <p>{product.type}</p>
                    <div className="catalogue-applications" aria-label="Applications">
                      {product.applications.map((application) => {
                        const Icon = applicationIcons[application];
                        return (
                          <span key={application}>
                            <span className="catalogue-application-icon">
                              <Icon aria-hidden="true" />
                            </span>
                            {application}
                          </span>
                        );
                      })}
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      View product <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalogue-empty-state">
              <SlidersHorizontal aria-hidden="true" />
              <h3>No products match these filters</h3>
              <p>Try removing a filter to see more treatment chairs.</p>
              <button type="button" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          )}

          {visibleCount < filteredProducts.length ? (
            <button
              className="catalogue-load-more"
              type="button"
              onClick={() => setVisibleCount((count) => count + 6)}
            >
              Load more products <ChevronDown aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="catalogue-support-strip">
        {supportItems.map(({ title, description, icon: Icon }) => (
          <div className="catalogue-support-item" key={title}>
            <Icon aria-hidden="true" />
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
