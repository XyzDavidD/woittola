import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck } from "lucide-react";
import SiteHeader from "../components/SiteHeader";

const values = [
  {
    icon: ShieldCheck,
    title: "Carefully selected",
    copy: "We work with established European manufacturers known for quality and reliability.",
  },
  {
    icon: HeartHandshake,
    title: "Practical guidance",
    copy: "We help healthcare teams compare products and choose the right fit for each space.",
  },
  {
    icon: BadgeCheck,
    title: "Built for healthcare",
    copy: "Every solution is considered for patient comfort, daily workflow and long-term use.",
  },
];

export const metadata = {
  title: "About Us | Woittola Healthcare",
  description:
    "Learn how Woittola connects healthcare professionals with high-quality European furniture and equipment.",
};

export default function AboutPage() {
  return (
    <main className="home-page info-page">
      <SiteHeader activePage="about" />

      <section className="info-hero about-page-hero">
        <div className="info-page-shell">
          <p className="info-eyebrow">About Woittola</p>
          <h1>Healthcare solutions selected with care.</h1>
          <p className="info-lead">
            Woittola brings together specialised medical furniture and equipment from trusted
            European manufacturers, helping healthcare professionals create safer, more
            comfortable environments.
          </p>
          <div className="info-actions">
            <Link className="button button-primary" href="/catalogue">
              Explore Products
            </Link>
            <Link className="info-text-link" href="/contact#contact-form">
              Talk to our team <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="about-page-content info-page-shell" aria-labelledby="about-values-title">
        <div className="info-section-heading">
          <p>Our approach</p>
          <h2 id="about-values-title">Straightforward support from selection to delivery.</h2>
        </div>
        <div className="about-values-grid">
          {values.map(({ icon: Icon, title, copy }) => (
            <article className="about-value-card" key={title}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
