import type { Account, Bill, Debt, FinancialArea, IncomeSource, SavingsGoal, Subscription, Transaction } from "./state";
import { isStale } from "./components/accounts/accountLogic";
import { resolveSafeDeepLink } from "./deepLinks";

/**
 * The shared Attention domain: one deterministic derivation of "what needs
 * a look", built from the same record state and the same per-entity
 * incompleteness rules the direct sections already use (see accountLogic/
 * billLogic/debtLogic/savingsLogic) — not a second, parallel judgment of
 * what's wrong. This is architecture for Workspace's Attention panel,
 * Companion's continuation prompts, and a future notification/reminder
 * system to read from a single source, not three separate opinions of the
 * same issue. No UI is built against this yet beyond what Companion/
 * Workspace need this stage.
 */

export type AttentionKind =
  | "accountStale"
  | "billMissingDueDate"
  | "subscriptionReview"
  | "subscriptionCancellationApproaching"
  | "debtMissingRate"
  | "savingsMissingTarget"
  | "transactionMissingCategory"
  | "incomeExpectationOverdue";

/** Which of the six capability areas an item belongs to, for urgency/grouping presentation. Not a new judgment — a fixed mapping off `kind`. */
export type AttentionUrgency = "needsResolution" | "worthAWhile";

const URGENCY_BY_KIND: Record<AttentionKind, AttentionUrgency> = {
  incomeExpectationOverdue: "needsResolution",
  billMissingDueDate: "needsResolution",
  subscriptionCancellationApproaching: "needsResolution",
  debtMissingRate: "worthAWhile",
  savingsMissingTarget: "worthAWhile",
  accountStale: "worthAWhile",
  subscriptionReview: "worthAWhile",
  transactionMissingCategory: "worthAWhile",
};

export interface AttentionItem {
  /** Stable across renders/sessions — `${kind}:${entityId}` — the identity a future dedupe/snooze/acknowledge layer would key on. */
  id: string;
  kind: AttentionKind;
  urgency: AttentionUrgency;
  area: FinancialArea;
  entityId: string;
  message: string;
  deepLink: string;
}

const CANCELLATION_APPROACHING_DAYS = 14;

