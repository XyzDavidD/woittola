-- Replace the UUID below with the same value used for SUPABASE_ADMIN_USER_ID.
-- Run this after the catalogue migration in Supabase Dashboard > SQL Editor.

insert into public.catalogue_admins (user_id)
values ('61fd3cf5-df79-4440-91dd-43d09e3c2d1c')
on conflict (user_id) do nothing;
