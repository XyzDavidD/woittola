import type { MetadataRoute } from "next";
import { getPublicCategories } from "@/lib/catalogue/queries";
import { getPublicReferenceProjects } from "@/lib/references/queries";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function validLastModified(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, projects] = await Promise.all([
    getPublicCategories("fi"),
    getPublicReferenceProjects("fi"),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/catalogue"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/partners"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/references"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/catalogue/${category.slug}`),
    lastModified: validLastModified(category.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    category.products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: validLastModified(product.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  );

  const referencePages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absoluteUrl(`/references/${project.slug}`),
    lastModified: validLastModified(project.updatedAt),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...referencePages];
}

