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

  // Only queue leads that have a preview ready.
  const { data: ready, error: readyError } = await closehound
    .from("leads")
    .select("id, preview_url")
    .in("id", body.leadIds);

  if (readyError) {
    return NextResponse.json({ error: readyError.message }, { status: 500 });
  }

  const queueable = (ready ?? []).filter(
    (row): row is { id: string; preview_url: string } => Boolean(row.preview_url)
  );

  if (queueable.length === 0) {
    return NextResponse.json({
      queued: 0,
      skipped: body.leadIds.length,
      reason: "No selected leads have a preview yet. Generate previews first.",
    });
  }

  const now = new Date().toISOString();
  const rows = queueable.map((lead) => ({
    job_type: "outreach_email",
    status: "pending",
    payload: { leadId: lead.id },
    requested_by: "dashboard-bulk",
    lead_id: lead.id,
    updated_at: now,
  }));

  const { data, error } = await closehound.from("jobs").insert(rows).select("id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    queued: data?.length ?? 0,
    skipped: body.leadIds.length - queueable.length,
  });
}
