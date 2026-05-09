import Link from "next/link";
import { JsonLd } from "@/components/preview/JsonLd";
import { getPaletteForModel } from "@/lib/preview/palettes";
import type { PreviewModel } from "@/lib/preview/types";
import { getSiteOrigin } from "@/lib/preview/seo";

export type BreadcrumbItem = { label: string; href: string };

export function Breadcrumbs({
  model,
  trail,
}: {
  model: PreviewModel;
  trail: BreadcrumbItem[];
}) {
  const palette = getPaletteForModel(model);
  const origin = getSiteOrigin();

  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: t.label,
      item: t.href.startsWith("http") ? t.href : `${origin}${t.href}`,
    })),
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-6xl px-5 pt-6 sm:px-8"
    >
      <JsonLd data={ld} id={`bc-${trail[trail.length - 1]?.label?.toLowerCase().replace(/\s+/g, "-") ?? "page"}-jsonld`} />
      <ol className="flex flex-wrap items-center gap-2 text-[12px]" style={{ color: palette.textMuted }}>
        {trail.map((t, idx) => {
          const isLast = idx === trail.length - 1;
          return (
            <li key={t.label} className="flex items-center gap-2">
              {isLast ? (
                <span style={{ color: palette.text }} className="font-medium">{t.label}</span>
              ) : (
                <Link href={t.href} className="transition hover:opacity-80" style={{ color: palette.textMuted }}>
                  {t.label}
                </Link>
              )}
              {!isLast ? <span style={{ color: palette.border }}>/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
