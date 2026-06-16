import type { Metadata } from "next";
import { LegalView } from "@/components/views/LegalView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CloseHound collects, uses, and protects your data.",
  alternates: { canonical: "/legal/privacy", languages: languageAlternates("/legal/privacy") },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <LegalView locale="en" doc="privacy" />;
}
