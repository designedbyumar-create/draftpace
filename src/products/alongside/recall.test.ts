import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { recalledAnswers } from "@/components/product-shell/companion/steps";
import { PLAYBOOKS } from "./playbooks";
import { makeAPhoneCall } from "./playbooks/makeAPhoneCall";

/**
 * Showing a person's own words back is only true if the step it points at is
 * a written answer that comes before it. A recall aimed at a choice would
 * print a code ("problem") where their sentence should be.
 */
describe("the person's own words, shown back", () => {
  it("every recall points at an earlier step that the person wrote", () => {
    for (const playbook of PLAYBOOKS) {
      playbook.steps.forEach((step, index) => {
        for (const entry of step.recall ?? []) {
          const at = playbook.steps.findIndex((other) => other.key === entry.step);
          expect(at, `${playbook.key}/${step.key} recalls "${entry.step}", which does not exist`).toBeGreaterThanOrEqual(0);
          expect(at, `${playbook.key}/${step.key} recalls "${entry.step}", which comes later`).toBeLessThan(index);
          expect(
            playbook.steps[at].kind,
            `${playbook.key}/${step.key} recalls "${entry.step}", which is not a written answer`,
          ).toBe("write");
        }
      });
    }
  });

  it("only prepare and during steps recall", () => {
    for (const playbook of PLAYBOOKS) {
      for (const step of playbook.steps) {
        if (step.recall) expect(["prepare", "during"]).toContain(step.kind);
      }
    }
  });

  it("shows what was written and leaves out what was skipped or blank", () => {
    const during = makeAPhoneCall.steps.find((step) => step.key === "during")!;
    expect(recalledAnswers(during, { outcome: "  A date for someone to come out ", "must-not-forget": "" })).toEqual([
      { label: "What a good result looks like", text: "A date for someone to come out" },
    ]);
    expect(recalledAnswers(during, {})).toEqual([]);
  });

  it("the phone call walkthrough recalls what the person wrote", () => {
    const during = makeAPhoneCall.steps.find((step) => step.key === "during")!;
    expect((during.recall ?? []).length).toBeGreaterThan(0);
  });

  it("is what the walkthrough actually renders, or the recall is computed and never seen", () => {
    const run = readFileSync(
      join(process.cwd(), "src/components/product-shell/companion/CompanionRun.tsx"),
      "utf8",
    );
    expect(run).toContain("recalledAnswers(step, answers)");
    expect(run).toContain("<RecallPanel entries={recalled}");
  });
});
