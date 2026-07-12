import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { isDemoMode } from "@/lib/env";
import { DemoTourguide } from "@/components/DemoTourguide";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") ||
  "https://closehound.com";

// Demo deployments must never be indexed (duplicate of the real closehound).
const IS_DEMO = process.env.DEMO_MODE === "1";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "CloseHound — Find Section 8 rental deals that cash flow",
    template: "%s · CloseHound",
  },
  description:
    "CloseHound screens for-sale homes against HUD Section 8 voucher rents (SAFMR), underwrites each one, and ranks them by Deal Score — so you find properties where the government check beats the mortgage. All 50 states, graded by cash-flow opportunity.",
  applicationName: "CloseHound",
  keywords: [
    "Section 8 investing",
    "HUD voucher rent",
    "SAFMR",
    "Section 8 cash flow",
    "rental property deal finder",
    "Fair Market Rent calculator",
    "real estate underwriting",
    "Section 8 landlord",
    "buy and hold rental deals",
  ],
  authors: [{ name: "CloseHound" }],
  creator: "CloseHound",
  publisher: "WalkPerro",
  alternates: { canonical: "/" },
  robots: {
    index: !IS_DEMO,
    follow: !IS_DEMO,
    googleBot: { index: !IS_DEMO, follow: !IS_DEMO, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    siteName: "CloseHound",
    title: "CloseHound — Find Section 8 rental deals that cash flow",
    description:
      "Screen homes against HUD voucher rents, underwrite every property, and rank by Deal Score. All 50 states, graded by opportunity.",
    url: SITE_ORIGIN,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CloseHound — Sniff out the deal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloseHound — Find Section 8 rental deals that cash flow",
    description:
      "Screen homes against HUD voucher rents, underwrite every property, rank by Deal Score. All 50 states, graded by opportunity.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
  width: "device-width",
  initialScale: 1,
};

const ORG_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#organization`,
      name: "CloseHound",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/icon.png`,
      description:
        "CloseHound is a Section 8 (HUD housing-voucher) real-estate deal screener: it matches for-sale homes to HUD voucher rents, underwrites each one, and ranks them by Deal Score.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: SITE_ORIGIN,
      name: "CloseHound",
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }}
        />
        <Providers>{children}</Providers>
        {isDemoMode() && <DemoTourguide />}
      </body>
    </html>
  );
}
