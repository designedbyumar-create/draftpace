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
  objections: [
    {
      worry: "Been burned by a homeschool planner you abandoned in October?",
      answer:
        "Most of them fail because they ask for a plan before they give you anything. This works from whatever you give it, including nothing: record what you actually did and it is already useful. There is no percentage, no streak, and no screen that tells you how far behind your own plan you are.",
    },
    {
      worry: "Worried it will tell you what your child should be learning?",
      answer:
        "It will not, and it is built so that it cannot. The printed book has no curriculum in it. The app organises what you are already teaching, and everything it ever suggests is labelled as a suggestion and is editable the moment you accept it.",
    },
    {
      worry: "Suspicious of anything that claims to assess your child?",
      answer:
        "So are we. A check here is eight questions you wrote or took from your own curriculum, marked by you, reported one topic at a time. Where there were fewer than four answers on a topic it says there is not enough to say anything, because there is not. It never produces a score and never says a word about your child.",
    },
    {
      worry: "Not sure where to start, at all?",
      answer:
        "Tell it your child's age, the subjects you want to cover and how many days a week you can actually school, and it puts together a starting outline: roughly how long each subject takes, how often, and a few topics to begin from. Every part of it is editable and it is labelled a starting point, not a curriculum.",
    },
    {
      worry: "Do you really need the app if you like paper?",
      answer:
        "No. The book works with a pencil and nothing else, and it is thirty pages you would buy on its own. The app does the part paper cannot: keeping three years of it, noticing what has not been checked in a while, and printing a record for one child on demand.",
    },
  ],
  outcomes: [
    "One page each morning that says what today looks like, per child, and says nothing on the days you are not schooling.",
    "A record of what you actually did, kept as it happened, that you could hand to somebody at the end of the year.",
    "The things you would otherwise forget: the day something finally landed, written in your own words, the day it happened.",
    "An honest answer about whether a topic stuck, including the answer that there is not enough evidence to say.",
    "A printed record per child, made on your own device, containing only what you chose to include.",
    "A thirty page book of method and working pages that keeps working whether or not you ever open the app.",
  ],
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
  ],
  howItWorks: [
    "Add a child. Name, age, how they are schooled. Three questions, and the age is only ever an age: no birth dates are stored anywhere in this product.",
    "Say whether you already follow a curriculum. If you do, name it and say where you are, in your own words, like Unit 3, Lesson 12. If you have your own plan, name your subjects instead. If you have no idea yet, it will put together a starting outline you can change or throw away.",
    "Set how often each subject runs. This is the only thing that decides what turns up each day, and zero days is allowed.",
    "Today shows what is scheduled, grouped by child, with where each thing came from: your curriculum, your plan, or a suggestion. Nothing scheduled means nothing shown.",
    "Mark something done in one tap. It will ask how it went, and skipping that changes nothing except that a difficult session comes back to be gone over again next time.",
    "Tick what each child is actually covering, from a list of curriculum-neutral topics. Five seconds, and it is the only thing that lets a check be about what they were really taught.",
    "Run a check when you want one. You supply the questions, from your own head, your curriculum's own tests, or the printed check sheets, and it keeps them for next time.",
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
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device. Nothing is ever deleted: records are archived rather than destroyed, because a child's educational history should not be one mis-tap from gone.",
  privacyNotes:
    "This product holds information about children, so it holds as little as it can. It stores an age and never a date of birth. A child's name is included in anything you print, because a record needs to say whose it is, and everything else starts out excluded until you say otherwise, one record at a time. Notes you keep private are never printed, whatever else you include. The printed record is generated in your own browser, so the assembled picture of your child's education never reaches a server. Nothing here is read by an AI model, and no model provider is involved anywhere in this product. Children do not have accounts and cannot sign in. Nothing here is legal advice: what records you are required to keep depends on where you live and is worth checking at the source.",
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, including the book, the same way every paid product on Draftpace works.",
    },
    {
      question: "Will it tell me what to teach?",
      answer:
        "No. It has no curriculum and no opinion about what any child should know. If you ask for a starting outline it will give you one, clearly labelled as a suggestion and editable in full, and you can ignore it forever.",
    },
    {
      question: "Can I use it with the curriculum I already have?",
      answer:
        "That is what it is for. Name it, say where you are, and everything from that point organises around it. It never restates your curriculum, checks it, or offers an opinion on it.",
    },
    {
      question: "Does it read my curriculum PDF?",
      answer:
        "No, and it does not pretend to. Naming it and typing where you are takes about thirty seconds and is more accurate than anything a machine would infer from a publisher's layout.",
    },
    {
      question: "How can it test my child if it has no lessons?",
      answer:
        "It does not test anybody. You supply the questions, from your own head, from your curriculum's own tests, or from the printed check sheets. What it supplies is the structure: which topics your child has been working with, how many answers are enough to say anything, and language that stays inside what eight questions can support.",
    },
    {
      question: "Will it tell me if my child is behind?",
      answer:
        "No, and it will not tell you they are ahead either. There is no single sequence to be measured against: four families in one street on four curricula are on four different ones. The only comparison it ever makes is with the same child, on the same topic, a few weeks earlier.",
    },
    {
      question: "How many children can I add?",
      answer:
        "As many as you teach. Each one has their own curriculum, subjects, plan, record and checks, and they are never shown mixed together. Today is the only screen where they appear on the same page, grouped separately.",
    },
    {
      question: "Do my children need accounts?",
      answer: "No. Children do not log in and cannot. You run everything, which is also why there is no consent flow to deal with.",
    },
    {
      question: "Is the book any good on its own?",
      answer:
        "It is meant to be. Thirty pages: six chapters of method, undated working pages you print all year, and photocopiable check sheets. If you never opened the app it would still be worth having.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your records save privately and follow you across devices.",
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
