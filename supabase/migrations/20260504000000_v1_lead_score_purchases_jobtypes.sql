-- CloseHound V1: lead enrichment + purchases table + extended job types.
-- Safe to re-run.

-- 1. Lead enrichment columns used by LeadHound (Google Places + Ollama scoring).
alter table closehound.leads
  add column if not exists lead_score numeric(4, 2),
  add column if not exists lead_source text,
  add column if not exists place_id text,
  add column if not exists review_count integer,
  add column if not exists top_review text,
  add column if not exists top_reviewer_name text,
  add column if not exists years_in_business integer,
  add column if not exists notes text;

create unique index if not exists leads_place_id_key
  on closehound.leads (place_id)
  where place_id is not null;

create index if not exists leads_lead_score_idx
  on closehound.leads (lead_score desc nulls last);

create index if not exists leads_status_idx
  on closehound.leads (status);

-- 2. Preview asset cache: store generated logo + hero asset URLs per lead so we
--    do not re-spend Gemini calls on every preview render.
alter table closehound.preview_sites
  add column if not exists logo_url text,
  add column if not exists hero_url text,
  add column if not exists generated_at timestamptz default now();

-- 3. Purchases: one row per Stripe checkout that completes for a lead.
create table if not exists closehound.purchases (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references closehound.leads (id) on delete cascade,
  stripe_session_id text unique,
  stripe_customer_id text,
  amount_cents integer not null,
  currency text not null default 'usd',
  customer_email text,
  customer_name text,
  domain text,
  vercel_project_id text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'fulfilled', 'refunded', 'cancelled')),
  paid_at timestamptz,
  fulfilled_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists purchases_lead_id_idx
  on closehound.purchases (lead_id);

create index if not exists purchases_status_idx
  on closehound.purchases (status);

-- 4. Service role can read/write purchases (matches the existing pattern used
--    for closehound.jobs and closehound.preview_sites).
grant usage on schema closehound to service_role;
grant select, insert, update, delete on closehound.purchases to service_role;
grant select on closehound.purchases to authenticated;
grant select on closehound.purchases to anon;
