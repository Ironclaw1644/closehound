create or replace function closehound.approve_template_image_candidate(
  input_candidate_id text,
  input_approved_by text
)
returns setof closehound.template_image_candidates
language plpgsql
as $$
declare
  target_record closehound.template_image_candidates%rowtype;
  approval_updated_at timestamptz := now();
begin
  select *
  into target_record
  from closehound.template_image_candidates
  where id = input_candidate_id
  for update;

  if not found then
    raise exception 'Template image candidate not found: %', input_candidate_id;
  end if;

  if nullif(btrim(target_record.asset_url), '') is null then
    raise exception 'Cannot approve template image candidate without asset URL: %', input_candidate_id;
  end if;

  perform 1
  from closehound.template_image_candidates
  where template_key = target_record.template_key
    and slot = target_record.slot
    and status = 'approved'
  order by id
  for update;

  update closehound.template_image_candidates
  set
    status = 'generated',
    approval_updated_at = approval_updated_at,
    approval_updated_by = input_approved_by
  where template_key = target_record.template_key
    and slot = target_record.slot
    and status = 'approved'
    and id <> target_record.id;

  return query
  update closehound.template_image_candidates
  set
    status = 'approved',
    approval_updated_at = approval_updated_at,
    approval_updated_by = input_approved_by
  where id = target_record.id
  returning *;
end;
$$;

create or replace function closehound.reject_template_image_candidate(
  input_candidate_id text,
  input_rejected_by text
)
returns setof closehound.template_image_candidates
language plpgsql
as $$
declare
  target_record closehound.template_image_candidates%rowtype;
  rejection_updated_at timestamptz := now();
begin
  select *
  into target_record
  from closehound.template_image_candidates
  where id = input_candidate_id
  for update;

  if not found then
    raise exception 'Template image candidate not found: %', input_candidate_id;
  end if;

  perform 1
  from closehound.template_image_candidates
  where template_key = target_record.template_key
    and slot = target_record.slot
    and status = 'approved'
  order by id
  for update;

  if target_record.status = 'approved' then
    update closehound.template_image_candidates
    set
      status = 'generated',
      approval_updated_at = rejection_updated_at,
      approval_updated_by = input_rejected_by
    where template_key = target_record.template_key
      and slot = target_record.slot
      and status = 'approved'
      and id <> target_record.id;
  end if;

  return query
  update closehound.template_image_candidates
  set
    status = 'rejected',
    approval_updated_at = rejection_updated_at,
    approval_updated_by = input_rejected_by
  where id = target_record.id
  returning *;
end;
$$;
