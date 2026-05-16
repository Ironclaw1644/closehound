"""Free-tier contact enrichment — phone + email best-effort.

State SOS filings never include phone or email (legal-record forms don't ask).
For brand-new businesses that also don't yet have a website (our "hot" pool),
public contact info is genuinely scarce. This module does the best free thing:

  1. If we already have a domain (from domain_check), scrape the homepage for
     `tel:` and `mailto:` hrefs + visible phone-number text. Hit rate is high
     when we have a domain.
  2. Else, hit DuckDuckGo's HTML search endpoint (`html.duckduckgo.com/html/`)
     with `"<business name>" <city>` and regex over the result snippets.
     DuckDuckGo has lighter bot mitigation than Google so this works without
     a headless browser. Hit rate is ~20-30% for no-website businesses — many
     brand-new entities have zero web footprint at all.

Returns (phone, email) — both `None` when nothing found. Failures don't raise;
the orchestrator's enrichment loop catches and continues.

Rate limited to ~1 req/2s + jitter to stay polite.
"""

from __future__ import annotations

import random
import re
import time
from urllib.parse import quote_plus

import httpx

from ..logging_setup import get_logger

logger = get_logger(__name__)


_PHONE_RE = re.compile(
    r"""(?:\+?1[-.\s]?)?            # optional leading +1
        \(?(\d{3})\)?[-.\s]?          # area code (3 digits, optional parens)
        (\d{3})[-.\s]?                # exchange (3 digits)
        (\d{4})                       # subscriber (4 digits)
        (?!\d)                        # don't match longer runs
    """,
    re.VERBOSE,
)
_EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")

# Filter out obvious junk we'd otherwise match.
_BAD_PHONE_PREFIXES = ("800", "888", "877", "866", "855", "844", "833", "822", "000", "111")
_BAD_EMAIL_DOMAINS = (
    "example.com",
    "domain.com",
    "yoursite.com",
    "yourdomain.com",
    "sentry.io",
    "wixpress.com",
    "wix.com",
    "godaddy.com",
    "schema.org",
    "w3.org",
)

_UAS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
]


def _ua() -> str:
    return random.choice(_UAS)


def _polite_sleep() -> None:
    time.sleep(2.0 + random.random() * 1.5)


def _normalize_phone(area: str, ex: str, sub: str) -> str | None:
    if area in _BAD_PHONE_PREFIXES:
        return None
    return f"({area}) {ex}-{sub}"


def _first_phone(text: str) -> str | None:
    for m in _PHONE_RE.finditer(text):
        phone = _normalize_phone(*m.groups())
        if phone:
            return phone
    return None


def _first_email(text: str) -> str | None:
    for m in _EMAIL_RE.finditer(text):
        addr = m.group(0).lower()
        domain = addr.rsplit("@", 1)[-1]
        if domain in _BAD_EMAIL_DOMAINS:
            continue
        if domain.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg")):
            continue
        return addr
    return None


def scrape_website(domain: str, *, timeout_s: float = 6.0) -> tuple[str | None, str | None]:
    """Fetch a homepage and pull tel:/mailto: + visible contacts.

    Tries the bare domain first; if the page redirects to /contact we follow.
    """
    url = f"https://{domain}"
    try:
        with httpx.Client(
            timeout=timeout_s,
            follow_redirects=True,
            headers={"User-Agent": _ua(), "Accept": "text/html,*/*"},
        ) as client:
            resp = client.get(url)
            if resp.status_code >= 400:
                return (None, None)
            body = resp.text
    except (httpx.HTTPError, OSError) as exc:
        logger.debug("contact_check.website_fail", extra={"domain": domain, "err": repr(exc)})
        return (None, None)
    phone = _first_phone(body)
    email = _first_email(body)
    return (phone, email)


def search_duckduckgo(
    business_name: str, city: str | None, *, timeout_s: float = 10.0
) -> tuple[str | None, str | None]:
    """Hit DuckDuckGo's HTML endpoint and pull contacts from result snippets."""
    if not business_name:
        return (None, None)
    query = f'"{business_name}"' + (f" {city}" if city else "") + " phone"
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    try:
        with httpx.Client(
            timeout=timeout_s,
            follow_redirects=True,
            headers={"User-Agent": _ua(), "Accept": "text/html,*/*"},
        ) as client:
            resp = client.get(url)
            if resp.status_code != 200:
                logger.debug(
                    "contact_check.ddg_bad_status",
                    extra={"status": resp.status_code, "biz": business_name},
                )
                return (None, None)
            body = resp.text
    except (httpx.HTTPError, OSError) as exc:
        logger.debug("contact_check.ddg_fail", extra={"err": repr(exc)})
        return (None, None)
    return (_first_phone(body), _first_email(body))


def find_contact(
    business_name: str,
    city: str | None,
    domain: str | None,
) -> tuple[str | None, str | None]:
    """Best-effort: try website if we have one, then DuckDuckGo fallback."""
    phone, email = (None, None)
    if domain:
        phone, email = scrape_website(domain)
        if phone and email:
            logger.info(
                "contact_check.website_hit",
                extra={"biz": business_name, "phone": phone, "email": email},
            )
            return (phone, email)
    if not phone or not email:
        _polite_sleep()
        ddg_phone, ddg_email = search_duckduckgo(business_name, city)
        phone = phone or ddg_phone
        email = email or ddg_email
    if phone or email:
        logger.info(
            "contact_check.hit",
            extra={
                "biz": business_name,
                "phone": phone,
                "email": email,
                "had_domain": bool(domain),
            },
        )
    return (phone, email)
