import type { Metadata } from "next";
import { LegalView } from "@/components/views/LegalView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of CloseHound.",
  alternates: { canonical: "/legal/terms", languages: languageAlternates("/legal/terms") },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return <LegalView locale="en" doc="terms" />;
}
