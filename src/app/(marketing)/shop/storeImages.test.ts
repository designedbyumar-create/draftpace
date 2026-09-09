import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The store images are generated artifacts, not code, and nothing in the
 * type system knows whether they exist.
 *
 * Two lists name the slugs that have them: one in the Shop grid, one in
 * the product detail page (its OG image and its Product JSON-LD). Both
 * are hand-maintained, and getting either wrong fails in a way no build
 * and no type error catches: a broken image on the Shop's front page, or
 * a share card that resolves to a 404 on somebody else's timeline, where
 * we would never see it.
 *
 * So this reads both lists out of the source and checks the files are
 * really on disk. It also checks the two lists agree, because a slug
 * listed in one and not the other is a product whose grid card and share
 * card disagree about whether it has artwork.
 */
const ROOT = join(__dirname, "../../../..");
const STORE = join(ROOT, "public/store");

function listedSlugs(relativePath: string): string[] {
  const source = readFileSync(join(ROOT, relativePath), "utf8");
  const block = source.match(/const STORE_COVERS = new Set\(\[([^\]]*)\]\)/);
  expect(block, `${relativePath} declares STORE_COVERS`).not.toBeNull();
  return [...block![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

const GRID = "src/app/(marketing)/shop/page.tsx";
const DETAIL = "src/app/(marketing)/shop/[productSlug]/page.tsx";

describe("store images", () => {
  it("has all four files on disk for every slug the Shop grid lists", () => {
    const slugs = listedSlugs(GRID);
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

  it("lists the same slugs on the grid and on the detail page", () => {
    expect([...listedSlugs(GRID)].sort()).toEqual([...listedSlugs(DETAIL)].sort());
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
