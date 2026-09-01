# Supabase Setup

## Current status (verified this pass)

Running `node scripts/check-supabase-connection.mjs` against the project
configured in `.env.local` returns:

```
FAIL  DNS lookup failed — this hostname does not resolve.
```

The configured `NEXT_PUBLIC_SUPABASE_URL` format is valid (it matches the
standard `https://<project-ref>.supabase.co` pattern), but that specific
hostname does not exist on the internet right now. That means the project
behind it is deleted, paused long enough to be reclaimed, or the URL was
copied incorrectly at some point. **This cannot be fixed in code** — it
requires action in the Supabase dashboard. The app now fails gracefully
around this (see `docs/DECISIONS.md`) instead of redirecting anyone into a
dead domain, but sign-in will not work until a real project is connected.

## Step 1 — Find out what happened to the project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in
   with the account that created the Draftpace project.
2. Look for a project matching the name you used for Draftpace.
   - **If it's listed and shows "Paused":** click it, then click **Resume
     project**. Free-tier projects pause automatically after a week of
     inactivity. Resuming keeps the same URL and keys — once it's back, skip
     to Step 4 and just re-verify the values already in `.env.local` are
     correct.
   - **If it's listed and active:** the URL in `.env.local` was probably
     mistyped. Go to **Project Settings → API** and copy the real values —
     skip to Step 3.
   - **If it's not listed at all:** the project was deleted. Continue to
     Step 2.

## Step 2 — Create a replacement project (only if deleted)

1. In the Supabase dashboard, click **New project**.
2. Choose an organization, name it (e.g. `draftpace`), set a database
   password (save it somewhere safe — it's separate from the anon key you'll
   use in the app), and pick a region close to your users.
3. Wait for provisioning to finish (a minute or two).

A new project means a new database — the `launch_subscribers` table from the
old project will not exist. That table isn't used by the live app anymore
(`docs/DECISIONS.md`), so this doesn't block sign-in, but note it if you ever
need that historical waitlist data.

## Step 3 — Copy the Project URL and anon key

1. In the project, go to **Project Settings → API**.
2. Copy the **Project URL** (`https://<ref>.supabase.co`).
3. Copy the **anon / public** key (labelled "publishable" in newer dashboard
   versions, starts with `sb_publishable_...` or, on older projects, a long
   `eyJ...` JWT). **Do not copy the `service_role` key** — that one must
   never appear in `NEXT_PUBLIC_*` variables or anywhere client-visible.

## Step 4 — Set the Site URL and redirect URLs

Still in the dashboard, go to **Authentication → URL Configuration**:

1. **Site URL** — set this to your local dev URL while developing
   (`http://localhost:3000`), and to your real production domain once
   deployed (e.g. `https://www.draftpace.com`). Supabase only supports one
   Site URL at a time; see the note below for running both.
2. **Redirect URLs** — add every URL Draftpace will redirect back to after
   auth. At minimum:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/reset-password`
   - `https://<your-production-domain>/auth/callback`
   - `https://<your-production-domain>/reset-password`

   Supabase supports multiple redirect URLs even though it only has one Site
   URL — add both local and production entries so you can test locally
   without breaking production.

## Step 5 — Enable Google sign-in

1. In the [Google Cloud Console](https://console.cloud.google.com/), create
   (or reuse) a project, then go to **APIs & Services → Credentials**.
2. Create an **OAuth 2.0 Client ID** (type: Web application).
3. Under **Authorized redirect URIs**, add the callback URI Supabase gives
   you for this provider — in the Supabase dashboard, go to
   **Authentication → Providers → Google** and copy the **Callback URL**
   shown there (it looks like
   `https://<project-ref>.supabase.co/auth/v1/callback`). Paste that exact
   URL into Google Cloud's redirect URI field.
4. Copy the **Client ID** and **Client Secret** Google gives you.
5. Back in Supabase, on the same **Authentication → Providers → Google**
   screen, toggle the provider on and paste in the Client ID and Client
   Secret. Save.

## Step 6 — Update environment variables

**Local (`.env.local`, not committed to git):**

```env
NEXT_PUBLIC_SUPABASE_URL=<your Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon/publishable key>
```

**Production (your hosting provider's environment variable settings — e.g.
Vercel → Project → Settings → Environment Variables):** set the same two
variables for the Production environment. If you use a separate
staging/preview Supabase project, set different values for Preview
environments there too.

After changing `.env.local`, **restart the dev server** (`npm run dev`) —
Next.js only reads environment variables at process start.

## Step 7 — Verify

```bash
node scripts/check-supabase-connection.mjs
```

Expect `PASS  Project responded ...`. Then run the app and actually create an
account at `/signup` and sign in at `/login` — the connection check confirms
the project is reachable, but only a real sign-up confirms auth end-to-end
(email confirmation is currently disabled in `supabase/config.toml`, so a new
account should be usable immediately without a confirmation email).

## What the app does if this isn't done

`src/lib/supabase/config.ts` validates the environment variables are present,
well-formed, and not still the placeholder value (it cannot detect a
deleted/paused project — only a real network call can, which is what the
script above does). If validation fails:

- **Local development** — login, signup, forgot-password, reset-password,
  and the OAuth callback all show the specific reason (e.g. "missing
  NEXT_PUBLIC_SUPABASE_URL") instead of attempting the request.
- **Production** — the same pages show a generic "Account sign-in is
  temporarily unavailable" message. No hostname, key, or infrastructure
  detail is ever shown to an end user.

Either way, the app never silently redirects someone to a dead domain.
