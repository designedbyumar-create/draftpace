import { describe, expect, it } from "vitest";
import { affectedItems, describeAftermath, LIFE_EVENTS, newlyRelevantSteps } from "./lifeEvents";
import { AFFAIR_STEP_BY_KEY } from "./affairsKnowledge";
import { item } from "./testSupport";

const moved = LIFE_EVENTS.find((e) => e.kind === "moved")!;
const separated = LIFE_EVENTS.find((e) => e.kind === "separated")!;

describe("life events", () => {
  it("points every event at steps that exist", () => {
    for (const event of LIFE_EVENTS) {
      for (const key of event.affects) {
        expect(AFFAIR_STEP_BY_KEY[key], `${event.kind} -> ${key}`).toBeDefined();
      }
    }
  });

  it("catches the beneficiary trap, which is the one that costs people most", () => {
    expect(separated.affects).toContain("money.pensions");
    expect(separated.affects).toContain("money.life-cover");
    expect(separated.affects).toContain("paperwork.will-exists");
  });

  it("only ever names records the person actually has", () => {
    const items = [item("home.insurance"), item("people.executor")];
    const affected = affectedItems(moved, items);
    expect(affected.map((i) => i.originStepKey)).toEqual(["home.insurance"]);
  });

  it("invents no work for somebody who has recorded nothing relevant", () => {
    const affected = affectedItems(moved, [item("wishes.letters")]);
    expect(affected).toEqual([]);
    expect(describeAftermath(moved, affected)).toContain("Nothing you have written down");
  });

  it("says how many, once, so the person knows what they are in for", () => {
    const items = [item("home.insurance"), item("home.mortgage")];
    expect(describeAftermath(moved, affectedItems(moved, items))).toContain("2 things worth checking");
  });

  it("says one thing rather than 1 thing", () => {
    expect(describeAftermath(moved, affectedItems(moved, [item("home.insurance")]))).toContain(
      "one thing worth checking"
    );
  });

  it("never hands over a checklist, only a count and a promise to go one at a time", () => {
    const line = describeAftermath(moved, affectedItems(moved, [item("home.insurance"), item("home.mortgage")]));
    expect(line).toContain("one at a time");
    expect(line).not.toContain("home.");
  });

  it("does not re-ask an intake question the event has already answered", () => {
    expect(LIFE_EVENTS.find((e) => e.kind === "bought-home")!.implies).toEqual({ gate: "ownsHome", value: true });
    expect(separated.implies).toEqual({ gate: "partnered", value: false });
  });

  it("notices what the change makes worth recording for the first time", () => {
    const fresh = newlyRelevantSteps(moved, [item("home.insurance")]);
    expect(fresh).not.toContain("home.insurance");
    expect(fresh).toContain("home.mortgage");
  });

  it("uses no banned word and no em dash in anything it says to a person", () => {
    const lines = [
      ...LIFE_EVENTS.map((e) => e.label),
      describeAftermath(moved, []),
      describeAftermath(moved, [item("home.insurance")]),
    ];
    for (const line of lines) {
      expect(line.toLowerCase()).not.toContain("estate");
      expect(line.toLowerCase()).not.toContain("asset");
      expect(line.toLowerCase()).not.toContain("overdue");
      expect(line).not.toContain("—");
    }
  });
});
