import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faArrowRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { loadPreviewBySlug } from "@/lib/preview/load";
import { PreviewLayout } from "@/components/preview/multipage/PreviewLayout";
import { JsonLd } from "@/components/preview/JsonLd";
import { getPaletteForModel } from "@/lib/preview/palettes";
import {
  previewHomeUrl,
  previewAboutUrl,
} from "@/lib/preview/multipage";
import { getAboutForIndustry } from "@/lib/preview/about";
import { getSiteOrigin } from "@/lib/preview/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const model = await loadPreviewBySlug(slug);
    const aboutCopy = getAboutForIndustry(model.industry);
    // Prefer buyer override; fall back to per-industry static copy.
    const tagline = model.about?.tagline ?? aboutCopy.tagline;
    const firstParagraph =
      model.about?.story ??
      aboutCopy.paragraphs(
        model.business.name,
        model.business.city,
        model.business.yearsInBusiness
      )[0];
    return {
      title: `About · ${model.business.name}`,
      description: firstParagraph.slice(0, 200),
      alternates: { canonical: `/preview/${slug}/about` },
      openGraph: {
        type: "website",
        title: `About · ${model.business.name}`,
        description: tagline,
      },
    };
  } catch {
    return { title: "About not found", robots: { index: false, follow: false } };
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await loadPreviewBySlug(slug);
  const palette = getPaletteForModel(model);
  const aboutCopy = getAboutForIndustry(model.industry);

  const cityLine = model.business.city
    ? `${model.business.name} · ${model.business.city}`
    : model.business.name;

  // Prefer buyer overrides; otherwise fall back to per-industry static copy.
  const tagline = model.about?.tagline ?? aboutCopy.tagline;
  const paragraphs = model.about?.story
    ? // Split a buyer's free-text story into paragraphs at blank lines so
      // the typography spacing still works.
      model.about.story
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : aboutCopy.paragraphs(
        model.business.name,
        model.business.city,
        model.business.yearsInBusiness
      );

  const portraitPhoto =
    model.assets.galleryUrls[2] ?? model.assets.heroUrl ?? null;

  const yearsLabel = model.business.yearsInBusiness ?? "—";
  const ratingLabel =
    typeof model.business.rating === "number"
      ? model.business.rating.toFixed(1)
      : "—";
  const reviewCountLabel =
    typeof model.business.reviewCount === "number" && model.business.reviewCount > 0
      ? `${model.business.reviewCount} Google reviews`
      : "Google reviews";

  // Organization JSON-LD
  const origin = getSiteOrigin();
  const url = `${origin}/preview/${slug}/about`;
  const orgLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}#organization`,
    name: model.business.name,
    url,
    description: paragraphs[0],
    award: aboutCopy.badges.join(" · "),
  };
  if (model.business.yearsInBusiness && model.business.yearsInBusiness >= 1) {
    orgLd.foundingDate = String(
      new Date().getFullYear() - model.business.yearsInBusiness
    );
  }

  return (
    <PreviewLayout
      model={model}
      active="about"
      breadcrumbs={[
        { label: model.business.name, href: previewHomeUrl(slug) },
        { label: "About", href: previewAboutUrl(slug) },
      ]}
    >
      <JsonLd data={orgLd} id="about-jsonld" />

      {/* A. Hero */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: palette.accent }}
            >
              About
            </p>
            <h1
              className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
              style={{ color: palette.text }}
            >
              {tagline}
            </h1>
            <p
              className="mt-6 max-w-xl text-base leading-7 sm:text-lg"
              style={{ color: palette.textMuted }}
            >
              {cityLine}
            </p>
          </div>

          {portraitPhoto ? (
            <div
              className="overflow-hidden rounded-[28px]"
              style={{
                border: `1px solid ${palette.border}`,
                boxShadow: `0 30px 80px ${palette.inkBg}28`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portraitPhoto}
                alt={`${model.business.name} crew`}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* B. Story */}
      <section
        className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20"
        style={{ borderTop: `1px solid ${palette.border}` }}
      >
        <div className="space-y-8">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-lg leading-9 sm:text-xl sm:leading-10"
              style={{
                color: i === 0 ? palette.text : palette.textMuted,
                fontFamily: "var(--font-display, var(--font-serif, serif))",
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* C. Trust badges */}
      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        style={{ borderTop: `1px solid ${palette.border}` }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: palette.accent }}
        >
          What backs the work
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {aboutCopy.badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                color: palette.text,
              }}
            >
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: palette.accent,
                  color: palette.accentInk,
                }}
              >
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
              </span>
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* D. Stat row */}
      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        style={{ borderTop: `1px solid ${palette.border}` }}
      >
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p
              className="text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl"
              style={{ color: palette.accent }}
            >
              {yearsLabel}
            </p>
            <p
              className="mt-2 text-sm uppercase tracking-[0.18em]"
              style={{ color: palette.textMuted }}
            >
              Years in business
            </p>
          </div>
          <div>
            <p
              className="text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl"
              style={{ color: palette.accent }}
            >
              {ratingLabel}
              <span className="ml-1 text-2xl" style={{ color: palette.textMuted }}>
                /5
              </span>
            </p>
            <p
              className="mt-2 text-sm uppercase tracking-[0.18em]"
              style={{ color: palette.textMuted }}
            >
              {reviewCountLabel}
            </p>
          </div>
          <div>
            <p
              className="text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl"
              style={{ color: palette.accent }}
            >
              Local
            </p>
            <p
              className="mt-2 text-sm uppercase tracking-[0.18em]"
              style={{ color: palette.textMuted }}
            >
              {model.business.city ?? "—"} born and based
            </p>
          </div>
        </div>
      </section>

      {/* F. Contact CTA strip */}
      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8"
        style={{ borderTop: `1px solid ${palette.border}` }}
      >
        <div
          className="flex flex-col items-start justify-between gap-6 rounded-[28px] p-8 sm:flex-row sm:items-center sm:p-12"
          style={{ background: palette.inkBg, color: palette.inkText }}
        >
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: palette.accent }}
            >
              Ready when you are
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
              Let's get this booked.
            </p>
          </div>
          {model.business.phoneDisplay ? (
            <a
              href={
                model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`
              }
              className="group inline-flex items-center gap-3 rounded-full px-6 py-4 text-base font-semibold transition hover:-translate-y-0.5"
              style={{ background: palette.accent, color: palette.accentInk }}
            >
              <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
              {model.business.phoneDisplay}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="h-3.5 w-3.5 transition group-hover:translate-x-1"
              />
            </a>
          ) : (
            <Link
              href={`${previewHomeUrl(slug)}#contact`}
              className="group inline-flex items-center gap-3 rounded-full px-6 py-4 text-base font-semibold transition hover:-translate-y-0.5"
              style={{ background: palette.accent, color: palette.accentInk }}
            >
              Get a quote
              <FontAwesomeIcon
                icon={faArrowRight}
                className="h-3.5 w-3.5 transition group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>
      </section>
    </PreviewLayout>
  );
}
