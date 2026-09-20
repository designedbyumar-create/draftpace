import { inQuietHours, localHour, type ReminderPreferences } from "@/lib/notifications/reminderClock";
import { isActionable, type LifeItem } from "./life";

/**
 * Reminders, and only the ones somebody asked for.
 *
 * A reminder is sent for exactly one reason: the person chose a date for
 * something and that date has arrived. Not because something has gone
 * quiet, not because a check-in is "worth doing", not because time has
 * passed. The rest of the product is allowed to notice things; this file
 * is allowed to interrupt, and interrupting somebody who is already
 * carrying too much has to be earned by their own instruction.
 *
 * Pure on purpose. The cron route does the reading and the sending; every
 * decision about whether, when and what to say is here so it can be
 * tested without a database or a push service.
 */

/** How long after a chosen date a reminder is still worth sending. */
export const REMINDER_WINDOW_HOURS = 48;

export {
  DEFAULT_REMINDER_PREFERENCES,
  inQuietHours,
  localHour,
  pruneNotified,
  type ReminderPreferences,
} from "@/lib/notifications/reminderClock";

export interface DueReminder {
  itemId: string;
  title: string;
  /** The send-once key. Includes the date, so moving it earns a new reminder. */
  key: string;
}

/**
 * The items whose chosen date has arrived, and arrived recently.
 *
 * The window is the reason somebody switching reminders on next month does
 * not receive a pile of things from last spring. Old dates are simply not
 * reminders any more; they are still in Life, where nothing is overdue.
 */
export function dueReminders(items: LifeItem[], now: Date): DueReminder[] {
  const earliest = now.getTime() - REMINDER_WINDOW_HOURS * 3_600_000;
  return items
    .filter((item) => {
      if (item.status !== "open" || !item.userChosenDate || !item.nextAt) return false;
      // A waiting item's date is derived from what somebody else said, not
      // something the person chose, so it is never a reminder.
      if (!isActionable(item)) return false;
      const at = new Date(item.nextAt).getTime();
      return Number.isFinite(at) && at <= now.getTime() && at >= earliest;
    })
    .map((item) => ({ itemId: item.id, title: item.title, key: `${item.id}:${item.nextAt}` }));
}

export interface ReminderPush {
  title: string;
  body: string;
  url: string;
  /** Exactly the keys this one notification covers, so they can be recorded as sent together. */
  keys: string[];
}

export const WORKSPACE_URL = "/app/products/alongside/workspace";

const TITLE = "A reminder you set";

/**
 * At most one notification per run, however many dates arrived together.
 * Two buzzes for two things is two more demands than the person asked for.
 * Never a count, and never a word about lateness.
 */
export function planReminder(input: {
  items: LifeItem[];
  prefs: ReminderPreferences;
  notified: Record<string, string>;
  now: Date;
}): ReminderPush | null {
  const { prefs, now } = input;
  if (!prefs.remindersEnabled) return null;
  if (inQuietHours(localHour(now, prefs.timezone), prefs.quietStartHour, prefs.quietEndHour)) return null;

  const fresh = dueReminders(input.items, now).filter((reminder) => !(reminder.key in input.notified));
  if (fresh.length === 0) return null;

  const keys = fresh.map((reminder) => reminder.key);
  if (fresh.length === 1) {
    return {
      title: TITLE,
      body: prefs.showDetail ? fresh[0].title : "You said you would come back to something.",
      url: WORKSPACE_URL,
      keys,
    };
  }
  return { title: TITLE, body: "You said you would come back to a few things.", url: WORKSPACE_URL, keys };
}
