import { describe, expect, it } from "vitest";
import { LIFE_AREAS } from "./areas";
import { GUIDES, getGuideBySlug } from "./guides";
import { guideArt } from "./guideArt";
import { registerRealShopProducts } from "../shop/products";
import { shopRegistry } from "../shop/registry";

/**
 * The homepage strip, every Companion's own page and /free all read
 * `startHere`, and each Companion's "searched problems" link to a guide.
 * A slug that stopped existing would not fail a build: it would just
 * quietly drop a link, and the whole reason these links exist is to put
 * the guides where a search-arriving reader can find them.
 */
describe("start-here guides", () => {
  it("gives every area three guides, filed under that area, none in another country's locale", () => {
    const problems: string[] = [];
    for (const area of LIFE_AREAS) {
      if (area.startHere.length !== 3) problems.push(`${area.slug}: has ${area.startHere.length}, wants 3`);
      if (new Set(area.startHere).size !== area.startHere.length) problems.push(`${area.slug}: repeats a guide`);
      for (const slug of area.startHere) {
        const guide = getGuideBySlug(slug);
        if (!guide) problems.push(`${area.slug}: ${slug} does not exist`);
        else {
          if (guide.areaSlug !== area.slug) problems.push(`${area.slug}: ${slug} is filed under ${guide.areaSlug}`);
          if (guide.locale === "uk") problems.push(`${area.slug}: ${slug} is a UK guide`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("has article art for every start-here guide, so the homepage strip and a Companion's own page never fall back to a plain area mark", () => {
    const missing: string[] = [];
    for (const area of LIFE_AREAS) {
      for (const slug of area.startHere) if (!guideArt(slug)) missing.push(`${area.slug}: ${slug}`);
    }
    expect(missing).toEqual([]);
  });
});

describe("searched problems", () => {
  it("links only to guides that exist", () => {
    registerRealShopProducts();
    const missing: string[] = [];
    let linked = 0;
    for (const listing of shopRegistry.listPublished()) {
      for (const item of listing.searchedProblems) {
        if (item.guideSlug) linked += 1;
        if (item.guideSlug && !getGuideBySlug(item.guideSlug)) missing.push(`${listing.slug}: ${item.guideSlug}`);
      }
    }
    expect(linked).toBeGreaterThan(40);
    expect(missing).toEqual([]);
  });
});

describe("hub clusters", () => {
  it("place every guide of an area in exactly one cluster, and only guides of that area", () => {
    const problems: string[] = [];
    for (const area of LIFE_AREAS) {
      const filed = GUIDES.filter((g) => g.areaSlug === area.slug).map((g) => g.slug);
      const placed = area.clusters.flatMap((c) => c.slugs);
      for (const slug of filed) {
        const n = placed.filter((p) => p === slug).length;
        if (n !== 1) problems.push(`${area.slug}: ${slug} appears in ${n} clusters`);
      }
      for (const slug of placed) if (!filed.includes(slug)) problems.push(`${area.slug}: ${slug} is not filed under it`);
      for (const c of area.clusters) if (c.slugs.length < 2) problems.push(`${area.slug}: cluster "${c.title}" has ${c.slugs.length} guide`);
      const words = area.intro.trim().split(/\s+/).length;
      if (words < 30 || words > 90) problems.push(`${area.slug}: intro is ${words} words`);
    }
    expect(problems).toEqual([]);
  });
});
