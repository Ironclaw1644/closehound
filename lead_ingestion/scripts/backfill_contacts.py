"""Backfill contact_phone / contact_email on existing new_business_leads rows.

Runs the free-tier contact_check enrichment over rows that haven't been
attempted yet. Updates both:
  - new_business_leads (so re-runs don't re-attempt)
  - closehound.leads (so the dashboard reflects the new data)

Idempotent: skips rows where contact_checked_at IS NOT NULL by default.
Use --force to re-attempt everything.

Usage:
    cd lead_ingestion && uv run python scripts/backfill_contacts.py
    cd lead_ingestion && uv run python scripts/backfill_contacts.py --limit 50
    cd lead_ingestion && uv run python scripts/backfill_contacts.py --force
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from typing import Any, cast

from lead_ingestion.enrichment.contact_check import find_contact
from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


# How new_business_leads.source maps to closehound.leads.lead_source.
_SOURCE_LABEL = {
    "FL_SUNBIZ": "fl_sunbiz",
    "NY_DOS": "ny_dos",
    "GA_SOS": "ga_sos",
    "KY_SOS": "ky_sos",
}


def _fetch_targets(
    client: Any, *, limit: int, force: bool
) -> list[dict[str, Any]]:
    q = (
        client.schema("closehound")
        .table("new_business_leads")
        .select(
            "id,business_name,principal_address,source,domain_found,"
            "contact_phone,contact_email,contact_checked_at,priority_tier,has_website"
        )
        .eq("priority_tier", "hot")
        .limit(limit)
    )
    if not force:
        q = q.is_("contact_checked_at", "null")
    res = q.execute()
    return cast(list[dict[str, Any]], res.data or [])


def _update_nbl(client: Any, row_id: str, phone: str | None, email: str | None) -> None:
    client.schema("closehound").table("new_business_leads").update(
        {
            "contact_phone": phone,
            "contact_email": email,
            "contact_checked_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", row_id).execute()


def _update_lead(
    client: Any, business_name: str, city: str | None, source: str,
    phone: str | None, email: str | None,
) -> None:
    """Update the matching row in closehound.leads."""
    if not phone and not email:
        return
    lead_source = _SOURCE_LABEL.get(source, source.lower() if source else None)
    if not lead_source:
        return
    update: dict[str, Any] = {}
    if phone:
        update["phone"] = phone
    if email:
        update["contact_email"] = email
    if not update:
        return
    q = (
        client.schema("closehound")
        .table("leads")
        .update(update)
        .eq("company_name", business_name)
        .eq("lead_source", lead_source)
    )
    if city:
        q = q.eq("city", city)
    q.execute()


def backfill(*, limit: int, force: bool) -> dict[str, int]:
    client = get_client()
    targets = _fetch_targets(client, limit=limit, force=force)
    logger.info("backfill_contacts.start", extra={"targets": len(targets), "force": force})

    found_phone = 0
    found_email = 0
    processed = 0
    for row in targets:
        name = (row.get("business_name") or "").strip()
        if not name:
            continue
        addr = row.get("principal_address") or {}
        city = (addr.get("city") or "").strip() or None
        domain = row.get("domain_found")
        try:
            phone, email = find_contact(name, city, domain)
        except Exception as exc:
            logger.warning(
                "backfill_contacts.error",
                extra={"biz": name, "err": repr(exc)},
            )
            phone, email = (None, None)
        processed += 1
        if phone:
            found_phone += 1
        if email:
            found_email += 1
        _update_nbl(client, row["id"], phone, email)
        if phone or email:
            _update_lead(client, name, city, row.get("source") or "", phone, email)
        if processed % 25 == 0:
            logger.info(
                "backfill_contacts.progress",
                extra={
                    "processed": processed,
                    "total": len(targets),
                    "phone_hits": found_phone,
                    "email_hits": found_email,
                },
            )

    summary = {
        "processed": processed,
        "phone_hits": found_phone,
        "email_hits": found_email,
        "phone_yield_pct": (found_phone * 100 // processed) if processed else 0,
        "email_yield_pct": (found_email * 100 // processed) if processed else 0,
    }
    logger.info("backfill_contacts.done", extra=summary)
    return summary


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="backfill_contacts")
    p.add_argument("--limit", type=int, default=1000)
    p.add_argument(
        "--force",
        action="store_true",
        help="Re-attempt rows whose contact_checked_at is already set.",
    )
    args = p.parse_args(argv)
    backfill(limit=args.limit, force=args.force)
    return 0


if __name__ == "__main__":
    sys.exit(main())
