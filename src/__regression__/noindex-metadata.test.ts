import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression guard: authenticated and admin routes must stay noindex.
 * Checked at the source level (not by importing the layouts, which pull in
 * next/headers and require the Next.js request context) — this fails loudly
 * if the noindex metadata is ever accidentally removed from one of these
 * layouts.
 */

const NOINDEX_LAYOUTS = ["src/app/app/layout.tsx", "src/app/admin/layout.tsx", "src/app/(auth)/layout.tsx"];

describe("protected/transactional route groups declare noindex", () => {
  for (const layout of NOINDEX_LAYOUTS) {
    it(`${layout} sets robots: { index: false, follow: false }`, () => {
      const source = readFileSync(join(process.cwd(), layout), "utf-8");
      expect(source.includes("index: false")).toBe(true);
      expect(source.includes("follow: false")).toBe(true);
    });
  }
});

describe("robots.ts disallows application and admin routes", () => {
  it("disallows /app and /admin", () => {
    const source = readFileSync(join(process.cwd(), "src/app/robots.ts"), "utf-8");
    expect(source.includes('"/app"')).toBe(true);
    expect(source.includes('"/admin"')).toBe(true);
  });
});

describe("sitemap.ts lists only real public pages", () => {
  it("contains no /app, /admin, or product routes", () => {
    const source = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf-8");
    expect(source.includes("/app")).toBe(false);
    expect(source.includes("/admin")).toBe(false);
    expect(source.includes("/products/")).toBe(false);
  });
});
