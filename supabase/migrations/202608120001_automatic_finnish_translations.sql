-- Automatic Finnish translation state and authenticated English-save RPCs.
-- Safe to run once after 202608110001_catalogue.sql.

begin;

alter table public.categories
  add column if not exists translation_status text not null default 'ready',
  add column if not exists translation_error text,
  add column if not exists translated_at timestamptz,
  add column if not exists translation_source_updated_at timestamptz;

alter table public.products
  add column if not exists translation_status text not null default 'ready',
  add column if not exists translation_error text,
  add column if not exists translated_at timestamptz,
  add column if not exists translation_source_updated_at timestamptz;

do $$
begin
  alter table public.categories
    add constraint categories_translation_status_check
    check (translation_status in ('processing', 'ready', 'failed'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.products
    add constraint products_translation_status_check
    check (translation_status in ('processing', 'ready', 'failed'));
exception when duplicate_object then null;
end $$;

create index if not exists categories_translation_status_idx
  on public.categories(translation_status);

create index if not exists products_translation_status_idx
  on public.products(translation_status);

create or replace function public.save_category_english(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_name text;
  v_hero_title text;
  v_hero_description text;
  v_meta_title text;
  v_meta_description text;
begin
  if auth.uid() is null or not public.is_catalogue_admin() then
    raise exception 'Not authorized to manage the catalogue' using errcode = '42501';
  end if;

  v_id := nullif(p_payload->>'id', '')::uuid;
  v_name := btrim(coalesce(p_payload->>'name', ''));
  v_hero_title := btrim(coalesce(p_payload->>'heroTitle', ''));
  v_hero_description := btrim(coalesce(p_payload->>'heroDescription', ''));
  v_meta_title := btrim(coalesce(p_payload->>'metaTitle', ''));
  v_meta_description := btrim(coalesce(p_payload->>'metaDescription', ''));

  if v_id is null or v_name = '' or v_hero_title = '' or v_hero_description = '' then
    raise exception 'Category id, name, hero title and hero description are required';
  end if;

  if v_meta_title = '' then
    v_meta_title := v_name || ' | Woittola Healthcare';
  end if;
  if v_meta_description = '' then
    v_meta_description := v_hero_description;
  end if;

  update public.categories
  set
    hero_image_url = coalesce(nullif(p_payload->>'heroImageUrl', ''), hero_image_url),
    is_published = coalesce((p_payload->>'isPublished')::boolean, is_published),
    translation_status = 'processing',
    translation_error = null,
    translation_source_updated_at = now()
  where id = v_id;

  if not found then
    raise exception 'Category not found';
  end if;

  insert into public.category_translations (
    category_id,
    locale,
    name,
    hero_title,
    hero_description,
    meta_title,
    meta_description
  ) values (
    v_id,
    'en',
    v_name,
    v_hero_title,
    v_hero_description,
    v_meta_title,
    v_meta_description
  )
  on conflict (category_id, locale) do update set
    name = excluded.name,
    hero_title = excluded.hero_title,
    hero_description = excluded.hero_description,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description;

  return v_id;
end;
$$;

create or replace function public.save_product_english(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_category_id uuid;
  v_slug text;
  v_name text;
  v_description text;
  v_status text;
  v_primary_image_url text;
  v_applications text[];
  v_gallery_urls text[];
begin
  if auth.uid() is null or not public.is_catalogue_admin() then
    raise exception 'Not authorized to manage the catalogue' using errcode = '42501';
  end if;

  v_id := nullif(p_payload->>'id', '')::uuid;
  v_category_id := nullif(p_payload->>'categoryId', '')::uuid;
  v_slug := btrim(coalesce(p_payload->>'slug', ''));
  v_name := btrim(coalesce(p_payload->>'name', ''));
  v_description := btrim(coalesce(p_payload->>'description', ''));
  v_status := lower(btrim(coalesce(p_payload->>'status', 'draft')));
  v_primary_image_url := nullif(btrim(coalesce(p_payload->>'primaryImageUrl', '')), '');
  v_applications := array(
    select jsonb_array_elements_text(coalesce(p_payload->'applications', '[]'::jsonb))
  );
  v_gallery_urls := array(
    select jsonb_array_elements_text(coalesce(p_payload->'galleryUrls', '[]'::jsonb))
  );

  if v_category_id is null or v_slug = '' or v_name = '' or v_description = '' or v_primary_image_url is null then
    raise exception 'Category, slug, English title, English description and one product image are required';
  end if;
  if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Product slug is invalid';
  end if;
  if v_status not in ('draft', 'published') then
    raise exception 'Product status is invalid';
  end if;
  if not exists (select 1 from public.categories where id = v_category_id) then
    raise exception 'Category not found';
  end if;

  if v_id is null then
    insert into public.products (
      category_id,
      slug,
      brand,
      product_type,
      applications,
      status,
      primary_image_url,
      gallery_urls,
      brochure_url,
      technical_sheet_url,
      video_url,
      translation_status,
      translation_error,
      translation_source_updated_at
    ) values (
      v_category_id,
      v_slug,
      btrim(coalesce(p_payload->>'brand', '')),
      btrim(coalesce(p_payload->>'productType', '')),
      v_applications,
      v_status,
      v_primary_image_url,
      v_gallery_urls,
      nullif(btrim(coalesce(p_payload->>'brochureUrl', '')), ''),
      nullif(btrim(coalesce(p_payload->>'technicalSheetUrl', '')), ''),
      nullif(btrim(coalesce(p_payload->>'videoUrl', '')), ''),
      'processing',
      null,
      now()
    ) returning id into v_id;
  else
    update public.products
    set
      category_id = v_category_id,
      slug = v_slug,
      brand = btrim(coalesce(p_payload->>'brand', '')),
      product_type = btrim(coalesce(p_payload->>'productType', '')),
      applications = v_applications,
      status = v_status,
      primary_image_url = v_primary_image_url,
      gallery_urls = v_gallery_urls,
      brochure_url = nullif(btrim(coalesce(p_payload->>'brochureUrl', '')), ''),
      technical_sheet_url = nullif(btrim(coalesce(p_payload->>'technicalSheetUrl', '')), ''),
      video_url = nullif(btrim(coalesce(p_payload->>'videoUrl', '')), ''),
      translation_status = 'processing',
      translation_error = null,
      translation_source_updated_at = now()
    where id = v_id;

    if not found then
      raise exception 'Product not found';
    end if;
  end if;

  insert into public.product_translations (
    product_id,
    locale,
    name,
    description,
    product_type_label,
    application_labels,
    typical_applications,
    key_features,
    reasons,
    colors,
    specifications,
    accessories
  ) values (
    v_id,
    'en',
    v_name,
    v_description,
    btrim(coalesce(p_payload->>'productTypeLabel', p_payload->>'productType', '')),
    v_applications,
    array(select jsonb_array_elements_text(coalesce(p_payload->'typicalApplications', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_payload->'keyFeatures', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_payload->'reasons', '[]'::jsonb))),
    coalesce(p_payload->'colors', '[]'::jsonb),
    coalesce(p_payload->'specifications', '[]'::jsonb),
    array(select jsonb_array_elements_text(coalesce(p_payload->'accessories', '[]'::jsonb)))
  )
  on conflict (product_id, locale) do update set
    name = excluded.name,
    description = excluded.description,
    product_type_label = excluded.product_type_label,
    application_labels = excluded.application_labels,
    typical_applications = excluded.typical_applications,
    key_features = excluded.key_features,
    reasons = excluded.reasons,
    colors = excluded.colors,
    specifications = excluded.specifications,
    accessories = excluded.accessories;

  return v_id;
end;
$$;

revoke all on function public.save_category_english(jsonb) from public;
revoke all on function public.save_product_english(jsonb) from public;
grant execute on function public.save_category_english(jsonb) to authenticated;
grant execute on function public.save_product_english(jsonb) to authenticated;

notify pgrst, 'reload schema';

commit;
