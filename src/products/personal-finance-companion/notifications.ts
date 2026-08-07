/**
 * Personal Finance Companion's notification CONTRACT — deliberately an
 * interface only, no sending logic, no permission request, no
 * subscription persistence. The PWA audit confirmed Draftpace's existing
 * notification routes (src/app/api/notifications/{subscribe,test,cron})
 * are non-functional stubs: subscribe never writes to a database (no
 * `notifications`/`push_subscriptions` table exists), test never sends a
 * real push, cron does no work. Building a real Web Push/VAPID platform
 * during this infrastructure session would be exactly the "quietly build
 * an entire push platform" the task instructions explicitly forbid.
 *
 * What this file establishes instead: the shape a future real platform
 * would need to support this product's five notification kinds (launch
 * spec's "PWA notification readiness" section), and the deep-link target
 * each kind resolves to, so that platform work — whenever it happens —
 * has a concrete contract to implement against rather than starting from
 * nothing. See ProductDefinition.notifications (declarative-only today,
 * per src/product-framework/definition.ts) for where "supported" would
 * flip to true once a real platform exists.
 */

export type PersonalFinanceCompanionNotificationKind =
  | "billMissingDetail"
  | "estimatedIncomeDatePassed"
  | "balanceStale"
  | "weeklyReviewDue"
  | "importNeedsReview";

export interface PersonalFinanceCompanionNotificationPreferences {
  billMissingDetail: boolean;
  estimatedIncomeDatePassed: boolean;
  balanceStale: boolean;
  weeklyReviewDue: boolean;
  importNeedsReview: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: PersonalFinanceCompanionNotificationPreferences = {
  billMissingDetail: false,
  estimatedIncomeDatePassed: false,
  balanceStale: false,
  weeklyReviewDue: false,
  importNeedsReview: false,
};

/** Where a notification of this kind should deep-link to once a real platform exists. Never a bare "/app" — the launch spec requires linking to the exact relevant task. */
export function resolveNotificationDeepLink(
  kind: PersonalFinanceCompanionNotificationKind,
  context: { billId?: string; incomeSourceId?: string; accountId?: string; importSessionId?: string }
): string {
  const base = "/app/products/personal-finance-companion";
  switch (kind) {
    case "billMissingDetail":
      return context.billId ? `${base}/bills?focus=${context.billId}` : `${base}/bills`;
    case "estimatedIncomeDatePassed":
      return context.incomeSourceId ? `${base}/income?focus=${context.incomeSourceId}` : `${base}/income`;
    case "balanceStale":
      return context.accountId ? `${base}/accounts?focus=${context.accountId}` : `${base}/accounts`;
    case "weeklyReviewDue":
      return `${base}/setup-centre`;
    case "importNeedsReview":
      return context.importSessionId ? `${base}/setup?import=${context.importSessionId}` : `${base}/setup`;
  }
}
