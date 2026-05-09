import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faGears,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { bungee, onest } from "@/lib/preview/fonts";

export function AutoRepairPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${bungee.variable} ${onest.variable} relative min-h-screen overflow-hidden bg-[#ecedef] pb-32 text-[#101113]`}
      style={{ fontFamily: "var(--font-onest), system-ui, sans-serif" }}
    >
      {/* Industrial diagonal stripe at top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 h-[420px] w-[60%] origin-top-right rotate-[-8deg] bg-[#ff5b14] opacity-[0.16]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 80px, rgba(16,17,19,0.04) 80px 81px)",
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
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#0c0d0f] text-base text-[#ff5b14]">
              <span style={{ fontFamily: "var(--font-bungee)" }}>{initials}</span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[18px] tracking-[0.04em]"
              style={{ fontFamily: "var(--font-bungee)" }}
            >
              {model.business.name.toUpperCase()}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.32em] text-black/55">
                {model.business.city} · ASE-certified shop
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-md bg-[#0c0d0f] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-[#ff5b14] transition hover:bg-[#ff5b14] hover:text-[#0c0d0f]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5 transition group-hover:rotate-12" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">CALL</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center lg:gap-10">
          {/* LEFT: copy column */}
          <div>
            <Reveal from="up" delay={0}>
              <div className="inline-flex items-center gap-2 rounded-md border border-[#0c0d0f]/15 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff5b14]" />
                {model.hero.eyebrow}
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 max-w-[16ch] text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
                style={{ fontFamily: "var(--font-bungee)" }}
              >
                {model.hero.headline.toUpperCase()}
              </h1>
            </Reveal>

            <Reveal from="up" delay={240}>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#3a3d44] sm:text-lg sm:leading-8">
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={360}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-[#ff5b14] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#0c0d0f] shadow-[0_4px_0_#a23a08,0_14px_28px_rgba(255,91,20,0.32)] transition hover:-translate-y-0.5 hover:bg-[#ff6f30] hover:shadow-[0_6px_0_#a23a08,0_20px_36px_rgba(255,91,20,0.45)] active:translate-y-0.5 sm:text-base"
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-md border-2 border-[#0c0d0f] bg-white px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-[#0c0d0f] transition hover:-translate-y-0.5 hover:bg-[#0c0d0f] hover:text-[#ff5b14] sm:text-base"
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
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#3a3d44]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#ff5b14]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base tabular-nums tracking-wide"
                      style={{ fontFamily: "var(--font-bungee)" }}
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
                    <FontAwesomeIcon icon={faGears} className="h-3.5 w-3.5 text-[#ff5b14]" />
                    {model.business.yearsInBusiness}+ yrs in the bay
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#ff5b14]" />
                  2-yr / 24K-mile warranty
                </span>
              </div>
            </Reveal>
          </div>

          {/* RIGHT: hero photo with overlays */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-md ring-2 ring-[#0c0d0f] shadow-[8px_8px_0_#ff5b14]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} shop floor`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-md bg-gradient-to-br from-[#0c0d0f] via-[#1a1d22] to-[#2a313a] ring-2 ring-[#0c0d0f] shadow-[8px_8px_0_#ff5b14]" />
              )}

              {/* ASE-CERTIFIED stamp — top-right */}
              <div className="absolute -right-3 -top-3 rotate-[6deg] rounded-md bg-[#ff5b14] px-3.5 py-2.5 text-white shadow-[0_12px_28px_rgba(255,91,20,0.55)] ring-2 ring-[#0c0d0f] sm:-right-5 sm:-top-5">
                <p
                  className="text-[11px] uppercase leading-none tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-bungee)" }}
                >
                  ASE
                </p>
                <p
                  className="mt-1 text-[15px] uppercase leading-none tracking-[0.08em]"
                  style={{ fontFamily: "var(--font-bungee)" }}
                >
                  Certified
                </p>
              </div>

              {/* Bay status card overlay — bottom-left */}
              <div className="absolute -bottom-4 -left-4 w-[78%] max-w-[300px] rounded-md border-2 border-[#0c0d0f] bg-[#0c0d0f] p-4 text-[#f0eeea] shadow-[0_18px_40px_rgba(12,13,15,0.45)] sm:-left-8 sm:p-5">
                <div className="flex items-center justify-between border-b border-[#ff5b14]/30 pb-3">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ff5b14]"
                    style={{ fontFamily: "var(--font-bungee)" }}
                  >
                    BAY STATUS
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#0fa45a]">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#0fa45a]" />
                    OPEN
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-[13px]">
                  {[
                    { bay: "BAY 01", status: "Brake job · 75%", color: "#facc15" },
                    { bay: "BAY 02", status: "Diag complete", color: "#0fa45a" },
                    { bay: "BAY 03", status: "Available", color: "#ff5b14" },
                  ].map((item) => (
                    <li key={item.bay} className="flex items-center justify-between">
                      <span
                        className="text-[#f0eeea]/85"
                        style={{ fontFamily: "var(--font-bungee)", fontSize: "12px", letterSpacing: "0.08em" }}
                      >
                        {item.bay}
                      </span>
                      <span style={{ color: item.color }} className="text-[12px]">
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-[#ff5b14]/30 pt-3">
                  <p className="text-[11px] text-[#f0eeea]/65">
                    Free pickup & drop-off · 10-mile radius
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
            <figure className="relative overflow-hidden rounded-md border-2 border-[#0c0d0f] bg-[#0c0d0f] px-7 py-10 text-[#f0eeea] sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#ff5b14]/14"
              />
              <span className="text-[#ff5b14]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote className="relative mt-5 max-w-3xl text-2xl leading-[1.4] sm:text-[28px]">
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm uppercase tracking-[0.24em] text-[#f0eeea]/65">
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
            className="text-[10px] uppercase tracking-[0.32em] text-[#ff5b14]"
            style={{ fontFamily: "var(--font-bungee)" }}
          >
            SERVICES
          </p>
          <h2
            className="mt-3 text-3xl tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-bungee)" }}
          >
            {model.services.heading.toUpperCase()}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP.car;
            const num = String(idx + 1).padStart(2, "0");
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative h-full overflow-hidden rounded-md border-2 border-[#0c0d0f]/15 bg-white p-7 transition hover:-translate-y-1 hover:border-[#0c0d0f] hover:shadow-[6px_6px_0_#ff5b14]">
                  <div
                    aria-hidden
                    className="absolute right-0 top-0 h-full w-1.5 bg-[#ff5b14]"
                  />
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#0c0d0f] text-[#ff5b14] transition group-hover:bg-[#ff5b14] group-hover:text-[#0c0d0f]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <span
                      className="text-[44px] leading-none text-[#0c0d0f]/15"
                      style={{ fontFamily: "var(--font-bungee)" }}
                    >
                      {num}
                    </span>
                  </div>
                  <h3
                    className="mt-5 text-lg leading-snug tracking-[0.02em]"
                    style={{ fontFamily: "var(--font-bungee)" }}
                  >
                    {service.title.toUpperCase()}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#3a3d44]">{service.body}</p>
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
              className="text-[10px] uppercase tracking-[0.32em] text-[#ff5b14]"
              style={{ fontFamily: "var(--font-bungee)" }}
            >
              IN THE SHOP
            </p>
            <h2
              className="mt-3 text-3xl tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-bungee)" }}
            >
              FROM THE FLOOR THIS WEEK.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-md border-2 border-[#0c0d0f]">
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
                className="text-[10px] uppercase tracking-[0.32em] text-[#ff5b14]"
                style={{ fontFamily: "var(--font-bungee)" }}
              >
                ON THE FLOOR
              </p>
              <h2
                className="mt-3 text-3xl tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-bungee)" }}
              >
                {model.whyUs.heading.toUpperCase()}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[#3a3d44]">
                The dealer-quality work without the dealer markup, the
                dealer waiting room, or the dealer attitude.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP.wrench;
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-md border-2 border-[#0c0d0f]/12 bg-white p-5 transition hover:border-[#ff5b14]">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-[#ff5b14] text-[#0c0d0f] transition group-hover:rotate-3">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className="text-base leading-tight tracking-[0.02em]"
                        style={{ fontFamily: "var(--font-bungee)" }}
                      >
                        {bullet.title.toUpperCase()}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-7 text-[#3a3d44]">{bullet.body}</p>
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
          <div className="relative overflow-hidden rounded-md border-2 border-[#0c0d0f] bg-[#0c0d0f] px-7 py-12 text-[#f0eeea] sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] origin-top-right rotate-[-12deg] bg-[#ff5b14] opacity-20"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(800px 320px at 90% 10%, rgba(255, 91, 20, 0.6), transparent 55%)",
              }}
            />
            <p
              className="relative text-[10px] uppercase tracking-[0.32em] text-[#ff5b14]"
              style={{ fontFamily: "var(--font-bungee)" }}
            >
              SERVICE AREA
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-3xl tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-bungee)" }}
            >
              {model.serviceArea.heading.toUpperCase()}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-7 text-[#f0eeea]/80 sm:text-lg">
              {model.serviceArea.body}
            </p>
            <div className="relative mt-8 inline-flex items-center gap-3 rounded-md bg-[#ff5b14]/12 px-4 py-2 text-sm text-[#ff5b14] ring-1 ring-[#ff5b14]/30">
              <FontAwesomeIcon icon={faWrench} className="h-3.5 w-3.5" />
              Loaner cars on multi-day jobs
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[10px] uppercase tracking-[0.32em] text-[#ff5b14]"
            style={{ fontFamily: "var(--font-bungee)" }}
          >
            COMMON QUESTIONS
          </p>
          <h2
            className="mt-3 text-3xl tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-bungee)" }}
          >
            {model.faq.heading.toUpperCase()}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-md border-2 border-[#0c0d0f]/15 bg-white open:border-[#ff5b14] open:shadow-[6px_6px_0_#0c0d0f]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold tracking-tight">
                  <span>{item.question}</span>
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border border-[#0c0d0f]/15 bg-[#ecedef] text-[#0c0d0f] transition group-open:rotate-45 group-open:bg-[#ff5b14] group-open:text-[#0c0d0f]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#3a3d44]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-md border-2 border-[#0c0d0f] bg-white p-8 shadow-[8px_8px_0_#ff5b14] sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.32em] text-[#ff5b14]"
                style={{ fontFamily: "var(--font-bungee)" }}
              >
                BOOK A BAY
              </p>
              <h2
                className="mt-3 text-3xl tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-bungee)" }}
              >
                {model.contact.heading.toUpperCase()}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#3a3d44] sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-md bg-[#0c0d0f] px-5 py-4 text-base font-bold uppercase tracking-wider text-[#ff5b14] transition hover:bg-[#ff5b14] hover:text-[#0c0d0f]"
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
              <p className="flex items-center gap-2 text-sm text-[#3a3d44]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#ff5b14]" />
                ASE-certified techs · OEM-grade parts
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a3d44]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#ff5b14]" />
                Photo + written quote before any work
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a3d44]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#ff5b14]" />
                2-yr / 24K-mile parts & labor warranty
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
