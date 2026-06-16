import type { Metadata } from "next";
import { LegalView } from "@/components/views/LegalView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Cómo CloseHound recopila, usa y protege tus datos.",
  alternates: { canonical: "/es/legal/privacy", languages: languageAlternates("/legal/privacy") },
  robots: { index: true, follow: true },
};

export default function PrivacyPageEs() {
  return <LegalView locale="es" doc="privacy" />;
}
