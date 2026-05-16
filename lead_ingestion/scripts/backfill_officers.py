"""Backfill `officers` on existing FL new_business_leads rows.

Re-parses the cached `YYYYMMDDc.txt` files in `~/.cache/closehound/fl_sunbiz/`
and runs the (now richer) officer extractor over each line. Only UPDATEs rows
whose `officers` column is currently NULL — safe to re-run.

NY rows aren't covered here because NY DOS doesn't ship a cache; re-pull NY
via the dashboard's "Pull SOS leads" button when you want fresh chairman data.

Usage:
    cd lead_ingestion && uv run python scripts/backfill_officers.py
    cd lead_ingestion && uv run python scripts/backfill_officers.py --force
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.sources.fl_sunbiz import (
    _filing_date_from_filename,
    _parse_line,
)
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


def backfill(*, force: bool, cache_dir: Path) -> dict[str, int]:
    client = get_client()
    # Build doc_number → officers map by re-parsing cached files.
    officers_by_doc: dict[str, list[dict[str, object]]] = {}
    files_seen = 0
    for path in sorted(cache_dir.glob("*c.txt")):
        filing_date = _filing_date_from_filename(path.name)
        if filing_date is None:
            continue
        files_seen += 1
        with path.open("r", encoding="latin-1", errors="replace") as fh:
            for raw_line in fh:
                line = raw_line.rstrip("\r\n")
                if not line.strip():
                    continue
                rec = _parse_line(line, filing_date=filing_date)
                if rec is None:
                    continue
                officers = rec.get("officers_parsed")
                if officers:
                    officers_by_doc[rec["doc_number"]] = officers
    logger.info(
        "backfill_officers.parsed_cache",
        extra={"files": files_seen, "docs_with_officers": len(officers_by_doc)},
    )

    # Pull existing FL rows that need filling.
    page_size = 1000
    offset = 0
    updated = 0
    skipped_no_match = 0
    while True:
        q = (
            client.schema("closehound")
            .table("new_business_leads")
            .select("id,source_entity_id,officers")
            .eq("source", "FL_SUNBIZ")
            .range(offset, offset + page_size - 1)
        )
        res = q.execute()
        rows = res.data or []
        if not rows:
            break
        for row in rows:
            doc = row.get("source_entity_id")
            existing = row.get("officers")
            if not force and existing:
                continue
            officers = officers_by_doc.get(doc)
            if not officers:
                skipped_no_match += 1
                continue
            client.schema("closehound").table("new_business_leads").update(
                {"officers": officers}
            ).eq("id", row["id"]).execute()
            updated += 1
        if len(rows) < page_size:
            break
        offset += page_size

    summary = {"updated": updated, "no_cache_match": skipped_no_match}
    logger.info("backfill_officers.done", extra=summary)
    return summary


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="backfill_officers")
    p.add_argument("--force", action="store_true")
    p.add_argument(
        "--cache-dir",
        default=str(Path.home() / ".cache" / "closehound" / "fl_sunbiz"),
    )
    args = p.parse_args(argv)
    backfill(force=args.force, cache_dir=Path(args.cache_dir))
    return 0


if __name__ == "__main__":
    sys.exit(main())
