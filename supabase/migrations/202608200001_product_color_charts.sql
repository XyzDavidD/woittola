-- Optional product color-chart document managed independently from the
-- brochure and technical data sheet.

begin;

alter table public.products
  add column if not exists color_chart_url text;

-- Product URLs are generated from titles. Similar model names such as
-- "Multiline Next AC" and "Multiline Next AC+" can normalize to the same
-- slug, so resolve collisions automatically instead of rejecting the save.
create or replace function public.ensure_unique_product_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_base text;
  v_candidate text;
  v_suffix integer := 2;
begin
  if tg_op = 'UPDATE' and new.slug = old.slug then
    return new;
  end if;

  v_base := new.slug;
  v_candidate := v_base;
  while exists (
    select 1
    from public.products
    where slug = v_candidate
      and id <> new.id
  ) loop
    v_candidate := v_base || '-' || v_suffix;
    v_suffix := v_suffix + 1;
  end loop;
  new.slug := v_candidate;
  return new;
end;
$$;

drop trigger if exists products_ensure_unique_slug on public.products;
create trigger products_ensure_unique_slug
before insert or update on public.products
for each row execute function public.ensure_unique_product_slug();

notify pgrst, 'reload schema';

commit;
