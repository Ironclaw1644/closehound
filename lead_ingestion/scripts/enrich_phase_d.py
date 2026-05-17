"""Phase D — final pass on still-missing leads with totally different queries.

Targets leads where BOTH contact_phone and contact_email are still NULL after
phases A/B/C. Uses queries phase C didn't try:
  - Just owner name + city (no quotes, no industry) — picks up personal
    listings that don't mention the business name yet
  - First word of biz + city + industry — picks up matches where business
    is referenced by a nickname
  - Owner first name + last name + state — extremely broad, last resort
"""

from __future__ import annotations

import argparse
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any, cast

from lead_ingestion.enrichment.contact_check import (
    _bing_results,
    _is_useful_result,
    _polite_sleep,
    _scrape_url_with_verify,
)
from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


_NAICS_HINT = {
    "561730": "lawn care", "238320": "painter", "238210": "electrician",
    "811111": "auto repair", "238220": "plumbing", "561622": "locksmith",
    "621210": "dentist", "561720": "cleaning", "238160": "roofing",
    "812199": "salon", "488410": "towing", "811192": "auto detailing",
    "561710": "pest control",
}

_RA_BLOCKLIST_KEYS = (
    "legalzoom", "northwest", "registered agents inc", "entity protect",
    "cogency", "incorp", "harbor", "corporation service", "ct corporation",
    "urs agents", "capitol services", "spiegel", "qvr",
)


def _is_real_owner(name: str | None) -> bool:
    if not name:
        return False
    low = name.lower()
    if any(k in low for k in _RA_BLOCKLIST_KEYS):
        return False
    # Must have at least 2 words and not be all-uppercase corp suffix garbage
    if len(name.split()) < 2:
        return False
    return True


def _search_one(row: dict[str, Any]) -> tuple[str, str | None, str | None]:
    biz = (row.get("business_name") or "").strip()
    addr = row.get("principal_address") or {}
    city = (addr.get("city") or "").strip() or None
    state = (addr.get("state") or row.get("state") or "").strip() or None
    zip_ = (addr.get("zip") or "").strip() or None
    owner_first = row.get("_owner_first") or ""
    owner_last = row.get("_owner_last") or ""
    industry = _NAICS_HINT.get(row.get("naics_code") or "", "")
    ra = row.get("registered_agent") or {}
    ra_name = (ra.get("name") if isinstance(ra, dict) else None) or None

    queries: list[str] = []
    # 1. Owner name + city + state, unquoted — picks up personal listings
    if _is_real_owner(f"{owner_first} {owner_last}") and city:
        queries.append(f"{owner_first} {owner_last} {city} {state or ''}".strip())
    # 2. First word of biz + city + industry — handles abbreviation/nickname
    first_word = biz.split()[0] if biz else ""
    if first_word and len(first_word) >= 4 and city and industry:
        queries.append(f"{first_word} {industry} {city}")
    # 3. Registered agent's individual name (if not a service)
    if ra_name and _is_real_owner(ra_name) and city:
        queries.append(f"{ra_name} {city} {state or ''}".strip())
    # 4. Just owner name + zip (no city) — narrower geography
    if _is_real_owner(f"{owner_first} {owner_last}") and zip_:
        queries.append(f"{owner_first} {owner_last} {zip_}".strip())

    phone, email = (None, None)
    for q in queries:
        if phone and email:
            break
        try:
            urls = _bing_results(q, timeout_s=10.0)
        except Exception:
            urls = []
        useful = [u for u in urls if _is_useful_result(u)][:2]
        for url in useful:
            try:
                p, e, _v = _scrape_url_with_verify(
                    url, verify_city=city, verify_state=state, preferred_domain=row.get("domain_found"),
                )
            except Exception:
                p, e = (None, None)
            phone = phone or p
            email = email or e
        _polite_sleep(0.5, 0.5)
    return (row["id"], phone, email)


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="enrich_phase_d")
    p.add_argument("--limit", type=int, default=1000)
    p.add_argument("--workers", type=int, default=4)
    args = p.parse_args(argv)

    client = get_client()
    res = (
        client.schema("closehound")
        .table("new_business_leads")
        .select(
            "id,business_name,principal_address,source,domain_found,"
            "contact_phone,contact_email,naics_code,officers,registered_agent,state"
        )
        .in_("source", ["FL_SUNBIZ", "NY_DOS"])
        .is_("contact_phone", "null")
        .is_("contact_email", "null")
        .limit(args.limit)
        .execute()
    )
    rows = cast(list[dict[str, Any]], res.data or [])
    for r in rows:
        officers = r.get("officers") or []
        first = (officers[0] if officers and isinstance(officers, list) else None) or {}
        r["_owner_first"] = (first.get("first_name") or "").strip() or None
        r["_owner_last"] = (first.get("last_name") or "").strip() or None

    logger.info("phase_d.start", extra={"n": len(rows), "workers": args.workers})
    if not rows:
        print("phase_d: 0 leads to process")
        return 0

    processed = 0
    phones = 0
    emails = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(_search_one, r) for r in rows]
        for fut in as_completed(futures):
            try:
                rid, phone, email = fut.result()
            except Exception as exc:
                logger.warning("phase_d.error", extra={"err": repr(exc)})
                continue
            processed += 1
            if phone:
                phones += 1
            if email:
                emails += 1
            if phone or email:
                try:
                    client.schema("closehound").table("new_business_leads").update(
                        {
                            "contact_phone": phone,
                            "contact_email": email,
                            "contact_checked_at": datetime.now(timezone.utc).isoformat(),
                        }
                    ).eq("id", rid).execute()
                except Exception as exc:
                    logger.warning("phase_d.write_error", extra={"err": repr(exc)})
            if processed % 25 == 0:
                logger.info(
                    "phase_d.progress",
                    extra={"processed": processed, "total": len(rows), "phones": phones, "emails": emails},
                )
    logger.info("phase_d.done", extra={"processed": processed, "phones": phones, "emails": emails})
    print(f"phase_d: processed={processed} phones={phones} emails={emails}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
