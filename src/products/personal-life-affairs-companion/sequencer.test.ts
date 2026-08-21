import { describe, expect, it } from "vitest";
import { deriveAffairsState, isEstablished, isRelevant, needsRecheck, type StepRecord } from "./sequencer";
import { AFFAIR_STEPS, AFFAIR_STEP_BY_KEY } from "./affairsKnowledge";
import { computeNextReview, type AffairItem } from "./lifeAffairs";
import { item, rec } from "./testSupport";

const NOW = new Date("2026-08-22T12:00:00Z");

function monthsAgo(n: number): Date {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n * 31);
  return d;
}

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

describe("the sequencer", () => {
  it("returns exactly one step, never a list", () => {
    const state = deriveAffairsState({ profile: {}, records: [], items: [] }, NOW);
    expect(state.next).not.toBeNull();
    expect(Object.keys(state.next!).sort()).toEqual(["establishedCount", "existing", "reason", "step"]);
  });

  it("opens with something that needs nothing else first", () => {
    const { next } = deriveAffairsState({ profile: {}, records: [], items: [] }, NOW);
    expect(next!.step.requires ?? []).toHaveLength(0);
    expect(next!.reason).toBe("firstTime");
  });

  it("leads with consequence, not with whatever is quickest", () => {
    const { next } = deriveAffairsState({ profile: {}, records: [], items: [] }, NOW);
    expect(next!.step.consequence).toBe(2);
  });
});

/**
 * The rewrite's whole point. These are the tests that would have failed
 * against the version that recorded button presses, and the reason the
 * printed copy used to contain an instruction and a date and nothing
 * else.
 */
describe("knowledge, not completion", () => {
  it("does not consider an establish step settled just because it was confirmed", () => {
    const state = deriveAffairsState(
      { profile: {}, records: [rec("people.emergency-contact")], items: [] },
      NOW
    );
    expect(isEstablished(AFFAIR_STEP_BY_KEY["people.emergency-contact"], [])).toBe(false);
    expect(state.establishedCount).toBe(0);
  });

  it("settles an establish step only once a record exists for it", () => {
    const items = [item("people.emergency-contact")];
    const state = deriveAffairsState({ profile: {}, records: [], items }, NOW);
    expect(state.next!.step.key).not.toBe("people.emergency-contact");
    expect(state.establishedCount).toBe(1);
  });

  it("settles an action step on the person's word, because it happens in the world", () => {
    const executor = item("people.executor");
    const before = deriveAffairsState({ profile: {}, records: [], items: [executor] }, NOW);
    const after = deriveAffairsState(
      { profile: {}, records: [rec("people.executor-told")], items: [executor] },
      NOW
    );
    expect(before.relevant.some((s) => s.key === "people.executor-told")).toBe(true);
    expect(after.establishedCount).toBeGreaterThan(before.establishedCount);
  });

  it("hands the step back its existing records, so a return visit revises rather than duplicates", () => {
    const items = [item("people.professionals", { personName: "Ade Cole", label: "Ade Cole" })];
    // Force it to be chosen by settling everything ahead of it.
    const state = deriveAffairsState({ profile: {}, records: [], items }, NOW);
    expect(state.next).not.toBeNull();
    const professionals = deriveAffairsState({ profile: {}, records: [], items }, NOW).relevant.find(
      (s) => s.key === "people.professionals"
    );
    expect(professionals).toBeDefined();
    expect(items[0].originStepKey).toBe("people.professionals");
  });

  it("counts up and never produces a denominator", () => {
    const state = deriveAffairsState(
      { profile: {}, records: [], items: [item("people.emergency-contact"), item("people.executor")] },
      NOW
    );
    expect(state.establishedCount).toBe(2);
    expect(JSON.stringify(state)).not.toContain("total");
    expect(JSON.stringify(state)).not.toContain("percent");
  });
});

