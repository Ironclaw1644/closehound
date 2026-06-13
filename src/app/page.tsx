import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";
import { GradeBadge } from "@/components/site/GradeBadge";
import { featuredZones, COUNT_STATES } from "@/lib/config/assumptions";
import { PLANS } from "@/lib/stripe/plans";

const SITE = process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") || "https://closehound.com";

const STEPS = [
  {
    n: "01",
    title: "Pick a market — or any ZIP",
    body: "Start with a graded Opportunity Zone or drop in any ZIP in the country. We instantly pull HUD's Section 8 voucher rent ceiling (SAFMR) for that area.",
  },
  {
    n: "02",
    title: "We pull live listings + underwrite",
    body: "CloseHound matches for-sale homes to the voucher rent, then underwrites every property — mortgage, taxes, insurance, vacancy, management, capex — with assumptions you control.",
  },
  {
    n: "03",
    title: "Rank by Deal Score",
    body: "Each property gets a 0–100 Deal Score from cash-on-cash, cap rate, rent-to-price and DSCR. The deals where the government check beats the mortgage rise to the top.",
  },
];

const FAQ = [
  {
    q: "What exactly does CloseHound do?",
    a: "It finds for-sale homes whose HUD Section 8 voucher rent is high relative to the purchase price, underwrites each one with realistic costs, and ranks them by Deal Score — so you spend your time on the deals that actually cash flow instead of guessing.",
  },
  {
    q: "Where does the data come from?",
    a: "Voucher rent ceilings come from HUD's official Small Area Fair Market Rent (SAFMR) dataset. For-sale listings and local market rents come from licensed third-party real-estate data. We cache aggressively so your screens stay cheap and fast.",
  },
  {
    q: "Why are some states graded low?",
    a: "Because we won't waste your money. In places like South Florida, ~2% insurance and high prices usually crush cash-on-cash — so we grade them honestly (D/F) and steer you to Prime markets like Cleveland, Memphis, Detroit, Birmingham and Indianapolis where the voucher reliably beats the market.",
  },
  {
    q: "Can I run up a surprise bill?",
    a: "No. Every screen is metered against your plan. When you run out, screening simply pauses until you upgrade or buy a credit pack. You can never run up a charge you can't see.",
  },
  {
    q: "Is CloseHound affiliated with HUD?",
    a: "No. CloseHound is an independent analytics tool that uses public HUD data. It is not a brokerage, lender, or financial advisor, and is not affiliated with or endorsed by HUD.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "CloseHound",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "CloseHound screens for-sale homes against HUD Section 8 voucher rents, underwrites each property, and ranks them by Deal Score across all 50 states.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan — 10 deal screens, no card required.",
      },
      url: SITE,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function HomePage() {
  const zones = featuredZones().slice(0, 8);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />

      <main className="overflow-hidden">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-10 text-center sm:px-8 sm:pt-28">
            <div className="rise flex justify-center">
              <Label accent live>
                LIVE — SECTION 8 DEAL SCREENER
              </Label>
            </div>
            <h1 className="rise mt-6 font-display text-[3.4rem] leading-[0.92] tracking-tight sm:text-7xl md:text-[5.5rem]">
              <span className="text-gradient">Sniff out the deal</span>
              <span className="text-primary">.</span>
            </h1>
            <p className="rise mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              CloseHound finds homes where the <span className="text-foreground">Section 8 voucher check
              beats the mortgage</span>. We pull HUD voucher rents, underwrite every property, and rank them
              by Deal Score — across all 50 states, graded so you never waste a screen.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/screen"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(235,255,0,0.5)] transition hover:brightness-95"
              >
                Start free — 10 screens
              </Link>
              <Link
                href="/demo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-[15px] font-semibold transition hover:bg-secondary"
              >
                <PlayIcon /> Watch the 60-sec demo
              </Link>
            </div>
            <p className="mt-5 font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
              No card · {COUNT_STATES} states live · official HUD data
            </p>
          </div>

          {/* Framed app/video preview */}
          <div className="relative mx-auto max-w-5xl px-5 pb-8 sm:px-8">
            <div className="lift overflow-hidden rounded-2xl border border-hairline bg-surface-1 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-2 border-b border-hairline bg-background/60 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-3 font-mono text-[11px] text-muted-foreground">closehound.com/screen</span>
              </div>
              <div className="relative aspect-[16/9] bg-background">
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/demo-poster.jpg"
                  preload="metadata"
                >
                  <source src="/demo-loop.mp4" type="video/mp4" />
                </video>
                {/* graceful fallback content sits beneath the video */}
                <div className="absolute inset-0 -z-0 grid place-items-center">
                  <SampleDealCard />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust ticker ──────────────────────────────────────────────────── */}
        <div className="border-y border-hairline bg-background/60 py-3.5">
          <div className="relative overflow-hidden">
            <div className="marquee-track gap-10 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              {[0, 1].map((dup) => (
                <span key={dup} className="flex items-center gap-10">
                  {[
                    "Official HUD SAFMR data",
                    `All ${COUNT_STATES}+ markets graded A–F`,
                    "Deal Score underwriting",
                    "No surprise charges",
                    "Live for-sale listings",
                    "Cash-on-cash · cap rate · DSCR",
                    "Cleveland · Memphis · Detroit · Birmingham",
                  ].map((t) => (
                    <span key={t} className="flex items-center gap-10">
                      <span>{t}</span>
                      <span className="text-primary">✦</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Insight band ──────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <Label className="justify-center">THE EDGE</Label>
          <p className="mt-6 font-display text-3xl leading-snug sm:text-[2.6rem] sm:leading-[1.15]">
            In the right markets, the government will pay{" "}
            <span className="text-primary">more than the open market</span> for the same house.
            Most investors never check. CloseHound checks every listing, automatically.
          </p>
        </section>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section id="how" className="border-t border-hairline bg-surface-1/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <Label accent>HOW IT WORKS</Label>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              From “maybe” to a ranked buy list in seconds.
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="lift rounded-xl border border-hairline bg-background p-6">
                  <span className="font-mono text-3xl font-bold text-primary/80">{s.n}</span>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Opportunity Zones ─────────────────────────────────────────────── */}
        <section id="zones" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Label gold>OPPORTUNITY ZONES</Label>
              <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
                These are the areas with the most opportunity right now.
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Prime cash-flow markets where Section 8 voucher rents reliably beat the mortgage.
                Every market is graded A–F, so you spend screens where the money is — not where it isn’t.
              </p>
            </div>
            <Link
              href="/screen"
              className="shrink-0 font-mono text-[12px] uppercase tracking-wider text-primary transition hover:brightness-110"
            >
              See all markets →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {zones.map((z) => (
              <Link
                key={z.id}
                href="/screen"
                className="lift group flex flex-col rounded-xl border border-hairline bg-surface-1 p-5"
              >
                <div className="flex items-center justify-between">
                  <GradeBadge grade={z.grade} />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {z.state}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold">{z.label}</h3>
                <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                  {z.note ?? "Strong, reliable Section 8 cash flow on the right property."}
                </p>
                <span className="mt-4 font-mono text-[11px] uppercase tracking-wider text-primary opacity-0 transition group-hover:opacity-100">
                  Screen this market →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Safety / official band ────────────────────────────────────────── */}
        <section className="border-y border-hairline bg-surface-1/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <Label accent>BUILT TO BE TRUSTED</Label>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <TrustCard
                title="Official HUD data"
                body="Voucher rent ceilings come straight from HUD's Small Area Fair Market Rent dataset — the same numbers the housing authority pays by. No made-up estimates."
                icon={<ShieldIcon />}
              />
              <TrustCard
                title="You can't overspend"
                body="Every screen is metered against your plan. Run out and screening pauses — upgrade or grab a credit pack. You'll never run up a charge you can't see."
                icon={<LockIcon />}
              />
              <TrustCard
                title="Honest by design"
                body="We grade markets A–F and tell you when a market is an appreciation trap, not a cash-flow play. The tool works for you, not the listing."
                icon={<ScaleIcon />}
              />
            </div>
          </div>
        </section>

        {/* ── Pricing teaser ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="text-center">
            <Label accent className="justify-center">PRICING</Label>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Try it free. Scale when it’s paying you.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-muted-foreground">
              Start with 10 free screens — no card. Buy credits as you go, or subscribe when you’re
              hunting weekly. No surprise overages, ever.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[PLANS.free, PLANS.hunter, PLANS.closer, PLANS.agency].map((p) => (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-xl border bg-surface-1 p-6 ${
                  p.popular ? "border-primary/50 ring-1 ring-primary/20" : "border-hairline"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Most popular
                  </span>
                )}
                <p className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">{p.name}</p>
                <p className="mt-3 font-display text-4xl">
                  ${p.priceMonthly}
                  {p.priceMonthly > 0 && <span className="text-base text-muted-foreground">/mo</span>}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">{p.screens.toLocaleString()} screens / mo</p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{p.blurb}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-[15px] font-semibold transition hover:bg-secondary"
            >
              See full pricing →
            </Link>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section id="faq" className="border-t border-hairline bg-surface-1/40">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
            <Label accent className="justify-center">FAQ</Label>
            <h2 className="mt-4 text-center font-display text-4xl">Straight answers.</h2>
            <div className="mt-10 divide-y divide-hairline">
              {FAQ.map((f) => (
                <div key={f.q} className="py-5">
                  <h3 className="text-[15px] font-semibold">{f.q}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
            <h2 className="font-display text-5xl leading-tight sm:text-6xl">
              <span className="text-gradient">The deal is out there.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[16px] text-muted-foreground">
              Run your first 10 screens free and see your first Prime-market deal today.
            </p>
            <Link
              href="/screen"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-[15px] font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(235,255,0,0.5)] transition hover:brightness-95"
            >
              Start free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// ── Local presentational bits ─────────────────────────────────────────────────
function SampleDealCard() {
  return (
    <div className="w-[min(86%,360px)] rounded-xl border border-hairline bg-surface-2/90 p-5 backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Cleveland, OH · 44105</p>
          <p className="mt-1 text-[15px] font-semibold">3-bed · 1,180 sqft</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
          86
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          ["Price", "$92k"],
          ["Voucher rent", "$1,485"],
          ["Cash-on-cash", "11.8%"],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
            <p className="mt-1 text-[15px] font-semibold tabular">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustCard({ title, body, icon }: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-background p-6">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/12 text-primary">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v18M5 7h14M7 7l-3 6a3 3 0 0 0 6 0L7 7zM17 7l-3 6a3 3 0 0 0 6 0l-3-6zM5 21h14" />
    </svg>
  );
}
