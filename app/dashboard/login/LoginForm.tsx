"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth/AuthShell.module.css";

type LoginFormProps = {
  configured: boolean;
  passwordWasReset: boolean;
};

export default function LoginForm({ configured, passwordWasReset }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!configured) {
      setError("Sign-in is temporarily unavailable. Please try again shortly.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError("The email or password is incorrect. Please try again.");
        setSubmitting(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("We could not sign you in right now. Please try again shortly.");
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {passwordWasReset ? (
        <div className={`${styles.message} ${styles.success}`} role="status">
          <CheckCircle2 aria-hidden="true" /> Your password has been updated. Sign in with the new password.
        </div>
      ) : null}

      {error ? (
        <div className={`${styles.message} ${styles.error}`} role="alert">
          <AlertCircle aria-hidden="true" /> {error}
        </div>
      ) : null}

      <div className={styles.fieldGroup}>
        <label htmlFor="admin-email">Email address</label>
        <div className={styles.inputWrap}>
          <Mail className={styles.inputIcon} aria-hidden="true" />
          <input
            id="admin-email"
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
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="admin-password">Password</label>
        <div className={styles.inputWrap}>
          <LockKeyhole className={styles.inputIcon} aria-hidden="true" />
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={submitting}
          />
          <button
            className={styles.togglePassword}
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={submitting}
          >
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className={styles.formMeta}>
        <Link className={styles.textLink} href="/dashboard/forgot-password">Forgot password?</Link>
      </div>

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? <><span className={styles.spinner} aria-hidden="true" /> Signing in…</> : <>Sign in securely <ArrowRight aria-hidden="true" /></>}
      </button>

      <p className={styles.formFooter}>Access is limited to the approved Woittola administrator. There is no public registration.</p>
    </form>
  );
}
