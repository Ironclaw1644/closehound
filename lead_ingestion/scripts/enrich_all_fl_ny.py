"""Enrich every FL/NY new-business lead with phone + email.

Two-phase strategy:
  Phase A — website scrape (parallel, ~15 workers). Hits leads where
            `domain_found` is set. Tries the homepage, /contact, /about.
  Phase B — multi-engine search (sequential, polite). Hits leads with no
            domain. Uses owner name + city + industry hint as the most
            discriminating query for brand-new LLCs.

Updates `closehound.new_business_leads` (always) and `closehound.leads`
(only on a hit, since not every NBL row has a corresponding leads row yet).

Idempotent: skips rows where contact_checked_at IS NOT NULL by default.
Use --force to retry rows that were checked but returned nothing.

Usage:
    uv run python scripts/enrich_all_fl_ny.py
    uv run python scripts/enrich_all_fl_ny.py --phase a       # websites only
    uv run python scripts/enrich_all_fl_ny.py --phase b       # search only
    uv run python scripts/enrich_all_fl_ny.py --limit 50
    uv run python scripts/enrich_all_fl_ny.py --force
    uv run python scripts/enrich_all_fl_ny.py --csv out.csv   # also export CSV
"""

from __future__ import annotations

import argparse
import csv
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, cast

from lead_ingestion.enrichment.contact_check import scrape_website, find_contact
from lead_ingestion.logging_setup import configure as configure_logging
from lead_ingestion.logging_setup import get_logger
from lead_ingestion.supabase_client import get_client

logger = get_logger(__name__)


_SOURCE_LABEL = {
    "FL_SUNBIZ": "fl_sunbiz",
    "NY_DOS": "ny_dos",
    "GA_SOS": "ga_sos",
    "KY_SOS": "ky_sos",
}


# NAICS → short industry hint for search queries. Drawn from the top codes
# we actually have in the FL/NY pool.
_NAICS_HINT = {
    "561730": "lawn care landscaping",
    "238320": "painting",
    "238210": "electrical electrician",
    "811111": "auto repair",
    "238220": "plumbing hvac",
    "561622": "locksmith security",
    "621210": "dental dentist",
    "561720": "cleaning janitorial",
    "238160": "roofing",
    "812199": "salon spa",
    "488410": "towing",
    "811192": "auto detailing",
    "561710": "pest control",
}


def _industry_hint(naics: str | None) -> str | None:
    if not naics:
        return None
    return _NAICS_HINT.get(naics)


def _fetch_targets(
    client: Any,
    *,
    sources: list[str],
    phase: str,
    limit: int,
    force: bool,
) -> list[dict[str, Any]]:
    """Pull rows to enrich.

    Phase semantics:
      a — rows with `domain_found` set (website scrape).
      b — rows without `domain_found` (search-engine path).
      c — rows still missing BOTH phone and email after a/b (retry with
          alternate queries, parallel).

    `force=True` ignores `contact_checked_at` (only relevant for a/b).
    """
    q = (
        client.schema("closehound")
        .table("new_business_leads")
        .select(
            "id,business_name,principal_address,source,domain_found,"
            "contact_phone,contact_email,contact_checked_at,priority_tier,"
            "has_website,naics_code,officers,registered_agent,state"
        )
        .in_("source", sources)
        .limit(limit)
    )
    if phase == "a":
        if not force:
            q = q.is_("contact_checked_at", "null")
        q = q.not_.is_("domain_found", "null")
    elif phase == "b":
        if not force:
            q = q.is_("contact_checked_at", "null")
        q = q.is_("domain_found", "null")
    elif phase == "c":
        # Retry leads that have no contact at all yet.
        q = q.is_("contact_phone", "null").is_("contact_email", "null")
    res = q.execute()
    rows = cast(list[dict[str, Any]], res.data or [])
    # Pull officer info from the JSONB list if present
    for r in rows:
        officers = r.get("officers") or []
        if officers and isinstance(officers, list) and officers:
            first = officers[0] or {}
            r["_owner_first"] = (first.get("first_name") or "").strip() or None
            r["_owner_last"] = (first.get("last_name") or "").strip() or None
        else:
            r["_owner_first"] = None
            r["_owner_last"] = None
    return rows


