begin;

-- Project types are editor-authored natural language, not a fixed taxonomy.
alter table public.reference_projects
  drop constraint if exists reference_projects_project_type_check;

alter table public.reference_project_translations
  add column if not exists project_type_label text not null default '';

update public.reference_project_translations as translation
set project_type_label = case
  when translation.locale = 'fi' then case project.project_type
    when 'hospital' then 'Sairaala'
    when 'health-centre' then 'Terveyskeskus'
    when 'care-facility' then 'Hoitolaitos'
    when 'private-clinic' then 'Yksityinen klinikka'
    when 'other' then 'Referenssiprojekti'
    else project.project_type
  end
  else case project.project_type
    when 'hospital' then 'Hospital'
    when 'health-centre' then 'Health centre'
    when 'care-facility' then 'Care facility'
    when 'private-clinic' then 'Private clinic'
    when 'other' then 'Reference project'
    else project.project_type
  end
end
from public.reference_projects as project
where project.id = translation.project_id
  and translation.project_type_label = '';

update public.reference_projects
set project_type = case project_type
  when 'hospital' then 'Hospital'
  when 'health-centre' then 'Health centre'
  when 'care-facility' then 'Care facility'
  when 'private-clinic' then 'Private clinic'
  when 'other' then 'Reference project'
  else project_type
end;

-- Remove any legacy gallery blocks. The reference editor now supports only
-- editorial text sections and single-image text sections.
update public.reference_project_translations
set content_blocks = coalesce((
  select jsonb_agg(block order by position)
  from jsonb_array_elements(content_blocks) with ordinality as rows(block, position)
  where block->>'type' in ('text', 'image-text')
), '[]'::jsonb);

create or replace function public.save_reference_project_english(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_slug text;
  v_base_slug text;
  v_suffix integer := 2;
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
  v_project_type := btrim(coalesce(p_payload->>'projectType', ''));
  v_cover_image_url := nullif(btrim(coalesce(p_payload->>'coverImageUrl', '')), '');
  v_gallery_urls := array(select jsonb_array_elements_text(coalesce(p_payload->'galleryUrls', '[]'::jsonb)));
  v_content_blocks := coalesce(p_payload->'contentBlocks', '[]'::jsonb);

  if v_title = '' or v_summary = '' or v_cover_image_url is null then
    raise exception 'English title, English summary and one cover image are required';
  end if;
  if v_status not in ('draft', 'published') then raise exception 'Project status is invalid'; end if;
  if jsonb_typeof(v_content_blocks) <> 'array' then raise exception 'Project content blocks must be an array'; end if;
  if exists (
    select 1
    from jsonb_array_elements(v_content_blocks) as block
    where block->>'type' not in ('text', 'image-text')
  ) then
    raise exception 'Only text and image-with-text project sections are supported';
  end if;

  -- Preserve a published URL on edits. New projects receive a readable,
  -- collision-safe URL generated from their English title.
  if v_id is not null and v_slug = '' then
    select slug into v_slug from public.reference_projects where id = v_id;
  end if;
  if v_slug = '' then
    v_base_slug := trim(both '-' from regexp_replace(lower(v_title), '[^a-z0-9]+', '-', 'g'));
    if v_base_slug = '' then v_base_slug := 'reference-project'; end if;
    v_slug := v_base_slug;
    while exists (
      select 1 from public.reference_projects
      where slug = v_slug and (v_id is null or id <> v_id)
    ) loop
      v_slug := v_base_slug || '-' || v_suffix;
      v_suffix := v_suffix + 1;
    end loop;
  end if;

  if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'Project slug is invalid'; end if;

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
    project_id, locale, title, summary, project_type_label, location, unit,
    meta_title, meta_description, content_blocks
  ) values (
    v_id, 'en', v_title, v_summary, v_project_type,
    btrim(coalesce(p_payload->>'location', '')),
    btrim(coalesce(p_payload->>'unit', '')),
    coalesce(nullif(btrim(p_payload->>'metaTitle'), ''), v_title || ' | Woittola References'),
    coalesce(nullif(btrim(p_payload->>'metaDescription'), ''), v_summary),
    v_content_blocks
  )
  on conflict (project_id, locale) do update set
    title = excluded.title,
    summary = excluded.summary,
    project_type_label = excluded.project_type_label,
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

notify pgrst, 'reload schema';
commit;
