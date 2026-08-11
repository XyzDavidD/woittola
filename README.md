# Woittola storefront

The project is ready for the visual build with Next.js, React, TypeScript, and Tailwind CSS.

## Pages

- `/` — landing page
- `/catalogue` — product catalogue
- `/products/[slug]` — reusable dynamic product page

## Start locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Brand assets

- Logos: `public/logos/`
- Product and editorial imagery: `public/images/`
- Self-hosted fonts: `public/fonts/`

Files inside `public` are referenced from the site root. For example,
`public/logos/logo.svg` is used as `/logos/logo.svg`.

## Useful checks

```bash
npm run lint
npm run build
```

## Automatic Finnish catalogue translation

The product and category forms accept English content only. An authenticated
Supabase Edge Function verifies the signed-in user against `catalogue_admins`,
saves the English row through restricted RPCs, translates only natural-language
fields with `gemini-3.5-flash-lite`, validates the structured response, and
upserts Finnish content. Translation state is stored as `processing`, `ready`,
or `failed`; failed Finnish pages automatically use English.

The Gemini key exists only in the Edge Function runtime. Database operations use
the verified administrator JWT and remain subject to RLS; the browser never
receives the Gemini key or a service-role key. Do not add either key to
`.env.local` or any `NEXT_PUBLIC_*` variable.

### Apply and deploy

The `GEMINI_API_KEY` Edge Function secret must already exist in the Supabase
project. Authenticate the CLI once, then apply the migration and deploy:

```bash
npx supabase login
npx supabase link --project-ref mbzhczgqxtixiymxfwjp
npx supabase migration repair 202608110001 --status applied --linked
npx supabase db push --dry-run
npx supabase db push
npx supabase functions deploy catalogue-translate --project-ref mbzhczgqxtixiymxfwjp --no-verify-jwt
```

The migration repair command records the original catalogue migration as
applied because it was previously run through the Supabase SQL Editor. The dry
run should list only `202608120001_automatic_finnish_translations.sql` before
you run the real push.

`verify_jwt` is disabled at the gateway because the function performs explicit
JWT verification with `auth.getUser()` and then checks `is_catalogue_admin()`.
Unauthenticated and non-admin requests are rejected before the service-role
client or Gemini is used.

### End-to-end translation test

Create an ignored `.env.test.local` file containing the existing admin's login
credentials (never commit this file):

```dotenv
E2E_ADMIN_EMAIL=admin@example.com
E2E_ADMIN_PASSWORD=your-admin-password
```

Then run:

```bash
npm run test:translation-e2e
```

The test signs in as the catalogue admin, creates a temporary draft product,
waits for Gemini, verifies both language rows and protected values, and deletes
the temporary product in cleanup.

## Deployment

Vercel uses the standard Next.js commands:

```bash
npm run build
npm run start
```

The optional Cloudflare/vinext workflow remains available through the
`dev:cloudflare`, `build:cloudflare`, and `start:cloudflare` scripts.
# woittola
