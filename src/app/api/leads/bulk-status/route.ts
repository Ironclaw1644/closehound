import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type { LeadStatus } from "@/types/lead";

const ALLOWED: LeadStatus[] = ["new", "generated", "emailed", "called", "closed"];

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required." },
      { status: 503 }
    );
  }
  const body = (await request.json()) as { leadIds?: string[]; status?: LeadStatus };
  if (!Array.isArray(body.leadIds) || body.leadIds.length === 0) {
    return NextResponse.json({ error: "leadIds is required." }, { status: 400 });
  }
  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  const { error, count } = await closehound
    .from("leads")
    .update({ status: body.status }, { count: "exact" })
    .in("id", body.leadIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ updated: count ?? body.leadIds.length });
}
