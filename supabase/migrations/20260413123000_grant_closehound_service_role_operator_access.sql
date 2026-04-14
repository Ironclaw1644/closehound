grant usage on schema closehound to service_role;

grant select, insert, update, delete
on all tables in schema closehound
to service_role;

grant usage, select
on all sequences in schema closehound
to service_role;

alter default privileges in schema closehound
grant select, insert, update, delete on tables to service_role;

alter default privileges in schema closehound
grant usage, select on sequences to service_role;
