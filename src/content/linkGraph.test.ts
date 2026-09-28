import { describe, expect, it } from "vitest";
import { danglingLinks, linkGraphReport } from "./linkGraph";

/**
 * The site-wide view the per-guide tests in guides.test.ts and
 * guideBlocks.test.ts can't take: not "does this guide's own next/related
 * point somewhere real", but "looking at every guide and every hub at
 * once, is anything only reachable from one place, or only ever linked
 * to from the footer block and never from a sentence".
 *
 * Two assertions are hard, because the hub design makes them structural
 * invariants that should never break by accident: every guide has to be
 * reachable, and a guide's own next/related targets have to exist (the
 * graph builder silently drops a dangling link rather than crashing, so
 * this is the one place that would otherwise hide a typo'd slug).
 *
 * Everything else here is reported, not enforced: which guides carry no
 * inline body link (so a reader following the prose never leaves that
 * page until the footer), and which have very few distinct link
 * targets. Fixing those is editorial work for the next content wave, so
 * this stays a report a human reads, not a build breaker, until we
 * decide the bar and turn each finding into a real assertion.
 */
describe("link graph", () => {
  it("never orphans a guide: every guide is linked to from somewhere", () => {
    const { orphans } = linkGraphReport();
    expect(orphans).toEqual([]);
  });

  it("never points a next, related or inline body link at a slug the graph doesn't know", () => {
    expect(danglingLinks()).toEqual([]);
  });

  it("reports (does not fail on) sitewide link coverage, for editorial review", () => {
    const r = linkGraphReport();
    if (r.noBodyLinks.length > 0) {
      console.warn(
        `[link graph] ${r.noBodyLinks.length} guide(s) have no inline body link, only the footer next/related block: ${r.noBodyLinks.join(", ")}`,
      );
    }
    if (r.lowDiversity.length > 0) {
      console.warn(
        `[link graph] ${r.lowDiversity.length} guide(s) link to 2 or fewer distinct targets across next/related/body: ${r.lowDiversity
          .map((d) => d.slug)
          .join(", ")}`,
      );
    }
    console.warn(`[link graph] ${r.crossAreaEdges} next/related link(s) currently cross an area boundary (same-area is the current rule).`);
    // No expect(): this test always passes. It exists to print the report
    // above on every run, the way `npm run test` already surfaces it.
    expect(r.nodeCount).toBeGreaterThan(0);
  });
});
