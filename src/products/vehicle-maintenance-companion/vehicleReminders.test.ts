import { describe, expect, it } from "vitest";
import { DEFAULT_REMINDER_PREFERENCES, type ReminderPreferences } from "@/lib/notifications/reminderClock";
import { planVehicleReminder, reminderCandidates, RENEWAL_LEAD_DAYS } from "./vehicleReminders";
import { item, renewal, vehicle } from "./testFixtures";

// 12:00 UTC on 21 September 2026, which is midday in London and early morning in Los Angeles.
const NOW = new Date("2026-09-21T12:00:00Z");
const ON: ReminderPreferences = { ...DEFAULT_REMINDER_PREFERENCES, remindersEnabled: true, timezone: "Europe/London" };

// An oil change 500 miles past its interval and past its time.
const dueItem = item({ id: "oil", lastDoneAt: "2026-02-10", lastDoneMileage: 44_500, intervalMiles: 5000, intervalMonths: 6 });
const okItem = item({ id: "fine", taskName: "Tire rotation", lastDoneAt: "2026-09-01", lastDoneMileage: 49_500, intervalMiles: 6000, intervalMonths: 6 });
const base = { vehicles: [vehicle({ currentMileage: 50_000 })], items: [dueItem, okItem], renewals: [], prefs: ON, notified: {}, now: NOW };

describe("reminderCandidates", () => {
  it("includes a job that has reached its interval and leaves out one that has not", () => {
    const list = reminderCandidates({ ...base, timezone: "UTC" });
    expect(list.map((c) => c.text)).toEqual(["Engine oil and filter change is due on your Civic."]);
    expect(list[0].key).toBe("due:oil:2026-02-10:44500");
  });

  it("reminds a renewal once inside the lead time and again on the day, and never for a date already gone", () => {
    const at = (dueOn: string) => reminderCandidates({ ...base, items: [], renewals: [renewal({ dueOn })], timezone: "UTC" }).map((c) => [c.key.split(":").pop(), c.text]);
    expect(at("2026-10-05")).toEqual([["lead", "Registration for your Civic is due in 14 days."]]);
    expect(at("2026-10-06")).toEqual([]);
    expect(at("2026-09-22")).toEqual([["lead", "Registration for your Civic is due in 1 day."]]);
    expect(at("2026-09-21")).toEqual([["day", "Registration for your Civic is due today."]]);
    expect(at("2026-09-20")).toEqual([]);
    expect(RENEWAL_LEAD_DAYS).toBe(14);
  });

  it("ignores set-aside renewals and renewals on a vehicle that is gone", () => {
    const list = reminderCandidates({
      ...base,
      items: [],
      vehicles: [vehicle(), vehicle({ id: "gone", status: "archived" })],
      renewals: [renewal({ id: "a", status: "archived", dueOn: "2026-09-25" }), renewal({ id: "b", vehicleId: "gone", dueOn: "2026-09-25" })],
      timezone: "UTC",
    });
    expect(list).toEqual([]);
  });
});

describe("planVehicleReminder", () => {
  it("sends nothing unless reminders were switched on", () => {
    expect(planVehicleReminder({ ...base, prefs: { ...ON, remindersEnabled: false } })).toBeNull();
  });

  it("says only that something needs a look, unless the person chose detail", () => {
    const quiet = planVehicleReminder(base)!;
    expect(quiet.body).toBe("Something on one of your vehicles needs a look.");
    expect(quiet.body).not.toContain("Civic");
    expect(planVehicleReminder({ ...base, prefs: { ...ON, showDetail: true } })!.body).toBe("Engine oil and filter change is due on your Civic.");
  });

  it("is one notification however many things arrived, and records every key it covered", () => {
    const push = planVehicleReminder({ ...base, renewals: [renewal({ dueOn: "2026-09-25" })] })!;
    expect(push.body).toBe("A few things on your vehicles need a look.");
    expect(push.keys).toHaveLength(2);
  });

  it("does not repeat what was already sent, and goes quiet again once the job is recorded done", () => {
    const first = planVehicleReminder(base)!;
    const sent = Object.fromEntries(first.keys.map((k) => [k, NOW.toISOString()]));
    expect(planVehicleReminder({ ...base, notified: sent })).toBeNull();
    const nextRound = { ...dueItem, lastDoneAt: "2026-09-21", lastDoneMileage: 50_000 };
    expect(planVehicleReminder({ ...base, items: [nextRound], notified: sent })).toBeNull();
  });

  it("waits out quiet hours in the person's own zone, and sends once they end", () => {
    // 12:00 UTC is 05:00 in Los Angeles, inside 21:00 to 08:00.
    expect(planVehicleReminder({ ...base, prefs: { ...ON, timezone: "America/Los_Angeles" } })).toBeNull();
    expect(planVehicleReminder({ ...base, now: new Date("2026-09-21T16:00:00Z"), prefs: { ...ON, timezone: "America/Los_Angeles" } })).not.toBeNull();
  });

  it("never states a count or a word about lateness", () => {
    const push = planVehicleReminder({ ...base, prefs: { ...ON, showDetail: true }, renewals: [renewal({ dueOn: "2026-09-25" })] })!;
    expect(`${push.title} ${push.body}`).not.toMatch(/overdue|late|missed|behind|\d+ (things|items)/i);
  });
});
