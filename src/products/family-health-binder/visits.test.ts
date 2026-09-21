import { describe, expect, it } from "vitest";
import { describeVisit, describeVisitTiming, nextVisit, parseQuestions, splitVisits } from "./visits";
import { visit } from "./testFixtures";

const TODAY = "2026-09-07";

describe("visits", () => {
  const list = [
    visit({ id: "far", visitOn: "2026-12-01" }),
    visit({ id: "soon", visitOn: "2026-09-09" }),
    visit({ id: "today", visitOn: "2026-09-07" }),
    visit({ id: "old", visitOn: "2026-06-01" }),
    visit({ id: "older", visitOn: "2026-01-01" }),
    visit({ id: "other", familyMemberId: "m2", visitOn: "2026-09-08" }),
    visit({ id: "gone", visitOn: "2026-09-08", status: "archived" }),
  ];

  it("puts today and later first, soonest first, and earlier ones after, most recent first", () => {
    const { upcoming, past } = splitVisits(list, "m1", TODAY);
    expect(upcoming.map((v) => v.id)).toEqual(["today", "soon", "far"]);
    expect(past.map((v) => v.id)).toEqual(["old", "older"]);
  });

  it("covers everyone when no person is named, and skips removed visits", () => {
    expect(splitVisits(list, null, TODAY).upcoming.map((v) => v.id)).toEqual(["today", "other", "soon", "far"]);
  });

  it("finds the next visit for one person only", () => {
    expect(nextVisit(list, "m1", TODAY)?.id).toBe("today");
    expect(nextVisit(list, "m3", TODAY)).toBeNull();
  });

  it("reads one question per line and ignores bullets, numbers and blank lines", () => {
    expect(parseQuestions("Is the cough a concern?\n\n - Can she swim\n2) Any change to the dose  \n")).toEqual([
      "Is the cough a concern?",
      "Can she swim",
      "Any change to the dose",
    ]);
    expect(parseQuestions(null)).toEqual([]);
    expect(parseQuestions("   \n  ")).toEqual([]);
  });

  it("names a visit and when it is", () => {
    expect(describeVisit(visit())).toBe("Yearly checkup with Dr. Patel");
    expect(describeVisit(visit({ withWhom: null }))).toBe("Yearly checkup");
    expect(describeVisitTiming(visit({ visitOn: "2026-09-09" }), TODAY)).toBe("In 2 days");
  });
});
