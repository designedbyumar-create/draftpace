/**
 * The case study's writing, kept out of the page component so the copy can
 * be read and edited as copy rather than picked out of markup.
 *
 * WHAT THIS IS, AND WHAT IT IS NOT
 *
 * A product design case study, not a diary. The founder's own history
 * appears once, briefly, because it explains why this problem was worth
 * looking at. Everything after that is about the product: the problem, the
 * research, the thesis, the decisions, the system, and what is still
 * unproven.
 *
 * THE HONESTY RULE
 *
 * Three kinds of statement appear here and they are never allowed to blur
 * into each other: what was researched or observed before building, what
 * was decided and on what basis, and what has actually been checked with
 * people outside the project. The third is currently empty, and the page
 * says so plainly rather than leaving a reader to assume otherwise.
 */

export const INTRO = {
  eyebrow: "Product design case study",
  title: "Software that starts with your life, not the other way around.",
  standfirst:
    "How Draftpace became seven products built around real parts of life, instead of one interface stretched over all of them.",
  byline: "By Umar Malik, who designed and built it.",
  meta: [
    { label: "Role", value: "Founder, Product Designer & Creator." },
    { label: "Timeline", value: "May to September 2026" },
    { label: "Status", value: "MVP Live." },
    { label: "Scope", value: "Research, strategy, product design, UX writing, visual system, build" },
  ],
};

export const CONTEXT = {
  heading: "Context",
  body: [
    "Umar Malik is a Product Designer and Creator with six years of experience building software for complex, real-world problems, including work in education and products built around children, teachers and families.",
    "A medical break in 2026 gave him time away from client work, and a question that came with it: which problems were actually worth solving. What stayed interesting was never the interface. It was understanding a problem well enough to make it smaller. That question became Draftpace.",
  ],
};

export const PROBLEM = {
  eyebrow: "The problem",
  heading: "Managing real life is still in pieces",
  body: [
    "There is no shortage of software. Notes apps, spreadsheets, calendars, reminders, PDFs, cloud folders, messaging threads, bookmarks, dedicated apps, and memory. Most of them work fine on their own.",
    "The problem sits between them. A person becomes the one holding the whole thing together: remembering where something was saved, what needs to happen next, when something needs attention, which document belongs to which problem, and which app has which piece of it.",
  ],
  kicker: "None of these tools fail. The system built out of all of them does.",
  /** Labels for the scattered-tools figure. */
  scatter: ["Notes", "Spreadsheets", "Calendar", "Reminders", "PDFs", "Cloud folders", "Messages", "Bookmarks", "Memory"],
};

export const INSIGHT = {
  eyebrow: "The insight",
  heading: "Most software starts with the tool",
  body: [
    "Most software hands a person a structure first. Fields, folders, tasks, reminders, dashboards, templates. Then it asks them to translate their actual problem into whichever of those it happens to offer.",
    "Draftpace explores the opposite direction. Instead of starting with the software and asking a person to fit their life into it, what if the software started with how the problem already exists in someone's life, and built its structure around that?",
  ],
};

export const RESEARCH = {
  eyebrow: "Research",
  heading: "What the research actually looked like",
  body: [
    "Before building anything, the opportunity was researched directly. Reading listings and the reviews underneath them on the marketplaces where planners and templates are sold. Reading long threads where people describe what they bought and what happened to it a few weeks later. Going through competing products and the comments under them.",
    "Two things were true at once, and the tension between them is the whole opportunity. A large number of people were buying these products. A large number of them were quietly done with them within weeks.",
    "The disappointment had a shape. Upkeep became a second job. The product did not fit the specific situation the person actually had. And falling behind turned the thing into a record of failure, which is the point most people close it for good.",
  ],
  ledger: [
    { kind: "Observed", text: "The same three complaints repeating across reviews and long forum threads." },
    { kind: "Researched", text: "Listings, competing products, their sites, and what buyers said underneath them." },
    { kind: "Interpreted", text: "That the failure was structural, not a matter of the products being badly made." },
    { kind: "Hypothesised", text: "That a product which keeps the state of a problem would not fail the same way." },
  ],
  note: "This research happened before the product was designed, and it was not written up formally at the time. What is described here is reconstructed from the decisions it produced.",
};

