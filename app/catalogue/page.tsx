import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import AllProductsCatalogue from "./AllProductsCatalogue";
import { getPublicCategories } from "@/lib/catalogue/queries";
import { getLocaleMessages } from "../locales/server";
import { getMessages } from "../locales";
import JsonLd from "../components/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, publicPageMetadata, WEBSITE_ID } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages("fi");
  return publicPageMetadata({
    title: messages.metadata.catalogueTitle,
    description: messages.metadata.catalogueDescription,
    pathname: "/catalogue",
  });
}

export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const { locale, messages } = await getLocaleMessages();
  const categories = await getPublicCategories(locale);
  const t = messages.catalogue;

  return (
    <main className="home-page">
      <JsonLd data={[
        breadcrumbJsonLd([
          { name: messages.header.home, pathname: "/" },
          { name: messages.header.products, pathname: "/catalogue" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${absoluteUrl("/catalogue")}#webpage`,
          url: absoluteUrl("/catalogue"),
          name: t.title,
          description: t.intro,
          inLanguage: locale === "fi" ? "fi-FI" : "en",
          isPartOf: { "@id": WEBSITE_ID },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: categories.map((category, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: category.translation.name,
              url: absoluteUrl(`/catalogue/${category.slug}`),
            })),
          },
        },
      ]} />
      <SiteHeader activePage="products" />

      <section className="all-products-hero" aria-labelledby="all-products-title">
        <div className="all-products-hero-inner">
          <nav className="products-breadcrumbs" aria-label={t.breadcrumb}>
            <Link href="/">{messages.header.home}</Link>
            <ChevronRight aria-hidden="true" />
            <span aria-current="page">{messages.header.products}</span>
          </nav>
          <p className="all-products-eyebrow">{t.eyebrow}</p>
          <h1 id="all-products-title">{t.title}</h1>
          <p className="all-products-intro">{t.intro}</p>
        </div>
      </section>

      <AllProductsCatalogue categories={categories} ui={t} />
      <SiteFooter />
    </main>
  );
}
