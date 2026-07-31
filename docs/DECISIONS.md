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
  `@testing-library/jest-dom`, `zod`. Nothing else was added.
- `stripe` and `web-push` remain not installed — the deleted checkout route
  used raw `fetch` against Stripe's REST API, not the SDK, and commerce is
  being rebuilt later against real entitlements, not patched.

## Database

- No Supabase migrations were added in Phase 1. Development fixtures are
  local/in-memory only, precisely so that proving the product framework
  doesn't require any schema decisions yet. See `DATA-BOUNDARIES.md`.

## Launch behavior

- Production defaults to **waitlist mode** with no environment variable set.
  Local development defaults to **beta mode** automatically (`NODE_ENV !==
  "production"`), so `/app` is reachable without configuration while
  developing. A real deployed beta environment opts in explicitly via
  `NEXT_PUBLIC_LAUNCH_MODE=beta`. See `ROUTE-MAP.md` for the full contract.
- `/admin/**` is gated independently of launch mode — it is architecture
  scaffolding, not a working admin tool, and stays unreachable in ordinary
  production configuration regardless of launch mode.

## Universal product destinations

- The six canonical product destinations are **start, setup, workspace,
  progress, history, settings** — not "home". The canonical live-work route
  is `/app/products/[productSlug]/workspace`. A product may relabel
  "Workspace" per family (e.g. "Learn", "Automate", "Continue", "Build",
  "Track") without changing the route segment.

## Deferred out of Phase 1

- Visual/design-system consolidation (typography, spacing, motion, full
  responsive polish) — explicitly a separate, later, approved phase.
- Real product content of any kind.
- Server-side/middleware session verification (would require
  `@supabase/ssr`, not an approved Phase 1 dependency) — the auth guard
  remains client-side, same mechanism the app already used.
- Commerce rebuild against entitlements, real notification sending, admin
  role model, analytics, and everything else listed as deferred in
  `ADMIN-AND-OPERATIONS.md` and `ROUTE-MAP.md`.
