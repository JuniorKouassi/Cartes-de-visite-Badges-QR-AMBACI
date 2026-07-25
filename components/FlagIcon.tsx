export function FlagIcon({ code, className = "h-3.5 w-5" }: { code: "fr" | "en"; className?: string }) {
  if (code === "fr") {
    return (
      <svg viewBox="0 0 3 2" className={`${className} rounded-[2px] shrink-0`} aria-hidden>
        <rect width="1" height="2" x="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 60 30" className={`${className} rounded-[2px] shrink-0`} aria-hidden>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
      <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
