# Monthly Money Reset: state model

The full schema lives in `src/products/monthly-money-reset/state.ts` as Zod
schemas (`monthlyMoneyResetStateSchema` and its component schemas). This
document explains the shape, what's sensitive, and how it's persisted —
`state.ts` is the source of truth if the two ever disagree.

## Top-level shape

```
schemaVersion          literal 1
currency                ISO 4217 code, one per cycle
cycle                    { cycleKey, label, startedAt, closedAt?, previousInstanceId? }
profile                  { displayName? }
setup                    { currentStep, stepsCompleted[], completedAt? }
startingAvailableBalanceMinorUnits   integer, the cycle's opening figure
income[]                 IncomeEntry[]
bills[]                   BillEntry[]
spendingGroups[]          SpendingGroup[]
activity[]                 ActivityEntry[]
protectedReserve[]         ReserveItem[]
savingsTransfers[]         SavingsTransfer[]
checkIns[]                  CheckIn[]
nextAction?                 NextAction
recovery                    { triggeredAt?, reason?, resolvedAt? }
completion                  { closedAt?, closingSafeToSpendMinorUnits?, reflection?, carryForward? }
preferences                 { checkInDay, tone, privacyBlur }
createdAt / updatedAt / lastMeaningfulActivityAt   ISO timestamps
```

## Why product-specific data lives in its own table, not inline

Per `docs/DATA-BOUNDARIES.md`, `product_instances` (the shared, generic
table every product uses) holds only lifecycle/query-cache fields — never a
product's actual payload. This state lives in its own table,
`monthly_money_reset_states`, referenced by `product_instance_id`. See
`docs/FREE-PRODUCT-ACTIVATION.md` for the full table/RLS/function design.

## Sensitive fields

Everything here is financial and private to the owning user:
`startingAvailableBalanceMinorUnits`, every amount in `income`, `bills`,
`activity`, `protectedReserve`, `savingsTransfers`, and the derived
Safe-to-Spend figure. None of it is ever:

- readable by another user (RLS on `monthly_money_reset_states` restricts
  `select` to `auth.uid() = user_id`, and there is no `insert`/`update`
  grant for the `authenticated` role at all — see `docs/FREE-PRODUCT-
  ACTIVATION.md`'s "Why writes go through functions" section)
- logged, sent to analytics, or included in a browser notification payload
- present in public metadata or the Shop listing
- pre-seeded with sample data — `createEmptyState()` produces a genuinely
  empty state, no hardcoded amounts, no sample name

## Amount representation

Every amount field is an **integer in minor units** (cents, or the
currency's own minor unit — see the calculations doc's currency section),
never a float, never a major-unit decimal. `currency.ts` is the only place
conversion happens, always through `Intl.NumberFormat`'s own resolved
digits.

## Bill/income/activity semantics

- `IncomeEntry.status`: `"expected" | "received"`. Only `"received"` counts
  toward Safe-to-Spend. `recurring: boolean` marks whether it carries
  forward at month close.
- `BillEntry.status`: `"upcoming" | "paid" | "skipped" | "changed"`.
  `protected: boolean` determines whether an unpaid bill is held back.
- `ActivityEntry.type`: `"spending" | "income_received" | "bill_paid" |
  "savings_transfer" | "correction" | "setup_change"`. Only `"spending"` and
  `"correction"` are read by `computeSafeToSpend()` — the other types exist
  purely as a chronological record for the Activity tab and History; their
  financial effect is already captured by the `income`/`bills`/
  `savingsTransfers` lists, so summing them again would double-count.
  `dedupeKey` is how Quick Add and the check-in flow guard against a
  double-submitted entry applying twice.

## Optimistic concurrency

`monthly_money_reset_states.revision` is the authority. The client-side
contract (`useInstanceState.ts`):

1. Load the state and its current `revision`.
2. On every save, send the `revision` last read, alongside the new state.
3. `save_monthly_money_reset_state` (the migration function) updates only
   if the row's revision still matches what was sent; on success it
   increments the revision and returns it.
4. If another write already happened, zero rows match, and the function
   returns `{ conflict: true, revision, state }` — the current authoritative
   revision and state, not an error.
5. The client replaces its local state with the returned state rather than
   retrying the same write blindly. This is deliberately the simpler of the
   two sanctioned strategies ("reload" vs. a full field-level merge) — see
   `docs/MONTHLY-MONEY-RESET-BUILD-PLAN.md` correction 4.

This means two tabs, or two devices, editing at once never silently lose
one side's write — the loser sees a conflict and gets the winner's state
instead.

## Setup completion as the single source of truth

`state.setup.completedAt` is authoritative for "has setup been finished."
`product_instances.setup_complete` is a denormalized copy of the same fact,
written in the same `save_monthly_money_reset_state` call that writes the
state row — never independently. Library and Platform Home read the cheap
copy; nothing reads it as an independent truth that could drift from the
real state.
