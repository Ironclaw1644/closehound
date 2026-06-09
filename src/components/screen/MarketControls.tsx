"use client";

import { DEFAULT_MARKETS } from "@/lib/config/assumptions";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function MarketControls({
  marketId,
  onMarket,
  bedrooms,
  onBedrooms,
  onRun,
  running,
}: {
  marketId: string;
  onMarket: (id: string) => void;
  bedrooms: number;
  onBedrooms: (b: number) => void;
  onRun: () => void;
  running: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Select label="Target market" value={marketId} onChange={onMarket}>
          {DEFAULT_MARKETS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} · {m.state}
            </option>
          ))}
        </Select>
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
      </CardContent>
    </Card>
  );
}
