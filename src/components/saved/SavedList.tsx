"use client";

import { useEffect, useState } from "react";
import { fmtUSD, fmtPct } from "@/lib/format";
import { ScoreBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDictionary, localizedPath, type Locale } from "@/lib/i18n";

const STATUSES = ["new", "reviewing", "offer", "passed"] as const;
type Status = (typeof STATUSES)[number];

interface SavedDeal {
  id: string;
  created_at: string;
  notes: string | null;
  status: Status | null;
  listing: { address?: string; price?: number } | null;
  underwriting: { dealScore?: number; cashOnCashPct?: number; capRatePct?: number } | null;
}

export function SavedList({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).app.saved;
  const [deals, setDeals] = useState<SavedDeal[] | null>(null);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((j) => setDeals(j.deals ?? []))
      .catch(() => setDeals([]));
  }, []);

  async function remove(id: string) {
    setDeals((d) => d?.filter((x) => x.id !== id) ?? null);
    await fetch(`/api/deals?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async function setStatus(id: string, status: Status) {
    setDeals((d) => d?.map((x) => (x.id === id ? { ...x, status } : x)) ?? null); // optimistic
    await fetch("/api/deals", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  }

  if (!deals) return <p className="text-sm text-muted-foreground">{t.loading}</p>;
  if (deals.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        {t.emptyLead}{" "}
        <a href={localizedPath("/screen", locale)} className="font-semibold text-gold hover:underline">
          {t.emptyLink}
        </a>
        .
      </p>
    );

  return (
    <div className="space-y-6">
      {STATUSES.map((s) => {
        const group = deals.filter((d) => (d.status ?? "new") === s);
        if (!group.length) return null;
        return (
          <div key={s}>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {t.status[s]} · {group.length}
            </h3>
            <div className="space-y-3">
              {group.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{d.listing?.address ?? "Listing"}</p>
                    <p className="tabular font-mono text-[13px] text-muted-foreground">
                      {fmtUSD(d.listing?.price)} · {t.coc} {fmtPct(d.underwriting?.cashOnCashPct)} · {t.cap}{" "}
                      {fmtPct(d.underwriting?.capRatePct)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <ScoreBadge score={d.underwriting?.dealScore ?? 0} />
                    <select
                      value={d.status ?? "new"}
                      onChange={(e) => setStatus(d.id, e.target.value as Status)}
                      aria-label={t.statusLabel}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                    >
                      {STATUSES.map((s2) => (
                        <option key={s2} value={s2}>
                          {t.status[s2]}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>{t.remove}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
