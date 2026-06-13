-- ============================================================================
-- Pay-as-you-go credits + multi-tier quota
-- ============================================================================
-- Adds a persistent, NON-EXPIRING credit balance and upgrades the atomic
-- "bankruptcy guard" so a screen reservation consumes the monthly subscription
-- allotment first, then draws any remainder from credits. Single locked path —
-- concurrent requests cannot double-spend. FAIL-CLOSED: insufficient monthly +
-- credits → NULL (nothing reserved). Apply via Supabase MCP apply_migration.
-- ============================================================================

alter table closehound.profiles
  add column if not exists credit_balance int not null default 0;

-- Reserve p_count screens atomically. Consume the monthly allotment first (up
-- to p_limit), then draw the remainder from credit_balance. Returns the number
-- of screens drawn from the MONTHLY allotment on success (>= 0); returns NULL
-- when monthly + credits cannot cover p_count (no changes made).
create or replace function closehound.reserve_screens(
  p_user uuid, p_period text, p_limit int, p_count int
) returns int
language plpgsql security definer set search_path = closehound, pg_temp as $$
declare
  v_used        int;
  v_avail_month int;
  v_from_month  int;
  v_from_credit int;
  v_credits     int;
begin
  if p_count <= 0 then
    return 0;
  end if;

  insert into closehound.usage (user_id, period_month, screens_used)
    values (p_user, p_period, 0)
    on conflict (user_id, period_month) do nothing;

  -- Lock this period's usage row for the txn (serializes concurrent reserves).
  select screens_used into v_used
    from closehound.usage
    where user_id = p_user and period_month = p_period
    for update;

  v_avail_month := greatest(0, p_limit - v_used);
  v_from_month  := least(p_count, v_avail_month);
  v_from_credit := p_count - v_from_month;

  if v_from_credit > 0 then
    select coalesce(credit_balance, 0) into v_credits
      from closehound.profiles
      where user_id = p_user
      for update;
    if v_credits is null or v_credits < v_from_credit then
      return null; -- insufficient monthly + credits; nothing reserved
    end if;
    update closehound.profiles
      set credit_balance = credit_balance - v_from_credit, updated_at = now()
      where user_id = p_user;
  end if;

  if v_from_month > 0 then
    update closehound.usage
      set screens_used = screens_used + v_from_month
      where user_id = p_user and period_month = p_period;
  end if;

  return v_from_month;
end; $$;

-- Refund p_count screens: reduce this period's monthly usage first, then credit
-- any remainder back to the non-expiring balance (best-effort, fails toward the user).
create or replace function closehound.refund_screens(
  p_user uuid, p_period text, p_count int
) returns void
language plpgsql security definer set search_path = closehound, pg_temp as $$
declare
  v_used   int;
  v_reduce int;
  v_rest   int;
begin
  if p_count <= 0 then
    return;
  end if;
  select screens_used into v_used
    from closehound.usage
    where user_id = p_user and period_month = p_period
    for update;
  if v_used is null then
    update closehound.profiles
      set credit_balance = credit_balance + p_count, updated_at = now()
      where user_id = p_user;
    return;
  end if;
  v_reduce := least(p_count, v_used);
  v_rest   := p_count - v_reduce;
  update closehound.usage
    set screens_used = screens_used - v_reduce
    where user_id = p_user and period_month = p_period;
  if v_rest > 0 then
    update closehound.profiles
      set credit_balance = credit_balance + v_rest, updated_at = now()
      where user_id = p_user;
  end if;
end; $$;

-- Grant credits to a user (Stripe one-time pack purchase). The webhook ensures
-- the profile row exists and handles event idempotency.
create or replace function closehound.grant_credits(
  p_user uuid, p_count int
) returns int
language plpgsql security definer set search_path = closehound, pg_temp as $$
declare v_bal int;
begin
  update closehound.profiles
    set credit_balance = credit_balance + greatest(0, p_count), updated_at = now()
    where user_id = p_user
    returning credit_balance into v_bal;
  return v_bal;
end; $$;

revoke all on function closehound.reserve_screens(uuid, text, int, int) from public;
revoke all on function closehound.refund_screens(uuid, text, int) from public;
revoke all on function closehound.grant_credits(uuid, int) from public;
grant execute on function closehound.reserve_screens(uuid, text, int, int) to service_role;
grant execute on function closehound.refund_screens(uuid, text, int) to service_role;
grant execute on function closehound.grant_credits(uuid, int) to service_role;
