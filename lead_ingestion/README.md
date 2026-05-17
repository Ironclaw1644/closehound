# `lead_ingestion/` — CloseHound state-SOS lead ingestion

Pulls newly-registered businesses from state Secretary of State filings,
enriches them (does the business have a website? a GMB listing?), scores
them, and upserts into `closehound.new_business_leads` in Supabase.

These leads are higher-intent than the Google Places pool — most filings are
businesses that registered in the last 60 days and don't yet have a website.
That's exactly who CloseHound's $497 build pitch was designed for. Validated
against May 2026 FL Sunbiz + NY DOS data: ~80-88% of NAICS-matched filings
have no website at all (the inverse of the Places pool).

This is the first Python module in the CloseHound repo. The TS Next.js worker
keeps its own world; this module runs independently as a cron-scheduled
Python process on the Mac mini.

## Source status

| Source | Status | Notes |
|---|---|---|
| **FL Sunbiz** | ✅ working | Anonymous SFTP, daily fixed-width files (~2-4 MB/day). |
| **NY DOS** | ✅ working | Socrata `n9v6-gdp6` (Active Corporations), `$where` date filter. |
| **GA SOS** | ⛔ gated | `ecorp.sos.ga.gov` is Cloudflare-challenged; needs a headless browser or paid bulk-data subscription. |
| **KY SOS** | ⛔ gated | KY publishes only through a paid Kentucky.gov subscriber agreement; no free public delta feed. |

Gated sources log a structured WARNING per run (`*.gated`) but don't fail —
the orchestrator continues with whatever works. Set `SOURCE_GA_SOS_ENABLED=0`
or `SOURCE_KY_SOS_ENABLED=0` to silence them entirely until they're unblocked.

## Setup (one-time)

```bash
# 1. Install uv if not present
brew install uv

# 2. Sync deps + create venv at lead_ingestion/.venv
cd lead_ingestion
uv sync

# 3. Copy env template + fill in Supabase URL/key (or symlink from repo root)
cp .env.example .env.local
$EDITOR .env.local
```

