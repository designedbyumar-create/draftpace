# Monthly Money Reset: calculations

The authoritative formula, implemented in
`src/products/monthly-money-reset/calculations.ts` and covered by 14 tests
in `calculations.test.ts`. This document and that file are meant to be read
side by side.

## The formula

```
Starting available balance
+ income received after the reset began
- ordinary spending recorded after the reset began (includes corrections)
- bill payments made after the reset began (every paid bill, protected or not)
- savings transfers made after the reset began
- protected unpaid bills
- protected reserve still held in the account
= Safe to Spend
```

## Rule priorities and reasoning

1. **"Starting available balance" already includes income received before
   the reset began.** Setup's copy says this explicitly (Step 1: "This is
   what's already in your account, including anything you've already been
   paid"). The income list only ever holds income the user is *still
   expecting* — nothing already in hand at setup time gets a list entry, so
   there is no code path that could double-count it.

2. **Expected income never affects Safe-to-Spend.** `computeSafeToSpend()`
   only sums `income` entries where `status === "received"`. An `expected`
   entry contributes `0` regardless of its amount or date.

3. **A protected bill's amount is subtracted exactly once, by exactly one of
   two buckets, never both.** While `status` is `"upcoming"` or `"changed"`,
   it's summed into `protectedUnpaidBills`. The moment `markBillPaid()`
   changes `status` to `"paid"`, the same bill drops out of
   `protectedUnpaidBills` and its amount appears in `billPayments` instead —
   both buckets read from the same `bills` array, so there's no way for a
   bill to be in both, or in neither, mid-transition. `calculations.test.ts`
   asserts this directly: Safe-to-Spend is bit-for-bit identical immediately
   before and after `markBillPaid()`.

4. **An unprotected bill isn't subtracted until it's paid.** It was never in
   `protectedUnpaidBills` (that bucket only counts `protected: true`), so
   paying it is a genuine new entry in `billPayments` — Safe-to-Spend goes
   down by exactly that amount, correctly, since the money wasn't held back
   for it before.

5. **Skipping a protected bill releases the hold with no offsetting
   outflow.** `markBillSkipped()` sets `status: "skipped"`, which is neither
   `"upcoming"/"changed"` (so it leaves `protectedUnpaidBills`) nor `"paid"`
   (so it never enters `billPayments`). Safe-to-Spend goes up by the
   released amount — correct, since the user is saying that money isn't
   going to be spent that way after all.

6. **Money "set aside" splits into two distinct things, never both at
   once:** still-held reserve (`protectedReserve`, an array of labeled
   amounts — "Safety buffer," "Vacation fund not yet moved," etc. — summed
   as `protectedReserveHeld`) versus money that's actually left the account
   (`savingsTransfers`, summed as `savingsTransfersOut`). A given amount is
   recorded in exactly one of these lists, never migrated automatically
   between them — moving reserved money out is a user action (a Quick Add
   "savings set aside" entry), not something the calculation infers.

7. **Never clamped to zero.** `computeSafeToSpend()` has no `Math.max(...,
   0)` anywhere. `weeklyGuideAmount()` does clamp, but it's explicitly a
   presentation-only figure for the weekly guide strip — the real monthly
   number next to it is always the unclamped value, and the UI never hides
   a negative result.

8. **Every input is inspectable.** `SafeToSpendCard`'s expandable breakdown
   renders every field of `SafeToSpendBreakdown` with its label, not a
   collapsed summary.

9. **Deterministic and pure.** `computeSafeToSpend()` takes a plain object
   and returns a plain object; no I/O, no `Date.now()`, no randomness.
   Same input, same output, always — which is what makes exhaustive unit
   testing of the 14 required scenarios meaningful.

10. **Corrections adjust the spending record they're a correction of.**
    A `correction` activity entry is summed alongside `spending` entries
    into `ordinarySpending`. Its `amountMinorUnits` can be negative (money
    added back, e.g. "that $40 charge was actually a refund") or positive
    (an additional adjustment) — the schema doesn't force a sign, since both
    are legitimate.

11. **Language never overclaims certainty.** Every Safe-to-Spend surface
    says "based on the information currently added," and Start Here /
    the Shop listing both state plainly that this is a planning aid, not
    financial advice.

## Currency

One ISO 4217 currency per cycle (`state.currency`), all math in integer
minor units (`currency.ts`'s `toMinorUnits`/`fromMinorUnits`, using
`Intl.NumberFormat`'s own resolved fraction digits per currency rather than
assuming 2 everywhere — some currencies, like PKR in common display
convention, resolve to 0). No exchange rates, no conversion. Changing
currency in Settings changes formatting only; existing amounts are not
recalculated or converted.

## The 14 required test scenarios

All in `calculations.test.ts`: no income, expected income only, received
income, a bill changed after setup, a bill marked paid (net-zero), an
unprotected bill paid (new outflow), a skipped bill (released, no outflow),
negative Safe-to-Spend (never clamped), reserve edited, a savings transfer
added, a spending correction, zero-value entries, decimal currencies (exact
cent-level precision), large values (stays within `Number.isSafeInteger`),
invalid input (covered in `state.test.ts` as schema rejection, since
validation happens at that boundary, not inside the calculation function),
and duplicate action submission (`appendActivity()`'s `dedupeKey` guard).
