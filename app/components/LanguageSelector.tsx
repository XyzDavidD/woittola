"use client";

import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import FlagIcon from "./FlagIcon";
import styles from "./LanguageSelector.module.css";
import type { DeepTranslated, Locale, Messages } from "../locales";
import { setLocale } from "../actions/set-locale";

type LanguageSelectorProps = {
  locale: Locale;
  labels: DeepTranslated<Messages>["languageSelector"];
  variant?: "desktop" | "mobile";
};

export default function LanguageSelector({ locale, labels, variant = "desktop" }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const selectorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const selectLanguage = (nextLocale: Locale) => {
    setSelectedLocale(nextLocale);
    setIsOpen(false);
    startTransition(async () => {
      await setLocale(nextLocale);
      router.refresh();
    });
  };

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

  if (variant === "mobile") {
    return (
      <div className={styles.mobileRoot} aria-label={labels.languages}>
        <span>{labels.choose}</span>
        <div>
          {(["en", "fi"] as const).map((language) => (
            <button
              className={selectedLocale === language ? styles.mobileActive : ""}
              type="button"
              aria-pressed={selectedLocale === language}
              onClick={() => selectLanguage(language)}
              key={language}
            >
              {language.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root} ref={selectorRef}>
      <button
        className={styles.trigger}
        type="button"
        aria-label={labels.select}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={styles.activeCode}>{selectedLocale.toUpperCase()}</span>
        <ChevronDown className={`${styles.chevron}${isOpen ? ` ${styles.open}` : ""}`} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={styles.menu} role="menu" aria-label={labels.languages}>
          <p>{labels.choose}</p>
          <button
            className={selectedLocale === "en" ? styles.optionActive : styles.option}
            type="button"
            role="menuitemradio"
            aria-checked={selectedLocale === "en"}
            onClick={() => selectLanguage("en")}
          >
            <FlagIcon className={styles.flag} language="en" />
            <span className={styles.optionLabel}>
              <strong>{labels.english}</strong>
              <small>{selectedLocale === "en" ? labels.current : labels.english}</small>
            </span>
            {selectedLocale === "en" ? <Check className={styles.check} aria-hidden="true" /> : null}
          </button>
          <button
            className={selectedLocale === "fi" ? styles.optionActive : styles.option}
            type="button"
            role="menuitemradio"
            aria-checked={selectedLocale === "fi"}
            onClick={() => selectLanguage("fi")}
          >
            <FlagIcon className={styles.flag} language="fi" />
            <span className={styles.optionLabel}>
              <strong>{labels.suomi}</strong>
              <small>{selectedLocale === "fi" ? labels.current : labels.finnish}</small>
            </span>
            {selectedLocale === "fi" ? <Check className={styles.check} aria-hidden="true" /> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}
