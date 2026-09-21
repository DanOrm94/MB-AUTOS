# MB Autos

Astro + Tailwind static marketing site for MB Autos, Mossley.

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Build locally with `npm run build`, then preview with `npm run preview`.

## Cloudflare Pages

Recommended Pages settings:

- Framework preset: Astro
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: 20+

Because this is a static Astro build, ordinary pushes to `main` can deploy automatically and pull requests can use Pages preview deployments.

## Form environment variables

Set these in Cloudflare Pages / Functions environment variables:

- `RESEND_API_KEY` — Resend API key
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile server secret
- `FORM_RECIPIENT` — mailbox that should receive enquiries
- `PUBLIC_TURNSTILE_SITE_KEY` — Turnstile site key exposed to the form

The form endpoint is `/api/contact`.

## Production domain

The single source of truth for canonical URLs is `SITE` in `src/config/site.ts`. Replace its value with the exact deployed production domain before launch. The current placeholder is `https://mbautos.co.uk`.

## Content editing guide

Most owner-facing content lives in `src/config/site.ts` and `src/data/reviews.json`.

### Prices
Set the MOT price in `src/config/site.ts` by changing `motPriceDisplay` and the simple MOT price rows. Do not publish a made-up price.

### Reviews
Replace the placeholder review object in `src/data/reviews.json` with real Google reviews only. Keep the Google reviews link in the config.

### Images
Put real garage/team/work photos in `src/assets` using the clearly named placeholder filenames already present. Astro's image pipeline handles responsive formats.

### Opening hours
Edit the opening-hours data in `src/config/site.ts`; the footer, contact page and LocalBusiness schema read from the same source.

## Security

`public/_headers` contains baseline security headers, including CSP, HSTS, X-Content-Type-Options and Referrer-Policy. Review the CSP if adding third-party embeds/scripts.

Before launch, add the final production domain to Cloudflare Pages and ensure `SITE` exactly matches it.
