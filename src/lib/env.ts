// Centralized environment access. Keep all secret reads server-side; only
// NEXT_PUBLIC_* values are safe to reference from client components.

function truthy(v: string | undefined): boolean {
  return v === "1" || v?.toLowerCase() === "true";
}

/**
 * DEMO_MODE turns the deployment into a public walkthrough:
 *   • every visitor is a fixed synthetic logged-in user (no Supabase Auth)
 *   • all reads/writes target the demo_closehound schema (nightly reset)
 *   • Stripe checkout/portal disabled, Resend emails stubbed to console
 *   • tourguide overlay mounts, X-Robots-Tag: noindex
 * Enabled when DEMO_MODE (server) or NEXT_PUBLIC_DEMO_MODE (client-visible —
 * required for the disabled billing CTAs to render) is "1" or "true".
 * A demo deployment should set BOTH.
 */
export function isDemoMode(): boolean {
  return truthy(process.env.DEMO_MODE) || truthy(process.env.NEXT_PUBLIC_DEMO_MODE);
}

/** Import-time snapshot for client components (NEXT_PUBLIC_DEMO_MODE). */
export const DEMO_MODE = isDemoMode();

/**
 * MOCK_MODE serves fixture data so the whole app builds, tests, and demos with
 * ZERO live (billable) API calls. Enabled when either MOCK_MODE (server) or
 * NEXT_PUBLIC_MOCK_MODE (client-visible) is "1" or "true".
 *
 * DEMO_MODE implies MOCK_MODE: a public demo must never hit billable HUD /
 * RentCast endpoints. Seeded demo_closehound cache rows serve the curated
 * markets; any other ZIP falls through to the deterministic synthetic data.
 */
/** Dynamic so runtime/test env changes are honored (clients call this). */
export function isMockMode(): boolean {
  return (
    truthy(process.env.MOCK_MODE) ||
    truthy(process.env.NEXT_PUBLIC_MOCK_MODE) ||
    isDemoMode()
  );
}

/** Import-time snapshot for client-side display (NEXT_PUBLIC_MOCK_MODE). */
export const MOCK_MODE = isMockMode();
