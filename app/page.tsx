import Image from "next/image";
import Link from "next/link";
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
import { partners } from "./data/partners";

type Category = {
  title: string;
  maker: string;
  image: string;
  imageClass: string;
  accent: string;
  icon: LucideIcon;
  products: string[];
};

const categories: Category[] = [
  {
    title: "Patient Chairs",
    maker: "Haelvoet",
    image: "/images/chair1.png",
    imageClass: "chair-one",
    accent: "#087d68",
    icon: Armchair,
    products: ["Care Chairs", "Ward Chairs", "Rehabilitation Chairs", "Geriatric Chairs"],
  },
  {
    title: "Treatment Chairs",
    maker: "Greiner",
    image: "/images/chair2.png",
    imageClass: "chair-two",
    accent: "#063b91",
    icon: Accessibility,
    products: [
      "Infusion Chairs",
      "Chemotherapy Chairs",
      "Dialysis Chairs",
      "Blood Collection Chairs",
      "Procedure Chairs",
    ],
  },
  {
    title: "Gynecology",
    maker: "Promotal",
    image: "/images/chair3.png",
    imageClass: "chair-three",
    accent: "#7a2396",
    icon: Venus,
    products: ["Examination Chairs", "Procedure Chairs"],
  },
  {
    title: "Patient Stretchers",
    maker: "Novak-M",
    image: "/images/chair3.png",
    imageClass: "chair-three",
    accent: "#008b99",
    icon: Bed,
    products: ["Hydraulic Stretchers", "Electric Stretchers", "X-ray Compatible Stretchers"],
  },
  {
    title: "Medical Carts",
    maker: "La Pastilla",
    image: "/images/chair3.png",
    imageClass: "chair-three",
    accent: "#c81d2b",
    icon: Hospital,
    products: ["Emergency Carts", "Anaesthesia Carts", "Dressing Carts", "Treatment Carts"],
  },
];

export const metadata = {
  title: "Professional Healthcare Furniture & Equipment | Woittola",
  description:
    "High-quality healthcare furniture and equipment from leading European manufacturers.",
};

