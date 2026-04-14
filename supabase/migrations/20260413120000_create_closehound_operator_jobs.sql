create table if not exists closehound.jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null
    check (job_type in ('lead_pull', 'preview_generate', 'promote_site')),
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  payload jsonb not null default '{}'::jsonb,
  requested_by text,
  lead_id uuid references closehound.leads (id),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists closehound.job_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references closehound.jobs (id) on delete cascade,
  worker_name text,
  run_status text,
  log jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists closehound.operator_locks (
  lock_key text primary key,
  locked_by text,
  locked_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists jobs_status_idx on closehound.jobs (status);
create index if not exists jobs_job_type_idx on closehound.jobs (job_type);
create index if not exists jobs_lead_id_idx on closehound.jobs (lead_id);
create index if not exists job_runs_job_id_idx on closehound.job_runs (job_id);
