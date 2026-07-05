# Draftpace

Draftpace is a Next.js App Router MVP for interactive planners, streaks, progress, and a mobile-first PWA dashboard.

## Stack

- Next.js 16
- React 19
- Tailwind CSS
- Supabase Auth and database
- Stripe Checkout and Billing Portal scaffolds
- Vercel deployment and cron
- PWA manifest and service worker

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Environment

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MEMBERSHIP_MONTHLY=
STRIPE_PRICE_MEMBERSHIP_YEARLY=

CRON_SECRET=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

Individual paid planner prices follow this naming pattern:

```env
STRIPE_PRICE_PLANNER_LIFE_AUDIT=
```

## PWA

The app manifest starts installed users at `/dashboard`. The service worker caches the dashboard shell, offline page, manifest, and logo assets. Planner entries save locally first so recently opened planners stay usable offline.

## Notifications

The current code includes:

- Browser notification permission flow in dashboard settings.
- Local test notifications after check-ins.
- Authenticated subscription API scaffold.
- Vercel Cron route scaffold at `/api/notifications/cron`.

Production Web Push still needs VAPID keys, a `push_subscriptions` table, and a server sender.

## Payments

Pricing calls `/api/checkout`, which verifies the Supabase access token before creating a Stripe Checkout Session. The webhook route is scaffolded but still needs signature verification and Supabase order/subscription writes before real access granting.
