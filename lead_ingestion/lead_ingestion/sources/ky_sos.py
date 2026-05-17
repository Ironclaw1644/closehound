"""KY SOS ingester — gated by a paid subscription.

KY Secretary of State publishes business filings only through their **Bulk
Data Service** (`https://www.sos.ky.gov/bus/Pages/Bulk-Data-Service.aspx`),
which requires a Kentucky.gov subscriber agreement. Commercial subscribers
pay a monthly fee; non-commercial researchers can subscribe for free but
must still go through the agreement flow.

There is no public daily/weekly delta CSV at a stable URL; the public
`web.sos.ky.gov` search returns 404 on the directory paths the spec
referenced, and the bulk service sits behind authentication.

Until a subscription is provisioned this ingester is a no-op. We log a single
WARNING per run so the operator can see it's gated (not silently failing).
The orchestrator continues with whatever other sources are enabled.

To silence the warning: set `SOURCE_KY_SOS_ENABLED=0` in the env.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date

from ..base import BaseIngester, Filing, Source
from ..config import KYSOSConfig
from ..logging_setup import get_logger

logger = get_logger(__name__)


class KYSOSIngester(BaseIngester):
    source = Source.KY_SOS

    def __init__(self, cfg: KYSOSConfig) -> None:
        self.cfg = cfg

    def fetch_new_filings(self, since_date: date) -> Iterable[Filing]:
        logger.warning(
            "ky_sos.gated",
            extra={
                "reason": (
                    "KY SOS Bulk Data Service requires a Kentucky.gov "
                    "subscriber agreement (commercial users pay a monthly "
                    "fee). No free public delta feed exists. Flip "
                    "SOURCE_KY_SOS_ENABLED=0 to silence this warning."
                ),
                "since_date": since_date.isoformat(),
            },
        )
        return []
