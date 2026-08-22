import { describe, expect, it } from "vitest";
import { AFFAIR_STEPS } from "./affairsKnowledge";

/**
 * The printed book is read by somebody who has never used the software,
 * usually at the worst moment of their week. These tests exist because
 * every failure they catch is invisible in the app and only shows up on
 * paper, in front of the one reader who cannot ask a question.
 */
describe("how the book speaks to a stranger", () => {
  it("labels every entry, so nothing prints under a heading meant for the owner", () => {
    for (const step of AFFAIR_STEPS) {
      expect(step.bookLabel.length, step.key).toBeGreaterThan(0);
    }
  });

  it("never reuses the app's instruction as the book's heading", () => {
    for (const step of AFFAIR_STEPS) {
      expect(step.bookLabel, step.key).not.toBe(step.instruction);
    }
  });

  /**
   * The specific failure this caught: "Write down who should be called
   * first." above a name reads as a job the reader has been given.
   */
  it("never opens a book heading with an instruction to the reader", () => {
    const IMPERATIVES = [
      "write", "choose", "name", "tell", "decide", "list", "record", "note",
      "consider", "check", "update", "ask", "say", "make", "set",
    ];
    for (const step of AFFAIR_STEPS) {
      const firstWord = step.bookLabel.split(" ")[0].toLowerCase();
      expect(IMPERATIVES, `${step.key}: "${step.bookLabel}"`).not.toContain(firstWord);
    }
  });

  it("never ends a book heading with a full stop, because it is a label and not a sentence", () => {
    for (const step of AFFAIR_STEPS) {
      expect(step.bookLabel.endsWith("."), step.key).toBe(false);
    }
  });

  it("addresses the owner in the app, where the owner is the reader", () => {
    // The instruction stays imperative on purpose. The two audiences are
    // the entire reason there are two strings.
    const imperative = AFFAIR_STEPS.filter((s) => /^(Write|Choose|Name|Tell|Decide|List|Record|Note|Consider|Check|Update|Ask|Say|Make|Set)/.test(s.instruction));
    expect(imperative.length).toBe(AFFAIR_STEPS.length);
  });

  it("says nothing in a book heading that needs the software to understand", () => {
    const SOFTWARE = ["step", "task", "complete", "done this", "click", "tap", "screen", "app", "field", "form"];
    for (const step of AFFAIR_STEPS) {
      for (const word of SOFTWARE) {
        expect(step.bookLabel.toLowerCase(), step.key).not.toContain(word);
      }
    }
  });

  it("keeps the banned words out of the book, same as everywhere else", () => {
    for (const step of AFFAIR_STEPS) {
      expect(step.bookLabel.toLowerCase(), step.key).not.toContain("estate");
      expect(step.bookLabel.toLowerCase(), step.key).not.toContain("asset");
      expect(step.bookLabel.toLowerCase(), step.key).not.toContain("overdue");
      expect(step.bookLabel, step.key).not.toContain("—");
    }
  });

  it("gives every entry a distinct label, so two rows never read the same", () => {
    const labels = AFFAIR_STEPS.map((s) => s.bookLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

/**
 * The two kinds of step read differently on paper and the labels have to
 * follow. A record is a thing ("Who to contact first"); an action is
 * something that happened ("The guardian has been asked"). Getting them
 * the wrong way round is invisible in the app.
 */
describe("labels match what the entry actually is", () => {
  const PAST = /\b(was|were|has been|have been)\b/i;

  it("names the thing for every step that holds a record", () => {
    for (const step of AFFAIR_STEPS.filter((s) => s.kind === "establish")) {
      expect(PAST.test(step.bookLabel), `${step.key}: "${step.bookLabel}"`).toBe(false);
    }
  });

  it("never leaves a bare pronoun with nothing to attach it to", () => {
    for (const step of AFFAIR_STEPS) {
      const first = step.bookLabel.split(" ")[0].toLowerCase();
      expect(["they", "them", "it", "he", "she"], `${step.key}: "${step.bookLabel}"`).not.toContain(first);
    }
  });
});
