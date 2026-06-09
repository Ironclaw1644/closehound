import "server-only";
import { getClosehoundAdminSchema, hasSupabaseAdminEnv } from "@/lib/supabase";

/** Ensure a profiles row exists for a user (idempotent; never overwrites). */
export async function ensureProfile(userId: string): Promise<void> {
  if (!hasSupabaseAdminEnv()) return;
  const db = getClosehoundAdminSchema();
  await db.from("profiles").upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
}
