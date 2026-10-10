/**
 * Situation carousels: swipeable Instagram and Facebook posts, five per
 * product, each about one moment people actually search for. Like the
 * films, nothing is written here: every word on a slide is a real line
 * with its source, from the product's listing or the guide that covers
 * the moment, or one of the few connective words in CAROUSEL_MICROCOPY.
 *
 *   1  cover      the moment, in the person's own words ("I've been avoiding a phone call for weeks"),
 *                 with the guide's title beneath it as the promise of what follows
 *   2  answer     the guide's summary: the short answer before any detail
 *   3+ steps      what to do, from the guide: one step per slide, its first sentence as the
 *                 heading and the guide's own explanation beneath it; or the guide's checklist
 *   n-1 help      how the product helps with this moment, in the listing's own words, on its real screen
 *   n  close      where the full guide is, free; save it for later
 *
 * Before launch nothing here sells: no price, no "who it's for", no purchase answers.
 */
import { SHOP_LISTINGS } from "../src/shop-listings";
import { GUIDES } from "@/content/guides";
import { guideMaterial, guideSourceLinks, resolveGuideSource, type GuideMaterial } from "./guide";
import { resolveSource, sentences, type CopyUnit, type ScreenAsset } from "./dossier";
import { dossierFor, situationBriefs } from "./run";
import { relevance, screenAbout, emphasisOf, situationKey, LIVE_ABOUT } from "./direct";

export type Copy = { text: string; source: string };

/** The only words a carousel may use that are not a real line from a listing or guide. */
export const CAROUSEL_MICROCOPY = [
  "In short",
  "How it helps",
  "The full guide",
  "Free to read. Link in bio.",
  "Save this for later.",
  "1", "2", "3", "4", "5", "6", "7", "8", "9",
] as const;

export type Slide =
  | { kind: "cover"; quote: Copy; emphasis: string[]; promise: Copy }
  | { kind: "answer"; eyebrow: Copy; lines: Copy[] }
  | { kind: "step"; eyebrow?: Copy; number?: Copy; head: Copy; body: Copy[]; emphasis: string[] }
  | { kind: "checklist"; eyebrow?: Copy; items: Copy[]; ticks: boolean }
  | { kind: "help"; eyebrow: Copy; name: Copy; line: Copy; ui: { kind: "screen"; src: string } | { kind: "live"; live: "safeToSpendCard" | "nextActionCard" } }
  | { kind: "close"; eyebrow: Copy; title: Copy; url: Copy; link: Copy; save: Copy };

export type Carousel = {
  id: string;
  product: string;
  guide: string;
  /** The listing line the carousel is about, e.g. "searchedProblems[2].phrase". */
  situation: string;
  slides: Slide[];
  /** Why each choice was made, for review. */
  notes: string[];
};

export const CAROUSELS_PER_PRODUCT = 5;
/** A step's explanation, in whole sentences, up to this many words: enough to be useful, short enough to read on a phone. */
const BODY_WORDS = 42;
/** Longest step heading: one instruction. */
const HEAD_WORDS = 24;
const MAX_STEPS = 5;
const MAX_CHECKLIST = 6;
const HEADING_CHARS = 48;

const micro = (text: (typeof CAROUSEL_MICROCOPY)[number]): Copy => ({ text, source: "micro" });
const c = (u: CopyUnit): Copy => ({ text: u.text, source: u.source });
const wordCount = (t: string) => t.trim().split(/\s+/).length;

/** A guide line by source, or undefined when it does not resolve. */
function g(source: string): Copy | undefined {
  const text = resolveGuideSource(source);
  return text ? { text, source } : undefined;
}

