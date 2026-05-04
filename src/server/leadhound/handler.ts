import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyLead } from "@/lib/leadhound/classify";
import { fetchPlaceDetails, searchPlaces } from "@/lib/leadhound/places";
import type { LeadIndustry } from "@/lib/industries";
import type { Database } from "@/types/supabase";
import type { JobLogEntry, LeadPullJobPayload, LeadPullJobResult } from "@/types/operator";

type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
  entries: JobLogEntry[];
};

const RATING_THRESHOLD = 4.2;
const REVIEW_COUNT_THRESHOLD = 12;

function asPayload(payload: unknown): LeadPullJobPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("lead_pull job payload must be an object.");
  }
  const p = payload as Partial<LeadPullJobPayload>;
  if (!p.industry) throw new Error("lead_pull payload missing industry.");
  if (!p.city) throw new Error("lead_pull payload missing city.");
  return {
    industry: p.industry as LeadIndustry,
    city: p.city,
    state: p.state,
    radiusMiles: p.radiusMiles,
    maxResults: p.maxResults,
  };
}

export async function runLeadPullJob(
  supabase: SupabaseClient<Database>,
  payload: unknown,
  logger: Logger
): Promise<LeadPullJobResult> {
  const input = asPayload(payload);
  const closehound = supabase.schema("closehound");
  logger.info(`LeadHound: searching ${input.industry} in ${input.city}${input.state ? `, ${input.state}` : ""}.`);

  const summaries = await searchPlaces({
    industry: input.industry,
    city: input.city,
    state: input.state,
    maxResults: input.maxResults ?? 40,
  });
  logger.info(`Places returned ${summaries.length} candidates.`);

  let inserted = 0;
  let skipped = 0;
  let topScore: number | null = null;

  for (const summary of summaries) {
    if (summary.businessStatus && summary.businessStatus !== "OPERATIONAL") {
      skipped += 1;
      continue;
    }
    if (summary.websiteUri) {
      // V1 wants businesses without websites.
      skipped += 1;
      continue;
    }
    if ((summary.rating ?? 0) < RATING_THRESHOLD) {
      skipped += 1;
      continue;
    }
    if ((summary.reviewCount ?? 0) < REVIEW_COUNT_THRESHOLD) {
      skipped += 1;
      continue;
    }

    // Skip duplicates.
    const { data: existing } = await closehound
      .from("leads")
      .select("id")
      .eq("place_id", summary.placeId)
      .maybeSingle();
    if (existing) {
      skipped += 1;
      continue;
    }

    let details;
    try {
      details = await fetchPlaceDetails(summary.placeId);
    } catch (err) {
      logger.error(
        `Place details failed for ${summary.name}: ${err instanceof Error ? err.message : "unknown"}`
      );
      details = { ...summary, topReview: null };
    }

    const classification = await classifyLead({
      companyName: details.name,
      industry: input.industry,
      city: details.city ?? input.city,
      rating: details.rating,
      reviewCount: details.reviewCount,
      hasWebsite: false,
      topReview: details.topReview?.text ?? null,
    });

    const { error: insertError } = await closehound.from("leads").insert({
      company_name: details.name,
      city: details.city ?? input.city,
      industry: input.industry,
      phone: details.phone,
      rating: details.rating,
      review_count: details.reviewCount,
      has_website: false,
      status: "new",
      lead_source: "google_places",
      lead_score: classification.score,
      place_id: details.placeId,
      top_review: details.topReview?.text ?? null,
      top_reviewer_name: details.topReview?.authorFirstName ?? null,
      notes: classification.reasons.length ? classification.reasons.join(" · ") : null,
    });

    if (insertError) {
      logger.error(`Insert failed for ${details.name}: ${insertError.message}`);
      skipped += 1;
      continue;
    }

    inserted += 1;
    if (topScore === null || classification.score > topScore) {
      topScore = classification.score;
    }
  }

  logger.info(`LeadHound done. Inserted ${inserted}, skipped ${skipped}, top score ${topScore ?? "n/a"}.`);

  return {
    industry: input.industry,
    city: input.city,
    scanned: summaries.length,
    inserted,
    skipped,
    topScore,
  };
}
