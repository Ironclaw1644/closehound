import "server-only";
import { getClosehoundAdminSchema, hasSupabaseAdminEnv } from "@/lib/supabase";

/** Ensure a profiles row exists for a user (idempotent; never overwrites).
 *  Surfaces the real error instead of swallowing it — a silent failure here
 *  (e.g. an unregistered/stale service key 401ing) cascades into reserve_screens
 *  FK-failing and an opaque "Screen failed", which is exactly what masked a
 *  broken prod SUPABASE_SECRET_KEY for hours. Fail loud, fail closed. */
export async function ensureProfile(userId: string): Promise<void> {
  if (!hasSupabaseAdminEnv()) return;
  const db = getClosehoundAdminSchema();
  const { error } = await db
    .from("profiles")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw new Error(`ensureProfile failed: ${error.message}`);
}
