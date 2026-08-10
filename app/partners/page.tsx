import Link from "next/link";
import { ArrowRight, Factory, Globe2 } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import { partners } from "../data/partners";

export const metadata = {
  title: "Partners | Woittola Healthcare",
  description:
    "Meet the European healthcare furniture and medical equipment manufacturers represented by Woittola.",
};

export default function PartnersPage() {
  return (
    <main className="home-page info-page">
      <SiteHeader activePage="partners" />

      <section className="info-hero partners-page-hero">
        <div className="info-page-shell">
          <p className="info-eyebrow">Our Partners</p>
          <h1>Trusted specialists from across Europe.</h1>
          <p className="info-lead">
            We partner with focused manufacturers whose products support better clinical
            workflows, patient comfort and dependable day-to-day care.
          </p>
          <div className="partner-hero-points" aria-label="Partnership strengths">
            <span>
              <Globe2 aria-hidden="true" /> European manufacturers
            </span>
            <span>
              <Factory aria-hidden="true" /> Specialised product expertise
            </span>
          </div>
        </div>
      </section>

      <section className="partners-page-content info-page-shell" aria-labelledby="partner-list-title">
        <div className="info-section-heading">
          <p>Our network</p>
          <h2 id="partner-list-title">Manufacturing partners</h2>
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
            <h2>Looking for a specific healthcare solution?</h2>
            <p>Tell us what you need and we’ll help identify the right partner and product.</p>
          </div>
          <Link className="button button-primary" href="/contact#contact-form">
            Request a Quote <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
