import { TOPIC_BY_KEY } from "./taxonomy";

/**
 * Checking whether something landed.
 *
 * The Companion does not supply the questions. It supplies the structure
 * around them: which topics this child has actually been working with,
 * how many answers are enough to say anything at all, and what may
 * honestly be concluded from them. That structure is the part a parent
 * cannot build for themselves, and it is the whole of what is being
 * bought here.
 *
 * Pure. No database, no clock, no randomness that cannot be reproduced.
 *
 * THE RULE THAT MAKES THIS TRUSTWORTHY
 *
 * A topic with three answers behind it gets no verdict, whatever those
 * answers were. The product says "not enough here to say anything about
 * long division" and means it. Every other tool in this category fails
 * exactly here: it produces a confident looking result from thin
 * evidence, a parent acts on it, and the tool was never entitled to the
 * claim. See CONFIDENCE_FLOOR.
 *
 * WHAT IS NEVER PRODUCED
 *
 * No headline score. No percentage. No comparison to another child, to a
 * grade, or to any standard. No statement of the form "Emma is". A check
 * of eight questions is a check of eight questions, and the language
 * never exceeds that.
 */

/**
 * How many answers a topic needs before anything may be said about it.
 *
 * Four is a judgement, and it is deliberately conservative. Below it the
 * product is silent rather than approximate, because the cost of a
 * wrong steer to a parent about their own child is far higher than the
 * cost of saying nothing.
 */
export const CONFIDENCE_FLOOR = 4;

export type ItemSource = "parent" | "curriculum" | "pack";

export interface CheckItem {
  id: string;
  topicKey: string;
  source: ItemSource;
  prompt: string;
  expectedAnswer: string | null;
}

/** What the parent recorded for one question. */
export type AnswerMark = "right" | "not-right" | "skipped";

export interface CheckAnswer {
  itemId: string;
  topicKey: string;
  mark: AnswerMark;
}

export type Standing = "looked-solid" | "worth-another-look" | "mixed" | "not-enough-to-say";

export interface TopicStanding {
  topicKey: string;
  label: string;
  standing: Standing;
  /** Answers that counted. Skipped ones never do. */
  answered: number;
  right: number;
}

export interface CheckResult {
  topics: TopicStanding[];
  /** Only the ones the product is entitled to speak about. */
  spoken: TopicStanding[];
  /** Topics that were asked about but came back below the floor. */
  silent: TopicStanding[];
  itemsAsked: number;
  itemsAnswered: number;
}

/**
 * Deterministic selection.
 *
 * Given the same child, the same topics and the same seed, the same
 * check comes out, which is what lets this be tested at all. The hash is
 * ordinary and cheap; it exists to vary the order between checks without
 * ever being unreproducible.
 */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface AssembleInputs {
  topicKeys: string[];
  available: CheckItem[];
  /** Upper bound per topic. The floor matters; this only stops a check running long. */
  perTopic?: number;
  seed: string;
}

/**
 * Build a check from what exists.
 *
 * Never invents a question, never pads a topic to reach the floor, and
 * never silently drops a topic the parent asked about: a topic with too
 * few questions is still included, and its result says so. That is the
 * honest behaviour, and hiding it would leave a parent thinking a topic
 * had been checked when it had not.
 */
export function assembleCheck(inputs: AssembleInputs): CheckItem[] {
  const perTopic = inputs.perTopic ?? 4;
  const picked: CheckItem[] = [];

  for (const topicKey of inputs.topicKeys) {
    const pool = inputs.available
      .filter((item) => item.topicKey === topicKey)
      .sort((a, b) => hash(`${inputs.seed}:${a.id}`) - hash(`${inputs.seed}:${b.id}`));
    picked.push(...pool.slice(0, perTopic));
  }

  return picked;
}

/** How many more questions a topic needs before this could say anything. */
export function shortfall(topicKey: string, items: CheckItem[]): number {
  const have = items.filter((item) => item.topicKey === topicKey).length;
  return Math.max(0, CONFIDENCE_FLOOR - have);
}

/**
 * What may honestly be said, topic by topic.
 *
 * Thresholds are deliberately wide. A child who got three of four right
 * is "mixed", not "solid": the gap between those two is one question,
 * and pretending to resolve it would be inventing precision the evidence
 * does not carry.
 */