def _update_nbl(client: Any, row_id: str, phone: str | None, email: str | None) -> None:
    client.schema("closehound").table("new_business_leads").update(
        {
            "contact_phone": phone,
            "contact_email": email,
            "contact_checked_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", row_id).execute()


def _update_lead(
    client: Any,
    business_name: str,
    city: str | None,
    source: str,
    phone: str | None,
    email: str | None,
) -> None:
    if not phone and not email:
        return
    lead_source = _SOURCE_LABEL.get(source, (source or "").lower() or None)
    if not lead_source:
        return
    update: dict[str, Any] = {}
    if phone:
        update["phone"] = phone
    if email:
        update["contact_email"] = email
    if not update:
        return
    q = (
        client.schema("closehound")
        .table("leads")
        .update(update)
        .eq("company_name", business_name)
        .eq("lead_source", lead_source)
    )
    if city:
        q = q.eq("city", city)
    try:
        q.execute()
    except Exception as exc:
        logger.debug("update_lead.skip", extra={"biz": business_name, "err": repr(exc)})


def _scrape_one(domain: str, city: str | None, state: str | None) -> tuple[str | None, str | None, bool]:
    return scrape_website(domain, verify_city=city, verify_state=state)


def _run_phase_a(client: Any, rows: list[dict[str, Any]], workers: int) -> dict[str, int]:
    """Parallel website scrape for rows with domain_found.

    Returns counts. Also stores per-row `verified` flag so we can mark
    low-confidence matches in the final CSV.
    """
    if not rows:
        return {"processed": 0, "phone_hits": 0, "email_hits": 0, "verified": 0}
    logger.info("enrich.phase_a.start", extra={"n": len(rows), "workers": workers})

    results: dict[str, tuple[str | None, str | None, bool]] = {}
    found_phone = 0
    found_email = 0
    verified_count = 0
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {}
        for row in rows:
            if not row.get("domain_found"):
                continue
            addr = row.get("principal_address") or {}
            city = (addr.get("city") or "").strip() or None
            state = (addr.get("state") or row.get("state") or "").strip() or None
            futures[pool.submit(_scrape_one, row["domain_found"], city, state)] = row
        for fut in as_completed(futures):
            row = futures[fut]
            try:
                phone, email, verified = fut.result()
            except Exception as exc:
                logger.warning(
                    "enrich.phase_a.error",
                    extra={"biz": row.get("business_name"), "err": repr(exc)},
                )
                phone, email, verified = (None, None, False)
            results[row["id"]] = (phone, email, verified)
            if phone:
                found_phone += 1
            if email:
                found_email += 1
            if verified:
                verified_count += 1
            logger.info(
                "enrich.phase_a.row",
                extra={
                    "biz": row.get("business_name"),
                    "domain": row.get("domain_found"),
                    "phone": phone,
                    "email": email,
                    "verified": verified,
                },
            )

    # Sequential DB writes.
    for row in rows:
        rid = row["id"]
        phone, email, _verified = results.get(rid, (None, None, False))
        addr = row.get("principal_address") or {}
        city = (addr.get("city") or "").strip() or None
        _update_nbl(client, rid, phone, email)
        if phone or email:
            _update_lead(client, row.get("business_name") or "", city, row.get("source") or "", phone, email)

    return {
        "processed": len(rows),
        "phone_hits": found_phone,
        "email_hits": found_email,
        "verified": verified_count,
    }


def _run_phase_b(client: Any, rows: list[dict[str, Any]]) -> dict[str, int]:
    """Sequential search-engine enrichment for rows with no domain."""
    if not rows:
        return {"processed": 0, "phone_hits": 0, "email_hits": 0, "verified": 0}
    logger.info("enrich.phase_b.start", extra={"n": len(rows)})

    found_phone = 0
    found_email = 0
    verified_count = 0
    processed = 0
    for row in rows:
        processed += 1
        biz = (row.get("business_name") or "").strip()
        addr = row.get("principal_address") or {}
        city = (addr.get("city") or "").strip() or None
        state = (addr.get("state") or row.get("state") or "").strip() or None
        ra = row.get("registered_agent") or {}
        ra_name = (ra.get("name") if isinstance(ra, dict) else None) or None
        industry = _industry_hint(row.get("naics_code"))
        try:
            phone, email, verified = find_contact(
                biz,
                city,
                None,
                owner_first=row.get("_owner_first"),
                owner_last=row.get("_owner_last"),
                industry_hint=industry,
                state=state,
                registered_agent_name=ra_name,
            )
        except Exception as exc:
            logger.warning("enrich.phase_b.error", extra={"biz": biz, "err": repr(exc)})
            phone, email, verified = (None, None, False)
        if phone:
            found_phone += 1
        if email:
            found_email += 1
        if verified:
            verified_count += 1
        _update_nbl(client, row["id"], phone, email)
        if phone or email:
            _update_lead(client, biz, city, row.get("source") or "", phone, email)
        if processed % 10 == 0:
            logger.info(
                "enrich.phase_b.progress",
                extra={
                    "processed": processed,
                    "total": len(rows),
                    "phone_hits": found_phone,
                    "email_hits": found_email,
                    "verified": verified_count,
                },
            )

    return {
        "processed": processed,
        "phone_hits": found_phone,
        "email_hits": found_email,
        "verified": verified_count,
    }


def _search_one_alt(row: dict[str, Any]) -> tuple[str, str | None, str | None, bool]:
    """Run an alternate-query search for one lead. Used by phase C in parallel.

    Returns (row_id, phone, email, verified).
    """
    from lead_ingestion.enrichment.contact_check import (
        _polite_sleep,
        search_for_contact,
    )

    biz = (row.get("business_name") or "").strip()
    addr = row.get("principal_address") or {}
    city = (addr.get("city") or "").strip() or None
    state = (addr.get("state") or row.get("state") or "").strip() or None
    zip_ = (addr.get("zip") or "").strip() or None
    industry = _industry_hint(row.get("naics_code"))
    owner_first = row.get("_owner_first") or ""
    owner_last = row.get("_owner_last") or ""

    # Alternate queries — different from the ones phase B already tried.
    queries: list[str] = []
    # Zip code is more discriminating than city for common owner names.
    if biz and zip_:
        queries.append(f'"{biz}" {zip_}')
    if owner_first and owner_last and zip_:
        queries.append(f'"{owner_first} {owner_last}" {zip_} {industry or ""}'.strip())
    # Phone-context query — surfaces directory pages.
    if biz and city:
        queries.append(f'{biz} {city} {state or ""} contact phone'.strip())

    phone, email, verified = (None, None, False)
    for q in queries:
        if phone and email:
            break
        _polite_sleep(0.5, 0.5)  # gentler polite_sleep since we're parallel
        try:
            p, e, v = search_for_contact(q, verify_city=city, verify_state=state)
        except Exception:
            p, e, v = (None, None, False)
        phone = phone or p
        email = email or e
        verified = verified or v
    return (row["id"], phone, email, verified)


def _run_phase_c(client: Any, rows: list[dict[str, Any]], workers: int) -> dict[str, int]:
    """Parallel alternate-query retry for leads with no contact yet.

    Writes per-row to the DB as results come in (rather than batched at the
    end) so an interrupted run preserves all completed work.
    """
    if not rows:
        return {"processed": 0, "phone_hits": 0, "email_hits": 0, "verified": 0}
    logger.info("enrich.phase_c.start", extra={"n": len(rows), "workers": workers})
    found_phone = 0
    found_email = 0
    verified_count = 0
    processed = 0
    by_id = {r["id"]: r for r in rows}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(_search_one_alt, r) for r in rows]
        for fut in as_completed(futures):
            try:
                rid, phone, email, verified = fut.result()
            except Exception as exc:
                logger.warning("enrich.phase_c.error", extra={"err": repr(exc)})
                continue
            processed += 1
            if phone:
                found_phone += 1
            if email:
                found_email += 1
            if verified:
                verified_count += 1
            # Per-row DB write: only update if we found something, to avoid
            # overwriting any existing data with null. Skip blanks since these
            # rows were already known-null when we started phase C.
            if phone or email:
                row = by_id.get(rid) or {}
                addr = row.get("principal_address") or {}
                city = (addr.get("city") or "").strip() or None
                try:
                    _update_nbl(client, rid, phone, email)
                    _update_lead(
                        client,
                        row.get("business_name") or "",
                        city,
                        row.get("source") or "",
                        phone,
                        email,
                    )
                except Exception as exc:
                    logger.warning("enrich.phase_c.write_error", extra={"rid": rid, "err": repr(exc)})
            if processed % 25 == 0:
                logger.info(
                    "enrich.phase_c.progress",
                    extra={
                        "processed": processed,
                        "total": len(rows),
                        "phone_hits": found_phone,
                        "email_hits": found_email,
                        "verified": verified_count,
                    },
                )
    return {
        "processed": processed,
        "phone_hits": found_phone,
        "email_hits": found_email,
        "verified": verified_count,
    }


