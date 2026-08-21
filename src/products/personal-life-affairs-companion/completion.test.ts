import { describe, expect, it } from "vitest";
import { deriveReadiness, describeReadiness, describeHandoverInvitation, isBlankCopy } from "./completion";
import { relevantSteps, type StepRecord } from "./sequencer";
import { AFFAIR_STEP_BY_KEY } from "./affairsKnowledge";

const NOW = new Date("2026-08-22T12:00:00Z");
const NONE = { hasChildren: false, partnered: false, hasEmployerRetirement: false, ownsHome: false,
  hasLifeInsurance: false, hasDependantsWithExtraNeeds: false, hasPets: false, hasBusiness: false };

function rec(stepKey: string, over: Partial<StepRecord> = {}): StepRecord {
  return { stepKey, state: "confirmed", confirmedAt: NOW.toISOString(), snoozedUntil: null, ...over };
}
function monthsAgo(n: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n * 31);
  return d.toISOString();
}

describe("readiness", () => {
  it("starts with everything unaddressed and nothing claimed", () => {
    const r = deriveReadiness({ profile: NONE, records: [] }, NOW);
    expect(r.confirmed).toBe(0);
    expect(r.notAddressed).toBe(r.rows.length);
    expect(r.lastConfirmedAt).toBeNull();
    expect(r.nothingOutstanding).toBe(false);
  });

  it("separates the four standings a document has to distinguish", () => {
    const steps = relevantSteps(NONE);
    const records = [
      rec(steps[0].key),
      rec(steps[1].key, { state: "notRelevant", confirmedAt: null }),
      rec(steps[2].key, { state: "open", confirmedAt: null }),
    ];
    const r = deriveReadiness({ profile: NONE, records }, NOW);
    expect(r.confirmed).toBe(1);
    expect(r.notApplicable).toBe(1);
    expect(r.leftOpen).toBe(1);
    expect(r.notAddressed).toBe(steps.length - 3);
  });

  /** The document must never imply currency a confirmation does not have. */
  it("attaches a date only to things actually confirmed", () => {
    const steps = relevantSteps(NONE);
    const records = [rec(steps[0].key), rec(steps[1].key, { state: "open", confirmedAt: null })];
    const r = deriveReadiness({ profile: NONE, records }, NOW);
    const open = r.rows.find((row) => row.step.key === steps[1].key)!;
    expect(open.confirmedAt).toBeNull();
    expect(r.rows.find((row) => row.step.key === steps[0].key)!.confirmedAt).not.toBeNull();
  });

  it("shows a stale confirmation as worth rechecking rather than as settled", () => {
    const step = AFFAIR_STEP_BY_KEY["money.beneficiary-check"];
    const r = deriveReadiness(
      { profile: NONE, records: [rec(step.key, { confirmedAt: monthsAgo(step.confirmEveryMonths! + 2) })] },
      NOW
    );
    expect(r.worthRechecking).toBe(1);
    expect(r.confirmed).toBe(0);
    expect(r.nothingOutstanding).toBe(false);
  });

  it("reports the oldest standing confirmation, since that is what ages a copy", () => {
    const steps = relevantSteps(NONE);
    const r = deriveReadiness(
      {
        profile: NONE,
        records: [rec(steps[0].key, { confirmedAt: monthsAgo(5) }), rec(steps[1].key, { confirmedAt: NOW.toISOString() })],
      },
      NOW
    );
    expect(r.oldestConfirmedAt).toBe(monthsAgo(5));
    expect(r.lastConfirmedAt).toBe(NOW.toISOString());
  });

  it("says nothing is outstanding only when nothing is unaddressed or stale", () => {
    const all = relevantSteps(NONE).map((s) => rec(s.key));
    expect(deriveReadiness({ profile: NONE, records: all }, NOW).nothingOutstanding).toBe(true);
  });

  it("counts not applicable as settled, because a deliberate skip is an answer", () => {
    const all = relevantSteps(NONE).map((s) => rec(s.key, { state: "notRelevant", confirmedAt: null }));
    expect(deriveReadiness({ profile: NONE, records: all }, NOW).nothingOutstanding).toBe(true);
  });

  it("does not treat something left open as settled", () => {
    const all = relevantSteps(NONE).map((s) => rec(s.key));
    all[0] = rec(all[0].stepKey, { state: "open", confirmedAt: null });
    expect(deriveReadiness({ profile: NONE, records: all }, NOW).nothingOutstanding).toBe(false);
  });
});