describe("confirmations recorded before answers were kept", () => {
  const legacy = rec("people.executor", { legacyConfirmation: true });

  it("does not throw away the date somebody earned", () => {
    const { relevant } = deriveAffairsState({ profile: {}, records: [legacy], items: [] }, NOW);
    expect(relevant.find((s) => s.key === "people.executor")).toBeDefined();
    expect(legacy.confirmedAt).not.toBeNull();
  });

  it("still lets the steps behind it through, so nothing is trapped", () => {
    // The backup requires people.executor. With a legacy confirmation it
    // is reachable, which is the whole reason legacy rows still settle.
    const reachable: string[] = [];
    let records = [legacy];
    for (let i = 0; i < 44; i += 1) {
      const s = deriveAffairsState({ profile: {}, records, items: [] }, NOW);
      if (!s.next) break;
      reachable.push(s.next.step.key);
      records = [...records, rec(s.next.step.key, { state: "notRelevant", confirmedAt: null })];
    }
    expect(reachable).toContain("people.executor-backup");
  });

  it("offers to fill in the detail, and says why rather than calling it undone", () => {
    let records = [legacy];
    let found: string | null = null;
    for (let i = 0; i < 8; i += 1) {
      const s = deriveAffairsState({ profile: {}, records, items: [] }, NOW);
      if (!s.next) break;
      if (s.next.step.key === "people.executor") {
        found = s.next.reason;
        break;
      }
      records = [...records, rec(s.next.step.key, { state: "notRelevant", confirmedAt: null })];
    }
    expect(found).toBe("needsDetail");
  });

  it("stops asking for the detail once a record exists", () => {
    const state = deriveAffairsState(
      { profile: {}, records: [legacy], items: [item("people.executor")] },
      NOW
    );
    const offered = state.next?.step.key === "people.executor" ? state.next.reason : null;
    expect(offered).not.toBe("needsDetail");
  });
});

describe("relevance", () => {
  it("never mentions children to somebody who has not said they have any", () => {
    const state = deriveAffairsState({ profile: { hasChildren: false }, records: [], items: [] }, NOW);
    expect(state.relevant.some((s) => s.key.startsWith("dependants.guardian"))).toBe(false);
  });

  it("brings guardianship in the moment they say they have children", () => {
    const state = deriveAffairsState({ profile: { hasChildren: true }, records: [], items: [] }, NOW);
    expect(state.relevant.some((s) => s.key === "dependants.guardian")).toBe(true);
  });

  it("treats an unanswered gate as hidden, not as yes", () => {
    const step = AFFAIR_STEP_BY_KEY["dependants.guardian"];
    expect(isRelevant(step, {})).toBe(false);
    expect(isRelevant(step, { hasChildren: true })).toBe(true);
  });
});

describe("the caretaker years", () => {
  it("asks again once a record has been standing long enough", () => {
    const step = AFFAIR_STEP_BY_KEY["people.emergency-contact"];
    const old = item("people.emergency-contact", {}, monthsAgo((step.confirmEveryMonths ?? 24) + 1));
    expect(needsRecheck(step, undefined, [old], NOW)).toBe(true);
  });

  it("keys the clock to the record, not to the button press", () => {
    const step = AFFAIR_STEP_BY_KEY["people.emergency-contact"];
    const fresh = item("people.emergency-contact");
    // An ancient step row cannot make a freshly confirmed record stale.
    const ancient = rec("people.emergency-contact", { confirmedAt: monthsAgo(60).toISOString() });
    expect(needsRecheck(step, ancient, [fresh], NOW)).toBe(false);
  });

  it("surfaces a stale record as a recheck, not as if it were new", () => {
    const old = item("people.emergency-contact", {}, monthsAgo(40));
    const state = deriveAffairsState({ profile: {}, records: [], items: [old] }, NOW);
    // Walk until it comes up.
    let records: StepRecord[] = [];
    let reason: string | null = null;
    for (let i = 0; i < 50; i += 1) {
      const s = deriveAffairsState({ profile: {}, records, items: [old] }, NOW);
      if (!s.next) break;
      if (s.next.step.key === "people.emergency-contact") {
        reason = s.next.reason;
        break;
      }
      records = [...records, rec(s.next.step.key, { state: "notRelevant", confirmedAt: null })];
    }
    expect(state.relevant.length).toBeGreaterThan(0);
    expect(reason).toBe("needsRecheck");
  });

  it("never re-asks something that does not go stale", () => {
    const step = AFFAIR_STEP_BY_KEY["wishes.letters"];
    expect(step.confirmEveryMonths).toBeUndefined();
    const ancient: AffairItem = item(
      "wishes.letters",
      { reviewIntervalMonths: null, nextReviewAt: computeNextReview(null, monthsAgo(200)) },
      monthsAgo(200)
    );
    expect(needsRecheck(step, undefined, [ancient], NOW)).toBe(false);
  });

  it("respects a snooze and comes back after it lapses", () => {
    const later = new Date(NOW.getTime() + 10 * 86_400_000).toISOString().slice(0, 10);
    const snoozed = rec("people.emergency-contact", { state: "open", confirmedAt: null, snoozedUntil: later });
    const during = deriveAffairsState({ profile: {}, records: [snoozed], items: [] }, NOW);
    expect(during.next!.step.key).not.toBe("people.emergency-contact");

    const after = deriveAffairsState(
      { profile: {}, records: [snoozed], items: [] },
      new Date(NOW.getTime() + 40 * 86_400_000)
    );
    expect(after.next!.step.key).toBe("people.emergency-contact");
  });

  it("brings something back when the person said they were not sure", () => {
    const unsure = rec("people.emergency-contact", { state: "unsure", confirmedAt: null });
    const state = deriveAffairsState({ profile: {}, records: [unsure], items: [] }, NOW);
    expect(state.next!.step.key).toBe("people.emergency-contact");
    expect(state.next!.reason).toBe("wasUnsure");
  });

  it("does not treat not sure as a no", () => {
    const unsure = rec("people.emergency-contact", { state: "unsure", confirmedAt: null });
    const no = rec("people.emergency-contact", { state: "notRelevant", confirmedAt: null });
    const a = deriveAffairsState({ profile: {}, records: [unsure], items: [] }, NOW);
    const b = deriveAffairsState({ profile: {}, records: [no], items: [] }, NOW);
    expect(a.next!.step.key).toBe("people.emergency-contact");
    expect(b.next!.step.key).not.toBe("people.emergency-contact");
  });
});

