import type { AttentionItem } from "../attention";
import { resolveSafeDeepLink } from "../deepLinks";
import type { CapabilityRow } from "./capability";

/**
 * The single dominant next action Workspace leads with (launch spec Stage E
 * §E3) — deterministic, documented priority order, never AI-decided and
 * never a rotating tip. Exactly one of these checks fires per call, in this
 * fixed order, because a user should never be shown two "most important"
 * things at once. Every check reads only from state already computed
 * elsewhere (capability.ts, attention.ts, or a plain count) — this module
 * adds no new judgment about what's wrong, only a priority ordering over
 * judgments that already exist.
 *
 * Priority (highest first):
 *  1. Available Money is negative — obligations exceed what's actually available.
 *  2. An income expectation is overdue (attention: incomeExpectationOverdue).
 *  3. A bill is missing information needed to plan around it (attention: billMissingDueDate).
 *  4. A planned subscription cancellation is approaching its renewal (attention: subscriptionCancellationApproaching).
 *  5. Imported candidates are waiting for review — nothing from an import becomes real until reviewed.
 *  6. An account balance is stale (attention: accountStale).
 *  7. A debt is missing the rate needed to reason about payoff (attention: debtMissingRate).
 *  8. A savings goal is missing a target date (attention: savingsMissingTarget).
 *  9. A subscription is still marked "reviewing" (attention: subscriptionReview).
 * 10. A transaction is missing a category (attention: transactionMissingCategory).
 * 11. Nothing needs attention, but the financial picture isn't fully built yet — continue Companion.
 * 12. Nothing needs attention and the picture is complete — no dominant action (null).
 */

export interface DominantAction {
  message: string;
  deepLink: string;
}

function findAttention(items: AttentionItem[], kind: AttentionItem["kind"]): AttentionItem | undefined {
  return items.find((item) => item.kind === kind);
}

export function resolveDominantAction(
  capabilities: CapabilityRow[],
  attentionItems: AttentionItem[],
  unreviewedImportCandidateCount: number
): DominantAction | null {
  const availableMoney = capabilities.find((row) => row.key === "availableMoney");
  if (availableMoney && availableMoney.valueMinorUnits !== null && availableMoney.valueMinorUnits < 0) {
    return {
      message: "Available Money is negative right now — what's coming up costs more than what you have available.",
      deepLink: resolveSafeDeepLink({ kind: "area", area: "accounts" }),
    };
  }

  const incomeOverdue = findAttention(attentionItems, "incomeExpectationOverdue");
  if (incomeOverdue) return { message: incomeOverdue.message, deepLink: incomeOverdue.deepLink };

  const billMissingDueDate = findAttention(attentionItems, "billMissingDueDate");
  if (billMissingDueDate) return { message: billMissingDueDate.message, deepLink: billMissingDueDate.deepLink };

  const cancellationApproaching = findAttention(attentionItems, "subscriptionCancellationApproaching");
  if (cancellationApproaching) return { message: cancellationApproaching.message, deepLink: cancellationApproaching.deepLink };

  if (unreviewedImportCandidateCount > 0) {
    return {
      message: `${unreviewedImportCandidateCount} imported ${unreviewedImportCandidateCount === 1 ? "record is" : "records are"} waiting for review.`,
      deepLink: resolveSafeDeepLink({ kind: "companionResume" }),
    };
  }

  const accountStale = findAttention(attentionItems, "accountStale");
  if (accountStale) return { message: accountStale.message, deepLink: accountStale.deepLink };

  const debtMissingRate = findAttention(attentionItems, "debtMissingRate");
  if (debtMissingRate) return { message: debtMissingRate.message, deepLink: debtMissingRate.deepLink };

  const savingsMissingTarget = findAttention(attentionItems, "savingsMissingTarget");
  if (savingsMissingTarget) return { message: savingsMissingTarget.message, deepLink: savingsMissingTarget.deepLink };

  const subscriptionReview = findAttention(attentionItems, "subscriptionReview");
  if (subscriptionReview) return { message: subscriptionReview.message, deepLink: subscriptionReview.deepLink };

  const transactionMissingCategory = findAttention(attentionItems, "transactionMissingCategory");
  if (transactionMissingCategory) return { message: transactionMissingCategory.message, deepLink: transactionMissingCategory.deepLink };

  if (capabilities.some((row) => row.status === "waiting")) {
    return { message: "Continue building your financial picture with Companion.", deepLink: resolveSafeDeepLink({ kind: "companionResume" }) };
  }

  return null;
}
