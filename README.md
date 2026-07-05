# Draftpace

Draftpace is a Next.js app for planning, tracking progress, and building momentum around drafts and learning goals.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your Supabase values to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment

The repository is connected to GitHub at:

```text
https://github.com/designedbyumar-create/draftpace.git
```

For Vercel, use:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

Add the Supabase environment variables in the Vercel project settings before deploying.

More deployment details are in `DEPLOYMENT.md`.

## Checks

```bash
npm run lint
npm run build
```
