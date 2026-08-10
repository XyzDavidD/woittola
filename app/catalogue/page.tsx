import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import AllProductsCatalogue from "./AllProductsCatalogue";

export const metadata = {
  title: "All Products",
  description: "Explore Woittola healthcare furniture and equipment by product category.",
};

export default function CataloguePage() {
  return (
    <main className="home-page">
      <SiteHeader activePage="products" />

      <section className="all-products-hero" aria-labelledby="all-products-title">
        <div className="all-products-hero-inner">
          <nav className="products-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight aria-hidden="true" />
            <span aria-current="page">Products</span>
          </nav>
          <p className="all-products-eyebrow">Healthcare furniture &amp; equipment</p>
          <h1 id="all-products-title">Explore All Products</h1>
          <p className="all-products-intro">
            Browse our complete range by category. Each collection features selected products
            from specialist European manufacturers.
          </p>
        </div>
      </section>

      <AllProductsCatalogue />
    </main>
  );
}
