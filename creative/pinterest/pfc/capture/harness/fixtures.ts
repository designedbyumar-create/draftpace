/**
 * The demo household for the Personal Finance Companion captures: two
 * accounts, one salary, rent / electricity / phone / insurance, three active
 * streaming-and-storage subscriptions (plus one already cancelled), one
 * credit card and one Emergency fund goal. No real names, no real emails.
 *
 * It is built to AGREE with the four existing app screens
 * (creative/public/screens/personal-finance-companion-{bills,debt,records,printables}.png):
 *   Records: accounts $1,842.50 available + $6,120.00 protected across 2 accounts;
 *            income $3,200.00/mo, next expected 2026-10-28, 1 irregular;
 *            bills $1,744.00/mo over 4 (2 essential unfunded);
 *            subscriptions $17.98/mo, 3 active, 1 still marked Review, 1 planned to cancel;
 *            transactions $164.45 logged spending, 7 entries, last logged 2026-10-05;
 *            debt $1,840.00 over 1 debt, $62.00/mo minimum; savings $6,120.00 of $12,000.00, 1 goal.
 *   Bills:   Rent $1,450.00 (Paid 1 Oct), Electricity (no amount yet, day 14), Mobile phone $85.00,
 *            an insurance bill due on day 5.
 *   Debt:    Credit card, min $62.00, 24.99% APR.
 * Only the entries marked [ADDED] are not on those screens, and each is needed by a screen asked for:
 *   - the 4th subscription (Cancelled), so the four decisions all show;
 *   - the shared flags on Rent / Mobile phone / Streaming video, for the Shared Responsibility statement;
 *   - in variant "gaps": a Water bill with no due date and a stale savings balance, for Attention.
 * No figure is typed here that a screen shows: every total, bar width and "per month" is computed by the real code.
 */
import type { Account, Bill, Debt, IncomeSource, SavingsGoal, Subscription, Transaction, BillPayment } from "@/products/personal-finance-companion/state";

declare const __PFC_VARIANT__: "base" | "gaps";
declare const __PFC_BALANCE__: "household" | "alt";
const GAPS = __PFC_VARIANT__ === "gaps";
const ALT = __PFC_BALANCE__ === "alt";

let n = 0;
const stamp = () => `2026-09-${String(10 + n++).padStart(2, "0")}T09:00:00Z`;
const lifecycle = () => {
  const t = stamp();
  return { status: "ready" as const, needsReviewReason: null, source: "manual" as const, importSessionId: null, createdAt: t, updatedAt: t };
};
const notShared = { shared: false, sharedSplitPercent: null, settled: false, settledAt: null };

export const ACCOUNTS: Account[] = [
  {
    id: "acc-everyday", name: "Everyday account", type: "checking",
    // $1,842.50 as on the Records screen. The "alt" balance ([ADDED], flagged in CAPTURES.md) is the same account after pay day.
    currentBalanceMinorUnits: ALT ? 504250 : 184250,
    currency: "USD", availableForSpending: true, balanceAsOfDate: "2026-10-25", notes: null, ...lifecycle(),
  },
  {
    id: "acc-savings", name: "Savings account", type: "savings", currentBalanceMinorUnits: 612000, currency: "USD",
    availableForSpending: false, balanceAsOfDate: GAPS ? "2026-08-20" : "2026-10-25", notes: null, ...lifecycle(),
  },
];

export const INCOME: IncomeSource[] = [
  { id: "inc-salary", name: "Salary", amountMinorUnits: 320000, amountRangeMinorUnits: null, frequency: "monthly", nextExpectedDate: "2026-10-28", confidence: "confirmed", grossOrNet: "net", currency: "USD", ...lifecycle() },
  { id: "inc-side", name: "Side work", amountMinorUnits: null, amountRangeMinorUnits: null, frequency: "irregular", nextExpectedDate: null, confidence: "estimated", grossOrNet: "unknown", currency: "USD", ...lifecycle() },
];

