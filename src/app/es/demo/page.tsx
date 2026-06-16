import type { Metadata } from "next";
import { DemoView } from "@/components/views/DemoView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Mira la demo — observa a CloseHound encontrar una oferta de la Sección 8",
  description:
    "Un recorrido de 60 segundos: elige un mercado, extrae las rentas de los vales de HUD y propiedades en vivo, evalúa cada propiedad y clasifica las ofertas donde el cheque de la Sección 8 supera a la hipoteca.",
  alternates: { canonical: "/es/demo", languages: languageAlternates("/demo") },
};

export default function DemoPageEs() {
  return <DemoView locale="es" />;
}