export const FIRST_ANSWER = {
  eyebrow: "The first answer",
  heading: "Better documents were not enough",
  body: [
    "The first direction was to build better versions of what already existed. Carefully designed planners, templates and resources built around one specific situation instead of a blank grid to fill in yourself.",
    "That is a reasonable idea, and it still exists as its own effort under a separate name, WealthDrafts. Different problems deserve different solutions, and a document is an excellent answer to a problem with edges.",
    "But the problems worth caring about here did not have edges. Money does not finish. A house does not finish. The paperwork a family needs if something goes wrong does not finish. If the problem does not end, why should the product stop at download?",
  ],
};

export const THESIS = {
  quote: "Design around the problem. Not the software.",
  support:
    "Every Draftpace product holds the context of one part of a person's life, keeps what matters together, and says what needs attention without asking them to remember to check.",
};

export const COMPANION = {
  eyebrow: "The product model",
  heading: "A Companion is not an app with a different name",
  body: [
    "It is a focused environment built around one area of life, where the structure of the product comes from the structure of the problem.",
  ],
  examples: [
    {
      area: "Home",
      instead: "Instead of a generic list of tasks and reminders",
      real: "Home Base holds the actual things in a house, the record of what has been done to them, and the problems that come up, then says what is genuinely worth taking care of now.",
    },
    {
      area: "Money",
      instead: "Instead of a budgeting grid to fill in",
      real: "Monthly Money Reset and Personal Finance Companion hold the ongoing shape of someone's money: what is coming in, what is already committed, and what is actually safe to spend.",
    },
    {
      area: "Travel",
      instead: "Instead of a checklist that does not know what is on it",
      real: "Travel Companion holds the real shape of a trip, so when one thing moves, it can show what else was built on top of it.",
    },
  ],
};

export const SHELF = {
  eyebrow: "The seven",
  heading: "Seven problems, one way of thinking",
  body: [
    "Seven different problems, not seven versions of the same app. The question behind building more than one was simple: if different parts of life have genuinely different problems, should they share one generic productivity screen?",
    "The answer here was no. Each product is built to feel native to the problem it solves, rather than a shared template stretched over it.",
  ],
};

export const SYSTEM = {
  eyebrow: "The system",
  heading: "One foundation underneath different products",
  body: [
    "Each product looks and behaves differently on purpose. Underneath, they share one foundation: how someone signs in and owns something, the shell around every product, the set of places every product has in common, and one set of colours, spacing and type with room for each product's own character on top.",
    "None of that was planned upfront in full. It came from repetition. By the sixth product, a pattern that had already been built twice was pulled out into one shared version rather than copied a third time. That is what let the later products get built faster than the earlier ones.",
  ],
  flow: [
    "Different problems",
    "Different product experiences",
    "Shared design principles",
    "Shared interaction patterns",
    "One shared foundation",
    "One shelf that holds together",
  ],
};

export const PROCESS = {
  eyebrow: "Process",
  heading: "The process that actually happened",
  body: [
    "There were no wireframes and no research repository kept along the way. The work ran as a loop, and the running product was the thing being reviewed & tested at every turn.",
  ],
  steps: [
    { name: "Understand", text: "The problem, and what people already use for it." },
    { name: "Define", text: "The thesis, the scope, the constraints, the edges." },
    { name: "Build", text: "The real experience, not a picture of it." },
    { name: "Use and review", text: "Live with the working product and find what is wrong." },
    { name: "Challenge", text: "Ask whether the structure still matches the real problem." },
    { name: "Change", text: "Redesign, remove, simplify, restructure." },
    { name: "Repeat", text: "Turn what keeps working into a shared pattern." },
  ],
  kicker: "The product itself became part of the design process.",
};

export interface Decision {
  title: string;
  context: string;
  problem: string;
  options: string;
  decision: string;
  result: string;
}

