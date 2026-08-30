import { describe, expect, it } from "vitest";
import { GUIDES, SERIES, guidesForArea, relatedGuides, areasWithGuides, seriesGuides } from "./guides";
import { LIFE_AREAS, getAreaBySlug } from "./areas";
import { blockStrings, blockBodyStrings } from "./guideText";
import { guideHeadings } from "./guideHeadings";

/**
 * Structural guards on the guides layer, in the same spirit as the
 * printed books' own content tests. The guides are the third layer of
 * the site and grew from two entries to fifty four, so the
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
  it("points every area guide at a real life area", () => {
    for (const guide of GUIDES) {
      if (guide.areaSlug === null || guide.areaSlug === SERIES) continue;
      expect(getAreaBySlug(guide.areaSlug), `${guide.slug} claims unknown area ${guide.areaSlug}`).toBeDefined();
    }
  });

  /**
   * SERIES is a sentinel, not an area. It only stays safe while no real
   * life area claims the same slug, since guidesForArea would then return
   * category essays inside a domain hub.
   */
  it("keeps the series sentinel out of the real area slugs", () => {
    expect(LIFE_AREAS.map((area) => area.slug)).not.toContain(SERIES);
    expect(seriesGuides().length, "the series tier is written and should stay written").toBeGreaterThan(0);
    for (const guide of seriesGuides()) {
      expect(guide.areaSlug).toBe(SERIES);
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
    // Series guides are not orphans: they hand over to the whole shelf.
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
      const text = [guide.title, guide.dek, ...guide.body.flatMap(blockStrings)].join(" ");
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
    const text = guide.body.flatMap(blockBodyStrings).join(" ");
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

  it("keeps series guides related to each other, never to a domain guide", () => {
    for (const guide of seriesGuides()) {
      for (const related of relatedGuides(guide)) {
        expect(related.areaSlug, `${guide.slug} pulled in ${related.slug}`).toBe(SERIES);
      }
    }
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

  it("never returns a series guide from a life area", () => {
    for (const area of LIFE_AREAS) {
      expect(guidesForArea(area.slug).map((guide) => guide.slug)).not.toContain(seriesGuides()[0]?.slug);
    }
  });
});

/**
 * The interactive block kinds. Each one makes a promise the content has
 * to be able to keep: a checklist implies items you do, a timeline
 * implies an order, a comparison implies two sides worth holding
 * against each other. These assert the shape that makes each promise
 * true, because a one-item checklist or a one-sided comparison renders
 * as a control that does nothing.
 */
describe("interactive blocks", () => {
  const blocksOf = (kind: string) =>
    GUIDES.flatMap((guide) => guide.body.filter((block) => block.kind === kind).map((block) => ({ guide, block })));

  it("gives every checkable list enough items to be worth ticking", () => {
    const lists = GUIDES.flatMap((guide) =>
      guide.body.filter((block) => block.kind === "list" && block.checkable).map((block) => ({ guide, block }))
    );
    expect(lists.length, "the checkable list is built and should be used").toBeGreaterThan(0);
    for (const { guide, block } of lists) {
      if (block.kind !== "list") continue;
      expect(block.items.length, `${guide.slug} has a checkable list of ${block.items.length}`).toBeGreaterThan(1);
      expect(block.ordered, `${guide.slug} marks a list both ordered and checkable`).not.toBe(true);
    }
  });

  it("keeps every timeline an actual sequence with short markers", () => {
    const timelines = blocksOf("timeline");
    expect(timelines.length, "the timeline is built and should be used").toBeGreaterThan(0);
    for (const { guide, block } of timelines) {
      if (block.kind !== "timeline") continue;
      expect(block.steps.length, `${guide.slug} has a timeline of ${block.steps.length}`).toBeGreaterThan(1);
      for (const step of block.steps) {
        expect(step.when.length, `${guide.slug} marker "${step.when}" is too long for the spine`).toBeLessThanOrEqual(34);
        expect(step.what.length, `${guide.slug} has an empty timeline step`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps both sides of every comparison populated and distinct", () => {
    const compares = blocksOf("compare");
    expect(compares.length, "the comparison is built and should be used").toBeGreaterThan(0);
    for (const { guide, block } of compares) {
      if (block.kind !== "compare") continue;
      expect(block.left.items.length, `${guide.slug} has an empty left side`).toBeGreaterThan(0);
      expect(block.right.items.length, `${guide.slug} has an empty right side`).toBeGreaterThan(0);
      expect(block.left.label, `${guide.slug} labels both sides the same`).not.toBe(block.right.label);
      // Rendered as two aligned columns on desktop, so a lopsided pair
      // leaves one column visibly short of the other.
      expect(
        Math.abs(block.left.items.length - block.right.items.length),
        `${guide.slug} compares ${block.left.items.length} against ${block.right.items.length}`
      ).toBeLessThanOrEqual(1);
    }
  });

  it("gives every script picker distinct situations and real lines", () => {
    const scripts = blocksOf("scripts");
    expect(scripts.length, "the script picker is built and should be used").toBeGreaterThan(0);
    for (const { guide, block } of scripts) {
      if (block.kind !== "scripts") continue;
      expect(block.items.length, `${guide.slug} has a picker with nothing to pick`).toBeGreaterThan(1);
      const situations = block.items.map((item) => item.situation);
      expect(new Set(situations).size, `${guide.slug} repeats a situation`).toBe(situations.length);
      for (const item of block.items) {
        // The situation is a chip in a row of chips, so it has to stay
        // short enough not to wrap into a paragraph.
        expect(item.situation.length, `${guide.slug} chip "${item.situation}" is too long`).toBeLessThanOrEqual(28);
        expect(item.line.length, `${guide.slug} has an empty script`).toBeGreaterThan(0);
      }
    }
  });

  /**
   * The point of the whole rebuild. The guides layer shipped as prose
   * with one renderer while the rest of the site had twelve components,
   * and it read as a different, duller site. This asserts the correction
   * holds: a new guide of nothing but paragraphs fails here rather than
   * quietly reintroducing the old experience one article at a time.
   */
  it("gives every guide at least one thing the reader can operate", () => {
    const bare = GUIDES.filter(
      (guide) =>
        !guide.body.some(
          (block) =>
            block.kind === "table" ||
            block.kind === "timeline" ||
            block.kind === "compare" ||
            block.kind === "scripts" ||
            (block.kind === "list" && block.checkable)
        )
    );
    expect(bare.map((guide) => guide.slug)).toEqual([]);
  });
});

/**
 * Heading anchors. The contents panel links to ids derived from heading
 * text, so a duplicate id would send two entries to the same section and
 * an empty one would produce a link to "#".
 */
describe("heading anchors", () => {
  it("gives every heading a unique, url-safe id within its guide", () => {
    for (const guide of GUIDES) {
      const headings = guideHeadings(guide.body);
      const ids = headings.map((heading) => heading.id);
      expect(new Set(ids).size, `${guide.slug} has duplicate heading ids`).toBe(ids.length);
      for (const id of ids) {
        expect(id, `${guide.slug} produced an unusable anchor`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      }
    }
  });

  it("gives most guides enough sections for a contents panel to be worth showing", () => {
    // The panel hides itself below three headings. If that were most of
    // the library, the feature would be dead code rather than a feature.
    const withPanel = GUIDES.filter((guide) => guideHeadings(guide.body).length >= 3);
    expect(withPanel.length / GUIDES.length).toBeGreaterThan(0.9);
  });
});
