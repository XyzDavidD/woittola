-- Run this once if the catalogue migration was installed before API table
-- privileges were added. Row Level Security remains enabled and enforced.

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

grant execute on function public.is_catalogue_admin() to anon, authenticated;

notify pgrst, 'reload schema';
