import { z } from "zod";

/**
 * Product-specific notification preference architecture (launch spec
 * Stage C, sections 16-19, 23). This is consent/preference state only —
 * "what would matter enough to remember", not a subscription or a queue.
 * No OS/browser Push permission is requested anywhere in this file or by
 * anything that reads it; see notifications.ts's existing comment on why
 * ProductDefinition.notifications.supported stays false. Distinguishing
 * this from OS/browser permission (generic Draftpace's job, not this
 * product's) is the whole point of section 16's "two separate things" —
 * PFC owns what finance events matter, never the transport permission
 * itself.
 */

export const notificationCategorySchema = z.enum([
  "billsAndObligations",
  "subscriptionRenewals",
  "plannedCancellations",
  "expectedIncome",
  "transactionReview",
  "debtDates",
  "promotionalRateExpiry",
  "savingsReminders",
  "recordFreshness",
  "financialReviewRhythm",
]);
export type NotificationCategory = z.infer<typeof notificationCategorySchema>;

export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
  billsAndObligations: "Bills & obligations",
  subscriptionRenewals: "Subscription renewals",
  plannedCancellations: "Planned cancellations",
  expectedIncome: "Expected income",
  transactionReview: "Transactions that need review",
  debtDates: "Debt dates",
  promotionalRateExpiry: "Promotional-rate expiry",
  savingsReminders: "Savings reminders",
  recordFreshness: "Record freshness (stale balances)",
  financialReviewRhythm: "Financial review rhythm",
};

export const notificationPrivacyLevelSchema = z.enum(["private", "normal", "detailed"]);
export type NotificationPrivacyLevel = z.infer<typeof notificationPrivacyLevelSchema>;

export const NOTIFICATION_PRIVACY_LEVEL_LABEL: Record<NotificationPrivacyLevel, string> = {
  private: "Private — no names or amounts",
  normal: "Normal — names, no amounts",
  detailed: "Detailed — names and amounts",
};

export const reviewRhythmSchema = z.enum(["weekly", "biweekly", "monthly", "off"]);
export type ReviewRhythm = z.infer<typeof reviewRhythmSchema>;

// z.record keyed by the category enum requires every key present in Zod v4
// (the same quirk state.ts's areaProgress documents) — wrong for a
// progressively-filled preference map. Keyed by z.string() instead;
// category names are validated at read sites via the NotificationCategory
// type, not by this schema.
export const notificationPreferencesSchema = z.object({
  categories: z.record(z.string(), z.boolean()).default({}),
  privacyLevel: notificationPrivacyLevelSchema.default("private"),
  reviewRhythm: reviewRhythmSchema.default("off"),
  /** IANA zone name (e.g. "America/New_York"), never a raw UTC offset — an offset silently drifts across a DST boundary, a zone name doesn't. See Stage F's timezone architecture note in domain/notificationPreferences.ts. */
  timezone: z.string().min(1).default("UTC"),
});
export interface PersonalFinanceCompanionNotificationPreferences {
  categories: Partial<Record<NotificationCategory, boolean>>;
  privacyLevel: NotificationPrivacyLevel;
  reviewRhythm: ReviewRhythm;
  timezone: string;
}

/** Nothing is sent unless the user chose it — every category defaults off, matching §16's "nothing is sent unless you choose it." */
export function defaultNotificationPreferences(): PersonalFinanceCompanionNotificationPreferences {
  return notificationPreferencesSchema.parse({}) as PersonalFinanceCompanionNotificationPreferences;
}

/** Validates and coerces arbitrary input (e.g. a database row) into the preferences shape. */
export function validateNotificationPreferences(input: unknown): PersonalFinanceCompanionNotificationPreferences {
  return notificationPreferencesSchema.parse(input) as PersonalFinanceCompanionNotificationPreferences;
}

export function isCategoryEnabled(prefs: PersonalFinanceCompanionNotificationPreferences, category: NotificationCategory): boolean {
  return prefs.categories[category] === true;
}

/**
 * Renders a message at the preference's own privacy level. `detail` (a
 * name/amount) is only ever included at "normal"/"detailed", and amounts
 * only at "detailed" — callers pass the most specific line they have and
 * this function is the single place that decides how much of it survives.
 */
export function renderAtPrivacyLevel(
  level: NotificationPrivacyLevel,
  parts: { generic: string; withName?: string; withAmount?: string }
): string {
  if (level === "detailed" && parts.withAmount) return parts.withAmount;
  if ((level === "normal" || level === "detailed") && parts.withName) return parts.withName;
  return parts.generic;
}
