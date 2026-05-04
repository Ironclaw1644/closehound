import type { CSSProperties } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faStar,
  faStarHalfStroke,
  faArrowRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { ICON_MAP } from "@/components/preview/icon-map";
import { getPaletteByKey } from "@/lib/preview/palettes";
import type { PreviewModel, PreviewIcon } from "@/lib/preview/types";

function StarRow({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <FontAwesomeIcon key={`f-${i}`} icon={faStar} className="h-3.5 w-3.5" />
      ))}
      {half ? <FontAwesomeIcon icon={faStarHalfStroke} className="h-3.5 w-3.5" /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <FontAwesomeIcon
          key={`e-${i}`}
          icon={faStar}
          className="h-3.5 w-3.5 opacity-30"
        />
      ))}
    </span>
  );
}

function Icon({ name, className }: { name: PreviewIcon; className?: string }) {
  const def = ICON_MAP[name] ?? ICON_MAP["circle-check"];
  return <FontAwesomeIcon icon={def} className={className} />;
}

export function PreviewSite({ model }: { model: PreviewModel }) {
  const palette = getPaletteByKey(model.paletteKey);

  const pageVars = {
    "--bg": palette.background,
    "--surface": palette.surface,
    "--text": palette.text,
    "--muted": palette.textMuted,
    "--accent": palette.accent,
    "--accent-ink": palette.accentInk,
    "--border": palette.border,
    "--ink-bg": palette.inkBg,
    "--ink-text": palette.inkText,
  } as CSSProperties;

  const yearsLabel =
    model.business.yearsInBusiness && model.business.yearsInBusiness >= 1
      ? `${model.business.yearsInBusiness}+ years serving ${model.business.city ?? "the area"}`
      : null;

  return (
    <div
      style={pageVars}
      className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-28"
    >
      {/* ── Top brand bar ───────────────────────────────────── */}
      <header className="border-b border-[color:var(--border)] bg-[color:var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            {model.assets.logoUrl ? (
              // Customer-generated logo
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={model.assets.logoUrl}
                alt={`${model.business.name} logo`}
                className="h-9 w-9 rounded-md object-cover"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold"
                style={{ background: palette.accent, color: palette.accentInk }}
              >
                {model.business.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="leading-tight">
              <p className="text-[15px] font-semibold tracking-tight">{model.business.name}</p>
              {model.business.city ? (
                <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {model.business.city}
                </p>
              ) : null}
            </div>
          </div>
          {model.business.phoneDisplay ? (
            <a
              href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ background: palette.accent, color: palette.accentInk }}
            >
              <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
              <span className="sm:hidden">Call</span>
            </a>
          ) : null}
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          {model.hero.eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl sm:leading-[1.02]">
          {model.hero.headline}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg sm:leading-8">
          {model.hero.subheadline}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={model.hero.primaryCta.href}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:text-base"
            style={{ background: palette.accent, color: palette.accentInk }}
          >
            <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
            {model.hero.primaryCta.label}
          </a>
          {model.hero.secondaryCta ? (
            <a
              href={model.hero.secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--text)] sm:text-base"
            >
              {model.hero.secondaryCta.label}
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        {/* Trust strip */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[color:var(--muted)]">
          {typeof model.business.rating === "number" ? (
            <span className="inline-flex items-center gap-2">
              <span style={{ color: palette.accent }}>
                <StarRow rating={model.business.rating} />
              </span>
              <span className="font-medium text-[color:var(--text)]">
                {model.business.rating.toFixed(1)}
              </span>
              {typeof model.business.reviewCount === "number" ? (
                <span>· {model.business.reviewCount} Google reviews</span>
              ) : null}
            </span>
          ) : null}
          {yearsLabel ? <span>· {yearsLabel}</span> : null}
        </div>

        {/* Hero image (right side on desktop) */}
        {model.assets.heroUrl ? (
          <div className="mt-10 overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={model.assets.heroUrl}
              alt={`${model.business.name} crew at work`}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}
      </section>

      {/* ── Top review ─────────────────────────────────────── */}
      {model.topReview ? (
        <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
          <figure className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm sm:p-8">
            <span style={{ color: palette.accent }} className="inline-block">
              <StarRow rating={model.topReview.rating} />
            </span>
            <blockquote className="mt-4 text-lg leading-8 text-[color:var(--text)] sm:text-xl">
              &ldquo;{model.topReview.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-[color:var(--muted)]">
              — {model.topReview.authorFirstName}, Google review
            </figcaption>
          </figure>
        </section>
      ) : null}

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {model.services.heading}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6"
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: palette.accent, color: palette.accentInk }}
              >
                <Icon name={service.icon} className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Why us ─────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {model.whyUs.heading}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.whyUs.bullets.map((bullet) => (
            <div
              key={bullet.title}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6"
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)]"
                style={{ color: palette.accent }}
              >
                <Icon name={bullet.icon} className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{bullet.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{bullet.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Service area ───────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div
          className="rounded-3xl border border-[color:var(--border)] p-6 sm:p-8"
          style={{ background: palette.inkBg, color: palette.inkText }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-70">
            Service area
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {model.serviceArea.heading}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 opacity-80 sm:text-lg">
            {model.serviceArea.body}
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{model.faq.heading}</h2>
        <div className="mt-6 grid gap-3">
          {model.faq.items.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none text-base font-semibold tracking-tight">
                <span className="flex items-center justify-between gap-4">
                  <span>{item.question}</span>
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border)] text-xs transition group-open:rotate-45"
                    style={{ color: palette.accent }}
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section
        id="contact"
        className="mx-auto mt-16 max-w-6xl px-4 sm:px-6"
      >
        <div className="grid gap-6 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:grid-cols-[1.2fr,1fr] sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {model.contact.heading}
            </h2>
            <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
              {model.contact.body}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {model.business.phoneDisplay ? (
              <a
                href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold"
                style={{ background: palette.accent, color: palette.accentInk }}
              >
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                {model.business.phoneDisplay}
              </a>
            ) : null}
            <p className="flex items-center justify-center gap-2 text-sm text-[color:var(--muted)]">
              <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" style={{ color: palette.accent }} />
              We answer the phone or call you back within the hour.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mx-auto mt-16 max-w-6xl px-4 pb-6 text-center text-xs text-[color:var(--muted)] sm:px-6">
        <p>
          Site preview built for {model.business.name} by{" "}
          <a href="https://walkperro.com" className="underline">
            WalkPerro
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
