/**
 * The product dossier: everything the director may say or show about a
 * product, gathered from the product's own source and nothing else.
 *
 * Words come only as CopyUnits: a piece of the real Shop listing with a
 * `source` that says exactly where it came from, in a form the guards can
 * resolve back to the listing:
 *
 *   "searchedProblems[2].phrase"   the whole field
 *   "promise#1"                    its second sentence
 *   "inclusions[0]:head"           the part before the first colon (the name of the thing)
 *
 * The director may choose, order and time these; it never rewrites them.
 * The only other words a film may show are the small, reviewable set of
 * connective microcopy in MICROCOPY below.
 */
import type { ShopProductInput } from "@/shop/definition";
import type { ProductDefinitionInput } from "@/product-framework/definition";
import CATALOG from "./screens.catalog.json";
import MANIFEST from "../src/screens-manifest.json";

export type CopyKind =
  | "problem" | "solution" | "label" | "phrase" | "answer" | "promise" | "story"
  | "audience" | "exclusion" | "step" | "inclusion" | "output" | "input"
  | "task" | "question" | "privacy" | "saving"
  // From a guide (guide.ts), never from a listing:
  | "guideTitle" | "guideQuery" | "guideUrl" | "guideHeading" | "guideStep" | "guideWhen" | "guideQuestion" | "guideAnswer";

export type CopyUnit = { source: string; text: string; kind: CopyKind; words: number };

export type ScreenAsset = {
  src: string;
  destination: string;
  heading: string;
  shows: string;
  mood: string;
  width: number;
  height: number;
  regions: { id: string; label: string; y: number; h: number }[];
  /** Real tasks whose destination is this screen: what an owner does here, in their words. */
  tasks: CopyUnit[];
};

export type Dossier = {
  slug: string;
  name: string;
  family: string;
  motif: string;
  personality: string;
  accent: string;
  temperature: "warm" | "cool" | "neutral";
  price: string;
  compareAt: string | null;
  free: boolean;
  liveComponents: string[];
  copy: CopyUnit[];
  screens: ScreenAsset[];
  /** Listing answers written for a guide: searchedProblems entries that name the guide they lead to. */
  guideAnswers: { guide: string; source: string }[];
  /** Every product's words, for telling a distinctive word ("subscriptions") from a common one ("own"). Set by run.ts. */
  background?: string[];
  /** Set for a guide-driven film: the guide it teaches from. Its units are in `copy` too, with guide: sources. */
  guide?: import("./guide").GuideMaterial;
};

/** Words a film may use that are not product claims: connective, structural, the brand's own. Keep this short and reviewed. */
export const MICROCOPY = [
  "Draftpace",
  "Available now.",
  "Start free.",
  "Free",
  "draftpace.com/shop",
  "draftpace.com/free",
  "Save this for later.",
  "If this is you:",
  "Not for you if:",
  "How it works",
  "What you get",
  "Sound familiar?",
  "Instead:",
  "The full guide",
  "1", "2", "3", "4", "5", "6", "7", "8", "9",
] as const;

const words = (t: string) => t.trim().split(/\s+/).length;

export function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z"“'])/).map((s) => s.trim()).filter(Boolean);
}

