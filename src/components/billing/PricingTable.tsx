"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, CREDIT_PACKS, type Plan } from "@/lib/stripe/plans";
import { CheckoutButton } from "./CheckoutButton";

const PAID: Plan[] = [PLANS.hunter, PLANS.closer, PLANS.agency];

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function PricingTable() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Billing cadence toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm ${annual ? "text-muted-foreground" : "text-foreground"}`}>Monthly</span>
        <button
          type="button"
          onClick={() => setAnnual((a) => !a)}
          aria-label="Toggle annual billing"
          className="relative h-7 w-12 rounded-full border border-border bg-secondary transition"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary transition-all ${annual ? "left-6" : "left-0.5"}`}
          />
        </button>
        <span className={`text-sm ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual <span className="font-mono text-[11px] text-primary">2 MONTHS FREE</span>
        </span>
      </div>

      {/* Subscription tiers */}
      <div className="mt-10 grid gap-5 lg:grid-cols-4">
        {/* Free */}
        <div className="flex flex-col rounded-xl border border-hairline bg-surface-1 p-6">
          <p className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">{PLANS.free.name}</p>
          <p className="mt-3 font-display text-4xl">$0</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{PLANS.free.screens} screens, one-time</p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{PLANS.free.blurb}</p>
          <ul className="mt-5 flex-1 space-y-2.5">
            {PLANS.free.features.map((f) => (
              <li key={f} className="flex gap-2 text-[13px] text-muted-foreground">
                <Check /> <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/screen"
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-semibold transition hover:bg-secondary"
          >
            Start free
          </Link>
        </div>

        {/* Paid tiers */}
        {PAID.map((p) => {
          const price = annual ? p.priceAnnual : p.priceMonthly;
          const priceId = annual ? p.annualPriceId : p.monthlyPriceId;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-xl border bg-surface-1 p-6 ${
                p.popular ? "border-primary/50 ring-1 ring-primary/20" : "border-hairline"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              )}
              <p className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">{p.name}</p>
              <p className="mt-3 font-display text-4xl">
                ${price}
                <span className="text-base text-muted-foreground">/{annual ? "yr" : "mo"}</span>
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {p.screens.toLocaleString()} screens / month
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{p.blurb}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[13px] text-muted-foreground">
                    <Check /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton
                price={priceId ?? ""}
                variant={p.popular ? "primary" : "outline"}
                className="mt-6"
              >
                Get {p.name}
              </CheckoutButton>
            </div>
          );
        })}
      </div>

      {/* Pay-as-you-go */}
      <div className="mt-6 rounded-xl border border-hairline bg-surface-1 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-wider text-gold">Scout · pay as you go</p>
            <p className="mt-2 text-[15px] font-semibold">No subscription. Credits never expire.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Perfect for hunting in bursts — top up only when you’re actively screening.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.key}
                className="flex w-[180px] flex-col rounded-lg border border-hairline bg-background p-4"
              >
                <p className="font-display text-2xl">${pack.price}</p>
                <p className="text-[13px] text-muted-foreground">{pack.screens} screens</p>
                <CheckoutButton price={pack.priceId} variant="outline" className="mt-3">
                  Buy pack
                </CheckoutButton>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-[13px] text-muted-foreground">
        No surprise overages. Run out of screens and the screener simply pauses until you upgrade or
        buy a pack — you’ll never run up a charge you can’t see. Cancel anytime.
      </p>
    </div>
  );
}
