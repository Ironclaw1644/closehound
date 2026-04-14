import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type { Job } from "@/types/operator";

const ACTIVE_PREVIEW_JOB_STATUSES = ["pending", "running"] as const;

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for operator job creation." },
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
    .select("id, industry")
    .eq("id", body.leadId)
    .single();

  if (leadError || !lead) {
    return NextResponse.json(
      { error: leadError?.message ?? "Lead not found." },
      { status: 404 }
    );
  }

  if (!lead.industry) {
    return NextResponse.json(
      { error: "Lead industry is required to queue a preview job." },
      { status: 400 }
    );
  }

  const { data: activeJob, error: activeJobError } = await closehound
    .from("jobs")
    .select("*")
    .eq("job_type", "preview_generate")
    .in("status", [...ACTIVE_PREVIEW_JOB_STATUSES])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (activeJobError) {
    return NextResponse.json({ error: activeJobError.message }, { status: 500 });
  }

  if (activeJob) {
    return NextResponse.json(
      {
        error: "A preview job is already pending or running.",
        job: activeJob as Job,
      },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const { data: job, error: insertError } = await closehound
    .from("jobs")
    .insert({
      job_type: "preview_generate",
      status: "pending",
      payload: {
        leadId: body.leadId,
      },
      requested_by: "dashboard",
      lead_id: body.leadId,
      updated_at: now,
    })
    .select("*")
    .single();

  if (insertError || !job) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to queue preview job." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    job: job as Job,
  });
}
