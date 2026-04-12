grant usage on schema closehound to anon, authenticated;

grant select on table closehound.leads to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'closehound'
      and tablename = 'leads'
      and policyname = 'closehound_leads_read_dashboard'
  ) then
    create policy "closehound_leads_read_dashboard"
    on closehound.leads
    for select
    to anon, authenticated
    using (true);
  end if;
end
$$;
