"use client";

import type { ClientDeal } from "./types";
import { fmtUSD, fmtPct, fmtDscr } from "@/lib/format";
import { ScoreBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_WEIGHTS } from "@/lib/config/assumptions";

function Row({
  label,
  value,
  strong,
  tone,
  sub,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "good" | "bad";
  sub?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between py-1.5", strong && "border-t border-border pt-2")}>
      <span className={cn("text-sm", sub ? "pl-3 text-muted-foreground" : "text-muted-foreground", strong && "font-medium text-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "tabular text-sm",
          strong && "font-semibold",
          tone === "bad" && "text-destructive",
          tone === "good" && "text-success"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ScoreBar({ label, weight, norm }: { label: string; weight: number; norm: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {label} <span className="opacity-60">×{weight}</span>
        </span>
        <span className="tabular">{Math.round(norm * 100)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(norm * 100)}%` }} />
      </div>
    </div>
  );
}

export function DealDrawer({
  deal,
  onClose,
  onSave,
  saving,
  saved,
}: {
  deal: ClientDeal | null;
  onClose: () => void;
  onSave: (d: ClientDeal) => void;
  saving: boolean;
  saved: boolean;
}) {
  if (!deal) return null;
  const { underwriting: u, listing: l } = deal;
  const w = DEFAULT_WEIGHTS;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <aside
        id="deal-print"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="truncate font-display text-xl">{l.address ?? "Listing"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {fmtUSD(l.price)} · {l.beds ?? "—"} BR / {l.baths ?? "—"} BA ·{" "}
              {l.sqft ? `${l.sqft.toLocaleString()} sqft` : "—"}
              {l.yearBuilt ? ` · built ${l.yearBuilt}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ScoreBadge score={u.dealScore} className="h-8 min-w-[3rem] text-sm" />
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
              Close
            </button>
          </div>
        </div>

        <div className="space-y-6 p-5">
          {/* Cash-flow waterfall */}
          <section>
            <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Monthly cash-flow
            </h4>
            <Row label="Gross rent (SAFMR × payment std)" value={fmtUSD(u.grossRent)} />
            <Row label="− Variable opex (mgmt/vac/maint/capex)" value={`−${fmtUSD(u.opexVar)}`} sub />
            <Row label="− Fixed opex (tax/ins/HOA)" value={`−${fmtUSD(u.opexFix)}`} sub />
            <Row label="NOI / mo" value={fmtUSD(u.noiMonthly)} strong />
            <Row label="− P&I (debt service)" value={`−${fmtUSD(u.monthlyPI)}`} sub />
            <Row
              label="Net cash flow / mo"
              value={fmtUSD(u.netCashFlowMonthly)}
              strong
              tone={u.netCashFlowMonthly >= 0 ? "good" : "bad"}
            />
          </section>

          {/* Returns */}
          <section className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-background/40 p-4">
            <Metric label="Cash-on-cash" value={fmtPct(u.cashOnCashPct)} />
            <Metric label="Cap rate" value={fmtPct(u.capRatePct)} />
            <Metric label="Rent-to-price" value={fmtPct(u.rentToPricePct, 2)} />
            <Metric label="DSCR" value={fmtDscr(u.dscr)} />
            <Metric label="Cash in" value={fmtUSD(u.cashIn)} />
            <Metric label="Loan" value={fmtUSD(u.loan)} />
          </section>

          {/* Score breakdown */}
          <section className="space-y-2.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Deal Score = {u.dealScore}
            </h4>
            <ScoreBar label="Cash-on-cash" weight={w.cashOnCash} norm={u.scoreBreakdown.cashOnCash} />
            <ScoreBar label="Cap rate" weight={w.capRate} norm={u.scoreBreakdown.capRate} />
            <ScoreBar label="Rent-to-price" weight={w.rentToPrice} norm={u.scoreBreakdown.rentToPrice} />
            <ScoreBar label="DSCR" weight={w.dscr} norm={u.scoreBreakdown.dscr} />
          </section>

          {/* Source */}
          <p className="rounded-lg border border-border bg-background/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            Rent ceiling from HUD SAFMR (FY2026) for {l.beds ?? "—"} BR:{" "}
            <span className="tabular font-semibold text-foreground">{fmtUSD(deal.safmrMonthly)}</span>/mo.
            Property tax {l.annualTax ? `from listing (${fmtUSD(l.annualTax)}/yr)` : "estimated from tax-rate assumption"}.
          </p>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-border p-5 print:hidden">
          <Button onClick={() => onSave(deal)} disabled={saving || saved} className="flex-1">
            {saved ? "Saved ✓" : saving ? "Saving…" : "Save deal"}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print / PDF
          </Button>
        </div>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <span className="tabular text-[15px] font-semibold">{value}</span>
    </div>
  );
}
