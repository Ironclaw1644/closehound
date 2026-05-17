import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPreviewModel } from "@/lib/preview/build";
import { buildPreviewSlug, buildPreviewUrl } from "@/lib/preview";
import { generateGeminiImage } from "@/lib/images/gemini";
import { buildLogoPrompt } from "@/lib/images/prompts";
import { uploadPreviewAsset } from "@/lib/images/storage";
import type { Database, Json } from "@/types/supabase";
import type { Lead } from "@/types/lead";
import type {
  JobLogEntry,
  PreviewGenerateJobPayload,
  PreviewGenerateJobResult,
} from "@/types/operator";

type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
  entries: JobLogEntry[];
};

function asPayload(payload: unknown): PreviewGenerateJobPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("preview_generate payload must be an object.");
  }
  const p = payload as Partial<PreviewGenerateJobPayload>;
  if (!p.leadId) throw new Error("preview_generate payload missing leadId.");
  return { leadId: p.leadId };
}

async function safeGenerateImage(
  prompt: string,
  logger: Logger,
  label: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    return await generateGeminiImage({ prompt });
  } catch (err) {
    logger.error(`${label} image gen failed: ${err instanceof Error ? err.message : "unknown"}`);
    return null;
  }
}

async function safeUpload(
  leadId: string,
  slot: "logo" | "hero",
  image: { base64: string; mimeType: string } | null,
  logger: Logger
): Promise<string | null> {
  if (!image) return null;
  try {
    const result = await uploadPreviewAsset({ leadId, slot, image });
    return result.publicUrl;
  } catch (err) {
    logger.error(`${slot} upload failed: ${err instanceof Error ? err.message : "unknown"}`);
    return null;
  }
}

export async function runPreviewGenerateJob(
  supabase: SupabaseClient<Database>,
  payload: unknown,
  logger: Logger
): Promise<PreviewGenerateJobResult> {
  const { leadId } = asPayload(payload);
  const closehound = supabase.schema("closehound");

  const { data, error } = await closehound
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? `Lead ${leadId} not found.`);
  }

  const lead = data as Lead;
  if (!lead.industry) {
    throw new Error(`Lead ${leadId} has no industry; cannot generate preview.`);
  }

  logger.info(`Generating preview for ${lead.company_name}.`);

  const slug = buildPreviewSlug({
    companyName: lead.company_name,
    city: lead.city,
    leadId: lead.id,
  });

  // Hero/gallery photos come from the per-industry stock library so we don't
  // burn a Gemini call on every cold-outreach lead. Per-lead generation is just
  // the company logo — that's the one asset that genuinely has to be unique.
  const logoImage = await safeGenerateImage(
    buildLogoPrompt({
      businessName: lead.company_name,
      industry: lead.industry,
      city: lead.city,
    }),
    logger,
    "Logo"
  );
  const logoUrl = await safeUpload(lead.id, "logo", logoImage, logger);
  const heroUrl: string | null = null;

  const model = buildPreviewModel(lead, { logoUrl, heroUrl });
  const previewUrl = buildPreviewUrl(slug);
  const now = new Date().toISOString();

  const { error: previewSiteError } = await closehound
    .from("preview_sites")
    .upsert(
      {
        slug,
        lead_id: lead.id,
        preview_url: previewUrl,
        preview_payload: model as unknown as Json,
        logo_url: logoUrl,
        hero_url: heroUrl,
        generated_at: now,
        updated_at: now,
      },
      { onConflict: "slug" }
    );

  if (previewSiteError) {
    throw new Error(`preview_sites upsert failed: ${previewSiteError.message}`);
  }

  const { error: leadUpdateError } = await closehound
    .from("leads")
    .update({
      preview_url: previewUrl,
      status: "generated",
    })
    .eq("id", lead.id);

  if (leadUpdateError) {
    throw new Error(`leads update failed: ${leadUpdateError.message}`);
  }

  logger.info(`Preview ready at ${previewUrl}.`);

  return {
    leadId: lead.id,
    previewUrl,
    slug,
    templateKey: model.templateKey,
    paletteKey: model.paletteKey,
    logoUrl,
    heroUrl,
  };
}
