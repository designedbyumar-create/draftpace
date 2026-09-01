# Data Boundaries

Phase 1 establishes these boundaries in **types only** — no Supabase
migrations were added. The goal is to prove the shape doesn't box out any
future product family, not to build real persistence yet.

## Platform state

Identity, preferences, devices, entitlements, notifications, library state,
billing, privacy, global navigation. One current value per account (with
history for consent-relevant changes). Lives in Supabase auth/`user_metadata`
today (theme, onboarding completion); a real `profiles`/`preferences` table
is future work, not built in Phase 1.

## Product instance state

Per the product framework's job, *not* per family:

- product id + version
- lifecycle (draft/active/paused/completed/archived — mirrors
  `ProductStatus` in the definition contract)
- setup status
- active destination
- progress summary (shape only — no product computes real progress yet)
- last activity
- sync state
- a reference to the product-specific payload (never the payload itself)
- permissions
- archive/completion state

This is deliberately generic. No family-specific field (no `envelopes`, no
`lessonId`, no `runId`) belongs on this shared shape — those live behind the
product's own versioned schema, referenced by `dataSchemaRef` in the product
definition (`PRODUCT-FRAMEWORK.md`).

## Product-specific data

Always behind a versioned, typed schema **registered by the product**, never
inlined into shared tables or the product-definition contract itself. Nothing
in Phase 1 defines a real product schema — this boundary exists so that when
Monthly Money Reset (or a learning product) is eventually built, its fields
never leak into `product_instances` or the product-definition record.

## Automation state (proof, not implementation)

The instance-state shape above is deliberately compatible with a future
automation product needing triggers, conditions, actions, schedules, run
state, logs, failures, and integration permissions — as product-specific data
behind `dataSchemaRef`, using the same `automation.*` capability namespace
(`PRODUCT-FAMILIES.md`). No automation engine exists; this is just evidence
the shared shape doesn't prevent one.

## Development fixtures

Fixtures (`src/product-framework/fixtures/`) are:

- registered through the exact same `productRegistry` as a real product would
  be — no separate fixture-only code path in the framework itself.
- excluded from the registry entirely when `areDevFixturesEnabled()` is
  false (production, unless explicitly opted into via
  `NEXT_PUBLIC_DEV_FIXTURES=true` for a protected preview deploy). See
  `src/product-framework/environment.ts`.
- flagged with `devFixture: true` in their definition, so even if somehow
  rendered, the UI marks them "Internal development fixture — not a real
  product" (`ProductShell`).
- never given prices, testimonials, or customer data — `access.model` is
  always `"free"` and there is no field for either in the schema.
- excluded from `sitemap.ts`/`robots.ts` because those files only ever
  enumerate static public pages, never the product registry.

## What's explicitly deferred

Real product schemas (finance, learning, automation or otherwise), a real
`product_instances` table, sync/conflict handling, and anything storing
actual user data beyond auth. Adding any of these is a Phase 2+ decision, not
implied by this document.
