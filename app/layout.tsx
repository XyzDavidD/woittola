import type { Metadata } from "next";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "./globals.css";

export const metadata: Metadata = {
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
    images: ["/images/hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
