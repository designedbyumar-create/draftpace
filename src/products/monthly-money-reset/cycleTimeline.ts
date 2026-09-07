import type { SafeToSpendBreakdown } from "./calculations";
import type { BillEntry, IncomeEntry } from "./state";

export type TightestDay = { date: string; amountMinorUnits: number };

type TimelineInput = {
  breakdown: Pick<SafeToSpendBreakdown, "safeToSpend" | "protectedUnpaidBills" | "protectedReserveHeld">;
  /** ISO date/datetime string, parsed with `new Date()`, same convention as nextAction.ts. */
  today: string;
  /** ISO date/datetime string for the last day of the current cycle, inclusive. */
  cycleEndDate: string;
  bills: Pick<BillEntry, "status" | "dueDate" | "amountMinorUnits">[];
  income: Pick<IncomeEntry, "status" | "expectedDate" | "amountMinorUnits">[];
};

/**
 * Projects the account's real balance forward, day by day, from today
 * through the end of the cycle, applying only bills/income that are
 * already dated and not yet settled, then reports the single lowest
 * point that projection reaches.
 *
 * This is a genuinely different question from Safe-to-Spend: Safe-to-Spend
 * answers "what can I spend right now, assuming every protected bill still
 * lands"; this answers "on which day does the money in the account
 * actually run tightest, given what's already scheduled", a mid-cycle dip
 * an averaged, single-figure view can't show, and the reason a genuinely
 * new per-paycheck cycle mechanism turned out not to be worth the risk to
 * the shared `cycle_key` platform contract (see cycle.ts): the same
 * information is available as a computed view over data this product
 * already stores.
 *
 * Returns null when nothing dated falls between today and the end of the
 * cycle (nothing to project), when today is already past the cycle end, or
 * when the lowest point is today itself (there's no future dip to name ,
 * only surface this when it identifies a real day ahead).
 */
export function computeTightestDay(input: TimelineInput): TightestDay | null {
  const { today, cycleEndDate, breakdown } = input;
  const todayTime = new Date(today).getTime();
  const endTime = new Date(cycleEndDate).getTime();
  if (todayTime > endTime) return null;

  const events: { date: string; time: number; deltaMinorUnits: number }[] = [];

  for (const bill of input.bills) {
    if (bill.status !== "upcoming" && bill.status !== "changed") continue;
    if (!bill.dueDate) continue;
    const time = new Date(bill.dueDate).getTime();
    if (time < todayTime || time > endTime) continue;
    events.push({ date: bill.dueDate, time, deltaMinorUnits: -bill.amountMinorUnits });
  }

  for (const entry of input.income) {
    if (entry.status !== "expected") continue;
    if (!entry.expectedDate) continue;
    const time = new Date(entry.expectedDate).getTime();
    if (time < todayTime || time > endTime) continue;
    events.push({ date: entry.expectedDate, time, deltaMinorUnits: entry.amountMinorUnits });
  }

  if (events.length === 0) return null;

  events.sort((a, b) => a.time - b.time);

  // The real, spendable-today balance: Safe-to-Spend plus the money that is
  // still physically in the account but earmarked (protected reserve and
  // protected unpaid bills), see calculations.ts's own doc comment for why
  // those two are subtracted from Safe-to-Spend even though they haven't
  // actually left the account yet.
  const startingBalance = breakdown.safeToSpend + breakdown.protectedUnpaidBills + breakdown.protectedReserveHeld;

  let runningBalance = startingBalance;
  let tightest: TightestDay | null = null;

  for (const event of events) {
    runningBalance += event.deltaMinorUnits;
    if (!tightest || runningBalance < tightest.amountMinorUnits) {
      tightest = { date: event.date, amountMinorUnits: runningBalance };
    }
  }

  if (tightest && tightest.amountMinorUnits >= startingBalance) return null;

  return tightest;
}
