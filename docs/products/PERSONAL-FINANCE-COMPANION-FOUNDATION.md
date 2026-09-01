# Personal Finance Companion — foundation stage

Guidance for engineers extending this product. Covers the infrastructure
built in the foundation session only — no direct-section UI, no Companion
guided journey, no notes/CSV extraction pipeline exists yet. See the launch
specification (external document, provided alongside this session) for the
complete customer-facing product this foundation is built to support without
rework.

## What this product is

A paid, unreleased Draftpace product. Registered normally in
`src/products/manifest.ts` (real, not a dev fixture — `devFixture: false`),
but has no `src/shop/products/personal-finance-companion.ts` entry, so
`/shop` never lists it and `/shop/personal-finance-companion` 404s. That is
the entire release-gating mechanism: the same pattern
`src/products/hidden-access-test/` already established, reused exactly, not
reinvented. The only way in is a manual
`grant_admin_product(p_user_id, 'personal-finance-companion', '0.1.0', <cycle_key>)`
call.

## Access states

Identical to Draftpace's existing collapsed ownership/activation model —
this product does **not** introduce a separate "activated" state beyond
having an active `entitlements` row, matching every other product.
`src/app/app/products/[productSlug]/layout.tsx`'s existing entitlement gate
covers this product with zero product-specific code.

## cycleModel: "continuous"

`product_instances.cycle_key` and the canonical entry route's "does an
instance exist for today's cycle" lookup are built for Monthly Money
Reset's monthly-reset model. Personal Finance Companion has no reset
concept — one instance, forever. Forcing it through the monthly-cycle
lookup would silently lose the instance at every calendar-month boundary
(the canonical route would look for `cycle_key = "2026-09"`, find nothing,
and treat a returning September user as brand new).

Fix: `ProductDefinition.cycleModel` (`src/product-framework/definition.ts`)
is `"monthly"` (default, unchanged behavior for every existing product) or
`"continuous"`. Continuous products are looked up by most-recently-created
instance instead of by matching today's cycle key — see the identical
branch in `[productSlug]/layout.tsx` and `[productSlug]/page.tsx`. This is
a generic extension any future non-cyclical product can also use, not a
Personal-Finance-Companion-specific hack. `cycle_key` on this product's one
instance is fixed at grant time (via `grant_admin_product`'s
`p_cycle_key` parameter) as an "instance cohort" marker — it satisfies the
shared table's `YYYY-MM` check constraint but carries no active-period
meaning for this product.

## Canonical financial records

Seven normalized tables (`pfc_accounts`, `pfc_income_sources`, `pfc_bills`,
`pfc_subscriptions`, `pfc_transactions`, `pfc_debts`,
`pfc_savings_goals`) — **not** Monthly Money Reset's single-JSONB-blob
pattern. That pattern is correct for one product's small, single-screen
state; it does not scale to seven independently queryable, potentially
numerous record types (a CSV import alone can add hundreds of
transactions). Normalized tables match the launch specification's own
proposal.

Every table carries the same lifecycle/provenance shape: `status` (draft /
confirmedIncomplete / ready / needsReview / archived), `needs_review_reason`,
`source` (manual / pastedNotes / textFile / csvImport / futureBankImport),
`import_session_id`. Money is `bigint` minor units throughout (`*_minor`
columns, `*MinorUnits` in TypeScript — see `src/lib/currency.ts`, promoted
from Monthly Money Reset's identical utility when this product needed it
too).

**Single source of truth**: there is exactly one row per financial fact.
Companion's guided setup and each record's direct-section screen call the
exact same TypeScript functions in
`src/products/personal-finance-companion/domain/*.ts` — `createBill`,
`updateBill`, `archiveBill`, and their equivalents for the other six
types. There is no `createCompanionBill` / `createRealBill` split, and
never should be.

## Why direct RLS writes instead of Monthly Money Reset's RPC-only pattern