describe("what the cover says", () => {
  it("never prints a fraction, because a short complete list is not a failure", () => {
    const steps = relevantSteps(NONE);
    const line = describeReadiness(deriveReadiness({ profile: NONE, records: [rec(steps[0].key)] }, NOW));
    expect(line).not.toMatch(/\d+\s*of\s*\d+/);
    expect(line).not.toContain("%");
  });

  it("names every category present, so a reader knows what they are holding", () => {
    const steps = relevantSteps(NONE);
    const line = describeReadiness(
      deriveReadiness(
        {
          profile: NONE,
          records: [
            rec(steps[0].key),
            rec(steps[1].key, { state: "notRelevant", confirmedAt: null }),
            rec(steps[2].key, { state: "open", confirmedAt: null }),
          ],
        },
        NOW
      )
    );
    expect(line).toContain("1 confirmed");
    expect(line).toContain("1 not applicable");
    expect(line).toContain("1 left open");
    expect(line).toContain("not yet started");
  });

  it("invites a handover differently depending on where the person is", () => {
    const empty = deriveReadiness({ profile: NONE, records: [] }, NOW);
    const all = deriveReadiness({ profile: NONE, records: relevantSteps(NONE).map((s) => rec(s.key)) }, NOW);
    expect(describeHandoverInvitation(empty)).toContain("a few things");
    expect(describeHandoverInvitation(all)).toContain("good moment");
  });

  it("never blocks printing, whatever state the person is in", () => {
    const empty = deriveReadiness({ profile: NONE, records: [] }, NOW);
    // Done is declared, never calculated: no invitation may forbid it.
    for (const line of [describeHandoverInvitation(empty)]) {
      expect(line.toLowerCase()).not.toContain("cannot");
      expect(line.toLowerCase()).not.toContain("must");
    }
  });

  it("says nothing that shames, and never uses a banned word", () => {
    const r = deriveReadiness({ profile: NONE, records: [] }, NOW);
    for (const line of [describeReadiness(r), describeHandoverInvitation(r)]) {
      const lower = line.toLowerCase();
      expect(lower).not.toContain("overdue");
      expect(lower).not.toContain("incomplete");
      expect(lower).not.toContain("estate");
      expect(lower).not.toContain("asset");
      expect(line).not.toContain("—");
    }
  });
});

describe("what counts as a blank copy", () => {
  it("is blank only when nothing at all has been decided", () => {
    expect(isBlankCopy(deriveReadiness({ profile: NONE, records: [] }, NOW))).toBe(true);
  });

  it("stops being blank the moment anything is confirmed", () => {
    const steps = relevantSteps(NONE);
    expect(isBlankCopy(deriveReadiness({ profile: NONE, records: [rec(steps[0].key)] }, NOW))).toBe(false);
  });

  /**
   * A deliberate skip is a decision, so a copy carrying one is not a
   * blank workbook even though nothing is confirmed. The filename and
   * the pages both depend on this agreeing.
   */
  it("stops being blank when something was marked not applicable", () => {
    const steps = relevantSteps(NONE);
    const records = [rec(steps[0].key, { state: "notRelevant", confirmedAt: null })];
    expect(isBlankCopy(deriveReadiness({ profile: NONE, records }, NOW))).toBe(false);
  });

  it("stops being blank when something was deliberately left open", () => {
    const steps = relevantSteps(NONE);
    const records = [rec(steps[0].key, { state: "open", confirmedAt: null })];
    expect(isBlankCopy(deriveReadiness({ profile: NONE, records }, NOW))).toBe(false);
  });
});
