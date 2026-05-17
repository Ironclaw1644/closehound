import { NextResponse, type NextRequest } from "next/server";
import { verifyOnboardingToken } from "@/lib/onboarding/token";
import { setClaimSessionOnResponse } from "@/lib/onboarding/session";
import {
  findPreviewSiteById,
  markPreviewSiteClaimed,
} from "@/lib/onboarding/storage";

// GET /claim/<token>
//
// Buyer clicks the link from their claim email. We:
//   1. Verify the JWT (signed by ONBOARDING_TOKEN_SECRET, valid issuer +
//      audience, not expired).
//   2. Confirm the walkperro.preview_sites row still exists.
//   3. Stamp `claimed_at` on first claim.
//   4. Set the 30-day session cookie scoped to /claim/* so subsequent edits
//      don't need the token in the URL.
//   5. Redirect to /claim/<token>/edit.
//
// On any failure, redirect to /claim/refresh with a status hint so the buyer
// can request a new link. We deliberately use a Route Handler instead of a
// Server Component so we can call NextResponse.cookies.set() — Next.js 15
// disallows cookie modification from Pages and Layouts.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const origin = request.nextUrl.origin;

  const payload = await verifyOnboardingToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/claim/refresh?status=expired", origin));
  }

  const site = await findPreviewSiteById(payload.previewSiteId);
  if (!site) {
    return NextResponse.redirect(new URL("/claim/refresh?status=not-found", origin));
  }

  if (!site.claimed_at) {
    // Best-effort: don't block redirect if this fails — the editor still
    // works. Logged in storage helper if it errors.
    await markPreviewSiteClaimed({ previewSiteId: site.id }).catch(() => {});
  }

  const editUrl = new URL(
    `/claim/${encodeURIComponent(token)}/edit`,
    origin
  );
  const response = NextResponse.redirect(editUrl);
  setClaimSessionOnResponse(response, token);
  return response;
}