export const DECISIONS: Decision[] = [
  {
    title: "Killing the first version",
    context:
      "A working version of the original idea already existed: a storefront, a catalogue, a checkout, marketing pages, live as a coming soon page.",
    problem: "It was built around a direction that no longer matched what the research said the opportunity was.",
    options: "Keep the working code and steer it somewhere new, or delete it and rebuild against the new thesis.",
    decision:
      "Delete it. Nothing was kept for the reason that it already existed. The pieces that were not tied to the old direction were relocated rather than rewritten.",
    result: "Slower for one week and faster for every week after, because the rebuild had nothing to work around.",
  },
  {
    title: "From a document to a Companion",
    context: "The first business idea was better planners and templates, sold once and downloaded.",
    problem: "A document cannot follow a problem that keeps going. It can be forgotten, and it cannot tell anyone anything.",
    options: "Make even better documents, or build something that keeps the state of a problem over time.",
    decision:
      "Split them. Focused, bounded problems stayed with documents under WealthDrafts. Ongoing problems became Companions under Draftpace.",
    result: "Two different answers for two genuinely different kinds of problem, instead of one answer stretched over both.",
  },
  {
    title: "Seven products instead of one",
    context: "One product with a shared foundation underneath it proves nothing, because there is nothing to compare it against.",
    problem: "Would the same foundation hold up across parts of life with almost nothing in common?",
    options: "Build one product properly and assume the foundation works, or build across enough areas to find out.",
    decision: "Build across six areas of life on purpose, as a test of the foundation rather than a bet on seven ideas.",
    result: "It held. The later products took less time to build than the earlier ones, which is the only honest measure of it.",
  },
  {
    title: "The taxonomy that did not survive contact",
    context: "Products were originally sorted by the kind of need they served, a set of categories written before most of them existed.",
    problem: "Once there were seven products, six of them fell into a single category and three categories were empty.",
    options: "Keep the categories and force the products into them, or rebuild the categories around what had actually been built.",
    decision: "Sort by area of life instead of by abstract need, which is also how somebody describes their own problem out loud.",
    result: "A shop and a homepage that sort the way a visitor already thinks, rather than the way an early plan did.",
  },
  {
    title: "What the homepage leads with",
    context:
      "The homepage opened with the argument that a Draftpace product outlasts a downloaded file, and spent three sections making it.",
    problem:
      "That argument was right when the shelf held one product. With seven, it measured the work against a file rather than a real competitor, it was a claim any software can make, and it pushed the actual products most of the way down the page.",
    options: "Sharpen the format argument, or drop it and lead with what the products are for.",
    decision: "Cut it from the top of the page and lead with the six areas of life. The file argument survives as one supporting line further down.",
    result: "The single best-written passage on the site was demoted on purpose, because being well written is not the same as being the right thing to say first.",
  },
  {
    title: "Living products gave way to Companions",
    context:
      "The founding strategy document locked living product as the core idea and explicitly demoted the word Companion to something narrower.",
    problem:
      "In practice, Companion was the word that explained the product to a person seeing it for the first time. Living product needed a paragraph of setup before it meant anything at all.",
    options: "Keep pushing the locked word, or let the one that was already working take the lead.",
    decision: "Companion became the name on the page. Living stayed as the idea underneath it rather than the label on top.",
    result: "The Companion Series, as it exists today, named against the project's own founding document.",
  },
];

export const REPOSITION = {
  eyebrow: "Before and after",
  heading: "The repositioning, in the order of the page itself",
  body: [
    "The clearest way to see this decision is not in the words. It is in where the products sat on the page.",
  ],
  before: {
    label: "Before",
    provenance: "Commit 693c59b, 25 August 2026",
    eyebrow: "Products that keep up with you",
    headline: "A studio for living products.",
    sections: [
      "Hero",
      "The graveyard",
      "What makes a product alive",
      "Living is a spectrum",
      "The shelf",
      "Owned, not rented",
      "Trust",
      "Closing",
    ],
    productsAt: 5,
  },
  after: {
    label: "After",
    provenance: "Commit babf966 onward, 30 August 2026",
    eyebrow: "The Companion Series",
    headline: "For the parts of life that are hard to keep track of.",
    sections: [
      "Hero, with the products in it",
      "The difference, made touchable",
      "How these behave",
      "The series",
      "Owned, not rented",
      "Trust",
      "Closing",
    ],
    productsAt: 1,
  },
  reason:
    "Three of the first four sections were arguing about file formats. The products themselves were the fifth thing a visitor met. Moving them to the first thing meant cutting the writing the site was proudest of.",
};

