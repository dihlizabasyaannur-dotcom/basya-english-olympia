import { cn } from "@/lib/utils";

/**
 * BEO monogram — an academic shield emblem holding an open book,
 * crowned by an achievement star, with the BEO letters.
 */
export function LogoMark({ className, title = "Basya English Olympia" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-10 w-10", className)} role="img" aria-label={title}>
      <defs>
        <linearGradient id="beo-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7957E8" />
          <stop offset="1" stopColor="#28204F" />
        </linearGradient>
      </defs>
      {/* shield */}
      <path d="M32 4 L56 12 V30 C56 45 45.5 55 32 60 C18.5 55 8 45 8 30 V12 Z" fill="url(#beo-shield)" />
      <path d="M32 7.5 L53 14.5 V30 C53 43 44 51.8 32 56.6 C20 51.8 11 43 11 30 V14.5 Z" fill="none" stroke="#E5C779" strokeWidth="1.4" opacity="0.9" />
      {/* star */}
      <path d="M32 10.5 l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z" fill="#E5C779" />
      {/* open book */}
      <path d="M17 41 C22 38.5 27 38.5 32 41 C37 38.5 42 38.5 47 41 V46 C42 43.5 37 43.5 32 46 C27 43.5 22 43.5 17 46 Z" fill="#EDE7FF" />
      <path d="M32 41 V46" stroke="#7957E8" strokeWidth="1" />
      {/* BEO letters */}
      <text x="32" y="35" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="12.5" letterSpacing="0.6" fill="#FFFFFF">BEO</text>
    </svg>
  );
}

export function Logo({ className, tone = "dark", showSignature = false }: { className?: string; tone?: "dark" | "light"; showSignature?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="leading-tight">
        <span className={cn("block font-display text-[15px] font-semibold tracking-[0.08em]", tone === "light" ? "text-white" : "text-ink")}>
          BASYA ENGLISH OLYMPIA
        </span>
        {showSignature && (
          <span className={cn("block text-[11px]", tone === "light" ? "text-lavender/80" : "text-muted")}>
            An English Learning Platform by Ma&apos;am Basya
          </span>
        )}
      </span>
    </span>
  );
}
