"""Deterministic priority scoring. No LLM, no randomness.

The score is a sum of additive points, capped at 110 in theory but realistic
hot leads land 70–100. Tiers:
    hot  >= 70
    warm 40–69
    cold <  40

Rules (from the spec):
- Recency: +30 (<=14d), +20 (15–30d), +10 (31–60d), 0 (older)
- Target NAICS: +25 (whether explicit or inferred)
- has_website is False after enrichment: +30
- gmb_found is False after enrichment: +15
- entity_type 'LLC': +10  (solo operators are the most likely $497 buyer)

`has_website` and `gmb_found` are tri-state — None means "didn't check / failed
to check" and we DON'T award the points in that case. Only an affirmative
"no website" earns the +30.
"""

from __future__ import annotations

from datetime import date

from .base import EnrichedFiling, PriorityTier


def _recency_points(filing_date: date, today: date) -> int:
    days = (today - filing_date).days
    if days < 0:
        # Future-dated filing — treat as if it's today
        return 30
    if days <= 14:
        return 30
    if days <= 30:
        return 20
    if days <= 60:
        return 10
    return 0


def compute_score(enriched: EnrichedFiling, today: date) -> int:
    f = enriched.filing
    score = 0
    score += _recency_points(f.filing_date, today)
    # The orchestrator only persists rows that already matched NAICS targeting,
    # so awarding the +25 here is effectively unconditional for everything we
    # store. But we check anyway in case the function is used standalone.
    if f.naics_code:
        score += 25
    if enriched.has_website is False:
        score += 30
    if enriched.gmb_found is False:
        score += 15
    if f.entity_type and "LLC" in f.entity_type.upper():
        score += 10
    return score


def tier_for(score: int) -> PriorityTier:
    if score >= 70:
        return PriorityTier.HOT
    if score >= 40:
        return PriorityTier.WARM
    return PriorityTier.COLD
