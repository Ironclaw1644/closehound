"use client";

import type { ClientDeal } from "./types";
import { fmtUSD, fmtPct, fmtDscr } from "@/lib/format";
import { ScoreBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDictionary, type Locale } from "@/lib/i18n";

/** Side-by-side comparison of 2–4 screened deals. Apples-to-apples: they all
 *  share the current live assumptions (same client-side underwrite). */
export function DealCompare({
  deals,
  onClose,
  locale = "en",
}: {
  deals: ClientDeal[];
  onClose: () => void;
  locale?: Locale;
}) {
  const t = getDictionary(locale).app;
  if (deals.length < 2) return null;

  // The winning column = highest Deal Score (ties → first).
  const bestIdx = deals.reduce((best, d, i) => (d.underwriting.dealScore > deals[best].underwriting.dealScore ? i : best), 0);

  const rows: Array<{ label: string; cell: (d: ClientDeal) => React.ReactNode; highlight?: boolean }> = [
    { label: t.dealTable.price, cell: (d) => fmtUSD(d.listing.price) },
    { label: t.dealTable.safmrRent, cell: (d) => fmtUSD(d.underwriting.grossRent) },
    {
      label: t.dealTable.netCf,
      highlight: true,
      cell: (d) => (
        <span className={cn(d.underwriting.netCashFlowMonthly >= 0 ? "text-success" : "text-destructive")}>
          {fmtUSD(d.underwriting.netCashFlowMonthly)}
        </span>
      ),
    },
    { label: t.dealTable.cashCash, cell: (d) => fmtPct(d.underwriting.cashOnCashPct) },
    { label: t.dealTable.capRate, cell: (d) => fmtPct(d.underwriting.capRatePct) },
    { label: t.dealTable.rentPrice, cell: (d) => fmtPct(d.underwriting.rentToPricePct, 2) },
    { label: t.dealTable.dscr, cell: (d) => fmtDscr(d.underwriting.dscr) },
    { label: t.dealTable.dom, cell: (d) => d.listing.daysOnMarket ?? "—" },
    { label: t.drawer.propertyType, cell: (d) => d.listing.propertyType ?? "—" },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 max-h-[88vh] w-[min(92vw,920px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <h3 className="font-display text-xl">{t.compare.title}</h3>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">{t.drawer.close}</button>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr>
                <th className="w-32 px-2 py-2" />
                {deals.map((d, i) => (
                  <th key={d.listing.rentcastId} className={cn("px-3 py-2 text-left align-bottom", i === bestIdx && "rounded-t-lg bg-primary/10")}>
                    <div className="flex flex-col gap-1.5">
                      <ScoreBadge score={d.underwriting.dealScore} className="self-start" />
                      <span className="line-clamp-2 text-xs font-medium leading-snug text-foreground">{d.listing.address ?? "—"}</span>
                      {i === bestIdx && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-success">{t.compare.best}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular">
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-border">
                  <td className="px-2 py-2.5 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">{r.label}</td>
                  {deals.map((d, i) => (
                    <td
                      key={d.listing.rentcastId}
                      className={cn("px-3 py-2.5 font-mono", r.highlight && "font-semibold", i === bestIdx && "bg-primary/10")}
                    >
                      {r.cell(d)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
