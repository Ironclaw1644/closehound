"""Check if the OCS SPA is actually rendering in pydoll's Chrome."""
from __future__ import annotations

import asyncio
from pathlib import Path

from pydoll.browser.chromium import Chrome

NOTES_DIR = Path(__file__).resolve().parents[2] / "notes"


async def main() -> None:
    NOTES_DIR.mkdir(parents=True, exist_ok=True)
    async with Chrome() as browser:
        tab = await browser.start()
        await tab.go_to("https://www2.miamidadeclerk.gov/ocs/", timeout=45000)
        await asyncio.sleep(10)

        # 1) page_source (probably the shell)
        ps = await tab.page_source
        print(f"page_source len: {len(ps):,}")

        # 2) execute_script: read fully-rendered DOM
        for label, script in [
            ("body.innerText", "document.body.innerText.slice(0, 1500)"),
            ("root.innerHTML.length", "(document.getElementById('root') || document.body).innerHTML.length"),
            ("nav links count", "document.querySelectorAll('a').length"),
            ("buttons count", "document.querySelectorAll('button').length"),
            ("inputs count", "document.querySelectorAll('input').length"),
            ("error text", "(document.body.innerText || '').match(/error|denied|blocked|captcha/i) ? document.body.innerText.slice(0, 500) : ''"),
            ("user agent", "navigator.userAgent"),
            ("webdriver flag", "navigator.webdriver"),
        ]:
            try:
                res = await tab.execute_script(script)
                # unwrap CDP
                v = res
                if isinstance(res, dict):
                    if "result" in res and isinstance(res["result"], dict):
                        v = res["result"].get("value", res)
                    elif "value" in res:
                        v = res["value"]
                print(f"\n{label}: {repr(v)[:500]}")
            except Exception as exc:
                print(f"\n{label}: ERR {exc!r}")

        # 3) save full rendered DOM via execute_script
        try:
            res = await tab.execute_script("document.documentElement.outerHTML")
            v = res
            if isinstance(res, dict):
                if "result" in res and isinstance(res["result"], dict):
                    v = res["result"].get("value", res)
                elif "value" in res:
                    v = res["value"]
            if isinstance(v, str):
                out = NOTES_DIR / "rendered_dom_via_js.html"
                out.write_text(v, encoding="utf-8")
                print(f"\nrendered DOM via JS: {len(v):,} bytes → {out.name}")
        except Exception as exc:
            print(f"\nrendered DOM via JS: ERR {exc!r}")


if __name__ == "__main__":
    asyncio.run(main())
