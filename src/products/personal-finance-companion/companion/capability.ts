import type { Account, Bill, Debt, IncomeSource, SavingsGoal, Subscription, Transaction } from "../state";
import { summarizeBills } from "../components/bills/billLogic";
import { monthlyEquivalentMinorUnits as subscriptionMonthlyEquivalent } from "../components/subscriptions/subscriptionLogic";
import { summarizeDebts } from "../components/debt/debtLogic";
import { monthlyEquivalentMinorUnits as incomeMonthlyEquivalent } from "../components/income/incomeLogic";

/**
 * The deterministic financial-picture engine: every figure Companion and
 * Workspace show is computed here, from canonical records only, with no
 * AI involved and no invented calculation. This is the one place
 * "Available Money", "Expected Income", and "Upcoming Obligations" are
 * defined — Companion's capability grid, unlock moments, and Workspace's
 * headline figures all read from these same functions rather than each
 * inventing their own version of "is this ready yet".
 */

export type CapabilityStatus = "ready" | "needsInfo" | "waiting";

export interface ExplainLineItem {
  label: string;
  amountMinorUnits: number;
}

export interface ExplainBreakdown {
  lineItems: ExplainLineItem[];
  totalMinorUnits: number;
  basedOn: string[];
  caveat: string | null;
}

export interface CapabilityRow {
  key: "availableMoney" | "expectedIncome" | "upcomingObligations" | "spending" | "debt" | "savings";
  label: string;
  status: CapabilityStatus;
  detail: string;
  valueMinorUnits: number | null;
  explain: ExplainBreakdown | null;
}

