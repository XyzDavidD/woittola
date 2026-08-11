import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { productCategories } from "../data/catalogue";
import { getLocaleMessages } from "../locales/server";
import LanguageSelector from "./LanguageSelector";

type ActivePage = "home" | "products" | "references" | "about" | "partners";

type SiteHeaderProps = {
  activePage?: ActivePage;
};

export default async function SiteHeader({ activePage }: SiteHeaderProps) {
  const { locale, messages } = await getLocaleMessages();
  const navigation: Array<{ label: string; href: string; key: ActivePage }> = [
    { label: messages.header.home, href: "/", key: "home" },
    { label: messages.header.references, href: "/references", key: "references" },
    { label: messages.header.about, href: "/about", key: "about" },
    { label: messages.header.partners, href: "/partners", key: "partners" },
  ];

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" href="/" aria-label={messages.header.homeAria}>
          <Image
            src="/images/logo.png"
            alt="Woittola Healthcare"
            width={296}
            height={50}
            priority
            unoptimized
          />
        </Link>

        <nav className="desktop-nav" aria-label={messages.header.mainNavigation}>
          <Link className={`nav-link${activePage === "home" ? " active" : ""}`} href="/">
            {messages.header.home}
          </Link>

          <div className="products-nav-item">
            <Link
              className={`nav-link products-nav-link${activePage === "products" ? " active" : ""}`}
              href="/catalogue"
            >
              {messages.header.products} <ChevronDown aria-hidden="true" />
            </Link>
            <div className="products-dropdown" aria-label={messages.header.productCategories}>
              <p>{messages.header.productCategories}</p>
              <div>
                {productCategories.map((category) => (
                  <Link href={`/catalogue/${category.slug}`} key={category.slug}>
                    {messages.categoryNames[category.slug]}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navigation.slice(1).map((item) => (
            <Link
              className={`nav-link${activePage === item.key ? " active" : ""}`}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <LanguageSelector locale={locale} labels={messages.languageSelector} />

        <Link className="header-quote" href="/contact#contact-form">
          {messages.header.contact}
        </Link>

        <details className="mobile-menu">
          <summary aria-label={messages.header.openNavigation}>
            <Menu aria-hidden="true" />
          </summary>
          <nav aria-label={messages.header.mainNavigation}>
            <Link href="/">{messages.header.home}</Link>
            <details className="mobile-products-menu">
              <summary>
                {messages.header.products} <ChevronDown aria-hidden="true" />
              </summary>
              <div className="mobile-products-dropdown">
                {productCategories.map((category) => (
                  <Link href={`/catalogue/${category.slug}`} key={category.slug}>
                    {messages.categoryNames[category.slug]}
                  </Link>
                ))}
              </div>
            </details>
            {navigation.slice(1).map((item) => (
              <Link href={item.href} key={item.key}>
                {item.label}
              </Link>
            ))}
            <Link className="mobile-quote-link" href="/contact#contact-form">
              {messages.header.contact}
            </Link>
            <LanguageSelector locale={locale} labels={messages.languageSelector} variant="mobile" />
          </nav>
        </details>
      </div>
    </header>
  );
}
