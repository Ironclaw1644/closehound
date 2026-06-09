"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_MARKETS,
  DEFAULT_WEIGHTS,
  assumptionsForState,
  findMarket,
} from "@/lib/config/assumptions";
import { underwrite } from "@/lib/underwriting/engine";
import type { Assumptions } from "@/lib/underwriting/types";
import { downloadDealsCsv } from "@/lib/export-csv";
import type { ZipScreenRow, ListingsResponse, ClientDeal } from "./types";
import { MarketControls } from "./MarketControls";
import { AssumptionsPanel } from "./AssumptionsPanel";
import { ZipTable } from "./ZipTable";
import { OpportunityScatter } from "./OpportunityScatter";
import { DealTable } from "./DealTable";
import { DealDrawer } from "./DealDrawer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK =
  process.env.NEXT_PUBLIC_MOCK_MODE === "1" ||
  process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export function Dashboard() {
  const [marketId, setMarketId] = useState(DEFAULT_MARKETS[0].id);
  const market = findMarket(marketId)!;
  const [bedrooms, setBedrooms] = useState(3);
  const [assumptions, setAssumptions] = useState<Assumptions>(() => assumptionsForState(market.state));

  const [zipRows, setZipRows] = useState<ZipScreenRow[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [raw, setRaw] = useState<ListingsResponse | null>(null);
  const [loadingListings, setLoadingListings] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const onMarket = (id: string) => {
    setMarketId(id);
    const m = findMarket(id);
    if (m) setAssumptions((a) => ({ ...a, insuranceRatePct: assumptionsForState(m.state).insuranceRatePct }));
    setZipRows([]);
    setSelectedZip(null);
    setRaw(null);
  };

  const runScreen = useCallback(async () => {
    setRunning(true);
    setError(null);
    setSelectedZip(null);
    setRaw(null);
    try {
      const res = await fetch("/api/screen/zips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ zips: market.zips, bedrooms }),
      });
      if (res.status === 402) {
        setError("Out of screens for this period — upgrade to keep screening.");
        return;
      }
      const json = await res.json();
      setZipRows(json.rows ?? []);
    } catch {
      setError("Screen failed. Try again.");
    } finally {
      setRunning(false);
    }
  }, [market, bedrooms]);

  const selectZip = useCallback(async (zip: string) => {
    setSelectedZip(zip);
    setLoadingListings(true);
    setRaw(null);
    try {
      const res = await fetch("/api/screen/listings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ zip }),
      });
      if (res.status === 402) {
        setError("Out of screens — upgrade to keep screening.");
        return;
      }
      setRaw(await res.json());
    } catch {
      setError("Could not load listings.");
    } finally {
      setLoadingListings(false);
    }
  }, []);

  // Underwrite client-side — assumption tweaks re-score instantly, no re-billing.
  const deals: ClientDeal[] = useMemo(() => {
    if (!raw?.safmr) return [];
    const safmr = raw.safmr;
    return raw.listings
      .filter((l) => l.price != null && l.price > 0 && l.beds != null)
      .map((l): ClientDeal => {
        const beds = Math.min(Math.max(l.beds ?? 3, 0), 4);
        const safmrMonthly = safmr.br[beds];
        return {
          listing: l,
          safmrMonthly,
          underwriting: underwrite({
            price: l.price!,
            safmrMonthly,
            annualPropertyTax: l.annualTax,
            assumptions,
            weights: DEFAULT_WEIGHTS,
          }),
        };
      })
      .sort((a, b) => b.underwriting.dealScore - a.underwriting.dealScore);
  }, [raw, assumptions]);

  // Derive the open drawer deal from the live `deals` so assumption tweaks
  // re-score the open drawer too (no stale snapshot).
  const selectedDeal = deals.find((d) => d.listing.rentcastId === selectedDealId) ?? null;

  const saveDeal = useCallback(async (d: ClientDeal) => {
    setSaving(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listing: d.listing, underwriting: d.underwriting, safmrMonthly: d.safmrMonthly }),
      });
      if (res.ok) setSavedIds((s) => new Set(s).add(d.listing.rentcastId));
      else if (res.status === 401) setError("Sign in to save deals.");
    } catch {
      setError("Could not save.");
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl">CloseHound</span>
            <Pill tone="accent">Section 8 deal screener</Pill>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {MOCK && <Pill tone="warning">Mock data · 0 live calls</Pill>}
            <a href="/saved" className="hover:text-foreground">
              Saved
            </a>
            <a href="/account" className="hover:text-foreground">
              Account
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left: controls */}
        <div className="flex flex-col gap-4">
          <MarketControls
            marketId={marketId}
            onMarket={onMarket}
            bedrooms={bedrooms}
            onBedrooms={setBedrooms}
            onRun={runScreen}
            running={running}
          />
          <AssumptionsPanel a={assumptions} onChange={(patch) => setAssumptions((a) => ({ ...a, ...patch }))} />
        </div>

        {/* Main */}
        <div className="flex flex-col gap-5">
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {market.note && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-warning">
              <strong className="font-semibold">Honesty note · {market.label}:</strong> {market.note}
            </div>
          )}

          {/* Stage 1 */}
          <Card>
            <CardHeader>
              <CardTitle>Stage 1 — ZIP opportunity screen</CardTitle>
              <span className="text-[11px] text-muted-foreground">
                {zipRows.length ? `${zipRows.filter((r) => !r.insufficient).length} ZIPs ranked` : "click a ZIP to underwrite"}
              </span>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <OpportunityScatter rows={zipRows} selectedZip={selectedZip} onSelect={selectZip} />
              <ZipTable rows={zipRows} selectedZip={selectedZip} onSelect={selectZip} />
            </CardContent>
          </Card>

          {/* Stage 2 */}
          <Card>
            <CardHeader>
              <CardTitle>
                Stage 2 — deals {selectedZip ? `· ${selectedZip}` : ""}
              </CardTitle>
              <div className="flex items-center gap-3">
                {loadingListings && <span className="text-[11px] text-muted-foreground">loading…</span>}
                {deals.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => downloadDealsCsv(deals, selectedZip ?? "all")}>
                    Export CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DealTable
                deals={deals}
                onSelect={(d) => setSelectedDealId(d.listing.rentcastId)}
                selectedId={selectedDealId}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <DealDrawer
        deal={selectedDeal}
        onClose={() => setSelectedDealId(null)}
        onSave={saveDeal}
        saving={saving}
        saved={selectedDeal ? savedIds.has(selectedDeal.listing.rentcastId) : false}
      />
    </div>
  );
}