export interface FinancialPictureInputs {
  accounts: Account[];
  incomeSources: IncomeSource[];
  bills: Bill[];
  subscriptions: Subscription[];
  transactions: Transaction[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
}

function activeOf<T extends { status: string }>(records: T[]): T[] {
  return records.filter((r) => r.status !== "archived");
}

/** The one definition of what is owed out each month, shared by Available Money and Upcoming Obligations so the two can never disagree. */
function obligationTotals(inputs: FinancialPictureInputs) {
  const billsTotal = summarizeBills(inputs.bills).totalMonthlyEquivalentMinorUnits;
  const subscriptionsTotal = activeOf(inputs.subscriptions)
    .filter((s) => s.decision !== "cancelled")
    .reduce((sum, s) => sum + (subscriptionMonthlyEquivalent(s) ?? 0), 0);
  const debtMinimumsTotal = summarizeDebts(inputs.debts).totalMinimumPaymentMinorUnits;
  return { billsTotal, subscriptionsTotal, debtMinimumsTotal, obligationsTotal: billsTotal + subscriptionsTotal + debtMinimumsTotal };
}

/** Where the money in your accounts goes, in the order the hero banner draws it. The four parts always add up to `totalMinorUnits`. */
export interface BalanceAllocation {
  totalMinorUnits: number;
  availableMinorUnits: number;
  billsAndSubscriptionsMinorUnits: number;
  debtMinimumsMinorUnits: number;
  protectedMinorUnits: number;
}

/** Null when there is no account to allocate. Uses the same obligation totals as Available Money, so the banner and the figure cannot disagree. */
export function balanceAllocation(inputs: FinancialPictureInputs): BalanceAllocation | null {
  const accounts = activeOf(inputs.accounts);
  if (accounts.length === 0) return null;
  const totalMinorUnits = accounts.reduce((sum, a) => sum + a.currentBalanceMinorUnits, 0);
  const protectedMinorUnits = accounts.filter((a) => !a.availableForSpending).reduce((sum, a) => sum + a.currentBalanceMinorUnits, 0);
  const { billsTotal, subscriptionsTotal, debtMinimumsTotal } = obligationTotals(inputs);
  return {
    totalMinorUnits,
    availableMinorUnits: totalMinorUnits - protectedMinorUnits - billsTotal - subscriptionsTotal - debtMinimumsTotal,
    billsAndSubscriptionsMinorUnits: billsTotal + subscriptionsTotal,
    debtMinimumsMinorUnits: debtMinimumsTotal,
    protectedMinorUnits,
  };
}

function availableMoney(inputs: FinancialPictureInputs): CapabilityRow {
  const accounts = activeOf(inputs.accounts);
  if (accounts.length === 0) {
    return { key: "availableMoney", label: "Available Money", status: "waiting", detail: "Waiting for an account", valueMinorUnits: null, explain: null };
  }

  const totalBalances = accounts.reduce((sum, a) => sum + a.currentBalanceMinorUnits, 0);
  const protectedTotal = accounts.filter((a) => !a.availableForSpending).reduce((sum, a) => sum + a.currentBalanceMinorUnits, 0);

  const { billsTotal, subscriptionsTotal, debtMinimumsTotal, obligationsTotal } = obligationTotals(inputs);
  const billsSummary = summarizeBills(inputs.bills);

  const total = totalBalances - protectedTotal - obligationsTotal;

  const explain: ExplainBreakdown = {
    lineItems: [
      { label: "All account balances", amountMinorUnits: totalBalances },
      { label: "Protected money", amountMinorUnits: -protectedTotal },
      { label: "Bills and subscriptions", amountMinorUnits: -(billsTotal + subscriptionsTotal) },
      ...(debtMinimumsTotal > 0 ? [{ label: "Debt minimum payments", amountMinorUnits: -debtMinimumsTotal }] : []),
    ],
    totalMinorUnits: total,
    basedOn: [`${accounts.length} confirmed ${accounts.length === 1 ? "account" : "accounts"}`],
    caveat: billsSummary.missingDueDateCount > 0
      ? `${billsSummary.missingDueDateCount} ${billsSummary.missingDueDateCount === 1 ? "bill is" : "bills are"} still missing a due date, so this figure is preliminary.`
      : null,
  };

  return {
    key: "availableMoney",
    label: "Available Money",
    status: "ready",
    detail: explain.caveat ?? "Ready",
    valueMinorUnits: total,
    explain,
  };
}

function expectedIncome(inputs: FinancialPictureInputs): CapabilityRow {
  const sources = activeOf(inputs.incomeSources);
  if (sources.length === 0) {
    return { key: "expectedIncome", label: "Expected Income", status: "waiting", detail: "Waiting for an income source", valueMinorUnits: null, explain: null };
  }

  const estimatedCount = sources.filter((s) => s.confidence === "estimated").length;
  const irregular = sources.filter((s) => s.frequency === "irregular");
  const counted = sources
    .map((source) => ({ source, monthly: incomeMonthlyEquivalent(source) }))
    .filter((entry): entry is { source: IncomeSource; monthly: number } => entry.monthly !== null);
  const total = counted.reduce((sum, entry) => sum + entry.monthly, 0);

  const caveats: string[] = [];
  if (estimatedCount > 0) caveats.push(`${estimatedCount} ${estimatedCount === 1 ? "figure is" : "figures are"} estimated, not confirmed.`);
  if (irregular.length > 0) caveats.push(`${irregular.length} irregular ${irregular.length === 1 ? "source is" : "sources are"} not counted.`);

  const explain: ExplainBreakdown = {
    lineItems: counted.map(({ source, monthly }) => ({
      label: source.frequency === "monthly" ? source.name : `${source.name} (monthly equivalent)`,
      amountMinorUnits: monthly,
    })),
    totalMinorUnits: total,
    basedOn: [`${sources.length} income ${sources.length === 1 ? "source" : "sources"}`],
    caveat: caveats.length > 0 ? caveats.join(" ") : null,
  };

  return {
    key: "expectedIncome",
    label: "Expected Income",
    status: "ready",
    detail: explain.caveat ?? "Ready",
    valueMinorUnits: total,
    explain,
  };
}

function upcomingObligations(inputs: FinancialPictureInputs): CapabilityRow {
  const bills = activeOf(inputs.bills);
  const subscriptions = activeOf(inputs.subscriptions).filter((s) => s.decision !== "cancelled");
  const debts = activeOf(inputs.debts);
  if (bills.length === 0 && subscriptions.length === 0 && debts.length === 0) {
    return { key: "upcomingObligations", label: "Upcoming Obligations", status: "waiting", detail: "Waiting for a bill or subscription", valueMinorUnits: null, explain: null };
  }

  const billsSummary = summarizeBills(inputs.bills);
  const { billsTotal, subscriptionsTotal, debtMinimumsTotal, obligationsTotal: total } = obligationTotals(inputs);

  const status: CapabilityStatus = billsSummary.missingDueDateCount > 0 ? "needsInfo" : "ready";
  const detail = billsSummary.missingDueDateCount > 0
    ? `Needs ${billsSummary.missingDueDateCount} due ${billsSummary.missingDueDateCount === 1 ? "date" : "dates"}`
    : "Ready";

  const explain: ExplainBreakdown = {
    lineItems: [
      { label: "Bills (monthly equivalent)", amountMinorUnits: billsTotal },
      { label: "Subscriptions (monthly equivalent)", amountMinorUnits: subscriptionsTotal },
      ...(debtMinimumsTotal > 0 ? [{ label: "Debt minimum payments", amountMinorUnits: debtMinimumsTotal }] : []),
    ],
    totalMinorUnits: total,
    basedOn: [
      `${bills.length} ${bills.length === 1 ? "bill" : "bills"}`,
      `${subscriptions.length} active ${subscriptions.length === 1 ? "subscription" : "subscriptions"}`,
      ...(debts.length > 0 ? [`${debts.length} ${debts.length === 1 ? "debt" : "debts"}`] : []),
    ],
    caveat: billsSummary.missingDueDateCount > 0 ? detail + " confirmed, so this figure is preliminary." : null,
  };

  return { key: "upcomingObligations", label: "Upcoming Obligations", status, detail, valueMinorUnits: total, explain };
}

function spending(inputs: FinancialPictureInputs): CapabilityRow {
  const transactions = activeOf(inputs.transactions);
  if (transactions.length === 0) {
    return { key: "spending", label: "Spending", status: "waiting", detail: "Waiting for transactions", valueMinorUnits: null, explain: null };
  }
  const total = transactions
    .filter((t) => !t.excludedFromSpending && t.direction === "debit")
    .reduce((sum, t) => sum + t.amountMinorUnits, 0);
  return {
    key: "spending",
    label: "Spending",
    status: "ready",
    detail: "Ready",
    valueMinorUnits: total,
    explain: {
      lineItems: [{ label: "Recorded spending", amountMinorUnits: total }],
      totalMinorUnits: total,
      basedOn: [`${transactions.length} recorded ${transactions.length === 1 ? "transaction" : "transactions"}`],
      caveat: null,
    },
  };
}

function debt(inputs: FinancialPictureInputs): CapabilityRow {
  const debts = activeOf(inputs.debts);
  if (debts.length === 0) {
    return { key: "debt", label: "Debt", status: "waiting", detail: "Waiting for a debt", valueMinorUnits: null, explain: null };
  }
  const summary = summarizeDebts(inputs.debts);
  const status: CapabilityStatus = summary.missingInterestRateCount > 0 ? "needsInfo" : "ready";
  const detail = summary.missingInterestRateCount > 0
    ? `Missing interest rate on ${summary.missingInterestRateCount} ${summary.missingInterestRateCount === 1 ? "debt" : "debts"}`
    : "Ready";
  return {
    key: "debt",
    label: "Debt",
    status,
    detail,
    valueMinorUnits: summary.totalBalanceMinorUnits,
    explain: {
      lineItems: [
        { label: "Total balance", amountMinorUnits: summary.totalBalanceMinorUnits },
        { label: "Minimum payments", amountMinorUnits: summary.totalMinimumPaymentMinorUnits },
      ],
      totalMinorUnits: summary.totalBalanceMinorUnits,
      basedOn: [`${debts.length} recorded ${debts.length === 1 ? "debt" : "debts"}`],
      caveat: status === "needsInfo" ? detail + ". Payoff timelines can't be calculated reliably until it's added." : null,
    },
  };
}

function savings(inputs: FinancialPictureInputs): CapabilityRow {
  const goals = activeOf(inputs.savingsGoals);
  if (goals.length === 0) {
    return { key: "savings", label: "Savings", status: "waiting", detail: "Waiting for a savings goal", valueMinorUnits: null, explain: null };
  }
  const missingTargetDate = goals.filter((g) => !g.targetDate).length;
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmountMinorUnits, 0);
  const status: CapabilityStatus = missingTargetDate > 0 ? "needsInfo" : "ready";
  const detail = missingTargetDate > 0 ? "Missing a target date" : "Ready";
  return {
    key: "savings",
    label: "Savings",
    status,
    detail,
    valueMinorUnits: totalSaved,
    explain: {
      lineItems: goals.map((g) => ({ label: g.name, amountMinorUnits: g.savedAmountMinorUnits })),
      totalMinorUnits: totalSaved,
      basedOn: [`${goals.length} savings ${goals.length === 1 ? "goal" : "goals"}`],
      caveat: missingTargetDate > 0 ? `${missingTargetDate} ${missingTargetDate === 1 ? "goal doesn't" : "goals don't"} have a target date yet, so a monthly contribution can't be calculated for it.` : null,
    },
  };
}

/** The six capability rows Companion's readiness grid and Workspace's headline figures both read from. Order matches the "Your financial picture" presentation. */
export function computeCapabilities(inputs: FinancialPictureInputs): CapabilityRow[] {
  return [availableMoney(inputs), expectedIncome(inputs), upcomingObligations(inputs), spending(inputs), debt(inputs), savings(inputs)];
}

/** True once every capability that has any data at all is fully ready — used only for framing, never to force further data entry. */
export function allReady(rows: CapabilityRow[]): boolean {
  return rows.every((r) => r.status !== "needsInfo");
}
