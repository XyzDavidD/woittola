-- Woittola catalogue: translation-ready categories, products, filters and media.
-- Run this file once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.catalogue_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_catalogue_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.catalogue_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_catalogue_admin() from public;
grant execute on function public.is_catalogue_admin() to anon, authenticated;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  hero_image_url text not null default '/images/hero-products.png',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.category_translations (
  category_id uuid not null references public.categories(id) on delete cascade,
  locale text not null check (locale in ('en', 'fi')),
  name text not null,
  hero_title text not null,
  hero_description text not null default '',
  meta_title text not null default '',
  meta_description text not null default '',
  primary key (category_id, locale)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  brand text not null default '',
  product_type text not null default '',
  applications text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  primary_image_url text,
  gallery_urls text[] not null default '{}',
  brochure_url text,
  technical_sheet_url text,
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_translations (
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null check (locale in ('en', 'fi')),
  name text not null,
  description text not null default '',
  product_type_label text not null default '',
  application_labels text[] not null default '{}',
  typical_applications text[] not null default '{}',
  key_features text[] not null default '{}',
  reasons text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  accessories text[] not null default '{}',
  primary key (product_id, locale)
);

-- Tables created through the SQL editor are not automatically exposed to the
-- Supabase API. Grant the API roles table privileges; Row Level Security below
-- still decides which rows each role may read or change.
grant usage on schema public to anon, authenticated;
grant select on table
  public.categories,
  public.category_translations,
  public.products,
  public.product_translations
to anon, authenticated;
grant insert, update, delete on table
  public.categories,
  public.category_translations,
  public.products,
  public.product_translations
to authenticated;

create index if not exists categories_sort_order_idx on public.categories(sort_order, slug);
create index if not exists products_category_idx on public.products(category_id, status, sort_order);
create index if not exists products_brand_idx on public.products(brand);
create index if not exists products_product_type_idx on public.products(product_type);
create index if not exists products_applications_idx on public.products using gin(applications);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.catalogue_admins enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;

drop policy if exists "Published categories are public" on public.categories;
drop policy if exists "Published category translations are public" on public.category_translations;
drop policy if exists "Published products are public" on public.products;
drop policy if exists "Published product translations are public" on public.product_translations;
drop policy if exists "Catalogue admins manage categories" on public.categories;
drop policy if exists "Catalogue admins manage category translations" on public.category_translations;
drop policy if exists "Catalogue admins manage products" on public.products;
drop policy if exists "Catalogue admins manage product translations" on public.product_translations;

create policy "Published categories are public"
on public.categories for select
to anon, authenticated
using (is_published or public.is_catalogue_admin());

create policy "Published category translations are public"
on public.category_translations for select
to anon, authenticated
using (
  exists (
    select 1 from public.categories
    where categories.id = category_translations.category_id
      and (categories.is_published or public.is_catalogue_admin())
  )
);

create policy "Published products are public"
on public.products for select
to anon, authenticated
using (
  (status = 'published' and exists (
    select 1 from public.categories
    where categories.id = products.category_id
      and categories.is_published
  ))
  or public.is_catalogue_admin()
);

create policy "Published product translations are public"
on public.product_translations for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    join public.categories on categories.id = products.category_id
    where products.id = product_translations.product_id
      and ((products.status = 'published' and categories.is_published) or public.is_catalogue_admin())
  )
);

create policy "Catalogue admins manage categories"
on public.categories for all
to authenticated
using (public.is_catalogue_admin())
with check (public.is_catalogue_admin());

create policy "Catalogue admins manage category translations"
on public.category_translations for all
to authenticated
using (public.is_catalogue_admin())
with check (public.is_catalogue_admin());

create policy "Catalogue admins manage products"
on public.products for all
to authenticated
using (public.is_catalogue_admin())
with check (public.is_catalogue_admin());

