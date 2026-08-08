import type { Account, Bill, Debt, IncomeSource, SavingsGoal, Subscription, Transaction } from "../state";
import { summarizeBills } from "../components/bills/billLogic";
import { monthlyEquivalentMinorUnits as subscriptionMonthlyEquivalent } from "../components/subscriptions/subscriptionLogic";
import { summarizeDebts } from "../components/debt/debtLogic";

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

function availableMoney(inputs: FinancialPictureInputs): CapabilityRow {
  const accounts = activeOf(inputs.accounts);
  if (accounts.length === 0) {
    return { key: "availableMoney", label: "Available Money", status: "waiting", detail: "Waiting for an account", valueMinorUnits: null, explain: null };
  }

  const totalBalances = accounts.reduce((sum, a) => sum + a.currentBalanceMinorUnits, 0);
  const protectedTotal = accounts.filter((a) => !a.availableForSpending).reduce((sum, a) => sum + a.currentBalanceMinorUnits, 0);

  const billsSummary = summarizeBills(inputs.bills);
  const subscriptionsTotal = activeOf(inputs.subscriptions)
    .filter((s) => s.decision !== "cancelled")
    .reduce((sum, s) => sum + (subscriptionMonthlyEquivalent(s) ?? 0), 0);
  const obligationsTotal = billsSummary.totalMonthlyEquivalentMinorUnits + subscriptionsTotal;

  const total = totalBalances - protectedTotal - obligationsTotal;

  const explain: ExplainBreakdown = {
    lineItems: [
      { label: "All account balances", amountMinorUnits: totalBalances },
      { label: "Protected money", amountMinorUnits: -protectedTotal },
      { label: "Upcoming obligations", amountMinorUnits: -obligationsTotal },
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
  const total = sources.reduce((sum, s) => {
    if (s.amountMinorUnits !== null) return sum + s.amountMinorUnits;
    if (s.amountRangeMinorUnits) return sum + Math.round((s.amountRangeMinorUnits.min + s.amountRangeMinorUnits.max) / 2);
    return sum;
  }, 0);

  const explain: ExplainBreakdown = {
    lineItems: sources.map((s) => ({
      label: s.name,
      amountMinorUnits: s.amountMinorUnits ?? Math.round(((s.amountRangeMinorUnits?.min ?? 0) + (s.amountRangeMinorUnits?.max ?? 0)) / 2),
    })),
    totalMinorUnits: total,
    basedOn: [`${sources.length} income ${sources.length === 1 ? "source" : "sources"}`],
    caveat: estimatedCount > 0 ? `${estimatedCount} ${estimatedCount === 1 ? "figure is" : "figures are"} estimated, not confirmed.` : null,
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
  if (bills.length === 0 && subscriptions.length === 0) {
    return { key: "upcomingObligations", label: "Upcoming Obligations", status: "waiting", detail: "Waiting for a bill or subscription", valueMinorUnits: null, explain: null };
  }

  const billsSummary = summarizeBills(inputs.bills);
  const subscriptionsTotal = subscriptions.reduce((sum, s) => sum + (subscriptionMonthlyEquivalent(s) ?? 0), 0);
  const total = billsSummary.totalMonthlyEquivalentMinorUnits + subscriptionsTotal;

  const status: CapabilityStatus = billsSummary.missingDueDateCount > 0 ? "needsInfo" : "ready";
  const detail = billsSummary.missingDueDateCount > 0
    ? `Needs ${billsSummary.missingDueDateCount} due ${billsSummary.missingDueDateCount === 1 ? "date" : "dates"}`
    : "Ready";

  const explain: ExplainBreakdown = {
    lineItems: [
      { label: "Bills (monthly equivalent)", amountMinorUnits: billsSummary.totalMonthlyEquivalentMinorUnits },
      { label: "Subscriptions (monthly equivalent)", amountMinorUnits: subscriptionsTotal },
    ],
    totalMinorUnits: total,
    basedOn: [`${bills.length} ${bills.length === 1 ? "bill" : "bills"}`, `${subscriptions.length} active ${subscriptions.length === 1 ? "subscription" : "subscriptions"}`],
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
      caveat: status === "needsInfo" ? detail + " — payoff timelines can't be calculated reliably until it's added." : null,
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
