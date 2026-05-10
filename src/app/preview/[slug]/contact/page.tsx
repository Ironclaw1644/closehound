import type { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faCheck } from "@fortawesome/free-solid-svg-icons";
import { loadPreviewBySlug } from "@/lib/preview/load";
import { PreviewLayout } from "@/components/preview/multipage/PreviewLayout";
import { JsonLd } from "@/components/preview/JsonLd";
import { ContactForm } from "@/components/preview/ContactForm";
import { getPaletteForModel } from "@/lib/preview/palettes";
import {
  previewHomeUrl,
  previewContactUrl,
  INDUSTRY_DISPLAY,
} from "@/lib/preview/multipage";
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
    return {
      title: `Contact · ${model.business.name}`,
      description: `Call ${
        model.business.phoneDisplay ?? "us"
      } or send us your details. ${
        model.business.city ?? ""
      } ${INDUSTRY_DISPLAY[model.industry].toLowerCase()}.`,
      alternates: { canonical: `/preview/${slug}/contact` },
      openGraph: {
        type: "website",
        title: `${model.business.name} · Contact`,
        description: model.contact.body,
      },
    };
  } catch {
    return { title: "Contact not found", robots: { index: false, follow: false } };
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await loadPreviewBySlug(slug);
  const palette = getPaletteForModel(model);

  const origin = getSiteOrigin();
  const localBusinessId = `${origin}/preview/${slug}#business`;
  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${origin}/preview/${slug}/contact`,
    name: `Contact · ${model.business.name}`,
    description: model.contact.body,
    mainEntity: { "@id": localBusinessId },
  };

  const cityLabel = model.business.city ?? "Your area";
  // Prefer buyer override hours (free-text). Fall back to default M-F/Sat/Sun rows.
  const hours: { day: string; hours: string }[] = model.business.hours
    ? [{ day: "Hours", hours: model.business.hours }]
    : [
        { day: "Mon – Fri", hours: "8:00a – 6:00p" },
        { day: "Saturday", hours: "9:00a – 2:00p" },
        { day: "Sunday", hours: "Closed" },
      ];
  const buyerEmail = model.business.email;
  const trustBadges = [
    "Licensed & insured",
    "Local & family-owned",
    "Same-day response",
  ];

  return (
    <PreviewLayout
      model={model}
      active="contact"
      breadcrumbs={[
        { label: model.business.name, href: previewHomeUrl(slug) },
        { label: "Contact", href: previewContactUrl(slug) },
      ]}
    >
      <JsonLd data={contactPageJsonLd} id="contact-page-jsonld" />

      {/* A. Phone-first hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-10 sm:px-8 sm:pt-24 sm:pb-14">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: palette.accent }}
        >
          Contact
        </p>

        {model.business.phoneTelHref && model.business.phoneDisplay ? (
          <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <a
              href={model.business.phoneTelHref}
              aria-label={`Call ${model.business.phoneDisplay}`}
              className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full transition hover:scale-105 sm:h-24 sm:w-24"
              style={{
                background: palette.accent,
                color: palette.accentInk,
                boxShadow: `0 18px 40px ${palette.accent}33`,
              }}
            >
              <FontAwesomeIcon icon={faPhone} className="h-8 w-8 sm:h-10 sm:w-10" />
            </a>
            <div>
              <p
                className="text-sm font-medium uppercase tracking-[0.2em]"
                style={{ color: palette.textMuted }}
              >
                Tap to call
              </p>
              <a
                href={model.business.phoneTelHref}
                className="mt-2 block text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-6xl"
                style={{ color: palette.text }}
              >
                {model.business.phoneDisplay}
              </a>
            </div>
          </div>
        ) : (
          <h1
            className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
            style={{ color: palette.text }}
          >
            Get in touch
          </h1>
        )}

        <p
          className="mt-6 max-w-2xl text-base leading-7 sm:text-lg"
          style={{ color: palette.textMuted }}
        >
          {model.contact.body}
        </p>
      </section>

      {/* B. Two-column: form + hours/address */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT: form */}
          <div
            className="rounded-[24px] p-7 sm:p-9"
            style={{
              background: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ color: palette.text }}
            >
              Send us your details
            </h2>
            <p
              className="mt-2 text-sm leading-6"
              style={{ color: palette.textMuted }}
            >
              We respond same-day, Mon – Sat.
            </p>

            {/* Real-backend contact form. POSTs to /api/preview/<slug>/contact
                which Resend-emails the buyer's email (set via the editor's
                Basics tab) — falls back to hello@walkperro.com if the buyer
                hasn't published one yet. Client-side validation; success state
                replaces the form inline. */}
            <ContactForm
              slug={slug}
              businessName={model.business.name}
              palette={{
                background: palette.background,
                surface: palette.surface,
                border: palette.border,
                text: palette.text,
                textMuted: palette.textMuted,
                accent: palette.accent,
                accentInk: palette.accentInk,
              }}
            />
          </div>

          {/* RIGHT: hours + address + badge */}
          <div className="flex flex-col gap-6">
            <div
              className="rounded-[24px] p-7 sm:p-9"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <h2
                className="text-2xl font-semibold tracking-tight"
                style={{ color: palette.text }}
              >
                Hours
              </h2>
              <table className="mt-5 w-full text-[15px]">
                <tbody>
                  {hours.map((row) => (
                    <tr
                      key={row.day}
                      className="border-t first:border-t-0"
                      style={{ borderColor: palette.border }}
                    >
                      <th
                        scope="row"
                        className="py-3 pr-4 text-left font-medium"
                        style={{ color: palette.text }}
                      >
                        {row.day}
                      </th>
                      <td
                        className="py-3 text-right tabular-nums"
                        style={{ color: palette.textMuted }}
                      >
                        {row.hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="rounded-[24px] p-7 sm:p-9"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <h2
                className="text-2xl font-semibold tracking-tight"
                style={{ color: palette.text }}
              >
                Visit us
              </h2>
              <address
                className="mt-3 not-italic text-[15px] leading-7"
                style={{ color: palette.textMuted }}
              >
                {model.business.name}
                {model.business.city ? (
                  <>
                    <br />
                    Serving {model.business.city} & nearby
                  </>
                ) : null}
                {model.business.phoneTelHref && model.business.phoneDisplay ? (
                  <>
                    <br />
                    <a
                      href={model.business.phoneTelHref}
                      style={{ color: palette.accent }}
                    >
                      {model.business.phoneDisplay}
                    </a>
                  </>
                ) : null}
                {buyerEmail ? (
                  <>
                    <br />
                    <a
                      href={`mailto:${buyerEmail}`}
                      style={{ color: palette.accent }}
                    >
                      {buyerEmail}
                    </a>
                  </>
                ) : null}
              </address>
            </div>

            <div
              className="inline-flex items-center gap-3 self-start rounded-full px-5 py-2.5"
              style={{
                background: `${palette.accent}1f`,
                color: palette.accent,
                border: `1px solid ${palette.accent}33`,
              }}
            >
              <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
              <span className="text-[12px] font-semibold uppercase tracking-[0.22em]">
                Same-day response
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* C. Map placeholder — CSS-only grid pattern */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div
          className="relative h-64 w-full overflow-hidden rounded-[24px] sm:h-80"
          style={{
            background: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
          aria-label={`Map of ${cityLabel}`}
          role="img"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent 0 39px, ${palette.border} 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, ${palette.border} 39px 40px)`,
              opacity: 0.6,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(420px 200px at 50% 50%, ${palette.accent}26, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: palette.accent,
                  color: palette.accentInk,
                  boxShadow: `0 8px 20px ${palette.accent}55`,
                }}
              >
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
              </span>
              <p
                className="text-lg font-semibold tracking-tight"
                style={{ color: palette.text }}
              >
                {cityLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* D. Trust strip */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="grid gap-3 sm:grid-cols-3">
          {trustBadges.map((label) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: `${palette.accent}1f`,
                  color: palette.accent,
                }}
              >
                <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
              </span>
              <span
                className="text-[14px] font-semibold tracking-tight"
                style={{ color: palette.text }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </PreviewLayout>
  );
}
