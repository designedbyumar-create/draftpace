import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The store images are generated artifacts, not code, and nothing in the
 * type system knows whether they exist.
 *
 * Every public surface that shows a product's artwork (the Shop grid,
 * the generic detail page, and any bespoke landing page a product has
 * instead) reads the same STORE_COVERS list from productStructuredData.ts
 * rather than keeping its own copy, so a slug can no longer be listed on
 * one surface and not another. This checks that list's files are really
 * on disk, and that the surfaces which used to hand-maintain their own
 * copy still import the shared one rather than reintroducing a local
 * duplicate that could drift from it.
 */
const ROOT = join(__dirname, "../../../..");
const STORE = join(ROOT, "public/store");
const SHARED = "src/app/(marketing)/shop/productStructuredData.ts";

function sharedSlugs(): string[] {
  const source = readFileSync(join(ROOT, SHARED), "utf8");
  const block = source.match(/export const STORE_COVERS = new Set\(\[([^\]]*)\]\)/);
  expect(block, `${SHARED} declares STORE_COVERS`).not.toBeNull();
  return [...block![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

const GRID = "src/app/(marketing)/shop/page.tsx";
const DETAIL = "src/app/(marketing)/shop/[productSlug]/page.tsx";

describe("store images", () => {
  it("has all four files on disk for every slug the shared list names", () => {
    const slugs = sharedSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      for (const name of [
        `${slug}-1-cover.webp`,
        `${slug}-2-screen.webp`,
        `${slug}-3-screen.webp`,
        `${slug}-4-screen.webp`,
      ]) {
        expect(existsSync(join(STORE, name)), `public/store/${name}`).toBe(true);
      }
    }
  });

  it("reads the shared list on the grid and on the detail page, rather than its own copy", () => {
    for (const relativePath of [GRID, DETAIL]) {
      const source = readFileSync(join(ROOT, relativePath), "utf8");
      // Either imports STORE_COVERS directly, or imports a helper
      // (coverImagePath) that reads it internally -- either way, from the
      // one shared module, never a local redeclaration of the Set.
      expect(source, `${relativePath} imports from productStructuredData`).toMatch(
        /from\s+["'].*productStructuredData["']/,
      );
      expect(source, `${relativePath} declares its own STORE_COVERS`).not.toMatch(/const STORE_COVERS = new Set/);
    }
  });

  /**
   * The grid card prints the title and the promise itself, so a
   * thumbnail that also carries them burns the same two sentences into
   * the picture at 11px. The cover is for the social preview, where the
   * image travels alone; the grid takes a screen frame.
   */
  it("uses a screen frame, not the titled cover, for the grid thumbnail", () => {
    const source = readFileSync(join(ROOT, GRID), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
    expect(source).toContain("-2-screen.webp");
    expect(source).not.toContain("-1-cover.webp");
  });
});
