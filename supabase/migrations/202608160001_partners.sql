-- Editable manufacturing partners with English source content and Finnish translations.

begin;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  image_url text not null default '',
  sort_order integer not null default 0,
  translation_status text not null default 'processing' check (translation_status in ('processing', 'ready', 'failed')),
  translation_error text,
  translated_at timestamptz,
  translation_source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_translations (
  partner_id uuid not null references public.partners(id) on delete cascade,
  locale text not null check (locale in ('en', 'fi')),
  title text not null,
  description text not null,
  primary key (partner_id, locale)
);

create index if not exists partners_sort_order_idx on public.partners(sort_order);
create index if not exists partners_translation_status_idx on public.partners(translation_status);

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at
before update on public.partners
for each row execute function public.set_updated_at();

grant select on table public.partners, public.partner_translations to anon, authenticated;
grant insert, update, delete on table public.partners, public.partner_translations to authenticated;

alter table public.partners enable row level security;
alter table public.partner_translations enable row level security;

drop policy if exists "Partners are public" on public.partners;
drop policy if exists "Partner translations are public" on public.partner_translations;
drop policy if exists "Catalogue admins manage partners" on public.partners;
drop policy if exists "Catalogue admins manage partner translations" on public.partner_translations;

create policy "Partners are public"
on public.partners for select
to anon, authenticated
using (true);

create policy "Partner translations are public"
on public.partner_translations for select
to anon, authenticated
using (true);

create policy "Catalogue admins manage partners"
on public.partners for all
to authenticated
using (public.is_catalogue_admin())
with check (public.is_catalogue_admin());

create policy "Catalogue admins manage partner translations"
on public.partner_translations for all
to authenticated
using (public.is_catalogue_admin())
with check (public.is_catalogue_admin());

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
begin
  if auth.uid() is null or not public.is_catalogue_admin() then
    raise exception 'Not authorized to manage partners' using errcode = '42501';
  end if;

  v_id := nullif(p_payload->>'id', '')::uuid;
  v_title := btrim(coalesce(p_payload->>'title', ''));
  v_description := btrim(coalesce(p_payload->>'description', ''));
  v_image_url := btrim(coalesce(p_payload->>'imageUrl', ''));

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
      code, image_url, sort_order, translation_status, translation_error, translation_source_updated_at
    ) values (
      v_code, v_image_url, v_sort_order, 'processing', null, now()
    ) returning id into v_id;
  else
    update public.partners set
      image_url = v_image_url,
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

revoke all on function public.save_partner_english(jsonb) from public;
grant execute on function public.save_partner_english(jsonb) to authenticated;

insert into public.partners (code, sort_order, translation_status, translated_at, translation_source_updated_at)
values
  ('greiner', 10, 'ready', now(), now()),
  ('promotal', 20, 'ready', now(), now()),
  ('novak-m', 30, 'ready', now(), now()),
  ('la-pastilla', 40, 'ready', now(), now()),
  ('aga', 50, 'ready', now(), now()),
  ('famed', 60, 'ready', now(), now()),
  ('meguard', 70, 'ready', now(), now()),
  ('otopront', 80, 'ready', now(), now())
on conflict (code) do nothing;

insert into public.partner_translations (partner_id, locale, title, description)
select partner.id, source.locale, source.title, source.description
from public.partners as partner
join (values
  ('greiner', 'en', 'GREINER', 'Greiner is a family-run German company with more than 100 years of experience. It is one of the leading producers of specialised seating and chairs for demanding applications in the medical sector.'),
  ('greiner', 'fi', 'GREINER', 'Greiner on yli 100-vuotias saksalainen perheyritys. Se kuuluu lääkinnällisen alan vaativiin käyttökohteisiin suunniteltujen erikoisistuimien ja -tuolien johtaviin valmistajiin.'),
  ('promotal', 'en', 'PROMOTAL', 'Promotal develops professional medical furniture for examination, treatment and care environments, with a focus on practical ergonomics, patient accessibility and efficient clinical work.'),
  ('promotal', 'fi', 'PROMOTAL', 'Promotal kehittää ammattikäyttöön tarkoitettuja lääkinnällisiä kalusteita tutkimus-, hoito- ja hoivaympäristöihin. Ratkaisuissa painottuvat ergonomia, esteettömyys ja sujuva kliininen työ.'),
  ('novak-m', 'en', 'NOVAK-M', 'NOVAK M develops medical equipment for patient examination, treatment and transport. Its solutions are designed to support dependable everyday workflows across healthcare facilities.'),
  ('novak-m', 'fi', 'NOVAK-M', 'NOVAK M kehittää potilaiden tutkimukseen, hoitoon ja kuljetukseen tarkoitettuja lääkinnällisiä laitteita, jotka tukevat terveydenhuollon luotettavia päivittäisiä työnkulkuja.'),
  ('la-pastilla', 'en', 'LA PASTILLA', 'La Pastilla creates mobile furniture and organised storage solutions for healthcare professionals, helping essential equipment remain accessible wherever clinical teams need it.'),
  ('la-pastilla', 'fi', 'LA PASTILLA', 'La Pastilla suunnittelee terveydenhuollon ammattilaisille liikuteltavia kalusteita ja järjestelmällisiä säilytysratkaisuja, joiden avulla tärkeät välineet ovat helposti saatavilla.'),
  ('aga', 'en', 'AGA', 'AGA provides a broad range of examination, treatment and specialist medical furniture designed for professional healthcare environments and varied clinical applications.'),
  ('aga', 'fi', 'AGA', 'AGA tarjoaa laajan valikoiman tutkimus-, hoito- ja erikoiskalusteita ammattimaisiin terveydenhuollon ympäristöihin ja erilaisiin kliinisiin käyttötarkoituksiin.'),
  ('famed', 'en', 'FAMED', 'Famed develops hospital equipment and medical furniture for patient care, treatment and maternity environments, combining practical functionality with the needs of clinical teams.'),
  ('famed', 'fi', 'FAMED', 'Famed kehittää sairaalalaitteita ja lääkinnällisiä kalusteita potilashoitoon, toimenpiteisiin ja äitiyshuoltoon yhdistäen käytännölliset toiminnot kliinisten tiimien tarpeisiin.'),
  ('meguard', 'en', 'MeGUARD', 'MeGUARD focuses on face and personal protection solutions for clinical environments, with products designed to support clear visibility, hygiene and comfortable daily use.'),
  ('meguard', 'fi', 'MeGUARD', 'MeGUARD keskittyy kliinisten ympäristöjen kasvo- ja henkilösuojausratkaisuihin, joissa huomioidaan hyvä näkyvyys, hygienia ja miellyttävä päivittäinen käyttö.'),
  ('otopront', 'en', 'OTOPRONT', 'OTOPRONT specialises in ENT treatment units, examination chairs and supporting equipment that bring essential tools together for focused ear, nose and throat care.'),
  ('otopront', 'fi', 'OTOPRONT', 'OTOPRONT on erikoistunut KNK-hoitoyksiköihin, tutkimustuoleihin ja niitä täydentäviin laitteisiin, jotka kokoavat keskeiset työkalut sujuvaa korva-, nenä- ja kurkkutautien hoitoa varten.')
) as source(code, locale, title, description) on source.code = partner.code
on conflict (partner_id, locale) do nothing;

notify pgrst, 'reload schema';
commit;
