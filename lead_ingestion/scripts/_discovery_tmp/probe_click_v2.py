"""Drive OCS Hearings flow with return_by_value=True so we actually get the data."""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

from pydoll.browser.chromium import Chrome

NOTES_DIR = Path(__file__).resolve().parents[2] / "notes"


def unwrap(res):
    if isinstance(res, dict):
        i = res.get("result")
        if isinstance(i, dict):
            i2 = i.get("result")
            if isinstance(i2, dict) and "value" in i2:
                return i2["value"]
            if "value" in i:
                return i["value"]
        if "value" in res:
            return res["value"]
    return res


async def js(tab, script: str):
    res = await tab.execute_script(script, return_by_value=True)
    return unwrap(res)


async def main() -> None:
    NOTES_DIR.mkdir(parents=True, exist_ok=True)
    async with Chrome() as browser:
        tab = await browser.start()
        await tab.go_to("https://www2.miamidadeclerk.gov/ocs/", timeout=45000)
        await asyncio.sleep(10)

        print(f"URL before: {await tab.current_url}")
        all_a = await js(tab, """
            Array.from(document.querySelectorAll('a')).map(a => ({
                text: (a.innerText||a.textContent||'').trim().slice(0,80),
                href: a.getAttribute('href') || '',
            })).filter(x => x.text || x.href)
        """)
        print(f"\nLinks ({len(all_a) if isinstance(all_a, list) else '?'} total):")
        if isinstance(all_a, list):
            for a in all_a:
                print(f"  text={a.get('text')!r:50}  href={a.get('href')!r}")

        click_result = await js(tab, """
            (() => {
                const links = Array.from(document.querySelectorAll('a'));
                for (const a of links) {
                    const t = (a.innerText||a.textContent||'').trim();
                    if (t === 'Hearings') {
                        a.scrollIntoView({block:'center'});
                        a.click();
                        return { found: true, href: a.href, text: t };
                    }
                }
                return { found: false, count: links.length };
            })()
        """)
        print(f"\nClick result: {click_result}")

        await asyncio.sleep(5)
        print(f"URL after click: {await tab.current_url}")

        after = await js(tab, """({
            inputs: document.querySelectorAll('input').length,
            buttons: document.querySelectorAll('button').length,
            selects: document.querySelectorAll('select').length,
            innerText: document.body.innerText.slice(0, 2000),
            inputDetails: Array.from(document.querySelectorAll('input')).map(i => ({
                name: i.name, type: i.type, placeholder: i.placeholder, id: i.id,
                aria: i.getAttribute('aria-label')
            }))
        })""")
        print(f"\nDOM after click: inputs={after.get('inputs')} buttons={after.get('buttons')} selects={after.get('selects')}")
        print(f"Input details: {json.dumps(after.get('inputDetails'), indent=2)[:1500]}")
        print(f"Body text:\n{after.get('innerText')}")


if __name__ == "__main__":
    asyncio.run(main())
