function slugifyPart(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || null;
}

export function buildPreviewSlug({
  companyName,
  city,
  leadId,
}: {
  companyName: string;
  city: string | null;
  leadId: string;
}) {
  const companySlug = slugifyPart(companyName) ?? "lead";
  const citySlug = slugifyPart(city);
  const idSuffix = leadId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(-6) || "preview";

  return [companySlug, citySlug, idSuffix].filter(Boolean).join("-");
}

export function buildPreviewPath(slug: string) {
  return `/preview/${slug}`;
}

function normalizeOrigin(value: string | undefined) {
  return value?.trim()?.replace(/\/+$/, "") || null;
}

export function buildPreviewUrl(slug: string) {
  const siteOrigin =
    normalizeOrigin(process.env.PREVIEW_SITE) ?? normalizeOrigin(process.env.NEXT_PUBLIC_SITE);
  const previewPath = buildPreviewPath(slug);

  if (siteOrigin) {
    return `${siteOrigin}${previewPath}`;
  }

  return previewPath;
}
