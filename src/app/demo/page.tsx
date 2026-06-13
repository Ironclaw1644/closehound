import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";

export const metadata: Metadata = {
  title: "Watch the demo — see CloseHound find a Section 8 deal",
  description:
    "A 60-second walkthrough: pick a market, pull HUD voucher rents and live listings, underwrite every property, and rank the deals where the Section 8 check beats the mortgage.",
  alternates: { canonical: "/demo" },
};

const STEPS = [
  "Pick a Prime Opportunity Zone — or drop in any ZIP.",
  "CloseHound pulls the HUD voucher rent ceiling for that area.",
  "It matches live for-sale listings and underwrites each one.",
  "Deals rank by Deal Score — the voucher-beats-mortgage homes float to the top.",
];

export default function DemoPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-4xl px-5 pt-16 pb-10 text-center sm:px-8">
            <Label accent live className="justify-center">THE 60-SECOND DEMO</Label>
            <h1 className="mt-5 font-display text-5xl leading-tight sm:text-6xl">
              <span className="text-gradient">Watch it sniff out a deal.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[16px] text-muted-foreground">
              From an empty screen to a ranked buy list — this is the whole loop.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-8 sm:px-8">
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <video
              className="aspect-video w-full bg-background"
              controls
              playsInline
              poster="/demo-poster.jpg"
              preload="metadata"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser doesn’t support embedded video.
            </video>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
          <Label>WHAT YOU’RE SEEING</Label>
          <ol className="mt-5 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                <span className="font-mono font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link
              href="/screen"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-[15px] font-semibold text-primary-foreground transition hover:brightness-95"
            >
              Try it free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
