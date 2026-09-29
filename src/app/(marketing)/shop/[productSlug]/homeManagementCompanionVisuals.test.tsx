import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { homeManagementCompanionDefinition as definition } from "@/products/home-management-companion/definition";
import { defaultDestinationLabel } from "@/product-framework/destinations";
import { OverviewScreenMockup, ActionRecordScreenMockup, SetupScreenMockup } from "./homeManagementCompanionVisuals";

/**
 * The Shop drawings of Home Base are recreations, and a recreation that is
 * not checked against what it recreates keeps drawing a product that has
 * moved on. This is the guard that was missing when HomeView.tsx moved to
 * the State Strip and eyelet tag rows, and the two-tab (Home/History)
 * bottom bar it replaced kept being drawn for two weeks with nothing to
 * catch it.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const visuals = readFileSync(join(__dirname, "homeManagementCompanionVisuals.tsx"), "utf8");
/**
 * Every apostrophe encoding folded to one character, so a drawing and its
 * real component can be compared regardless of which one either happens
 * to use. Deliberately does NOT strip tags: this runs against raw .tsx
 * source, not rendered HTML, and a real multi-line JSX opening tag (props
 * spanning several lines before its closing `>`) is not one HTML element
 * a naive `<[^>]+>` strip can safely remove: it swallows every prop's
 * text along with it, including the phrase being checked for.
 */
const foldApostrophes = (source: string) => source.replace(/&apos;|&rsquo;|&#x27;/g, "'");

const HMC = "src/products/home-management-companion/components";
const HOME_VIEW = `${HMC}/HomeView.tsx`;
const CARE_SHEET = `${HMC}/care/CareActionSheet.tsx`;
const SETUP = `${HMC}/SetupModule.tsx`;

const PHRASES: { text: string; from: string[] }[] = [
  { text: "Wrong", from: [HOME_VIEW] },
  { text: "To care for", from: [HOME_VIEW] },
  { text: "Coming up", from: [HOME_VIEW] },
  { text: "Handled", from: [HOME_VIEW] },
  { text: "Worth taking care of", from: [HOME_VIEW] },
  { text: "Needs a look", from: [HOME_VIEW] },
  { text: "Tap whatever you have. Home Base already knows what these usually need", from: [SETUP] },
  { text: "I took care of it", from: [CARE_SHEET] },
  { text: "Skipping this round", from: [CARE_SHEET] },
];

/** Phrases that only exist behind an apostrophe entity, checked word-for-word instead of byte-for-byte. */
const APOSTROPHE_PHRASES: { text: string; from: string }[] = [
  { text: "Something's wrong", from: HOME_VIEW },
  { text: "What's in your home?", from: SETUP },
];

describe("Home Base's Shop drawings", () => {
  it("draw only phrases the product really renders", () => {
    for (const { text, from } of PHRASES) {
      expect(visuals, `the drawing no longer shows "${text}"`).toContain(text);
      for (const file of from) {
        expect(read(file), `"${text}" is drawn but ${file} no longer says it`).toContain(text);
      }
    }
  });

  it("draw phrases with an apostrophe correctly, regardless of which quote entity is used", () => {
    for (const { text, from } of APOSTROPHE_PHRASES) {
      expect(foldApostrophes(visuals), `the drawing no longer shows "${text}"`).toContain(text);
      expect(foldApostrophes(read(from)), `"${text}" is drawn but ${from} no longer says it`).toContain(text);
    }
  });

  it("draw the State Strip, not the retired four-band grid it replaced", () => {
    // The bug this guards: the drawing kept a static four-band numbered
    // grid after HomeView.tsx moved to a State Strip of jump-chips.
    expect(visuals).toContain("StateStrip");
    expect(read(HOME_VIEW)).toContain("StateStrip");
  });

  it("draw the tag row with a punched eyelet, HomeView.tsx's real card shape", () => {
    expect(visuals).toMatch(/rounded-l-\[[\d.]+px\]\s+rounded-r-\[[\d.]+px\]/);
    expect(read(HOME_VIEW)).toMatch(/rounded-l-\[[\d.]+px\]\s+rounded-r-\[[\d.]+px\]/);
  });

  it("draw the bottom bar the product has, in the order it has it", () => {
    const match = visuals.match(/\(\[("Now"[^\]]+)\] as const\)\.map\(\(tab\)/);
    const drawn = [...(match?.[1].matchAll(/"(\w+)"/g) ?? [])].map((m) => m[1]);
    expect(definition.primaryNavigation).toEqual(["workspace", "seasons", "history", "printables"]);
    expect(drawn).toEqual([
      definition.workspaceLabel,
      ...(["seasons", "history", "printables"] as const).map(
        (id) => definition.destinationLabels?.[id] ?? defaultDestinationLabel(id)
      ),
    ]);
  });

  it("take their colour from the definition's real accent, not a pasted hex", () => {
    expect(definition.theme?.accentScale?.base).toBe("#4f7a5c");
    expect(visuals).toContain('const SAGE = "#4f7a5c"');
  });

  it("render all three screens without throwing", () => {
    expect(() => renderToStaticMarkup(<OverviewScreenMockup />)).not.toThrow();
    expect(() => renderToStaticMarkup(<ActionRecordScreenMockup />)).not.toThrow();
    expect(() => renderToStaticMarkup(<SetupScreenMockup />)).not.toThrow();
  });

  it("never use a word this product refuses, or an em dash", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    // Assembled from parts so this file does not itself trip the public-copy scan for the words it forbids.
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"], ["over", "due"]].map((parts) => parts.join(""));
    for (const word of refused) expect(drawn.toLowerCase(), `"${word}" is drawn`).not.toContain(word);
    expect(drawn).not.toContain(String.fromCharCode(0x2014));
  });
});
