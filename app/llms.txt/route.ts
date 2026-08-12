import { getPublicCategories } from "@/lib/catalogue/queries";
import { getPublicPartners } from "@/lib/partners/queries";
import { getPublicReferenceProjects } from "@/lib/references/queries";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const [categories, partners, references] = await Promise.all([
    getPublicCategories("fi"),
    getPublicPartners("fi"),
    getPublicReferenceProjects("fi"),
  ]);

  const lines = [
    "# Woittola Healthcare",
    "",
    "> Woittola Healthcare toimittaa terveydenhuollon ammattikalusteita ja lääkinnällisiä laitteita sairaaloille, klinikoille ja hoivayksiköille Suomessa.",
    "",
    "## Viralliset yritystiedot",
    "",
    "- Virallinen yritysnimi: Senja Group Oy",
    "- Markkinointinimi: Woittola Healthcare",
    "- Verkkosivusto: https://woittola.fi/",
    "- Sähköposti: info@woittola.fi",
    "- Puhelin: +358 40 537 1101",
    "- Osoite: Riipin Vanhatie 67, 64760 Peltola, Suomi",
    "- Palvelualue: Suomi",
    "- Sivuston ensisijainen kieli: suomi",
    "- Vierailijoille saatavilla myös: englanti",
    "",
    "## Keskeiset sivut",
    "",
    `- [Etusivu](${absoluteUrl("/")})`,
    `- [Kaikki tuotteet](${absoluteUrl("/catalogue")})`,
    `- [Tietoa Woittolasta](${absoluteUrl("/about")})`,
    `- [Valmistajakumppanit](${absoluteUrl("/partners")})`,
    `- [Referenssit](${absoluteUrl("/references")})`,
    `- [Yhteystiedot ja tarjouspyynnöt](${absoluteUrl("/contact")})`,
    "",
    "## Julkaistut tuoteryhmät",
    "",
    ...categories.map((category) =>
      `- [${category.translation.name}](${absoluteUrl(`/catalogue/${category.slug}`)}): ${category.translation.heroDescription}`,
    ),
    "",
    "## Julkaistut tuotteet",
    "",
    ...categories.flatMap((category) =>
      category.products.map((product) =>
        `- [${product.translation.name}](${absoluteUrl(`/products/${product.slug}`)}) — ${category.translation.name}: ${product.translation.description}`,
      ),
    ),
    "",
    "## Julkaistut valmistajakumppanit",
    "",
    ...partners.map((partner) => `- ${partner.translation.title}: ${partner.translation.description}`),
    "",
    "## Julkaistut referenssit",
    "",
    ...references.map((reference) =>
      `- [${reference.translation.title}](${absoluteUrl(`/references/${reference.slug}`)}): ${reference.translation.summary}`,
    ),
    "",
    "## Lisätiedot",
    "",
    "Tuotetiedot, ominaisuudet ja saatavilla olevat dokumentit löytyvät aina tuotteen omalta kanoniselta sivulta. Ajantasaiset julkaistut URL-osoitteet löytyvät sivustokartasta: https://woittola.fi/sitemap.xml",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
