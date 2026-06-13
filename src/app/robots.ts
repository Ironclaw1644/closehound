import type { MetadataRoute } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") || "https://closehound.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private app surfaces + API out of the index.
        disallow: ["/account", "/saved", "/login", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
