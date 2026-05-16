"""Cheap GMB-presence check via a Google search HTML scrape.

Strategy:
- Query Google with `"<business_name>" <city>` quoted.
- Look for `google.com/maps/place` or `business.google.com` substrings.
- Rate-limit hard (1 req per ~3s + jitter) and rotate UA on each call.

This will get captcha-blocked at scale. We tolerate that by returning None
("couldn't check") and leaving a marker in logs. The orchestrator/scorer
treats None as no-signal (NOT as "no GMB" — that would inflate scores).

If captcha-blocking becomes the steady state, the right next step is to call
the existing TS Places worker as a fallback — leave a TODO_PLACES_FALLBACK in
the log so we can grep for it.
"""

from __future__ import annotations

import random
import time
import urllib.parse

import httpx

from ..logging_setup import get_logger

logger = get_logger(__name__)


# A small UA pool. We pick one per call. Real browsers cycle through a much
# longer list; for our volume this is enough to look human.
_USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
]

_BASE_DELAY = 3.0  # seconds between calls
_JITTER = 1.5
_TIMEOUT = 6.0
_last_call_at: float = 0.0


def _wait_polite() -> None:
    """Sleep so we don't exceed ~1 request per 3-4.5s globally."""
    global _last_call_at
    now = time.monotonic()
    elapsed = now - _last_call_at
    delay = _BASE_DELAY + random.uniform(0, _JITTER)
    if elapsed < delay:
        time.sleep(delay - elapsed)
    _last_call_at = time.monotonic()


def _looks_blocked(html: str) -> bool:
    """Detect a captcha/blocked response."""
    needles = (
        "Our systems have detected unusual traffic",
        "sorry/index?continue",
        "captcha",
        "g-recaptcha",
    )
    lowered = html.lower()
    return any(n.lower() in lowered for n in needles)


def check_gmb(business_name: str, city: str | None = None) -> bool | None:
    """Return True/False if we could check; None if blocked or no signal.

    True  — Google search showed a Maps place link → business has GMB
    False — search results contain no Maps/Business link → likely no GMB
    None  — captcha / network error / unable to verify either way
    """
    if not business_name:
        return None
    _wait_polite()
    query = f'"{business_name}"'
    if city:
        query += f" {city}"
    url = "https://www.google.com/search?q=" + urllib.parse.quote(query)
    ua = random.choice(_USER_AGENTS)
    try:
        with httpx.Client(
            timeout=_TIMEOUT,
            follow_redirects=True,
            headers={
                "User-Agent": ua,
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
            },
        ) as client:
            resp = client.get(url)
        if resp.status_code != 200:
            logger.warning(
                "gmb_check.non_200",
                extra={"business_name": business_name, "status": resp.status_code},
            )
            return None
        html = resp.text
        if _looks_blocked(html):
            logger.warning(
                "gmb_check.blocked",
                extra={"business_name": business_name, "marker": "TODO_PLACES_FALLBACK"},
            )
            return None
        return "google.com/maps/place" in html or "business.google.com" in html
    except (httpx.RequestError, httpx.TimeoutException) as exc:
        logger.warning(
            "gmb_check.error",
            extra={"business_name": business_name, "error": repr(exc)},
        )
        return None
