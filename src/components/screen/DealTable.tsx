"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import type { ClientDeal } from "./types";
import { fmtUSD, fmtPct, fmtDscr } from "@/lib/format";
import { ScoreBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDictionary, type Locale } from "@/lib/i18n";

const col = createColumnHelper<ClientDeal>();

export function DealTable({
  deals,
  onSelect,
  selectedId,
  locale = "en",
}: {
  deals: ClientDeal[];
  onSelect: (d: ClientDeal) => void;
  selectedId?: string | null;
  locale?: Locale;
}) {
  const t = getDictionary(locale).app.dealTable;
  const [sorting, setSorting] = useState<SortingState>([{ id: "dealScore", desc: true }]);

  const columns = useMemo(
    () => [
      col.accessor((d) => d.listing.address, { id: "address", header: t.address, cell: (c) => <span className="font-medium">{c.getValue() ?? "—"}</span>, enableSorting: false }),
      col.accessor((d) => d.listing.price, { id: "price", header: t.price, cell: (c) => fmtUSD(c.getValue()) }),
      col.accessor((d) => d.listing.beds, { id: "beds", header: t.br, cell: (c) => c.getValue() ?? "—" }),
      col.accessor((d) => d.underwriting.grossRent, { id: "rent", header: t.safmrRent, cell: (c) => fmtUSD(c.getValue()) }),
      col.accessor((d) => d.underwriting.netCashFlowMonthly, {
        id: "netcf",
        header: t.netCf,
        cell: (c) => <span className={cn(c.getValue() >= 0 ? "text-success" : "text-destructive")}>{fmtUSD(c.getValue())}</span>,
      }),
      col.accessor((d) => d.underwriting.cashOnCashPct, { id: "coc", header: t.cashCash, cell: (c) => fmtPct(c.getValue()) }),
      col.accessor((d) => d.underwriting.capRatePct, { id: "cap", header: t.capRate, cell: (c) => fmtPct(c.getValue()) }),
      col.accessor((d) => d.underwriting.rentToPricePct, { id: "rtp", header: t.rentPrice, cell: (c) => fmtPct(c.getValue(), 2) }),
      col.accessor((d) => d.underwriting.dscr, { id: "dscr", header: t.dscr, cell: (c) => fmtDscr(c.getValue()) }),
      col.accessor((d) => d.underwriting.dealScore, { id: "dealScore", header: t.score, cell: (c) => <ScoreBadge score={c.getValue()} /> }),
    ],
    [t]
  );

  const table = useReactTable({
    data: deals,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="bg-secondary/60 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
              {hg.headers.map((h, i) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className={cn(
                    "whitespace-nowrap px-3 py-2 font-medium",
                    i === 0 ? "text-left" : "text-right",
                    h.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                  )}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, ri) => {
            const d = row.original;
            const id = d.listing.rentcastId;
            return (
              <tr
                key={id}
                onClick={() => onSelect(d)}
                className={cn(
                  "tabular cursor-pointer border-t border-border transition hover:bg-secondary/50",
                  ri % 2 === 1 && "bg-secondary/30",
                  selectedId === id && "bg-primary/15"
                )}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <td key={cell.id} className={cn("whitespace-nowrap px-3 py-2.5", i === 0 ? "text-left" : "text-right font-mono")}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {deals.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
