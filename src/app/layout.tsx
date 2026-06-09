import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#0E0E0E",
  width: "device-width",
  initialScale: 1,
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
