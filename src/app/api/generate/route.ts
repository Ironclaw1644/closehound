import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type { Job } from "@/types/operator";

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required." },
      { status: 503 }
    );
  }
  const body = (await request.json()) as { leadId?: string };
  if (!body.leadId) {
    return NextResponse.json({ error: "leadId is required." }, { status: 400 });
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data: lead, error: leadError } = await closehound
    .from("leads")
    .select("id")
    .eq("id", body.leadId)
    .maybeSingle();
  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const { data, error } = await closehound
    .from("jobs")
    .insert({
      job_type: "preview_generate",
      status: "pending",
      payload: { leadId: body.leadId },
      requested_by: "dashboard",
      lead_id: body.leadId,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to queue preview job." },
      { status: 500 }
    );
  }

  return NextResponse.json({ job: data as Job });
}
