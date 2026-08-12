import type { Metadata } from "next";

export const SITE_URL = "https://woittola.fi";
export const SITE_NAME = "Woittola Healthcare";
export const LEGAL_NAME = "Senja Group Oy";
export const DEFAULT_SOCIAL_IMAGE = "/woittola-social.png";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(pathname = "/") {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return new URL(pathname.startsWith("/") ? pathname : `/${pathname}`, SITE_URL).toString();
}

type PublicPageMetadataOptions = {
  title: string;
  description: string;
  pathname: string;
  image?: string;
};

export function publicPageMetadata({
  title,
  description,
  pathname,
  image = DEFAULT_SOCIAL_IMAGE,
}: PublicPageMetadataOptions): Metadata {
  const canonical = absoluteUrl(pathname);
  const socialImage = absoluteUrl(image);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "fi_FI",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: socialImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

type BreadcrumbItem = {
  name: string;
  pathname: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.pathname),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    alternateName: "Woittola",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/logo.png"),
      contentUrl: absoluteUrl("/images/logo.png"),
    },
    image: absoluteUrl(DEFAULT_SOCIAL_IMAGE),
    description:
      "Woittola Healthcare toimittaa terveydenhuollon ammattikalusteita ja lääkinnällisiä laitteita sairaaloille, klinikoille ja hoivayksiköille Suomessa.",
    email: "info@woittola.fi",
    telephone: "+358405371101",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Riipin Vanhatie 67",
      postalCode: "64760",
      addressLocality: "Peltola",
      addressCountry: "FI",
    },
    areaServed: {
      "@type": "Country",
      name: "Suomi",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales and customer support",
      email: "info@woittola.fi",
      telephone: "+358405371101",
      areaServed: "FI",
      availableLanguage: ["fi", "en"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: "Woittola",
    description: "Terveydenhuollon ammattikalusteet ja lääkinnälliset laitteet Suomessa.",
    inLanguage: "fi-FI",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

