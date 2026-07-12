"use client";

import { useState } from "react";
import { isDemoMode } from "@/lib/env";
import { Button } from "@/components/ui/button";

/** Where a disabled demo billing CTA points instead of Stripe. */
export const DEMO_BILLING_URL = "https://www.walkperro.com/websites/ai-directory";

/** The one disabled-billing CTA used across demo mode: styled like a disabled
 *  button, links out to the walkperro listing instead of Stripe. */
export function DemoBillingLink({ className }: { className?: string }) {
  return (
    <a
      href={DEMO_BILLING_URL}
      className={
        "inline-flex h-10 w-full cursor-not-allowed items-center justify-center rounded-md border border-border bg-secondary/60 px-4 text-sm font-semibold text-muted-foreground opacity-60 transition hover:opacity-80 " +
        (className ?? "")
      }
    >
      demo — billing disabled
    </a>
  );
}

export function CheckoutButton({
  children,
  className,
  price,
  variant,
  next = "/pricing",
  busyLabel = "Redirecting…",
  errorLabel = "Checkout unavailable",
}: {
  children: React.ReactNode;
  className?: string;
  /** Stripe price ID to check out. */
  price: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  /** Where to send the user back after login if they're not signed in. */
  next?: string;
  busyLabel?: string;
  errorLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Demo mode: billing is disabled server-side too (the checkout API 403s) —
  // this renders the honest disabled state and links out to walkperro instead.
  if (isDemoMode()) {
    return (
      <div className={className}>
        <DemoBillingLink />
      </div>
    );
  }

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ price }),
      });
      if (res.status === 401) {
        location.href = `/login?next=${encodeURIComponent(next)}`;
        return;
      }
      const json = await res.json();
      if (json.url) {
        location.href = json.url;
        return;
      }
      setErr(json.error || errorLabel);
    } catch {
      setErr(errorLabel);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <Button onClick={go} disabled={busy} variant={variant} className="w-full">
        {busy ? busyLabel : children}
      </Button>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
