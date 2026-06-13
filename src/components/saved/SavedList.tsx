"use client";

import { useEffect, useState } from "react";
import { fmtUSD, fmtPct } from "@/lib/format";
import { ScoreBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SavedDeal {
  id: string;
  created_at: string;
  notes: string | null;
  listing: { address?: string; price?: number } | null;
  underwriting: { dealScore?: number; cashOnCashPct?: number; capRatePct?: number } | null;
}

export function SavedList() {
  const [deals, setDeals] = useState<SavedDeal[] | null>(null);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((j) => setDeals(j.deals ?? []))
      .catch(() => setDeals([]));
  }, []);

  async function remove(id: string) {
    await fetch(`/api/deals?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setDeals((d) => d?.filter((x) => x.id !== id) ?? null);
  }

  if (!deals) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (deals.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        No saved deals yet — save deals from the{" "}
        <a href="/screen" className="font-semibold text-gold hover:underline">
          screener
        </a>
        .
      </p>
    );

  return (
    <div className="space-y-3">
      {deals.map((d) => (
        <div key={d.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="min-w-0">
            <p className="truncate font-medium">{d.listing?.address ?? "Listing"}</p>
            <p className="tabular font-mono text-[13px] text-muted-foreground">
              {fmtUSD(d.listing?.price)} · CoC {fmtPct(d.underwriting?.cashOnCashPct)} · cap{" "}
              {fmtPct(d.underwriting?.capRatePct)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ScoreBadge score={d.underwriting?.dealScore ?? 0} />
            <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
