import "server-only";
import { getClosehoundAdminSchema } from "@/lib/supabase";
import { planFor } from "@/lib/stripe/plans";

export function currentPeriod(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export interface QuotaState {
  ok: boolean;
  used: number;
  limit: number;
  plan: string;
}

/**
 * Read-only quota view (for /account). FAIL-CLOSED: throws on any read error so
 * callers never default a broken read to "under quota".
 */
export async function getQuota(userId: string): Promise<QuotaState> {
  const db = getClosehoundAdminSchema();
  const { data: profile, error: pe } = await db
    .from("profiles")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (pe) throw new Error(`profiles read failed: ${pe.message}`);

  const plan = planFor(profile?.plan, profile?.status);
  const { data: usage, error: ue } = await db
    .from("usage")
    .select("screens_used")
    .eq("user_id", userId)
    .eq("period_month", currentPeriod())
    .maybeSingle();
  if (ue) throw new Error(`usage read failed: ${ue.message}`);

  const used = usage?.screens_used ?? 0;
  return { ok: used < plan.screens, used, limit: plan.screens, plan: plan.id };
}

/**
 * Atomically RESERVE `count` screens BEFORE any billable call. Backed by the
 * closehound.reserve_screens DB function, which increments usage only if it
 * stays within the plan limit (single UPDATE — no TOCTOU race). FAIL-CLOSED:
 * throws if the plan read or the reservation errors, so we refuse to bill when
 * we can't prove the user is under quota.
 */
export async function reserveScreens(
  userId: string,
  count: number
): Promise<{ granted: boolean; limit: number; plan: string }> {
  const db = getClosehoundAdminSchema();
  const { data: profile, error: pe } = await db
    .from("profiles")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (pe) throw new Error(`profiles read failed: ${pe.message}`);

  const plan = planFor(profile?.plan, profile?.status);
  const { data, error } = await db.rpc("reserve_screens", {
    p_user: userId,
    p_period: currentPeriod(),
    p_limit: plan.screens,
    p_count: count,
  });
  if (error) throw new Error(`reserve failed: ${error.message}`);

  // The function returns the new screens_used on success, NULL when denied.
  return { granted: data != null, limit: plan.screens, plan: plan.id };
}

/** Refund a reservation when the billable screen fails after reserving. Best-effort. */
export async function refundScreens(userId: string, count: number): Promise<void> {
  try {
    const db = getClosehoundAdminSchema();
    await db.rpc("refund_screens", { p_user: userId, p_period: currentPeriod(), p_count: count });
  } catch {
    /* best-effort; over-counting fails safe (toward the owner) */
  }
}
