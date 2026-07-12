import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerClosehound } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/getSessionUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SaveBody = z.object({
  listing: z.unknown(),
  underwriting: z.unknown(),
  safmrMonthly: z.number().optional(),
  notes: z.string().max(2000).optional(),
});

const DEAL_STATUSES = ["new", "reviewing", "offer", "passed"] as const;

const PatchBody = z.object({
  id: z.string().uuid(),
  status: z.enum(DEAL_STATUSES).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = SaveBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const db = await getServerClosehound();
  const { error } = await db.from("saved_deals").insert({
    user_id: user.id,
    listing: parsed.data.listing as never,
    underwriting: parsed.data.underwriting as never,
    safmr_monthly: parsed.data.safmrMonthly ?? null,
    notes: parsed.data.notes ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Update a saved deal's pipeline status (or notes). Owner-scoped via RLS in
// live mode; scoped explicitly by user_id too (the demo data client is
// service-role, which bypasses RLS).
export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { id, ...patch } = parsed.data;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const db = await getServerClosehound();
  const { error } = await db.from("saved_deals").update(patch).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ deals: [] });
  const db = await getServerClosehound();
  const { data } = await db
    .from("saved_deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return NextResponse.json({ deals: data ?? [] });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = await getServerClosehound();
  const { error } = await db.from("saved_deals").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
