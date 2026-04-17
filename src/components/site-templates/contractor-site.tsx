import type { CSSProperties } from "react";
import Image from "next/image";

import type {
  ContractorLocation,
  ContractorMediaAsset,
  ContractorSiteData,
} from "@/lib/site-templates/contractor";

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--contractor-accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--contractor-heading)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-[var(--contractor-muted)] sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function ContactPill({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="rounded-full border border-white/14 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/24 hover:bg-white/10"
    >
      {label}
    </a>
  );
}

function LocationCard({
  location,
  variant = "dark",
}: {
  location: ContractorLocation;
  variant?: "dark" | "light";
}) {
  const containerClass =
    variant === "dark"
      ? "border-white/10 bg-white/5"
      : "border-[var(--contractor-border)] bg-[var(--contractor-surface)]";
  const labelClass =
    variant === "dark" ? "text-white/52" : "text-[var(--contractor-muted)]";
  const bodyClass =
    variant === "dark" ? "text-white/78" : "text-[var(--contractor-body)]";

  return (
    <div className={`rounded-[24px] border px-5 py-5 ${containerClass}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${labelClass}`}>
        {location.label}
      </p>
      <div className={`mt-3 space-y-1 text-sm leading-7 ${bodyClass}`}>
        {location.addressLine1 ? <p>{location.addressLine1}</p> : null}
        <p>
          {location.city}, {location.state}
          {location.postalCode ? ` ${location.postalCode}` : ""}
        </p>
      </div>
    </div>
  );
}

function MediaTile({
  asset,
  className,
  priority = false,
}: {
  asset: ContractorMediaAsset;
  className: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={asset.src} alt={asset.alt} fill priority={priority} className="object-cover" />
    </div>
  );
}

function buildPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function formatLocationSummary(location: ContractorLocation) {
  return `${location.city}, ${location.state}`;
}

function buildCoverageSummary(locations: ContractorLocation[]) {
  if (locations.length === 0) {
    return null;
  }

  if (locations.length === 1) {
    return formatLocationSummary(locations[0]);
  }

  return locations.map((location) => formatLocationSummary(location)).join(" and ");
}

