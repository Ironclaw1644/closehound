import { NextResponse } from "next/server";
import { z } from "zod";
import { screenZips } from "@/lib/screening/stage1";
import { guardBillable } from "@/lib/screen-guard";
import { incrementUsage } from "@/lib/quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  zips: z.array(z.string().regex(/^\d{5}$/)).min(1).max(60),
  bedrooms: z.number().int().min(0).max(4).default(3),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Bankruptcy guard — before any billable call.
  const guard = await guardBillable();
  if (guard instanceof NextResponse) return guard;

  const rows = await screenZips(parsed.data.zips, parsed.data.bedrooms);

  if (guard.userId) await incrementUsage(guard.userId, 1);
  return NextResponse.json({ rows });
}
