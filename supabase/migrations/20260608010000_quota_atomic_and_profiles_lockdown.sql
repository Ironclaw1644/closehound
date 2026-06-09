-- ============================================================================
-- Phase 12 pre-deploy review fixes (applied via MCP apply_migration).
-- 1) Atomic quota reservation (fixes the TOCTOU race + per-request mis-metering).
-- 2) Lock down closehound.profiles writes (fixes the self-upgrade-to-Pro bypass).
-- ============================================================================

-- Atomically reserve `p_count` screens BEFORE the billable call. Single UPDATE,
-- so concurrent requests cannot all pass the same check. Returns the new
-- screens_used on success, NULL when the reservation would exceed the limit.
create or replace function closehound.reserve_screens(
  p_user uuid, p_period text, p_limit int, p_count int
) returns int
language plpgsql security definer set search_path = closehound, pg_temp as $$
declare v_used int;
begin
  insert into closehound.usage (user_id, period_month, screens_used)
    values (p_user, p_period, 0)
    on conflict (user_id, period_month) do nothing;
  update closehound.usage
    set screens_used = screens_used + p_count
    where user_id = p_user and period_month = p_period
      and screens_used + p_count <= p_limit
    returning screens_used into v_used;
  return v_used;
end; $$;

create or replace function closehound.refund_screens(
  p_user uuid, p_period text, p_count int
) returns void
language plpgsql security definer set search_path = closehound, pg_temp as $$
begin
  update closehound.usage
    set screens_used = greatest(0, screens_used - p_count)
    where user_id = p_user and period_month = p_period;
end; $$;

revoke all on function closehound.reserve_screens(uuid, text, int, int) from public;
revoke all on function closehound.refund_screens(uuid, text, int) from public;
grant execute on function closehound.reserve_screens(uuid, text, int, int) to service_role;
grant execute on function closehound.refund_screens(uuid, text, int) to service_role;

-- profiles: authenticated may READ its own row only. plan/status are written
-- exclusively by the Stripe webhook (service role), so a user can't self-upgrade.
drop policy if exists profiles_owner on closehound.profiles;
create policy profiles_owner_select on closehound.profiles
  for select to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on closehound.profiles from authenticated;
