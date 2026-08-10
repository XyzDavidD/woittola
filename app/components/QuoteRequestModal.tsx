"use client";

import { useEffect, useRef, useState } from "react";
import { PackageCheck, Send, X } from "lucide-react";

type QuoteRequestModalProps = {
  productName: string;
};

export default function QuoteRequestModal({ productName }: QuoteRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

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
      <button className="product-detail-quote" type="button" onClick={() => setIsOpen(true)}>
        Request a Quote
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
              aria-label="Close quote request"
              onClick={() => setIsOpen(false)}
            >
              <X aria-hidden="true" />
            </button>

            <div className="quote-modal-heading">
              <span className="quote-modal-icon">
                <PackageCheck aria-hidden="true" />
              </span>
              <div>
                <p>Product enquiry</p>
                <h2 id="quote-modal-title">Request a Quote</h2>
              </div>
            </div>

            <div className="quote-modal-product">
              <span>Selected product</span>
              <strong>{productName}</strong>
            </div>

            <form
              className="quote-modal-form"
              action={`mailto:contact@woittola.com?subject=${encodeURIComponent(
                `Quote request for ${productName}`,
              )}`}
              method="post"
              encType="text/plain"
            >
              <input name="Product" type="hidden" value={productName} />

              <div className="quote-modal-form-row">
                <label>
                  Full name *
                  <input ref={firstInputRef} name="Full name" type="text" autoComplete="name" required />
                </label>
                <label>
                  Organisation
                  <input name="Organisation" type="text" autoComplete="organization" />
                </label>
              </div>

              <div className="quote-modal-form-row">
                <label>
                  Email address *
                  <input name="Email" type="email" autoComplete="email" required />
                </label>
                <label>
                  Quantity
                  <input name="Quantity" type="number" min="1" defaultValue="1" />
                </label>
              </div>

              <label>
                Additional details
                <textarea
                  name="Message"
                  rows={4}
                  placeholder="Tell us about your facility, preferred configuration or delivery requirements."
                />
              </label>

              <div className="quote-modal-actions">
                <button className="quote-modal-cancel" type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button className="quote-modal-submit" type="submit">
                  Send Request <Send aria-hidden="true" />
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
