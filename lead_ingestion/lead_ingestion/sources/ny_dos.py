"""NY DOS open-data ingester.

data.ny.gov publishes "Active Corporations: Beginning 1800" (dataset id
`n9v6-gdp6`) as a Socrata-backed dataset. The `.json` endpoint accepts a SoQL
`$where` filter on `initial_dos_filing_date`, so we only fetch rows newer than
`since_date` instead of pulling the entire history.

Output columns (we use the snake_case `fieldName` keys, not the human names):
    dos_id                       — primary key
    current_entity_name          — business name
    initial_dos_filing_date      — filing date (YYYY-MM-DDT00:00:00.000)
    entity_type                  — "DOMESTIC LIMITED LIABILITY COMPANY", etc.
    county
    jurisdiction
    location_*                   — operating address (often missing)
    chairman_*                   — CEO contact (often missing)
    dos_process_*                — DOS process server (always present)
    registered_agent_*           — RA (optional)

No API key required for read; we still send a polite UA. The endpoint paginates
via `$limit` + `$offset`; we cap at 50k rows per run to avoid runaway pulls.
"""

from __future__ import annotations

import time
from collections.abc import Iterable
from datetime import date, datetime
from typing import Any

import httpx

from ..base import BaseIngester, Filing, Source
from ..config import NYDOSConfig
from ..logging_setup import get_logger

logger = get_logger(__name__)


# Map NY's verbose entity_type → our condensed entity_type codes.
# Anything not in the map is passed through verbatim.
_NY_ENTITY_TYPE_MAP: dict[str, str] = {
    "DOMESTIC LIMITED LIABILITY COMPANY": "LLC",
    "FOREIGN LIMITED LIABILITY COMPANY": "LLC",
    "DOMESTIC BUSINESS CORPORATION": "CORP",
    "FOREIGN BUSINESS CORPORATION": "CORP",
    "DOMESTIC NOT-FOR-PROFIT CORPORATION": "NP",
    "FOREIGN NOT-FOR-PROFIT CORPORATION": "NP",
    "DOMESTIC PROFESSIONAL CORPORATION": "PC",
    "DOMESTIC LIMITED PARTNERSHIP": "LP",
    "FOREIGN LIMITED PARTNERSHIP": "LP",
}


def _parse_iso_date(raw: str | None) -> date | None:
    if not raw:
        return None
    # Socrata returns "2026-05-14T00:00:00.000"
    try:
        return datetime.fromisoformat(raw.split("T", 1)[0]).date()
    except ValueError:
        return None


def _best_address(row: dict[str, Any]) -> dict[str, Any] | None:
    """Pick the most operationally relevant address.

    Prefer `location_*` (physical office), then `chairman_*` (CEO home), then
    `dos_process_*` (legal-service-of-process address — always present but
    least useful for outreach since it's often a registered-agent address).
    """
    candidates = (
        ("location_address_1", "location_city", "location_state", "location_zip"),
        ("chairman_address_1", "chairman_city", "chairman_state", "chairman_zip"),
        (
            "dos_process_address_1",
            "dos_process_city",
            "dos_process_state",
            "dos_process_zip",
        ),
    )
    for addr_key, city_key, state_key, zip_key in candidates:
        line1 = (row.get(addr_key) or "").strip()
        city = (row.get(city_key) or "").strip()
        if line1 or city:
            return {
                "line1": line1 or None,
                "city": city or None,
                "state": (row.get(state_key) or "").strip() or None,
                "zip": (row.get(zip_key) or "").strip() or None,
                "country": "US",
            }
    return None


