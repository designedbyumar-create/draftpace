import { describe, expect, it } from "vitest";
import { LIFE_AREAS } from "@/content/areas";
import { getGuideBySlug } from "@/content/guides";

/**
 * The homepage strip (GuideLinks.tsx, StartWithGuides()) shows one
 * flagship card per area: each area's own `startHere[0]`. That only
 * reads as eight real articles if every area actually has one, which
 * this asserts directly against the data rather than trusting the
 * component's own `.filter(Boolean)` to quietly hide a gap.
 */
describe("homepage guide curation", () => {
  it("gives every populated area a flagship guide that actually resolves", () => {
    const missing = LIFE_AREAS.filter((area) => area.startHere[0] && !getGuideBySlug(area.startHere[0])).map(
      (area) => area.slug
    );
    const flagships = LIFE_AREAS.map((area) => area.startHere[0]).filter(Boolean);
    expect(missing).toEqual([]);
    expect(flagships).toHaveLength(8);
  });
});
