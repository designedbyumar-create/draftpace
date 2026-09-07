import type { ShopProductInput } from "../definition";

/**
 * The Homeschooling Companion's real public Shop listing, same "creating
 * this file is the release gate" pattern as its three siblings.
 *
 * THE CLAIM THIS LISTING IS BUILT ON
 *
 * Two halves, either of which would be worth buying alone. A 30 page
 * printed book and an app that does the remembering. Every other listing
 * in this category sells a curriculum, and this one has to say clearly
 * and early that it is not one, because the parents most likely to buy
 * it already have a curriculum they chose on purpose.
 *
 * WORDS THAT NEVER APPEAR
 *
 * "Behind", "ahead", "grade level", "proficient" and "on track". A
 * homeschooling parent is already anxious about every one of them, and a
 * sales page that uses the vocabulary of comparison has taken a side
 * against the person reading it. Enforced by test, same as "estate" and
 * "assets" on the Personal Life Affairs Companion's listing.
 *
 * NOT CLAIMED, BECAUSE NOT BUILT: reminders, notifications, curriculum
 * import, and any suggestion that Draftpace supplies lesson content.
 *
 * $18 launch price, $23 regular. The first of the seven paid products
 * to get a real price, see the pricing plan's Phase 1.
 */
export const homeschoolingCompanionShopProduct: ShopProductInput = {
  id: "homeschooling-companion",
  slug: "homeschooling-companion",
  publicationStatus: "published",
  title: "Homeschooling Companion",
  promise:
    "A printed handbook and an app that remembers. You decide what your children learn; this keeps track of what you actually did, tells you the next useful thing, and helps you check whether it landed.",
  problem:
    "The teaching is not usually the hard part. The hard part is that by March you cannot remember what you covered in October, you are not sure the fractions ever stuck, and if somebody asked you to account for the year you would be reconstructing it from memory and a pile of undated worksheets. Most homeschool record keeping fails in one of two directions: nothing at all, or a system so heavy it is abandoned by half term.",
  audience: [
    "You already have a curriculum you chose on purpose and you want something that follows it rather than replacing it.",
    "You teach more than one child and keeping their records separate in your head has stopped working.",
    "You want to know whether something landed, without turning your kitchen table into an exam hall.",
    "You would rather write on paper some weeks and tap a screen on others, and have both count.",
  ],
  audienceExclusions: [
    "You want a curriculum. This is not one and never becomes one. It has no lessons, no scheme of work, and no opinion about what your child should know.",
    "You want lesson content, worksheets, or a subject library. Deeper subject material is a separate thing that does not exist yet.",
    "You want your curriculum PDF read and turned into a plan automatically. Nothing here parses a document. You type the name and where you are, which takes about thirty seconds.",
    "You want your children to log in and do work themselves. The parent runs everything; children have no accounts.",
    "You want standardised testing, or anything that reports your child against a year group or a national expectation. It refuses to do that on purpose.",
  ],
  // Emptied by the content collapse: four of these five were answered a
  // second time in faqs, and the Shop page rendered both. All of them
  // now live in `questions`, answered once each and tagged with the
  // moment they matter.
  objections: [],
  // Emptied by the content collapse: four of these six restated a
  // problemsSolved solution nearly word for word. The two that said
  // something new are now paired with the problem they answer.
  outcomes: [],
  problemsSolved: [
    {
      problem: "By March you can't remember what you covered in October.",
      solution: "A record of what you actually did, kept as it happened, that you could hand to somebody at year's end.",
    },
    {
      problem: "You're not sure whether something actually landed.",
      solution: "An honest answer about whether a topic stuck, including the honest answer that there isn't enough evidence to say.",
    },
    {
      problem: "Keeping more than one child's records straight in your head has stopped working.",
      solution: "One page each morning that says what today looks like, per child.",
    },
    {
      problem: "You need something to show, not a system so heavy it gets abandoned by half term.",
      solution: "A printed record per child, containing only what you chose to include.",
    },
    {
      problem: "You don't know what your state actually asks you to keep, or whether you have it.",
      solution:
        "Your state's record keeping requirements set beside what you have recorded, on the printed record, so you can see the gap before somebody else does.",
    },
    {
      problem: "You would rather work on paper some weeks and on a screen on others.",
      solution:
        "A thirty page book of method and working pages that keeps working with a pencil, whether or not you ever open the app.",
    },
  ],
  howItWorks: [
    "Add a child. Name, age, how they are schooled. Three questions, and the age is only ever an age: no birth dates are stored anywhere in this product.",
    "Say whether you already follow a curriculum. If you do, name it and say where you are, in your own words, like Unit 3, Lesson 12. If you have your own plan, name your subjects instead. If you have no idea yet, it will put together a starting outline you can change or throw away.",
    "Set how often each subject runs. This is the only thing that decides what turns up each day, and zero days is allowed.",
    "Today shows what is scheduled, grouped by child, with where each thing came from: your curriculum, your plan, or a suggestion. Nothing scheduled means nothing shown.",
    "Mark something done in one tap. It will ask how it went, and skipping that changes nothing except that a difficult session comes back to be gone over again next time.",
    "Tick what each child is actually covering, from a list of curriculum-neutral topics. Five seconds, and it is the only thing that lets a check be about what they were really taught.",
    "Run a check when you want one. You supply the questions, from your own head, your curriculum's own tests, or the printed check sheets, and it keeps them for next time.",
    "Name the state you homeschool in and the printed record carries what that state asks you to keep, each line set against what you have actually recorded.",
    "Print the record whenever somebody needs it, or nobody does.",
  ],
  access: "paid",
  // Launch pricing, Phase 1 of the pricing plan: $19 actual, marked up
  // 20% to a $23 regular price, then a net 20% off (30% off, netted
  // down by 10 points) for the $18 this actually charges today. See
  // src/shop/definition.ts for the invariant that keeps compareAtPrice
  // honest: it is refused unless it is genuinely higher than price.
  price: { amount: 18, currency: "USD" },
  compareAtPrice: { amount: 23, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "The Homeschool Year: a 30 page printed book in US Letter and A4, yours to keep and print as often as you like",
    "Six chapters of method: running a week that survives a bad day, what to record, records somebody may ask for, telling whether something landed, and what to change first when a subject stops moving",
    "Undated working pages: year planner, weekly plan with a spare day built in, daily log, subject record, reading log, and a days schooled sheet",
    "Six printable check sheets of eight questions each, plus a blank, with the answer key kept at the back where the child cannot read it",
    "The app: unlimited children, each with their own curriculum, subjects, plan, record and checks, never mixed together",
    "A starting outline for anybody who wants one, built from your own answers and editable in full",
    "A curriculum-neutral list of 71 topics, so a check can be about what your child was actually taught",
    "My Homeschool Record: a printable record per child, generated on your own device",
    "Your state's record keeping requirements, set line by line against what you have recorded, on the printed record",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "Each child's name, age, and how they are schooled",
    "What you are teaching: a curriculum name and where you are in it, or simply your subjects",
    "One tap a day per subject, and a word about how it went if you feel like it",
    "Your own questions, when you want to check something",
  ],
  expectedOutputs: [
    "What to do today, per child, with where each thing came from",
    "A dated record of what was actually done",
    "Per topic results from a check, including where there was not enough to say anything",
    "A printable record for one child, and a 30 page book you keep",
    "What your state asks you to keep, beside what you have got",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device. Nothing is ever deleted: records are archived rather than destroyed, because a child's educational history should not be one mis-tap from gone.",
  privacyNotes:
    "This product holds information about children, so it holds as little as it can. It stores an age and never a date of birth. A child's name is included in anything you print, because a record needs to say whose it is, and everything else starts out excluded until you say otherwise, one record at a time. Notes you keep private are never printed, whatever else you include. The printed record is generated in your own browser, so the assembled picture of your child's education never reaches a server. Nothing here is read by an AI model, and no model provider is involved anywhere in this product. Children do not have accounts and cannot sign in. Nothing here is legal advice: what records you are required to keep depends on where you live and is worth checking at the source.",
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters. Five
   * objections and ten faqs collapsed to eleven questions: "will it tell
   * you what your child should be learning" and "will it tell me what to
   * teach" were the same question twice, as were the assessment pair and
   * the "is the book any good on its own" pair.
   */
  questions: [
    {
      question: "Been burned by a homeschool planner you abandoned in October?",
      answer:
        "Most fail because they ask for a plan before they give you anything. This works from whatever you give it, including nothing: record what you actually did and it is already useful. No percentage, no streak, and no screen measuring you against your own plan.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Will it tell me what to teach?",
      answer:
        "No, and it is built so that it cannot. The printed book has no curriculum in it and the app organises what you are already teaching. If you ask for a starting outline you get one, labelled a suggestion, editable in full, and ignorable forever.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Can I use it with the curriculum I already have?",
      answer:
        "That is what it is for. Name it, say where you are in your own words, and everything organises around that. It never restates your curriculum, checks it, or offers an opinion on it.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it read my curriculum PDF?",
      answer:
        "No, and it does not pretend to. Naming it and typing where you are takes about thirty seconds and is more accurate than anything a machine would infer from a publisher's layout.",
      stage: ["deciding"],
    },
    {
      question: "How can it check my child if it has no lessons?",
      answer:
        "It does not test anybody. You supply the questions, from your own head, your curriculum's own tests, or the printed check sheets, and you mark them. What it supplies is the structure: which topics your child has been working with, how many answers are enough to say anything, and where there are fewer than four it says there is not enough to say. It never produces a score.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Will it compare my child against a year group?",
      answer:
        "No, and it refuses to on purpose. There is no single sequence to measure against: four families on one street with four curricula are on four different ones. The only comparison it ever makes is the same child, on the same topic, a few weeks earlier.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it know what my state requires me to keep?",
      answer:
        "It carries a broad regulation level and a one-line summary for every US jurisdiction, and for the states that ask for more it sets each requirement against what you have recorded on your printed record. It is a summary, not a citation, and laws change: worth checking at the source.",
      stage: ["deciding", "owning"],
    },
    {
      question: "How many children can I add?",
      answer:
        "As many as you teach. Each has their own curriculum, subjects, plan, record and checks, never mixed together. Today is the only screen where they share a page, grouped separately.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Do my children need accounts?",
      answer:
        "No, and they cannot have one. You run everything, which is also why there is no consent flow to deal with. It stores an age, never a date of birth.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is the book worth having on its own, without the app?",
      answer:
        "It is meant to be. Thirty pages: six chapters of method, undated working pages you print all year, and photocopiable check sheets. It works with a pencil and nothing else. The app does the part paper cannot: keeping three years of it and printing a record on demand.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this a one-time purchase, and do I need an account?",
      answer:
        "One time, including the book, and yes. A Draftpace account is what keeps your records private and available wherever you next sign in.",
      stage: ["deciding"],
    },
  ],

  /**
   * How people describe this before they know a product like this exists.
   * Sourced, not invented: the homeschooling questions already answered
   * in src/content/askdp.ts and the titles of homeschool guides written
   * from the same research.
   */
  searchedProblems: [
    {
      phrase: "What homeschool records am I actually required to keep",
      answer:
        "Name your state and the printed record carries what it asks for, each line set against what you have already recorded.",
    },
    {
      phrase: "I have not kept any records and need to catch up",
      answer:
        "It works from whatever you give it. Record what you did, when you can remember it, and the record builds from there rather than demanding a full year up front.",
    },
    {
      phrase: "How do I know if my child actually learned something",
      answer:
        "A check of eight questions you supply and mark, reported one topic at a time, including the honest answer that there is not enough to say.",
    },
    {
      phrase: "What goes in a homeschool portfolio",
      answer:
        "A dated record of what was done, notes in your own words about the day something landed, and check results per topic. You choose what is included before it prints.",
    },
    {
      phrase: "I need to prepare for a homeschool evaluation",
      answer:
        "Print the record for one child. It contains only what you chose to include, and it says what is in it rather than how it is going.",
    },
    {
      phrase: "Homeschool planners are too heavy and I always quit",
      answer:
        "One tap a day per subject is the whole obligation. There is no plan to fall behind on because nothing here scores you against one.",
    },
  ],

  /**
   * What an owner opens the manual to do, each row linking to the screen
   * it happens on.
   */
  tasks: [
    {
      label: "See what today looks like",
      answer: "Today shows what is scheduled per child, with where each thing came from. Nothing scheduled means nothing shown.",
      destination: "workspace",
    },
    {
      label: "Add a child",
      answer: "Name, age and how they are schooled. Three questions, and the age is only ever an age.",
      destination: "kids",
    },
    {
      label: "Record what we actually did",
      answer: "One tap marks a subject done. It asks how it went, and skipping that changes nothing.",
      destination: "workspace",
    },
    {
      label: "Check whether a topic stuck",
      answer: "You supply eight questions and mark them. Results come back per topic, and it keeps the questions for next time.",
      destination: "record",
    },
    {
      label: "Print the record for one child",
      answer: "Generated on your own device, containing only what you chose to include. Private notes are never printed.",
      destination: "record",
    },
    {
      label: "Find out what my state asks for",
      answer: "Set your state once. The record then shows each requirement beside what you have recorded against it.",
      destination: "settings",
    },
  ],

  relatedGuideSlugs: [],
  relatedProductSlugs: ["personal-life-affairs-companion", "home-management-companion"],
  needGroups: ["getting-organized"],
  seo: {
    title: "Homeschooling Companion: keep track of what you actually taught",
    description:
      "A printed handbook and an app that remembers. You decide what your children learn; this keeps track of what you actually did, tells you the next useful thing, and helps you check whether it landed.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
