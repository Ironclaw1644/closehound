import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";
import { PricingTable } from "@/components/billing/PricingTable";

export const metadata: Metadata = {
  title: "Pricing — start free, scale when it pays you",
  description:
    "CloseHound pricing: 10 free Section 8 deal screens with no card, pay-as-you-go credit packs, and Hunter / Closer / Agency subscriptions. No surprise overages.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-8 text-center sm:px-8">
            <Label accent className="justify-center">PRICING</Label>
            <h1 className="mt-5 font-display text-5xl leading-tight sm:text-6xl">
              <span className="text-gradient">Run your own screens.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
              Aggressive caching keeps API costs lean, so you screen your own markets without us
              eating the bill — and you never run up a charge you can’t see.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <PricingTable />
        </section>
      </main>
      <Footer />
    </>
  );
}
