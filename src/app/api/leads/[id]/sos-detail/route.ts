import { NextResponse } from "next/server";
import {
  getSupabaseAdminClient,
  getSupabaseClient,
  hasSupabaseAdminEnv,
  hasSupabaseEnv,
} from "@/lib/supabase";

/**
 * GET /api/leads/[id]/sos-detail
 *
 * Resolves a `closehound.leads` row → its matching row in
 * `closehound.new_business_leads` by (lead_source → source, company_name,
 * city). Returns the full SOS filing payload so LeadDetailPanel can surface
 * filing_date, naics_code, principal_address, registered_agent, contact_phone,
 * contact_email, and raw_payload.
 *
 * Returns 200 + {sos: null} when the lead isn't from an SOS source (e.g. the
 * one preserved google_places lead) — the detail panel just hides the section.
 */
const SOURCE_MAP: Record<string, string> = {
  fl_sunbiz: "FL_SUNBIZ",
  ny_dos: "NY_DOS",
  ga_sos: "GA_SOS",
  ky_sos: "KY_SOS",
};

function reader() {
  if (hasSupabaseAdminEnv()) return getSupabaseAdminClient().schema("closehound");
  if (hasSupabaseEnv()) return getSupabaseClient().schema("closehound");
  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const client = reader();
  if (!client) return NextResponse.json({ sos: null });

  const { data: lead, error: leadErr } = await client
    .from("leads")
    .select("company_name, city, lead_source")
    .eq("id", id)
    .single();
  if (leadErr || !lead) {
    return NextResponse.json({ sos: null });
  }
  const sosSource = SOURCE_MAP[lead.lead_source ?? ""];
  if (!sosSource) {
    return NextResponse.json({ sos: null });
  }

  // Match on (source, company_name, city). NY/FL each have unique
  // (source, source_entity_id), but we don't carry that on closehound.leads
  // yet — so we resolve by the natural keys we DO have.
  //
  // Cast: `new_business_leads` isn't in the auto-generated types yet (the
  // types pre-date the table). Cast the schema-scoped client to `any` so we
  // can query it. Regenerate via supabase gen types when you next refresh.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let query = (client as any)
    .from("new_business_leads")
    .select(
      "source_entity_id, business_name, entity_type, filing_date, state, " +
        "principal_address, registered_agent, officers, naics_code, naics_inferred, " +
        "raw_payload, contact_phone, contact_email, contact_checked_at, " +
        "domain_found, has_website, gmb_found, priority_score, priority_tier"
    )
    .eq("source", sosSource)
    .eq("business_name", lead.company_name);
  if (lead.city) query = query.eq("principal_address->>city", lead.city);

  const { data: sosRows } = await query.limit(1);
  return NextResponse.json({ sos: sosRows?.[0] ?? null });
}