create policy "Catalogue admins manage product translations"
on public.product_translations for all
to authenticated
using (public.is_catalogue_admin())
with check (public.is_catalogue_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalogue-media',
  'catalogue-media',
  true,
  262144000,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Catalogue media is public" on storage.objects;
drop policy if exists "Catalogue admins upload media" on storage.objects;
drop policy if exists "Catalogue admins update media" on storage.objects;
drop policy if exists "Catalogue admins delete media" on storage.objects;

create policy "Catalogue media is public"
on storage.objects for select
to public
using (bucket_id = 'catalogue-media');

create policy "Catalogue admins upload media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'catalogue-media' and public.is_catalogue_admin());

create policy "Catalogue admins update media"
on storage.objects for update
to authenticated
using (bucket_id = 'catalogue-media' and public.is_catalogue_admin())
with check (bucket_id = 'catalogue-media' and public.is_catalogue_admin());

create policy "Catalogue admins delete media"
on storage.objects for delete
to authenticated
using (bucket_id = 'catalogue-media' and public.is_catalogue_admin());

insert into public.categories (slug, hero_image_url, sort_order, is_published)
values
  ('patient-chairs', '/images/hero-products.png', 10, true),
  ('treatment-chairs', '/images/hero-products.png', 20, true),
  ('gynecology', '/images/hero-products.png', 30, true),
  ('patient-stretchers', '/images/hero-products.png', 40, true),
  ('medical-carts', '/images/hero-products.png', 50, true),
  ('medical-tables', '/images/hero-products.png', 60, true),
  ('work-stools', '/images/hero-products.png', 70, true),
  ('face-protection', '/images/hero-products.png', 80, true)
on conflict (slug) do update set
  sort_order = excluded.sort_order;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'en', 'Patient Chairs', 'Patient Chairs',
  'Supportive patient seating designed for wards, rehabilitation environments and long-term care. Comfortable, durable and easy to use throughout the care journey.',
  'Patient Chairs | Woittola Healthcare',
  'Supportive patient chairs for wards, rehabilitation, geriatric care and patient rooms.'
from public.categories where slug = 'patient-chairs'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'fi', 'Potilastuolit', 'Potilastuolit',
  'Tukevat potilastuolit osastoille, kuntoutukseen ja pitkäaikaishoitoon. Mukavat, kestävät ja helppokäyttöiset ratkaisut koko hoitopolun ajaksi.',
  'Potilastuolit | Woittola Healthcare',
  'Tukevat potilastuolit osastoille, kuntoutukseen, vanhustenhoitoon ja potilashuoneisiin.'
from public.categories where slug = 'patient-chairs'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'en', 'Treatment Chairs', 'Treatment Chairs',
  'Ergonomic treatment chairs for dialysis, infusion therapy, chemotherapy and outpatient procedures. Designed to improve patient comfort and support efficient clinical work.',
  'Treatment Chairs | Woittola Healthcare',
  'Ergonomic treatment chairs for dialysis, infusion, chemotherapy and outpatient care.'
from public.categories where slug = 'treatment-chairs'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'fi', 'Hoitotuolit', 'Hoitotuolit',
  'Ergonomiset hoitotuolit dialyysiin, infuusiohoitoon, kemoterapiaan ja polikliinisiin toimenpiteisiin. Suunniteltu potilasmukavuuteen ja sujuvaan kliiniseen työhön.',
  'Hoitotuolit | Woittola Healthcare',
  'Ergonomiset hoitotuolit dialyysiin, infuusiohoitoon, kemoterapiaan ja polikliiniseen hoitoon.'
from public.categories where slug = 'treatment-chairs'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'en', 'Gynecology', 'Gynecology',
  'Specialist examination and procedure chairs developed for women’s healthcare. Thoughtful positioning, accessibility and hygiene support confident everyday care.',
  'Gynecology Equipment | Woittola Healthcare',
  'Specialist gynecology examination and procedure chairs for professional women’s healthcare.'
from public.categories where slug = 'gynecology'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'fi', 'Gynekologia', 'Gynekologia',
  'Naisten terveydenhuoltoon kehitetyt tutkimus- ja toimenpidetuolit. Huolellinen asettelu, esteettömyys ja hygienia tukevat varmaa päivittäistä hoitotyötä.',
  'Gynekologiset tuotteet | Woittola Healthcare',
  'Gynekologiset tutkimus- ja toimenpidetuolit naisten terveydenhuollon ammattilaisille.'
from public.categories where slug = 'gynecology'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'en', 'Patient Stretchers', 'Patient Stretchers',
  'Reliable stretchers for transport, examination, emergency care and imaging. Smooth mobility and dependable adjustment help teams move patients safely.',
  'Patient Stretchers | Woittola Healthcare',
  'Hydraulic and electric patient stretchers for transport, examination, emergency care and imaging.'
from public.categories where slug = 'patient-stretchers'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'fi', 'Potilaspaarit', 'Potilaspaarit',
  'Luotettavat paarit kuljetukseen, tutkimuksiin, päivystykseen ja kuvantamiseen. Sujuva liikuteltavuus ja varmat säädöt tukevat turvallista potilassiirtoa.',
  'Potilaspaarit | Woittola Healthcare',
  'Hydrauliset ja sähköiset potilaspaarit kuljetukseen, tutkimuksiin, päivystykseen ja kuvantamiseen.'
from public.categories where slug = 'patient-stretchers'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'en', 'Medical Carts', 'Medical Carts',
  'Configurable medical carts for emergency, anaesthesia, dressing and everyday clinical work. Organised storage keeps essential equipment ready and within reach.',
  'Medical Carts | Woittola Healthcare',
  'Configurable medical carts for emergency, anaesthesia, dressing and everyday clinical work.'
from public.categories where slug = 'medical-carts'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'fi', 'Hoitovaunut', 'Hoitovaunut',
  'Muunneltavat hoitovaunut päivystykseen, anestesiaan, sidontaan ja päivittäiseen kliiniseen työhön. Järjestelmällinen säilytys pitää välineet valmiina ja helposti saatavilla.',
  'Hoitovaunut | Woittola Healthcare',
  'Muunneltavat hoitovaunut päivystykseen, anestesiaan, sidontaan ja päivittäiseen kliiniseen työhön.'
from public.categories where slug = 'medical-carts'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'en', 'Medical Tables', 'Medical Tables',
  'Professional tables for examination, ultrasound, rehabilitation and radiology. Stable construction and precise adjustment support clinicians across demanding procedures.',
  'Medical Tables | Woittola Healthcare',
  'Professional examination, ultrasound, tilt and radiology tables for clinical environments.'
from public.categories where slug = 'medical-tables'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'fi', 'Tutkimuspöydät', 'Tutkimuspöydät',
  'Ammattikäyttöön suunnitellut pöydät tutkimuksiin, ultraääneen, kuntoutukseen ja radiologiaan. Vakaa rakenne ja tarkat säädöt tukevat vaativia toimenpiteitä.',
  'Tutkimuspöydät | Woittola Healthcare',
  'Ammattikäyttöön tarkoitetut tutkimus-, ultraääni-, kallistus- ja radiologiapöydät.'
from public.categories where slug = 'medical-tables'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'en', 'Work Stools', 'Work Stools',
  'Ergonomic, height-adjustable stools for clinicians, laboratories and treatment rooms. Compact mobility and balanced support help professionals work comfortably.',
  'Medical Work Stools | Woittola Healthcare',
  'Ergonomic height-adjustable work stools for clinicians and healthcare professionals.'
from public.categories where slug = 'work-stools'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'fi', 'Työtuolit', 'Työtuolit',
  'Ergonomiset ja korkeussäädettävät työtuolit vastaanotoille, laboratorioihin ja hoitohuoneisiin. Hyvä liikkuvuus ja tasapainoinen tuki lisäävät työskentelymukavuutta.',
  'Terveydenhuollon työtuolit | Woittola Healthcare',
  'Ergonomiset korkeussäädettävät työtuolit kliiniseen työhön ja terveydenhuollon ammattilaisille.'
from public.categories where slug = 'work-stools'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'en', 'Face Protection', 'Face Protection',
  'Clear face shields and protective accessories for everyday clinical environments. Lightweight protection supports visibility, comfort and confident patient interaction.',
  'Face Protection | Woittola Healthcare',
  'Clear face shields, protective films and accessories for clinical environments.'
from public.categories where slug = 'face-protection'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.category_translations
  (category_id, locale, name, hero_title, hero_description, meta_title, meta_description)
select id, 'fi', 'Kasvosuojaimet', 'Kasvosuojaimet',
  'Kirkkaat kasvosuojaimet ja suojaustarvikkeet kliiniseen arkeen. Kevyt suojaus tukee näkyvyyttä, käyttömukavuutta ja luontevaa potilaskohtaamista.',
  'Kasvosuojaimet | Woittola Healthcare',
  'Kirkkaat kasvosuojaimet, suojakalvot ja tarvikkeet kliinisiin ympäristöihin.'
from public.categories where slug = 'face-protection'
on conflict (category_id, locale) do update set name = excluded.name, hero_title = excluded.hero_title, hero_description = excluded.hero_description, meta_title = excluded.meta_title, meta_description = excluded.meta_description;
