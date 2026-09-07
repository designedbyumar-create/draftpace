import type { ShopProductInput } from "../definition";

/**
 * The Personal Life Affairs Companion's real public Shop listing, same
 * "creating this file is the release gate" pattern as its two siblings.
 *
 * Every claim below maps to something built and live. The counts are
 * real: 46 steps across eight areas, 38 of them capturing an answer,
 * 105 questions in total, 41 that come back for a second look, nine
 * handoff scenarios, nine life events, eight questions at the start.
 * (Each was one lower until the proof-of-authority step was added under
 * paperwork; re-derive them from AFFAIR_STEPS and CAPTURE_SPECS rather
 * than trusting this comment if you change either.)
 *
 * THREE WORDS ARE ABSENT ON PURPOSE.
 *
 * "Estate" and "assets", because 40% of people without a will say they
 * do not have enough to need one, and that vocabulary confirms the
 * belief and loses them. "Overdue", the house rule inherited from Home
 * Base, because nobody here is failing at anything.
 *
 * NOT CLAIMED, BECAUSE NOT BUILT: reminders. The product's definition
 * declares notifications: { supported: false }, and a listing that
 * promises to reach somebody when the app is closed would be selling a
 * thing that does not exist. Home Base's listing claims reminders
 * because Home Base has an evaluator and a cron job. This one does not.
 *
 * $28 launch price, $35 regular. The third of the seven paid products
 * to get a real price, see the pricing plan's Phase 3. GetAction still
 * renders "Checkout opens soon" until LEMON_SQUEEZY_PLA_CHECKOUT_URL is
 * set, which this phase deliberately leaves alone.
 */
