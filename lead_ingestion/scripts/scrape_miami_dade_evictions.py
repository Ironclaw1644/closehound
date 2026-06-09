"""Scrape recent residential eviction cases from the Miami-Dade Clerk OCS
portal by way of the public "Hearings" search and write to CSV.

Why Hearings instead of Filing Date: the OCS public menu only exposes
Local/State Case, Party Name, and Hearings. The "Search by Filing Date"
form exists in the SPA bundle but is gated (login required and/or paid
Web API access). Eviction hearings in Florida are typically scheduled
within 7-14 days of filing, so a recent hearing-date window catches
substantially all freshly filed evictions.

Strategy: drive the SPA via pydoll, click into Hearings, fill the date
range, submit, then read the rendered results table from the DOM (avoids
the client-side payload encryption used on the API).

Outputs:
    lead_exports/miami-dade-evictions-YYYY-MM-DD.csv

Run:
    cd lead_ingestion
    .venv/bin/python scripts/scrape_miami_dade_evictions.py --days 14

Discovery findings: see lead_ingestion/notes/miami_dade_docket_endpoints.md.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import re
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from pydoll.browser.chromium import Chrome

OCS_BASE = "https://www2.miamidadeclerk.gov/ocs/"

EXPORT_DIR = Path(__file__).resolve().parents[2] / "lead_exports"
NOTES_DIR = Path(__file__).resolve().parents[1] / "notes"

# Eviction & landlord-tenant case type codes (from public OCSTypes endpoint).
EVICTION_CASE_TYPES = {
    "27306": "EVICTIONS - RESIDENTIAL",
    "28295": "EVICTIONS - RESIDENTIAL ($30,001 - $50,000)",
    "27193": "EVICTIONS (NON-MONETARY)",
    "25431": "EVICTIONS < $15,000",
    "27203": "EVICTIONS ($15,001 - $30,000)",
    "27305": "EVICTIONS - NON-RESIDENTIAL",
    "28294": "EVICTIONS - NON-RESIDENTIAL ($30,001 - $50,000)",
    "28564": "UNLAWFUL DETAINER",
    "28336": "LANDLORD TENANT (CLAIMS $15,001 - $30,000)",
    "28337": "LANDLORD TENANT (CLAIMS $30,001 - $50,000)",
    "28335": "LANDLORD TENANT (CLAIMS $8,001 - $15,000)",
    "27207": "SP LANDLORD TENANT ($5,001 TO $8,000)",
    "25933": "SP LANDLORD TENANT (UP TO $5,000)",
    "27204": "BATCH FILED SP LANDLORD TENANT ($5,001 TO $8,000)",
    "26255": "BATCH FILED SP LANDLORD TENANT (UP TO $5,000)",
}

EVICTION_TEXT_RE = re.compile(
    r"\b(EVICTION|LANDLORD\s+TENANT|UNLAWFUL\s+DETAIN|TENANT\b)", re.I
)


def _fmt_mmddyyyy(d: date) -> str:
    return d.strftime("%m/%d/%Y")


async def _try_click(tab: Any, selector: str, label: str) -> bool:
    """Best-effort click; returns True on success."""
    try:
        el = await tab.find_or_wait_element(selector=selector, timeout=4)
        if el is None:
            return False
        await el.click()
        print(f"    [click] {label} via {selector}")
        return True
    except Exception as exc:
        print(f"    [click-fail] {label} ({selector}): {exc!r}")
        return False


async def _click_link_by_text(tab: Any, text: str) -> bool:
    """Find an <a> or <button> whose visible text EQUALS or CONTAINS `text`.
    Prefers tightest match (smallest element by innerText length) to avoid
    clicking a wrapper that contains many menu items."""
    js = f"""
    (() => {{
      const want = {json.dumps(text)}.trim().toLowerCase();
      const els = Array.from(document.querySelectorAll('a, button, li[role="menuitem"], li[role="treeitem"], [role="menuitem"], [role="link"]'));
      // First pass: exact match
      let best = null;
      let bestLen = Infinity;
      for (const el of els) {{
        const t = (el.innerText || el.textContent || '').trim().toLowerCase();
        if (t === want && t.length < bestLen) {{
          best = el;
          bestLen = t.length;
        }}
      }}
      // Second pass: contains match (tightest)
      if (!best) {{
        for (const el of els) {{
          const t = (el.innerText || el.textContent || '').trim().toLowerCase();
          if (t.includes(want) && t.length < bestLen) {{
            best = el;
            bestLen = t.length;
          }}
        }}
      }}
      if (best) {{
        best.scrollIntoView({{block: 'center'}});
        best.click();
        return true;
      }}
      return false;
    }})()
    """
    try:
        res = await tab.execute_script(js)
        ok = _unwrap_cdp(res) is True
        print(f"    [click-by-text] '{text}' → {ok}")
        return ok
    except Exception as exc:
        print(f"    [click-by-text-fail] '{text}': {exc!r}")
        return False


def _unwrap_cdp(res: Any) -> Any:
    """Pydoll execute_script returns CDP's full Runtime.evaluate response, shape:
        {"id": N, "result": {"result": {"type": "...", "value": V}}}
    Unwrap defensively for either nesting depth."""
    if isinstance(res, dict):
        inner = res.get("result")
        if isinstance(inner, dict):
            inner2 = inner.get("result")
            if isinstance(inner2, dict) and "value" in inner2:
                return inner2["value"]
            if "value" in inner:
                return inner["value"]
        if "value" in res:
            return res["value"]
    return res


async def _fill_input_by_placeholder(tab: Any, placeholder_substr: str, value: str) -> bool:
    """Find an <input> whose placeholder/name/aria-label contains substring and set its value."""
    js = f"""
    (() => {{
      const want = {json.dumps(placeholder_substr)}.toLowerCase();
      const els = Array.from(document.querySelectorAll('input'));
      for (const el of els) {{
        const tag = ((el.placeholder || '') + ' ' + (el.name || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.id || '')).toLowerCase();
        if (tag.includes(want)) {{
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, {json.dumps(value)});
          el.dispatchEvent(new Event('input', {{ bubbles: true }}));
          el.dispatchEvent(new Event('change', {{ bubbles: true }}));
          el.dispatchEvent(new Event('blur', {{ bubbles: true }}));
          return true;
        }}
      }}
      return false;
    }})()
    """
    try:
        res = await tab.execute_script(js)
        ok = _unwrap_cdp(res) is True
        print(f"    [fill] '{placeholder_substr}' = '{value}' → {ok}")
        return ok
    except Exception as exc:
        print(f"    [fill-fail] '{placeholder_substr}': {exc!r}")
        return False


async def _dump_dom(tab: Any, label: str) -> Path:
    html = await tab.page_source
    out = NOTES_DIR / f"runtime_dom_{label}.html"
    out.write_text(html, encoding="utf-8")
    print(f"    [dump] {out.name} ({len(html):,} bytes)")
    return out


async def _scan_form_fields(tab: Any) -> list[str]:
    js = """
    (() => {
      const lines = [];
      for (const el of Array.from(document.querySelectorAll('input, select, button'))) {
        const tag = el.tagName;
        const type = el.type || '';
        const name = el.name || '';
        const placeholder = el.placeholder || '';
        const aria = el.getAttribute('aria-label') || '';
        const id = el.id || '';
        const text = (el.innerText || el.textContent || '').slice(0, 60);
        lines.push(`${tag}|t=${type}|name=${name}|ph=${placeholder}|aria=${aria}|id=${id}|text=${text}`);
      }
      return lines;
    })()
    """
    try:
        res = await tab.execute_script(js)
        v = _unwrap_cdp(res)
        return v if isinstance(v, list) else []
    except Exception:
        return []


async def _extract_visible_table(tab: Any) -> list[dict[str, str]]:
    """Pull <table>-based or card-based result rows from the results view."""
    js = """
    (() => {
      const rows = [];
      // Strategy A: native <table>
      for (const tbl of Array.from(document.querySelectorAll('table'))) {
        const headers = Array.from(tbl.querySelectorAll('thead th')).map(th => (th.innerText || '').trim());
        for (const tr of Array.from(tbl.querySelectorAll('tbody tr'))) {
          const cells = Array.from(tr.querySelectorAll('td')).map(td => (td.innerText || '').trim());
          const row = {};
          for (let i = 0; i < cells.length; i++) {
            row[headers[i] || `col${i}`] = cells[i];
          }
          if (Object.values(row).some(v => v && v.length > 0)) rows.push(row);
        }
      }
      // Strategy B: ARIA-grid / div cards (Vue/React often uses these)
      if (rows.length === 0) {
        const items = Array.from(document.querySelectorAll('[role="row"], .case-card, .result-item, .case-row, .v-data-table__row, .v-list-item'));
        for (const it of items) {
          const txt = (it.innerText || '').trim();
          if (txt) rows.push({ raw: txt });
        }
      }
      return rows;
    })()
    """
    try:
        res = await tab.execute_script(js)
        v = _unwrap_cdp(res)
        return v if isinstance(v, list) else []
    except Exception:
        return []


async def run(days: int) -> int:
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    NOTES_DIR.mkdir(parents=True, exist_ok=True)

    today = date.today()
    date_from = today - timedelta(days=days)
    date_to = today
    print(f"[scrape] hearing window: {date_from} → {date_to}")

    async with Chrome() as browser:
        tab = await browser.start()

        # Step 1: load home, wait for SPA mount
        print("[step 1] navigate to OCS home")
        await tab.go_to(OCS_BASE, timeout=45000)
        await asyncio.sleep(8)
        await _dump_dom(tab, "01_home")

        # Step 2: click "Hearings" from menu
        print("[step 2] click Hearings in nav")
        clicked = await _click_link_by_text(tab, "Hearings")
        if not clicked:
            # Try expanding parent first
            await _click_link_by_text(tab, "Multiple Case Search")
            await asyncio.sleep(1)
            clicked = await _click_link_by_text(tab, "Hearings")
        await asyncio.sleep(3)
        await _dump_dom(tab, "02_hearings_form")

        # Step 3: diagnostic — scan form fields
        print("[step 3] scan form fields")
        fields = await _scan_form_fields(tab)
        print(f"    [form-scan] {len(fields)} elements found")
        for line in fields[:40]:
            print(f"      {line}")

        # Step 4: try to fill date range
        print(f"[step 4] fill date range {_fmt_mmddyyyy(date_from)} → {_fmt_mmddyyyy(date_to)}")
        await _fill_input_by_placeholder(tab, "from", _fmt_mmddyyyy(date_from))
        await _fill_input_by_placeholder(tab, "to", _fmt_mmddyyyy(date_to))
        # Also try common variations
        await _fill_input_by_placeholder(tab, "start", _fmt_mmddyyyy(date_from))
        await _fill_input_by_placeholder(tab, "end", _fmt_mmddyyyy(date_to))

        # Step 5: submit / click Search
        print("[step 5] submit search")
        submitted = False
        for label in ["Search", "Submit", "Go"]:
            if await _click_link_by_text(tab, label):
                submitted = True
                break
        if not submitted:
            await _try_click(tab, "button[type='submit']", "submit-fallback")

        await asyncio.sleep(8)
        await _dump_dom(tab, "03_results")

        # Step 6: extract rows from DOM
        print("[step 6] extract results")
        rows = await _extract_visible_table(tab)
        print(f"    [extract] {len(rows)} rows")
        if rows:
            sample = rows[:3]
            for r in sample:
                print(f"      {json.dumps(r)[:160]}")

        # Step 7: filter to evictions
        eviction_rows: list[dict[str, str]] = []
        for r in rows:
            blob = " ".join(str(v) for v in r.values())
            if EVICTION_TEXT_RE.search(blob):
                eviction_rows.append(r)
        print(f"    [filter] {len(eviction_rows)} rows match eviction patterns")

        # Step 8: write CSV (even if zero rows — emit an empty header file)
        out_csv = EXPORT_DIR / f"miami-dade-evictions-{today.isoformat()}.csv"
        all_keys: list[str] = []
        for r in eviction_rows:
            for k in r:
                if k not in all_keys:
                    all_keys.append(k)
        if not all_keys:
            all_keys = ["raw"]
        with out_csv.open("w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(all_keys + ["county", "scraped_at"])
            for r in eviction_rows:
                w.writerow([r.get(k, "") for k in all_keys] + ["miami-dade", datetime.now(timezone.utc).isoformat()])
        print(f"\n[result] wrote {len(eviction_rows)} eviction rows → {out_csv}")
        print(f"[result] full results dump (unfiltered): {len(rows)} rows in runtime_dom_03_results.html")
        return len(eviction_rows)


def main() -> int:
    p = argparse.ArgumentParser(prog="scrape_miami_dade_evictions")
    p.add_argument("--days", type=int, default=14, help="Hearing date window in days (default 14)")
    args = p.parse_args()
    return asyncio.run(run(days=args.days))


if __name__ == "__main__":
    raise SystemExit(0 if main() >= 0 else 1)
