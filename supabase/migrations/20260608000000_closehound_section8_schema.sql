-- ============================================================================
-- Phase 3 — CloseHound (Section 8 deal-screener) data model
-- ============================================================================
-- Fresh `closehound` schema (the old lead-gen schema was archived to
-- closehound_legacy in Phase 0). Apply via Supabase MCP `apply_migration` to
-- project kflzqkuioiiyfrvlvcvl — NEVER `supabase db push` against this shared DB.
--
-- Design: three GLOBAL caches (server-written via the service role; RLS locks
-- out anon/authenticated so clients never read them directly) + four PER-USER
-- tables (RLS owner-only via auth.uid()). Caching is the margin engine — repeat
-- ZIP lookups hit cache for $0 (market 30-day TTL, listings 24-hour TTL,
-- enforced in app code via fetched_at).
-- ============================================================================

create schema if not exists closehound;

-- ── Global caches ───────────────────────────────────────────────────────────

-- HUD SAFMR by ZIP + fiscal year (Small-Area FMR per bedroom, monthly $).
-- Payment-standard multiplier (e.g. 1.10) is NOT stored — it is a user-tunable
-- assumption applied at underwriting time: grossRent = SAFMR * paymentStandard.
create table closehound.safmr_cache (
  zip          text not null,
  fiscal_year  int  not null,
  br0          numeric,   -- efficiency / studio
  br1          numeric,
  br2          numeric,
  br3          numeric,
  br4          numeric,
  metro_code   text,      -- HUD metro/area code (provenance)
  metro_name   text,
  is_safmr     boolean not null default true, -- false => metro-level FMR fallback
  fetched_at   timestamptz not null default now(),
  primary key (zip, fiscal_year)
);

-- RentCast market data by ZIP + bedroom count.
create table closehound.market_cache (
  zip               text not null,
  bedrooms          int  not null,
  median_sale_price numeric,
  median_rent       numeric,
  fetched_at        timestamptz not null default now(),
  primary key (zip, bedrooms)
);

-- RentCast sale listings.
create table closehound.listings_cache (
  rentcast_id  text primary key,
  zip          text not null,
  address      text,
  price        numeric,
  beds         int,
  baths        numeric,
  sqft         int,
  year_built   int,
  annual_tax   numeric,
  raw          jsonb,
  fetched_at   timestamptz not null default now()
);
create index listings_cache_zip_idx on closehound.listings_cache (zip);

-- ── Per-user app data ───────────────────────────────────────────────────────

create table closehound.profiles (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  plan                   text not null default 'free',     -- free | pro
  status                 text not null default 'inactive', -- active | inactive | past_due | canceled
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table closehound.usage (
  user_id      uuid not null references auth.users (id) on delete cascade,
  period_month text not null,                 -- 'YYYY-MM'
  screens_used int  not null default 0,
  primary key (user_id, period_month)
);

create table closehound.screening_runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  markets     jsonb not null,                 -- target counties/metros/zips
  assumptions jsonb not null,                 -- underwriting config snapshot
  created_at  timestamptz not null default now()
);
create index screening_runs_user_idx on closehound.screening_runs (user_id, created_at desc);

create table closehound.saved_deals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  listing      jsonb not null,                -- listing snapshot
  underwriting jsonb not null,                -- full underwriting output + Deal Score
  notes        text,
  created_at   timestamptz not null default now()
);
create index saved_deals_user_idx on closehound.saved_deals (user_id, created_at desc);

-- ── Row-level security ──────────────────────────────────────────────────────

-- Caches: RLS on, NO anon/authenticated policy => service role only.
alter table closehound.safmr_cache    enable row level security;
alter table closehound.market_cache   enable row level security;
alter table closehound.listings_cache enable row level security;

-- User tables: RLS on + owner-only.
alter table closehound.profiles       enable row level security;
alter table closehound.usage          enable row level security;
alter table closehound.screening_runs enable row level security;
alter table closehound.saved_deals    enable row level security;

create policy profiles_owner on closehound.profiles
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Usage is incremented server-side (service role); clients may only read theirs.
create policy usage_owner_select on closehound.usage
  for select to authenticated using (auth.uid() = user_id);

create policy screening_runs_owner on closehound.screening_runs
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy saved_deals_owner on closehound.saved_deals
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Grants ──────────────────────────────────────────────────────────────────
grant usage on schema closehound to authenticated, service_role;

-- Caches: service role only.
grant select, insert, update, delete on
  closehound.safmr_cache, closehound.market_cache, closehound.listings_cache
  to service_role;

-- User tables: authenticated (RLS-constrained) + service role.
grant select, insert, update, delete on
  closehound.profiles, closehound.usage, closehound.screening_runs, closehound.saved_deals
  to authenticated, service_role;
