import type { FinancialPictureInputs } from "./companion/capability";
import { monthlyEquivalentMinorUnits as billMonthly } from "./components/bills/billLogic";
import { monthlyEquivalentMinorUnits as incomeMonthly } from "./components/income/incomeLogic";
import { monthlyEquivalentMinorUnits as subscriptionMonthly } from "./components/subscriptions/subscriptionLogic";
import { monthlyContributionNeededMinorUnits } from "./components/savings/savingsLogic";

export interface LedgerLine {
  label: string;
  amountMinorUnits: number;
}

/**
 * A typical month, written out the way a budget planner is: what comes in,
 * what goes out, what has to be set aside to reach each goal on its date,
 * and what is left. Every line is a monthly equivalent of a record the
 * person entered, so nothing here is a forecast or a guess, and whatever
 * cannot be counted is named in `notes` instead of being quietly dropped.
 */
export interface MonthLedger {
  incoming: LedgerLine[];
  outgoing: LedgerLine[];
  setAside: LedgerLine[];
  incomingTotal: number;
  outgoingTotal: number;
  setAsideTotal: number;
  leftOver: number;
  notes: string[];
}

const active = <T extends { status: string }>(records: T[]) => records.filter((r) => r.status !== "archived");
const sum = (lines: LedgerLine[]) => lines.reduce((total, line) => total + line.amountMinorUnits, 0);
const byAmount = (a: LedgerLine, b: LedgerLine) => b.amountMinorUnits - a.amountMinorUnits || a.label.localeCompare(b.label);
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function categoryLabel(category: string): string {
  const trimmed = category.trim();
  if (!trimmed || trimmed.toLowerCase() === "other") return "Other bills";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function deriveMonthLedger(inputs: FinancialPictureInputs, now: Date = new Date()): MonthLedger | null {
  const notes: string[] = [];

  const sources = active(inputs.incomeSources);
  const incoming: LedgerLine[] = [];
  for (const source of sources) {
    const monthly = incomeMonthly(source);
    if (monthly !== null) incoming.push({ label: source.name, amountMinorUnits: monthly });
  }
  const irregular = sources.filter((s) => s.frequency === "irregular").length;
  if (irregular > 0) notes.push(`${plural(irregular, "irregular income source is", "irregular income sources are")} not counted.`);

  const categories = new Map<string, number>();
  let unpricedBills = 0;
  for (const bill of active(inputs.bills)) {
    const monthly = billMonthly(bill);
    if (monthly === null) {
      unpricedBills += 1;
      continue;
    }
    const label = categoryLabel(bill.category);
    categories.set(label, (categories.get(label) ?? 0) + monthly);
  }
  if (unpricedBills > 0) notes.push(`${plural(unpricedBills, "bill has", "bills have")} no amount yet and is not counted.`);

  const outgoing: LedgerLine[] = [...categories].map(([label, amountMinorUnits]) => ({ label, amountMinorUnits })).sort(byAmount);

  const subscriptions = active(inputs.subscriptions).filter((s) => s.decision !== "cancelled");
  const subscriptionsTotal = subscriptions.reduce((total, s) => total + (subscriptionMonthly(s) ?? 0), 0);
  if (subscriptionsTotal > 0) outgoing.push({ label: "Subscriptions", amountMinorUnits: subscriptionsTotal });

  const debtMinimums = active(inputs.debts).reduce((total, d) => total + d.minimumPaymentMinorUnits, 0);
  if (debtMinimums > 0) outgoing.push({ label: "Debt minimum payments", amountMinorUnits: debtMinimums });

  const setAside: LedgerLine[] = [];
  let goalsWithoutDate = 0;
  for (const goal of active(inputs.savingsGoals)) {
    const needed = monthlyContributionNeededMinorUnits(goal, now);
    if (needed === null) goalsWithoutDate += 1;
    else if (needed > 0) setAside.push({ label: goal.name, amountMinorUnits: needed });
  }
  setAside.sort(byAmount);
  if (goalsWithoutDate > 0) notes.push(`${plural(goalsWithoutDate, "savings goal has", "savings goals have")} no usable target date, so nothing is set aside for it.`);

  if (incoming.length === 0 && outgoing.length === 0) return null;

  const incomingTotal = sum(incoming);
  const outgoingTotal = sum(outgoing);
  const setAsideTotal = sum(setAside);
  return { incoming, outgoing, setAside, incomingTotal, outgoingTotal, setAsideTotal, leftOver: incomingTotal - outgoingTotal - setAsideTotal, notes };
}
