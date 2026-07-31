# Admin and Operations

Phase 1 scope: **architecture scaffolding only.** `/admin` exists as a route,
a gate, and a static overview page — not a working admin tool.

## What exists today

- `src/app/admin/layout.tsx` — gated two ways:
  1. `src/proxy.ts` blocks `/admin/**` entirely unless
     `isAdminEnabled()` is true (local dev, or an explicit
     `DRAFTPACE_ADMIN_PREVIEW=true` on a protected deploy). In ordinary
     production configuration this route is unreachable and redirects to `/`
     before Next.js ever renders it.
  2. The layout itself still requires a signed-in Supabase session (no role
     check yet — there is no role model in Phase 1).
- `src/app/admin/page.tsx` — a static description of the four future admin
  products (Product Studio, Operations Console, Analytics Workspace,
  Technical Operations) and what each will own. No data, no actions.
- `robots: { index: false, follow: false }` on the admin layout, and
  `/admin` disallowed in `robots.ts`.

## What is intentionally not built

- Any role model beyond "signed in or not."
- Product Studio: brief, stage model, schema editor, experience composer,
  rules/calculations authoring, preview lab, release manager.
- Operations Console: customer records, entitlement grant/revoke, commerce
  event visibility, support timeline.
- Analytics Workspace: any metric, chart, or event taxonomy.
- Technical Operations: job/webhook visibility, migrations, feature flags,
  audit log.

## Why this shape

The product framework (`PRODUCT-FRAMEWORK.md`) is designed so Product Studio
can eventually write to the same `productRegistry`/definition contract a
developer uses today — admin tooling is a UI over the same contract, not a
parallel system. Building the admin route and gate now, with nothing behind
it, means the boundary (noindex, protected, "unavailable in ordinary
production configuration") is established before there's anything sensitive
to protect.
