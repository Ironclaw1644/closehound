// Centralized environment access. Keep all secret reads server-side; only
// NEXT_PUBLIC_* values are safe to reference from client components.

function truthy(v: string | undefined): boolean {
  return v === "1" || v?.toLowerCase() === "true";
}

/**
 * MOCK_MODE serves fixture data so the whole app builds, tests, and demos with
 * ZERO live (billable) API calls. Enabled when either MOCK_MODE (server) or
 * NEXT_PUBLIC_MOCK_MODE (client-visible) is "1" or "true".
 */
export const MOCK_MODE =
  truthy(process.env.MOCK_MODE) || truthy(process.env.NEXT_PUBLIC_MOCK_MODE);

export function isMockMode(): boolean {
  return MOCK_MODE;
}
