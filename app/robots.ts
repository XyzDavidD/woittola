import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const publicDisallow = ["/api/", "/auth/"];
const privateDisallow = [...publicDisallow, "/dashboard/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: publicDisallow,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: privateDisallow,
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: privateDisallow,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: privateDisallow,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: privateDisallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

