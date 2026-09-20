import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { personalLifeAffairsCompanionDefinition as definition } from "@/products/personal-life-affairs-companion/definition";

/**
 * The Shop drawings of Personal Life Affairs Companion are recreations, and a
 * recreation that is not checked against what it recreates keeps drawing a
 * product that has moved on. Every phrase drawn is asserted here against the
 * component, playbook or knowledge file that really says it.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const visuals = readFileSync(join(__dirname, "personalLifeAffairsCompanionVisuals.tsx"), "utf8");

const PLA = "src/products/personal-life-affairs-companion";
const PHRASES: { text: string; from: string[] }[] = [
  { text: "One thing worth taking care of.", from: [`${PLA}/components/WorkspaceModule.tsx`] },
  { text: "Write down who should be called first.", from: [`${PLA}/affairsKnowledge.ts`] },
  { text: "Everything else assumes somebody knows to look.", from: [`${PLA}/affairsKnowledge.ts`] },
  { text: "Goes in your book as", from: [`${PLA}/components/NextStepPage.tsx`] },
  { text: "Who to contact first", from: [`${PLA}/affairsKnowledge.ts`] },
  { text: "Who would sort things out", from: [`${PLA}/affairsKnowledge.ts`] },
  { text: "Who decides, and who to call", from: [`${PLA}/affairsKnowledge.ts`] },
  { text: "About", from: [`${PLA}/components/NextStepPage.tsx`] },
  { text: "Start", from: [`${PLA}/components/WorkspaceModule.tsx`] },
  { text: "Not relevant to me", from: [`${PLA}/components/WorkspaceModule.tsx`] },
  { text: "Later", from: [`${PLA}/components/WorkspaceModule.tsx`] },
  { text: "for this one thing.", from: [`${PLA}/components/CompanionCapture.tsx`] },
  { text: "Change", from: [`${PLA}/components/CompanionCapture.tsx`] },
  { text: "Continue", from: [`${PLA}/components/CompanionCapture.tsx`] },
  { text: "Skip this", from: [`${PLA}/components/CompanionCapture.tsx`] },
  { text: "How would someone reach them?", from: [`${PLA}/captures.ts`] },
  { text: "A phone number or an email. Nothing else is needed.", from: [`${PLA}/captures.ts`] },
  { text: "My Affairs", from: [`${PLA}/completion.ts`] },
  { text: "Personal Life Affairs Companion", from: [`${PLA}/completion.ts`] },
  { text: "Last updated", from: [`${PLA}/components/BookSpread.tsx`] },
  { text: "People", from: [`${PLA}/affairsKnowledge.ts`] },
  { text: "Important documents", from: [`${PLA}/affairsKnowledge.ts`] },
  { text: "Money", from: [`${PLA}/affairsKnowledge.ts`] },
];

describe("Personal Life Affairs Companion's Shop drawings", () => {
  it("draw only phrases the product really renders", () => {
    for (const { text, from } of PHRASES) {
      expect(visuals, `the drawing no longer shows "${text}"`).toContain(text);
      for (const file of from) {
        expect(read(file), `"${text}" is drawn but ${file} no longer says it`).toContain(text);
      }
    }
  });

  it("draw the bottom bar the product has, in the order it has it", () => {
    const drawn = [...visuals.matchAll(/\{ label: "(\w+)", Icon: /g)].map((match) => match[1]);
    const labels = [
      definition.workspaceLabel,
      definition.destinationLabels?.affairs,
      definition.destinationLabels?.printables,
      definition.destinationLabels?.history,
    ];
    expect(drawn).toEqual(labels);
    expect(definition.primaryNavigation).toEqual(["workspace", "affairs", "printables", "history"]);
  });

  it("take their colours from the definition, so a re-theme cannot leave them behind", () => {
    expect(visuals).toContain("personalLifeAffairsCompanionDefinition.theme?.ground?.light");
    expect(visuals).toContain("personalLifeAffairsCompanionDefinition.theme?.accentScale");
    expect(visuals.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
  });

  it("never draw a count, a progress figure, or a word the product refuses", () => {
    // The one counter that exists is scoped to a single capture ("for this one thing"), never to the product.
    const drawn = visuals
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace("Question 3 of 4 for this one thing.", "");
    expect(drawn).not.toMatch(/estate|assets|overdue|progress|percent|in case i die|in case of death/i);
    expect(drawn).not.toMatch(/\b\d+ of \d+\b/);
  });
});
