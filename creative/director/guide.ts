/**
 * A guide as film material. Guide-driven films teach something real from
 * one of the site's guides, then show the product the guide itself hands
 * over to. Like the product dossier, words come only as CopyUnits whose
 * `source` resolves back to the guide, so a guard can check every word:
 *
 *   "guide:<slug>/title"                      the guide's title
 *   "guide:<slug>/primaryQuery"               the phrase it is written to win, as people type it
 *   "guide:<slug>/url"                        draftpace.com/guides/<slug>, where the film sends people
 *   "guide:<slug>/body[3].items[1]#0"         the first sentence of a list item
 *   "guide:<slug>/body[2].steps[0].when"      a timeline marker
 *
 * Markdown links and emphasis are stripped to their words; nothing else
 * is changed.
 */
import { GUIDES, type Guide } from "@/content/guides";
import { LIFE_AREAS } from "@/content/areas";
import { sentences, type CopyUnit, type CopyKind } from "./dossier";

export type GuideMaterial = {
  slug: string;
  title: string;
  url: string;
  copy: CopyUnit[];
  /** The list and timeline blocks steps can come from, in the guide's order. */
  /**
   * The blocks steps can come from, in the guide's order. "steps" is an
   * ordered list, "checklist" a list the guide makes tickable (things a
   * reader does), "list" any other list: a set of facts that only makes
   * sense under its heading.
   */
  blocks: { index: number; kind: "steps" | "checklist" | "list" | "timeline"; heading?: CopyUnit; items: CopyUnit[]; when?: CopyUnit[] }[];
  faq: { q: CopyUnit; a: CopyUnit }[];
  /** All the guide's words, for matching it to a product's screens and lines. */
  about: string;
  /** What the guide is about, in short: its title, search phrase and summary. */
  topic: string;
};

export const guideUrl = (slug: string) => `draftpace.com/guides/${slug}`;

/** Links to their words, emphasis marks dropped. */
export function plain(md: string): string {
  return md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*|__/g, "").replace(/(^|\s)[*_]([^*_]+)[*_]/g, "$1$2").trim();
}

export function guideBySlug(slug: string): Guide {
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) throw new Error(`no guide "${slug}"`);
  return g;
}

/** What a guide source says, or undefined. The guards use this too, so they can never disagree with the films. */
export function resolveGuideSource(source: string): string | undefined {
  const m = source.match(/^guide:([a-z0-9-]+)\/(.+?)(?:#(\d+))?$/);
  if (!m) return undefined;
  const g = GUIDES.find((x) => x.slug === m[1]);
  if (!g) return undefined;
  if (m[2] === "url") return guideUrl(g.slug);
  let v: unknown = g;
  for (const part of m[2].split(".")) {
    const k = part.match(/^([a-zA-Z]+)(?:\[(\d+)\])?$/);
    if (!k || !v || typeof v !== "object") return undefined;
    v = (v as Record<string, unknown>)[k[1]];
    if (k[2] !== undefined) v = Array.isArray(v) ? v[Number(k[2])] : undefined;
  }
  if (typeof v !== "string") return undefined;
  const text = plain(v);
  return m[3] === undefined ? text : sentences(text)[Number(m[3])];
}

const words = (t: string) => t.trim().split(/\s+/).length;

function unit(source: string, kind: CopyKind): CopyUnit | null {
  const text = resolveGuideSource(source);
  return text ? { source, text, kind, words: words(text) } : null;
}

export function guideMaterial(slug: string): GuideMaterial {
  const g = guideBySlug(slug);
  const at = (path: string) => `guide:${slug}/${path}`;
  const copy: CopyUnit[] = [];
  const keep = <T extends CopyUnit | null>(u: T) => (u && copy.push(u), u);
  keep(unit(at("title"), "guideTitle"));
  if (g.primaryQuery) keep(unit(at("primaryQuery"), "guideQuery"));
  keep(unit(at("url"), "guideUrl"));

  const blocks: GuideMaterial["blocks"] = [];
  const faq: GuideMaterial["faq"] = [];
  g.body.forEach((b, i) => {
    // An item's first sentence is the instruction; the rest explains it. The first sentence is what a film can carry.
    if (b.kind === "list") {
      const items = b.items.map((_, j) => keep(unit(at(`body[${i}].items[${j}]#0`), "guideStep"))).filter((u): u is CopyUnit => !!u);
      const heading = b.heading ? keep(unit(at(`body[${i}].heading`), "guideHeading")) ?? undefined : undefined;
      blocks.push({ index: i, kind: b.ordered ? "steps" : b.checkable ? "checklist" : "list", heading, items });
    }
    if (b.kind === "timeline") {
      const items: CopyUnit[] = [], when: CopyUnit[] = [];
      b.steps.forEach((_, j) => {
        const w = unit(at(`body[${i}].steps[${j}].when`), "guideWhen");
        const s = unit(at(`body[${i}].steps[${j}].what#0`), "guideStep");
        if (w && s) { items.push(keep(s)!); when.push(keep(w)!); }
      });
      const heading = b.heading ? keep(unit(at(`body[${i}].heading`), "guideHeading")) ?? undefined : undefined;
      blocks.push({ index: i, kind: "timeline", heading, items, when });
    }
    if (b.kind === "faq") {
      b.items.forEach((_, j) => {
        const q = unit(at(`body[${i}].items[${j}].q`), "guideQuestion");
        const a = unit(at(`body[${i}].items[${j}].a#0`), "guideAnswer");
        if (q && a) faq.push({ q: keep(q)!, a: keep(a)! });
      });
    }
  });
  const about = [g.title, g.dek, ...copy.map((u) => u.text)].join(" ");
  const topic = [g.title, g.primaryQuery ?? "", g.dek].map(plain).join(" ");
  return { slug, title: plain(g.title), url: guideUrl(slug), copy, blocks, faq, about, topic };
}

/**
 * The product a guide hands over to: the first of its area's products the
 * guide itself links to, in the order it links them. The guide's own
 * handover decides, so a film never pairs a guide with a product the guide
 * does not recommend.
 */
export function productForGuide(slug: string): { product: string; because: string } {
  const g = guideBySlug(slug);
  const area = LIFE_AREAS.find((a) => a.slug === g.areaSlug);
  if (!area) throw new Error(`guide "${slug}" belongs to no life area, so it hands over to no single product`);
  const text = JSON.stringify(g.body);
  const linked = area.productSlugs
    .map((p) => ({ p, at: Math.min(...[`/shop/${p}`, ...(p === "monthly-money-reset" ? ["](/free)"] : [])].map((h) => (text.indexOf(h) + 1 || Infinity) - 1)) }))
    .filter((x) => Number.isFinite(x.at))
    .sort((a, b) => a.at - b.at);
  if (linked.length) return { product: linked[0].p, because: `The guide's own handover links to it first.` };
  return { product: area.productSlugs[0], because: `The guide does not link a product; ${area.label}'s first product is used.` };
}
