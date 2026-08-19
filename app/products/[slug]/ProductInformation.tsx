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
import type { ProductTranslation } from "@/lib/catalogue/types";
import { CONTACT_EMAIL_HREF } from "@/lib/site";
import type { DeepTranslated, Messages } from "../../locales";
import { interpolate } from "../../locales";

const tabs = ["overview", "specifications", "accessories", "downloads"] as const;
type TabName = (typeof tabs)[number];

const featureIcons = [UsersRound, Activity, Sparkles, ShieldCheck, BadgeCheck];

type ProductInformationProps = {
  productName: string;
  content: ProductTranslation;
  brochureUrl: string;
  technicalSheetUrl: string;
  colorChartUrl: string;
  ui: DeepTranslated<Messages>["product"];
};

export default function ProductInformation({ productName, content, brochureUrl, technicalSheetUrl, colorChartUrl, ui }: ProductInformationProps) {
  const [activeTab, setActiveTab] = useState<TabName>("overview");
  const hasOverview = Boolean(content.typicalApplications.length || content.keyFeatures.length || content.reasons.length || content.colors.length);
  const availableTabs = tabs.filter((tab) => {
    if (tab === "overview") return hasOverview;
    if (tab === "specifications") return content.specifications.length > 0;
    if (tab === "accessories") return content.accessories.length > 0;
    if (tab === "downloads") return Boolean(brochureUrl || technicalSheetUrl || colorChartUrl);
    return true;
  });
  const displayedTab = availableTabs.includes(activeTab) ? activeTab : availableTabs[0];

  if (!displayedTab) return null;

  return (
    <section className="product-information-section" aria-label={ui.informationAria}>
      <div className="product-information-tabs" role="tablist" aria-label={ui.detailsAria}>
        {availableTabs.map((tab) => (
          <button className={displayedTab === tab ? "active" : ""} type="button" role="tab" aria-selected={displayedTab === tab} aria-controls="product-tab-panel" onClick={() => setActiveTab(tab)} key={tab}>{ui.tabs[tab]}</button>
        ))}
      </div>

      <div id="product-tab-panel" className="product-tab-panel" role="tabpanel">
        {displayedTab === "overview" ? (
          <div className="product-overview-grid">
            {content.typicalApplications.length || content.keyFeatures.length ? <article className="product-overview-card product-applications-card">
              {content.typicalApplications.length ? <><h2>{ui.typicalApplications}</h2><p>{ui.suitablePrefix} {productName} {ui.suitableSuffix}</p><ul className="product-check-list green-checks">
                {content.typicalApplications.map((application) => <li key={application}><Check aria-hidden="true" /> {application}</li>)}
              </ul></> : null}
              {content.keyFeatures.length ? <div className="product-key-features">
                <h3>{ui.keyFeatures}</h3>
                <div className="product-key-feature-grid">
                  {content.keyFeatures.map((label, index) => {
                    const Icon = featureIcons[index % featureIcons.length];
                    return <div className="product-key-feature" key={label}><Icon aria-hidden="true" /><span>{label}</span></div>;
                  })}
                </div>
              </div> : null}
            </article> : null}

            <div className="product-overview-stack">
              {content.reasons.length ? <article className="product-overview-card product-why-card">
                <h2>{interpolate(ui.whyChoose, { product: productName })}</h2>
                <ul className="product-check-list">{content.reasons.map((reason) => <li key={reason}><Check aria-hidden="true" /> {reason}</li>)}</ul>
              </article> : null}

              {content.colors.length ? <article className="product-overview-card product-colors-card">
                <h2>{ui.availableColors}</h2>
                <div className="product-color-grid">{content.colors.map((color) => <div className="product-color" key={color.name}><span style={{ backgroundColor: color.value }} aria-hidden="true" /><strong>{color.name}</strong></div>)}</div>
                <p>{ui.moreColors}</p>
              </article> : null}
            </div>
          </div>
        ) : null}

        {displayedTab === "specifications" ? <article className="product-secondary-tab-card">
          <div className="product-secondary-tab-heading"><Activity aria-hidden="true" /><div><h2>{ui.technicalSpecifications}</h2><p>{interpolate(ui.technicalCopy, { product: productName })}</p></div></div>
          <dl className="product-specification-list">{content.specifications.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        </article> : null}

        {displayedTab === "accessories" ? <article className="product-secondary-tab-card">
          <div className="product-secondary-tab-heading"><BadgeCheck aria-hidden="true" /><div><h2>{ui.optionsAccessories}</h2><p>{interpolate(ui.optionsCopy, { product: productName })}</p></div></div>
          <div className="product-accessory-grid">{content.accessories.map((accessory) => <div key={accessory}><Check aria-hidden="true" /><span>{accessory}</span></div>)}</div>
        </article> : null}

        {displayedTab === "downloads" ? <article className="product-secondary-tab-card">
          <div className="product-secondary-tab-heading"><Download aria-hidden="true" /><div><h2>{ui.productDownloads}</h2><p>{interpolate(ui.downloadsCopy, { product: productName })}</p></div></div>
          <div className="product-download-list">
            {brochureUrl ? <a href={brochureUrl} target="_blank" rel="noreferrer"><FileText aria-hidden="true" /><span><strong>{ui.brochure}</strong><small>{ui.pdf}</small></span><Download aria-hidden="true" /></a> : null}
            {technicalSheetUrl ? <a href={technicalSheetUrl} target="_blank" rel="noreferrer"><FileText aria-hidden="true" /><span><strong>{ui.technicalSheet}</strong><small>{ui.pdf}</small></span><Download aria-hidden="true" /></a> : null}
            {colorChartUrl ? <a href={colorChartUrl} target="_blank" rel="noreferrer"><FileText aria-hidden="true" /><span><strong>{ui.colorChart}</strong><small>{ui.pdf}</small></span><Download aria-hidden="true" /></a> : null}
          </div>
        </article> : null}
      </div>

      <div className="product-help-banner">
        <div className="product-help-intro"><h2>{ui.helpTitle}</h2><p>{ui.helpCopy}</p><Link href={CONTACT_EMAIL_HREF}>{ui.contactUs}</Link></div>
        <div className="product-help-items">{ui.supportItems.map(({ title, copy }, index) => {
          const Icon = [Headphones, HandHeart, ClipboardCheck][index];
          return <div className="product-help-item" key={title}><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{copy}</p></div></div>;
        })}</div>
      </div>
    </section>
  );
}
