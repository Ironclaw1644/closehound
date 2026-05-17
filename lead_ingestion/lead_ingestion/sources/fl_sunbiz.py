"""FL Sunbiz SFTP ingester.

Florida's Division of Corporations exposes daily/quarterly dumps via SFTP at
`sftp.floridados.gov` under `/Public/doc/cor/`. Each day's file is named
`YYYYMMDDc.txt` (lowercase), fixed-width records, ~1440 chars/line.

Public credentials are documented by Florida DOS at
https://floridados.gov/sunbiz/other-services/data-downloads/ — they're not
secret but we keep them in .env, not in code.

Column positions were reverse-engineered from a live file (20260514c.txt) on
2026-05-15. If Sunbiz revises the layout the parser will produce nonsense
output — re-run the column-discovery script in scripts/probe_fl_layout.py.

The parser is generator-based so we don't hold a whole file in memory; one
daily file is ~2-4 MB. Multi-day windows download one file per day.
"""

from __future__ import annotations

import io
import time
from collections.abc import Iterable
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import paramiko

from ..base import BaseIngester, Filing, Source
from ..config import FLSunbizConfig
from ..logging_setup import get_logger

logger = get_logger(__name__)


# Column positions (0-indexed, end-exclusive), verified against the live file
# `/Public/doc/cor/20260514c.txt` on 2026-05-15. Trailing whitespace is right-
# padded per field; strip after slicing.
#
# IMPORTANT: the date at bytes 472-480 is the **effective date** (can be
# delayed up to 90 days into the future per FL statute), NOT the date the
# paperwork was filed. The actual filing date is the date encoded in the
# daily file's name (`YYYYMMDDc.txt`), which we pass through separately.
#
# If the format changes, run the probe script + update these in one place.
FL_SUNBIZ_COLS = {
    "doc_number":         (0, 12),    # primary key
    "business_name":      (12, 200),  # right-padded
    "status_flag":        (204, 205), # 'A' active / 'I' inactive (1 char)
    "filing_type":        (205, 213), # FLAL, FORC, DOMP, etc.
    "principal_addr1":    (220, 262),
    "principal_city":     (415, 447),
    "principal_state":    (458, 460),
    "principal_zip":      (460, 470),
    "effective_date":     (472, 480), # MMDDYYYY — entity's effective date
}


# Officer block — bytes 544+ carry the first (and often only) officer of a
# new filing. Layout reverse-engineered against `20260514c.txt`:
#
#   [544:564]  last_name   (20 chars, right-padded; sometimes 2-word compound)
#   [564:578]  first_name  (14 chars, right-padded)
#   [578:579]  middle_init (1 char)
#   (skip pad bytes 579-586, then role code "P"/"MGR"/"AMBR" at 586)
#   [587:629]  address1    (42 chars; assumes 1-char role "P")
#   [629:657]  city        (28 chars)
#   [657:659]  state       (2 chars)
#   [659:667]  zip         (8 chars, usually 5-digit)
#
# Multi-officer parsing (the second block at ~bytes 668+ which repeats the
# first officer's mailing address, plus 3rd+ blocks at 800+, 928+) is TODO.
# Most newly-formed FL LLCs have one Manager-President; one officer is enough.
_OFFICER_COLS = {
    "last_name":  (544, 564),
    "first_name": (564, 578),
    "middle":     (578, 579),
    "address1":   (587, 629),
    "city":       (629, 657),
    "state":      (657, 659),
    "zip":        (659, 667),
}


# Filing-type code → friendly entity_type. Sunbiz uses 4-letter codes.
# (FLAL = Florida Limited Liability — Active.)
_ENTITY_TYPE_MAP: dict[str, str] = {
    "FLAL": "LLC",         # Florida Limited Liability
    "FORL": "LLC",         # Foreign Limited Liability
    "DOMP": "CORP",        # Domestic Profit Corp
    "DOMNP": "NP",         # Domestic Non-Profit
    "FORP": "CORP",        # Foreign Profit Corp
    "FORNP": "NP",         # Foreign Non-Profit
    "DOMLP": "LP",         # Domestic Limited Partnership
    "FORLP": "LP",         # Foreign Limited Partnership
    "DOMLLLP": "LLLP",
    "FORLLLP": "LLLP",
}


