"""Phase G — Cloudflare bypass via pydoll browser navigation + click-through.

After phases A–F left ~298 FL/NY leads with no findable contact, every
people-search site (TruePeopleSearch, FastPeopleSearch, WhitePages, 411)
was Cloudflare-gated against httpx, playwright-stealth, and curl-cffi.
Pydoll's CDP-based browser connection passes the CF challenge that those
methods can't.

Empirical finding (2026-05-16): pydoll's `tab.request.get` (HTTP via
browser session) DID NOT defeat the result-page anti-bot on TPS/FPS —
the homepage warms a `cf_clearance` cookie, but the result pages do an
additional check that only passes on real browser navigation. So this
phase uses `tab.go_to(search_url)` for each lead, then extracts the FL/NY
match from the visible listing and clicks through for the phone.

Setup (one-time):
    cd lead_ingestion
    uv add pydoll-python

Run:
    cd lead_ingestion
    .venv/bin/python scripts/enrich_phase_g.py --limit 10  # validate first
    .venv/bin/python scripts/enrich_phase_g.py --limit 1000  # full run

Per-lead time: ~10-20s (homepage warm only first time + search nav + 1
detail-page click). Budget ~30-45 min for the 298-lead pool, sequential
(parallel browsers trigger CF more aggressively).

Expected yield: ~20-40% on the remaining pool (60-120 more contacts),
which would push total coverage from 59% to 67-75% — the practical
ceiling before paid sources (Apollo, ZoomInfo) become more cost-effective.

NOTE: tab navigation triggers CF on every site change. Re-warming is
automatic — pydoll keeps the session cookies. If 403s start appearing
after ~50 leads, the IP reputation may have degraded; rotate IPs or
sleep 30 min and resume.
"""

from __future__ import annotations

import argparse
import asyncio
import re
import sys
from datetime import datetime, timezone
from typing import Any, cast
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from lead_ingestion.enrichment.contact_check import _phone_matches_state
from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


PHONE_RE = re.compile(r"\(?([2-9]\d{2})\)?[-.\s ]\s*([2-9]\d{2})[-.\s ]\s*(\d{4})")

_RA_BLOCK = (
    "legalzoom", "northwest registered", "registered agents inc",
    "entity protect", "cogency", "incorp", "harbor compliance",
    "corporation service", "ct corporation", "urs agents", "qvr",
)


def _is_real_owner(first: str | None, last: str | None) -> bool:
    if not first or not last:
        return False
    full = f"{first} {last}".lower()
    return not any(b in full for b in _RA_BLOCK)


def _extract_state_phone(html: str, state: str | None) -> str | None:
    """Return first phone whose area code matches the state. Skips 555-prefixed
    placeholder/example numbers that some directory pages render."""
    if not html or not state:
        return None
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    text = soup.get_text(" ", strip=True)
    for m in PHONE_RE.finditer(text):
        area, ex, sub = m.groups()
        if ex == "555":  # 555-XXXX is reserved/example
            continue
        phone = f"({area}) {ex}-{sub}"
        if _phone_matches_state(phone, state):
            return phone
    return None


def _find_detail_link_for_city(html: str, city: str) -> str | None:
    """Parse a TPS/FPS result listing, return the detail URL whose summary
    mentions the lead's city. We match on first-card containing city to
    avoid the noise of same-name people in other locations."""
    soup = BeautifulSoup(html, "html.parser")
    city_low = city.strip().lower()
    # Both TPS and FPS use card-style results with detail anchors.
    for a in soup.find_all("a", href=True):
        href = a["href"]
        # heuristic: detail URLs include /name/ or /details/ or look like /person/...
        if not any(seg in href for seg in ("/details/", "/name/", "/person/", "/ui/details/")):
            continue
        # find the surrounding card text
        parent = a.find_parent(["div", "li", "article", "section"]) or a.parent
        if parent and city_low in parent.get_text(" ", strip=True).lower():
            if href.startswith("/"):
                return href
            if href.startswith("http"):
                return href
    return None


