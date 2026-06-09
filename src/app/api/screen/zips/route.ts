import { NextResponse } from "next/server";
import { z } from "zod";
import { screenZips } from "@/lib/screening/stage1";
import { guardBillable } from "@/lib/screen-guard";
import { refundScreens } from "@/lib/quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  zips: z.array(z.string().regex(/^\d{5}$/)).min(1).max(40),
  bedrooms: z.number().int().min(0).max(4).default(3),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Bankruptcy guard — reserve one quota unit PER ZIP before any billable call.
  const count = parsed.data.zips.length;
  const guard = await guardBillable(count);
  if (guard instanceof NextResponse) return guard;

  try {
    const rows = await screenZips(parsed.data.zips, parsed.data.bedrooms);
    return NextResponse.json({ rows });
  } catch {
    if (guard.userId) await refundScreens(guard.userId, count);
    return NextResponse.json({ error: "Screen failed" }, { status: 502 });
  }
}
