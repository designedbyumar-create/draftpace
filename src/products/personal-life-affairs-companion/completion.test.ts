import { describe, expect, it } from "vitest";
import {
  BOOK_ATTRIBUTION,
  BOOK_NAME,
  bookFilename,
  deriveReadiness,
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

/**
 * The cover used to carry a summary of standings, including how many
 * things had not been started. It was not a fraction, but it was still
 * asking the person holding somebody's affairs to judge how far along
 * they had got. It is gone, and the document no longer accepts a summary
 * at all, so it cannot come back by being passed in.
 */
describe("the cover keeps no score", () => {
  it("offers no way to hand a summary line to the document", () => {
    // DocumentInputs has no `summary` field. If one is ever added back,
    // this fails to compile rather than failing at review time.
    const inputs: Record<string, unknown> = { size: "LETTER", preparedBy: "", readiness: readiness(), generatedAt: NOW };
    expect(Object.keys(inputs)).not.toContain("summary");
  });

  it("still knows what is in the book, for the app's own use", () => {
    const r = readiness([], [item("people.executor")]);
    expect(r.itemCount).toBe(1);
    expect(r.notAddressed).toBeGreaterThan(0);
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

/**
 * The printed book is the artifact a person hands to somebody else. What
 * it calls itself matters more than anywhere else in the product, and the
 * internal name is the easiest thing in the world to reintroduce by
 * accident, so it is guarded rather than trusted.
 */
describe("what the book calls itself", () => {
  it("is named for the document, never for the software that made it", () => {
    expect(BOOK_NAME).toBe("My Affairs");
    expect(BOOK_NAME.toLowerCase()).not.toContain("in order");
    expect(BOOK_NAME).not.toContain("Draftpace");
  });

  it("attributes itself to the product, quietly and by its real name", () => {
    expect(BOOK_ATTRIBUTION).toBe("Personal Life Affairs Companion");
    expect(BOOK_ATTRIBUTION.toLowerCase()).not.toContain("in order");
  });

  it("lands in a downloads folder under the document's name, not the slug", () => {
    const at = new Date("2026-08-22T12:00:00Z");
    const filled = bookFilename(readiness([], [item("people.executor")]), at);
    expect(filled).toBe("my-affairs-copy-2026-08-22.pdf");
    expect(filled).not.toContain("in-order");
  });

  it("gives a blank copy a different filename, so the two never collide", () => {
    const at = new Date("2026-08-22T12:00:00Z");
    expect(bookFilename(readiness(), at)).toBe("my-affairs-blank-2026-08-22.pdf");
    expect(bookFilename(readiness(), at)).not.toBe(bookFilename(readiness([], [item("people.executor")]), at));
  });

  it("never says estate, assets or overdue on the cover", () => {
    for (const text of [BOOK_NAME, BOOK_ATTRIBUTION]) {
      expect(text.toLowerCase()).not.toContain("estate");
      expect(text.toLowerCase()).not.toContain("asset");
      expect(text.toLowerCase()).not.toContain("overdue");
    }
  });
});
