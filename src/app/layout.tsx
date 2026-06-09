import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
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

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") ||
  "https://closehound.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "CloseHound — Sniff out the deal",
    template: "%s · CloseHound",
  },
  description:
    "CloseHound screens Section 8 (Housing Choice Voucher) rental deals — ranking for-sale properties by HUD voucher rent versus purchase price, underwritten and scored.",
  applicationName: "CloseHound",
  alternates: { canonical: "/" },
  // Pre-launch: keep the placeholder out of search indexes until the app ships.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable}`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
