# CLAUDE.md

Guidance for Claude Code (or any engineer) working in this repository.

## What Draftpace is

Draftpace is an **extensible digital product platform**. It delivers multiple
kinds of interactive browser/PWA products — Companions, learning products,
automation tools, guided programs, trackers, calculators/decision tools,
interactive workspaces, and future product families that do not exist yet.

Companions are one important product family. **They are not the platform.**

The shared platform layer (identity, entitlements, cloud state, notifications,
responsive shell, versioning, operations) must stay broad enough that a future
automation tool or learning product can use it without being forced into
planner or finance-specific terminology or architecture.

See `docs/PRODUCT-PLATFORM.md` for the full model.

## What Draftpace is not

A generic productivity dashboard, a PDF/planner converter, a template
marketplace, a generic form builder, or an AI chatbot. See
`docs/DECISIONS.md` for the full list of locked decisions this reset is built on.

## Current state (post product-layer reset)

The repository went through a deliberate **product-layer reset** (see
`docs/MIGRATION-PLAN.md`). All prior product implementations — a
"Money Momentum" finance app, a "Systems"/"planners" catalog, and the
marketing site built around them — were removed. What remains is:

- A working waitlist landing page at `/` (the only public production surface
  today) and its API/table.
- Authentication (Supabase email/password + Google OAuth).
- A generalized platform shell, theme system, and Phosphor icon layer.
- A new, domain-neutral **product framework** (`src/product-framework/`) that
  products register against instead of the platform hardcoding any one
  product's shape.
- A route skeleton for the authenticated platform (`/app/**`) and an
  architecture-only admin shell (`/admin/**`).
- Four internal, non-production development fixtures proving the framework
  supports different product families.

No real product exists yet. Do not treat the fixtures as products, and do not
add finance/companion-specific fields to shared code — see
`docs/DATA-BOUNDARIES.md`.

## Architecture rules (read before adding code)

1. **One Next.js app.** No monorepo conversion. Keep clean internal
   boundaries (`src/product-framework/`, `src/design-system/`,
   `src/components/product-shell/`) that could be extracted into packages
   later without a rewrite.
2. **No family switch statements.** `ProductFamilyId` and
   `ProductCapabilityId` are open, validated, namespaced strings
   (`"companion.next-action"`, `"learning.lesson"`, ...), not closed TS
   unions. New families/capabilities register themselves — the shell never
   branches on family name. See `docs/PRODUCT-FRAMEWORK.md`.
3. **Product definitions never hold secrets or sensitive user data.** They
   are versioned, Zod-validated metadata only.
4. **Theme modes are `system | light | dark`.** Nothing else, at the
   platform level. A "calm" personality may exist later as a *product-level*
   theme extension, never a global mode again.
5. **Icons are Phosphor-only**, via `src/design-system/Icon.tsx`. No mixed
   icon libraries, no decorative icon-per-card, no emoji as controls.
6. **Launch mode gates exposure, not features.** Production defaults to
   `waitlist`. `/app/**` and auth routes only become reachable in `beta`/
   `full` mode (or local dev). `/admin/**` is gated independently and is
   architecture scaffolding, not a working admin tool. See
   `docs/ROUTE-MAP.md`.
7. **Development fixtures are never real products.** They're excluded from
   the registry in production, from sitemap/robots, and are always labeled
   "Internal ... Fixture". See `docs/DATA-BOUNDARIES.md`.
8. **No visual redesign yet.** Phase 1 shipped structural, accessible,
   unstyled-beyond-basics layouts on purpose. The premium design-system
   consolidation is a separate, later, approved phase.

## Running locally

```bash
npm install
npm run dev
```

`npm run dev` runs with `NODE_ENV=development`, which automatically puts the
app in **beta** launch mode (see `docs/ROUTE-MAP.md`), so `/app` and
`/admin` are reachable without setting any environment variable. Visit
`http://localhost:3000/login` to sign in (requires the Supabase project
configured in `.env.local`), then `/app`.

To exercise **waitlist mode** locally (the real production default), run:

```bash
NEXT_PUBLIC_LAUNCH_MODE=waitlist npm run dev
```

## Quality gates

Before considering any change done:

```bash
npx tsc --noEmit
npx eslint .
npx vitest run
npm run build
```

## Where things live

See `docs/ROUTE-MAP.md` for routes, `docs/PRODUCT-FRAMEWORK.md` for the
registry/contracts, `docs/PRODUCT-FAMILIES.md` for the six initial families,
`docs/DATA-BOUNDARIES.md` for platform vs. product vs. product-instance state,
`docs/ADMIN-AND-OPERATIONS.md` for the admin scaffold, and
`docs/DECISIONS.md` for the founder decisions this structure is built on.
