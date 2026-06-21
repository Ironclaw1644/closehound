import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MARKET_ENTRIES,
  marketEntryBySlugs,
  stateEntryBySlug,
  voucherRows,
  median3BR,
  onePctPrice,
  costDrivers,
  usd,
  usdMo,
  MARKETS_FY,
  breadcrumbLd,
  faqLd,
} from "@/lib/markets/seo";
import { cityCopy } from "@/lib/markets/content";
import { GRADE_META } from "@/lib/config/assumptions";
import { Label } from "@/components/site/Label";
import { GradeBadge } from "@/components/site/GradeBadge";
import {
  Breadcrumbs,
  FaqBlock,
  JsonLd,
  VoucherTable,
  MarketRow,
  CtaBand,
} from "@/components/markets/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return MARKET_ENTRIES.map((e) => ({ state: e.stateSlug, city: e.citySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}): Promise<Metadata> {
  const { state, city } = await params;
  const e = marketEntryBySlugs(state, city);
  if (!e) return {};
  const copy = cityCopy(e);
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: { canonical: e.path },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: e.url,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1/50 px-4 py-3.5">
      <div className="font-mono text-xl tabular-nums text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const e = marketEntryBySlugs(state, city);
  if (!e) notFound();
  const m = e.market;
  const copy = cityCopy(e);
  const rows = voucherRows(m);
  const med = median3BR(m);
  const price = onePctPrice(med);
  const cd = costDrivers(m);
  const meta = GRADE_META[m.grade];
  const siblings = (stateEntryBySlug(e.stateSlug)?.markets ?? [])
    .filter((x) => x.path !== e.path)
    .slice(0, 6);

  const ld = [
    breadcrumbLd([
      { name: "CloseHound", path: "/" },
      { name: "Markets", path: "/markets" },
      { name: e.stateName, path: `/markets/${e.stateSlug}` },
      { name: e.city, path: e.path },
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
              { name: e.stateName, path: `/markets/${e.stateSlug}` },
              { name: e.city, path: e.path },
            ]}
          />
          <div className="mt-6 flex items-center gap-3">
            <GradeBadge grade={m.grade} withLabel />
            <Label accent>
              {m.county.toUpperCase()} COUNTY · {m.region.toUpperCase()}
            </Label>
          </div>
          <h1 className="mt-4 font-display text-4xl leading-[1.06] sm:text-5xl">{copy.h1}</h1>
          {copy.intro.map((p, i) => (
            <p key={i} className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Median 3-bed voucher" value={usdMo(med)} />
            <Stat label="Supported price" value={usd(price)} hint="1% rule, illustrative" />
            <Stat label="Property tax" value={`${cd.taxPct}%`} hint="of value / yr" />
            <Stat label="Insurance" value={`${cd.insPct}%`} hint="of value / yr" />
          </div>
        </div>
      </section>

      {/* Voucher table */}
      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <h2 className="mb-1 font-display text-2xl">
          {e.city} HUD Section 8 voucher rents by ZIP (FY{MARKETS_FY})
        </h2>
        <p className="mb-5 text-[15px] text-muted-foreground">
          Official HUD Small Area Fair Market Rents — the voucher ceiling a landlord can collect in
          each ZIP, by bedroom count.
        </p>
        <VoucherTable rows={rows} />
        <p className="mt-3 text-xs text-muted-foreground">
          Source: HUD FY{MARKETS_FY} SAFMR. CloseHound underwrites live listings against these exact
          ceilings.
        </p>
      </section>

      {m.note && (
        <section className="mx-auto max-w-4xl px-5 pb-4 sm:px-8">
          <div className="rounded-xl border border-gold/25 bg-gold/[0.06] px-5 py-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gold">
              The honest read
            </div>
            <p className="text-[15px] leading-relaxed text-foreground/90">{m.note}</p>
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <h2 className="mb-4 font-display text-2xl">More Section 8 markets in {e.stateName}</h2>
          <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
            {siblings.map((x) => (
              <div key={x.path} className="bg-background">
                <MarketRow
                  href={x.path}
                  city={x.city}
                  sub={`${x.market.county} County`}
                  grade={x.market.grade}
                  voucher={usdMo(median3BR(x.market))}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
        <h2 className="mb-5 font-display text-2xl">{e.city} Section 8 FAQ</h2>
        <FaqBlock faqs={copy.faqs} />
      </section>

      <CtaBand
        title={`Screen ${e.city} deals free`}
        sub={`See which ${e.city} listings actually cash-flow on the voucher — underwritten and ranked by Deal Score.`}
      />
    </main>
  );
}
