import type { Metadata } from "next";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
// Keep the site stylesheet as a distinct build input so Vercel emits a fresh,
// content-hashed CSS asset instead of reusing an older deployment artifact.
import "./woittola.css";
import { getLocaleMessages } from "./locales/server";

const deployedUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(deployedUrl),
  title: {
    default: "Woittola Healthcare",
    template: "%s | Woittola",
  },
  description:
    "Professional healthcare furniture and equipment from leading European manufacturers.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Woittola Healthcare",
    description:
      "Professional healthcare furniture and equipment from leading European manufacturers.",
    images: [
      {
        url: "/woittola-social.png",
        width: 1200,
        height: 630,
        alt: "Woittola Healthcare treatment chair",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Woittola Healthcare",
    description:
      "Professional healthcare furniture and equipment from leading European manufacturers.",
    images: ["/woittola-social.png"],
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
