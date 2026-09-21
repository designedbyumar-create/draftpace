import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { CaregiverSheetScreenMockup, FormsSheetScreenMockup, OverviewScreenMockup, SAMPLE } from "./familyHealthBinderVisuals";
import { familyHealthBinderDefinition as definition } from "@/products/family-health-binder/definition";
import { buildCaregiverSheet, buildFormsSheet, formsGaps } from "@/products/family-health-binder/printSheets";
import { describeVisit, describeVisitTiming, nextVisit } from "@/products/family-health-binder/visits";

/**
 * The drawings on the Shop page must say only what the product says, and be
 * coloured by the product's own definition. Each phrase drawn is checked
 * against the function or component that produces it in the product.
 */
const visuals = readFileSync(new URL("./familyHealthBinderVisuals.tsx", import.meta.url), "utf8");
const TODAY = "2026-09-21";
const visible = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'");
const { members, facts, providers, immunizations, events, visits } = SAMPLE;

describe("Family Health Binder's Shop drawings", () => {
  it("use the four destinations the product really has, and its own labels", () => {
    const text = visible(renderToStaticMarkup(<OverviewScreenMockup />));
    expect(definition.primaryNavigation).toEqual(["workspace", "members", "timeline", "visits"]);
    for (const label of ["Overview", "Family", "Symptoms", "Visits"]) expect(text).toContain(label);
  });

  it("take their colours from the definition, so a re-theme cannot leave them behind", () => {
    expect(visuals).toContain("definition.theme");
    expect(visuals).toContain("theme?.ground?.light");
    expect(visuals).toContain("theme?.accentScale");
    expect(visuals.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
  });

  it("work every line out with the product's own functions", () => {
    for (const fn of ["describeAge", "formsGaps", "nextVisit", "buildFormsSheet", "buildCaregiverSheet", "describeVisit"]) {
      expect(visuals, `${fn} is no longer what the drawing uses`).toContain(fn);
    }
  });

  it("draw Overview with allergies as tags first, the next visit in words and what the forms sheet is missing", () => {
    const text = visible(renderToStaticMarkup(<OverviewScreenMockup />));
    for (const allergy of ["Peanuts", "Penicillin", "Eggs"]) expect(text).toContain(allergy);
    expect(text).toContain("Parent \u00b7 79 years");
    const next = nextVisit(visits, "m1", TODAY);
    if (!next) throw new Error("the sample needs an upcoming visit");
    expect(text).toContain(`${describeVisit(next)}, ${describeVisitTiming(next, TODAY).toLowerCase()}`);
    expect(text).toContain(`Forms sheet is missing ${formsGaps(members[1], providers).join(", ")}`);
    expect(text).not.toContain("Forms sheet is missing date of birth");
  });

  it("draw the Forms sheet as the product builds it, with a missing answer said plainly and US dates", () => {
    const sheet = buildFormsSheet(members[0], facts, providers, immunizations, events, visits, TODAY);
    const text = visible(renderToStaticMarkup(<FormsSheetScreenMockup />));
    expect(text).toContain(sheet.person.dateOfBirth);
    expect(sheet.person.dateOfBirth).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    for (const line of sheet.immunizations) expect(text).toContain(line.detail);
    expect(text).toContain(sheet.insurance?.insurer);
    expect(text).not.toMatch(/due|recommended|overdue/i);
  });

  it("draw the Caregiver sheet with allergies first and only the fixed emergency line as advice", () => {
    const sheet = buildCaregiverSheet(members[0], facts, providers, immunizations, events, visits, TODAY);
    const text = visible(renderToStaticMarkup(<CaregiverSheetScreenMockup />));
    expect(text.indexOf("Allergies")).toBeLessThan(text.indexOf("Medications now"));
    expect(text).toContain(`All about ${sheet.person.name}`);
    expect(text).toContain(sheet.notes);
    expect(text).toContain("In an emergency, call 911.");
  });

  it("never draw a diagnosis, a dose check, a score or a streak", () => {
    const all = visible(renderToStaticMarkup(<OverviewScreenMockup />)) + visible(renderToStaticMarkup(<FormsSheetScreenMockup />)) + visible(renderToStaticMarkup(<CaregiverSheetScreenMockup />));
    expect(all).not.toMatch(/%|interaction|diagnos|dose check/i);
  });

  it("never use a word this product refuses, or an em dash", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    // Assembled from parts so this file does not itself trip the public-copy scan for the words it forbids.
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"], ["Fa", "mily Vitals"]].map((parts) => parts.join(""));
    for (const word of refused) expect(drawn.toLowerCase(), `"${word}" is drawn`).not.toContain(word.toLowerCase());
    expect(drawn).not.toContain(String.fromCharCode(0x2014));
  });
});