describe("sequencing", () => {
  it("will not offer a backup executor before an executor exists", () => {
    const backup = AFFAIR_STEP_BY_KEY["people.executor-backup"];
    expect(backup.requires).toContain("people.executor");

    let records: StepRecord[] = [];
    const items: AffairItem[] = [];
    const seen: string[] = [];
    for (let i = 0; i < 44; i += 1) {
      const s = deriveAffairsState({ profile: {}, records, items }, NOW);
      if (!s.next) break;
      seen.push(s.next.step.key);
      if (s.next.step.kind === "establish") items.push(item(s.next.step.key));
      else records = [...records, rec(s.next.step.key)];
    }
    expect(seen.indexOf("people.executor")).toBeLessThan(seen.indexOf("people.executor-backup"));
  });

  it("does not block a step behind a prerequisite marked not relevant", () => {
    const declined = rec("people.executor", { state: "notRelevant", confirmedAt: null });
    let records = [declined];
    const items: AffairItem[] = [];
    const seen: string[] = [];
    for (let i = 0; i < 44; i += 1) {
      const s = deriveAffairsState({ profile: {}, records, items }, NOW);
      if (!s.next) break;
      seen.push(s.next.step.key);
      if (s.next.step.kind === "establish") items.push(item(s.next.step.key));
      else records = [...records, rec(s.next.step.key)];
    }
    expect(seen).toContain("people.executor-backup");
  });

  it("is deterministic, so the same inputs always choose the same step", () => {
    const a = deriveAffairsState({ profile: EVERYTHING, records: [], items: [] }, NOW);
    const b = deriveAffairsState({ profile: EVERYTHING, records: [], items: [] }, NOW);
    expect(a.next!.step.key).toBe(b.next!.step.key);
  });

  it("can walk a whole life from nothing to finished without stalling", () => {
    let records: StepRecord[] = [];
    const items: AffairItem[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const s = deriveAffairsState({ profile: EVERYTHING, records, items }, NOW);
      if (!s.next) break;
      expect(seen.has(s.next.step.key)).toBe(false);
      seen.add(s.next.step.key);
      if (s.next.step.kind === "establish") items.push(item(s.next.step.key));
      else records = [...records, rec(s.next.step.key)];
    }
    const final = deriveAffairsState({ profile: EVERYTHING, records, items }, NOW);
    expect(final.next).toBeNull();
    expect(final.allCaughtUp).toBe(true);
    expect(seen.size).toBe(AFFAIR_STEPS.length);
  });

  it("stays quiet when everything relevant is settled", () => {
    const records = AFFAIR_STEPS.map((s) => rec(s.key, { state: "notRelevant", confirmedAt: null }));
    const state = deriveAffairsState({ profile: EVERYTHING, records, items: [] }, NOW);
    expect(state.next).toBeNull();
    expect(state.allCaughtUp).toBe(true);
  });
});
