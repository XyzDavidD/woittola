"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

type ContactFormProps = {
  ui: {
    fullName: string;
    organisation: string;
    email: string;
    phone: string;
    enquiryType: string;
    selectType: string;
    enquiryOptions: readonly string[];
    message: string;
    messagePlaceholder: string;
    consent: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
};

export default function ContactForm({ ui }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          name: formData.get("name"),
          organisation: formData.get("organisation"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          enquiryType: formData.get("enquiryType"),
          message: formData.get("message"),
          consent: formData.get("consent") === "on",
          website: formData.get("website"),
        }),
      });

      if (!response.ok) throw new Error("Email request failed");

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={submitEnquiry}>
      <div className="contact-form-row">
        <label>
          {ui.fullName}
          <input name="name" type="text" autoComplete="name" maxLength={120} required />
        </label>
        <label>
          {ui.organisation}
          <input name="organisation" type="text" autoComplete="organization" maxLength={160} />
        </label>
      </div>

      <div className="contact-form-row">
        <label>
          {ui.email}
          <input name="email" type="email" autoComplete="email" maxLength={254} required />
        </label>
        <label>
          {ui.phone}
          <input name="phone" type="tel" autoComplete="tel" maxLength={80} />
        </label>
      </div>

      <label>
        {ui.enquiryType}
        <select name="enquiryType" defaultValue="" required>
          <option value="" disabled>{ui.selectType}</option>
          {ui.enquiryOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>

      <label>
        {ui.message}
        <textarea name="message" rows={6} maxLength={5000} placeholder={ui.messagePlaceholder} required />
      </label>

      <label className="contact-consent">
        <input name="consent" type="checkbox" required />
        <span>{ui.consent}</span>
      </label>

      <label className="form-honeypot" aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      {status === "success" ? (
        <p className="form-status form-status-success" role="status">
          <CheckCircle2 aria-hidden="true" /> {ui.success}
        </p>
      ) : null}
      {status === "error" ? <p className="form-status form-status-error" role="alert">{ui.error}</p> : null}

      <button className="contact-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? ui.sending : ui.submit} <Send aria-hidden="true" />
      </button>
    </form>
  );
}
