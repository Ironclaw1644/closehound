alter table closehound.leads
drop constraint if exists leads_industry_v1_check;

alter table closehound.leads
add constraint leads_industry_v1_check
check (
  industry is null
  or industry in (
    'handyman',
    'pressure washing',
    'roofing',
    'HVAC',
    'plumbing',
    'junk removal',
    'mobile detailing'
  )
);

insert into closehound.leads (
  company_name,
  city,
  industry,
  rating,
  has_website,
  status,
  preview_url,
  contact_email,
  phone
)
select
  seed.company_name,
  seed.city,
  seed.industry,
  seed.rating,
  seed.has_website,
  seed.status,
  seed.preview_url,
  seed.contact_email,
  seed.phone
from (
  values
    (
      'Patch & Pine Handyman',
      'St. Petersburg, FL',
      'handyman',
      4.9,
      false,
      'new',
      null,
      'jobs@patchandpine-demo.com',
      '(727) 555-0184'
    ),
    (
      'Harbor Mist Pressure Washing',
      'Tampa, FL',
      'pressure washing',
      4.7,
      true,
      'new',
      null,
      'hello@harbormist-demo.com',
      '(813) 555-0142'
    ),
    (
      'Summit Line Roofing Co.',
      'Charlotte, NC',
      'roofing',
      4.4,
      true,
      'generated',
      null,
      'office@summitline-demo.com',
      '(704) 555-0118'
    ),
    (
      'Blue Current HVAC',
      'Mesa, AZ',
      'HVAC',
      4.8,
      true,
      'emailed',
      null,
      null,
      '(480) 555-0176'
    ),
    (
      'Main Street Plumbing Pros',
      'Columbus, OH',
      'plumbing',
      4.3,
      false,
      'called',
      null,
      null,
      '(614) 555-0135'
    ),
    (
      'ClearLot Junk Removal',
      'Nashville, TN',
      'junk removal',
      4.6,
      true,
      'closed',
      null,
      'bookings@clearlot-demo.com',
      '(615) 555-0191'
    ),
    (
      'Gloss Boss Mobile Detailing',
      'Scottsdale, AZ',
      'mobile detailing',
      4.8,
      true,
      'new',
      null,
      'shine@glossboss-demo.com',
      '(602) 555-0127'
    )
) as seed (
  company_name,
  city,
  industry,
  rating,
  has_website,
  status,
  preview_url,
  contact_email,
  phone
)
where not exists (
  select 1
  from closehound.leads existing
  where existing.company_name = seed.company_name
    and existing.city = seed.city
);
