import type { Bill } from "../../state";

/** Multiplier to a monthly-equivalent figure. "custom" frequencies have no reliable multiplier and are excluded from the total rather than guessed. */
const MONTHLY_MULTIPLIER: Record<Exclude<Bill["frequency"], "custom">, number> = {
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
};

function amountForTotal(bill: Bill): number | null {
  if (bill.amountMinorUnits !== null) return bill.amountMinorUnits;
  if (bill.amountRangeMinorUnits !== null) {
    return Math.round((bill.amountRangeMinorUnits.min + bill.amountRangeMinorUnits.max) / 2);
  }
  return null;
}

export function monthlyEquivalentMinorUnits(bill: Bill): number | null {
  if (bill.frequency === "custom") return null;
  const amount = amountForTotal(bill);
  if (amount === null) return null;
  return Math.round(amount * MONTHLY_MULTIPLIER[bill.frequency]);
}

export function describeDueRule(bill: Bill): string | null {
  if (!bill.dueRule) return null;
  if ("dayOfMonth" in bill.dueRule) return `Due on day ${bill.dueRule.dayOfMonth}`;
  if ("specificDate" in bill.dueRule) return `Due ${bill.dueRule.specificDate}`;
  return bill.dueRule.recurrenceDescription;
}

export type BillsSummary = {
  totalMonthlyEquivalentMinorUnits: number;
  activeCount: number;
  missingDueDateCount: number;
  unfundedEssentialCount: number;
};

export function summarizeBills(bills: Bill[]): BillsSummary {
  const active = bills.filter((b) => b.status !== "archived");
  let totalMonthlyEquivalentMinorUnits = 0;
  let missingDueDateCount = 0;
  let unfundedEssentialCount = 0;

  for (const bill of active) {
    const monthly = monthlyEquivalentMinorUnits(bill);
    if (monthly !== null) totalMonthlyEquivalentMinorUnits += monthly;
    if (!bill.dueRule) missingDueDateCount += 1;
    if (bill.essential && !bill.funded) unfundedEssentialCount += 1;
  }

  return { totalMonthlyEquivalentMinorUnits, activeCount: active.length, missingDueDateCount, unfundedEssentialCount };
}

export type BillsDominantAction =
  | { kind: "add-first" }
  | { kind: "add-due-date"; bill: Bill }
  | null;

/** The one dominant next action: the earliest-added active bill still missing a due date — bills without one stay visible in the list regardless, this only surfaces the single most useful next step. */
export function resolveDominantAction(bills: Bill[]): BillsDominantAction {
  const active = bills.filter((b) => b.status !== "archived");
  if (active.length === 0) return { kind: "add-first" };

  const missingDueDate = active.filter((b) => !b.dueRule).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  if (missingDueDate.length > 0) return { kind: "add-due-date", bill: missingDueDate[0] };
  return null;
}

/** The specific explanation shown for a bill that isn't fully set up. A missing due date never hides the bill — it stays in the list with this note. */
export function describeBillIncompleteness(bill: Bill): string | null {
  if (!bill.dueRule) return "This bill doesn't have a due date yet. Add one so Draftpace can plan around it.";
  return null;
}
