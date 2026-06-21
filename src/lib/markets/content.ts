// Per-page SEO copy for the /markets tree. The narrative copy (titles, intros,
// FAQs) is generated once and stored in content.generated.json; this module
// merges it over a deterministic, fully-grounded fallback so a page is always
// complete and never invents a number — generated text only ever *replaces*
// the fallback prose, never the data tables the templates render.
import GENERATED from "./content.generated.json";
import { GRADE_META, type Grade } from "@/lib/config/assumptions";
import {
  MARKETS_FY,
  median3BR,
  onePctPrice,
  costDrivers,
  voucherRows,
  median,
  usd,
  usdMo,
  gradeLabel,
  type MarketEntry,
  type StateEntry,
} from "./seo";

export interface PageCopy {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  faqs: Array<{ q: string; a: string }>;
}

const COPY = GENERATED as Record<string, Partial<PageCopy>>;

const merge = (key: string, fallback: PageCopy): PageCopy => {
  const g = COPY[key] ?? {};
  return {
    metaTitle: g.metaTitle?.trim() || fallback.metaTitle,
    metaDescription: g.metaDescription?.trim() || fallback.metaDescription,
    h1: g.h1?.trim() || fallback.h1,
    intro: g.intro?.length ? g.intro : fallback.intro,
    faqs: g.faqs?.length ? g.faqs : fallback.faqs,
  };
};

// ── City ─────────────────────────────────────────────────────────────────────
export function cityCopy(e: MarketEntry): PageCopy {
  const m = e.market;
  const g = m.grade;
  const meta = GRADE_META[g];
  const med = median3BR(m);
  const rows = voucherRows(m).map((r) => r.br3).filter((n): n is number => !!n);
  const lo = rows.length ? Math.min(...rows) : null;
  const hi = rows.length ? Math.max(...rows) : null;
  const price = onePctPrice(med);
  const { taxPct, insPct } = costDrivers(m);
  const verdict =
    g === "A" || g === "B"
      ? "When the voucher beats the mortgage, the cash flow is real."
      : g === "C"
        ? "Cash flow is selective here — cherry-pick, don't carpet-screen."
        : "Treat this as an appreciation play, not a yield play.";

  const fallback: PageCopy = {
    metaTitle: `Section 8 in ${e.city}, ${m.state}: Voucher Rents ${MARKETS_FY}`.slice(0, 60),
    metaDescription:
      `${e.city}, ${e.stateName} Section 8: median 3-bed HUD voucher ${usdMo(med)}, graded ${g} (${meta.label}) for cash flow. See voucher rents by ZIP and screen live deals.`.slice(
        0,
        158
      ),
    h1: `Section 8 Investing in ${e.city}, ${m.state}`,
    intro: [
      `${e.city}, ${e.stateName} is a ${m.region} Section 8 market CloseHound grades ${g} — ${meta.label}. ${meta.blurb} The median 3-bedroom housing-voucher rent across its screened ZIP codes is about ${usdMo(med)}${price ? `, which by the 1% rule supports a purchase price near ${usd(price)}` : ""}.`,
      `${m.note ? m.note + " " : ""}Budget roughly ${taxPct}% property tax and ${insPct}% insurance on value annually — the two line items that decide a ${e.city} deal. ${verdict} Screen ${e.city} free on CloseHound to see which listings actually pencil.`,
    ],
    faqs: [
      {
        q: `What is the Section 8 voucher rent for a 3-bedroom in ${e.city}, ${m.state}?`,
        a: `For FY${MARKETS_FY}, the HUD SAFMR 3-bedroom voucher across ${e.city}'s screened ZIP codes runs about ${usdMo(med)}${lo && hi ? ` (range ${usd(lo)}–${usd(hi)})` : ""}. CloseHound pulls the exact ceiling for every ZIP.`,
      },
      {
        q: `Is ${e.city} a good market for Section 8 rental investing?`,
        a: `${meta.blurb} CloseHound grades ${e.city} ${g} (${meta.label}) for voucher cash flow versus other markets nationwide.`,
      },
      {
        q: `What are the carrying costs for a rental in ${m.county} County?`,
        a: `Plan for roughly ${taxPct}% property tax and ${insPct}% insurance per year on value — together they make or break a ${e.city} Section 8 deal, so underwrite both before you buy.`,
      },
      {
        q: `How do I find cash-flowing Section 8 deals in ${e.city}?`,
        a: `Screen ${e.city} free on CloseHound: it matches live for-sale listings against the HUD voucher rent for each ZIP, underwrites every one, and ranks them by Deal Score.`,
      },
    ],
  };
  return merge(e.path.replace("/markets/", ""), fallback);
}