const bill = (b: Partial<Bill> & Pick<Bill, "id" | "name" | "category">): Bill => ({
  amountMinorUnits: null, amountRangeMinorUnits: null, isVariable: false, dueRule: null, frequency: "monthly",
  essential: true, funded: false, currency: "USD", ...lifecycle(), ...notShared, ...b,
});
export const BILLS: Bill[] = [
  // Rent $1,450.00 (Bills screen); shared 50/50 [ADDED]
  bill({ id: "bill-rent", name: "Rent", category: "housing", amountMinorUnits: 145000, dueRule: { dayOfMonth: 1 }, funded: true, shared: true, sharedSplitPercent: 50 }),
  // Electricity: "No amount yet", due on day 14 (Bills screen)
  bill({ id: "bill-electricity", name: "Electricity", category: "utilities", isVariable: true, dueRule: { dayOfMonth: 14 }, funded: false }),
  // Mobile phone $85.00 (Bills screen); the due day is cut off on that screen
  bill({ id: "bill-phone", name: "Mobile phone", category: "phone", amountMinorUnits: 8500, dueRule: { dayOfMonth: 29 }, funded: false, shared: true, sharedSplitPercent: 50 }),
  // The 4th bill: "Due on day 5 · insurance"; $1,744.00 - 1,450.00 - 85.00 = $209.00
  bill({ id: "bill-insurance", name: "Home insurance", category: "insurance", amountMinorUnits: 20900, dueRule: { dayOfMonth: 5 }, funded: true }),
  ...(GAPS ? [bill({ id: "bill-water", name: "Water", category: "utilities", isVariable: true, dueRule: null, funded: false })] : []),
];

const sub = (s: Partial<Subscription> & Pick<Subscription, "id" | "name">): Subscription => ({
  amountMinorUnits: null, frequency: "monthly", renewalDate: null, decision: "keep", currency: "USD", ...lifecycle(), ...notShared, ...s,
});
export const SUBSCRIPTIONS: Subscription[] = [
  // $8.99 + $5.99 + $36.00 / 12 = $17.98 a month, the Records screen's figure
  sub({ id: "sub-video", name: "Streaming video", amountMinorUnits: 899, renewalDate: "2026-10-31", decision: "keep", shared: true, sharedSplitPercent: 50, settled: true, settledAt: "2026-10-20T08:00:00Z" }),
  sub({ id: "sub-music", name: "Music streaming", amountMinorUnits: 599, renewalDate: "2026-11-03", decision: "reviewing" }),
  sub({ id: "sub-cloud", name: "Cloud storage", amountMinorUnits: 3600, frequency: "annual", renewalDate: "2026-11-04", decision: "plannedCancellation" }),
  // [ADDED] already cancelled: not counted in the total or the active count
  sub({ id: "sub-books", name: "Audiobooks", amountMinorUnits: 1299, renewalDate: null, decision: "cancelled" }),
];

export const DEBTS: Debt[] = [
  { id: "debt-card", name: "Credit card", type: "creditCard", balanceMinorUnits: 184000, currency: "USD", interestRate: 24.99, minimumPaymentMinorUnits: 6200, dueDate: "2026-11-08", promotionalRate: null, promotionalExpiry: null, balanceAsOfDate: "2026-10-25", linkedAccountId: null, ...lifecycle() },
];

export const GOALS: SavingsGoal[] = [
  { id: "goal-emergency", name: "Emergency fund", type: "emergencyFund", targetAmountMinorUnits: 1200000, savedAmountMinorUnits: 612000, targetDate: "2027-10-31", recurring: false, currency: "USD", linkedAccountId: "acc-savings", ...lifecycle() },
];

const tx = (id: string, day: number, description: string, amount: number, category: string): Transaction => ({
  id, accountId: "acc-everyday", occurredOn: `2026-10-${String(day).padStart(2, "0")}`, description, amountMinorUnits: amount, direction: "debit", currency: "USD",
  category, pendingOrCleared: "cleared", externalId: null, transferPairId: null, excludedFromSpending: false, ...lifecycle(),
});
// Seven entries totalling $164.45, last logged 2026-10-05 (Records screen)
export const TRANSACTIONS: Transaction[] = [
  tx("tx-1", 1, "Groceries", 3810, "groceries"), tx("tx-2", 2, "Groceries", 2430, "groceries"), tx("tx-3", 2, "Pharmacy", 1895, "health"),
  tx("tx-4", 3, "Coffee", 650, "eating out"), tx("tx-5", 4, "Takeaway", 2280, "eating out"), tx("tx-6", 5, "Bus top-up", 1250, "transport"),
  tx("tx-7", 5, "Groceries", 4130, "groceries"),
];

/** Rent was ticked paid on 1 October (Bills screen: "Paid 1 Oct"). */
export const BILL_PAYMENTS: BillPayment[] = [{ id: "pay-rent-oct", billId: "bill-rent", period: "2026-10", paidOn: "2026-10-01" }];

export const TABLES: Record<string, unknown[]> = {
  pfc_accounts: ACCOUNTS, pfc_income_sources: INCOME, pfc_bills: BILLS, pfc_subscriptions: SUBSCRIPTIONS,
  pfc_debts: DEBTS, pfc_savings_goals: GOALS, pfc_transactions: TRANSACTIONS,
};
