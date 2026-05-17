-- New table for businesses ingested from state SOS filings (FL Sunbiz, GA SOS,
-- KY SOS, NY DOS). Lives alongside closehound.leads but stays separate so
-- staging/dedup can use a state-assigned id (no place_id), and so a future
-- promotion job can copy qualified rows into closehound.leads after the
-- domain/GMB enrichment determines they're worth contacting.

CREATE TABLE IF NOT EXISTS closehound.new_business_leads (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source             text NOT NULL CHECK (source IN ('FL_SUNBIZ','GA_SOS','KY_SOS','NY_DOS')),
  source_entity_id   text NOT NULL,
  business_name      text NOT NULL,
  entity_type        text,
  filing_date        date NOT NULL,
  state              text NOT NULL,
  principal_address  jsonb,
  registered_agent   jsonb,
  officers           jsonb,
  naics_code         text,
  naics_inferred     boolean NOT NULL DEFAULT false,
  raw_payload        jsonb NOT NULL,
  -- enrichment (post-fetch)
  domain_found       text,
  has_website        boolean,
  gmb_found          boolean,
  -- scoring
  priority_score     int NOT NULL DEFAULT 0,
  priority_tier      text CHECK (priority_tier IN ('hot','warm','cold')),
  -- pipeline state
  status             text NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new','enriched','queued','contacted','won','lost','dead')),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, source_entity_id)
);

CREATE INDEX IF NOT EXISTS idx_nbl_filing_date ON closehound.new_business_leads (filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_nbl_priority    ON closehound.new_business_leads (priority_tier, filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_nbl_status      ON closehound.new_business_leads (status);

-- service_role only (matches the rest of closehound.*)
ALTER TABLE closehound.new_business_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS new_business_leads_service_role_all ON closehound.new_business_leads;
CREATE POLICY new_business_leads_service_role_all
  ON closehound.new_business_leads FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
