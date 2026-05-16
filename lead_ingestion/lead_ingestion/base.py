"""Shared types + the BaseIngester abstract class.

Every per-state ingester (FL Sunbiz, GA SOS, etc.) subclasses BaseIngester and
implements `fetch_new_filings`. The orchestrator treats them uniformly: pull,
NAICS-filter, upsert, enrich, score.

The data flow is:

  RawPayload (per-source)
    └─> Filing            (normalized, after parsing)
          └─> EnrichedFiling  (after domain + GMB checks + scoring)
                └─> upserted into closehound.new_business_leads
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import date
from enum import StrEnum
from typing import Any


class Source(StrEnum):
    """Allowed values for new_business_leads.source — matches the DB CHECK."""

    FL_SUNBIZ = "FL_SUNBIZ"
    GA_SOS = "GA_SOS"
    KY_SOS = "KY_SOS"
    NY_DOS = "NY_DOS"


class PriorityTier(StrEnum):
    """Matches DB CHECK on priority_tier."""

    HOT = "hot"
    WARM = "warm"
    COLD = "cold"


@dataclass(slots=True)
class Filing:
    """A normalized business filing — what an ingester yields.

    `source_entity_id` is whatever the state uses as their primary key
    (Florida calls it the "document number"; GA uses a "control number"; etc).
    Combined with `source`, it's unique per the DB constraint.

    `raw_payload` keeps the source's original record so we can backfill new
    fields later without re-fetching. Required by the DB (NOT NULL).
    """

    source: Source
    source_entity_id: str
    business_name: str
    filing_date: date
    state: str  # 2-letter
    raw_payload: dict[str, Any]

    # Optional / source-dependent
    entity_type: str | None = None  # LLC, CORP, LP, etc.
    principal_address: dict[str, Any] | None = None
    registered_agent: dict[str, Any] | None = None
    officers: list[dict[str, Any]] | None = None
    naics_code: str | None = None
    naics_inferred: bool = False


@dataclass(slots=True)
class EnrichedFiling:
    """A filing after enrichment + scoring. This is what gets written/updated.

    Created by the orchestrator from a Filing + the results of the enrichment
    checks. Kept separate from Filing so an ingester's responsibility ends
    at "yield a clean Filing" — no network calls beyond the source itself.
    """

    filing: Filing
    domain_found: str | None = None
    has_website: bool | None = None
    gmb_found: bool | None = None
    priority_score: int = 0
    priority_tier: PriorityTier | None = None
    # Errors encountered during enrichment, surfaced in the JSON log
    enrichment_errors: list[str] = field(default_factory=list)


class BaseIngester(ABC):
    """Each per-state ingester implements one method.

    Yielding (rather than returning a list) lets us stream large dumps without
    holding everything in memory — Sunbiz files can be hundreds of MB.

    Implementations should:
    - Be idempotent: the orchestrator dedupes on (source, source_entity_id).
    - Apply their own retries / timeouts / politeness.
    - Skip records older than `since_date` cheaply (most fixed-width dumps are
      sorted by filing date — short-circuit when possible).
    - Use structured logging via `logging_setup.get_logger(__name__)` — never
      print().
    """

    #: Subclasses override with their Source enum value.
    source: Source

    @abstractmethod
    def fetch_new_filings(self, since_date: date) -> Iterable[Filing]:
        """Yield Filings with filing_date >= since_date. Skip older silently."""
        raise NotImplementedError
