import { HOME_ITEM_TYPES, type HomeItemTypeDefinition } from "./homeKnowledge";
import type { HomeItem, ProblemSeverity } from "./state";

/**
 * Turning "the garage door is making a grinding noise" into something the
 * product can act on.
 *
 * The single most important rule here: this never decides whether a
 * report survives. A sentence that matches nothing still becomes a real
 * problem carrying the person's own words. Matching only decides how
 * much arrives pre-filled. The old import pipeline answered that exact
 * sentence with "Not recognized" and a Dismiss button, which is the
 * failure this whole flow exists to remove.
 *
 * Deterministic, like everything else in this product: whole-word
 * matching against the curated type list and a hand-written symptom
 * table. No model, no inference, no guessing.
 */

/**
 * Phrases that genuinely change how fast something should be dealt with.
 *
 * Kept narrow on purpose. A false "urgent" trains people to ignore the
 * word, so only things that are actually dangerous or actively causing
 * damage appear in the urgent list. Note "smell gas" rather than "gas",
 * which would flag a gas hob that will not light.
 */
const URGENT_PHRASES = [
  "smell gas",
  "gas smell",
  "smell of gas",
  "gas leak",
  "carbon monoxide",
  "sparking",
  "burning smell",
  "smells burning",
  "smoke",
  "flooding",
  "flooded",
  "burst",
  "gushing",
  "sewage",
  "no heat",
  "no hot water",
  "electric shock",
];

const MINOR_PHRASES = [
  "noise",
  "noisy",
  "grinding",
  "squeak",
  "squeaking",
  "rattle",
  "rattling",
  "slow",
  "stain",
  "scratch",
  "loose",
  "sticking",
  "flickering",
];

/**
 * The narrow set worth a word of caution rather than a silent filing.
 * A calm nudge, not instructions: telling someone how to handle a gas
 * leak is not this product's job, but quietly giving them a Snooze
 * button for one would be worse.
 */
const DANGEROUS_PHRASES = [
  "smell gas",
  "gas smell",
  "smell of gas",
  "gas leak",
  "carbon monoxide",
  "sparking",
  "burning smell",
  "smells burning",
  "smoke",
  "electric shock",
];

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentionsWord(haystack: string, phrase: string): boolean {
  return new RegExp(`\\b${escapeForRegex(phrase)}\\b`).test(haystack);
}

/**
 * How confident the match is, which decides what the interface is
 * allowed to claim.
 *
 * The distinction matters: recognising the words "garage door" is not
 * the same as knowing the person has one. Saying "your garage door" to
 * somebody who has never mentioned owning one is the product pretending
 * to know something it does not.
 */
export type ProblemMatchKind =
  /** The sentence points at one specific thing they own. */
  | "item"
  /** A kind of thing was recognised, and none of that kind is recorded. */
  | "typeOnly"
  /** A kind was recognised and they own several, so the person picks. */
  | "ambiguous"
  | "none";

export interface ProblemSentenceMatch {
  kind: ProblemMatchKind;
  /** One of the person's own things, when the sentence clearly points at it. */
  itemId: string | null;
  /** What kind of thing this seems to be about, when no specific one matched. */
  type: HomeItemTypeDefinition | null;
  severity: ProblemSeverity;
  /** The words that were recognised, so the interface can show its working. */
  matchedOn: string | null;
  /** True when the sentence describes something worth not filing away quietly. */
  dangerous: boolean;
}

/**
 * Severity from the words used, defaulting to moderate. Urgent wins over
 * minor, so "flooding, and a rattling noise" is urgent.
 */
export function severityFromSentence(sentence: string): ProblemSeverity {
  const normalized = sentence.toLowerCase();
  if (URGENT_PHRASES.some((phrase) => mentionsWord(normalized, phrase))) return "urgent";
  if (MINOR_PHRASES.some((phrase) => mentionsWord(normalized, phrase))) return "minor";
  return "moderate";
}

export function isDangerousSentence(sentence: string): boolean {
  const normalized = sentence.toLowerCase();
  return DANGEROUS_PHRASES.some((phrase) => mentionsWord(normalized, phrase));
}

/**
 * What this sentence seems to be about.
 *
 * Their own things first, since a name someone chose themselves is the
 * strongest signal available. Then the curated type list, and only when
 * that type resolves to exactly one thing they own does it get attached
 * automatically. Two water heaters means no guess: the person picks.
 */
export function matchProblemSentence(sentence: string, items: HomeItem[]): ProblemSentenceMatch {
  const normalized = sentence.toLowerCase();
  const active = items.filter((item) => item.status !== "archived");

  const severity = severityFromSentence(sentence);
  const dangerous = isDangerousSentence(sentence);

  // 1. The sentence names one of their things outright.
  const named = active
    .filter((item) => item.name.trim().length > 2 && mentionsWord(normalized, item.name.trim().toLowerCase()))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (named) {
    return { kind: "item", itemId: named.id, type: null, severity, matchedOn: named.name, dangerous };
  }

  // 2. Otherwise recognise the kind of thing, most specific keyword first.
  let best: { definition: HomeItemTypeDefinition; keyword: string } | null = null;
  for (const definition of HOME_ITEM_TYPES) {
    for (const keyword of definition.matchKeywords) {
      if (!mentionsWord(normalized, keyword)) continue;
      if (!best || keyword.length > best.keyword.length) best = { definition, keyword };
    }
  }
  if (!best) return { kind: "none", itemId: null, type: null, severity, matchedOn: null, dangerous };

  const ofThatType = active.filter((item) => item.type === best.definition.id);
  if (ofThatType.length === 1) {
    return { kind: "item", itemId: ofThatType[0].id, type: best.definition, severity, matchedOn: ofThatType[0].name, dangerous };
  }
  return {
    kind: ofThatType.length > 1 ? "ambiguous" : "typeOnly",
    itemId: null,
    type: best.definition,
    severity,
    matchedOn: best.definition.label,
    dangerous,
  };
}
