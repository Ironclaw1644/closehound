// Quick CLI for queueing a lead_pull job from your Mac mini terminal.
// Usage:
//   npm run leadhound:queue -- handyman "Austin" TX 40
//   npm run leadhound:queue -- "mobile detailing" "San Diego" CA 60

import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import { TARGET_INDUSTRIES, type LeadIndustry } from "@/lib/industries";

const [, , industryArg, cityArg, stateArg, maxArg] = process.argv;

if (!industryArg || !cityArg) {
  console.error('Usage: npm run leadhound:queue -- "<industry>" "<city>" [STATE] [maxResults]');
  process.exit(1);
}

const allowed = new Set<string>(TARGET_INDUSTRIES.map((o) => o.value));
if (!allowed.has(industryArg)) {
  console.error(`Industry must be one of: ${[...allowed].join(", ")}`);
  process.exit(1);
}

if (!hasSupabaseAdminEnv()) {
  console.error("SUPABASE_SERVICE_ROLE_KEY required (set NEXT_PUBLIC_SUPABASE_URL too).");
  process.exit(1);
}

const closehound = getSupabaseAdminClient().schema("closehound");
const now = new Date().toISOString();

const { data, error } = await closehound
  .from("jobs")
  .insert({
    job_type: "lead_pull",
    status: "pending",
    payload: {
      industry: industryArg as LeadIndustry,
      city: cityArg,
      state: stateArg?.toUpperCase() || undefined,
      maxResults: maxArg ? Number(maxArg) : 40,
    },
    requested_by: "cli",
    updated_at: now,
  })
  .select("id")
  .single();

if (error || !data) {
  console.error("Queue failed:", error?.message);
  process.exit(1);
}

console.log(`Queued lead_pull job ${data.id} for ${industryArg} in ${cityArg}.`);
