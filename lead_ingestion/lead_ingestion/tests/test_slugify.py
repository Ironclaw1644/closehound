"""Tests for the domain_check slugify helper."""

from __future__ import annotations

import pytest

from lead_ingestion.enrichment.domain_check import candidate_domains, slugify


class TestSlugify:
    @pytest.mark.parametrize(
        "name, expected_slug",
        [
            ("Joe's Plumbing LLC", "joesplumbing"),
            ("Joe's Plumbing, LLC", "joesplumbing"),
            ("ABC, Inc.", "abc"),
            ("Five Star Painting of Austin", "fivestarpaintingofaustin"),
            ("Mr. Done Right Handyman", "mrdonerighthandyman"),
            ("Smith & Sons Roofing", "smithsonsroofing"),
            ("VZ Tech PRO Appliance Repair", "vztechproappliancerepair"),
            # Unicode + spaces
            ("Café Latte LLC", "caflatte"),  # accent stripped; "Café" → "caf"
            # Empty
            ("", ""),
            ("   ", ""),
        ],
    )
    def test_known_inputs(self, name: str, expected_slug: str) -> None:
        assert slugify(name) == expected_slug

    def test_multiple_suffixes_stripped(self) -> None:
        # "Joe's LLC, Inc." has both LLC and Inc.; both should go.
        assert slugify("Joe's LLC, Inc.") == "joes"

    def test_idempotent(self) -> None:
        once = slugify("Joe's Plumbing LLC")
        twice = slugify(once)
        assert once == twice


class TestCandidates:
    def test_four_variants_in_order(self) -> None:
        cands = candidate_domains("Joe's Plumbing LLC")
        assert cands == [
            "joesplumbing.com",
            "joesplumbing.biz",
            "joesplumbing.net",
            "joesplumbing-llc.com",
        ]

    def test_empty_name_returns_empty_list(self) -> None:
        assert candidate_domains("") == []
        assert candidate_domains("   ") == []
