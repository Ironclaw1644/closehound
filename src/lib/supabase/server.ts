import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { isDemoMode } from "@/lib/env";
import { getClosehoundAdminSchema, getSchemaName } from "@/lib/supabase";

function url(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
  return v;
}

function anonKey(): string {
  const v =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!v) throw new Error("Supabase publishable key missing");
  return v;
}

/** Cookie-bound Supabase client for server components + route handlers. */
export async function getServerSupabase() {
  const store = await cookies();
  return createServerClient<Database>(url(), anonKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Server Components can't set cookies; middleware refreshes the session.
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* read-only context */
        }
      },
    },
  });
}

/** REAL Supabase Auth lookup. Do NOT call from app code — route everything
 *  through @/lib/auth/getSessionUser, which handles the DEMO_MODE synthetic
 *  user (this returns null in demo: there is no session). */
export async function getUser() {
  try {
    const sb = await getServerSupabase();
    const { data } = await sb.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

/** Data client scoped to the active schema. Live: the cookie-bound authed
 *  client against `closehound` (RLS-enforced per user). DEMO_MODE: there is no
 *  session (the anon role has zero grants on demo_closehound), so this returns
 *  the service-role client scoped to demo_closehound instead — that schema
 *  holds only synthetic data and resets nightly. */
export async function getServerClosehound() {
  if (isDemoMode()) return getClosehoundAdminSchema();
  return (await getServerSupabase()).schema(getSchemaName());
}
