import type { Metadata } from "next";
import { DemoView } from "@/components/views/DemoView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Watch the demo — see CloseHound find a Section 8 deal",
  description:
    "A 60-second walkthrough: pick a market, pull HUD voucher rents and live listings, underwrite every property, and rank the deals where the Section 8 check beats the mortgage.",
  alternates: { canonical: "/demo", languages: languageAlternates("/demo") },
};

export default function DemoPage() {
  return <DemoView locale="en" />;
}
