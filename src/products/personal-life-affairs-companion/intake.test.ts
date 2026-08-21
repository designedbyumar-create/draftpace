import { describe, expect, it } from "vitest";
import { INTAKE_QUESTIONS, nextUnansweredIntake, intakeComplete } from "./intake";
import { AFFAIR_STEPS } from "./affairsKnowledge";
import { relevantSteps } from "./sequencer";

describe("intake", () => {
  it("asks about every gate the knowledge base actually uses", () => {
    const gatesUsed = new Set(AFFAIR_STEPS.flatMap((s) => s.needs ?? []));
    const gatesAsked = new Set(INTAKE_QUESTIONS.map((q) => q.gate));
    for (const gate of gatesUsed) {
      // A gate nobody is asked about would silence its steps forever.
      expect(gatesAsked, `nothing asks about ${gate}`).toContain(gate);
    }
  });

  it("asks nothing it does not use", () => {
    const gatesUsed = new Set(AFFAIR_STEPS.flatMap((s) => s.needs ?? []));
    for (const q of INTAKE_QUESTIONS) {
      expect(gatesUsed, `${q.gate} is asked but gates nothing`).toContain(q.gate);
    }
  });

  it("treats no as an answer and undefined as unasked", () => {
    expect(nextUnansweredIntake({})?.gate).toBe(INTAKE_QUESTIONS[0].gate);
    const answeredNo = { [INTAKE_QUESTIONS[0].gate]: false };
    expect(nextUnansweredIntake(answeredNo)?.gate).toBe(INTAKE_QUESTIONS[1].gate);
  });

  it("finishes once every question has an answer", () => {
    const all = Object.fromEntries(INTAKE_QUESTIONS.map((q) => [q.gate, false]));
    expect(intakeComplete(all)).toBe(true);
    expect(nextUnansweredIntake(all)).toBeNull();
  });

  it("tells the person why it is asking, every time", () => {
    for (const q of INTAKE_QUESTIONS) {
      expect(q.why.length, q.gate).toBeGreaterThan(40);
      expect(q.question.endsWith("?"), q.gate).toBe(true);
    }
  });

  it("leads with the question that unlocks the most consequential steps", () => {
    // Guardianship is the reason most people finally start.
    expect(INTAKE_QUESTIONS[0].gate).toBe("hasChildren");
  });

  it("never says estate or assets, and never uses an em dash", () => {
    for (const q of INTAKE_QUESTIONS) {
      const text = `${q.question} ${q.why}`.toLowerCase();
      expect(text, q.gate).not.toContain("estate");
      expect(text, q.gate).not.toContain("asset");
      expect(`${q.question} ${q.why}`).not.toContain("—");
    }
  });

  it("leaves a person who answers no to everything with a genuinely short but real list", () => {
    const allNo = Object.fromEntries(INTAKE_QUESTIONS.map((q) => [q.gate, false]));
    const steps = relevantSteps(allNo);
    // Short is correct, empty is not: everybody has some of this.
    expect(steps.length).toBeGreaterThan(15);
    expect(steps.length).toBeLessThan(AFFAIR_STEPS.length);
    expect(steps.some((s) => s.needs?.length)).toBe(false);
  });

  it("gives somebody with a full life more to do than somebody without", () => {
    const allNo = Object.fromEntries(INTAKE_QUESTIONS.map((q) => [q.gate, false]));
    const allYes = Object.fromEntries(INTAKE_QUESTIONS.map((q) => [q.gate, true]));
    expect(relevantSteps(allYes).length).toBeGreaterThan(relevantSteps(allNo).length);
  });
});
