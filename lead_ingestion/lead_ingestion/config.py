"""Env-loaded config. Single source of truth for credentials + tuning knobs.

The TS code (src/lib/supabase.ts) reads SUPABASE_SECRET_KEY first, then falls
back to SUPABASE_SERVICE_ROLE_KEY. We mirror that precedence so the same
.env.local works for both.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


def _load_env() -> None:
    """Load .env files in priority order — earlier files win.

    We MERGE rather than stopping at the first match. The repo root's
    .env.local typically holds shared secrets (Supabase keys, etc.), while
    lead_ingestion/.env.local can hold Python-side-only overrides (FL Sunbiz
    SFTP creds that the TS side doesn't need).

    Order (highest priority first):
    1. Current working directory's .env.local
    2. lead_ingestion/.env.local — Python-only overrides
    3. Repo root's .env.local — shared TS+Python secrets
    4. lead_ingestion/.env — fallback example values for dev only

    `override=False` means the FIRST file that defines a key wins; subsequent
    files only fill in keys that weren't already set.
    """
    candidates = [
        Path.cwd() / ".env.local",
        Path(__file__).resolve().parents[2] / ".env.local",  # lead_ingestion/
        Path(__file__).resolve().parents[3] / ".env.local",  # repo root
        Path(__file__).resolve().parents[2] / ".env",
    ]
    seen: set[Path] = set()
    for candidate in candidates:
        try:
            resolved = candidate.resolve()
        except OSError:
            continue
        if resolved in seen:
            continue
        seen.add(resolved)
        if candidate.exists():
            load_dotenv(candidate, override=False)


_load_env()


def _required(name: str, *fallbacks: str) -> str:
    """Read an env var with fallbacks. Raise if none set."""
    for key in (name, *fallbacks):
        value = os.environ.get(key, "").strip()
        if value:
            return value
    pretty = " / ".join((name, *fallbacks))
    raise RuntimeError(f"Required env var not set: {pretty}")


def _optional(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _flag(name: str, default: bool = True) -> bool:
    """Read a 0/1/true/false env flag."""
    value = os.environ.get(name, "").strip().lower()
    if not value:
        return default
    return value in {"1", "true", "yes", "on"}


@dataclass(frozen=True, slots=True)
class SupabaseConfig:
    url: str
    secret_key: str


@dataclass(frozen=True, slots=True)
class FLSunbizConfig:
    host: str
    port: int
    user: str
    password: str
    path: str


@dataclass(frozen=True, slots=True)
class GASOSConfig:
    user_agent: str


@dataclass(frozen=True, slots=True)
class KYSOSConfig:
    index_url: str


@dataclass(frozen=True, slots=True)
class NYDOSConfig:
    dataset_url: str


@dataclass(frozen=True, slots=True)
class SourceToggles:
    fl_sunbiz: bool
    ga_sos: bool
    ky_sos: bool
    ny_dos: bool


@dataclass(frozen=True, slots=True)
class Config:
    supabase: SupabaseConfig
    fl_sunbiz: FLSunbizConfig
    ga_sos: GASOSConfig
    ky_sos: KYSOSConfig
    ny_dos: NYDOSConfig
    toggles: SourceToggles


def load_config() -> Config:
    """Build a Config from current env. Call once at program start."""
    return Config(
        supabase=SupabaseConfig(
            url=_required("NEXT_PUBLIC_SUPABASE_URL"),
            # Prefer modern name, fall back to legacy (matches the TS pattern).
            secret_key=_required("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"),
        ),
        fl_sunbiz=FLSunbizConfig(
            # Note: sftp.dos.state.fl.us is the historical name and no longer
            # has DNS. Current public SFTP is sftp.floridados.gov. Credentials
            # are publicly documented by Florida DOS — see .env.example for
            # current values. We don't default them in code.
            host=_optional("FL_SUNBIZ_SFTP_HOST", "sftp.floridados.gov"),
            port=int(_optional("FL_SUNBIZ_SFTP_PORT", "22")),
            user=_optional("FL_SUNBIZ_SFTP_USER"),
            password=_optional("FL_SUNBIZ_SFTP_PASSWORD"),
            path=_optional("FL_SUNBIZ_SFTP_PATH", "/Public/doc/cor"),
        ),
        ga_sos=GASOSConfig(
            user_agent=_optional(
                "GA_SOS_USER_AGENT",
                "CloseHoundBot/0.1 (lead-ingestion; contact: hello@walkperro.com)",
            ),
        ),
        ky_sos=KYSOSConfig(
            index_url=_optional(
                "KY_SOS_INDEX_URL",
                "https://web.sos.ky.gov/business/filings/",
            ),
        ),
        ny_dos=NYDOSConfig(
            # Socrata SoQL endpoint for "Active Corporations: Beginning 1800"
            # (dataset id n9v6-gdp6). The .json suffix gets us pagination + a
            # $where filter on initial_dos_filing_date. Verified 2026-05-15.
            dataset_url=_optional(
                "NY_DOS_DATASET_URL",
                "https://data.ny.gov/resource/n9v6-gdp6.json",
            ),
        ),
        toggles=SourceToggles(
            fl_sunbiz=_flag("SOURCE_FL_SUNBIZ_ENABLED", True),
            ga_sos=_flag("SOURCE_GA_SOS_ENABLED", True),
            ky_sos=_flag("SOURCE_KY_SOS_ENABLED", True),
            ny_dos=_flag("SOURCE_NY_DOS_ENABLED", True),
        ),
    )
