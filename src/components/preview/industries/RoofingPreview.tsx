import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faHouseChimney,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { fraunces, interTight } from "@/lib/preview/fonts";

export function RoofingPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${fraunces.variable} ${interTight.variable} relative min-h-screen overflow-hidden bg-[#f4ede0] pb-32 text-[#1a1612]`}
      style={{ fontFamily: "var(--font-inter-tight), system-ui, sans-serif" }}
    >
      {/* Top dark band — slate roof tone, sized for split-grid hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
        style={{
          background:
            "linear-gradient(180deg, #1f1a14 0%, #1f1a14 55%, #2a221b 80%, transparent 100%)",
        }}
      />
      {/* Shingle pattern bottom band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[760px] h-12 opacity-90"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 16px, rgba(26,22,18,0.06) 16px 17px), repeating-linear-gradient(45deg, transparent 0 16px, rgba(26,22,18,0.06) 16px 17px)",
        }}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 pt-7 sm:px-8 sm:pt-9">
        <div className="flex items-center gap-3 text-[#f4ede0]">
          {model.assets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.assets.logoUrl}
              alt={`${model.business.name} logo`}
              className="h-12 w-12 rounded-md object-cover ring-1 ring-white/15"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/15 bg-[#b6432a] text-base font-semibold text-[#f4ede0]">
              <span style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 144, 'wght' 700, 'SOFT' 30" }}>
                {initials}
              </span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[20px] tracking-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: "'opsz' 144, 'wght' 600, 'SOFT' 50",
              }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#f4ede0]/65">
                {model.business.city} · Established roofers
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full bg-[#b6432a] px-4 py-2.5 text-sm font-semibold text-[#fff8ee] transition hover:bg-[#9a3823]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div>
            <Reveal from="up" delay={0}>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.32em] text-[#f4ede0] backdrop-blur">
                <FontAwesomeIcon icon={faHouseChimney} className="h-3 w-3 text-[#e1a572]" />
                {model.hero.eyebrow}
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-7 text-[#f4ede0]"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontVariationSettings: "'opsz' 144, 'wght' 540, 'SOFT' 30",
                  fontSize: "clamp(3rem, 7.4vw, 6.4rem)",
                  lineHeight: "0.96",
                  letterSpacing: "-0.012em",
                }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={260}>
              <p
                className="mt-7 max-w-xl text-base leading-7 text-[#e2d6bd] sm:text-lg sm:leading-8"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={380}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#b6432a] px-6 py-3.5 text-sm font-semibold text-[#fff8ee] shadow-[0_3px_0_rgba(0,0,0,0.32),0_18px_40px_rgba(182,67,42,0.42)] transition hover:-translate-y-0.5 hover:bg-[#c54d33] hover:shadow-[0_5px_0_rgba(0,0,0,0.32),0_24px_48px_rgba(182,67,42,0.55)] active:translate-y-0.5 sm:text-base"
                >
                  {model.hero.primaryCta.label}
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-[#f4ede0] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 sm:text-base"
                  >
                    <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5 transition group-hover:rotate-[-12deg]" />
                    {model.hero.secondaryCta.label}
                  </a>
                ) : null}
              </div>
            </Reveal>

            <Reveal from="up" delay={500}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#e2d6bd]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#e1a572]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-medium tabular-nums text-[#f4ede0]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
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
                    <FontAwesomeIcon icon={faHouseChimney} className="h-3.5 w-3.5 text-[#e1a572]" />
                    {model.business.yearsInBusiness}+ yrs roofing
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#e1a572]" />
                  GAF Master Elite
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: hero photo with "in progress" job card overlay */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[28px] ring-1 ring-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} crew at work`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[28px] bg-gradient-to-br from-[#16110b] via-[#2a1a10] to-[#3a2a1a] ring-1 ring-white/10" />
              )}

              {/* Job-card overlay — bottom-left */}
              <div className="absolute -left-3 bottom-6 max-w-[78%] rounded-2xl bg-[#1a1612]/95 p-4 ring-1 ring-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur sm:-left-6 sm:bottom-10 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#e1a572]" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e1a572]">
                    In progress · today
                  </p>
                </div>
                <p
                  className="mt-2 text-lg leading-snug text-[#f4ede0] sm:text-xl"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontVariationSettings: "'opsz' 144, 'wght' 600, 'SOFT' 70",
                  }}
                >
                  Tear-off · deck inspection · ice &amp; water shield.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f4ede0]/80">
                  <div className="rounded-md bg-white/5 px-2 py-1.5">
                    <span className="text-[#e1a572]">Shingle ·</span> GAF HDZ
                  </div>
                  <div className="rounded-md bg-white/5 px-2 py-1.5">
                    <span className="text-[#e1a572]">ETA ·</span> 4pm tmrw
                  </div>
                </div>
              </div>

              {/* Warranty badge — top-right */}
              <div className="absolute -right-3 -top-3 rotate-[6deg] rounded-2xl bg-[#b6432a] px-4 py-3 text-[#fff8ee] shadow-[0_12px_28px_rgba(182,67,42,0.55)] sm:-right-6 sm:-top-6">
                <p
                  className="text-[26px] leading-none tabular-nums"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontVariationSettings: "'opsz' 144, 'wght' 700, 'SOFT' 30",
                  }}
                >
                  5yr
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#fff8ee]/85">
                  labor warranty
                </p>
              </div>
            </div>
          </Reveal>
        </div>

      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-5xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-[28px] bg-[#fff8ee] px-7 py-12 sm:px-12 sm:py-16">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-4 -top-6 h-32 w-32 text-[#b6432a]/12"
              />
              <span className="text-[#b6432a]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl text-2xl leading-[1.42] text-[#1a1612] sm:text-[30px] sm:leading-[1.32]"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontVariationSettings: "'opsz' 144, 'wght' 460, 'SOFT' 60",
                }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 text-xs uppercase tracking-[0.34em] text-[#1a1612]/55">
                — {model.topReview.authorFirstName} · Verified Google review
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-[auto,1fr] sm:items-end">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b6432a]">
              The work
            </p>
          </Reveal>
          <Reveal>
            <h2
              className="text-4xl leading-[0.96] tracking-tight sm:text-5xl"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: "'opsz' 144, 'wght' 540, 'SOFT' 50",
              }}
            >
              {model.services.heading}
            </h2>
          </Reveal>
        </div>
        <div className="mt-10 grid gap-px bg-[#1a1612]/12 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative h-full bg-[#f4ede0] p-8 transition hover:bg-white">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1612] text-[#f4ede0] transition group-hover:bg-[#b6432a]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <span
                      className="text-3xl tabular-nums text-[#1a1612]/30 sm:text-4xl"
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontVariationSettings: "'opsz' 144, 'wght' 320, 'SOFT' 40",
                      }}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                  <h3
                    className="mt-6 text-2xl leading-snug"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontVariationSettings: "'opsz' 144, 'wght' 580, 'SOFT' 60",
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mt-3 text-[15px] leading-7 text-[#3a342a]"
                    style={{ fontFamily: "var(--font-inter-tight)" }}
                  >
                    {service.body}
                  </p>
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b6432a]">
              From recent jobs
            </p>
            <h2
              className="mt-3 text-4xl leading-[0.96] tracking-tight sm:text-5xl"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: "'opsz' 144, 'wght' 540, 'SOFT' 50",
              }}
            >
              The work, on the roof.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-px bg-[#1a1612]/12 lg:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative h-full overflow-hidden bg-[#f4ede0]">
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
        <div className="grid gap-12 lg:grid-cols-[0.85fr,1.15fr]">
          <Reveal from="left">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b6432a]">
                Why homeowners choose us
              </p>
              <h2
                className="mt-3 text-4xl leading-[0.94] tracking-tight sm:text-5xl"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontVariationSettings: "'opsz' 144, 'wght' 540, 'SOFT' 50",
                }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#3a342a]">
                Same family-run shop, same crews on every job. The roof you see today is one we&rsquo;ll still stand behind in five years.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 border-b border-[#1a1612]/12 pb-5 last:border-b-0 last:pb-0">
                    <span
                      className="flex-none text-5xl tabular-nums leading-none text-[#1a1612]/25 sm:text-6xl"
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontVariationSettings: "'opsz' 144, 'wght' 320, 'SOFT' 30",
                      }}
                    >
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-3 text-[#b6432a]">
                        <FontAwesomeIcon icon={Ico} className="h-4 w-4" />
                        <p
                          className="text-2xl leading-tight text-[#1a1612]"
                          style={{
                            fontFamily: "var(--font-fraunces)",
                            fontVariationSettings: "'opsz' 144, 'wght' 580, 'SOFT' 60",
                          }}
                        >
                          {bullet.title}
                        </p>
                      </div>
                      <p className="mt-2 text-[15px] leading-7 text-[#3a342a]">{bullet.body}</p>
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
          <div
            className="relative overflow-hidden rounded-[32px] px-7 py-12 text-[#f4ede0] sm:px-12 sm:py-16"
            style={{
              background:
                "linear-gradient(135deg, #1a1612 0%, #2a1a10 60%, #b6432a 100%)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, transparent 0 16px, rgba(244,237,224,0.04) 16px 17px), repeating-linear-gradient(45deg, transparent 0 16px, rgba(244,237,224,0.04) 16px 17px)",
              }}
            />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.32em] text-[#e1a572]">
              Service area
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-4xl leading-[0.95] tracking-tight sm:text-5xl"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: "'opsz' 144, 'wght' 560, 'SOFT' 40",
              }}
            >
              {model.serviceArea.heading}
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-7 text-[#f4ede0]/80 sm:text-lg">
              {model.serviceArea.body}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b6432a]">
            Asked & answered
          </p>
          <h2
            className="mt-3 text-4xl leading-[0.94] tracking-tight sm:text-5xl"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: "'opsz' 144, 'wght' 540, 'SOFT' 50",
            }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 divide-y divide-[#1a1612]/12 border-y border-[#1a1612]/12">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span
                    className="text-xl tracking-tight text-[#1a1612]"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontVariationSettings: "'opsz' 144, 'wght' 540, 'SOFT' 50",
                    }}
                  >
                    {item.question}
                  </span>
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#1a1612]/20 text-[#b6432a] transition group-open:rotate-45 group-open:border-[#b6432a] group-open:bg-[#b6432a] group-open:text-white">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-prose text-[15px] leading-7 text-[#3a342a]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] bg-[#fff8ee] p-8 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b6432a]">
                Get on the calendar
              </p>
              <h2
                className="mt-3 text-4xl leading-[0.94] tracking-tight sm:text-5xl"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontVariationSettings: "'opsz' 144, 'wght' 540, 'SOFT' 50",
                }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#3a342a] sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-full bg-[#b6432a] px-5 py-4 text-base font-semibold text-[#fff8ee] transition hover:bg-[#9a3823]"
                >
                  <span className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-[#3a342a]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#b6432a]" />
                Free inspections, written photo report sent same day.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#3a342a]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#b6432a]" />
                We meet your insurance adjuster on the roof.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#1a1612]/55 sm:px-8">
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
