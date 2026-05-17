import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomUUID } from "node:crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding-token mint + verify.
//
// We sign a short JWT carrying { previewSiteId, leadId, email, jti }. The
// token doubles as the URL parameter on /claim/<token>. We persist the jti
// to walkperro.onboarding_tokens so we can revoke or look up the token from
// the dashboard or for /claim/refresh flows.
// ─────────────────────────────────────────────────────────────────────────────

const ISSUER = "walkperro.com";
const AUDIENCE = "walkperro.com/claim";
const DEFAULT_TTL_DAYS = 30;

function getSecret(): Uint8Array {
  const secret =
    process.env.ONBOARDING_TOKEN_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";
  if (!secret || secret.length < 16) {
    throw new Error(
      "ONBOARDING_TOKEN_SECRET is missing or too short (need 32+ chars). " +
        "Set ONBOARDING_TOKEN_SECRET in .env.local."
    );
  }
  return new TextEncoder().encode(secret);
}

export type OnboardingTokenPayload = JWTPayload & {
  previewSiteId: string;
  leadId: string | null;
  email: string;
  jti: string;
};

export async function mintOnboardingToken(opts: {
  previewSiteId: string;
  leadId: string | null;
  email: string;
  ttlDays?: number;
}): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const ttl = opts.ttlDays ?? DEFAULT_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttl * 24 * 60 * 60 * 1000);
  const jti = randomUUID();

  const token = await new SignJWT({
    previewSiteId: opts.previewSiteId,
    leadId: opts.leadId,
    email: opts.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .setJti(jti)
    .sign(getSecret());

  return { token, jti, expiresAt };
}

export async function verifyOnboardingToken(
  token: string
): Promise<OnboardingTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (
      typeof payload.previewSiteId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.jti !== "string"
    ) {
      return null;
    }
    return {
      ...payload,
      previewSiteId: payload.previewSiteId,
      leadId: typeof payload.leadId === "string" ? payload.leadId : null,
      email: payload.email,
      jti: payload.jti,
    };
  } catch {
    return null;
  }
}
