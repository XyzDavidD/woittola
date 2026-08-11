"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, PackageCheck, Send, X } from "lucide-react";
import type { DeepTranslated, Messages } from "../locales";

type QuoteRequestModalProps = {
  productName: string;
  ui: DeepTranslated<Messages>["quote"];
};

export default function QuoteRequestModal({ productName, ui }: QuoteRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const firstInputRef = useRef<HTMLInputElement>(null);

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "quote",
          product: productName,
          name: formData.get("name"),
          organisation: formData.get("organisation"),
          email: formData.get("email"),
          quantity: formData.get("quantity"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });

      if (!response.ok) throw new Error("Quote request failed");

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button className="product-detail-quote" type="button" onClick={() => {
        setStatus("idle");
        setIsOpen(true);
      }}>
        {ui.trigger}
      </button>

      {isOpen ? (
        <div
          className="quote-modal-overlay"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsOpen(false);
          }}
        >
          <section
            className="quote-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-modal-title"
          >
            <button
              className="quote-modal-close"
              type="button"
              aria-label={ui.close}
              onClick={() => setIsOpen(false)}
            >
              <X aria-hidden="true" />
            </button>

            <div className="quote-modal-heading">
              <span className="quote-modal-icon">
                <PackageCheck aria-hidden="true" />
              </span>
              <div>
                <p>{ui.eyebrow}</p>
                <h2 id="quote-modal-title">{ui.title}</h2>
              </div>
            </div>

            <div className="quote-modal-product">
              <span>{ui.selected}</span>
              <strong>{productName}</strong>
            </div>

            <form className="quote-modal-form" onSubmit={submitQuote}>

              <div className="quote-modal-form-row">
                <label>
                  {ui.fullName}
                  <input ref={firstInputRef} name="name" type="text" autoComplete="name" maxLength={120} required />
                </label>
                <label>
                  {ui.organisation}
                  <input name="organisation" type="text" autoComplete="organization" maxLength={160} />
                </label>
              </div>

              <div className="quote-modal-form-row">
                <label>
                  {ui.email}
                  <input name="email" type="email" autoComplete="email" maxLength={254} required />
                </label>
                <label>
                  {ui.quantity}
                  <input name="quantity" type="number" min="1" max="100000" defaultValue="1" />
                </label>
              </div>

              <label>
                {ui.details}
                <textarea
                  name="message"
                  rows={4}
                  maxLength={5000}
                  placeholder={ui.placeholder}
                />
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

              <div className="quote-modal-actions">
                <button className="quote-modal-cancel" type="button" onClick={() => setIsOpen(false)}>
                  {ui.cancel}
                </button>
                <button className="quote-modal-submit" type="submit" disabled={status === "sending" || status === "success"}>
                  {status === "sending" ? ui.sending : ui.send} <Send aria-hidden="true" />
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
