import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faShieldHalved,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { schibstedGrotesk, karla } from "@/lib/preview/fonts";

export function PestControlPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${schibstedGrotesk.variable} ${karla.variable} relative min-h-screen overflow-hidden bg-[#f0f4f1] pb-32 text-[#0e1d22]`}
      style={{ fontFamily: "var(--font-karla), system-ui, sans-serif" }}
    >
      {/* Soft green halo at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(900px 360px at 22% 0%, rgba(15, 164, 90, 0.18), transparent 60%)",
        }}
      />
      {/* Subtle clinical grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(14,29,34,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,29,34,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
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
              className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10"
            />
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#0fa45a] text-base font-semibold text-[#f4faf6]">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="absolute -right-1 -top-1 h-3 w-3 text-[#0e1d22]"
              />
              <span style={{ fontFamily: "var(--font-schibsted)" }}>{initials}</span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[18px] font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-schibsted)" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#0fa45a]">
                {model.business.city} · State-licensed
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full bg-[#0fa45a] px-4 py-2.5 text-sm font-semibold text-[#f4faf6] transition hover:bg-[#0e1d22]"
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
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0fa45a]/35 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0fa45a]">
                <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                {model.hero.eyebrow}
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 text-6xl font-medium leading-[0.94] tracking-tight sm:text-7xl md:text-[88px]"
                style={{ fontFamily: "var(--font-schibsted)" }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={240}>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#384a52] sm:text-lg sm:leading-8">
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={360}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#0fa45a] px-6 py-3.5 text-sm font-semibold text-[#f4faf6] shadow-[0_3px_0_#0a6e3c,0_12px_28px_rgba(15,164,90,0.42)] transition hover:-translate-y-0.5 hover:bg-[#13b866] hover:shadow-[0_5px_0_#0a6e3c,0_18px_38px_rgba(15,164,90,0.55)] active:translate-y-0.5 sm:text-base"
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="h-4 w-4 transition group-hover:rotate-[-12deg]"
                  />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#0e1d22]/15 bg-white px-5 py-3 text-sm font-semibold text-[#0e1d22] transition hover:-translate-y-0.5 hover:border-[#0e1d22]/45 hover:shadow-[0_8px_24px_rgba(14,29,34,0.10)] sm:text-base"
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
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#384a52]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#0fa45a]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-semibold tabular-nums text-[#0e1d22]"
                      style={{ fontFamily: "var(--font-schibsted)" }}
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
                    <FontAwesomeIcon icon={faLeaf} className="h-3.5 w-3.5 text-[#0fa45a]" />
                    {model.business.yearsInBusiness}+ yrs licensed
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#0fa45a]" />
                  Family + pet safe
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: hero photo with quarterly-coverage badge overlay */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[28px] ring-1 ring-[#0fa45a]/15 shadow-[0_30px_80px_rgba(14,29,34,0.12)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} perimeter treatment`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[28px] bg-gradient-to-br from-[#0fa45a]/20 via-[#e6f4eb] to-[#f0f4f1] ring-1 ring-[#0fa45a]/15" />
              )}

              {/* Quarterly coverage badge — bottom-left overlay */}
              <div className="absolute -bottom-6 -left-6 w-[78%] max-w-[290px] rounded-[20px] bg-white p-5 ring-1 ring-[#0fa45a]/20 shadow-[0_18px_40px_rgba(14,29,34,0.18)]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0fa45a]/15 text-[#0fa45a]">
                    <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0fa45a]">
                    Quarterly coverage
                  </p>
                </div>
                <p
                  className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-[#0e1d22] sm:text-[28px]"
                  style={{ fontFamily: "var(--font-schibsted)" }}
                >
                  4 visits / yr
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {["Q1", "Q2", "Q3", "Q4"].map((q, idx) => {
                    const isCurrent = idx === 1;
                    return (
                      <div key={q} className="flex flex-1 flex-col items-center gap-1.5">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            isCurrent
                              ? "preview-pulse bg-[#0fa45a]"
                              : "bg-[#0fa45a]/25"
                          }`}
                        />
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${
                            isCurrent ? "text-[#0fa45a]" : "text-[#0e1d22]/45"
                          }`}
                        >
                          {q}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-1.5 border-t border-[#0fa45a]/15 pt-3 text-[11px] text-[#384a52]">
                  <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-[#0fa45a]" />
                  Family + pet safe
                </div>
              </div>

              {/* State-licensed badge — top-right rotated */}
              <div className="absolute -right-3 -top-3 rotate-[6deg] rounded-2xl bg-[#0e1d22] px-4 py-3 text-[#f4faf6] shadow-[0_12px_28px_rgba(14,29,34,0.45)] sm:-right-6 sm:-top-6">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0fa45a]"
                  style={{ fontFamily: "var(--font-karla)" }}
                >
                  State
                </p>
                <p
                  className="mt-0.5 text-[15px] font-semibold uppercase tracking-[0.18em] text-[#f4faf6]"
                  style={{ fontFamily: "var(--font-karla)" }}
                >
                  Licensed
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
            <figure className="relative overflow-hidden rounded-[28px] bg-white px-7 py-10 ring-1 ring-[#0fa45a]/20 sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#0fa45a]/10"
              />
              <span className="text-[#0fa45a]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl text-2xl font-medium leading-[1.4] text-[#0e1d22] sm:text-[28px]"
                style={{ fontFamily: "var(--font-schibsted)" }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm uppercase tracking-[0.24em] text-[#0fa45a]/85">
                — {model.topReview.authorFirstName} · Google review
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#0fa45a]">
            What we treat
          </p>
          <h2
            className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-schibsted)" }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["shield-halved"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative h-full rounded-[24px] bg-white p-7 ring-1 ring-[#0fa45a]/15 transition hover:-translate-y-1 hover:ring-[#0fa45a]/40 hover:shadow-[0_24px_48px_rgba(14,29,34,0.10)]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0fa45a]/15 text-[#0fa45a] transition group-hover:bg-[#0fa45a] group-hover:text-[#f4faf6]">
                    <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                  </span>
                  <h3
                    className="mt-5 text-xl font-semibold leading-snug tracking-tight"
                    style={{ fontFamily: "var(--font-schibsted)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#384a52]">{service.body}</p>
                  <div className="mt-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0fa45a]/65">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#0fa45a]">
              On the route
            </p>
            <h2
              className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-schibsted)" }}
            >
              Treatments in the field.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-[24px] ring-1 ring-[#0fa45a]/15">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#0fa45a]">
                Standards
              </p>
              <h2
                className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-schibsted)" }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[#384a52]">
                Family-and-pet-safe products, state-licensed applicators, and the
                same tech every visit. Coverage that keeps holding.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["shield-halved"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-[18px] bg-white p-5 ring-1 ring-[#0fa45a]/15 transition hover:ring-[#0fa45a]/40">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#0fa45a]/15 text-[#0fa45a] transition group-hover:bg-[#0fa45a] group-hover:text-[#f4faf6]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className="text-lg font-semibold leading-tight tracking-tight"
                        style={{ fontFamily: "var(--font-schibsted)" }}
                      >
                        {bullet.title}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-7 text-[#384a52]">{bullet.body}</p>
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
          <div className="relative overflow-hidden rounded-[32px] bg-[#0e1d22] px-7 py-12 text-[#f4faf6] sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(800px 320px at 90% 10%, rgba(15, 164, 90, 0.7), transparent 55%)",
              }}
            />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.32em] text-[#0fa45a]">
              Service area
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-schibsted)" }}
            >
              {model.serviceArea.heading}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-7 text-[#f4faf6]/80 sm:text-lg">
              {model.serviceArea.body}
            </p>
            <div className="relative mt-8 inline-flex items-center gap-3 rounded-full bg-[#0fa45a]/15 px-4 py-2 text-sm text-[#f4faf6]/90 ring-1 ring-[#0fa45a]/30">
              <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5 text-[#0fa45a]" />
              Free re-treats between visits
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#0fa45a]">
            Common questions
          </p>
          <h2
            className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-schibsted)" }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-2xl bg-white ring-1 ring-[#0fa45a]/15 open:ring-[#0fa45a]/40 open:shadow-[0_18px_36px_rgba(14,29,34,0.06)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold tracking-tight">
                  <span style={{ fontFamily: "var(--font-schibsted)" }}>{item.question}</span>
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#0fa45a]/15 bg-[#f0f4f1] text-[#0fa45a] transition group-open:rotate-45 group-open:bg-[#0fa45a] group-open:text-[#f4faf6]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#384a52]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] bg-white p-8 ring-1 ring-[#0fa45a]/20 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#0fa45a]">
                Free inspection
              </p>
              <h2
                className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-schibsted)" }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#384a52] sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-[#0e1d22] px-5 py-4 text-base font-semibold text-[#f4faf6] transition hover:bg-[#0fa45a]"
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
              <p className="flex items-center gap-2 text-sm text-[#384a52]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#0fa45a]" />
                Family-and-pet-safe products
              </p>
              <p className="flex items-center gap-2 text-sm text-[#384a52]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#0fa45a]" />
                Same tech every visit
              </p>
              <p className="flex items-center gap-2 text-sm text-[#384a52]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#0fa45a]" />
                Free re-treats between scheduled visits
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#0fa45a]/65 sm:px-8">
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
