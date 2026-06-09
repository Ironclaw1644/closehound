import "server-only";
import { getClosehoundAdminSchema, hasSupabaseAdminEnv } from "@/lib/supabase";
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

export async function getQuota(userId: string): Promise<QuotaState> {
  const db = getClosehoundAdminSchema();
  const { data: profile } = await db
    .from("profiles")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  const plan = planFor(profile?.plan, profile?.status);
  const { data: usage } = await db
    .from("usage")
    .select("screens_used")
    .eq("user_id", userId)
    .eq("period_month", currentPeriod())
    .maybeSingle();
  const used = usage?.screens_used ?? 0;
  return { ok: used < plan.screens, used, limit: plan.screens, plan: plan.id };
}

/** Quota check run BEFORE any billable call. */
export async function assertQuota(userId: string): Promise<QuotaState> {
  return getQuota(userId);
}

/** Increment usage only AFTER a successful billable screen. */
export async function incrementUsage(userId: string, by = 1): Promise<void> {
  if (!hasSupabaseAdminEnv()) return;
  const db = getClosehoundAdminSchema();
  const period = currentPeriod();
  const { data } = await db
    .from("usage")
    .select("screens_used")
    .eq("user_id", userId)
    .eq("period_month", period)
    .maybeSingle();
  await db
    .from("usage")
    .upsert({ user_id: userId, period_month: period, screens_used: (data?.screens_used ?? 0) + by });
}
