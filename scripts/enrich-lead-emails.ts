// Bulk email enrichment for existing leads. Reads `closehound.leads` rows
// where contact_email is null (with optional filters), runs the
// findBusinessEmail() cascade for each, and writes back the result.
//
// Usage:
//   npm run enrich:emails -- --industry "pressure washing" --max 25
//   npm run enrich:emails -- --max 50 --min-rating 4.5
//   npm run enrich:emails -- --dry-run  # show what would happen
//
// Designed for cold-batch enrichment of the existing 250-lead pool that
// LeadHound pulled from Google Places (which doesn't return emails).
// Leaves leads we couldn't find emails for untouched so they stay
// available for phone outreach.

import { findBusinessEmail } from "@/lib/leadhound/find-email";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type { LeadIndustry } from "@/lib/industries";

type Args = {
  industry?: LeadIndustry;
  max: number;
  minRating: number;
  minReviews: number;
  maxReviews: number;
  delayMs: number;
  dryRun: boolean;
};

function parseArgs(): Args {
  const a: Args = {
    industry: undefined,
    max: 25,
    minRating: 4.5,
    minReviews: 25,
    maxReviews: 400,
    delayMs: 1500,
    dryRun: false,
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    switch (k) {
      case "--industry":
        a.industry = v as LeadIndustry;
        i++;
        break;
      case "--max":
        a.max = Math.max(1, parseInt(v, 10));
        i++;
        break;
      case "--min-rating":
        a.minRating = parseFloat(v);
        i++;
        break;
      case "--min-reviews":
        a.minReviews = parseInt(v, 10);
        i++;
        break;
      case "--max-reviews":
        a.maxReviews = parseInt(v, 10);
        i++;
        break;
      case "--delay-ms":
        a.delayMs = parseInt(v, 10);
        i++;
        break;
      case "--dry-run":
        a.dryRun = true;
        break;
    }
  }
  return a;
}

async function main() {
  const args = parseArgs();
  console.log("=== Lead email enrichment ===");
  console.log(JSON.stringify(args, null, 2));

  if (!hasSupabaseAdminEnv()) {
    console.error("FAIL: SUPABASE_SECRET_KEY missing.");
    process.exit(1);
  }
  const closehound = getSupabaseAdminClient().schema("closehound");

  // Query candidates. Mom-and-pop sweet spot is rating >= 4.5 + review_count
  // 25..400 (above 400 they're usually established chains).
  let query = closehound
    .from("leads")
    .select("id, company_name, city, industry, rating, review_count, phone, contact_email, lead_score")
    .is("contact_email", null)
    .eq("status", "new")
    .gte("rating", args.minRating)
    .gte("review_count", args.minReviews)
    .lte("review_count", args.maxReviews)
    .eq("has_website", false)
    .order("lead_score", { ascending: false, nullsFirst: false })
    .limit(args.max);

  if (args.industry) {
    query = query.eq("industry", args.industry);
  }

  const { data: leads, error } = await query;
  if (error) {
    console.error("FAIL: query failed:", error.message);
    process.exit(1);
  }
  if (!leads || leads.length === 0) {
    console.log("Nothing to enrich — no leads matched the filters.");
    return;
  }

  console.log(`\nFound ${leads.length} leads to enrich. Starting (delay ${args.delayMs}ms between)...`);

  let hits = 0;
  let misses = 0;
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    if (i > 0) await new Promise((r) => setTimeout(r, args.delayMs));
    process.stdout.write(`[${i + 1}/${leads.length}] ${lead.company_name} (${lead.city}) — `);
    const result = await findBusinessEmail({
      companyName: lead.company_name,
      city: lead.city,
      phone: lead.phone,
    });
    if (result.email) {
      hits++;
      console.log(`✓ ${result.email}  (${result.candidates.length} candidates, ${result.durationMs}ms)`);
      if (!args.dryRun) {
        const { error: updErr } = await closehound
          .from("leads")
          .update({ contact_email: result.email })
          .eq("id", lead.id);
        if (updErr) {
          console.log(`    [update failed: ${updErr.message}]`);
        }
      }
    } else {
      misses++;
      console.log(`× no email (${result.durationMs}ms)`);
    }
  }

  console.log("\n=== Done ===");
  console.log(`Hits:   ${hits}`);
  console.log(`Misses: ${misses}`);
  console.log(`Yield:  ${((hits / leads.length) * 100).toFixed(0)}%`);
  if (args.dryRun) console.log("(dry-run — no writes)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
