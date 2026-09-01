# Monthly Money Reset: QA status

An honest account of what was verified before this shipped, and what
explicitly wasn't. Written the same way `docs/FREE-PRODUCT-ACTIVATION.md`
and the migration smoke test are: this environment has real, disclosed
limits, and this document says so rather than implying more testing
happened than actually did.

## What this environment could not do

No Supabase CLI, Docker, or `psql` was available at any point during this
build (checked in commit 2 and again here). No browser automation tool was
available either (checked in this exact session, twice — once during the
earlier public-experience pass, once again for this build). Concretely,
that means:

- **The migration has never been applied to any database, anywhere.** Every
  table/RLS/function claim in this build is based on reading the SQL
  carefully and on `migration.test.ts`'s structural assertions (table names,
  grant statements, function bodies), not on running it. See
  `docs/FREE-PRODUCT-ACTIVATION.md`'s verification queries for what the
  founder should run after applying it.
- **No entitlement was ever actually granted.** The activation flow
  (`/app/activate/[productSlug]` → `POST /api/products/[productSlug]/
  activate` → `grant_free_product`) was verified by reading the code and by
  the build compiling and typechecking every route in the chain, not by a
  real signed-in user completing it.
- **No real financial data was ever saved to or loaded from Supabase.** Every
  `computeSafeToSpend()` guarantee is verified by 52+ unit tests operating
  on in-memory objects; `save_monthly_money_reset_state`'s actual revision-
  conflict behavior has never executed against a real database.
- **No browser-based visual, responsive, or keyboard-interaction testing was
  performed.** No screenshots exist of any Monthly Money Reset screen.
  Nothing here has been seen rendered.

## What was actually verified

- **Every Safe-to-Spend rule** — the formula itself, the bill-payment
  net-zero property, the unprotected-bill-is-a-new-outflow property, the
  skip-releases-the-hold property, never-clamped, decimal precision, large
  values, invalid-input rejection, duplicate-submission guarding — via
  automated unit tests (`calculations.test.ts`, `state.test.ts`,
  `nextAction.test.ts`, `carryForward.test.ts`, `currency.test.ts`,
  `data.test.ts`), all passing at every commit in this build.
- **Type correctness** across the entire product (`npx tsc --noEmit`) at
  every commit.
- **Lint cleanliness**, including this codebase's stricter-than-default
  React Compiler purity rules (`react-hooks/refs`, `react-hooks/purity`) —
  two real violations were caught and fixed this way (`Date.now()` called
  during render in `SafeToSpendCard`, a ref read during render in
  `QuickAddModal`), not by manual review.
- **A full production build** (`next build --webpack`) succeeding at every
  commit, including every new route resolving, every module component
  compiling, and no route accidentally exposing a GET handler on the
  activation endpoint (`route.test.ts` asserts this directly).
- **Migration structure** via `migration.test.ts`'s grep-based assertions:
  every table exists, RLS is enabled on all three user-owned tables, no
  `insert`/`update` grant exists for `authenticated` on any of them, both
  mutation functions are `security definer`, `grant_free_product` derives
  the product version from the allowlist rather than accepting one as a
  parameter, `save_monthly_money_reset_state` gates on the expected
  revision and checks ownership before writing.
- **Copy regression**: the existing `public-copy.test.ts` scan now covers
  `src/shop/products` (the real Shop listing), confirming no em dashes,
  banned marketing words, or fabricated social proof anywhere in Monthly
  Money Reset's public-facing copy.
- **Theme isolation**: confirmed zero diff to `globals.css` or
  `src/design-system/` from this entire build — the forest/sage/ivory/clay
  palette exists only as inline styles inside `ThemeScope.tsx`.
- **Scope isolation**: confirmed zero diff to `/admin/**` for this entire
  build (`git diff` against the commit immediately before this task began).
  The six shared `/app/products/[productSlug]/{destination}` pages did
  change, but only additively — each gained a two-line `resolveProductModule`
  check inserted before its existing content, and for any product without a
  registered module (every fixture, and any future product that hasn't
  built one yet) that check resolves to `undefined` and every line of the
  previous generic fallback still renders exactly as before, confirmed by
  diffing each file.
- **Accessibility, by code inspection only** (not a real screen reader or
  keyboard session): every icon-only button has an `aria-label`; both
  modals (`QuickAddModal`, `CheckInModal`) have `role="dialog"`,
  `aria-modal`, close on Escape, and focus the close button on open; the
  Workspace's four-tab strip uses roving `tabindex` with
  `ArrowLeft`/`ArrowRight` navigation and `role="tabpanel"` linked via
  `aria-labelledby`, matching the pattern already established for the
  public site's `ProblemChooser` earlier this session; no fixed pixel width
  was found anywhere in the product that isn't inside an intentionally
  horizontally-scrollable strip (the Setup step indicator).

## What still needs to happen before this is real

1. **Founder reviews and applies the migration** (`docs/FREE-PRODUCT-
   ACTIVATION.md`) against the actual Supabase project, once that project
   is reachable (see the separate, unrelated open item from the earlier
   OAuth/DNS work in this session's history).
2. **One real signup → activate → setup → Workspace → Quick Add → check-in →
   month-close walkthrough**, by a human, in a real browser, against the
   applied migration.
3. **An actual responsive pass** at the breakpoints this project's other
   passes have used (1440/1280/1024/768/390/320px), 200% zoom, reduced
   motion, and a real keyboard-only and touch pass — none of which a code
   review substitutes for.
4. **Real screenshots** for the Shop listing, once the built UI has
   something to screenshot (the founder-approved decision from
   `docs/MONTHLY-MONEY-RESET-BUILD-PLAN.md`).
