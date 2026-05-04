import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase";
import type { GeminiImage } from "@/lib/images/gemini";

const BUCKET = "preview-assets";

function getBucket() {
  return getSupabaseAdminClient().storage.from(BUCKET);
}

function decodeBase64(data: string): Uint8Array {
  // Node 18+: Buffer is available; works on Vercel functions and the worker.
  return new Uint8Array(Buffer.from(data, "base64"));
}

export async function uploadPreviewAsset(opts: {
  leadId: string;
  slot: "logo" | "hero";
  image: GeminiImage;
}): Promise<{ path: string; publicUrl: string }> {
  const ext = opts.image.mimeType === "image/jpeg" ? "jpg" : "png";
  const path = `${opts.leadId}/${opts.slot}.${ext}`;
  const bytes = decodeBase64(opts.image.base64);

  const { error } = await getBucket().upload(path, bytes, {
    cacheControl: "31536000",
    contentType: opts.image.mimeType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload preview asset: ${error.message}`);
  }

  const { data } = getBucket().getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