The module **merges** `.env.local` files in this priority order (earlier wins,
later files only fill in keys that weren't set):
1. `cwd/.env.local` — wherever you ran it from
2. `lead_ingestion/.env.local` — Python-side-only overrides (FL Sunbiz creds, etc.)
3. The CloseHound repo root `.env.local` — shared TS+Python secrets (Supabase keys)
4. `lead_ingestion/.env` — example/fallback values

Typical split: keep Supabase keys in the repo-root `.env.local` (shared with
the TS code), and FL Sunbiz public creds in `lead_ingestion/.env.local`.

Required env vars (see `.env.example` for the full list):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`)
- `FL_SUNBIZ_SFTP_USER`, `FL_SUNBIZ_SFTP_PASSWORD` — FL Sunbiz publishes
  public creds at https://floridados.gov/sunbiz/other-services/data-downloads/
  Not secret, but kept out of code for hygiene.

## Run

```bash
# Pull last 14 days from all enabled sources, run enrichment, write to DB
uv run python -m lead_ingestion.orchestrator --source all

# Just FL Sunbiz, last 30 days
uv run python -m lead_ingestion.orchestrator --source fl_sunbiz --days 30

# Backfill 60 days (first-run / recovery)
uv run python -m lead_ingestion.scripts.backfill

# Skip enrichment entirely (no domain check, no GMB — fastest for testing)
uv run python -m lead_ingestion.orchestrator --source fl_sunbiz --days 7 --skip-enrichment

# Skip just GMB (recommended for wide windows — domain check is sub-second
# per lead, GMB rate-limits to ~3s/lead). Domain alone is enough to score hot.
uv run python -m lead_ingestion.orchestrator --source fl_sunbiz --days 7 --skip-gmb
```

Typical run sizes (May 2026 baseline):
- FL Sunbiz: ~3000 active filings/day on weekdays, ~150-400 weekend. After
  NAICS filter, ~80-120 leads/day. Domain-only enrichment: ~0.4s/lead.
- NY DOS: ~800-1000 entities/day. After NAICS filter, ~15-30 leads/day.

Output is one JSON object per log event on stdout. Pipe to `jq` for grepping:

```bash
uv run python -m lead_ingestion.orchestrator --source fl_sunbiz --days 14 | jq -c 'select(.message | startswith("ingester."))'
```

## Cron

Daily at 2 AM, last 7 days, all sources, log to `~/closehound-logs/`:

```cron
0 2 * * * cd /Users/ironclaw/projects/closehound/.claude/worktrees/quizzical-cray-4a1754/lead_ingestion && /opt/homebrew/bin/uv run python -m lead_ingestion.orchestrator --source all --days 7 >> $HOME/closehound-logs/lead_ingestion.log 2>&1
```

Install via `crontab -e`. The path `/opt/homebrew/bin/uv` is the standard
homebrew location on Apple Silicon Macs; check `which uv` on your system.

## How to add a new state

1. Add the source value to `Source` enum in `lead_ingestion/base.py`.
2. Add the source to the `CHECK (source IN (...))` constraint via a new
   migration in `supabase/migrations/`.
3. Create `lead_ingestion/sources/<state>_<office>.py` implementing
   `BaseIngester.fetch_new_filings(since_date) -> Iterable[Filing]`.
4. Register the new ingester in `orchestrator._build_ingesters`.
5. Add a per-source toggle (`SOURCE_XX_ENABLED`) in `config.py` + `.env.example`.

Naming convention: 2-letter state + office (`fl_sunbiz`, `tx_dos`, `ca_sos`).

## FL Sunbiz fixed-width parser — known gotchas

- **The host is `sftp.floridados.gov`.** The historical `sftp.dos.state.fl.us`
  is gone. Public creds (`Public` / `PubAccess1845!`) come from FL DOS's
  data-downloads page.
- **Daily file names: `YYYYMMDDc.txt`** under `/Public/doc/cor/`. The filename
  is the authoritative *filing date* — that's what we score against. Weekend
  and holiday files don't exist (skipped silently).
- **The date field at bytes (472, 480) is the *effective date*, NOT the filing
  date.** Florida lets LLCs specify a delayed effective date up to 90 days in
  the future, so the record's date can be a month or two AFTER the file date.
  We persist effective_date in `raw_payload` but use the filename for
  `filing_date`. This was a real bug caught at the FL checkpoint.
- **Anonymous SFTP is flaky.** Random EOF disconnects; we retry up to 4 times
  with exponential backoff. If it fails persistently, try a different network
  (Sunbiz blocks some VPN IP ranges).
- **The file format is fixed-width per a published Sunbiz layout PDF.** Column
  positions have shifted on annual revisions in past years. If parsing yields
  nonsense (names truncated mid-letter, blank business_names), pull the
  current layout PDF from Sunbiz and update `FL_SUNBIZ_COLS` in
  `sources/fl_sunbiz.py`. Current positions verified against
  `/Public/doc/cor/20260514c.txt` on 2026-05-15.
- **Multi-line officer records.** A filing's officer list appears as separate
  appended lines after the primary record. The current parser ignores officers
  for v1 (`officers=None`) — TODO: accumulate continuation lines into a list
  on the parent Filing. Not blocking for the no-website / hot-lead detection.
- **Inactive entities are filtered.** Records with `status != 'A'` (amendments,
  reinstatements, dissolutions) are dropped before yielding.

## NY DOS notes

- Dataset id: `n9v6-gdp6` ("Active Corporations: Beginning 1800").
- Filter by `initial_dos_filing_date >= 'YYYY-MM-DDT00:00:00.000'` via SoQL.
- The dataset has no NAICS column. We rely entirely on `naics_filter`'s
  keyword inference from business name to pull service businesses.
- Address fallback: prefer `location_*` (physical), then `chairman_*` (CEO),
  then `dos_process_*` (legal-service address, often a registered agent
  rather than the actual business).

## Testing

```bash
# All tests
uv run pytest

# Just one file
uv run pytest lead_ingestion/tests/test_scoring.py -v

# Lint
uv run ruff check .

# Type check
uv run mypy lead_ingestion
```

The pure-logic tests (`test_naics_filter.py`, `test_scoring.py`,
`test_slugify.py`) run with no network — they're the gold layer.

The FL Sunbiz parser test (`test_fl_sunbiz_parse.py` TBD) uses a saved fixture
under `tests/fixtures/` so it works offline. Don't add a test that hits the
real SFTP server in CI — anonymous Sunbiz isn't a reliable test target.

## Non-goals (intentionally NOT here)

- **Email enrichment** (Hunter, Apollo, ZoomInfo) — separate phase.
- **Outreach automation** — separate phase, uses `closehound.leads` not
  this table.
- **Dashboard UI** — the existing operator dashboard doesn't read this table
  yet. A separate task will merge hot leads into the operator view.
- **Paid APIs or LLM calls** — every external call here is free.
- **Cloudflare bypass / paid bulk subscriptions** — GA and KY are gated and
  stay gated until somebody commits to a headless-browser tier or a paid
  subscription. They're not silent failures; they emit clear WARNINGs.

## Module layout

```
lead_ingestion/
  pyproject.toml         # uv-managed
  .python-version        # 3.11
  .env.example
  README.md              # you are here
  lead_ingestion/
    __init__.py
    base.py              # BaseIngester, Filing, EnrichedFiling
    config.py            # env-loaded Config
    logging_setup.py     # JSON logger
    naics_filter.py      # target NAICS + name inference
    scoring.py           # priority score + tier
    supabase_client.py   # supabase-py thin wrapper
    orchestrator.py      # CLI entry
    sources/
      __init__.py
      fl_sunbiz.py
      ga_sos.py
      ky_sos.py
      ny_dos.py
    enrichment/
      __init__.py
      domain_check.py
      gmb_check.py
    tests/
      test_naics_filter.py
      test_scoring.py
      test_slugify.py
      fixtures/
  scripts/
    backfill.py
```
