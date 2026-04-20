create table if not exists closehound.template_image_candidates (
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

create index if not exists closehound_template_image_candidates_template_batch_slot_idx
  on closehound.template_image_candidates (template_key, generation_batch_id, slot, status);

create index if not exists closehound_template_image_candidates_batch_idx
  on closehound.template_image_candidates (generation_batch_id);

create unique index if not exists closehound_template_image_candidates_one_approved_per_slot_idx
  on closehound.template_image_candidates (template_key, generation_batch_id, slot)
  where status = 'approved';

insert into closehound.template_image_candidates (
  id,
  generation_batch_id,
  family_key,
  template_key,
  template_version,
  seed_business_key,
  lead_id,
  slot,
  candidate_index,
  prompt,
  negative_prompt,
  prompt_version,
  provider,
  model,
  status,
  storage_path,
  asset_url,
  aspect_ratio,
  crop_notes,
  created_at,
  created_by,
  approval_updated_at,
  approval_updated_by
)
select
  id,
  generation_batch_id,
  family_key,
  template_key,
  template_version,
  seed_business_key,
  lead_id,
  slot,
  candidate_index,
  prompt,
  negative_prompt,
  prompt_version,
  provider,
  model,
  status,
  storage_path,
  asset_url,
  aspect_ratio,
  crop_notes,
  created_at,
  created_by,
  approval_updated_at,
  approval_updated_by
from public.template_image_candidates
on conflict (id) do nothing;
