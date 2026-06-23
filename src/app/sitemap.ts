import type { MetadataRoute } from "next";
import { localizedPath, locales } from "@/lib/i18n/config";
import { MARKET_ENTRIES, STATE_ENTRIES, SITE } from "@/lib/markets/seo";
import { GUIDE_CHAPTERS } from "@/lib/guide/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/how-it-works", priority: 0.9, freq: "monthly" },
    { path: "/pricing", priority: 0.9, freq: "monthly" },
    { path: "/demo", priority: 0.7, freq: "monthly" },
    { path: "/legal/terms", priority: 0.3, freq: "yearly" },
    { path: "/legal/privacy", priority: 0.3, freq: "yearly" },
  ];

  // Bilingual marketing routes — each carries hreflang alternates.
  const localized: MetadataRoute.Sitemap = routes.flatMap((r) =>
    locales.map((loc) => ({
      url: `${SITE}${localizedPath(r.path, loc)}`,
      lastModified: now,
      changeFrequency: r.freq,
      priority: loc === "en" ? r.priority : Math.round(r.priority * 90) / 100,
      alternates: {
        languages: {
          en: `${SITE}${localizedPath(r.path, "en")}`,
          es: `${SITE}${localizedPath(r.path, "es")}`,
        },
      },
    }))
  );

  // Programmatic /markets tree (English-only): hub → states → cities.
  const markets: MetadataRoute.Sitemap = [
    { url: `${SITE}/markets`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...STATE_ENTRIES.map((s) => ({
      url: s.url,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...MARKET_ENTRIES.map((e) => ({
      url: e.url,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  // Section 8 execution playbook (English-only): hub + chapters.
  const guide: MetadataRoute.Sitemap = GUIDE_CHAPTERS.length
    ? [
        { url: `${SITE}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        ...GUIDE_CHAPTERS.map((c) => ({
          url: `${SITE}/guide/${c.slug}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
      ]
    : [];

  return [...localized, ...markets, ...guide];
}
