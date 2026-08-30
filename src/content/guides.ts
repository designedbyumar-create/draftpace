import { LIFE_AREAS } from "./areas";

/**
 * Guides: the layer between the marketing site and the app.
 *
 * WHY A TYPED BLOCK MODEL RATHER THAN MDX
 *
 * The obvious answer for long-form articles is MDX, and it was the first
 * recommendation made here. It is the wrong fit for this repo. There is
 * no markdown tooling installed, next.config.ts is deliberately almost
 * empty, and the established pattern for long content is already a typed
 * module: affairsKnowledge.ts is 720 lines, handbookContent.ts is 360,
 * and both are covered by structural tests, including one that checks
 * the voice of the writing. A typed model keeps guides inside that same
 * discipline, so the no-exclamation-mark and no-em-dash rules stay
 * enforceable by test rather than by memory.
 *
 * The previous model supported headings and paragraphs and nothing else.
 * That is survivable for two guides and not for fifty five: almost every
 * planned article needs lists, and the state-by-state homeschool anchor
 * needs a table.
 *
 * INLINE LINKS
 *
 * Paragraphs are plain strings that additionally accept [text](/href)
 * inline. That is the only markup permitted, parsed by a small renderer
 * in GuideBody.tsx, so a guide can cite another guide or a product page
 * without opening the door to arbitrary HTML in content.
 */

export type GuideBlock =
  | { kind: "paragraphs"; heading?: string; paragraphs: string[] }
  | { kind: "list"; heading?: string; intro?: string; ordered?: boolean; items: string[] }
  | { kind: "table"; heading?: string; intro?: string; columns: string[]; rows: string[][] }
  | { kind: "callout"; label: string; body: string };

export type Guide = {
  slug: string;
  title: string;
  dek: string;
  readingTime: string;
  publishedAt: string;
  /** Set when the writing changes materially. Reference pages live or die on this. */
  updatedAt?: string;
  /**
   * The life area this guide belongs to, which resolves its hub, its
   * sibling guides, and the Companion it hands over to.
   *
   * Null is allowed and deliberately visible: it means an orphan, a
   * guide with no product behind it. The two guides written before the
   * Companion Series existed are the only ones, and guides.test.ts
   * asserts the count does not grow, so orphans cannot accumulate
   * quietly the way the empty need pages did.
   */
  areaSlug: string | null;
  body: GuideBlock[];
};

export const GUIDES: Guide[] = [
  {
    slug: "planning-a-move-without-losing-the-details",
    title: "Planning a move without losing the details",
    dek: "The hard part of a move is rarely the packing. It's holding fifteen small decisions in your head at once.",
    readingTime: "5 min read",
    publishedAt: "2026-07-15",
    // Repointed. Written before the Companion Series existed, but a move
    // is mostly a home and address problem, so it now hands over to Home
    // Base rather than to a need page that no longer leads anywhere.
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most moves don't go wrong because of one big mistake. They go wrong because of a dozen small things that all needed attention around the same time, and a few of them slipped. The lease notice you meant to send. The utility transfer you forgot had a deadline. The date that quietly moved up a week and nobody updated the plan.",
          "None of these things are hard on their own. What makes a move stressful is trying to hold the whole shape of it in your head while also living your regular life.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Separate what's due soon from what isn't",
        paragraphs: [
          "The instinct when planning something big is to write down everything you can think of. That's a reasonable first step, but it creates a new problem: now you have a long list, and long lists are hard to act on. The next step matters more than the full list. What needs attention this week? Everything else can wait, and it's fine if it waits, as long as it doesn't get lost.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Expect at least one detail to change",
        paragraphs: [
          "A date will move. A number will change. Someone will need something a week earlier than planned. This isn't a sign your plan was wrong. It's just what happens with anything that involves other people and other schedules.",
          "The useful question isn't how to build a plan that never changes. It's how to update one detail without having to reconsider everything connected to it. When the move-in date shifts, you shouldn't have to re-plan the whole move. You should be able to update that one date and see what else it actually affects.",
        ],
      },
      {
        kind: "list",
        heading: "What to write down about the new place",
        intro: "The details you will want a year from now, and will not remember if you do not record them during the move.",
        items: [
          "Meter readings on the day you take over, with the date.",
          "Which utility is with which provider, and the account number for each.",
          "Where the stopcock, fuse box and thermostat actually are.",
          "The make and model of anything that came with the property.",
          "Who you called when something went wrong, and whether they were any good.",
        ],
      },
      {
        kind: "callout",
        label: "What to keep track of",
        body: "A move is the one moment when every fact about a home passes through your hands at once, and almost none of it gets written down. A year later the boiler needs servicing and nobody remembers who installed it. Recording it while it is in front of you takes minutes and saves an afternoon.",
      },
    ],
  },
  {
    slug: "deciding-when-every-option-feels-risky",
    title: "Deciding when every option feels risky",
    dek: "Some decisions don't have a safe choice. Here's how to think about them without going in circles.",
    readingTime: "4 min read",
    publishedAt: "2026-07-22",
    // Orphan, and honestly labelled as one. There is no decision product
    // and this guide predates the Companion Series. It stays published
    // because it is written and indexed; it hands over to nothing.
    areaSlug: null,
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Some decisions are hard because you don't have enough information. Those get easier when you go and find it. Other decisions are hard because every option costs something real, and no amount of research changes that. Those are the ones that keep people up.",
          "The second kind doesn't get solved by thinking harder. It gets solved by being honest about what you're actually weighing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write down what you would regret",
        paragraphs: [
          "Most people list pros and cons. That produces two columns of roughly equal length and no clarity, because it treats every point as though it weighs the same. A more useful question is which version of being wrong you could live with. Regret is easier to predict than outcomes, and it tends to point somewhere specific.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Decide what would change your mind",
        paragraphs: [
          "Before you choose, write down what would have to be true for the other option to be right. If nothing would, you have already decided and are looking for permission. If something would, you now know exactly what to go and check, and the decision has turned back into the first kind.",
        ],
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

/** Guides belonging to a life area, in publication order. */
export function guidesForArea(areaSlug: string): Guide[] {
  return GUIDES.filter((guide) => guide.areaSlug === areaSlug);
}

/** Areas that currently have at least one guide, so an empty hub is never linked. */
export function areasWithGuides() {
  return LIFE_AREAS.filter((area) => guidesForArea(area.slug).length > 0);
}

/**
 * Up to `limit` other guides from the same area, so a reader who arrived
 * on one narrow article has somewhere to go that is not the exit.
 */
export function relatedGuides(guide: Guide, limit = 3): Guide[] {
  if (!guide.areaSlug) return [];
  return guidesForArea(guide.areaSlug)
    .filter((candidate) => candidate.slug !== guide.slug)
    .slice(0, limit);
}
