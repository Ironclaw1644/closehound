import { NextResponse } from "next/server";
import { TARGET_INDUSTRIES, type LeadIndustry } from "@/lib/industries";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";

const ALLOWED_INDUSTRIES = new Set<string>(TARGET_INDUSTRIES.map((o) => o.value));

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as {
    industry?: string;
    city?: string;
    state?: string;
    maxResults?: number;
  };

  if (!body.industry || !ALLOWED_INDUSTRIES.has(body.industry)) {
    return NextResponse.json({ error: "Invalid industry." }, { status: 400 });
  }
  if (!body.city || body.city.trim().length < 2) {
    return NextResponse.json({ error: "City is required." }, { status: 400 });
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  const now = new Date().toISOString();

  const { data, error } = await closehound
    .from("jobs")
    .insert({
      job_type: "lead_pull",
      status: "pending",
      payload: {
        industry: body.industry as LeadIndustry,
        city: body.city.trim(),
        state: body.state?.trim()?.toUpperCase() || undefined,
        maxResults: typeof body.maxResults === "number" ? body.maxResults : 40,
      },
      requested_by: "dashboard",
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to queue lead_pull job." },
      { status: 500 }
    );
  }

  return NextResponse.json({ jobId: data.id });
}
