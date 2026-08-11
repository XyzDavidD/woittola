import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/site";
import { productCategories } from "../data/catalogue";
import { getLocaleMessages } from "../locales/server";

export default async function SiteFooter() {
  const { messages } = await getLocaleMessages();
  const t = messages.footer;

  return (
    <footer className="site-footer">
      <div className="site-footer-accent" aria-hidden="true" />
      <div className="site-footer-shell">
        <div className="site-footer-main">
          <div className="site-footer-brand-column">
            <Link className="site-footer-logo" href="/" aria-label={messages.header.homeAria}>
              <Image src="/images/logo.png" alt="Woittola Healthcare" width={296} height={50} unoptimized />
            </Link>
            <p className="site-footer-statement">{t.statement}</p>
            <p className="site-footer-description">{t.description}</p>
          </div>

          <nav className="site-footer-column" aria-label={t.navigation}>
            <h2>{t.navigation}</h2>
            <Link href="/">{messages.header.home}</Link>
            <Link href="/catalogue">{messages.header.products}</Link>
            <Link href="/references">{messages.header.references}</Link>
            <Link href="/about">{messages.header.about}</Link>
            <Link href="/partners">{messages.header.partners}</Link>
            <Link href="/contact">{messages.header.contact}</Link>
          </nav>

          <nav className="site-footer-column site-footer-products" aria-label={t.productCategories}>
            <h2>{t.productCategories}</h2>
            {productCategories.map((category) => (
              <Link href={`/catalogue/${category.slug}`} key={category.slug}>
                {messages.categoryNames[category.slug]}
              </Link>
            ))}
          </nav>

          <div className="site-footer-contact">
            <p className="site-footer-contact-label">{t.contact}</p>
            <h2>{t.contactTitle}</h2>
            <p>{t.contactCopy}</p>
            <a href={CONTACT_EMAIL_HREF}>
              <span><Mail aria-hidden="true" /></span>
              <span><small>{t.emailUs}</small><strong>{CONTACT_EMAIL}</strong></span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>© {new Date().getFullYear()} Woittola Healthcare. {t.rights}</p>
          <span>{t.location}</span>
        </div>
      </div>
    </footer>
  );
}
