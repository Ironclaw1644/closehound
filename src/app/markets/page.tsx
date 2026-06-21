import type { Metadata } from "next";
import Link from "next/link";
import {
  STATE_ENTRIES,
  MARKET_ENTRIES,
  SITE,
  MARKETS_FY,
  median3BR,
  usdMo,
  breadcrumbLd,
  faqLd,
} from "@/lib/markets/seo";
import { hubCopy } from "@/lib/markets/content";
import { GRADE_META, type Grade } from "@/lib/config/assumptions";
import { GradeBadge } from "@/components/site/GradeBadge";
import { Label } from "@/components/site/Label";
import { Breadcrumbs, FaqBlock, JsonLd, MarketRow, CtaBand } from "@/components/markets/ui";

const STATS = {
  totalMarkets: MARKET_ENTRIES.length,
  totalStates: STATE_ENTRIES.length,
  primeCount: MARKET_ENTRIES.filter((e) => e.market.grade === "A").length,
};
const COPY = hubCopy(STATS);
const GRADES: Grade[] = ["A", "B", "C", "D", "F"];

export const metadata: Metadata = {
  title: { absolute: COPY.metaTitle },
  description: COPY.metaDescription,
  alternates: { canonical: "/markets" },
  openGraph: {
    title: COPY.metaTitle,
    description: COPY.metaDescription,
    url: `${SITE}/markets`,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function MarketsHubPage() {
  const byGrade = GRADES.map((g) => ({
    grade: g,
    markets: MARKET_ENTRIES.filter((e) => e.market.grade === g).sort(
      (a, b) => a.stateName.localeCompare(b.stateName) || a.city.localeCompare(b.city)
    ),
  })).filter((s) => s.markets.length);

  const ld = [
    breadcrumbLd([
      { name: "CloseHound", path: "/" },
      { name: "Markets", path: "/markets" },
    ]),
    faqLd(COPY.faqs),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: COPY.metaTitle,
      description: COPY.metaDescription,
      url: `${SITE}/markets`,
      hasPart: MARKET_ENTRIES.map((e) => ({ "@type": "WebPage", name: `${e.city}, ${e.state}`, url: e.url })),
    },
  ];

  return (
    <main>
      <JsonLd data={ld} />
      <section className="relative">
        <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-5 pt-10 pb-6 sm:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Markets", path: "/markets" }]} />
          <Label accent className="mt-6">
            SECTION 8 MARKET INTELLIGENCE
          </Label>
          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.05] sm:text-6xl">{COPY.h1}</h1>
          {COPY.intro.map((p, i) => (
            <p key={i} className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Grade legend */}
      <section className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="grid gap-2 rounded-xl border border-hairline bg-surface-1/50 p-4 sm:grid-cols-5">
          {GRADES.map((g) => (
            <div key={g} className="flex items-start gap-2">
              <GradeBadge grade={g} />
              <p className="text-[11px] leading-snug text-muted-foreground">{GRADE_META[g].blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Markets by grade */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        {byGrade.map(({ grade, markets }) => (
          <div key={grade} className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <GradeBadge grade={grade} withLabel />
              <span className="text-sm text-muted-foreground">
                {markets.length} market{markets.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
              {markets.map((e) => (
                <div key={e.path} className="bg-background">
                  <MarketRow
                    href={e.path}
                    city={`${e.city}, ${e.state}`}
                    sub={`${e.market.county} County · ${e.market.region}`}
                    grade={e.market.grade}
                    voucher={usdMo(median3BR(e.market))}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Browse by state */}
      <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <h2 className="font-display text-3xl">Browse Section 8 markets by state</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {STATS.totalStates} states with curated, graded Section 8 markets.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {STATE_ENTRIES.map((s) => (
            <Link
              key={s.stateSlug}
              href={s.path}
              className="flex items-center justify-between gap-2 rounded-lg border border-hairline px-4 py-3 transition hover:border-gold/30 hover:bg-surface-1/60"
            >
              <span className="font-medium text-foreground">{s.stateName}</span>
              <span className="flex items-center gap-2">
                <GradeBadge grade={s.bestGrade} />
                <span className="text-xs text-muted-foreground">{s.markets.length}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-4 sm:px-8">
        <h2 className="mb-5 font-display text-3xl">Section 8 investing FAQ</h2>
        <FaqBlock faqs={COPY.faqs} />
      </section>

      <CtaBand
        title="Find the deal in any market"
        sub={`Screen live for-sale listings against HUD voucher rents across all ${STATS.totalStates}+ states — free to start.`}
      />
    </main>
  );
}
