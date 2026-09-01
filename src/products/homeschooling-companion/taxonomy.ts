/**
 * The topic taxonomy: the only content the Companion itself ships.
 *
 * A curriculum-neutral list of things children learn, so that a family
 * saying "we are doing equivalent fractions" and a future subject pack
 * saying the same thing mean the same thing.
 *
 * IT IS A VOCABULARY, NOT A CURRICULUM.
 *
 * Read the whole file and you have read a set of words for organizing
 * learning and checks. You have not read what any child should learn,
 * in what order, or by when. Nothing here is a Draftpace curriculum,
 * nothing here is a recommendation, and a topic being absent from this
 * list says nothing whatsoever about whether it is worth teaching.
 *
 * A family teaching Latin, or logic, or boatbuilding is not missing
 * anything: they simply have no checks available through this route,
 * which the product says plainly. That is the honest shape of a
 * vocabulary, and the moment it starts implying completeness it has
 * become the curriculum position this product exists without.
 *
 * A plain TypeScript file rather than a table, like affairsKnowledge.ts
 * and homeKnowledge.ts. Reviewable in a pull request, diffable,
 * identical for every family, and provably not generated. There is no
 * model provider anywhere in this repository.
 *
 * WHY THIS EXISTS BEFORE ANY QUESTIONS DO
 *
 * It is the socket. A check needs to know that what a child has been
 * working on and what a question is about are the same thing, and this
 * is the only thing that can say so. Questions come from the parent,
 * from the curriculum they already own, or later from a subject pack;
 * all three land against these keys and one history spans them.
 *
 * WHAT IS DELIBERATELY ABSENT
 *
 * No ages, no grades, no year levels, no ordering by "when a child
 * should know this". Publishers disagree with each other and with every
 * national curriculum, and a homeschooling family has usually chosen
 * their sequence on purpose. `ordinal` orders topics roughly the way a
 * subject builds on itself, which is a fact about the subject, and is
 * used to sort a picker and for nothing else.
 *
 * No difficulty either. Difficulty is a property of a question, not of a
 * topic, and the moment a topic carries one the product is a step from
 * telling a parent their child is behind on it.
 */

export interface Topic {
  /** Stable. Never rename or reuse: a family's history points at it. */
  key: string;
  subject: string;
  label: string;
  /** Roughly how a subject builds on itself. Sorts a picker, nothing more. */
  ordinal: number;
}

function topics(subject: string, labels: [string, string][]): Topic[] {
  return labels.map(([slug, label], index) => ({
    key: `${subject.toLowerCase()}.${slug}`,
    subject,
    label,
    ordinal: index,
  }));
}

export const TOPICS: Topic[] = [
  ...topics("Math", [
    ["counting", "Counting and number order"],
    ["place-value", "Place value"],
    ["addition", "Addition"],
    ["subtraction", "Subtraction"],
    ["multiplication", "Multiplication"],
    ["division", "Division"],
    ["long-division", "Long division"],
    ["fractions-basic", "Understanding fractions"],
    ["fractions-equivalent", "Equivalent fractions"],
    ["fractions-operations", "Adding and subtracting fractions"],
    ["decimals", "Decimals"],
    ["percentages", "Percentages"],
    ["measurement", "Measurement"],
    ["time", "Telling the time"],
    ["money", "Money"],
    ["shapes", "Shapes and their properties"],
    ["area-perimeter", "Area and perimeter"],
    ["data", "Reading charts and tables"],
    ["word-problems", "Word problems"],
    ["algebra-early", "Early algebra"],
  ]),
  ...topics("Reading", [
    ["phonics", "Phonics and letter sounds"],
    ["blending", "Blending and decoding"],
    ["sight-words", "Common words on sight"],
    ["fluency", "Reading aloud fluently"],
    ["vocabulary", "Vocabulary"],
    ["comprehension-literal", "Understanding what was read"],
    ["comprehension-inference", "Working out what is implied"],
    ["main-idea", "Finding the main idea"],
    ["sequencing", "Putting events in order"],
    ["character", "Characters and their motives"],
    ["non-fiction", "Reading for information"],
    ["poetry", "Poetry"],
  ]),
  ...topics("Writing", [
    ["letter-formation", "Forming letters"],
    ["spelling", "Spelling"],
    ["punctuation", "Punctuation"],
    ["grammar", "Grammar"],
    ["sentences", "Building sentences"],
    ["paragraphs", "Paragraphs"],
    ["narrative", "Telling a story"],
    ["descriptive", "Describing something"],
    ["persuasive", "Making an argument"],
    ["editing", "Editing and redrafting"],
  ]),
  ...topics("Science", [
    ["observation", "Observing and describing"],
    ["living-things", "Living things"],
    ["human-body", "The human body"],
    ["plants", "Plants"],
    ["habitats", "Habitats and food chains"],
    ["materials", "Materials and their properties"],
    ["states-of-matter", "Solids, liquids and gases"],
    ["forces", "Forces and motion"],
    ["energy", "Energy"],
    ["electricity", "Electricity"],
    ["earth-space", "Earth and space"],
    ["weather", "Weather"],
    ["experiments", "Running a fair test"],
  ]),
  ...topics("History", [
    ["chronology", "Putting events in time order"],
    ["sources", "Working from sources"],
    ["ancient", "Ancient civilisations"],
    ["medieval", "The medieval world"],
    ["exploration", "Exploration and settlement"],
    ["revolutions", "Revolutions and independence"],
    ["modern", "The modern era"],
    ["local", "Local and family history"],
  ]),
  ...topics("Geography", [
    ["maps", "Maps and directions"],
    ["continents", "Continents and oceans"],
    ["countries", "Countries and capitals"],
    ["landforms", "Rivers, mountains and coasts"],
    ["climate", "Climate and biomes"],
    ["people-places", "How people live in different places"],
    ["resources", "Natural resources"],
    ["environment", "Looking after the environment"],
  ]),
];

export const TOPIC_BY_KEY: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.key, t]));

/** The subjects the taxonomy actually covers. */
export const TAXONOMY_SUBJECTS: string[] = [...new Set(TOPICS.map((t) => t.subject))];

export function topicsForSubject(subject: string): Topic[] {
  const normalised = subject.trim().toLowerCase();
  return TOPICS.filter((t) => t.subject.toLowerCase() === normalised).sort((a, b) => a.ordinal - b.ordinal);
}

/**
 * Whether this product has topics for what a family calls a subject.
 *
 * Used to say so plainly rather than offering an empty picker. A family
 * teaching Latin gets "we do not have topics for this yet", which is
 * true, instead of a blank list that looks broken.
 */
export function hasTopicsFor(subject: string): boolean {
  return topicsForSubject(subject).length > 0;
}

/**
 * Topics whose label or key contains every word typed.
 *
 * Deterministic substring matching and nothing cleverer. A parent typing
 * "fraction" should find the three fraction topics without this product
 * pretending to understand them. No model is involved, and text that
 * matches nothing simply matches nothing.
 */
export function searchTopics(query: string, subject?: string): Topic[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const pool = subject ? topicsForSubject(subject) : TOPICS;
  if (words.length === 0) return pool;
  return pool.filter((topic) => {
    const haystack = `${topic.label} ${topic.key}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

/** How a set of topic keys reads on screen. Unknown keys are dropped, never guessed at. */
export function describeTopics(keys: string[]): string {
  const labels = keys.map((key) => TOPIC_BY_KEY[key]?.label).filter((label): label is string => Boolean(label));
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
