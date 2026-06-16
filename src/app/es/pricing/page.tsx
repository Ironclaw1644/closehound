import type { Metadata } from "next";
import { PricingView } from "@/components/views/PricingView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Precios — empieza gratis, escala cuando te pague",
  description:
    "Precios de CloseHound: 10 análisis de ofertas de la Sección 8 gratis sin tarjeta, paquetes de créditos de pago por uso y suscripciones Hunter / Closer / Agency. Sin cargos sorpresa por exceso.",
  alternates: { canonical: "/es/pricing", languages: languageAlternates("/pricing") },
};

export default function PricingPageEs() {
  return <PricingView locale="es" />;
}
