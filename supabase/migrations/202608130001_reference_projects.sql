-- Editable reference projects with English source content and Finnish translations.
-- Apply after the catalogue and automatic-translation migrations.

begin;

create table if not exists public.reference_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  project_type text not null default 'other' check (project_type in ('hospital', 'health-centre', 'care-facility', 'private-clinic', 'other')),
  completed_year integer check (completed_year is null or completed_year between 1900 and 2200),
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  cover_image_url text not null,
  gallery_urls text[] not null default '{}',
  translation_status text not null default 'processing' check (translation_status in ('processing', 'ready', 'failed')),
  translation_error text,
  translated_at timestamptz,
  translation_source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reference_project_translations (
  project_id uuid not null references public.reference_projects(id) on delete cascade,
  locale text not null check (locale in ('en', 'fi')),
  title text not null,
  summary text not null default '',
  location text not null default '',
  unit text not null default '',
  meta_title text not null default '',
  meta_description text not null default '',
  content_blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(content_blocks) = 'array'),
  primary key (project_id, locale)
);

create index if not exists reference_projects_public_idx on public.reference_projects(status, sort_order);
create index if not exists reference_projects_translation_status_idx on public.reference_projects(translation_status);

drop trigger if exists reference_projects_set_updated_at on public.reference_projects;
create trigger reference_projects_set_updated_at
before update on public.reference_projects
for each row execute function public.set_updated_at();

grant select on table public.reference_projects, public.reference_project_translations to anon, authenticated;
grant insert, update, delete on table public.reference_projects, public.reference_project_translations to authenticated;

alter table public.reference_projects enable row level security;
alter table public.reference_project_translations enable row level security;

drop policy if exists "Published reference projects are public" on public.reference_projects;
drop policy if exists "Published reference translations are public" on public.reference_project_translations;
drop policy if exists "Catalogue admins manage reference projects" on public.reference_projects;
drop policy if exists "Catalogue admins manage reference translations" on public.reference_project_translations;

create policy "Published reference projects are public"
on public.reference_projects for select
to anon, authenticated
using (status = 'published' or public.is_catalogue_admin());

create policy "Published reference translations are public"
on public.reference_project_translations for select
to anon, authenticated
using (
  exists (
    select 1 from public.reference_projects
    where reference_projects.id = reference_project_translations.project_id
      and (reference_projects.status = 'published' or public.is_catalogue_admin())
  )
);

create policy "Catalogue admins manage reference projects"
on public.reference_projects for all
to authenticated
using (public.is_catalogue_admin())
with check (public.is_catalogue_admin());

create policy "Catalogue admins manage reference translations"
on public.reference_project_translations for all
to authenticated
using (public.is_catalogue_admin())
with check (public.is_catalogue_admin());

