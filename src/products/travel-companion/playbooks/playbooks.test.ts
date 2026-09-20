import { describe, expect, it } from "vitest";
import { conditionMet, visibleItems, visibleWording, type Answers } from "@/components/product-shell/companion/steps";
import { PLAYBOOKS, PLAYBOOK_BY_KEY, playbooksForBooking } from "./index";

/**
 * Structural checks on the library, same shape as Alongside's own,
 * since a silent fault in authored content (a branch with no
 * suggestion, a during list that has quietly grown too long) is
 * invisible until somebody picks that exact path on a real screen.
 */
describe("the library", () => {
  it("has exactly the nine, and no tenth: the eight the founder locked and the one added deliberately after", () => {
    expect(PLAYBOOKS.map((p) => p.key).sort()).toEqual(
      [
        "booking-problem",
        "flight-problem",
        "hotel-problem",
        "transport-problem",
        "something-changed",
        "reorganize-the-trip",
        "contact-someone",
        "lost-or-stolen",
        "something-went-wrong",
      ].sort()
    );
  });

  it("has no duplicate keys", () => {
    const keys = PLAYBOOKS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(Object.keys(PLAYBOOK_BY_KEY).sort()).toEqual(keys.sort());
  });

  it("offers at least one situation for every kind of booking, so no booking is ever a dead end", () => {
    const kinds: string[] = ["flight", "train", "car", "transfer", "hotel", "rental", "activity", "restaurant", "event", "other"];
    for (const kind of kinds) {
      expect(playbooksForBooking(kind as never).length, kind).toBeGreaterThan(0);
    }
  });

  for (const playbook of PLAYBOOKS) {
    describe(playbook.key, () => {
      it("has unique step keys", () => {
        const keys = playbook.steps.map((s) => s.key);
        expect(new Set(keys).size).toBe(keys.length);
      });

      it("ends at exactly one outcome step, and it is the last one", () => {
        const outcomes = playbook.steps.filter((s) => s.kind === "outcome");
        expect(outcomes).toHaveLength(1);
        expect(playbook.steps[playbook.steps.length - 1].kind).toBe("outcome");
      });

      it("only ever conditions on an answer it has already asked for", () => {
        const seen = new Set<string>();
        for (const step of playbook.steps) {
          const conditions = [
            step.askIf,
            ...(step.items ?? []).map((i) => i.askIf),
            ...(step.suggestedWording ?? []).map((w) => w.askIf),
          ].filter(Boolean);
          for (const condition of conditions) {
            expect(seen, `${step.key} conditions on ${condition!.step}`).toContain(condition!.step);
          }
          seen.add(step.key);
        }
      });

      it("gives every choice question at least two answers", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "choose")) {
          expect((step.choices ?? []).length, step.key).toBeGreaterThan(1);
          const values = (step.choices ?? []).map((c) => c.value);
          expect(new Set(values).size, `${step.key} repeats a value`).toBe(values.length);
        }
      });

      it("has wording for every branch that can reach it", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "wording")) {
          const gate = step.suggestedWording?.find((w) => w.askIf)?.askIf;
          if (!gate) {
            expect(visibleWording(step, {}).length, step.key).toBeGreaterThan(0);
            continue;
          }
          const gating = playbook.steps.find((s) => s.key === gate.step);
          for (const choice of gating?.choices ?? []) {
            const answers: Answers = { [gate.step]: choice.value };
            if (!conditionMet(step.askIf, answers)) continue;
            expect(visibleWording(step, answers).length, `${step.key} has nothing for ${choice.value}`).toBeGreaterThan(0);
          }
        }
      });

      it("keeps every during list short enough to read while somebody is talking", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "during")) {
          expect(visibleItems(step, {}).length).toBeLessThanOrEqual(7);
        }
      });

      it("shows something on every prepare step with no answers given", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "prepare")) {
          expect(visibleItems(step, {}).length, `${step.key} is empty with no answers given`).toBeGreaterThan(0);
        }
      });

      it("suggests openings only, never a position", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "wording")) {
          for (const { text } of step.suggestedWording ?? []) {
            for (const word of [
              "i demand", "you owe", "unacceptable", "compensation", "refund me",
              "i insist", "legal action", "or else", "final warning",
            ]) {
              expect(text.toLowerCase(), text).not.toContain(word);
            }
          }
        }
      });

      it("only ever marks a write step optional, since that is the only kind the engine gives a skip button to", () => {
        for (const step of playbook.steps.filter((s) => s.optional)) {
          expect(step.kind, `${step.key} sets optional but is a ${step.kind} step, which has no skip button`).toBe("write");
        }
      });

      it("never uses an exclamation mark or an em dash", () => {
        const all = playbook.steps.flatMap((s) => [
          s.prompt, s.why ?? "", s.hint ?? "", s.placeholder ?? "",
          ...(s.choices ?? []).map((c) => c.label),
          ...(s.items ?? []).map((i) => i.text),
          ...(s.suggestedWording ?? []).map((w) => w.text),
        ]);
        for (const text of all) {
          expect(text).not.toContain("!");
          expect(text).not.toContain("—");
        }
      });
    });
  }
});

describe("lost or stolen", () => {
  const playbook = PLAYBOOK_BY_KEY["lost-or-stolen"];
  const text = JSON.stringify(playbook).toLowerCase();

  it("says before anything else that it is not an emergency service", () => {
    expect(playbook.steps[0].why).toMatch(/emergency services first/i);
    expect(playbook.steps[0].kind).toBe("choose");
  });

  it("is a general situation, opened from Today rather than from one booking", () => {
    expect(playbook.opensFor).toBeUndefined();
    for (const kind of ["flight", "hotel", "train", "cruise"] as const) {
      expect(playbooksForBooking(kind).some((p) => p.key === "lost-or-stolen")).toBe(false);
    }
  });

  it("never claims what happens next: no fee, no timeline, no right, no promise, no legal or medical statement", () => {
    expect(text).not.toMatch(/\bwithin \d+|\d+ (hours|days|weeks)|free of charge|no charge|you will (get|receive|be)|you are entitled|your rights?|compensation|refund|reimburs|liable|guarantee|the law (says|requires)|must (report|file)|\bmust\b|diagnos|treatment|insurance will/);
  });

  it("offers something to have in front of you and an opening line for every kind of thing that can be lost", () => {
    for (const value of ["passport", "cards", "phone", "bag", "tickets", "other"]) {
      const answers = { what: value };
      const prepare = playbook.steps.find((s) => s.key === "prepare")!;
      const opening = playbook.steps.find((s) => s.key === "opening")!;
      expect(visibleItems(prepare, answers).length, `${value} has nothing to have in front of you`).toBeGreaterThan(1);
      expect(visibleWording(opening, answers).length, `${value} has no opening line`).toBeGreaterThan(0);
    }
  });

  it("keeps the product's voice: no urgency, no scoring, no dashes", () => {
    expect(text).not.toMatch(/—|\bcalm\b|overdue|urgent|don't forget|\bjust\b/);
  });
});
