import Link from "next/link";
import { PLANS } from "@/lib/stripe/plans";
import { CheckoutButton } from "@/components/billing/CheckoutButton";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="block text-center font-display text-2xl">
        CloseHound
      </Link>
      <h1 className="mt-8 text-center font-display text-4xl">Run your own screens.</h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
        Aggressive caching keeps API costs lean, so you screen your own markets without us
        eating the bill — and you never run up a charge you can&apos;t see.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {PLANS.free.name}
          </p>
          <p className="mt-3 font-display text-4xl">$0</p>
          <p className="mt-1 text-sm text-muted-foreground">{PLANS.free.screens} screens / month</p>
          <Link
            href="/screen"
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-semibold hover:bg-secondary"
          >
            Start screening
          </Link>
        </div>

        <div className="rounded-xl border border-primary/50 bg-card p-6 ring-1 ring-primary/20">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{PLANS.pro.name}</p>
          <p className="mt-3 font-display text-4xl">
            ${PLANS.pro.pricePerMonth}
            <span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {PLANS.pro.screens} screens / month, then ${PLANS.pro.overagePerScreen}/screen
          </p>
          <CheckoutButton className="mt-6">Upgrade to Pro</CheckoutButton>
        </div>
      </div>
    </main>
  );
}
