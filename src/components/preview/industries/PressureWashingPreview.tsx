import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faDroplet,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { anton, dmSans } from "@/lib/preview/fonts";

export function PressureWashingPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${anton.variable} ${dmSans.variable} relative min-h-screen overflow-hidden bg-[#f7f3ea] pb-32 text-[#0e2329]`}
      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="flex items-center gap-3">
          {model.assets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.assets.logoUrl}
              alt={`${model.business.name} logo`}
              className="h-12 w-12 rounded-xl object-cover ring-1 ring-black/10"
            />
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e7a7d] to-[#0e3438] text-base font-semibold tracking-wider text-[#f7f3ea]">
              <span style={{ fontFamily: "var(--font-anton)" }}>{initials}</span>
              <FontAwesomeIcon
                icon={faDroplet}
                className="absolute -right-1.5 -top-1 h-3.5 w-3.5 text-[#3ec5c8]"
              />
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[20px] uppercase tracking-[0.05em]"
              style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.04em" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#0e2329]/60">
                {model.business.city} pressure washing
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-md bg-[#0e2329] px-4 py-2.5 text-sm font-semibold text-[#f7f3ea] transition hover:bg-[#1e7a7d]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pt-10 sm:px-8 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <Reveal from="up" delay={0}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1e7a7d]">
                {model.hero.eyebrow}
              </p>
            </Reveal>
            <Reveal from="up" delay={120}>
              <h1
                className="mt-5 max-w-[14ch] text-[64px] uppercase leading-[0.88] tracking-[0.005em] sm:text-[96px] md:text-[112px]"
                style={{ fontFamily: "var(--font-anton)" }}
              >
                <span className="block text-[#0e2329]">Make the house</span>
                <span className="block text-[#1e7a7d]">look painted</span>
                <span className="block text-[#0e2329]">again.</span>
              </h1>
            </Reveal>
            <Reveal from="up" delay={260}>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#243a3f] sm:text-lg">
                {model.hero.subheadline}
              </p>
            </Reveal>
            <Reveal from="up" delay={380}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-[#1e7a7d] px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#f7f3ea] shadow-[0_4px_0_#0e3438,0_14px_28px_rgba(30,122,125,0.32)] transition hover:-translate-y-0.5 hover:bg-[#268185] hover:shadow-[0_6px_0_#0e3438,0_20px_36px_rgba(30,122,125,0.42)] active:translate-y-0.5 active:shadow-[0_2px_0_#0e3438,0_6px_14px_rgba(30,122,125,0.32)] sm:text-base"
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  {model.hero.primaryCta.label}
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-md border border-[#0e2329]/15 bg-white px-5 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-[#0e2329] transition hover:-translate-y-0.5 hover:border-[#1e7a7d] hover:text-[#1e7a7d] hover:shadow-[0_8px_24px_rgba(14,35,41,0.10)]"
                  >
                    {model.hero.secondaryCta.label}
                    <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 transition group-hover:translate-x-1" />
                  </a>
                ) : null}
              </div>
            </Reveal>
            <Reveal from="up" delay={500}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#243a3f]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#1e7a7d]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-semibold tabular-nums text-[#0e2329]"
                      style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.02em" }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span>· {model.business.reviewCount} Google reviews</span>
                    ) : null}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#1e7a7d]" />
                  Soft-wash certified
                </span>
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#1e7a7d]" />
                  Fully insured
                </span>
              </div>
            </Reveal>
          </div>

          {/* Before / After splash card — real photo on the "after" half */}
          <Reveal from="right" delay={300}>
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_30px_80px_rgba(14,52,56,0.20)] ring-1 ring-black/10">
                {/* BEFORE half — dirty grey siding texture */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(155deg, #4d433a 0%, #5b5147 35%, #6b5f51 48%, transparent 48%)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 1px, transparent 1px 14px)",
                    clipPath: "polygon(0 0, 60% 0, 32% 100%, 0 100%)",
                    opacity: 0.45,
                  }}
                />
                {/* Algae/mildew speckle on the before */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 18% 30%, rgba(86, 105, 73, 0.5) 0 6%, transparent 8%), radial-gradient(circle at 30% 70%, rgba(70, 86, 60, 0.4) 0 4%, transparent 7%), radial-gradient(circle at 8% 80%, rgba(80, 90, 65, 0.45) 0 5%, transparent 8%)",
                    clipPath: "polygon(0 0, 60% 0, 32% 100%, 0 100%)",
                  }}
                />

                {/* AFTER half — real hero photo, clipped diagonally */}
                {model.assets.heroUrl ? (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: "polygon(60% 0, 100% 0, 100% 100%, 32% 100%)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={model.assets.heroUrl}
                      alt={`${model.business.name} freshly washed home`}
                      className="preview-hero-drift h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(155deg, transparent 48%, #d8efee 48%, #f0f9f8 100%)",
                    }}
                  />
                )}

                {/* Diagonal water spray divider */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(155deg, transparent 47%, rgba(255,255,255,0.95) 48%, rgba(62,197,200,0.85) 48.5%, rgba(255,255,255,0.4) 49%, transparent 50%)",
                  }}
                />
                {/* Spray droplet specks along diagonal */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 38% 22%, rgba(255,255,255,0.8) 0 0.4%, transparent 1%), radial-gradient(circle at 35% 40%, rgba(255,255,255,0.7) 0 0.3%, transparent 1%), radial-gradient(circle at 28% 62%, rgba(255,255,255,0.7) 0 0.4%, transparent 1%)",
                  }}
                />

                {/* Labels */}
                <div className="absolute left-4 top-4 rounded-md bg-[#0e2329]/90 px-3 py-1.5 backdrop-blur">
                  <p
                    className="text-[11px] uppercase tracking-[0.32em] text-white"
                    style={{ fontFamily: "var(--font-anton)" }}
                  >
                    Before
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 rounded-md bg-[#1e7a7d] px-3 py-1.5 shadow-lg">
                  <p
                    className="text-[11px] uppercase tracking-[0.32em] text-white"
                    style={{ fontFamily: "var(--font-anton)" }}
                  >
                    After
                  </p>
                </div>
              </div>
              {/* Stat sticker */}
              <div className="absolute -left-3 bottom-12 hidden rotate-[-6deg] rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/5 sm:block">
                <p
                  className="text-3xl tabular-nums leading-none text-[#1e7a7d]"
                  style={{ fontFamily: "var(--font-anton)" }}
                >
                  3 hrs
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0e2329]/60">
                  avg full-house wash
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
            <figure className="relative overflow-hidden rounded-[28px] bg-[#0e2329] px-7 py-10 text-[#f7f3ea] sm:px-12 sm:py-14">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-28 w-28 text-[#3ec5c8]/15"
              />
              <span className="text-[#3ec5c8]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote className="relative mt-5 max-w-3xl text-2xl leading-[1.4] sm:text-[28px]">
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-xs uppercase tracking-[0.32em] text-[#f7f3ea]/55">
                — {model.topReview.authorFirstName} · Google review
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1e7a7d]">
            What we wash
          </p>
          <h2
            className="mt-3 text-4xl uppercase leading-[0.94] sm:text-6xl"
            style={{ fontFamily: "var(--font-anton)" }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="group relative h-full overflow-hidden rounded-[24px] bg-white p-7 ring-1 ring-[#0e2329]/8 transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(14,52,56,0.12)]">
                  {/* hover splash wash */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#1e7a7d]/8 transition-all duration-500 group-hover:h-72 group-hover:w-72 group-hover:bg-[#1e7a7d]/20"
                  />
                  <div className="relative flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e7a7d] text-[#f7f3ea]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <span
                      className="text-2xl tabular-nums text-[#0e2329]/35"
                      style={{ fontFamily: "var(--font-anton)" }}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                  <h3
                    className="relative mt-6 text-2xl uppercase leading-tight"
                    style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.005em" }}
                  >
                    {service.title}
                  </h3>
                  <p className="relative mt-3 text-[15px] leading-7 text-[#243a3f]">{service.body}</p>
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1e7a7d]">
              Field gallery
            </p>
            <h2
              className="mt-3 text-4xl uppercase leading-[0.94] sm:text-5xl"
              style={{ fontFamily: "var(--font-anton)" }}
            >
              Recent transformations
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-[24px] bg-white ring-1 ring-[#0e2329]/10">
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

      {/* ── Why us — process steps ───────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr,1.15fr]">
          <Reveal from="left">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1e7a7d]">
                Why we&rsquo;re different
              </p>
              <h2
                className="mt-3 text-4xl uppercase leading-[0.94] sm:text-5xl"
                style={{ fontFamily: "var(--font-anton)" }}
              >
                {model.whyUs.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#243a3f]">
                Same crew on every house. Same kit on every visit. The kind of consistency that earns the next driveway on your street.
              </p>
            </div>
          </Reveal>
          <div className="relative space-y-6 pl-8">
            {/* timeline line */}
            <div
              aria-hidden
              className="absolute left-3 top-2 h-[calc(100%-1rem)] w-px"
              style={{
                background:
                  "linear-gradient(to bottom, #1e7a7d, #1e7a7d 50%, transparent 50%, transparent 60%, #1e7a7d 60%, #1e7a7d)",
                backgroundSize: "1px 12px",
              }}
            />
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="relative">
                    <span className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#1e7a7d] text-[10px] text-white ring-4 ring-[#f7f3ea]">
                      {idx + 1}
                    </span>
                    <div className="rounded-2xl border border-[#0e2329]/8 bg-white p-6">
                      <div className="flex items-center gap-3 text-[#1e7a7d]">
                        <FontAwesomeIcon icon={Ico} className="h-4 w-4" />
                        <p
                          className="text-xl uppercase leading-tight"
                          style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.005em" }}
                        >
                          {bullet.title}
                        </p>
                      </div>
                      <p className="mt-2 text-[15px] leading-7 text-[#243a3f]">{bullet.body}</p>
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
            className="relative overflow-hidden rounded-[32px] px-7 py-12 sm:px-12 sm:py-16"
            style={{
              background:
                "linear-gradient(135deg, #0e2329 0%, #14383d 60%, #1e7a7d 100%)",
            }}
          >
            {/* water dots */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.06) 0 8px, transparent 8px), radial-gradient(circle at 78% 70%, rgba(255,255,255,0.06) 0 12px, transparent 12px), radial-gradient(circle at 60% 30%, rgba(62,197,200,0.18) 0 28px, transparent 28px)",
              }}
            />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.32em] text-[#3ec5c8]">
              Service area
            </p>
            <h2
              className="relative mt-3 max-w-3xl text-4xl uppercase leading-[0.94] text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-anton)" }}
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1e7a7d]">
            FAQ
          </p>
          <h2
            className="mt-3 text-4xl uppercase leading-[0.94] sm:text-5xl"
            style={{ fontFamily: "var(--font-anton)" }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 divide-y divide-[#0e2329]/12 border-y border-[#0e2329]/12">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold tracking-tight">
                  <span
                    className="text-lg uppercase tracking-[0.005em]"
                    style={{ fontFamily: "var(--font-anton)" }}
                  >
                    {item.question}
                  </span>
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#0e2329]/15 text-[#1e7a7d] transition group-open:rotate-45 group-open:border-[#1e7a7d] group-open:bg-[#1e7a7d] group-open:text-white">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-prose text-[15px] leading-7 text-[#243a3f]">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[32px] bg-[#1e7a7d] p-8 text-[#f7f3ea] sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#3ec5c8]">
                Book the wash
              </p>
              <h2
                className="mt-3 text-4xl uppercase leading-[0.92] sm:text-5xl"
                style={{ fontFamily: "var(--font-anton)" }}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#f7f3ea]/85 sm:text-base">
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-md bg-[#0e2329] px-5 py-4 text-base font-semibold text-[#f7f3ea] transition hover:bg-[#0a1a1f]"
                >
                  <span className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-[#f7f3ea]/85">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#3ec5c8]" />
                Free quote with photos texted back same day.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#f7f3ea]/85">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#3ec5c8]" />
                Soft-wash safe for paint, plants, and pets.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#0e2329]/55 sm:px-8">
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
