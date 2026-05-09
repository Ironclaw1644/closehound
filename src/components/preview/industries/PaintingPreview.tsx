import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faPaintRoller,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { instrumentSans, albertSans } from "@/lib/preview/fonts";

const COLOR_SWATCHES = [
  { hex: "#f1ece2", label: "Linen" },
  { hex: "#cc6c5b", label: "Terracotta" },
  { hex: "#33414d", label: "Indigo Slate" },
  { hex: "#2d2a26", label: "Charred Oak" },
];

export function PaintingPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${instrumentSans.variable} ${albertSans.variable} relative min-h-screen overflow-hidden bg-[#f5f3ef] pb-32 text-[#181818]`}
      style={{ fontFamily: "var(--font-albert-sans), system-ui, sans-serif" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{
          background:
            "radial-gradient(900px 320px at 80% 0%, rgba(195, 58, 58, 0.13), transparent 65%)",
        }}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="flex items-center gap-3">
          {model.assets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.assets.logoUrl}
              alt={`${model.business.name} logo`}
              className="h-12 w-12 rounded-md object-cover ring-1 ring-black/10"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#181818] text-base font-semibold text-[#f5f3ef]">
              <span style={{ fontFamily: "var(--font-instrument-sans)" }}>{initials}</span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[18px] font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-instrument-sans)" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.32em] text-black/55">
                {model.business.city} · Painting studio
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full bg-[#181818] px-4 py-2.5 text-sm font-semibold text-[#f5f3ef] transition hover:bg-[#c33a3a]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5 transition group-hover:rotate-12" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <Reveal from="up" delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c33a3a]" />
                {model.hero.eyebrow}
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 text-6xl font-medium leading-[0.94] tracking-tight sm:text-7xl md:text-[88px]"
                style={{ fontFamily: "var(--font-instrument-sans)" }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={240}>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#3a3a3a] sm:text-lg sm:leading-8">
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={360}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#c33a3a] px-6 py-3.5 text-sm font-semibold text-[#fff6f0] shadow-[0_3px_0_#7a2222,0_12px_28px_rgba(195,58,58,0.42)] transition hover:-translate-y-0.5 hover:bg-[#d34848] hover:shadow-[0_5px_0_#7a2222,0_18px_38px_rgba(195,58,58,0.55)] active:translate-y-0.5 sm:text-base"
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[#181818] hover:shadow-[0_8px_24px_rgba(24,24,24,0.10)] sm:text-base"
                  >
                    {model.hero.secondaryCta.label}
                    <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 transition group-hover:translate-x-1" />
                  </a>
                ) : null}
              </div>
            </Reveal>

            <Reveal from="up" delay={520}>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#3a3a3a]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#c33a3a]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-semibold tabular-nums text-[#181818]"
                      style={{ fontFamily: "var(--font-instrument-sans)" }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span>· {model.business.reviewCount} Google reviews</span>
                    ) : null}
                  </span>
                ) : null}
                {model.business.yearsInBusiness && model.business.yearsInBusiness >= 1 ? (
                  <span className="inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faPaintRoller} className="h-3.5 w-3.5 text-[#c33a3a]" />
                    {model.business.yearsInBusiness}+ yrs of finished walls
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#c33a3a]" />
                  Premium paint included
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: hero photo with project badge + color-swatch palette overlay */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[20px] ring-1 ring-black/10 shadow-[0_30px_80px_rgba(24,24,24,0.18)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} crew at work`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[20px] bg-gradient-to-br from-[#181818] via-[#2a2622] to-[#3a322a] ring-1 ring-black/10" />
              )}

              {/* Top-left: Project city badge with red dot pulse */}
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#181818]/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f5f3ef] ring-1 ring-white/10 backdrop-blur sm:left-5 sm:top-5">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c33a3a] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c33a3a]" />
                </span>
                Project {model.business.city ? model.business.city.split(/[\s,]/)[0] : "Studio"}
              </div>

              {/* Bottom-right: Color swatch palette card overlay */}
              <div
                className="absolute -bottom-6 -right-3 w-[68%] max-w-[280px] rotate-[-1.5deg] overflow-hidden rounded-[20px] bg-white p-5 ring-1 ring-black/10 shadow-[0_24px_60px_rgba(24,24,24,0.22)] sm:-bottom-8 sm:-right-6"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-black/60">
                  Today&rsquo;s palette
                </p>
                <p
                  className="mt-1.5 text-[18px] font-medium tracking-tight"
                  style={{ fontFamily: "var(--font-instrument-sans)" }}
                >
                  Studio specs
                </p>
                <div className="mt-4 flex flex-col gap-px overflow-hidden rounded-md">
                  {COLOR_SWATCHES.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ background: s.hex, color: s.hex === "#f1ece2" ? "#181818" : "#fff6f0" }}
                    >
                      <span>{s.label}</span>
                      <span className="font-mono text-[9px] opacity-80">{s.hex.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-black/55">
                  Sherwin-Williams Emerald · Benjamin Moore Aura
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-[28px] bg-[#181818] px-7 py-10 text-[#f5f3ef] sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#c33a3a]/14"
              />
              <span className="text-[#c33a3a]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl text-2xl font-medium leading-[1.35] sm:text-[28px]"
                style={{ fontFamily: "var(--font-instrument-sans)" }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm uppercase tracking-[0.24em] text-[#f5f3ef]/55">
                — {model.topReview.authorFirstName} · Google review
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c33a3a]">
            Services
          </p>
          <h2
            className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-instrument-sans)" }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["paint-roller"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative h-full overflow-hidden rounded-[18px] border border-black/10 bg-white p-7 transition hover:-translate-y-1 hover:border-[#c33a3a] hover:shadow-[0_24px_48px_rgba(24,24,24,0.08)]">
                  <div
                    aria-hidden
                    className="absolute left-0 top-0 h-1.5 w-full"
                    style={{
                      background:
                        idx === 0
                          ? "#c33a3a"
                          : idx === 1
                            ? "#33414d"
                            : "#cc6c5b",
                    }}
                  />
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#181818] text-[#f5f3ef] transition group-hover:rotate-3 group-hover:bg-[#c33a3a]">
                    <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                  </span>
                  <h3
                    className="mt-5 text-xl font-semibold leading-snug tracking-tight"
                    style={{ fontFamily: "var(--font-instrument-sans)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#3a3a3a]">{service.body}</p>
                  <div className="mt-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-black/55">
                    <span>0{idx + 1} / 0{model.services.items.length}</span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-3 w-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Recent work ────────────────────────────────────── */}
      {model.assets.galleryUrls.length > 0 ? (
        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c33a3a]">
              Project gallery
            </p>
            <h2
              className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-instrument-sans)" }}
            >
              Walls that earned the next referral.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-[18px] ring-1 ring-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Why us ─────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr,1.1fr]">
          <Reveal from="left">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c33a3a]">
                Studio standards
              </p>
              <h2
                className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-instrument-sans)" }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[#3a3a3a]">
                The unsexy work — prep, masking, daily reset — is what separates
                a paint job that lasts five years from one that fails in two.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-[14px] border-l-4 border-[#c33a3a] bg-white p-5 ring-1 ring-black/8 transition hover:bg-[#fff6f0]">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-[#181818] text-[#f5f3ef] transition group-hover:bg-[#c33a3a]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className="text-lg font-semibold leading-tight tracking-tight"
                        style={{ fontFamily: "var(--font-instrument-sans)" }}
                      >
                        {bullet.title}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-7 text-[#3a3a3a]">{bullet.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Service area ───────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="scale">
          <div className="relative overflow-hidden rounded-[32px] bg-[#181818] px-7 py-12 text-[#f5f3ef] sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(700px 280px at 90% 10%, rgba(195, 58, 58, 0.7), transparent 55%)",
              }}
            />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c33a3a]">
              Service area
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-instrument-sans)" }}
            >
              {model.serviceArea.heading}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-7 text-[#f5f3ef]/80 sm:text-lg">
              {model.serviceArea.body}
            </p>
            <div className="relative mt-8 inline-flex items-center gap-3 rounded-full bg-white/8 px-4 py-2 text-sm text-[#f5f3ef]/85 ring-1 ring-white/10">
              <FontAwesomeIcon icon={faPaintRoller} className="h-3.5 w-3.5 text-[#c33a3a]" />
              Free in-home color consult
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c33a3a]">
            Common questions
          </p>
          <h2
            className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-instrument-sans)" }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-[14px] border border-black/10 bg-white open:border-[#c33a3a] open:shadow-[0_18px_36px_rgba(24,24,24,0.06)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold tracking-tight">
                  <span style={{ fontFamily: "var(--font-instrument-sans)" }}>{item.question}</span>
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border border-black/15 bg-[#f5f3ef] text-[#181818] transition group-open:rotate-45 group-open:bg-[#c33a3a] group-open:text-[#fff6f0]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#3a3a3a]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[24px] bg-white p-8 ring-1 ring-black/10 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c33a3a]">
                Book a consult
              </p>
              <h2
                className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-instrument-sans)" }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#3a3a3a] sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-md bg-[#181818] px-5 py-4 text-base font-semibold text-[#f5f3ef] transition hover:bg-[#c33a3a]"
                >
                  <span className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                  />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-[#3a3a3a]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#c33a3a]" />
                Free color consult and on-wall samples
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a3a3a]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#c33a3a]" />
                Premium paint included on every job
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a3a3a]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#c33a3a]" />
                Punch-list walk before final invoice
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-black/55 sm:px-8">
        <p>
          Site preview built for {model.business.name} by{" "}
          <a href="https://walkperro.com" className="underline underline-offset-4">
            WalkPerro
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
