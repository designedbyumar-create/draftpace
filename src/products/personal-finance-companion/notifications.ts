import { resolveSafeDeepLink } from "./deepLinks";
import type { NotificationCategory } from "./notificationPreferences";

/**
 * Personal Finance Companion's notification CONTRACT — deliberately an
 * interface only, no sending logic, no permission request, no
 * subscription persistence. Draftpace's existing notification routes
 * (src/app/api/notifications/{subscribe,test,cron}) remain non-functional
 * stubs; building a real Web Push/VAPID platform is explicitly out of
 * scope here. See ProductDefinition.notifications (declarative-only,
 * src/product-framework/definition.ts) for where "supported" would flip
 * to true once a real platform exists — it does not flip here.
 *
 * Two related but distinct ideas live in this product's notification
 * architecture, kept separate on purpose:
 *   - a notification KIND: the specific triggering event (this file)
 *   - a preference CATEGORY: the broader bucket a user opts into
 *     (notificationPreferences.ts) — several kinds can map to one category
 * Collapsing them into one model would force "turn on all bill
 * notifications" and "turn on this one specific bill's reminder" to be
 * the same toggle, which they should not be.
 */

export type PersonalFinanceCompanionNotificationKind =
  | "billMissingDetail"
  | "estimatedIncomeDatePassed"
  | "balanceStale"
  | "weeklyReviewDue"
  | "importNeedsReview";

/** §17: not every event deserves a push. PROGRESS events are in-app-only by default. */
export type NotificationTier = "action" | "upcoming" | "attention" | "review" | "progress";

export const NOTIFICATION_KIND_TIER: Record<PersonalFinanceCompanionNotificationKind, NotificationTier> = {
  billMissingDetail: "attention",
  estimatedIncomeDatePassed: "attention",
  balanceStale: "attention",
  weeklyReviewDue: "review",
  importNeedsReview: "review",
};

export const NOTIFICATION_KIND_CATEGORY: Record<PersonalFinanceCompanionNotificationKind, NotificationCategory> = {
  billMissingDetail: "billsAndObligations",
  estimatedIncomeDatePassed: "expectedIncome",
  balanceStale: "recordFreshness",
  weeklyReviewDue: "financialReviewRhythm",
  importNeedsReview: "transactionReview",
};

/** Where a notification of this kind should deep-link to once a real platform exists. Never a bare "/app" — the exact relevant task, not a section list, whenever a record id is available. */
export function resolveNotificationDeepLink(
  kind: PersonalFinanceCompanionNotificationKind,
  context: { billId?: string; incomeSourceId?: string; accountId?: string; importSessionId?: string }
): string {
  switch (kind) {
    case "billMissingDetail":
      return resolveSafeDeepLink({ kind: "area", area: "bills", focusId: context.billId });
    case "estimatedIncomeDatePassed":
      return resolveSafeDeepLink({ kind: "area", area: "income", focusId: context.incomeSourceId });
    case "balanceStale":
      return resolveSafeDeepLink({ kind: "area", area: "accounts", focusId: context.accountId });
    case "weeklyReviewDue":
      return resolveSafeDeepLink({ kind: "setupCentre" });
    case "importNeedsReview":
      return resolveSafeDeepLink({ kind: "companionResume" });
  }
}

/**
 * Honest-language copy templates (§18): Draftpace never claims to know
 * what happened in the real world, only what it expects or what the user
 * told it. Each kind's copy states the expectation or the user's own
 * stated intention, never a claim about a real-world outcome Draftpace
 * cannot actually know.
 */
export interface NotificationKindCopy {
  generic: string;
  /** `detail` carries a second fact (a date, most often) some kinds need alongside the record name — unused by kinds that don't need it. */
  withName: (name: string, detail?: string) => string;
  /** Only present for kinds with a natural single amount (a bill, a debt payment) — used at privacy level "detailed" only, per renderAtPrivacyLevel. */
  withAmount?: (name: string, amount: string, detail?: string) => string;
}

export const NOTIFICATION_KIND_COPY: Record<PersonalFinanceCompanionNotificationKind, NotificationKindCopy> = {
  billMissingDetail: {
    generic: "A bill needs a due date.",
    withName: (name) => `${name} needs a due date.`,
  },
  estimatedIncomeDatePassed: {
    generic: "Expected income needs confirming.",
    withName: (name) => `${name} was expected. Confirm it or update the expected date.`,
  },
  balanceStale: {
    generic: "An account balance has not been updated recently.",
    withName: (name) => `${name} has not been updated recently.`,
  },
  weeklyReviewDue: {
    generic: "A financial review is ready whenever you are.",
    withName: () => "A financial review is ready whenever you are.",
  },
  importNeedsReview: {
    generic: "Something needs your review.",
    withName: () => "Something needs your review.",
  },
};
