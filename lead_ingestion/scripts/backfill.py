"""CLI helper: backfill the last 60 days across all enabled sources.

Same code path as the orchestrator; just hardcodes a wider window. Use for:
- First-run onboarding (populate the table with everything recent)
- Recovering from a missed cron window

Invocation:
    uv run python -m lead_ingestion.scripts.backfill
    uv run python -m lead_ingestion.scripts.backfill --days 30
"""

from __future__ import annotations

import argparse
import sys
from datetime import date, timedelta

from lead_ingestion.orchestrator import main as orchestrator_main


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="backfill")
    p.add_argument("--days", type=int, default=60, help="Days of history to pull (default 60).")
    p.add_argument("--source", default="all", help="Same as orchestrator --source.")
    p.add_argument("--skip-enrichment", action="store_true")
    p.add_argument(
        "--skip-gmb",
        action="store_true",
        help="Skip the slow GMB check (recommended for wide windows).",
    )
    args = p.parse_args(argv)

    since = (date.today() - timedelta(days=args.days)).isoformat()
    forwarded = ["--source", args.source, "--since", since]
    if args.skip_enrichment:
        forwarded.append("--skip-enrichment")
    if args.skip_gmb:
        forwarded.append("--skip-gmb")
    return orchestrator_main(forwarded)


if __name__ == "__main__":
    sys.exit(main())
