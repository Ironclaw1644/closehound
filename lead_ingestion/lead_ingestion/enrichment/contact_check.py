"""Free-tier contact enrichment — phone + email best-effort.

State SOS filings never include phone or email (legal-record forms don't ask).
For brand-new businesses that also don't yet have a website (our "hot" pool),
public contact info is genuinely scarce. This module pieces together what's
free + non-captcha-gated:

  1. If we already have a domain (from domain_check), fetch the homepage AND
     `/contact`, `/contact-us`, `/about`, prefer `tel:`/`mailto:` href values
     over free-text matches. Hit rate is high (~70%) when we have a domain.
  2. Else, hit DuckDuckGo's HTML endpoint (then Bing, then Brave on fallback)
     for `"<business name>" <city>` (or `"<owner name>" <city> <industry>` if
     the SOS gave us an officer). Take the top 3 organic result URLs and
     scrape each — that's where the actual contact info lives. Hit rate is
     ~20-30% for no-website businesses; many brand-new entities have zero
     web footprint at all.

Returns (phone, email) — both `None` when nothing found. Failures don't raise;
the orchestrator's enrichment loop catches and continues.

Rate limited to ~1 req/2s + jitter to stay polite. CAPTCHA detection bails
to the next engine rather than continuing to hammer a blocked one.
"""

from __future__ import annotations

import random
import re
import time
from collections.abc import Iterable
from urllib.parse import quote_plus, urlparse

import httpx
from bs4 import BeautifulSoup

from ..logging_setup import get_logger

logger = get_logger(__name__)


