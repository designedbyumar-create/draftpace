import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression guard: the legal pages were rewritten in Phase 2 to remove
 * every claim tied to the abandoned planner-marketplace direction
 * (docs/DECISIONS.md, docs/MIGRATION-PLAN.md). This fails loudly if any of
 * those specific claims ever reappear, rather than relying on someone
 * remembering to re-check by hand.
 */

const LEGAL_PAGES = [
  "src/app/(marketing)/privacy/page.tsx",
  "src/app/(marketing)/terms/page.tsx",
  "src/app/(marketing)/cookies/page.tsx",
];

const FORBIDDEN_CLAIMS = [
  "Gumroad",
  "Etsy",
  "200+ planners",
  "$7/month",
  "$49/year",
  "3 free planners",
  "streak counts",
];

describe("legal pages contain no historical false claims", () => {
  for (const page of LEGAL_PAGES) {
    it(`${page} has none of the forbidden abandoned-product claims`, () => {
      const source = readFileSync(join(process.cwd(), page), "utf-8");
      for (const claim of FORBIDDEN_CLAIMS) {
        expect(source.includes(claim)).toBe(false);
      }
    });
  }

  it("privacy and terms disclose that they have not been legally reviewed", () => {
    for (const page of ["src/app/(marketing)/privacy/page.tsx", "src/app/(marketing)/terms/page.tsx"]) {
      const source = readFileSync(join(process.cwd(), page), "utf-8");
      expect(source.toLowerCase().includes("not yet reviewed by counsel")).toBe(true);
    }
  });
});
