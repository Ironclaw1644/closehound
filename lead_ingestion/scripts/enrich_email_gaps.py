"""Phase D — fill email gaps for leads that already have a phone.

Non-overlapping with phase C (which targets leads with neither). Operates
on leads where `contact_phone IS NOT NULL AND contact_email IS NULL`.

Strategy: search Bing for `"<business name>" <city> email contact` and
scrape the top results for any email matching the business or owner. Bing
is the primary because DDG soft-rate-limits aggressively in our zone.
"""

from __future__ import annotations

import argparse
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any, cast

from lead_ingestion.enrichment.contact_check import (
    _bing_results,
    _is_useful_result,
    _scrape_url_with_verify,
    _polite_sleep,
)
from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


def _search_email_for(row: dict[str, Any]) -> tuple[str, str | None]:
    biz = (row.get("business_name") or "").strip()
    addr = row.get("principal_address") or {}
    city = (addr.get("city") or "").strip() or None
    state = (addr.get("state") or row.get("state") or "").strip() or None
    if not biz:
        return (row["id"], None)
    queries = [f'"{biz}" {city or ""} email contact'.strip()]
    if city:
        queries.append(f'"{biz}" {city} {state or ""}'.strip())
    for q in queries:
        try:
            urls = _bing_results(q, timeout_s=10.0)
        except Exception:
            urls = []
        useful = [u for u in urls if _is_useful_result(u)][:2]
        for url in useful:
            try:
                _phone, email, _v = _scrape_url_with_verify(
                    url, verify_city=city, verify_state=state, preferred_domain=row.get("domain_found"),
                )
            except Exception:
                email = None
            if email:
                return (row["id"], email)
        time.sleep(1.0)
    return (row["id"], None)


def _fetch_targets(client: Any, sources: list[str], limit: int) -> list[dict[str, Any]]:
    res = (
        client.schema("closehound")
        .table("new_business_leads")
        .select(
            "id,business_name,principal_address,source,domain_found,"
            "contact_phone,contact_email,naics_code,state"
        )
        .in_("source", sources)
        .not_.is_("contact_phone", "null")
        .is_("contact_email", "null")
        .limit(limit)
        .execute()
    )
    return cast(list[dict[str, Any]], res.data or [])


def _update(client: Any, row_id: str, email: str) -> None:
    client.schema("closehound").table("new_business_leads").update(
        {"contact_email": email, "contact_checked_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", row_id).execute()


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="enrich_email_gaps")
    p.add_argument("--limit", type=int, default=500)
    p.add_argument("--workers", type=int, default=2)
    args = p.parse_args(argv)

    client = get_client()
    rows = _fetch_targets(client, ["FL_SUNBIZ", "NY_DOS"], args.limit)
    logger.info("email_gaps.start", extra={"n": len(rows), "workers": args.workers})
    if not rows:
        return 0

    hits = 0
    processed = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(_search_email_for, r) for r in rows]
        for fut in as_completed(futures):
            try:
                rid, email = fut.result()
            except Exception as exc:
                logger.warning("email_gaps.error", extra={"err": repr(exc)})
                continue
            processed += 1
            if email:
                hits += 1
                try:
                    _update(client, rid, email)
                except Exception as exc:
                    logger.warning("email_gaps.write_error", extra={"err": repr(exc)})
            if processed % 25 == 0:
                logger.info(
                    "email_gaps.progress",
                    extra={"processed": processed, "total": len(rows), "hits": hits},
                )
    logger.info("email_gaps.done", extra={"processed": processed, "hits": hits})
    print(f"email_gaps: processed={processed} hits={hits}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
