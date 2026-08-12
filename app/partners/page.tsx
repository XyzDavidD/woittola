import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Factory, Globe2 } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getLocaleMessages } from "../locales/server";
import { getMessages } from "../locales";
import { getPublicPartners } from "@/lib/partners/queries";
import JsonLd from "../components/JsonLd";
import { absoluteUrl, publicPageMetadata, WEBSITE_ID } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages("fi");
  return publicPageMetadata({
    title: messages.metadata.partnersTitle,
    description: messages.metadata.partnersDescription,
    pathname: "/partners",
  });
}

export default async function PartnersPage() {
  const { locale, messages } = await getLocaleMessages();
  const t = messages.partnersPage;
  const partners = await getPublicPartners(locale);

  return (
    <main className="home-page info-page">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/partners")}#webpage`,
        url: absoluteUrl("/partners"),
        name: t.title,
        description: t.lead,
        inLanguage: locale === "fi" ? "fi-FI" : "en",
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: partners.map((partner, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: partner.translation.title,
          })),
        },
      }} />
      <SiteHeader activePage="partners" />

      <section className="info-hero partners-page-hero">
        <div className="info-page-shell">
          <p className="info-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="info-lead">{t.lead}</p>
          <div className="partner-hero-points" aria-label={t.strengthsAria}>
            <span>
              <Globe2 aria-hidden="true" /> {t.european}
            </span>
            <span>
              <Factory aria-hidden="true" /> {t.expertise}
            </span>
          </div>
        </div>
      </section>

      <section className="partners-page-content info-page-shell" aria-labelledby="partner-list-title">
        <div className="info-section-heading">
          <p>{t.network}</p>
          <h2 id="partner-list-title">{t.manufacturers}</h2>
        </div>
        <div className="partners-page-grid">
          {partners.map((partner) => (
            <article className={`partners-page-card ${partner.imageUrl ? "has-image" : ""}`} key={partner.id}>
              {partner.imageUrl ? <div className="partners-page-card-image"><Image src={partner.imageUrl} alt={partner.translation.title} fill sizes="(min-width: 900px) 560px, 100vw" unoptimized /></div> : null}
              <div className="partners-page-card-heading">
                <div>
                  <strong>{partner.translation.title}</strong>
                </div>
                <BadgeCheck aria-hidden="true" />
              </div>
              <p>{partner.translation.description}</p>
              <div className="partners-page-card-footer">
                <span /> {t.specialistPartner}
              </div>
            </article>
          ))}
        </div>
        <div className="partners-page-cta">
          <div>
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaCopy}</p>
          </div>
          <Link className="button button-primary" href="/contact#contact-form">
            {t.quote} <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
