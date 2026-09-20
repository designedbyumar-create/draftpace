import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sendWebPush = vi.fn();
vi.mock("@/lib/notifications/webPush", () => ({ sendWebPush: (...args: unknown[]) => sendWebPush(...args) }));

import { deliverAlongsideReminders } from "./reminderDelivery";

const NOW = new Date("2026-09-20T12:00:00Z");
const DUE = new Date(NOW.getTime() - 3_600_000).toISOString();

/** The smallest stand-in for the Supabase client that these queries need. */
function fakeSupabase(state: {
  prefs: Record<string, unknown> | null;
  items: Record<string, unknown>[];
  subs: Record<string, unknown>[];
}) {
  const updates: { table: string; values: Record<string, unknown> }[] = [];
  const client = {
    from(table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        neq: () => builder,
        is: () => builder,
        maybeSingle: async () => ({ data: table === "als_notification_preferences" ? state.prefs : null }),
        update(values: Record<string, unknown>) {
          updates.push({ table, values });
          if (table === "als_notification_preferences" && "notified" in values && state.prefs) {
            state.prefs.notified = values.notified;
          }
          return builder;
        },
        then(resolve: (value: unknown) => void) {
          resolve({ data: table === "als_items" ? state.items : table === "push_subscriptions" ? state.subs : null });
        },
      };
      return builder;
    },
  };
  return { client: client as never, updates };
}

const prefsRow = (over: Record<string, unknown> = {}) => ({
  reminders_enabled: true,
  show_detail: false,
  quiet_start_hour: 21,
  quiet_end_hour: 8,
  timezone: "UTC",
  notified: {},
  ...over,
});

const itemRow = {
  id: "item-1",
  kind: "commitment",
  title: "Call the clinic",
  note: null,
  status: "open",
  next_at: DUE,
  user_chosen_date: true,
  every_months: null,
  waiting_on: null,
  last_touched_at: null,
  left_off_note: null,
  next_step: null,
  created_at: DUE,
};
const device = { id: "sub-1", endpoint: "https://push.example/1", p256dh: "k", auth_key: "a" };

const run = (client: never) => deliverAlongsideReminders(client, { instanceId: "inst", userId: "user", now: NOW });

beforeEach(() => sendWebPush.mockReset());

describe("delivering a reminder", () => {
  it("sends nothing to somebody who never switched reminders on", async () => {
    for (const prefs of [null, prefsRow({ reminders_enabled: false })]) {
      const { client } = fakeSupabase({ prefs, items: [itemRow], subs: [device] });
      expect(await run(client)).toBe("off");
    }
    expect(sendWebPush).not.toHaveBeenCalled();
  });

  it("sends one push for a date that has arrived, then never again for the same date", async () => {
    sendWebPush.mockResolvedValue({ outcome: "sent" });
    const state = { prefs: prefsRow(), items: [itemRow], subs: [device] };
    const { client } = fakeSupabase(state);

    expect(await run(client)).toBe("sent");
    expect(await run(client)).toBe("none");
    expect(sendWebPush).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(sendWebPush.mock.calls[0][1])).not.toContain("clinic");
  });

  it("releases its claim when there is no device, so the reminder is not lost", async () => {
    const state = { prefs: prefsRow(), items: [itemRow], subs: [] };
    const { client } = fakeSupabase(state);
    expect(await run(client)).toBe("no-device");
    expect(state.prefs.notified).toEqual({});
  });

  it("releases its claim when every send fails, so the next hour tries again", async () => {
    sendWebPush.mockResolvedValue({ outcome: "failed" });
    const state = { prefs: prefsRow(), items: [itemRow], subs: [device] };
    const { client } = fakeSupabase(state);
    expect(await run(client)).toBe("failed");
    expect(state.prefs.notified).toEqual({});
  });
});

describe("where reminders are sent from", () => {
  const route = readFileSync(join(process.cwd(), "src/app/api/notifications/cron-life-updates/route.ts"), "utf8");

  it("only after the entitlement check, and only for Alongside", () => {
    expect(route.indexOf("instancesSkippedNotEntitled += 1")).toBeLessThan(route.indexOf("deliverAlongsideReminders("));
    expect(route).toMatch(/productSlug === "alongside"[^)]*\)\s*\{[\s\S]*deliverAlongsideReminders\(/);
  });
});
