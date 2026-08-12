import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getLocaleMessages } from "../../locales/server";
import { getMessages } from "../../locales";
import { getPublicReferenceProject } from "@/lib/references/queries";
import JsonLd from "../../components/JsonLd";
import { absoluteUrl, ORGANIZATION_ID, publicPageMetadata, WEBSITE_ID } from "@/lib/seo";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const messages = await getMessages("fi");
  const project = await getPublicReferenceProject(slug, "fi");
  if (!project) return { title: messages.metadata.referencesTitle };
  return publicPageMetadata({
    title: project.translation.metaTitle || `${project.translation.title} | Woittola`,
    description: project.translation.metaDescription || project.translation.summary,
    pathname: `/references/${project.slug}`,
    image: project.coverImageUrl || undefined,
  });
}

export default async function ReferenceProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const { locale, messages } = await getLocaleMessages();
  const project = await getPublicReferenceProject(slug, locale);
  if (!project) notFound();
  const t = messages.references;
  const projectUrl = absoluteUrl(`/references/${project.slug}`);

  return (
    <main className="home-page reference-detail-page">
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${projectUrl}#webpage`,
          url: projectUrl,
          name: project.translation.title,
          description: project.translation.summary,
          inLanguage: locale === "fi" ? "fi-FI" : "en",
          isPartOf: { "@id": WEBSITE_ID },
          mainEntity: { "@id": `${projectUrl}#article` },
        },
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${projectUrl}#article`,
          headline: project.translation.title,
          description: project.translation.summary,
          image: project.coverImageUrl ? absoluteUrl(project.coverImageUrl) : undefined,
          dateModified: project.updatedAt,
          inLanguage: locale === "fi" ? "fi-FI" : "en",
          mainEntityOfPage: { "@id": `${projectUrl}#webpage` },
          publisher: { "@id": ORGANIZATION_ID },
        },
      ]} />
      <SiteHeader activePage="references" />
      <div className="reference-detail-shell">
        <section className="reference-detail-hero">
          <div className="reference-detail-intro">
            {project.translation.projectTypeLabel ? <p>{project.translation.projectTypeLabel}</p> : null}
            <h1>{project.translation.title}</h1>
            <span>{project.translation.summary}</span>
            <dl>
              {project.completedYear ? <div><dt>{t.completed}</dt><dd>{project.completedYear}</dd></div> : null}
              {project.translation.location ? <div><dt>{t.location}</dt><dd>{project.translation.location}</dd></div> : null}
              {project.translation.unit ? <div><dt>{t.unit}</dt><dd>{project.translation.unit}</dd></div> : null}
            </dl>
          </div>
          <div className="reference-detail-cover"><Image src={project.coverImageUrl} alt={project.translation.title} fill sizes="(min-width: 900px) 62vw, 100vw" priority unoptimized /></div>
        </section>

        <div className="reference-blocks">
          {project.translation.contentBlocks.map((block) => {
            if (block.type === "text") return <section className="reference-text-block" key={block.id}><h2>{block.heading}</h2><div>{block.body.split("\n").filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>;
            const image = block.imageUrls[0];
            return <section className={`reference-image-text ${block.imagePosition === "left" ? "image-left" : ""}`} key={block.id}>
              <div><h2>{block.heading}</h2>{block.body.split("\n").filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              {image ? <figure className="reference-block-image"><Image src={image} alt={block.imageAlt || block.heading} fill sizes="(min-width: 900px) 780px, 100vw" unoptimized /></figure> : null}
            </section>;
          })}
        </div>

        <Link className="reference-back" href="/references"><ArrowLeft aria-hidden="true" />{t.back}</Link>
      </div>
      <SiteFooter />
    </main>
  );
}
