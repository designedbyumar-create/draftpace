import { describe, expect, it } from "vitest";
import {
  deriveReadiness,
  describeHandoverInvitation,
  describeReadiness,
  isBlankCopy,
  type Readiness,
} from "./completion";
import { AFFAIR_STEPS } from "./affairsKnowledge";
import { item, rec } from "./testSupport";
import type { StepRecord } from "./sequencer";
import type { AffairItem } from "./lifeAffairs";

const NOW = new Date("2026-08-22T12:00:00Z");

const EVERYTHING = {
  hasChildren: true,
  partnered: true,
  hasEmployerRetirement: true,
  ownsHome: true,
  hasLifeInsurance: true,
  hasDependantsWithExtraNeeds: true,
  hasPets: true,
  hasBusiness: true,
};

function readiness(records: StepRecord[] = [], items: AffairItem[] = [], now = NOW): Readiness {
  return deriveReadiness({ profile: EVERYTHING, records, items }, now);
}

function monthsAgo(n: number): Date {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n * 31);
  return d;
}

describe("readiness", () => {
  it("starts with everything unaddressed and nothing claimed", () => {
    const r = readiness();
    expect(r.established).toBe(0);
    expect(r.itemCount).toBe(0);
    expect(r.notAddressed).toBe(AFFAIR_STEPS.length);
    expect(r.lastConfirmedAt).toBeNull();
  });

  it("carries the actual records on every row, which is what a document prints", () => {
    const jane = item("people.emergency-contact", { personName: "Jane Smith", label: "Jane Smith" });
    const row = readiness([], [jane]).rows.find((x) => x.step.key === "people.emergency-contact");
    expect(row!.standing).toBe("established");
    expect(row!.items).toHaveLength(1);
    expect(row!.items[0].personName).toBe("Jane Smith");
  });

  it("never reports a standing of established with nothing behind it", () => {
    const r = readiness([], [item("people.executor")]);
    for (const row of r.rows) {
      if (row.standing === "established") expect(row.items.length).toBeGreaterThan(0);
    }
  });

  it("distinguishes a record from something merely done in the world", () => {
    const r = readiness([rec("people.executor-told")], [item("people.executor")]);
    const told = r.rows.find((x) => x.step.key === "people.executor-told");
    const chosen = r.rows.find((x) => x.step.key === "people.executor");
    expect(told!.standing).toBe("done");
    expect(chosen!.standing).toBe("established");
    expect(r.done).toBe(1);
    expect(r.established).toBe(1);
  });

  it("marks an old confirmation with no answer behind it as exactly that", () => {
    const r = readiness([rec("people.executor", { legacyConfirmation: true })], []);
    const row = r.rows.find((x) => x.step.key === "people.executor");
    expect(row!.standing).toBe("recordedWithoutDetail");
    expect(row!.items).toHaveLength(0);
    expect(r.recordedWithoutDetail).toBe(1);
    expect(r.established).toBe(0);
  });

  it("keeps not sure separate from not applicable and from left open", () => {
    const r = readiness([
      rec("people.emergency-contact", { state: "unsure", confirmedAt: null }),
      rec("people.executor", { state: "notRelevant", confirmedAt: null }),
      rec("people.health-decisions", { state: "open", confirmedAt: null }),
    ]);
    expect(r.unsure).toBe(1);
    expect(r.notApplicable).toBe(1);
    expect(r.leftOpen).toBe(1);
  });

  it("shows a record standing too long as worth checking rather than as settled", () => {
    const old = item("people.emergency-contact", {}, monthsAgo(40));
    const row = readiness([], [old]).rows.find((x) => x.step.key === "people.emergency-contact");
    expect(row!.standing).toBe("worthRechecking");
    expect(row!.items).toHaveLength(1);
  });

  it("reports the oldest standing confirmation, since that is what ages a copy", () => {
    const r = readiness([], [
      item("people.emergency-contact", {}, monthsAgo(6)),
      item("people.executor", {}, monthsAgo(2)),
    ]);
    expect(r.oldestConfirmedAt! < r.lastConfirmedAt!).toBe(true);
  });

  it("says nothing is outstanding only when nothing is unaddressed, stale, open or unsure", () => {
    const settled = AFFAIR_STEPS.map((s) => rec(s.key, { state: "notRelevant", confirmedAt: null }));
    expect(readiness(settled).nothingOutstanding).toBe(true);
    expect(readiness([...settled.slice(1)]).nothingOutstanding).toBe(false);
  });

  it("does not treat something left unsure as settled", () => {
    const settled = AFFAIR_STEPS.map((s) => rec(s.key, { state: "notRelevant", confirmedAt: null }));
    settled[0] = rec(settled[0].stepKey, { state: "unsure", confirmedAt: null });
    expect(readiness(settled).nothingOutstanding).toBe(false);
  });
});

describe("what the cover says", () => {
  it("never prints a fraction, because a short complete list is not a failure", () => {
    const line = describeReadiness(readiness([], [item("people.executor")]));
    expect(line).not.toMatch(/\d+\s*(of|\/)\s*\d+/);
    expect(line).not.toContain("%");
  });

  it("counts the records, because that is what the reader is holding", () => {
    const line = describeReadiness(readiness([], [item("people.executor"), item("people.emergency-contact")]));
    expect(line).toContain("2 things recorded");
  });

  it("names every category present, so a reader knows what they are holding", () => {
    const line = describeReadiness(
      readiness(
        [
          rec("people.executor-told"),
          rec("money.beneficiary-check", { state: "notRelevant", confirmedAt: null }),
          rec("people.health-decisions", { state: "open", confirmedAt: null }),
          rec("wishes.letters", { state: "unsure", confirmedAt: null }),
        ],
        [item("people.executor")]
      )
    );
    expect(line).toContain("recorded");
    expect(line).toContain("done");
    expect(line).toContain("not applicable");
    expect(line).toContain("left open");
    expect(line).toContain("not settled yet");
  });

  it("says nothing that shames, and never uses a banned word", () => {
    const lines = [
      describeReadiness(readiness()),
      describeReadiness(readiness([], [item("people.executor")])),
      describeHandoverInvitation(readiness()),
      describeHandoverInvitation(readiness([], [item("people.executor")])),
    ];
    for (const line of lines) {
      expect(line.toLowerCase()).not.toContain("overdue");
      expect(line.toLowerCase()).not.toContain("estate");
      expect(line.toLowerCase()).not.toContain("asset");
      expect(line.toLowerCase()).not.toContain("incomplete");
      expect(line).not.toContain("—");
    }
  });

  it("invites a handover differently depending on where the person is", () => {
    expect(describeHandoverInvitation(readiness())).toContain("Once you have recorded");
    expect(describeHandoverInvitation(readiness([], [item("people.executor")]))).toContain("whenever you like");
  });
});

describe("what counts as a blank copy", () => {
  it("is blank only when nothing at all has been recorded or decided", () => {
    expect(isBlankCopy(readiness())).toBe(true);
  });

  it("stops being blank the moment a single record exists", () => {
    expect(isBlankCopy(readiness([], [item("people.executor")]))).toBe(false);
  });

  it("stops being blank when something was marked not applicable", () => {
    expect(isBlankCopy(readiness([rec("people.executor", { state: "notRelevant", confirmedAt: null })]))).toBe(false);
  });

  it("stops being blank when an action was done in the world", () => {
    expect(isBlankCopy(readiness([rec("people.executor-told")]))).toBe(false);
  });

  it("stops being blank when an old dateless confirmation exists", () => {
    expect(isBlankCopy(readiness([rec("people.executor", { legacyConfirmation: true })]))).toBe(false);
  });
});
