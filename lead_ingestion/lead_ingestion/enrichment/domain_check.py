"""Domain probing: does {slug}.com (or .biz/.net/-llc.com) exist + respond?

Cheap, no API cost: DNS A-record lookup, then HEAD request only if DNS resolves.
4 candidate domains max per business — keeps total time bounded.

A site is "live" if it returns a 2xx or 3xx on HEAD with a Host header. We
accept redirects (lots of small-biz sites redirect www → root or http → https).

This is best-effort. Lots of false negatives are fine (Wix/Squarespace sites
on owner-bought domains still count as a website but we'd miss them — that's
why the orchestrator also runs gmb_check). False positives (a domain squatter
returns 200 on a parked page) are also acceptable for now.
"""

from __future__ import annotations

import re
from typing import Final

import dns.exception
import dns.resolver
import httpx

from ..logging_setup import get_logger

logger = get_logger(__name__)

_DNS_TIMEOUT = 1.5  # seconds
_HTTP_TIMEOUT = 3.0
_USER_AGENT = "CloseHoundBot/0.1 (+https://walkperro.com)"


_COMMON_SUFFIXES: Final = re.compile(
    r"\s*[,]?\s*\b(llc|l\.l\.c\.|inc|incorporated|corp|corporation|"
    r"co|company|lp|llp|pa|p\.a\.|pllc|pllc\.|ltd)\.?\s*$",
    re.IGNORECASE,
)
_NON_ALNUM = re.compile(r"[^a-z0-9]+")


def slugify(business_name: str) -> str:
    """Normalize a business name into a candidate domain label.

    Examples:
        "Joe's Plumbing LLC"          → "joesplumbing"
        "Five Star Painting of Austin"→ "fivestarpaintingofaustin"
        "ABC, Inc."                    → "abc"
        "Mr. Done Right Handyman"     → "mrdonerighthandyman"

    Punctuation gone, suffixes dropped, lowercase, no spaces. We don't keep
    hyphens — most contractor domains are without them (smithplumbing.com,
    not smith-plumbing.com). The -llc.com variant covers that case.
    """
    if not business_name:
        return ""
    s = business_name.strip()
    # Strip common entity suffixes ("LLC", "Inc.", etc.)
    # Apply the regex iteratively in case there are multiple ("Joe's LLC, Inc.")
    while True:
        new = _COMMON_SUFFIXES.sub("", s).strip().rstrip(",")
        if new == s:
            break
        s = new
    s = s.lower()
    return _NON_ALNUM.sub("", s)


def candidate_domains(business_name: str) -> list[str]:
    """Return the (up to 4) domain variants we probe, in priority order."""
    slug = slugify(business_name)
    if not slug:
        return []
    return [
        f"{slug}.com",
        f"{slug}.biz",
        f"{slug}.net",
        f"{slug}-llc.com",
    ]


def _dns_resolves(domain: str, resolver: dns.resolver.Resolver | None = None) -> bool:
    """True if `domain` has at least one A record. Swallows expected timeouts."""
    r = resolver or dns.resolver.Resolver()
    r.timeout = _DNS_TIMEOUT
    r.lifetime = _DNS_TIMEOUT
    try:
        r.resolve(domain, "A")
        return True
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.exception.Timeout):
        return False
    except dns.resolver.NoNameservers:
        return False


def _http_responds(domain: str, client: httpx.Client | None = None) -> bool:
    """True if HEAD to https://{domain} returns 2xx or 3xx within timeout."""
    owned_client = client is None
    c = client or httpx.Client(
        timeout=_HTTP_TIMEOUT,
        follow_redirects=True,
        headers={"User-Agent": _USER_AGENT},
    )
    try:
        # HEAD is preferred — many small-biz hosts reject HEAD with 405 though,
        # so we fall back to GET with a tiny stream + close.
        resp = c.head(f"https://{domain}")
        if 200 <= resp.status_code < 400:
            return True
        # Try plain http if https failed (some old domains haven't migrated)
        if resp.status_code in (405, 501):
            resp = c.get(f"https://{domain}")
            return 200 <= resp.status_code < 400
        return False
    except (httpx.RequestError, httpx.TimeoutException):
        return False
    finally:
        if owned_client:
            c.close()


def check_domains(business_name: str) -> tuple[str | None, bool | None]:
    """Probe up to 4 domain variants. Return (first_live_url, has_website).

    has_website semantics:
        True  — at least one variant resolved AND responded
        False — all 4 variants checked, none responded (DNS or HTTP miss)
        None  — couldn't check (e.g. blank business name)

    The first-live-URL is the bare domain (no scheme prefix).
    """
    candidates = candidate_domains(business_name)
    if not candidates:
        return (None, None)
    resolver = dns.resolver.Resolver()
    resolver.timeout = _DNS_TIMEOUT
    resolver.lifetime = _DNS_TIMEOUT
    client = httpx.Client(
        timeout=_HTTP_TIMEOUT,
        follow_redirects=True,
        headers={"User-Agent": _USER_AGENT},
    )
    try:
        for domain in candidates:
            if not _dns_resolves(domain, resolver):
                continue
            if _http_responds(domain, client):
                logger.info(
                    "domain_check.hit",
                    extra={"business_name": business_name, "domain": domain},
                )
                return (domain, True)
        return (None, False)
    finally:
        client.close()
