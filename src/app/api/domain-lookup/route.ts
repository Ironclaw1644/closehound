import { NextResponse } from "next/server";
import { findPreviewSiteByCustomDomain } from "@/lib/onboarding/storage";

// Domain → slug lookup used by the multi-tenant middleware. Public route
// because middleware can't carry secret env vars to the lookup; we keep the
// response surface tiny (just `{slug}` or `null`) so this is safe to expose.
//
// The caller is /src/middleware.ts via fetch with `next: { revalidate: 300 }`,
// which means Vercel Edge caches the response 5 min — plenty for typical
// custom-domain traffic.

export const runtime = "nodejs";
export const revalidate = 300; // 5 min

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = (url.searchParams.get("host") ?? "").trim().toLowerCase();
  if (!host) {
    return NextResponse.json({ slug: null }, { status: 400 });
  }

  // Reject obvious bogus inputs before hitting the DB.
  if (!/^(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,}$/i.test(host)) {
    return NextResponse.json({ slug: null });
  }

  try {
    const site = await findPreviewSiteByCustomDomain(host);
    if (!site || !site.is_published) {
      return NextResponse.json({ slug: null });
    }
    return NextResponse.json({ slug: site.slug });
  } catch {
    return NextResponse.json({ slug: null });
  }
}
