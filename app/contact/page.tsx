import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  FileText,
  Headphones,
  Mail,
  PackageSearch,
} from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ContactForm from "../components/ContactForm";
import { getLocaleMessages } from "../locales/server";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return { title: messages.metadata.contactTitle, description: messages.metadata.contactDescription };
}

export default async function ContactPage() {
  const { messages } = await getLocaleMessages();
  const t = messages.contact;
  const optionIcons = [PackageSearch, FileText, Headphones];

  return (
    <main className="contact-page">
      <SiteHeader />

      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-hero-shell">
          <nav className="contact-breadcrumbs" aria-label={t.breadcrumb}>
            <Link href="/">{messages.header.home}</Link>
            <ChevronRight aria-hidden="true" />
            <span aria-current="page">{t.title}</span>
          </nav>
          <div className="contact-hero-copy">
            <p className="contact-eyebrow">{t.eyebrow}</p>
            <h1 id="contact-title">{t.title}</h1>
            <p>{t.lead}</p>
          </div>
          <div className="contact-hero-meta" aria-label={t.informationAria}>
            <a href={CONTACT_EMAIL_HREF}>
              <Mail aria-hidden="true" />
              <span>
                {t.emailTeam}
                <strong>{CONTACT_EMAIL}</strong>
              </span>
            </a>
            <div>
              <Clock3 aria-hidden="true" />
              <span>
                {t.responseTime}
                <strong>{t.responseValue}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-content" id="support-options">
        <div className="contact-support-column">
          <p className="contact-section-label">{t.sectionLabel}</p>
          <h2>{t.sectionTitle}</h2>
          <p className="contact-intro">{t.intro}</p>

          <div className="contact-support-list">
            {t.options.map(({ title, copy }, index) => {
              const Icon = optionIcons[index];
              return <article className="contact-support-item" key={title}>
                <div className="contact-support-icon">
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>;
            })}
          </div>

          <Link className="contact-products-link" href="/catalogue">
            {t.browse} <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="contact-form-card" id="contact-form">
          <div className="contact-form-heading">
            <p>{t.sendEnquiry}</p>
            <h2>{t.formTitle}</h2>
            <span>{t.requiredNote}</span>
          </div>

          <ContactForm ui={t} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
