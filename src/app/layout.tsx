import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloseHound",
  description: "Lead generation dashboard for preview sites and outreach tracking.",
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
