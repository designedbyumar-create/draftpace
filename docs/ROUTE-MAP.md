# Route Map

Reflects the platform after Phase 2 (`docs/DECISIONS.md`). The waitlist/
launch-mode gate from Phase 1 is gone — the public site, platform, and
admin structure below are the live application.

## Access model

| Area | Protection | Indexing |
|---|---|---|
| Public (`/`, `/careers`, `/blog`, `/privacy`, `/terms`, `/cookies`) | None | Indexable |
| Auth (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`) | None | `noindex` |
| Platform (`/app/**`) | Real session required — verified server-side in `src/proxy.ts` (redirects to `/login?redirectTo=...` before any protected content is served) and again in `src/app/app/layout.tsx` as defense in depth | `noindex` |
| Admin (`/admin/**`) | Gated independently by `isAdminEnabled()` (local dev, or explicit `DRAFTPACE_ADMIN_PREVIEW=true`) *and* a real session, both re-checked per request via `export const dynamic = "force-dynamic"` | `noindex` |

## Public

| Route | Status |
|---|---|
| `/` | The real public homepage — platform explanation, product families, shared capabilities, trust principles, account CTA |
| `/careers`, `/blog` | Content pages |
| `/privacy`, `/terms`, `/cookies` | Legal — cleaned of abandoned-product claims (`docs/MIGRATION-PLAN.md`) |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback` | Auth flow, on the shared design system |

**Documented, not built:** `/products`, `/categories/[categorySlug]`, `/solutions/[solutionSlug]`, `/pricing`, `/learn`, `/activate/[token]` — real public product discovery and activation, deferred until a real product exists.

## Authenticated platform (`/app`)

| Route | Purpose |
|---|---|
| `/app` | Platform Home — one focal block, then owned products grouped by life area (`src/content/areas.ts`), each tile showing that product's own current summary via `productSummary.ts` |
| `/app/library` | The shelf — every owned product led by its real screens, with lifecycle filters that hide themselves when they'd be dead ends (`visibleLibraryFilters`) |
| `/app/library/[productSlug]` | That product's manual — its published content in an owner's order (what it's for, its screens, how to use it, what it needs and returns, saving, privacy, questions), plus a live ownership bar |
| `/app/notifications` | Inbox (empty), real browser permission flow, quiet hours, per-product controls (not built) |
| `/app/account` | Identity, sessions, security, sign-out (real); data export, deletion, 2FA (not built) |
| `/app/settings` | Theme, working text-scale and reduce-motion overrides (real), locale/timezone (detected, read-only), reminder time (real, persisted) |
| `/app/billing` | Owned products (empty), payment method / billing history (not built) |
| `/app/support` | Contact entries routed to email; in-app case tracking not built |
| `/app/products/[productSlug]/{start,setup,workspace,progress,history,settings}` | Universal product shell — family-aware content, no product exists in production yet |

## Internal (`/admin`)

| Route | Data |
|---|---|
| `/admin` | Overview — real counts (registered products/families) + section index |
| `/admin/products` | Real — reads `productRegistry` |
| `/admin/product-families` | Real — reads `familyRegistry` |
| `/admin/operations` | Real feature-flag state; jobs/webhooks honestly empty |
| `/admin/customers`, `/admin/entitlements`, `/admin/commerce`, `/admin/communications`, `/admin/support`, `/admin/analytics`, `/admin/audit` | Honest "not built yet" states — no fabricated customers, orders, or metrics |

No Product Studio (definition authoring UI) exists — out of scope per the brief.

## Indexing implementation

- `robots.ts` disallows `/app`, `/admin`, `/api`.
- `sitemap.ts` lists only the six real public pages.
- `/app/**` and `/admin/**` layouts, and the `(auth)` route group, set `robots: { index: false, follow: false }`.
