import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Droplets,
  HandHeart,
  Menu,
  Syringe,
} from "lucide-react";
import ProductGallery from "./ProductGallery";
import ProductInformation from "./ProductInformation";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const navItems = ["About Us", "Partners", "Support", "Contact"];

const productTypes = [
  { prefix: "medseat-pro", name: "MedSeat Pro", type: "Treatment Chair" },
  { prefix: "medseat-classic", name: "MedSeat Classic", type: "Infusion Chair" },
  { prefix: "relax-3", name: "Relax 3", type: "Dialysis Chair" },
  { prefix: "comfort-plus", name: "Comfort Plus", type: "Chemotherapy Chair" },
  { prefix: "bloodline", name: "BloodLine", type: "Blood Collection Chair" },
  { prefix: "medseat-acplus", name: "MedSeat AC+", type: "Procedure Chair" },
];

const applications = [
  { label: "Dialysis", icon: Droplets },
  { label: "Infusion Therapy", icon: Syringe },
  { label: "Chemotherapy", icon: Activity },
  { label: "Blood Collection", icon: HandHeart },
  { label: "Outpatient / Procedure", icon: ClipboardCheck },
];

function getProduct(slug: string) {
  const product = productTypes.find(({ prefix }) => slug.startsWith(prefix)) ?? productTypes[0];
  const routeNumber = Number(slug.match(/-(\d+)$/)?.[1] ?? "1");
  const edition = Math.floor((Math.max(routeNumber, 1) - 1) / productTypes.length) + 1;

  return {
    ...product,
    name: edition === 1 ? product.name : `${product.name} ${edition}`,
    isBestseller: routeNumber === 1,
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  return {
    title: `${product.name} | Woittola Healthcare`,
    description: `${product.name} ${product.type} for professional healthcare applications.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  return (
    <main className="home-page product-detail-page">
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

      <div className="product-detail-shell">
        <nav className="product-detail-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight aria-hidden="true" />
          <Link href="/catalogue">Products</Link>
          <ChevronRight aria-hidden="true" />
          <Link href="/catalogue">Treatment Chairs</Link>
          <ChevronRight aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <Link className="product-back-link" href="/catalogue">
          <ArrowLeft aria-hidden="true" /> Back to Treatment Chairs
        </Link>

        <div className="product-detail-layout">
          <ProductGallery productName={product.name} />

          <section className="product-detail-info" aria-labelledby="product-detail-title">
            {product.isBestseller ? <span className="product-detail-badge">Bestseller</span> : null}
            <h1 id="product-detail-title">{product.name}</h1>
            <p className="product-detail-type">{product.type}</p>
            <p className="product-detail-description">
              Versatile and ergonomic {product.type.toLowerCase()} designed for dialysis,
              infusion therapy, chemotherapy and blood collection. Ensures maximum patient
              comfort and an easy workflow for healthcare professionals.
            </p>

            <div className="product-detail-applications">
              <h2>Applications</h2>
              <div className="product-detail-application-grid">
                {applications.map(({ label, icon: Icon }) => (
                  <div className="product-detail-application" key={label}>
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-detail-actions">
              <Link className="product-detail-quote" href="mailto:contact@woittola.com">
                Request a Quote
              </Link>
              <a className="product-detail-brochure" href="#product-detail-title">
                <Download aria-hidden="true" /> Download Brochure
              </a>
            </div>
          </section>
        </div>

        <ProductInformation productName={product.name} />
      </div>
    </main>
  );
}
