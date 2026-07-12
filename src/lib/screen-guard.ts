import "server-only";
import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { reserveScreens } from "@/lib/quota";
import { ensureProfile } from "@/lib/auth";

/**
 * The bankruptcy guard. Run BEFORE any billable HUD/RentCast call, passing the
 * number of billable units (ZIPs) the request will fan out to. In MOCK_MODE
 * there are no billable calls, so screening is open. In live mode it requires
 * auth and ATOMICALLY RESERVES `count` screens against quota before returning —
 * a user is structurally incapable of running up a bill. FAIL-CLOSED: if the
 * quota service errors we refuse (503), never bill on uncertainty.
 *
 * Returns { userId } on success; the caller MUST refund on downstream failure.
 */
export async function guardBillable(count: number): Promise<{ userId: string | null } | NextResponse> {
  // DEMO_MODE implies mock mode (isMockMode() → true), so the demo never
  // reaches the auth/quota path below — screening is open and unbillable.
  if (isMockMode()) return { userId: null };

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to screen live data." }, { status: 401 });
  }

  let granted: boolean;
  let limit: number;
  try {
    // Profile must exist before reserve_screens (usage FKs to profiles). Both
    // run through the service-role admin client; an auth/permission failure here
    // means we cannot prove quota, so we refuse rather than risk a runaway bill.
    await ensureProfile(user.id);
    const r = await reserveScreens(user.id, count);
    granted = r.granted;
    limit = r.limit;
  } catch (e) {
    console.error("[guardBillable] quota/profile error:", e);
    return NextResponse.json({ error: "Quota service unavailable — try again." }, { status: 503 });
  }

  if (!granted) {
    return NextResponse.json(
      { error: "Monthly screen limit reached — upgrade to keep screening.", limit },
      { status: 402 }
    );
  }
  return { userId: user.id };
}
