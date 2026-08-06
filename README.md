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
npm run build
npm run lint
```

## Deployment

Vercel uses the standard Next.js commands:

```bash
npm run build
npm run start
```

The optional Cloudflare/vinext workflow remains available through the
`dev:cloudflare`, `build:cloudflare`, and `start:cloudflare` scripts.
# woittola
