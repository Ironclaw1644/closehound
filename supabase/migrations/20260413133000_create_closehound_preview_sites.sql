create table if not exists closehound.preview_sites (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  lead_id uuid not null references closehound.leads (id) on delete cascade,
  preview_url text not null,
  preview_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists preview_sites_slug_idx on closehound.preview_sites (slug);
create index if not exists preview_sites_lead_id_idx on closehound.preview_sites (lead_id);
