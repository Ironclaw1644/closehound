import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { PALETTE_PRESETS } from "@/lib/palettes";
import { requirePreviewSiteBySlug } from "@/lib/preview-sites";
import { TYPOGRAPHY_PAIRINGS } from "@/lib/site-generator/typography";
import type { PreviewSite, PreviewSiteSectionContent } from "@/lib/site-generator";

function getPalette(previewSite: PreviewSite) {
  return (
    PALETTE_PRESETS.find((palette) => palette.key === previewSite.theme.paletteKey) ??
    PALETTE_PRESETS[0]
  );
}

function getTypography(previewSite: PreviewSite) {
  return (
    TYPOGRAPHY_PAIRINGS.find((pairing) => pairing.key === previewSite.theme.typographyKey) ??
    TYPOGRAPHY_PAIRINGS[0]
  );
}

function PreviewSection({
  title,
  section,
  accent,
}: {
  title?: string;
  section: PreviewSiteSectionContent;
  accent: string;
}) {
  return (
    <section className="rounded-[32px] border border-black/8 bg-white/80 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-10">
      <div className="max-w-3xl">
        {title ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-zinc-500">
            {title}
          </p>
        ) : null}
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          {section.title}
        </h2>
        {section.body ? (
          <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg">{section.body}</p>
        ) : null}
      </div>

      {section.items?.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {section.items.map((item, index) => (
            <article
              key={`${item.title ?? "item"}-${index}`}
              className="rounded-[24px] border border-black/8 bg-white px-6 py-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)]"
            >
              <div
                className="mb-4 h-1.5 w-16 rounded-full"
                style={{ backgroundColor: accent }}
              />
              {item.title ? (
                <h3 className="text-lg font-semibold text-zinc-950">{item.title}</h3>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
            </article>
          ))}
        </div>
      ) : null}

      {section.primaryCtaLabel ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#contact"
            className="rounded-full px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
            style={{ backgroundColor: accent }}
          >
            {section.primaryCtaLabel}
          </a>
          {section.secondaryCtaLabel ? (
            <a
              href="#services"
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-zinc-900"
            >
              {section.secondaryCtaLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const previewSite = await requirePreviewSiteBySlug(slug);

  if (!previewSite) {
    notFound();
  }

  const palette = getPalette(previewSite);
  const typography = getTypography(previewSite);
  const hero = previewSite.sections.hero;
  const services = previewSite.sections.services;
  const reviews = previewSite.sections.reviews;
  const about = previewSite.sections.about;
  const cta = previewSite.sections.cta;
  const contact = previewSite.sections.contact;

  const pageStyle = {
    "--preview-background": palette.background,
    "--preview-surface": palette.surface,
    "--preview-text": palette.text,
    "--preview-muted": palette.mutedText,
    "--preview-accent": palette.accent,
    "--preview-accent-contrast": palette.accentContrast,
    "--preview-border": palette.border,
    "--preview-heading-font": typography.headingFamily,
    "--preview-body-font": typography.bodyFamily,
  } as CSSProperties;

  return (
    <main
      style={pageStyle}
      className="min-h-screen bg-[var(--preview-background)] text-[var(--preview-text)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-14">
        <section className="relative overflow-hidden rounded-[40px] border border-black/8 bg-[var(--preview-surface)] px-8 py-10 shadow-[0_35px_120px_rgba(15,23,42,0.12)] sm:px-12 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.92),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.7),transparent_65%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--preview-muted)]">
                {previewSite.business.city} {previewSite.industryKey}
              </p>
              <h1
                className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl"
                style={{ fontFamily: "var(--preview-heading-font), serif" }}
              >
                {hero.title}
              </h1>
              {hero.body ? (
                <p
                  className="mt-6 max-w-3xl text-lg leading-8 text-[var(--preview-muted)] sm:text-xl"
                  style={{ fontFamily: "var(--preview-body-font), sans-serif" }}
                >
                  {hero.body}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="rounded-full px-6 py-3.5 text-sm font-semibold text-[var(--preview-accent-contrast)] shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
                  style={{ backgroundColor: palette.accent }}
                >
                  {hero.primaryCtaLabel ?? "Request a quote"}
                </a>
                <a
                  href="#services"
                  className="rounded-full border border-black/10 bg-white/80 px-6 py-3.5 text-sm font-semibold text-zinc-950"
                >
                  {hero.secondaryCtaLabel ?? "View services"}
                </a>
              </div>
            </div>

            <aside className="rounded-[32px] border border-black/8 bg-white/88 p-6 shadow-[0_22px_80px_rgba(15,23,42,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Why Homeowners Call
              </p>
              <div className="mt-5 space-y-4">
                {(hero.items ?? []).map((item, index) => (
                  <div key={`${item.description}-${index}`} className="rounded-2xl border border-black/8 bg-white px-4 py-4">
                    <p className="text-sm font-medium text-zinc-950">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl px-4 py-4" style={{ backgroundColor: palette.accentContrast }}>
                <p className="text-sm font-medium text-zinc-950">{previewSite.business.phoneDisplay}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {previewSite.business.email ?? "Call to schedule service"}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-8 grid gap-8">
          <PreviewSection title="Services" section={services} accent={palette.accent} />
          <PreviewSection title="Proof" section={reviews} accent={palette.accent} />
          <PreviewSection title="About" section={about} accent={palette.accent} />
          <PreviewSection title="Offer" section={cta} accent={palette.accent} />
          <section
            id="contact"
            className="rounded-[32px] border border-black/8 bg-zinc-950 px-8 py-10 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] sm:px-10"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">
                  Contact
                </p>
                <h2
                  className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                  style={{ fontFamily: "var(--preview-heading-font), serif" }}
                >
                  {contact.title}
                </h2>
                {contact.body ? (
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{contact.body}</p>
                ) : null}
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {(contact.items ?? []).map((item, index) => (
                    <div
                      key={`${item.title ?? "contact"}-${index}`}
                      className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-5"
                    >
                      {item.title ? (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                          {item.title}
                        </p>
                      ) : null}
                      <p className="mt-2 text-lg font-medium text-white">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/6 p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/50">
                  Service Snapshot
                </p>
                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.22em] text-white/40">Business</dt>
                    <dd className="mt-1 text-base font-medium text-white">{previewSite.business.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.22em] text-white/40">Service Area</dt>
                    <dd className="mt-1 text-base font-medium text-white">
                      {previewSite.business.city} {previewSite.industryKey}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.22em] text-white/40">Availability</dt>
                    <dd className="mt-1 text-base font-medium text-white">
                      Estimates available by phone or email
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
