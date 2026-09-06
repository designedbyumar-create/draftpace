import type { ShopProductInput } from "../definition";

/**
 * ADHD Life Companion's real public Shop listing, same "creating this
 * file is the release gate" pattern as its four siblings.
 *
 * THE NAME
 *
 * Built under the working name "Alongside". The Phase 0 research (see
 * docs/products/ADHD-LIFE-COMPANION-PROPOSAL.md section 11) recommended
 * keeping ADHD out of the brand name specifically because the low-cost
 * marketplace category it would otherwise be compared against sells in
 * the single-digit-dollar range, and a name that reads like that
 * category gets priced like it. The founder overrode that after seeing
 * the built product and chose the plain, named-outright title instead.
 * Slug and table prefix stay "alongside" / "als_" (a live production
 * entitlement already exists under that slug); only the title changed.
 *
 * THE ADJACENT AUDIENCE, NAMED RATHER THAN IMPLIED
 *
 * The same research is explicit that ADHD is not the only door in:
 * post-concussion, long covid, chronic illness, grief, new parenthood,
 * menopause and depression all produce the same difficulty holding a
 * plan in your head. The audience section names both doors rather than
 * making the second one require the first one's word for it.
 *
 * NOT CLAIMED, BECAUSE NOT BUILT: reminders, push notifications, email.
 * The product's own definition declares notifications: { supported:
 * false }, with the Phase 0 delivery research as the reason (push
 * reaches iOS only through a manual install no page can trigger, and web
 * push opt-in runs 3 to 15% even without one). A listing that promised
 * to reach somebody when the app is closed would be selling a thing
 * that does not exist yet.
 *
 * $28 launch price, $35 regular. The seventh and last of the seven paid
 * products to get a real price, see the pricing plan's Phase 7.
 * purchaseAction.href stays intentionally omitted: with no href and
 * access "paid", GetAction already renders the correct "Checkout opens
 * soon" pending state rather than a dead or fake link, exactly the
 * mechanism this listing needs until LEMON_SQUEEZY_ALONGSIDE_CHECKOUT_URL
 * is set, which this phase deliberately leaves alone.
 */