function daysUntil(dateIso: string, now: Date): number {
  const target = new Date(`${dateIso}T00:00:00Z`);
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export interface AttentionInputs {
  accounts: Account[];
  incomeSources: IncomeSource[];
  bills: Bill[];
  subscriptions: Subscription[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  transactions: Transaction[];
}

/** Deterministic — never invents an issue that isn't derivable from real record fields, and never duplicates the same underlying fact under two kinds. */
export function deriveAttentionItems(inputs: AttentionInputs, now: Date = new Date()): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const account of inputs.accounts) {
    if (account.status === "archived") continue;
    if (isStale(account, now)) {
      items.push({
        id: `accountStale:${account.id}`,
        kind: "accountStale",
        urgency: URGENCY_BY_KIND.accountStale,
        area: "accounts",
        entityId: account.id,
        message: `${account.name} balance has not been updated recently.`,
        deepLink: resolveSafeDeepLink({ kind: "area", area: "accounts", focusId: account.id }),
      });
    }
  }

  for (const source of inputs.incomeSources) {
    if (source.status === "archived") continue;
    if (source.nextExpectedDate) {
      const days = daysUntil(source.nextExpectedDate, now);
      if (days < 0) {
        items.push({
          id: `incomeExpectationOverdue:${source.id}`,
          kind: "incomeExpectationOverdue",
          urgency: URGENCY_BY_KIND.incomeExpectationOverdue,
          area: "income",
          entityId: source.id,
          message: `${source.name} was expected on ${source.nextExpectedDate}. Confirm it or update the expected date.`,
          deepLink: resolveSafeDeepLink({ kind: "area", area: "income", focusId: source.id }),
        });
      }
    }
  }

  for (const bill of inputs.bills) {
    if (bill.status === "archived") continue;
    if (!bill.dueRule) {
      items.push({
        id: `billMissingDueDate:${bill.id}`,
        kind: "billMissingDueDate",
        urgency: URGENCY_BY_KIND.billMissingDueDate,
        area: "bills",
        entityId: bill.id,
        message: `${bill.name} needs a due date.`,
        deepLink: resolveSafeDeepLink({ kind: "area", area: "bills", focusId: bill.id }),
      });
    }
  }

  for (const subscription of inputs.subscriptions) {
    if (subscription.status === "archived") continue;
    if (subscription.decision === "reviewing") {
      items.push({
        id: `subscriptionReview:${subscription.id}`,
        kind: "subscriptionReview",
        urgency: URGENCY_BY_KIND.subscriptionReview,
        area: "subscriptions",
        entityId: subscription.id,
        message: `${subscription.name} is still marked Review.`,
        deepLink: resolveSafeDeepLink({ kind: "area", area: "subscriptions", focusId: subscription.id }),
      });
    }
    if (subscription.decision === "plannedCancellation" && subscription.renewalDate) {
      const days = daysUntil(subscription.renewalDate, now);
      if (days >= 0 && days <= CANCELLATION_APPROACHING_DAYS) {
        items.push({
          id: `subscriptionCancellationApproaching:${subscription.id}`,
          kind: "subscriptionCancellationApproaching",
          urgency: URGENCY_BY_KIND.subscriptionCancellationApproaching,
          area: "subscriptions",
          entityId: subscription.id,
          message: `You planned to cancel ${subscription.name} before it renews on ${subscription.renewalDate}.`,
          deepLink: resolveSafeDeepLink({ kind: "area", area: "subscriptions", focusId: subscription.id }),
        });
      }
    }
  }

  for (const debt of inputs.debts) {
    if (debt.status === "archived") continue;
    if (debt.interestRate === null) {
      items.push({
        id: `debtMissingRate:${debt.id}`,
        kind: "debtMissingRate",
        urgency: URGENCY_BY_KIND.debtMissingRate,
        area: "debt",
        entityId: debt.id,
        message: `${debt.name} is missing an interest rate.`,
        deepLink: resolveSafeDeepLink({ kind: "area", area: "debt", focusId: debt.id }),
      });
    }
  }

  for (const goal of inputs.savingsGoals) {
    if (goal.status === "archived") continue;
    if (!goal.targetDate) {
      items.push({
        id: `savingsMissingTarget:${goal.id}`,
        kind: "savingsMissingTarget",
        urgency: URGENCY_BY_KIND.savingsMissingTarget,
        area: "savings",
        entityId: goal.id,
        message: `${goal.name} is missing a target date.`,
        deepLink: resolveSafeDeepLink({ kind: "area", area: "savings", focusId: goal.id }),
      });
    }
  }

  for (const transaction of inputs.transactions) {
    if (transaction.status === "archived" || transaction.excludedFromSpending) continue;
    if (!transaction.category) {
      items.push({
        id: `transactionMissingCategory:${transaction.id}`,
        kind: "transactionMissingCategory",
        urgency: URGENCY_BY_KIND.transactionMissingCategory,
        area: "transactions",
        entityId: transaction.id,
        message: `${transaction.description} needs a category.`,
        deepLink: resolveSafeDeepLink({ kind: "area", area: "transactions", focusId: transaction.id }),
      });
    }
  }

  return items;
}

/** Groups by area for an aggregated presentation ("2 accounts and 1 debt balance may be outdated") rather than one line per record — the anti-spam shape §22 asks for, built now since the grouping is free once items are typed by area. */
export function summarizeAttentionByArea(items: AttentionItem[]): { area: FinancialArea; count: number }[] {
  const counts = new Map<FinancialArea, number>();
  for (const item of items) counts.set(item.area, (counts.get(item.area) ?? 0) + 1);
  return Array.from(counts.entries()).map(([area, count]) => ({ area, count }));
}
