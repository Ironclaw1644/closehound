import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { ibmPlexSans, ibmPlexMono } from "@/lib/preview/fonts";

export function ElectricalPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const ticket = `WO-${model.slug.slice(-6).toUpperCase()}`;

  return (
    <div
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} relative min-h-screen overflow-hidden bg-[#eef0f2] pb-32 text-[#0c0e10]`}
      style={{ fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif" }}
    >
      {/* Schematic graph paper background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(12,14,16,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(12,14,16,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Yellow voltage glow at top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{
          background:
            "radial-gradient(900px 320px at 90% 0%, rgba(255, 212, 0, 0.18), transparent 60%)",
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
            <div className="relative flex h-12 w-12 items-center justify-center rounded-md bg-[#0c0e10] text-base font-bold text-[#ffd400]">
              <FontAwesomeIcon
                icon={faBolt}
                className="absolute -right-1 -top-1 h-3 w-3 text-[#ffd400]"
              />
              <span style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>{initials}</span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[18px] font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p
                className="text-[10px] uppercase tracking-[0.28em] text-black/55"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                {model.business.city} · Master licensed
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-md bg-[#0c0e10] px-4 py-2.5 text-sm font-semibold text-[#ffd400] transition hover:bg-[#ffd400] hover:text-[#0c0e10]"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5 transition group-hover:rotate-12" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">CALL</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:gap-10">
          {/* LEFT column — copy + CTAs + trust strip */}
          <div>
            <Reveal from="up" delay={0}>
              <div
                className="inline-flex items-center gap-2 rounded-md border border-[#0c0e10]/15 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ffd400] shadow-[0_0_0_2px_rgba(255,212,0,0.25)]" />
                {model.hero.eyebrow}
                <span className="ml-2 border-l border-[#0c0e10]/15 pl-2 text-[10px] text-[#0c0e10]/55">
                  {ticket}
                </span>
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 max-w-[18ch] text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
                style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={240}>
              <p
                className="mt-7 max-w-xl text-base leading-7 text-[#3a4048] sm:text-lg sm:leading-8"
                style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
              >
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={360}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-[#ffd400] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-[#0c0e10] shadow-[0_4px_0_#a18800,0_14px_28px_rgba(255,212,0,0.32)] transition hover:-translate-y-0.5 hover:bg-[#ffdf2b] hover:shadow-[0_6px_0_#a18800,0_20px_36px_rgba(255,212,0,0.45)] active:translate-y-0.5 sm:text-base"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-12" />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-md border border-[#0c0e10]/20 bg-white px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[#0c0e10] hover:shadow-[0_8px_20px_rgba(12,14,16,0.10)] sm:text-base"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
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
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#3a4048]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#ffd400] drop-shadow-[0_0_6px_rgba(255,212,0,0.35)]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-semibold tabular-nums"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                        / {model.business.reviewCount} reviews
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {model.business.yearsInBusiness && model.business.yearsInBusiness >= 1 ? (
                  <span className="inline-flex items-center gap-2" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                    <FontAwesomeIcon icon={faBolt} className="h-3.5 w-3.5 text-[#ffd400]" />
                    {model.business.yearsInBusiness}+ yrs licensed
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#ffd400]" />
                  Permit-pulled · NEC current
                </span>
              </div>
            </Reveal>
          </div>

          {/* RIGHT column — hero photo with service-ticket card overlaid */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-md ring-2 ring-[#0c0e10] shadow-[8px_8px_0_#ffd400]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} electrical panel close-up`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-md bg-gradient-to-br from-[#0c0e10] via-[#1a1d22] to-[#2a2f37] ring-2 ring-[#0c0e10] shadow-[8px_8px_0_#ffd400]" />
              )}

              {/* LIVE · DISPATCHING badge — top-right of photo */}
              <div
                className="absolute -right-3 -top-3 inline-flex items-center gap-2 rounded-md bg-[#ffd400] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#0c0e10] shadow-[0_8px_24px_rgba(255,212,0,0.45)] sm:-right-5 sm:-top-5"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#0c0e10]" />
                Live · Dispatching
              </div>

              {/* Service ticket card overlaid bottom-left */}
              <div
                className="absolute -bottom-4 -left-4 w-[88%] max-w-sm rounded-md border-2 border-[#0c0e10] bg-white p-5 shadow-[6px_6px_0_#0c0e10] sm:-left-8 sm:w-[78%]"
              >
                <div className="flex items-center justify-between border-b border-dashed border-[#0c0e10]/30 pb-3">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.28em]"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                  >
                    Service ticket
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.18em] text-[#0c0e10]/55"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                  >
                    {ticket}
                  </p>
                </div>
                <ul
                  className="mt-3 space-y-1.5 text-[13px]"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                >
                  {[
                    { label: "Panel diagnosis", status: "✓" },
                    { label: "Permit pulled", status: "✓" },
                    { label: "Inspection scheduled", status: "·" },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span
                        className={item.status === "✓" ? "text-[#0fa45a]" : "text-[#ffd400]"}
                      >
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-dashed border-[#0c0e10]/30 pt-3">
                  <p
                    className="text-[11px] text-[#0c0e10]/65"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                  >
                    Master electrician on every visit
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-md border-2 border-[#0c0e10] bg-[#0c0e10] px-7 py-10 text-[#ffd400] shadow-[8px_8px_0_#ffd400] sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#ffd400]/12"
              />
              <span>
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl text-2xl font-medium leading-[1.4] text-[#fff7c8] sm:text-[28px]"
                style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption
                className="mt-6 text-sm uppercase tracking-[0.24em] text-[#ffd400]/65"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                — {model.topReview.authorFirstName} · Google review
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#0c0e10]"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            <span className="text-[#ffd400]">▸</span> Services
          </p>
          <h2
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP.bolt;
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative h-full rounded-md border-2 border-[#0c0e10] bg-white p-7 transition hover:-translate-y-1 hover:bg-[#fff7c8] hover:shadow-[6px_6px_0_#ffd400]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#ffd400] text-[#0c0e10] transition group-hover:rotate-3">
                    <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                  </span>
                  <h3
                    className="mt-5 text-xl font-semibold leading-snug tracking-tight"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#3a4048]">{service.body}</p>
                  <div
                    className="mt-6 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.22em] text-[#0c0e10]/55"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                  >
                    <span>SVC.0{idx + 1}</span>
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
            <p
              className="text-[10px] font-bold uppercase tracking-[0.32em]"
              style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
            >
              <span className="text-[#ffd400]">▸</span> Field photos
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
            >
              From the panel to the EV charger.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-md border-2 border-[#0c0e10]">
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
              <p
                className="text-[10px] font-bold uppercase tracking-[0.32em]"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                <span className="text-[#ffd400]">▸</span> Standards
              </p>
              <h2
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[#3a4048]">
                Every panel pulled, every breaker labeled, every job documented.
                The next electrician will know what we did and why.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-md border-2 border-[#0c0e10]/12 bg-white p-5 transition hover:border-[#ffd400] hover:bg-[#fffded]">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-[#0c0e10] text-[#ffd400] transition group-hover:bg-[#ffd400] group-hover:text-[#0c0e10]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className="text-lg font-semibold leading-tight tracking-tight"
                        style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
                      >
                        {bullet.title}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-7 text-[#3a4048]">{bullet.body}</p>
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
          <div className="relative overflow-hidden rounded-md border-2 border-[#ffd400] bg-[#0c0e10] px-7 py-12 text-[#fff7c8] sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,212,0,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,212,0,0.6) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <p
              className="relative text-[10px] font-bold uppercase tracking-[0.32em] text-[#ffd400]"
              style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
            >
              ▸ Service area
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
            >
              {model.serviceArea.heading}
            </h2>
            <p
              className="relative mt-5 max-w-2xl text-base leading-7 text-[#fff7c8]/85 sm:text-lg"
              style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
            >
              {model.serviceArea.body}
            </p>
            <div
              className="relative mt-8 inline-flex items-center gap-3 rounded-md bg-[#ffd400]/12 px-4 py-2 text-sm text-[#ffd400] ring-1 ring-[#ffd400]/30"
              style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
            >
              <FontAwesomeIcon icon={faBolt} className="h-3.5 w-3.5" />
              Same-week service · 24-hr emergency dispatch
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.32em]"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            <span className="text-[#ffd400]">▸</span> FAQ
          </p>
          <h2
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-md border-2 border-[#0c0e10]/15 bg-white open:border-[#ffd400] open:shadow-[6px_6px_0_#ffd400]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold tracking-tight">
                  <span style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>{item.question}</span>
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border border-[#0c0e10]/15 bg-[#eef0f2] text-[#0c0e10] transition group-open:rotate-45 group-open:bg-[#ffd400]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#3a4048]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-md border-2 border-[#0c0e10] bg-white p-8 shadow-[8px_8px_0_#ffd400] sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.32em]"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                <span className="text-[#ffd400]">▸</span> Dispatch
              </p>
              <h2
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#3a4048] sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-md bg-[#0c0e10] px-5 py-4 text-base font-bold uppercase tracking-wider text-[#ffd400] transition hover:bg-[#ffd400] hover:text-[#0c0e10]"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
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
              <p className="flex items-center gap-2 text-sm text-[#3a4048]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#ffd400]" />
                Master electrician on every job
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a4048]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#ffd400]" />
                Permit pulled · Inspection passed
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a4048]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#ffd400]" />
                Photo of finished panel sent to your phone
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-black/55 sm:px-8"
        style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
      >
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
