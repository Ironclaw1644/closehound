"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ZipScreenRow } from "./types";
import { fmtUSD, fmtPct } from "@/lib/format";
import { getDictionary, type Locale } from "@/lib/i18n";

export function OpportunityScatter({
  rows,
  selectedZip,
  onSelect,
  locale = "en",
}: {
  rows: ZipScreenRow[];
  selectedZip: string | null;
  onSelect: (zip: string) => void;
  locale?: Locale;
}) {
  const t = getDictionary(locale).app.scatter;
  const data = rows
    .filter((r) => !r.insufficient)
    .map((r) => ({ zip: r.zip, price: r.medianSalePrice, safmr: r.safmrMonthly, ratio: r.zipRentToPricePct }));

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        {t.empty}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 24, left: 4 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis type="number" dataKey="price" name={t.medianPrice} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
        <YAxis type="number" dataKey="safmr" name={t.safmr} tickFormatter={(v) => `$${v}`} stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
        <ZAxis type="number" dataKey="ratio" range={[60, 520]} name={t.rentPrice} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
          contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: "var(--foreground)" }}
          formatter={(value, name) =>
            name === t.medianPrice
              ? [fmtUSD(value as number), name]
              : name === t.safmr
                ? [fmtUSD(value as number), name]
                : [fmtPct(value as number, 2), t.rentPrice]
          }
        />
        <Scatter
          data={data}
          onClick={(d: { zip?: string; payload?: { zip?: string } }) => {
            const zip = d?.zip ?? d?.payload?.zip;
            if (zip) onSelect(zip);
          }}
          cursor="pointer"
        >
          {data.map((d) => (
            <Cell key={d.zip} fill={selectedZip === d.zip ? "var(--primary)" : "var(--info)"} fillOpacity={0.85} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