export default function HomePage() {
  return (
    <main className="home-page">
      <SiteHeader activePage="home" />

      <section className="hero-section">
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              Professional
              <br />
              Healthcare
              <br />
              Furniture &amp; Equipment
            </h1>
            <p>
              High-quality solutions from leading European manufacturers.
              <br className="desktop-break" /> Designed for patients. Built for professionals.
            </p>

            <div className="hero-actions">
              <Link className="button button-primary" href="/catalogue">
                Explore Products
              </Link>
              <Link className="button button-secondary" href="/contact#contact-form">
                Request a Quote
              </Link>
            </div>

            <div className="trust-list" aria-label="Our commitments">
              <div className="trust-item">
                <ShieldCheck aria-hidden="true" />
                <span>
                  Trusted European
                  <br /> Manufacturers
                </span>
              </div>
              <div className="trust-item">
                <BadgeCheck aria-hidden="true" />
                <span>
                  High Quality
                  <br /> &amp; Durability
                </span>
              </div>
              <div className="trust-item">
                <CirclePlus aria-hidden="true" />
                <span>
                  Designed for
                  <br /> Healthcare Professionals
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="category-section" aria-label="Product categories">
        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <article className="category-card" key={category.title}>
                <div className={`category-image ${category.imageClass}`}>
                  <Image
                    src={category.image}
                    alt={`${category.title} by ${category.maker}`}
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
                    <h2>{category.title}</h2>
                    <p className="maker">by {category.maker}</p>
                    <ul>
                      {category.products.map((product) => (
                        <li key={product}>{product}</li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    className="category-link"
                    href="/catalogue/treatment-chairs"
                    style={{ color: category.accent }}
                  >
                    View products <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="secondary-grid" id="extended-products">
          <article className="secondary-card secondary-product-card">
            <div className="secondary-media medical-table-media">
              <Image
                src="/images/medical-table-generated.png"
                alt="Medical examination table"
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
              <h2>Medical Tables</h2>
              <p className="secondary-maker">by AGA</p>
              <ul>
                <li>Examination Tables</li>
                <li>Ultrasound Tables</li>
                <li>Tilt Tables</li>
                <li>Radiology Tables</li>
              </ul>
              <Link className="secondary-link teal-link" href="/catalogue/treatment-chairs">
                View products <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="secondary-card coming-card ent-card">
            <div className="coming-icon ent-icon">
              <Ear size={54} strokeWidth={1.45} aria-hidden="true" />
            </div>
            <div className="coming-content">
              <h2>ENT Solutions</h2>
              <p className="secondary-maker">by Otopront</p>
              <div className="coming-divider" />
              <p className="coming-label">Coming Soon</p>
              <p className="coming-description">
                Advanced ENT chairs, treatment units and equipment solutions.
              </p>
              <Link className="secondary-link" href="/catalogue">
                Learn more <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="secondary-card secondary-product-card">
            <div className="secondary-media work-stools-media">
              <Image
                src="/images/work-stool.jpg"
                alt="Chrome height-adjustable healthcare work stool"
                fill
                sizes="(min-width: 1100px) 220px, (min-width: 640px) 45vw, 90vw"
                unoptimized
              />
              <div className="secondary-badge navy-badge">
                <Armchair size={29} strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>
            <div className="secondary-content">
              <h2>Work Stools</h2>
              <p className="secondary-maker">Professional seating</p>
              <ul>
                <li>Medical Stools</li>
                <li>Operator Stools</li>
                <li>Height-adjustable Seating</li>
              </ul>
              <Link className="secondary-link navy-link" href="/catalogue/treatment-chairs">
                View products <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="secondary-card coming-card maternity-card">
            <div className="coming-icon maternity-icon">
              <Baby size={54} strokeWidth={1.45} aria-hidden="true" />
            </div>
            <div className="coming-content">
              <h2>Maternity</h2>
              <p className="secondary-maker">by Famed</p>
              <div className="coming-divider" />
              <p className="coming-label">Coming Soon</p>
              <p className="coming-description">Delivery beds, baby cots and maternity solutions.</p>
              <Link className="secondary-link" href="/catalogue">
                Learn more <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="secondary-card secondary-product-card">
            <div className="secondary-media protection-media">
              <Image
                src="/images/face-protection-generated.png"
                alt="Clear medical face shield"
                fill
                sizes="(min-width: 1100px) 300px, (min-width: 640px) 45vw, 90vw"
                unoptimized
              />
              <div className="secondary-badge navy-badge">
                <ShieldCheck size={29} strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>
            <div className="secondary-content compact-secondary-content">
              <h2>Face Protection</h2>
              <p className="secondary-maker">by MeGUARD</p>
              <ul>
                <li>Face Shields</li>
                <li>Protective Films</li>
                <li>Accessories</li>
              </ul>
              <Link className="secondary-link navy-link" href="/catalogue/treatment-chairs">
                View products <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="why-section" id="about-us" aria-labelledby="why-title">
        <h2 className="section-title" id="why-title">
          <span>Why Choose Woittola?</span>
        </h2>
        <div className="why-panel">
          <article className="why-item">
            <ShieldCheck aria-hidden="true" />
            <div>
              <h3>Selected European Manufacturers</h3>
              <p>We work with leading specialists in their fields.</p>
            </div>
          </article>
          <article className="why-item">
            <UsersRound aria-hidden="true" />
            <div>
              <h3>Specialised Solutions</h3>
              <p>Products designed for specific medical applications.</p>
            </div>
          </article>
          <article className="why-item">
            <Headphones aria-hidden="true" />
            <div>
              <h3>Expert Product Support</h3>
              <p>We help you find the right solution for your needs.</p>
            </div>
          </article>
          <article className="why-item">
            <FileText aria-hidden="true" />
            <div>
              <h3>Tailored Quotes</h3>
              <p>Request a quote and receive a personalised offer.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="partners-section" id="partners" aria-labelledby="partners-title">
        <h2 id="partners-title">Our Trusted Manufacturing Partners</h2>
        <div className="partner-grid">
          {partners.map((partner) => (
            <div className="partner-wordmark" key={partner.name}>
              <strong>{partner.name}</strong>
              <span>{partner.tagline}</span>
            </div>
          ))}
        </div>
        <p>More partners and solutions coming soon.</p>
      </section>

      <section className="support-section" id="support">
        <div className="support-copy">
          <Headphones aria-hidden="true" />
          <div>
            <h2>Need help finding the right solution?</h2>
            <p>Our team is ready to support you.</p>
          </div>
        </div>
        <Link className="support-button" href="/contact" id="contact">
          Contact us today
        </Link>
      </section>
    </main>
  );
}
