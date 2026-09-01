import { describe, expect, it } from "vitest";
import { computeNextReview, describeItem, liveItems, needsReview } from "./lifeAffairs";
import { item } from "./testSupport";

const NOW = new Date("2026-08-22T12:00:00Z");

describe("describing a record", () => {
  it("never repeats the label underneath itself", () => {
    const person = item("people.emergency-contact", {
      label: "Sara Malik",
      personName: "Sara Malik",
      fields: { relationship: "Wife" },
    });
    expect(describeItem(person)).toBe("Wife");
  });

  it("names the person when the record is not named after them", () => {
    const doc = item("paperwork.safe-deposit", {
      kind: "location",
      label: "Home safe",
      personName: "Tom Okafor",
      whereabouts: "Under the stairs",
      fields: {},
    });
    expect(describeItem(doc)).toBe("Tom Okafor, Under the stairs");
  });

  it("falls back to the note when there is nothing else to say", () => {
    const pref = item("wishes.arrangements", {
      label: "What you would want arranged",
      personName: null,
      whereabouts: null,
      notes: "Something small, and outdoors.",
      fields: {},
    });
    expect(describeItem(pref)).toBe("Something small, and outdoors.");
  });
});

describe("when something is worth checking again", () => {
  it("is never stale before its interval is up", () => {
    expect(needsReview(item("people.executor", {}, NOW), NOW)).toBe(false);
  });

  it("comes back once the interval has passed", () => {
    const old = new Date(NOW);
    old.setUTCFullYear(old.getUTCFullYear() - 3);
    expect(needsReview(item("people.executor", {}, old), NOW)).toBe(true);
  });

  it("never brings back something the person decided does not apply", () => {
    const old = new Date(NOW);
    old.setUTCFullYear(old.getUTCFullYear() - 10);
    const gone = item("people.executor", { status: "notApplicable" }, old);
    expect(needsReview(gone, NOW)).toBe(false);
  });

  it("never brings back something with no interval, because it does not expire", () => {
    expect(computeNextReview(null, NOW)).toBeNull();
    expect(needsReview(item("wishes.letters", { nextReviewAt: null }, NOW), NOW)).toBe(false);
  });
});

describe("what counts as live knowledge", () => {
  it("keeps established and partly recorded, drops archived and not applicable", () => {
    const all = [
      item("people.executor", { status: "established" }),
      item("people.executor-backup", { status: "incomplete" }),
      item("home.keys", { status: "archived" }),
      item("home.insurance", { status: "notApplicable" }),
    ];
    expect(liveItems(all).map((i) => i.status)).toEqual(["established", "incomplete"]);
  });
});