export const personalLifeAffairsCompanionShopProduct: ShopProductInput = {
  id: "personal-life-affairs-companion",
  slug: "personal-life-affairs-companion",
  publicationStatus: "published",
  title: "Personal Life Affairs Companion",
  promise:
    "Everything the people you love would need to find, in one place and kept current. It tells you the one next step, skips whatever does not apply to you, and prints a book you can hand over when you are ready.",
  problem:
    "Almost everybody means to get this done. Where the will is. Who to call. Which pension is with whom. The reason it never happens is not that people are careless: it is that nobody knows what the list is, so the job has no beginning, and a folder of blank forms is exactly the thing nobody starts. Meanwhile the form naming who receives a pension quietly overrides a will, and it is usually the one filled in on somebody's first day at a job they left years ago.",
  audience: [
    "You have been meaning to sort this out for a while and have never found a first step small enough to take.",
    "You would rather be asked one question at a time than handed a folder and told to fill it in.",
    "You want the answers to still be right in ten years, not just written down once and quietly forgotten.",
    "You want something you can actually print and hand to somebody, not a login they would have to inherit.",
  ],
  audienceExclusions: [
    "You want somewhere to keep passwords, account numbers or scans of documents. This is deliberately not a vault. It records what exists, where it is, and who knows about it, and never the thing itself.",
    "You want a legal will drafted. It records whether you have one and where it is kept. Where a solicitor is genuinely the answer, it says so plainly instead of pretending otherwise.",
    "You want a shared account so a partner or a sibling can see and edit the same records. It is single-account for now.",
    "You want it to read your paperwork for you. Everything here is entered by you, on purpose. There is no upload, no scanning, and no AI reading anything.",
  ],
  // Emptied by the content collapse: every objection was answered a
  // second time in faqs, and the Shop page rendered both a few hundred
  // pixels apart. All of them now live in `questions`, answered once
  // each and tagged with the moment they matter.
  objections: [],
  // Emptied by the content collapse: four of these six restated a
  // problemsSolved solution nearly word for word. The two that said
  // something new are now paired with the problem they answer.
  outcomes: [],
  problemsSolved: [
    {
      problem: "You've meant to sort this out for years and never found a first step small enough to take.",
      solution: "One question on screen at a time, chosen for you, instead of a blank folder to organise yourself.",
    },
    {
      problem: "You don't actually know what costs the most to leave undone.",
      solution:
        "The things that cost the most raised first: who decides, who to call, where the will is, who's named on the forms that override it.",
    },
    {
      problem: "Things written down once quietly stop being true.",
      solution: "A record that comes back years later and asks whether it's still true.",
    },
    {
      problem: "You want something a person could actually use, not a login they'd have to inherit.",
      solution:
        "My Affairs: a printable book, in your own words, opening with what somebody would be trying to do first, that a person who has never used this could pick up and use.",
    },
    {
      problem: "Half of what a binder makes you fill in has nothing to do with your life.",
      solution: "Everything that does not apply to you is absent entirely, rather than printed and crossed through.",
    },
    {
      problem: "You have no idea whether another person could actually manage if they had to.",
      solution:
        "A handoff check, scenario by scenario, that answers by what somebody would be trying to do rather than by how much you have finished.",
    },
  ],
  howItWorks: [
    "Eight short questions about your situation. Children, a partner, a pension, whether you own or rent, life cover, anyone who depends on you, pets, a business. They decide what you will and will not be asked about, permanently.",
    "Then one thing at a time. The step you are shown is the one whose absence would cost the people around you most, with an honest estimate of how long it takes and a sentence on why it matters.",
    "It asks rather than presenting a form. Who should someone contact first, what they are to you, how to reach them, anything they should know. Four questions at most, usually fewer, and you can skip or stop at any point.",
    "Your answer becomes a record, in your words. Not a tick against a task: the actual name, the actual place, the actual instruction.",
    "Not sure yet? Say so. It is kept as its own answer, not filed as a no, and it will come back later without nagging you about it.",
    "Years later, entries that have been standing a long time come back as a question rather than a task you failed to do. Still true, or update it.",
    "Something changed? Tell it you moved, separated, had a child, changed jobs. It works out what that could have made untrue and brings those back one at a time.",
    "Print whenever you like. Never at 100%, never gated: a blank copy with only your relevant sections and room to write, or the current book with everything you have established. Either one opens on what somebody would be trying to do first.",
  ],
  access: "paid",
  // Launch pricing, Phase 3 of the pricing plan: $29 actual, marked up
  // 20% to a $35 regular price, then a net 20% off (30% off, netted
  // down by 10 points) for the $28 this actually charges today.
  price: { amount: 28, currency: "USD" },
  compareAtPrice: { amount: 35, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "A hand-built list of 46 things that belong in order, across eight areas: people, important documents, money, home, pets and dependants, digital life, business, and important instructions",
    "105 questions written to be answered in a sentence, asked one at a time and only where they apply to you",
    "Personalisation from eight questions, so a simpler life is a genuinely shorter product and not a longer one with parts greyed out",
    "Forty-one entries that come back for a second look on their own, each on its own interval rather than on one schedule for everything",
    "Where your executor stands on proving their authority, so nobody finds out at a bank counter that a name on a form is not enough",
    "Nine life events, from moving to separating to a named person dying, each bringing forward only what it could actually have made untrue",
    "My Affairs: a printable book in US Letter and A4, generated on your own device, in two forms, blank to fill in by hand or current with everything you have recorded",
    "The book opens on \"if you need to\": what somebody would actually be trying to do, most urgent first, rather than a contents page they have to translate",
    "A handoff check that asks whether somebody else could manage, by what they would be trying to do rather than by how much you have finished",
    "A record of every change, so when something is no longer true you can still see what it used to say",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "Eight yes or no answers about your situation, at the start",
    "Names, in your own words: who to contact, who decides, who has a key",
    "Where things are kept, described the way you would say it out loud rather than as a filing reference",
    "Anything somebody would need to know, in a sentence, wherever you want to add one",
  ],
  expectedOutputs: [
    "One next step at a time, with why it matters and roughly how long it takes",
    "A current picture of what has been established about your affairs, by area",
    "My Affairs, a printable book somebody who has never used this could pick up and use",
    "A record of what changed, and when, and what it said before",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so it is there if you come back on something else. Nothing is ever deleted: entries you retire are kept and marked, so the history behind them survives.",
  privacyNotes:
    "Your records are private to your account. Draftpace does not sell your data or use it for advertising, and nothing here is read by an AI model. This is deliberately not a vault: it never stores a password, an account number, a security answer, or an uploaded document, and where your instinct would be to write one down it asks where the access instructions are kept instead. The printed book is generated in your own browser, so the assembled picture of your affairs never reaches a server. Nothing here is legal advice, and where a solicitor or a specialist is genuinely the answer the product says so rather than standing in for one.",
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters. Five
   * objections and nine faqs collapsed to nine questions: "is this a
   * death product" and "is this only about what happens after somebody
   * dies" were the same question twice, as were the vault pair and the
   * "will it be out of date" pair.
   */
  questions: [
    {
      question: "Is this only about what happens after somebody dies?",
      answer:
        "No, and most of it is not. Who can speak for you about medical care, who has a spare key, who would collect the children on a Tuesday, how somebody would reach your accounts if you were in hospital for a fortnight. It is about your affairs being in order, which is a different thing.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Tried a binder or a template and abandoned it?",
      answer:
        "Those hand you every page at once, most of which does not apply to you, and leave you to work out where to begin. This asks eight short questions and then shows you one thing, chosen by what it would cost the people around you to leave it undone. Not a list of what remains, and no percentage anywhere.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Not sure you have enough going on to bother?",
      answer:
        "Then your copy is short, and short is finished rather than failing. Somebody who rents, has no children and no business is asked about 33 things instead of 46, and the rest never appear at all. There is no denominator in the product to make a small life look incomplete.",
      stage: ["deciding"],
    },
    {
      question: "Will it be out of date the moment you finish?",
      answer:
        "That is the part a binder cannot do. Forty-one entries come back on their own after a year or two and ask whether they are still true, and telling it your situation changed brings forward only what that could have made untrue. Nothing is sent to you: a standing entry appears in your Draftpace updates the next time you open it.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it store my passwords or my documents?",
      answer:
        "No, and it never will. It is deliberately not a vault: it records what exists, where it is, who knows about it, and what somebody should do. Where you would be tempted to write down a master password, it asks where your recovery instructions are kept instead. The printed book is made on your own device, so the assembled picture never exists on a server.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Can I print it before I have finished?",
      answer:
        "At any point, and nothing is hidden behind a completeness bar. The blank copy is useful on day one because it already contains only the sections that apply to you. The current book says plainly what is recorded and what is not.",
      stage: ["deciding", "owning"],
    },
    {
      question: "What if I do not know the answer to something?",
      answer:
        "Say you are not sure. It is kept as its own answer rather than filed as a no, and the printed book says the same rather than inventing something plausible. It comes back later without making a point of it.",
      stage: ["owning"],
    },
    {
      question: "Can my partner or my executor use it with me?",
      answer:
        "Not yet. It is built around a single account for now. What you hand somebody is the printed book, which is the point: it needs no login, no app and no password to be useful.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this a one-time purchase, and do I need an account?",
      answer:
        "One time, and yes. That matters more here than elsewhere: a record meant to outlive you is a poor fit for something that stops working when a card expires. The account is what keeps your records private and available wherever you next sign in.",
      stage: ["deciding"],
    },
  ],

  /**
   * How people describe this before they know a product like this exists.
   * Sourced, not invented: the will question already answered in
   * src/content/askdp.ts and the titles of the personal-affairs guides
   * written from the same research, including the ones written for the
   * other side of it, the adult child rather than the parent.
   */
  searchedProblems: [
    {
      phrase: "What should I write down in case something happens to me",
      answer:
        "A hand-built list of 46 things that belong in order, asked one at a time and only where they apply to you.",
    },
    {
      phrase: "How do I make an if-something-happens-to-me file",
      answer:
        "This is that file, kept current rather than written once, and printable as a book somebody could pick up and use.",
    },
    {
      phrase: "My pension goes to whoever is named on the form, not my will",
      answer:
        "Who is named on the forms that override a will is one of the first things it raises, because it is the one most often years out of date.",
    },
    {
      phrase: "I have been named executor and do not know what that involves",
      answer:
        "It records where things stand on proving that authority, so nobody discovers at a bank counter that being named is not the same as being able to act.",
    },
    {
      phrase: "How do I talk to my parents about their affairs",
      answer:
        "Give them something with a first step small enough to take. One question at a time, and everything that does not apply to them never appears.",
    },
    {
      phrase: "Nobody would know where to find anything if I died tomorrow",
      answer:
        "A handoff check answers that scenario by scenario, by what somebody would be trying to do, and names the one thing worth fixing first.",
    },
  ],

  /**
   * What an owner opens the manual to do, each row linking to the screen
   * it happens on.
   */
  tasks: [
    {
      label: "Do the next thing without deciding what it is",
      answer: "It shows one step, chosen by what its absence would cost, with why it matters and roughly how long it takes.",
      destination: "workspace",
    },
    {
      label: "Look at everything I've recorded so far",
      answer: "Affairs holds it by area, with what is established and what has not been asked yet.",
      destination: "affairs",
    },
    {
      label: "Say I'm not sure about something",
      answer: "Not sure is kept as its own answer, never filed as a no, and comes back later without making a point of it.",
      destination: "workspace",
    },
    {
      label: "Tell it my situation changed",
      answer: "Name the event. It works out what that could have made untrue and brings those back one at a time.",
      destination: "workspace",
    },
    {
      label: "Print the book to hand to somebody",
      answer: "Blank to fill in by hand, or current with everything recorded. Both open on what somebody would be trying to do first.",
      destination: "printables",
    },
    {
      label: "Check whether somebody else could actually manage",
      answer: "The handoff check answers scenario by scenario, and names the single thing worth fixing first.",
      destination: "affairs",
    },
    {
      label: "See what an entry used to say",
      answer: "Every change is kept. Nothing is deleted, so a retired entry still shows what it said before.",
      destination: "history",
    },
  ],

  relatedGuideSlugs: [],
  relatedProductSlugs: ["personal-finance-companion", "home-management-companion", "homeschooling-companion", "alongside"],
  needGroups: ["getting-organized"],
  seo: {
    title: "Personal Life Affairs Companion: get your affairs in order, one step at a time",
    description:
      "Everything the people you love would need to find, in one place and kept current. It tells you the one next step, skips whatever does not apply to you, and prints a book you can hand over when you are ready.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
