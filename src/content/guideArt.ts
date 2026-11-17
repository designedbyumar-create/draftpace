import generated from "./guideArt.generated.json";
import libraryArt from "./revisions/library-art.generated.json";
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

const ENTRIES: Record<string, GuideArt> = {
  ...generated,
  ...(libraryArt as Record<string, GuideArt>),
  "doctor-appointment-prep-checklist": {
    hero: "/guides/img/doctor-appointment-share-v4.webp",
    thumb: "/guides/img/doctor-appointment-thumb-v4.webp",
    figure: "/guides/img/doctor-appointment-sheet-v4.webp",
    figureWidth: 1200,
    figureHeight: 900,
    alt: "A blank appointment worksheet with room for the main concern, dated changes, medicines and allergies, and the agreed plan.",
    caption: "",
  },
  "four-day-homeschool-week": {
    hero: "/guides/img/four-day-homeschool-share-v4.webp",
    thumb: "/guides/img/four-day-homeschool-thumb-v4.webp",
    figure: "/guides/img/four-day-homeschool-rhythm-v4.webp",
    figureWidth: 1200,
    figureHeight: 900,
    alt: "A four-day learning rhythm separates recurring practice, rotating projects and an intentionally open day, with a 144-day calendar check.",
    caption: "",
  },
};

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
