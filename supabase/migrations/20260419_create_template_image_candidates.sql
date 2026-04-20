create table if not exists public.template_image_candidates (
  id text primary key,
  generation_batch_id text not null,
  family_key text not null,
  template_key text not null,
  template_version text not null,
  seed_business_key text,
  lead_id uuid references closehound.leads (id) on delete set null,
  slot text not null,
  candidate_index integer not null check (candidate_index >= 0),
  prompt text not null,
  negative_prompt text not null,
  prompt_version text not null,
  provider text not null check (provider = 'gemini'),
  model text not null check (model = 'nano-banana-2'),
  status text not null check (status in ('generated', 'approved', 'rejected', 'unused')),
  storage_path text not null,
  asset_url text,
  aspect_ratio text not null,
  crop_notes text,
  created_at timestamptz not null default now(),
  created_by text not null,
  approval_updated_at timestamptz,
  approval_updated_by text
);

create index if not exists template_image_candidates_template_batch_slot_idx
  on public.template_image_candidates (template_key, generation_batch_id, slot, status);

create index if not exists template_image_candidates_batch_idx
  on public.template_image_candidates (generation_batch_id);

create unique index if not exists template_image_candidates_one_approved_per_slot_idx
  on public.template_image_candidates (template_key, generation_batch_id, slot)
  where status = 'approved';
