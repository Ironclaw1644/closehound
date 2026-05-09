import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faCheck,
  faQuoteLeft,
  faSpa,
} from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { ICON_MAP } from "@/components/preview/icon-map";
import { Reveal } from "@/components/preview/shared/Reveal";
import { StarRow } from "@/components/preview/shared/StarRow";
import { italiana, lora } from "@/lib/preview/fonts";

export function MedSpaPreview({ model }: { model: PreviewModel }) {
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${italiana.variable} ${lora.variable} relative min-h-screen overflow-hidden bg-[#faf5f0] pb-32 text-[#251918]`}
      style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
    >
      {/* warm gradient halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px]"
        style={{
          background:
            "radial-gradient(900px 380px at 80% 0%, rgba(178,115,97,0.22), transparent 55%), radial-gradient(900px 360px at 0% 30%, rgba(241,222,205,0.55), transparent 55%)",
        }}
      />
      {/* faint vertical line for editorial column feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px bg-[#251918]/8 lg:block"
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 pt-8 sm:px-8 sm:pt-10">
        <div className="flex items-center gap-3">
          {model.assets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.assets.logoUrl}
              alt={`${model.business.name} logo`}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-[#251918]/10"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-base text-[#fff7f1]"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #d49983 0%, #b27361 60%, #6e3f31 100%)",
                boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.18)",
              }}
            >
              <span style={{ fontFamily: "var(--font-italiana)", fontSize: "18px" }}>
                {initials}
              </span>
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[24px] tracking-tight"
              style={{ fontFamily: "var(--font-italiana)", letterSpacing: "0.02em" }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p className="text-[10px] uppercase tracking-[0.42em] text-[#251918]/55">
                {model.business.city} · Aesthetics
              </p>
            ) : null}
          </div>
        </div>
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full border border-[#251918]/20 bg-white px-4 py-2.5 text-sm font-medium text-[#251918] transition hover:border-[#b27361] hover:text-[#b27361]"
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <Reveal from="up" delay={0}>
              <p className="text-[11px] tracking-[0.46em] text-[#b27361]">
                VOL. {2026 - (model.business.yearsInBusiness ?? 6)} · {model.hero.eyebrow.toUpperCase()}
              </p>
            </Reveal>

            <Reveal from="up" delay={120}>
              <h1
                className="mt-7 max-w-[14ch] tracking-tight"
                style={{
                  fontFamily: "var(--font-italiana)",
                  fontWeight: 400,
                  fontSize: "clamp(2.8rem, 6.4vw, 5.4rem)",
                  lineHeight: "0.98",
                  letterSpacing: "-0.01em",
                }}
              >
                {model.hero.headline}
              </h1>
            </Reveal>

            <Reveal from="up" delay={260}>
              <p
                className="mt-7 max-w-xl text-base leading-8 text-[#4a3a37] sm:text-lg"
                style={{ fontFamily: "var(--font-lora)" }}
              >
                {model.hero.subheadline}
              </p>
            </Reveal>

            <Reveal from="up" delay={380}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#251918] px-7 py-4 text-sm tracking-[0.18em] text-[#fff7f1] shadow-[0_3px_0_rgba(0,0,0,0.22),0_18px_40px_rgba(37,25,24,0.32)] transition hover:-translate-y-0.5 hover:bg-[#b27361] hover:shadow-[0_5px_0_rgba(0,0,0,0.22),0_24px_48px_rgba(178,115,97,0.42)] active:translate-y-0.5 sm:text-base"
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  {model.hero.primaryCta.label.toUpperCase()}
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#251918]/25 bg-white/40 px-6 py-3.5 text-sm tracking-[0.18em] text-[#251918] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#b27361] hover:bg-white hover:text-[#b27361] sm:text-base"
                    style={{ fontFamily: "var(--font-lora)" }}
                  >
                    <FontAwesomeIcon icon={faPhone} className="h-3 w-3 transition group-hover:rotate-[-12deg]" />
                    {model.hero.secondaryCta.label.toUpperCase()}
                  </a>
                ) : null}
              </div>
            </Reveal>

            <Reveal from="up" delay={520}>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#4a3a37]">
                {typeof model.business.rating === "number" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#b27361]">
                      <StarRow rating={model.business.rating} />
                    </span>
                    <span
                      className="text-base tabular-nums text-[#251918]"
                      style={{ fontFamily: "var(--font-italiana)" }}
                    >
                      {model.business.rating.toFixed(1)}
                    </span>
                    {typeof model.business.reviewCount === "number" ? (
                      <span>· {model.business.reviewCount} Google reviews</span>
                    ) : null}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2 italic">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#b27361]" />
                  MD-supervised protocols
                </span>
                <span className="inline-flex items-center gap-2 italic">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#b27361]" />
                  Free 30-minute consultations
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: hero photo with prescription card overlay */}
          <Reveal from="scale" delay={420}>
            <div className="relative">
              {model.assets.heroUrl ? (
                <div className="overflow-hidden rounded-[36px] ring-1 ring-[#251918]/12 shadow-[0_30px_80px_rgba(37,25,24,0.22)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.assets.heroUrl}
                    alt={`${model.business.name} treatment room`}
                    className="preview-hero-drift aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="aspect-[4/5] rounded-[36px] ring-1 ring-[#251918]/12"
                  style={{
                    background:
                      "radial-gradient(420px 380px at 30% 25%, rgba(241,222,205,0.95), transparent 65%), linear-gradient(135deg, #efe1d2 0%, #d6b29c 55%, #b27361 100%)",
                  }}
                />
              )}

              {/* Today's consult — prescription card overlay */}
              <div className="absolute -left-3 -bottom-6 w-[78%] max-w-[300px] rotate-[-2deg] rounded-[14px] border border-[#251918]/15 bg-[#fff7f1] p-5 shadow-[0_2px_0_rgba(37,25,24,0.10),0_22px_44px_rgba(37,25,24,0.22)] sm:-left-6 sm:-bottom-10 sm:max-w-[320px] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="text-[10px] tracking-[0.34em] text-[#b27361]"
                    style={{ fontFamily: "var(--font-lora)", fontStyle: "italic" }}
                  >
                    TODAY · 2:30 PM
                  </p>
                  <span
                    className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-[#251918]/20 text-[10px] tracking-tight text-[#b27361]"
                    style={{ fontFamily: "var(--font-italiana)" }}
                    aria-label="Prescription"
                  >
                    Rx
                  </span>
                </div>
                <p
                  className="mt-3 text-xl leading-tight tracking-tight text-[#251918] sm:text-2xl"
                  style={{ fontFamily: "var(--font-italiana)" }}
                >
                  Botox · 14 units
                </p>
                <p
                  className="mt-1 text-[12px] leading-snug text-[#4a3a37]"
                  style={{ fontFamily: "var(--font-lora)", fontStyle: "italic" }}
                >
                  Glabellar + crow&rsquo;s feet
                </p>
                <div className="mt-4 space-y-1.5 border-t border-dashed border-[#251918]/15 pt-3">
                  <p className="flex items-center gap-2 text-[12px] text-[#4a3a37]">
                    <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-[#b27361]" />
                    Reviewed by MD
                  </p>
                  <p className="flex items-center gap-2 text-[12px] text-[#4a3a37]">
                    <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-[#b27361]" />
                    Posted price: <span className="tabular-nums text-[#251918]">$238</span>
                  </p>
                </div>
              </div>

              {/* "Booked today" badge — top-right */}
              <div className="absolute -right-3 -top-3 inline-flex items-center gap-2 rounded-full bg-[#251918] px-3.5 py-1.5 text-[10px] tracking-[0.32em] text-[#fff7f1] shadow-[0_8px_24px_rgba(37,25,24,0.32)] sm:-right-6 sm:-top-6">
                <span className="preview-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#e0b8a4]" />
                BOOKED TODAY
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Principles strip ──────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              { num: "I.", label: "Conservative dosing", body: "We err on the lower side. You can always come back for more." },
              { num: "II.", label: "Posted pricing", body: "Per-unit pricing read aloud at the consult, before any decision." },
              { num: "III.", label: "Real medical oversight", body: "MD-supervised protocols on every visit, every injector, every time." },
            ].map((item, idx) => (
              <Reveal key={item.label} from="up" delay={idx * 100}>
                <div className="border-t border-[#251918]/15 pt-5">
                  <p
                    className="text-[11px] tracking-[0.42em] text-[#b27361]"
                    style={{ fontFamily: "var(--font-lora)" }}
                  >
                    {item.num}
                  </p>
                  <p
                    className="mt-3 text-2xl tracking-tight text-[#251918]"
                    style={{ fontFamily: "var(--font-italiana)" }}
                  >
                    {item.label}
                  </p>
                  <p className="mt-3 text-[15px] leading-7 text-[#4a3a37]">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="relative z-10 mx-auto mt-28 max-w-5xl px-5 sm:px-8">
          <Reveal from="up">
            <figure className="relative">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute -left-2 -top-3 h-32 w-32 text-[#b27361]/15"
              />
              <span className="relative text-[#b27361]">
                <StarRow rating={model.topReview.rating} size="md" />
              </span>
              <blockquote
                className="relative mt-6 max-w-3xl tracking-tight text-[#251918]"
                style={{
                  fontFamily: "var(--font-italiana)",
                  fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
                  lineHeight: "1.32",
                  letterSpacing: "-0.005em",
                }}
              >
                &ldquo;{model.topReview.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-xs tracking-[0.42em] text-[#251918]/55">
                — {model.topReview.authorFirstName.toUpperCase()} · GOOGLE REVIEW
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="relative z-10 mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.46em] text-[#b27361]">SIGNATURE TREATMENTS</p>
          <h2
            className="mt-3 max-w-3xl tracking-tight"
            style={{
              fontFamily: "var(--font-italiana)",
              fontWeight: 400,
              fontSize: "clamp(2.6rem, 5.4vw, 4.2rem)",
              lineHeight: "1.02",
              letterSpacing: "-0.005em",
            }}
          >
            {model.services.heading}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-12 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Ico = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
            return (
              <Reveal key={service.title} from="up" delay={idx * 110}>
                <article className="relative">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-6xl leading-none tracking-tight text-[#b27361]/85 sm:text-7xl"
                      style={{ fontFamily: "var(--font-italiana)" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <FontAwesomeIcon icon={Ico} className="h-4 w-4 text-[#b27361]" />
                  </div>
                  <h3
                    className="mt-5 text-2xl tracking-tight sm:text-3xl"
                    style={{ fontFamily: "var(--font-italiana)" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mt-3 max-w-md text-[15px] leading-8 text-[#4a3a37]"
                    style={{ fontFamily: "var(--font-lora)" }}
                  >
                    {service.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Atmosphere ─────────────────────────────────────── */}
      {model.assets.galleryUrls.length > 0 ? (
        <section className="relative z-10 mx-auto mt-28 max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="text-[11px] tracking-[0.46em] text-[#b27361]">ATMOSPHERE</p>
            <h2
              className="mt-3 max-w-3xl tracking-tight"
              style={{
                fontFamily: "var(--font-italiana)",
                fontWeight: 400,
                fontSize: "clamp(2.6rem, 5.4vw, 4.2rem)",
                lineHeight: "1.02",
                letterSpacing: "-0.005em",
              }}
            >
              Inside the studio.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {model.assets.galleryUrls.map((url, idx) => (
              <Reveal key={url} from="up" delay={idx * 110}>
                <div className="group relative overflow-hidden rounded-[28px] bg-white ring-1 ring-[#251918]/10 shadow-[0_24px_60px_rgba(37,25,24,0.08)] transition hover:shadow-[0_28px_70px_rgba(37,25,24,0.14)]">
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
      <section className="relative z-10 mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <Reveal from="scale">
          <div
            className="relative overflow-hidden rounded-[40px] bg-[#251918] px-7 py-16 text-[#fff7f1] sm:px-12 sm:py-24"
            style={{
              backgroundImage:
                "radial-gradient(900px 420px at 78% 0%, rgba(178,115,97,0.45), transparent 55%), linear-gradient(135deg, #1a1110 0%, #2a1c1a 60%, #3a2622 100%)",
            }}
          >
            <p className="relative text-[11px] tracking-[0.46em] text-[#e0b8a4]">
              WHY CLIENTS REFER THEIR SISTER
            </p>
            <h2
              className="relative mt-4 max-w-3xl tracking-tight"
              style={{
                fontFamily: "var(--font-italiana)",
                fontWeight: 400,
                fontSize: "clamp(2.4rem, 5.2vw, 4rem)",
                lineHeight: "1.02",
              }}
            >
              {model.whyUs.heading}
            </h2>
            <div className="relative mt-12 grid gap-10 sm:grid-cols-3">
              {model.whyUs.bullets.map((bullet, idx) => {
                const Ico = ICON_MAP[bullet.icon] ?? ICON_MAP["circle-check"];
                return (
                  <Reveal key={bullet.title} from="up" delay={idx * 100}>
                    <div className="border-t border-[#e0b8a4]/30 pt-5">
                      <FontAwesomeIcon icon={Ico} className="h-5 w-5 text-[#e0b8a4]" />
                      <p
                        className="mt-3 text-2xl leading-tight tracking-tight"
                        style={{ fontFamily: "var(--font-italiana)" }}
                      >
                        {bullet.title}
                      </p>
                      <p
                        className="mt-3 text-[15px] leading-8 text-[#fff7f1]/80"
                        style={{ fontFamily: "var(--font-lora)" }}
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
      <section className="relative z-10 mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[36px] bg-white p-8 ring-1 ring-[#251918]/10 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[11px] tracking-[0.46em] text-[#b27361]">VISITING THE STUDIO</p>
              <h2
                className="mt-3 tracking-tight"
                style={{
                  fontFamily: "var(--font-italiana)",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  lineHeight: "1.04",
                }}
              >
                {model.serviceArea.heading}
              </h2>
              <p
                className="mt-5 text-base leading-8 text-[#4a3a37] sm:text-lg"
                style={{ fontFamily: "var(--font-lora)" }}
              >
                {model.serviceArea.body}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 self-end">
              <div className="rounded-2xl bg-[#faf0e6] px-4 py-4 ring-1 ring-[#b27361]/15">
                <p className="text-[10px] tracking-[0.42em] text-[#b27361]">PRIVATE ROOMS</p>
                <p
                  className="mt-1 text-3xl tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-italiana)" }}
                >
                  6
                </p>
              </div>
              <div className="rounded-2xl bg-[#faf0e6] px-4 py-4 ring-1 ring-[#b27361]/15">
                <p className="text-[10px] tracking-[0.42em] text-[#b27361]">EVENING HOURS</p>
                <p
                  className="mt-1 text-3xl tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-italiana)" }}
                >
                  Tue · Thu
                </p>
              </div>
              <div className="col-span-2 rounded-2xl bg-[#251918] px-4 py-4 text-[#fff7f1]">
                <p className="text-[10px] tracking-[0.42em] text-[#e0b8a4]">RECOVERY LOUNGE</p>
                <p
                  className="mt-1 text-xl leading-snug italic"
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  Tea, herbal poultices, and time enough to leave looking calm — not corrected.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-28 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.46em] text-[#b27361]">COMMON QUESTIONS</p>
          <h2
            className="mt-3 tracking-tight"
            style={{
              fontFamily: "var(--font-italiana)",
              fontWeight: 400,
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              lineHeight: "1.02",
            }}
          >
            {model.faq.heading}
          </h2>
        </Reveal>
        <div className="mt-8 divide-y divide-[#251918]/12 border-y border-[#251918]/12">
          {model.faq.items.map((item, idx) => (
            <Reveal key={item.question} from="up" delay={idx * 80}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span
                    className="text-xl tracking-tight"
                    style={{ fontFamily: "var(--font-italiana)" }}
                  >
                    {item.question}
                  </span>
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#251918]/20 text-[#b27361] transition group-open:rotate-45 group-open:border-[#b27361] group-open:bg-[#b27361] group-open:text-white">
                    +
                  </span>
                </summary>
                <p
                  className="mt-4 max-w-prose text-[15px] leading-8 text-[#4a3a37]"
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <Reveal from="up">
          <div className="grid gap-8 rounded-[36px] bg-[#faf0e6] p-8 sm:grid-cols-[1.2fr,1fr] sm:p-12">
            <div>
              <p className="text-[11px] tracking-[0.46em] text-[#b27361]">RESERVE A CONSULT</p>
              <h2
                className="mt-3 tracking-tight"
                style={{
                  fontFamily: "var(--font-italiana)",
                  fontWeight: 400,
                  fontSize: "clamp(2.6rem, 5.4vw, 4rem)",
                  lineHeight: "1.02",
                }}
              >
                {model.contact.heading}
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-8 text-[#4a3a37]"
                style={{ fontFamily: "var(--font-lora)" }}
              >
                {model.contact.body}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center justify-between gap-3 rounded-full bg-[#251918] px-5 py-4 text-base tracking-[0.18em] text-[#fff7f1] transition hover:bg-[#b27361]"
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  <span className="flex items-center gap-3 normal-case tracking-normal">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                    {model.business.phoneDisplay}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              ) : null}
              <p className="flex items-center gap-2 text-sm italic text-[#4a3a37]">
                <FontAwesomeIcon icon={faSpa} className="h-3.5 w-3.5 text-[#b27361]" />
                Free 30-minute consultations, no pressure to book.
              </p>
              <p className="flex items-center gap-2 text-sm italic text-[#4a3a37]">
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-[#b27361]" />
                Per-unit pricing posted before treatment begins.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-20 max-w-6xl px-5 pb-6 text-center text-xs text-[#251918]/55 sm:px-8">
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
