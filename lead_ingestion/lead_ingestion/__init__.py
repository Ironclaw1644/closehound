"""CloseHound lead ingestion: pull newly-registered businesses from state SOS
filings, normalize, enrich, score, and upsert into Supabase.

Entry point: `python -m lead_ingestion.orchestrator` (see orchestrator.py for
CLI args). Designed to be cron-scheduled on the Mac mini operator host.
"""

__version__ = "0.1.0"
