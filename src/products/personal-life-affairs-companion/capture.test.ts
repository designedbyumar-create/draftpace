import { describe, expect, it } from "vitest";
import { acknowledge, buildDraft, captureFor, captureProgress, nextPrompt, UNSURE } from "./capture";
import { CAPTURE_SPECS } from "./captures";
import { AFFAIR_STEPS, AFFAIR_STEP_BY_KEY } from "./affairsKnowledge";

const CONTACT = CAPTURE_SPECS["people.emergency-contact"];

describe("one question at a time", () => {
  it("asks the first question and nothing else", () => {
    const prompt = nextPrompt(CONTACT, {});
    expect(prompt!.field).toBe("personName");
  });

  it("moves on only once the current one is answered", () => {
    expect(nextPrompt(CONTACT, {})!.field).toBe("personName");
    expect(nextPrompt(CONTACT, { personName: "Jane Smith" })!.field).toBe("relationship");
  });

  it("does not come back to something the person deliberately skipped", () => {
    const answers = { personName: "Jane Smith", relationship: "Partner" };
    const skipped = new Set(["personContact"]);
    expect(nextPrompt(CONTACT, answers, skipped)!.field).toBe("notes");
  });

  it("finishes, rather than looping forever on optional questions", () => {
    const answers = { personName: "Jane Smith", relationship: "Partner" };
    const skipped = new Set(["personContact", "notes"]);
    expect(nextPrompt(CONTACT, answers, skipped)).toBeNull();
  });

  it("counts only inside one capture, never across the whole product", () => {
    const progress = captureProgress(CONTACT, { personName: "Jane Smith" });
    expect(progress).toEqual({ asked: 1, total: 4 });
  });
});

describe("not asking what does not apply", () => {
  const will = CAPTURE_SPECS["paperwork.will-exists"];

  it("asks where the will is only when there is one", () => {
    expect(nextPrompt(will, { exists: "Yes" })!.field).toBe("whereabouts");
  });

  it("never asks where it is kept of somebody who just said they have none", () => {
    expect(nextPrompt(will, { exists: "No" })).toBeNull();
  });

  it("does not ask where it is kept when the person is not sure they have one", () => {
    expect(nextPrompt(will, { exists: UNSURE })).toBeNull();
  });
});

describe("the record that comes out", () => {
  const step = AFFAIR_STEP_BY_KEY["people.emergency-contact"];

  it("names itself from an answer already given, never by asking", () => {
    const draft = buildDraft(CONTACT, step.key, step.area, {
      personName: "Jane Smith",
      relationship: "Partner",
    });
    expect(draft.label).toBe("Jane Smith");
    expect(CONTACT.prompts.some((p) => p.prompt.toLowerCase().includes("call this"))).toBe(false);
  });

  it("puts the five reserved answers on columns and the rest in the open bag", () => {
    const draft = buildDraft(CONTACT, step.key, step.area, {
      personName: "Jane Smith",
      relationship: "Partner",
      personContact: "07700 900000",
      notes: "She knows where everything is.",
    });
    expect(draft.personName).toBe("Jane Smith");
    expect(draft.personContact).toBe("07700 900000");
    expect(draft.notes).toBe("She knows where everything is.");
    expect(draft.fields).toEqual({ relationship: "Partner" });
  });

  it("keeps the step it came from, which is how the engine knows the thing is known", () => {
    const draft = buildDraft(CONTACT, step.key, step.area, { personName: "Jane Smith", relationship: "Partner" });
    expect(draft.originStepKey).toBe("people.emergency-contact");
    expect(draft.area).toBe("people");
  });

  it("is established once every question that applies has an answer", () => {
    const draft = buildDraft(
      CONTACT,
      step.key,
      step.area,
      { personName: "Jane Smith", relationship: "Partner" },
      new Set(["personContact", "notes"])
    );
    expect(draft.status).toBe("established");
  });

  it("is incomplete when the person said they were not sure, so a shrug never prints as an answer", () => {
    const will = AFFAIR_STEP_BY_KEY["paperwork.will-exists"];
    const draft = buildDraft(CAPTURE_SPECS[will.key], will.key, will.area, { exists: UNSURE });
    expect(draft.status).toBe("incomplete");
  });

  it("is incomplete when a required question was left, rather than pretending it is finished", () => {
    const draft = buildDraft(CONTACT, step.key, step.area, { personName: "Jane Smith" });
    expect(draft.status).toBe("incomplete");
  });
});