export interface DeepDive {
  slug: string;
  name: string;
  area: string;
  problem: string;
  existing: string;
  thesis: string;
  response: string;
  keyDecision: string;
  result: string;
}

export const DEEP_DIVES: DeepDive[] = [
  {
    slug: "home-management-companion",
    name: "Home Base",
    area: "Home",
    problem:
      "A house generates small, ongoing responsibilities that have nowhere to live. When the filter was last changed. Who serviced the boiler. The model number behind the fridge. What is quietly about to need attention.",
    existing:
      "Most people split this across a notes app, a drawer of manuals, their own memory, and finding out only once something has already broken.",
    thesis:
      "A home is not a task list. It is a set of real things, each with its own history and its own rhythm, plus the occasional problem that fits neither.",
    response:
      "Home Base is built around the things in a home, the record of what has happened to each of them, and the problems currently open, all surfaced through one view that says what is worth taking care of now.",
    keyDecision:
      "The first version was a straightforward appliance and maintenance tracker. It worked, and it had no character. It was rebuilt around how somebody actually talks about their house, including letting them describe what is wrong in their own words instead of choosing from a list of categories.",
    result:
      "A product that knows a dishwasher is not a washing machine, and can raise the right thing at the right time because it understands what it is looking at.",
  },
  {
    slug: "personal-finance-companion",
    name: "Personal Finance Companion",
    area: "Money",
    problem:
      "Money is not one question. It is accounts, income, bills, subscriptions, debts and savings, all moving at once, and the only question that matters is what is actually safe to spend right now.",
    existing:
      "People check several banking apps, hold the rest in their head, and find out they were wrong when something comes out that they had forgotten was coming.",
    thesis:
      "The work is not data entry. It is arriving at one number a person can trust, and being able to show exactly what it is made of.",
    response:
      "One dominant figure for available money, with the full breakdown one tap away, and a single next move whenever something needs attention rather than a dashboard to interpret.",
    keyDecision:
      "The workspace was redesigned around one dominant next action and a real attention list, rather than showing everything the product knew at once. Importing was made exception-first, so a person reviews what looks wrong instead of reading a flat list of everything they just imported.",
    result:
      "The most structurally complex product on the shelf, and the one that best demonstrates ongoing management rather than one-time setup.",
  },
  {
    slug: "travel-companion",
    name: "Travel Companion",
    area: "Travel",
    problem:
      "A trip is a chain of things that depend on each other. The transfer depends on the flight. The check-in depends on the transfer. When one moves, several others quietly become wrong.",
    existing:
      "A folder of confirmation emails, a checklist that does not know what is on it, and a person mentally re-deriving the whole chain every time something changes.",
    thesis:
      "The valuable thing is not storing the bookings. It is knowing what else moves when one thing moves.",
    response:
      "The trip is held as a set of connected things. Record that a flight changed, and the product walks through what was built on top of it, one item at a time, and leaves alone the dinner reservation that depended on nothing.",
    keyDecision:
      "It never edits anything on the person's behalf. The walk is downward only and changes nothing by itself, because a product that silently rearranges a trip is worse than one that does nothing.",
    result:
      "The clearest demonstration of the whole thesis: a product whose structure is the structure of the problem.",
  },
];

