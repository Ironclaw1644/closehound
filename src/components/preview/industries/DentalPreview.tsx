import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faTooth,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { cormorantInfant, manrope } from "@/lib/preview/fonts";

export function DentalPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${cormorantInfant.variable} ${manrope.variable} relative min-h-screen overflow-hidden bg-[#f4f9f7] pb-32 text-[#0d2724]`}
      style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
    >
      {/* soft mint gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background:
            "radial-gradient(900px 360px at 80% 5%, rgba(33,138,111,0.18), transparent 60%), radial-gradient(900px 320px at 5% 25%, rgba(180,225,210,0.5), transparent 60%)",
        }}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 pt-7 sm:px-8 sm:pt-9">
        <div className="flex items-center gap-3">
          {model.assets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.assets.logoUrl}
              alt={`${model.business.name} logo`}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-[#218a6f]/20"
            />
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-base ring-1 ring-[#218a6f]/30">
              <FontAwesomeIcon icon={faTooth} className="h-5 w-5 text-[#218a6f]" />
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[22px] tracking-tight"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.36em] text-[#0d2724]/55">
                {model.business.city} family dentistry
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full bg-[#218a6f] px-4 py-2.5 text-sm font-medium text-[#f1faf6] transition hover:bg-[#1a6f59]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div>
            <Reveal from="up" delay={0}>
              <p className="text-[11px] tracking-[0.42em] text-[#218a6f]">
                {model.hero.eyebrow.toUpperCase()}
              </p>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 max-w-[14ch] tracking-tight text-[#0d2724]"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontWeight: 400,
                  fontSize: "clamp(2.6rem, 6.4vw, 5.4rem)",
                  lineHeight: "1",
                  letterSpacing: "-0.018em",
                }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={260}>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#3c5a55] sm:text-lg sm:leading-8">
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={380}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#218a6f] px-6 py-3.5 text-sm font-medium text-[#f1faf6] shadow-[0_3px_0_rgba(0,0,0,0.22),0_18px_40px_rgba(33,138,111,0.42)] transition hover:-translate-y-0.5 hover:bg-[#0d2724] hover:shadow-[0_5px_0_rgba(0,0,0,0.22),0_24px_48px_rgba(13,39,36,0.42)] active:translate-y-0.5 sm:text-base"
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#0d2724]/15 bg-white/85 px-5 py-3 text-sm font-medium text-[#0d2724] transition hover:-translate-y-0.5 hover:border-[#218a6f] hover:text-[#218a6f] sm:text-base"
                  >
                    <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                    {model.hero.secondaryCta.label}
                    <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 transition group-hover:translate-x-1" />
                  </a>
                ) : null}
              </div>
            </Reveal>

            {/* Trust strip */}
            <Reveal from="up" delay={520}>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#3c5a55]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#218a6f]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-medium tabular-nums text-[#0d2724]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span>· {model.business.reviewCount} Google reviews</span>
                    ) : null}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#218a6f]" />
                  Welcoming new patients
                </span>
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#218a6f]" />
                  Insurance filed in-network &amp; out
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: hero photo with appointment card overlay */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[36px] ring-1 ring-[#218a6f]/15 shadow-[0_30px_80px_rgba(13,39,36,0.16)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} office`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[36px] bg-gradient-to-br from-[#ecf6f1] via-white to-[#d4ebe1] ring-1 ring-[#218a6f]/15" />
              )}

              {/* Appointment card overlay — bottom */}
              <div
                className="absolute -left-3 bottom-6 max-w-[80%] overflow-hidden rounded-[22px] p-5 ring-1 ring-[#218a6f]/15 shadow-[0_18px_40px_rgba(13,39,36,0.22)] backdrop-blur sm:-left-6 sm:bottom-10 sm:p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(236,246,241,0.97) 100%)",
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(33,138,111,0.18), transparent 70%)",
                  }}
                />
                <p className="relative text-[10px] tracking-[0.42em] text-[#218a6f]">
                  TUESDAY · 10:30 AM
                </p>
                <p
                  className="relative mt-2 text-2xl leading-tight tracking-tight text-[#0d2724] sm:text-3xl"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                >
                  Welcome, <span className="italic">Lauren</span>.
                </p>
                <div className="relative mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[#3c5a55]/80">
                  <span className="inline-flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5 text-[#218a6f]" />
                    in-network with Delta
                  </span>
                  <span className="text-[#3c5a55]/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5 text-[#218a6f]" />
                    Saturday hours
                  </span>
                </div>
              </div>

              {/* Today badge — top-right */}
              <div className="absolute -right-3 -top-3 inline-flex items-center gap-2 rounded-full bg-[#0d2724] px-3.5 py-2 text-[10px] uppercase tracking-[0.28em] text-[#f1faf6] shadow-[0_8px_24px_rgba(13,39,36,0.32)] sm:-right-6 sm:-top-6">
                <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#9bd6c2]" />
                Today · 3 openings
              </div>
            </div>
          </Reveal>
        </div>

        {/* Patient Promise — full-width below hero grid */}
        <Reveal from="up" delay={620}>
          <div className="mt-16 rounded-[28px] bg-[#0d2724] p-7 text-[#f1faf6] sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr] lg:items-center">
              <div>
                <p className="text-[11px] tracking-[0.42em] text-[#9bd6c2]">PATIENT PROMISE</p>
                <p
                  className="mt-3 max-w-2xl text-2xl leading-tight tracking-tight sm:text-[28px]"
                  style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 400 }}
                >
                  We&rsquo;ll explain your bill before we treat &mdash; and skip what can wait.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-[10px] tracking-[0.32em] text-[#9bd6c2]">FIRST VISITS WITHIN</p>
                  <p
                    className="mt-1 text-2xl tabular-nums leading-none"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    2 weeks
                  </p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-[10px] tracking-[0.32em] text-[#9bd6c2]">EMERGENCY SAME-DAY</p>
                  <p
                    className="mt-1 text-2xl tabular-nums leading-none"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    96%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-5xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-[36px] bg-white px-7 py-12 ring-1 ring-[#218a6f]/15 sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#218a6f]/12"
              />
              <span className="text-[#218a6f]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl tracking-tight text-[#0d2724]"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  lineHeight: "1.42",
                }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 text-xs tracking-[0.36em] text-[#0d2724]/55">
                — {model.topReview.authorFirstName.toUpperCase()} · GOOGLE REVIEW
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-3 lg:grid-cols-[auto,1fr] lg:items-end">
          <Reveal>
            <p className="text-[11px] tracking-[0.42em] text-[#218a6f]">CARE WE PROVIDE</p>
          </Reveal>
          <Reveal>
            <h2
              className="text-4xl tracking-tight sm:text-5xl"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 400,
                lineHeight: "1.04",
                letterSpacing: "-0.012em",
              }}
            >
              {model.services.heading}
            </h2>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-px bg-[#218a6f]/15 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group h-full bg-[#f4f9f7] p-8 transition hover:bg-white">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#218a6f]/10 text-[#218a6f] transition group-hover:bg-[#218a6f] group-hover:text-white">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <span
                      className="text-[10px] tracking-[0.36em] text-[#0d2724]/40"
                      style={{ fontFamily: "var(--font-manrope)", fontWeight: 600 }}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                  <h3
                    className="mt-6 text-2xl tracking-tight"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {service.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#3c5a55]">{service.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Inside the practice ────────────────────────────── */}
      {model.assets.galleryUrls.length > 0 ? (
        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="text-[11px] tracking-[0.42em] text-[#218a6f]">INSIDE THE PRACTICE</p>
            <h2
              className="mt-3 text-4xl tracking-tight sm:text-5xl"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 400,
                lineHeight: "1.04",
                letterSpacing: "-0.012em",
              }}
            >
              The space, the team, the tools.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-[28px] bg-white ring-1 ring-[#218a6f]/15 transition hover:ring-[#218a6f]/35">
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
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr]">
          <Reveal from="left">
            <div>
              <p className="text-[11px] tracking-[0.42em] text-[#218a6f]">WHAT PATIENTS TELL THEIR FRIENDS</p>
              <h2
                className="mt-3 text-4xl tracking-tight sm:text-5xl"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontWeight: 400,
                  lineHeight: "1.04",
                  letterSpacing: "-0.012em",
                }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#3c5a55]">
                Quiet rooms. On-time visits. Doctors who pull up the x-ray on the screen and explain the trade-off.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-[28px] bg-white p-6 ring-1 ring-[#218a6f]/12 transition hover:ring-[#218a6f]/30">
                    <span className="flex-none">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#218a6f]/10 text-[#218a6f]">
                        <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                      </span>
                    </span>
                    <div>
                      <p
                        className="text-2xl leading-tight tracking-tight"
                        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                      >
                        {bullet.title}
                      </p>
                      <p className="mt-2 text-[15px] leading-7 text-[#3c5a55]">{bullet.body}</p>
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
          <div className="relative overflow-hidden rounded-[36px] bg-[#0d2724] px-7 py-14 text-[#f1faf6] sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(900px 320px at 90% 10%, rgba(155,214,194,0.45), transparent 55%)",
              }}
            />
            <p className="relative text-[11px] tracking-[0.42em] text-[#9bd6c2]">VISITING THE PRACTICE</p>
            <h2
              className="relative mt-3 max-w-3xl text-4xl tracking-tight sm:text-5xl"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 400,
                lineHeight: "1.04",
              }}
            >
              {model.serviceArea.heading}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-7 text-[#f1faf6]/80 sm:text-lg">
              {model.serviceArea.body}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.42em] text-[#218a6f]">PATIENT QUESTIONS</p>
          <h2
            className="mt-3 text-4xl tracking-tight sm:text-5xl"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 400,
              lineHeight: "1.04",
              letterSpacing: "-0.012em",
            }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-[24px] bg-white ring-1 ring-[#218a6f]/15 open:ring-[#218a6f]/40 open:shadow-[0_18px_36px_rgba(13,39,36,0.06)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
                  <span
                    className="text-xl tracking-tight"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {item.question}
                  </span>
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#0d2724]/15 text-[#218a6f] transition group-open:rotate-45 group-open:border-[#218a6f] group-open:bg-[#218a6f] group-open:text-white">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#3c5a55]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[36px] bg-white p-8 ring-1 ring-[#218a6f]/15 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[11px] tracking-[0.42em] text-[#218a6f]">SCHEDULE A VISIT</p>
              <h2
                className="mt-3 text-4xl tracking-tight sm:text-5xl"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontWeight: 400,
                  lineHeight: "1.04",
                  letterSpacing: "-0.012em",
                }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#3c5a55]">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-full bg-[#218a6f] px-5 py-4 text-base font-medium text-[#f1faf6] transition hover:bg-[#1a6f59]"
                >
                  <span className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-[#3c5a55]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#218a6f]" />
                Most new-patient visits scheduled within 2 weeks.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3c5a55]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#218a6f]" />
                Same-day emergencies usually fit by mid-afternoon.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#0d2724]/55 sm:px-8">
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