def _parse_mmddyyyy(raw: str) -> date | None:
    """Parse Sunbiz MMDDYYYY → date. None on garbage."""
    raw = raw.strip()
    if len(raw) != 8 or not raw.isdigit():
        return None
    try:
        return datetime.strptime(raw, "%m%d%Y").date()
    except ValueError:
        return None


def _parse_officer(line: str) -> dict[str, Any] | None:
    """Pull the first officer from the record. None if the slot is empty."""
    if len(line) < _OFFICER_COLS["zip"][1]:
        return None
    parts = {key: line[start:end].strip() for key, (start, end) in _OFFICER_COLS.items()}
    if not parts["last_name"] and not parts["first_name"]:
        return None
    full_name = " ".join(p for p in (parts["first_name"], parts["middle"], parts["last_name"]) if p)
    return {
        "name": full_name,
        "first_name": parts["first_name"] or None,
        "last_name": parts["last_name"] or None,
        "middle": parts["middle"] or None,
        "address": parts["address1"] or None,
        "city": parts["city"] or None,
        "state": parts["state"] or None,
        "zip": parts["zip"] or None,
    }


def _parse_line(line: str, *, filing_date: date) -> dict[str, Any] | None:
    """Parse one fixed-width record.

    `filing_date` is the date encoded in the daily file's name — this is the
    authoritative date the paperwork was filed. The record itself only carries
    an `effective_date` which can differ (delayed effective dates).
    Returns None if the record is unusable.
    """
    if len(line) < 480:
        return None
    record: dict[str, Any] = {}
    for key, (start, end) in FL_SUNBIZ_COLS.items():
        record[key] = line[start:end].strip()
    record["filing_date_parsed"] = filing_date
    record["effective_date_parsed"] = _parse_mmddyyyy(record["effective_date"])
    filing_type = record["filing_type"]
    record["entity_type"] = _ENTITY_TYPE_MAP.get(filing_type) or filing_type or None
    officer = _parse_officer(line)
    record["officers_parsed"] = [officer] if officer else None
    return record


def _build_filing(record: dict[str, Any]) -> Filing:
    addr = {
        "line1": record["principal_addr1"] or None,
        "city": record["principal_city"] or None,
        "state": record["principal_state"] or None,
        "zip": record["principal_zip"] or None,
        "country": "US",
    }
    effective = record["effective_date_parsed"]
    return Filing(
        source=Source.FL_SUNBIZ,
        source_entity_id=record["doc_number"],
        business_name=record["business_name"],
        filing_date=record["filing_date_parsed"],
        state="FL",
        raw_payload={
            "filing_type": record["filing_type"],
            "status_flag": record["status_flag"],
            "effective_date": effective.isoformat() if effective else None,
        },
        entity_type=record["entity_type"],
        principal_address=addr,
        registered_agent=None,  # registered-agent fields exist later in record (TODO)
        officers=record["officers_parsed"],
        naics_code=None,          # Sunbiz doesn't carry NAICS
        naics_inferred=False,
    )


def _filing_date_from_filename(name: str) -> date | None:
    """Extract the filing date encoded in a Sunbiz daily filename.

    Files are named `YYYYMMDDc.txt` (lowercase). Anything else returns None.
    """
    if len(name) < 9 or not name[:8].isdigit() or name[8:9] != "c":
        return None
    try:
        return datetime.strptime(name[:8], "%Y%m%d").date()
    except ValueError:
        return None


