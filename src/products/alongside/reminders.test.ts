import { describe, expect, it } from "vitest";
import {
  DEFAULT_REMINDER_PREFERENCES,
  dueReminders,
  inQuietHours,
  localHour,
  planReminder,
  pruneNotified,
  type ReminderPreferences,
} from "./reminders";
import type { LifeItem } from "./life";

const NOW = new Date("2026-09-20T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();
const hoursAhead = (h: number) => new Date(NOW.getTime() + h * 3_600_000).toISOString();

const item = (over: Partial<LifeItem>): LifeItem =>
  ({
    id: "a",
    kind: "commitment",
    title: "Call the clinic about the referral",
    note: null,
    status: "open",
    nextAt: hoursAgo(1),
    userChosenDate: true,
    everyMonths: null,
    waitingOn: null,
    lastTouchedAt: null,
    leftOffNote: null,
    nextStep: null,
    ...over,
  }) as unknown as LifeItem;

const prefs = (over: Partial<ReminderPreferences> = {}): ReminderPreferences => ({
  ...DEFAULT_REMINDER_PREFERENCES,
  remindersEnabled: true,
  quietStartHour: 21,
  quietEndHour: 8,
  timezone: "UTC",
  ...over,
});

describe("which dates become reminders", () => {
  it("only a date the person chose, that has arrived, on something still open", () => {
    expect(dueReminders([item({})], NOW)).toHaveLength(1);
    expect(dueReminders([item({ userChosenDate: false })], NOW), "a date the product inferred").toHaveLength(0);
    expect(dueReminders([item({ nextAt: hoursAhead(2) })], NOW), "not arrived yet").toHaveLength(0);
    expect(dueReminders([item({ status: "done" })], NOW)).toHaveLength(0);
    expect(dueReminders([item({ status: "archived" })], NOW)).toHaveLength(0);
    expect(dueReminders([item({ nextAt: null })], NOW)).toHaveLength(0);
  });

  it("never a waiting item, whose date comes from what somebody else said", () => {
    expect(dueReminders([item({ kind: "waiting", waitingOn: "Octopus" })], NOW)).toHaveLength(0);
  });

  it("not a date from last month, so switching reminders on never releases a pile", () => {
    expect(dueReminders([item({ nextAt: hoursAgo(47) })], NOW)).toHaveLength(1);
    expect(dueReminders([item({ nextAt: hoursAgo(49) })], NOW)).toHaveLength(0);
  });

  it("keys on the date, so moving it earns a new reminder and nothing else does", () => {
    const first = dueReminders([item({ nextAt: hoursAgo(1) })], NOW)[0].key;
    const moved = dueReminders([item({ nextAt: hoursAgo(2) })], NOW)[0].key;
    expect(first).not.toBe(moved);
  });
});

describe("quiet hours", () => {
  it("cross midnight, and include the start hour but not the end hour", () => {
    expect(inQuietHours(21, 21, 8)).toBe(true);
    expect(inQuietHours(2, 21, 8)).toBe(true);
    expect(inQuietHours(7, 21, 8)).toBe(true);
    expect(inQuietHours(8, 21, 8)).toBe(false);
    expect(inQuietHours(12, 21, 8)).toBe(false);
  });

  it("work inside a single day, and equal hours mean none", () => {
    expect(inQuietHours(13, 12, 14)).toBe(true);
    expect(inQuietHours(14, 12, 14)).toBe(false);
    expect(inQuietHours(3, 5, 5)).toBe(false);
  });

  it("use the person's own zone, not the server's", () => {
    // 12:00 UTC is 22:00 in Sydney (UTC+10 in September, before DST starts) and 08:00 in New York (UTC-4).
    expect(localHour(NOW, "Australia/Sydney")).toBe(22);
    expect(localHour(NOW, "America/New_York")).toBe(8);
    expect(localHour(NOW, "Not/AZone")).toBe(12);
  });
});

describe("what is sent", () => {
  it("nothing unless the person switched reminders on", () => {
    expect(planReminder({ items: [item({})], prefs: prefs({ remindersEnabled: false }), notified: {}, now: NOW })).toBeNull();
    expect(planReminder({ items: [item({})], prefs: DEFAULT_REMINDER_PREFERENCES, notified: {}, now: NOW })).toBeNull();
  });

  it("nothing in quiet hours, and it goes out afterwards because nothing was recorded as sent", () => {
    const sydney = prefs({ timezone: "Australia/Sydney" });
    expect(planReminder({ items: [item({})], prefs: sydney, notified: {}, now: NOW })).toBeNull();
    const later = new Date(NOW.getTime() + 10 * 3_600_000);
    expect(planReminder({ items: [item({ nextAt: hoursAgo(1) })], prefs: sydney, notified: {}, now: later })).not.toBeNull();
  });

  it("nothing twice for the same date", () => {
    const push = planReminder({ items: [item({})], prefs: prefs(), notified: {}, now: NOW })!;
    const again = planReminder({
      items: [item({})],
      prefs: prefs(),
      notified: Object.fromEntries(push.keys.map((key) => [key, NOW.toISOString()])),
      now: NOW,
    });
    expect(again).toBeNull();
  });

  it("keeps the lock screen private by default, and shows the title only when asked", () => {
    const hidden = planReminder({ items: [item({})], prefs: prefs(), notified: {}, now: NOW })!;
    expect(JSON.stringify(hidden)).not.toContain("clinic");
    const shown = planReminder({ items: [item({})], prefs: prefs({ showDetail: true }), notified: {}, now: NOW })!;
    expect(shown.body).toBe("Call the clinic about the referral");
  });

  it("is one notification however many dates arrive together, and never a count", () => {
    const push = planReminder({
      items: [item({ id: "a" }), item({ id: "b", title: "Renew passport" }), item({ id: "c", title: "Book MOT" })],
      prefs: prefs({ showDetail: true }),
      notified: {},
      now: NOW,
    })!;
    expect(push.keys).toHaveLength(3);
    expect(push.body).not.toMatch(/\d/);
    expect(push.body).not.toContain("Renew passport");
  });

  it("never uses shaming words, in any variant", () => {
    const variants = [
      planReminder({ items: [item({})], prefs: prefs(), notified: {}, now: NOW }),
      planReminder({ items: [item({})], prefs: prefs({ showDetail: true }), notified: {}, now: NOW }),
      planReminder({ items: [item({ id: "a" }), item({ id: "b" })], prefs: prefs(), notified: {}, now: NOW }),
    ];
    for (const push of variants) {
      expect(`${push!.title} ${push!.body}`.toLowerCase()).not.toMatch(
        /overdue|late\b|missed|forgot|behind|still|streak|don't forget|reminder!|urgent/,
      );
    }
  });
});

describe("the send-once ledger", () => {
  it("drops entries a week old and keeps recent ones", () => {
    const kept = pruneNotified({ old: hoursAgo(24 * 8), recent: hoursAgo(5) }, NOW);
    expect(Object.keys(kept)).toEqual(["recent"]);
  });
});
