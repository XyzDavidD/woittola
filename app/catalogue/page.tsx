import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  Menu,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import ProductCatalogue from "./ProductCatalogue";

const navItems = ["About Us", "Partners", "Support", "Contact"];

const benefits = [
  { firstLine: "Ergonomic", secondLine: "& Comfortable", icon: UsersRound },
  { firstLine: "Easy to Clean", icon: Sparkles },
  { firstLine: "Durable & Reliable", icon: ShieldCheck },
  { firstLine: "Designed for", secondLine: "Healthcare", icon: BadgeCheck },
];

export const metadata = {
  title: "Treatment Chairs | Woittola",
  description:
    "High-quality treatment chairs for dialysis, infusion, chemotherapy and professional outpatient care.",
};

export default function CataloguePage() {
  return (
    <main className="home-page">
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
            <Link className="nav-link" href="/">
              Home
            </Link>
            <Link className="nav-link active" href="/catalogue">
              Products
            </Link>
            {navItems.map((item) => (
              <Link
                className="nav-link"
                href={`/#${item.toLowerCase().replaceAll(" ", "-")}`}
                key={item}
              >
                {item}
              </Link>
            ))}
          </nav>

          <Link className="header-quote" href="/#contact">
            Request a Quote
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Open navigation menu">
              <Menu aria-hidden="true" />
            </summary>
            <nav aria-label="Mobile navigation">
              <Link href="/">Home</Link>
              <Link href="/catalogue">Products</Link>
              {navItems.map((item) => (
                <Link href={`/#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>
                  {item}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </header>

      <section className="hero-section products-hero" aria-labelledby="products-title">
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy products-hero-copy">
            <nav className="products-breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight aria-hidden="true" />
              <Link href="/catalogue">Products</Link>
              <ChevronRight aria-hidden="true" />
              <span aria-current="page">Treatment Chairs</span>
            </nav>

            <h1 id="products-title">Treatment Chairs</h1>

            <div className="products-description">
              <p>
                High-quality treatment chairs for dialysis, infusion, chemotherapy,
                <br className="desktop-break" /> blood collection and outpatient procedures.
              </p>
              <p>
                Ergonomic design, patient comfort and easy cleaning – built for
                <br className="desktop-break" /> professional care.
              </p>
            </div>

            <div className="products-benefits" aria-label="Treatment chair benefits">
              {benefits.map(({ firstLine, secondLine, icon: Icon }) => (
                <div className="products-benefit" key={firstLine}>
                  <div className="products-benefit-icon">
                    <Icon aria-hidden="true" />
                  </div>
                  <span>
                    {firstLine}
                    {secondLine ? (
                      <>
                        <br />
                        {secondLine}
                      </>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProductCatalogue />
    </main>
  );
}