create or replace function public.save_reference_project_english(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_slug text;
  v_title text;
  v_summary text;
  v_status text;
  v_project_type text;
  v_cover_image_url text;
  v_gallery_urls text[];
  v_content_blocks jsonb;
begin
  if auth.uid() is null or not public.is_catalogue_admin() then
    raise exception 'Not authorized to manage reference projects' using errcode = '42501';
  end if;

  v_id := nullif(p_payload->>'id', '')::uuid;
  v_slug := btrim(coalesce(p_payload->>'slug', ''));
  v_title := btrim(coalesce(p_payload->>'title', ''));
  v_summary := btrim(coalesce(p_payload->>'summary', ''));
  v_status := lower(btrim(coalesce(p_payload->>'status', 'draft')));
  v_project_type := lower(btrim(coalesce(p_payload->>'projectType', 'other')));
  v_cover_image_url := nullif(btrim(coalesce(p_payload->>'coverImageUrl', '')), '');
  v_gallery_urls := array(select jsonb_array_elements_text(coalesce(p_payload->'galleryUrls', '[]'::jsonb)));
  v_content_blocks := coalesce(p_payload->'contentBlocks', '[]'::jsonb);

  if v_slug = '' or v_title = '' or v_summary = '' or v_cover_image_url is null then
    raise exception 'Slug, English title, English summary and one cover image are required';
  end if;
  if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'Project slug is invalid'; end if;
  if v_status not in ('draft', 'published') then raise exception 'Project status is invalid'; end if;
  if v_project_type not in ('hospital', 'health-centre', 'care-facility', 'private-clinic', 'other') then raise exception 'Project type is invalid'; end if;
  if jsonb_typeof(v_content_blocks) <> 'array' then raise exception 'Project content blocks must be an array'; end if;

  if v_id is null then
    insert into public.reference_projects (
      slug, project_type, completed_year, status, sort_order, cover_image_url, gallery_urls,
      translation_status, translation_error, translation_source_updated_at
    ) values (
      v_slug, v_project_type, nullif(p_payload->>'completedYear', '')::integer, v_status,
      coalesce(nullif(p_payload->>'sortOrder', '')::integer, 0), v_cover_image_url, v_gallery_urls,
      'processing', null, now()
    ) returning id into v_id;
  else
    update public.reference_projects set
      slug = v_slug,
      project_type = v_project_type,
      completed_year = nullif(p_payload->>'completedYear', '')::integer,
      status = v_status,
      sort_order = coalesce(nullif(p_payload->>'sortOrder', '')::integer, sort_order),
      cover_image_url = v_cover_image_url,
      gallery_urls = v_gallery_urls,
      translation_status = 'processing',
      translation_error = null,
      translation_source_updated_at = now()
    where id = v_id;
    if not found then raise exception 'Reference project not found'; end if;
  end if;

  insert into public.reference_project_translations (
    project_id, locale, title, summary, location, unit, meta_title, meta_description, content_blocks
  ) values (
    v_id, 'en', v_title, v_summary,
    btrim(coalesce(p_payload->>'location', '')),
    btrim(coalesce(p_payload->>'unit', '')),
    coalesce(nullif(btrim(p_payload->>'metaTitle'), ''), v_title || ' | Woittola References'),
    coalesce(nullif(btrim(p_payload->>'metaDescription'), ''), v_summary),
    v_content_blocks
  )
  on conflict (project_id, locale) do update set
    title = excluded.title,
    summary = excluded.summary,
    location = excluded.location,
    unit = excluded.unit,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    content_blocks = excluded.content_blocks;

  return v_id;
end;
$$;

revoke all on function public.save_reference_project_english(jsonb) from public;
grant execute on function public.save_reference_project_english(jsonb) to authenticated;

insert into public.reference_projects (slug, project_type, completed_year, status, sort_order, cover_image_url, gallery_urls, translation_status, translated_at)
values
  ('central-hospital-care-environments', 'hospital', 2025, 'published', 10, '/images/hero-products.png', array['/images/chair1.png','/images/chair2.png','/images/medical-table-generated.png'], 'ready', now()),
  ('modern-dialysis-centre', 'health-centre', 2024, 'published', 20, '/images/hero.png', array['/images/chair2.png','/images/chair1.png','/images/work-stool.jpg'], 'ready', now()),
  ('welcoming-care-home-interiors', 'care-facility', 2024, 'published', 30, '/images/medical-table-generated.png', array['/images/medical-table-generated.png','/images/work-stool.jpg'], 'ready', now()),
  ('womens-health-clinic', 'private-clinic', 2023, 'published', 40, '/images/chair3.png', array['/images/chair3.png','/images/work-stool.jpg'], 'ready', now()),
  ('emergency-unit-renewal', 'hospital', 2023, 'published', 50, '/images/hero-products.png', array['/images/hero-products.png','/images/medical-table-generated.png'], 'ready', now()),
  ('patient-friendly-dental-centre', 'private-clinic', 2022, 'published', 60, '/images/work-stool.jpg', array['/images/work-stool.jpg','/images/chair1.png'], 'ready', now())
on conflict (slug) do nothing;

insert into public.reference_project_translations (project_id, locale, title, summary, location, unit, meta_title, meta_description, content_blocks)
select p.id, values_row.locale, values_row.title, values_row.summary, values_row.location, values_row.unit,
  values_row.title || case when values_row.locale = 'fi' then ' | Woittolan referenssit' else ' | Woittola References' end,
  values_row.summary,
  jsonb_build_array(jsonb_build_object(
    'id', 'solution', 'type', 'text', 'heading', values_row.heading, 'body', values_row.body,
    'imageUrls', '[]'::jsonb, 'imageAlt', '', 'caption', '', 'imagePosition', 'right'
  ))
from public.reference_projects p
join (values
  ('central-hospital-care-environments','en','Central Hospital Care Environments','A coordinated furniture solution supporting patient comfort, clinical workflows and durable everyday use across several care areas.','Hämeenlinna, Finland','Patient care areas','The solution','Carefully selected patient chairs, treatment furniture and supporting equipment created a coordinated solution for several clinical spaces.'),
  ('central-hospital-care-environments','fi','Keskussairaalan hoitoympäristöt','Yhtenäinen kalusteratkaisu, joka tukee potilasmukavuutta, kliinisiä työnkulkuja ja kestävää päivittäistä käyttöä useilla hoitoalueilla.','Hämeenlinna, Suomi','Potilashoidon tilat','Ratkaisu','Huolella valitut potilastuolit, hoitokalusteet ja täydentävät laitteet muodostivat yhtenäisen ratkaisun useisiin kliinisiin tiloihin.'),
  ('modern-dialysis-centre','en','Modern Dialysis Centre','Comfortable, adjustable treatment chairs selected for longer appointments and efficient clinical routines.','Tampere, Finland','Dialysis','Patient-centred treatment spaces','Supportive treatment seating and practical adjustment help make long appointments more comfortable and daily care more efficient.'),
  ('modern-dialysis-centre','fi','Moderni dialyysikeskus','Mukavat ja säädettävät hoitotuolit valittiin pitkiin hoitokäynteihin ja sujuviin kliinisiin työnkulkuihin.','Tampere, Suomi','Dialyysi','Potilaslähtöiset hoitotilat','Tukevat hoitoistuimet ja käytännölliset säädöt lisäävät pitkien hoitokäyntien mukavuutta ja tehostavat päivittäistä hoitoa.'),
  ('welcoming-care-home-interiors','en','Welcoming Care Home Interiors','Practical care furniture selected to create calm, accessible and durable shared spaces.','Espoo, Finland','Residential care','Comfort with everyday practicality','The selected furniture supports easy movement, comfortable routines and straightforward upkeep in shared care spaces.'),
  ('welcoming-care-home-interiors','fi','Viihtyisät hoivakodin sisätilat','Käytännölliset hoivakalusteet valittiin rauhallisiin, esteettömiin ja kestäviin yhteisiin tiloihin.','Espoo, Suomi','Ympärivuorokautinen hoiva','Mukavuutta ja käytännöllisyyttä arkeen','Valitut kalusteet tukevat helppoa liikkumista, miellyttäviä rutiineja ja vaivatonta ylläpitoa hoivan yhteisissä tiloissa.'),
  ('womens-health-clinic','en','Women’s Health Clinic','An examination-room solution combining approachable design, patient comfort and efficient working positions.','Helsinki, Finland','Gynaecology','A calm and functional examination room','An adjustable examination chair, coordinated seating and practical supporting furniture create a comfortable working environment.'),
  ('womens-health-clinic','fi','Naistenklinikan vastaanottotilat','Tutkimushuoneratkaisu yhdistää helposti lähestyttävän ilmeen, potilasmukavuuden ja tehokkaat työskentelyasennot.','Helsinki, Suomi','Gynekologia','Rauhallinen ja toimiva tutkimushuone','Säädettävä tutkimustuoli, yhteensopivat istuimet ja käytännölliset täydentävät kalusteet luovat miellyttävän työympäristön.'),
  ('emergency-unit-renewal','en','Emergency Unit Renewal','Mobile, durable equipment selected to support fast-moving care and dependable patient transport.','Turku, Finland','Emergency care','Ready for demanding workflows','Robust, mobile equipment helps staff adapt spaces quickly and move patients safely between care areas.'),
  ('emergency-unit-renewal','fi','Päivystysyksikön uudistus','Liikuteltavat ja kestävät laitteet valittiin tukemaan kiireistä hoitotyötä ja luotettavaa potilaskuljetusta.','Turku, Suomi','Päivystys','Valmiina vaativiin työnkulkuihin','Kestävät ja liikuteltavat laitteet auttavat henkilöstöä muokkaamaan tiloja nopeasti ja siirtämään potilaita turvallisesti.'),
  ('patient-friendly-dental-centre','en','Patient-Friendly Dental Centre','Ergonomic operator seating and supporting furniture chosen for clear, welcoming treatment rooms.','Helsinki, Finland','Dental care','Ergonomic working spaces','The furniture selection supports close clinical work while keeping each room calm, organised and easy to maintain.'),
  ('patient-friendly-dental-centre','fi','Potilasystävällinen hammashoitola','Ergonomiset työistuimet ja täydentävät kalusteet valittiin selkeisiin ja viihtyisiin hoitohuoneisiin.','Helsinki, Suomi','Hammashoito','Ergonomiset työskentelytilat','Kalustevalinnat tukevat tarkkaa kliinistä työtä ja pitävät tilan rauhallisena, järjestelmällisenä ja helppohoitoisena.')
) as values_row(slug,locale,title,summary,location,unit,heading,body) on values_row.slug = p.slug
on conflict (project_id, locale) do nothing;

notify pgrst, 'reload schema';
commit;
