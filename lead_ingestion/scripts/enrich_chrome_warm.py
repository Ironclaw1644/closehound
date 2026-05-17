"""Phase E — Chrome-headless scrape for warm leads where httpx failed.

The 67 warm leads with `domain_found` set but no contact_phone/email after
phase A almost certainly host JS-rendered pages (Wix, Squarespace, custom
React/Vue), which httpx can't see. Chrome headless `--dump-dom` resolves
the rendered HTML; we then run the same regex/href extraction on it.

No additional install required — uses /Applications/Google Chrome.app
that's already on the machine.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any, cast

from bs4 import BeautifulSoup

from lead_ingestion.enrichment.contact_check import (
    _extract_from_links,
    _first_email,
    _first_phone,
    _is_good_email,
    _phone_matches_state,
)
from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PATHS = ("", "/contact", "/contact-us", "/about", "/about-us")


def _chrome_dump(url: str, timeout_s: float = 25.0) -> str | None:
    """Run Chrome headless, dump rendered DOM. Returns HTML or None on error."""
    args = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--disable-background-networking",
        "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 "
        "(KHTML, like Gecko) Version/17.5 Safari/605.1.15",
        "--dump-dom",
        url,
    ]
    try:
        proc = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=timeout_s,
            env={**os.environ, "HOME": os.environ.get("HOME", "/tmp")},
        )
        if proc.returncode != 0:
            return None
        return proc.stdout
    except (subprocess.TimeoutExpired, OSError):
        return None


def _scrape_domain(domain: str, city: str | None, state: str | None) -> tuple[str | None, str | None, bool]:
    base = f"https://{domain.lstrip('/').rstrip('/')}"
    phone, email, verified = (None, None, False)
    for path in PATHS:
        url = base + path if path else base
        html = _chrome_dump(url)
        if not html:
            continue
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        p, e = _extract_from_links(soup)
        text = soup.get_text(" ", strip=True)
        if not p:
            p = _first_phone(text)
        if not e:
            e = _first_email(text, preferred_domain=domain)
        phone = phone or p
        email = email or e
        # Verification: page mentions city/state OR phone area code matches state
        if not verified:
            low = text.lower()
            if city and city.lower() in low:
                verified = True
            elif state and state.lower() == "fl" and "florida" in low:
                verified = True
            elif state and state.lower() == "ny" and "new york" in low:
                verified = True
        if phone and _phone_matches_state(phone, state):
            verified = True
        if phone and email and verified:
            break
    if email and not _is_good_email(email):
        email = None
    return (phone, email, verified)


def _process_one(row: dict[str, Any]) -> tuple[str, str | None, str | None, bool]:
    domain = row.get("domain_found") or ""
    addr = row.get("principal_address") or {}
    city = (addr.get("city") or "").strip() or None
    state = (addr.get("state") or row.get("state") or "").strip() or None
    try:
        phone, email, verified = _scrape_domain(domain, city, state)
    except Exception as exc:
        logger.warning("chrome.error", extra={"domain": domain, "err": repr(exc)})
        phone, email, verified = (None, None, False)
    return (row["id"], phone, email, verified)


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="enrich_chrome_warm")
    p.add_argument("--limit", type=int, default=200)
    p.add_argument("--workers", type=int, default=3)
    args = p.parse_args(argv)

    client = get_client()
    res = (
        client.schema("closehound")
        .table("new_business_leads")
        .select("id,business_name,principal_address,domain_found,state,source")
        .in_("source", ["FL_SUNBIZ", "NY_DOS"])
        .not_.is_("domain_found", "null")
        .is_("contact_phone", "null")
        .is_("contact_email", "null")
        .limit(args.limit)
        .execute()
    )
    rows = cast(list[dict[str, Any]], res.data or [])
    logger.info("chrome.start", extra={"n": len(rows), "workers": args.workers})
    if not rows:
        print("chrome: 0 leads")
        return 0

    processed = 0
    phones = 0
    emails = 0
    verified = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(_process_one, r) for r in rows]
        for fut in as_completed(futures):
            try:
                rid, phone, email, ver = fut.result()
            except Exception as exc:
                logger.warning("chrome.future_err", extra={"err": repr(exc)})
                continue
            processed += 1
            if phone:
                phones += 1
            if email:
                emails += 1
            if ver:
                verified += 1
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
                    logger.warning("chrome.write_err", extra={"err": repr(exc)})
            if processed % 10 == 0:
                logger.info(
                    "chrome.progress",
                    extra={"processed": processed, "total": len(rows), "phones": phones, "emails": emails, "verified": verified},
                )
    logger.info("chrome.done", extra={"processed": processed, "phones": phones, "emails": emails, "verified": verified})
    print(f"chrome: processed={processed} phones={phones} emails={emails} verified={verified}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
