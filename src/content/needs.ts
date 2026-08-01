/**
 * Shared content for the need-based pages (/help-with and
 * /help-with/[slug]) and the homepage ProblemChooser. Kept as data so the
 * same six needs stay consistent across every place they appear, without
 * duplicating copy.
 */
export type NeedContent = {
  slug: string;
  label: string;
  situation: string;
  longDescription: string;
  whatHelps: string[];
  example: string;
  whoThisIsFor: string[];
};

export const NEEDS: NeedContent[] = [
  {
    slug: "getting-organized",
    label: "Get organized",
    situation: "Papers, tabs, and half-finished notes everywhere, none of it in one place.",
    longDescription:
      "Nothing about your situation is complicated. The problem is that it lives in six different places: a notes app, a few texts, a browser tab you're afraid to close. Getting organized isn't about a bigger system. It's about one place that actually holds what matters, without a lot of setup to make that happen.",
    whatHelps: [
      "A single place to put what matters, sorted without extra effort on your part.",
      "Rough entries are fine. You don't need to categorize everything perfectly to start.",
      "You can see what's current and what's old at a glance.",
    ],
    example: "One list: what's due, what's decided, what's next.",
    whoThisIsFor: [
      "You have the information, it's just scattered.",
      "You've tried a notes app or spreadsheet and it fell apart after a week.",
      "You want less setup, not a more elaborate system.",
    ],
  },
  {
    slug: "planning-something-important",
    label: "Plan something important",
    situation: "A move, a trip, or an event with a lot of moving parts and no clear order.",
    longDescription:
      "Big plans fail less because of any single mistake and more because it's hard to see the whole shape of them at once. What needs to happen first. What can wait. What you're forgetting because it's not due yet. A plan that only shows you this week, instead of the whole timeline at once, is easier to actually follow.",
    whatHelps: [
      "A plan that accounts for what you actually have to do, broken into the right order.",
      "A view of what needs attention this week, not the whole plan competing for your attention at once.",
      "Room to change dates and details as things shift, without redoing the whole plan.",
    ],
    example: "A timeline that shows what needs attention this week, not the whole plan at once.",
    whoThisIsFor: [
      "You're planning something with a real deadline and several dependent steps.",
      "You want a plan you can actually follow, not just a wish list.",
      "Some details are still unknown, and that's fine.",
    ],
  },
  {
    slug: "keeping-something-moving",
    label: "Follow through",
    situation: "A project or goal that stalls every time life gets busy for a while.",
    longDescription:
      "Most things don't fail because you gave up. They stall because picking them back up feels like more effort than it should. Reading through old notes, remembering where you were, figuring out what's still relevant. A quick check-in that already knows where you stopped removes that cost.",
    whatHelps: [
      "Small check-ins that pick up exactly where you stopped, without a recap.",
      "A next action that's specific enough to actually start.",
      "No penalty for the days you didn't show up.",
    ],
    example: "Five minutes to see what changed and what to do next.",
    whoThisIsFor: [
      "You start things with real intent and lose momentum when life gets busy.",
      "You want short, low-effort check-ins, not a daily obligation.",
      "You've been discouraged by streak trackers before.",
    ],
  },
  {
    slug: "making-a-difficult-decision",
    label: "Make a decision",
    situation: "Weighing a few options that all come with real tradeoffs.",
    longDescription:
      "Difficult decisions are rarely difficult because you don't have information. They're difficult because the information is in your head, unweighted, competing with itself. Putting what matters to you into a clear comparison, side by side, usually makes the actual choice a lot less complicated than it felt.",
    whatHelps: [
      "A way to lay out what matters to you and see the choice clearly.",
      "A structured comparison instead of a mental pros-and-cons list.",
      "A record of why you chose what you chose, in case you second-guess it later.",
    ],
    example: "A comparison that shows what you would actually be choosing.",
    whoThisIsFor: [
      "You're stuck between a small number of real options.",
      "You keep going back and forth because it's hard to hold everything at once.",
      "You want clarity, not someone to make the decision for you.",
    ],
  },
  {
    slug: "getting-back-on-track",
    label: "Get back on track",
    situation: "It has been weeks, and the plan you made feels out of date now.",
    longDescription:
      "The longer you're away from something, the harder it is to go back, because you imagine you'll have to face everything you missed at once. That's rarely necessary. Usually a handful of things changed and the rest is still fine. A way back in that starts with what changed, not what you failed to do, makes returning much easier.",
    whatHelps: [
      "A way back in that does not start with a wall of overdue tasks.",
      "A short review of what's actually changed since you were last here.",
      "One small step to restart with, not the whole plan at once.",
    ],
    example: "Update what changed, then continue from there.",
    whoThisIsFor: [
      "You stopped using something you cared about and feel behind now.",
      "You want to come back without explaining or justifying the gap.",
      "You'd rather take one small step than face a full plan again.",
    ],
  },
  {
    slug: "learning-step-by-step",
    label: "Learn step by step",
    situation: "A skill or process you want to learn without getting lost partway through.",
    longDescription:
      "Most learning attempts don't fail because the material is too hard. They fail because it's unclear what to do next, so momentum dies between sessions. One step at a time, with the next step always obvious, keeps you moving even on days you only have ten minutes.",
    whatHelps: [
      "One step at a time, with the next one always clear.",
      "A sense of where you are, without a syllabus to manage.",
      "The freedom to go slower or faster depending on the week.",
    ],
    example: "A single next lesson, not a full syllabus to plan around.",
    whoThisIsFor: [
      "You learn better in small, concrete steps than from a full curriculum upfront.",
      "You have inconsistent time to give it, and that's fine.",
      "You want to know what's next, not manage the whole plan yourself.",
    ],
  },
];

export function getNeedBySlug(slug: string): NeedContent | undefined {
  return NEEDS.find((need) => need.slug === slug);
}