/** The sentences after an item's first, as long as they stay within BODY_WORDS. */
function bodyOf(itemSource: string): Copy[] {
  const base = itemSource.replace(/#\d+$/, "");
  const out: Copy[] = [];
  let words = 0;
  for (let i = 1; ; i++) {
    const s = g(`${base}#${i}`);
    // A sentence that linked elsewhere in the guide ("sinking funds explained shows how") points at nothing on a slide.
    if (!s || guideSourceLinks(s.source)) break;
    // So does one that points at another part of the guide ("See the two columns below.").
    if (POINTS_ELSEWHERE.test(s.text)) break;
    words += wordCount(s.text);
    if (words > BODY_WORDS) break;
    out.push(s);
  }
  return out;
}

export const POINTS_ELSEWHERE = /\b(below|above|this guide|the table|the example|next table|next section|here's|here is|the following)\b/i;

/** A step a carousel can carry: an instruction of readable length that asks the reader to do something. */
const usable = (u: CopyUnit) => u.words >= 2 && u.words <= HEAD_WORDS && !/^nothing\b/i.test(u.text) && !POINTS_ELSEWHERE.test(u.text);
const label = (h?: CopyUnit) => (h && h.text.length <= HEADING_CHARS ? c(h) : undefined);

type Block = GuideMaterial["blocks"][number];

/** A list heading that says what to have, bring or do; lists of what goes wrong only make sense inside the guide. */
const ACTIONABLE = /\b(what to|bring|have|record|write|check|ask|put|keep|include|before|day one|set up)\b/i;
const TROUBLE = /\b(wrong|mistake|throws|missing|next)\b/i;

/** A list a carousel can show as one slide: three or more short items, tickable or under a heading that says what they are for. */
function listable(b: Block, stepsToo: boolean): boolean {
  const short = b.items.filter((u) => usable(u) && u.words <= 16).length >= 3;
  if (!short) return false;
  const heading = b.heading?.text ?? "";
  if (TROUBLE.test(heading)) return false;
  if (b.kind === "checklist") return true;
  if (b.kind === "list") return !!label(b.heading) && ACTIONABLE.test(heading);
  return stepsToo && b.kind === "steps";
}

/** What to do, from the guide: its first sequence (numbered steps or a timeline) as one slide per step, else its checklist. */
function teach(m: GuideMaterial, notes: string[], product?: string): Slide[] {
  const sequence = m.blocks.find((b) => (b.kind === "steps" || b.kind === "timeline") && b.items.filter(usable).length >= 3);
  const slides: Slide[] = [];
  if (sequence) {
    // Numbered steps are counted as the guide counts them, so only an unbroken run from its step 1.
    const picked = sequence.kind === "steps"
      ? sequence.items.slice(0, MAX_STEPS).filter((u, i, all) => all.slice(0, i + 1).every(usable))
      : sequence.items.map((u, i) => ({ u, i })).filter((x) => usable(x.u)).slice(0, MAX_STEPS).map((x) => x.u);
    picked.forEach((u) => {
      const i = sequence.items.indexOf(u);
      const when = sequence.kind === "timeline" ? sequence.when![i] : undefined;
      slides.push({
        kind: "step",
        eyebrow: when ? c(when) : label(sequence.heading),
        ...(sequence.kind === "steps" ? { number: micro(String(i + 1) as (typeof CAROUSEL_MICROCOPY)[number]) } : {}),
        head: c(u),
        body: bodyOf(u.source),
        emphasis: product ? coverEmphasis(product, u.text, "") : emphasisOf(u.text),
      });
    });
    notes.push(`Steps: ${picked.length} of ${sequence.items.length} from the guide's ${sequence.kind === "steps" ? "numbered steps" : "timeline"}${sequence.heading ? ` "${sequence.heading.text}"` : ""}, one per slide, each with the guide's own explanation.`);
  }
  // The guide's checklists as one more slide (two when there are no steps): things to have or do, never its "what goes wrong" lists.
  const lists = m.blocks.filter((b) => b !== sequence && listable(b, !sequence)).slice(0, sequence ? 1 : 2);
  for (const list of lists) {
    const items = list.items.filter((u) => usable(u) && u.words <= 16).slice(0, MAX_CHECKLIST).map(c);
    slides.push({ kind: "checklist", eyebrow: label(list.heading), items, ticks: list.kind === "checklist" });
    notes.push(`Checklist: ${items.length} items from "${list.heading?.text ?? "the guide's list"}".`);
  }
  return slides;
}

/** How the product helps: the listing's own answer for this moment, on the real screen (or live component) that shows it best. */
function help(product: string, situation: string, usedScreens: string[], notes: string[]): Slide {
  const d = dossierFor(product);
  const listing = SHOP_LISTINGS[product];
  const lineSource = situation.replace(/\.phrase$/, ".answer").replace(/\.problem$/, ".solution");
  const line = { text: resolveSource(listing, lineSource)!, source: lineSource };
  const moment = resolveSource(listing, situation)!;
  const name = { text: listing.title, source: "title" };
  const rel = relevance(d);
  const live = d.liveComponents.find((l) => rel(line.text, LIVE_ABOUT[l] ?? "") >= 0.2) as "safeToSpendCard" | "nextActionCard" | undefined;
  if (live) {
    notes.push(`Help: "${line.text}" (${lineSource}), on the live ${live} computing a real number.`);
    return { kind: "help", eyebrow: micro("How it helps"), name, line, ui: { kind: "live", live } };
  }
  const score = (s: ScreenAsset) => rel(line.text, screenAbout(s)) * 2 + rel(moment, screenAbout(s));
  const ranked = [...d.screens].sort((a, b) => score(b) - score(a));
  // A product's five carousels show different screens where one nearly as relevant is unused.
  const fresh = ranked.find((s) => !usedScreens.includes(s.src) && score(s) >= score(ranked[0]) * 0.6);
  const screen = fresh ?? ranked[0];
  usedScreens.push(screen.src);
  notes.push(`Help: "${line.text}" (${lineSource}), on ${screen.src} ("${screen.heading}").`);
  return { kind: "help", eyebrow: micro("How it helps"), name, line, ui: { kind: "screen", src: screen.src } };
}

/** One carousel for one moment in a product's listing, taught from the guide that covers it. */
export function planCarousel(product: string, situation: string, guide: string, usedScreens: string[] = []): Carousel {
  const listing = SHOP_LISTINGS[product];
  const m = guideMaterial(guide);
  const notes: string[] = [];
  const quote = { text: resolveSource(listing, situation)!, source: situation };
  notes.push(`Cover: "${quote.text}" (${situation}), ${situation.endsWith(".phrase") ? "as people search it" : "as the listing describes the moment"}.`);
  const promise = { text: m.title, source: `guide:${guide}/title` };
  const dek = sentences(resolveGuideSource(`guide:${guide}/dek`) ?? "").map((_, i) => g(`guide:${guide}/dek#${i}`)!).filter(Boolean);
  const steps = teach(m, notes, product);
  const slides: Slide[] = [
    { kind: "cover", quote, emphasis: coverEmphasis(product, quote.text, m.title), promise },
    ...(dek.length ? [{ kind: "answer" as const, eyebrow: micro("In short"), lines: dek }] : []),
    ...steps,
    help(product, situation, usedScreens, notes),
    { kind: "close", eyebrow: micro("The full guide"), title: promise, url: { text: m.url, source: `guide:${guide}/url` }, link: micro("Free to read. Link in bio."), save: micro("Save this for later.") },
  ];
  return { id: `car-${product}-${situationKey(situation)}`, product, guide, situation, slides, notes };
}

/** Words too ordinary to carry a cover, however rare they are in the listings. */
const ORDINARY = new Set("something anything everything nothing actually exactly really should would could still never every always just know need keep keeping have what which where when about that this them they their there with from tried happens looked work feels".split(" "));

/**
 * A cover's or step's accent word: the word the moment shares with its guide's title (what the carousel is about),
 * else its most distinctive word, the one rarest across every product's words; longer words break ties.
 */
function coverEmphasis(product: string, text: string, title: string): string[] {
  const docs = (dossierFor(product).background ?? []).map((t) => new Set(t.toLowerCase().match(/[a-z][a-z'-]+/g) ?? []));
  const df = (w: string) => docs.filter((d) => d.has(w)).length / Math.max(1, docs.length);
  const inTitle = new Set(title.toLowerCase().match(/[a-z][a-z'-]+/g) ?? []);
  const words = (text.match(/[A-Za-z][A-Za-z'-]+/g) ?? []).filter((w) => w.length >= 4 && !ORDINARY.has(w.toLowerCase()) && !w.includes("-") && !/(n't|'s)$/i.test(w));
  if (!words.length) return emphasisOf(text);
  const score = (w: string) => (inTitle.has(w.toLowerCase()) ? 2 : 0) + (1 - df(w.toLowerCase())) + Math.min(w.length, 12) * 0.04;
  return [words.reduce((a, b) => (score(b) > score(a) ? b : a))];
}

const usableGuide = (slug: string | undefined): slug is string => !!slug && GUIDES.some((x) => x.slug === slug && x.locale !== "uk");

/**
 * Five carousels for every product: the moments people search for, in the
 * listing's order, each with the guide the listing itself links to it. A
 * moment whose guide has too little to teach from (fewer than two slides of
 * steps) gives way to the next; no guide is used twice for one product.
 */
export function planCarousels(): Carousel[] {
  const out: Carousel[] = [];
  const briefs = situationBriefs().filter((b) => b.guide && b.situation);
  for (const product of Object.keys(SHOP_LISTINGS)) {
    // The listing's moments in its order: what people search for first, then the problems it solves that a guide covers.
    const mine = briefs.filter((b) => b.product === product)
      .sort((a, b) => Number(a.situation!.startsWith("problemsSolved")) - Number(b.situation!.startsWith("problemsSolved")));
    const seen = new Set<string>();
    const moments = mine.filter((b) => usableGuide(b.guide) && !seen.has(b.guide!) && seen.add(b.guide!))
      .map((b, order) => ({ situation: b.situation!, guide: b.guide!, order, steps: teach(guideMaterial(b.guide!), []).length }))
      .filter((x) => x.steps > 0);
    // Moments with the most to teach first (two or more slides of it), then back into the listing's order.
    const chosen = [...moments].sort((a, b) => Number(b.steps >= 2) - Number(a.steps >= 2) || a.order - b.order)
      .slice(0, CAROUSELS_PER_PRODUCT)
      .sort((a, b) => a.order - b.order);
    const usedScreens: string[] = [];
    for (const x of chosen) out.push(planCarousel(product, x.situation, x.guide, usedScreens));
  }
  return out;
}

/** Every word a carousel shows, with its source: what the guards check. */
export function carouselCopy(car: Carousel): Copy[] {
  return car.slides.flatMap((s): Copy[] => {
    switch (s.kind) {
      case "cover": return [s.quote, s.promise];
      case "answer": return [s.eyebrow, ...s.lines];
      case "step": return [...(s.eyebrow ? [s.eyebrow] : []), ...(s.number ? [s.number] : []), s.head, ...s.body];
      case "checklist": return [...(s.eyebrow ? [s.eyebrow] : []), ...s.items];
      case "help": return [s.eyebrow, s.name, s.line];
      case "close": return [s.eyebrow, s.title, s.url, s.link, s.save];
    }
  });
}

/** What a source says now, from the listing or the guide; undefined when it does not resolve. */
export function resolveCarouselSource(product: string, source: string): string | undefined {
  if (source === "micro") return undefined;
  if (source.startsWith("guide:")) return resolveGuideSource(source);
  return resolveSource(SHOP_LISTINGS[product], source);
}
