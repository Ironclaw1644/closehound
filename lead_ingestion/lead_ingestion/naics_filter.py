"""NAICS targeting + inference from business names.

The spec lists 13 target NAICS codes covering CloseHound's existing 14
LeadIndustry values. Some industries share a NAICS (HVAC + plumbing both
fall under 238220 contracting). We keep both an explicit-code and a
name-keyword path because state filings rarely include NAICS — most need
inference from the business_name string.

LeadIndustry values match the TS enum in `src/lib/industries.ts` so a future
promotion job can write directly into closehound.leads.industry.
"""

from __future__ import annotations

import re
from typing import Literal

LeadIndustry = Literal[
    "handyman",
    "pressure washing",
    "roofing",
    "HVAC",
    "plumbing",
    "dental",
    "med spa",
    "junk removal",
    "mobile detailing",
    "landscaping",
    "painting",
    "electrical",
    "auto repair",
    "pest control",
]


# Explicit NAICS -> our internal LeadIndustry.
# Several NAICS codes map to multiple of our industries (HVAC + plumbing share
# 238220). When we have only the NAICS code we can't disambiguate — pick the
# more common one ("HVAC" gets 238220 because the user's HVAC pool is the
# bigger one; plumbing is also valid but we mark it via name-inference).
TARGET_NAICS: dict[str, LeadIndustry] = {
    "238220": "HVAC",          # Plumbing, Heating, AC contractors
    "238210": "electrical",    # Electrical contractors
    "238320": "painting",      # Painting + wall covering
    "238160": "roofing",       # Roofing contractors
    "561730": "landscaping",   # Landscaping services (also "lawn care")
    "561720": "handyman",      # Janitorial — closest match for cleaning crews
    "561740": "handyman",      # Carpet/upholstery cleaning — overlaps cleaning
    "811111": "auto repair",   # General automotive repair
    "811192": "mobile detailing",  # Car washes (includes mobile detailing)
    "561710": "pest control",  # Exterminating + pest control
    "561622": "handyman",      # Security systems install (lump with handyman)
    "488410": "junk removal",  # Local truck-based moving — closest to junk removal
}


# Keyword -> LeadIndustry, applied to lowercased business_name. Order matters
# only insofar as we return the *first* match — keep more-specific terms first.
# Each tuple: (regex_pattern, industry, inferred_naics_code).
_KEYWORD_RULES: list[tuple[re.Pattern[str], LeadIndustry, str]] = [
    # Pressure washing — match before "wash" / "clean"
    (re.compile(r"\b(pressure\s*wash|power\s*wash|soft\s*wash|exterior\s*clean)", re.I),
     "pressure washing", "561720"),
    # Mobile detailing — match before "auto"
    (re.compile(r"\b(mobile\s*detail|car\s*detail|auto\s*detail|ceramic\s*coat)", re.I),
     "mobile detailing", "811192"),
    # Roofing
    (re.compile(r"\broof(ing|er|s)?\b", re.I), "roofing", "238160"),
    # HVAC — match before "heating" alone
    (re.compile(r"\b(hvac|heat(ing)?\s*&?\s*(air|cool)|air\s*condition)", re.I),
     "HVAC", "238220"),
    # Plumbing
    (re.compile(r"\b(plumb(ing|er|ers)?|drain|sewer)\b", re.I), "plumbing", "238220"),
    # Electrical
    (re.compile(r"\b(electric(al|ian|ians)?)\b", re.I), "electrical", "238210"),
    # Painting — match before generic "paint"
    (re.compile(r"\b(paint(ing|ers?)?)\b", re.I), "painting", "238320"),
    # Landscaping / lawn care
    (re.compile(r"\b(landscap(ing|e|er)|lawn|yard\s*care|garden|tree\s*service)", re.I),
     "landscaping", "561730"),
    # Dental
    (re.compile(r"\b(dent(al|ist|istry)|orthodont|smile)", re.I), "dental", "621210"),
    # Med spa
    (re.compile(r"\b(med\s*spa|medical\s*spa|aesthetic|botox|injectable)", re.I),
     "med spa", "812199"),
    # Junk removal — match before generic "haul"
    (re.compile(r"\b(junk\s*(removal|haul)|haul\s*away|dumpster|cleanout)", re.I),
     "junk removal", "488410"),
    # Pest control
    (re.compile(r"\b(pest|exterminat|termite|mosquito|rodent)", re.I),
     "pest control", "561710"),
    # Auto repair
    (re.compile(r"\b(auto(motive)?\s*(repair|service)|mechanic|transmission|brake)", re.I),
     "auto repair", "811111"),
    # Handyman — most generic; keep last
    (re.compile(r"\b(handy\s*m(an|en)|home\s*repair|odd\s*job|small\s*repair)", re.I),
     "handyman", "561622"),
]


def infer_from_name(business_name: str) -> tuple[str | None, LeadIndustry | None]:
    """Return (naics_code, industry) inferred from the business name.

    Both are None if no keyword matched.
    """
    if not business_name:
        return (None, None)
    for pattern, industry, naics in _KEYWORD_RULES:
        if pattern.search(business_name):
            return (naics, industry)
    return (None, None)


def industry_for(naics_code: str | None) -> LeadIndustry | None:
    """Lookup the LeadIndustry for an explicit NAICS code, if it's a target."""
    if not naics_code:
        return None
    return TARGET_NAICS.get(naics_code.strip())


def matches_target(naics_code: str | None, business_name: str) -> tuple[bool, str | None, LeadIndustry | None, bool]:
    """Decide whether a filing matches our target NAICS list.

    Returns (matched, naics_code, industry, inferred).

    - If `naics_code` is in TARGET_NAICS: matched=True, inferred=False.
    - Else if the business_name hints at a target industry: matched=True,
      naics_code=inferred-code, inferred=True.
    - Else matched=False, all other fields None.
    """
    code = (naics_code or "").strip() or None
    industry = industry_for(code)
    if industry:
        return (True, code, industry, False)
    inferred_code, inferred_industry = infer_from_name(business_name)
    if inferred_industry:
        return (True, inferred_code, inferred_industry, True)
    return (False, None, None, False)
