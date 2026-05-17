import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { verifyOnboardingToken, type OnboardingTokenPayload } from "@/lib/onboarding/token";

// Onboarding sessions are scoped to /claim/* — once the customer clicks the
// emailed link with the token, we set a 30-day session cookie holding the same
// JWT. Subsequent navigation inside /claim resolves the cookie instead of the
// URL parameter.

const COOKIE_NAME = "wp_claim_session";
const COOKIE_PATH = "/claim";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

const COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  path: COOKIE_PATH,
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  maxAge: MAX_AGE_SECONDS,
};

// Server Action / Route Handler usage. Next.js 15 allows cookies().set()
// here but rejects it from Pages and Layouts.
export async function setClaimSession(token: string): Promise<void> {
  const store = await cookies();
  store.set({ ...COOKIE_OPTIONS, value: token });
}

// Route Handler convenience — set the cookie directly on a NextResponse so we
// can `return NextResponse.redirect(...)` and have the cookie ride along on
// the same response. Works in Pages-incompatible contexts where the implicit
// cookies() write would be silently dropped.
export function setClaimSessionOnResponse(
  response: NextResponse,
  token: string
): void {
  response.cookies.set({ ...COOKIE_OPTIONS, value: token });
}

export async function clearClaimSession(): Promise<void> {
  const store = await cookies();
  store.delete({ name: COOKIE_NAME, path: COOKIE_PATH });
}

export async function readClaimSession(): Promise<OnboardingTokenPayload | null> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return await verifyOnboardingToken(cookie.value);
}

// Resolve in the order of: explicit URL token → cookie. Returns the verified
// payload, or null if both are missing/invalid.
export async function resolveClaimAuth(
  urlToken: string | null
): Promise<OnboardingTokenPayload | null> {
  if (urlToken) {
    const payload = await verifyOnboardingToken(urlToken);
    if (payload) return payload;
  }
  return readClaimSession();
}
