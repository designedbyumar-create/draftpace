import type { IncomeSource } from "../../state";

/** Multiplier to a monthly-equivalent figure. Irregular income has no reliable multiplier and is deliberately excluded from the total rather than guessed. */
const MONTHLY_MULTIPLIER: Record<Exclude<IncomeSource["frequency"], "irregular">, number> = {
  weekly: 52 / 12,
  biweekly: 26 / 12,
  semiMonthly: 2,
  monthly: 1,
};

function amountForTotal(source: IncomeSource): number | null {
  if (source.amountMinorUnits !== null) return source.amountMinorUnits;
  if (source.amountRangeMinorUnits !== null) {
    return Math.round((source.amountRangeMinorUnits.min + source.amountRangeMinorUnits.max) / 2);
  }
  return null;
}

/** Null when the amount or frequency can't honestly be normalized to a monthly figure — never guessed. */
export function monthlyEquivalentMinorUnits(source: IncomeSource): number | null {
  if (source.frequency === "irregular") return null;
  const amount = amountForTotal(source);
  if (amount === null) return null;
  return Math.round(amount * MONTHLY_MULTIPLIER[source.frequency]);
}

export type IncomeSummary = {
  totalMonthlyEquivalentMinorUnits: number;
  irregularCount: number;
  activeCount: number;
  estimatedCount: number;
  nextExpectedDate: string | null;
};

export function summarizeIncome(sources: IncomeSource[]): IncomeSummary {
  const active = sources.filter((s) => s.status !== "archived");
  let totalMonthlyEquivalentMinorUnits = 0;
  let irregularCount = 0;
  let estimatedCount = 0;
  let nextExpectedDate: string | null = null;

  for (const source of active) {
    const monthly = monthlyEquivalentMinorUnits(source);
    if (monthly !== null) totalMonthlyEquivalentMinorUnits += monthly;
    else if (source.frequency === "irregular") irregularCount += 1;
    if (source.confidence === "estimated") estimatedCount += 1;
    if (source.nextExpectedDate && (!nextExpectedDate || source.nextExpectedDate < nextExpectedDate)) {
      nextExpectedDate = source.nextExpectedDate;
    }
  }

  return { totalMonthlyEquivalentMinorUnits, irregularCount, activeCount: active.length, estimatedCount, nextExpectedDate };
}

export type IncomeDominantAction =
  | { kind: "add-first" }
  | { kind: "add-amount"; source: IncomeSource }
  | null;

/** The one dominant next action: the earliest-added active source still missing an amount, or "add the first source" if none exist. */
export function resolveDominantAction(sources: IncomeSource[]): IncomeDominantAction {
  const active = sources.filter((s) => s.status !== "archived");
  if (active.length === 0) return { kind: "add-first" };

  const missingAmount = active
    .filter((s) => s.amountMinorUnits === null && s.amountRangeMinorUnits === null)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  if (missingAmount.length > 0) return { kind: "add-amount", source: missingAmount[0] };
  return null;
}

/** The specific, non-generic explanation for a source that isn't contributing to the total yet. Being "estimated" is honest, not incomplete, so it never produces this message on its own. */
export function describeIncomeIncompleteness(source: IncomeSource): string | null {
  if (source.amountMinorUnits === null && source.amountRangeMinorUnits === null) {
    return "This income source doesn't have an amount yet. Add one so it counts toward your total.";
  }
  return null;
}
