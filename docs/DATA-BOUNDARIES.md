# Data Boundaries

These boundaries began as types only, with no Supabase migrations behind
them, and that is what the rest of this document used to describe. Nine
products now store real user data behind them, so the boundaries below
are load-bearing rather than aspirational: they are what keeps a
finance field out of a health product's tables and out of the shared
instance shape.

The rule that has not changed, and is the whole point: **product-specific
data lives behind the product's own versioned schema and its own table
prefix, never in shared tables and never in the product-definition
contract.**

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
  `ProductStatus` in the definition contract). Pause is real: see
  `202609060002_product_instance_pause.sql`
- setup status
- active destination
- progress summary
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
inlined into shared tables or the product-definition contract itself.

Each product owns a table prefix, chosen once and used consistently, with
RLS scoping every row to the signed-in account through that product's own
instance:

| Prefix | Product |
|---|---|
| `monthly_*` | Monthly Money Reset |
| `pfc_*` | Personal Finance Companion |
| `hmc_*` | Home Base |
| `als_*` | ADHD Life Companion (Alongside) |
| `hsc_*` | Homeschooling Companion |
| `pla_*` | Personal Life Affairs Companion |
| `trv_*` | Travel Companion |
| `vmc_*` | Vehicle Maintenance Companion |
| `fhb_*` | Family Health Binder |

Shared platform tables (`product_*`, `push_*`, `free_*`,
`redeemable_*`, `launch_*`) hold no product-specific field, and no
product reads another product's tables. There is no cross-product data
sharing anywhere, by design.

Two boundaries worth naming because they are easy to erode:

- **A person a product tracks is a row, not an account.** A child in
  Homeschooling Companion, a family member in Family Health Binder and a
  traveller in Travel Companion are all rows scoped under the one
  signed-in user. None of them has a login, an entitlement, or a consent
  flow, which is also why none of them needs one.
- **Sensitivity is a per-record choice the person makes.** Family Health
  Binder's `visibility` ('summary' | 'private') and Travel Companion's
  `requirements` are the same pattern: the record stays fully usable in
  the account and is simply excluded from anything printed.

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

## What's still deferred

A learning-family or automation-family schema, sync/conflict handling,
and a real `profiles`/`preferences` table (platform preferences still
live in Supabase auth metadata). Adding any of these is a decision to
take deliberately, not something this document implies.
