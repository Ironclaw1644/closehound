# mocks/

Fixture JSON for `MOCK_MODE`. When `MOCK_MODE=1` (see `src/lib/env.ts`), the
HUD and RentCast clients serve realistic fixtures from this directory instead of
making live (billable) API calls — so the whole app builds, tests, and demos at
zero cost.

Fixtures are populated in Phase 5 (RentCast client + caching). Expected shape:

- `hud/` — SAFMR-by-zip + USPS ZIP↔FMR-area crosswalk responses
- `rentcast/` — market-data-by-zip, sale-listings, and property/valuation responses
