"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (res.status === 401) {
        location.href = "/login?next=/pricing";
        return;
      }
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
      <Button onClick={go} disabled={busy} className="w-full">
        {busy ? "Redirecting…" : children}
      </Button>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
