import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Factory, Globe2 } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import { partners } from "../data/partners";
import { getLocaleMessages } from "../locales/server";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return { title: messages.metadata.partnersTitle, description: messages.metadata.partnersDescription };
}

export default async function PartnersPage() {
  const { messages } = await getLocaleMessages();
  const t = messages.partnersPage;

  return (
    <main className="home-page info-page">
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
            <article className="partners-page-card" key={partner.name}>
              <strong>{partner.name}</strong>
              <span>{partner.tagline}</span>
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
    </main>
  );
}
