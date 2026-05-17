import { NextResponse } from "next/server";
import {
  checkDomainAvailability,
  checkSuggestions,
  generateSuggestions,
  isValidDomain,
  type DomainCheck,
} from "@/lib/domain/rdap";

// Domain availability + suggestion lookup powered by free public RDAP servers
// (rdap.org). Two query modes:
//
//   GET /api/domain/check?domain=tomspaint.com
//     → checks one specific domain. Returns { result: DomainCheck | null }.
//
//   GET /api/domain/check?q=tomspaint
//     → generates ~8 suggestions and returns availability for all of them.
//     Returns { results: DomainCheck[] }.
//
// Edge runtime; cached at the Vercel edge for 5 minutes per query.

export const runtime = "edge";
export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const domain = url.searchParams.get("domain")?.trim().toLowerCase();
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  if (domain) {
    if (!isValidDomain(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format." },
        { status: 400 }
      );
    }
    const result = await checkDomainAvailability(domain);
    if (!result) {
      // Network/RDAP failure — return 503 so the client can retry, not 200
      // with a misleading shape.
      return NextResponse.json(
        { error: "Lookup failed. Please retry." },
        { status: 503 }
      );
    }
    return NextResponse.json({ result } satisfies { result: DomainCheck });
  }

  if (q) {
    if (q.length < 2 || q.length > 60) {
      return NextResponse.json(
        { error: "Search query must be 2-60 characters." },
        { status: 400 }
      );
    }
    const candidates = generateSuggestions(q, 8);
    if (candidates.length === 0) {
      return NextResponse.json({ results: [] satisfies DomainCheck[] });
    }
    const results = await checkSuggestions(candidates);
    return NextResponse.json({ results } satisfies { results: DomainCheck[] });
  }

  return NextResponse.json(
    { error: "Pass either ?domain=<full-domain> or ?q=<search-query>." },
    { status: 400 }
  );
}
