import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faArrowRight,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { loadPreviewBySlug } from "@/lib/preview/load";
import { PreviewLayout } from "@/components/preview/multipage/PreviewLayout";
import { JsonLd } from "@/components/preview/JsonLd";
import { getPaletteForModel } from "@/lib/preview/palettes";
import {
  previewHomeUrl,
  previewServiceAreaUrl,
  INDUSTRY_DISPLAY,
} from "@/lib/preview/multipage";
import { getNeighbors } from "@/lib/preview/neighbors";
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
    const display = INDUSTRY_DISPLAY[model.industry];
    const cityPart = model.business.city ?? "the area";
    return {
      title: `Service Area · ${model.business.name}`,
      description: `${display} across ${cityPart} from ${model.business.name}. Same crew, same arrival window, same trusted name across the metro.`,
      alternates: { canonical: `/preview/${slug}/service-area` },
      openGraph: {
        type: "website",
        title: `${model.business.name} · Service Area`,
        description: model.serviceArea.body,
      },
    };
  } catch {
    return {
      title: "Service area not found",
      robots: { index: false, follow: false },
    };
  }
}

export default async function ServiceAreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await loadPreviewBySlug(slug);
  const palette = getPaletteForModel(model);
  const display = INDUSTRY_DISPLAY[model.industry];

  const primaryCity = model.business.city ?? "the area";
  const neighbors = getNeighbors(model.business.city);
  const state = neighbors?.state ?? null;

  // Buyer override takes precedence: if they provided an explicit cities list
  // in the editor, use it as the neighbors. Otherwise fall back to the static
  // metro neighbor map.
  const buyerCities = model.serviceArea.cities;
  const nearby =
    buyerCities && buyerCities.length > 0
      ? buyerCities.filter((c) => c !== primaryCity)
      : neighbors?.nearby ?? [];
  const topNearby = nearby.slice(0, 6);

  // Build the cities-to-render list (primary + neighbors).
  const cities: { name: string; isPrimary: boolean }[] = [
    { name: primaryCity, isPrimary: true },
    ...nearby.map((n) => ({ name: n, isPrimary: false })),
  ];

  // JSON-LD: LocalBusiness with areaServed array of Place nodes.
  const origin = getSiteOrigin();
  const url = `${origin}/preview/${slug}/service-area`;
  const businessId = `${origin}/preview/${slug}#business`;
  const serviceAreaLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${businessId}#service-area`,
    name: model.business.name,
    url,
    areaServed: cities.map((c) => ({
      "@type": "Place",
      name: state ? `${c.name}, ${state}` : c.name,
    })),
  };

  return (
    <PreviewLayout
      model={model}
      active="service-area"
      breadcrumbs={[
        { label: model.business.name, href: previewHomeUrl(slug) },
        { label: "Service Area", href: previewServiceAreaUrl(slug) },
      ]}
    >
      <JsonLd data={serviceAreaLd} id="service-area-jsonld" />

      {/* A. Hero */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: palette.accent }}
        >
          Service Area
        </p>
        <h1
          className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ color: palette.text }}
        >
          {display} across {primaryCity}
        </h1>
        <p
          className="mt-6 max-w-2xl text-base leading-7 sm:text-lg"
          style={{ color: palette.textMuted }}
        >
          {model.serviceArea.body}
        </p>
      </section>

      {/* B. Cities we serve grid */}
      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        style={{ borderTop: `1px solid ${palette.border}` }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: palette.accent }}
        >
          Cities we serve
        </p>
        <h2
          className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          style={{ color: palette.text }}
        >
          {neighbors
            ? `${primaryCity} and ${nearby.length} surrounding ${nearby.length === 1 ? "city" : "cities"}`
            : `${primaryCity} and the surrounding area`}
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {neighbors ? (
            cities.map((c) => (
              <div
                key={c.name}
                className="flex items-start gap-4 rounded-2xl p-5"
                style={{
                  background: palette.surface,
                  border: `1px solid ${palette.border}`,
                }}
              >
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                  style={{
                    background: `${palette.accent}1f`,
                    color: palette.accent,
                  }}
                >
                  <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p
                    className="text-base font-semibold leading-tight"
                    style={{ color: palette.text }}
                  >
                    {c.name}
                    {state ? (
                      <span
                        className="ml-1.5 text-[11px] font-normal uppercase tracking-[0.18em]"
                        style={{ color: palette.textMuted }}
                      >
                        {state}
                      </span>
                    ) : null}
                  </p>
                  <p
                    className="mt-1 text-sm leading-5"
                    style={{ color: palette.textMuted }}
                  >
                    {display} in {c.name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div
                className="flex items-start gap-4 rounded-2xl p-5"
                style={{
                  background: palette.surface,
                  border: `1px solid ${palette.border}`,
                }}
              >
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                  style={{
                    background: `${palette.accent}1f`,
                    color: palette.accent,
                  }}
                >
                  <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p
                    className="text-base font-semibold leading-tight"
                    style={{ color: palette.text }}
                  >
                    {primaryCity}
                  </p>
                  <p
                    className="mt-1 text-sm leading-5"
                    style={{ color: palette.textMuted }}
                  >
                    {display} in {primaryCity}
                  </p>
                </div>
              </div>
              <div
                className="flex items-start gap-4 rounded-2xl p-5"
                style={{
                  background: palette.surface,
                  border: `1px solid ${palette.border}`,
                }}
              >
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                  style={{
                    background: `${palette.accent}1f`,
                    color: palette.accent,
                  }}
                >
                  <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p
                    className="text-base font-semibold leading-tight"
                    style={{ color: palette.text }}
                  >
                    And the surrounding area
                  </p>
                  <p
                    className="mt-1 text-sm leading-5"
                    style={{ color: palette.textMuted }}
                  >
                    Same crew, same trusted name across the metro
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* C. Per-city blurb */}
      <section
        className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20"
        style={{ borderTop: `1px solid ${palette.border}` }}
      >
        <p
          className="text-base leading-7 sm:text-lg"
          style={{ color: palette.text }}
        >
          {model.business.name} serves {primaryCity}
          {neighbors
            ? ` and ${nearby.length} surrounding ${nearby.length === 1 ? "city" : "cities"}`
            : " and the surrounding area"}
          . Same crew, same arrival window, same trusted name across the metro.
        </p>
        {topNearby.length > 0 ? (
          <p
            className="mt-6 text-base leading-7"
            style={{ color: palette.textMuted }}
          >
            Active in {primaryCity},{" "}
            {topNearby.map((c, i) => (
              <span key={c}>
                <span
                  className="font-semibold underline-offset-4 hover:underline"
                  style={{ color: palette.text }}
                >
                  {c}
                </span>
                {i < topNearby.length - 1 ? ", " : ""}
              </span>
            ))}
            {topNearby.length < nearby.length ? ", and beyond" : ""}.
          </p>
        ) : null}
        <p
          className="mt-6 text-base leading-7"
          style={{ color: palette.textMuted }}
        >
          Outside our standard service zone? Give us a call — we book travel
          jobs for the right project.
        </p>
      </section>

      {/* D. Map placeholder */}
      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        style={{ borderTop: `1px solid ${palette.border}` }}
      >
        <div
          className="relative overflow-hidden rounded-[28px]"
          style={{
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            height: "360px",
            backgroundImage: `linear-gradient(${palette.border} 1px, transparent 1px), linear-gradient(90deg, ${palette.border} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${palette.accent}14, transparent 60%)`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: palette.accent,
                color: palette.accentInk,
                boxShadow: `0 0 0 8px ${palette.accent}26`,
              }}
            >
              <FontAwesomeIcon icon={faLocationDot} className="h-6 w-6" />
            </span>
            <p
              className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: palette.text }}
            >
              {primaryCity}
              {state ? `, ${state}` : ""}
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: palette.textMuted }}
            >
              and the surrounding metro
            </p>
          </div>
        </div>
      </section>

      {/* F. CTA strip */}
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
              Local. On time. On the level.
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
              In your zip code? Let&rsquo;s get this booked.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {model.business.phoneDisplay ? (
              <a
                href={
                  model.business.phoneTelHref ??
                  `tel:${model.business.phoneDisplay}`
                }
                className="group inline-flex items-center gap-3 rounded-full px-6 py-4 text-base font-semibold transition hover:-translate-y-0.5"
                style={{
                  background: palette.accent,
                  color: palette.accentInk,
                }}
              >
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                {model.business.phoneDisplay}
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                />
              </a>
            ) : null}
            <Link
              href={`${previewHomeUrl(slug)}#contact`}
              className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{
                background: "transparent",
                color: palette.inkText,
                border: `1px solid ${palette.inkText}33`,
              }}
            >
              Get a quote
              <FontAwesomeIcon
                icon={faArrowRight}
                className="h-3 w-3 transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </PreviewLayout>
  );
}
