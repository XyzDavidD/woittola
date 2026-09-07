-- Optional administrator-controlled Finnish product title and type.

begin;

alter table public.products
  add column if not exists finnish_name_override text,
  add column if not exists finnish_product_type_override text;

notify pgrst, 'reload schema';

commit;
