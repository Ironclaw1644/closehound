import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Force HTTPS for 2 years on the apex + subdomains (long enough to hit
  // Chrome's HSTS preload list eligibility once we submit).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Block MIME-sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (especially preview slugs) when leaving the site.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable legacy Permissions APIs we don't use.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Prevent clickjacking — preview pages should never be iframed.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  // Security headers — applied site-wide.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  images: {
    remotePatterns: [
      // Supabase Storage (when re-enabled with legacy JWT key).
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/**",
      },
      // Gemini-served generated previews (transient).
      {
        protocol: "https",
        hostname: "generativelanguage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
