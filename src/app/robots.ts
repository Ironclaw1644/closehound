import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/preview/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/dashboard", "/dashboard/", "/claim/"],
      },
      // Allow major search engines explicitly. The wildcard above already
      // covers them, but being explicit removes any ambiguity around the
      // crawl-delay rules some bots respect.
      {
        userAgent: ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot"],
        allow: ["/"],
        disallow: ["/api/", "/dashboard", "/dashboard/", "/claim/"],
      },
      // AI crawlers — explicitly allow so previews can surface in
      // ChatGPT/Perplexity/Google AI Overviews.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
        ],
        allow: ["/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
