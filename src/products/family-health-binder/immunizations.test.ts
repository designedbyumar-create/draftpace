import { describe, expect, it } from "vitest";
import { groupImmunizations, immunizationLine, VACCINE_NAMES } from "./immunizations";
import { immunization } from "./testFixtures";

describe("immunizations", () => {
  it("puts every dose of one vaccine on one line, oldest first, whatever the capitals", () => {
    const groups = groupImmunizations(
      [
        immunization({ id: "1", vaccine: "MMR", givenOn: "2023-06-02" }),
        immunization({ id: "2", vaccine: "mmr ", givenOn: "2019-05-01" }),
        immunization({ id: "3", vaccine: "Tdap", givenOn: "2029-01-01" }),
      ],
      "m1"
    );
    expect(groups.map((g) => [g.vaccine, g.dates])).toEqual([
      ["mmr", ["2019-05-01", "2023-06-02"]],
      ["Tdap", ["2029-01-01"]],
    ]);
  });

  it("leaves out another person's records, removed ones and, when asked, private ones", () => {
    const list = [
      immunization({ id: "1" }),
      immunization({ id: "2", familyMemberId: "m2", vaccine: "HPV" }),
      immunization({ id: "3", vaccine: "Hib", status: "archived" }),
      immunization({ id: "4", vaccine: "COVID-19", visibility: "private" }),
    ];
    expect(groupImmunizations(list, "m1").map((g) => g.vaccine)).toEqual(["MMR", "COVID-19"]);
    expect(groupImmunizations(list, "m1", { summaryOnly: true }).map((g) => g.vaccine)).toEqual(["MMR"]);
  });

  it("writes the dates as a form does", () => {
    const [group] = groupImmunizations([immunization({ givenOn: "2019-05-01" }), immunization({ id: "2", givenOn: "2023-06-02" })], "m1");
    expect(immunizationLine(group)).toEqual({ label: "MMR", detail: "05/01/2019, 06/02/2023" });
  });

  it("offers names only, and never says which are due", () => {
    expect(VACCINE_NAMES).toContain("MMR");
    expect(new Set(VACCINE_NAMES).size).toBe(VACCINE_NAMES.length);
  });
});
