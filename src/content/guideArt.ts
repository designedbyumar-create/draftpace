import generated from "./guideArt.generated.json";
import type { Guide, GuideBlock } from "./guides";

/**
 * The picture set for a guide: a hero (headline and cards, 1200x630, used for
 * sharing), a thumbnail (the cards alone, 4:3, used on the page header and in
 * lists) and a figure (its main card, placed in the article). All three are
 * rendered by scripts/art/build.mjs from a spec kept in scripts/art/specs, so
 * every card repeats what the guide itself says.
 */
export type GuideArt = {
  hero: string;
  thumb: string;
  figure: string;
  figureWidth: number;
  figureHeight: number;
  alt: string;
  caption: string;
};

const ENTRIES = generated as Record<string, GuideArt>;

export function guideArt(slug: string): GuideArt | undefined {
  return ENTRIES[slug];
}

export function guideArtSlugs(): string[] {
  return Object.keys(ENTRIES);
}

/**
 * The body with the guide's figure placed after its opening paragraphs, so
 * the picture arrives once the reader knows what they are looking at. A
 * guide that already carries its own figure is left alone.
 */
export function bodyWithFigure(guide: Pick<Guide, "slug" | "body">): GuideBlock[] {
  const art = guideArt(guide.slug);
  if (!art || guide.body.some((b) => b.kind === "figure")) return guide.body;
  const at = guide.body.findIndex((b) => b.kind === "paragraphs");
  if (at < 0) return guide.body;
  const figure: GuideBlock = {
    kind: "figure",
    src: art.figure,
    alt: art.alt,
    caption: art.caption,
    width: art.figureWidth,
    height: art.figureHeight,
    layout: "inline",
    source: "card",
  };
  return [...guide.body.slice(0, at + 1), figure, ...guide.body.slice(at + 1)];
}
