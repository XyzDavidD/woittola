import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  Armchair,
  ArrowRight,
  BadgeCheck,
  Baby,
  Bed,
  CirclePlus,
  Ear,
  FileText,
  Headphones,
  Hospital,
  ShieldCheck,
  UsersRound,
  Venus,
} from "lucide-react";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import { getLocaleMessages } from "./locales/server";

type Category = {
  slug: keyof typeof import("./locales/en").en.home.primaryCategories;
  image: string;
  imageClass: string;
  accent: string;
  icon: LucideIcon;
};

const categories: Category[] = [
  {
    slug: "patient-chairs",
    image: "/images/chair1.png",
    imageClass: "chair-one",
    accent: "#087d68",
    icon: Armchair,
  },
  {
    slug: "treatment-chairs",
    image: "/images/chair2.png",
    imageClass: "chair-two",
    accent: "#063b91",
    icon: Accessibility,
  },
  {
    slug: "gynecology",
    image: "/images/chair3.png",
    imageClass: "chair-three",
    accent: "#7a2396",
    icon: Venus,
  },
  {
    slug: "patient-stretchers",
    image: "/images/chair3.png",
    imageClass: "chair-three",
    accent: "#008b99",
    icon: Bed,
  },
  {
    slug: "medical-carts",
    image: "/images/chair3.png",
    imageClass: "chair-three",
    accent: "#c81d2b",
    icon: Hospital,
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return { title: messages.metadata.homeTitle, description: messages.metadata.homeDescription };
}

export default async function HomePage() {
  const { messages } = await getLocaleMessages();
  const t = messages.home;
  const trustIcons = [ShieldCheck, BadgeCheck, CirclePlus];
  const whyIcons = [ShieldCheck, UsersRound, Headphones, FileText];

  return (
    <main className="home-page">
      <SiteHeader activePage="home" />

      <section className="hero-section">
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              {t.hero.title[0]}
              <br />
              {t.hero.title[1]}
              <br />
              {t.hero.title[2]}
            </h1>
            <p>
              {t.hero.description}
              <br className="desktop-break" /> {t.hero.descriptionSecond}
            </p>

            <div className="hero-actions">
              <Link className="button button-primary" href="/catalogue">
                {t.hero.explore}
              </Link>
              <Link className="button button-secondary" href="/contact#contact-form">
                {t.hero.quote}
              </Link>
            </div>

            <div className="trust-list" aria-label={t.hero.commitments}>
              {t.hero.trust.map((label, index) => {
                const Icon = trustIcons[index];
                return <div className="trust-item" key={label}><Icon aria-hidden="true" /><span>{label}</span></div>;
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="category-section" aria-label={t.categorySectionAria}>
        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;
            const title = messages.categoryNames[category.slug];
            const products = t.primaryCategories[category.slug].products;

            return <article className="category-card" key={category.slug}>
                <div className={`category-image ${category.imageClass}`}>
                  <Image
                    src={category.image}
                    alt={title}
                    fill
                    sizes="(min-width: 1100px) 220px, (min-width: 640px) 45vw, 90vw"
                    loading="eager"
                    unoptimized
                  />
                  <div className="category-icon" style={{ backgroundColor: category.accent }}>
                    <Icon size={30} strokeWidth={1.9} aria-hidden="true" />
                  </div>
                </div>

                <div className="category-content">
                  <div>
                    <h2>{title}</h2>
                    <ul>
                      {products.map((product) => (
                        <li key={product}>{product}</li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    className="category-link"
                    href={`/catalogue/${category.slug}`}
                    style={{ color: category.accent }}
                  >
                    {t.viewProducts} <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
                  </Link>
                </div>
              </article>;
          })}
        </div>

        <div className="secondary-grid" id="extended-products">
          <article className="secondary-card secondary-product-card">
            <div className="secondary-media medical-table-media">
              <Image
                src="/images/medical-table-generated.png"
                alt={t.secondary.medicalTables.imageAlt}
                fill
                sizes="(min-width: 1100px) 300px, (min-width: 640px) 45vw, 90vw"
                style={{ objectFit: "contain", objectPosition: "center" }}
                unoptimized
              />
              <div className="secondary-badge teal-badge">
                <Bed size={30} strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>
            <div className="secondary-content">
              <h2>{t.secondary.medicalTables.title}</h2>
              <p className="secondary-maker">{t.secondary.medicalTables.subtitle}</p>
              <ul>
                {t.secondary.medicalTables.products.map((product) => <li key={product}>{product}</li>)}
              </ul>
              <Link className="secondary-link teal-link" href="/catalogue/medical-tables">
                {t.viewProducts} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="secondary-card coming-card ent-card">
            <div className="coming-icon ent-icon">
              <Ear size={54} strokeWidth={1.45} aria-hidden="true" />
            </div>
            <div className="coming-content">
              <h2>{t.secondary.ent.title}</h2>
              <p className="secondary-maker">{t.secondary.ent.subtitle}</p>
              <div className="coming-divider" />
              <p className="coming-label">{t.comingSoon}</p>
              <p className="coming-description">{t.secondary.ent.description}</p>
              <Link className="secondary-link" href="/catalogue">
                {t.learnMore} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="secondary-card secondary-product-card">
            <div className="secondary-media work-stools-media">
              <Image
                src="/images/work-stool.jpg"
                alt={t.secondary.stools.imageAlt}
                fill
                sizes="(min-width: 1100px) 220px, (min-width: 640px) 45vw, 90vw"
                unoptimized
              />
              <div className="secondary-badge navy-badge">
                <Armchair size={29} strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>
            <div className="secondary-content">
              <h2>{t.secondary.stools.title}</h2>
              <p className="secondary-maker">{t.secondary.stools.subtitle}</p>
              <ul>
                {t.secondary.stools.products.map((product) => <li key={product}>{product}</li>)}
              </ul>
              <Link className="secondary-link navy-link" href="/catalogue/work-stools">
                {t.viewProducts} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="secondary-card coming-card maternity-card">
            <div className="coming-icon maternity-icon">
              <Baby size={54} strokeWidth={1.45} aria-hidden="true" />
            </div>
            <div className="coming-content">
              <h2>{t.secondary.maternity.title}</h2>
              <p className="secondary-maker">{t.secondary.maternity.subtitle}</p>
              <div className="coming-divider" />
              <p className="coming-label">{t.comingSoon}</p>
              <p className="coming-description">{t.secondary.maternity.description}</p>
              <Link className="secondary-link" href="/catalogue">
                {t.learnMore} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="secondary-card secondary-product-card">
            <div className="secondary-media protection-media">
              <Image
                src="/images/face-protection-generated.png"
                alt={t.secondary.protection.imageAlt}
                fill
                sizes="(min-width: 1100px) 300px, (min-width: 640px) 45vw, 90vw"
                unoptimized
              />
              <div className="secondary-badge navy-badge">
                <ShieldCheck size={29} strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>
            <div className="secondary-content compact-secondary-content">
              <h2>{t.secondary.protection.title}</h2>
              <p className="secondary-maker">{t.secondary.protection.subtitle}</p>
              <ul>
                {t.secondary.protection.products.map((product) => <li key={product}>{product}</li>)}
              </ul>
              <Link className="secondary-link navy-link" href="/catalogue/face-protection">
                {t.viewProducts} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="why-section" id="about-us" aria-labelledby="why-title">
        <h2 className="section-title" id="why-title">
          <span>{t.why.title}</span>
        </h2>
        <div className="why-panel">
          {t.why.items.map((item, index) => {
            const Icon = whyIcons[index];
            return <article className="why-item" key={item.title}><Icon aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.copy}</p></div></article>;
          })}
        </div>
      </section>

      <section className="support-section" id="support">
        <div className="support-copy">
          <Headphones aria-hidden="true" />
          <div>
            <h2>{t.supportTitle}</h2>
            <p>{t.supportCopy}</p>
          </div>
        </div>
        <Link className="support-button" href="/contact" id="contact">
          {t.supportButton}
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
