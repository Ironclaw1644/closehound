import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faLeaf,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { instrumentSerif, onest } from "@/lib/preview/fonts";

export function LandscapingPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${instrumentSerif.variable} ${onest.variable} relative min-h-screen overflow-hidden bg-[#f4efe4] pb-32 text-[#1c2418]`}
      style={{ fontFamily: "var(--font-onest), system-ui, sans-serif" }}
    >
      {/* Mow-stripe background bands */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(96deg, rgba(61,90,42,0.05) 0 80px, transparent 80px 160px)",
        }}
      />
      {/* Soft warmth at the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(900px 320px at 18% 0%, rgba(213, 197, 130, 0.45), transparent 60%)",
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
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#3d5a2a] text-base font-semibold text-[#f4efe4]">
              <FontAwesomeIcon icon={faLeaf} className="absolute -right-1 -top-1 h-3 w-3 rotate-12 text-[#d6b75a]" />
              <span style={{ fontFamily: "var(--font-instrument-serif)" }}>{initials}</span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[20px] tracking-tight"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#3d5a2a]/75">
                {model.business.city} · Family-owned
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full bg-[#3d5a2a] px-4 py-2.5 text-sm font-semibold text-[#f6f8ec] transition hover:bg-[#1c2418]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5 transition group-hover:rotate-12" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:gap-10">
          {/* LEFT — eyebrow / headline / subhead / CTAs / trust */}
          <div>
            <Reveal from="up" delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3d5a2a]/25 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3d5a2a] backdrop-blur">
                <FontAwesomeIcon icon={faSeedling} className="h-3 w-3" />
                {model.hero.eyebrow}
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 max-w-[14ch] text-5xl leading-[0.98] tracking-tight sm:text-7xl md:text-[88px]"
                style={{ fontFamily: "var(--font-instrument-serif)" }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={240}>
              <p className="mt-7 max-w-xl text-base leading-[1.7] text-[#3a4630] sm:text-lg">
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={360}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#3d5a2a] px-6 py-3.5 text-sm font-semibold text-[#f6f8ec] shadow-[0_3px_0_#243818,0_12px_28px_rgba(61,90,42,0.42)] transition hover:-translate-y-0.5 hover:bg-[#4d6e36] hover:shadow-[0_5px_0_#243818,0_18px_38px_rgba(61,90,42,0.55)] active:translate-y-0.5 sm:text-base"
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#3d5a2a]/25 bg-white px-5 py-3 text-sm font-semibold text-[#3d5a2a] transition hover:-translate-y-0.5 hover:border-[#3d5a2a] hover:shadow-[0_8px_24px_rgba(28,36,24,0.10)] sm:text-base"
                  >
                    {model.hero.secondaryCta.label}
                    <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 transition group-hover:translate-x-1" />
                  </a>
                ) : null}
              </div>
            </Reveal>

            <Reveal from="up" delay={520}>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#3a4630]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#d6b75a]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base tabular-nums text-[#1c2418]"
                      style={{ fontFamily: "var(--font-instrument-serif)" }}
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
                    <FontAwesomeIcon icon={faLeaf} className="h-3.5 w-3.5 text-[#3d5a2a]" />
                    {model.business.yearsInBusiness}+ seasons on the route
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#3d5a2a]" />
                  Licensed & insured
                </span>
              </div>
            </Reveal>
          </div>

          {/* RIGHT — hero photo with route-card overlay + price badge */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[28px] ring-1 ring-[#3d5a2a]/12 shadow-[0_30px_80px_rgba(28,36,24,0.18)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} manicured yard`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[28px] bg-gradient-to-br from-[#3d5a2a] via-[#4d6e36] to-[#243818] ring-1 ring-[#3d5a2a]/12 shadow-[0_30px_80px_rgba(28,36,24,0.18)]" />
              )}

              {/* Price badge — top right, gold on cream */}
              <div className="absolute -right-3 -top-4 inline-flex items-center gap-2 rounded-full bg-[#f6f1de] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1c2418] ring-1 ring-[#d6b75a]/55 shadow-[0_2px_0_rgba(28,36,24,0.06),0_10px_24px_rgba(28,36,24,0.14)] sm:-right-6">
                <FontAwesomeIcon icon={faLeaf} className="h-3.5 w-3.5 text-[#d6b75a]" />
                <span>$45/wk</span>
                <span className="text-[#3a4630]/65">· weekly mow</span>
              </div>

              {/* Route card overlay — bottom left */}
              <div className="absolute -bottom-6 -left-3 w-[78%] max-w-[280px] rounded-[20px] bg-white p-5 ring-1 ring-[#3d5a2a]/12 shadow-[0_18px_40px_rgba(28,36,24,0.16)] sm:-bottom-6 sm:-left-10">
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#3d5a2a]">
                  This week&rsquo;s route
                </p>
                <ul className="mt-3 space-y-1.5">
                  {[
                    { label: "Tues · North end", done: true },
                    { label: "Thurs · South side", done: true },
                    { label: "Fri · Monthly clients", done: false },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 text-[15px]"
                      style={{ fontFamily: "var(--font-instrument-serif)" }}
                    >
                      <span className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-full border border-[#3d5a2a]/45 bg-[#f4efe4] text-[10px] text-[#3d5a2a]">
                        {item.done ? <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5" /> : null}
                      </span>
                      <span className={item.done ? "text-[#1c2418]/55 line-through decoration-[#3d5a2a]/40" : ""}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-32 max-w-6xl px-5 sm:px-8 sm:mt-36">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-[28px] bg-white px-7 py-10 ring-1 ring-[#3d5a2a]/15 sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#3d5a2a]/8"
              />
              <span className="text-[#d6b75a]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl text-2xl leading-[1.4] text-[#1c2418] sm:text-[28px]"
                style={{ fontFamily: "var(--font-instrument-serif)" }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm uppercase tracking-[0.28em] text-[#3d5a2a]/75">
                — {model.topReview.authorFirstName} · Google review
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#3d5a2a]">
            What our crews handle
          </p>
          <h2
            className="mt-3 max-w-3xl text-3xl leading-tight tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP.leaf;
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative h-full overflow-hidden rounded-[24px] border border-[#3d5a2a]/15 bg-white p-7 transition hover:-translate-y-1 hover:border-[#3d5a2a] hover:shadow-[0_24px_48px_rgba(28,36,24,0.12)]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#3d5a2a]/12 text-[#3d5a2a] transition group-hover:bg-[#3d5a2a] group-hover:text-[#f6f8ec]">
                    <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                  </span>
                  <h3
                    className="mt-5 text-2xl leading-snug tracking-tight"
                    style={{ fontFamily: "var(--font-instrument-serif)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#3a4630]">{service.body}</p>
                  <div
                    aria-hidden
                    className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[#3d5a2a]/30 to-transparent"
                  />
                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3d5a2a]/65">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#3d5a2a]">
              Properties on the route
            </p>
            <h2
              className="mt-3 text-3xl tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              The yards we keep dialed in.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div
                  className="group relative overflow-hidden rounded-[24px] ring-1 ring-[#3d5a2a]/15"
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#3d5a2a]">
                Crew standards
              </p>
              <h2
                className="mt-3 text-3xl tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-instrument-serif)" }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[#3a4630]">
                The boring details we obsess over so the yard quietly looks
                better than the others on the block.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-2xl bg-white/70 p-5 ring-1 ring-[#3d5a2a]/15 transition hover:bg-white hover:ring-[#3d5a2a]">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#3d5a2a]/15 text-[#3d5a2a] transition group-hover:rotate-3 group-hover:bg-[#3d5a2a] group-hover:text-[#f6f8ec]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className="text-xl leading-tight tracking-tight"
                        style={{ fontFamily: "var(--font-instrument-serif)" }}
                      >
                        {bullet.title}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-7 text-[#3a4630]">{bullet.body}</p>
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
          <div className="relative overflow-hidden rounded-[32px] bg-[#1c2418] px-7 py-12 text-[#f6f8ec] sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(96deg, rgba(214, 183, 90, 0.08) 0 70px, transparent 70px 140px)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(800px 320px at 90% 10%, rgba(61, 90, 42, 0.7), transparent 55%)",
              }}
            />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6b75a]">
              Service area
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-3xl leading-tight tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              {model.serviceArea.heading}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-7 text-[#f6f8ec]/80 sm:text-lg">
              {model.serviceArea.body}
            </p>
            <div className="relative mt-8 inline-flex items-center gap-3 rounded-full bg-[#f6f8ec]/8 px-4 py-2 text-sm text-[#f6f8ec]/85 ring-1 ring-[#f6f8ec]/12">
              <FontAwesomeIcon icon={faLeaf} className="h-3.5 w-3.5 text-[#d6b75a]" />
              Same-day quote · same crew every visit
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#3d5a2a]">
            Notes from the truck
          </p>
          <h2
            className="mt-3 text-3xl tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-2xl border border-[#3d5a2a]/15 bg-white open:border-[#3d5a2a]/45 open:shadow-[0_18px_36px_rgba(28,36,24,0.06)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base tracking-tight">
                  <span style={{ fontFamily: "var(--font-instrument-serif)", fontSize: "18px" }}>
                    {item.question}
                  </span>
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#3d5a2a]/20 bg-[#f4efe4] text-[#3d5a2a] transition group-open:rotate-45 group-open:bg-[#3d5a2a] group-open:text-[#f6f8ec]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7 text-[#3a4630]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] bg-white p-8 ring-1 ring-[#3d5a2a]/15 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#3d5a2a]">
                Tap, text, or call
              </p>
              <h2
                className="mt-3 text-3xl tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-instrument-serif)" }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#3a4630] sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-[#3d5a2a] px-5 py-4 text-base font-semibold text-[#f6f8ec] transition hover:bg-[#1c2418]"
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
              <p className="flex items-center gap-2 text-sm text-[#3a4630]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#3d5a2a]" />
                Same crew every visit. No rotating subs.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a4630]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#3d5a2a]" />
                Stick-edged drives, blown sidewalks every time.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a4630]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#3d5a2a]" />
                Month-to-month. Cancel anytime, two-week notice.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#3d5a2a]/65 sm:px-8">
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
