"""Tests for the priority-scoring function. Pure logic; no mocks needed."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from lead_ingestion.base import EnrichedFiling, Filing, PriorityTier, Source
from lead_ingestion.scoring import compute_score, tier_for


def _filing(
    *,
    days_old: int = 0,
    naics: str | None = "238220",
    entity_type: str | None = "LLC",
    today: date | None = None,
) -> Filing:
    today = today or date(2026, 5, 15)
    return Filing(
        source=Source.FL_SUNBIZ,
        source_entity_id=f"FL{days_old}",
        business_name="Test Co LLC",
        filing_date=today - timedelta(days=days_old),
        state="FL",
        raw_payload={},
        entity_type=entity_type,
        naics_code=naics,
        naics_inferred=False,
    )


def _enriched(
    filing: Filing,
    *,
    has_website: bool | None = None,
    gmb_found: bool | None = None,
) -> EnrichedFiling:
    return EnrichedFiling(filing=filing, has_website=has_website, gmb_found=gmb_found)


class TestRecency:
    @pytest.mark.parametrize(
        "days_old, expected_recency_points",
        [(0, 30), (14, 30), (15, 20), (30, 20), (31, 10), (60, 10), (61, 0)],
    )
    def test_recency_buckets(self, days_old: int, expected_recency_points: int) -> None:
        today = date(2026, 5, 15)
        # Strip everything except recency: no naics, no entity_type
        f = _filing(days_old=days_old, naics=None, entity_type=None, today=today)
        score = compute_score(_enriched(f), today)
        assert score == expected_recency_points


class TestStaticAddenda:
    def test_naics_adds_25(self) -> None:
        today = date(2026, 5, 15)
        f_with = _filing(days_old=100, naics="238220", entity_type=None, today=today)
        f_without = _filing(days_old=100, naics=None, entity_type=None, today=today)
        assert compute_score(_enriched(f_with), today) == 25
        assert compute_score(_enriched(f_without), today) == 0

    def test_llc_adds_10(self) -> None:
        today = date(2026, 5, 15)
        f_llc = _filing(days_old=100, naics=None, entity_type="LLC", today=today)
        f_corp = _filing(days_old=100, naics=None, entity_type="CORP", today=today)
        assert compute_score(_enriched(f_llc), today) == 10
        assert compute_score(_enriched(f_corp), today) == 0

    def test_no_website_adds_30(self) -> None:
        today = date(2026, 5, 15)
        f = _filing(days_old=100, naics=None, entity_type=None, today=today)
        # has_website=True → 0; False → +30; None → 0 (tri-state)
        assert compute_score(_enriched(f, has_website=True), today) == 0
        assert compute_score(_enriched(f, has_website=False), today) == 30
        assert compute_score(_enriched(f, has_website=None), today) == 0

    def test_no_gmb_adds_15(self) -> None:
        today = date(2026, 5, 15)
        f = _filing(days_old=100, naics=None, entity_type=None, today=today)
        assert compute_score(_enriched(f, gmb_found=True), today) == 0
        assert compute_score(_enriched(f, gmb_found=False), today) == 15
        assert compute_score(_enriched(f, gmb_found=None), today) == 0


class TestComposite:
    def test_max_score_path(self) -> None:
        """All-checks-pass: 30 (fresh) + 25 (naics) + 30 (no site) + 15 (no gmb) + 10 (llc) = 110"""
        today = date(2026, 5, 15)
        f = _filing(days_old=3, naics="238220", entity_type="LLC", today=today)
        score = compute_score(_enriched(f, has_website=False, gmb_found=False), today)
        assert score == 110

    def test_zero_score_path(self) -> None:
        today = date(2026, 5, 15)
        f = _filing(days_old=200, naics=None, entity_type="CORP", today=today)
        score = compute_score(_enriched(f, has_website=True, gmb_found=True), today)
        assert score == 0


class TestTiers:
    @pytest.mark.parametrize(
        "score, expected_tier",
        [
            (0, PriorityTier.COLD),
            (39, PriorityTier.COLD),
            (40, PriorityTier.WARM),
            (69, PriorityTier.WARM),
            (70, PriorityTier.HOT),
            (110, PriorityTier.HOT),
        ],
    )
    def test_tier_boundaries(self, score: int, expected_tier: PriorityTier) -> None:
        assert tier_for(score) == expected_tier
