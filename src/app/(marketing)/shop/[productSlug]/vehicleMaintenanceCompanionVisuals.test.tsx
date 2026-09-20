import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { vehicleMaintenanceCompanionDefinition as definition } from "@/products/vehicle-maintenance-companion/definition";
import { deriveDueView } from "@/products/vehicle-maintenance-companion/dueStatus";
import { describeRemaining } from "@/products/vehicle-maintenance-companion/dueText";
import { historyByYear, formatCost } from "@/products/vehicle-maintenance-companion/serviceHistory";
import { HistoryScreenMockup, OverviewScreenMockup, ServiceBoundaryScreenMockup, SAMPLE } from "./vehicleMaintenanceCompanionVisuals";

/**
 * The Shop drawings of Vehicle Maintenance Companion are recreations, and a
 * recreation that is not checked against what it recreates keeps drawing a
 * product that has moved on. Every phrase drawn is asserted here against
 * the component that really says it, and every figure against the engine
 * that produces it. The old drawings kept a "Mark done today" button after
 * the product had replaced it.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const visuals = readFileSync(join(__dirname, "vehicleMaintenanceCompanionVisuals.tsx"), "utf8");
const visible = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

const VMC = "src/products/vehicle-maintenance-companion";
const DUE = `${VMC}/components/DueScreen.tsx`;
const HISTORY = `${VMC}/components/HistoryScreen.tsx`;
const PRINT = `${VMC}/components/PrintablesModule.tsx`;

const PHRASES: { text: string; from: string[] }[] = [
  { text: "Across everything you own", from: [DUE] },
  { text: "I had this done", from: [DUE] },
  { text: "Also due", from: [DUE] },
  { text: "Paperwork", from: [DUE] },
  { text: "What has been done, and when", from: [HISTORY] },
  { text: "entered, on", from: [HISTORY] },
  { text: "Print the service record", from: [HISTORY] },
  { text: "Change", from: [HISTORY] },
  { text: "One for the shop, one for a buyer, one for the glove box", from: [PRINT] },
  { text: "Service Boundary", from: [PRINT] },
  { text: "Shop (optional)", from: [PRINT] },
  { text: "Number to call you on (optional)", from: [PRINT] },
  { text: "What are you requesting today?", from: [PRINT] },
  { text: "Do not go over this without calling (optional)", from: [PRINT] },
  { text: "Ask them to keep any parts they replace, so I can see them", from: [PRINT] },
  { text: "Make the Service Boundary", from: [PRINT] },
];

describe("Vehicle Maintenance Companion's Shop drawings", () => {
  it("draw only phrases the product really renders", () => {
    for (const { text, from } of PHRASES) {
      expect(visuals, `the drawing no longer shows "${text}"`).toContain(text);
      for (const file of from) expect(read(file), `"${text}" is drawn but ${file} no longer says it`).toContain(text);
    }
  });

  it("draw the bottom bar the product has, in the order it has it", () => {
    const drawn = [...visuals.matchAll(/\{ label: "(\w+)", Icon: /g)].map((match) => match[1]);
    expect(drawn).toEqual([definition.workspaceLabel, definition.destinationLabels?.vehicles, definition.destinationLabels?.history, definition.destinationLabels?.paperwork]);
    expect(definition.primaryNavigation).toEqual(["workspace", "vehicles", "history", "paperwork"]);
  });

  it("take their colours from the definition, so a re-theme cannot leave them behind", () => {
    expect(visuals).toContain("definition.theme");
    expect(visuals).toContain("theme?.ground?.light");
    expect(visuals).toContain("theme?.hero?.light");
    expect(visuals.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
  });

  it("work every figure out with the product's own engine", () => {
    for (const fn of ["deriveDueView", "describeRemaining", "describeInterval", "odometerDigits", "deriveRenewalsView", "historyByYear", "formatCost"]) {
      expect(visuals, `${fn} is no longer what the drawing uses`).toContain(fn);
    }
  });

  it("draw the job the engine ranks first, with the words the product uses for how far past it is", () => {
    const top = deriveDueView(SAMPLE.vehicles, SAMPLE.items, new Date(2026, 8, 21, 9)).due[0];
    const text = visible(renderToStaticMarkup(<OverviewScreenMockup />));
    expect(text).toContain(top.item.taskName);
    expect(text).toContain(describeRemaining(top));
    expect(text).toContain("7ABC123");
    expect(text).toContain("2018 Honda Civic");
    expect(text).not.toMatch(/\b1 days\b/);
  });

  it("draw the odometer as the vehicle's own mileage, and never a percentage or a score", () => {
    const html = renderToStaticMarkup(<OverviewScreenMockup />);
    const cells = [...html.matchAll(/<span class="[^"]*h-\[17px\][^"]*"[^>]*>(\d)<\/span>/g)].map((m) => m[1]).join("");
    expect(cells).toBe("050400");
    expect(visible(html)).not.toMatch(/%|\bscore\b/i);
  });

  it("draw the strip of vehicles, each with its plate, so more than one car is visible at a glance", () => {
    const text = visible(renderToStaticMarkup(<OverviewScreenMockup />));
    expect(text).toContain("ALL");
    for (const vehicle of SAMPLE.vehicles) expect(text).toContain(vehicle.plate);
  });

  it("draw History with the same totals the product adds up", () => {
    const groups = historyByYear(SAMPLE.events, "v1");
    const text = visible(renderToStaticMarkup(<HistoryScreenMockup />));
    for (const group of groups) {
      if (group.costedCount > 0) expect(text).toContain(`${formatCost(group.costMinorUnits)} entered, on ${group.costedCount} of ${group.events.length}`);
    }
    expect(text.indexOf("2026")).toBeLessThan(text.indexOf("2025"));
  });

  it("draw the Service Boundary with its fields and the job that was ticked, and no factory-schedule claim", () => {
    const text = visible(renderToStaticMarkup(<ServiceBoundaryScreenMockup />));
    expect(text).toContain("Oil and filter change");
    expect(text).toContain("$200");
    expect(text).not.toMatch(/manufacturer|factory|recommended by/i);
  });

  it("never use a word this product refuses, or an em dash", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    // Assembled from parts so this file does not itself trip the public-copy scan for the words it forbids.
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"], ["Mark done ", "today"]].map((parts) => parts.join(""));
    for (const word of refused) expect(drawn.toLowerCase(), `"${word}" is drawn`).not.toContain(word.toLowerCase());
    expect(drawn).not.toContain(String.fromCharCode(0x2014));
  });
});
