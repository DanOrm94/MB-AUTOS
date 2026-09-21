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

## Workshop-aware booking API

The booking system is a separate Cloudflare Worker backed by D1. The public site remains a static Astro/Pages site.

### Architecture

- Astro + Tailwind: marketing pages and booking UI
- Cloudflare Worker: `/api/*` vehicle lookup, service catalogue, availability and bookings
- DVLA Vehicle Enquiry Service: registration lookup
- Cloudflare D1: customers, vehicles, services, resources, opening hours and bookings
- Resource blocks: 30-minute locks prevent two bookings from taking the same bay/technician block
- Turnstile: required on booking requests

The Worker route is configured for `mbautos.co.uk/api/*`. Keep the Pages deployment configured with build command `npm run build`, output `dist`, and **no deploy command**.

### Create D1

After installing dependencies:

```bash
npx wrangler d1 create mb-autos
```

Put the returned database ID into `wrangler.api.jsonc` in place of `REPLACE_WITH_D1_DATABASE_ID`.

Apply the schema:

```bash
npx wrangler d1 migrations apply mb-autos --remote --config wrangler.api.jsonc
```

For local work:

```bash
npx wrangler d1 migrations apply mb-autos --local --config wrangler.api.jsonc
```

The default service durations and resource setup are intentionally editable in D1. Confirm them with the workshop before opening online booking. Saturday is not automatically bookable because the business only states “by appointment”.

### Worker secrets

Set these on the Worker:

- `DVLA_API_KEY` — DVLA Vehicle Enquiry Service key
- `TURNSTILE_SECRET_KEY` — Turnstile secret
- `ALLOWED_ORIGIN` — normally `https://mbautos.co.uk`

The browser only receives the public Turnstile site key as `PUBLIC_TURNSTILE_SITE_KEY`.

### GitHub Actions

Add repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Changes to `worker/**`, `migrations/**` or `wrangler.api.jsonc` deploy the API through `.github/workflows/deploy-api.yml`.

### Booking model

Availability is calculated from:

1. business opening hours
2. service duration
3. active workshop bays
4. active technicians
5. existing pending/confirmed bookings
6. 30-minute resource blocks

This means a 60-minute MOT and a four-hour bodywork job do not consume the same amount of workshop capacity. Resource counts and service durations can be changed in D1 without changing the frontend.
