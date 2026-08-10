import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import styles from "./AuthShell.module.css";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.glowOne} aria-hidden="true" />
      <div className={styles.glowTwo} aria-hidden="true" />

      <Link className={styles.backLink} href="/">
        <ArrowLeft aria-hidden="true" />
        Back to website
      </Link>

      <section className={styles.shell} aria-label="Woittola administration sign in">
        <aside className={styles.brandPanel}>
          <div className={styles.brandTop}>
            <div className={styles.logoSurface}>
              <Image
                src="/images/logo.png"
                alt="Woittola Healthcare"
                width={296}
                height={50}
                priority
                unoptimized
              />
            </div>
            <span className={styles.secureBadge}><ShieldCheck aria-hidden="true" /> Secure admin</span>
          </div>

          <div className={styles.brandCopy}>
            <span className={styles.brandEyebrow}>Private workspace</span>
            <h2>Everything you need to manage Woittola.</h2>
            <p>A focused administration space for products and categories.</p>
          </div>

          <div className={styles.trustList}>
            <span><Check aria-hidden="true" /> Restricted to one approved administrator</span>
            <span><Check aria-hidden="true" /> Protected by encrypted Supabase sessions</span>
          </div>

          <div className={styles.brandLock} aria-hidden="true">
            <LockKeyhole />
          </div>
        </aside>

        <div className={styles.formPanel}>
          <div className={styles.mobileBrand}>
            <Image src="/images/logo.png" alt="Woittola Healthcare" width={237} height={40} priority unoptimized />
            <span><ShieldCheck aria-hidden="true" /> Secure admin</span>
          </div>

          <div className={styles.formContainer}>
            <header className={styles.formHeader}>
              <span>{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </header>
            {children}
          </div>

          <p className={styles.securityNote}><LockKeyhole aria-hidden="true" /> Protected administration area</p>
        </div>
      </section>
    </main>
  );
}
