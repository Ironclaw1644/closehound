import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloseHound",
  description: "Operator console for LeadHound and WalkPerro outreach.",
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
