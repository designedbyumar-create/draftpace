# Decisions

Founder-locked decisions this reset is built on. Not a copy of the original
blueprint — just the calls that shape the code.

## Product model

- Draftpace is an **extensible digital product platform**, not a Companion
  platform, finance app, planner platform, or dashboard. Companions are one
  product family among several (Learning, Automation, Tool/Workspace, Guided
  Program, Tracker), with more to come.
- The shared platform (identity, ownership, cloud state, notifications,
  responsive shell, versioning, operations) must work for any future family
  without modification. Anything that only makes sense for one family belongs
  in that family's package/module, not the shell.

## Structure

- **Stay one Next.js application.** No monorepo (`apps/*`, `packages/*`) yet.
  Internal boundaries (`src/product-framework/`, `src/design-system/`) are
  organized so a later extraction is mechanical, not a rewrite.
- **No family switch statements anywhere.** `ProductFamilyId` and
  `ProductCapabilityId` are open, validated, namespaced strings, resolved
  through registries and composition. See `PRODUCT-FRAMEWORK.md`.

## What was removed vs. kept

- The old finance-specific "Money Momentum" implementation, the "Systems"/
  "planners" catalog and its runtime, the old `/dashboard` route tree, the
  old `/store` and `/library` catalog pages, the old checkout implementation,
  and the disconnected old marketing implementation (homepage sections,
  Navbar/Footer, `/about`, `/support`, `/pricing`, `/features`) were deleted.
  Full inventory: `MIGRATION-PLAN.md`.
- The production waitlist page, the waitlist API and its migration,
  authentication, legal pages, PWA infrastructure, the theme mechanism, and
  the Phosphor icon wrapper were preserved (the last three relocated and
  generalized, not rewritten).
- Nothing was preserved because of sunk effort. Each preserved piece is
  domain-neutral and still has a real caller after the reset.

## Theme modes

- Global platform theme modes are exactly **`system | light | dark`**. The
  previous `light | calm | calm-dark` three-way model is gone at the platform
  level. A "calm" visual personality may return later as a **product-level**
  theme extension (see `PRODUCT-FRAMEWORK.md`'s theme-extension contract),
  never as a global mode again.

## Dependencies

- Approved for Phase 1: `vitest`, `@testing-library/react`,
  `@testing-library/jest-dom`, `zod`.
- Approved for Phase 2: `@supabase/ssr`, added specifically to make real
  server-side session protection possible (see "Phase 2" above).
- `stripe` and `web-push` remain not installed — the deleted checkout route
  used raw `fetch` against Stripe's REST API, not the SDK, and commerce is
  being rebuilt later against real entitlements, not patched.

## Database

- No Supabase migrations were added in Phase 1. Development fixtures are
  local/in-memory only, precisely so that proving the product framework
  doesn't require any schema decisions yet. See `DATA-BOUNDARIES.md`.

## Discovered during Phase 1 verification

- The pre-reset `middleware.ts` (root-level "coming soon" allowlist) was
  **never actually being compiled or enforced** in any production build —
  this repository uses a `src/` directory, and Next.js only loads middleware
  from `src/middleware.ts` in that configuration, not the project root.
  Confirmed via an empty `.next/server/middleware-manifest.json` on both the
  pre-reset and Phase 1 builds, and a live production-server test showing
  every path returning 200 instead of redirecting. Fixed by moving it to
  `src/proxy.ts` (also renamed per Next.js 16.2.6's `middleware` →`proxy`
  convention change) and re-verified live: waitlist mode now genuinely gates
  the site. See `MIGRATION-PLAN.md` for the full account.
- `terms/page.tsx` and `privacy/page.tsx` were assumed to be generic legal
  boilerplate and preserved as instructed, but actually contain specific
  claims about the abandoned planner-marketplace product (pricing, Gumroad/
  Etsy, catalog size). **Resolved in Phase 2** — see "Legal content" below.

## Phase 2 — the coming-soon layer is gone

- The waitlist page, the launch-mode (`waitlist`/`beta`/`full`) gate, and
  `NEXT_PUBLIC_LAUNCH_MODE` are all removed. `/` is now the real public
  homepage in every environment, dev and production alike. The
  `launch_subscribers` migration stays in migration history as a historical
  artifact — no destructive migration was run.
- `/app` and `/admin` access control no longer depends on launch mode at
  all. `/app/**` requires a real Supabase session, verified server-side in
  `src/proxy.ts` via `@supabase/ssr` before any protected content is sent —
  not the Phase 1 client-side-only `AuthGate`, which is deleted.
  `/admin/**` keeps its independent `isAdminEnabled()` gate, now forced to
  re-evaluate per request (`export const dynamic = "force-dynamic"` — see
  `ADMIN-AND-OPERATIONS.md` for why that was necessary).
- `@supabase/ssr` was added as an approved dependency specifically to make
  this real (justified per the Phase 2 brief) — `src/lib/supabase/client.ts`
  and `server.ts` replace the old single browser-only client.

## Legal content

- `terms/page.tsx` and `privacy/page.tsx` were rewritten to remove every
  claim tied to the abandoned planner-marketplace direction (Gumroad/Etsy,
  specific pricing, "200+ planners") and to stop promising features that
  don't exist yet (data export, in-product account deletion) — those are
  now described honestly as request-by-email until they ship. Both pages
  carry a visible "not yet reviewed by counsel" notice rather than implying
  a legal review that hasn't happened.

## Universal product destinations

- The six canonical product destinations are **start, setup, workspace,
  progress, history, settings** — not "home". The canonical live-work route
  is `/app/products/[productSlug]/workspace`. A product may relabel
  "Workspace" per family (e.g. "Learn", "Automate", "Continue", "Build",
  "Track") without changing the route segment.

## Deferred out of Phase 2 (unchanged)

- Real product content of any kind — Companion, Learning, Automation,
  Tracker, or Workspace products are still not built. Only the four
  internal fixtures exist.
- Commerce rebuild against real entitlements, real notification sending,
  admin role model beyond "signed in or not", analytics, Product Studio,
  and everything else listed as not-built in `ADMIN-AND-OPERATIONS.md` and
  `ROUTE-MAP.md`.
