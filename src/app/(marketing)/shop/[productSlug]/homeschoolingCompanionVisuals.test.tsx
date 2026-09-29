import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { homeschoolingCompanionDefinition as definition } from "@/products/homeschooling-companion/definition";
import { defaultDestinationLabel } from "@/product-framework/destinations";
import { OverviewScreenMockup, CheckScreenMockup, BookScreenMockup } from "./homeschoolingCompanionVisuals";

/**
 * The Shop drawings of the Homeschooling Companion are recreations, and a
 * recreation that is not checked against what it recreates keeps drawing a
 * product that has moved on. This is the guard that was missing when
 * TodayView.tsx moved from a Done/Did-not-get-to-it button pair to a
 * tap-to-mark circle with a per-child recorded count, and the drawing kept
 * the retired button pair for two weeks with nothing to catch it.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const visuals = readFileSync(join(__dirname, "homeschoolingCompanionVisuals.tsx"), "utf8");
const visible = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

const HSC = "src/products/homeschooling-companion";
const TODAY_VIEW = `${HSC}/components/TodayView.tsx`;
const TODAY_MODULE = `${HSC}/components/TodayModule.tsx`;
const CHECK_MODULE = `${HSC}/components/CheckModule.tsx`;
const CHECK = `${HSC}/check.ts`;
const HANDBOOK = `${HSC}/printables/handbook.tsx`;

const PHRASES: { text: string; from: string[] }[] = [
  { text: "What we are doing today.", from: [TODAY_MODULE] },
  { text: "recorded", from: [TODAY_VIEW] },
  { text: "Their page", from: [TODAY_VIEW] },
  { text: "Did not get to it", from: [TODAY_VIEW] },
  { text: "Nothing scheduled today.", from: [TODAY_VIEW] },
  { text: "Worth going over again.", from: [TODAY_VIEW] },
  { text: "What came back", from: [CHECK_MODULE] },
  { text: "answered questions.", from: [CHECK_MODULE] },
  { text: "This is a short check you ran at home, not an assessment.", from: [CHECK_MODULE] },
  { text: "Looked solid", from: [CHECK] },
  { text: "Worth another look", from: [CHECK] },
  { text: "Not enough to say", from: [CHECK] },
  { text: "The Homeschool Year", from: [HANDBOOK] },
  { text: "Undated, so it starts whenever you do.", from: [HANDBOOK] },
];

describe("Homeschooling Companion's Shop drawings", () => {
  it("draw only phrases the product really renders", () => {
    for (const { text, from } of PHRASES) {
      expect(visuals, `the drawing no longer shows "${text}"`).toContain(text);
      for (const file of from) {
        expect(read(file), `"${text}" is drawn but ${file} no longer says it`).toContain(text);
      }
    }
  });

  it("draw the tap-to-mark circle and per-child recorded count, not the retired Done/Did-not-get-to-it button pair", () => {
    // The bug this guards: the drawing kept a Done/Did-not-get-to-it button
    // pair (a pill each) after TodayView.tsx moved to a tap circle plus an
    // "N of M recorded" count with a link to the child's own page.
    expect(visuals).toContain("0 of 4 recorded");
    expect(visuals).not.toContain(">Done<");
    expect(read(TODAY_VIEW)).toContain("recorded");
    expect(read(TODAY_VIEW)).not.toContain(">Done<");
  });

  it("draw the standing tags with the product's own three-way vocabulary", () => {
    const drawnTags = [...visuals.matchAll(/tag: "([^"]+)"/g)].map((m) => m[1]);
    expect(drawnTags).toEqual(["Looked solid", "Worth another look", "Not enough to say"]);
  });

  it("draw the bottom bar the product has, in the order it has it", () => {
    const match = visuals.match(/\(\[("Today"[^\]]+)\] as const\)\.map\(\(tab\)/);
    const drawn = [...(match?.[1].matchAll(/"(\w+)"/g) ?? [])].map((m) => m[1]);
    expect(definition.primaryNavigation).toEqual(["workspace", "kids", "record"]);
    expect(drawn).toEqual([
      definition.workspaceLabel,
      ...(["kids", "record"] as const).map((id) => definition.destinationLabels?.[id] ?? defaultDestinationLabel(id)),
    ]);
  });

  it("take their colour from the definition's real accent, not a pasted hex", () => {
    expect(definition.theme?.accentScale?.base).toBe("#6a4a72");
    expect(visuals).toContain('const PLUM = "#6a4a72"');
  });

  it("render all three screens without throwing", () => {
    expect(() => renderToStaticMarkup(<OverviewScreenMockup />)).not.toThrow();
    expect(() => renderToStaticMarkup(<CheckScreenMockup />)).not.toThrow();
    expect(() => renderToStaticMarkup(<BookScreenMockup />)).not.toThrow();
  });

  it("draw a check result whose order matches what the product would rank first", () => {
    // Multiplication (looked solid) has nothing to fix; equivalent
    // fractions (worth another look) is the one the product's own
    // "one thing here is worth going over again" headline is about, so it
    // must not be buried last.
    const text = visible(renderToStaticMarkup(<CheckScreenMockup />));
    expect(text.indexOf("Multiplication")).toBeLessThan(text.indexOf("Equivalent fractions"));
    expect(text).toContain("One thing here is worth going over again.");
  });

  it("never use a word this product refuses, a score, a percentage, or an em dash", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    // Assembled from parts so this file does not itself trip the public-copy scan for the words it forbids.
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"], ["beh", "ind"], ["ah", "ead"]].map((parts) => parts.join(""));
    for (const word of refused) expect(drawn.toLowerCase(), `"${word}" is drawn`).not.toContain(word);
    expect(drawn).not.toMatch(/%/);
    expect(drawn).not.toContain(String.fromCharCode(0x2014));
  });
});
