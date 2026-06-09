"""Probe Miami-Dade Developer portal for documented API access."""
from __future__ import annotations

import asyncio
from pathlib import Path

from pydoll.browser.chromium import Chrome

NOTES_DIR = Path(__file__).resolve().parents[2] / "notes"

TARGETS = [
    ("probe_developers_home.html", "https://www2.miamidadeclerk.gov/Developers/"),
    ("probe_developers_account.html", "https://www2.miamidadeclerk.gov/Developers/Home/MyAccount"),
    ("probe_ocs_search.html", "https://www2.miamidadeclerk.gov/ocs/search"),
    ("probe_records_search.html", "https://onlineservices.miamidadeclerk.gov/officialrecords/search"),
]


async def main() -> None:
    NOTES_DIR.mkdir(parents=True, exist_ok=True)
    async with Chrome() as browser:
        tab = await browser.start()
        for filename, url in TARGETS:
            print(f"-> {url}")
            try:
                await tab.go_to(url, timeout=45000)
                await asyncio.sleep(5)
                html = await tab.page_source
                (NOTES_DIR / filename).write_text(html, encoding="utf-8")
                print(f"   wrote {filename} ({len(html):,} bytes)")
            except Exception as exc:
                print(f"   FAIL: {exc!r}")


if __name__ == "__main__":
    asyncio.run(main())
