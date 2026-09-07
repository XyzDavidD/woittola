-- Optional translated list of equipment supplied as standard with a product.

begin;

alter table public.product_translations
  add column if not exists standard_equipment text[] not null default '{}';

notify pgrst, 'reload schema';

commit;
