"use client";

import { useState } from "react";
import { marketsByOpportunity, GRADE_META, type Market } from "@/lib/config/assumptions";
import { GradeBadge } from "@/components/site/GradeBadge";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function MarketControls({
  market,
  marketId,
  onMarket,
  onCustomZip,
  bedrooms,
  onBedrooms,
  onRun,
  running,
}: {
  market: Market;
  marketId: string;
  onMarket: (id: string) => void;
  onCustomZip: (zip: string) => void;
  bedrooms: number;
  onBedrooms: (b: number) => void;
  onRun: () => void;
  running: boolean;
}) {
  const [zip, setZip] = useState("");
  const ordered = marketsByOpportunity();
  const meta = GRADE_META[market.grade];

  function submitZip(e: React.FormEvent) {
    e.preventDefault();
    const z = zip.trim();
    if (/^\d{5}$/.test(z)) onCustomZip(z);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market</CardTitle>
        <GradeBadge grade={market.grade} withLabel />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Select label="Target market (graded by cash-flow)" value={marketId} onChange={onMarket}>
          {ordered.map((m) => (
            <option key={m.id} value={m.id}>
              [{m.grade}] {m.label} · {m.state}
            </option>
          ))}
        </Select>

        <p className="rounded-md border border-hairline bg-background px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
          {meta.blurb}
        </p>

        <Select label="Bedrooms (voucher size)" value={String(bedrooms)} onChange={(v) => onBedrooms(Number(v))}>
          {[0, 1, 2, 3, 4].map((b) => (
            <option key={b} value={b}>
              {b === 0 ? "Studio" : `${b} Bedroom`}
            </option>
          ))}
        </Select>

        <Button onClick={onRun} disabled={running}>
          {running ? "Screening…" : "Run screen"}
        </Button>

        {/* Any-ZIP escape hatch — reach all 50 states. */}
        <form onSubmit={submitZip} className="mt-1 border-t border-hairline pt-3">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Or screen any ZIP
          </span>
          <div className="mt-1 flex gap-2">
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              inputMode="numeric"
              placeholder="e.g. 44105"
              className="tabular h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" variant="outline" size="sm" disabled={zip.length !== 5}>
              Load
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
