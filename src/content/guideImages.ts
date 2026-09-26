import generated from "./guideImages.generated.json";
import type { Guide, GuideBlock } from "./guides";

/**
 * The card image and cover for a guide, cut from the Companion's Pinterest
 * cards by scripts/figures/export.mjs. Only guides with a usable card have
 * one; the rest simply show no image rather than a stand-in.
 */
export type GuideImage = {
  src: string;
  width: number;
  height: number;
  cover: string;
  alt: string;
  caption: string;
};

type Entry = { src: string; width: number; height: number; cover: string; headline: string | null };

const ENTRIES = generated as Record<string, Entry>;

export function guideImage(slug: string): GuideImage | undefined {
  const e = ENTRIES[slug];
  if (!e) return undefined;
  return {
    src: e.src,
    width: e.width,
    height: e.height,
    cover: e.cover,
    alt: e.headline ? `A sample card that goes with this guide: ${e.headline.replace(/[.]$/, "")}` : "A sample card that goes with this guide",
    caption: "A sample card. The details in it are examples, not real records.",
  };
}

export function guideImageSlugs(): string[] {
  return Object.keys(ENTRIES);
}

/**
 * The body with the guide's card placed after its opening paragraphs, so the
 * picture arrives once the reader knows what they are looking at. A guide
 * that already carries its own figure is left alone.
 */
export function bodyWithImage(guide: Pick<Guide, "slug" | "body">): GuideBlock[] {
  const image = guideImage(guide.slug);
  if (!image || guide.body.some((b) => b.kind === "figure")) return guide.body;
  const at = guide.body.findIndex((b) => b.kind === "paragraphs");
  if (at < 0) return guide.body;
  const figure: GuideBlock = {
    kind: "figure",
    src: image.src,
    alt: image.alt,
    caption: image.caption,
    width: image.width,
    height: image.height,
    layout: "inline",
    source: "card",
  };
  return [...guide.body.slice(0, at + 1), figure, ...guide.body.slice(at + 1)];
}
