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

## Category images

Open `/dashboard`, choose **Categories**, and edit a category. Each category has
two independent images: **Category page hero image** controls the wide banner on
the category page, while **Homepage category image** controls only its landing
page card. Apply migration `202608170001_category_homepage_images.sql` before
deploying the website version that exposes these separate fields. The optional
**Finnish category name** field preserves an approved manual term through later
saves and automatic-translation retries.

## Adding reference projects

Open `/dashboard`, choose **References → Add new project**, and enter the
English project information. The title, summary, and cover image are required;
project type, year, location, unit, and flexible page blocks are optional.
Project type is a free-text English field. Blocks can be reordered and composed
only as text or a single image with text, giving each project an editorial
layout without requiring a new page template.

Saving calls the same authenticated translation function as the catalogue. It
stores English first, translates the project metadata and block copy to Finnish,
and preserves dates, block types, and media URLs. A unique URL is generated
automatically from the English title when the project is first saved and stays
stable on later edits. The dashboard shows the translation status and offers a
retry action after a failure. Public Finnish pages fall back to English while a
translation is processing or failed.

## Adding partners

Open `/dashboard`, choose **Partners → Add new partner**, and enter the English
company title and introduction. A logo or representative image is optional and
can be added, replaced, or removed later. Saving writes English first and uses
the authenticated Edge Function to generate the Finnish title and description.
Partners can be edited or permanently deleted from the same dashboard section.
They can also be hidden without deletion and shown again later; new partners are
hidden by default until the administrator enables public visibility.
If Finnish translation fails, the public partners page displays the English
content until an administrator retries it.

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
npx supabase functions deploy catalogue-translate --project-ref mbzhczgqxtixiymxfwjp --no-verify-jwt --use-api
```

The dry run shows migrations that have not yet been applied, including
`202608130001_reference_projects.sql` on a catalogue-only database. Despite the deployment flag,
the function is not publicly usable: it validates the bearer token with
Supabase Auth, checks `catalogue_admins`, and performs database operations
through the verified user's RLS-protected session.
