import { NextResponse } from "next/server";
import { z } from "zod";
import { isMockMode } from "@/lib/env";
import { getUser } from "@/lib/supabase/server";
import { getPropertyRecord } from "@/lib/rentcast/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Q = z.object({
  address: z.string().min(5).max(200),
  zip: z.string().regex(/^\d{5}$/).optional(),
});

// Lazy per-property lookup (true tax + last sale) fired when a deal is opened.
// NOT metered against the screen quota — it's bounded to deals a user actually
// inspects and cached 90 days per address — but requires auth in live mode so it
// can't be abused anonymously.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Q.safeParse({
    address: url.searchParams.get("address") ?? "",
    zip: url.searchParams.get("zip") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isMockMode()) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Sign in to load property records." }, { status: 401 });
  }

  try {
    const record = await getPropertyRecord(parsed.data.address, parsed.data.zip);
    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Property lookup failed" }, { status: 502 });
  }
}
