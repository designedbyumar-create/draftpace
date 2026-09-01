import { describe, expect, it } from "vitest";
import { matchProblemSentence, severityFromSentence, isDangerousSentence } from "./problemSentence";
import type { HomeItem } from "./state";

function makeItem(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: "item-1",
    name: "Garage door",
    type: "garage-door",
    brand: null,
    model: null,
    location: null,
    purchaseDate: null,
    installDate: null,
    warrantyExpiresAt: null,
    documentLink: null,
    notes: null,
    status: "active",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("the sentence the old product threw away", () => {
  it("recognises what it is about", () => {
    const items = [makeItem()];
    const match = matchProblemSentence("the garage door is making a grinding noise", items);
    expect(match.itemId).toBe("item-1");
    expect(match.matchedOn).toBe("Garage door");
  });

  it("still produces a usable result when the home has nothing recorded at all", () => {
    const match = matchProblemSentence("the garage door is making a grinding noise", []);
    expect(match.itemId).toBeNull();
    expect(match.type?.id).toBe("garage-door");
    expect(match.matchedOn).toBe("Garage door");
    // Recognising the words is not the same as knowing they own one, so
    // the interface must not be allowed to say "your garage door".
    expect(match.kind).toBe("typeOnly");
  });

  it("never refuses a sentence it does not understand", () => {
    const match = matchProblemSentence("the thing in the hallway is doing something odd", []);
    expect(match.itemId).toBeNull();
    expect(match.type).toBeNull();
    expect(match.matchedOn).toBeNull();
    expect(match.kind).toBe("none");
    // Still a valid, usable match object with a real severity.
    expect(match.severity).toBe("moderate");
  });
});

describe("matchProblemSentence", () => {
  it("prefers a thing the person named themselves over a generic type", () => {
    const items = [makeItem({ id: "mine", name: "Old side garage door" })];
    const match = matchProblemSentence("old side garage door is stuck", items);
    expect(match.itemId).toBe("mine");
    expect(match.matchedOn).toBe("Old side garage door");
  });

  it("attaches automatically when the type resolves to exactly one thing", () => {
    const items = [makeItem({ id: "wh", name: "Basement heater", type: "water-heater" })];
    const match = matchProblemSentence("no hot water from the water heater", items);
    expect(match.itemId).toBe("wh");
    expect(match.kind).toBe("item");
  });

  it("refuses to guess between two things of the same kind", () => {
    const items = [
      makeItem({ id: "a", name: "Upstairs unit", type: "water-heater" }),
      makeItem({ id: "b", name: "Downstairs unit", type: "water-heater" }),
    ];
    const match = matchProblemSentence("the water heater is leaking", items);
    expect(match.itemId).toBeNull();
    expect(match.kind).toBe("ambiguous");
    expect(match.type?.id).toBe("water-heater");
    expect(match.matchedOn).toBe("Water heater");
  });

  it("ignores archived things", () => {
    const items = [makeItem({ status: "archived" })];
    expect(matchProblemSentence("garage door is grinding", items).itemId).toBeNull();
  });
});

describe("severityFromSentence", () => {
  it("treats a noise as minor rather than an emergency", () => {
    expect(severityFromSentence("making a grinding noise")).toBe("minor");
    expect(severityFromSentence("the tap is dripping slow")).toBe("minor");
  });

  it("defaults to worth sorting when nothing stands out", () => {
    expect(severityFromSentence("the dishwasher is not draining")).toBe("moderate");
  });

  it("flags the things that are genuinely dangerous", () => {
    expect(severityFromSentence("I can smell gas in the kitchen")).toBe("urgent");
    expect(severityFromSentence("the basement is flooding")).toBe("urgent");
    expect(severityFromSentence("there is no heat upstairs")).toBe("urgent");
    expect(severityFromSentence("the outlet is sparking")).toBe("urgent");
  });

  it("lets urgent win when a sentence mentions both", () => {
    expect(severityFromSentence("a rattling noise and now it is flooding")).toBe("urgent");
  });

  it("does not call a gas hob an emergency just because it says gas", () => {
    expect(severityFromSentence("the gas hob will not light")).not.toBe("urgent");
  });
});

describe("isDangerousSentence", () => {
  it("is true only for things worth saying something about", () => {
    expect(isDangerousSentence("I can smell gas")).toBe(true);
    expect(isDangerousSentence("burning smell from the outlet")).toBe(true);
    expect(isDangerousSentence("the faucet is dripping")).toBe(false);
    expect(isDangerousSentence("no hot water")).toBe(false);
  });
});
