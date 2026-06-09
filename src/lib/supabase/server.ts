import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

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

export async function getUser() {
  try {
    const sb = await getServerSupabase();
    const { data } = await sb.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

/** Authed client scoped to the closehound schema (RLS-enforced). */
export async function getServerClosehound() {
  return (await getServerSupabase()).schema("closehound");
}
