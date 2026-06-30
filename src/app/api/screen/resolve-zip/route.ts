import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/env";
import { getUser } from "@/lib/supabase/server";
import { resolveZip } from "@/lib/hud/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resolve a typed ZIP to itself (if covered) or the nearest covered ZIP.
// NOT billable — pure lookup over the bundled SAFMR dataset — but auth-gated in
// live so it can't be scraped anonymously. The actual screen still bills.
export async function GET(req: Request) {
  const zip = (new URL(req.url).searchParams.get("zip") ?? "").trim();
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Enter a 5-digit ZIP." }, { status: 400 });
  }

  if (!isMockMode()) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Sign in to search ZIPs." }, { status: 401 });
  }

  const r = resolveZip(zip);
  if (!r) return NextResponse.json({ error: "No covered ZIP found." }, { status: 404 });
  return NextResponse.json({ requested: zip, zip: r.zip, exact: r.exact });
}
