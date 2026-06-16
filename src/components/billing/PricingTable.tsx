"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, CREDIT_PACKS, type Plan } from "@/lib/stripe/plans";
import { CheckoutButton } from "./CheckoutButton";
import type { Dictionary } from "@/lib/i18n";

const PAID: Plan[] = [PLANS.hunter, PLANS.closer, PLANS.agency];

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function PricingTable({ t, planCopy }: { t: Dictionary["pricing"]; planCopy: Dictionary["plans"] }) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Billing cadence toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm ${annual ? "text-muted-foreground" : "text-foreground"}`}>{t.monthly}</span>
        <button
          type="button"
          onClick={() => setAnnual((a) => !a)}
          aria-label={t.annual}
          className="relative h-7 w-12 rounded-full border border-border bg-secondary transition"
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary transition-all ${annual ? "left-6" : "left-0.5"}`} />
        </button>
        <span className={`text-sm ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          {t.annual} <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">{t.monthsFree}</span>
        </span>
      </div>

      {/* Subscription tiers */}
      <div className="mt-10 grid gap-5 lg:grid-cols-4">
        {/* Free */}
        <div className="flex flex-col rounded-xl border border-hairline bg-surface-1 p-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{PLANS.free.name}</p>
          <p className="mt-3 font-display text-4xl">$0</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{PLANS.free.screens} {t.screensOneTime}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{planCopy.free.blurb}</p>
          <ul className="mt-5 flex-1 space-y-2.5">
            {planCopy.free.features.map((f) => (
              <li key={f} className="flex gap-2 text-[13px] text-muted-foreground">
                <Check /> <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/screen"
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-semibold transition hover:bg-secondary"
          >
            {t.startFree}
          </Link>
        </div>

        {/* Paid tiers */}
        {PAID.map((p) => {
          const price = annual ? p.priceAnnual : p.priceMonthly;
          const priceId = annual ? p.annualPriceId : p.monthlyPriceId;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-xl border bg-surface-1 p-6 ${p.popular ? "border-primary/50 ring-1 ring-primary/20" : "border-hairline"}`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                  {t.mostPopular}
                </span>
              )}
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{p.name}</p>
              <p className="mt-3 font-display text-4xl">
                ${price}
                <span className="text-base text-muted-foreground">{annual ? t.perYearShort : t.perMonthShort}</span>
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">{p.screens.toLocaleString()} {t.screensPerMonth}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{planCopy[p.id].blurb}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {planCopy[p.id].features.map((f) => (
                  <li key={f} className="flex gap-2 text-[13px] text-muted-foreground">
                    <Check /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton price={priceId ?? ""} variant={p.popular ? "primary" : "outline"} className="mt-6" busyLabel={t.redirecting} errorLabel={t.checkoutError}>
                {t.get} {p.name}
              </CheckoutButton>
            </div>
          );
        })}
      </div>

      {/* Pay-as-you-go */}
      <div className="mt-6 rounded-xl border border-hairline bg-surface-1 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold">{t.scoutEyebrow}</p>
            <p className="mt-2 text-[15px] font-semibold">{t.scoutTitle}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{t.scoutSub}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {CREDIT_PACKS.map((pack) => (
              <div key={pack.key} className="flex w-[180px] flex-col rounded-lg border border-hairline bg-background p-4">
                <p className="font-display text-2xl">${pack.price}</p>
                <p className="text-[13px] text-muted-foreground">{pack.screens} {t.screens}</p>
                <CheckoutButton price={pack.priceId} variant="outline" className="mt-3" busyLabel={t.redirecting} errorLabel={t.checkoutError}>
                  {t.buyPack}
                </CheckoutButton>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-[13px] text-muted-foreground">{t.disclaimer}</p>
    </div>
  );
}
