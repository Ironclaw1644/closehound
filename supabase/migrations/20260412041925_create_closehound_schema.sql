create schema if not exists closehound;

create table if not exists closehound.leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  phone text,
  city text,
  industry text,
  rating numeric,
  has_website boolean not null default false,
  status text not null default 'new'
    check (status in ('new', 'generated', 'emailed', 'called', 'closed')),
  preview_url text,
  created_at timestamptz not null default now()
);

create index if not exists leads_status_idx on closehound.leads (status);
create index if not exists leads_industry_idx on closehound.leads (industry);
create index if not exists leads_city_idx on closehound.leads (city);
