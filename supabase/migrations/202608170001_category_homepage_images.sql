-- Store the homepage category-card image independently from the category-page hero.

begin;

alter table public.categories
  add column if not exists homepage_image_url text;

update public.categories
set homepage_image_url = case slug
  when 'patient-chairs' then '/images/chair1.png'
  when 'treatment-chairs' then '/images/chair2.png'
  when 'gynecology' then '/images/chair3.png'
  when 'medical-tables' then '/images/medical-table-generated.png'
  when 'work-stools' then '/images/work-stool.jpg'
  when 'face-protection' then '/images/face-protection-generated.png'
  else homepage_image_url
end
where homepage_image_url is null;

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
    homepage_image_url = coalesce(nullif(p_payload->>'homepageImageUrl', ''), homepage_image_url),
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

revoke all on function public.save_category_english(jsonb) from public;
grant execute on function public.save_category_english(jsonb) to authenticated;

commit;
