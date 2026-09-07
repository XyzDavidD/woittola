-- Optional product documents displayed only when an administrator uploads them.

begin;

alter table public.products
  add column if not exists cleaning_guide_url text,
  add column if not exists compliance_certifications_url text;

notify pgrst, 'reload schema';

commit;
