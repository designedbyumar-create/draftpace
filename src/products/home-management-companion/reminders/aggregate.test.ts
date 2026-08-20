import { describe, expect, it } from "vitest";
import { buildPushPayloads, type EnrichedReminder } from "./aggregate";
import { homeManagementCompanionDefinition } from "../definition";

const NOW = new Date("2026-08-20T12:00:00Z");

function reminder(overrides: Partial<EnrichedReminder> = {}): EnrichedReminder {
  return {
    reminderId: "r-1",
    kind: "maintenanceDue",
    message: "The furnace filter is worth changing, usually every 3 months.",
    deepLink: "/app/products/home-management-companion/item/item-1",
    ...overrides,
  };
}

describe("buildPushPayloads", () => {
  it("returns nothing for an empty list", () => {
    expect(buildPushPayloads([], "private", NOW)).toEqual([]);
  });

  it("renders one payload per reminder below the aggregation threshold", () => {
    const payloads = buildPushPayloads([reminder()], "normal", NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].body).toBe("The furnace filter is worth changing, usually every 3 months.");
    expect(payloads[0].url).toContain("/item/item-1");
  });

  it("never names what is in the house at private, whatever the specific message said", () => {
    const payloads = buildPushPayloads([reminder()], "private", NOW);
    expect(payloads[0].body).not.toContain("furnace");
    expect(payloads[0].body).toBe("Something in your home is worth taking care of.");
  });

  it("says a problem needs a look without saying what is broken, at private", () => {
    const payloads = buildPushPayloads([reminder({ kind: "problem", message: "The boiler is leaking." })], "private", NOW);
    expect(payloads[0].body).not.toContain("boiler");
    expect(payloads[0].body).not.toContain("leaking");
  });

  it("aggregates 3+ reminders into the same sentence Home itself would show", () => {
    const many = [reminder({ reminderId: "r-1" }), reminder({ reminderId: "r-2" }), reminder({ reminderId: "r-3" })];
    const payloads = buildPushPayloads(many, "normal", NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].body).toBe("A few things worth taking care of.");
    expect(payloads[0].reminderIds).toEqual(["r-1", "r-2", "r-3"]);
  });

  it("leads with what is wrong when any of the aggregated reminders is a problem", () => {
    const many = [
      reminder({ reminderId: "r-1", kind: "problem" }),
      reminder({ reminderId: "r-2" }),
      reminder({ reminderId: "r-3" }),
    ];
    expect(buildPushPayloads(many, "normal", NOW)[0].body).toBe("Something needs a look.");
  });

  /**
   * The regression this file was written for. The aggregate push used to
   * open /attention, a destination Home Base stopped having when its nine
   * screens collapsed into two, so every aggregate notification landed on
   * "No Attention destination for this product". Nothing caught it: the
   * route still existed generically, so types, lint and the build were all
   * green while the link was dead.
   */
  it("deep-links every aggregate to a destination this product actually registers", () => {
    const many = [reminder({ reminderId: "r-1" }), reminder({ reminderId: "r-2" }), reminder({ reminderId: "r-3" })];
    const url = buildPushPayloads(many, "private", NOW)[0].url;

    const destination = url.split("/").pop()!;
    expect(homeManagementCompanionDefinition.navigation).toContain(destination);
    expect(url).not.toContain("/attention");
  });

  it("never says overdue, in any message it generates itself", () => {
    const bodies = [
      ...buildPushPayloads([reminder()], "private", NOW),
      ...buildPushPayloads([reminder({ kind: "problem" })], "private", NOW),
      ...buildPushPayloads([reminder({ kind: "warrantyExpiring" })], "private", NOW),
      ...buildPushPayloads([reminder({ reminderId: "a" }), reminder({ reminderId: "b" }), reminder({ reminderId: "c" })], "private", NOW),
    ].map((p) => p.body);

    for (const body of bodies) {
      expect(body.toLowerCase()).not.toContain("overdue");
      expect(body).not.toContain("—");
    }
  });

  it("produces a stable dedupeKey independent of input order", () => {
    const setA = [reminder({ reminderId: "r-2" }), reminder({ reminderId: "r-1" }), reminder({ reminderId: "r-3" })];
    const setB = [reminder({ reminderId: "r-1" }), reminder({ reminderId: "r-3" }), reminder({ reminderId: "r-2" })];
    expect(buildPushPayloads(setA, "private", NOW)[0].dedupeKey).toBe(buildPushPayloads(setB, "private", NOW)[0].dedupeKey);
  });
});
