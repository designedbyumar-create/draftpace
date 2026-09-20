import { describe, expect, it } from "vitest";
import { event, item, vehicle } from "./testFixtures";
import {
  formatCost,
  historyByYear,
  lastDoneFromEvents,
  latestEventFor,
  parseCostToMinorUnits,
  planRecordService,
  recordForPrint,
} from "./serviceHistory";

const service = (over: Partial<Parameters<typeof planRecordService>[0]["service"]> = {}) => ({
  doneOn: "2026-09-20",
  mileage: 50_400,
  taskName: "Engine oil and filter change",
  shop: null,
  costMinorUnits: null,
  note: null,
  ...over,
});

describe("lastDoneFromEvents", () => {
  it("is the latest active event for the item, by day and then by mileage", () => {
    const events = [
      event({ id: "a", doneOn: "2026-03-01", mileage: 45_000 }),
      event({ id: "b", doneOn: "2026-09-01", mileage: 50_000 }),
      event({ id: "c", doneOn: "2026-09-01", mileage: 50_100 }),
    ];
    expect(latestEventFor(events, "i1")?.id).toBe("c");
    expect(lastDoneFromEvents(events, "i1")).toEqual({ lastDoneAt: "2026-09-01", lastDoneMileage: 50_100 });
  });

  it("ignores set-aside events and other items, and is empty when nothing remains", () => {
    const events = [event({ id: "a", status: "archived" }), event({ id: "b", itemId: "other" })];
    expect(lastDoneFromEvents(events, "i1")).toEqual({ lastDoneAt: null, lastDoneMileage: null });
  });
});

describe("planRecordService", () => {
  it("writes the event, moves the item's last-done forward and lifts the vehicle's mileage", () => {
    const plan = planRecordService({ vehicle: vehicle(), item: item(), service: service() });
    expect(plan.event).toMatchObject({ vehicleId: "v1", itemId: "i1", doneOn: "2026-09-20", mileage: 50_400 });
    expect(plan.itemPatch).toEqual({ lastDoneAt: "2026-09-20", lastDoneMileage: 50_400 });
    expect(plan.vehiclePatch).toEqual({ currentMileage: 50_400, mileageUpdatedAt: "2026-09-20" });
  });

  it("a service from last spring is history: it does not replace a newer last-done, or wind the mileage back", () => {
    const plan = planRecordService({
      vehicle: vehicle({ currentMileage: 50_000, mileageUpdatedAt: "2026-09-01" }),
      item: item({ lastDoneAt: "2026-08-01", lastDoneMileage: 49_000 }),
      service: service({ doneOn: "2026-04-10", mileage: 46_000 }),
    });
    expect(plan.itemPatch).toBeNull();
    expect(plan.vehiclePatch).toBeNull();
  });

  it("never lowers the mileage, and does not let an older reading stand in for a newer one", () => {
    expect(planRecordService({ vehicle: vehicle({ currentMileage: 60_000 }), item: null, service: service({ mileage: 55_000 }) }).vehiclePatch).toBeNull();
    expect(
      planRecordService({ vehicle: vehicle({ currentMileage: 40_000, mileageUpdatedAt: "2026-09-10" }), item: null, service: service({ doneOn: "2026-09-01", mileage: 45_000 }) }).vehiclePatch
    ).toBeNull();
  });

  it("a one-off with no job leaves every item alone, and a service with no mileage never touches the vehicle's", () => {
    const plan = planRecordService({ vehicle: vehicle(), item: null, service: service({ mileage: null }) });
    expect(plan.event.itemId).toBeNull();
    expect(plan.itemPatch).toBeNull();
    expect(plan.vehiclePatch).toBeNull();
  });

  it("fills an item that had nothing recorded, even from a past date", () => {
    const plan = planRecordService({ vehicle: vehicle(), item: item({ lastDoneAt: null, lastDoneMileage: null }), service: service({ doneOn: "2025-01-05", mileage: 30_000 }) });
    expect(plan.itemPatch).toEqual({ lastDoneAt: "2025-01-05", lastDoneMileage: 30_000 });
  });
});

describe("historyByYear", () => {
  const events = [
    event({ id: "a", doneOn: "2025-11-02", costMinorUnits: 8000 }),
    event({ id: "b", doneOn: "2026-03-01", costMinorUnits: 12050 }),
    event({ id: "c", doneOn: "2026-09-01", costMinorUnits: null }),
    event({ id: "d", vehicleId: "v2", doneOn: "2026-05-01", costMinorUnits: 1000 }),
    event({ id: "e", doneOn: "2026-06-01", status: "archived", costMinorUnits: 99999 }),
  ];

  it("groups newest first by year and totals only the costs somebody entered", () => {
    const groups = historyByYear(events, "v1");
    expect(groups.map((g) => g.year)).toEqual(["2026", "2025"]);
    expect(groups[0].events.map((e) => e.id)).toEqual(["c", "b"]);
    expect(groups[0]).toMatchObject({ costMinorUnits: 12050, costedCount: 1 });
    expect(groups[1]).toMatchObject({ costMinorUnits: 8000, costedCount: 1 });
  });

  it("covers every vehicle when none is named, and never counts a set-aside event", () => {
    const all = historyByYear(events);
    expect(all[0].events.map((e) => e.id)).toEqual(["c", "d", "b"]);
  });
});

describe("recordForPrint", () => {
  it("is oldest first for one vehicle, without set-aside events", () => {
    const events = [event({ id: "b", doneOn: "2026-03-01" }), event({ id: "a", doneOn: "2025-01-01" }), event({ id: "x", doneOn: "2025-06-01", status: "archived" }), event({ id: "o", vehicleId: "v2" })];
    expect(recordForPrint(events, "v1").map((e) => e.id)).toEqual(["a", "b"]);
  });
});

describe("cost", () => {
  it("round-trips whole and fractional amounts through minor units", () => {
    expect(parseCostToMinorUnits("120.5")).toBe(12050);
    expect(parseCostToMinorUnits("$1,200")).toBe(120000);
    expect(parseCostToMinorUnits("")).toBeNull();
    expect(parseCostToMinorUnits("free")).toBeNull();
    expect(formatCost(12050)).toBe("120.50");
    expect(formatCost(120000)).toBe("1,200.00");
  });
});