export const DIFFERENT = {
  eyebrow: "The difference",
  heading: "Where it starts is the difference",
  body: [
    "Most software starts with the tool. Tasks, notes, a database, a calendar, a dashboard. The person has to translate their actual situation into whichever of those they were handed.",
    "Draftpace starts at the other end, with the part of life the problem lives in. Home. Money. Travel. Learning. What somebody leaves behind for the people who have to sort it out. The structure of each product follows from there.",
    "That is the claim being tested, and it is one the products still have to earn in real use rather than in a design decision.",
  ],
  comparison: [
    { approach: "Generic productivity software", startsWith: "The tool" },
    { approach: "A system built by hand from notes, sheets and memory", startsWith: "Whatever is to hand" },
    { approach: "Planners and templates", startsWith: "A template" },
    { approach: "Chat-based assistants", startsWith: "A conversation" },
    { approach: "Draftpace", startsWith: "The problem itself" },
  ],
  caveat:
    "The point is not that Draftpace beats everything on this list. Several of them are very good at what they do. The point is that it starts somewhere else.",
};

export const HELD_UP = {
  eyebrow: "Assessment",
  heading: "What held up",
  items: [
    {
      head: "Starting from the problem rather than the interface",
      text: "Home Base did not get its shape from a task list template. It got it from what a house actually needs.",
    },
    {
      head: "Being willing to delete finished work",
      text: "The first version of Draftpace was working software, and it was deleted the day it stopped matching the thesis.",
    },
    {
      head: "Testing the foundation with variety, not with faith",
      text: "Six unrelated areas of life were built on purpose, to find out whether one foundation would hold rather than assume it.",
    },
    {
      head: "Designing against the real thing",
      text: "Every structural decision here was corrected after using the built product, not after looking at a drawing of it.",
    },
    {
      head: "Consistency without sameness",
      text: "Seven products share one shell and one set of rules, and none of them reads as a reskin of another.",
    },
  ],
};

export const UNPROVEN = {
  eyebrow: "Assessment",
  heading: "What is still only a hypothesis",
  items: [
    {
      head: "Nobody outside this project has used it",
      text: "No usability testing, no interviews, no customers. The buyers described in the project's own documents are reasoned constructions, not people who were spoken to.",
    },
    {
      head: "The price is a starting number",
      text: "Products sit at eighteen or twenty eight dollars, set from a sense of the depth of each one and the surrounding market. There was no pricing research and no willingness to pay testing.",
    },
    {
      head: "Nobody knows which of the seven matters most",
      text: "The shelf was built to test a foundation. It was not built on evidence about which area of life has the strongest demand.",
    },
    {
      head: "Returning is the whole bet, and it is untested",
      text: "The entire model rests on people coming back to a product over months. That is exactly the thing that cannot be proven without real users.",
    },
  ],
  kicker:
    "The MVP answers the product design questions. The market still has to answer the business ones.",
};

export const STATS = {
  eyebrow: "Scope",
  heading: "By the numbers",
  note: "Counted from the project's own history rather than estimated.",
  items: [
    { value: "7", label: "products, across six areas of life" },
    { value: "14", label: "weeks from first commit to frozen MVP" },
    { value: "180", label: "design tokens in one shared set" },
    { value: "14", label: "shared interface primitives" },
    { value: "1,937", label: "automated checks on every change" },
    { value: "76", label: "pages across the site and products" },
  ],
};

export const NEXT = {
  eyebrow: "Next",
  heading: "Time to find out whether anyone wants it",
  body: [
    "The next phase is not more features. It is putting Draftpace in front of people who had nothing to do with building it, and watching what actually happens.",
    "What do they use. What do they ignore. What do they come back to without being reminded. Where does it get in the way. Which of the seven pulls the most interest. And whether anybody is willing to pay for it.",
    "Whatever gets designed next should come from that, rather than from another round of good reasoning.",
  ],
};

export const CLOSING = {
  quote:
    "Draftpace is an ongoing exploration of what software looks like when it starts from the reality of the person using it, rather than from the interface, the feature list, or the productivity system.",
  lines: ["Design around the problem.", "Build around real life.", "Let the software follow."],
  byline: "Umar Malik. Product Designer and Creator.",
};
