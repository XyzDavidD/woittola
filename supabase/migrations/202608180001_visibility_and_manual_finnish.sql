-- Reversible partner visibility and persistent manual Finnish category names.

begin;

alter table public.partners
  add column if not exists is_published boolean not null default true;

alter table public.categories
  add column if not exists finnish_name_override text;

-- OTOPRONT remains available to the administrator but is hidden publicly until approved.
update public.partners
set is_published = false
where code = 'otopront';

-- Correct the English commercial name while preserving the approved Finnish term.
update public.category_translations
set
  name = 'Work Chairs',
  hero_title = case when hero_title = 'Work Stools' then 'Work Chairs' else hero_title end,
  meta_title = replace(meta_title, 'Work Stools', 'Work Chairs')
where locale = 'en'
  and category_id = (select id from public.categories where slug = 'work-stools');

update public.categories
set finnish_name_override = 'Työjakkarat'
where slug = 'work-stools';

drop policy if exists "Partners are public" on public.partners;
drop policy if exists "Published partners are public" on public.partners;
create policy "Published partners are public"
on public.partners for select
to anon, authenticated
using (is_published or public.is_catalogue_admin());

drop policy if exists "Partner translations are public" on public.partner_translations;
drop policy if exists "Published partner translations are public" on public.partner_translations;
create policy "Published partner translations are public"
on public.partner_translations for select
to anon, authenticated
using (
  exists (
    select 1 from public.partners
    where partners.id = partner_translations.partner_id
      and (partners.is_published or public.is_catalogue_admin())
  )
);

create or replace function public.save_partner_english(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_code text;
  v_base_code text;
  v_suffix integer := 2;
  v_title text;
  v_description text;
  v_image_url text;
  v_sort_order integer;
  v_is_published boolean;
begin
  if auth.uid() is null or not public.is_catalogue_admin() then
    raise exception 'Not authorized to manage partners' using errcode = '42501';
  end if;

  v_id := nullif(p_payload->>'id', '')::uuid;
  v_title := btrim(coalesce(p_payload->>'title', ''));
  v_description := btrim(coalesce(p_payload->>'description', ''));
  v_image_url := btrim(coalesce(p_payload->>'imageUrl', ''));
  v_is_published := coalesce((p_payload->>'isPublished')::boolean, true);

  if v_title = '' or v_description = '' then
    raise exception 'English partner title and description are required';
  end if;

  if v_id is null then
    v_base_code := trim(both '-' from regexp_replace(lower(v_title), '[^a-z0-9]+', '-', 'g'));
    if v_base_code = '' then v_base_code := 'partner'; end if;
    v_code := v_base_code;
    while exists (select 1 from public.partners where code = v_code) loop
      v_code := v_base_code || '-' || v_suffix;
      v_suffix := v_suffix + 1;
    end loop;
    select coalesce(max(sort_order), 0) + 10 into v_sort_order from public.partners;

    insert into public.partners (
      code, image_url, sort_order, is_published, translation_status, translation_error, translation_source_updated_at
    ) values (
      v_code, v_image_url, v_sort_order, v_is_published, 'processing', null, now()
    ) returning id into v_id;
  else
    update public.partners set
      image_url = v_image_url,
      is_published = v_is_published,
      translation_status = 'processing',
      translation_error = null,
      translation_source_updated_at = now()
    where id = v_id;
    if not found then raise exception 'Partner not found'; end if;
  end if;

  insert into public.partner_translations (partner_id, locale, title, description)
  values (v_id, 'en', v_title, v_description)
  on conflict (partner_id, locale) do update set
    title = excluded.title,
    description = excluded.description;

  return v_id;
end;
$$;

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

  if v_meta_title = '' then v_meta_title := v_name || ' | Woittola Healthcare'; end if;
  if v_meta_description = '' then v_meta_description := v_hero_description; end if;

  update public.categories
  set
    hero_image_url = coalesce(nullif(p_payload->>'heroImageUrl', ''), hero_image_url),
    homepage_image_url = coalesce(nullif(p_payload->>'homepageImageUrl', ''), homepage_image_url),
    finnish_name_override = nullif(btrim(coalesce(p_payload->>'finnishNameOverride', '')), ''),
    is_published = coalesce((p_payload->>'isPublished')::boolean, is_published),
    translation_status = 'processing',
    translation_error = null,
    translation_source_updated_at = now()
  where id = v_id;

  if not found then raise exception 'Category not found'; end if;

  insert into public.category_translations (
    category_id, locale, name, hero_title, hero_description, meta_title, meta_description
  ) values (
    v_id, 'en', v_name, v_hero_title, v_hero_description, v_meta_title, v_meta_description
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

revoke all on function public.save_partner_english(jsonb) from public;
revoke all on function public.save_category_english(jsonb) from public;
grant execute on function public.save_partner_english(jsonb) to authenticated;
grant execute on function public.save_category_english(jsonb) to authenticated;

notify pgrst, 'reload schema';
commit;
