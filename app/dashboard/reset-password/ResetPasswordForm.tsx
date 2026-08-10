"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth/AuthShell.module.css";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 12) {
      setError("Use at least 12 characters for your administrator password.");
      return;
    }

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError("This recovery link is invalid or has expired. Request a new link and try again.");
        setSubmitting(false);
        return;
      }

      await supabase.auth.signOut();
      router.replace("/dashboard/login?reset=success");
      router.refresh();
    } catch {
      setError("We could not update the password right now. Please try again shortly.");
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error ? (
        <div className={`${styles.message} ${styles.error}`} role="alert">
          <AlertCircle aria-hidden="true" /> {error}
        </div>
      ) : null}

      <div className={styles.fieldGroup}>
        <label htmlFor="new-password">New password</label>
        <div className={styles.inputWrap}>
          <KeyRound className={styles.inputIcon} aria-hidden="true" />
          <input
            id="new-password"
            name="new-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            autoComplete="new-password"
            minLength={12}
            required
            disabled={submitting}
          />
          <button
            className={styles.togglePassword}
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide passwords" : "Show passwords"}
          >
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </div>
        <span className={styles.helperText}>Use at least 12 characters. A unique passphrase is recommended.</span>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="confirm-password">Confirm password</label>
        <div className={styles.inputWrap}>
          <LockKeyhole className={styles.inputIcon} aria-hidden="true" />
          <input
            id="confirm-password"
            name="confirm-password"
            type={showPassword ? "text" : "password"}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Repeat your new password"
            autoComplete="new-password"
            minLength={12}
            required
            disabled={submitting}
          />
        </div>
      </div>

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? <><span className={styles.spinner} aria-hidden="true" /> Updating password…</> : <>Update password <ArrowRight aria-hidden="true" /></>}
      </button>
    </form>
  );
}
