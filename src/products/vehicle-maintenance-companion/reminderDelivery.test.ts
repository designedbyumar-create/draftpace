import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sendWebPush = vi.fn();
vi.mock("@/lib/notifications/webPush", () => ({ sendWebPush: (...args: unknown[]) => sendWebPush(...args) }));

import { deliverVehicleReminders } from "./reminderDelivery";

const NOW = new Date("2026-09-21T12:00:00Z");

function fakeSupabase(state: {
  prefs: Record<string, unknown> | null;
  vehicles: Record<string, unknown>[];
  items: Record<string, unknown>[];
  renewals: Record<string, unknown>[];
  subs: Record<string, unknown>[];
}) {
  const client = {
    from(table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        neq: () => builder,
        is: () => builder,
        maybeSingle: async () => ({ data: table === "vmc_notification_preferences" ? state.prefs : null }),
        update(values: Record<string, unknown>) {
          if (table === "vmc_notification_preferences" && "notified" in values && state.prefs) state.prefs.notified = values.notified;
          return builder;
        },
        then(resolve: (value: unknown) => void) {
          const data =
            table === "vmc_vehicles" ? state.vehicles : table === "vmc_maintenance_items" ? state.items : table === "vmc_renewals" ? state.renewals : table === "push_subscriptions" ? state.subs : null;
          resolve({ data });
        },
      };
      return builder;
    },
  };
  return client as never;
}

const prefsRow = (over: Record<string, unknown> = {}) => ({ reminders_enabled: true, show_detail: false, quiet_start_hour: 21, quiet_end_hour: 8, timezone: "UTC", notified: {}, ...over });
const vehicleRow = { id: "v1", label: "Civic", year: 2018, make: "Honda", model: "Civic", current_mileage: 50000, mileage_updated_at: "2026-09-01", history_known: true, status: "active", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
const itemRow = { id: "i1", vehicle_id: "v1", template_id: null, task_name: "Oil change", interval_miles: 5000, interval_months: 6, severe_duty: false, last_done_at: "2026-02-10", last_done_mileage: 44500, status: "active", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
const device = { id: "sub-1", endpoint: "https://push.example/1", p256dh: "k", auth_key: "a" };
const run = (client: never) => deliverVehicleReminders(client, { instanceId: "inst", userId: "user", now: NOW });

beforeEach(() => sendWebPush.mockReset());

describe("delivering a vehicle reminder", () => {
  it("sends nothing to somebody who never switched reminders on", async () => {
    for (const prefs of [null, prefsRow({ reminders_enabled: false })]) {
      expect(await run(fakeSupabase({ prefs, vehicles: [vehicleRow], items: [itemRow], renewals: [], subs: [device] }))).toBe("off");
    }
    expect(sendWebPush).not.toHaveBeenCalled();
  });

  it("sends one push for a job that reached its interval, then never again for the same one", async () => {
    sendWebPush.mockResolvedValue({ outcome: "sent" });
    const client = fakeSupabase({ prefs: prefsRow(), vehicles: [vehicleRow], items: [itemRow], renewals: [], subs: [device] });
    expect(await run(client)).toBe("sent");
    expect(await run(client)).toBe("none");
    expect(sendWebPush).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(sendWebPush.mock.calls[0][1])).not.toContain("Civic");
  });

  it("reminds a renewal date from the database's own column names", async () => {
    sendWebPush.mockResolvedValue({ outcome: "sent" });
    const renewalRow = { id: "r1", vehicle_id: "v1", kind: "insurance", label: null, due_on: "2026-09-25", where_kept: null, note: null, status: "active", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
    const client = fakeSupabase({ prefs: prefsRow({ show_detail: true }), vehicles: [vehicleRow], items: [], renewals: [renewalRow], subs: [device] });
    expect(await run(client)).toBe("sent");
    expect(sendWebPush.mock.calls[0][1].body).toBe("Insurance for your Civic is due in 4 days.");
  });

  it("skips a row that does not parse instead of losing everybody's reminder", async () => {
    sendWebPush.mockResolvedValue({ outcome: "sent" });
    const client = fakeSupabase({ prefs: prefsRow(), vehicles: [vehicleRow, { id: "bad" }], items: [itemRow, { id: "bad" }], renewals: [{ id: "bad" }], subs: [device] });
    expect(await run(client)).toBe("sent");
  });

  it("releases its claim when there is no device, or every send fails, so the reminder is not lost", async () => {
    const noDevice = { prefs: prefsRow(), vehicles: [vehicleRow], items: [itemRow], renewals: [], subs: [] };
    expect(await run(fakeSupabase(noDevice))).toBe("no-device");
    expect(noDevice.prefs.notified).toEqual({});
    sendWebPush.mockResolvedValue({ outcome: "failed" });
    const failing = { prefs: prefsRow(), vehicles: [vehicleRow], items: [itemRow], renewals: [], subs: [device] };
    expect(await run(fakeSupabase(failing))).toBe("failed");
    expect(failing.prefs.notified).toEqual({});
  });
});

describe("where vehicle reminders are sent from", () => {
  const route = readFileSync(join(process.cwd(), "src/app/api/notifications/cron-life-updates/route.ts"), "utf8");

  it("only after the entitlement check, and only for this product", () => {
    expect(route.indexOf("instancesSkippedNotEntitled += 1")).toBeLessThan(route.indexOf("deliverVehicleReminders("));
    expect(route).toMatch(/productSlug === "vehicle-maintenance-companion"[^)]*\)\s*\{[\s\S]*deliverVehicleReminders\(/);
  });
});
