"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  BadgeCheck,
  Check,
  ClipboardCheck,
  Download,
  FileText,
  HandHeart,
  Headphones,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const tabs = ["Overview", "Specifications", "Options & Accessories", "Downloads"] as const;
type TabName = (typeof tabs)[number];

const typicalApplications = [
  "Dialysis units",
  "Infusion therapy",
  "Chemotherapy departments",
  "Blood donation and collection centers",
  "Outpatient clinics and day surgery",
  "General treatment rooms",
];

const keyFeatures = [
  { label: "Ergonomic Design", icon: UsersRound },
  { label: "Electric Adjustments", icon: Activity },
  { label: "Easy to Clean Upholstery", icon: Sparkles },
  { label: "Patient Safety & Comfort", icon: ShieldCheck },
  { label: "High Weight Capacity", icon: BadgeCheck },
];

const colors = [
  ["Ocean", "#2d6497"],
  ["Graphite", "#59606a"],
  ["Taupe", "#8a8174"],
  ["Purple", "#61488b"],
  ["Berry", "#813d56"],
  ["Aqua", "#75afb4"],
] as const;

const supportItems = [
  {
    title: "Expert Support",
    description: "Personal advice from our specialists.",
    icon: Headphones,
  },
  {
    title: "Fast Response",
    description: "We reply quickly to your inquiry.",
    icon: HandHeart,
  },
  {
    title: "Tailored Quote",
    description: "You’ll receive a proposal made for you.",
    icon: ClipboardCheck,
  },
];

const specifications = [
  ["Adjustment", "Fully electric positioning"],
  ["Positions", "Sitting, reclining and Trendelenburg"],
  ["Upholstery", "Medical-grade, removable and easy to clean"],
  ["Safety", "Lockable castors and integrated patient support"],
  ["Accessories", "Integrated mounting points and IV pole"],
  ["Certification", "CE marked medical device"],
];

const accessories = [
  "Height-adjustable IV pole",
  "Removable side supports",
  "Paper roll holder",
  "Additional headrest",
  "Protective upholstery cover",
  "Accessory mounting rail",
];

type ProductInformationProps = {
  productName: string;
};

export default function ProductInformation({ productName }: ProductInformationProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Overview");

  return (
    <section className="product-information-section" aria-label="Product information">
      <div className="product-information-tabs" role="tablist" aria-label="Product details">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="product-tab-panel"
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </button>
        ))}
      </div>

      <div id="product-tab-panel" className="product-tab-panel" role="tabpanel">
        {activeTab === "Overview" ? (
          <div className="product-overview-grid">
            <article className="product-overview-card product-applications-card">
              <h2>Typical Applications</h2>
              <p>The {productName} is suitable for a wide range of clinical applications:</p>
              <ul className="product-check-list green-checks">
                {typicalApplications.map((application) => (
                  <li key={application}>
                    <Check aria-hidden="true" /> {application}
                  </li>
                ))}
              </ul>

              <div className="product-key-features">
                <h3>Key Features</h3>
                <div className="product-key-feature-grid">
                  {keyFeatures.map(({ label, icon: Icon }) => (
                    <div className="product-key-feature" key={label}>
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <div className="product-overview-stack">
              <article className="product-overview-card product-why-card">
                <h2>Why Choose {productName}?</h2>
                <ul className="product-check-list">
                  <li><Check aria-hidden="true" /> Fully electric adjustments for optimal positioning</li>
                  <li><Check aria-hidden="true" /> Wide range of positions: sitting, reclining, Trendelenburg</li>
                  <li><Check aria-hidden="true" /> Comfortable upholstery with high durability</li>
                  <li><Check aria-hidden="true" /> Removable and easy-to-clean cushions</li>
                  <li><Check aria-hidden="true" /> Integrated accessories and IV pole</li>
                  <li><Check aria-hidden="true" /> CE marked medical device</li>
                </ul>
              </article>

              <article className="product-overview-card product-colors-card">
                <h2>Available Colors</h2>
                <div className="product-color-grid">
                  {colors.map(([name, color]) => (
                    <div className="product-color" key={name}>
                      <span style={{ backgroundColor: color }} aria-hidden="true" />
                      <strong>{name}</strong>
                    </div>
                  ))}
                </div>
                <p>More colors available on request.</p>
              </article>
            </div>
          </div>
        ) : null}

        {activeTab === "Specifications" ? (
          <article className="product-secondary-tab-card">
            <div className="product-secondary-tab-heading">
              <Activity aria-hidden="true" />
              <div>
                <h2>Technical Specifications</h2>
                <p>Core performance and construction details for {productName}.</p>
              </div>
            </div>
            <dl className="product-specification-list">
              {specifications.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ) : null}

        {activeTab === "Options & Accessories" ? (
          <article className="product-secondary-tab-card">
            <div className="product-secondary-tab-heading">
              <BadgeCheck aria-hidden="true" />
              <div>
                <h2>Options & Accessories</h2>
                <p>Configure {productName} for your department and workflow.</p>
              </div>
            </div>
            <div className="product-accessory-grid">
              {accessories.map((accessory) => (
                <div key={accessory}>
                  <Check aria-hidden="true" />
                  <span>{accessory}</span>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {activeTab === "Downloads" ? (
          <article className="product-secondary-tab-card">
            <div className="product-secondary-tab-heading">
              <Download aria-hidden="true" />
              <div>
                <h2>Product Downloads</h2>
                <p>Reference documents for {productName}.</p>
              </div>
            </div>
            <div className="product-download-list">
              <a href="#product-tab-panel">
                <FileText aria-hidden="true" />
                <span><strong>Product brochure</strong><small>PDF document</small></span>
                <Download aria-hidden="true" />
              </a>
              <a href="#product-tab-panel">
                <FileText aria-hidden="true" />
                <span><strong>Technical data sheet</strong><small>PDF document</small></span>
                <Download aria-hidden="true" />
              </a>
            </div>
          </article>
        ) : null}
      </div>

      <div className="product-help-banner">
        <div className="product-help-intro">
          <h2>Need help finding the right solution?</h2>
          <p>Our team is ready to help you choose the best product for your needs.</p>
          <Link href="mailto:contact@woittola.com">Contact us</Link>
        </div>
        <div className="product-help-items">
          {supportItems.map(({ title, description, icon: Icon }) => (
            <div className="product-help-item" key={title}>
              <Icon aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
