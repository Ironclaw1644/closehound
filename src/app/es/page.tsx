import type { Metadata } from "next";
import { HomeView } from "@/components/views/HomeView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "CloseHound — Encuentra ofertas de alquiler de la Sección 8 que generan flujo de caja",
  description:
    "CloseHound analiza casas en venta frente a las rentas de los vales de la Sección 8 de HUD (SAFMR), evalúa cada una y las clasifica por Puntuación de Oferta — para que encuentres propiedades donde el cheque del gobierno supera a la hipoteca. Los 50 estados, calificados por oportunidad de flujo de caja.",
  alternates: { canonical: "/es", languages: languageAlternates("/") },
};

export default function HomePageEs() {
  return <HomeView locale="es" />;
}
