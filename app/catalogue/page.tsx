import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import AllProductsCatalogue from "./AllProductsCatalogue";
import { getPublicCategories } from "@/lib/catalogue/queries";
import { getLocaleMessages } from "../locales/server";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return { title: messages.metadata.catalogueTitle, description: messages.metadata.catalogueDescription };
}

export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const { locale, messages } = await getLocaleMessages();
  const categories = await getPublicCategories(locale);
  const t = messages.catalogue;

  return (
    <main className="home-page">
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
