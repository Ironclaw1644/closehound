/**
 * Spanish surface (/es/...). The root <html lang> stays "en"; this wrapper marks
 * the Spanish subtree as `lang="es"` for assistive tech, and each /es page sets
 * Spanish metadata + hreflang alternates. The marketing surface is dark, same as
 * the English marketing pages (no data-surface override here).
 */
export default function EsLayout({ children }: { children: React.ReactNode }) {
  return <div lang="es">{children}</div>;
}