async def _scrape_one(tab: Any, row: dict[str, Any]) -> tuple[str, str | None]:
    rid = row["id"]
    first = row.get("_owner_first")
    last = row.get("_owner_last")
    addr = row.get("principal_address") or {}
    city = (addr.get("city") or "").strip() or None
    state = (addr.get("state") or row.get("state") or "").strip() or None
    if not _is_real_owner(first, last) or not city or not state:
        return (rid, None)

    # Site rotation: start with FPS (slightly less detail-page friction),
    # then TPS as a fallback. Both must be warmed once before any results
    # page navigation (caller handles the homepage warm).
    sites = [
        ("fps",
         f"https://www.fastpeoplesearch.com/name/{first.lower()}-{last.lower()}_{city.lower().replace(' ', '-')}-{state.lower()}",
         "https://www.fastpeoplesearch.com"),
        ("tps",
         f"https://www.truepeoplesearch.com/results?name={quote_plus(first + ' ' + last)}&citystatezip={quote_plus(city + ' ' + state)}",
         "https://www.truepeoplesearch.com"),
    ]
    for site, search_url, base in sites:
        try:
            await tab.go_to(search_url, timeout=45000)
            await asyncio.sleep(3)
            html = await tab.page_source
        except Exception as exc:
            logger.debug("phase_g.search_fail", extra={"site": site, "err": repr(exc)})
            continue
        # Some result pages render phones directly in summary; check first.
        phone = _extract_state_phone(html, state)
        if phone:
            return (rid, phone)
        # Otherwise find detail link for our city + click through.
        detail = _find_detail_link_for_city(html, city)
        if not detail:
            continue
        if detail.startswith("/"):
            detail = base.rstrip("/") + detail
        try:
            await tab.go_to(detail, timeout=45000)
            await asyncio.sleep(3)
            detail_html = await tab.page_source
        except Exception as exc:
            logger.debug("phase_g.detail_fail", extra={"site": site, "err": repr(exc)})
            continue
        phone = _extract_state_phone(detail_html, state)
        if phone:
            return (rid, phone)
    return (rid, None)


async def _run(limit: int, rewarm_every: int) -> None:
    from pydoll.browser.chromium import Chrome

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
        .limit(limit)
        .execute()
    )
    rows = cast(list[dict[str, Any]], res.data or [])
    for r in rows:
        officers = r.get("officers") or []
        first = (officers[0] if officers and isinstance(officers, list) else None) or {}
        r["_owner_first"] = (first.get("first_name") or "").strip() or None
        r["_owner_last"] = (first.get("last_name") or "").strip() or None

    if not rows:
        print("phase_g: 0 leads")
        return

    logger.info("phase_g.start", extra={"n": len(rows), "rewarm_every": rewarm_every})

    processed = 0
    phones = 0
    async with Chrome() as browser:
        tab = await browser.start()
        # Warm CF clearance for both sites once.
        for warm_url in ("https://www.fastpeoplesearch.com", "https://www.truepeoplesearch.com"):
            try:
                await tab.go_to(warm_url, timeout=45000)
                await asyncio.sleep(3)
            except Exception as exc:
                logger.warning("phase_g.warm_fail", extra={"url": warm_url, "err": repr(exc)})

        for row in rows:
            try:
                rid, phone = await _scrape_one(tab, row)
            except Exception as exc:
                logger.warning("phase_g.error", extra={"biz": row.get("business_name"), "err": repr(exc)})
                rid, phone = row["id"], None
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
                    logger.warning("phase_g.write_err", extra={"err": repr(exc)})
            if processed % rewarm_every == 0:
                logger.info("phase_g.rewarm", extra={"processed": processed, "phones": phones})
                for warm_url in ("https://www.fastpeoplesearch.com", "https://www.truepeoplesearch.com"):
                    try:
                        await tab.go_to(warm_url, timeout=45000)
                        await asyncio.sleep(2)
                    except Exception:
                        pass
            elif processed % 10 == 0:
                logger.info(
                    "phase_g.progress",
                    extra={"processed": processed, "total": len(rows), "phones": phones},
                )
    logger.info("phase_g.done", extra={"processed": processed, "phones": phones})
    print(f"phase_g: processed={processed} phones={phones}")


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="enrich_phase_g")
    p.add_argument("--limit", type=int, default=1000)
    p.add_argument("--rewarm-every", type=int, default=40)
    args = p.parse_args(argv)
    asyncio.run(_run(args.limit, args.rewarm_every))
    return 0


if __name__ == "__main__":
    sys.exit(main())
