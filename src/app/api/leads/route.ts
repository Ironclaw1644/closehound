import { NextResponse } from "next/server";
import { z } from "zod";
import { getClosehoundAdminSchema, hasSupabaseAdminEnv } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(200),
  source: z.string().max(80).optional(),
});

// Anonymous email capture → closehound.leads (service-role; RLS-locked table).
// Idempotent on email. Welcome email is a deliberate follow-up (not wired yet).
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ ok: true }); // gracefully no-op if unconfigured
  }

  const db = getClosehoundAdminSchema();
  const { error } = await db.from("leads").upsert(
    { email: parsed.data.email.trim().toLowerCase(), source: parsed.data.source ?? "guide" },
    { onConflict: "email", ignoreDuplicates: true }
  );
  if (error) {
    return NextResponse.json({ error: "Could not subscribe — try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