Monthly Money Reset routes every write through a security-definer RPC
specifically because its single JSONB blob needs optimistic concurrency
(a revision column) and because `product_instances`' denormalized
read-cache columns must stay transactionally consistent with that blob.
Neither requirement applies to seven independent, normalized rows edited
one at a time. The seven record tables instead grant `authenticated`
direct `INSERT`/`UPDATE` via RLS `with check`/`using` clauses scoped to
`auth.uid() = user_id`, plus a `_pfc_owns_instance()` check confirming the
target `product_instance_id` actually belongs to that same user. This is
an equally strong ownership boundary, the more standard Supabase pattern,
and avoids 21 near-identical stored procedures. `pfc_setup_state` (the
Companion flow's own resumable progress) **does** need optimistic
concurrency the same way Monthly Money Reset's state does — a second tab
or device must not silently clobber a newer autosave — so it keeps the
RPC pattern, via `save_personal_finance_companion_setup_state`.

## Setup-state vs financial records

`pfc_setup_state` is not a financial record and holds no duplicate copy of
any account/bill/etc. It tracks only where the user is in the guided
Companion flow: current screen, selected input path, per-area setup
progress, orientation seen/skipped, active import session, candidate-review
position. Shape mirrors `monthly_money_reset_states` exactly (JSONB blob +
`schema_version` + `revision`), since that pattern is correct for
single-user session/flow state the same way it's wrong for the seven
record types above.

Unlike `grant_free_product` (which creates entitlement + instance + state
row together), `grant_admin_product`/`grant_purchased_product` do **not**
create `pfc_setup_state` eagerly — by design, per that migration's own
comment ("a product's own first-load path is responsible for creating its
own state row lazily"). `save_personal_finance_companion_setup_state`
handles this: its first branch creates the row on the very first autosave
for a given instance.

Client-side wiring: `src/products/personal-finance-companion/setupStateData.ts`
(load/save/find, mirroring `monthly-money-reset/data.ts`'s
interpret\*Response pattern) and
`src/products/personal-finance-companion/components/useSetupState.ts`
(the autosave/debounce/forceSave/saveDirectly hook, mirroring
`useInstanceState.ts`).

## PWA architecture decision

Audited first: Draftpace's entire current PWA surface (manifest, service
worker, icons, install prompt) is single-origin, single-manifest,
site-wide, scoped to `/` with `start_url: /app`. No per-product PWA
identity existed anywhere before this session.

Considered:
- **(A/B) A product-scoped manifest on the existing origin, generalized
  into a repeatable per-product mechanism.** Chosen.
- **(C) A product subdomain** (e.g. `finance.draftpace.com`). Rejected for
  this stage: requires DNS/Vercel domain configuration (a manual owner
  action) and explicit cross-subdomain cookie-domain configuration for
  Supabase auth session sharing, which is real production-auth risk to
  introduce without the account owner directly involved. Also conflicts
  with `CLAUDE.md`'s "one Next.js app, no monorepo conversion" posture more
  than a same-origin manifest does.
- **(D) One shared install identity, product areas as internal deep
  links only.** Rejected: does not satisfy the explicit requirement that
  the Companion be separately installable and recognizable as its own app.

Implementation: `ProductDefinition.pwa` (optional field,
`src/product-framework/definition.ts`) declares name/shortName/description/
theme+background color/icons for any product that wants its own installable
identity. `src/app/app/products/[productSlug]/manifest.webmanifest/route.ts`
serves that product's manifest JSON — generic, reads whichever product's
`pwa` field, not Personal-Finance-Companion-specific.
`[productSlug]/layout.tsx`'s `generateMetadata`/`generateViewport` link that
manifest and override `appleWebApp`/`themeColor` for routes under that
product only (Next's metadata merges per-key, root metadata is untouched
for every other product). `start_url`/`scope` are both
`/app/products/personal-finance-companion(/...)`.

**Install fidelity is asymmetric by design, not oversight**: Chromium
(desktop + Android) supports genuinely distinct, separately installable
manifests from different pages on one origin — verified real behavior, not
assumed. iOS Safari's "Add to Home Screen" is meta-tag driven, not
manifest driven, and never fires `beforeinstallprompt` at all — the
`appleWebApp` override above is the entire iOS contribution; a future
install-CTA screen must show iOS-specific instructions rather than a
native prompt button on that platform. This caveat is inherent to iOS
Safari, not something this architecture can route around.

**Service worker**: unchanged, still the single root-scoped
`public/sw.js`. It already never caches `/app/**` (a deliberate, tested
invariant — see `src/__regression__/pwa-manifest.test.ts`), which
automatically covers every route this product adds without any new code.
No second service worker was registered — see the offline section below
for why.

**Icons**: the manifest reuses Draftpace's existing neutral
`/logo/icon-*.png` assets, marked `provisionalBranding: true`. No final
Personal Finance Companion artwork was invented, per the explicit
instruction — real icon assets are a later, separate decision.

**Install experience UI** (the "Purchase → activate → welcome → optional
install → notification preferences → setup → workspace" journey) is
deliberately not built this session — only the underlying hooks
(`src/lib/pwa/hooks.ts`: `useStandaloneMode`, `useInstallPrompt`,
`useOnlineStatus`) exist for a later contextual install screen to use.

## Notification readiness

Audited first: Draftpace's notification routes
(`src/app/api/notifications/{subscribe,test,cron}`) are confirmed
non-functional stubs — `subscribe` never writes to a database (no
`notifications`/`push_subscriptions` table exists anywhere), `test` never
sends a real push, `cron` does no work. No Web Push/VAPID platform exists.

Per the explicit instruction not to quietly build a push platform during
infrastructure work: none was built. Instead,
`src/products/personal-finance-companion/notifications.ts` defines the
product-level contract a future platform would implement against — the
five notification kinds from the launch spec and the deep-link each
resolves to. `ProductDefinition.notifications.supported` stays `false`
until a real platform exists to back it.

## Offline contract

`ProductDefinition.offline: "shell-only"` — the installed app shell and
static/product UI may be cached (already true site-wide); financial
reads/writes require connectivity. No optimistic offline write queue
exists or was built: this repository has no proven conflict-safe local-write
mechanism, and a financial product must never imply a save succeeded when
it did not. `src/lib/pwa/offlineContract.ts`'s `DataSaveState` type
documents the full state space (online / temporarily offline / save failed
/ retry available / stale cached read) including a `pendingLocalChange`
variant that is intentionally unreachable today — present so a future
conflict-safe queue has a state to report into without inventing a new
type then.

## What is genuinely deferred to the next stage

Everything customer-facing: the seven direct-section add/edit UIs, the
Companion guided journey (screens 0-7), notes/text AI extraction, CSV
import and duplicate/transfer detection, the Workspace dashboard, the
Setup Centre's real status grid and consolidated lists, the install
experience screen, real push notifications, and final product icon
artwork. Each destination currently registered
(`src/products/personal-finance-companion/components/*Module.tsx`) is an
infrastructure-verification shell — it proves entitlement, routing, and
(where applicable) live data access work, and says so honestly, rather
than presenting unfinished work as a customer-facing "Coming Soon" state
(it never can be one — there is no customer path to any of it).
