"""Promote hot, no-website rows from `new_business_leads` → `closehound.leads`.

The Python module's table (`new_business_leads`) is the raw + enriched landing
zone. The existing operator dashboard (TS Next.js) reads from `closehound.leads`.
This script bridges them: it pulls hot+no-website rows from the landing table,
re-derives the industry from the business name (using `naics_filter`), and
inserts them into `leads` with `lead_source` tagged per state.

Idempotent: skips rows whose business_name + city already exists with the same
lead_source. Re-running picks up new filings without duplicating.

Usage:
    cd lead_ingestion && uv run python scripts/promote_to_leads.py
    cd lead_ingestion && uv run python scripts/promote_to_leads.py --dry-run
"""

from __future__ import annotations

import argparse
import sys
from typing import Any, cast

from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.naics_filter import industry_for, infer_from_name
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


# Maps the new_business_leads.source enum -> the lead_source value we use in
# closehound.leads (lowercased, matches the existing 'google_places' / 'seed'
# pattern there).
_SOURCE_LABEL = {
    "FL_SUNBIZ": "fl_sunbiz",
    "NY_DOS": "ny_dos",
    "GA_SOS": "ga_sos",
    "KY_SOS": "ky_sos",
}


def _pick_industry(naics_code: str | None, business_name: str) -> str | None:
    """Mirror the orchestrator's industry selection.

    `industry_for(naics_code)` is the explicit-code path; if NAICS is ambiguous
    (e.g. 238220 = HVAC or plumbing) we use name inference to disambiguate.
    """
    # Always prefer name-inferred industry — it's the more specific signal.
    # NAICS 238220 explicitly is HVAC, but plumbing businesses also live there;
    # the regex catches "plumbing" / "electric" before falling back to NAICS.
    _, inferred_industry = infer_from_name(business_name)
    if inferred_industry:
        return inferred_industry
    return industry_for(naics_code)


def _fetch_hot_no_website_rows(client: Any, limit: int = 5000) -> list[dict[str, Any]]:
    res = (
        client.schema("closehound")
        .table("new_business_leads")
        .select(
            "business_name,principal_address,filing_date,priority_score,"
            "naics_code,source,domain_found,contact_phone,contact_email"
        )
        .eq("priority_tier", "hot")
        .eq("has_website", False)
        .order("priority_score", desc=True)
        .order("filing_date", desc=True)
        .limit(limit)
        .execute()
    )
    return cast(list[dict[str, Any]], res.data or [])


def _existing_keys(client: Any, lead_sources: set[str]) -> set[tuple[str, str | None]]:
    """Pull existing (lower(company_name), city) pairs we'd otherwise duplicate."""
    if not lead_sources:
        return set()
    res = (
        client.schema("closehound")
        .table("leads")
        .select("company_name,city,lead_source")
        .in_("lead_source", list(lead_sources))
        .execute()
    )
    out: set[tuple[str, str | None]] = set()
    for row in res.data or []:
        name = (row.get("company_name") or "").strip().lower()
        city = (row.get("city") or "").strip().lower() or None
        out.add((name, city))
    return out


def _to_lead_row(src: dict[str, Any]) -> dict[str, Any] | None:
    business_name = (src.get("business_name") or "").strip()
    if not business_name:
        return None
    addr = src.get("principal_address") or {}
    city = (addr.get("city") or "").strip() or None
    industry = _pick_industry(src.get("naics_code"), business_name)
    score = src.get("priority_score")
    return {
        "company_name": business_name,
        "city": city,
        "industry": industry,
        # has_website is the whole point — these are the false ones.
        "has_website": False,
        "status": "new",
        "lead_source": _SOURCE_LABEL.get(src.get("source") or "", src.get("source")),
        "lead_score": score,
        # Contact enrichment results (None when not yet found). Re-run
        # promote after backfill_contacts to update existing rows.
        "phone": src.get("contact_phone"),
        "contact_email": src.get("contact_email"),
    }


def promote(*, dry_run: bool, limit: int = 5000) -> dict[str, int]:
    client = get_client()
    rows = _fetch_hot_no_website_rows(client, limit=limit)
    logger.info("promote.fetched", extra={"rows": len(rows)})
    if not rows:
        return {"fetched": 0, "inserted": 0, "skipped_dupe": 0, "skipped_invalid": 0}

    candidates: list[dict[str, Any]] = []
    skipped_invalid = 0
    sources_used: set[str] = set()
    for src in rows:
        lead = _to_lead_row(src)
        if not lead:
            skipped_invalid += 1
            continue
        candidates.append(lead)
        if lead.get("lead_source"):
            sources_used.add(lead["lead_source"])

    existing = _existing_keys(client, sources_used)
    fresh: list[dict[str, Any]] = []
    skipped_dupe = 0
    for lead in candidates:
        key = (lead["company_name"].lower(), (lead["city"] or "").lower() or None)
        if key in existing:
            skipped_dupe += 1
            continue
        fresh.append(lead)

    inserted = 0
    if fresh and not dry_run:
        # Insert in chunks of 500 to keep request size sane.
        for i in range(0, len(fresh), 500):
            chunk = fresh[i : i + 500]
            res = (
                client.schema("closehound")
                .table("leads")
                .insert(chunk)
                .execute()
            )
            inserted += len(res.data or [])
    elif fresh and dry_run:
        inserted = 0
        logger.info("promote.dry_run_sample", extra={"sample": fresh[:5]})

    summary = {
        "fetched": len(rows),
        "inserted": inserted,
        "would_insert": len(fresh) if dry_run else inserted,
        "skipped_dupe": skipped_dupe,
        "skipped_invalid": skipped_invalid,
    }
    logger.info("promote.done", extra=summary)
    return summary


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="promote_to_leads")
    p.add_argument("--dry-run", action="store_true", help="Don't insert; report counts only.")
    p.add_argument("--limit", type=int, default=5000)
    args = p.parse_args(argv)
    promote(dry_run=args.dry_run, limit=args.limit)
    return 0


if __name__ == "__main__":
    sys.exit(main())
