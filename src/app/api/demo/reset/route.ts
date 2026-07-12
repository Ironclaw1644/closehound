import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { getClosehoundAdminSchema, hasSupabaseAdminEnv } from "@/lib/supabase";
import { resetAndSeedDemo } from "../../../../../supabase/demo-seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Nightly demo reset: truncate + reseed the demo_closehound schema (see
// supabase/demo-seed.ts). Wired to a Vercel cron (vercel.json, 08:00 UTC),
// which calls GET with `Authorization: Bearer ${CRON_SECRET}`; a manual
// trigger can also pass ?key=<CRON_SECRET>. Outside DEMO_MODE the route
// pretends not to exist (404) so production never exposes it.
async function reset(req: Request): Promise<NextResponse> {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secret = process.env.CRON_SECRET?.trim();
  const bearer = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  const authorized =
    Boolean(secret) && (bearer === `Bearer ${secret}` || key === secret);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "Supabase admin env missing" }, { status: 503 });
  }

  try {
    // In DEMO_MODE the admin schema client is already scoped to demo_closehound.
    const result = await resetAndSeedDemo(getClosehoundAdminSchema());
    return NextResponse.json({ ok: true, ...result, resetAt: new Date().toISOString() });
  } catch (e) {
    console.error("[demo/reset] failed:", e);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return reset(req);
}

export async function POST(req: Request) {
  return reset(req);
}
