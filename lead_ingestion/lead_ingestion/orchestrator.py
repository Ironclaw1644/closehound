"""Entry point: run all enabled ingesters end-to-end.

CLI:
    python -m lead_ingestion.orchestrator --source all --since 2026-04-01
    python -m lead_ingestion.orchestrator --source fl_sunbiz --since 2026-05-01
    python -m lead_ingestion.orchestrator --source fl_sunbiz --days 14

Steps per source:
    1. fetch_new_filings(since)
    2. NAICS filter (keep matches, including name-inferred)
    3. Upsert into closehound.new_business_leads (ON CONFLICT DO NOTHING)
    4. For newly-inserted rows: domain_check + gmb_check + score + write back
    5. Emit one structured-JSON summary line per source

Re-running with the same date range is safe — step 3's ON CONFLICT path turns
duplicates into no-ops.
"""

from __future__ import annotations

import argparse
import sys
import time
from collections.abc import Iterable
from datetime import date, datetime, timedelta
from typing import Any

from .base import BaseIngester, EnrichedFiling, Filing, Source
from .config import Config, load_config
from .enrichment.domain_check import check_domains
from .enrichment.gmb_check import check_gmb
from .logging_setup import configure as configure_logging
from .logging_setup import get_logger
from .naics_filter import matches_target
from .scoring import compute_score, tier_for
from .sources.fl_sunbiz import FLSunbizIngester
from .sources.ga_sos import GASOSIngester
from .sources.ky_sos import KYSOSIngester
from .sources.ny_dos import NYDOSIngester
from .supabase_client import get_client, upsert_filings

logger = get_logger(__name__)


SOURCE_KEYS = {
    "fl_sunbiz": Source.FL_SUNBIZ,
    "ga_sos": Source.GA_SOS,
    "ky_sos": Source.KY_SOS,
    "ny_dos": Source.NY_DOS,
}


def _build_ingesters(cfg: Config, selected: set[Source]) -> list[BaseIngester]:
    out: list[BaseIngester] = []
    if cfg.toggles.fl_sunbiz and Source.FL_SUNBIZ in selected:
        out.append(FLSunbizIngester(cfg.fl_sunbiz))
    if cfg.toggles.ga_sos and Source.GA_SOS in selected:
        out.append(GASOSIngester(cfg.ga_sos))
    if cfg.toggles.ky_sos and Source.KY_SOS in selected:
        out.append(KYSOSIngester(cfg.ky_sos))
    if cfg.toggles.ny_dos and Source.NY_DOS in selected:
        out.append(NYDOSIngester(cfg.ny_dos))
    return out


def _filter_and_annotate(filings: Iterable[Filing]) -> Iterable[Filing]:
    """Drop filings outside the target NAICS list. Annotate the matches with
    naics_code + naics_inferred so downstream sees the inference results."""
    for f in filings:
        matched, code, _, inferred = matches_target(f.naics_code, f.business_name)
        if not matched:
            continue
        # Update naics_code in place if we inferred one
        if code and not f.naics_code:
            f.naics_code = code
            f.naics_inferred = inferred
        yield f


def _enrich_one(filing: Filing, *, run_gmb: bool = True) -> EnrichedFiling:
    """Run enrichment checks. Failures are caught and reported in the
    EnrichedFiling.enrichment_errors list — they don't bubble up.

    GMB is the slow check (rate-limited to ~3s/lead). Pass run_gmb=False when
    iterating over a large window where the domain signal alone is enough.
    """
    enriched = EnrichedFiling(filing=filing)
    try:
        domain, has = check_domains(filing.business_name)
        enriched.domain_found = domain
        enriched.has_website = has
    except Exception as exc:
        enriched.enrichment_errors.append(f"domain_check:{exc!r}")
    if run_gmb:
        try:
            city = (filing.principal_address or {}).get("city") if filing.principal_address else None
            enriched.gmb_found = check_gmb(filing.business_name, city)
        except Exception as exc:
            enriched.enrichment_errors.append(f"gmb_check:{exc!r}")
    return enriched


def _score(enriched: EnrichedFiling, today: date) -> None:
    enriched.priority_score = compute_score(enriched, today)
    enriched.priority_tier = tier_for(enriched.priority_score)


