import type { ShopProductInput } from "../definition";

/**
 * The Personal Life Affairs Companion's real public Shop listing, same
 * "creating this file is the release gate" pattern as its two siblings.
 *
 * Every claim below maps to something built and live. The counts are
 * real: 45 steps across eight areas, 37 of them capturing an answer,
 * 103 questions in total, 40 that come back for a second look, nine
 * handoff scenarios, nine life events, eight questions at the start.
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
 * price is deliberately omitted (TODO_SET_REAL_PRICE), same convention
 * as both siblings: formatPrice() renders "Price not yet set" rather
 * than a fabricated $0.00, and GetAction renders "Checkout opens soon"
 * until LEMON_SQUEEZY_PLA_CHECKOUT_URL is set.
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
  objections: [
    {
      worry: "Put off by the idea that this is a death product?",
      answer:
        "Most of what it asks about matters while you are perfectly well: who can speak for you about medical care, who has a spare key, who would collect the children on a Tuesday, how somebody would get into your accounts if you were in hospital for a fortnight. It is about your affairs being in order, which is a different thing.",
    },
    {
      worry: "Tried a binder or a template and abandoned it?",
      answer:
        "Those hand you every page at once, most of which does not apply to you, and ask you to work out where to begin. This asks eight short questions and then shows you one thing. Not a list of what remains, not a percentage. One thing, chosen because it costs the people around you the most to leave undone.",
    },
    {
      worry: "Not sure you have enough going on to bother?",
      answer:
        "Then your copy is short, and short is finished rather than failing. Somebody who rents, has no children and no business gets 33 questions instead of 45, and the rest never appear at all. There is no denominator anywhere in the product to make a small life look incomplete.",
    },
    {
      worry: "Worried it will be out of date the moment you finish?",
      answer:
        "That is the part a binder cannot do. Forty of the entries come back on their own after a year or two and ask whether they are still true, and you can tell it your situation changed and it will work out what that affects. Every change is kept, so when something is no longer true you can still see what it said before.",
    },
    {
      worry: "Uneasy about writing all of this down in one place?",
      answer:
        "It holds no passwords, no account numbers, and no documents, by design rather than by policy. The printed book is made on your own device, so the assembled picture of your affairs never exists on a server at all, not even for the moment it takes to make the file.",
    },
  ],
  outcomes: [
    "One question on screen at a time, chosen for you, instead of a folder you have to organise before you can start.",
    "The things that cost the most to leave undone raised first: who decides, who to call, where the will is, and who is named on the forms that override it.",
    "Everything that does not apply to you absent entirely, rather than printed and crossed through.",
    "A record that comes back years later and asks whether it is still true, so what you wrote down does not quietly stop being right.",
    "My Affairs: a printable book, in your own words, that somebody who has never used this could pick up and use.",
    "An honest answer to whether another person could actually manage, scenario by scenario, rather than a completion score.",
  ],
  howItWorks: [
    "Eight short questions about your situation. Children, a partner, a pension, whether you own or rent, life cover, anyone who depends on you, pets, a business. They decide what you will and will not be asked about, permanently.",
    "Then one thing at a time. The step you are shown is the one whose absence would cost the people around you most, with an honest estimate of how long it takes and a sentence on why it matters.",
    "It asks rather than presenting a form. Who should someone contact first, what they are to you, how to reach them, anything they should know. Four questions at most, usually fewer, and you can skip or stop at any point.",
    "Your answer becomes a record, in your words. Not a tick against a task: the actual name, the actual place, the actual instruction.",
    "Not sure yet? Say so. It is kept as its own answer, not filed as a no, and it will come back later without nagging you about it.",
    "Years later, entries that have been standing a long time come back as a question rather than a task you failed to do. Still true, or update it.",
    "Something changed? Tell it you moved, separated, had a child, changed jobs. It works out what that could have made untrue and brings those back one at a time.",
    "Print whenever you like. Never at 100%, never gated: a blank copy with only your relevant sections and room to write, or the current book with everything you have established.",
  ],
  access: "paid",
  // TODO_SET_REAL_PRICE: no price object yet, see the file doc comment.
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "A hand-built list of 45 things that belong in order, across eight areas: people, important documents, money, home, pets and dependants, digital life, business, and important instructions",
    "103 questions written to be answered in a sentence, asked one at a time and only where they apply to you",
    "Personalisation from eight questions, so a simpler life is a genuinely shorter product and not a longer one with parts greyed out",
    "Forty entries that come back for a second look on their own, each on its own interval rather than on one schedule for everything",
    "Nine life events, from moving to separating to a named person dying, each bringing forward only what it could actually have made untrue",
    "My Affairs: a printable book in US Letter and A4, generated on your own device, in two forms, blank to fill in by hand or current with everything you have recorded",
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
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer:
        "One time. You pay once and keep it, the same way every paid product on Draftpace works unless a listing says otherwise. That matters more here than elsewhere: a record meant to outlive you is a poor fit for something that stops working when a card expires.",
    },
    {
      question: "Is this only about what happens after somebody dies?",
      answer:
        "No, and most of it is not. Who can speak for you about medical care, who has a spare key, how somebody would reach your accounts if you were in hospital for a fortnight, what a guardian would need to know to get through a normal week. It is about your affairs being in order.",
    },
    {
      question: "Does it store my passwords or my documents?",
      answer:
        "No, and it never will. It records what exists, where it is, who knows about it, and what somebody should do. Where you would be tempted to write down a master password, it asks where your recovery instructions are kept instead.",
    },
    {
      question: "Can I print it before I have finished?",
      answer:
        "Yes, at any point, and nothing is ever hidden behind a completeness bar. The blank copy is useful on day one because it already contains only the sections that apply to you. The current book says plainly what is recorded and what is not.",
    },
    {
      question: "What if I do not know the answer to something?",
      answer:
        "Say you are not sure. It is kept as its own answer rather than filed as a no, and the printed book says the same rather than inventing something plausible. It comes back to you later without making a point of it.",
    },
    {
      question: "How does it decide what to show me next?",
      answer:
        "By what it would cost the people around you to leave it: how serious the consequence is, what has to come first, and how much work it is. You cannot be asked for a backup executor before you have named one. Nothing is decided by a model, and every step states why it matters before it asks you anything.",
    },
    {
      question: "Will it remind me when something is worth checking again?",
      answer:
        "Not yet, and it does not pretend to. Entries that have been standing a long time surface the next time you open it, and how notifications should work for something meant to last decades is a decision that has not been made. Nothing is sent to you today.",
    },
    {
      question: "Can my partner or my executor use it with me?",
      answer:
        "Not yet. It is built around a single account for now. What you hand somebody is the printed book, which is the point: it needs no login, no app and no password to be useful.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your records save privately and follow you across devices.",
    },
  ],
  relatedGuideSlugs: [],
  relatedProductSlugs: ["personal-finance-companion", "home-management-companion", "homeschooling-companion"],
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
