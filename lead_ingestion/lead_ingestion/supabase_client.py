"""Thin wrapper around the supabase-py service client.

Centralized so:
- We don't recreate the client per-call (auth + http-pool reuse)
- Tests can swap in a fake without monkey-patching every module
- Bulk upsert into closehound.new_business_leads is a single function call

Only writes go through here; reads usually happen via plain SQL in scripts.
"""

from __future__ import annotations

import json
from datetime import date
from functools import lru_cache
from typing import Any, cast

from supabase import Client, create_client

from .base import EnrichedFiling
from .config import load_config


@lru_cache(maxsize=1)
def get_client() -> Client:
    cfg = load_config()
    return create_client(cfg.supabase.url, cfg.supabase.secret_key)


def _serialize_for_jsonb(value: Any) -> Any:
    """Convert a Python value into something JSON-safe for the jsonb columns.

    supabase-py expects dicts/lists; dates/enums need explicit conversion.
    """
    if value is None:
        return None
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _serialize_for_jsonb(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_serialize_for_jsonb(v) for v in value]
    return value


def upsert_filings(enriched: list[EnrichedFiling]) -> tuple[int, int]:
    """Upsert a batch of EnrichedFilings into closehound.new_business_leads.

    Returns (inserted_count, conflicted_count). Conflicted rows hit the
    UNIQUE(source, source_entity_id) constraint and we do NOTHING — so the
    same date range is safely re-runnable.

    Uses ON CONFLICT semantics via supabase-py's upsert with
    `ignore_duplicates=True`.
    """
    if not enriched:
        return (0, 0)

    rows = []
    for e in enriched:
        f = e.filing
        rows.append(
            {
                "source": f.source.value,
                "source_entity_id": f.source_entity_id,
                "business_name": f.business_name,
                "entity_type": f.entity_type,
                "filing_date": f.filing_date.isoformat(),
                "state": f.state,
                "principal_address": _serialize_for_jsonb(f.principal_address),
                "registered_agent": _serialize_for_jsonb(f.registered_agent),
                "officers": _serialize_for_jsonb(f.officers),
                "naics_code": f.naics_code,
                "naics_inferred": f.naics_inferred,
                "raw_payload": _serialize_for_jsonb(f.raw_payload),
                "domain_found": e.domain_found,
                "has_website": e.has_website,
                "gmb_found": e.gmb_found,
                "priority_score": e.priority_score,
                "priority_tier": e.priority_tier.value if e.priority_tier else None,
                # Status stays at 'new' on insert; we'll bump to 'enriched'
                # once the enrichment fields are populated.
                "status": "enriched" if e.has_website is not None else "new",
            }
        )

    client = get_client()
    # The supabase-py client is generic over the table; we use the closehound
    # schema explicitly so the row hits the right table even if there's a
    # name collision elsewhere.
    res = (
        client.schema("closehound")
        .table("new_business_leads")
        .upsert(rows, on_conflict="source,source_entity_id", ignore_duplicates=True)
        .execute()
    )
    inserted = len(res.data or [])
    conflicted = len(rows) - inserted
    return (inserted, conflicted)


def list_recent_unenriched(limit: int = 200) -> list[dict[str, Any]]:
    """Pull rows that need enrichment (status='new', no has_website value yet).

    Used by the orchestrator when re-running over previously-fetched rows.
    """
    client = get_client()
    res = (
        client.schema("closehound")
        .table("new_business_leads")
        .select("id,business_name,state,principal_address,filing_date")
        .eq("status", "new")
        .is_("has_website", "null")
        .order("filing_date", desc=True)
        .limit(limit)
        .execute()
    )
    # supabase-py types `res.data` as JSON; we know each row is a dict here.
    return cast(list[dict[str, Any]], res.data or [])


def write_enrichment(
    lead_id: str,
    *,
    domain_found: str | None,
    has_website: bool | None,
    gmb_found: bool | None,
    priority_score: int,
    priority_tier: str | None,
) -> None:
    """Update a row's enrichment + scoring fields by id."""
    client = get_client()
    client.schema("closehound").table("new_business_leads").update(
        {
            "domain_found": domain_found,
            "has_website": has_website,
            "gmb_found": gmb_found,
            "priority_score": priority_score,
            "priority_tier": priority_tier,
            "status": "enriched",
            "updated_at": "now()",
        }
    ).eq("id", lead_id).execute()
    # Drop unused import warning suppression
    _ = json