def _to_filing(row: dict[str, Any]) -> Filing | None:
    dos_id = (row.get("dos_id") or "").strip()
    name = (row.get("current_entity_name") or "").strip()
    filed = _parse_iso_date(row.get("initial_dos_filing_date"))
    if not dos_id or not name or not filed:
        return None
    raw_entity_type = (row.get("entity_type") or "").strip()
    entity_type = _NY_ENTITY_TYPE_MAP.get(raw_entity_type) or raw_entity_type or None
    ra_name = (row.get("registered_agent_name") or "").strip()
    ra = (
        {
            "name": ra_name,
            "address": (row.get("registered_agent_address_1") or "").strip() or None,
            "city": (row.get("registered_agent_city") or "").strip() or None,
            "state": (row.get("registered_agent_state") or "").strip() or None,
        }
        if ra_name
        else None
    )
    # NY's chairman_* fields = the CEO. That's our one "officer" — surface
    # them in the same structure FL Sunbiz uses so downstream code can treat
    # both sources uniformly.
    chair_name = (row.get("chairman_name") or "").strip()
    officers = None
    if chair_name:
        officers = [
            {
                "name": chair_name,
                "first_name": None,
                "last_name": None,
                "middle": None,
                "address": (row.get("chairman_address_1") or "").strip() or None,
                "city": (row.get("chairman_city") or "").strip() or None,
                "state": (row.get("chairman_state") or "").strip() or None,
                "zip": (row.get("chairman_zip") or "").strip() or None,
                "role": "CEO",
            }
        ]
    return Filing(
        source=Source.NY_DOS,
        source_entity_id=dos_id,
        business_name=name,
        filing_date=filed,
        state="NY",
        raw_payload={
            "entity_type_raw": raw_entity_type,
            "jurisdiction": (row.get("jurisdiction") or "").strip() or None,
            "county": (row.get("county") or "").strip() or None,
        },
        entity_type=entity_type,
        principal_address=_best_address(row),
        registered_agent=ra,
        officers=officers,
        naics_code=None,  # NY's dataset doesn't carry NAICS
        naics_inferred=False,
    )


class NYDOSIngester(BaseIngester):
    """Pulls newly-formed NY entities via the Socrata SoQL endpoint."""

    source = Source.NY_DOS

    def __init__(
        self,
        cfg: NYDOSConfig,
        *,
        page_size: int = 1000,
        max_pages: int = 50,
        timeout_s: float = 30.0,
        sleep_between_pages_s: float = 0.5,
    ) -> None:
        self.cfg = cfg
        self.page_size = page_size
        self.max_pages = max_pages
        self.timeout_s = timeout_s
        self.sleep_between_pages_s = sleep_between_pages_s

    def fetch_new_filings(self, since_date: date) -> Iterable[Filing]:
        logger.info("ny_dos.window", extra={"since_date": since_date.isoformat()})
        # Use a string literal in SoQL — Socrata's $where parses ISO dates.
        # Strict > since_date matches the FL Sunbiz semantics (>=).
        where = f"initial_dos_filing_date >= '{since_date.isoformat()}T00:00:00.000'"
        url = self.cfg.dataset_url
        headers = {
            "User-Agent": "CloseHoundBot/0.1 (lead-ingestion; contact: hello@walkperro.com)",
            "Accept": "application/json",
        }
        total = 0
        with httpx.Client(timeout=self.timeout_s, headers=headers) as client:
            for page in range(self.max_pages):
                params: dict[str, str] = {
                    "$where": where,
                    "$order": "initial_dos_filing_date DESC",
                    "$limit": str(self.page_size),
                    "$offset": str(page * self.page_size),
                }
                resp = client.get(url, params=params)
                if resp.status_code != 200:
                    logger.warning(
                        "ny_dos.bad_status",
                        extra={
                            "status": resp.status_code,
                            "page": page,
                            "text": resp.text[:200],
                        },
                    )
                    break
                rows: list[dict[str, Any]] = resp.json()
                if not rows:
                    break
                count = 0
                for row in rows:
                    filing = _to_filing(row)
                    if filing is None:
                        continue
                    yield filing
                    count += 1
                total += count
                logger.info(
                    "ny_dos.page",
                    extra={"page": page, "fetched": len(rows), "yielded": count},
                )
                if len(rows) < self.page_size:
                    break
                time.sleep(self.sleep_between_pages_s)
        logger.info("ny_dos.window_done", extra={"yielded_total": total})
