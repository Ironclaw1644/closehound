drop index if exists closehound.closehound_template_image_candidates_one_approved_per_slot_idx;

create unique index if not exists closehound_template_image_candidates_one_approved_per_template_slot_idx
  on closehound.template_image_candidates (template_key, slot)
  where status = 'approved';

alter table closehound.template_image_candidates
  drop constraint if exists template_image_candidates_approved_requires_asset_url;

alter table closehound.template_image_candidates
  add constraint template_image_candidates_approved_requires_asset_url
  check (
    status <> 'approved'
    or nullif(btrim(asset_url), '') is not null
  );
