import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { alongsideDefinition } from "@/products/alongside/definition";

/**
 * The Shop drawings of ADHD Life Companion are recreations, and a
 * recreation that is not checked against the thing it recreates keeps
 * drawing a product that has moved on. This one drew a Help tab for weeks
 * after the tab was gone. So every phrase it draws is asserted, here,
 * against the component or playbook that really renders it.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const visuals = readFileSync(join(__dirname, "adhdLifeCompanionVisuals.tsx"), "utf8");

const ALS = "src/products/alongside";
const PHRASES: { text: string; from: string[] }[] = [
  { text: "You said you would come back to this", from: [`${ALS}/attention.ts`] },
  { text: "Do this with me", from: [`${ALS}/components/NowView.tsx`, `${ALS}/components/LifeModule.tsx`] },
  { text: "Not now", from: [`${ALS}/components/NowView.tsx`] },
  { text: "It is sorted", from: [`${ALS}/components/NowView.tsx`, `${ALS}/components/LifeModule.tsx`] },
  { text: "Keep something", from: [`${ALS}/components/NowView.tsx`] },
  { text: "Help me with something", from: [`${ALS}/components/NowView.tsx`] },
  { text: "Everything you are holding", from: [`${ALS}/components/LifeModule.tsx`] },
  { text: "They came back to me", from: [`${ALS}/components/LifeModule.tsx`] },
  { text: "Something to do", from: [`${ALS}/life.ts`] },
  { text: "Waiting on someone", from: [`${ALS}/life.ts`] },
  { text: "Sorted", from: [`${ALS}/components/SortedList.tsx`] },
  { text: "Show", from: [`${ALS}/components/SortedList.tsx`] },
  { text: "Make a phone call", from: [`${ALS}/playbooks/makeAPhoneCall.ts`] },
  { text: "While you are on the call", from: [`${ALS}/playbooks/makeAPhoneCall.ts`] },
  {
    text: "Short on purpose. Anything longer is unreadable while somebody is talking to you.",
    from: [`${ALS}/playbooks/makeAPhoneCall.ts`],
  },
  { text: "What a good result looks like", from: [`${ALS}/playbooks/makeAPhoneCall.ts`] },
  { text: "Do not forget", from: [`${ALS}/playbooks/makeAPhoneCall.ts`] },
  { text: "Say what you need", from: [`${ALS}/playbooks/makeAPhoneCall.ts`] },
  { text: "Ask your main question", from: [`${ALS}/playbooks/makeAPhoneCall.ts`] },
  { text: "Ask what happens next", from: [`${ALS}/playbooks/makeAPhoneCall.ts`] },
  { text: "Ready", from: ["src/components/product-shell/companion/CompanionRun.tsx"] },
];

describe("ADHD Life Companion's Shop drawings", () => {
  it("draw only phrases the product really renders", () => {
    for (const { text, from } of PHRASES) {
      expect(visuals, `the drawing no longer shows "${text}"`).toContain(`"${text}"`.replace(/^"|"$/g, ""));
      for (const file of from) {
        expect(read(file), `"${text}" is drawn but ${file} no longer says it`).toContain(text);
      }
    }
  });

  it("draw the bottom bar the product has, in the order it has it", () => {
    const labels = [
      alongsideDefinition.workspaceLabel,
      alongsideDefinition.destinationLabels?.life,
    ];
    const drawn = [...visuals.matchAll(/\{ label: "(\w+)", Icon: /g)].map((match) => match[1]);
    expect(drawn).toEqual(labels);
    expect(alongsideDefinition.primaryNavigation).toEqual(["workspace", "life"]);
    expect(visuals).not.toMatch(/"Help"\s*[|,\]]/);
  });

  it("take their colours from the definition, so a re-theme cannot leave them behind", () => {
    expect(visuals).toContain("alongsideDefinition.theme?.ground?.light");
    expect(visuals).toContain("alongsideDefinition.theme?.accentScale");
    expect(visuals.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
  });

  it("never draw a streak, a count of what is waiting, or a word about lateness", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(drawn).not.toMatch(/streak|overdue|\bmissed\b|\blate\b|\d+ more|more things|Worth a look/i);
  });

  it("keep the accent for filled controls and the tab you are on: never as the colour of a line of text", () => {
    expect(visuals, "accent used as a text colour").not.toMatch(/color: ACCENT\b/);
    expect(visuals.match(/\? ACCENT : MUTED/g), "the active tab is the one text-coloured use").toHaveLength(1);
  });
});
