"use client";

import { useState } from "react";
import { marketsByOpportunity, type Market } from "@/lib/config/assumptions";
import { GradeBadge } from "@/components/site/GradeBadge";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";

export function MarketControls({
  market,
  marketId,
  onMarket,
  onCustomZip,
  bedrooms,
  onBedrooms,
  onRun,
  running,
  locale = "en",
}: {
  market: Market;
  marketId: string;
  onMarket: (id: string) => void;
  onCustomZip: (zip: string) => void;
  bedrooms: number;
  onBedrooms: (b: number) => void;
  onRun: () => void;
  running: boolean;
  locale?: Locale;
}) {
  const t = getDictionary(locale).app.controls;
  const grades = getDictionary(locale).howItWorks.grades;
  const [zip, setZip] = useState("");
  const ordered = marketsByOpportunity();
  const gm = grades[market.grade];

  function submitZip(e: React.FormEvent) {
    e.preventDefault();
    const z = zip.trim();
    if (/^\d{5}$/.test(z)) onCustomZip(z);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <span className="inline-flex items-center gap-1.5">
          <GradeBadge grade={market.grade} />
          <span className="text-[11px] font-semibold text-muted-foreground">{gm.label}</span>
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Select label={t.targetMarket} value={marketId} onChange={onMarket}>
          {ordered.map((m) => (
            <option key={m.id} value={m.id}>
              [{m.grade}] {m.label} · {m.state}
            </option>
          ))}
        </Select>

        <p className="rounded-md border border-hairline bg-background px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
          {gm.blurb}
        </p>

        <Select label={t.bedrooms} value={String(bedrooms)} onChange={(v) => onBedrooms(Number(v))}>
          {[0, 1, 2, 3, 4].map((b) => (
            <option key={b} value={b}>
              {b === 0 ? t.studio : `${b} ${t.bedroom}`}
            </option>
          ))}
        </Select>

        <div className="flex flex-col gap-1.5">
          <Button onClick={onRun} disabled={running}>
            {running ? t.screening : t.runScreen}
          </Button>
          <span className="text-center text-[11px] text-muted-foreground">
            {market.zips.length === 1 ? t.usesOneScreen : t.usesScreens.replace("{n}", String(market.zips.length))}
          </span>
        </div>

        {/* Any-ZIP escape hatch — reach all 50 states. */}
        <form onSubmit={submitZip} className="mt-1 border-t border-hairline pt-3">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t.orAnyZip}
          </span>
          <div className="mt-1 flex gap-2">
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              inputMode="numeric"
              placeholder={t.zipPlaceholder}
              className="tabular h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" variant="outline" size="sm" disabled={zip.length !== 5}>
              {t.load}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
