import { describe, expect, it } from "vitest";
import { boundaryData, cardData, longDateLabel, recordData } from "./printData";
import { event, item, renewal, vehicle } from "./testFixtures";

const NOW = new Date(2026, 8, 21, 9, 0);
const where = { origin: "https://example.test", slug: "vehicle-maintenance-companion" };

describe("longDateLabel", () => {
  it("writes the day in words on the device's own calendar", () => {
    expect(longDateLabel(NOW)).toBe("21 September 2026");
    expect(longDateLabel(new Date(2027, 0, 1, 23, 59))).toBe("1 January 2027");
  });
});

describe("boundaryData", () => {
  const base = { vehicle: vehicle(), items: [item({ id: "a", taskName: "Oil change" }), item({ id: "b", taskName: "Tire rotation" }), item({ id: "c", vehicleId: "other", taskName: "Other car job" })], requestedIds: new Set(["a", "c"]), alsoRequestedText: "", shop: " Main St ", callNumber: "", ceiling: "$200", askForOldParts: true, now: NOW, ...where };

  it("requests exactly the ticked jobs on this vehicle, and no job from another vehicle", () => {
    expect(boundaryData(base).requested).toEqual(["Oil change"]);
  });

  it("adds anything else the person wrote, one per line, without blanks", () => {
    expect(boundaryData({ ...base, alsoRequestedText: "Check the rear left tire\n\n  Look at the squeak \n" }).alsoRequested).toEqual(["Check the rear left tire", "Look at the squeak"]);
  });

  it("trims what was typed and keeps the choices as chosen", () => {
    const data = boundaryData(base);
    expect(data).toMatchObject({ shop: "Main St", ceiling: "$200", askForOldParts: true, generatedLabel: "21 September 2026" });
  });
});

describe("recordData", () => {
  it("is this vehicle's active record, oldest first, with its identity", () => {
    const data = recordData({
      vehicle: vehicle({ plate: "7ABC123", vin: "VIN123" }),
      events: [event({ id: "n", doneOn: "2026-03-01" }), event({ id: "o", doneOn: "2025-01-01", taskName: "First oil change" }), event({ id: "x", doneOn: "2025-06-01", status: "archived" }), event({ id: "z", vehicleId: "other" })],
      now: NOW,
      ...where,
    });
    expect(data.rows.map((r) => r.taskName)).toEqual(["First oil change", "Engine oil and filter change"]);
    expect(data.vehicle).toMatchObject({ plate: "7ABC123", vin: "VIN123", currentMileage: 50_000 });
  });
});

describe("cardData", () => {
  it("lists this vehicle's active dates soonest first, in the person's own words for an other", () => {
    const data = cardData({
      vehicle: vehicle({ tyreSize: "205/55R16", roadsidePhone: "0800 123" }),
      renewals: [
        renewal({ id: "a", kind: "insurance", dueOn: "2026-12-01", whereKept: "Glove box" }),
        renewal({ id: "b", kind: "other", label: "Parking permit", dueOn: "2026-10-01" }),
        renewal({ id: "c", dueOn: "2026-09-01", status: "archived" }),
        renewal({ id: "d", vehicleId: "other", dueOn: "2026-09-02" }),
      ],
      now: NOW,
      ...where,
    });
    expect(data.dates).toEqual([
      { title: "Parking permit", dueOn: "2026-10-01", whereKept: null },
      { title: "Insurance", dueOn: "2026-12-01", whereKept: "Glove box" },
    ]);
    expect(data.vehicle).toMatchObject({ tyreSize: "205/55R16", roadsidePhone: "0800 123" });
  });
});
