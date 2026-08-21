import { describe, expect, it } from "vitest";
import { deriveAffairsState, isRelevant, needsRecheck, type StepRecord } from "./sequencer";
import { AFFAIR_STEP_BY_KEY } from "./affairsKnowledge";

const NOW = new Date("2026-08-22T12:00:00Z");

function rec(stepKey: string, over: Partial<StepRecord> = {}): StepRecord {
  return { stepKey, state: "confirmed", confirmedAt: NOW.toISOString(), snoozedUntil: null, ...over };
}
function monthsAgo(n: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n * 31);
  return d.toISOString();
}

describe("the sequencer", () => {
  it("returns exactly one step, never a list", () => {
    const state = deriveAffairsState({ profile: {}, records: [] }, NOW);
    expect(state.next).not.toBeNull();
    expect(Object.keys(state.next!)).toEqual(["step", "reason", "confirmedCount"]);
  });

  it("opens with something that needs nothing else first", () => {
    const { next } = deriveAffairsState({ profile: {}, records: [] }, NOW);
    expect(next!.step.requires ?? []).toHaveLength(0);
    expect(next!.reason).toBe("firstTime");
  });

  it("leads with consequence, not with whatever is quickest", () => {
    const { next } = deriveAffairsState({ profile: {}, records: [] }, NOW);
    expect(next!.step.consequence).toBe(2);
  });

  /** The sequencing rule that Home Base's engine has no concept of. */
  it("will not offer a backup executor before an executor exists", () => {
    const state = deriveAffairsState({ profile: {}, records: [] }, NOW);
    let guard = 0;
    let current = state;
    const seen: string[] = [];
    while (current.next && guard++ < 100) {
      seen.push(current.next.step.key);
      if (current.next.step.key === "people.executor-backup") break;
      current = deriveAffairsState(
        { profile: {}, records: seen.map((k) => rec(k)) },
        NOW
      );
    }
    expect(seen).toContain("people.executor");
    expect(seen.indexOf("people.executor")).toBeLessThan(seen.indexOf("people.executor-backup"));
  });

  it("never mentions children to somebody who has not said they have any", () => {
    const { relevant } = deriveAffairsState({ profile: {}, records: [] }, NOW);
    expect(relevant.some((s) => s.key.startsWith("dependants.guardian"))).toBe(false);
  });

  it("brings guardianship in the moment they say they have children", () => {
    const { relevant } = deriveAffairsState({ profile: { hasChildren: true }, records: [] }, NOW);
    expect(relevant.some((s) => s.key === "dependants.guardian")).toBe(true);
  });

  it("treats an unanswered gate as hidden, not as yes", () => {
    expect(isRelevant(AFFAIR_STEP_BY_KEY["dependants.pets"], {})).toBe(false);
    expect(isRelevant(AFFAIR_STEP_BY_KEY["dependants.pets"], { hasPets: false })).toBe(false);
    expect(isRelevant(AFFAIR_STEP_BY_KEY["dependants.pets"], { hasPets: true })).toBe(true);
  });

  it("counts up and never produces a denominator", () => {
    const state = deriveAffairsState(
      { profile: {}, records: [rec("people.emergency-contact"), rec("people.executor")] },
      NOW
    );
    expect(state.confirmedCount).toBe(2);
    expect(state).not.toHaveProperty("total");
    expect(state).not.toHaveProperty("percentComplete");
  });

  it("stays quiet when everything relevant is settled", () => {
    const { relevant } = deriveAffairsState({ profile: {}, records: [] }, NOW);
    const all = relevant.map((s) => rec(s.key));
    const state = deriveAffairsState({ profile: {}, records: all }, NOW);
    expect(state.next).toBeNull();
    expect(state.allCaughtUp).toBe(true);
  });

  it("respects a snooze and comes back after it lapses", () => {
    const first = deriveAffairsState({ profile: {}, records: [] }, NOW)!.next!.step.key;
    const snoozed = rec(first, { state: "pending", confirmedAt: null, snoozedUntil: "2026-09-30" });
    expect(deriveAffairsState({ profile: {}, records: [snoozed] }, NOW).next!.step.key).not.toBe(first);

    const later = new Date("2026-10-01T12:00:00Z");
    expect(deriveAffairsState({ profile: {}, records: [snoozed] }, later).next!.step.key).toBe(first);
  });

  /**
   * Caretaker mode. This is the behaviour no binder and no vault has,
   * and the reason the product is alive rather than a filing cabinet.
   */
  it("asks again once a confirmation has gone stale", () => {
    const step = AFFAIR_STEP_BY_KEY["money.beneficiary-check"];
    const fresh = rec(step.key, { confirmedAt: NOW.toISOString() });
    const stale = rec(step.key, { confirmedAt: monthsAgo(step.confirmEveryMonths! + 1) });
    expect(needsRecheck(step, fresh, NOW)).toBe(false);
    expect(needsRecheck(step, stale, NOW)).toBe(true);
  });

  it("surfaces a stale confirmation as a recheck, not as if it were new", () => {
    const { relevant } = deriveAffairsState({ profile: {}, records: [] }, NOW);
    const records = relevant.map((s) =>
      rec(s.key, { confirmedAt: s.key === "money.beneficiary-check" ? monthsAgo(24) : NOW.toISOString() })
    );
    const state = deriveAffairsState({ profile: {}, records }, NOW);
    expect(state.next!.step.key).toBe("money.beneficiary-check");
    expect(state.next!.reason).toBe("needsRecheck");
  });

  it("never re-asks something that does not go stale", () => {
    const letters = AFFAIR_STEP_BY_KEY["wishes.letters"];
    expect(needsRecheck(letters, rec(letters.key, { confirmedAt: monthsAgo(120) }), NOW)).toBe(false);
  });

  /**
   * If somebody says a prerequisite does not apply, everything behind it
   * must not be trapped forever.
   */
  it("does not block a step behind a prerequisite marked not relevant", () => {
    const records = [rec("people.executor", { state: "notRelevant", confirmedAt: null })];
    const state = deriveAffairsState({ profile: {}, records }, NOW);
    let guard = 0;
    let seen = records.map((r) => r.stepKey);
    let current = state;
    while (current.next && guard++ < 100) {
      if (current.next.step.key === "people.executor-backup") break;
      seen = [...seen, current.next.step.key];
      current = deriveAffairsState(
        { profile: {}, records: seen.map((k) => (k === "people.executor" ? records[0] : rec(k))) },
        NOW
      );
    }
    expect(current.next?.step.key).toBe("people.executor-backup");
  });

  it("is deterministic, so the same inputs always choose the same step", () => {
    const a = deriveAffairsState({ profile: { hasChildren: true, hasPets: true }, records: [] }, NOW);
    const b = deriveAffairsState({ profile: { hasPets: true, hasChildren: true }, records: [] }, NOW);
    expect(a.next!.step.key).toBe(b.next!.step.key);
  });

  it("can walk a whole life from nothing to finished without stalling", () => {
    const profile = { hasChildren: true, hasPets: true, ownsHome: true, partnered: true };
    const done: string[] = [];
    let guard = 0;
    for (;;) {
      const state = deriveAffairsState({ profile, records: done.map((k) => rec(k)) }, NOW);
      if (!state.next) break;
      expect(guard++, "sequencer stalled").toBeLessThan(200);
      expect(done, "offered the same step twice").not.toContain(state.next.step.key);
      done.push(state.next.step.key);
    }
    expect(done.length).toBe(deriveAffairsState({ profile, records: [] }, NOW).relevant.length);
  });
});
