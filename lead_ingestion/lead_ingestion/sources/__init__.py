"""Per-state ingesters. Each subclasses BaseIngester.

Adding a new state is a single new file here:
    1. New file `sources/xx_state.py` with class `XxStateIngester(BaseIngester)`
    2. Implement `fetch_new_filings(since_date)`
    3. Add the Source enum value in `base.py`
    4. Register in `orchestrator._all_ingesters()` + add a config toggle

No registry magic — explicit imports beat auto-discovery here.
"""
