import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";
import { GradeBadge } from "@/components/site/GradeBadge";
import { marketsByOpportunity, GRADE_META, type Grade } from "@/lib/config/assumptions";

export const metadata: Metadata = {
  title: "How it works — Section 8 deal screening & methodology",
  description:
    "How CloseHound finds Section 8 rental deals: HUD SAFMR voucher rents, live listings, full underwriting (cash-on-cash, cap rate, rent-to-price, DSCR), and an honest A–F market grade. See our data sources and methodology.",
  alternates: { canonical: "/how-it-works" },
};

const SCORE = [
  ["Cash-on-cash", "35%", "Annual pre-tax cash flow ÷ total cash invested. The number that actually pays you."],
  ["Cap rate", "25%", "Net operating income ÷ price. How hard the asset works regardless of financing."],
  ["Rent-to-price", "25%", "Voucher rent ÷ purchase price. The classic ‘1% rule’ lens, voucher-adjusted."],
  ["DSCR", "15%", "Net operating income ÷ debt service. Whether the rent comfortably covers the mortgage."],
];

const DATA = [
  ["HUD SAFMR", "Small Area Fair Market Rents — the official, ZIP-level voucher rent ceilings published by the U.S. Department of Housing and Urban Development."],
  ["Live listings", "For-sale properties and local market rents from licensed third-party real-estate data, refreshed and cached for speed."],
  ["Your assumptions", "Down payment, rate, taxes, insurance, vacancy, management, maintenance and capex — every input is visible and editable."],
];

export default function HowItWorksPage() {
  const ordered = marketsByOpportunity();
  const grades: Grade[] = ["A", "B", "C", "D", "F"];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-4xl px-5 pt-16 pb-8 sm:px-8">
            <Label accent>HOW IT WORKS</Label>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-6xl">
              The voucher beats the mortgage. We prove it, listing by listing.
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              Section 8 (the Housing Choice Voucher program) pays landlords a rent set by HUD — and in the
              right markets that government-backed rent is higher than what the open market pays for the
              same house. CloseHound finds those houses automatically and underwrites every one.
            </p>
          </div>
        </section>

        {/* Methodology */}
        <section id="methodology" className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
          <Label accent>THE DEAL SCORE</Label>
          <h2 className="mt-4 font-display text-4xl">How we score a deal, 0–100.</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Every property is underwritten with your assumptions, then scored on four weighted
            fundamentals. The deals where the math works rise to the top.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-hairline">
            {SCORE.map(([k, w, d], i) => (
              <div
                key={k}
                className={`grid grid-cols-[140px_60px_1fr] items-start gap-4 px-5 py-4 ${
                  i % 2 ? "bg-surface-1/40" : "bg-surface-1"
                }`}
              >
                <span className="font-semibold">{k}</span>
                <span className="font-mono text-primary">{w}</span>
                <span className="text-[14px] leading-relaxed text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Data */}
        <section id="data" className="border-y border-hairline bg-surface-1/40">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
            <Label gold>WHERE THE DATA COMES FROM</Label>
            <h2 className="mt-4 font-display text-4xl">Official numbers. No guesswork.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {DATA.map(([k, d]) => (
                <div key={k} className="rounded-xl border border-hairline bg-background p-5">
                  <h3 className="font-semibold">{k}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grading + full market list */}
        <section id="zones" className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <Label accent>OPPORTUNITY GRADES</Label>
          <h2 className="mt-4 font-display text-4xl">Every market, graded honestly.</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            We won’t waste your screens. Each market gets an A–F cash-flow grade so you spend your
            time where the voucher reliably beats the market — and skip the appreciation traps.
          </p>

          <div className="mt-8 space-y-8">
            {grades.map((g) => {
              const inGrade = ordered.filter((m) => m.grade === g);
              if (!inGrade.length) return null;
              return (
                <div key={g}>
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={g} withLabel />
                    <span className="text-[13px] text-muted-foreground">{GRADE_META[g].blurb}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {inGrade.map((m) => (
                      <span
                        key={m.id}
                        className="rounded-md border border-hairline bg-surface-1 px-2.5 py-1 text-[13px] text-muted-foreground"
                      >
                        {m.label} <span className="font-mono text-[11px] opacity-70">{m.state}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-[13px] text-muted-foreground">
            Don’t see your market? You can screen <strong className="text-foreground">any ZIP in the country</strong>{" "}
            from the screener — the curated list above is just where the opportunity is most concentrated.
          </p>
        </section>

        {/* CTA */}
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
            <h2 className="font-display text-4xl">Ready to find one?</h2>
            <Link
              href="/screen"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-[15px] font-semibold text-primary-foreground transition hover:brightness-95"
            >
              Start free — 10 screens
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
