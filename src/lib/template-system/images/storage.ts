import { getSupabaseAdminClient } from "@/lib/supabase";

export const TEMPLATE_IMAGE_BUCKET = "template-images";

export function buildTemplateImageStoragePath(input: {
  templateKey: string;
  slot: string;
  generationBatchId: string;
  candidateIndex: number;
}) {
  return `${TEMPLATE_IMAGE_BUCKET}/${input.templateKey}/${input.generationBatchId}/${input.slot}-${input.candidateIndex}.png`;
}

export function toTemplateImageObjectPath(storagePath: string) {
  return storagePath.startsWith(`${TEMPLATE_IMAGE_BUCKET}/`)
    ? storagePath.slice(TEMPLATE_IMAGE_BUCKET.length + 1)
    : storagePath;
}

export async function ensureTemplateImageBucketExists() {
  const admin = getSupabaseAdminClient();
  const { data: buckets, error: listError } = await admin.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  const bucketExists = buckets?.some((bucket) => bucket.name === TEMPLATE_IMAGE_BUCKET);

  if (bucketExists) {
    return;
  }

  const { error: createError } = await admin.storage.createBucket(TEMPLATE_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: "10MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });

  if (createError && !/already exists/i.test(createError.message)) {
    throw createError;
  }
}

export async function uploadTemplateImage(input: {
  storagePath: string;
  data: Uint8Array;
  contentType: string;
}) {
  await ensureTemplateImageBucketExists();

  const admin = getSupabaseAdminClient();
  const objectPath = toTemplateImageObjectPath(input.storagePath);
  const bucket = admin.storage.from(TEMPLATE_IMAGE_BUCKET);
  const { error: uploadError } = await bucket.upload(objectPath, input.data, {
    contentType: input.contentType,
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = bucket.getPublicUrl(objectPath);

  return {
    storagePath: input.storagePath,
    assetUrl: data.publicUrl,
  };
}
