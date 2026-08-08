import { describe, expect, it } from "vitest";
import { buildPushPayloads, type EnrichedReminder } from "./aggregate";

const NOW = new Date("2026-08-08T12:00:00Z");

function reminder(overrides: Partial<EnrichedReminder> = {}): EnrichedReminder {
  return {
    reminderId: "r-1",
    kind: "billDue",
    name: "Rent",
    detail: "2026-08-14",
    amount: "$1,500.00",
    note: null,
    deepLink: "/app/products/personal-finance-companion/bills?focus=bill-1",
    ...overrides,
  };
}

describe("buildPushPayloads", () => {
  it("returns nothing for an empty list", () => {
    expect(buildPushPayloads([], "private", NOW)).toEqual([]);
  });

  it("renders one payload per reminder below the aggregation threshold, at the requested privacy level", () => {
    const payloads = buildPushPayloads([reminder()], "private", NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].body).toBe("A bill is due soon.");
    expect(payloads[0].url).toContain("/bills?focus=bill-1");
  });

  it("includes the name at normal privacy and the amount at detailed privacy", () => {
    const normal = buildPushPayloads([reminder()], "normal", NOW);
    expect(normal[0].body).toBe("Rent is due on 2026-08-14.");

    const detailed = buildPushPayloads([reminder()], "detailed", NOW);
    expect(detailed[0].body).toBe("Rent ($1,500.00) is due on 2026-08-14.");
  });

  it("never leaks a name or amount at private, regardless of what data is available", () => {
    const payloads = buildPushPayloads([reminder()], "private", NOW);
    expect(payloads[0].body).not.toContain("Rent");
    expect(payloads[0].body).not.toContain("1,500");
  });

  it("shows the user's own note verbatim for a userCreated reminder regardless of privacy level", () => {
    const r = reminder({ kind: "userCreated", note: "Call the insurance company", name: null });
    const payloads = buildPushPayloads([r], "private", NOW);
    expect(payloads[0].body).toBe("Call the insurance company");
  });

  it("aggregates 3+ reminders into one calm payload deep-linking to the Attention Inbox, not a bare app link", () => {
    const many = [reminder({ reminderId: "r-1" }), reminder({ reminderId: "r-2" }), reminder({ reminderId: "r-3" })];
    const payloads = buildPushPayloads(many, "detailed", NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].body).toBe("3 things need your attention.");
    expect(payloads[0].reminderIds).toEqual(["r-1", "r-2", "r-3"]);
    expect(payloads[0].url).toContain("panel=attention");
  });

  it("produces a stable dedupeKey independent of input order, so re-running the evaluator doesn't create a new key for the same set", () => {
    const setA = [reminder({ reminderId: "r-2" }), reminder({ reminderId: "r-1" }), reminder({ reminderId: "r-3" })];
    const setB = [reminder({ reminderId: "r-1" }), reminder({ reminderId: "r-3" }), reminder({ reminderId: "r-2" })];
    expect(buildPushPayloads(setA, "private", NOW)[0].dedupeKey).toBe(buildPushPayloads(setB, "private", NOW)[0].dedupeKey);
  });
});
