"""GA SOS ingester — gated, not currently functional.

The Georgia Secretary of State's online services (`ecorp.sos.ga.gov` and
`sos.ga.gov`) are protected by Cloudflare's "Managed Challenge" bot mitigation
as of 2026-05-15: any request without a verified browser fingerprint gets a
403 with `cf-mitigated: challenge`. A plain `httpx` scrape cannot pass this
gate; the response carries a Cloudflare challenge page, not the search HTML.

To actually pull GA SOS data we'd need one of:
  1. A headless browser with stealth plugins (Playwright + playwright-stealth)
     to solve the Cloudflare challenge.
  2. A paid bulk-data subscription via the GA SOS office.
  3. A reverse-proxy / scraping API (Bright Data, ScraperAPI, etc.) that
     transparently handles Cloudflare for you.

Until one of those is provisioned this ingester is a no-op. We log a single
WARNING per run so the operator can see it's gated (not silently failing).
The orchestrator continues with whatever other sources are enabled.

To silence the warning: set `SOURCE_GA_SOS_ENABLED=0` in the env.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date

from ..base import BaseIngester, Filing, Source
from ..config import GASOSConfig
from ..logging_setup import get_logger

logger = get_logger(__name__)


class GASOSIngester(BaseIngester):
    source = Source.GA_SOS

    def __init__(self, cfg: GASOSConfig) -> None:
        self.cfg = cfg

    def fetch_new_filings(self, since_date: date) -> Iterable[Filing]:
        logger.warning(
            "ga_sos.gated",
            extra={
                "reason": (
                    "ecorp.sos.ga.gov is Cloudflare-challenged; needs a "
                    "headless browser or paid bulk-data subscription. Flip "
                    "SOURCE_GA_SOS_ENABLED=0 to silence this warning."
                ),
                "since_date": since_date.isoformat(),
            },
        )
        return []