/** Resolve a CopyUnit source path against a listing. The guard uses this; so does the dossier, so they can never disagree. */
export function resolveSource(listing: ShopProductInput, source: string): string | undefined {
  const m = source.match(/^([a-zA-Z]+)(?:\[(\d+)\])?(?:\.([a-zA-Z]+))?(?:#(\d+)|:(head|tail))?$/);
  if (!m) return undefined;
  const [, field, idx, sub, sentence, part] = m;
  let v: unknown = (listing as Record<string, unknown>)[field];
  if (idx !== undefined) v = Array.isArray(v) ? v[Number(idx)] : undefined;
  if (sub) v = v && typeof v === "object" ? (v as Record<string, unknown>)[sub] : undefined;
  if (typeof v !== "string") return undefined;
  if (sentence !== undefined) return sentences(v)[Number(sentence)];
  if (part) {
    const at = v.indexOf(":");
    if (at < 0) return undefined;
    return part === "head" ? v.slice(0, at).trim() : v.slice(at + 1).trim();
  }
  return v;
}

function unit(listing: ShopProductInput, source: string, kind: CopyKind): CopyUnit | null {
  const text = resolveSource(listing, source);
  return text ? { source, text, kind, words: words(text) } : null;
}

function hue(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return -1;
  const d = max - min;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

export function buildDossier(args: {
  listing: ShopProductInput;
  definition: ProductDefinitionInput;
  accent: string;
  price: string;
  compareAt: string | null;
}): Dossier {
  const { listing, definition } = args;
  const L = listing;
  const copy: CopyUnit[] = [];
  const push = (u: CopyUnit | null) => u && copy.push(u);
  const eachSentence = (field: string, kind: CopyKind, value: string | undefined) =>
    value && sentences(value).forEach((_, i) => push(unit(L, `${field}#${i}`, kind)));

  eachSentence("promise", "promise", L.promise);
  eachSentence("problem", "story", L.problem);
  (L.problemsSolved ?? []).forEach((p, i) => {
    push(unit(L, `problemsSolved[${i}].problem`, "problem"));
    push(unit(L, `problemsSolved[${i}].solution`, "solution"));
    if (p.label) push(unit(L, `problemsSolved[${i}].label`, "label"));
  });
  (L.searchedProblems ?? []).forEach((_, i) => {
    push(unit(L, `searchedProblems[${i}].phrase`, "phrase"));
    push(unit(L, `searchedProblems[${i}].answer`, "answer"));
  });
  (L.audience ?? []).forEach((_, i) => push(unit(L, `audience[${i}]`, "audience")));
  (L.audienceExclusions ?? []).forEach((e, i) => {
    // The first sentence states the boundary; the rest explains it.
    if (sentences(e).length > 1) push(unit(L, `audienceExclusions[${i}]#0`, "exclusion"));
    else push(unit(L, `audienceExclusions[${i}]`, "exclusion"));
  });
  (L.howItWorks ?? []).forEach((h, i) => push(unit(L, sentences(h).length > 1 ? `howItWorks[${i}]#0` : `howItWorks[${i}]`, "step")));
  (L.inclusions ?? []).forEach((inc, i) => push(unit(L, inc.includes(":") ? `inclusions[${i}]:head` : `inclusions[${i}]`, "inclusion")));
  (L.expectedOutputs ?? []).forEach((_, i) => push(unit(L, `expectedOutputs[${i}]`, "output")));
  (L.expectedInputs ?? []).forEach((_, i) => push(unit(L, `expectedInputs[${i}]`, "input")));
  (L.tasks ?? []).forEach((_, i) => push(unit(L, `tasks[${i}].label`, "task")));
  (L.questions ?? []).forEach((q, i) => {
    if (q.stage.includes("deciding")) {
      push(unit(L, `questions[${i}].question`, "question"));
      push(unit(L, `questions[${i}].answer`, "answer"));
    }
  });
  eachSentence("privacyNotes", "privacy", L.privacyNotes);
  eachSentence("savingBehavior", "saving", L.savingBehavior);

  const screens: ScreenAsset[] = Object.entries(CATALOG as Record<string, unknown>)
    .filter(([src]) => src.startsWith(`screens/${L.slug}-`))
    .map(([src, raw]) => {
      const c = raw as Omit<ScreenAsset, "src" | "destination" | "width" | "height" | "tasks">;
      const destination = src.slice(`screens/${L.slug}-`.length).replace(/\.png$/, "");
      const size = (MANIFEST as Record<string, { width: number; height: number }>)[src];
      const tasks = (L.tasks ?? [])
        .map((t, i) => (t.destination === destination ? unit(L, `tasks[${i}].label`, "task") : null))
        .filter((u): u is CopyUnit => !!u);
      return { src, destination, ...c, width: size.width, height: size.height, tasks };
    });

  const h = hue(args.accent);
  return {
    slug: L.slug,
    name: L.title,
    family: definition.family,
    motif: definition.theme?.identity?.motif ?? "card",
    personality: definition.theme?.motionPersonality ?? "calm",
    accent: args.accent,
    temperature: h < 0 ? "neutral" : h < 70 || h > 300 ? "warm" : "cool",
    price: args.price,
    compareAt: args.compareAt,
    free: L.access === "free",
    guideAnswers: (L.searchedProblems ?? []).flatMap((sp, i) => ("guideSlug" in sp && sp.guideSlug ? [{ guide: sp.guideSlug as string, source: `searchedProblems[${i}].answer` }] : [])),
    liveComponents: L.slug === "monthly-money-reset" ? ["safeToSpendCard", "nextActionCard"] : [],
    copy,
    screens,
  };
}
