import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  organizationStructuredData,
  softwareApplicationStructuredData,
  websiteStructuredData,
} from "@/lib/structuredData";
import nextConfig from "../../next.config";

/**
 * Locks in the canonical-domain fix (apex draftpace.com, never www) and the
 * structured-data content, so a future edit can't silently reintroduce the
 * www mismatch this launch pass found and fixed, or add a fabricated
 * rating/review to the JSON-LD.
 */
describe("Canonical domain: apex, never www", () => {
  const filesToCheck = [
    "src/app/layout.tsx",
    "src/app/sitemap.ts",
    "src/app/robots.ts",
    "src/lib/structuredData.ts",
    "src/products/monthly-money-reset/components/PrintablesModule.tsx",
  ];

  for (const file of filesToCheck) {
    it(`${file} contains no www.draftpace.com reference`, () => {
      const source = readFileSync(join(process.cwd(), file), "utf-8");
      expect(source.includes("www.draftpace.com")).toBe(false);
    });
  }

  /**
   * The rule this protects is narrow and was learned the hard way: the
   * apex-vs-www redirect is owned by Vercel's domain config, and a second
   * app-level rule keying on host produced a live infinite loop.
   *
   * Path redirects are fine and are used for retired URLs, so this asserts
   * the actual invariant rather than banning the whole feature: no rule may
   * match on host, and no destination may be absolute.
   */
  it("next.config.ts never redirects on host (owned by Vercel's domain config to avoid a loop)", async () => {
    const rules = (await nextConfig.redirects?.()) ?? [];
    expect(rules.length, "guard is vacuous if no redirects exist to check").toBeGreaterThan(0);

    for (const rule of rules) {
      for (const condition of [...(rule.has ?? []), ...(rule.missing ?? [])]) {
        expect(condition.type, `${rule.source} matches on host`).not.toBe("host");
      }
      expect(rule.destination.startsWith("/"), `${rule.source} redirects off-path`).toBe(true);
      expect(rule.source.startsWith("/"), `${rule.source} is not a path`).toBe(true);
    }
  });
});

describe("Structured data: factual only, no fabricated ratings or reviews", () => {
  it("Organization has no aggregateRating or review fields", () => {
    const data = organizationStructuredData();
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data).not.toHaveProperty("review");
    expect(data.url).toBe("https://draftpace.com");
  });

  it("WebSite carries no fabricated search action (no site search exists)", () => {
    const data = websiteStructuredData();
    expect(data).not.toHaveProperty("potentialAction");
  });

  it("SoftwareApplication has no aggregateRating, and its price is the real $0 of the free launch product", () => {
    const data = softwareApplicationStructuredData();
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data.offers.price).toBe("0");
    expect(data.offers.priceCurrency).toBe("USD");
  });
});
