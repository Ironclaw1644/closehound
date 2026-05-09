import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_ORIGIN =
  process.env.PREVIEW_SITE?.trim().replace(/\/+$/, "") ||
  process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") ||
  "https://walkperro.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "WalkPerro — Conversion-grade websites for local businesses",
    template: "%s · WalkPerro",
  },
  description:
    "WalkPerro builds conversion-grade single-page websites for local service businesses — live in 7 days, $497 launch. Hosting, SSL, mobile-first design, Google Business setup included.",
  applicationName: "WalkPerro",
  authors: [{ name: "WalkPerro", url: SITE_ORIGIN }],
  creator: "WalkPerro",
  publisher: "WalkPerro",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "WalkPerro",
    locale: "en_US",
    url: SITE_ORIGIN,
    title: "WalkPerro — Conversion-grade websites for local businesses",
    description:
      "Conversion-grade single-page websites for local service businesses, live in 7 days for $497. Hosting, SSL, and Google Business setup included.",
    images: [
      {
        url: "/walkperro/og-default.png",
        width: 1200,
        height: 630,
        alt: "WalkPerro — The operator's hub for the AI era.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WalkPerro — Conversion-grade websites for local businesses",
    description:
      "Conversion-grade single-page websites, live in 7 days for $497.",
    images: ["/walkperro/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/walkperro/logo-mark.png",
    shortcut: "/walkperro/logo-mark.png",
    apple: "/walkperro/stripe-receipt-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
