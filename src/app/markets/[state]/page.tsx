import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  STATE_ENTRIES,
  stateEntryBySlug,
  median3BR,
  median,
  usdMo,
  costDrivers,
  breadcrumbLd,
  faqLd,
  MARKETS_FY,
} from "@/lib/markets/seo";
import { stateCopy } from "@/lib/markets/content";
import { Label } from "@/components/site/Label";
import { GradeBadge } from "@/components/site/GradeBadge";
import { Breadcrumbs, FaqBlock, JsonLd, MarketRow, CtaBand } from "@/components/markets/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return STATE_ENTRIES.map((s) => ({ state: s.stateSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const s = stateEntryBySlug(state);
  if (!s) return {};
  const copy = stateCopy(s);
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: { canonical: s.path },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: s.url,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1/50 px-4 py-3.5">
      <div className="font-mono text-xl tabular-nums text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const s = stateEntryBySlug(state);
  if (!s) notFound();
  const copy = stateCopy(s);
  const med = median(s.markets.map((e) => median3BR(e.market)));
  const cd = costDrivers(s.markets[0].market);
  const others = STATE_ENTRIES.filter((x) => x.stateSlug !== s.stateSlug);

  const ld = [
    breadcrumbLd([
      { name: "CloseHound", path: "/" },
      { name: "Markets", path: "/markets" },
      { name: s.stateName, path: s.path },
    ]),
    faqLd(copy.faqs),
  ];

  return (
    <main>
      <JsonLd data={ld} />
      <section className="relative">
        <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 pt-10 pb-6 sm:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Markets", path: "/markets" },
              { name: s.stateName, path: s.path },
            ]}
          />
          <Label accent className="mt-6">
            {s.stateName.toUpperCase()} · SECTION 8
          </Label>
          <h1 className="mt-4 font-display text-4xl leading-[1.06] sm:text-5xl">{copy.h1}</h1>
          {copy.intro.map((p, i) => (
            <p key={i} className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Graded markets" value={String(s.markets.length)} />
            <Stat label="Median 3-bed voucher" value={usdMo(med)} />
            <Stat label="Property tax" value={`${cd.taxPct}%`} />
            <Stat label="Insurance" value={`${cd.insPct}%`} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <h2 className="mb-4 font-display text-2xl">
          Section 8 markets in {s.stateName}, best cash flow first
        </h2>
        <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
          {s.markets.map((e) => (
            <div key={e.path} className="bg-background">
              <MarketRow
                href={e.path}
                city={e.city}
                sub={`${e.market.county} County`}
                grade={e.market.grade}
                voucher={usdMo(median3BR(e.market))}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Voucher figures are HUD SAFMR 3-bedroom medians (FY{MARKETS_FY}) across each market&apos;s
          screened ZIP codes. Open a market for the full ZIP-level table.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-4 sm:px-8">
        <h2 className="mb-5 font-display text-2xl">{s.stateName} Section 8 FAQ</h2>
        <FaqBlock faqs={copy.faqs} />
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Other states
        </h2>
        <div className="flex flex-wrap gap-2">
          {others.map((x) => (
            <Link
              key={x.stateSlug}
              href={x.path}
              className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-1.5 text-sm text-muted-foreground transition hover:border-gold/30 hover:text-foreground"
            >
              {x.stateName}
              <GradeBadge grade={x.bestGrade} />
            </Link>
          ))}
        </div>
      </section>

      <CtaBand
        title={`Screen ${s.stateName} deals free`}
        sub={`Match live ${s.stateName} listings against HUD voucher rents and rank them by Deal Score.`}
      />
    </main>
  );
}
