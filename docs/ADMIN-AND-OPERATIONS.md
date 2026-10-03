# Admin and Operations

A real, protected, denser operational shell — not a finished admin product.
Four sections read genuinely real data; the rest are honest "not built yet"
states. See `docs/ROUTE-MAP.md` for the full route list.

## Protection

`src/proxy.ts` blocks all of `/admin/**` unless `isAdminEnabled()` is true
(local dev, or explicit `DRAFTPACE_ADMIN_PREVIEW=true` on a protected
deploy). `src/app/admin/layout.tsx` re-checks the same flag and requires a
real session, both forced to run per-request via `export const dynamic =
"force-dynamic"` — without that, a normal production build statically bakes
every admin route as a 404 at build time, which would make a runtime-only
`DRAFTPACE_ADMIN_PREVIEW` on an already-built deploy silently do nothing.

## What's real

- **Products** (`/admin/products`) — reads `productRegistry.list()` directly, the same source of truth the customer platform uses.
- **Product families** (`/admin/product-families`) — reads `familyRegistry.list()`.
- **Operations** (`/admin/operations`) — shows live `isAdminEnabled()` / `areDevFixturesEnabled()` state, not a simulated toggle.
- **Support** (`/admin/support`) — reads every report submitted from `/app/support`'s "Report an issue" form (`public.support_reports`), across every user. Read-only: there's no role model yet (see below), so this is a visibility tool, not a case-management workflow — nothing here can be resolved, assigned, or replied to. Since no admin role exists to scope an RLS policy against, this one read uses the service-role client server-side (`listAllSupportReports()`, the same tool the notifications cron already uses to read across users), bypassing RLS by design rather than widening it. The `/admin` route tree itself — gated by `isAdminEnabled()` — is what keeps this from being reachable by an ordinary signed-in customer.

## What's intentionally not built

Any role model beyond "signed in or not"; Product Studio (product
definition/version authoring, preview lab, release manager); Customers,
Entitlements, Commerce events, Communications, and Analytics all render
`AdminEmptyPage` — a shared honest-empty component naming exactly what's
missing, never fabricated data.

## Why this shape

The product framework (`docs/PRODUCT-FRAMEWORK.md`) is designed so a future
Product Studio would write to the same `productRegistry`/definition contract
a developer uses today — admin tooling is a UI over the same contract, not a
parallel system. Building the full admin route/nav structure now, with real
data only where it genuinely exists, means the boundary (protected, noindex,
force-dynamic, "unavailable in ordinary production configuration") is
established before there's anything sensitive behind most of it.
