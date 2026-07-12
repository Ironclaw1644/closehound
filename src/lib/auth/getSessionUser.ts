import "server-only";
import { isDemoMode } from "@/lib/env";
import { getUser } from "@/lib/supabase/server";

/**
 * The ONE auth entry point for app code. Every "who is the current user?"
 * question flows through here:
 *
 *   • DEMO_MODE=1 → a fixed synthetic user, no auth.users row, no Supabase
 *     Auth call. Every visitor is "logged in" as the demo user, so the app
 *     routes that normally require login just work. Their rows live in the
 *     demo_closehound schema (user_id is a plain text/uuid column — no FK).
 *   • live → the real cookie-bound Supabase Auth lookup.
 *
 * Do not import getUser from @/lib/supabase/server anywhere else.
 */

export const DEMO_USER_ID = "00000000-0000-0000-0000-00000000demo";
export const DEMO_USER_EMAIL = "demo@walkperro.com";

export interface SessionUser {
  id: string;
  email: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isDemoMode()) {
    return { id: DEMO_USER_ID, email: DEMO_USER_EMAIL };
  }
  const user = await getUser();
  return user ? { id: user.id, email: user.email ?? null } : null;
}
