import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faArrowRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { loadPreviewBySlug } from "@/lib/preview/load";
import { PreviewLayout } from "@/components/preview/multipage/PreviewLayout";
import { JsonLd } from "@/components/preview/JsonLd";
import { ICON_MAP } from "@/components/preview/icon-map";
import { getPaletteForModel } from "@/lib/preview/palettes";
import {
  serviceSlug,
  findServiceBySlug,
  otherServices,
  previewHomeUrl,
  previewServicesUrl,
  previewServiceUrl,
  INDUSTRY_DISPLAY,
} from "@/lib/preview/multipage";
import { getProcessForIndustry } from "@/lib/preview/service-process";
import { getPricingForIndustry } from "@/lib/preview/pricing";
import { absoluteUrl, getSiteOrigin } from "@/lib/preview/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; serviceSlug: string }>;
}): Promise<Metadata> {
  const { slug, serviceSlug: svc } = await params;
  try {
    const model = await loadPreviewBySlug(slug);
    const found = findServiceBySlug(model, svc);
    if (!found) return { title: "Service not found", robots: { index: false, follow: false } };
    const display = INDUSTRY_DISPLAY[model.industry];
    const cityPart = model.business.city ? ` in ${model.business.city}` : "";
    return {
      title: `${found.service.title} · ${model.business.name}`,
      description: `${found.service.title}${cityPart} — ${found.service.body.slice(0, 140)}`,
      alternates: { canonical: `/preview/${slug}/services/${svc}` },
      openGraph: {
        type: "website",
        title: `${found.service.title} · ${display}`,
        description: found.service.body,
      },
    };
  } catch {
    return { title: "Service not found", robots: { index: false, follow: false } };
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string; serviceSlug: string }>;
}) {
  const { slug, serviceSlug: svc } = await params;
  const model = await loadPreviewBySlug(slug);
  const found = findServiceBySlug(model, svc);
  if (!found) notFound();

  const palette = getPaletteForModel(model);
  const process = getProcessForIndustry(model.industry);
  const pricing = getPricingForIndustry(model.industry);
  const price = pricing[found.index];
  const others = otherServices(model, found.index);

  // Pick a deterministic stock photo for the service hero
  const heroIdx = found.index % Math.max(model.assets.galleryUrls.length, 1);
  const heroPhoto =
    model.assets.galleryUrls[heroIdx] ?? model.assets.heroUrl ?? null;

  // FAQ subset (just the first 3 stock FAQs — feels relevant for any service)
  const faqs = model.faq.items.slice(0, 3);

  // Service JSON-LD
  const origin = getSiteOrigin();
  const url = `${origin}/preview/${slug}/services/${svc}`;
  const businessId = `${origin}/preview/${slug}#business`;
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: found.service.title,
    serviceType: found.service.title,
    description: found.service.body,
    provider: { "@id": businessId },
    areaServed: model.business.city
      ? { "@type": "City", name: model.business.city }
      : undefined,
    offers: price
      ? {
          "@type": "Offer",
          priceSpecification: {
            "@type": "PriceSpecification",
            price: price.startingAt,
            priceCurrency: "USD",
          },
          availability: "https://schema.org/InStock",
        }
      : undefined,
    url,
  };

  const faqLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <PreviewLayout
      model={model}
      active="services"
      breadcrumbs={[
        { label: model.business.name, href: previewHomeUrl(slug) },
        { label: "Services", href: previewServicesUrl(slug) },
        { label: found.service.title, href: previewServiceUrl(slug, svc) },
      ]}
    >
      <JsonLd data={serviceLd} id="service-jsonld" />
      {faqLd ? <JsonLd data={faqLd} id="service-faq-jsonld" /> : null}

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: palette.accent }}>
              {INDUSTRY_DISPLAY[model.industry]} · Service
            </p>
            <h1
              className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
              style={{ color: palette.text }}
            >
              {found.service.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 sm:text-lg" style={{ color: palette.textMuted }}>
              {found.service.body}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {model.business.phoneDisplay ? (
                <a
                  href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                  className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
                  style={{
                    background: palette.accent,
                    color: palette.accentInk,
                    boxShadow: `0 3px 0 ${palette.inkBg}33, 0 14px 28px ${palette.accent}44`,
                  }}
                >
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 transition group-hover:rotate-[-12deg]" />
                  Call now
                </a>
              ) : null}
              <Link
                href={`${previewHomeUrl(slug)}#contact`}
                className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  background: palette.surface,
                  color: palette.text,
                  border: `1px solid ${palette.border}`,
                }}
              >
                Get a quote
                <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 transition group-hover:translate-x-1" />
              </Link>
            </div>
            {price ? (
              <div className="mt-8 inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm" style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.text }}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>Starting at</span>
                <span className="font-semibold tabular-nums">{price.startingAt}</span>
                <span style={{ color: palette.textMuted }}>·</span>
                <span style={{ color: palette.textMuted }}>{price.unit}</span>
                {price.notes ? (
                  <>
                    <span style={{ color: palette.textMuted }}>·</span>
                    <span className="text-xs" style={{ color: palette.textMuted }}>{price.notes}</span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {heroPhoto ? (
            <div className="overflow-hidden rounded-[28px]" style={{ border: `1px solid ${palette.border}`, boxShadow: `0 30px 80px ${palette.inkBg}28` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroPhoto}
                alt={`${model.business.name} ${found.service.title}`}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* How we do it */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20" style={{ borderTop: `1px solid ${palette.border}` }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: palette.accent }}>
          How we do it
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: palette.text }}>
          Four steps. No surprises.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl p-6"
              style={{ background: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <p className="text-[24px] font-semibold tabular-nums tracking-tight" style={{ color: palette.accent }}>
                {step.step}
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug" style={{ color: palette.text }}>{step.title}</p>
              <p className="mt-2 text-sm leading-6" style={{ color: palette.textMuted }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 ? (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20" style={{ borderTop: `1px solid ${palette.border}` }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: palette.accent }}>
            Common questions
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: palette.text }}>
            About this service
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl"
                style={{ background: palette.surface, border: `1px solid ${palette.border}` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold tracking-tight">
                  <span style={{ color: palette.text }}>{f.question}</span>
                  <span
                    className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm transition group-open:rotate-45"
                    style={{ background: palette.background, color: palette.accent, border: `1px solid ${palette.border}` }}
                  >
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-7" style={{ color: palette.textMuted }}>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Other services */}
      {others.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20" style={{ borderTop: `1px solid ${palette.border}` }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: palette.accent }}>
            Also handled by {model.business.name}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: palette.text }}>
            Other services
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {others.map((service, idx) => {
              const Icon = ICON_MAP[service.icon] ?? ICON_MAP["circle-check"];
              return (
                <Link
                  key={service.title}
                  href={previewServiceUrl(slug, serviceSlug(service.title))}
                  className="group flex items-start gap-4 rounded-2xl p-6 transition hover:-translate-y-0.5"
                  style={{ background: palette.surface, border: `1px solid ${palette.border}` }}
                >
                  <span
                    className="flex h-12 w-12 flex-none items-center justify-center rounded-xl"
                    style={{ background: `${palette.accent}1f`, color: palette.accent }}
                  >
                    <FontAwesomeIcon icon={Icon} className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-semibold leading-tight" style={{ color: palette.text }}>
                      {service.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-6" style={{ color: palette.textMuted }}>
                      {service.body.slice(0, 110)}…
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="mt-2 h-3.5 w-3.5 flex-none transition group-hover:translate-x-1"
                    style={{ color: palette.accent }}
                  />
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Contact CTA strip */}
      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8"
        style={{ borderTop: `1px solid ${palette.border}` }}
      >
        <div
          className="flex flex-col items-start justify-between gap-6 rounded-[28px] p-8 sm:flex-row sm:items-center sm:p-12"
          style={{ background: palette.inkBg, color: palette.inkText }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: palette.accent }}>
              Ready when you are
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
              Let's get this booked.
            </p>
          </div>
          {model.business.phoneDisplay ? (
            <a
              href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
              className="group inline-flex items-center gap-3 rounded-full px-6 py-4 text-base font-semibold transition hover:-translate-y-0.5"
              style={{ background: palette.accent, color: palette.accentInk }}
            >
              <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
              {model.business.phoneDisplay}
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </a>
          ) : null}
        </div>
      </section>
    </PreviewLayout>
  );
}
