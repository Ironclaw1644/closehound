import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type { Job } from "@/types/operator";

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
    jobs: (data ?? []) as Job[],
  });
}
