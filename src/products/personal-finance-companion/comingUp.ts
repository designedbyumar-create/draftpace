import type { FinancialPictureInputs } from "./companion/capability";
import type { BillPayment } from "./state";
import { monthlyEquivalentMinorUnits as billMonthly } from "./components/bills/billLogic";
import { periodOf, isoDateOf, paymentFor } from "./components/bills/billPaid";

export type ComingUpKind = "bill" | "debt" | "subscription" | "income";

export interface ComingUpItem {
  /** Stable per occurrence, so the same bill in two months is two rows. */
  id: string;
  /** Calendar date, "YYYY-MM-DD". */
  date: string;
  title: string;
  kind: ComingUpKind;
  /** Null when the record has no amount yet. */
  amountMinorUnits: number | null;
  area: "bills" | "debt" | "subscriptions" | "income";
}

export const COMING_UP_DAYS = 14;

const DAY_MS = 86_400_000;

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Whole calendar days between two ISO dates; positive when `b` is later. */
function daysBetween(a: string, b: string): number {
  return Math.round((parseIso(b).getTime() - parseIso(a).getTime()) / DAY_MS);
}

function lastDayOf(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Dated things in the next `days` days, drawn only from records that carry
 * a real date: a monthly bill's due day, a subscription's renewal date,
 * an income source's next expected date, a debt's due date. Anything
 * without a date is simply not here (it is in Attention), and a bill
 * already ticked paid for its month leaves the list. Dates are the
 * device's own calendar days, so nothing shifts with a time zone.
 */
export function deriveComingUp(inputs: FinancialPictureInputs, payments: BillPayment[], now: Date = new Date(), days: number = COMING_UP_DAYS): ComingUpItem[] {
  const today = isoDateOf(now);
  const inWindow = (iso: string) => {
    const offset = daysBetween(today, iso);
    return offset >= 0 && offset <= days;
  };
  const items: ComingUpItem[] = [];

  for (const bill of inputs.bills) {
    if (bill.status === "archived") continue;
    const rule = bill.dueRule;
    if (rule && "dayOfMonth" in rule && bill.frequency === "monthly") {
      // The window is at most a few weeks, so it can touch at most two calendar months.
      for (let offset = 0; offset <= 1; offset += 1) {
        const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const day = Math.min(rule.dayOfMonth, lastDayOf(first.getFullYear(), first.getMonth()));
        const iso = `${periodOf(first)}-${String(day).padStart(2, "0")}`;
        if (!inWindow(iso)) continue;
        if (paymentFor(payments, bill.id, periodOf(first))) continue;
        items.push({ id: `bill:${bill.id}:${iso}`, date: iso, title: bill.name, kind: "bill", amountMinorUnits: billMonthly(bill), area: "bills" });
      }
    } else if (rule && "specificDate" in rule && inWindow(rule.specificDate)) {
      if (paymentFor(payments, bill.id, rule.specificDate.slice(0, 7))) continue;
      items.push({ id: `bill:${bill.id}:${rule.specificDate}`, date: rule.specificDate, title: bill.name, kind: "bill", amountMinorUnits: bill.amountMinorUnits, area: "bills" });
    }
  }

  for (const subscription of inputs.subscriptions) {
    if (subscription.status === "archived" || subscription.decision === "cancelled") continue;
    if (subscription.renewalDate && inWindow(subscription.renewalDate)) {
      items.push({ id: `subscription:${subscription.id}:${subscription.renewalDate}`, date: subscription.renewalDate, title: `${subscription.name} renews`, kind: "subscription", amountMinorUnits: subscription.amountMinorUnits, area: "subscriptions" });
    }
  }

  for (const source of inputs.incomeSources) {
    if (source.status === "archived") continue;
    if (source.nextExpectedDate && inWindow(source.nextExpectedDate)) {
      items.push({ id: `income:${source.id}:${source.nextExpectedDate}`, date: source.nextExpectedDate, title: source.name, kind: "income", amountMinorUnits: source.amountMinorUnits, area: "income" });
    }
  }

  for (const debt of inputs.debts) {
    if (debt.status === "archived") continue;
    if (debt.dueDate && inWindow(debt.dueDate)) {
      items.push({ id: `debt:${debt.id}:${debt.dueDate}`, date: debt.dueDate, title: `${debt.name} minimum`, kind: "debt", amountMinorUnits: debt.minimumPaymentMinorUnits, area: "debt" });
    }
  }

  return items.sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title) : a.date < b.date ? -1 : 1));
}
