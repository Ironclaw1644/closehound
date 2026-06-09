import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser, getServerClosehound } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SaveBody = z.object({
  listing: z.unknown(),
  underwriting: z.unknown(),
  safmrMonthly: z.number().optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = SaveBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const db = await getServerClosehound();
  const { error } = await db.from("saved_deals").insert({
    user_id: user.id,
    listing: parsed.data.listing as never,
    underwriting: parsed.data.underwriting as never,
    notes: parsed.data.notes ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ deals: [] });
  const db = await getServerClosehound();
  const { data } = await db.from("saved_deals").select("*").order("created_at", { ascending: false });
  return NextResponse.json({ deals: data ?? [] });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = await getServerClosehound();
  const { error } = await db.from("saved_deals").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
