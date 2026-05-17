import "server-only";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import { updatePreviewPayload, findPreviewSiteById } from "@/lib/onboarding/storage";

const BUCKET = "walkperro-customer-uploads";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadResult =
  | { ok: true; publicUrl: string; slot: number }
  | { ok: false; error: string };

export async function uploadCustomerPhoto(opts: {
  previewSiteId: string;
  slot: number; // 0..2 (gallery), 3 = hero, 4 = logo
  file: File;
}): Promise<UploadResult> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Storage backend not configured." };
  }
  if (opts.file.size > MAX_BYTES) {
    return { ok: false, error: "File is larger than 10 MB." };
  }
  if (!ALLOWED_MIME.has(opts.file.type)) {
    return { ok: false, error: "File must be a JPEG, PNG, or WebP image." };
  }

  // Verify the preview_site exists.
  const site = await findPreviewSiteById(opts.previewSiteId);
  if (!site) {
    return { ok: false, error: "Preview site not found." };
  }

  // Build the path inside the bucket: <previewSiteId>/<slot>.<ext>
  const ext = opts.file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() ?? "jpg";
  const path = `${opts.previewSiteId}/slot-${opts.slot}.${ext}`;

  // Read the file into a buffer.
  const buf = Buffer.from(await opts.file.arrayBuffer());

  // Upload via the supabase-js storage client. Force public bucket.
  const storage = getSupabaseAdminClient().storage;
  const { error: uploadError } = await storage
    .from(BUCKET)
    .upload(path, buf, {
      contentType: opts.file.type,
      upsert: true,
    });
  if (uploadError) {
    return {
      ok: false,
      error: `Storage upload failed: ${uploadError.message}`,
    };
  }

  const { data } = storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    return { ok: false, error: "Could not resolve public URL after upload." };
  }

  // Persist into preview_payload.assets.galleryUrls (for slots 0..2) or hero/logo
  const payload = (site.preview_payload ?? {}) as Record<string, unknown>;
  const assets =
    (payload.assets as { galleryUrls?: string[]; heroUrl?: string | null; logoUrl?: string | null }) ??
    {};
  let galleryUrls = Array.isArray(assets.galleryUrls)
    ? [...assets.galleryUrls]
    : [];
  let heroUrl = assets.heroUrl ?? null;
  let logoUrl = assets.logoUrl ?? null;

  if (opts.slot >= 0 && opts.slot <= 2) {
    while (galleryUrls.length <= opts.slot) galleryUrls.push("");
    galleryUrls[opts.slot] = data.publicUrl;
  } else if (opts.slot === 3) {
    heroUrl = data.publicUrl;
  } else if (opts.slot === 4) {
    logoUrl = data.publicUrl;
  }

  await updatePreviewPayload({
    previewSiteId: opts.previewSiteId,
    patch: {
      assets: { galleryUrls, heroUrl, logoUrl },
    },
  });

  return { ok: true, publicUrl: data.publicUrl, slot: opts.slot };
}

// Bucket setup helper — call from a one-off script if the bucket doesn't exist.
// Most installs will have created it manually via the dashboard. This is a
// best-effort idempotent ensure.
export async function ensureUploadBucket(): Promise<void> {
  if (!hasSupabaseAdminEnv()) return;
  const storage = getSupabaseAdminClient().storage;
  const { data } = await storage.listBuckets();
  if (data?.some((b) => b.name === BUCKET)) return;
  await storage.createBucket(BUCKET, { public: true });
}
