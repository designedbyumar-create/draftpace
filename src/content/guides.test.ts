import { describe, expect, it } from "vitest";
import { GUIDES, guidesForArea, relatedGuides, areasWithGuides } from "./guides";
import { LIFE_AREAS, getAreaBySlug } from "./areas";

/**
 * Structural guards on the guides layer, in the same spirit as the
 * printed books' own content tests. The guides are the third layer of
 * the site and are about to grow from two entries to fifty five, so the
 * failures worth catching are the ones that only appear at scale.
 */
describe("guide slugs", () => {
  /**
   * The one real cost of serving hubs and articles from the same route.
   * A guide slugged "travel" would silently shadow the Travel hub and
   * the hub would become unreachable, so it is asserted rather than
   * remembered.
   */
  it("never collides with a reserved life-area slug", () => {
    const areaSlugs = new Set(LIFE_AREAS.map((area) => area.slug));
    for (const guide of GUIDES) {
      expect(areaSlugs.has(guide.slug), `"${guide.slug}" shadows the ${guide.slug} hub`).toBe(false);
    }
  });

  it("is unique across every guide", () => {
    const slugs = GUIDES.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("is url safe", () => {
    for (const guide of GUIDES) {
      expect(guide.slug, guide.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});

describe("guide to product handover", () => {
  it("points every non-orphan guide at a real life area", () => {
    for (const guide of GUIDES) {
      if (guide.areaSlug === null) continue;
      expect(getAreaBySlug(guide.areaSlug), `${guide.slug} claims unknown area ${guide.areaSlug}`).toBeDefined();
    }
  });

  /**
   * Orphans are guides with no product behind them. Two exist, both
   * written before the Companion Series did, and this is the number that
   * must not grow: an orphan earns traffic that cannot convert, which is
   * exactly how the empty need pages became a problem.
   */
  it("does not accumulate orphans", () => {
    const orphans = GUIDES.filter((guide) => guide.areaSlug === null);
    expect(orphans.length, `orphans: ${orphans.map((g) => g.slug).join(", ")}`).toBeLessThanOrEqual(1);
  });

  it("resolves a Companion for every area that has guides", () => {
    for (const area of areasWithGuides()) {
      expect(area.productSlugs.length, `${area.slug} has guides but no product`).toBeGreaterThan(0);
    }
  });
});

describe("guide content", () => {
  it("has at least one block of body", () => {
    for (const guide of GUIDES) {
      expect(guide.body.length, guide.slug).toBeGreaterThan(0);
    }
  });

  it("never uses an exclamation mark or an em dash, same rule as every other surface", () => {
    for (const guide of GUIDES) {
      const text = [
        guide.title,
        guide.dek,
        ...guide.body.flatMap((block) => {
          if (block.kind === "paragraphs") return [block.heading ?? "", ...block.paragraphs];
          if (block.kind === "list") return [block.heading ?? "", block.intro ?? "", ...block.items];
          if (block.kind === "table") return [block.heading ?? "", block.intro ?? "", ...block.columns, ...block.rows.flat()];
          return [block.label, block.body];
        }),
      ].join(" ");
      expect(text, `${guide.slug} uses an exclamation mark`).not.toContain("!");
      expect(text, `${guide.slug} uses an em dash`).not.toContain("—");
    }
  });

  it("keeps every table rectangular, so no row runs off its header", () => {
    for (const guide of GUIDES) {
      for (const block of guide.body) {
        if (block.kind !== "table") continue;
        for (const row of block.rows) {
          expect(row.length, `${guide.slug} has a row of ${row.length} under ${block.columns.length} columns`).toBe(
            block.columns.length
          );
        }
      }
    }
  });
});

/**
 * Guides cross-link each other by hand, using the [text](/href) inline
 * syntax the block model allows. A mistyped slug produces a link that
 * looks fine in review and 404s for a reader, and internal linking is
 * load bearing for how the guides layer ranks, so it is checked rather
 * than trusted.
 */
describe("inline links", () => {
  const INLINE = /\[[^\]]+\]\(([^)]+)\)/g;

  function linksIn(guide: (typeof GUIDES)[number]): string[] {
    const text = guide.body
      .flatMap((block) => {
        if (block.kind === "paragraphs") return block.paragraphs;
        if (block.kind === "list") return [block.intro ?? "", ...block.items];
        if (block.kind === "table") return [block.intro ?? "", ...block.rows.flat()];
        return [block.body];
      })
      .join(" ");
    return [...text.matchAll(INLINE)].map((match) => match[1]);
  }

  it("never points at a guide that does not exist", () => {
    const known = new Set(GUIDES.map((guide) => `/guides/${guide.slug}`));
    for (const guide of GUIDES) {
      for (const href of linksIn(guide)) {
        if (!href.startsWith("/guides/")) continue;
        expect(known.has(href), `${guide.slug} links to missing ${href}`).toBe(true);
      }
    }
  });

  it("only ever links to a relative path, never off site from body copy", () => {
    for (const guide of GUIDES) {
      for (const href of linksIn(guide)) {
        expect(href.startsWith("/"), `${guide.slug} links externally to ${href}`).toBe(true);
      }
    }
  });

  it("never links a guide to itself", () => {
    for (const guide of GUIDES) {
      expect(linksIn(guide), guide.slug).not.toContain(`/guides/${guide.slug}`);
    }
  });
});

describe("related guides", () => {
  it("never returns the guide itself", () => {
    for (const guide of GUIDES) {
      expect(relatedGuides(guide).map((g) => g.slug)).not.toContain(guide.slug);
    }
  });

  it("returns nothing for an orphan, since it has no area to draw siblings from", () => {
    const orphan = GUIDES.find((guide) => guide.areaSlug === null);
    if (!orphan) return;
    expect(relatedGuides(orphan)).toHaveLength(0);
  });

  it("only ever returns guides from the same area", () => {
    for (const guide of GUIDES) {
      for (const related of relatedGuides(guide)) {
        expect(related.areaSlug).toBe(guide.areaSlug);
      }
    }
  });
});

describe("guidesForArea", () => {
  it("returns only guides belonging to that area", () => {
    for (const area of LIFE_AREAS) {
      for (const guide of guidesForArea(area.slug)) {
        expect(guide.areaSlug).toBe(area.slug);
      }
    }
  });
});
