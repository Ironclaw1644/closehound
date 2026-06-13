"use client";

import type { ZipScreenRow } from "./types";
import { fmtUSD, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ZipTable({
  rows,
  selectedZip,
  onSelect,
}: {
  rows: ZipScreenRow[];
  selectedZip: string | null;
  onSelect: (zip: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary/60 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            <th className="px-3 py-2 text-left font-medium">ZIP</th>
            <th className="px-3 py-2 text-right font-medium">SAFMR</th>
            <th className="px-3 py-2 text-right font-medium">Median price</th>
            <th className="px-3 py-2 text-right font-medium">Rent / price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.zip}
              onClick={() => !r.insufficient && onSelect(r.zip)}
              className={cn(
                "border-t border-border transition",
                i % 2 === 1 && "bg-secondary/30",
                r.insufficient ? "opacity-45" : "cursor-pointer hover:bg-secondary/50",
                selectedZip === r.zip && "bg-primary/15"
              )}
            >
              <td className="px-3 py-2.5 font-mono font-medium">{r.zip}</td>
              <td className="tabular px-3 py-2.5 text-right font-mono">{fmtUSD(r.safmrMonthly)}</td>
              <td className="tabular px-3 py-2.5 text-right font-mono">{fmtUSD(r.medianSalePrice)}</td>
              <td className="tabular px-3 py-2.5 text-right font-mono font-semibold">
                {r.insufficient ? (
                  <span className="text-[11px] font-normal text-muted-foreground">insufficient data</span>
                ) : (
                  <span className={cn((r.zipRentToPricePct ?? 0) >= 1 ? "text-success" : "text-foreground")}>
                    {fmtPct(r.zipRentToPricePct, 2)}
                  </span>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">
                Run a screen to rank ZIPs by voucher rent vs. price.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