export function ContractorSiteTemplate({
  data,
  previewLabel,
}: {
  data: ContractorSiteData;
  previewLabel?: string;
}) {
  const theme = data.branding.theme;
  const pageStyle = {
    "--contractor-background": theme.pageBackground,
    "--contractor-gradient": theme.pageGradient,
    "--contractor-surface": theme.surface,
    "--contractor-surface-alt": theme.surfaceAlt,
    "--contractor-surface-strong": theme.surfaceStrong,
    "--contractor-hero-panel": theme.heroPanel,
    "--contractor-hero-text": theme.heroText,
    "--contractor-heading": theme.heading,
    "--contractor-body": theme.body,
    "--contractor-muted": theme.muted,
    "--contractor-accent": theme.accent,
    "--contractor-accent-strong": theme.accentStrong,
    "--contractor-accent-soft": theme.accentSoft,
    "--contractor-border": theme.border,
    "--contractor-footer": theme.footerBackground,
  } as CSSProperties;

  return (
    <main
      style={pageStyle}
      className="min-h-screen bg-[var(--contractor-background)] text-[var(--contractor-body)]"
    >
      <div
        className="min-h-screen"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,34,52,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,34,52,0.03) 1px, transparent 1px), var(--contractor-gradient)",
          backgroundSize: "56px 56px, 56px 56px, auto",
        }}
      >
        <header className="sticky top-0 z-20 border-b border-[var(--contractor-border)] bg-white/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <a href="#" className="min-w-0">
              <div className="flex items-center gap-4">
                {data.company.logo ? (
                  <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-[var(--contractor-border)] bg-white">
                    <Image
                      src={data.company.logo.src}
                      alt={data.company.logo.alt}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--contractor-surface-strong)] text-sm font-semibold text-white">
                    {data.company.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold tracking-tight text-[var(--contractor-heading)] sm:text-2xl">
                    {data.company.name}
                  </p>
                  <p className="text-sm text-[var(--contractor-muted)] sm:text-base">
                    {data.branding.headerTitle}
                  </p>
                </div>
              </div>
            </a>

            <div className="flex flex-col gap-4 lg:items-end">
              <nav
                aria-label="Contractor preview navigation"
                className="flex flex-wrap gap-2 lg:justify-end"
              >
                {data.branding.navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-[var(--contractor-border)] bg-white/72 px-3.5 py-2 text-sm font-medium text-[var(--contractor-heading)] transition hover:border-[var(--contractor-accent)] hover:text-[var(--contractor-accent)]"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {previewLabel ? (
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--contractor-muted)]">
                  {previewLabel}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <section className="overflow-hidden rounded-[32px] border border-[var(--contractor-border)] bg-white shadow-[0_24px_80px_rgba(11,26,41,0.08)]">
            <div className="grid gap-0 lg:grid-cols-[1.06fr_0.94fr]">
              <div className="bg-[var(--contractor-surface-strong)] px-6 py-10 text-[var(--contractor-hero-text)] sm:px-10 sm:py-14">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
                  {data.hero.eyebrow}
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  {data.hero.headline}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  {data.hero.body}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#contact"
                    className="rounded-full bg-[var(--contractor-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--contractor-accent-strong)]"
                  >
                    {data.branding.primaryCtaLabel}
                  </a>
                  <a
                    href="#services"
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-200/40"
                  >
                    {data.branding.secondaryCtaLabel}
                  </a>
                </div>

                <dl className="mt-10 grid gap-4 sm:grid-cols-3">
                  {data.hero.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <dt className="text-sm text-slate-300">{stat.label}</dt>
                      <dd className="mt-2 text-2xl font-semibold">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="grid gap-0 bg-[var(--contractor-surface-alt)] sm:grid-cols-2 lg:grid-cols-1">
                <MediaTile
                  asset={data.hero.image}
                  className="min-h-[280px] sm:min-h-[320px] lg:min-h-[380px]"
                  priority
                />
                <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-2">
                  {data.hero.supportingImages.slice(0, 2).map((image, index) => (
                    <MediaTile
                      key={`${image.src}-${index}`}
                      asset={image}
                      className="min-h-[220px]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="services"
            className="mt-16 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start"
          >
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Services"
                title={data.services.heading}
                description={data.services.body}
              />
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.hero.trustItems.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-[var(--contractor-border)] bg-white px-5 py-4 text-base font-medium text-[var(--contractor-heading)] shadow-[0_18px_60px_rgba(11,26,41,0.06)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {data.services.items.map((service) => (
                <article
                  key={service.title}
                  className="rounded-[24px] border border-[var(--contractor-border)] bg-white p-6 shadow-[0_18px_60px_rgba(11,26,41,0.06)]"
                >
                  <h3 className="text-lg font-semibold text-[var(--contractor-heading)]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--contractor-muted)]">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="about"
            className="mt-16 rounded-[32px] border border-[var(--contractor-border)] bg-white px-6 py-8 shadow-[0_24px_80px_rgba(11,26,41,0.06)] sm:px-8 sm:py-10"
          >
            <SectionHeading
              eyebrow="About / Trust"
              title={data.trust.heading}
              description={data.trust.body}
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[28px] border border-[var(--contractor-border)] bg-[var(--contractor-surface-strong)] px-6 py-7 text-white shadow-[0_24px_80px_rgba(11,26,41,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
                  {data.trust.highlight.eyebrow}
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  {data.trust.highlight.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-300">
                  {data.trust.highlight.body}
                </p>
                {data.trust.highlight.quote ? (
                  <blockquote className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-base leading-8 text-slate-200">
                    “{data.trust.highlight.quote}”
                  </blockquote>
                ) : null}
                {data.trust.highlight.attribution ? (
                  <p className="mt-4 text-sm text-sky-100/80">
                    {data.trust.highlight.attribution}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5">
                {data.trust.highlight.image ? (
                  <div className="overflow-hidden rounded-[28px] border border-[var(--contractor-border)] bg-white shadow-[0_24px_80px_rgba(11,26,41,0.08)]">
                    <MediaTile
                      asset={data.trust.highlight.image}
                      className="min-h-[240px] sm:min-h-[300px]"
                    />
                  </div>
                ) : null}

                <div className="grid gap-4">
                  {data.trust.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-[var(--contractor-border)] bg-[var(--contractor-surface)] px-5 py-5 text-sm leading-7 text-[var(--contractor-body)] shadow-[0_18px_50px_rgba(11,26,41,0.05)]"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="projects" className="mt-16 space-y-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Projects"
                title={data.gallery.heading}
                description={data.gallery.body}
              />
              <div className="inline-flex w-fit rounded-full bg-[var(--contractor-accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--contractor-accent)]">
                {data.company.serviceArea.join(" / ")}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {data.gallery.images.map((item) => (
                <figure
                  key={item.title}
                  className="overflow-hidden rounded-2xl border border-[var(--contractor-border)] bg-white shadow-[0_18px_60px_rgba(11,26,41,0.08)]"
                >
                  <MediaTile asset={item.image} className="aspect-[4/3]" />
                  <figcaption className="space-y-2 px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-[var(--contractor-heading)]">
                        {item.title}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--contractor-muted)]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-[var(--contractor-muted)]">
                      {item.caption}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section id="contact" className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[32px] border border-white/8 bg-[var(--contractor-footer)] px-6 py-8 text-white shadow-[0_24px_80px_rgba(11,26,41,0.16)] sm:px-8 sm:py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
                Contact / Locations
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {data.contact.heading}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                {data.contact.body}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ContactPill
                  href={buildPhoneHref(data.company.phone)}
                  label={`${data.contact.primaryCtaLabel}: ${data.company.phone}`}
                />
                <ContactPill
                  href={`mailto:${data.company.email}`}
                  label={data.contact.secondaryCtaLabel}
                />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/52">
                    Email
                  </p>
                  <p className="mt-3 text-lg font-medium text-white">{data.company.email}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/52">
                    Service Area
                  </p>
                  <p className="mt-3 text-base font-medium leading-7 text-white">
                    {data.company.serviceArea.join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[var(--contractor-border)] bg-white px-6 py-8 shadow-[0_24px_80px_rgba(11,26,41,0.08)] sm:px-8 sm:py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--contractor-accent)]">
                Office Footprint
              </p>
              <div className="mt-6 grid gap-4">
                <LocationCard location={data.company.primaryLocation} variant="light" />
                {data.company.additionalLocations.map((location) => (
                  <LocationCard
                    key={`${location.label}-${location.city}`}
                    location={location}
                    variant="light"
                  />
                ))}
              </div>

              <div className="mt-8 rounded-[24px] border border-[var(--contractor-border)] bg-[var(--contractor-accent-soft)] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--contractor-accent)]">
                  Best Fit
                </p>
                <p className="mt-3 text-base leading-8 text-[var(--contractor-body)]">
                  {data.company.name} is positioned for work centered around{" "}
                  {formatLocationSummary(data.company.primaryLocation)} with supporting reach into{" "}
                  {buildCoverageSummary(data.company.additionalLocations) ??
                    data.company.serviceArea.join(", ")}
                  .
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer className="border-t border-white/8 bg-[var(--contractor-footer)] text-slate-200">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-white">
                  {data.company.name}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{data.footer.summary}</p>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <p className="font-semibold text-white">{data.company.primaryLocation.label}</p>
                {data.company.primaryLocation.addressLine1 ? (
                  <p>{data.company.primaryLocation.addressLine1}</p>
                ) : null}
                <p>
                  {data.company.primaryLocation.city}, {data.company.primaryLocation.state}
                  {data.company.primaryLocation.postalCode
                    ? ` ${data.company.primaryLocation.postalCode}`
                    : ""}
                </p>
                <p>
                  Phone:{" "}
                  <a
                    className="text-white underline decoration-slate-500 underline-offset-4"
                    href={buildPhoneHref(data.company.phone)}
                  >
                    {data.company.phone}
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a
                    className="text-white underline decoration-slate-500 underline-offset-4"
                    href={`mailto:${data.company.email}`}
                  >
                    {data.company.email}
                  </a>
                </p>
                {data.footer.note ? <p>{data.footer.note}</p> : null}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
                  Site
                </h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {data.branding.navItems.map((item) => (
                    <li key={item.href}>
                      <a className="hover:text-white" href={item.href}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
                  {data.footer.coverageHeading}
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {data.footer.coverageItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
