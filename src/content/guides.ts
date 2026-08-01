export type Guide = {
  slug: string;
  title: string;
  dek: string;
  readingTime: string;
  publishedAt: string;
  body: { heading?: string; paragraphs: string[] }[];
  relatedNeedSlugs: string[];
};

export const GUIDES: Guide[] = [
  {
    slug: "planning-a-move-without-losing-the-details",
    title: "Planning a move without losing the details",
    dek: "The hard part of a move is rarely the packing. It's holding fifteen small decisions in your head at once.",
    readingTime: "5 min read",
    publishedAt: "2026-07-15",
    relatedNeedSlugs: ["planning-something-important", "getting-organized"],
    body: [
      {
        paragraphs: [
          "Most moves don't go wrong because of one big mistake. They go wrong because of a dozen small things that all needed attention around the same time, and a few of them slipped. The lease notice you meant to send. The utility transfer you forgot had a deadline. The date that quietly moved up a week and nobody updated the plan.",
          "None of these things are hard on their own. What makes a move stressful is trying to hold the whole shape of it in your head while also living your regular life.",
        ],
      },
      {
        heading: "Separate what's due soon from what isn't",
        paragraphs: [
          "The instinct when planning something big is to write down everything you can think of. That's a reasonable first step, but it creates a new problem: now you have a long list, and long lists are hard to act on. The next step matters more than the full list. What needs attention this week? Everything else can wait, and it's fine if it waits, as long as it doesn't get lost.",
        ],
      },
      {
        heading: "Expect at least one detail to change",
        paragraphs: [
          "A date will move. A number will change. Someone will need something a week earlier than planned. This isn't a sign your plan was wrong. It's just what happens with anything that involves other people and other schedules.",
          "The useful question isn't how to build a plan that never changes. It's how to update one detail without having to reconsider everything connected to it. When the move-in date shifts, you shouldn't have to re-plan the whole move. You should be able to update that one date and see what else it actually affects.",
        ],
      },
      {
        heading: "Keep the decisions, not just the tasks",
        paragraphs: [
          "It's tempting to write a plan as a list of tasks: call the landlord, book the truck, cancel the internet. But plans also involve decisions: which apartment, which moving company, which date. Decisions are easy to forget you made, and even easier to forget why. Keeping a short note next to a decision, not just the outcome, saves you from re-deciding the same thing later.",
        ],
      },
    ],
  },
  {
    slug: "deciding-when-every-option-feels-risky",
    title: "Deciding when every option feels risky",
    dek: "You don't need more information. You need to see what you're actually weighing against what.",
    readingTime: "4 min read",
    publishedAt: "2026-07-22",
    relatedNeedSlugs: ["making-a-difficult-decision"],
    body: [
      {
        paragraphs: [
          "Most hard decisions aren't hard because the options are unclear. They're hard because every option has a real cost, and it's uncomfortable to look directly at what you'd be giving up either way.",
          "When a decision stays in your head, it tends to loop. You think through option A, feel uneasy, switch to option B, feel a different kind of uneasy, and go back to A. The discomfort doesn't come from a lack of information. It comes from never actually laying the options side by side.",
        ],
      },
      {
        heading: "Write down what you're actually comparing",
        paragraphs: [
          "Not a general pros and cons list. The specific things that matter to you, for this decision, in this moment. Cost matters more in some decisions than others. Time matters more in some than others. A generic list treats every factor as equally important, which is rarely true.",
        ],
      },
      {
        heading: "Separate the decision from the fear of deciding wrong",
        paragraphs: [
          "A lot of decision paralysis isn't really about the options. It's about the fear of being the kind of person who chose wrong. That fear doesn't go away by gathering more information. It goes away by making a decision you can explain to yourself later, based on what you actually knew and valued at the time.",
          "That's why it helps to write down not just what you chose, but why, while it's still clear in your head. If you second-guess yourself in a month, you'll have the actual reasoning, not just the outcome.",
        ],
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
