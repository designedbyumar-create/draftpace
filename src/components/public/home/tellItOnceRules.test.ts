import { describe as suite, expect, it } from "vitest";
import { DEFAULTS, ITEMS, describe, formatDay, span, TODAY } from "./tellItOnceRules";
import { RENEWAL_SOON_DAYS } from "@/products/vehicle-maintenance-companion/renewals";
import { RENEWAL_LEAD_DAYS } from "@/products/vehicle-maintenance-companion/vehicleReminders";

/**
 * The homepage's "Tell it once" demo states rules, and each rule has to be the
 * rule the product really runs. The two that are constants in code are read
 * from the code here, so changing either fails this file.
 */
suite("Tell it once", () => {
  it("says a day in words, with no '1 days'", () => {
    expect(span(1)).toBe("1 day");
    expect(span(9)).toBe("9 days");
    expect(span(30)).toBe("4 weeks");
    expect(formatDay(TODAY)).toBe("Sep 21, 2026");
  });

  it("works the boiler out from when it was last done, and says so once when it is late", () => {
    const soon = describe("boiler", { ...DEFAULTS, ago: 10 });
    expect(soon.remembered).toContain("Last done Nov 21, 2025");
    expect(soon.worked).toBe("Next due Nov 21, 2026, in 9 weeks.");
    expect(soon.speaks).toContain("Nothing yet. It comes up on Oct 22, 2026, 30 days before");
    const late = describe("boiler", { ...DEFAULTS, ago: 14 });
    expect(late.worked).toBe("Was due Jul 21, 2026. It is 9 weeks late.");
    expect(late.speaks).toContain("says so once");
    expect(describe("boiler", { ...DEFAULTS, ago: 11 }).speaks).toContain("on your Home screen now");
  });

  it("uses the vehicle product's own 45 day and 14 day rules", () => {
    expect(RENEWAL_SOON_DAYS).toBe(45);
    expect(RENEWAL_LEAD_DAYS).toBe(14);
    expect(describe("car", { ...DEFAULTS, daysAway: 43 }).speaks).toContain("showing on Due now");
    expect(describe("car", { ...DEFAULTS, daysAway: 60 }).speaks).toContain("from Oct 6, 2026, 45 days before");
    expect(describe("car", { ...DEFAULTS, daysAway: 43, remind: true }).speaks).toContain("14 days before");
  });

  it("adds a sentence when reminders are on, and only where the product has something to remind", () => {
    for (const id of ["flight", "allergy", "will"] as const) {
      expect(describe(id, { ...DEFAULTS, remind: true })).toEqual(describe(id, DEFAULTS));
    }
    expect(describe("visa", { ...DEFAULTS, remind: true }).speaks).toContain("one notification");
    expect(describe("visa", DEFAULTS).speaks).not.toContain("notification");
  });

  it("names a real product for every item, and never invents a score, a streak or an em dash", () => {
    // Assembled from parts so this file does not trip the public-copy scan.
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"]].map((p) => p.join(""));
    for (const item of ITEMS) {
      const r = describe(item.id, { ...DEFAULTS, remind: true });
      for (const line of [item.name, r.remembered, r.worked, r.speaks]) {
        expect(line).not.toContain(String.fromCharCode(0x2014));
        for (const word of refused) expect(line.toLowerCase()).not.toContain(word);
      }
    }
    expect(new Set(ITEMS.map((i) => i.productSlug)).size).toBe(ITEMS.length);
  });
});
