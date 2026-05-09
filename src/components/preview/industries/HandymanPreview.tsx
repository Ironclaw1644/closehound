import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faClock,
  faBolt,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { familjenGrotesk, geist } from "@/lib/preview/fonts";

export function HandymanPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${familjenGrotesk.variable} ${geist.variable} relative min-h-screen overflow-hidden bg-[#f6f1e7] pb-32 text-[#13161a]`}
      style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
    >
      {/* Graph-paper background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(19,22,26,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(19,22,26,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Top noise grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(1200px 360px at 80% 0%, rgba(232, 118, 26, 0.18), transparent 60%)",
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
              className="h-12 w-12 rounded-[10px] object-cover ring-1 ring-black/10"
            />
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#13161a] text-base font-semibold text-[#f6f1e7] shadow-[0_2px_0_rgba(19,22,26,1),0_8px_24px_rgba(0,0,0,0.18)]">
              <span style={{ fontFamily: "var(--font-familjen)" }}>{initials}</span>
              <span className="absolute -right-1.5 -top-1.5 inline-block h-3 w-3 rounded-full bg-[#e8761a] ring-2 ring-[#f6f1e7]" />
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[17px] font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-familjen)" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/55">
                {model.business.city} · Local & insured
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full bg-[#13161a] px-4 py-2.5 text-sm font-semibold text-[#f6f1e7] transition hover:bg-[#e8761a] hover:text-[#13161a]"
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
              <div className="inline-flex items-center gap-2 rounded-full border border-[#13161a]/15 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#13161a]/75">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e8761a]" />
                {model.hero.eyebrow}
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 text-6xl font-medium leading-[0.94] tracking-tight sm:text-7xl md:text-[88px]"
                style={{ fontFamily: "var(--font-familjen)" }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={240}>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#3a3d42] sm:text-lg sm:leading-8">
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={360}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#e8761a] px-6 py-3.5 text-sm font-semibold text-[#13161a] shadow-[0_3px_0_#a6520d,0_12px_30px_rgba(232,118,26,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a6520d,0_18px_38px_rgba(232,118,26,0.42)] active:translate-y-0.5 active:shadow-[0_1px_0_#a6520d,0_4px_10px_rgba(232,118,26,0.32)] sm:text-base"
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#13161a]/15 bg-white px-5 py-3 text-sm font-semibold text-[#13161a] transition hover:-translate-y-0.5 hover:border-[#13161a]/45 hover:shadow-[0_8px_24px_rgba(19,22,26,0.10)] sm:text-base"
                  >
                    {model.hero.secondaryCta.label}
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-3 w-3 transition group-hover:translate-x-1"
                    />
                  </a>
                ) : null}
              </div>
            </Reveal>

            <Reveal from="up" delay={520}>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#3a3d42]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#e8761a]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-medium tabular-nums text-[#13161a]"
                      style={{ fontFamily: "var(--font-familjen)" }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span>· {model.business.reviewCount} reviews</span>
                    ) : null}
                  </span>
                ) : null}
                {model.business.yearsInBusiness && model.business.yearsInBusiness >= 1 ? (
                  <span className="inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 text-[#13161a]/55" />
                    {model.business.yearsInBusiness}+ yrs on the punch list
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#e8761a]" />
                  Background-checked
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: hero image with sticky-note overlay */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[28px] ring-1 ring-black/10 shadow-[0_30px_80px_rgba(19,22,26,0.18)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} crew at work`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[28px] bg-gradient-to-br from-[#13161a] to-[#2a313a]" />
              )}

              {/* Sticky note layered onto image */}
              <div
                className="absolute -left-3 -bottom-6 w-[68%] max-w-[260px] rotate-[-3.5deg] rounded-[18px] bg-[#fff7e1] p-4 shadow-[0_2px_0_rgba(19,22,26,0.18),0_18px_40px_rgba(19,22,26,0.22)] sm:-left-6 sm:-bottom-10 sm:p-5 sm:max-w-[280px]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent 0, transparent 24px, rgba(19,22,26,0.08) 25px, transparent 26px)",
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#13161a]/60">
                  Today&rsquo;s list
                </p>
                <ul className="mt-3 space-y-1.5">
                  {[
                    "Mount Sarah's TV",
                    "Patch hallway drywall",
                    "Replace porch light",
                  ].map((item, idx) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[14px]"
                      style={{ fontFamily: "var(--font-familjen)" }}
                    >
                      <span className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-[3px] border border-[#13161a]/40 bg-white text-[10px] text-[#e8761a]">
                        {idx < 2 ? <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5" /> : null}
                      </span>
                      <span className={idx < 2 ? "line-through decoration-[#13161a]/45" : ""}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* "On the truck right now" badge */}
              <div className="absolute -right-3 -top-3 inline-flex items-center gap-2 rounded-full bg-[#13161a] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f6f1e7] shadow-[0_8px_24px_rgba(19,22,26,0.32)] sm:-right-6 sm:-top-6">
                <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#e8761a]" />
                On the truck
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-[28px] bg-[#13161a] px-7 py-10 text-[#f6f1e7] sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#e8761a]/14"
              />
              <span className="text-[#e8761a]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl text-2xl leading-[1.35] sm:text-[28px] sm:leading-[1.32]"
                style={{ fontFamily: "var(--font-familjen)" }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm uppercase tracking-[0.24em] text-[#f6f1e7]/60">
                — {model.topReview.authorFirstName} · Google review
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e8761a]">
            What we knock out
          </p>
          <h2
            className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-familjen)" }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article
                  className={`group relative h-full rounded-[22px] border border-[#13161a]/10 bg-white p-7 transition will-change-transform hover:-translate-y-1 hover:border-[#e8761a]/45 hover:shadow-[0_24px_48px_rgba(19,22,26,0.10)]`}
                  style={{ rotate: `${(idx % 2 === 0 ? -0.6 : 0.6).toFixed(1)}deg` }}
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#13161a] text-[#f6f1e7] transition group-hover:bg-[#e8761a] group-hover:text-[#13161a]">
                    <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                  </span>
                  <h3
                    className="mt-5 text-xl font-semibold leading-snug"
                    style={{ fontFamily: "var(--font-familjen)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#3a3d42]">{service.body}</p>
                  <div className="mt-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-[#13161a]/55">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e8761a]">
              Recent work
            </p>
            <h2
              className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-familjen)" }}
            >
              From the truck this week.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div
                  className="group relative overflow-hidden rounded-[22px] border border-[#13161a]/10 bg-white"
                  style={{ rotate: `${idx === 1 ? 0 : idx === 0 ? -0.6 : 0.6}deg` }}
                >
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e8761a]">
                Stamped & Approved
              </p>
              <h2
                className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-familjen)" }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[#3a3d42]">
                Pinned to the inside of the truck door. Every single visit, every single time.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-2xl border border-dashed border-[#13161a]/20 bg-white/70 p-5 transition hover:border-[#e8761a] hover:bg-white">
                    <span
                      className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#e8761a]/15 text-[#e8761a] transition group-hover:rotate-3 group-hover:bg-[#e8761a] group-hover:text-[#13161a]"
                    >
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className="text-lg font-semibold leading-tight"
                        style={{ fontFamily: "var(--font-familjen)" }}
                      >
                        {bullet.title}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-7 text-[#3a3d42]">{bullet.body}</p>
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
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#13161a] via-[#1c2026] to-[#13161a] px-7 py-12 text-[#f6f1e7] sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(800px 280px at 90% 10%, rgba(232,118,26,0.6), transparent 55%)",
              }}
            />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e8761a]">
              Service area
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-familjen)" }}
            >
              {model.serviceArea.heading}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-7 text-[#f6f1e7]/75 sm:text-lg">
              {model.serviceArea.body}
            </p>
            <div className="relative mt-8 inline-flex items-center gap-3 rounded-full bg-white/8 px-4 py-2 text-sm text-[#f6f1e7]/85 ring-1 ring-white/10">
              <FontAwesomeIcon icon={faBolt} className="h-3.5 w-3.5 text-[#e8761a]" />
              Most calls scheduled within 48 hours
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e8761a]">
            From the clipboard
          </p>
          <h2
            className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-familjen)" }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-2xl border border-[#13161a]/10 bg-white open:border-[#e8761a]/45 open:shadow-[0_18px_36px_rgba(19,22,26,0.08)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold tracking-tight">
                  <span style={{ fontFamily: "var(--font-familjen)" }}>{item.question}</span>
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#13161a]/15 bg-[#f6f1e7] text-[#13161a] transition group-open:rotate-45 group-open:bg-[#e8761a] group-open:text-[#13161a]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#3a3d42]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] border border-[#13161a]/10 bg-[#fff7e1] p-8 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#13161a]/55">
                Tap, text, or call
              </p>
              <h2
                className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-familjen)" }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#3a3d42] sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-[#13161a] px-5 py-4 text-base font-semibold text-[#f6f1e7] transition hover:bg-[#e8761a] hover:text-[#13161a]"
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
              <p className="flex items-center justify-start gap-2 text-sm text-[#3a3d42]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#e8761a]" />
                Texted arrival window before we head out.
              </p>
              <p className="flex items-center justify-start gap-2 text-sm text-[#3a3d42]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#e8761a]" />
                Photo of the tech before they pull up.
              </p>
              <p className="flex items-center justify-start gap-2 text-sm text-[#3a3d42]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#e8761a]" />
                Drop cloths down. Mess gone before we leave.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#13161a]/55 sm:px-8">
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
