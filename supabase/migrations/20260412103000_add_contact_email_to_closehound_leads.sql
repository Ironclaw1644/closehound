alter table closehound.leads
add column if not exists contact_email text;

create index if not exists leads_contact_email_idx
on closehound.leads (contact_email)
where contact_email is not null;
