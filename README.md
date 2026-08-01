# Draftpace

Draftpace is an extensible platform for personalized digital products,
built with the Next.js App Router.

## Stack

- Next.js 16, React 19, Tailwind CSS
- Supabase Auth (via `@supabase/ssr`) and Postgres
- Framer Motion for the small set of public-site interactions that need it
- PWA manifest and service worker

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Visit `/signup` to create an account (requires
a working Supabase project — see below), then `/app`.

## Required environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Verify the configured project is actually reachable:

```bash
npm run check:supabase
```

If sign-in isn't working, start with **`docs/SUPABASE-SETUP.md`** — exact
steps for resuming a paused project, creating a replacement, and configuring
Google OAuth.

Optional, for local admin preview and development fixtures:

```env
DRAFTPACE_ADMIN_PREVIEW=true
NEXT_PUBLIC_DEV_FIXTURES=true
```

Neither is required for local development — both default to enabled when
`NODE_ENV !== "production"`. See `docs/DECISIONS.md`.

## Documentation

`CLAUDE.md` is the entry point for how this repository is organized.
`docs/` contains the platform, product-framework, design-system, route-map,
and decisions records.

## Quality gates

```bash
npx tsc --noEmit
npx eslint .
npm run test
npm run build
```
