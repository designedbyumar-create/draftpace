import { describe, expect, it } from "vitest";
import { currentMedications, describeMedication, describeMedicationDates, describeMedicationsCheck, isCurrentMedication, pastMedications } from "./medications";
import { allergy, fact, member } from "./testFixtures";

describe("medications", () => {
  it("counts a medication as current until it has a stop date or is removed", () => {
    expect(isCurrentMedication(fact())).toBe(true);
    expect(isCurrentMedication(fact({ stoppedOn: "2026-08-01" }))).toBe(false);
    expect(isCurrentMedication(fact({ status: "archived" }))).toBe(false);
    expect(isCurrentMedication(allergy())).toBe(false);
  });

  it("splits one person's medications into current and stopped, and never mixes people", () => {
    const facts = [
      fact({ id: "a" }),
      fact({ id: "b", stoppedOn: "2026-08-01" }),
      fact({ id: "c", familyMemberId: "m2" }),
      fact({ id: "d", status: "archived" }),
      allergy(),
    ];
    expect(currentMedications(facts, "m1").map((f) => f.id)).toEqual(["a"]);
    expect(pastMedications(facts, "m1").map((f) => f.id)).toEqual(["b"]);
  });

  it("reads a medication as it was typed, skipping what was left blank", () => {
    expect(describeMedication(fact())).toBe("Amoxicillin, 250mg, twice daily");
    expect(describeMedication(fact({ dosage: null, frequency: "at night" }))).toBe("Amoxicillin, at night");
    expect(describeMedication(fact({ dosage: null, frequency: null }))).toBe("Amoxicillin");
  });

  it("describes start and stop dates the way a form writes them", () => {
    expect(describeMedicationDates(fact())).toBeNull();
    expect(describeMedicationDates(fact({ startedOn: "2026-03-04" }))).toBe("Started 03/04/2026");
    expect(describeMedicationDates(fact({ stoppedOn: "2026-04-01" }))).toBe("Stopped 04/01/2026");
    expect(describeMedicationDates(fact({ startedOn: "2026-03-04", stoppedOn: "2026-04-01" }))).toBe("Started 03/04/2026, stopped 04/01/2026");
  });

  it("says when the list was last checked, and only what is true", () => {
    const today = "2026-09-07";
    expect(describeMedicationsCheck(member(), today)).toBe("Not checked yet");
    expect(describeMedicationsCheck(member({ medicationsCheckedOn: "2026-09-07" }), today)).toBe("Checked today");
    expect(describeMedicationsCheck(member({ medicationsCheckedOn: "2026-09-06" }), today)).toBe("Checked yesterday");
    expect(describeMedicationsCheck(member({ medicationsCheckedOn: "2026-07-25" }), today)).toBe("Checked 44 days ago");
  });
});
