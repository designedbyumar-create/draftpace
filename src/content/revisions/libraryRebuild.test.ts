import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GUIDES } from "../guides";
import { libraryInfo, libraryRevisions } from "./library";

describe("complete article library rebuild", () => {
  it("replaces all 137 articles without deleting or renaming a URL", () => {
    const inventory = JSON.parse(readFileSync(join(process.cwd(), "audit-2026-11-16/inventory.json"), "utf8")) as { url: string }[];
    expect(GUIDES).toHaveLength(137);
    expect(Object.keys(libraryRevisions)).toHaveLength(135);
    const implemented = new Set([...Object.keys(libraryRevisions), "doctor-appointment-prep-checklist", "four-day-homeschool-week"]);
    expect(inventory.filter(({ url }) => !implemented.has(url.split("/").at(-1)!))).toEqual([]);
    expect(new Set(GUIDES.map((guide) => guide.slug)).size).toBe(137);
  });

  it("gives each rebuilt library article two relevant visual descriptions and a real free worksheet", () => {
    for (const [slug, info] of Object.entries(libraryInfo)) {
      expect(info.diagrams, slug).toHaveLength(2);
      expect(existsSync(join(process.cwd(), "public", info.printHref)), slug).toBe(true);
      for (const diagram of info.diagrams) {
        expect(diagram.steps.length, slug).toBeGreaterThanOrEqual(3);
        expect(diagram.steps.length, slug).toBeLessThanOrEqual(4);
        expect(existsSync(join(process.cwd(), "public", diagram.src)), `${slug}: ${diagram.src}`).toBe(true);
        expect(JSON.stringify(diagram)).not.toMatch(/AI.generated|illustrative setup|DRAFTPACE\s*\//i);
      }
    }
  });

  it("does not fabricate country alternates for a country-specific single guide", () => {
    const guide = GUIDES.find((g) => g.slug === "who-to-tell-when-someone-dies")!;
    expect(guide.scopeCountry).toBe("us");
    expect(guide.locale).toBeUndefined();
    expect(guide.seoTitle).toMatch(/\(US\)$/);
  });

  it("keeps primary query targets distinct while removing the old claims", () => {
    const queries = GUIDES.map((guide) => guide.primaryQuery);
    expect(new Set(queries).size).toBe(137);
    const car = JSON.stringify(GUIDES.find((guide) => guide.slug === "used-car-no-service-records-what-to-do")!.body);
    expect(car).toContain("reported services");
    expect(car).not.toContain("A history report shows title events, not routine maintenance");
    const school = JSON.stringify(GUIDES.find((guide) => guide.slug === "four-day-homeschool-week")!.body);
    expect(school).toContain("144");
    expect(school).toContain("45 teaching weeks");
  });
});
