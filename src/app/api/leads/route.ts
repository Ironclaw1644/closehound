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
  const { data, error } = await client
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ leads: (data ?? []) as Lead[] });
}

export async function PATCH(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for lead updates." },
      { status: 503 }
    );
  }
  const body = (await request.json()) as { lead_id?: string; status?: LeadStatus };

  if (!body.lead_id || !body.status || !UPDATABLE_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid lead update payload." }, { status: 400 });
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await closehound
    .from("leads")
    .update({ status: body.status })
    .eq("id", body.lead_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ lead: data as Lead });
}
