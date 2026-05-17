import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { loadPreviewBySlug } from "@/lib/preview/load";
import { PreviewLayout } from "@/components/preview/multipage/PreviewLayout";
import { ICON_MAP } from "@/components/preview/icon-map";
import { getPaletteForModel } from "@/lib/preview/palettes";
import {
  serviceSlug,
  previewServiceUrl,
  previewHomeUrl,
  previewServicesUrl,
  INDUSTRY_DISPLAY,
} from "@/lib/preview/multipage";
import { getPricingForIndustry } from "@/lib/preview/pricing";

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
    const cityPart = model.business.city ? ` in ${model.business.city}` : "";
    return {
      title: `Services · ${model.business.name}`,
      description: `${display} services${cityPart} from ${model.business.name}. ${model.services.items
        .map((s) => s.title)
        .join(" · ")}.`,
      alternates: { canonical: `/preview/${slug}/services` },
      openGraph: {
        type: "website",
        title: `${model.business.name} · Services`,
        description: model.hero.subheadline,
      },
    };
  } catch {
    return { title: "Services not found", robots: { index: false, follow: false } };
  }
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await loadPreviewBySlug(slug);
  const palette = getPaletteForModel(model);
  const pricing = getPricingForIndustry(model.industry);

  return (
    <PreviewLayout
      model={model}
      active="services"
      breadcrumbs={[
        { label: model.business.name, href: previewHomeUrl(slug) },
        { label: "Services", href: previewServicesUrl(slug) },
      ]}
    >
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: palette.accent }}>
          Services
        </p>
        <h1
          className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ color: palette.text }}
        >
          {model.services.heading}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: palette.textMuted }}>
          {model.hero.subheadline}
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {model.services.items.map((service, idx) => {
            const Icon = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
            const slug2 = serviceSlug(service.title);
            // Buyer's free-text price wins over industry default. For
            // buyer-added services beyond pricing.length there's no industry
            // default, so the only price shown is whatever the buyer typed.
            const buyerPrice = service.price?.trim() || null;
            const industryPrice = pricing[idx] ?? null;
            return (
              <Link
                key={service.title}
                href={previewServiceUrl(slug, slug2)}
                className="group relative flex h-full flex-col gap-4 rounded-[24px] p-7 transition hover:-translate-y-1"
                style={{
                  background: palette.surface,
                  border: `1px solid ${palette.border}`,
                  boxShadow: `0 0 0 ${palette.accent}00`,
                }}
              >
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: `${palette.accent}1f`,
                    color: palette.accent,
                  }}
                >
                  <FontAwesomeIcon icon={Icon} className="h-5 w-5" />
                </span>
                <h2 className="text-2xl font-semibold leading-snug tracking-tight" style={{ color: palette.text }}>
                  {service.title}
                </h2>
                <p className="text-[15px] leading-7 flex-1" style={{ color: palette.textMuted }}>
                  {service.body}
                </p>
                {buyerPrice ? (
                  <div className="border-t pt-4 mt-2 flex items-center justify-between" style={{ borderColor: palette.border }}>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>
                        Pricing
                      </p>
                      <p className="text-xl font-semibold" style={{ color: palette.text }}>
                        {buyerPrice}
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-4 w-4 transition group-hover:translate-x-1"
                      style={{ color: palette.accent }}
                    />
                  </div>
                ) : industryPrice ? (
                  <div className="border-t pt-4 mt-2 flex items-center justify-between" style={{ borderColor: palette.border }}>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>
                        Starting at
                      </p>
                      <p className="text-xl font-semibold tabular-nums" style={{ color: palette.text }}>
                        {industryPrice.startingAt}
                        <span className="ml-1 text-xs font-normal" style={{ color: palette.textMuted }}>
                          {industryPrice.unit}
                        </span>
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-4 w-4 transition group-hover:translate-x-1"
                      style={{ color: palette.accent }}
                    />
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>
    </PreviewLayout>
  );
}
