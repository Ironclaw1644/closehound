"""Tests for naics_filter — the NAICS targeting + name-inference logic."""

from __future__ import annotations

import pytest

from lead_ingestion.naics_filter import (
    TARGET_NAICS,
    industry_for,
    infer_from_name,
    matches_target,
)


class TestExplicitNAICS:
    def test_known_naics_returns_industry(self) -> None:
        assert industry_for("238220") == "HVAC"
        assert industry_for("811111") == "auto repair"
        assert industry_for("561710") == "pest control"

    def test_unknown_naics_returns_none(self) -> None:
        assert industry_for("999999") is None
        assert industry_for("") is None
        assert industry_for(None) is None

    def test_target_list_covers_lead_industries(self) -> None:
        """Every NAICS in TARGET_NAICS should map to a recognized industry."""
        recognized = {
            "handyman", "pressure washing", "roofing", "HVAC", "plumbing",
            "dental", "med spa", "junk removal", "mobile detailing",
            "landscaping", "painting", "electrical", "auto repair", "pest control",
        }
        for code, industry in TARGET_NAICS.items():
            assert industry in recognized, f"NAICS {code} maps to unknown industry {industry}"


class TestNameInference:
    @pytest.mark.parametrize(
        "name, expected_industry",
        [
            ("Joe's Plumbing LLC", "plumbing"),
            ("Austin HVAC Pros", "HVAC"),
            ("Round Rock Electric Co.", "electrical"),
            ("Five Star Painting of Austin", "painting"),
            ("Roof Rangers", "roofing"),
            ("Mighty Lawn Care", "landscaping"),
            ("Lone Star Pest Control", "pest control"),
            ("Hill Country Auto Repair", "auto repair"),
            ("Pristine Mobile Detailing", "mobile detailing"),
            ("Westlake Pressure Washing", "pressure washing"),
            ("Big John's Junk Removal", "junk removal"),
            ("Bright Smile Dentistry", "dental"),
            ("Glow MedSpa", "med spa"),
            ("Mr. Handyman of South Austin", "handyman"),
        ],
    )
    def test_keywords_match_expected_industry(
        self, name: str, expected_industry: str
    ) -> None:
        _, industry = infer_from_name(name)
        assert industry == expected_industry

    def test_pressure_washing_beats_landscaping_when_both_words_present(self) -> None:
        # If a business name has both "pressure wash" and "lawn", we want
        # the more specific match.
        _, industry = infer_from_name("Lawn & Pressure Wash Pros")
        assert industry == "pressure washing"

    def test_no_match_returns_nones(self) -> None:
        assert infer_from_name("Random Consulting LLC") == (None, None)
        assert infer_from_name("") == (None, None)
        assert infer_from_name("ABC Corporation") == (None, None)


class TestMatchesTarget:
    def test_explicit_naics_match_not_inferred(self) -> None:
        matched, code, industry, inferred = matches_target("238210", "Joe's Whatever")
        assert (matched, code, industry, inferred) == (True, "238210", "electrical", False)

    def test_naics_miss_falls_back_to_name(self) -> None:
        matched, code, industry, inferred = matches_target("999999", "Joe's Plumbing")
        assert matched is True
        assert industry == "plumbing"
        assert inferred is True

    def test_no_naics_no_match(self) -> None:
        matched, code, industry, inferred = matches_target(None, "Random Consulting")
        assert (matched, code, industry, inferred) == (False, None, None, False)

    def test_blank_naics_treated_as_missing(self) -> None:
        matched, _, industry, inferred = matches_target("   ", "Acme Roofing")
        assert matched is True
        assert industry == "roofing"
        assert inferred is True
