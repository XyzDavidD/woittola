import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getLocaleMessages } from "../locales/server";
import { getMessages } from "../locales";
import JsonLd from "../components/JsonLd";
import { absoluteUrl, ORGANIZATION_ID, publicPageMetadata, WEBSITE_ID } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages("fi");
  return publicPageMetadata({
    title: messages.metadata.aboutTitle,
    description: messages.metadata.aboutDescription,
    pathname: "/about",
  });
}

export default async function AboutPage() {
  const { locale, messages } = await getLocaleMessages();
  const t = messages.about;
  const valueIcons = [ShieldCheck, HeartHandshake, BadgeCheck];

  return (
    <main className="home-page info-page">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${absoluteUrl("/about")}#webpage`,
        url: absoluteUrl("/about"),
        name: t.title,
        description: t.lead,
        inLanguage: locale === "fi" ? "fi-FI" : "en",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANIZATION_ID },
      }} />
      <SiteHeader activePage="about" />

      <section className="info-hero about-page-hero">
        <div className="info-page-shell">
          <p className="info-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="info-lead">{t.lead}</p>
          <div className="info-actions">
            <Link className="button button-primary" href="/catalogue">
              {t.explore}
            </Link>
            <Link className="info-text-link" href="/contact#contact-form">
              {t.talk} <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="about-page-content info-page-shell" aria-labelledby="about-values-title">
        <div className="info-section-heading">
          <p>{t.approach}</p>
          <h2 id="about-values-title">{t.approachTitle}</h2>
        </div>
        <div className="about-values-grid">
          {t.values.map(({ title, copy }, index) => {
            const Icon = valueIcons[index];
            return <article className="about-value-card" key={title}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>;
          })}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
