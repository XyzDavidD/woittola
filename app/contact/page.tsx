import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  FileText,
  Headphones,
  Mail,
  PackageSearch,
  Send,
} from "lucide-react";
import SiteHeader from "../components/SiteHeader";

const supportOptions = [
  {
    icon: PackageSearch,
    title: "Product guidance",
    copy: "Tell us what your facility needs and we’ll help identify the right solution.",
  },
  {
    icon: FileText,
    title: "Quotes & projects",
    copy: "Receive a tailored proposal for individual products or complete projects.",
  },
  {
    icon: Headphones,
    title: "After-sales support",
    copy: "Contact our team for product information, documentation and ongoing support.",
  },
];

export const metadata = {
  title: "Contact & Support | Woittola",
  description:
    "Contact Woittola for product guidance, tailored healthcare equipment quotes and support.",
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <SiteHeader />

      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-hero-shell">
          <nav className="contact-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight aria-hidden="true" />
            <span aria-current="page">Contact &amp; Support</span>
          </nav>
          <div className="contact-hero-copy">
            <p className="contact-eyebrow">We’re here to help</p>
            <h1 id="contact-title">Contact &amp; Support</h1>
            <p>
              Whether you need help choosing a product, a tailored quote or support with an
              existing solution, our team will guide you to the right next step.
            </p>
          </div>
          <div className="contact-hero-meta" aria-label="Contact information">
            <a href="mailto:contact@woittola.com">
              <Mail aria-hidden="true" />
              <span>
                Email our team
                <strong>contact@woittola.com</strong>
              </span>
            </a>
            <div>
              <Clock3 aria-hidden="true" />
              <span>
                Response time
                <strong>Usually within one business day</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-content" id="support-options">
        <div className="contact-support-column">
          <p className="contact-section-label">How we can help</p>
          <h2>Professional support from first question to final delivery.</h2>
          <p className="contact-intro">
            Share a few details about your facility and requirements. We’ll connect you with
            the right product specialist.
          </p>

          <div className="contact-support-list">
            {supportOptions.map(({ icon: Icon, title, copy }) => (
              <article className="contact-support-item" key={title}>
                <div className="contact-support-icon">
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>

          <Link className="contact-products-link" href="/catalogue">
            Browse our products <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="contact-form-card" id="contact-form">
          <div className="contact-form-heading">
            <p>Send an enquiry</p>
            <h2>How can we help?</h2>
            <span>Fields marked with * are required.</span>
          </div>

          <form
            className="contact-form"
            action="mailto:contact@woittola.com?subject=Website%20enquiry"
            method="post"
            encType="text/plain"
          >
            <div className="contact-form-row">
              <label>
                Full name *
                <input name="Full name" type="text" autoComplete="name" required />
              </label>
              <label>
                Organisation
                <input name="Organisation" type="text" autoComplete="organization" />
              </label>
            </div>

            <div className="contact-form-row">
              <label>
                Email address *
                <input name="Email" type="email" autoComplete="email" required />
              </label>
              <label>
                Phone number
                <input name="Phone" type="tel" autoComplete="tel" />
              </label>
            </div>

            <label>
              What can we help with? *
              <select name="Enquiry type" defaultValue="" required>
                <option value="" disabled>
                  Select an enquiry type
                </option>
                <option>Product guidance</option>
                <option>Request a quote</option>
                <option>Project enquiry</option>
                <option>After-sales support</option>
                <option>General enquiry</option>
              </select>
            </label>

            <label>
              Your message *
              <textarea
                name="Message"
                rows={6}
                placeholder="Tell us about the products, quantities, facility or support you need."
                required
              />
            </label>

            <label className="contact-consent">
              <input name="Consent" type="checkbox" required />
              <span>
                I agree that Woittola may use these details to respond to my enquiry. *
              </span>
            </label>

            <button className="contact-submit" type="submit">
              Send enquiry <Send aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
