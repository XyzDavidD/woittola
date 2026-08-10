"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth/AuthShell.module.css";

export default function ForgotPasswordForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!configured) {
      setError("Password recovery is temporarily unavailable. Please try again shortly.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin;
      const redirectTo = `${siteUrl}/auth/callback?next=/dashboard/reset-password`;
      await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    } finally {
      // Use the same response whether or not an account exists to avoid revealing users.
      setSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className={styles.successState}>
        <span className={styles.successIcon}><Check aria-hidden="true" /></span>
        <h2>Check your inbox</h2>
        <p>If this email matches the administrator account, a secure password reset link is on its way.</p>
        <Link className={styles.backButton} href="/dashboard/login"><ArrowLeft aria-hidden="true" /> Back to sign in</Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error ? <div className={`${styles.message} ${styles.error}`} role="alert">{error}</div> : null}

      <div className={styles.fieldGroup}>
        <label htmlFor="recovery-email">Administrator email</label>
        <div className={styles.inputWrap}>
          <Mail className={styles.inputIcon} aria-hidden="true" />
          <input
            id="recovery-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@woittola.fi"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            required
            disabled={submitting}
          />
        </div>
        <span className={styles.helperText}>We will send a one-time recovery link to the administrator email.</span>
      </div>

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? <><span className={styles.spinner} aria-hidden="true" /> Sending link…</> : <>Send reset link <ArrowRight aria-hidden="true" /></>}
      </button>

      <p className={styles.formFooter}><Link className={styles.textLink} href="/dashboard/login">Return to sign in</Link></p>
    </form>
  );
}