# Free-text phone regex. Requires a valid US area code ([2-9]xx) AND exchange,
# AND at least one separator between parts — without separators we'd match
# inside long runs of decorative digits (placeholder image IDs, etc.).
# Forms accepted: "(305) 555-1212", "305-555-1212", "305.555.1212",
# "+1 305 555 1212", "305 555 1212". The href-based extractor handles the
# unseparated "tel:13055551212" case independently.
_PHONE_RE = re.compile(
    r"""(?<![\d./])                       # not preceded by digit or url-ish punct
        (?:\+?1[-.\s]?)?                   # optional leading +1
        \(?([2-9]\d{2})\)?[-.\s ]      # area code with required sep
        \s*
        ([2-9]\d{2})[-.\s ]            # exchange with required sep
        \s*
        (\d{4})
        (?!\d)                             # don't bleed into longer numbers
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
    "sentry-cdn.com",
    "wixpress.com",
    "wix.com",
    "godaddy.com",
    "schema.org",
    "w3.org",
    "googleapis.com",
    "google.com",
    "googleusercontent.com",
    "gstatic.com",
    "facebook.com",
    "fbcdn.net",
    "instagram.com",
    "youtube.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "sentry.wixpress.com",
    "cloudflare.com",
    "cloudfront.net",
    "amazonaws.com",
    "bootstrapcdn.com",
    "jsdelivr.net",
    "unpkg.com",
    "fontawesome.com",
    "wordpress.com",
    "wp.com",
    "squarespace.com",
    "shopify.com",
    "myshopify.com",
    "duckduckgo.com",
    "bing.com",
    "brave.com",
)
_BAD_EMAIL_LOCAL_PARTS = (
    "noreply",
    "no-reply",
    "donotreply",
    "do-not-reply",
    "postmaster",
    "mailer-daemon",
    "abuse",
    "wordpress",
    "sentry",
)

# Known registered-agent service providers — their names are NOT useful as
# search terms for finding the underlying business.
_KNOWN_RA_SERVICES = frozenset(
    {
        s.lower()
        for s in [
            "LegalZoom USCA, INC.",
            "Northwest Registered Agent",
            "Registered Agents Inc",
            "Entity Protect Registered Agent Services LLC",
            "Cogency Global",
            "InCorp Services",
            "Harbor Compliance",
            "Corporation Service Company",
            "CT Corporation System",
            "URS Agents LLC",
            "Capitol Services",
            "Spiegel & Utrera",
        ]
    }
)

_CONTACT_PATHS = ("", "/contact", "/contact-us", "/about", "/about-us", "/contact.html")

_UAS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
]


def _ua() -> str:
    return random.choice(_UAS)


def _polite_sleep(base: float = 2.0, jitter: float = 1.5) -> None:
    time.sleep(base + random.random() * jitter)


def _normalize_phone(area: str, ex: str, sub: str) -> str | None:
    if area in _BAD_PHONE_PREFIXES:
        return None
    return f"({area}) {ex}-{sub}"


def _looks_like_captcha(body: str, url: str) -> bool:
    """Heuristic detection of CAPTCHA / "verify you're human" walls."""
    low = body[:8000].lower()
    needles = (
        "captcha",
        "anomaly-modal",
        "are you a human",
        "verify you are human",
        "please verify you",
        "please complete the security check",
        "unusual traffic",
        "automated requests",
        "challenge-form",
        "cf-challenge",
    )
    if any(n in low for n in needles):
        logger.debug("contact_check.captcha", extra={"url": url})
        return True
    return False


def _extract_from_links(soup: BeautifulSoup) -> tuple[str | None, str | None]:
    """Pull phone/email from <a href="tel:..."> and <a href="mailto:..."> — most reliable."""
    phone = None
    email = None
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith("tel:") and not phone:
            digits = re.sub(r"\D", "", href[4:])
            if digits.startswith("1") and len(digits) == 11:
                digits = digits[1:]
            if len(digits) == 10:
                area, ex, sub = digits[:3], digits[3:6], digits[6:]
                p = _normalize_phone(area, ex, sub)
                if p:
                    phone = p
        elif href.startswith("mailto:") and not email:
            addr = href[7:].split("?")[0].strip().lower()
            if _is_good_email(addr):
                email = addr
        if phone and email:
            break
    return (phone, email)


def _is_good_email(addr: str) -> bool:
    if "@" not in addr:
        return False
    if len(addr) < 7:  # "a@b.co" is the shortest plausible real address
        return False
    if len(addr) > 80:  # crawler garbage tends to be long
        return False
    # URL-encoded characters or whitespace mean this came from a parser glitch
    if "%" in addr or any(c.isspace() for c in addr):
        return False
    local, _, domain = addr.partition("@")
    if not local or not domain:
        return False
    if "." not in domain:
        return False
    # TLDs are at least 2 chars; "b.co" → domain "b.co" → tld "co" is OK,
    # but "ni.b" has tld "b" which is invalid
    tld = domain.rsplit(".", 1)[-1]
    if len(tld) < 2:
        return False
    # Local part must be at least 2 chars (catches "0@..." junk)
    if len(local) < 2:
        return False
    # Domain must have at least 2 chars before the TLD
    sld = domain.rsplit(".", 1)[0] if "." in domain else domain
    if len(sld) < 2:
        return False
    if domain in _BAD_EMAIL_DOMAINS:
        return False
    if local in _BAD_EMAIL_LOCAL_PARTS:
        return False
    if domain.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp")):
        return False
    return True


def _first_phone(text: str) -> str | None:
    for m in _PHONE_RE.finditer(text):
        phone = _normalize_phone(*m.groups())
        if phone:
            return phone
    return None


def _first_email(text: str, *, preferred_domain: str | None = None) -> str | None:
    candidates: list[str] = []
    for m in _EMAIL_RE.finditer(text):
        addr = m.group(0).lower()
        if _is_good_email(addr):
            candidates.append(addr)
    if not candidates:
        return None
    if preferred_domain:
        prefd = preferred_domain.lower().lstrip("www.")
        for addr in candidates:
            if addr.endswith("@" + prefd) or addr.endswith("." + prefd):
                return addr
    return candidates[0]


def _scrape_url(
    url: str,
    *,
    timeout_s: float = 8.0,
    client: httpx.Client | None = None,
    preferred_domain: str | None = None,
) -> tuple[str | None, str | None]:
    """Fetch a URL, extract phone/email. Returns (phone, email)."""
    owned = client is None
    c = client or httpx.Client(
        timeout=timeout_s,
        follow_redirects=True,
        headers={"User-Agent": _ua(), "Accept": "text/html,application/xhtml+xml"},
    )
    try:
        resp = c.get(url)
        if resp.status_code >= 400:
            return (None, None)
        body = resp.text
    except (httpx.HTTPError, OSError) as exc:
        logger.debug("contact_check.fetch_fail", extra={"url": url, "err": repr(exc)})
        return (None, None)
    finally:
        if owned:
            c.close()
    if _looks_like_captcha(body, url):
        return (None, None)
    soup = BeautifulSoup(body, "html.parser")
    # Drop noisy nodes that often have decorative phones/emails we don't want.
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    # First, prefer href-based extraction.
    phone, email = _extract_from_links(soup)
    # Then fill gaps from visible text.
    if not phone or not email:
        text = soup.get_text(" ", strip=True)
        if not phone:
            phone = _first_phone(text)
        if not email:
            email = _first_email(text, preferred_domain=preferred_domain)
    return (phone, email)


def scrape_website(
    domain: str,
    *,
    timeout_s: float = 8.0,
    verify_city: str | None = None,
    verify_state: str | None = None,
) -> tuple[str | None, str | None, bool]:
    """Fetch the homepage + a few likely contact pages and combine results.

    Returns (phone, email, verified). `verified` is True if any scraped page
    mentioned `verify_city` or `verify_state` — useful for filtering out
    cases where a same-named business at a different domain returns a phone
    that doesn't belong to our lead.
    """
    if not domain:
        return (None, None, False)
    base = f"https://{domain.lstrip('/').rstrip('/')}"
    phone, email = (None, None)
    verified = False
    client = httpx.Client(
        timeout=timeout_s,
        follow_redirects=True,
        headers={"User-Agent": _ua(), "Accept": "text/html,application/xhtml+xml"},
    )
    try:
        for path in _CONTACT_PATHS:
            url = base + path if path else base
            p, e, v = _scrape_url_with_verify(
                url,
                client=client,
                preferred_domain=domain,
                verify_city=verify_city,
                verify_state=verify_state,
            )
            phone = phone or p
            email = email or e
            verified = verified or v
            if phone and email and verified:
                break
    finally:
        client.close()
    return (phone, email, verified)


def _scrape_url_with_verify(
    url: str,
    *,
    timeout_s: float = 8.0,
    client: httpx.Client | None = None,
    preferred_domain: str | None = None,
    verify_city: str | None = None,
    verify_state: str | None = None,
) -> tuple[str | None, str | None, bool]:
    """Like _scrape_url but also returns whether the page mentioned city/state."""
    owned = client is None
    c = client or httpx.Client(
        timeout=timeout_s,
        follow_redirects=True,
        headers={"User-Agent": _ua(), "Accept": "text/html,application/xhtml+xml"},
    )
    try:
        resp = c.get(url)
        if resp.status_code >= 400:
            return (None, None, False)
        body = resp.text
    except (httpx.HTTPError, OSError) as exc:
        logger.debug("contact_check.fetch_fail", extra={"url": url, "err": repr(exc)})
        return (None, None, False)
    finally:
        if owned:
            c.close()
    if _looks_like_captcha(body, url):
        return (None, None, False)
    soup = BeautifulSoup(body, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    phone, email = _extract_from_links(soup)
    text = soup.get_text(" ", strip=True)
    if not phone:
        phone = _first_phone(text)
    if not email:
        email = _first_email(text, preferred_domain=preferred_domain)
    location_mentioned = _page_mentions_location(text, verify_city, verify_state)
    area_match = _phone_matches_state(phone, verify_state)
    verified = location_mentioned or area_match
    return (phone, email, verified)


_STATE_AREA_CODES: dict[str, frozenset[str]] = {
    "FL": frozenset(
        {"239", "305", "321", "352", "386", "407", "448", "561", "656",
         "727", "754", "772", "786", "813", "850", "863", "904", "941", "954"}
    ),
    "NY": frozenset(
        {"212", "315", "332", "347", "363", "516", "518", "585", "607",
         "631", "646", "680", "716", "718", "838", "845", "914", "917", "929", "934"}
    ),
    "GA": frozenset(
        {"229", "404", "470", "478", "678", "706", "762", "770", "912", "943"}
    ),
    "KY": frozenset({"270", "364", "502", "606", "859"}),
}


def _phone_matches_state(phone: str | None, state: str | None) -> bool:
    if not phone or not state:
        return False
    codes = _STATE_AREA_CODES.get(state.upper().strip())
    if not codes:
        return False
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("1") and len(digits) == 11:
        digits = digits[1:]
    if len(digits) < 3:
        return False
    return digits[:3] in codes


_STATE_FULL_NAMES = {
    "FL": "florida",
    "NY": "new york",
    "GA": "georgia",
    "KY": "kentucky",
}


def _page_mentions_location(text: str, city: str | None, state: str | None) -> bool:
    """True if the page text mentions the given city OR state name/abbrev."""
    if not city and not state:
        return False
    low = text.lower()
    if city:
        c = city.strip().lower()
        if c and len(c) >= 3 and c in low:
            return True
    if state:
        s = state.strip().upper()
        # Match the 2-letter code as a word boundary.
        if len(s) == 2:
            pattern = re.compile(rf"\b{re.escape(s.lower())}\b")
            if pattern.search(low):
                return True
            full = _STATE_FULL_NAMES.get(s)
            if full and full in low:
                return True
        elif s.lower() in low:
            return True
    return False


# -------------------------- Search engines --------------------------

def _ddg_results(query: str, *, timeout_s: float = 10.0) -> list[str]:
    """Parse organic result URLs from DuckDuckGo's HTML endpoint."""
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    return _engine_results(url, timeout_s, parser="ddg")


def _bing_results(query: str, *, timeout_s: float = 10.0) -> list[str]:
    url = f"https://www.bing.com/search?q={quote_plus(query)}&form=QBLH"
    return _engine_results(url, timeout_s, parser="bing")


def _brave_results(query: str, *, timeout_s: float = 10.0) -> list[str]:
    url = f"https://search.brave.com/search?q={quote_plus(query)}&source=web"
    return _engine_results(url, timeout_s, parser="brave")


def _engine_results(url: str, timeout_s: float, *, parser: str) -> list[str]:
    """Generic search-engine result extractor — returns top organic URLs.

    Handles DDG's 202-Accepted soft-rate-limit specifically: backs off and
    retries once. If still throttled, returns [] so the caller falls through.
    """
    for attempt in range(2):
        try:
            with httpx.Client(
                timeout=timeout_s,
                follow_redirects=True,
                headers={
                    "User-Agent": _ua(),
                    "Accept": "text/html,application/xhtml+xml",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            ) as client:
                resp = client.get(url)
                if resp.status_code == 202 and parser == "ddg" and attempt == 0:
                    # DDG soft rate limit — cool down and try once more.
                    logger.info(
                        "contact_check.engine_throttle",
                        extra={"engine": parser, "status": 202},
                    )
                    time.sleep(5.0 + random.random() * 3.0)
                    continue
                if resp.status_code != 200:
                    logger.debug(
                        "contact_check.engine_status",
                        extra={"engine": parser, "status": resp.status_code},
                    )
                    return []
                body = resp.text
                break
        except (httpx.HTTPError, OSError) as exc:
            logger.debug("contact_check.engine_fail", extra={"engine": parser, "err": repr(exc)})
            return []
    else:
        return []
    if _looks_like_captcha(body, url):
        logger.info("contact_check.engine_captcha", extra={"engine": parser})
        return []
    soup = BeautifulSoup(body, "html.parser")
    urls: list[str] = []
    if parser == "ddg":
        for a in soup.select("a.result__a, a.result__url"):
            href = a.get("href", "")
            cleaned = _clean_ddg_href(href)
            if cleaned and cleaned not in urls:
                urls.append(cleaned)
    elif parser == "bing":
        for li in soup.select("li.b_algo h2 a"):
            href = li.get("href", "")
            if href.startswith("http") and href not in urls:
                urls.append(href)
    elif parser == "brave":
        for a in soup.select("a.h, div.snippet a, a.result-header"):
            href = a.get("href", "")
            if href.startswith("http") and href not in urls:
                urls.append(href)
    return urls


def bing_snippet_contacts(
    query: str,
    *,
    verify_state: str | None = None,
    timeout_s: float = 10.0,
) -> tuple[str | None, str | None]:
    """Extract phone/email directly from Bing's SERP snippet text.

    Useful when the linked pages are scrape-blocked (Yelp, FB, etc.) but
    Bing's snippet contains the contact info inline. If verify_state is
    given, prefers a phone whose area code matches that state.
    """
    url = f"https://www.bing.com/search?q={quote_plus(query)}&form=QBLH"
    try:
        with httpx.Client(
            timeout=timeout_s,
            follow_redirects=True,
            headers={"User-Agent": _ua(), "Accept": "text/html,application/xhtml+xml"},
        ) as client:
            resp = client.get(url)
            if resp.status_code != 200:
                return (None, None)
            body = resp.text
    except (httpx.HTTPError, OSError):
        return (None, None)
    if _looks_like_captcha(body, url):
        return (None, None)
    soup = BeautifulSoup(body, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    # Bing renders results in li.b_algo and ol#b_results.
    text_chunks = []
    for el in soup.select("li.b_algo, ol#b_results, div.b_snippet, div.b_caption"):
        text_chunks.append(el.get_text(" ", strip=True))
    text = " ".join(text_chunks) or soup.get_text(" ", strip=True)
    # Find all phones, prefer one whose area code matches the state.
    phones: list[str] = []
    for m in _PHONE_RE.finditer(text):
        p = _normalize_phone(*m.groups())
        if p:
            phones.append(p)
    chosen_phone: str | None = None
    if verify_state:
        for p in phones:
            if _phone_matches_state(p, verify_state):
                chosen_phone = p
                break
    if not chosen_phone and phones:
        chosen_phone = phones[0]
    email = _first_email(text)
    return (chosen_phone, email)


def _clean_ddg_href(href: str) -> str | None:
    """DDG wraps results in /l/?uddg=<url>&... ; extract the real URL."""
    if href.startswith("http"):
        return href
    if href.startswith("//"):
        href = "https:" + href
        return href
    if "uddg=" in href:
        # Parse out the uddg parameter
        from urllib.parse import parse_qs, unquote
        try:
            after = href.split("?", 1)[1] if "?" in href else ""
            qs = parse_qs(after)
            uddg = qs.get("uddg", [None])[0]
            if uddg:
                return unquote(uddg)
        except (IndexError, ValueError):
            return None
    return None


def _is_useful_result(url: str) -> bool:
    """Skip search-engine internal redirects and known low-value domains."""
    if not url or not url.startswith("http"):
        return False
    host = urlparse(url).netloc.lower()
    if not host:
        return False
    blocked = (
        "duckduckgo.com",
        "bing.com",
        "google.com",
        "youtube.com",
        "wikipedia.org",
        # Free-tier scraping of Yelp / FB is blocked by anti-bot walls — skip
        # them so we don't burn time on dead-ends. The interesting hits come
        # from Yellow Pages, Manta, BBB, niche directories, owner sites.
        "yelp.com",
        "facebook.com",
        "instagram.com",
        "linkedin.com",
        "twitter.com",
        "x.com",
        "tiktok.com",
    )
    if any(b in host for b in blocked):
        return False
    return True


def _search_engines(query: str) -> Iterable[tuple[str, list[str]]]:
    """Try Bing first (most reliable), then DDG, then Brave.

    Order matters: DDG soft-rate-limits aggressively (202 Accepted) when hit
    in parallel; Bing tolerates more concurrency. Brave is reserved for last
    because it 429s the fastest.
    """
    yield ("bing", _bing_results(query))
    yield ("ddg", _ddg_results(query))
    yield ("brave", _brave_results(query))


def search_for_contact(
    query: str,
    *,
    max_results_per_engine: int = 2,
    verify_city: str | None = None,
    verify_state: str | None = None,
) -> tuple[str | None, str | None, bool]:
    """Run `query` through DDG (and Bing/Brave fallbacks if it returns nothing).

    URL scrapes from search results run in parallel — they hit different
    hosts, no rate-limit concern. Search-engine queries themselves stay
    sequential with polite sleeps between them.

    Returns (phone, email, verified).
    """
    from concurrent.futures import ThreadPoolExecutor

    seen_urls: set[str] = set()
    phone, email = (None, None)
    verified = False

    def _scrape(url: str) -> tuple[str | None, str | None, bool]:
        try:
            return _scrape_url_with_verify(
                url,
                verify_city=verify_city,
                verify_state=verify_state,
            )
        except Exception:
            return (None, None, False)

    saw_useful = False
    for engine, results in _search_engines(query):
        useful = [u for u in results if _is_useful_result(u) and u not in seen_urls]
        if not useful:
            continue
        saw_useful = True
        logger.debug(
            "contact_check.engine_hits",
            extra={"engine": engine, "n": len(useful), "query": query[:80]},
        )
        targets = useful[:max_results_per_engine]
        for u in targets:
            seen_urls.add(u)
        with ThreadPoolExecutor(max_workers=max(2, len(targets))) as pool:
            for p, e, v in pool.map(_scrape, targets):
                phone = phone or p
                email = email or e
                verified = verified or v
        if phone or email:
            return (phone, email, verified)
        # Brave only as last resort — its rate-limit triggers fastest.
        if engine == "brave":
            break
    # If we never saw useful results across all engines, the business
    # probably has no web footprint at all. Caller should not retry with
    # more queries — return early.
    return (phone, email, verified)


# -------------------------- Public entry point --------------------------


def find_contact(
    business_name: str,
    city: str | None,
    domain: str | None,
    *,
    owner_first: str | None = None,
    owner_last: str | None = None,
    industry_hint: str | None = None,
    state: str | None = None,
    registered_agent_name: str | None = None,
    max_queries: int = 2,
) -> tuple[str | None, str | None, bool]:
    """Best-effort multi-source contact lookup. Returns (phone, email, verified)."""
    phone, email = (None, None)
    verified = False
    # Step 1 — website scrape if we have a domain (highest yield).
    if domain:
        phone, email, verified = scrape_website(domain, verify_city=city, verify_state=state)
        if phone and email:
            logger.info(
                "contact_check.website_hit",
                extra={"biz": business_name, "phone": phone, "email": email, "verified": verified},
            )
            return (phone, email, verified)
    # Step 2 — search engines + result scraping. Cap queries to keep per-lead
    # cost bounded for the no-website pool (482 leads, ~5 sec each budget).
    queries = list(
        _build_queries(
            business_name=business_name,
            city=city,
            owner_first=owner_first,
            owner_last=owner_last,
            industry_hint=industry_hint,
            state=state,
            registered_agent_name=registered_agent_name,
        )
    )
    for query in queries[:max_queries]:
        if phone and email:
            break
        _polite_sleep(1.0, 1.0)
        p, e, v = search_for_contact(query, verify_city=city, verify_state=state)
        phone = phone or p
        email = email or e
        verified = verified or v
    if phone or email:
        logger.info(
            "contact_check.hit",
            extra={
                "biz": business_name,
                "phone": phone,
                "email": email,
                "verified": verified,
                "had_domain": bool(domain),
            },
        )
    return (phone, email, verified)


def _build_queries(
    *,
    business_name: str,
    city: str | None,
    owner_first: str | None,
    owner_last: str | None,
    industry_hint: str | None,
    state: str | None,
    registered_agent_name: str | None,
) -> Iterable[str]:
    """Produce search queries ordered most-discriminating first."""
    biz = (business_name or "").strip()
    city_s = (city or "").strip()
    state_s = (state or "").strip()
    industry = (industry_hint or "").strip()
    queries: list[str] = []
    # Owner name + city + industry is the strongest signal for brand-new LLCs.
    if owner_first and owner_last and city_s:
        owner = f'"{owner_first} {owner_last}"'
        if industry:
            queries.append(f"{owner} {city_s} {industry} phone")
        queries.append(f"{owner} {city_s} {state_s} phone")
    # Business name + city.
    if biz and city_s:
        queries.append(f'"{biz}" {city_s} phone')
        queries.append(f'"{biz}" {city_s}')
    elif biz:
        queries.append(f'"{biz}" {state_s} phone')
    # Registered agent (only useful if they're an individual, not a service).
    if registered_agent_name and registered_agent_name.strip().lower() not in _KNOWN_RA_SERVICES:
        ra = registered_agent_name.strip()
        if len(ra.split()) >= 2:  # likely a person, not a single-word entity
            queries.append(f'"{ra}" {city_s} {state_s}')
    # De-dup while preserving order
    seen: set[str] = set()
    out: list[str] = []
    for q in queries:
        norm = re.sub(r"\s+", " ", q.strip())
        if norm and norm not in seen:
            seen.add(norm)
            out.append(norm)
    return out


def search_duckduckgo(
    business_name: str, city: str | None, *, timeout_s: float = 10.0
) -> tuple[str | None, str | None]:
    """Backwards-compatible shim — kept for any callers that import it directly."""
    query = f'"{business_name}"' + (f" {city}" if city else "") + " phone"
    urls = _ddg_results(query, timeout_s=timeout_s)
    phone, email = (None, None)
    for url in urls[:3]:
        if not _is_useful_result(url):
            continue
        p, e = _scrape_url(url)
        phone = phone or p
        email = email or e
        if phone and email:
            return (phone, email)
        _polite_sleep(1.0, 1.0)
    return (phone, email)
