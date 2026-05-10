// Map raw error strings from Supabase/PostgREST/Vercel/Stripe/Resend to
// readable operator-facing copy. The dashboard previously surfaced
// `err.message` directly, which often shows internal codes ("23503: foreign
// key violation on table…"). This wrapper translates common cases.
//
// Pattern: cheapest possible mapping — a short table of known prefixes that
// any operator on the team can extend. Falls back to the original message
// when nothing matches.

type Mapping = { match: RegExp; rewrite: (raw: string) => string };

const MAPPINGS: Mapping[] = [
  // Supabase/PostgREST: foreign key violations
  {
    match: /violates foreign key constraint/i,
    rewrite: () =>
      "Couldn't save — a referenced row no longer exists. Reload and try again.",
  },
  // Supabase/PostgREST: unique violations
  {
    match: /duplicate key value violates unique constraint/i,
    rewrite: () => "This already exists. Try a different value.",
  },
  // Supabase/PostgREST: RLS denial
  {
    match: /new row violates row-level security/i,
    rewrite: () =>
      "Permission denied. The dashboard needs the service-role key configured.",
  },
  // PostgREST: missing env / not configured
  {
    match: /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY/,
    rewrite: () =>
      "Supabase service-role key not configured. Set SUPABASE_SECRET_KEY in .env.local.",
  },
  // Stripe API
  {
    match: /Invalid API Key provided/i,
    rewrite: () => "Stripe API key invalid — rotate STRIPE_SECRET_KEY.",
  },
  // Resend
  {
    match: /API key is invalid/i,
    rewrite: () => "Resend API key invalid — check RESEND_API_KEY.",
  },
  // Vercel REST
  {
    match: /Not authorized: Trying to access resource/i,
    rewrite: () =>
      "Vercel token doesn't have access to this scope. Rotate VERCEL_API_TOKEN.",
  },
  {
    match: /forbidden.*team|team.*forbidden/i,
    rewrite: () =>
      "Vercel token doesn't have team access. Mint a Full Account token.",
  },
  // Network-ish
  {
    match: /Failed to fetch|NetworkError|ECONNREFUSED|ETIMEDOUT/i,
    rewrite: () => "Couldn't reach the server. Check your connection and retry.",
  },
  // Token / auth
  {
    match: /JWT expired|token expired/i,
    rewrite: () => "Session expired. Refresh the page to sign back in.",
  },
];

export function humanizeOperatorError(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : JSON.stringify(err);
  for (const { match, rewrite } of MAPPINGS) {
    if (match.test(raw)) return rewrite(raw);
  }
  // Last resort: trim Postgres error codes like "ERROR: 23503: …" or
  // "PostgrestError: ".
  const trimmed = raw
    .replace(/^ERROR:\s*\d{5}:\s*/, "")
    .replace(/^PostgrestError:\s*/, "")
    .trim();
  return trimmed || "Something went wrong.";
}
