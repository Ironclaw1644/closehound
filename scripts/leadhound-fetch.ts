// One-off: bypass the broken PostgREST auth path and just FETCH leads.
// Uses the existing searchPlaces() + classifyLead() pure functions.
// Emits a JSON file the caller can then INSERT via Supabase MCP.
//
// Usage:
//   npm run leadhound:fetch -- "Austin" TX
// Output: /tmp/leadhound-pulls.json (one entry per industry; each with `leads`)

import { promises as fs } from "node:fs";

import { searchPlaces, fetchPlaceDetails, type PlaceDetails } from "@/lib/leadhound/places";
import { classifyLead } from "@/lib/leadhound/classify";
import { TARGET_INDUSTRIES, type LeadIndustry } from "@/lib/industries";

const [, , cityArg, stateArg, maxArg] = process.argv;
const city = cityArg ?? "Austin";
const state = stateArg?.toUpperCase() ?? "TX";
const maxResults = maxArg ? Number(maxArg) : 40;

const OUT = "/tmp/leadhound-pulls.json";

type LeadRow = {
  industry: LeadIndustry;
  company_name: string;
  city: string | null;
  phone: string | null;
  rating: number | null;
  review_count: number | null;
  has_website: boolean;
  status: "new";
  lead_source: "google_places";
  lead_score: number;
  place_id: string;
  top_review: string | null;
  top_reviewer_name: string | null;
  notes: string | null;
};

async function pullForIndustry(industry: LeadIndustry): Promise<LeadRow[]> {
  process.stdout.write(`▸ ${industry} in ${city}, ${state} … `);
  let summaries: Awaited<ReturnType<typeof searchPlaces>> = [];
  try {
    summaries = await searchPlaces({
      industry,
      city,
      state,
      maxResults,
    });
  } catch (err) {
    process.stdout.write(
      `places error: ${err instanceof Error ? err.message : "unknown"}\n`
    );
    return [];
  }
  process.stdout.write(`${summaries.length} candidates → `);

  const out: LeadRow[] = [];
  let inserted = 0;
  let skipped = 0;
  const seen = new Set<string>();

  for (const summary of summaries) {
    if (!summary.placeId || seen.has(summary.placeId)) continue;
    seen.add(summary.placeId);

    let details: PlaceDetails;
    try {
      details = await fetchPlaceDetails(summary.placeId);
    } catch {
      // fall back to summary-only
      details = { ...summary, topReview: null };
    }

    const classification = await classifyLead({
      companyName: details.name,
      industry,
      city: details.city ?? city,
      rating: details.rating,
      reviewCount: details.reviewCount,
      hasWebsite: false,
      topReview: details.topReview?.text ?? null,
    });

    out.push({
      industry,
      company_name: details.name,
      city: details.city ?? city,
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
      notes: classification.reasons.length
        ? classification.reasons.join(" · ")
        : null,
    });
    inserted += 1;
  }
  skipped = summaries.length - inserted;
  process.stdout.write(`${inserted} kept, ${skipped} skipped\n`);
  return out;
}

async function main() {
  const allIndustries = TARGET_INDUSTRIES.map((opt) => opt.value as LeadIndustry);
  const all: { industry: LeadIndustry; leads: LeadRow[] }[] = [];

  for (const industry of allIndustries) {
    const leads = await pullForIndustry(industry);
    all.push({ industry, leads });
  }

  await fs.writeFile(OUT, JSON.stringify(all, null, 2));
  const total = all.reduce((sum, e) => sum + e.leads.length, 0);
  process.stdout.write(`\nWrote ${OUT} (${total} leads across ${all.length} industries)\n`);
}

main().catch((err) => {
  console.error("\nleadhound fetch failed:", err);
  process.exitCode = 1;
});
