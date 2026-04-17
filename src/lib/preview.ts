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

const PREVIEW_ROUTE_PATTERN = /^\/preview\/[^/]+\/?$/i;
const LEGACY_PREVIEW_HOSTS = new Set(["closehound.com", "www.closehound.com"]);

export function getPreferredPreviewOrigin() {
  return (
    normalizeOrigin(process.env.PREVIEW_SITE) ?? normalizeOrigin(process.env.NEXT_PUBLIC_SITE)
  );
}

function normalizePreviewPath(pathname: string) {
  if (!PREVIEW_ROUTE_PATTERN.test(pathname)) {
    return null;
  }

  return pathname.replace(/\/+$/, "");
}

export function extractPreviewPath(previewUrl: string) {
  const trimmed = previewUrl.trim();

  if (!trimmed) {
    return null;
  }

  const normalizedPath = normalizePreviewPath(trimmed);

  if (normalizedPath) {
    return normalizedPath;
  }

  try {
    return normalizePreviewPath(new URL(trimmed).pathname);
  } catch {
    return null;
  }
}

export function normalizePreviewUrl(previewUrl: string) {
  const previewPath = extractPreviewPath(previewUrl);

  if (!previewPath) {
    return previewUrl;
  }

  const preferredOrigin = getPreferredPreviewOrigin();

  if (!preferredOrigin) {
    return previewPath;
  }

  return `${preferredOrigin}${previewPath}`;
}

export function shouldRepairStoredPreviewUrl(previewUrl: string) {
  const preferredOrigin = getPreferredPreviewOrigin();

  if (!preferredOrigin) {
    return false;
  }

  try {
    const parsed = new URL(previewUrl);
    const previewPath = normalizePreviewPath(parsed.pathname);

    if (!previewPath || !LEGACY_PREVIEW_HOSTS.has(parsed.hostname.toLowerCase())) {
      return false;
    }

    return `${preferredOrigin}${previewPath}` !== previewUrl;
  } catch {
    return false;
  }
}

export function buildPreviewUrl(slug: string) {
  const siteOrigin = getPreferredPreviewOrigin();
  const previewPath = buildPreviewPath(slug);

  if (siteOrigin) {
    return `${siteOrigin}${previewPath}`;
  }

  return previewPath;
}
