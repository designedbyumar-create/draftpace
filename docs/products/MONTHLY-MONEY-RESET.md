# Monthly Money Reset

Draftpace's first real product, and its first free product. A Companion-
family product registered through the exact same `productRegistry` and
`moduleRegistry` any future real product uses — see
`src/products/monthly-money-reset/`.

## Promise

"See what is safe to spend this month, protect what must be paid, and know
the next useful move."

## Supporting description

"Add the money available now, protect upcoming bills and set aside what you
do not want to spend. Monthly Money Reset keeps the current picture clear
and updates it as the month changes."

## The problem it solves

Money sits in an account, income arrives at different times, some bills must
be protected whether they're paid yet or not, ordinary spending happens
continuously, and there's usually an amount the user would rather not touch.
Working out what's actually free to spend right now means doing that math by
hand, repeatedly, or trusting a gut feeling. Monthly Money Reset does that
math continuously and shows its work.

## Audience

- Wants one trustworthy number for what's safe to spend, not a full personal-
  finance system.
- Has a mix of bills, some automatic and some not, they'd rather not
  accidentally spend past.
- Is fine adding a handful of numbers each month in exchange for not tracking
  everything mentally.

## Explicit non-goals

- **Not a trial.** No time limit, no feature gate, no upgrade prompt inside
  the free experience.
- **Not a demo.** Every number is the user's own; nothing is pre-seeded or
  fabricated (see `createEmptyState()` in `state.ts`).
- **Not a spreadsheet viewer or generic expense tracker.** It has one
  specific shape — a monthly reset with a Safe-to-Spend answer — not a
  general ledger.
- **Not an annual budgeting system.** One month at a time, by design; that's
  what the later, paid Annual Finance Command Center is for.
- **Not financial advice.** Every surface that shows Safe-to-Spend also says
  so, and the calculation is fully inspectable, never a black box.
- **Not bank-connected.** No transaction import, no account linking. Every
  number is entered by the user, on purpose.
- **No Money Leak Check.** The reference prototype had this; it isn't part
  of this product's scope and wasn't built.

## Included scope (v1)

Start Here, a 5-step progressive Setup with a live preview and autosave, a
Workspace (Safe-to-Spend hero, one rule-based next action, Quick Add across
five entry types, a bills list, a simple spending-groups view, an activity
log), a weekly check-in, Progress (real momentum metrics only), History with
a month-close flow and carry-forward into the next cycle, and Settings
(currency, check-in day, tone, privacy blur, export, pause, reset-with-
confirmation).

## Product family and shared destinations

Registered under the `companion` family
(`src/product-framework/families.ts`), using the shared six-destination
navigation (Start, Setup, Workspace, Progress, History, Settings) resolved
generically by the existing `resolveProductNavigation()`. Each destination's
real UI is a module registered via `moduleRegistry.register()` — see
`src/products/monthly-money-reset/register.ts` — picked up by the shared
`/app/products/[productSlug]/{destination}` pages through the
`resolveProductModule()` helper added to `moduleRegistry.ts`. No product-
framework file branches on this product's name or family; a second real
product uses the identical mechanism.

## Free access

The only free product in the platform today. Activation is POST-only and
database-eligibility-checked — see `docs/FREE-PRODUCT-ACTIVATION.md` for the
full flow and why it's safe against a GET request, a `<Link>` prefetch, a
crawler, or an arbitrary RPC call.

## Where the rest of the detail lives

- `docs/products/MONTHLY-MONEY-RESET-CALCULATIONS.md` — the Safe-to-Spend
  formula, every rule, and the 14 required edge cases.
- `docs/products/MONTHLY-MONEY-RESET-STATES.md` — the full state schema,
  which fields are sensitive, and the concurrency contract.
- `docs/products/MONTHLY-MONEY-RESET-QA.md` — what was and wasn't verified
  before this shipped.
- `docs/FREE-PRODUCT-ACTIVATION.md` — the entitlement/activation flow and
  exact migration-application steps.
- `docs/MONTHLY-MONEY-RESET-BUILD-PLAN.md` — the approved scope and the
  founder corrections this build is built against.
