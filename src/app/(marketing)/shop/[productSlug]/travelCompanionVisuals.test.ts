import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { travelCompanionDefinition as definition } from "@/products/travel-companion/definition";

/**
 * The Shop drawings of Travel Companion are recreations, and a recreation
 * that is not checked against what it recreates keeps drawing a product
 * that has moved on. Every phrase drawn is asserted here against the
 * component that really says it. The old change-impact drawing carried two
 * sentences the product never showed.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const visuals = readFileSync(join(__dirname, "travelCompanionVisuals.tsx"), "utf8");

const TRV = "src/products/travel-companion";
const PHRASES: { text: string; from: string[] }[] = [
  { text: "Currently in", from: [`${TRV}/components/TodayView.tsx`] },
  { text: "Awaiting confirmation", from: [`${TRV}/components/TodayView.tsx`] },
  { text: "Check-in begins", from: [`${TRV}/today.ts`] },
  { text: "Pickup begins", from: [`${TRV}/today.ts`] },
  { text: "Tomorrow", from: [`${TRV}/today.ts`] },
  { text: "Waiting", from: [`${TRV}/components/TodayView.tsx`] },
  { text: "Need help with something?", from: [`${TRV}/components/TodayModule.tsx`] },
  { text: "Itinerary", from: [`${TRV}/components/ItineraryView.tsx`] },
  { text: "Nothing recorded for this day.", from: [`${TRV}/components/ItineraryView.tsx`] },
  { text: "Add", from: [`${TRV}/components/ItineraryView.tsx`] },
  { text: "Sort out a problem with this", from: [`${TRV}/components/TripModule.tsx`] },
  { text: "Record a change", from: [`${TRV}/components/TripModule.tsx`] },
  { text: "This might affect", from: [`${TRV}/components/TripModule.tsx`] },
  { text: "unchanged so far:", from: [`${TRV}/components/TripModule.tsx`] },
  { text: "Deal with what changed", from: [`${TRV}/components/TripModule.tsx`] },
];

describe("Travel Companion's Shop drawings", () => {
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
    expect(drawn).toEqual([
      definition.workspaceLabel,
      definition.destinationLabels?.itinerary,
      definition.destinationLabels?.trip,
      definition.destinationLabels?.people,
    ]);
    expect(definition.primaryNavigation).toEqual(["workspace", "itinerary", "trip", "people"]);
  });

  it("take their colours from the definition, so a re-theme cannot leave them behind", () => {
    expect(visuals).toContain("travelCompanionDefinition.theme?.ground?.light");
    expect(visuals).toContain("travelCompanionDefinition.theme?.accentScale");
    expect(visuals.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
  });

  it("never draw an amount, a live status, a countdown, or a word about lateness", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(drawn).not.toMatch(/[$£€¥]\s?\d|\bUSD\b|\bEUR\b|countdown|days to go|days left|sleeps|overdue|\blate\b|on time|delayed by/i);
  });

  it("spend the accent on the tab you are on and nowhere else, as the product does", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(drawn, "accent used as a text colour").not.toMatch(/color: ACCENT\b/);
    expect(drawn, "accent used as a fill").not.toMatch(/(?:backgroundColor|borderColor|background): ACCENT\b/);
    expect(drawn.match(/\? ACCENT : MUTED/g), "the active tab is the one text-coloured use").toHaveLength(1);
  });
});
