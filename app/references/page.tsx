import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getLocaleMessages } from "../locales/server";
import { getPublicReferenceProjects } from "@/lib/references/queries";
import ReferenceGallery from "./ReferenceGallery";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return { title: messages.metadata.referencesTitle, description: messages.metadata.referencesDescription };
}

export const dynamic = "force-dynamic";

export default async function ReferencesPage() {
  const { locale, messages } = await getLocaleMessages();
  const projects = await getPublicReferenceProjects(locale);
  const t = messages.references;

  return (
    <main className="home-page references-page">
      <SiteHeader activePage="references" />
      <section className="references-hero">
        <div className="references-shell references-hero-layout">
          <div className="references-hero-copy">
            <h1>{t.title}</h1>
            <span>{t.lead}</span>
          </div>
        </div>
      </section>

      <section className="references-content references-shell">
        <ReferenceGallery projects={projects} labels={{ projectsAria: t.projectsAria, viewProject: t.viewProject, emptyTitle: t.emptyTitle, emptyCopy: t.emptyCopy }} />
        <div className="references-cta">
          <div><h2>{t.ctaTitle}</h2><p>{t.ctaCopy}</p></div>
          <Link href="/contact#contact-form">{t.ctaButton} <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
