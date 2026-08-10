import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { productCategories } from "../data/catalogue";
import LanguageSelector from "./LanguageSelector";

type ActivePage = "home" | "products" | "about" | "partners";

type SiteHeaderProps = {
  activePage?: ActivePage;
};

const navigation: Array<{ label: string; href: string; key: ActivePage }> = [
  { label: "Home", href: "/", key: "home" },
  { label: "About Us", href: "/about", key: "about" },
  { label: "Partners", href: "/partners", key: "partners" },
];

export default function SiteHeader({ activePage }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" href="/" aria-label="Woittola Healthcare home">
          <Image
            src="/images/logo.png"
            alt="Woittola Healthcare"
            width={296}
            height={50}
            priority
            unoptimized
          />
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link className={`nav-link${activePage === "home" ? " active" : ""}`} href="/">
            Home
          </Link>

          <div className="products-nav-item">
            <Link
              className={`nav-link products-nav-link${activePage === "products" ? " active" : ""}`}
              href="/catalogue"
            >
              Products <ChevronDown aria-hidden="true" />
            </Link>
            <div className="products-dropdown" aria-label="Product categories">
              <p>Product categories</p>
              <div>
                {productCategories.map((category) => (
                  <Link href="/catalogue/treatment-chairs" key={category.slug}>
                    {category.name}
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

        <LanguageSelector />

        <Link className="header-quote" href="/contact#contact-form">
          Contact &amp; Support
        </Link>

        <details className="mobile-menu">
          <summary aria-label="Open navigation menu">
            <Menu aria-hidden="true" />
          </summary>
          <nav aria-label="Mobile navigation">
            <Link href="/">Home</Link>
            <details className="mobile-products-menu">
              <summary>
                Products <ChevronDown aria-hidden="true" />
              </summary>
              <div className="mobile-products-dropdown">
                {productCategories.map((category) => (
                  <Link href="/catalogue/treatment-chairs" key={category.slug}>
                    {category.name}
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
              Contact &amp; Support
            </Link>
            <div className="mobile-language-selector" aria-label="Languages">
              <span>Language</span>
              <div>
                <button className="active" type="button" aria-pressed="true">
                  EN
                </button>
                <button type="button" aria-pressed="false">
                  FI
                </button>
              </div>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
