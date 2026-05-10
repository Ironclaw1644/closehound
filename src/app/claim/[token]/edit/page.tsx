import { redirect } from "next/navigation";
import { resolveClaimAuth } from "@/lib/onboarding/session";
import { findPreviewSiteById, type PreviewSiteRow } from "@/lib/onboarding/storage";
import { getSiteOrigin } from "@/lib/preview/seo";
import {
  saveBasicsAction,
  saveAboutAction,
  saveServiceAreaAction,
  saveBrandAction,
  saveDomainAction,
  publishAction,
} from "./actions";
import { ACCENT_PRESET_LIST } from "./constants";
import { PhotosForm } from "./photos-form";
import { DomainForm } from "./domain-form";
import { ServicesForm } from "./services-form";
import { findLeadById } from "@/lib/preview/load";
import { getCopyForIndustry } from "@/lib/preview/copy";
import { getPricingForIndustry } from "@/lib/preview/pricing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit your site",
  robots: { index: false, follow: false },
};

type Tab =
  | "basics"
  | "photos"
  | "about"
  | "services"
  | "service-area"
  | "brand"
  | "domain";
const TABS: { id: Tab; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "photos", label: "Photos" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "service-area", label: "Service Area" },
  { id: "brand", label: "Brand" },
  { id: "domain", label: "Domain" },
];

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ tab?: Tab; published?: string }>;
}) {
  const { token } = await params;
  const { tab: tabRaw, published } = await searchParams;
  const tab: Tab =
    tabRaw && TABS.some((t) => t.id === tabRaw) ? (tabRaw as Tab) : "basics";

  const payload = await resolveClaimAuth(token);
  if (!payload) {
    redirect(`/claim/refresh?status=expired`);
  }
  const site = await findPreviewSiteById(payload.previewSiteId);
  if (!site) {
    redirect(`/claim/refresh?status=not-found`);
  }

  const previewUrl = `${getSiteOrigin()}/preview/${site.slug}`;

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#0e0e0e]">
      <header className="border-b border-black/10 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#6b6b6b]">
              WalkPerro · Editor
            </p>
            <p className="text-[15px] font-semibold tracking-tight">
              {payload.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-black/40"
            >
              Open preview ↗
            </a>
            <PublishButton token={token} site={site} />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 pb-3 text-sm">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <a
                key={t.id}
                href={`/claim/${token}/edit?tab=${t.id}`}
                className="relative pb-2 transition hover:opacity-80"
                style={{
                  color: active ? "#0e0e0e" : "#6b6b6b",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {t.label}
                {active ? (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-[#ebff00]" />
                ) : null}
              </a>
            );
          })}
        </nav>
      </header>

      {published === "1" && site.is_published ? (
        <div className="mx-auto max-w-5xl px-6 pt-6">
          <div className="rounded-2xl bg-[#0fa45a]/10 px-5 py-4 text-sm ring-1 ring-[#0fa45a]/40 text-[#0a6e3c]">
            ✅ Your site is live. Visit{" "}
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              {previewUrl}
            </a>{" "}
            to share it.
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-3xl px-6 py-12">
        {tab === "basics" ? <BasicsTab token={token} site={site} /> : null}
        {tab === "photos" ? (
          <PhotosForm
            token={token}
            initial={{
              gallery:
                ((site.preview_payload as { assets?: { galleryUrls?: string[] } })?.assets
                  ?.galleryUrls as string[]) ?? [],
              hero:
                ((site.preview_payload as { assets?: { heroUrl?: string | null } })?.assets
                  ?.heroUrl as string | null) ?? null,
              logo:
                ((site.preview_payload as { assets?: { logoUrl?: string | null } })?.assets
                  ?.logoUrl as string | null) ?? null,
            }}
          />
        ) : null}
        {tab === "about" ? <AboutTab token={token} site={site} /> : null}
        {tab === "services" ? (
          <ServicesTab token={token} site={site} />
        ) : null}
        {tab === "service-area" ? (
          <ServiceAreaTab token={token} site={site} />
        ) : null}
        {tab === "brand" ? <BrandTab token={token} site={site} /> : null}
        {tab === "domain" ? (
          <DomainForm
            token={token}
            defaultUrl={`${getSiteOrigin()}/preview/${site.slug}`}
            initialDomain={site.custom_domain ?? null}
            initialStatus={
              (site.custom_domain_status as {
                verification?: {
                  type: string;
                  domain: string;
                  value: string;
                  reason?: string;
                } | null;
              } | null) ?? null
            }
            saveAction={saveDomainAction}
          />
        ) : null}
      </main>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Tab components — server-rendered with form actions for save.
// ───────────────────────────────────────────────────────────────────────────

function readBasics(site: PreviewSiteRow) {
  const b = (site.preview_payload?.basics ?? {}) as {
    phone?: string;
    email?: string;
    hours?: string;
    ctaLabel?: string;
  };
  return {
    phone: b.phone ?? "",
    email: b.email ?? site.buyer_email ?? "",
    hours: b.hours ?? "Mon-Fri 8a-6p · Sat 9a-2p · Sun closed",
    ctaLabel: b.ctaLabel ?? "Call now",
  };
}

function BasicsTab({ token, site }: { token: string; site: PreviewSiteRow }) {
  const data = readBasics(site);
  return (
    <form
      action={saveBasicsAction.bind(null, token)}
      className="flex flex-col gap-5 rounded-3xl bg-white p-8 ring-1 ring-black/10"
    >
      <h2 className="text-2xl font-semibold tracking-tight">Basics</h2>
      <p className="text-sm text-[#6b6b6b]">
        How customers reach you. This appears in the header, footer, and contact page.
      </p>

      <Field label="Phone" name="phone" defaultValue={data.phone} placeholder="(555) 123-4567" />
      <Field label="Email" name="email" type="email" defaultValue={data.email} placeholder="hello@example.com" />
      <Field
        label="Hours (free text)"
        name="hours"
        defaultValue={data.hours}
        placeholder="Mon-Fri 8a-6p"
      />
      <Field
        label="Primary CTA label"
        name="ctaLabel"
        defaultValue={data.ctaLabel}
        placeholder="Call now"
      />
      <SaveButton />
    </form>
  );
}

function readAbout(site: PreviewSiteRow) {
  const a = (site.preview_payload?.about ?? {}) as {
    story?: string;
    tagline?: string;
  };
  return {
    story: a.story ?? "",
    tagline: a.tagline ?? "",
  };
}

function AboutTab({ token, site }: { token: string; site: PreviewSiteRow }) {
  const data = readAbout(site);
  return (
    <form
      action={saveAboutAction.bind(null, token)}
      className="flex flex-col gap-5 rounded-3xl bg-white p-8 ring-1 ring-black/10"
    >
      <h2 className="text-2xl font-semibold tracking-tight">About</h2>
      <p className="text-sm text-[#6b6b6b]">
        A short tagline + 2–3 paragraphs about your business. Anchors the About page.
      </p>

      <Field
        label="Tagline"
        name="tagline"
        defaultValue={data.tagline}
        placeholder="Roofs that outlast the warranty."
      />
      <TextareaField
        label="Story"
        name="story"
        defaultValue={data.story}
        rows={10}
        placeholder="Tell visitors who you are, what you stand for, why they should hire you. 2–3 paragraphs is plenty."
      />
      <SaveButton />
    </form>
  );
}

async function ServicesTab({ token, site }: { token: string; site: PreviewSiteRow }) {
  // Resolve the base services from the lead's industry copy. We do this
  // directly instead of via loadPreviewBySlug because that helper calls
  // notFound() on failure, which gets caught by Next's nearest error boundary
  // and replaces the entire form with a 404 fallback.
  const lead = site.lead_id ? await findLeadById(site.lead_id) : null;
  const industry = (lead?.industry ?? "handyman") as Parameters<typeof getCopyForIndustry>[0];
  const baseItems = getCopyForIndustry(industry).services.items.map((b) => ({
    title: b.title,
    body: b.body,
  }));
  const industryPricing = getPricingForIndustry(industry);
  const industryDefaultPrices = industryPricing.map((p) => p.startingAt);

  const overrides =
    (
      site.preview_payload as {
        services?: {
          items?: Array<{
            title?: string | null;
            body?: string | null;
            price?: string | null;
          }>;
        };
      } | null
    )?.services?.items ?? [];

  // Compose initial rows: base rows (with overrides layered on) + any
  // buyer-added rows beyond base.length. Buyer-added rows show their saved
  // values verbatim — empty title means it'll be filtered out on save.
  const baseRows = baseItems.map((b, i) => ({
    title: overrides[i]?.title?.trim() || b.title,
    body: overrides[i]?.body?.trim() || b.body,
    price: overrides[i]?.price?.trim() || "",
  }));
  const extraRows = overrides.slice(baseItems.length).map((ov) => ({
    title: ov?.title?.trim() ?? "",
    body: ov?.body?.trim() ?? "",
    price: ov?.price?.trim() ?? "",
  }));
  const initialRows = [...baseRows, ...extraRows];

  return (
    <ServicesForm
      token={token}
      baseItems={baseItems}
      initialRows={initialRows}
      industryDefaultPrices={industryDefaultPrices}
    />
  );
}

function readServiceArea(site: PreviewSiteRow) {
  const sa = (site.preview_payload?.serviceArea ?? {}) as { cities?: string[] };
  return { cities: (sa.cities ?? []).join("\n") };
}

function ServiceAreaTab({ token, site }: { token: string; site: PreviewSiteRow }) {
  const data = readServiceArea(site);
  return (
    <form
      action={saveServiceAreaAction.bind(null, token)}
      className="flex flex-col gap-5 rounded-3xl bg-white p-8 ring-1 ring-black/10"
    >
      <h2 className="text-2xl font-semibold tracking-tight">Service Area</h2>
      <p className="text-sm text-[#6b6b6b]">
        Cities you serve. One per line, or comma-separated. These show on your service-area page and in your structured data.
      </p>

      <TextareaField
        label="Cities served"
        name="cities"
        defaultValue={data.cities}
        rows={8}
        placeholder={`Austin
Round Rock
Cedar Park
Pflugerville`}
      />
      <SaveButton />
    </form>
  );
}

function readBrand(site: PreviewSiteRow) {
  const b = (site.preview_payload?.brand ?? {}) as { accent?: string };
  return { accent: b.accent ?? "#e8761a" };
}

function BrandTab({ token, site }: { token: string; site: PreviewSiteRow }) {
  const data = readBrand(site);
  return (
    <form
      action={saveBrandAction.bind(null, token)}
      className="flex flex-col gap-5 rounded-3xl bg-white p-8 ring-1 ring-black/10"
    >
      <h2 className="text-2xl font-semibold tracking-tight">Brand</h2>
      <p className="text-sm text-[#6b6b6b]">
        Pick the accent color used for buttons, links, and highlights.
      </p>

      <fieldset className="grid grid-cols-7 gap-3">
        {ACCENT_PRESET_LIST.map((c) => (
          <label key={c} className="cursor-pointer">
            <input
              type="radio"
              name="accent"
              value={c}
              defaultChecked={c === data.accent}
              className="peer sr-only"
            />
            <div
              className="h-12 w-full rounded-xl ring-1 ring-black/10 transition peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-[#0e0e0e]"
              style={{ background: c }}
              title={c}
            />
          </label>
        ))}
      </fieldset>

      <SaveButton />
    </form>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Shared form primitives
// ───────────────────────────────────────────────────────────────────────────

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6b6b]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-xl bg-[#f5f1e8] px-4 py-3 text-base ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-[#ebff00]"
      />
    </label>
  );
}

function TextareaField({
  label,
  name,
  defaultValue,
  rows = 5,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6b6b]">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="resize-y rounded-xl bg-[#f5f1e8] px-4 py-3 text-base leading-7 ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-[#ebff00]"
      />
    </label>
  );
}

function SaveButton() {
  return (
    <button
      type="submit"
      className="mt-2 inline-flex items-center justify-center self-start rounded-full bg-[#0e0e0e] px-6 py-3 text-sm font-semibold text-[#ebff00] transition hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
    >
      Save changes
    </button>
  );
}

function PublishButton({ token, site }: { token: string; site: PreviewSiteRow }) {
  return (
    <form action={publishAction.bind(null, token)}>
      <button
        type="submit"
        disabled={site.is_published}
        className="inline-flex items-center justify-center rounded-full bg-[#ebff00] px-5 py-2 text-sm font-semibold text-[#0e0e0e] transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {site.is_published ? "Published" : "Publish"}
      </button>
    </form>
  );
}
