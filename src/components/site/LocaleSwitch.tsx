"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, splitLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * EN / ES language toggle. Each segment links to the current page's equivalent
 * URL in that locale (en at root, es at /es/...). Reads tokens, so it adapts to
 * both the dark marketing surface and the light app surface.
 */
export function LocaleSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() || "/";
  const { path } = splitLocale(pathname);

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border p-0.5",
        className
      )}
    >
      <GlobeIcon className="mx-1 h-3.5 w-3.5 text-muted-foreground" />
      {locales.map((l) => (
        <Link
          key={l}
          href={localizedPath(path, l)}
          prefetch={false}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition",
            l === locale
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </svg>
  );
}
