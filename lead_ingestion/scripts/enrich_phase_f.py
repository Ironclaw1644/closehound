"""Phase F — people-search via Chrome headless for remaining no-contact leads.

Targets leads where contact_phone IS NULL AND contact_email IS NULL after
phases A/B/C/D/E. Queries whitepages/truepeoplesearch/411 with the
owner's full name + city + state, extracts phones, and accepts only those
whose area code matches the lead's state (filters out the same-name-noise).

Free, uses already-installed Chrome, no install required.
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any, cast

from lead_ingestion.enrichment.contact_check import (
    _phone_matches_state,
    _is_good_email,
)
from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PHONE_RE = re.compile(r"\(?([2-9]\d{2})\)?[-.\s ]\s*([2-9]\d{2})[-.\s ]\s*(\d{4})")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")

_RA_BLOCK = ("legalzoom", "northwest registered", "registered agents inc",
             "entity protect", "cogency", "incorp", "harbor compliance",
             "corporation service", "ct corporation", "urs agents", "qvr")


def _is_real_owner(first: str | None, last: str | None) -> bool:
    if not first or not last:
        return False
    full = f"{first} {last}".lower()
    return not any(b in full for b in _RA_BLOCK)


def _chrome_dump(url: str, timeout_s: float = 20.0) -> str | None:
    args = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
        "--dump-dom",
        url,
    ]
    try:
        p = subprocess.run(
            args, capture_output=True, text=True, timeout=timeout_s,
            env={**os.environ, "HOME": os.environ.get("HOME", "/tmp")},
        )
        return p.stdout if p.returncode == 0 else None
    except (subprocess.TimeoutExpired, OSError):
        return None


def _extract_state_phone(html: str, state: str | None) -> str | None:
    """Find phones, return first one whose area code matches the state."""
    if not html or not state:
        return None
    for m in PHONE_RE.finditer(html):
        area, ex, sub = m.groups()
        phone = f"({area}) {ex}-{sub}"
        if _phone_matches_state(phone, state):
            return phone
    return None


def _search_one(row: dict[str, Any]) -> tuple[str, str | None]:
    rid = row["id"]
    first = row.get("_owner_first")
    last = row.get("_owner_last")
    addr = row.get("principal_address") or {}
    city = (addr.get("city") or "").strip() or None
    state = (addr.get("state") or row.get("state") or "").strip() or None

    if not _is_real_owner(first, last) or not city or not state:
        return (rid, None)

    # Slugify name and city for URL paths
    name_slug = f"{first}-{last}".replace(" ", "-").lower()
    name_q = f"{first}+{last}".replace(" ", "+")
    city_slug = city.replace(" ", "-").title()
    city_q = city.replace(" ", "+")

    urls = [
        f"https://www.truepeoplesearch.com/results?name={name_q}&citystatezip={city_q}+{state}",
        f"https://www.whitepages.com/name/{name_slug}/{city_slug}-{state}",
        f"https://www.fastpeoplesearch.com/name/{name_slug}_{city_slug}-{state}",
    ]
    for url in urls:
        html = _chrome_dump(url)
        if not html:
            continue
        phone = _extract_state_phone(html, state)
        if phone:
            return (rid, phone)
    return (rid, None)


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="enrich_phase_f")
    p.add_argument("--limit", type=int, default=1000)
    p.add_argument("--workers", type=int, default=3)
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

    logger.info("phase_f.start", extra={"n": len(rows), "workers": args.workers})
    if not rows:
        print("phase_f: 0 leads")
        return 0

    processed = 0
    phones = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(_search_one, r) for r in rows]
        for fut in as_completed(futures):
            try:
                rid, phone = fut.result()
            except Exception as exc:
                logger.warning("phase_f.error", extra={"err": repr(exc)})
                continue
            processed += 1
            if phone:
                phones += 1
                try:
                    client.schema("closehound").table("new_business_leads").update(
                        {
                            "contact_phone": phone,
                            "contact_checked_at": datetime.now(timezone.utc).isoformat(),
                        }
                    ).eq("id", rid).execute()
                except Exception as exc:
                    logger.warning("phase_f.write_err", extra={"err": repr(exc)})
            if processed % 25 == 0:
                logger.info(
                    "phase_f.progress",
                    extra={"processed": processed, "total": len(rows), "phones": phones},
                )
    logger.info("phase_f.done", extra={"processed": processed, "phones": phones})
    print(f"phase_f: processed={processed} phones={phones}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
