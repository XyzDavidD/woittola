import type { Metadata } from "next";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
// Keep the site stylesheet as a distinct build input so Vercel emits a fresh,
// content-hashed CSS asset instead of reusing an older deployment artifact.
import "./woittola.css";
import { getLocaleMessages } from "./locales/server";
import { DEFAULT_SOCIAL_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  creator: "Senja Group Oy",
  publisher: "Senja Group Oy",
  category: "Terveydenhuollon kalusteet ja lääkinnälliset laitteet",
  title: {
    default: "Terveydenhuollon ammattikalusteet ja -laitteet | Woittola",
    template: "%s | Woittola",
  },
  description:
    "Terveydenhuollon ammattikalusteet ja lääkinnälliset laitteet sairaaloille, klinikoille ja hoivayksiköille Suomessa.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "fi_FI",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Terveydenhuollon ammattikalusteet ja -laitteet | Woittola",
    description:
      "Terveydenhuollon ammattikalusteet ja lääkinnälliset laitteet sairaaloille, klinikoille ja hoivayksiköille Suomessa.",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: "Woittola Healthcare – terveydenhuollon kalusteet ja laitteet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terveydenhuollon ammattikalusteet ja -laitteet | Woittola",
    description:
      "Terveydenhuollon ammattikalusteet ja lääkinnälliset laitteet sairaaloille, klinikoille ja hoivayksiköille Suomessa.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getLocaleMessages();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
