import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  organizationStructuredData,
  softwareApplicationStructuredData,
  websiteStructuredData,
} from "@/lib/structuredData";

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

  it("next.config.ts redirects www to the apex domain", () => {
    const source = readFileSync(join(process.cwd(), "next.config.ts"), "utf-8");
    expect(source).toContain('value: "www.draftpace.com"');
    expect(source).toContain("https://draftpace.com/:path*");
    expect(source).toContain("permanent: true");
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
