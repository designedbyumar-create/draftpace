import type { Bill, BillPayment } from "../../state";
import { monthlyEquivalentMinorUnits } from "./billLogic";

/** "YYYY-MM" from the device's own calendar, so "this month" is the month the person is living in. */
export function periodOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function isoDateOf(date: Date): string {
  return `${periodOf(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

export function paymentFor(payments: BillPayment[], billId: string, period: string): BillPayment | undefined {
  return payments.find((payment) => payment.billId === billId && payment.period === period);
}

export interface LeftToPay {
  /** The full amounts of monthly bills not yet ticked as paid this month. */
  leftMinorUnits: number;
  paidMinorUnits: number;
  /** Monthly bills with no amount yet, which cannot be counted either way. */
  unknownCount: number;
}

/**
 * Only monthly bills are due every month, so only they are counted here. A
 * quarterly or annual bill can still be ticked paid, it just does not
 * change what is left this month.
 */
export function leftToPay(bills: Bill[], payments: BillPayment[], period: string): LeftToPay {
  let left = 0;
  let paid = 0;
  let unknown = 0;
  for (const bill of bills) {
    if (bill.status === "archived" || bill.frequency !== "monthly") continue;
    const amount = monthlyEquivalentMinorUnits(bill);
    if (amount === null) {
      unknown += 1;
      continue;
    }
    if (paymentFor(payments, bill.id, period)) paid += amount;
    else left += amount;
  }
  return { leftMinorUnits: left, paidMinorUnits: paid, unknownCount: unknown };
}
