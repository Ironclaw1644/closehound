-- Restore server-side API access for the At Home Family Services schema
-- without changing anon/authenticated exposure or touching unrelated schemas.

grant usage on schema athome_family_services_llc to service_role;

grant select, insert, update, delete
on all tables in schema athome_family_services_llc
to service_role;

grant usage, select
on all sequences in schema athome_family_services_llc
to service_role;

grant execute
on all routines in schema athome_family_services_llc
to service_role;

alter default privileges in schema athome_family_services_llc
grant select, insert, update, delete on tables to service_role;

alter default privileges in schema athome_family_services_llc
grant usage, select on sequences to service_role;

alter default privileges in schema athome_family_services_llc
grant execute on routines to service_role;
