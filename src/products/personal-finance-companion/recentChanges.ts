import type { FinancialArea } from "./state";
import type { FinancialPictureInputs } from "./companion/capability";

/**
 * "Recent changes" for Workspace (launch spec Stage E §E8): a small set of
 * grouped, human sentences ("3 transactions imported", "1 bill updated"),
 * never one line per record and never every CRUD event — a single edit to
 * one bill is not "recent activity" worth a permanent line, but a batch of
 * new records is. Reads only `createdAt`/`updatedAt` already on every
 * canonical record; adds no new tracking table or event log, and this
 * module itself never logs or reports anything externally — it only
 * renders a summary back to the owner who already has full access to the
 * underlying records.
 */

const RECENT_WINDOW_DAYS = 7;

const AREA_LABEL: Record<FinancialArea, { singular: string; plural: string }> = {
  accounts: { singular: "account", plural: "accounts" },
  income: { singular: "income source", plural: "income sources" },
  bills: { singular: "bill", plural: "bills" },
  subscriptions: { singular: "subscription", plural: "subscriptions" },
  debt: { singular: "debt", plural: "debts" },
  savings: { singular: "savings goal", plural: "savings goals" },
  transactions: { singular: "transaction", plural: "transactions" },
};

export interface RecentChangeSummary {
  area: FinancialArea;
  message: string;
}

function daysSinceTimestamp(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function countChanges(
  records: { status: string; createdAt: string; updatedAt: string }[],
  now: Date
): { added: number; updated: number } {
  let added = 0;
  let updated = 0;
  for (const record of records) {
    if (record.status === "archived") continue;
    if (daysSinceTimestamp(record.createdAt, now) < RECENT_WINDOW_DAYS) {
      added += 1;
    } else if (daysSinceTimestamp(record.updatedAt, now) < RECENT_WINDOW_DAYS) {
      updated += 1;
    }
  }
  return { added, updated };
}

function describe(area: FinancialArea, added: number, updated: number): RecentChangeSummary | null {
  const label = AREA_LABEL[area];
  const parts: string[] = [];
  if (added > 0) parts.push(`${added} ${added === 1 ? label.singular : label.plural} added`);
  if (updated > 0) parts.push(`${updated} ${updated === 1 ? label.singular : label.plural} updated`);
  if (parts.length === 0) return null;
  return { area, message: parts.join(", ") };
}

/** Grouped by area, in the same order Companion's areas are presented. Only areas with real activity in the window appear. */
export function summarizeRecentChanges(inputs: FinancialPictureInputs, now: Date = new Date()): RecentChangeSummary[] {
  const summaries: RecentChangeSummary[] = [];

  const accounts = countChanges(inputs.accounts, now);
  const account = describe("accounts", accounts.added, accounts.updated);
  if (account) summaries.push(account);

  const income = countChanges(inputs.incomeSources, now);
  const incomeSummary = describe("income", income.added, income.updated);
  if (incomeSummary) summaries.push(incomeSummary);

  const bills = countChanges(inputs.bills, now);
  const billSummary = describe("bills", bills.added, bills.updated);
  if (billSummary) summaries.push(billSummary);

  const subscriptions = countChanges(inputs.subscriptions, now);
  const subscriptionSummary = describe("subscriptions", subscriptions.added, subscriptions.updated);
  if (subscriptionSummary) summaries.push(subscriptionSummary);

  const debts = countChanges(inputs.debts, now);
  const debtSummary = describe("debt", debts.added, debts.updated);
  if (debtSummary) summaries.push(debtSummary);

  const savingsGoals = countChanges(inputs.savingsGoals, now);
  const savingsSummary = describe("savings", savingsGoals.added, savingsGoals.updated);
  if (savingsSummary) summaries.push(savingsSummary);

  const transactions = countChanges(inputs.transactions, now);
  const transactionSummary = describe("transactions", transactions.added, transactions.updated);
  if (transactionSummary) summaries.push(transactionSummary);

  return summaries;
}
