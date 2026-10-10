/**
 * The director. Given a brief (product, platform, goal) and the films
 * already planned, it analyses the placement and the product, chooses a
 * story structure, an angle, a visual treatment and a sound plan, and
 * writes a frame-exact script. Every decision is recorded with its reason.
 *
 * It never writes copy. It chooses real copy units from the dossier,
 * orders them, breaks them into lines and times them for reading.
 *
 * Variety is designed, not random: a structure already used for this
 * product is heavily penalised, one already used on this platform is
 * penalised, an angle (problem) already used for this product is avoided,
 * and the treatment follows the product's own identity motif. The seed
 * only breaks ties between equally good options, so the same brief
 * against the same slate always yields the same film.
 */
import { PLATFORMS, type Platform, type PlatformId, type Goal } from "./platforms";
import type { Dossier, CopyUnit, ScreenAsset } from "./dossier";
import { shape, similarity, MAX_SIMILARITY, type Film, type Scene, type Copy, type Ground, type FilmTransition, type Treatment, type SfxCue } from "./film";

/** A film to plan. With `guide`, it is a guide-driven film: it teaches from that guide and `product` is the product the guide hands over to. */
/**
 * A film to plan.
 *  - `guide`: a guide-driven film; it teaches from that guide and `product` is the product the guide hands over to.
 *  - `situation`: a situation film; it opens on one real moment from the product's listing (the source of that line,
 *    "searchedProblems[2].phrase" or "problemsSolved[0].problem") and shows how the guide and the product help with it.
 *    `guide` is then the guide that helps with that moment, if one does.
 *  - `stage`: "prelaunch" (default) keeps to helpful, relatable films; "growth" also allows the buyer-facing
 *    shapes (who it is not for, questions before buying, what you get, the price).
 */
export type Brief = { product: string; platform: PlatformId; goal: Goal; guide?: string; situation?: string; stage?: "prelaunch" | "growth" };

/** Structures for people already deciding to buy: held back until Draftpace has users to sell to. */
const BUYER_STRUCTURES = new Set(["honestNo", "question", "whatYouGet"]);

/** How long a guide-driven film may run: it teaches, so it is allowed longer than a product film on the same placement. */
export const GUIDE_RUNTIME: Partial<Record<PlatformId, { min: number; max: number }>> = {
  "youtube-short": { min: 18, max: 45 },
  "tiktok": { min: 15, max: 40 },
  "instagram-reel": { min: 15, max: 40 },
  "facebook-reel": { min: 15, max: 40 },
  "pinterest-video": { min: 12, max: 35 },
};

/** How long a situation film may run: it opens on a moment, teaches a little, then shows the help. */
export const SITUATION_RUNTIME: Record<PlatformId, { min: number; max: number }> = {
  "youtube-short": { min: 15, max: 40 },
  "tiktok": { min: 12, max: 35 },
  "instagram-reel": { min: 12, max: 35 },
  "facebook-reel": { min: 12, max: 35 },
  "pinterest-video": { min: 10, max: 32 },
  "instagram-feed": { min: 10, max: 30 },
  "facebook-feed": { min: 10, max: 30 },
};

/** "searchedProblems[2].phrase" → "search-3", "problemsSolved[0].problem" → "problem-1": a situation's stable name. */
export function situationKey(anchor: string): string {
  const m = anchor.match(/^(searchedProblems|problemsSolved)\[(\d+)\]/);
  if (!m) throw new Error(`not a situation: ${anchor}`);
  return `${m[1] === "searchedProblems" ? "search" : "problem"}-${Number(m[2]) + 1}`;
}

/** What earlier films in the slate already used, so this one can be different. */
export type Slate = Film[];

// ------------------------------------------------------------------ utilities

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seed: string) {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = () => number;
const pick = <T,>(xs: T[], r: Rand): T => xs[Math.floor(r() * xs.length)];

const STOP = new Set("a an the and or but of to in on for with your you it is are was be this that what when where who how its it's at as by from not no do does into than then there just".split(" "));
const stems = (t: string) => new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.slice(0, 5)));
function overlap(a: string, b: string): number {
  const A = stems(a), B = stems(b);
  let n = 0;
  A.forEach((w) => B.has(w) && n++);
  return n / Math.max(1, Math.min(A.size, B.size));
}

/**
 * How well `text` matches `about`, weighting each shared word by how rare
 * it is across every product's material (d.background): "subscriptions" says what a line is
 * about, "own" and "find" do not. 0 to 1, the share of the text's weight found.
 */
export function relevance(d: Dossier): (text: string, about: string) => number {
  const docs = (d.background ?? [...d.copy.map((u) => u.text), ...d.screens.map((s) => [s.heading, s.shows, ...s.regions.map((r) => r.label)].join(" "))]).map(stems);
  const idf = (w: string) => Math.log((docs.length + 1) / (docs.filter((x) => x.has(w)).length + 0.5));
  return (text, about) => {
    const A = stems(text), B = stems(about);
    let hit = 0, all = 0;
    A.forEach((w) => { const k = Math.max(0, idf(w)); all += k; if (B.has(w)) hit += k; });
    return all ? hit / all : 0;
  };
}

/** Balanced line breaks: as few lines as fit maxChars, then evened out. */
export function breakLines(text: string, maxChars: number): string[] {
  const ws = text.split(/\s+/);
  const total = text.length;
  const n = Math.max(1, Math.ceil(total / maxChars));
  const target = total / n;
  const lines: string[] = [];
  let cur = "";
  for (const w of ws) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && (next.length > maxChars || (cur.length >= target * 0.92 && lines.length < n - 1))) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