class FLSunbizIngester(BaseIngester):
    """Pulls FL Sunbiz daily files within a date window + yields Filings."""

    source = Source.FL_SUNBIZ

    def __init__(
        self,
        cfg: FLSunbizConfig,
        *,
        cache_dir: Path | None = None,
        max_retries: int = 4,
    ) -> None:
        self.cfg = cfg
        self.cache_dir = cache_dir or Path.home() / ".cache" / "closehound" / "fl_sunbiz"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.max_retries = max_retries

    # -------- public API --------

    def fetch_new_filings(self, since_date: date) -> Iterable[Filing]:
        """Download each daily file in [since_date, today]; yield filings."""
        today = date.today()
        wanted_dates = list(_dates_inclusive(since_date, today))
        logger.info(
            "fl_sunbiz.window",
            extra={
                "since_date": since_date.isoformat(),
                "today": today.isoformat(),
                "days": len(wanted_dates),
            },
        )

        local_paths = self._download_window(wanted_dates)
        total = 0
        for local_path in local_paths:
            file_filing_date = _filing_date_from_filename(local_path.name)
            if file_filing_date is None:
                logger.warning(
                    "fl_sunbiz.skip_unrecognized_filename",
                    extra={"path": local_path.name},
                )
                continue
            count = 0
            with local_path.open("r", encoding="latin-1", errors="replace") as fh:
                for raw_line in fh:
                    line = raw_line.rstrip("\r\n")
                    if not line.strip():
                        continue
                    record = _parse_line(line, filing_date=file_filing_date)
                    if record is None:
                        continue
                    # Active-only — Sunbiz daily files do include reinstatements
                    # / amendments that we don't want.
                    if record["status_flag"] and record["status_flag"] != "A":
                        continue
                    if record["filing_date_parsed"] < since_date:
                        continue
                    yield _build_filing(record)
                    count += 1
            total += count
            logger.info(
                "fl_sunbiz.file_done",
                extra={"path": local_path.name, "yielded": count},
            )
        logger.info("fl_sunbiz.window_done", extra={"yielded_total": total})

    # -------- internals --------

    def _download_window(self, dates: list[date]) -> list[Path]:
        """Download all daily files in `dates` that exist on the server.

        Caches locally so reruns within a day are free. Files missing on the
        server (e.g. weekends/holidays — Sunbiz doesn't publish those) are
        skipped silently.
        """
        for attempt in range(1, self.max_retries + 1):
            try:
                return self._do_download_window(dates)
            except (paramiko.SSHException, OSError) as exc:
                wait = 2 ** attempt
                logger.warning(
                    "fl_sunbiz.sftp_retry",
                    extra={"attempt": attempt, "wait_s": wait, "error": repr(exc)},
                )
                time.sleep(wait)
        msg = f"FL Sunbiz SFTP failed after {self.max_retries} retries"
        raise RuntimeError(msg)

    def _do_download_window(self, dates: list[date]) -> list[Path]:
        transport = paramiko.Transport((self.cfg.host, self.cfg.port))
        try:
            transport.connect(username=self.cfg.user, password=self.cfg.password)
            sftp = paramiko.SFTPClient.from_transport(transport)
            assert sftp is not None
            try:
                # Pre-fetch directory list once to avoid 1 listdir per day
                available = set(sftp.listdir(self.cfg.path))
                paths: list[Path] = []
                for d in dates:
                    fname = f"{d.strftime('%Y%m%d')}c.txt"
                    if fname not in available:
                        # Sunbiz doesn't publish on weekends / holidays — that's
                        # expected, not an error.
                        continue
                    local_path = self.cache_dir / fname
                    if local_path.exists() and local_path.stat().st_size > 0:
                        logger.info(
                            "fl_sunbiz.cache_hit",
                            extra={"path": str(local_path)},
                        )
                    else:
                        logger.info(
                            "fl_sunbiz.downloading",
                            extra={
                                "remote": f"{self.cfg.path}/{fname}",
                                "local": str(local_path),
                            },
                        )
                        sftp.get(f"{self.cfg.path}/{fname}", str(local_path))
                    paths.append(local_path)
                return paths
            finally:
                sftp.close()
        finally:
            transport.close()


def _dates_inclusive(start: date, end: date) -> Iterable[date]:
    cur = start
    while cur <= end:
        yield cur
        cur += timedelta(days=1)


# ── Test helpers (no network) ──────────────────────────────────────────────

def parse_lines_for_testing(
    lines: Iterable[str], since_date: date, *, filing_date: date
) -> list[Filing]:
    out = []
    for raw in lines:
        line = raw.rstrip("\r\n")
        if not line.strip():
            continue
        record = _parse_line(line, filing_date=filing_date)
        if record is None:
            continue
        if record["filing_date_parsed"] < since_date:
            continue
        out.append(_build_filing(record))
    return out


def parse_string_for_testing(
    blob: str, since_date: date, *, filing_date: date
) -> list[Filing]:
    return parse_lines_for_testing(io.StringIO(blob), since_date, filing_date=filing_date)
