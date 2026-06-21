#!/usr/bin/env python3
"""Build the static voucher-rent dataset from HUD's OFFICIAL FY2026 SAFMR file.

The HUD live API is too unstable for this (its /fmr/data endpoint intermittently
404s its own FY2026 data, ZIP->metro crosswalks mismatch CBSA vintages). HUD's
published SAFMR spreadsheet, by contrast, is the authoritative, complete,
deterministic source — every SAFMR ZIP with FY2026 0-4BR rates.

  HUDUSER_API_KEY=...  python3 scripts/build-safmr.py [year]

Writes src/lib/hud/safmr-data.json  ->  { fiscalYear, source, zips: { zip: [..5..] } }
Pass 1: parse HUD's SAFMR-by-ZIP file (no API).
Pass 2: county FMR via /fmr/statedata for any curated ZIP not in the SAFMR file
        (rare — SAFMR areas cover almost all curated markets).
"""
import io, json, os, re, sys, urllib.request
import openpyxl

YEAR = int(sys.argv[1]) if len(sys.argv) > 1 else 2026
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/lib/hud/safmr-data.json")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SAFMR_URL = f"https://www.huduser.gov/portal/datasets/fmr/fmr{YEAR}/fy{YEAR}_safmrs_revised.xlsx"
API = "https://www.huduser.gov/hudapi/public/fmr"


def fetch(url, headers):
    return urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=120).read()


# ── Pass 1: official SAFMR spreadsheet ───────────────────────────────────────
print(f"Downloading HUD FY{YEAR} SAFMR file…")
xlsx = fetch(SAFMR_URL, {"User-Agent": UA, "Accept": "*/*",
                         "Referer": "https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html"})
ws = openpyxl.load_workbook(io.BytesIO(xlsx), read_only=True)["SAFMRs"]
it = ws.iter_rows(values_only=True)
next(it)  # header
zips = {}
# Base SAFMR (40th-pct) columns: 0BR=3, 1BR=6, 2BR=9, 3BR=12, 4BR=15 (skip the
# 90%/110% payment-standard columns between them).
COLS = [3, 6, 9, 12, 15]
for r in it:
    z = str(r[0]).strip() if r[0] is not None else ""
    if z.isdigit() and len(z) < 5:
        z = z.zfill(5)
    if not re.fullmatch(r"\d{5}", z):
        continue
    try:
        vals = [int(round(float(r[c]))) for c in COLS]
    except (TypeError, ValueError):
        continue
    if all(v > 0 for v in vals) and z not in zips:
        zips[z] = vals
print(f"  SAFMR ZIPs from file: {len(zips)}")

# ── Pass 2: county FMR fallback for curated ZIPs not in the SAFMR file ────────
src = open(os.path.join(ROOT, "src/lib/config/assumptions.ts")).read()
markets = re.findall(
    r'state:\s*"([^"]+)",\s*county:\s*"([^"]+)"[\s\S]*?zips:\s*\[([^\]]*)\]', src)
key = os.environ.get("HUDUSER_API_KEY")
state_cache = {}


def statedata(st):
    if st not in state_cache:
        d = json.loads(fetch(f"{API}/statedata/{st}?year={YEAR}", {"Authorization": f"Bearer {key}"}))
        state_cache[st] = (d.get("data", {}).get("counties", []), d.get("data", {}).get("metroareas", []))
    return state_cache[st]


def norm(s):
    return re.sub(r"\s+(county|parish|borough|city|msa|hud metro fmr area)\b.*$", "", (s or "").lower()).strip()


added, unmatched = 0, []
for state, county, zipstr in markets:
    zs = re.findall(r"\d{5}", zipstr)
    missing = [z for z in zs if z not in zips]
    if not missing or not key:
        continue
    counties, metros = statedata(state)
    want = norm(county)
    row = next((c for c in counties if norm(c["county_name"]) == want), None) \
        or next((c for c in counties if want in norm(c["county_name"]) or norm(c["county_name"]) in want), None) \
        or next((m for m in metros if want in norm(m["metro_name"])), None)
    if not row:
        unmatched.append(f"{state}/{county}")
        continue
    fmr = [int(row[k]) for k in ["Efficiency", "One-Bedroom", "Two-Bedroom", "Three-Bedroom", "Four-Bedroom"]]
    if all(v > 0 for v in fmr):
        for z in missing:
            zips[z] = fmr
            added += 1
print(f"  county-FMR ZIPs added: {added}" + (f"  ⚠ unmatched: {unmatched}" if unmatched else ""))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump({"fiscalYear": YEAR, "source": f"HUD FY{YEAR} SAFMRs (revised) + county FMR fallback", "zips": zips},
          open(OUT, "w"))
print(f"\nDone. {len(zips)} ZIPs → {OUT}")