const COUNTS = /^(\d[\d,.%]*|one|two|three|four|five|six|seven|eight|nine|ten|twelve|every|never|nothing|only)$/i;
/** The word to set in the accent: a number or count if the line has one (they are what people remember), else its longest content word. */
function emphasisOf(text: string): string[] {
  const all = text.replace(/[^\w\s'%$-]/g, "").split(/\s+/);
  const count = all.find((w) => COUNTS.test(w));
  if (count) return [count];
  const ws = all.filter((w) => w.length > 3 && !STOP.has(w.toLowerCase()));
  if (!ws.length) return [];
  return [ws.reduce((a, b) => (b.length > a.length ? b : a))];
}

const c = (u: CopyUnit): Copy => ({ text: u.text, source: u.source });
const micro = (text: string): Copy => ({ text, source: "micro" });

// ------------------------------------------------------------------ context

type Ctx = {
  d: Dossier;
  p: Platform;
  goal: Goal;
  r: Rand;
  usedProblems: Set<number>;
  usedSources: Set<string>;
  usedScreens: string[];
  /** 0 = the fullest copy that fits a scene; each step asks for ~3 fewer words per unit. */
  brevity: number;
  /** Extra words a unit may have, used only when nothing unused fits at the normal limits. */
  relax: number;
  /** A situation film's moment (the line it opens on) and the listing's own line for how the product helps with it. */
  anchor?: CopyUnit;
  help?: CopyUnit;
  stage: "prelaunch" | "growth";
};

/** Copy of a kind short enough for this placement, unused by earlier films of this product first. */
function units(ctx: Ctx, kind: CopyUnit["kind"], maxWords = ctx.p.maxWordsPerScene): CopyUnit[] {
  const limit = Math.max(4, maxWords + ctx.relax - ctx.brevity * 3);
  const all = ctx.d.copy.filter((u) => u.kind === kind && u.words <= limit);
  return [...all.filter((u) => !ctx.usedSources.has(u.source)), ...all.filter((u) => ctx.usedSources.has(u.source))];
}

/** The best unit of a kind within a length, or failing that the shortest one there is. */
function bestUnit(ctx: Ctx, kind: CopyUnit["kind"], maxWords: number, rank?: (u: CopyUnit) => number): CopyUnit | undefined {
  const within = units(ctx, kind, maxWords);
  const pool = within.length ? within : [...ctx.d.copy.filter((u) => u.kind === kind)].sort((a, b) => a.words - b.words).slice(0, 1);
  return rank ? [...pool].sort((a, b) => rank(b) - rank(a))[0] : pool[0];
}

/** The short label of the problemsSolved entry a solution belongs to, if it has one. */
function labelFor(ctx: Ctx, solution: CopyUnit): Copy | undefined {
  const l = ctx.d.copy.find((u) => u.source === solution.source.replace(".solution", ".label"));
  return l && c(l);
}

/** Things the product gives you, worded as benefits that stand on their own: its described outputs, shortest first; inclusion names only if it has too few. */
function whatItems(ctx: Ctx): CopyUnit[] {
  const outputs = [...units(ctx, "output", ctx.p.maxWordsPerScene)].sort((a, b) => a.words - b.words);
  return outputs.length >= 3 ? outputs : [...outputs, ...units(ctx, "inclusion", 7).filter((u) => u.words >= 3)];
}

function problemIndex(u: CopyUnit): number {
  return Number(u.source.match(/problemsSolved\[(\d+)\]/)?.[1] ?? -1);
}

/** The real screen that best shows what `text` is about, avoiding ones this film already used. */
function screenFor(ctx: Ctx, text: string, avoid: string[] = []): ScreenAsset | undefined {
  const pool = ctx.d.screens.filter((s) => !avoid.includes(s.src));
  const list = pool.length ? pool : ctx.d.screens;
  let best: ScreenAsset | undefined;
  let bestScore = -1;
  for (const s of list) {
    const about = [s.heading, s.shows, ...s.regions.map((r) => r.label), ...s.tasks.map((t) => t.text)].join(" ");
    const score = overlap(text, about) + (ctx.usedScreens.includes(s.src) ? -0.15 : 0) + ctx.r() * 0.01;
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return best;
}

function regionFor(s: ScreenAsset, text: string) {
  return s.regions.reduce((a, b) => (overlap(text, b.label + " " + s.shows) > overlap(text, a.label + " " + s.shows) ? b : a), s.regions[0]);
}

const tallest = (ss: ScreenAsset[]) => ss.reduce((a, b) => (b.height / b.width > a.height / a.width ? b : a), ss[0]);

// ------------------------------------------------------------------ structures

type Draft = Omit<Scene, "from" | "dur" | "sfx" | "transition" | "ground"> & {
  optional?: boolean;
  hold?: number;
  ground?: Ground;
  /** Shorter real captions this scene could carry instead, longest first. The edit steps down them before cutting anything. */
  alts?: Copy[];
};
type Plan = { angle: Copy; scenes: Draft[]; story: string };

type Structure = {
  id: string;
  /** Product films plan from a listing; guide films from a guide and the product it hands over to; situation films from one moment. */
  series?: "guide" | "situation";
  name: string;
  /** What it is for, in a sentence: printed in the treatment. */
  purpose: string;
  fit: Partial<Record<PlatformId, number>>;
  goals: Partial<Record<Goal, number>>;
  available: (ctx: Ctx) => boolean;
  plan: (ctx: Ctx) => Plan;
};

const screenAbout = (s: ScreenAsset) => [s.heading, s.shows, ...s.regions.map((r) => r.label), ...s.tasks.map((t) => t.text)].join(" ");

function phoneScene(ctx: Ctx, id: string, about: string, caption: Copy | undefined, why: string, opts: Partial<Draft> = {}, shorter: (Copy | undefined)[] = [], chosen?: ScreenAsset): Draft {
  const s = chosen ?? screenFor(ctx, about, ctx.usedScreens);
  if (!s) throw new Error(`${ctx.d.slug} has no screens`);
  ctx.usedScreens.push(s.src);
  const region = regionFor(s, about);
  const tall = s.height / s.width > 2.6;
  // Shorter captions are other real lines that say the same thing (a problem's own label, a related task).
  // A label read off the screen is not one: it names a region, it doesn't explain it.
  const alts = shorter.filter((x): x is Copy => !!x).filter((x) => !caption || x.text.length < caption.text.length);
  return {
    id, kind: "phone", variant: "proof", copy: [], caption, alts,
    screen: {
      src: s.src,
      pose: pick(["float", "tiltLeft", "tiltRight", "flat"], ctx.r) as NonNullable<Scene["screen"]>["pose"],
      focus: { at: 0.45, y: region.y, h: region.h, region: region.id },
      scroll: tall ? undefined : [],
    },
    why: `${why} Screen: "${s.heading}" (${s.shows}) chosen because it is the real screen closest to "${about.slice(0, 80)}"; focus on "${region.label}".`,
    ...opts,
  };
}

function brandScene(ctx: Ctx, why: string): Draft {
  // On a short placement the end card already carries the logo and the name; the separate reveal is the first thing to go.
  return { id: "brand", kind: "brand", variant: pick(["center", "lockup"], ctx.r), copy: [{ text: ctx.d.name, source: "title" }], why, optional: ctx.p.duration.max <= 20 };
}

function ctaScene(ctx: Ctx): Draft {
  // Before launch nothing closes on a price: the film's job is to be useful and send people to the product.
  const close = ctx.d.free ? "free" : ctx.stage === "prelaunch" && ctx.p.close === "price" ? "soft" : ctx.p.close;
  const line = ctx.d.free ? micro("Start free.") : close === "save" ? micro("Save this for later.") : micro("Available now.");
  return {
    id: "cta", kind: "cta", variant: close, copy: [{ text: ctx.d.name, source: "title" }, line],
    why: ctx.d.free
      ? "A free product closes on starting free; there is no price to state."
      : close === "price"
        ? `${ctx.p.label} rewards a direct close: the real price against the real list price.`
        : close === "save"
          ? `${ctx.p.label} is a planning surface; the close asks for the save, the price stays quiet.`
          : `${ctx.p.label} punishes an obvious ad; a soft close names the product and where to find it.`,
  };
}

const STRUCTURES: Structure[] = [
  {
    id: "cascade",
    name: "Problem cascade",
    purpose: "Open on one real problem, let the related worries pile up, then cut to the product holding it.",
    fit: { "instagram-reel": 3, "tiktok": 2, "youtube-short": 2, "facebook-reel": 2, "facebook-feed": 1, "instagram-feed": 1 },
    goals: { awareness: 2, conversion: 2, consideration: 1 },
    available: (ctx) => units(ctx, "problem").length > 0,
    plan: (ctx) => {
      const problems = units(ctx, "problem");
      const hook = problems.find((u) => !ctx.usedProblems.has(problemIndex(u))) ?? problems[0];
      const i = problemIndex(hook);
      const solution = ctx.d.copy.find((u) => u.source === `problemsSolved[${i}].solution`)!;
      const label = ctx.d.copy.find((u) => u.source === `problemsSolved[${i}].label`);
      const noise = units(ctx, "phrase", 9).filter((u) => overlap(u.text, hook.text) > 0 || ctx.r() > 0.5).slice(0, 3);
      return {
        angle: c(hook),
        story: `Problem ${i + 1} of the listing, "${hook.text}", answered by its own solution.`,
        scenes: [
          { id: "hook", kind: "title", variant: ctx.p.voice, copy: [c(hook)], emphasis: emphasisOf(hook.text), why: "The hook is the problem itself, in the listing's own words: the first thing the right viewer recognises." },
          ...(noise.length >= 2 ? [{ id: "noise", kind: "contrast" as const, variant: "noise", copy: noise.map(c), optional: true, why: "The same worry as people actually search it: real searched phrases, stacked, so the problem feels lived-in." }] : []),
          brandScene(ctx, "The turn: the product arrives after the problem, not before it."),
          phoneScene(ctx, "proof", `${solution.text} ${label?.text ?? ""}`, c(solution), "Proof: the real screen that does what the problem asked for, captioned with the listing's own answer.", {}, [label && c(label)]),
          ctaScene(ctx),
        ],
      };
    },
  },
  {
    id: "searched",
    name: "In their words",
    purpose: "Lead with a phrase people actually search, then show the real screen that answers it.",
    fit: { "pinterest-video": 3, "youtube-short": 3, "tiktok": 2, "instagram-reel": 1, "facebook-feed": 1, "instagram-feed": 2 },
    goals: { awareness: 3, consideration: 2 },
    available: (ctx) => units(ctx, "phrase", 12).length > 0,
    plan: (ctx) => {
      const phrase = units(ctx, "phrase", 12)[0];
      const k = phrase.source.match(/\[(\d+)\]/)![1];
      const answer = ctx.d.copy.find((u) => u.source === `searchedProblems[${k}].answer`)!;
      const follow = units(ctx, "task", 8).filter((t) => overlap(t.text, answer.text) > 0)[0];
      return {
        angle: c(phrase),
        story: `A searched phrase, "${phrase.text}", and the listing's own answer to it.`,
        scenes: [
          { id: "hook", kind: "title", variant: "quote", copy: [c(phrase)], why: "Search-led placements reward the exact words someone typed; quoted, it reads as their thought, not our claim." },
          phoneScene(ctx, "answer", answer.text, c(answer), "The answer, shown working on the real screen it happens on.", { hold: 1.4 }),
          ...(follow ? [phoneScene(ctx, "follow", follow.text, c(follow), "A second, related thing an owner does here, so it reads as a tool, not a single trick.", { optional: true })] : []),
          brandScene(ctx, "Named at the end, once the idea has earned the save."),
          ctaScene(ctx),
        ],
      };
    },
  },
  {
    id: "walkthrough",
    name: "How it works",
    purpose: "Three real steps, each on the real screen where it happens.",
    fit: { "youtube-short": 3, "facebook-feed": 2, "facebook-reel": 2, "instagram-reel": 2, "instagram-feed": 2, "pinterest-video": 2, "tiktok": 1 },
    goals: { consideration: 3, conversion: 1 },
    available: (ctx) => units(ctx, "step", ctx.p.maxWordsPerScene + 8).length >= 3,
    plan: (ctx) => {
      const steps = units(ctx, "step", ctx.p.maxWordsPerScene + 8).sort((a, b) => ctx.d.copy.indexOf(a) - ctx.d.copy.indexOf(b)).slice(0, 5);
      const n = ctx.p.duration.max < 18 || ctx.brevity > 1 ? 2 : 3;
      const chosen = [...steps].sort((a, b) => a.words - b.words).slice(0, n).sort((a, b) => steps.indexOf(a) - steps.indexOf(b));
      return {
        angle: micro("How it works"),
        story: "The listing's own how-it-works, shortest three steps in their real order.",
        scenes: [
          { id: "open", kind: "title", variant: "label", copy: [micro("How it works")], eyebrow: { text: ctx.d.name, source: "title" }, why: "A considered viewer wants the mechanism; saying so up front sets the contract for the next ten seconds." },
          ...chosen.map((s, n) => phoneScene(ctx, `step-${n + 1}`, s.text, c(s), `Step ${n + 1}, from the listing's how-it-works.`, { variant: "step", eyebrow: micro(String(n + 1)) })),
          ctaScene(ctx),
        ],
      };
    },
  },
  {
    id: "isThisYou",
    name: "Is this you?",
    purpose: "Name the audience in the listing's own descriptions, so the right people stop and everyone else scrolls on.",
    fit: { "facebook-feed": 3, "facebook-reel": 3, "instagram-reel": 2, "tiktok": 2, "instagram-feed": 1 },
    goals: { awareness: 2, consideration: 2 },
    available: (ctx) => units(ctx, "audience", ctx.p.maxWordsPerScene + 8).length >= 2,
    plan: (ctx) => {
      const who = [...units(ctx, "audience", ctx.p.maxWordsPerScene + 8)].sort((a, b) => a.words - b.words).slice(0, ctx.p.soundOn ? 2 : 3);
      const sol = bestUnit(ctx, "solution", ctx.p.maxWordsPerScene + 6, (u) => overlap(u.text, who[0].text));
      return {
        angle: c(who[0]),
        story: "Targeting by recognition: the listing's own audience lines, then what the product does for them.",
        scenes: [
          { id: "who", kind: "list", variant: "audience", copy: who.map(c), eyebrow: micro("If this is you:"), why: "Feed audiences decide in a second whether something is for them; naming them in the listing's words is the fastest honest filter." },
          brandScene(ctx, "The product named right after the viewer has recognised themselves."),
          ...(sol ? [phoneScene(ctx, "proof", sol.text, c(sol), "What it does for exactly those people, on a real screen.", {}, [labelFor(ctx, sol)])] : []),
          ctaScene(ctx),
        ],
      };
    },
  },
  {
    id: "honestNo",
    name: "What it is not",
    purpose: "Earn trust by stating what the product deliberately does not do, then show what it does instead.",
    fit: { "instagram-reel": 2, "facebook-feed": 2, "tiktok": 2, "youtube-short": 2, "instagram-feed": 2, "facebook-reel": 1 },
    goals: { consideration: 2, conversion: 3 },
    available: (ctx) => units(ctx, "exclusion", 18).length >= 2,
    plan: (ctx) => {
      const nots = [...units(ctx, "exclusion", 18)].sort((a, b) => a.words - b.words).slice(0, 2);
      const sol = bestUnit(ctx, "solution", ctx.p.maxWordsPerScene + 6, (u) => -u.words)!;
      const priv = units(ctx, "privacy", ctx.p.maxWordsPerScene + 4)[0];
      return {
        angle: c(nots[0]),
        story: "A trust film: the listing's own boundaries, then the thing it does instead, then how it treats your data.",
        scenes: [
          { id: "not", kind: "contrast", variant: "strike", copy: nots.map(c), eyebrow: micro("Not for you if:"), why: "Every other ad promises more. Saying what it refuses to do is rarer, and it is in the listing because it is true." },
          phoneScene(ctx, "instead", sol.text, c(sol), "Then the positive case, on a real screen.", { eyebrow: micro("Instead:") }, [labelFor(ctx, sol)]),
          ...(priv ? [{ id: "privacy", kind: "title" as const, variant: "label", copy: [c(priv)], optional: true, why: "The privacy line closes the trust argument." }] : []),
          brandScene(ctx, "The name lands on a film that has been honest with the viewer."),
          ctaScene(ctx),
        ],
      };
    },
  },
  {
    id: "whatYouGet",
    name: "What you get",
    purpose: "Open on the product, then show what is in it, then the price.",
    fit: { "instagram-reel": 2, "facebook-feed": 2, "facebook-reel": 2, "instagram-feed": 2 },
    goals: { conversion: 3, consideration: 1 },
    available: (ctx) => whatItems(ctx).length >= 3 && ctx.d.screens.length >= 2,
    plan: (ctx) => {
      const items = whatItems(ctx).slice(0, 4);
      const a = screenFor(ctx, items[0].text)!;
      ctx.usedScreens.push(a.src);
      const b = screenFor(ctx, items[1].text, [a.src]) ?? a;
      ctx.usedScreens.push(b.src);
      return {
        angle: micro("What you get"),
        story: "A conversion film for people who already know the problem: product first, contents, price.",
        scenes: [
          brandScene(ctx, "Conversion audiences already know the problem; opening on the product saves them a second."),
          { id: "contents", kind: "list", variant: "inclusions", copy: items.map(c), eyebrow: micro("What you get"), why: "The listing's own inclusions, by name." },
          { id: "proof", kind: "phone", variant: "pair", copy: [], screen: { src: a.src, also: b.src, pose: "pair" }, why: `Two real screens side by side ("${a.heading}", "${b.heading}") show it is a whole tool, not one feature.` },
          ctaScene(ctx),
        ],
      };
    },
  },
  {
    id: "oneScreen",
    name: "One screen, closely",
    purpose: "Stay with a single real screen and read it slowly, the way someone planning would.",
    fit: { "pinterest-video": 3, "instagram-feed": 3, "youtube-short": 1 },
    goals: { awareness: 2, consideration: 2 },
    available: (ctx) => ctx.d.screens.some((s) => s.regions.length >= 2),
    plan: (ctx) => {
      const rich = ctx.d.screens.filter((s) => s.regions.length >= 2 && !ctx.usedScreens.includes(s.src));
      const s = rich.length ? tallest(rich) : tallest(ctx.d.screens.filter((x) => x.regions.length >= 2));
      ctx.usedScreens.push(s.src);
      const [r1, r2] = s.regions;
      const task = s.tasks[0];
      const hook: Copy = task ? c(task) : { text: s.heading, source: `screen:${s.src}#heading` };
      return {
        angle: hook,
        story: `A slow read of "${s.heading}": ${s.shows}`,
        scenes: [
          { id: "hook", kind: "title", variant: "label", copy: [hook], why: task ? "Opens on what an owner comes to this screen to do, in the listing's own task wording." : "Opens on the screen's own heading." },
          { id: "read-1", kind: "phone", variant: "read", copy: [], caption: { text: r1.label, source: `screen:${s.src}#${r1.id}` }, screen: { src: s.src, pose: "flat", focus: { at: 0.35, y: r1.y, h: r1.h, region: r1.id } }, why: `The first thing on the screen worth noticing: "${r1.label}".` },
          { id: "read-2", kind: "phone", variant: "read", copy: [], caption: { text: r2.label, source: `screen:${s.src}#${r2.id}` }, screen: { src: s.src, pose: "flat", focus: { at: 0.3, y: r2.y, h: r2.h, region: r2.id } }, why: `Then further down the same real page: "${r2.label}".` },
          ctaScene(ctx),
        ],
      };
    },
  },
  {
    id: "beforeAfter",
    name: "Before and after",
    purpose: "The problem told as the listing tells it, in the dark; then the product, in the light.",
    fit: { "tiktok": 3, "instagram-reel": 2, "instagram-feed": 2, "facebook-reel": 2 },
    goals: { awareness: 2, conversion: 2 },
    available: (ctx) => units(ctx, "story", ctx.p.maxWordsPerScene + 8).length > 0,
    plan: (ctx) => {
      const before = units(ctx, "story", ctx.p.maxWordsPerScene + 8)[0];
      const sol = bestUnit(ctx, "solution", ctx.p.maxWordsPerScene + 6, (u) => overlap(u.text, before.text))!;
      const live = ctx.d.liveComponents[0] as Scene["live"] | undefined;
      return {
        angle: c(before),
        story: "A sentence of the listing's own problem story, then the product answering it.",
        scenes: [
          { id: "before", kind: "title", variant: ctx.p.voice, copy: [c(before)], emphasis: emphasisOf(before.text), ground: "ink", why: "The 'before' is a sentence from the listing's own problem story, set dark: how it feels now." },
          live
            ? { id: "after", kind: "live", variant: "after", copy: [], caption: c(sol), live, ground: "light", why: "The 'after' is the real component, computing a real number." }
            : { ...phoneScene(ctx, "after", sol.text, c(sol), "The 'after': the real screen, in the light.", {}, [labelFor(ctx, sol)]), ground: "light" as Ground },
          brandScene(ctx, "The name, once the change has been seen."),
          ctaScene(ctx),
        ],
      };
    },
  },
  {
    id: "question",
    name: "The question before buying",
    purpose: "Answer the question people actually ask before they decide, with the listing's own answer.",
    fit: { "facebook-feed": 2, "youtube-short": 2, "pinterest-video": 2, "instagram-feed": 1 },
    goals: { consideration: 3 },
    available: (ctx) => units(ctx, "question", 14).length > 0,
    plan: (ctx) => {
      const q = units(ctx, "question", 14)[0];
      const k = q.source.match(/\[(\d+)\]/)![1];
      const a = ctx.d.copy.find((u) => u.source === `questions[${k}].answer`)!;
      const shortA = a.words <= ctx.p.maxWordsPerScene * 2;
      return {
        angle: c(q),
        story: `A deciding-stage question from the listing, "${q.text}", and its own answer.`,
        scenes: [
          { id: "q", kind: "title", variant: "quote", copy: [c(q)], why: "The question a considering buyer is already asking, so the film meets them where they are." },
          phoneScene(ctx, "a", `${q.text} ${a.text}`, shortA ? c(a) : undefined, "The answer, with the real screen it is about.", { hold: 0.6 }),
          brandScene(ctx, "Named once the doubt is answered."),
          ctaScene(ctx),
        ],
      };
    },
  },
];

// ------------------------------------------------------------------ guide-driven structures

/** What each live component shows, in words, for matching it to a line. */
export const LIVE_ABOUT: Record<string, string> = {
  safeToSpendCard: "safe to spend money left figure number bills month week payday balance",
  nextActionCard: "next step action check in week what to do now recommended",
};

/** A line that opens on a connective leans on the sentence before it, so it cannot stand alone on screen. */
const leansBack = (u: CopyUnit) => /^(then|and|but|so|also|or)\b/i.test(u.text);

/** The longest a guide step may be here: a step is one instruction, so it is held to a scene's worth of words. */
const stepLimit = (ctx: Ctx) => Math.max(4, ctx.p.maxWordsPerScene + ctx.relax - ctx.brevity * 3);

/** Real steps from a guide block, in the guide's order: the ones short enough to read, skipping the "nothing to do" kind. */
function stepsOf(ctx: Ctx, block: NonNullable<Dossier["guide"]>["blocks"][number], n: number): number[] {
  return block.items.map((u, i) => (u.words >= 3 && u.words <= stepLimit(ctx) && !/^nothing\b/i.test(u.text) ? i : -1)).filter((i) => i >= 0).slice(0, n);
}

/** Longest block heading that can sit above a checklist as its label. */
const HEADING_CHARS = 44;

/** A checklist to show: one the guide makes tickable, else a plain list whose heading can sit above it and say what it is. */
function checklistOf(ctx: Ctx) {
  const ok = (b: NonNullable<Dossier["guide"]>["blocks"][number]) => stepsOf(ctx, b, 4).length >= 3;
  const blocks = ctx.d.guide?.blocks ?? [];
  return blocks.find((b) => b.kind === "checklist" && ok(b))
    ?? blocks.find((b) => b.kind === "list" && ok(b) && !!b.heading && b.heading.text.length <= HEADING_CHARS);
}

/** Numbered steps are a sequence: only an unbroken run from the guide's step 1, so the film counts 1, 2, 3 as the guide does. */
function firstSteps(ctx: Ctx, block: NonNullable<Dossier["guide"]>["blocks"][number], n: number): number[] {
  const ok = new Set(stepsOf(ctx, block, block.items.length));
  const run: number[] = [];
  for (let i = 0; i < Math.min(n, block.items.length) && ok.has(i); i++) run.push(i);
  return run;
}

function stepCount(ctx: Ctx): number {
  return ctx.brevity >= 2 ? 2 : ctx.brevity === 1 ? 3 : 4;
}

/** The turn from the guide to the product: the product's own line closest to what the guide teaches, on its real screen. */
function guideTurn(ctx: Ctx): Draft {
  const g = ctx.d.guide!;
  // Answers to the listing's questions before buying ("One time. You pay once...") are about the purchase, not the help: never a caption here.
  const pool = (["solution", "output", "answer", "step"] as const).flatMap((k) => units(ctx, k, ctx.p.maxWordsPerScene + 4))
    .filter((u) => !leansBack(u) && !u.source.startsWith("questions["));
  // Ranked by what the guide is about (its title, search phrase and summary) first, its whole text second.
  const fit = (u: CopyUnit) => overlap(u.text, g.topic) * 2 + overlap(u.text, g.about);
  // The listing's own answer for this guide, where its author linked one, says it best; otherwise the closest line.
  const authored = ctx.d.guideAnswers.filter((x) => x.guide === g.slug).map((x) => ctx.d.copy.find((u) => u.source === x.source)).find((u) => u && u.words <= 30);
  const line = authored ?? [...pool].sort((a, b) => fit(b) - fit(a) || pool.indexOf(a) - pool.indexOf(b))[0];
  const rel = relevance(ctx.d);
  const live = [...ctx.d.liveComponents].sort((a, b) => rel(line?.text ?? "", LIVE_ABOUT[b] ?? "") - rel(line?.text ?? "", LIVE_ABOUT[a] ?? ""))[0] as Scene["live"] | undefined;
  if (live) {
    return {
      id: "tool", kind: "live", variant: "after", copy: [], caption: line && c(line), live, eyebrow: { text: ctx.d.name, source: "title" }, hold: 0.6,
      why: "The turn: the product the guide hands over to, as its real component computing a real number, captioned with its listing's line closest to what the guide teaches.",
    };
  }
  // The screen that shows what the caption says: matched on the caption's distinctive words first, the guide's topic second.
  const screen = [...ctx.d.screens].sort((a, b) => (rel(line?.text ?? "", screenAbout(b)) * 2 + rel(g.topic, screenAbout(b))) - (rel(line?.text ?? "", screenAbout(a)) * 2 + rel(g.topic, screenAbout(a))))[0];
  return phoneScene(
    ctx, "tool", `${line?.text ?? ""} ${g.title}`, line && c(line),
    `The turn: the product the guide itself hands over to, named and shown on its real screen, captioned with its listing's line closest to what the guide teaches.`,
    { eyebrow: { text: ctx.d.name, source: "title" } },
    [line && labelFor(ctx, line)],
    screen,
  );
}

/** The close of a guide film: the full guide first, then the product, so the film stays useful before it is promotional. */
function guideEnd(ctx: Ctx): Draft {
  const url = ctx.d.copy.find((u) => u.kind === "guideUrl")!;
  return {
    id: "cta", kind: "cta", variant: "guide", copy: [{ text: ctx.d.name, source: "title" }, c(url)], eyebrow: micro("The full guide"),
    why: "Ends on where to read the whole guide, with the product beneath it: the viewer leaves with the next step, not only a pitch.",
  };
}

const guideHook = (ctx: Ctx, variant: string): Draft => {
  const t = ctx.d.copy.find((u) => u.kind === "guideTitle")!;
  return { id: "hook", kind: "title", variant, copy: [c(t)], emphasis: emphasisOf(t.text), why: "The hook is the guide's own title: the question it answers, as a person would put it." };
};

const GUIDE_STRUCTURES: Structure[] = [
  {
    id: "guideTimeline",
    series: "guide",
    name: "In order",
    purpose: "Walk the guide's own timeline, one marker at a time, then show the product that keeps it.",
    fit: { "youtube-short": 3, "tiktok": 2, "pinterest-video": 2, "instagram-reel": 2, "facebook-reel": 2 },
    goals: { awareness: 3, consideration: 2 },
    available: (ctx) => !!ctx.d.guide?.blocks.some((b) => b.kind === "timeline" && stepsOf(ctx, b, 4).length >= 2),
    plan: (ctx) => {
      const block = ctx.d.guide!.blocks.find((b) => b.kind === "timeline" && stepsOf(ctx, b, 4).length >= 2)!;
      const picked = stepsOf(ctx, block, stepCount(ctx));
      return {
        angle: c(ctx.d.copy.find((u) => u.kind === "guideTitle")!),
        story: `The guide's timeline${block.heading ? ` "${block.heading.text}"` : ""}: ${picked.length} of its ${block.items.length} markers, in order.`,
        scenes: [
          guideHook(ctx, ctx.p.voice),
          ...picked.map((i, n) => ({
            id: `when-${n + 1}`, kind: "title" as const, variant: "label", copy: [c(block.items[i])], eyebrow: c(block.when![i]), emphasis: emphasisOf(block.items[i].text), optional: n >= 2,
            why: `Marker ${n + 1}: "${block.when![i].text}", with the first sentence of what the guide says to do then.`,
          })),
          guideTurn(ctx),
          guideEnd(ctx),
        ],
      };
    },
  },
  {
    id: "guideSteps",
    series: "guide",
    name: "Do this",
    purpose: "Open on the search itself, then the guide's own numbered steps, then the product.",
    fit: { "youtube-short": 3, "pinterest-video": 3, "tiktok": 2, "instagram-reel": 2, "facebook-reel": 1 },
    goals: { awareness: 3, consideration: 2 },
    available: (ctx) => !!ctx.d.guide?.blocks.some((b) => b.kind === "steps" && firstSteps(ctx, b, 4).length >= 2),
    plan: (ctx) => {
      const block = ctx.d.guide!.blocks.find((b) => b.kind === "steps" && firstSteps(ctx, b, 4).length >= 2)!;
      const picked = firstSteps(ctx, block, stepCount(ctx));
      const q = ctx.d.copy.find((u) => u.kind === "guideQuery") ?? ctx.d.copy.find((u) => u.kind === "guideTitle")!;
      return {
        angle: c(q),
        story: `Search-led: "${q.text}", answered by ${picked.length} of the guide's numbered steps${block.heading ? ` ("${block.heading.text}")` : ""}.`,
        scenes: [
          { id: "hook", kind: "title", variant: "quote", copy: [c(q)], why: "Opens on the exact phrase the guide is written to win, typed out the way it is typed into a search box." },
          ...picked.map((i, n) => ({
            id: `step-${n + 1}`, kind: "title" as const, variant: "editorial", copy: [c(block.items[i])], eyebrow: micro(String(i + 1)), emphasis: emphasisOf(block.items[i].text), optional: n >= 2,
            why: `Step ${i + 1} of the guide's numbered list, numbered as the guide numbers it, its first sentence: the instruction itself.`,
          })),
          guideTurn(ctx),
          guideEnd(ctx),
        ],
      };
    },
  },
  {
    id: "guideChecklist",
    series: "guide",
    name: "The checklist",
    purpose: "The guide's checklist on one screen, item by item, then the product that holds it.",
    fit: { "pinterest-video": 3, "youtube-short": 2, "instagram-feed": 2, "instagram-reel": 2, "facebook-feed": 2 },
    goals: { awareness: 3, consideration: 2 },
    available: (ctx) => !!checklistOf(ctx),
    plan: (ctx) => {
      const block = checklistOf(ctx)!;
      const picked = stepsOf(ctx, block, Math.max(3, stepCount(ctx)));
      const label = block.heading && block.heading.text.length <= HEADING_CHARS ? c(block.heading) : undefined;
      return {
        angle: c(ctx.d.copy.find((u) => u.kind === "guideTitle")!),
        story: `A checklist from the guide${block.heading ? `, "${block.heading.text}"` : ""}: ${picked.length} of its ${block.items.length} items.`,
        scenes: [
          guideHook(ctx, ctx.p.voice),
          { id: "list", kind: "list", variant: "checklist", copy: picked.map((i) => c(block.items[i])), eyebrow: label, why: "The guide's own checklist, the first sentence of each item, ticked in as it is read." },
          guideTurn(ctx),
          guideEnd(ctx),
        ],
      };
    },
  },
  {
    id: "guideQuestion",
    series: "guide",
    name: "The question people ask",
    purpose: "One of the guide's own questions, its plain answer, then the product.",
    fit: { "youtube-short": 2, "facebook-feed": 2, "pinterest-video": 2, "facebook-reel": 2, "instagram-feed": 1 },
    goals: { awareness: 2, consideration: 3 },
    available: (ctx) => !!ctx.d.guide?.faq.some((f) => f.q.words <= 14 && f.a.words >= 5 && f.a.words <= stepLimit(ctx) + 4),
    plan: (ctx) => {
      const pool = ctx.d.guide!.faq.filter((f) => f.q.words <= 14 && f.a.words >= 5 && f.a.words <= stepLimit(ctx) + 4);
      const f = pool.find((x) => !ctx.usedSources.has(x.q.source)) ?? pool[0];
      return {
        angle: c(f.q),
        story: `A question from the guide's FAQ, "${f.q.text}", and the first sentence of its answer.`,
        scenes: [
          { id: "q", kind: "title", variant: "quote", copy: [c(f.q)], why: "The question as people ask it; the guide carries it because people search it." },
          { id: "a", kind: "title", variant: "label", copy: [c(f.a)], emphasis: emphasisOf(f.a.text), hold: 0.6, why: "The guide's answer, its first sentence: the plain answer before any detail." },
          guideTurn(ctx),
          guideEnd(ctx),
        ],
      };
    },
  },
];

// ------------------------------------------------------------------ situation structures

/** The moment, set as the film's opening line. */
function situationHook(ctx: Ctx, variant: string, ground?: Ground): Draft {
  const a = ctx.anchor!;
  return {
    id: "moment", kind: "title", variant, copy: [c(a)], emphasis: emphasisOf(a.text), ...(ground ? { ground } : {}),
    why: a.kind === "phrase"
      ? "Opens on the moment in the person's own words, as the listing records people searching it."
      : "Opens on the moment as the listing describes it: the situation the viewer is in right now.",
  };
}

/** How the product helps with this moment: the listing's own line for it, on the real screen (or live component) that shows it. */
function situationHelp(ctx: Ctx, opts: Partial<Draft> = {}): Draft {
  const h = ctx.help!;
  const rel = relevance(ctx.d);
  const live = ctx.d.liveComponents.find((l) => rel(h.text, LIVE_ABOUT[l] ?? "") >= 0.2) as Scene["live"] | undefined;
  if (live) {
    return { id: "help", kind: "live", variant: "after", copy: [], caption: c(h), live, eyebrow: { text: ctx.d.name, source: "title" }, hold: 0.6, ...opts,
      why: `How ${ctx.d.name} helps, in the listing's own words, as the real component computing a real number.` };
  }
  const about = `${h.text} ${ctx.anchor!.text}`;
  const screen = [...ctx.d.screens].sort((a, b) => (rel(h.text, screenAbout(b)) * 2 + rel(ctx.anchor!.text, screenAbout(b))) - (rel(h.text, screenAbout(a)) * 2 + rel(ctx.anchor!.text, screenAbout(a))))[0];
  return phoneScene(ctx, "help", about, c(h), `How ${ctx.d.name} helps with this moment, in the listing's own words, on the real screen that shows it.`,
    { eyebrow: { text: ctx.d.name, source: "title" }, ...opts }, [labelFor(ctx, h)], screen);
}

/** What to do about it, from the guide that covers this moment: real steps, its timeline markers, or its checklist. */
function situationTeach(ctx: Ctx, max: number, as: "steps" | "list"): Draft[] {
  const g = ctx.d.guide;
  if (!g) return [];
  if (as === "list") {
    const block = checklistOf(ctx);
    if (block) {
      const picked = stepsOf(ctx, block, Math.min(max, 4));
      const label = block.heading && block.heading.text.length <= HEADING_CHARS ? c(block.heading) : undefined;
      return [{ id: "what-to-do", kind: "list", variant: "checklist", copy: picked.map((i) => c(block.items[i])), eyebrow: label, optional: true,
        why: `What to do about it, from the guide "${g.title}": its own checklist, the first sentence of each item.` }];
    }
  }
  const timeline = g.blocks.find((b) => b.kind === "timeline" && stepsOf(ctx, b, max).length >= 2);
  if (timeline) {
    return stepsOf(ctx, timeline, Math.min(max, stepCount(ctx))).map((i, n) => ({
      id: `step-${n + 1}`, kind: "title" as const, variant: "label", copy: [c(timeline.items[i])], eyebrow: c(timeline.when![i]), emphasis: emphasisOf(timeline.items[i].text), optional: n > 0,
      why: `What to do, in order, from the guide "${g.title}": "${timeline.when![i].text}".`,
    }));
  }
  const steps = g.blocks.find((b) => b.kind === "steps" && firstSteps(ctx, b, max).length >= 2);
  if (steps) {
    return firstSteps(ctx, steps, Math.min(max, stepCount(ctx))).map((i, n) => ({
      id: `step-${n + 1}`, kind: "title" as const, variant: "editorial", copy: [c(steps.items[i])], eyebrow: micro(String(i + 1)), emphasis: emphasisOf(steps.items[i].text), optional: n > 0,
      why: `Step ${i + 1} from the guide "${g.title}", numbered as the guide numbers it.`,
    }));
  }
  const block = checklistOf(ctx);
  if (!block) return [];
  const label = block.heading && block.heading.text.length <= HEADING_CHARS ? c(block.heading) : undefined;
  return [{ id: "what-to-do", kind: "list", variant: "checklist", copy: stepsOf(ctx, block, Math.min(max, 4)).map((i) => c(block.items[i])), eyebrow: label, optional: true,
    why: `What to do about it, from the guide "${g.title}": its own checklist.` }];
}

/** The close: the free guide when one covers this moment, else the product, never a price before launch. */
const situationEnd = (ctx: Ctx): Draft => (ctx.d.guide ? guideEnd(ctx) : ctaScene(ctx));

const SITUATION_STRUCTURES: Structure[] = [
  {
    id: "situationWords",
    series: "situation",
    name: "In their words",
    purpose: "The moment typed the way a person searches it, then what to do about it, then the product doing it.",
    fit: { "pinterest-video": 3, "youtube-short": 3, "tiktok": 2, "instagram-reel": 2, "instagram-feed": 2, "facebook-feed": 2, "facebook-reel": 1 },
    goals: { awareness: 3, consideration: 2 },
    available: (ctx) => ctx.anchor?.kind === "phrase",
    plan: (ctx) => ({
      angle: c(ctx.anchor!),
      story: `A situation people search for, "${ctx.anchor!.text}"${ctx.d.guide ? `, with the steps from "${ctx.d.guide.title}"` : ""}, and how ${ctx.d.name} helps.`,
      scenes: [situationHook(ctx, "quote"), ...situationTeach(ctx, 3, "steps"), situationHelp(ctx), situationEnd(ctx)],
    }),
  },
  {
    id: "situationMoment",
    series: "situation",
    name: "The moment",
    purpose: "The moment as it feels, set dark, then the help in the light, then what to do next.",
    fit: { "instagram-reel": 3, "facebook-reel": 3, "tiktok": 3, "instagram-feed": 2, "facebook-feed": 2, "youtube-short": 2, "pinterest-video": 1 },
    goals: { awareness: 3, consideration: 2 },
    available: (ctx) => !!ctx.anchor,
    plan: (ctx) => ({
      angle: c(ctx.anchor!),
      story: `The moment "${ctx.anchor!.text}", then how ${ctx.d.name} helps${ctx.d.guide ? `, then what the guide "${ctx.d.guide.title}" says to do` : ""}.`,
      scenes: [situationHook(ctx, ctx.p.voice, "ink"), situationHelp(ctx, { ground: "light" }), ...situationTeach(ctx, 2, "steps"), situationEnd(ctx)],
    }),
  },
  {
    id: "situationChecklist",
    series: "situation",
    name: "What to do first",
    purpose: "The moment, the guide's own checklist for it, then the product that keeps track of it.",
    fit: { "pinterest-video": 3, "youtube-short": 3, "instagram-feed": 3, "facebook-feed": 3, "instagram-reel": 2, "tiktok": 1, "facebook-reel": 2 },
    goals: { awareness: 3, consideration: 3 },
    available: (ctx) => !!ctx.anchor && !!ctx.d.guide && !!checklistOf(ctx),
    plan: (ctx) => ({
      angle: c(ctx.anchor!),
      story: `The moment "${ctx.anchor!.text}", the checklist from "${ctx.d.guide!.title}", then how ${ctx.d.name} helps.`,
      scenes: [situationHook(ctx, "label"), ...situationTeach(ctx, 4, "list"), situationHelp(ctx), situationEnd(ctx)],
    }),
  },
  {
    id: "situationInside",
    series: "situation",
    name: "Inside the tool",
    purpose: "The moment, then how the product helps on its real screen, then one more real thing an owner does in it.",
    fit: { "instagram-reel": 2, "tiktok": 2, "facebook-reel": 2, "instagram-feed": 3, "facebook-feed": 3, "youtube-short": 2, "pinterest-video": 2 },
    goals: { awareness: 2, consideration: 3 },
    available: (ctx) => !!ctx.anchor && ctx.d.screens.length >= 2 && ctx.d.screens.some((s) => s.tasks.length > 0),
    plan: (ctx) => {
      const help = situationHelp(ctx, { ground: "light" });
      // A real task an owner does on another screen: the listing's own task wording, on the screen it happens on.
      const other = ctx.d.screens.filter((s) => s.src !== help.screen?.src && s.tasks.length);
      const rel = relevance(ctx.d);
      const s2 = other.sort((a, b) => rel(ctx.anchor!.text, screenAbout(b)) - rel(ctx.anchor!.text, screenAbout(a)))[0];
      const task = s2?.tasks.find((t) => !ctx.usedSources.has(t.source)) ?? s2?.tasks[0];
      return {
        angle: c(ctx.anchor!),
        story: `The moment "${ctx.anchor!.text}", how ${ctx.d.name} helps, and one more real thing it does${task ? `: "${task.text}"` : ""}.`,
        scenes: [
          situationHook(ctx, "label", "accent"),
          help,
          ...(s2 && task ? [phoneScene(ctx, "also", task.text, c(task), "One more real thing an owner does here, in the listing's own task wording, on the screen it happens on.", { optional: true, ground: "light" }, [], s2)] : []),
          ...situationTeach(ctx, 2, "steps"),
          situationEnd(ctx),
        ],
      };
    },
  },
];

// ------------------------------------------------------------------ treatment

const MOTIF_LANGUAGE: Record<string, { transitions: FilmTransition[]; says: string }> = {
  timeline: { transitions: ["slideLeft", "whip", "slideLeft"], says: "a trip is a line through time, so scenes travel left to right along it" },
  ledger: { transitions: ["lineWipe", "blurDissolve", "lineWipe"], says: "a ledger is ruled lines, so scenes are revealed row by row" },
  gauge: { transitions: ["radial", "zoomThrough", "radial"], says: "a gauge sweeps, so scenes are revealed by a radial sweep" },
  card: { transitions: ["cardSlide", "blurDissolve", "cardSlide"], says: "a binder of cards, so scenes slide in like the next card" },
  book: { transitions: ["pageTurn", "blurDissolve", "pageTurn"], says: "a handoff book, so scenes turn like pages" },
  tag: { transitions: ["slideUp", "cardSlide", "slideUp"], says: "things in the home are tagged, so scenes rise like a tag being lifted" },
  register: { transitions: ["lineWipe", "slideUp", "lineWipe"], says: "a register is filled line by line, so scenes are written in from the top" },
  index: { transitions: ["cardSlide", "wipe", "cardSlide"], says: "an index of tabs, so scenes slide in like the next tab" },
  focus: { transitions: ["iris", "blurDissolve", "iris"], says: "it is about one thing at a time, so scenes open like an iris onto one thing" },
};

function treatmentFor(ctx: Ctx, structure: Structure): { t: Treatment; why: string[] } {
  const lang = MOTIF_LANGUAGE[ctx.d.motif] ?? MOTIF_LANGUAGE.card;
  const transitions: FilmTransition[] = ctx.p.voice === "native" ? ["cut", "whip", lang.transitions[0]] : lang.transitions;
  const camera: Treatment["camera"] = ctx.p.energy === "high" ? "dolly" : ctx.p.energy === "low" ? pick(["locked", "float"], ctx.r) : pick(["float", "dolly"], ctx.r);
  const rhythms: Ground[][] = ctx.d.temperature === "warm"
    ? [["light", "light", "accent", "light"], ["accent", "light", "light", "accent"], ["light", "ink", "light", "accent"]]
    : [["light", "accent", "light", "ink"], ["ink", "light", "light", "accent"], ["light", "light", "ink", "accent"]];
  const grounds = structure.id === "beforeAfter" ? ["ink", "light", "accent", "accent"] as Ground[] : pick(rhythms, ctx.r);
  const pace = ctx.p.energy === "high" ? 0.85 : ctx.p.energy === "low" ? 1.15 : 1;
  return {
    t: { voice: ctx.p.voice, camera, transitions, motif: ctx.d.motif, grounds, pace },
    why: [
      `Transitions follow the product's own identity motif, "${ctx.d.motif}": ${lang.says}.${ctx.p.voice === "native" ? ` ${ctx.p.label} wants native editing, so hard cuts and whips lead.` : ""}`,
      `Camera "${camera}": ${camera === "dolly" ? "constant forward movement for a high-energy feed" : camera === "locked" ? "still and precise, so a slow, reading audience is never chasing the frame" : "a gentle float that keeps a held frame alive without demanding attention"}.`,
      `Grounds ${grounds.join(" → ")}: a ${ctx.d.temperature} accent, so ${ctx.d.temperature === "warm" ? "light grounds lead and the accent is saved for the turns" : "a darker ground is used for contrast at a turn"}.`,
    ],
  };
}

// ------------------------------------------------------------------ sound

const TRANSITION_SFX: Record<FilmTransition, string | null> = {
  cut: null, blurDissolve: "whoosh", wipe: "swish", zoomThrough: "whoosh", slideUp: "swish", slideLeft: "swish",
  whip: "swish", iris: "whoosh", pageTurn: "page", lineWipe: "tick", radial: "swish", cardSlide: "swish",
};

function soundFor(scene: Scene, p: Platform, d: Dossier): SfxCue[] {
  const k = p.soundOn ? 1 : 0.6;
  const cues: SfxCue[] = [];
  const t = TRANSITION_SFX[scene.transition];
  if (t && scene.from > 0) cues.push({ at: 0, cue: t, volume: (t === "tick" ? 0.6 : 0.32) * k });
  if (scene.kind === "brand") {
    if (p.energy !== "low") cues.push({ at: -36, cue: "riser", volume: 0.4 * k }, { at: 2, cue: "impact", volume: 0.7 * k });
    cues.push({ at: 6, cue: "shimmer", volume: 0.3 * k });
  }
  if (scene.kind === "list" || (scene.kind === "contrast" && scene.variant === "noise"))
    scene.copy.forEach((_, i) => cues.push({ at: 10 + i * Math.round(scene.dur / (scene.copy.length + 1)), cue: d.motif === "register" || d.motif === "ledger" ? "tick" : "pop", volume: 0.45 * k }));
  if (scene.kind === "contrast" && scene.variant === "strike")
    scene.copy.forEach((_, i) => cues.push({ at: 18 + i * Math.round(scene.dur / (scene.copy.length + 1)), cue: "tick", volume: 0.5 * k }));
  if (scene.kind === "phone" || scene.kind === "live") cues.push({ at: 12, cue: "pop", volume: 0.42 * k });
  if (scene.screen?.focus) cues.push({ at: Math.round(scene.screen.focus.at * scene.dur), cue: "tap", volume: 0.55 * k });
  if (scene.kind === "cta") cues.push({ at: 8, cue: "settle", volume: 0.5 * k });
  return cues;
}

// ------------------------------------------------------------------ timing

const SEC = 30;
function readingSeconds(text: string, p: Platform) {
  return 0.7 + text.split(/\s+/).length * p.secondsPerWord;
}

function timeScene(draft: Draft, p: Platform, pace: number): number {
  const texts = [...draft.copy.map((x) => x.text), draft.caption?.text, draft.eyebrow?.text].filter(Boolean) as string[];
  const read = texts.reduce((s, t) => s + readingSeconds(t, p), 0);
  let s: number;
  switch (draft.kind) {
    case "brand": s = p.energy === "high" ? 1.3 : 1.8; break;
    case "cta": s = Math.max(2.8, read); break;
    case "phone": case "live": s = Math.max(p.shot.min * 1.3, read + 0.9) + (draft.hold ?? 0) * (p.soundOn ? 1 : 0.5); break;
    case "list": case "contrast": s = Math.max(p.shot.min, read + 0.3 * draft.copy.length); break;
    default: s = Math.max(p.shot.min, read);
  }
  // Pace tightens the air around the words, never the time to read them.
  return Math.round(Math.max(read, s * pace) * SEC);
}

// ------------------------------------------------------------------ the director

function score(s: Structure, ctx: Ctx, slate: Slate): { total: number; notes: string[] } {
  const fit = s.fit[ctx.p.id] ?? 0;
  const goal = s.goals[ctx.goal] ?? 0;
  const sameProduct = slate.filter((f) => f.product === ctx.d.slug && f.structure === s.id).length;
  const samePlatform = slate.filter((f) => f.platform === ctx.p.id && f.structure === s.id).length;
  const anywhere = slate.filter((f) => f.structure === s.id).length;
  const total = fit * 1.5 + goal - sameProduct * 6 - samePlatform * 2.4 - anywhere * 0.3 + ctx.r() * 0.2;
  return { total, notes: [`platform fit ${fit}`, `goal fit ${goal}`, ...(sameProduct ? [`already used for this product ×${sameProduct}`] : []), ...(samePlatform ? [`already used on ${ctx.p.label} ×${samePlatform}`] : [])] };
}

export function direct(brief: Brief, d: Dossier, slate: Slate = []): Film {
  const p = PLATFORMS[brief.platform];
  const stage = brief.stage ?? "prelaunch";
  const series = brief.situation ? "situation" : d.guide ? "guide" : undefined;
  const seriesOf = (f: Film) => (f.situation ? "situation" : f.guide ? "guide" : undefined);
  const id = brief.situation ? `sit-${d.slug}-${situationKey(brief.situation)}--${p.id}`
    : d.guide ? `guide-${d.guide.slug}--${p.id}` : `${d.slug}--${p.id}--${brief.goal}`;
  const limits = series === "situation" ? SITUATION_RUNTIME[p.id]
    : series === "guide" ? GUIDE_RUNTIME[p.id] ?? { min: p.duration.min, max: p.duration.max + 10 } : p.duration;
  // A product's product films, guide films and situation films are separate series: each avoids repeating itself, not the others.
  const mine = slate.filter((f) => f.product === d.slug && seriesOf(f) === series);
  const unitAt = (source: string) => {
    const u = d.copy.find((x) => x.source === source);
    if (!u) throw new Error(`${d.slug} has no "${source}"`);
    return u;
  };
  const anchor = brief.situation ? unitAt(brief.situation) : undefined;
  const help = brief.situation ? unitAt(brief.situation.replace(/\.phrase$/, ".answer").replace(/\.problem$/, ".solution")) : undefined;
  const ctx: Ctx = {
    d, p, goal: brief.goal, r: rng(id),
    usedProblems: new Set(mine.map((f) => problemIndex({ source: f.angle.source } as CopyUnit)).filter((n) => n >= 0)),
    usedSources: new Set(mine.flatMap((f) => f.scenes.flatMap((s) => [...s.copy, s.caption].filter(Boolean).map((x) => x!.source)))),
    usedScreens: [],
    brevity: 0,
    relax: 0,
    anchor, help, stage,
  };

  const reasoning: Film["reasoning"] = [
    { topic: "Placement", decision: `${p.label}, ${p.width}×${p.height}, ${limits.min}–${limits.max}s, hook by ${p.hookBy}s, sound ${p.soundOn ? "on" : "off"}`, because: p.notes },
    { topic: "Product", decision: `${d.name}: ${d.free ? "free" : `${d.price}${d.compareAt ? ` (list ${d.compareAt})` : ""}`}, motif "${d.motif}", ${d.personality} personality, ${d.temperature} accent ${d.accent}`, because: `From its definition and Shop listing. ${d.screens.length} real screens${d.liveComponents.length ? ` and live components (${d.liveComponents.join(", ")})` : ""} to show.` },
    ...(anchor ? [{ topic: "Situation", decision: `"${anchor.text}"`, because: `One real moment from ${d.name}'s listing (${anchor.source}). The film is about this moment and how the product helps with it: "${help!.text}"` }] : []),
    ...(d.guide ? [{ topic: "Guide", decision: `"${d.guide.title}" (${d.guide.url})`, because: anchor ? `The guide that covers this moment: what to do comes from it, and the film ends on it.` : `Teaches from the guide first; ${d.name} is the product the guide hands over to. ${d.guide.blocks.length} lists and timelines, ${d.guide.faq.length} questions to draw from.` }] : []),
    ...(stage === "prelaunch" ? [{ topic: "Stage", decision: "Before launch: helpful and relatable only", because: "Nobody knows Draftpace yet, so films show how it helps with real moments. Who it is not for, questions before buying, what you get and the price wait until there are users to sell to." }] : []),
    { topic: "Audience", decision: d.copy.filter((u) => u.kind === "audience").slice(0, 2).map((u) => u.text).join(" / ") || "(none listed)", because: "The listing's own audience lines; the director writes for them." },
  ];

  const rank = () => [...STRUCTURES, ...GUIDE_STRUCTURES, ...SITUATION_STRUCTURES]
    .filter((s) => s.series === series && s.available(ctx) && !(stage === "prelaunch" && BUYER_STRUCTURES.has(s.id)))
    .map((s) => ({ s, ...score(s, ctx, slate) }))
    .sort((a, b) => b.total - a.total);
  // A product never tells the same story twice. If every structure its
  // material supports is already used, allow slightly longer real lines
  // (reading time still holds them) before ever repeating one.
  // Situation films repeat structures by design (each one is a different moment); variety there comes from the scoring.
  const used = new Set(series === "situation" ? [] : mine.map((f) => f.structure));
  let ranked = rank();
  if (!ranked.some((x) => !used.has(x.s.id))) {
    ctx.relax = 4;
    ranked = rank();
    reasoning.push({ topic: "Material", decision: "Allowed real lines up to 4 words longer", because: `Every structure ${d.name}'s copy supports at ${p.label}'s normal line length is already used by its other films; a longer real line beats telling the same story twice.` });
  }
  if (!ranked.length) throw new Error(`no structure can be made from ${d.slug}'s material`);
  // Plan, then fit the running time the way an editor would: shorter real
  // captions first, then fewer list items, then cut optional scenes, then
  // drop hold time. Reading time itself is never cut: a line nobody can
  // finish reading is worse than a line not shown. If it still won't fit,
  // plan again asking every unit for fewer words; if the best structure
  // can't fit at all, move to the runner-up rather than ship a long film.
  const max = limits.max * SEC;
  const OVER = p.voice === "native" ? 6 : 12;
  let chosen = ranked[0];
  let plan!: Plan;
  let drafts: Draft[] = [];
  let edits: Film["reasoning"] = [];
  let t!: Treatment;
  let why: string[] = [];
  const times = () => drafts.map((s) => timeScene(s, p, t.pace));
  const total = () => times().reduce((a2, b2) => a2 + b2, 0) - (drafts.length - 1) * OVER;
  const skipped: string[] = [];
  // Only structures suited to this placement (fit > 0), best first; the closest miss is kept if none fits.
  const suited = ranked.filter((x) => (x.s.fit[p.id] ?? 0) > 0);
  const fresh = suited.filter((x) => !used.has(x.s.id));
  const candidates = fresh.length ? fresh : suited.length ? suited : ranked;
  let closest: { chosen: typeof chosen; plan: Plan; drafts: Draft[]; edits: Film["reasoning"]; t: Treatment; why: string[]; total: number } | undefined;
  for (const candidate of candidates) {
    chosen = candidate;
    ({ t, why } = treatmentFor(ctx, chosen.s));
    let planned = false;
    for (let brevity = 0; brevity <= 3; brevity++) {
      ctx.brevity = brevity;
      ctx.usedScreens = [];
      try { plan = chosen.s.plan(ctx); planned = true; } catch { break; }
      drafts = plan.scenes;
      edits = brevity ? [{ topic: "Edit", decision: `Re-planned with ${brevity * 3} fewer words per line`, because: `The fullest real copy could not be read inside ${limits.max}s on ${p.label}.` }] : [];
      while (total() > max) {
        const list = drafts.findIndex((s2) => (s2.kind === "list" || s2.kind === "contrast") && s2.copy.length > 2);
        const opt = drafts.map((s2) => !!s2.optional).lastIndexOf(true);
        const longCap = drafts.findIndex((s2) => s2.caption && s2.alts?.length);
        const held = drafts.findIndex((s2) => (s2.hold ?? 0) > 0);
        if (list >= 0) {
          edits.push({ topic: "Edit", decision: `Trimmed "${drafts[list].id}" to ${drafts[list].copy.length - 1} items`, because: "Fewer items read properly beats more items skimmed." });
          drafts = drafts.map((s2, j) => (j === list ? { ...s2, copy: s2.copy.slice(0, -1) } : s2));
        } else if (opt >= 0) {
          edits.push({ topic: "Edit", decision: `Cut "${drafts[opt].id}"`, because: `It would run past ${limits.max}s, the most ${p.label} holds attention for${drafts[opt].kind === "brand" ? "; the end card still names the product" : ""}.` });
          drafts = drafts.filter((_, j) => j !== opt);
        } else if (longCap >= 0) {
          const sc = drafts[longCap];
          edits.push({ topic: "Edit", decision: `Shorter caption on "${sc.id}": "${sc.alts![0].text}"`, because: `The full line needs more reading time than ${p.label} gives; the shorter one is the same idea in the product's own words.` });
          drafts = drafts.map((s2, j) => (j === longCap ? { ...s2, caption: s2.alts![0], alts: s2.alts!.slice(1) } : s2));
        } else if (held >= 0) {
          drafts = drafts.map((s2, j) => (j === held ? { ...s2, hold: 0 } : s2));
        } else break;
      }
      if (total() <= max) break;
    }
    if (planned && total() <= max) { closest = undefined; break; }
    if (planned && (!closest || total() < closest.total)) closest = { chosen, plan, drafts, edits, t, why, total: total() };
    if (planned) skipped.push(`${candidate.s.name} (its real copy needs ${(total() / SEC).toFixed(0)}s to read)`);
  }
  if (closest) ({ chosen, plan, drafts, edits, t, why } = closest);
  if (!plan) throw new Error(`no structure could be planned for ${id}`);
  reasoning.push({
    topic: "Structure",
    decision: `${chosen.s.name}: ${chosen.s.purpose}`,
    because: `Best fit for a ${brief.goal} film on ${p.label} (${chosen.notes.join(", ")}).${skipped.length ? ` Passed over: ${skipped.join("; ")}, too long for ${limits.max}s.` : ""} Other candidates: ${ranked.filter((x) => x !== chosen).slice(0, 2).map((x) => `${x.s.name} (${x.total.toFixed(1)})`).join(", ")}.`,
  });
  if (total() > max) edits.push({ topic: "Edit", decision: `Runs ${(total() / SEC).toFixed(1)}s, over ${limits.max}s`, because: "Every second left is reading time for real copy; flagged for review rather than cut." });

  reasoning.push({ topic: "Angle", decision: `"${plan.angle.text}"`, because: plan.story });
  why.forEach((w, i) => reasoning.push({ topic: i === 0 ? "Transitions" : i === 1 ? "Camera" : "Colour", decision: w.split(":")[0], because: w }));
  reasoning.push(...edits);
  const durs = times();
  // Too short for the placement: give the extra time to the scenes worth lingering on.
  const short = limits.min * SEC - total();
  const linger = drafts.map((x, i) => (x.kind === "phone" || x.kind === "title" || x.kind === "live" ? i : -1)).filter((i) => i >= 0);
  if (short > 0 && linger.length) linger.forEach((i, k) => (durs[i] += Math.floor(short / linger.length) + (k < short % linger.length ? 1 : 0)));

  const OVERLAP = OVER;
  let at = 0;
  const scenes: Scene[] = drafts.map((dr, i) => {
    const ground: Ground = dr.ground ?? t.grounds[i % t.grounds.length];
    const transition: FilmTransition = i === 0 ? "cut" : dr.kind === "cta" && p.loops ? "blurDissolve" : t.transitions[(i - 1) % t.transitions.length];
    const from = i === 0 ? 0 : at - OVERLAP;
    const { optional: _o, hold: _h, ground: _g, alts: _a, ...rest } = dr;
    void _o; void _h; void _g; void _a;
    const scene: Scene = { ...rest, from, dur: durs[i], ground, transition, sfx: [] };
    // Break long lines for this canvas and voice.
    const maxChars = p.width >= 1080 ? (t.voice === "native" ? 18 : 22) : 20;
    if (scene.kind === "title" || scene.kind === "brand") scene.lines = scene.copy.map((x) => breakLines(x.text, x.text.length > 70 ? maxChars + 8 : maxChars));
    if (p.voice === "native" && scene.kind === "title" && scene.variant === "editorial") scene.variant = "native";
    at = from + scene.dur;
    return scene;
  });
  // Make sure this is its own film: if its shape is too close to any film
  // already in the slate, vary the treatment one move at a time until it isn't.
  const twin = () => {
    const mine = shape({ structure: chosen.s.id, scenes, treatment: t });
    return slate
      .map((f) => ({ f, sim: similarity(mine, shape(f)) }))
      .sort((a2, b2) => b2.sim - a2.sim)[0];
  };
  const CAMERAS: Treatment["camera"][] = p.energy === "high" ? ["dolly", "float"] : ["float", "locked", "dolly"];
  const moves: [string, () => void][] = [
    ["rotated the ground rhythm", () => { const g = scenes.map((x) => x.ground); scenes.forEach((x, i) => (x.ground = i === 0 && chosen.s.id === "beforeAfter" ? x.ground : g[(i + 1) % g.length])); }],
    ["changed the camera", () => { t.camera = CAMERAS[(CAMERAS.indexOf(t.camera) + 1) % CAMERAS.length]; }],
    ["reordered the transitions", () => { const tr = scenes.slice(1).map((x) => x.transition); scenes.slice(1).forEach((x, i) => (x.transition = tr[(i + 1) % tr.length])); }],
    ["switched the brand reveal", () => scenes.forEach((x) => x.kind === "brand" && (x.variant = x.variant === "center" ? "lockup" : "center"))],
    ["re-posed the phones", () => { const poses = ["float", "tiltLeft", "tiltRight", "flat"] as const; scenes.forEach((x) => x.screen && x.screen.pose !== "pair" && (x.screen.pose = poses[(poses.indexOf(x.screen.pose as typeof poses[number]) + 1) % poses.length])); }],
    ["set the grounds against the accent", () => scenes.forEach((x, i) => i > 0 && x.kind !== "phone" && (x.ground = x.ground === "light" ? "accent" : x.ground === "accent" ? "ink" : "light"))],
  ];
  for (let m = 0; m < moves.length * 2; m++) {
    const near = twin();
    if (!near || near.sim < MAX_SIMILARITY) break;
    const [what, apply] = moves[m % moves.length];
    apply();
    reasoning.push({ topic: "Variation", decision: `${what[0].toUpperCase()}${what.slice(1)}`, because: `Its shape was ${near.sim.toFixed(2)} similar to ${near.f.id}; a different film, not the same one re-coloured.` });
  }
  scenes.forEach((s) => (s.sfx = soundFor(s, p, d)));
  const durationInFrames = Math.max(...scenes.map((s) => s.from + s.dur));

  reasoning.push({
    topic: "Sound",
    decision: `${p.soundOn ? "Full" : "Light"} sound design, ${p.energy}-energy bed`,
    because: p.soundOn
      ? "Sound-on placement: every transition, landing and reveal has a cue, and the bed ducks under the brand moment."
      : "Most of this audience never unmutes, so nothing depends on sound; cues are kept quieter and sparser for those who do.",
  });
  reasoning.push({ topic: "Length", decision: `${(durationInFrames / SEC).toFixed(1)}s, ${scenes.length} scenes`, because: `Each scene is held for the time its words take to read on ${p.label} (${p.secondsPerWord}s a word), inside ${limits.min}–${limits.max}s.` });

  return {
    id, product: d.slug, ...(d.guide ? { guide: d.guide.slug } : {}), ...(anchor ? { situation: anchor.source } : {}),
    ...(series ? { runtime: limits } : {}), platform: p.id, goal: brief.goal,
    width: p.width, height: p.height, fps: SEC, durationInFrames,
    structure: chosen.s.id, angle: plan.angle, treatment: t,
    music: { bed: "audio/bed-relaxation-05.mp3", level: p.energy === "high" ? 0.24 : p.energy === "mid" ? 0.2 : 0.16, energy: p.energy },
    scenes, reasoning,
  };
}

export { screenAbout };
export { STRUCTURES, GUIDE_STRUCTURES, SITUATION_STRUCTURES, BUYER_STRUCTURES, MOTIF_LANGUAGE, TRANSITION_SFX, overlap, emphasisOf, soundFor, rng };
