import { deriveDueView } from "./dueStatus";
import { daysUntil, renewalTitle } from "./renewals";
import { inQuietHours, localDate, localHour, type ReminderPreferences } from "@/lib/notifications/reminderClock";
import type { MaintenanceItem, Renewal, Vehicle } from "./state";

/**
 * Reminders, and only the ones somebody switched on.
 *
 * Two things can interrupt, and both are facts about a date or a distance
 * the person themselves recorded: a job has reached its interval, or a date
 * they entered is close. Nothing is sent because time has passed with no
 * activity, and nothing is worded as a failure.
 *
 * Pure on purpose. The cron route reads and sends; every decision about
 * whether, when and what to say is here, so it can be tested without a
 * database or a push service.
 */

/** A renewal date is reminded once when it comes inside this many days, and once more on the day. */
export const RENEWAL_LEAD_DAYS = 14;

export const WORKSPACE_URL = "/app/products/vehicle-maintenance-companion/workspace";
const TITLE = "A vehicle reminder";

export interface ReminderCandidate {
  /** The send-once key. Includes what would change if the thing were dealt with, so doing it earns the next one and nothing else does. */
  key: string;
  /** What it says when the person has chosen to see detail. */
  text: string;
}

export function reminderCandidates(input: {
  vehicles: Vehicle[];
  items: MaintenanceItem[];
  renewals: Renewal[];
  now: Date;
  timezone: string;
}): ReminderCandidate[] {
  const { vehicles, items, renewals, now, timezone } = input;
  const candidates: ReminderCandidate[] = [];

  for (const entry of deriveDueView(vehicles, items, now).due) {
    candidates.push({
      // Recording it done changes last-done, which changes the key: the next time it comes round is a new reminder.
      key: `due:${entry.item.id}:${entry.item.lastDoneAt ?? "none"}:${entry.item.lastDoneMileage ?? "none"}`,
      text: `${entry.item.taskName} is due on your ${entry.vehicle.label}.`,
    });
  }

  const today = localDate(now, timezone);
  const byId = new Map(vehicles.filter((v) => v.status === "active").map((v) => [v.id, v]));
  for (const renewal of renewals) {
    if (renewal.status !== "active") continue;
    const vehicle = byId.get(renewal.vehicleId);
    if (!vehicle) continue;
    const days = daysUntil(today, renewal.dueOn);
    const title = `${renewalTitle(renewal)} for your ${vehicle.label}`;
    if (days === 0) {
      candidates.push({ key: `renewal:${renewal.id}:${renewal.dueOn}:day`, text: `${title} is due today.` });
    } else if (days > 0 && days <= RENEWAL_LEAD_DAYS) {
      candidates.push({ key: `renewal:${renewal.id}:${renewal.dueOn}:lead`, text: `${title} is due in ${days} ${days === 1 ? "day" : "days"}.` });
    }
  }
  return candidates;
}

export interface ReminderPush {
  title: string;
  body: string;
  url: string;
  /** Exactly the keys this one notification covers, so they can be recorded as sent together. */
  keys: string[];
}

/**
 * At most one notification per run, however many things arrived together:
 * two buzzes for two things is two more demands than the person asked for.
 * Without detail it says only that something needs a look, because a lock
 * screen is a public surface.
 */
export function planVehicleReminder(input: {
  vehicles: Vehicle[];
  items: MaintenanceItem[];
  renewals: Renewal[];
  prefs: ReminderPreferences;
  notified: Record<string, string>;
  now: Date;
}): ReminderPush | null {
  const { prefs, now } = input;
  if (!prefs.remindersEnabled) return null;
  if (inQuietHours(localHour(now, prefs.timezone), prefs.quietStartHour, prefs.quietEndHour)) return null;

  const fresh = reminderCandidates({ ...input, timezone: prefs.timezone }).filter((candidate) => !(candidate.key in input.notified));
  if (fresh.length === 0) return null;

  const keys = fresh.map((candidate) => candidate.key);
  if (fresh.length === 1) {
    return { title: TITLE, body: prefs.showDetail ? fresh[0].text : "Something on one of your vehicles needs a look.", url: WORKSPACE_URL, keys };
  }
  return {
    title: TITLE,
    body: prefs.showDetail ? `${fresh[0].text} There is something else too.` : "A few things on your vehicles need a look.",
    url: WORKSPACE_URL,
    keys,
  };
}
