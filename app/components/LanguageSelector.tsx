"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import FlagIcon from "./FlagIcon";
import styles from "./LanguageSelector.module.css";

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className={styles.root} ref={selectorRef}>
      <button
        className={styles.trigger}
        type="button"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={styles.activeCode}>EN</span>
        <ChevronDown className={`${styles.chevron}${isOpen ? ` ${styles.open}` : ""}`} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={styles.menu} role="menu" aria-label="Languages">
          <p>Choose language</p>
          <button
            className={styles.optionActive}
            type="button"
            role="menuitemradio"
            aria-checked="true"
            onClick={() => setIsOpen(false)}
          >
            <FlagIcon className={styles.flag} language="en" />
            <span className={styles.optionLabel}>
              <strong>English</strong>
              <small>Current language</small>
            </span>
            <Check className={styles.check} aria-hidden="true" />
          </button>
          <button
            className={styles.option}
            type="button"
            role="menuitemradio"
            aria-checked="false"
            onClick={() => setIsOpen(false)}
          >
            <FlagIcon className={styles.flag} language="fi" />
            <span className={styles.optionLabel}>
              <strong>Suomi</strong>
              <small>Finnish</small>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
