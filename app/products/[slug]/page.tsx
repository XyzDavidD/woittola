import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  CirclePlay,
  ClipboardCheck,
  Download,
  Droplets,
  HandHeart,
  Syringe,
} from "lucide-react";
import SiteHeader from "../../components/SiteHeader";
import QuoteRequestModal from "../../components/QuoteRequestModal";
import ProductGallery from "./ProductGallery";
import ProductInformation from "./ProductInformation";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

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
      <SiteHeader activePage="products" />

      <div className="product-detail-shell">
        <nav className="product-detail-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight aria-hidden="true" />
          <Link href="/catalogue">Products</Link>
          <ChevronRight aria-hidden="true" />
          <Link href="/catalogue/treatment-chairs">Treatment Chairs</Link>
          <ChevronRight aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <Link className="product-back-link" href="/catalogue/treatment-chairs">
          <ArrowLeft aria-hidden="true" /> Back to Treatment Chairs
        </Link>

        <div className="product-detail-layout">
          <ProductGallery productName={product.name} />

          <section className="product-detail-info" aria-labelledby="product-detail-title">
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
              <QuoteRequestModal productName={product.name} />
              <a className="product-detail-brochure" href="#product-detail-title">
                <Download aria-hidden="true" /> Download Brochure
              </a>
            </div>
          </section>
        </div>

        <section className="product-video-showcase" aria-labelledby="product-video-title">
          <div className="product-video-copy">
            <span className="product-video-eyebrow">
              <CirclePlay aria-hidden="true" /> Product demonstration
            </span>
            <h2 id="product-video-title">See clinical seating in action.</h2>
            <p>
              Explore how adjustable clinical seating supports safe patient positioning,
              smooth movement and a more efficient workflow for healthcare professionals.
            </p>
            <div className="product-video-notes" aria-label="Video highlights">
              <span>Patient positioning</span>
              <span>Caregiver access</span>
              <span>Clinical mobility</span>
            </div>
          </div>

          <div className="product-video-card">
            <div className="product-video-frame">
              <iframe
                src="https://www.youtube-nocookie.com/embed/aAZm3LEU8-8?rel=0&modestbranding=1"
                title="Clinical treatment chair demonstration"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <ProductInformation productName={product.name} />
      </div>
    </main>
  );
}
