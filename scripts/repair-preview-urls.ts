import { normalizePreviewUrl, shouldRepairStoredPreviewUrl } from "@/lib/preview";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";

type PreviewRow = {
  id: string;
  preview_url: string | null;
};

type PreviewSiteRow = {
  slug: string;
  preview_url: string;
};

const APPLY_FLAG = "--write";

async function repairLeads(apply: boolean) {
  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await closehound.from("leads").select("id, preview_url");

  if (error) {
    throw new Error(`Failed to load leads: ${error.message}`);
  }

  const candidates = ((data ?? []) as PreviewRow[])
    .filter((row) => row.preview_url && shouldRepairStoredPreviewUrl(row.preview_url))
    .map((row) => ({
      id: row.id,
      preview_url: normalizePreviewUrl(row.preview_url as string),
    }));

  if (!apply || candidates.length === 0) {
    return candidates.length;
  }

  for (const candidate of candidates) {
    const { error: updateError } = await closehound
      .from("leads")
      .update({ preview_url: candidate.preview_url })
      .eq("id", candidate.id);

    if (updateError) {
      throw new Error(`Failed to update lead ${candidate.id}: ${updateError.message}`);
    }
  }

  return candidates.length;
}

async function repairPreviewSites(apply: boolean) {
  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await closehound.from("preview_sites").select("slug, preview_url");

  if (error) {
    throw new Error(`Failed to load preview_sites: ${error.message}`);
  }

  const candidates = ((data ?? []) as PreviewSiteRow[])
    .filter((row) => shouldRepairStoredPreviewUrl(row.preview_url))
    .map((row) => ({
      slug: row.slug,
      preview_url: normalizePreviewUrl(row.preview_url),
    }));

  if (!apply || candidates.length === 0) {
    return candidates.length;
  }

  for (const candidate of candidates) {
    const { error: updateError } = await closehound
      .from("preview_sites")
      .update({ preview_url: candidate.preview_url, updated_at: new Date().toISOString() })
      .eq("slug", candidate.slug);

    if (updateError) {
      throw new Error(
        `Failed to update preview_sites row for slug ${candidate.slug}: ${updateError.message}`
      );
    }
  }

  return candidates.length;
}

async function main() {
  if (!hasSupabaseAdminEnv()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required to repair preview URLs."
    );
  }

  if (!process.env.PREVIEW_SITE?.trim()) {
    throw new Error("PREVIEW_SITE is required to repair stored preview URLs.");
  }

  const apply = process.argv.includes(APPLY_FLAG);
  const leadsUpdated = await repairLeads(apply);
  const previewSitesUpdated = await repairPreviewSites(apply);

  console.info(
    JSON.stringify(
      {
        mode: apply ? "write" : "dry-run",
        leadsUpdated,
        previewSitesUpdated,
        previewSite: process.env.PREVIEW_SITE,
      },
      null,
      2
    )
  );
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown preview URL repair failure.");
  process.exit(1);
});
