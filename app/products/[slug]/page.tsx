import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, ClipboardCheck, Download, Stethoscope } from "lucide-react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import QuoteRequestModal from "../../components/QuoteRequestModal";
import ProductGallery from "./ProductGallery";
import ProductInformation from "./ProductInformation";
import { getPublicProduct } from "@/lib/catalogue/queries";
import { getLocaleMessages } from "../../locales/server";
import { getMessages } from "../../locales";
import JsonLd from "../../components/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, publicPageMetadata, WEBSITE_ID } from "@/lib/seo";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const messages = await getMessages("fi");
  const product = await getPublicProduct(slug, "fi");
  if (!product) return { title: messages.product.fallbackTitle };

  return publicPageMetadata({
    title: `${product.translation.name} | Woittola Healthcare`,
    description: product.translation.description,
    pathname: `/products/${product.slug}`,
    image: product.primaryImageUrl || undefined,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { locale, messages } = await getLocaleMessages();
  const product = await getPublicProduct(slug, locale);
  if (!product) notFound();

  const images = [product.primaryImageUrl, ...product.galleryUrls].filter((value, index, values) => value && values.indexOf(value) === index);
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const productId = `${productUrl}#product`;

  return (
    <main className="home-page product-detail-page">
      <JsonLd data={[
        breadcrumbJsonLd([
          { name: messages.header.home, pathname: "/" },
          { name: messages.header.products, pathname: "/catalogue" },
          { name: product.categoryName, pathname: `/catalogue/${product.categorySlug}` },
          { name: product.translation.name, pathname: `/products/${product.slug}` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "ItemPage",
          "@id": `${productUrl}#webpage`,
          url: productUrl,
          name: product.translation.name,
          description: product.translation.description,
          inLanguage: locale === "fi" ? "fi-FI" : "en",
          isPartOf: { "@id": WEBSITE_ID },
          mainEntity: { "@id": productId },
        },
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": productId,
          url: productUrl,
          name: product.translation.name,
          description: product.translation.description,
          image: images.map(absoluteUrl),
          category: product.categoryName,
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          audience: {
            "@type": "Audience",
            audienceType: "Terveydenhuollon ammattilaiset",
          },
          additionalProperty: product.translation.specifications.map((specification) => ({
            "@type": "PropertyValue",
            name: specification.label,
            value: specification.value,
          })),
          mainEntityOfPage: { "@id": `${productUrl}#webpage` },
        },
      ]} />
      <SiteHeader activePage="products" />

      <div className="product-detail-shell">
        <nav className="product-detail-breadcrumbs" aria-label={messages.product.breadcrumb}>
          <Link href="/">{messages.header.home}</Link><ChevronRight aria-hidden="true" />
          <Link href="/catalogue">{messages.header.products}</Link><ChevronRight aria-hidden="true" />
          <Link href={`/catalogue/${product.categorySlug}`}>{product.categoryName}</Link><ChevronRight aria-hidden="true" />
          <span aria-current="page">{product.translation.name}</span>
        </nav>

        <Link className="product-back-link" href={`/catalogue/${product.categorySlug}`}><ArrowLeft aria-hidden="true" /> {messages.product.backTo} {product.categoryName}</Link>

        <div className="product-detail-layout">
          <ProductGallery productName={product.translation.name} images={images} ui={messages.product} />

          <section className="product-detail-info" aria-labelledby="product-detail-title">
            {product.brand ? <p className="product-detail-brand">{product.brand}</p> : null}
            <h1 id="product-detail-title">{product.translation.name}</h1>
            {product.translation.productTypeLabel || product.productType ? <p className="product-detail-type">{product.translation.productTypeLabel || product.productType}</p> : null}
            <p className="product-detail-description">{product.translation.description}</p>

            {product.applications.length ? <div className="product-detail-applications">
              <h2>{messages.product.applications}</h2>
              <div className="product-detail-application-grid">
                {product.applications.map((application, index) => <div className="product-detail-application" key={application}><Stethoscope aria-hidden="true" /><span>{product.translation.applicationLabels[index] || application}</span></div>)}
              </div>
            </div> : null}

            <div className="product-detail-actions">
              <QuoteRequestModal productName={product.translation.name} ui={messages.quote} />
              {product.brochureUrl ? <a className="product-detail-brochure" href={product.brochureUrl} target="_blank" rel="noreferrer"><Download aria-hidden="true" /> {messages.product.downloadBrochure}</a> : null}
            </div>
          </section>
        </div>

        {product.videoUrl ? <section className="product-video-showcase" aria-labelledby="product-video-title">
          <div className="product-video-copy"><span className="product-video-eyebrow"><ClipboardCheck aria-hidden="true" /> {messages.product.demonstration}</span><h2 id="product-video-title">{messages.product.seeInActionPrefix} {product.translation.name} {messages.product.seeInActionSuffix}</h2><p>{messages.product.demonstrationCopy}</p></div>
          <div className="product-video-card"><div className="product-video-frame"><video controls preload="metadata"><source src={product.videoUrl} /></video></div></div>
        </section> : null}

        <ProductInformation productName={product.translation.name} content={product.translation} brochureUrl={product.brochureUrl} technicalSheetUrl={product.technicalSheetUrl} ui={messages.product} />
      </div>
      <SiteFooter />
    </main>
  );
}