def _export_csv(
    client: Any,
    sources: list[str],
    out_path: Path,
    *,
    only_with_contact: bool = False,
    only_verified: bool = False,
) -> int:
    """Write the final enriched view to CSV.

    Adds a `phone_confidence` column derived from area-code-to-state match —
    'verified' if the phone's area code matches the lead's state, otherwise
    'unverified'. Sorts: phone+email first, then verified, then state/source.
    """
    from lead_ingestion.enrichment.contact_check import _phone_matches_state

    res = (
        client.schema("closehound")
        .table("new_business_leads")
        .select(
            "source,state,business_name,filing_date,naics_code,priority_tier,"
            "domain_found,contact_phone,contact_email,principal_address,"
            "officers,registered_agent"
        )
        .in_("source", sources)
        .order("filing_date", desc=True)
        .limit(10000)
        .execute()
    )
    rows = cast(list[dict[str, Any]], res.data or [])

    def _confidence(row: dict[str, Any]) -> str:
        phone = row.get("contact_phone")
        if not phone:
            return ""
        state = row.get("state")
        return "verified" if _phone_matches_state(phone, state) else "unverified"

    enriched: list[dict[str, Any]] = []
    for r in rows:
        addr = r.get("principal_address") or {}
        officers = r.get("officers") or []
        first = (officers[0] if officers and isinstance(officers, list) else None) or {}
        ra = r.get("registered_agent") or {}
        conf = _confidence(r)
        if only_with_contact and not (r.get("contact_phone") or r.get("contact_email")):
            continue
        if only_verified and conf != "verified":
            continue
        enriched.append(
            {
                "source": r.get("source") or "",
                "state": r.get("state") or "",
                "business_name": r.get("business_name") or "",
                "filing_date": r.get("filing_date") or "",
                "naics_code": r.get("naics_code") or "",
                "industry": _NAICS_HINT.get(r.get("naics_code") or "", ""),
                "priority_tier": r.get("priority_tier") or "",
                "owner_first": first.get("first_name") or "",
                "owner_last": first.get("last_name") or "",
                "registered_agent": (ra.get("name") if isinstance(ra, dict) else "") or "",
                "city": addr.get("city") or "",
                "address": addr.get("line1") or "",
                "zip": addr.get("zip") or "",
                "domain": r.get("domain_found") or "",
                "phone": r.get("contact_phone") or "",
                "phone_confidence": conf,
                "email": r.get("contact_email") or "",
            }
        )

    enriched.sort(
        key=lambda r: (
            0 if (r["phone"] and r["email"]) else (1 if (r["phone"] or r["email"]) else 2),
            0 if r["phone_confidence"] == "verified" else 1,
            r["state"],
            r["business_name"],
        )
    )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(enriched[0].keys()) if enriched else [
        "source", "state", "business_name", "filing_date", "naics_code",
        "industry", "priority_tier", "owner_first", "owner_last",
        "registered_agent", "city", "address", "zip", "domain", "phone",
        "phone_confidence", "email",
    ]
    with out_path.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(enriched)
    return len(enriched)


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    p = argparse.ArgumentParser(prog="enrich_all_fl_ny")
    p.add_argument("--phase", choices=["a", "b", "c", "both", "abc"], default="both")
    p.add_argument("--sources", default="FL_SUNBIZ,NY_DOS")
    p.add_argument("--limit", type=int, default=2000)
    p.add_argument("--workers", type=int, default=15)
    p.add_argument("--force", action="store_true", help="Retry already-checked rows")
    p.add_argument("--csv", default=None, help="Write final CSV to this path")
    args = p.parse_args(argv)

    sources = [s.strip().upper() for s in args.sources.split(",") if s.strip()]
    client = get_client()

    a_summary: dict[str, int] = {}
    b_summary: dict[str, int] = {}
    c_summary: dict[str, int] = {}

    if args.phase in ("a", "both", "abc"):
        rows_a = _fetch_targets(client, sources=sources, phase="a", limit=args.limit, force=args.force)
        a_summary = _run_phase_a(client, rows_a, args.workers)
        logger.info("enrich.phase_a.done", extra=a_summary)

    if args.phase in ("b", "both", "abc"):
        rows_b = _fetch_targets(client, sources=sources, phase="b", limit=args.limit, force=args.force)
        b_summary = _run_phase_b(client, rows_b)
        logger.info("enrich.phase_b.done", extra=b_summary)

    if args.phase in ("c", "abc"):
        rows_c = _fetch_targets(client, sources=sources, phase="c", limit=args.limit, force=args.force)
        c_summary = _run_phase_c(client, rows_c, args.workers)
        logger.info("enrich.phase_c.done", extra=c_summary)

    if args.csv:
        n = _export_csv(client, sources, Path(args.csv))
        logger.info("enrich.csv.done", extra={"path": args.csv, "rows": n})

    print("---")
    print(f"Phase A (websites): {a_summary}")
    print(f"Phase B (search):   {b_summary}")
    print(f"Phase C (alt-retry):{c_summary}")
    if args.csv:
        print(f"CSV: {args.csv}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
