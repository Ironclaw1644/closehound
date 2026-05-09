import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faClock,
  faQuoteLeft,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { newsreader, outfit } from "@/lib/preview/fonts";

export function PlumbingPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${newsreader.variable} ${outfit.variable} relative min-h-screen overflow-hidden bg-[#f7f1e6] pb-32 text-[#0e1d2c]`}
      style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
    >
      {/* Subtle paper texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(14,29,44,0.04) 0%, transparent 60%), repeating-linear-gradient(0deg, transparent 0 3px, rgba(14,29,44,0.012) 3px 4px)",
        }}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between border-b border-[#0e1d2c]/15 px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-3">
          {model.assets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.assets.logoUrl}
              alt={`${model.business.name} logo`}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-base font-medium text-[#fff5e6]"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #d29063 0%, #c97645 35%, #8b4d2c 100%)",
                boxShadow:
                  "inset 0 -2px 4px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.18)",
              }}
            >
              <span style={{ fontFamily: "var(--font-newsreader)", fontWeight: 600 }}>
                {initials}
              </span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[20px] font-medium tracking-tight"
              style={{ fontFamily: "var(--font-newsreader)" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#0e1d2c]/55">
                {model.business.city} · Master plumbers
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full bg-[#0e1d2c] px-4 py-2.5 text-sm font-semibold text-[#f7f1e6] transition hover:bg-[#c97645]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-14 sm:px-8 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div>
            <Reveal from="up" delay={0}>
              <p
                className="text-[11px] tracking-[0.36em] text-[#c97645]"
                style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
              >
                EST. {2026 - (model.business.yearsInBusiness ?? 18)} · {model.hero.eyebrow.toUpperCase()}
              </p>
            </Reveal>
            <Reveal from="up" delay={120}>
              <h1
                className="mt-7 tracking-tight"
                style={{
                  fontFamily: "var(--font-newsreader)",
                  fontWeight: 500,
                  fontSize: "clamp(2.8rem, 7vw, 6rem)",
                  lineHeight: "0.98",
                  letterSpacing: "-0.012em",
                }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>
            <Reveal from="up" delay={260}>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#324a5e] sm:text-lg sm:leading-8">
                {model.hero.subheadline}
              </p>
            </Reveal>
            <Reveal from="up" delay={380}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#c97645] px-6 py-3.5 text-sm font-semibold text-[#1a0f06] shadow-[0_3px_0_rgba(0,0,0,0.22),0_18px_40px_rgba(201,118,69,0.42)] transition hover:-translate-y-0.5 hover:bg-[#d4855a] hover:shadow-[0_5px_0_rgba(0,0,0,0.22),0_24px_48px_rgba(201,118,69,0.55)] active:translate-y-0.5 sm:text-base"
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  {model.hero.primaryCta.label}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#0e1d2c]/20 bg-white/60 px-5 py-3 text-sm font-semibold text-[#0e1d2c] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#c97645] hover:bg-white hover:text-[#c97645] hover:shadow-[0_8px_24px_rgba(14,29,44,0.10)] sm:text-base"
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
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#324a5e]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#c97645]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-medium tabular-nums text-[#0e1d2c]"
                      style={{ fontFamily: "var(--font-newsreader)" }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span>· {model.business.reviewCount} Google reviews</span>
                    ) : null}
                  </span>
                ) : null}
                {model.business.yearsInBusiness ? (
                  <span className="inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 text-[#c97645]" />
                    {model.business.yearsInBusiness}+ yrs in the trade
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#c97645]" />
                  Licensed · bonded · insured
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: hero photo with master plumber medallion overlay */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[28px] ring-1 ring-[#0e1d2c]/15 shadow-[0_30px_80px_rgba(14,29,44,0.22)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} master plumber on the job`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="aspect-[4/5] rounded-[28px] ring-1 ring-[#0e1d2c]/15"
                  style={{
                    background:
                      "linear-gradient(135deg, #0e1d2c 0%, #112638 55%, #1a3245 100%)",
                  }}
                />
              )}

              {/* "Now answering" pulse badge — top-right */}
              <div className="absolute -right-3 -top-3 inline-flex items-center gap-2 rounded-full bg-[#0e1d2c] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f7f1e6] shadow-[0_8px_24px_rgba(14,29,44,0.32)] sm:-right-6 sm:-top-6">
                <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#c97645]" />
                Now answering · 9:42pm
              </div>

              {/* Master plumber wax-seal medallion — bottom-left overlay */}
              <div
                className="absolute -bottom-6 -left-6 aspect-square w-44 rotate-[-6deg] rounded-full border-[3px] border-[#c97645] shadow-[0_18px_44px_rgba(14,29,44,0.32)] sm:w-52"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, #fff7ea 0%, #f3e2c8 60%, #e7c895 100%)",
                }}
              >
                <div className="absolute inset-2 rounded-full border border-[#c97645]/55" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                  <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5 text-[#0e1d2c]" />
                  <p
                    className="mt-1.5 text-[8px] leading-tight tracking-[0.32em] text-[#0e1d2c]/65"
                    style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
                  >
                    LICENSED · BONDED · INSURED
                  </p>
                  <p
                    className="mt-1 text-lg leading-none tracking-tight text-[#0e1d2c] sm:text-xl"
                    style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic" }}
                  >
                    Master Plumber
                  </p>
                  <p
                    className="mt-1 text-[8px] tracking-[0.28em] text-[#0e1d2c]/55"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    NO. {String(43000 + Math.floor((model.business.yearsInBusiness ?? 18) * 137)).padStart(5, "0")}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-5xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative overflow-hidden rounded-[28px] bg-[#0e1d2c] px-7 py-12 text-[#f7f1e6] sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#c97645]/22"
              />
              <span className="text-[#c97645]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl text-2xl leading-[1.42] sm:text-[30px] sm:leading-[1.36]"
                style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400 }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption
                className="mt-6 text-xs tracking-[0.32em] text-[#f7f1e6]/65"
                style={{ fontFamily: "var(--font-outfit)" }}
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
            className="text-[11px] tracking-[0.36em] text-[#c97645]"
            style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
          >
            THE TRADE
          </p>
          <h2
            className="mt-3 max-w-3xl tracking-tight"
            style={{
              fontFamily: "var(--font-newsreader)",
              fontWeight: 500,
              fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
              lineHeight: "1.04",
              letterSpacing: "-0.012em",
            }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative">
                  <div className="flex items-baseline gap-4">
                    <span
                      className="text-7xl leading-none text-[#c97645]/85 sm:text-8xl"
                      style={{ fontFamily: "var(--font-newsreader)", fontWeight: 500 }}
                    >
                      {service.title.charAt(0)}
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0e1d2c]/8 text-[#0e1d2c] transition group-hover:bg-[#c97645] group-hover:text-white">
                      <FontAwesomeIcon icon={Ico} className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3
                    className="mt-3 text-2xl leading-snug tracking-tight"
                    style={{ fontFamily: "var(--font-newsreader)", fontWeight: 600 }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mt-3 max-w-md text-[15px] leading-7 text-[#324a5e]"
                    style={{ fontFamily: "var(--font-outfit)" }}
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
            <p
              className="text-[11px] tracking-[0.36em] text-[#c97645]"
              style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
            >
              FROM THE TRUCK
            </p>
            <h2
              className="mt-3 max-w-3xl tracking-tight"
              style={{
                fontFamily: "var(--font-newsreader)",
                fontWeight: 500,
                fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
                lineHeight: "1.04",
                letterSpacing: "-0.012em",
              }}
            >
              Recent jobs, photographed.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-[20px] border border-[#0e1d2c]/10 bg-white">
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
        <Reveal from="scale">
          <div
            className="relative overflow-hidden rounded-[32px] bg-[#0e1d2c] px-7 py-14 text-[#f7f1e6] sm:px-12 sm:py-20"
            style={{
              backgroundImage:
                "radial-gradient(900px 320px at 18% 0%, rgba(201,118,69,0.30), transparent 55%), linear-gradient(135deg, #0e1d2c 0%, #112638 60%, #1a3245 100%)",
            }}
          >
            <p
              className="text-[11px] tracking-[0.36em] text-[#e0a981]"
              style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
            >
              WHY HOMEOWNERS PUT US IN THEIR PHONE
            </p>
            <h2
              className="mt-3 max-w-3xl tracking-tight"
              style={{
                fontFamily: "var(--font-newsreader)",
                fontWeight: 500,
                fontSize: "clamp(2rem, 4.4vw, 3.4rem)",
                lineHeight: "1.04",
                letterSpacing: "-0.012em",
              }}
            >
              {model.whyUs.heading}
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {model.whyUs.bullets.map((bullet, idx) => {
                const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
                return (
                  <Reveal key={bullet.title} from="up" delay={idx * 100}>
                    <div className="border-t border-[#e0a981]/30 pt-5">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5 text-[#e0a981]" />
                      <p
                        className="mt-3 text-xl leading-snug"
                        style={{ fontFamily: "var(--font-newsreader)", fontWeight: 600 }}
                      >
                        {bullet.title}
                      </p>
                      <p
                        className="mt-2 text-[15px] leading-7 text-[#f7f1e6]/75"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        {bullet.body}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Service area ───────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] border border-[#0e1d2c]/12 bg-white p-8 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p
                className="text-[11px] tracking-[0.36em] text-[#c97645]"
                style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
              >
                ON THE TRUCK
              </p>
              <h2
                className="mt-3 tracking-tight"
                style={{
                  fontFamily: "var(--font-newsreader)",
                  fontWeight: 500,
                  fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
                  lineHeight: "1.06",
                }}
              >
                {model.serviceArea.heading}
              </h2>
              <p
                className="mt-5 text-base leading-7 text-[#324a5e]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {model.serviceArea.body}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 self-end">
              {[
                { label: "Tank water heaters", count: "12+" },
                { label: "Tankless brands", count: "5" },
                { label: "Common cartridges", count: "30+" },
                { label: "Specialty fittings", count: "100+" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#0e1d2c]/10 bg-[#f7f1e6] px-4 py-4"
                >
                  <p
                    className="text-3xl tabular-nums text-[#c97645]"
                    style={{ fontFamily: "var(--font-newsreader)", fontWeight: 600 }}
                  >
                    {item.count}
                  </p>
                  <p
                    className="mt-1 text-[10px] tracking-[0.22em] text-[#0e1d2c]/60"
                    style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
                  >
                    {item.label.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[11px] tracking-[0.36em] text-[#c97645]"
            style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
          >
            COMMON QUESTIONS
          </p>
          <h2
            className="mt-3 tracking-tight"
            style={{
              fontFamily: "var(--font-newsreader)",
              fontWeight: 500,
              fontSize: "clamp(2.2rem, 4.4vw, 3.4rem)",
              lineHeight: "1.04",
            }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 divide-y divide-[#0e1d2c]/12 border-y border-[#0e1d2c]/12">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span
                    className="text-xl tracking-tight"
                    style={{ fontFamily: "var(--font-newsreader)", fontWeight: 500 }}
                  >
                    {item.question}
                  </span>
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#0e1d2c]/20 text-[#c97645] transition group-open:rotate-45 group-open:border-[#c97645] group-open:bg-[#c97645] group-open:text-white">
                    +
                  </span>
                </summary>
                <p
                  className="mt-4 max-w-prose text-[15px] leading-7 text-[#324a5e]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] bg-[#c97645]/12 p-8 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p
                className="text-[11px] tracking-[0.36em] text-[#c97645]"
                style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
              >
                AVAILABLE 24/7
              </p>
              <h2
                className="mt-3 tracking-tight"
                style={{
                  fontFamily: "var(--font-newsreader)",
                  fontWeight: 500,
                  fontSize: "clamp(2.4rem, 4.8vw, 3.8rem)",
                  lineHeight: "1.04",
                }}
              >
                {model.contact.heading}
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-7 text-[#324a5e]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-full bg-[#0e1d2c] px-5 py-4 text-base font-semibold text-[#f7f1e6] transition hover:bg-[#c97645]"
                >
                  <span className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-[#324a5e]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#c97645]" />
                After-hours rates quoted before dispatch.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#324a5e]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#c97645]" />
                One-year labor warranty on most repairs.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#0e1d2c]/55 sm:px-8">
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
