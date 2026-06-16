import type { Metadata } from "next";
import { HowItWorksView } from "@/components/views/HowItWorksView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "How it works — Section 8 deal screening & methodology",
  description:
    "How CloseHound finds Section 8 rental deals: HUD SAFMR voucher rents, live listings, full underwriting (cash-on-cash, cap rate, rent-to-price, DSCR), and an honest A–F market grade. See our data sources and methodology.",
  alternates: { canonical: "/how-it-works", languages: languageAlternates("/how-it-works") },
};

export default function HowItWorksPage() {
  return <HowItWorksView locale="en" />;
}
