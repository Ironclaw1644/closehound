import { NextResponse } from "next/server";
import { normalizePreviewUrl } from "@/lib/preview";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type { Job, PreviewGenerateJobResult } from "@/types/operator";

function normalizeJobPreviewResult(job: Job) {
  if (
    job.job_type !== "preview_generate" ||
    job.status !== "completed" ||
    !job.result ||
    typeof job.result !== "object" ||
    Array.isArray(job.result) ||
    typeof job.result.previewUrl !== "string"
  ) {
    return job;
  }

  const result = job.result as PreviewGenerateJobResult;

  return {
    ...job,
    result: {
      ...result,
      previewUrl: normalizePreviewUrl(result.previewUrl),
    },
  };
}

export async function GET() {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for operator job reads." },
      { status: 503 }
    );
  }

  const { data, error } = await getSupabaseAdminClient()
    .schema("closehound")
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    jobs: ((data ?? []) as Job[]).map(normalizeJobPreviewResult),
  });
}