def run_ingester(
    ingester: BaseIngester,
    *,
    since_date: date,
    today: date,
    enrich: bool = True,
    enrich_gmb: bool = True,
    upsert_batch_size: int = 500,
) -> dict[str, Any]:
    """Run one ingester end-to-end. Returns summary counts."""
    fetched = 0
    new = 0
    conflicted = 0
    counts: dict[str, int] = {"hot": 0, "warm": 0, "cold": 0, "enrich_errors": 0}

    batch: list[EnrichedFiling] = []

    def flush() -> None:
        nonlocal new, conflicted
        if not batch:
            return
        inserted, conf = upsert_filings(batch)
        new += inserted
        conflicted += conf
        for e in batch:
            tier = e.priority_tier.value if e.priority_tier else "cold"
            counts[tier] += 1
            if e.enrichment_errors:
                counts["enrich_errors"] += 1
        batch.clear()

    for filing in _filter_and_annotate(ingester.fetch_new_filings(since_date)):
        fetched += 1
        enriched = (
            _enrich_one(filing, run_gmb=enrich_gmb)
            if enrich
            else EnrichedFiling(filing=filing)
        )
        _score(enriched, today)
        batch.append(enriched)
        if len(batch) >= upsert_batch_size:
            flush()
    flush()

    summary = {
        "source": ingester.source.value,
        "since_date": since_date.isoformat(),
        "fetched": fetched,
        "new": new,
        "conflicted": conflicted,
        **counts,
    }
    logger.info("ingester.summary", extra=summary)
    return summary


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(prog="lead_ingestion.orchestrator")
    p.add_argument(
        "--source",
        default="all",
        help="Comma-separated source keys (fl_sunbiz, ga_sos, ky_sos, ny_dos) or 'all'",
    )
    date_grp = p.add_mutually_exclusive_group()
    date_grp.add_argument("--since", help="ISO date (YYYY-MM-DD) — fetch filings >= this date")
    date_grp.add_argument("--days", type=int, help="Fetch filings within the last N days (default 14)")
    p.add_argument(
        "--skip-enrichment",
        action="store_true",
        help="Skip domain + GMB checks (faster ingest; lower scores). Useful in tests.",
    )
    p.add_argument(
        "--skip-gmb",
        action="store_true",
        help=(
            "Run domain check only; skip the slow GMB check. Useful for wide "
            "windows where the domain signal alone is enough to score hot."
        ),
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    args = parse_args(argv)

    today = date.today()
    if args.since:
        since_date = datetime.fromisoformat(args.since).date()
    else:
        days = args.days if args.days is not None else 14
        since_date = today - timedelta(days=days)

    if args.source == "all":
        selected = set(SOURCE_KEYS.values())
    else:
        try:
            selected = {SOURCE_KEYS[k.strip().lower()] for k in args.source.split(",")}
        except KeyError as exc:
            logger.error("orchestrator.bad_source", extra={"error": repr(exc)})
            return 2

    cfg = load_config()
    ingesters = _build_ingesters(cfg, selected)
    if not ingesters:
        logger.warning(
            "orchestrator.no_sources_enabled",
            extra={"requested": [s.value for s in selected]},
        )
        return 0

    started = time.monotonic()
    source_summaries: list[dict[str, Any]] = []
    for ingester in ingesters:
        try:
            summary = run_ingester(
                ingester,
                since_date=since_date,
                today=today,
                enrich=not args.skip_enrichment,
                enrich_gmb=not args.skip_gmb,
            )
            source_summaries.append(summary)
        except Exception as exc:
            logger.exception(
                "orchestrator.source_failed",
                extra={"source": ingester.source.value, "error": repr(exc)},
            )
            source_summaries.append(
                {"source": ingester.source.value, "error": repr(exc)}
            )
    overall: dict[str, Any] = {
        "sources": source_summaries,
        "since_date": since_date.isoformat(),
        "today": today.isoformat(),
    }

    elapsed = time.monotonic() - started
    logger.info("orchestrator.done", extra={"elapsed_s": round(elapsed, 1), **overall})

    # Touch the client once so the lru_cache is exercised — avoids unused-import
    # warnings in editors when only the upsert/write paths are hit.
    _ = get_client
    return 0


if __name__ == "__main__":
    sys.exit(main())
