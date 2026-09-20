import { describe, expect, it } from "vitest";
import { deriveDueView } from "./dueStatus";
import { deriveRenewalsView } from "./renewals";
import { describeVehicle, filterDueView, filterRenewals, vehicleLamps } from "./fleet";
import { item, renewal, vehicle } from "./testFixtures";

const NOW = new Date("2026-09-21T12:00:00Z");
const TODAY = "2026-09-21";
const cars = [vehicle({ id: "a", label: "Civic" }), vehicle({ id: "b", label: "Van" }), vehicle({ id: "c", label: "Bike" }), vehicle({ id: "d", label: "Truck" })];
const dueA = item({ id: "ia", vehicleId: "a", lastDoneAt: "2026-02-10", lastDoneMileage: 44_500 });
// 5,500 of 6,000 miles used: close, not yet at its interval.
const soonB = item({ id: "ib", vehicleId: "b", intervalMiles: 6000, intervalMonths: null, lastDoneAt: "2026-03-20", lastDoneMileage: 44_500 });
const fineC = item({ id: "ic", vehicleId: "c", lastDoneAt: "2026-09-10", lastDoneMileage: 49_800 });
const view = deriveDueView(cars, [dueA, soonB, fineC], NOW);
const renewalsView = (rs: ReturnType<typeof renewal>[]) => {
  const v = deriveRenewalsView(cars, rs, TODAY);
  return [...v.pastDate, ...v.soon, ...v.later];
};

describe("vehicleLamps", () => {
  it("lights a vehicle with a job due, rings one with a job close, and leaves a fine one dark", () => {
    const lamps = vehicleLamps(cars, view, []);
    expect(lamps.map((l) => [l.vehicle.id, l.state])).toEqual([["a", "due"], ["b", "soon"], ["c", "clear"], ["d", "clear"]]);
  });

  it("lights a vehicle whose date has passed, and rings one whose date is close, but not one whose date is far", () => {
    const entries = renewalsView([renewal({ id: "x", vehicleId: "c", dueOn: "2026-09-10" }), renewal({ id: "y", vehicleId: "d", dueOn: "2026-10-05" }), renewal({ id: "z", vehicleId: "b", dueOn: "2027-06-01" })]);
    const lamps = vehicleLamps(cars, view, entries);
    expect(lamps.find((l) => l.vehicle.id === "c")!.state).toBe("due");
    expect(lamps.find((l) => l.vehicle.id === "d")!.state).toBe("soon");
    expect(lamps.find((l) => l.vehicle.id === "b")!.state).toBe("soon");
  });

  it("a vehicle with nothing to judge yet is not lit", () => {
    const unknown = item({ id: "iu", vehicleId: "d", lastDoneAt: null, lastDoneMileage: null });
    expect(vehicleLamps(cars, deriveDueView(cars, [unknown], NOW), []).find((l) => l.vehicle.id === "d")!.state).toBe("clear");
  });
});

describe("filterDueView", () => {
  it("is the whole view when no vehicle is chosen", () => {
    expect(filterDueView(view, null)).toBe(view);
  });

  it("narrows to one vehicle, and says it is quiet when that vehicle has nothing due", () => {
    expect(filterDueView(view, "a").due.map((e) => e.item.id)).toEqual(["ia"]);
    expect(filterDueView(view, "a").quiet).toBe(false);
    const b = filterDueView(view, "b");
    expect(b.due).toEqual([]);
    expect(b.dueSoon.map((e) => e.item.id)).toEqual(["ib"]);
    const c = filterDueView(view, "c");
    expect(c.quiet).toBe(true);
    expect(c.due).toEqual([]);
  });
});

describe("filterRenewals", () => {
  it("keeps only the chosen vehicle's dates", () => {
    const entries = renewalsView([renewal({ id: "x", vehicleId: "a", dueOn: "2026-09-25" }), renewal({ id: "y", vehicleId: "b", dueOn: "2026-09-26" })]);
    expect(filterRenewals(entries, "a").map((e) => e.renewal.id)).toEqual(["x"]);
    expect(filterRenewals(entries, null)).toHaveLength(2);
  });
});

describe("describeVehicle", () => {
  it("names the year, make and model that were entered", () => {
    expect(describeVehicle(vehicle({ year: 2018, make: "Honda", model: "Civic" }))).toBe("2018 Honda Civic");
  });
  it("uses only what was entered, and the vehicle's own name when nothing was", () => {
    expect(describeVehicle(vehicle({ year: null, make: "Ford", model: null }))).toBe("Ford");
    expect(describeVehicle(vehicle({ label: "Work van", year: null, make: null, model: null }))).toBe("Work van");
  });
});
