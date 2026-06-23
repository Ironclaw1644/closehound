import type { Metadata } from "next";
import { PricingView } from "@/components/views/PricingView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Pricing — start free, scale when it pays you",
  description:
    "CloseHound pricing: 100 free Section 8 deal screens with no card, pay-as-you-go credit packs, and Hunter / Closer / Agency subscriptions. One deal pays for years.",
  alternates: { canonical: "/pricing", languages: languageAlternates("/pricing") },
};

export default function PricingPage() {
  return <PricingView locale="en" />;
}
