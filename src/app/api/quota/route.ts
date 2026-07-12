import { NextResponse } from "next/server";
import { isDemoMode, isMockMode } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { getQuota } from "@/lib/quota";
import { PLANS } from "@/lib/stripe/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight read-only quota view for the screener header ("X screens left").
// NOT billable. Fails soft to the free allotment so the badge never blocks the UI:
//  - demo mode        → the seeded demo profile's real numbers (demo_closehound)
//  - mock mode        → free limit, nothing used
//  - signed-out (live)→ free limit (what they'd get on sign-up)
//  - signed-in (live) → real {used, limit, credits, plan}
//  - read error       → 503; the client just hides the badge.
export async function GET() {
  const free = { used: 0, limit: PLANS.free.screens, credits: 0, plan: PLANS.free.id };

  // Demo implies mock, so check demo FIRST: the badge should reflect the
  // seeded demo profile, not the mock-mode free defaults.
  if (isMockMode() && !isDemoMode()) {
    return NextResponse.json(free);
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ...free, anon: true });
  }

  try {
    const q = await getQuota(user.id);
    return NextResponse.json({ used: q.used, limit: q.limit, credits: q.credits, plan: q.plan });
  } catch {
    return NextResponse.json({ error: "quota unavailable" }, { status: 503 });
  }
}
