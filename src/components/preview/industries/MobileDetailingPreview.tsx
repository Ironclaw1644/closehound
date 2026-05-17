import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faCar,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { bebasNeue, hankenGrotesk } from "@/lib/preview/fonts";

export function MobileDetailingPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${bebasNeue.variable} ${hankenGrotesk.variable} relative min-h-screen overflow-hidden bg-[#08090c] pb-32 text-[#e6f5fa]`}
      style={{ fontFamily: "var(--font-hanken), system-ui, sans-serif" }}
    >
      {/* cyan radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[820px]"
        style={{
          background:
            "radial-gradient(900px 380px at 80% 5%, rgba(0,182,214,0.18), transparent 55%), radial-gradient(900px 360px at 0% 20%, rgba(255,255,255,0.04), transparent 55%)",
        }}
      />
      {/* faint racing stripes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-50"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0 200px, rgba(255,255,255,0.02) 200px 201px)",
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
              className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/15"
            />
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#1a232c] to-[#08090c] text-base ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span
                className="text-[#00b6d6]"
                style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.06em" }}
              >
                {initials}
              </span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[26px] uppercase tracking-[0.04em]"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p
                className="text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
                style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
              >
                {model.business.city} · MOBILE DETAIL
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-lg bg-[#00b6d6] px-4 py-2.5 text-sm font-bold text-[#04161b] transition hover:bg-[#3ec9e4]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          {/* LEFT — eyebrow, headline, subhead, CTAs, trust strip */}
          <div>
            <Reveal from="up" delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00b6d6]/30 bg-[#00b6d6]/10 px-3.5 py-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#00b6d6] shadow-[0_0_12px_rgba(0,182,214,0.85)]" />
                <p
                  className="text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
                  style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
                >
                  {model.hero.eyebrow}
                </p>
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-7 max-w-[16ch] uppercase tracking-tight text-white"
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "clamp(3rem, 7.4vw, 6.4rem)",
                  lineHeight: "0.92",
                  letterSpacing: "0.005em",
                }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={260}>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#a6c5d0] sm:text-lg sm:leading-8">
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={380}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-[#00b6d6] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-[#04161b] shadow-[0_3px_0_rgba(0,0,0,0.32),0_18px_40px_rgba(0,182,214,0.42)] transition hover:-translate-y-0.5 hover:bg-[#1ac6e6] hover:shadow-[0_5px_0_rgba(0,0,0,0.32),0_24px_48px_rgba(0,182,214,0.55)] active:translate-y-0.5 sm:text-base"
                >
                  <FontAwesomeIcon
                    icon={faCar}
                    className="h-4 w-4 transition group-hover:rotate-[-12deg]"
                  />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[#00b6d6]/70 hover:bg-white/10 hover:text-[#00b6d6] sm:text-base"
                  >
                    {model.hero.secondaryCta.label}
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                    />
                  </a>
                ) : null}
              </div>
            </Reveal>

            <Reveal from="up" delay={520}>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#a6c5d0]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#00b6d6]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-bold tabular-nums text-white"
                      style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em" }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span>· {model.business.reviewCount} Google reviews</span>
                    ) : null}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#00b6d6]" />
                  Self-contained · we bring water + power
                </span>
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#00b6d6]" />
                  Insured up to $1M / job
                </span>
              </div>
            </Reveal>
          </div>

          {/* RIGHT — hero photo with booking-confirmation overlay */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[28px] ring-1 ring-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} mobile detail`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[28px] bg-gradient-to-br from-[#04080c] via-[#0c1820] to-[#08090c] ring-1 ring-white/10" />
              )}

              {/* Top-right rating badge */}
              <div className="absolute -right-3 -top-3 z-20 inline-flex items-center gap-2 rounded-full bg-[#00b6d6] px-3.5 py-1.5 text-[#04161b] shadow-[0_10px_28px_rgba(0,182,214,0.55)] sm:-right-5 sm:-top-5">
                <FontAwesomeIcon icon={faStar} className="h-3 w-3" />
                <span
                  className="text-[12px] font-bold tabular-nums tracking-[0.04em]"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  {typeof model.business.rating === "number"
                    ? model.business.rating.toFixed(1)
                    : "5.0"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em]">
                  ·{" "}
                  {typeof model.business.reviewCount === "number"
                    ? model.business.reviewCount
                    : 274}{" "}
                  reviews
                </span>
              </div>

              {/* Booking-confirmation overlay — bottom-left, slight rotation */}
              <div className="absolute -bottom-6 -left-6 z-20 w-[78%] max-w-[320px] rotate-[-2.5deg] rounded-2xl bg-[#0a0f15] p-5 ring-1 ring-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur sm:-left-10 sm:p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#00b6d6]/15 px-2.5 py-1 ring-1 ring-[#00b6d6]/30">
                  <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#00b6d6] shadow-[0_0_10px_rgba(0,182,214,0.85)]" />
                  <p
                    className="text-[10px] uppercase tracking-[0.32em] text-[#00b6d6]"
                    style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
                  >
                    Booked · tomorrow
                  </p>
                </div>
                <p
                  className="mt-4 text-3xl uppercase leading-none tracking-tight text-white sm:text-4xl"
                  style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.005em" }}
                >
                  Full detail
                </p>
                <p
                  className="mt-2 text-[13px] leading-snug text-white/85"
                  style={{ fontFamily: "var(--font-hanken)" }}
                >
                  2019 F-150 · Black
                </p>
                <p
                  className="mt-1 text-[13px] leading-snug text-white/65"
                  style={{ fontFamily: "var(--font-hanken)" }}
                >
                  10:00 AM · Your driveway
                </p>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#00b6d6]/90">
                    Hand wash · clay bar · seal
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Spec strip */}
        <Reveal from="up" delay={620}>
          <div className="mt-20 grid gap-px overflow-hidden rounded-2xl bg-white/8 sm:grid-cols-4">
            {[
              { label: "Refresh", value: "90 min" },
              { label: "Full detail", value: "3–4 hr" },
              { label: "Coating prep", value: "1 day" },
              { label: "Routes", value: "Booked weekly" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0c1218] p-5"
              >
                <p
                  className="text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
                  style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
                >
                  {stat.label}
                </p>
                <p
                  className="mt-2 text-3xl uppercase leading-none tracking-tight text-white sm:text-4xl"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-5xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0c1218] to-[#04080c] px-7 py-12 sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-32 w-32 text-[#00b6d6]/15"
              />
              <span className="text-[#00b6d6]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote className="relative mt-5 max-w-3xl text-2xl font-medium leading-[1.42] text-white sm:text-[28px]">
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption
                className="mt-6 text-xs uppercase tracking-[0.42em] text-[#00b6d6]"
                style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
              >
                — {model.topReview.authorFirstName} · GOOGLE REVIEW
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services / Packages ────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
            style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
          >
            PACKAGES
          </p>
          <h2
            className="mt-3 uppercase tracking-tight text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(2.6rem, 6vw, 4.6rem)",
              lineHeight: "0.94",
              letterSpacing: "0.005em",
            }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["car"];
            const isFeatured = idx === 1;
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article
                  className={`group relative h-full overflow-hidden rounded-[24px] p-7 transition hover:-translate-y-1 ${
                    isFeatured
                      ? "bg-[#00b6d6] text-[#04161b] ring-1 ring-[#00b6d6]"
                      : "bg-gradient-to-br from-[#0c1218] to-[#04080c] text-white ring-1 ring-white/10"
                  }`}
                >
                  {!isFeatured && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00b6d6]/10 transition-all duration-500 group-hover:h-72 group-hover:w-72 group-hover:bg-[#00b6d6]/20"
                    />
                  )}
                  <div className="relative flex items-start justify-between">
                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${
                        isFeatured ? "bg-[#04161b] text-[#00b6d6]" : "bg-[#00b6d6]/15 text-[#00b6d6]"
                      }`}
                    >
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <span
                      className="text-3xl uppercase leading-none tabular-nums tracking-tight opacity-50"
                      style={{ fontFamily: "var(--font-bebas)" }}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                  <h3
                    className="relative mt-6 text-3xl uppercase leading-tight tracking-tight"
                    style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.005em" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={`relative mt-3 text-[15px] leading-7 ${
                      isFeatured ? "text-[#04161b]/80" : "text-[#a6c5d0]"
                    }`}
                  >
                    {service.body}
                  </p>
                  {isFeatured ? (
                    <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-[#04161b] px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-[#00b6d6]">
                      Most booked
                    </div>
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Recent details ─────────────────────────────────── */}
      {model.assets.galleryUrls.length > 0 ? (
        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p
              className="text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
              style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
            >
              GALLERY
            </p>
            <h2
              className="mt-3 uppercase tracking-tight text-white"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(2.6rem, 6vw, 4.6rem)",
                lineHeight: "0.94",
                letterSpacing: "0.005em",
              }}
            >
              Recent details from the route
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0c1218] transition hover:border-[#00b6d6]/45 hover:shadow-[0_0_60px_rgba(0,182,214,0.2)]">
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
                className="text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
                style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
              >
                BUILD QUALITY
              </p>
              <h2
                className="mt-3 uppercase tracking-tight text-white"
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "clamp(2.4rem, 5.4vw, 4.2rem)",
                  lineHeight: "0.94",
                  letterSpacing: "0.005em",
                }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#a6c5d0]">
                Pro products. Two-bucket method. Microfiber rotated by panel. Same crew, same kit, every visit.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#00b6d6]/45 hover:bg-white/[0.05]">
                    <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-[#00b6d6]/15 text-[#00b6d6]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className="text-2xl uppercase leading-tight tracking-tight text-white"
                        style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.005em" }}
                      >
                        {bullet.title}
                      </p>
                      <p className="mt-2 text-[15px] leading-7 text-[#a6c5d0]">{bullet.body}</p>
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
          <div className="relative overflow-hidden rounded-[32px] border border-[#00b6d6]/30 bg-gradient-to-br from-[#0c1218] via-[#082a32] to-[#08090c] px-7 py-14 sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(900px 320px at 90% 10%, rgba(0,182,214,0.55), transparent 55%)",
              }}
            />
            <p
              className="relative text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
              style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
            >
              ROUTES &amp; AVAILABILITY
            </p>
            <h2
              className="relative mt-3 max-w-3xl uppercase tracking-tight text-white"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(2.4rem, 5.4vw, 4.2rem)",
                lineHeight: "0.94",
                letterSpacing: "0.005em",
              }}
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
            className="text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
            style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
          >
            FAQ
          </p>
          <h2
            className="mt-3 uppercase tracking-tight text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(2.4rem, 5.4vw, 4.2rem)",
              lineHeight: "0.94",
              letterSpacing: "0.005em",
            }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-2xl border border-white/12 bg-white/[0.03] open:border-[#00b6d6]/45 open:bg-[#0c1218]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
                  <span
                    className="text-xl uppercase tracking-tight text-white"
                    style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.005em" }}
                  >
                    {item.question}
                  </span>
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/20 text-[#00b6d6] transition group-open:rotate-45 group-open:border-[#00b6d6] group-open:bg-[#00b6d6] group-open:text-[#04161b]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#a6c5d0]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] border border-[#00b6d6]/30 bg-gradient-to-br from-[#0c1218] to-[#04080c] p-8 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.42em] text-[#00b6d6]"
                style={{ fontFamily: "var(--font-hanken)", fontWeight: 700 }}
              >
                BOOK THE SLOT
              </p>
              <h2
                className="mt-3 uppercase tracking-tight text-white"
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "clamp(2.6rem, 6vw, 4.6rem)",
                  lineHeight: "0.94",
                  letterSpacing: "0.005em",
                }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#a6c5d0]">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-lg bg-[#00b6d6] px-5 py-4 text-base font-bold uppercase tracking-[0.18em] text-[#04161b] transition hover:bg-[#3ec9e4]"
                >
                  <span className="flex items-center gap-3 normal-case">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-[#a6c5d0]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#00b6d6]" />
                Drop the keys, go back inside. We text updates as we work.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#a6c5d0]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#00b6d6]" />
                Pet-hair removal included with every full detail.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-white/45 sm:px-8">
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