export function deriveResult(items: CheckItem[], answers: CheckAnswer[]): CheckResult {
  const byTopic = new Map<string, { answered: number; right: number }>();

  for (const item of items) {
    if (!byTopic.has(item.topicKey)) byTopic.set(item.topicKey, { answered: 0, right: 0 });
  }

  for (const answer of answers) {
    // A skipped question is not evidence of anything, in either
    // direction. It never counts.
    if (answer.mark === "skipped") continue;
    const bucket = byTopic.get(answer.topicKey);
    if (!bucket) continue;
    bucket.answered += 1;
    if (answer.mark === "right") bucket.right += 1;
  }

  const topics: TopicStanding[] = [...byTopic.entries()].map(([topicKey, counts]) => ({
    topicKey,
    label: TOPIC_BY_KEY[topicKey]?.label ?? topicKey,
    standing: standingFor(counts.answered, counts.right),
    answered: counts.answered,
    right: counts.right,
  }));

  return {
    topics,
    spoken: topics.filter((t) => t.standing !== "not-enough-to-say"),
    silent: topics.filter((t) => t.standing === "not-enough-to-say"),
    itemsAsked: items.length,
    itemsAnswered: answers.filter((a) => a.mark !== "skipped").length,
  };
}

function standingFor(answered: number, right: number): Standing {
  if (answered < CONFIDENCE_FLOOR) return "not-enough-to-say";
  const ratio = right / answered;
  if (ratio >= 0.8) return "looked-solid";
  if (ratio <= 0.4) return "worth-another-look";
  return "mixed";
}

export const STANDING_LABEL: Record<Standing, string> = {
  "looked-solid": "Looked solid",
  mixed: "Mixed",
  "worth-another-look": "Worth another look",
  "not-enough-to-say": "Not enough to say",
};

/**
 * The sentence for one topic.
 *
 * Always about the check and never about the child. "This check suggests
 * equivalent fractions is worth another look" is a statement the product
 * can stand behind. "Emma struggles with fractions" is not, and never
 * will be from eight questions.
 */
export function describeStanding(topic: TopicStanding): string {
  switch (topic.standing) {
    case "looked-solid":
      return `${topic.label} looked solid.`;
    case "mixed":
      return `${topic.label} was mixed.`;
    case "worth-another-look":
      return `${topic.label} is worth another look.`;
    case "not-enough-to-say":
      return `Not enough here to say anything about ${topic.label.toLowerCase()}.`;
  }
}

/**
 * The headline. Names what came back, never how many were right.
 *
 * A fraction is a grade, a grade invites comparison, and comparison is
 * the thing a homeschooling parent is already anxious about. The number
 * of questions is available further down for anybody who wants it.
 */
export function describeResult(result: CheckResult): string {
  if (result.itemsAnswered === 0) return "Nothing was answered, so there is nothing to report.";
  if (result.spoken.length === 0) {
    return "This was too short to say anything about any of it. More questions on a topic would change that.";
  }
  const worth = result.spoken.filter((t) => t.standing === "worth-another-look");
  const mixed = result.spoken.filter((t) => t.standing === "mixed");
  if (worth.length === 0 && mixed.length === 0) return "All of this looked solid.";
  const attention = [...worth, ...mixed];
  if (attention.length === 1) return `One thing here is worth going over again.`;
  return `${attention.length} things here are worth going over again.`;
}

export interface PriorStanding {
  topicKey: string;
  standing: Standing;
}

/**
 * What the product suggests, and the exact limit of it.
 *
 * Only ever surfaced after the same thing has come back twice, because
 * one check is one check. Never changes anything: the parent moves their
 * child, or does not. Every line is a suggestion about the material, not
 * a conclusion about a person.
 */
export function suggestion(topic: TopicStanding, priors: PriorStanding[]): string | null {
  const previous = priors.filter((p) => p.topicKey === topic.topicKey);
  const again = (standing: Standing) => previous.some((p) => p.standing === standing);

  if (topic.standing === "looked-solid" && again("looked-solid")) {
    return "This has looked solid twice. You may want to move on when you are ready.";
  }
  if (topic.standing === "worth-another-look" && again("worth-another-look")) {
    return "This has come up twice. You might want to spend more time here before moving on.";
  }
  return null;
}