describe("what the companion says back", () => {
  it("substitutes the record's own name into a line a person wrote", () => {
    expect(acknowledge(CONTACT, "Jane Smith")).toBe("Recorded. Jane Smith is who someone would start with.");
  });

  it("gives every capture an acknowledgement, so nothing saves in silence", () => {
    for (const [key, spec] of Object.entries(CAPTURE_SPECS)) {
      expect(spec.acknowledgement.length, key).toBeGreaterThan(0);
    }
  });
});

/**
 * The boundary that keeps this a companion rather than a vault. If any
 * of these ever fails, the product has started asking for something it
 * has no business holding.
 */
describe("what may never be asked for", () => {
  const BANNED = [
    "password",
    "passcode",
    "pin number",
    "account number",
    "sort code",
    "routing number",
    "security question",
    "security answer",
    "social security number",
    "national insurance number",
    "card number",
    "combination",
  ];

  const everyString = Object.values(CAPTURE_SPECS).flatMap((spec) =>
    spec.prompts.flatMap((p) => [p.prompt, p.hint ?? "", p.placeholder ?? ""])
  );

  for (const word of BANNED) {
    it(`never asks for a ${word}`, () => {
      const offending = everyString.filter((s) => s.toLowerCase().includes(word));
      // "Never record the combination here" is a warning, not a request.
      const asking = offending.filter(
        (s) =>
          // A warning not to record one, and the name of a category of
          // software, are both the opposite of asking for the thing.
          !/never|not the|nothing else|no need/i.test(s) && !/password manager/i.test(s)
      );
      expect(asking).toEqual([]);
    });
  }

  it("asks where the recovery instructions are, rather than for the master password", () => {
    const spec = CAPTURE_SPECS["digital.password-manager"];
    const recovery = spec.prompts.find((p) => p.field === "notes");
    expect(recovery!.prompt.toLowerCase()).toContain("recovery instructions");
    expect(recovery!.hint!.toLowerCase()).toContain("never the master password");
  });

  it("uses no em dash anywhere in anything it says", () => {
    for (const s of everyString) expect(s).not.toContain("—");
  });

  it("never says estate, assets or overdue to a person", () => {
    for (const s of everyString) {
      expect(s.toLowerCase()).not.toContain("estate");
      expect(s.toLowerCase()).not.toContain("asset");
      expect(s.toLowerCase()).not.toContain("overdue");
    }
  });
});

describe("captures and the knowledge base cannot drift apart", () => {
  it("gives every establish step a script", () => {
    const missing = AFFAIR_STEPS.filter((s) => s.kind === "establish" && !captureFor(s.key)).map((s) => s.key);
    expect(missing).toEqual([]);
  });

  it("gives no action step a script, since there is nothing to record", () => {
    const wrong = AFFAIR_STEPS.filter((s) => s.kind === "action" && captureFor(s.key)).map((s) => s.key);
    expect(wrong).toEqual([]);
  });

  it("has no script for a step that does not exist", () => {
    const keys = new Set(AFFAIR_STEPS.map((s) => s.key));
    expect(Object.keys(CAPTURE_SPECS).filter((k) => !keys.has(k))).toEqual([]);
  });

  it("asks at most four questions, because a fifth is a form", () => {
    for (const [key, spec] of Object.entries(CAPTURE_SPECS)) {
      expect(spec.prompts.length, key).toBeLessThanOrEqual(4);
      expect(spec.prompts.length, key).toBeGreaterThan(0);
    }
  });

  it("can always name the record it produces", () => {
    for (const [key, spec] of Object.entries(CAPTURE_SPECS)) {
      const named = Boolean(spec.labelFixed) || Boolean(spec.labelFrom);
      expect(named, key).toBe(true);
      if (spec.labelFrom) {
        expect(spec.prompts.some((p) => p.field === spec.labelFrom), key).toBe(true);
      }
    }
  });

  it("shows an example for every naming question that is not simply a name", () => {
    for (const [key, spec] of Object.entries(CAPTURE_SPECS)) {
      if (!spec.labelFrom) continue;
      const prompt = spec.prompts.find((p) => p.field === spec.labelFrom)!;
      // Somebody asked "which bank?" with no example writes "the joint one".
      const selfEvident = ["personName", "provider"].includes(prompt.field);
      if (selfEvident || prompt.choices) continue;
      expect(Boolean(prompt.placeholder), key).toBe(true);
    }
  });

  it("never marks the naming question optional, or a record could come out unnamed", () => {
    for (const [key, spec] of Object.entries(CAPTURE_SPECS)) {
      if (!spec.labelFrom) continue;
      const prompt = spec.prompts.find((p) => p.field === spec.labelFrom)!;
      expect(prompt.optional ?? false, key).toBe(false);
      expect(prompt.askIf, key).toBeUndefined();
    }
  });
});
