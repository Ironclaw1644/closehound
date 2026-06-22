"use client";

import type { ClientDeal } from "./types";
import { fmtUSD, fmtPct, fmtDscr } from "@/lib/format";
import { ScoreBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_WEIGHTS } from "@/lib/config/assumptions";
import { getDictionary, type Locale } from "@/lib/i18n";

function Row({ label, value, strong, tone, sub }: { label: string; value: string; strong?: boolean; tone?: "good" | "bad"; sub?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-1.5", strong && "border-t border-border pt-2")}>
      <span className={cn("text-sm", sub ? "pl-3 text-muted-foreground" : "text-muted-foreground", strong && "font-medium text-foreground")}>{label}</span>
      <span className={cn("tabular text-sm", strong && "font-semibold", tone === "bad" && "text-destructive", tone === "good" && "text-success")}>{value}</span>
    </div>
  );
}

function ScoreBar({ label, weight, norm }: { label: string; weight: number; norm: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label} <span className="opacity-60">×{weight}</span></span>
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
  locale = "en",
}: {
  deal: ClientDeal | null;
  onClose: () => void;
  onSave: (d: ClientDeal) => void;
  saving: boolean;
  saved: boolean;
  locale?: Locale;
}) {
  const t = getDictionary(locale).app.drawer;
  if (!deal) return null;
  const { underwriting: u, listing: l } = deal;
  const w = DEFAULT_WEIGHTS;
  const beds = Math.min(Math.max(l.beds ?? 3, 0), 4);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <aside id="deal-print" className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="truncate font-display text-xl">{l.address ?? t.listing}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {fmtUSD(l.price)} · {l.beds ?? "—"} {t.br} / {l.baths ?? "—"} {t.ba} ·{" "}
              {l.sqft ? `${l.sqft.toLocaleString()} ${t.sqft}` : "—"}
              {l.yearBuilt ? ` · ${t.built} ${l.yearBuilt}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ScoreBadge score={u.dealScore} className="h-8 min-w-[3rem] text-sm" />
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">{t.close}</button>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t.monthlyCashflow}</h4>
            <Row label={t.grossRent} value={fmtUSD(u.grossRent)} />
            <Row label={t.varOpex} value={`−${fmtUSD(u.opexVar)}`} sub />
            <Row label={t.fixOpex} value={`−${fmtUSD(u.opexFix)}`} sub />
            <Row label={t.noi} value={fmtUSD(u.noiMonthly)} strong />
            <Row label={t.pi} value={`−${fmtUSD(u.monthlyPI)}`} sub />
            <Row label={t.netCf} value={fmtUSD(u.netCashFlowMonthly)} strong tone={u.netCashFlowMonthly >= 0 ? "good" : "bad"} />
          </section>

          <section className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-background/40 p-4">
            <Metric label={t.cashOnCash} value={fmtPct(u.cashOnCashPct)} />
            <Metric label={t.capRate} value={fmtPct(u.capRatePct)} />
            <Metric label={t.rentToPrice} value={fmtPct(u.rentToPricePct, 2)} />
            <Metric label={t.dscr} value={fmtDscr(u.dscr)} />
            <Metric label={t.cashIn} value={fmtUSD(u.cashIn)} />
            <Metric label={t.loan} value={fmtUSD(u.loan)} />
          </section>

          {(l.propertyType || l.daysOnMarket != null || l.priceCutFrom != null || l.address) && (
            <section className="space-y-1">
              <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t.listingFacts}</h4>
              {l.propertyType && <Row label={t.propertyType} value={l.propertyType} />}
              {l.daysOnMarket != null && <Row label={t.daysOnMarket} value={`${l.daysOnMarket}`} />}
              {l.priceCutFrom != null && <Row label={t.priceCut} value={fmtUSD(l.priceCutFrom)} tone="good" />}
              {l.address && (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${l.address} for sale`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  {t.searchListing}
                </a>
              )}
            </section>
          )}

          <section className="space-y-2.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t.dealScore} {u.dealScore}</h4>
            <ScoreBar label={t.cashOnCash} weight={w.cashOnCash} norm={u.scoreBreakdown.cashOnCash} />
            <ScoreBar label={t.capRate} weight={w.capRate} norm={u.scoreBreakdown.capRate} />
            <ScoreBar label={t.rentToPrice} weight={w.rentToPrice} norm={u.scoreBreakdown.rentToPrice} />
            <ScoreBar label={t.dscr} weight={w.dscr} norm={u.scoreBreakdown.dscr} />
          </section>

          <p className="rounded-lg border border-border bg-background/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            {t.sourceCeiling} {beds} {t.sourceBr}{" "}
            <span className="tabular font-semibold text-foreground">{fmtUSD(deal.safmrMonthly)}</span>/mo
            {(l.beds ?? 0) > 4 ? t.source5plus : ""}. {t.sourcePropertyTax}{" "}
            {l.annualTax ? `${t.sourceFromListing} (${fmtUSD(l.annualTax)}/yr)` : t.sourceEstimated}.
          </p>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-border p-5 print:hidden">
          <Button onClick={() => onSave(deal)} disabled={saving || saved} className="flex-1">
            {saved ? t.saved : saving ? t.saving : t.saveDeal}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>{t.printPdf}</Button>
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
