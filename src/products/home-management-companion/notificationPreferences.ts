import { z } from "zod";

/**
 * Home Base's own notification preference architecture, mirroring PFC's
 * notificationPreferences.ts shape. Consent/preference state only -
 * "what would matter enough to remember", not a subscription or a queue.
 * No OS/browser Push permission is requested here; that stays generic
 * Draftpace's job, never this product's, same "two separate things" split
 * PFC's own file documents.
 */

export const notificationCategorySchema = z.enum(["maintenanceDue", "warrantyExpiring"]);
export type NotificationCategory = z.infer<typeof notificationCategorySchema>;

export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
  maintenanceDue: "Maintenance due or overdue",
  warrantyExpiring: "Warranties expiring soon",
};

export const notificationPrivacyLevelSchema = z.enum(["private", "normal", "detailed"]);
export type NotificationPrivacyLevel = z.infer<typeof notificationPrivacyLevelSchema>;

export const NOTIFICATION_PRIVACY_LEVEL_LABEL: Record<NotificationPrivacyLevel, string> = {
  private: "Private, no names",
  normal: "Normal, names included",
  detailed: "Detailed, names and dates",
};

// z.record keyed by the category enum requires every key present in Zod v4,
// wrong for a progressively-filled preference map. Keyed by z.string()
// instead, same reasoning as PFC's identical schema.
export const notificationPreferencesSchema = z.object({
  categories: z.record(z.string(), z.boolean()).default({}),
  privacyLevel: notificationPrivacyLevelSchema.default("private"),
  /** IANA zone name, never a raw UTC offset, so reminders don't silently drift across a DST boundary. */
  timezone: z.string().min(1).default("UTC"),
});
export interface HomeManagementCompanionNotificationPreferences {
  categories: Partial<Record<NotificationCategory, boolean>>;
  privacyLevel: NotificationPrivacyLevel;
  timezone: string;
}

/** Nothing is sent unless the user chose it - every category defaults off. */
export function defaultNotificationPreferences(): HomeManagementCompanionNotificationPreferences {
  return notificationPreferencesSchema.parse({}) as HomeManagementCompanionNotificationPreferences;
}

export function validateNotificationPreferences(input: unknown): HomeManagementCompanionNotificationPreferences {
  return notificationPreferencesSchema.parse(input) as HomeManagementCompanionNotificationPreferences;
}

export function isCategoryEnabled(prefs: HomeManagementCompanionNotificationPreferences, category: NotificationCategory): boolean {
  return prefs.categories[category] === true;
}
