"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  children,
  className,
  price,
  variant,
  next = "/pricing",
}: {
  children: React.ReactNode;
  className?: string;
  /** Stripe price ID to check out. */
  price: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  /** Where to send the user back after login if they're not signed in. */
  next?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
      setErr(json.error || "Checkout unavailable");
    } catch {
      setErr("Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <Button onClick={go} disabled={busy} variant={variant} className="w-full">
        {busy ? "Redirecting…" : children}
      </Button>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
