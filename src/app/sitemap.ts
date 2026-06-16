import type { MetadataRoute } from "next";
import { localizedPath, locales } from "@/lib/i18n/config";

const SITE =
  process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") || "https://closehound.com";

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

  // Emit every route in both locales, each carrying hreflang alternates.
  return routes.flatMap((r) =>
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
}
