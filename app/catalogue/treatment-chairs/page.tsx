import Link from "next/link";
import { BadgeCheck, ChevronRight, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import SiteHeader from "../../components/SiteHeader";
import ProductCatalogue from "../ProductCatalogue";

const benefits = [
  { firstLine: "Ergonomic", secondLine: "& Comfortable", icon: UsersRound },
  { firstLine: "Easy to Clean", icon: Sparkles },
  { firstLine: "Durable & Reliable", icon: ShieldCheck },
  { firstLine: "Designed for", secondLine: "Healthcare", icon: BadgeCheck },
];

export const metadata = {
  title: "Treatment Chairs",
  description: "High-quality treatment chairs for dialysis, infusion, chemotherapy and professional outpatient care.",
};

export default function TreatmentChairsPage() {
  return (
    <main className="home-page">
      <SiteHeader activePage="products" />

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
              <p>High-quality treatment chairs for dialysis, infusion, chemotherapy,<br className="desktop-break" /> blood collection and outpatient procedures.</p>
              <p>Ergonomic design, patient comfort and easy cleaning – built for<br className="desktop-break" /> professional care.</p>
            </div>

            <div className="products-benefits" aria-label="Treatment chair benefits">
              {benefits.map(({ firstLine, secondLine, icon: Icon }) => (
                <div className="products-benefit" key={firstLine}>
                  <div className="products-benefit-icon"><Icon aria-hidden="true" /></div>
                  <span>{firstLine}{secondLine ? <><br />{secondLine}</> : null}</span>
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
