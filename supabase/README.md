# Supabase catalogue and translation setup

1. Open **Supabase Dashboard → SQL Editor → New query**.
2. Paste and run `migrations/202608110001_catalogue.sql`.
3. Open `setup-admin.sql`, replace the placeholder with the UUID from `SUPABASE_ADMIN_USER_ID`, and run it.
4. Refresh `/dashboard`.

The migration creates translation-ready categories and products, Row Level Security, the admin allowlist, and the public `catalogue-media` Storage bucket.

If the original migration was already run and the app reports that catalogue
setup is required, run `repair-api-permissions.sql` once. It exposes the tables
to the Supabase API while Row Level Security continues to restrict writes to the
approved catalogue administrator.

## Adding products

Open `/dashboard`, choose **Products → Add new product**, and provide the English
title and description plus at least one image. Category is selected from the
database-backed category list. Brand, product type, applications, features,
colors, specifications, accessories, PDFs, and video are optional. Optional
fields left empty are not rendered on the public product page.

Product images and documents are uploaded to the public `catalogue-media`
bucket. The authenticated `catalogue-translate` Edge Function saves English,
uses Gemini to create validated Finnish JSON, and records its status. A failed
translation preserves English and causes the Finnish public page to fall back
to English until an administrator retries it.

## Deploy automatic translation

`GEMINI_API_KEY` must be an Edge Function secret, never a browser environment
variable. Because the original catalogue migration was run manually in SQL
Editor, mark that version as applied before pushing the new migration:

```bash
npx supabase login
npx supabase link --project-ref mbzhczgqxtixiymxfwjp
npx supabase migration repair 202608110001 --status applied --linked
npx supabase db push --dry-run
npx supabase db push
npx supabase functions deploy catalogue-translate --project-ref mbzhczgqxtixiymxfwjp --no-verify-jwt
```

The dry run should show only
`202608120001_automatic_finnish_translations.sql`. Despite the deployment flag,
the function is not publicly usable: it validates the bearer token with
Supabase Auth, checks `catalogue_admins`, and performs database operations
through the verified user's RLS-protected session.
