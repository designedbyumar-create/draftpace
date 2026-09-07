import { describe, expect, it } from "vitest";
import { deriveDueView, effectiveIntervalMiles, effectiveIntervalMonths, evaluateItem } from "./dueStatus";
import type { MaintenanceItem, Vehicle } from "./state";

const NOW = new Date("2026-09-06T12:00:00Z");

const vehicle = (over: Partial<Vehicle> = {}): Vehicle => ({
  id: "v1",
  label: "2019 Honda Civic",
  year: 2019,
  make: "Honda",
  model: "Civic",
  currentMileage: 50_000,
  mileageUpdatedAt: "2026-09-01",
  historyKnown: true,
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

const item = (over: Partial<MaintenanceItem> = {}): MaintenanceItem => ({
  id: "i1",
  vehicleId: "v1",
  templateId: "oil-change",
  taskName: "Engine oil and filter change",
  intervalMiles: 5000,
  intervalMonths: 6,
  severeDuty: false,
  lastDoneAt: "2026-03-01",
  lastDoneMileage: 45_000,
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

describe("effectiveIntervalMiles / effectiveIntervalMonths", () => {
  it("returns the entered interval unchanged when severe duty is off", () => {
    const i = item({ intervalMiles: 5000, intervalMonths: 6, severeDuty: false });
    expect(effectiveIntervalMiles(i)).toBe(5000);
    expect(effectiveIntervalMonths(i)).toBe(6);
  });

  /** The severe-duty branch: halves whatever was entered, never substitutes a different number. */
  it("halves the entered interval when severe duty is on", () => {
    const i = item({ intervalMiles: 5000, intervalMonths: 7, severeDuty: true });
    expect(effectiveIntervalMiles(i)).toBe(2500);
    expect(effectiveIntervalMonths(i)).toBe(4); // Math.round(3.5)
  });

  it("leaves a null interval null regardless of severe duty", () => {
    const i = item({ intervalMiles: null, severeDuty: true });
    expect(effectiveIntervalMiles(i)).toBeNull();
  });
});

describe("evaluateItem", () => {
  it("computes miles remaining from the vehicle's own mileage and the item's last-done mileage", () => {
    // 45,000 last done, 5,000 mile interval -> due at 50,000. Current mileage is exactly 50,000.
    const result = evaluateItem(vehicle({ currentMileage: 50_000 }), item(), NOW);
    expect(result.milesRemaining).toBe(0);
    expect(result.hasBaseline).toBe(true);
  });

  it("reads overdue as a negative milesRemaining", () => {
    const result = evaluateItem(vehicle({ currentMileage: 52_000 }), item(), NOW);
    expect(result.milesRemaining).toBe(-2000);
    expect(result.urgency).toBeGreaterThan(1);
  });

  it("computes daysRemaining from the item's own last-done date and interval", () => {
    // Last done 1 Mar 2026, 6 month interval -> due 1 Sep 2026. Now is 6 Sep 2026: 5 days overdue.
    const result = evaluateItem(vehicle({ currentMileage: null }), item({ intervalMiles: null }), NOW);
    expect(result.daysRemaining).toBe(-5);
    expect(result.hasBaseline).toBe(true);
  });

  /** "Due whichever comes first": urgency is the more-elapsed of the two dimensions. */
  it("ranks by whichever dimension is closer to due when both are trackable", () => {
    // By mileage: right at the boundary (ratio 1.0). By date: comfortably not due (ratio well under 1).
    const soonByMiles = evaluateItem(
      vehicle({ currentMileage: 50_000 }),
      item({ lastDoneAt: "2026-09-05", intervalMonths: 6 }),
      NOW
    );
    expect(soonByMiles.urgency).toBeCloseTo(1, 1);
  });

  it("halves the interval for a severe-duty item, bringing it due sooner", () => {
    const normal = evaluateItem(vehicle({ currentMileage: 47_000 }), item({ severeDuty: false }), NOW);
    const severe = evaluateItem(vehicle({ currentMileage: 47_000 }), item({ severeDuty: true }), NOW);
    expect(severe.urgency).toBeGreaterThan(normal.urgency);
  });

  it("has no baseline when the item has never been recorded done, whatever the vehicle's history status", () => {
    const result = evaluateItem(vehicle({ historyKnown: true }), item({ lastDoneAt: null, lastDoneMileage: null }), NOW);
    expect(result.hasBaseline).toBe(false);
    expect(result.urgency).toBe(-1);
  });

  it("has no baseline for an unknown-history vehicle with nothing recorded yet", () => {
    const result = evaluateItem(
      vehicle({ historyKnown: false, currentMileage: 50_000 }),
      item({ lastDoneAt: null, lastDoneMileage: null }),
      NOW
    );
    expect(result.hasBaseline).toBe(false);
  });

  it("still computes a real baseline once an unknown-history vehicle gets its first recorded fact", () => {
    const result = evaluateItem(
      vehicle({ historyKnown: false, currentMileage: 50_000 }),
      item({ lastDoneAt: "2026-03-01", lastDoneMileage: 45_000 }),
      NOW
    );
    expect(result.hasBaseline).toBe(true);
  });
});

describe("deriveDueView", () => {
  it("is quiet with nothing due, and means it", () => {
    const view = deriveDueView(
      [vehicle()],
      [item({ lastDoneAt: "2026-09-01", lastDoneMileage: 49_999, intervalMiles: 5000, intervalMonths: 6 })],
      NOW
    );
    expect(view.quiet).toBe(true);
    expect(view.due).toHaveLength(0);
  });

  it("puts an overdue item in due, not dueSoon", () => {
    const view = deriveDueView([vehicle({ currentMileage: 55_000 })], [item()], NOW);
    expect(view.due).toHaveLength(1);
    expect(view.dueSoon).toHaveLength(0);
    expect(view.quiet).toBe(false);
  });

  it("puts a nearly-due item in dueSoon, not due", () => {
    // 95% of a 5,000 mile interval elapsed: 4,750 of 5,000 miles.
    const view = deriveDueView(
      [vehicle({ currentMileage: 45_000 + 4750 })],
      [item({ intervalMonths: null })],
      NOW
    );
    expect(view.dueSoon).toHaveLength(1);
    expect(view.due).toHaveLength(0);
  });

  it("sorts due items most overdue first", () => {
    const barelyOverdue = item({ id: "a", intervalMonths: null, lastDoneMileage: 45_000, intervalMiles: 5000 });
    const wayOverdue = item({ id: "b", intervalMonths: null, lastDoneMileage: 30_000, intervalMiles: 5000 });
    const view = deriveDueView([vehicle({ currentMileage: 50_000 })], [barelyOverdue, wayOverdue], NOW);
    expect(view.due.map((d) => d.item.id)).toEqual(["b", "a"]);
  });

  it("collects items with no baseline separately, never mixed into due or dueSoon", () => {
    const noBaseline = item({ id: "c", lastDoneAt: null, lastDoneMileage: null });
    const view = deriveDueView([vehicle()], [noBaseline], NOW);
    expect(view.noBaseline).toHaveLength(1);
    expect(view.due).toHaveLength(0);
    expect(view.dueSoon).toHaveLength(0);
    // A vehicle with only a no-baseline item still reads as quiet: there
    // is genuinely nothing known to be due, which is different from
    // nothing being tracked at all.
    expect(view.quiet).toBe(true);
  });

  it("ignores an archived vehicle's items entirely", () => {
    const archived = vehicle({ id: "gone", status: "archived", currentMileage: 90_000 });
    const view = deriveDueView([archived], [item({ vehicleId: "gone" })], NOW);
    expect(view.due).toHaveLength(0);
    expect(view.dueSoon).toHaveLength(0);
    expect(view.noBaseline).toHaveLength(0);
  });

  it("ignores an archived item entirely", () => {
    const view = deriveDueView([vehicle({ currentMileage: 60_000 })], [item({ status: "archived" })], NOW);
    expect(view.due).toHaveLength(0);
  });
});
