type FlagIconProps = {
  language: "en" | "fi";
  className?: string;
};

export default function FlagIcon({ language, className }: FlagIconProps) {
  return (
    <span className={className} aria-hidden="true">
      {language === "en" ? (
        <svg viewBox="0 0 60 36" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="36" fill="#012169" />
          <path d="M0 0 60 36M60 0 0 36" stroke="#fff" strokeWidth="8" />
          <path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" strokeWidth="3.8" />
          <path d="M30 0v36M0 18h60" stroke="#fff" strokeWidth="12" />
          <path d="M30 0v36M0 18h60" stroke="#c8102e" strokeWidth="7" />
        </svg>
      ) : (
        <svg viewBox="0 0 60 36" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="36" fill="#fff" />
          <path d="M0 18h60M19 0v36" stroke="#003580" strokeWidth="7" />
        </svg>
      )}
    </span>
  );
}
