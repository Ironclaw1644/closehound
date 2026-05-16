import { NextResponse } from "next/server";
import {
  getSupabaseAdminClient,
  getSupabaseClient,
  hasSupabaseAdminEnv,
  hasSupabaseEnv,
} from "@/lib/supabase";
import type { Lead, LeadStatus } from "@/types/lead";

const UPDATABLE_STATUSES: LeadStatus[] = ["new", "generated", "emailed", "called", "closed"];

function reader() {
  if (hasSupabaseAdminEnv()) return getSupabaseAdminClient().schema("closehound");
  if (hasSupabaseEnv()) return getSupabaseClient().schema("closehound");
  return null;
}

export async function GET() {
  const client = reader();
  if (!client) {
    return NextResponse.json({ leads: [] });
  }
  // Bumped from 500 → 5000 so the dashboard can paginate over the full SOS
  // ingestion pool (FL ~500/wk + NY ~100/wk). Pagination is handled client-
  // side in LeadConsole at 100 rows/page.
  const { data, error } = await client
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ leads: (data ?? []) as Lead[] });
}

// PATCH /api/leads — accepts partial updates: status (validated against the
// enum), phone, contact_email, notes. Empty string clears the field (becomes
// NULL); omitting a key leaves it unchanged. lead_id is the only required
// field. Used by the dashboard's status-pill and inline-edit controls.
export async function PATCH(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for lead updates." },
      { status: 503 }
    );
  }
  const body = (await request.json()) as {
    lead_id?: string;
    status?: LeadStatus;
    phone?: string | null;
    contact_email?: string | null;
    notes?: string | null;
  };

  if (!body.lead_id) {
    return NextResponse.json({ error: "lead_id is required." }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if (body.status !== undefined) {
    if (!UPDATABLE_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.phone !== undefined) {
    const trimmed = body.phone === null ? null : String(body.phone).trim();
    updates.phone = trimmed || null;
  }
  if (body.contact_email !== undefined) {
    const trimmed =
      body.contact_email === null ? null : String(body.contact_email).trim().toLowerCase();
    updates.contact_email = trimmed || null;
  }
  if (body.notes !== undefined) {
    const trimmed = body.notes === null ? null : String(body.notes).trim();
    updates.notes = trimmed || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided." }, { status: 400 });
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  // Cast: Supabase's generated update type is strict-keyed against the column
  // set, but we're building `updates` dynamically. The set of keys we accept
  // is filtered above so the cast is safe.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { data, error } = await closehound
    .from("leads")
    .update(updates as any)
    .eq("id", body.lead_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ lead: data as Lead });
}
