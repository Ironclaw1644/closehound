import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faSnowflake,
  faFireFlameCurved,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { sora, jetbrainsMono } from "@/lib/preview/fonts";

export function HvacPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${sora.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-hidden bg-[#eef2f4] pb-32 text-[#0c1623]`}
      style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}
    >
      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(rgba(12,22,35,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="flex items-center gap-3">
          {model.assets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.assets.logoUrl}
              alt={`${model.business.name} logo`}
              className="h-12 w-12 rounded-2xl object-cover ring-1 ring-black/8"
            />
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0c1623] text-base font-semibold text-white">
              <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700 }}>
                {initials}
              </span>
              <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f0a922] text-[8px] text-[#1a1206]">
                <FontAwesomeIcon icon={faSnowflake} className="h-2 w-2" />
              </span>
            </div>
          )}
          <div className="leading-tight">
            <p className="text-[17px] font-semibold tracking-tight">{model.business.name}</p>
            {model.business.city ? (
              <p
                className="text-[10px] tracking-[0.28em] text-[#0c1623]/60"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {model.business.city.toUpperCase()} — HVAC SERVICE
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#0c1623] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f0a922] hover:text-[#1a1206]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <Reveal from="up" delay={0}>
              <p
                className="text-[11px] font-semibold tracking-[0.32em] text-[#f0a922]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {model.hero.eyebrow.toUpperCase()}
              </p>
            </Reveal>
            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 max-w-[18ch] text-5xl font-semibold leading-[0.98] tracking-tight sm:text-[68px] sm:leading-[0.98]"
                style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.02em" }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>
            <Reveal from="up" delay={240}>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#324252] sm:text-lg sm:leading-8">
                {model.hero.subheadline}
              </p>
            </Reveal>
            <Reveal from="up" delay={360}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-[#f0a922] px-6 py-3.5 text-sm font-semibold text-[#1a1206] shadow-[0_3px_0_rgba(0,0,0,0.22),0_18px_40px_rgba(240,169,34,0.42)] transition hover:-translate-y-0.5 hover:bg-[#fab12a] hover:shadow-[0_5px_0_rgba(0,0,0,0.22),0_24px_48px_rgba(240,169,34,0.55)] active:translate-y-0.5 sm:text-base"
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-2xl border border-[#0c1623]/15 bg-white px-5 py-3 text-sm font-semibold text-[#0c1623] transition hover:-translate-y-0.5 hover:border-[#0c1623]/45 hover:shadow-[0_8px_24px_rgba(12,22,35,0.10)] sm:text-base"
                  >
                    {model.hero.secondaryCta.label}
                    <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 transition group-hover:translate-x-1" />
                  </a>
                ) : null}
              </div>
            </Reveal>
            <Reveal from="up" delay={480}>
              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { label: "Avg. arrival", value: "47 min", tone: "text-[#0c1623]" },
                  { label: "Same-day fix rate", value: "92%", tone: "text-[#f0a922]" },
                  {
                    label: "Service radius",
                    value: "30 mi",
                    tone: "text-[#0c1623]",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#0c1623]/10 bg-white px-4 py-4"
                  >
                    <p
                      className="text-[10px] tracking-[0.24em] text-[#0c1623]/50"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {stat.label.toUpperCase()}
                    </p>
                    <p
                      className={`mt-1.5 text-2xl font-semibold tabular-nums ${stat.tone}`}
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Thermostat-like dial card */}
          <Reveal from="right" delay={300}>
            <div className="relative">
              <div className="relative aspect-square overflow-hidden rounded-[32px] bg-[#0c1623] p-8 text-white shadow-[0_30px_80px_rgba(12,22,35,0.28)]">
                {/* dial */}
                <div className="absolute inset-10 rounded-full border border-white/10">
                  <div className="absolute inset-3 rounded-full border border-white/8" />
                  {/* tick marks */}
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * 360;
                    const isMajor = i % 4 === 0;
                    return (
                      <span
                        key={i}
                        className={`absolute left-1/2 top-1 -translate-x-1/2 ${
                          isMajor ? "h-3 w-[2px] bg-white/55" : "h-1.5 w-px bg-white/25"
                        }`}
                        style={{ transformOrigin: "50% calc(50% - -0.75rem * 0)", transform: `translateX(-50%) rotate(${angle}deg) translateY(0)` }}
                      />
                    );
                  })}
                  {/* pointer */}
                  <span
                    className="absolute left-1/2 top-2 h-[42%] w-[3px] -translate-x-1/2 origin-bottom rounded-full bg-[#f0a922] shadow-[0_0_30px_rgba(240,169,34,0.85)]"
                    style={{ transform: "translateX(-50%) rotate(38deg)" }}
                  />
                </div>
                {/* center reading */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p
                    className="text-[11px] tracking-[0.32em] text-white/50"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    INDOOR
                  </p>
                  <p
                    className="mt-2 text-7xl font-semibold tabular-nums leading-none"
                    style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.04em" }}
                  >
                    72
                    <span className="text-3xl text-[#f0a922]">°</span>
                  </p>
                  <p
                    className="mt-3 inline-flex items-center gap-2 text-[11px] tracking-[0.32em] text-[#f0a922]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#f0a922]" />
                    SETPOINT &middot; AUTO
                  </p>
                  <div className="mt-6 flex items-center gap-3 text-white/70">
                    <FontAwesomeIcon icon={faSnowflake} className="h-3.5 w-3.5 text-[#a8d6ff]" />
                    <span
                      className="text-[10px] tracking-[0.24em]"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      COOL · 68 — 72
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-white/70">
                    <FontAwesomeIcon icon={faFireFlameCurved} className="h-3.5 w-3.5 text-[#f0a922]" />
                    <span
                      className="text-[10px] tracking-[0.24em]"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      HEAT · 67 — 70
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Trust strip */}
        <Reveal from="up" delay={620}>
          <div className="mt-14 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#324252]">
            {typeof model.business.rating === "number" ? (
              <span className="inline-flex items-center gap-2">
                <span className="text-[#f0a922]">
                  <StarRow rating={model.business.rating} />
                </span>
                <span className="text-base font-semibold tabular-nums text-[#0c1623]">
                  {model.business.rating.toFixed(1)}
                </span>
                {typeof model.business.reviewCount === "number" ? (
                  <span>· {model.business.reviewCount} Google reviews</span>
                ) : null}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#f0a922]" />
              NATE-certified technicians
            </span>
            <span className="inline-flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#f0a922]" />
              Background-checked, in uniform
            </span>
          </div>
        </Reveal>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-5xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-[28px] bg-white px-7 py-12 ring-1 ring-[#0c1623]/8 sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#f0a922]/15"
              />
              <span className="text-[#f0a922]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote className="relative mt-5 max-w-3xl text-2xl font-medium leading-[1.4] text-[#0c1623] sm:text-[28px]">
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption
                className="mt-6 text-xs tracking-[0.32em] text-[#0c1623]/55"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                — {model.topReview.authorFirstName.toUpperCase()} · GOOGLE REVIEW
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[11px] font-semibold tracking-[0.32em] text-[#f0a922]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            SERVICE — 01 / 03
          </p>
          <h2
            className="mt-3 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.02em" }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-[#0c1623]/8 transition hover:-translate-y-1 hover:ring-[#f0a922]/45 hover:shadow-[0_24px_48px_rgba(12,22,35,0.10)]">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c1623] text-white transition group-hover:bg-[#f0a922] group-hover:text-[#1a1206]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <span
                      className="text-[10px] tracking-[0.24em] text-[#0c1623]/35"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      0{idx + 1} / 0{model.services.items.length}
                    </span>
                  </div>
                  <h3
                    className="mt-5 text-xl font-semibold leading-snug"
                    style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.01em" }}
                  >
                    {service.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#324252]">{service.body}</p>
                  <div className="mt-6 h-1 w-full rounded-full bg-[#0c1623]/8">
                    <div
                      className="h-1 rounded-full bg-[#f0a922] transition-all duration-700 group-hover:w-full"
                      style={{ width: `${30 + idx * 22}%` }}
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
            <p
              className="text-[11px] font-semibold tracking-[0.32em] text-[#f0a922]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              SERVICE LOG
            </p>
            <h2
              className="mt-3 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.02em" }}
            >
              Field calls this week
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-[#0c1623]/8 transition hover:ring-[#f0a922]/45">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Why us ─────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr]">
          <Reveal from="left">
            <div>
              <p
                className="text-[11px] font-semibold tracking-[0.32em] text-[#f0a922]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                THE STANDARD
              </p>
              <h2
                className="mt-3 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.02em" }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#324252]">
                Calibrated by the manual J. Installed by the book. Backed by people you can call back.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group rounded-2xl border border-[#0c1623]/10 bg-white p-6 transition hover:border-[#f0a922]/45 hover:shadow-[0_18px_36px_rgba(12,22,35,0.08)]">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0a922]/12 text-[#0c1623]">
                        <FontAwesomeIcon icon={Ico} className="h-4 w-4" />
                      </span>
                      <p
                        className="text-lg font-semibold leading-tight"
                        style={{ fontFamily: "var(--font-sora)" }}
                      >
                        {bullet.title}
                      </p>
                      <span
                        className="ml-auto text-[10px] tabular-nums tracking-[0.24em] text-[#0c1623]/40"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-7 text-[#324252]">{bullet.body}</p>
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
          <div
            className="relative overflow-hidden rounded-[32px] bg-[#0c1623] px-7 py-12 text-white sm:px-12 sm:py-16"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                background:
                  "radial-gradient(800px 280px at 90% 10%, rgba(240,169,34,0.55), transparent 55%), repeating-linear-gradient(90deg, transparent 0 60px, rgba(255,255,255,0.04) 60px 61px)",
              }}
            />
            <p
              className="relative text-[11px] font-semibold tracking-[0.32em] text-[#f0a922]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              SERVICE AREA
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.02em" }}
            >
              {model.serviceArea.heading}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              {model.serviceArea.body}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[11px] font-semibold tracking-[0.32em] text-[#f0a922]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FAQ
          </p>
          <h2
            className="mt-3 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.02em" }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-2xl border border-[#0c1623]/12 bg-white open:border-[#f0a922]/55 open:shadow-[0_18px_36px_rgba(12,22,35,0.06)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold tracking-tight">
                  <span style={{ fontFamily: "var(--font-sora)" }}>{item.question}</span>
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#0c1623]/15 text-[#0c1623] transition group-open:rotate-45 group-open:border-[#f0a922] group-open:bg-[#f0a922] group-open:text-[#1a1206]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#324252]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] border border-[#0c1623]/10 bg-white p-8 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p
                className="text-[11px] font-semibold tracking-[0.32em] text-[#f0a922]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                DISPATCH
              </p>
              <h2
                className="mt-3 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.02em" }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#324252] sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-[#f0a922] px-5 py-4 text-base font-semibold text-[#1a1206] transition hover:bg-[#e29c1a]"
                >
                  <span className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-[#324252]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#f0a922]" />
                Real person 24/7. After-hours rates quoted before dispatch.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#324252]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#f0a922]" />
                Truck stocked with 90% of common parts.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#0c1623]/55 sm:px-8">
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
