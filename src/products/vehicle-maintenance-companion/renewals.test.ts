import { describe, expect, it } from "vitest";
import { daysUntil, deriveRenewalsView, describeRenewalTiming, renewalTitle, RENEWAL_SOON_DAYS } from "./renewals";
import { mileageFreshness, needsMileage, todayIso, MILEAGE_STALE_DAYS } from "./mileageFreshness";
import { item, renewal, vehicle } from "./testFixtures";

describe("daysUntil", () => {
  it("counts whole calendar days, across a month end and a leap day", () => {
    expect(daysUntil("2026-09-21", "2026-09-21")).toBe(0);
    expect(daysUntil("2026-09-21", "2026-10-01")).toBe(10);
    expect(daysUntil("2028-02-27", "2028-03-01")).toBe(3);
    expect(daysUntil("2026-09-21", "2026-09-09")).toBe(-12);
  });
});

describe("describeRenewalTiming", () => {
  it("says it in words a person would", () => {
    expect(describeRenewalTiming(0)).toBe("Today");
    expect(describeRenewalTiming(1)).toBe("Tomorrow");
    expect(describeRenewalTiming(-1)).toBe("Yesterday");
    expect(describeRenewalTiming(12)).toBe("In 12 days");
    expect(describeRenewalTiming(-12)).toBe("12 days ago");
  });
});

describe("renewalTitle", () => {
  it("names the kind, and uses the person's own words for an other", () => {
    expect(renewalTitle(renewal({ kind: "insurance" }))).toBe("Insurance");
    expect(renewalTitle(renewal({ kind: "other", label: "Parking permit" }))).toBe("Parking permit");
    expect(renewalTitle(renewal({ kind: "other", label: "  " }))).toBe("Other date");
  });
});

describe("deriveRenewalsView", () => {
  const today = "2026-09-21";
  const v = vehicle();
  const view = deriveRenewalsView(
    [v, vehicle({ id: "gone", status: "archived" })],
    [
      renewal({ id: "past", dueOn: "2026-09-10" }),
      renewal({ id: "older", dueOn: "2026-08-01" }),
      renewal({ id: "edge", dueOn: "2026-11-05" }),
      renewal({ id: "far", dueOn: "2026-11-06" }),
      renewal({ id: "near", dueOn: "2026-09-25" }),
      renewal({ id: "closed", dueOn: "2026-09-25", status: "archived" }),
      renewal({ id: "orphan", vehicleId: "gone", dueOn: "2026-09-25" }),
    ],
    today
  );

  it("sorts what needs seeing now from what does not", () => {
    expect(view.pastDate.map((e) => e.renewal.id)).toEqual(["past", "older"]);
    expect(view.soon.map((e) => e.renewal.id)).toEqual(["near", "edge"]);
    expect(view.later.map((e) => e.renewal.id)).toEqual(["far"]);
    expect(RENEWAL_SOON_DAYS).toBe(45);
  });

  it("leaves out set-aside renewals and renewals on a vehicle that is gone", () => {
    const ids = [...view.pastDate, ...view.soon, ...view.later].map((e) => e.renewal.id);
    expect(ids).not.toContain("closed");
    expect(ids).not.toContain("orphan");
  });
});

describe("mileageFreshness", () => {
  it("trusts a recent reading, questions an old one, and says when there is none", () => {
    expect(mileageFreshness(vehicle({ mileageUpdatedAt: "2026-09-10" }), "2026-09-21")).toEqual({ state: "fresh", asOf: "2026-09-10" });
    expect(mileageFreshness(vehicle({ mileageUpdatedAt: "2026-07-01" }), "2026-09-21")).toEqual({ state: "stale", asOf: "2026-07-01", days: 82 });
    expect(mileageFreshness(vehicle({ currentMileage: null }), "2026-09-21")).toEqual({ state: "none" });
    expect(mileageFreshness(vehicle({ mileageUpdatedAt: null }), "2026-09-21")).toEqual({ state: "stale", asOf: null, days: null });
  });

  it("treats exactly thirty days as still fresh", () => {
    expect(mileageFreshness(vehicle({ mileageUpdatedAt: "2026-08-22" }), "2026-09-21").state).toBe("fresh");
    expect(mileageFreshness(vehicle({ mileageUpdatedAt: "2026-08-21" }), "2026-09-21").state).toBe("stale");
    expect(MILEAGE_STALE_DAYS).toBe(30);
  });

  it("asks for mileage only when a job tracked by distance has none to be judged against", () => {
    const noMiles = vehicle({ currentMileage: null });
    expect(needsMileage(noMiles, [item()])).toBe(true);
    expect(needsMileage(noMiles, [item({ intervalMiles: null, intervalMonths: 12 })])).toBe(false);
    expect(needsMileage(vehicle(), [item()])).toBe(false);
  });

  it("reads the device's own calendar day", () => {
    expect(todayIso(new Date(2026, 8, 5, 23, 59))).toBe("2026-09-05");
  });
});
