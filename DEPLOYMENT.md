# Draftpace Deployment

## GitHub

This local repository is connected to:

```text
https://github.com/designedbyumar-create/draftpace.git
```

The local `main` branch tracks `origin/main`.

## Recommended Hosting

Deploy Draftpace as a Next.js app on Vercel.

Use these project settings:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
Node.js Version: 20.x or newer
```

## Environment Variables

Add these variables in the hosting provider before the first production deploy:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

The local `.env.local` file is intentionally ignored by Git. Use `.env.example` as the template.

## Pre-Deploy Checks

Run these locally before pushing deploy changes:

```bash
npm run lint
npm run build
```

The build script uses `next build --webpack` to avoid Turbopack CSS build issues in the current Next.js version.
