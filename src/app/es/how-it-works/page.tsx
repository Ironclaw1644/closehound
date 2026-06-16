import type { Metadata } from "next";
import { HowItWorksView } from "@/components/views/HowItWorksView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Cómo funciona — análisis de ofertas de la Sección 8 y metodología",
  description:
    "Cómo CloseHound encuentra ofertas de alquiler de la Sección 8: rentas de vales HUD SAFMR, propiedades en vivo, evaluación completa (cash-on-cash, cap rate, renta-precio, DSCR) y una calificación de mercado honesta de la A a la F. Conoce nuestras fuentes de datos y metodología.",
  alternates: { canonical: "/es/how-it-works", languages: languageAlternates("/how-it-works") },
};

export default function HowItWorksPageEs() {
  return <HowItWorksView locale="es" />;
}
