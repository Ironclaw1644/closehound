"""Discovery spike — load Miami-Dade case search portals and dump rendered HTML.

Phase A goal: identify the actual case-search URL pattern for eviction filings
on the Miami-Dade Clerk site. This script loads candidate portals through
pydoll (real CDP-driven Chrome — defeats Cloudflare where curl/playwright fail),
waits for JS to settle, then dumps page_source to disk for offline inspection.

Outputs:
    lead_ingestion/notes/probe_ocs.html        — OCS landing page
    lead_ingestion/notes/probe_records.html    — Official Records standard search
    lead_ingestion/notes/probe_records_lp.html — Official Records, attempting LP filter
"""

from __future__ import annotations

import asyncio
from pathlib import Path

from pydoll.browser.chromium import Chrome

NOTES_DIR = Path(__file__).resolve().parents[2] / "notes"

TARGETS = [
    ("probe_ocs.html", "https://www2.miamidadeclerk.gov/ocs/"),
    ("probe_records.html", "https://onlineservices.miamidadeclerk.gov/officialrecords/standardsearch.aspx"),
]


async def main() -> None:
    NOTES_DIR.mkdir(parents=True, exist_ok=True)
    async with Chrome() as browser:
        tab = await browser.start()
        for filename, url in TARGETS:
            print(f"-> {url}")
            try:
                await tab.go_to(url, timeout=45000)
                await asyncio.sleep(6)  # let JS / CF challenge settle
                html = await tab.page_source
                out = NOTES_DIR / filename
                out.write_text(html, encoding="utf-8")
                print(f"   wrote {out} ({len(html):,} bytes)")
            except Exception as exc:
                print(f"   FAIL: {exc!r}")


if __name__ == "__main__":
    asyncio.run(main())
