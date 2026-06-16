// Locale config for CloseHound's bilingual site.
// English is served at the root (/, /pricing, …); Spanish at the /es prefix
// (/es, /es/pricing, …). The two are kept in lockstep by the typed dictionaries.

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(x: string | undefined | null): x is Locale {
  return !!x && (locales as readonly string[]).includes(x);
}

/** A clean route path (no locale prefix), e.g. "/", "/pricing", "/legal/terms". */
export type AppPath = string;

/** Map a clean path to its localized URL. en → "/path"; es → "/es/path". */
export function localizedPath(path: AppPath, locale: Locale): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return p;
  return p === "/" ? `/${locale}` : `/${locale}${p}`;
}

/** Strip a leading locale segment from a pathname → { locale, path }. */
export function splitLocale(pathname: string): { locale: Locale; path: AppPath } {
  const m = pathname.match(/^\/(es)(\/.*)?$/);
  if (m) return { locale: m[1] as Locale, path: m[2] || "/" };
  return { locale: defaultLocale, path: pathname || "/" };
}

/** hreflang alternates for a clean path, for metadata.alternates.languages. */
export function languageAlternates(path: AppPath): Record<string, string> {
  return {
    en: localizedPath(path, "en"),
    es: localizedPath(path, "es"),
    "x-default": localizedPath(path, "en"),
  };
}

/** Short label shown in the toggle for the *other* language. */
export const otherLocale: Record<Locale, Locale> = { en: "es", es: "en" };
