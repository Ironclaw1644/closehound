import type { Metadata } from "next";
import { LegalView } from "@/components/views/LegalView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Términos del Servicio",
  description: "Los términos que rigen tu uso de CloseHound.",
  alternates: { canonical: "/es/legal/terms", languages: languageAlternates("/legal/terms") },
  robots: { index: true, follow: true },
};

export default function TermsPageEs() {
  return <LegalView locale="es" doc="terms" />;
}
