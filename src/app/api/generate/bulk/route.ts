import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required." },
      { status: 503 }
    );
  }
  const body = (await request.json()) as { leadIds?: string[] };
  if (!Array.isArray(body.leadIds) || body.leadIds.length === 0) {
    return NextResponse.json({ error: "leadIds is required." }, { status: 400 });
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  const now = new Date().toISOString();
  const rows = body.leadIds.map((leadId) => ({
    job_type: "preview_generate",
    status: "pending",
    payload: { leadId },
    requested_by: "dashboard-bulk",
    lead_id: leadId,
    updated_at: now,
  }));

  const { data, error } = await closehound.from("jobs").insert(rows).select("id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ queued: data?.length ?? 0 });
}
