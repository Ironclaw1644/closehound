import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faTruckRampBox,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { archivoBlack, plusJakartaSans } from "@/lib/preview/fonts";

export function JunkRemovalPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${archivoBlack.variable} ${plusJakartaSans.variable} relative min-h-screen overflow-hidden bg-[#fff8d6] pb-32 text-[#0a0a0a]`}
      style={{ fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif" }}
    >
      {/* yellow grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10,10,10,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
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
              className="h-12 w-12 rounded-md object-cover ring-2 ring-[#0a0a0a]"
            />
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center rounded-md bg-[#0a0a0a] text-base text-[#fcd935] ring-2 ring-[#0a0a0a] shadow-[3px_3px_0_#0a0a0a]">
              <span style={{ fontFamily: "var(--font-archivo-black)" }}>{initials}</span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[20px] uppercase tracking-tight"
              style={{ fontFamily: "var(--font-archivo-black)", letterSpacing: "-0.01em" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p
                className="text-[10px] uppercase tracking-[0.32em] text-[#0a0a0a]/70"
                style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 700 }}
              >
                {model.business.city} · WE HAUL ANYTHING
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-md bg-[#0a0a0a] px-4 py-2.5 text-sm font-bold text-[#fcd935] ring-2 ring-[#0a0a0a] shadow-[3px_3px_0_#0a0a0a] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0a0a0a]"
            style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">CALL</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero: poster style ─────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <Reveal from="up" delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-3.5 py-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#fcd935] animate-pulse" />
                <p
                  className="text-[10px] uppercase tracking-[0.36em] text-[#fcd935]"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                >
                  {model.hero.eyebrow}
                </p>
              </div>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-6 max-w-[18ch] uppercase leading-[0.9] tracking-tight"
                style={{
                  fontFamily: "var(--font-archivo-black)",
                  fontSize: "clamp(2.8rem, 6.4vw, 5.6rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {model.hero.headline.split(":").map((part, idx) => (
                  <span key={idx} className="block text-[#0a0a0a]">
                    {idx === 0 ? (
                      <span className="bg-[#fcd935] px-2 py-0.5">{part.trim()}</span>
                    ) : (
                      part.trim()
                    )}
                  </span>
                ))}
              </h1>
            </Reveal>

            <Reveal from="up" delay={260}>
              <p
                className="mt-7 max-w-xl text-base leading-7 text-[#1a1a1a] sm:text-lg sm:leading-8"
                style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 500 }}
              >
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={380}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-[#fcd935] px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#0a0a0a] shadow-[0_4px_0_#0a0a0a,0_14px_28px_rgba(252,217,53,0.32)] transition hover:-translate-y-0.5 hover:bg-[#fde466] hover:shadow-[0_6px_0_#0a0a0a,0_20px_36px_rgba(252,217,53,0.55)] active:translate-y-0.5 sm:text-base"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="h-4 w-4 transition group-hover:rotate-[-12deg]"
                  />
                  {model.hero.primaryCta.label}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-md border-2 border-[#0a0a0a] bg-transparent px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.12em] text-[#0a0a0a] shadow-[0_2px_0_#0a0a0a] transition hover:-translate-y-0.5 hover:bg-[#0a0a0a] hover:text-[#fcd935] hover:shadow-[0_6px_0_#0a0a0a] active:translate-y-0.5 sm:text-base"
                    style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
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
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#1a1a1a]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#0a0a0a]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base font-extrabold tabular-nums"
                      style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span>· {model.business.reviewCount} Google reviews</span>
                    ) : null}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.12em]">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
                  Donation-first when possible
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: hero photo with truck-status overlay + price sticker */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[20px] ring-2 ring-[#0a0a0a] shadow-[8px_8px_0_#fcd935]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} crew at work`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[20px] bg-[#fcd935] ring-2 ring-[#0a0a0a] shadow-[8px_8px_0_#fcd935]" />
              )}

              {/* Truck-status overlay card — bottom-left */}
              <div className="absolute -bottom-4 -left-4 w-[78%] max-w-[300px] rounded-[16px] bg-[#0a0a0a] p-4 ring-2 ring-[#0a0a0a] shadow-[5px_5px_0_#fcd935] sm:-bottom-5 sm:-left-6 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="text-[11px] uppercase tracking-[0.22em] text-[#fcd935] tabular-nums"
                    style={{ fontFamily: "var(--font-archivo-black)" }}
                  >
                    TRUCK 02
                  </p>
                  <p
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-[#fcd935]"
                    style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                  >
                    <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#fcd935]" />
                    ON SITE
                  </p>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                    <div
                      className="h-full rounded-full bg-[#fcd935]"
                      style={{ width: "80%" }}
                    />
                  </div>
                  <p
                    className="mt-2.5 text-[10px] uppercase tracking-[0.24em] text-[#fcd935]/85"
                    style={{ fontFamily: "var(--font-archivo-black)" }}
                  >
                    GARAGE CLEANOUT · 80%
                  </p>
                </div>
              </div>

              {/* Price sticker — top-right */}
              <div className="absolute -right-3 -top-3 rotate-[4deg] rounded-md bg-[#fcd935] px-4 py-3 text-center text-[#0a0a0a] ring-2 ring-[#0a0a0a] shadow-[3px_3px_0_#0a0a0a] sm:-right-5 sm:-top-5 sm:px-5 sm:py-3.5">
                <p
                  className="text-[26px] leading-none tabular-nums sm:text-[28px]"
                  style={{ fontFamily: "var(--font-archivo-black)", letterSpacing: "-0.01em" }}
                >
                  $269
                </p>
                <p
                  className="mt-1.5 text-[9px] uppercase tracking-[0.24em] text-[#0a0a0a]/75"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                >
                  PRICE / TRUCK
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Big stats banner */}
        <Reveal from="scale" delay={620}>
          <div
            className="relative mt-14 grid gap-px overflow-hidden rounded-[24px] bg-[#0a0a0a] sm:grid-cols-4"
            style={{ boxShadow: "8px 8px 0 #fcd935" }}
          >
            {[
              { num: "1 hr", label: "Avg. quote turnaround" },
              { num: "2-hr", label: "Arrival window" },
              { num: "100%", label: "Flat-rate, all-in pricing" },
              { num: "Daily", label: "Routes through your zip" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`bg-[#fcd935] p-6 text-[#0a0a0a] sm:p-7 ${idx === 1 ? "sm:bg-white" : idx === 2 ? "sm:bg-[#0a0a0a] sm:text-[#fcd935]" : "sm:bg-[#fcd935]"}`}
              >
                <p
                  className="text-3xl uppercase leading-none tracking-tight sm:text-4xl"
                  style={{ fontFamily: "var(--font-archivo-black)" }}
                >
                  {stat.num}
                </p>
                <p
                  className="mt-3 text-[10px] uppercase tracking-[0.32em] opacity-80"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 700 }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal from="up">
            <figure
              className="relative overflow-hidden rounded-[32px] bg-[#0a0a0a] px-7 py-12 text-[#fff8d6] ring-2 ring-[#0a0a0a] sm:px-12 sm:py-14"
              style={{ boxShadow: "8px 8px 0 #fcd935" }}
            >
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-32 w-32 text-[#fcd935]/22"
              />
              <span className="text-[#fcd935]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-5 max-w-3xl uppercase tracking-tight"
                style={{
                  fontFamily: "var(--font-archivo-black)",
                  fontSize: "clamp(1.5rem, 3.4vw, 2.4rem)",
                  lineHeight: "1.18",
                  letterSpacing: "-0.005em",
                }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption
                className="mt-6 text-xs uppercase tracking-[0.36em] text-[#fcd935]"
                style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 700 }}
              >
                — {model.topReview.authorFirstName} · GOOGLE REVIEW
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[10px] uppercase tracking-[0.36em] text-[#0a0a0a]/65"
            style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
          >
            WE HAUL ANYTHING
          </p>
          <h2
            className="mt-3 uppercase tracking-tight"
            style={{
              fontFamily: "var(--font-archivo-black)",
              fontSize: "clamp(2.4rem, 5.6vw, 4.4rem)",
              lineHeight: "0.94",
              letterSpacing: "-0.018em",
            }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["truck-ramp-box"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article
                  className={`group relative h-full rounded-[24px] p-7 ring-2 ring-[#0a0a0a] transition hover:-translate-y-1 hover:translate-x-0.5 ${
                    idx === 1 ? "bg-[#0a0a0a] text-[#fcd935]" : "bg-white text-[#0a0a0a]"
                  }`}
                  style={{
                    boxShadow: idx === 1 ? "6px 6px 0 #fcd935" : "6px 6px 0 #0a0a0a",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-md ring-2 ring-[#0a0a0a] ${
                        idx === 1 ? "bg-[#fcd935] text-[#0a0a0a]" : "bg-[#fcd935] text-[#0a0a0a]"
                      }`}
                    >
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <span
                      className="text-3xl uppercase tabular-nums leading-none"
                      style={{ fontFamily: "var(--font-archivo-black)" }}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                  <h3
                    className="mt-6 text-2xl uppercase leading-tight"
                    style={{
                      fontFamily: "var(--font-archivo-black)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mt-3 text-[15px] leading-7 opacity-85"
                    style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 500 }}
                  >
                    {service.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Recent hauls ───────────────────────────────────── */}
      {model.assets.galleryUrls.length > 0 ? (
        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p
              className="text-[10px] uppercase tracking-[0.36em] text-[#0a0a0a]/65"
              style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
            >
              RECENT HAULS
            </p>
            <h2
              className="mt-3 uppercase tracking-tight"
              style={{
                fontFamily: "var(--font-archivo-black)",
                fontSize: "clamp(2.4rem, 5.4vw, 4rem)",
                lineHeight: "0.94",
                letterSpacing: "-0.018em",
              }}
            >
              Before, during, after.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div
                  className="group relative overflow-hidden rounded-[20px] bg-white ring-2 ring-[#0a0a0a]"
                  style={{ boxShadow: "5px 5px 0 #0a0a0a" }}
                >
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

      {/* ── Why us — checklist ─────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr]">
          <Reveal from="left">
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.36em] text-[#0a0a0a]/65"
                style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
              >
                WHY PEOPLE TEXT US PHOTOS
              </p>
              <h2
                className="mt-3 uppercase tracking-tight"
                style={{
                  fontFamily: "var(--font-archivo-black)",
                  fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                  lineHeight: "0.94",
                  letterSpacing: "-0.018em",
                }}
              >
                {model.whyUs.heading}
              </h2>
              <p
                className="mt-5 max-w-md text-[15px] leading-7 text-[#1a1a1a]"
                style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 500 }}
              >
                Take a photo of the pile. Send it. Get a price back. Pick a window. Done.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {model.whyUs.bullets.map((bullet, idx) => {
              const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
              return (
                <Reveal key={bullet.title} from="right" delay={idx * 100}>
                  <div className="group flex items-start gap-5 rounded-[20px] bg-white p-6 ring-2 ring-[#0a0a0a]">
                    <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-md bg-[#fcd935] text-[#0a0a0a] ring-2 ring-[#0a0a0a]">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className="text-xl uppercase leading-tight tracking-tight"
                        style={{
                          fontFamily: "var(--font-archivo-black)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {bullet.title}
                      </p>
                      <p
                        className="mt-2 text-[15px] leading-7 text-[#1a1a1a]"
                        style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 500 }}
                      >
                        {bullet.body}
                      </p>
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
          <div className="relative overflow-hidden rounded-[28px] bg-[#fcd935] p-7 ring-2 ring-[#0a0a0a] sm:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-[#0a0a0a]/5"
            />
            <FontAwesomeIcon
              icon={faTruckRampBox}
              className="absolute right-8 top-8 h-16 w-16 text-[#0a0a0a]/15 sm:h-24 sm:w-24"
            />
            <p
              className="relative text-[10px] uppercase tracking-[0.36em] text-[#0a0a0a]/70"
              style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
            >
              SERVICE AREA
            </p>
            <h2
              className="relative mt-3 max-w-3xl uppercase tracking-tight text-[#0a0a0a]"
              style={{
                fontFamily: "var(--font-archivo-black)",
                fontSize: "clamp(2rem, 4.6vw, 3.4rem)",
                lineHeight: "0.94",
                letterSpacing: "-0.018em",
              }}
            >
              {model.serviceArea.heading}
            </h2>
            <p
              className="relative mt-5 max-w-2xl text-base leading-7 text-[#1a1a1a] sm:text-lg"
              style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 500 }}
            >
              {model.serviceArea.body}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p
            className="text-[10px] uppercase tracking-[0.36em] text-[#0a0a0a]/65"
            style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
          >
            COMMON QUESTIONS
          </p>
          <h2
            className="mt-3 uppercase tracking-tight"
            style={{
              fontFamily: "var(--font-archivo-black)",
              fontSize: "clamp(2.4rem, 5.4vw, 4rem)",
              lineHeight: "0.94",
              letterSpacing: "-0.018em",
            }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group rounded-[20px] bg-white ring-2 ring-[#0a0a0a] open:bg-[#fcd935]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
                  <span
                    className="text-base uppercase tracking-tight"
                    style={{
                      fontFamily: "var(--font-archivo-black)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {item.question}
                  </span>
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md ring-2 ring-[#0a0a0a] transition group-open:rotate-45 group-open:bg-[#0a0a0a] group-open:text-[#fcd935]">
                    +
                  </span>
                </summary>
                <p
                  className="px-6 pb-6 text-[15px] leading-7 text-[#1a1a1a]"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 500 }}
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
          <div
            className="grid gap-8 rounded-[28px] bg-[#0a0a0a] p-8 text-[#fff8d6] ring-2 ring-[#0a0a0a] sm:grid-cols-[1.2fr,1fr] sm:p-12"
            style={{ boxShadow: "8px 8px 0 #fcd935" }}
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.36em] text-[#fcd935]"
                style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
              >
                LET&rsquo;S MAKE IT VANISH
              </p>
              <h2
                className="mt-3 uppercase tracking-tight"
                style={{
                  fontFamily: "var(--font-archivo-black)",
                  fontSize: "clamp(2.4rem, 5.4vw, 4rem)",
                  lineHeight: "0.94",
                  letterSpacing: "-0.018em",
                }}
              >
                {model.contact.heading}
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-7 text-[#fff8d6]/85"
                style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 500 }}
              >
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-md bg-[#fcd935] px-5 py-4 text-base font-extrabold uppercase tracking-[0.12em] text-[#0a0a0a] ring-2 ring-[#fcd935] transition hover:bg-[#fff8d6]"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                >
                  <span className="flex items-center gap-3 normal-case">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-[#fff8d6]/85">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#fcd935]" />
                Same-day pickup if you call before noon.
              </p>
              <p className="flex items-center gap-2 text-sm text-[#fff8d6]/85">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#fcd935]" />
                Donatable items dropped at local nonprofits.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#0a0a0a]/65 sm:px-8">
        <p>
          Site preview built for {model.business.name} by{" "}
          <a
            href="https://walkperro.com"
            className="underline underline-offset-4"
          >
            WalkPerro
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
