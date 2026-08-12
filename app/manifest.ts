import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Woittola Healthcare",
    short_name: "Woittola",
    description: "Terveydenhuollon ammattikalusteet ja lääkinnälliset laitteet Suomessa.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b3f86",
    lang: "fi",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

