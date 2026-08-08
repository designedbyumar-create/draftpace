import { NOTIFICATION_KIND_COPY, resolveNotificationDeepLink, type NotificationKindCopy, type PersonalFinanceCompanionNotificationKind } from "../notifications";
import type { PersonalFinanceCompanionReminderKind } from "../reminders";
import { resolveSafeDeepLink } from "../deepLinks";

/**
 * Honest-language copy for every reminder kind (Stage F §14) — Draftpace
 * states its own recorded expectation or the user's own stated intention,
 * never a claim about a real-world outcome it cannot actually know ("Rent
 * is due today", never "Your rent was not paid"). The five condition
 * kinds delegate to notifications.ts's existing copy rather than
 * duplicating it; only the date-based kinds are new here.
 */
const CONDITION_KINDS = new Set<PersonalFinanceCompanionReminderKind>([
  "billMissingDetail",
  "estimatedIncomeDatePassed",
  "balanceStale",
  "weeklyReviewDue",
  "importNeedsReview",
]);

const DATE_KIND_COPY: Partial<Record<PersonalFinanceCompanionReminderKind, NotificationKindCopy>> = {
  billDue: {
    generic: "A bill is due soon.",
    withName: (name, date) => (date ? `${name} is due on ${date}.` : `${name} is due soon.`),
    withAmount: (name, amount, date) => (date ? `${name} (${amount}) is due on ${date}.` : `${name} (${amount}) is due soon.`),
  },
  subscriptionRenewal: {
    generic: "A subscription renews soon.",
    withName: (name, date) => (date ? `${name} renews on ${date}.` : `${name} renews soon.`),
    withAmount: (name, amount, date) => (date ? `${name} (${amount}) renews on ${date}.` : `${name} (${amount}) renews soon.`),
  },
  plannedCancellation: {
    generic: "A planned cancellation is approaching.",
    withName: (name, date) => (date ? `You planned to cancel ${name} before it renews on ${date}.` : `You planned to cancel ${name} before it renews.`),
  },
  debtDue: {
    generic: "A debt payment is coming up.",
    withName: (name, date) => (date ? `${name} payment is due on ${date}.` : `${name} payment is coming up.`),
    withAmount: (name, amount, date) => (date ? `${name} minimum payment of ${amount} is due on ${date}.` : `${name} minimum payment of ${amount} is coming up.`),
  },
  promotionalRateExpiry: {
    generic: "A promotional rate is expiring soon.",
    withName: (name, date) => (date ? `${name}'s promotional rate expires on ${date}.` : `${name}'s promotional rate is expiring soon.`),
  },
};

export function reminderKindCopy(kind: PersonalFinanceCompanionReminderKind): NotificationKindCopy {
  if (CONDITION_KINDS.has(kind)) return NOTIFICATION_KIND_COPY[kind as PersonalFinanceCompanionNotificationKind];
  const copy = DATE_KIND_COPY[kind];
  if (copy) return copy;
  // userCreated: the user's own note is the message verbatim (see aggregate.ts), this generic is only a last-resort fallback.
  return { generic: "You asked to be reminded about something.", withName: (name) => name };
}

export function reminderDeepLink(
  kind: PersonalFinanceCompanionReminderKind,
  context: { billId?: string; incomeSourceId?: string; accountId?: string; importSessionId?: string; subscriptionId?: string; debtId?: string }
): string {
  if (CONDITION_KINDS.has(kind)) {
    return resolveNotificationDeepLink(kind as PersonalFinanceCompanionNotificationKind, context);
  }
  switch (kind) {
    case "billDue":
      return resolveSafeDeepLink({ kind: "area", area: "bills", focusId: context.billId });
    case "subscriptionRenewal":
    case "plannedCancellation":
      return resolveSafeDeepLink({ kind: "area", area: "subscriptions", focusId: context.subscriptionId });
    case "debtDue":
    case "promotionalRateExpiry":
      return resolveSafeDeepLink({ kind: "area", area: "debt", focusId: context.debtId });
    default:
      return resolveSafeDeepLink({ kind: "attention" });
  }
}
