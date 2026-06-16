import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";
import { GradeBadge } from "@/components/site/GradeBadge";
import { featuredZones, COUNT_STATES } from "@/lib/config/assumptions";
import { PLANS } from "@/lib/stripe/plans";
import { getDictionary } from "@/lib/i18n";
import { localizedPath, type Locale } from "@/lib/i18n/config";

const SITE = process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") || "https://closehound.com";

export function HomeView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home;
  const planCopy = getDictionary(locale).plans;
  const lp = (p: string) => localizedPath(p, locale);
  const zones = featuredZones().slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "CloseHound",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: locale,
        description: t.insightLead + t.insightEmphasis + t.insightTail,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        url: locale === "en" ? SITE : `${SITE}/es`,
      },
      {
        "@type": "FAQPage",
        inLanguage: locale,
        mainEntity: t.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header locale={locale} />

      <main className="overflow-hidden">
        {/* Hero */}
        <section className="relative">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-10 text-center sm:px-8 sm:pt-28">
            <div className="rise flex justify-center">
              <Label accent>{t.eyebrow}</Label>
            </div>
            <h1 className="rise mt-6 font-display text-[3.4rem] leading-[0.92] tracking-tight sm:text-7xl md:text-[5.5rem]">
              <span className="text-gradient">{t.heroTitleA}</span>
              <span className="text-primary">.</span>
            </h1>
            <p className="rise mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              {t.heroSubLead}
              <span className="text-foreground">{t.heroSubEmphasis}</span>
              {t.heroSubTail}
            </p>
            <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/screen"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(235,255,0,0.5)] transition hover:brightness-95"
              >
                {t.ctaPrimary}
              </Link>
              <Link
                href={lp("/demo")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-[15px] font-semibold transition hover:bg-secondary"
              >
                <PlayIcon /> {t.ctaSecondary}
              </Link>
            </div>
            <p className="mt-5 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
              {t.microNoCard} · <span className="font-mono">{COUNT_STATES}</span> {t.microStates} · {t.microHud}
            </p>
          </div>

          {/* Framed video preview */}
          <div className="relative mx-auto max-w-5xl px-5 pb-8 sm:px-8">
            <div className="overflow-hidden rounded-2xl border border-gold/20 bg-surface-1 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
              <div className="relative aspect-[16/9] bg-background">
                <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/demo-poster.jpg" preload="metadata">
                  <source src="/demo-loop.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 -z-0 grid place-items-center">
                  <SampleDealCard sample={t.sample} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credibility row (static) */}
        <div className="border-y border-gold/15 bg-surface-1/30 py-4">
          <p className="mx-auto max-w-5xl px-5 text-center text-[13px] leading-relaxed tracking-wide text-muted-foreground sm:px-8">
            {t.credLead}
            <span className="mx-2.5 text-gold/50">·</span>
            <span className="font-mono text-foreground">{COUNT_STATES}</span> {t.credGraded}
            <span className="mx-2.5 text-gold/50">·</span>
            {t.credMetrics}
            <span className="mx-2.5 text-gold/50">·</span>
            {t.credUpdated}
          </p>
        </div>

        {/* Insight band */}
        <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <Label className="justify-center">{t.insightEyebrow}</Label>
          <p className="mt-6 font-display text-3xl leading-snug sm:text-[2.6rem] sm:leading-[1.15]">
            {t.insightLead}
            <span className="text-primary">{t.insightEmphasis}</span>
            {t.insightTail}
          </p>
        </section>

        {/* How it works */}
        <section id="how" className="border-t border-hairline bg-surface-1/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <Label accent>{t.howEyebrow}</Label>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">{t.howTitle}</h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {t.steps.map((s, i) => (
                <div key={s.title} className="lift rounded-xl border border-hairline bg-background p-6">
                  <span className="font-mono text-3xl font-bold text-gold/70">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Opportunity Zones */}
        <section id="zones" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Label gold>{t.zonesEyebrow}</Label>
              <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">{t.zonesTitle}</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{t.zonesSub}</p>
            </div>
            <Link href="/screen" className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold transition hover:opacity-80">
              {t.seeAllMarkets}
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {zones.map((z) => (
              <Link key={z.id} href="/screen" className="lift group flex flex-col rounded-xl border border-hairline bg-surface-1 p-5">
                <div className="flex items-center justify-between">
                  <GradeBadge grade={z.grade} />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{z.state}</span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold">{z.label}</h3>
                <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                  {locale === "en" ? z.note ?? t.zoneNote : t.zoneNote}
                </p>
                <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold opacity-0 transition group-hover:opacity-100">
                  {t.screenThisMarket}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust band */}
        <section className="border-y border-hairline bg-surface-1/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <Label accent>{t.trustEyebrow}</Label>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {t.trustCards.map((card, i) => (
                <TrustCard key={card.title} title={card.title} body={card.body} icon={TRUST_ICONS[i]} />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="text-center">
            <Label accent className="justify-center">{t.pricingEyebrow}</Label>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{t.pricingTitle}</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-muted-foreground">{t.pricingSub}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[PLANS.free, PLANS.hunter, PLANS.closer, PLANS.agency].map((p) => (
              <div key={p.id} className={`relative flex flex-col rounded-xl border bg-surface-1 p-6 ${p.popular ? "border-primary/50 ring-1 ring-primary/20" : "border-hairline"}`}>
                {p.popular && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                    {t.mostPopular}
                  </span>
                )}
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{p.name}</p>
                <p className="mt-3 font-display text-4xl">
                  ${p.priceMonthly}
                  {p.priceMonthly > 0 && <span className="text-base text-muted-foreground">{t.perMonth}</span>}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">{p.screens.toLocaleString()} {t.screensPerMonth}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{planCopy[p.id].blurb}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href={lp("/pricing")} className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-[15px] font-semibold transition hover:bg-secondary">
              {t.seeFullPricing}
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-hairline bg-surface-1/40">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
            <Label accent className="justify-center">{t.faqEyebrow}</Label>
            <h2 className="mt-4 text-center font-display text-4xl">{t.faqTitle}</h2>
            <div className="mt-10 divide-y divide-hairline">
              {t.faq.map((f) => (
                <div key={f.q} className="py-5">
                  <h3 className="text-[15px] font-semibold">{f.q}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
            <h2 className="font-display text-5xl leading-tight sm:text-6xl">
              <span className="text-gradient">{t.finalTitle}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[16px] text-muted-foreground">{t.finalSub}</p>
            <Link href="/screen" className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-[15px] font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(235,255,0,0.5)] transition hover:brightness-95">
              {t.finalCta}
            </Link>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}

function SampleDealCard({ sample }: { sample: { beds: string; price: string; voucherRent: string; coc: string } }) {
  return (
    <div className="w-[min(86%,360px)] rounded-xl border border-hairline bg-surface-2/90 p-5 backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Cleveland, OH · <span className="font-mono">44105</span></p>
          <p className="mt-1 text-[15px] font-semibold">{sample.beds}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">86</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          [sample.price, "$92k"],
          [sample.voucherRent, "$1,485"],
          [sample.coc, "11.8%"],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{l}</p>
            <p className="mt-1 font-mono text-[15px] font-semibold tabular">{v}</p>
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
const TRUST_ICONS = [<ShieldIcon key="s" />, <LockIcon key="l" />, <ScaleIcon key="c" />];
