// Bypass: pulls leads from Google Places + classifies with Ollama, then writes
// the leads to a JSON file. We then bulk-insert them via the Supabase MCP
// (execute_sql) — bypassing PostgREST entirely, since the sb_secret_* service
// role key isn't accepted on this project's data plane.
//
// Usage:
//   npm run leadhound:pull-to-json -- "Austin" TX
// (defaults to all 14 target industries)
//
//   npm run leadhound:pull-to-json -- "Austin" TX "handyman,roofing"
// (subset)

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TARGET_INDUSTRIES, type LeadIndustry } from "@/lib/industries";
import { fetchPlaceDetails, searchPlaces } from "@/lib/leadhound/places";
import { classifyLead } from "@/lib/leadhound/classify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, ".leadhound-pull");

const RATING_THRESHOLD = 4.2;
const REVIEW_COUNT_THRESHOLD = 12;

type LeadRow = {
  company_name: string;
  city: string | null;
  industry: LeadIndustry;
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

async function pullOneIndustry(
  industry: LeadIndustry,
  city: string,
  state: string | undefined
): Promise<LeadRow[]> {
  const summaries = await searchPlaces({
    industry,
    city,
    state,
    maxResults: 40,
  });
  process.stdout.write(`  ${industry}: ${summaries.length} candidates from Places\n`);

  const out: LeadRow[] = [];
  const seenPlaceIds = new Set<string>();

  for (const summary of summaries) {
    if (summary.businessStatus && summary.businessStatus !== "OPERATIONAL") continue;
    if (summary.websiteUri) continue;
    if ((summary.rating ?? 0) < RATING_THRESHOLD) continue;
    if ((summary.reviewCount ?? 0) < REVIEW_COUNT_THRESHOLD) continue;
    if (seenPlaceIds.has(summary.placeId)) continue;
    seenPlaceIds.add(summary.placeId);

    let details;
    try {
      details = await fetchPlaceDetails(summary.placeId);
    } catch {
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
      company_name: details.name,
      city: details.city ?? city,
      industry,
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
  }

  process.stdout.write(`  ${industry}: ${out.length} leads after filter\n`);
  return out;
}

async function main() {
  const [, , cityArg, stateArg, industriesArg] = process.argv;
  if (!cityArg) {
    console.error('Usage: npm run leadhound:pull-to-json -- "<city>" [STATE] [comma,industries]');
    process.exit(1);
  }

  const city = cityArg;
  const state = stateArg?.toUpperCase() || undefined;

  const allIndustries = TARGET_INDUSTRIES.map((o) => o.value as LeadIndustry);
  const requested = industriesArg
    ? industriesArg.split(",").map((s) => s.trim()).filter(Boolean) as LeadIndustry[]
    : allIndustries;

  for (const ind of requested) {
    if (!allIndustries.includes(ind)) {
      console.error(`Unknown industry: ${ind}`);
      process.exit(1);
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  process.stdout.write(`Pulling ${requested.length} industries × ${city}${state ? ", " + state : ""}\n`);

  // Parallelize across industries (each one is bound by Google Places + Ollama
  // latency, both of which are fine to fan out).
  const results = await Promise.all(
    requested.map(async (industry) => {
      try {
        const leads = await pullOneIndustry(industry, city, state);
        return { industry, leads, error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stdout.write(`  ${industry}: ERROR — ${msg}\n`);
        return { industry, leads: [] as LeadRow[], error: msg };
      }
    })
  );

  const all: LeadRow[] = results.flatMap((r) => r.leads);

  const outPath = path.join(OUT_DIR, `${city.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.json`);
  await fs.writeFile(outPath, JSON.stringify(all, null, 2));

  process.stdout.write(`\n✓ Wrote ${all.length} leads to ${outPath}\n`);

  // Print per-industry summary as a JSON table
  const summary = results.map((r) => ({
    industry: r.industry,
    leads: r.leads.length,
    error: r.error,
  }));
  process.stdout.write("\nSummary:\n");
  process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
}

main().catch((err) => {
  console.error("leadhound pull failed:", err);
  process.exitCode = 1;
});
