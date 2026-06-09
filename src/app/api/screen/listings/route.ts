import { NextResponse } from "next/server";
import { z } from "zod";
import { getSafmr } from "@/lib/hud/client";
import { getListings } from "@/lib/rentcast/client";
import { guardBillable } from "@/lib/screen-guard";
import { incrementUsage } from "@/lib/quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ zip: z.string().regex(/^\d{5}$/) });

// Returns RAW SAFMR + listings; the client underwrites with live assumptions so
// tweaking inputs re-scores instantly without re-billing the APIs.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const guard = await guardBillable();
  if (guard instanceof NextResponse) return guard;

  const { zip } = parsed.data;
  const [safmr, listings] = await Promise.all([getSafmr(zip), getListings(zip)]);

  if (guard.userId) await incrementUsage(guard.userId, 1);
  return NextResponse.json({ safmr, listings });
}
