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

## Current state (post Phase 2)

The product-layer reset (Phase 1) removed every prior product implementation.
Phase 2 removed the temporary coming-soon layer and made the real platform
the live application:

- `/` is the real public homepage in every environment — no waitlist gate.
- `/app/**` requires a real, server-verified Supabase session
  (`src/proxy.ts`, via `@supabase/ssr`) — not a client-side-only check.
- `/admin/**` is a real, denser operational shell covering every section
  from the brief; three sections (Products, Product families, Operations)
  read genuinely live data, the rest are honest "not built yet" states.
- One shared premium design system (`src/design-system/`, tokens in
  `src/app/globals.css`) covers the public site, platform, product shell,
  and auth — see `docs/DESIGN-SYSTEM.md`.
- The product framework (`src/product-framework/`) and its four internal
  development fixtures are unchanged in shape from Phase 1.

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
6. **`/app` and `/admin` protection is real, not a temporary gate.**
   `/app/**` requires an actual session (`src/proxy.ts` + `src/lib/
   supabase/server.ts`). `/admin/**` additionally requires
   `isAdminEnabled()` — architecture scaffolding, not a working admin
   tool, and its layout must stay `force-dynamic` (see
   `docs/ADMIN-AND-OPERATIONS.md` for why). There is no more launch-mode
   gate — don't reintroduce one.
7. **Development fixtures are never real products.** They're excluded from
   the registry in production, from sitemap/robots, and are always labeled
   "Internal ... Fixture". See `docs/DATA-BOUNDARIES.md`.
8. **Honest states everywhere.** No fabricated activity, metrics, charts,
   or customer data anywhere in `/app` or `/admin`. Backend functionality
   that doesn't exist yet renders through `EmptyState`/`SettingsRow`'s
   "not available yet" state, never a fake working control.
9. **One design system.** New UI uses `src/design-system/` primitives
   (`Button`, `Input`, `Badge`, `Alert`, `EmptyState`, `Container`,
   `Surface`, `Toggle`) and the token set in `globals.css` — see
   `docs/DESIGN-SYSTEM.md`. Don't hand-roll new color/spacing values.

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/signup` to create an account (requires the
Supabase project configured in `.env.local`, with Google OAuth configured if
you want to test that path), then `/app`.

Admin (`/admin`) is reachable automatically in local dev (`NODE_ENV !==
"production"`). To test it against a production build, set
`DRAFTPACE_ADMIN_PREVIEW=true` before building — setting it only at runtime
on an already-built deployment will not work (the layout is
`force-dynamic` specifically so the check itself is live, but the flag
still has to be present when the request is handled, i.e. in the running
process's environment).

## Quality gates

Before considering any change done:

```bash
npx tsc --noEmit
npx eslint .
npm run test
npm run build
```

## Where things live

See `docs/ROUTE-MAP.md` for routes, `docs/PRODUCT-FRAMEWORK.md` for the
registry/contracts, `docs/PRODUCT-FAMILIES.md` for the six initial families,
`docs/DATA-BOUNDARIES.md` for platform vs. product vs. product-instance state,
`docs/DESIGN-SYSTEM.md` for tokens/primitives, `docs/ADMIN-AND-OPERATIONS.md`
for the admin shell, and `docs/DECISIONS.md` for the founder decisions this
structure is built on.
