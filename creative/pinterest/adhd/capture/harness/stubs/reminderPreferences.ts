// Stand-in for domain/reminderPreferences.ts (Supabase): remindersEnabled true, everything else as a person leaves it
// (the real defaults for detail and quiet hours; see DEFAULT_REMINDER_PREFERENCES in lib/notifications/reminderClock.ts).
import { ok, type Result } from "@/product-framework/result";
import { DEFAULT_REMINDER_PREFERENCES, type ReminderPreferences } from "@/products/alongside/reminders";

export const deviceTimezone = () => "Europe/London";
export async function loadReminderPreferences(): Promise<Result<ReminderPreferences>> {
  return ok({ ...DEFAULT_REMINDER_PREFERENCES, remindersEnabled: true, timezone: "Europe/London" });
}
export async function saveReminderPreferences(_id: string, preferences: ReminderPreferences): Promise<Result<ReminderPreferences>> { return ok(preferences); }
