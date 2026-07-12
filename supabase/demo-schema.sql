-- ============================================================================
-- demo_closehound — the DEMO_MODE schema
-- ============================================================================
-- A standalone clone of the `closehound` tables the app touches, holding ONLY
-- synthetic data for the public demo deployment. Truncated + reseeded nightly
-- by /api/demo/reset (see supabase/demo-seed.ts + vercel.json cron).
--
-- Differences from the production schema (deliberate):
--   • user_id columns are TEXT, not uuid-FK to auth.users: the demo user is
--     synthetic ("00000000-0000-0000-0000-00000000demo" — note: NOT valid uuid
--     hex, which is exactly why these columns can't be uuid), and there is no
--     auth.users row behind it.
--   • No RLS policies for anon/authenticated: the app reaches this schema
--     exclusively through the service-role client (getServerClosehound /
--     getClosehoundAdminSchema in DEMO_MODE). RLS is enabled with zero
--     policies so the anon key can never read it.
--   • No reserve_screens/refund_screens/grant_credits functions: DEMO_MODE
--     implies MOCK_MODE, so the billable-quota path is never exercised.
--
-- Apply via Supabase MCP `apply_migration` (or SQL editor) to the shared
-- project. IMPORTANT: after applying, add `demo_closehound` to the PostgREST
-- "Exposed schemas" list (Dashboard → Settings → API → Exposed schemas),
-- otherwise supabase-js .schema("demo_closehound") calls will 406.
-- ============================================================================

create schema if not exists demo_closehound;

-- ── Global caches (seeded with curated GA/FL data; synthetic fills the rest) ─

create table if not exists demo_closehound.safmr_cache (
  zip          text not null,
  fiscal_year  int  not null,
  br0          numeric,
  br1          numeric,
  br2          numeric,
  br3          numeric,
  br4          numeric,
  metro_code   text,
  metro_name   text,
  is_safmr     boolean not null default true,
  fetched_at   timestamptz not null default now(),
  primary key (zip, fiscal_year)
);

create table if not exists demo_closehound.market_cache (
  zip               text not null,
  bedrooms          int  not null,
  median_sale_price numeric,
  median_rent       numeric,
  fetched_at        timestamptz not null default now(),
  primary key (zip, bedrooms)
);

create table if not exists demo_closehound.listings_cache (
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
create index if not exists demo_listings_cache_zip_idx
  on demo_closehound.listings_cache (zip);

create table if not exists demo_closehound.properties_cache (
  address          text primary key,
  annual_tax       numeric,
  last_sale_price  numeric,
  last_sale_date   text,
  raw              jsonb,
  fetched_at       timestamptz not null default now()
);

-- ── Per-user app data (user_id = TEXT, no auth.users FK — see header) ───────

create table if not exists demo_closehound.profiles (
  user_id                text primary key,
  plan                   text not null default 'free',
  status                 text not null default 'inactive',
  stripe_customer_id     text,
  stripe_subscription_id text,
  credit_balance         int not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists demo_closehound.usage (
  user_id      text not null,
  period_month text not null,
  screens_used int  not null default 0,
  primary key (user_id, period_month)
);

create table if not exists demo_closehound.screening_runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  markets     jsonb not null,
  assumptions jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists demo_closehound.saved_deals (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  listing       jsonb not null,
  underwriting  jsonb not null,
  notes         text,
  status        text not null default 'new',
  safmr_monthly numeric,
  created_at    timestamptz not null default now()
);
create index if not exists demo_saved_deals_user_idx
  on demo_closehound.saved_deals (user_id, created_at desc);

-- ── Misc tables the app can touch ────────────────────────────────────────────

create table if not exists demo_closehound.leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  created_at timestamptz not null default now()
);

create table if not exists demo_closehound.processed_events (
  event_id   text primary key,
  created_at timestamptz not null default now()
);

-- ── Lockdown: service_role only ─────────────────────────────────────────────
-- RLS on with NO policies → anon/authenticated see nothing even if granted;
-- and nothing is granted to them anyway.

alter table demo_closehound.safmr_cache      enable row level security;
alter table demo_closehound.market_cache     enable row level security;
alter table demo_closehound.listings_cache   enable row level security;
alter table demo_closehound.properties_cache enable row level security;
alter table demo_closehound.profiles         enable row level security;
alter table demo_closehound.usage            enable row level security;
alter table demo_closehound.screening_runs   enable row level security;
alter table demo_closehound.saved_deals      enable row level security;
alter table demo_closehound.leads            enable row level security;
alter table demo_closehound.processed_events enable row level security;

grant usage on schema demo_closehound to service_role;
grant select, insert, update, delete on all tables in schema demo_closehound to service_role;
