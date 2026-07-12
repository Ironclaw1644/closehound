"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_MARKETS,
  DEFAULT_WEIGHTS,
  assumptionsForMarket,
  adhocMarket,
  featuredZones,
  findMarket,
  type Market,
} from "@/lib/config/assumptions";
import { underwrite } from "@/lib/underwriting/engine";
import type { Assumptions } from "@/lib/underwriting/types";
import { downloadDealsCsv } from "@/lib/export-csv";
import type { ZipScreenRow, ListingsResponse, ClientDeal, PropertyRecord } from "./types";
import { MarketControls } from "./MarketControls";
import { AssumptionsPanel } from "./AssumptionsPanel";
import { ZipTable } from "./ZipTable";
import { OpportunityScatter } from "./OpportunityScatter";
import { DealTable } from "./DealTable";
import { DealDrawer } from "./DealDrawer";
import { DealCompare } from "./DealCompare";
import { Onboarding } from "./Onboarding";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { GradeBadge } from "@/components/site/GradeBadge";
import { LocaleSwitch } from "@/components/site/LocaleSwitch";
import { getDictionary, localizedPath, type Locale } from "@/lib/i18n";

const MOCK =
  process.env.NEXT_PUBLIC_MOCK_MODE === "1" ||
  process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export function Dashboard({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).app;
  const lp = (p: string) => localizedPath(p, locale);

  const [marketId, setMarketId] = useState(DEFAULT_MARKETS[0].id);
  const [customMarket, setCustomMarket] = useState<Market | null>(null);
  const market = customMarket ?? findMarket(marketId)!;
  const [bedrooms, setBedrooms] = useState(3);
  const [assumptions, setAssumptions] = useState<Assumptions>(() => assumptionsForMarket(market));

  const [zipRows, setZipRows] = useState<ZipScreenRow[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [raw, setRaw] = useState<ListingsResponse | null>(null);
  const [loadingListings, setLoadingListings] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<Record<string, PropertyRecord>>({});
  const [propertyLoadingId, setPropertyLoadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zipNote, setZipNote] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ used: number; limit: number; credits: number } | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);

  // On phones, controls and results are stacked far apart — so after a run, jump
  // the viewport to the fresh ZIP results; after a ZIP is tapped, jump to the
  // listings. Only on the stacked (<lg) layout; desktop shows them side-by-side.
  const scrollStackedTo = useCallback((el: HTMLElement | null) => {
    if (el && typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Live "screens left" — read-only, non-billable. Refreshed after each screen.
  const fetchQuota = useCallback(async () => {
    try {
      const r = await fetch("/api/quota");
      if (r.ok) setQuota(await r.json());
    } catch {
      /* non-fatal — just hide the badge */
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  // First-run walkthrough (once per browser); the "?" button reopens it anytime.
  useEffect(() => {
    try {
      if (!localStorage.getItem("ch_seen_intro")) {
        setShowIntro(true);
        localStorage.setItem("ch_seen_intro", "1");
      }
    } catch {
      /* private mode / no storage — skip */
    }
  }, []);

  // Snap to results after a run, and to listings after a ZIP is tapped (mobile).
  useEffect(() => {
    if (zipRows.length) scrollStackedTo(stage1Ref.current);
  }, [zipRows, scrollStackedTo]);
  useEffect(() => {
    if (selectedZip) scrollStackedTo(stage2Ref.current);
  }, [selectedZip, scrollStackedTo]);

  const resetResults = () => {
    setZipRows([]);
    setSelectedZip(null);
    setRaw(null);
    setCompareIds(new Set());
    setShowCompare(false);
    setError(null);
    setZipNote(null);
  };

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }, []);

  const onMarket = (id: string) => {
    setCustomMarket(null);
    setMarketId(id);
    const m = findMarket(id);
    if (m) setAssumptions(assumptionsForMarket(m));
    resetResults();
  };


  // Core screen for an explicit set of ZIPs — used by both "Run screen" (the
  // selected market) and the ZIP search (a single resolved ZIP). Returns the rows.
  const runScreenFor = useCallback(async (zips: string[]): Promise<ZipScreenRow[]> => {
    setRunning(true);
    setError(null);
    setSelectedZip(null);
    setRaw(null);
    try {
      const res = await fetch("/api/screen/zips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ zips, bedrooms }),
      });
      if (res.status === 401) {
        window.location.href = `${lp("/login")}?next=${encodeURIComponent(lp("/screen"))}`;
        return [];
      }
      if (res.status === 402) {
        setError(t.errors.outOfScreensRun);
        return [];
      }
      if (!res.ok) {
        setError(t.errors.screenFailed);
        return [];
      }
      const json = await res.json();
      const rows: ZipScreenRow[] = json.rows ?? [];
      setZipRows(rows);
      fetchQuota();
      return rows;
    } catch {
      setError(t.errors.screenFailed);
      return [];
    } finally {
      setRunning(false);
    }
  }, [bedrooms, t, fetchQuota]);

  const runScreen = useCallback(() => {
    void runScreenFor(market.zips);
  }, [runScreenFor, market.zips]);

  const selectZip = useCallback(async (zip: string) => {
    setSelectedZip(zip);
    setLoadingListings(true);
    setRaw(null);
    setCompareIds(new Set());
    try {
      const res = await fetch("/api/screen/listings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ zip }),
      });
      if (res.status === 401) {
        window.location.href = `${lp("/login")}?next=${encodeURIComponent(lp("/screen"))}`;
        return;
      }
      if (res.status === 402) {
        setError(t.errors.outOfScreensListings);
        return;
      }
      if (!res.ok) {
        setError(t.errors.couldNotLoad);
        return;
      }
      setRaw(await res.json());
      fetchQuota();
    } catch {
      setError(t.errors.couldNotLoad);
    } finally {
      setLoadingListings(false);
    }
  }, [t, fetchQuota]);

  // ZIP search: resolve the typed ZIP to itself (if covered) or the nearest
  // covered ZIP (non-billable), screen it, and auto-open its listings.
  const screenZip = useCallback(async (rawZip: string) => {
    setError(null);
    setZipNote(null);
    let z = rawZip;
    try {
      const r = await fetch(`/api/screen/resolve-zip?zip=${rawZip}`);
      if (r.status === 401) {
        window.location.href = `${lp("/login")}?next=${encodeURIComponent(lp("/screen"))}`;
        return;
      }
      if (r.status === 404) {
        setError(t.errors.noZipCoverage);
        return;
      }
      if (r.ok) {
        const j: { zip: string; exact: boolean } = await r.json();
        z = j.zip;
        if (!j.exact) setZipNote(t.zipSearch.nearest.replace("{req}", rawZip).replace("{got}", z));
      }
    } catch {
      /* resolver unavailable — fall through and try the typed ZIP directly */
    }
    const m = adhocMarket(z);
    setCustomMarket(m);
    setAssumptions(assumptionsForMarket(m));
    const rows = await runScreenFor([z]);
    // Single typed ZIP → jump straight to its listings if it screened cleanly.
    if (rows.some((row) => row.zip === z && !row.insufficient)) void selectZip(z);
  }, [runScreenFor, selectZip, t]);

  // Open a deal + lazily fetch its real property record (true tax + last sale),
  // cached per id so we never re-fetch. Re-underwrite happens automatically once
  // propertyData updates (the useMemo overlays the real tax below).
  const selectDeal = useCallback(
    async (d: ClientDeal) => {
      const id = d.listing.rentcastId;
      setSelectedDealId(id);
      if (!d.listing.address || propertyData[id] !== undefined) return;
      setPropertyLoadingId(id);
      try {
        const res = await fetch(
          `/api/property?address=${encodeURIComponent(d.listing.address)}&zip=${d.listing.zip}`
        );
        if (res.ok) {
          const pd: PropertyRecord = await res.json();
          setPropertyData((m) => ({ ...m, [id]: pd }));
        }
      } catch {
        /* non-fatal — keep the rate-based estimate */
      } finally {
        setPropertyLoadingId((cur) => (cur === id ? null : cur));
      }
    },
    [propertyData]
  );

  // Underwrite client-side — assumption tweaks re-score instantly, no re-billing.
  // When a deal's real property tax has loaded, it overrides the rate estimate.
  const deals: ClientDeal[] = useMemo(() => {
    if (!raw?.safmr) return [];
    const safmr = raw.safmr;
    return raw.listings
      .filter((l) => l.price != null && l.price > 0 && l.beds != null)
      .map((l0): ClientDeal => {
        const pd = propertyData[l0.rentcastId];
        const l = pd?.annualTax != null ? { ...l0, annualTax: pd.annualTax } : l0;
        const beds = Math.min(Math.max(l.beds ?? 3, 0), 4);
        const safmrMonthly = safmr.br[beds];
        return {
          listing: l,
          safmrMonthly,
          underwriting: underwrite({ price: l.price!, safmrMonthly, annualPropertyTax: l.annualTax, assumptions, weights: DEFAULT_WEIGHTS }),
        };
      })
      .sort((a, b) => b.underwriting.dealScore - a.underwriting.dealScore);
  }, [raw, assumptions, propertyData]);

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
      else if (res.status === 401) setError(t.errors.signInToSave);
    } catch {
      setError(t.errors.couldNotSave);
    } finally {
      setSaving(false);
    }
  }, [t]);

  const zones = featuredZones().slice(0, 8);
  const lowGrade = market.grade === "D" || market.grade === "F";

  // "Screens left" badge: accent when healthy, warning under ~1 market, danger at 0.
  const screensLeft = quota ? Math.max(0, quota.limit - quota.used) : null;
  const quotaTone = screensLeft == null ? "muted" : screensLeft <= 0 ? "danger" : screensLeft < 12 ? "warning" : "accent";

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <a href={lp("/")} aria-label="CloseHound home"><Logo /></a>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:inline">
              {t.nav.dealScreener}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {MOCK && <Pill tone="warning" className="hidden sm:inline-flex">{t.mock}</Pill>}
            {screensLeft != null && (
              <Pill tone={quotaTone} className="tabular">
                {screensLeft} {screensLeft === 1 ? t.quota.oneLeft : t.quota.screensLeft}
                {quota && quota.credits > 0 ? ` · ${t.quota.credits.replace("{n}", String(quota.credits))}` : ""}
              </Pill>
            )}
            <button
              onClick={() => setShowIntro(true)}
              aria-label={t.onboarding.reopen}
              title={t.onboarding.reopen}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-hairline font-semibold transition hover:border-primary/50 hover:text-foreground"
            >
              ?
            </button>
            <LocaleSwitch locale={locale} />
            <a href={lp("/saved")} className="hidden transition hover:text-foreground sm:inline">{t.nav.saved}</a>
            <a href={lp("/account")} className="transition hover:text-foreground">{t.nav.account}</a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left: controls */}
        <div className="flex flex-col gap-4">
          {/* Opportunity Zones quick pick */}
          <Card>
            <CardHeader>
              <CardTitle>{t.zones.title}</CardTitle>
              <GradeBadge grade="A" />
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              <p className="mb-1 text-[12px] leading-relaxed text-muted-foreground">{t.zones.sub}</p>
              {zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => onMarket(z.id)}
                  className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-[13px] transition ${
                    market.id === z.id ? "border-primary/60 bg-primary/15" : "border-hairline hover:bg-secondary"
                  }`}
                >
                  <span className="font-medium">{z.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{z.state}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <MarketControls
            market={market}
            marketId={customMarket ? "" : marketId}
            onMarket={onMarket}
            onScreenZip={screenZip}
            bedrooms={bedrooms}
            onBedrooms={setBedrooms}
            onRun={runScreen}
            running={running}
            locale={locale}
          />
          <AssumptionsPanel a={assumptions} onChange={(patch) => setAssumptions((a) => ({ ...a, ...patch }))} locale={locale} />
        </div>

        {/* Main */}
        <div className="flex flex-col gap-5">
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
          )}
          {zipNote && (
            <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm text-foreground">{zipNote}</div>
          )}
          {lowGrade && (
            <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-warning">
              <GradeBadge grade={market.grade} />
              <p>
                <strong className="font-semibold">{t.market.headsUp}</strong> {market.label} {t.market.lowGrade}{" "}
                {locale === "en" && market.note ? market.note : t.market.considerZone}
              </p>
            </div>
          )}
          {!lowGrade && market.note && locale === "en" && (
            <div className="rounded-lg border border-hairline bg-surface-1 px-4 py-2.5 text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">{t.market.note} · {market.label}:</strong> {market.note}
            </div>
          )}

          {/* Stage 1 */}
          <div ref={stage1Ref} data-tour="results" className="scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle>{t.stage1.title}</CardTitle>
              <span className="text-[11px] text-muted-foreground">
                {zipRows.length ? `${zipRows.filter((r) => !r.insufficient).length} ${t.stage1.ranked}` : t.stage1.runToBegin}
              </span>
            </CardHeader>
            <CardContent>
              {zipRows.length > 0 && !selectedZip && (
                <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-foreground">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  {t.stage1.tapHint}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <OpportunityScatter rows={zipRows} selectedZip={selectedZip} onSelect={selectZip} locale={locale} />
                <ZipTable rows={zipRows} selectedZip={selectedZip} onSelect={selectZip} locale={locale} />
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Stage 2 */}
          <div ref={stage2Ref} data-tour="deals" className="scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle>{t.stage2.title} {selectedZip ? `· ${selectedZip}` : ""}</CardTitle>
              <div className="flex items-center gap-3">
                {loadingListings && <span className="text-[11px] text-muted-foreground">{t.stage2.loading}</span>}
                {compareIds.size >= 2 && (
                  <Button size="sm" onClick={() => setShowCompare(true)}>
                    {t.stage2.compare} ({compareIds.size})
                  </Button>
                )}
                {deals.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => downloadDealsCsv(deals, selectedZip ?? "all")}>
                    {t.stage2.exportCsv}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DealTable
                deals={deals}
                onSelect={selectDeal}
                selectedId={selectedDealId}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
                locale={locale}
              />
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      <DealDrawer
        deal={selectedDeal}
        property={selectedDeal ? propertyData[selectedDeal.listing.rentcastId] ?? null : null}
        propertyLoading={propertyLoadingId != null && propertyLoadingId === selectedDealId}
        onClose={() => setSelectedDealId(null)}
        onSave={saveDeal}
        saving={saving}
        saved={selectedDeal ? savedIds.has(selectedDeal.listing.rentcastId) : false}
        locale={locale}
      />

      {showCompare && (
        <DealCompare
          deals={deals.filter((d) => compareIds.has(d.listing.rentcastId))}
          onClose={() => setShowCompare(false)}
          locale={locale}
        />
      )}

      <Onboarding open={showIntro} onClose={() => setShowIntro(false)} locale={locale} />
    </div>
  );
}
