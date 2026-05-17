import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let client: SupabaseClient<Database> | undefined;
let adminClient: SupabaseClient<Database> | undefined;

// Supabase migrated from JWT-format keys to prefix-format keys in 2025:
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
//   SUPABASE_SERVICE_ROLE_KEY      → SUPABASE_SECRET_KEY
// We read the new name first, fall back to the legacy name. Lets us support
// both during the rollout (Vercel may have either set) without code changes
// at deploy time.

function readEnv(...names: string[]) {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return v;
  }
  return undefined;
}

function requireEnv(...names: string[]) {
  const v = readEnv(...names);
  if (!v) {
    throw new Error(
      `Missing required Supabase environment variable: ${names.join(" or ")}`
    );
  }
  return v;
}

const PUBLISHABLE_NAMES = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const SECRET_NAMES = [
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && readEnv(...PUBLISHABLE_NAMES)
  );
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && readEnv(...SECRET_NAMES)
  );
}

export function getSupabaseClient() {
  if (client) {
    return client;
  }

  client = createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(...PUBLISHABLE_NAMES),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return client;
}

export const supabase = getSupabaseClient;

export function getClosehoundSchema() {
  return getSupabaseClient().schema("closehound");
}

export function getSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  adminClient = createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(...SECRET_NAMES),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return adminClient;
}
