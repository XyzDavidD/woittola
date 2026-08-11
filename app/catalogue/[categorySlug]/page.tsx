import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, ChevronRight, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ProductCatalogue from "../ProductCatalogue";
import { getPublicCategory } from "@/lib/catalogue/queries";
import { getLocaleMessages } from "../../locales/server";
import { interpolate } from "../../locales";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const { locale, messages } = await getLocaleMessages();
  const category = await getPublicCategory(categorySlug, locale);

  if (!category) return { title: messages.categoryPage.fallbackTitle };

  return {
    title: category.translation.metaTitle,
    description: category.translation.metaDescription,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const { locale, messages } = await getLocaleMessages();
  const category = await getPublicCategory(categorySlug, locale);

  if (!category) notFound();

  const heroStyle = {
    backgroundImage: `url("${category.heroImageUrl}")`,
  } satisfies CSSProperties;
  const benefitIcons = [UsersRound, Sparkles, ShieldCheck, BadgeCheck];

  return (
    <main className="home-page">
      <SiteHeader activePage="products" />

      <section className="hero-section products-hero" style={heroStyle} aria-labelledby="products-title">
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy products-hero-copy">
            <nav className="products-breadcrumbs" aria-label={messages.catalogue.breadcrumb}>
              <Link href="/">{messages.header.home}</Link>
              <ChevronRight aria-hidden="true" />
              <Link href="/catalogue">{messages.header.products}</Link>
              <ChevronRight aria-hidden="true" />
              <span aria-current="page">{category.translation.name}</span>
            </nav>

            <h1 id="products-title">{category.translation.heroTitle}</h1>
            <div className="products-description">
              <p>{category.translation.heroDescription}</p>
            </div>

            <div className="products-benefits" aria-label={interpolate(messages.categoryPage.benefitsAria, { category: category.translation.name })}>
              {messages.categoryPage.benefits.map(({ first, second }, index) => {
                const Icon = benefitIcons[index];
                return <div className="products-benefit" key={first}>
                  <div className="products-benefit-icon"><Icon aria-hidden="true" /></div>
                  <span>{first}{second ? <><br />{second}</> : null}</span>
                </div>;
              })}
            </div>
          </div>
        </div>
      </section>

      <ProductCatalogue categoryName={category.translation.name} products={category.products} locale={locale} ui={messages.catalogue} />
      <SiteFooter />
    </main>
  );
}