// ── State ────────────────────────────────────────────────────────────────────
export function stateCopy(s: StateEntry): PageCopy {
  const counts = s.markets.reduce<Record<string, number>>(
    (a, e) => ((a[e.market.grade] = (a[e.market.grade] ?? 0) + 1), a),
    {}
  );
  const med = median(s.markets.map((e) => median3BR(e.market)));
  const prime = s.markets.filter((e) => e.market.grade === "A").map((e) => e.city);
  const strong = s.markets.filter((e) => e.market.grade === "B").map((e) => e.city);
  const { taxPct, insPct } = costDrivers(s.markets[0].market);
  const aGrade = (counts.A ?? 0) + (counts.B ?? 0);

  const fallback: PageCopy = {
    metaTitle: `Best Section 8 Markets in ${s.stateName} (${MARKETS_FY})`.slice(0, 60),
    metaDescription:
      `${s.markets.length} ${s.stateName} Section 8 markets graded A–F by cash flow. Median 3-bed HUD voucher ${usdMo(med)}. Compare voucher rents, taxes, and screen live deals.`.slice(
        0,
        158
      ),
    h1: `Section 8 Investing in ${s.stateName}: Graded Markets & Voucher Rents`,
    intro: [
      `CloseHound tracks ${s.markets.length} Section 8 markets across ${s.stateName}, each graded A–F on how reliably HUD voucher rents out-earn the mortgage. ${aGrade ? `${aGrade} grade A/B for cash flow${prime.length ? `, led by ${prime.slice(0, 3).join(", ")}` : ""}.` : `Most of the state leans toward appreciation over yield.`} The statewide median 3-bedroom voucher is about ${usdMo(med)}.`,
      `${s.stateName} carries roughly ${taxPct}% property tax and ${insPct}% insurance on value — the drag you underwrite on every deal here. Pick a market below to see its voucher rents by ZIP, honest grade, and live cash-flow screening.`,
    ],
    faqs: [
      {
        q: `What are the best Section 8 markets in ${s.stateName}?`,
        a: `${prime.length ? `${prime.join(", ")} grade A (Prime) for Section 8 cash flow${strong.length ? `; ${strong.slice(0, 4).join(", ")} grade B` : ""}.` : `${strong.length ? `${strong.slice(0, 4).join(", ")} grade B for cash flow.` : `${s.stateName} markets lean appreciation over yield.`}`} CloseHound ranks all ${s.markets.length} on real voucher-to-price math.`,
      },
      {
        q: `How much is a Section 8 voucher in ${s.stateName}?`,
        a: `It varies by metro and ZIP, but the median 3-bedroom HUD SAFMR voucher across ${s.stateName}'s screened markets is roughly ${usdMo(med)} for FY${MARKETS_FY}. CloseHound shows the exact ceiling per ZIP.`,
      },
      {
        q: `What property tax and insurance should I expect in ${s.stateName}?`,
        a: `Budget about ${taxPct}% property tax and ${insPct}% insurance per year on value — together they're the main swing factor on ${s.stateName} Section 8 cash flow.`,
      },
      {
        q: `How do I screen ${s.stateName} Section 8 deals?`,
        a: `Start free on CloseHound — pick a ${s.stateName} market or any ZIP, and it underwrites live listings against the HUD voucher rent and ranks them by Deal Score.`,
      },
    ],
  };
  return merge(s.stateSlug, fallback);
}

// ── Hub ──────────────────────────────────────────────────────────────────────
export function hubCopy(stats: {
  totalMarkets: number;
  totalStates: number;
  primeCount: number;
}): PageCopy {
  const fallback: PageCopy = {
    metaTitle: `Best Section 8 Markets in America, Graded (${MARKETS_FY})`.slice(0, 60),
    metaDescription:
      `${stats.totalMarkets} Section 8 markets across ${stats.totalStates} states, graded A–F by cash flow on real HUD voucher rents. Find where the government check beats the mortgage.`.slice(
        0,
        158
      ),
    h1: `The Best Section 8 Markets in America, Graded A–F by Cash Flow`,
    intro: [
      `Not every market cash-flows on a Section 8 voucher. CloseHound grades ${stats.totalMarkets} markets across ${stats.totalStates} states A–F on the only thing that matters — whether the HUD voucher rent reliably beats the mortgage, after taxes and insurance. ${stats.primeCount} earn a Prime (A) grade.`,
      `Pick a state or market to see real FY${MARKETS_FY} voucher rents by ZIP, the honest grade, and the cost drivers that make or break the deal — then screen live listings free and rank them by Deal Score.`,
    ],
    faqs: [
      {
        q: `What are the best Section 8 markets in the US?`,
        a: `The strongest voucher-cash-flow markets are concentrated in the Midwest and South — places where HUD voucher rents stay high relative to cheap purchase prices. CloseHound grades ${stats.totalMarkets} of them A–F so you can compare on real numbers.`,
      },
      {
        q: `What makes a market good for Section 8 investing?`,
        a: `A high voucher-rent-to-price ratio, plus low property tax and insurance. When the guaranteed voucher rent clears the mortgage and carrying costs with room to spare, the deal cash-flows — that's what the A grades capture.`,
      },
      {
        q: `Where are HUD voucher rents highest relative to home prices?`,
        a: `Across the graded markets, the Midwest (Ohio, Michigan, Indiana) and parts of the South (Tennessee, Alabama, Georgia) consistently show the best voucher-to-price math. High-cost coastal metros usually don't pencil for cash flow.`,
      },
      {
        q: `How does CloseHound grade Section 8 markets?`,
        a: `Each market's grade reflects how reliably the HUD SAFMR voucher rent out-earns a financed purchase after state property tax and insurance. Screen any market free to see the live, property-level math.`,
      },
    ],
  };
  return merge("hub", fallback);
}
