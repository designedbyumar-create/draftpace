import type { GuideBlock } from "./guides";

/**
 * Section headings, extracted once and shared.
 *
 * The article body renders these as anchors and the contents panel
 * links to them, so both have to agree on the id. Deriving it from the
 * heading text in one place is what stops a contents entry from
 * quietly pointing at nothing after a heading is reworded.
 */

export interface GuideHeading {
  id: string;
  text: string;
}

/** A stable, url-safe id for a heading. */
export function headingId(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60)
      // Trimmed after the slice, not before: several headings are long
      // enough that the cut lands mid-word and leaves a trailing hyphen.
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Every heading in a guide, in document order, with collisions
 * resolved. Two sections in one article can legitimately share a
 * heading, and duplicate ids would send both contents links to the
 * first one.
 */
export function guideHeadings(blocks: GuideBlock[]): GuideHeading[] {
  const seen = new Map<string, number>();
  const headings: GuideHeading[] = [];

  for (const block of blocks) {
    if (block.kind === "callout") continue;
    if (!block.heading) continue;

    const base = headingId(block.heading);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count === 0 ? base : `${base}-${count + 1}`, text: block.heading });
  }

  return headings;
}
