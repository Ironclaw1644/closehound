import "server-only";
import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/env";
import { getUser } from "@/lib/supabase/server";
import { assertQuota } from "@/lib/quota";
import { ensureProfile } from "@/lib/auth";

/**
 * The bankruptcy guard. Run BEFORE any billable HUD/RentCast call. In MOCK_MODE
 * there are no billable calls, so screening is open (great for demos). In live
 * mode it requires auth + quota; a user is structurally incapable of running up
 * a bill we have to eat. Returns the userId to meter, or a 401/402 to return.
 */
export async function guardBillable(): Promise<{ userId: string | null } | NextResponse> {
  if (isMockMode()) return { userId: null };

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to screen live data." }, { status: 401 });
  }
  await ensureProfile(user.id);
  const q = await assertQuota(user.id);
  if (!q.ok) {
    return NextResponse.json(
      { error: "Monthly screen limit reached — upgrade to keep screening.", used: q.used, limit: q.limit },
      { status: 402 }
    );
  }
  return { userId: user.id };
}