export const alongsideShopProduct: ShopProductInput = {
  id: "alongside",
  slug: "alongside",
  publicationStatus: "published",
  title: "ADHD Life Companion",
  promise:
    "Somewhere to put the thing you are carrying, and help getting through it when you are ready. Write it down once, hear about it only when it actually matters, and walk through the hard version of it one question at a time.",
  problem:
    "Most of what does not get done is not forgotten. It is remembered constantly, in the background, at a volume that makes it hard to think about anything else, and never quite gets a moment where starting it feels possible. A to-do app turns that into a longer list to feel behind on. A calendar wants a time you do not have yet. What actually helps is somewhere to put it down that will bring it back up at the right moment, and something to walk through it with when the moment comes.",
  audience: [
    "You have ADHD, or executive function that works like it does, and most productivity tools have made that worse rather than better.",
    "You are dealing with brain fog from long covid, a concussion, chronic illness, grief, new parenthood, menopause, or depression, and holding a plan in your head has stopped being reliable.",
    "You know exactly what you need to do and still cannot make yourself pick up the phone, so the same thing has been on your mind for three weeks.",
    "You have tried planners and productivity systems before and they became one more thing to feel behind on.",
  ],
  audienceExclusions: [
    "You want it to track a diagnosis, medication, or symptoms. It does not ask about any of them and never will. It is built for how this feels, not for why.",
    "You want a habit tracker, a streak, or a score. There is no completion percentage anywhere in this product and no comparison between one week and another.",
    "You want it to remember the details of a bill, an account, or a policy. It records that you need to sort out a problem with the electricity bill, not the provider, the amount, or the account number. Personal Life Affairs Companion and Personal Finance Companion are where that detail belongs.",
    "You want push notifications or email reminders today. It does not send either yet. What it does is stay quiet until something is actually worth mentioning, and say so plainly the moment you open it.",
  ],
  objections: [
    {
      worry: "Tried a to-do list and it just became another list to feel behind on?",
      answer:
        "That is what most of them do: everything sits on screen at once, sorted by nothing, and the list itself becomes a source of the feeling you were trying to get away from. This shows what is worth your attention right now, and says so in one sentence, or says plainly that nothing needs you and stops there.",
    },
    {
      worry: "Know exactly what to do and still cannot make the call?",
      answer:
        "The gap is rarely knowing what to do. It is holding the purpose, the outcome you want, and the two things you must not forget, all at once, while a stranger talks to you. The Companion holds those on screen so you do not have to, and gives you an opening line so the first fifteen seconds are not the hardest part.",
    },
    {
      worry: "Worried this is another app that will guilt you for falling behind?",
      answer:
        "There is no streak, no percentage, and no attempt counter anywhere in it. If you open something and do not finish it, closing it records nothing at all: not a status, not a note, not a mark against you. Leaving is a button, not a failure.",
    },
    {
      worry: "Not sure ADHD is even the right word for what you are dealing with?",
      answer:
        "It does not need to be. It is built for the difficulty, not the diagnosis. Brain fog from long covid, a concussion, chronic illness, grief, new parenthood, menopause, and depression all make holding a plan in your head unreliable in the same way, and nothing here asks which one applies to you.",
    },
    {
      worry: "Worried you will have to set the whole thing up before it is any use?",
      answer:
        "You can open it with nothing recorded and say what you need to do right now: call the landlord, chase the refund, whatever it is. It helps you with that one thing first, and only afterward, once, asks whether you want it remembered.",
    },
  ],
  outcomes: [
    "Nothing needs you right now, said plainly, on the days that is true, instead of a list filling the space anyway.",
    "The right thing raised at the right moment: a date you set yourself, somebody who has gone quiet, a thread you left off a fortnight ago.",
    "A hard phone call or email with an opening line ready, a short list of what to have in front of you, and nowhere it tells you what to say beyond the first sentence.",
    "Somewhere to leave a half finished thing that remembers exactly where you got to, so picking it back up does not mean starting over.",
    "A record of what actually happened, in your own words, that never once says you failed at something.",
    "Help with one thing today, with nothing set up first, and no obligation to turn it into a system.",
  ],
  problemsSolved: [
    {
      problem: "The same thing has been on your mind for three weeks and you still can't make yourself pick up the phone.",
      solution: "A hard call or email with an opening line ready, and a short list of what to have in front of you.",
    },
    {
      problem: "A to-do list just becomes a longer thing to feel behind on.",
      solution: "Nothing needs you right now, said plainly, on the days that's true, instead of a list filling the space anyway.",
    },
    {
      problem: "You put something down half finished and lose where you were.",
      solution: "Somewhere to leave a half finished thing that remembers exactly where you got to.",
    },
    {
      problem: "Every system eventually tells you that you've failed at it.",
      solution: "A record of what actually happened, in your own words, that never once says you failed at something.",
    },
  ],
  howItWorks: [
    "Write something down, or open the Companion straight away with nothing recorded. Both are first class ways in.",
    "Say what it is, in one line, and pick the shape that fits: something to do, something you are waiting on somebody else for, something ongoing, or a detail you will need again.",
    "Now shows what deserves your attention, derived fresh each time from dates and notes you put there yourself. Nothing is invented, and quiet is a real, honest answer.",
    "When something needs doing, the Companion walks you through it: what it is about, what to have ready, an opening line you can use or replace, short prompts for while it is happening, and one question at the end about how it went.",
    "Close the tab halfway through and come back later. It picks up on the exact question you left, with nothing lost and nothing started twice.",
    "How it went changes what happens next. Sorted closes it. Waiting on someone turns it into that, with a date to check back. Did not get to it changes nothing at all, on purpose.",
    "Life holds everything you have recorded, grouped by what kind of thing it is, with the full history of what happened to it and a page to edit anything by hand.",
  ],
  access: "paid",
  price: { amount: 28, currency: "USD" },
  compareAtPrice: { amount: 35, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "Now: what deserves your attention, derived fresh every time from dates and notes you set yourself, never invented",
    "Life: everything you are holding, in four shapes (something to do, something you are waiting on, something ongoing, a detail worth keeping), never mixed together",
    "The Companion: eight authored procedures for the situations that are hardest to start, including two ways into a phone call, an email, chasing somebody up, a billing problem, and an appointment",
    "Direct entry: open the Companion with nothing recorded and get help with one thing today, with an offer to remember it afterward, never before",
    "Real resume: leave a run half finished and come back to the exact question, with no duplicate and nothing lost",
    "A full item page: what it is, the next thing worth attending to about it, its whole history, and a page to edit anything by hand",
    "Suggested opening wording for the hardest conversations, editable in full and never saved once you have used it",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "What it is, in your own words, one line at a time",
    "Which of the four shapes it is, when you write it down",
    "A date, only when you choose to set one yourself",
    "Answers as the Companion asks for them: a purpose, an outcome you want, who it is with",
  ],
  expectedOutputs: [
    "What deserves your attention right now, or an honest, quiet screen saying nothing does",
    "A worked-through version of a hard call or email, with the wording left in your hands",
    "A record of what happened, in your own words, kept as history rather than filed as a task",
    "A single page per thing you are holding, with everything about it in one place",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so a run you started on your phone is still there if you open Draftpace somewhere else. Nothing is ever deleted: a thing you close stays closed rather than disappearing, and its history is never edited after the fact.",
  privacyNotes:
    "Your records are private to your account. Draftpace does not sell your data or use it for advertising, and nothing here is read by an AI model: there is no model provider anywhere in this product. It holds no diagnosis, no medication, and no symptom, because it is not asked for and never will be. It holds no amount, account number, or provider either, by design: that detail belongs to Personal Life Affairs Companion or Personal Finance Companion, and Alongside only ever records your relationship to getting something done. Suggested wording for a hard conversation stays in your browser and is never saved, even after you use it.",
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, the same way every paid product on Draftpace works.",
    },
    {
      question: "Do I need an ADHD diagnosis to use this?",
      answer:
        "No. It is built for the difficulty, not the diagnosis, and nothing in it asks which one applies to you. Long covid, a concussion, chronic illness, grief, new parenthood, menopause, and depression all make holding a plan in your head unreliable in the same way, and this is built for that experience, whatever produced it.",
    },
    {
      question: "Does it send reminders or notifications?",
      answer:
        "Not yet, and it does not pretend to. Push reaches iOS only through a manual install no page can trigger, and even web push is opted into by a small share of people who are offered it. Attention is built so that can change later without the product changing; today, everything happens inside the app, when you open it.",
    },
    {
      question: "Will it judge me for not finishing something?",
      answer:
        "No. There is no streak, no completion percentage, and no attempt counter anywhere in it. Closing something you did not get to records nothing at all, not even a timestamp, because recording an abandonment would turn your own history into a list of failures.",
    },
    {
      question: "Does it tell me what to say on a hard phone call?",
      answer:
        "It gives you an opening line, because the first fifteen seconds are the part most people rehearse and dread, and it is always editable or replaceable. It never tells you what to claim, accept, or settle for. That is yours, because you are the only one with the facts.",
    },
    {
      question: "What if I close it halfway through something?",
      answer:
        "Come back whenever you are ready. It returns to the exact question you left, not the beginning, and leaving is never recorded as anything other than leaving.",
    },
    {
      question: "Does it store details about my bills, accounts, or medical history?",
      answer:
        "No, and it is built so that it cannot. It records that something needs sorting out and your relationship to getting it done, never the account number, the provider, or the sum involved. That detail lives in Personal Life Affairs Companion or Personal Finance Companion, which are built to hold it properly.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your records save privately and follow you across devices.",
    },
  ],
  relatedGuideSlugs: [],
  relatedProductSlugs: ["personal-life-affairs-companion", "personal-finance-companion"],
  needGroups: ["getting-organized"],
  seo: {
    title: "ADHD Life Companion: hold what you cannot keep in your head",
    description:
      "Somewhere to put the thing you are carrying, and help getting through it when you are ready. Built for ADHD and the same difficulty however it shows up: long covid, chronic illness, grief, new parenthood, menopause, depression.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
