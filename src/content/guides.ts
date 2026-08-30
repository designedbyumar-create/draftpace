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

  // ---------------------------------------------------------------- batch 1
  // The ten highest-priority guides from the content plan. Two of them,
  // the parent-dies pair, were flagged in the fit verification as
  // aftermath topics against a preparation product. They are written here
  // as the honest bridge rather than the rescue: they help with the weeks
  // in front of the reader, and hand over on prevention, which is what
  // Personal Life Affairs Companion actually does.

  {
    slug: "what-to-do-when-a-parent-dies",
    title: "What to do when a parent dies: a calm order for the first two weeks",
    dek: "The practical steps, in the order they actually need doing, written for somebody who is grieving and cannot hold a list in their head.",
    readingTime: "9 min read",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a parent dies there are perhaps six things that genuinely need doing in the first week, and several dozen that feel urgent and are not. The difference matters, because you are being asked to do administration at the exact moment you are least able to.",
          "This is the order that works. Register the death and get certified copies of the certificate, because almost nothing else can start without them. Find the will if there is one. Tell the small number of organisations that actually need telling now. Secure the property. Then stop, because the rest can genuinely wait, and most of it will take months anyway.",
          "Nothing below is legal advice. Requirements differ by country and sometimes by region, and the registrar you speak to will tell you what applies where you are.",
        ],
      },
      {
        kind: "list",
        heading: "The first 48 hours",
        intro: "Short on purpose. If somebody hands you a longer list this week, it is for later.",
        ordered: true,
        items: [
          "Get the medical certificate of cause of death. If your parent died in hospital or a care home, staff arrange this. If they died at home unexpectedly, call emergency services first.",
          "Register the death with your local register office. Most places require this within a few days.",
          "Order certified copies of the death certificate. Order more than feels sensible, because ten is normal and each organisation wants its own.",
          "Contact a funeral director, or check whether a plan was already paid for. Many people have one and never mention it.",
          "Secure the property. Lock it, redirect post, and if it is now empty, check what the home insurance says about unoccupied buildings, because many policies lapse after thirty days.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why you need so many death certificates",
        paragraphs: [
          "Banks, pension providers, insurers, utilities and government departments will each want to see a certified copy, and most will not accept a photocopy or a scan. Some return them and some do not. Ordering ten at registration is far cheaper and faster than ordering them one at a time over the following six months.",
          "This is the single most common thing people wish they had known, and it costs nothing to get right.",
        ],
      },
      {
        kind: "list",
        heading: "Who to tell in the first two weeks",
        intro: "Not everybody. Just the ones where delay causes a real problem.",
        items: [
          "Their bank and any building society, so accounts can be frozen and direct debits stopped.",
          "Their pension provider or employer, because overpaid pension is usually reclaimed and it is easier to stop it than repay it.",
          "The government department handling benefits, tax and state pension, which in many countries has a single service that notifies several at once.",
          "Home and car insurers, particularly if a property is now unoccupied.",
          "Their landlord or mortgage lender.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to look for the will",
        paragraphs: [
          "Start with the obvious places, because that is usually where it is: a home safe, a filing box, a bedside drawer. Then the less obvious. Many people leave a will with the solicitor who drafted it, and some countries have a central will register worth searching.",
          "If you find a will, look for who is named as executor before you do anything else. That person has the legal authority to act, and if it is not you, several of the steps above become theirs rather than yours.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What can genuinely wait",
        paragraphs: [
          "Probate takes months in most places, and there is no version of this where you finish it in a fortnight. Closing accounts, valuing the estate, dealing with tax and distributing anything are all downstream of steps you have not yet completed.",
          "Clearing the house can wait too, and most people who rush it regret it. Nothing bad happens if a wardrobe stays full until spring.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part nobody warns you about",
        paragraphs: [
          "The hardest thing about this fortnight is rarely any single task. It is that you are trying to reconstruct somebody's entire administrative life from the outside, without a map, while grieving. Which bank. Which pension. Whether there was insurance. Whether the utilities were in their name. Who the solicitor was.",
          "Most families find some of it and never find the rest. Money sits unclaimed, subscriptions keep taking payments for years, and somebody spends a Sunday going through paper looking for a policy number that may not exist.",
          "It is worth saying plainly, because it is the thing you will think about later: this is not something you can fix now, for the person who has died. It is something you can fix for the next person, which is usually you.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion is built for the other side of this. It walks you through recording what exists, where it is kept, and who should be told, so nobody has to reconstruct it from the outside. It never asks you to upload a document, only to record where one is. If this fortnight has shown you how hard the search is, that is exactly the problem it exists to prevent.",
      },
    ],
  },

  {
    slug: "how-to-find-someones-accounts-after-they-die",
    title: "How to find someone's bank accounts, pensions and policies after they die",
    dek: "A practical search order for tracing accounts, pensions, insurance and subscriptions when nobody wrote any of it down.",
    readingTime: "8 min read",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is no single register you can search to find everything somebody owned. That is the honest answer, and it is why this task takes most families months rather than an afternoon.",
          "What works instead is a systematic sweep of four sources: their post, their bank statements, their email, and the official tracing services that exist for pensions and unclaimed assets. Between them you will usually find the great majority of it.",
        ],
      },
      {
        kind: "list",
        heading: "Start with twelve months of bank statements",
        intro: "This is the highest-yield hour you will spend, because almost everything leaves a trace here.",
        items: [
          "Regular outgoings reveal insurance policies, subscriptions, service contracts and standing orders.",
          "Regular incomings reveal pensions, annuities, benefits and rental income.",
          "Annual payments are easy to miss, so look across a full twelve months rather than three.",
          "Small recurring amounts are often the ones nobody knows about, and they keep taking money long after a death if nobody stops them.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep the post for at least a year",
        paragraphs: [
          "Annual statements are the single best source for accounts nobody knew about. A pension the person had from a job in the 1980s will usually announce itself once a year and never otherwise.",
          "This is why redirecting post matters so much, and why clearing a house too quickly causes problems. If post stops arriving and nobody kept the last year of it, the trail goes cold.",
        ],
      },
      {
        kind: "list",
        heading: "Where else to look",
        items: [
          "Their email, searched for words like statement, policy, renewal, premium and pension.",
          "Their phone, for banking and authenticator apps that name institutions.",
          "The pension tracing service most countries run, which finds schemes from former employers.",
          "Unclaimed asset registers, which hold dormant accounts and lost policies.",
          "Their accountant or solicitor, who often knows more than the family does.",
          "The loft, the filing box, and the drawer nobody has opened, which sound like jokes and are where a great deal of this is actually found.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What you will need before anybody talks to you",
        paragraphs: [
          "Almost every institution will want a certified copy of the death certificate, proof of your own identity, and evidence of your authority to act, which usually means the will naming you as executor or a grant of probate.",
          "It is worth assembling that set once and keeping it together, because you will be asked for exactly the same three things perhaps twenty times.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Accept that you will not find everything",
        paragraphs: [
          "Billions sit in dormant accounts and untraced pensions, mostly because the only person who knew about them died. A thorough search finds most of it and almost never all of it, and at some point continuing to look costs more than it recovers.",
          "That is not a failure on your part. It is the predictable result of a system where the information lived in one person's head.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records what exists and where it is kept, so this search never has to happen to your family. It holds accounts, pensions, policies and digital services as a registry, never as uploaded files, and produces a printed book somebody could follow if they had to. It is the difference between a fortnight of searching and an afternoon of reading.",
      },
    ],
  },

  {
    slug: "homeschool-record-keeping-requirements-by-state",
    title: "Homeschool record keeping requirements, state by state",
    dek: "What each state actually asks you to keep, which states require a portfolio, and the records worth keeping even where nothing is required.",
    readingTime: "10 min read",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Homeschool record requirements vary enormously between states. Some ask for nothing at all. Some want attendance only. A handful require a portfolio of work that an evaluator will actually look at.",
          "The practical takeaway is that you should know which of three groups your state falls into, and then keep slightly more than it asks for, because the cost of keeping records is small and the cost of not having them when asked is not.",
          "Laws change. Always confirm with your state homeschool association or department of education before relying on any summary, including this one.",
        ],
      },
      {
        kind: "table",
        heading: "The three groups",
        intro: "Roughly where states sit, by how much they ask of you.",
        columns: ["Group", "What is typically required", "Examples"],
        rows: [
          ["Low or none", "No routine reporting. Records are for your own use and for proving the year if ever questioned.", "Texas, Idaho, Oklahoma, Illinois, Michigan, Alaska, Connecticut, New Jersey"],
          ["Attendance or notice", "Notice of intent, attendance records, and sometimes a list of subjects taught.", "Alabama, Indiana, Mississippi, Arizona, Arkansas, Oregon, South Dakota"],
          ["Portfolio or assessment", "A portfolio of work, an annual evaluation, standardised testing, or a combination.", "Pennsylvania, Maryland, Ohio, South Carolina, Florida, District of Columbia, New York"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Which states require a portfolio",
        paragraphs: [
          "Pennsylvania, Maryland, Ohio, South Carolina, Florida and the District of Columbia make a portfolio mandatory. New York, Pennsylvania, Kentucky, Maryland and Ohio are generally regarded as the most regulated for record keeping overall.",
          "If you are in one of those, the portfolio is not a formality. Someone reads it, and building it in April from memory is far harder than adding to it as you go.",
        ],
      },
      {
        kind: "list",
        heading: "What a portfolio usually contains",
        intro: "The specifics vary, but this set covers most requirements.",
        items: [
          "A log of educational activities, with reading materials named by title.",
          "Samples of work across the year, not just the best pieces.",
          "Attendance or days schooled, where your state counts them.",
          "Standardised test results or an evaluator's written report, where required.",
          "A list of subjects covered and the materials used.",
        ],
      },
      {
        kind: "list",
        heading: "What to keep even where nothing is required",
        intro: "Three things are worth recording regardless of your state, because they are the ones you will want later and cannot reconstruct.",
        items: [
          "The date, the subject, and roughly what part of it. Unit 3, Lesson 12 is enough.",
          "Whether it landed. One word does it: easy, about right, or difficult.",
          "The occasional sentence about something that happened. She finally understood fractions. He reads better on the floor than at a desk.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why most record keeping fails",
        paragraphs: [
          "It fails in one of two directions. Either nothing gets kept at all and a year cannot be accounted for, or somebody builds a system so heavy that it is abandoned by half term and the result is the same.",
          "The version that survives is the one that takes under a minute a day and does not require you to feel behind when you miss a week.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion keeps the record as you go and prints it when you need it. It accepts backdated entries, because nobody logs every day on the day, and it includes short checks you can run at home to find out honestly whether something stuck. There is no completion percentage anywhere in it, and no screen that tells you that you are behind.",
      },
    ],
  },

  {
    slug: "home-maintenance-you-skip-that-costs-the-most",
    title: "The home maintenance you skip that costs the most later",
    dek: "Which deferred jobs actually turn into expensive damage, roughly how often each needs doing, and what to record so the next one is cheaper.",
    readingTime: "8 min read",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Around seven in ten homeowners delayed a repair last year, and more than nine in ten have something still outstanding. That is not carelessness. It is what happens when three hundred small facts and dates live nowhere except somebody's memory.",
          "The problem is that deferred maintenance does not stay the same price. Industry analysis puts the average deferred repair at over five thousand dollars by the time it is finally done, and every dollar of work put off can cost four or more later. The jobs below are the ones where that multiplier is real.",
        ],
      },
      {
        kind: "table",
        heading: "The jobs where delay actually costs",
        intro: "Intervals are typical rather than universal. Your manual wins over any table.",
        columns: ["Job", "Roughly how often", "What it turns into"],
        rows: [
          ["Clear gutters", "Twice a year", "Water against the wall, then damp, then the fascia and sometimes the foundation"],
          ["Service the boiler or furnace", "Annually", "Failure in the coldest week, when call-out rates are highest and parts are slowest"],
          ["Flush the water heater", "Annually", "Sediment, lost efficiency, then a tank that fails years early"],
          ["Replace HVAC filters", "Every 1 to 3 months", "Strained system, higher bills, shortened compressor life"],
          ["Check roof and flashing", "Annually", "Small leak becomes decking, insulation and ceiling"],
          ["Test smoke and CO alarms", "Monthly", "The only item on this list where the cost is not money"],
          ["Reseal grout and caulk", "Every 1 to 2 years", "Water behind tile, which is invisible until the wall is opened"],
          ["Winterise outdoor taps", "Once, before first freeze", "A burst pipe inside a wall, which is the most expensive item here"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the reminder always arrives too late",
        paragraphs: [
          "Nobody forgets to service a boiler because they do not care. They forget because there is no natural moment to remember, and the reminder that finally arrives is a cold house or a stain on a ceiling.",
          "The fix is not discipline. It is writing down when something was last done, so the next date is a fact rather than a guess.",
        ],
      },
      {
        kind: "list",
        heading: "What to record about anything in your house",
        intro: "Five fields, once, when you can actually see the appliance. This is the part that makes every future repair cheaper.",
        items: [
          "Make and model, which is usually on a plate inside a door, behind a kick panel, or on the back.",
          "When it was installed or bought.",
          "When the warranty ends.",
          "When it was last serviced, and by whom.",
          "Anything odd about it that a future engineer would want to know.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Seasonal jobs are not interval jobs",
        paragraphs: [
          "A good deal of outdoor maintenance belongs to a month rather than to a rolling interval. Blowing out an irrigation system belongs in autumn, not three hundred and sixty five days after you happened to write it down.",
          "Treating everything as an interval is why generic maintenance apps end up telling people to winterise in July, and why they get ignored.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base knows the service intervals for well over a hundred common jobs, rates each by what happens if you skip it and how much effort it takes, and understands which jobs belong to a season rather than a rolling date. It records the make, model and service history of everything in your house, so the next repair starts with facts instead of a torch and a phone camera behind the fridge.",
      },
    ],
  },

  {
    slug: "what-else-your-trip-depends-on-when-something-changes",
    title: "One thing moved. Here is how to work out what else your trip depends on",
    dek: "A flight changes and three other bookings quietly become wrong. A method for finding them before they find you.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most trip disasters are not the first thing that goes wrong. They are the second and third things, which only became problems because the first thing moved and nobody worked out what it touched.",
          "A flight shifts three hours. The airport transfer booked for the old arrival time is now wrong. The hotel you told about a late check-in is now wrong too. The restaurant that evening may be fine or may not. None of that is unusual, and all of it is predictable if you already know which parts of your trip were built on top of which.",
        ],
      },
      {
        kind: "list",
        heading: "The three questions, per booking",
        intro: "Ask these once, when you book, and the answer is there when you need it at six in the morning in an airport.",
        ordered: true,
        items: [
          "What does this depend on? A transfer usually depends on a flight. A check-in usually depends on a transfer.",
          "What depends on this? The same relationship read the other way, which is the one that matters during a disruption.",
          "If this moves by three hours, what is the first thing I check?",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Only walk downward",
        paragraphs: [
          "This is the part people get wrong under pressure. When a flight moves, everything booked after it is potentially affected. Nothing booked before it is.",
          "A hotel check-in changing does not mean your flight changed. The direction runs one way, because later things depend on earlier things and not the reverse, and remembering that halves the number of things you have to think about.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Handle them one at a time",
        paragraphs: [
          "The instinct when four things are wrong is to deal with all four at once, usually by opening four browser tabs and phoning somebody while reading an email. That is how people end up cancelling the wrong booking.",
          "Change the thing that moved first. Write down the new fact. Then go to whatever depended on it, one booking at a time, and decide whether it actually needs anything. Often two of the four turn out to be fine.",
        ],
      },
      {
        kind: "list",
        heading: "What to have in front of you before you call anybody",
        items: [
          "The booking reference and the name it was booked under, which are sometimes different.",
          "The old time and the new time, stated plainly.",
          "What you actually want to happen, decided before you dial.",
          "Somewhere to write the name of who you spoke to and the reference for the call.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not let anything change itself",
        paragraphs: [
          "Whatever you use to track this, it should never quietly rewrite your other bookings when one thing moves. Being shown what might be affected is useful. Having four bookings silently altered on your behalf is considerably worse than having none of them altered, because now you do not know what is true.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion is built around exactly this. You say once what a booking depends on, and when you record a change it walks down the chain and shows every booking that was built on top of it, with its current time, marked as unchanged so far. It edits nothing for you. Then it helps you work through them one at a time.",
      },
    ],
  },

  {
    slug: "flight-delayed-with-a-connection-what-to-do-first",
    title: "Your flight is delayed and you have a connection. What to do first",
    dek: "The order that actually helps in the twenty minutes after a delay is announced, and what to have ready before you reach a desk.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Fifty seven percent of travellers had a delay of more than two hours in the past year. If you have a connection, the useful window is the first twenty minutes, before several hundred other people reach the same conclusion you have.",
          "The order is: work out whether the connection is genuinely gone, get in a queue and on the phone at the same time, and know what you are asking for before anyone speaks to you.",
        ],
      },
      {
        kind: "list",
        heading: "The first twenty minutes",
        ordered: true,
        items: [
          "Check the actual arrival time against your connection time, not the delay figure. A ninety minute delay on a three hour layover is not a problem.",
          "If it is tight, join the transfer or service desk queue immediately. You can always leave a queue.",
          "While standing in it, call the airline. The phone queue and the physical queue run in parallel, and whichever answers first wins.",
          "Check the airline app. Rebooking is sometimes available there before an agent offers it.",
          "Decide what you want: the next flight, a different routing, or an overnight with a hotel. Vague requests get vague answers.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Say what happened, once, in order",
        paragraphs: [
          "Whoever you reach can only help with the actual sequence of events. Give it once, cleanly, then say what you need. Leading with the ask before the facts almost always makes the conversation longer.",
          "Keep it to two sentences. Your inbound flight is delayed, you will miss a connection at a named time, and you would like to be rebooked.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Before you walk away, get two things",
        paragraphs: [
          "The name of who you spoke to, and a reference for the conversation. Not to complain later, though it helps with that. The real reason is that if this is not resolved by whoever comes after them, you can pick it up where you left off instead of starting again.",
          "This is the single most useful habit in travel disruption and it takes ten seconds.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What about compensation",
        paragraphs: [
          "Roughly half of travellers never claim for a disruption, and the most common reason given is not knowing they could. It is worth looking into afterwards.",
          "It is deliberately not part of this guide, because what you are owed depends on where you flew from, which carrier, and sometimes which fare, and a confident wrong answer at a desk puts you in a worse position than no answer. Sort out the travel first. Look up entitlement later, calmly, when you are not standing up.",
        ],
      },
      {
        kind: "list",
        heading: "What to have ready",
        items: [
          "Booking reference and the name the booking is under.",
          "Your onward flight number and its scheduled time.",
          "What is waiting at the other end, because a transfer or a check-in may also need moving.",
          "Somewhere to write the new details down that is not a phone at eleven percent.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion holds your references, your onward bookings and what depends on what, so a delay does not begin with searching six inboxes. It walks you through the call itself, including an opening line you can use or replace, and afterwards it shows you what else that delay touched. It also prints as a blank book, for when the phone is the thing that failed.",
      },
    ],
  },

  {
    slug: "how-to-make-a-phone-call-you-have-been-avoiding",
    title: "How to make a phone call you have been avoiding for weeks",
    dek: "Why the call is hard, and a way through it that does not require you to suddenly become a different person.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The call is not hard because you do not know what to say. It is hard because making it requires holding several things at once: why you are calling, what outcome you want, the two facts you must not forget, and the ability to think while a stranger talks at you.",
          "That is a working memory problem, not a motivation problem, which is why telling yourself to just do it has not worked for three weeks.",
          "What helps is taking those things out of your head and putting them somewhere you can see them, so the call only requires the part you can actually do.",
        ],
      },
      {
        kind: "list",
        heading: "Five minutes before you dial",
        intro: "Write these down. On paper, on a screen, anywhere you can see them while talking.",
        ordered: true,
        items: [
          "What this is about, in one line.",
          "What you want to happen. Decide it now, because this is the thing that gets lost halfway through explaining what went wrong.",
          "Your account or reference number.",
          "Two facts you will need: a date, an amount, a name.",
          "Your first sentence, written out.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write the first sentence out",
        paragraphs: [
          "The first fifteen seconds are the part almost everybody rehearses and dreads, and they are also the part you can prepare completely. Once you are through them, the conversation usually carries itself.",
          "Something as plain as this works: hello, I have a problem with my account and I am hoping you can help me sort it out. Can I explain what has happened. You are not performing. You are getting past the opening.",
        ],
      },
      {
        kind: "list",
        heading: "While you are on the call",
        intro: "Short, because anything longer is unreadable while somebody is speaking to you.",
        items: [
          "Say what you need.",
          "Ask them to read the details back once they have found it.",
          "Ask what happens next, and by when.",
          "Get a reference for the call, and the name of who you spoke to.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you get through it and nothing is resolved",
        paragraphs: [
          "That is a normal outcome and not a failed call. Plenty of calls end with somebody else needing to look into it. What matters is that you now have a reference and a name, which means the next call starts from where this one stopped rather than from the beginning.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you do not manage it today",
        paragraphs: [
          "Then you do not manage it today. Nothing has got worse, and adding guilt to the pile has never once made the next attempt easier.",
          "The thing worth protecting is that the preparation you did is still there tomorrow. Starting over from nothing is what makes the second attempt harder than the first, and it is entirely avoidable.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion walks you through calls like this one, step by step, holding the purpose and the outcome on screen so you do not have to. It gives you an opening line you can edit or ignore, and it never tells you what to accept or settle for, because you are the one with the facts. If you close it halfway through, it picks up on the exact question you left, and it records nothing at all about the attempt you did not finish.",
      },
    ],
  },

  {
    slug: "picking-something-back-up-after-abandoning-it",
    title: "How to pick something back up after you abandoned it halfway",
    dek: "Restarting is harder than starting, for a specific reason. Here is what actually reduces the cost of coming back.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Coming back to something you abandoned is harder than starting it was, and the reason is worth knowing. You are not just facing the task again. You are facing the task, plus the work of reconstructing where you got to, plus whatever you have decided your abandoning it says about you.",
          "Only one of those three is actually the task. The other two are what make the second attempt feel heavier than the first, and both can be reduced.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The reconstruction is the real cost",
        paragraphs: [
          "Most of the resistance to picking something up is not laziness. It is the accurate expectation that you will spend twenty minutes working out what you already did before you can do anything new.",
          "Which forms were filled in. Whether you sent the email. What the person said. Where the reference number went. That work is genuinely tedious, your brain knows it is coming, and it is a large part of why the thing has sat for a month.",
        ],
      },
      {
        kind: "list",
        heading: "What to leave behind when you stop",
        intro: "Three lines when you put something down, which turn a twenty minute restart into a two minute one.",
        ordered: true,
        items: [
          "Where you got to. Not what the task is, where you stopped inside it.",
          "The next physical action, written as a verb. Call the number on the letter. Not chase the refund.",
          "Anything you learned that is not written anywhere else, such as a reference number or the name of who you spoke to.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not restart from the beginning",
        paragraphs: [
          "The instinct on returning is to go back to the start and re-read everything, which feels responsible and is usually a way of not resuming. It also makes the whole thing feel larger than it is.",
          "Go straight to the next action instead. If it turns out you needed context, you will find that out in about a minute, which is much cheaper than reviewing everything first.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The story about yourself is optional",
        paragraphs: [
          "There is a version of this where abandoning something becomes evidence about what sort of person you are, and that version makes returning much harder, because now picking it up means admitting to something.",
          "Nothing was lost by stopping. The task is exactly where you left it, indifferent to how long it sat. A month of not doing something is not a month of failing at it, whatever a productivity app with a streak counter has implied.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built so that leaving something is not a failure. Close a run halfway through and it records nothing at all, then returns you to the exact question you left rather than to the beginning. Everything you had already answered is still there. There is no streak, no completion percentage, and nothing anywhere that counts what you did not get to.",
      },
    ],
  },

  {
    slug: "how-much-of-your-money-is-actually-safe-to-spend",
    title: "How much of your money is actually safe to spend",
    dek: "Your balance is not the answer. A method for working out the number that is genuinely yours, and why banking apps will not tell you.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The number in your banking app is not what you can spend. It is what is sitting there right now, before everything that has already been committed and has not left yet.",
          "The figure you actually want is your balance, minus money that is protected or spoken for, minus what is due before your next payday. That number is usually much smaller than the balance, and knowing it is the difference between spending confidently and spending with a low background hum of worry.",
        ],
      },
      {
        kind: "list",
        heading: "Working it out",
        ordered: true,
        items: [
          "Add up every current account balance. Not savings, unless you genuinely would spend them.",
          "Subtract anything protected: money set aside for tax, a deposit being held, an emergency fund you will not touch.",
          "Subtract every bill and subscription due before your next payday.",
          "Subtract anything you have committed to but not yet paid, such as a booking or a repair.",
          "What is left is the honest number. Divide it by the weeks remaining if you want a weekly figure.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why your banking app will not do this",
        paragraphs: [
          "Your bank knows what has left your account. It does not know that your car insurance renews on the eighteenth, that you promised to cover a shared bill, or that four hundred of that balance is quietly earmarked for tax.",
          "Available balance in a banking app usually means cleared funds, not uncommitted funds. Those are very different things, and the gap between them is where most unexpected shortfalls live.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why budgeting apps stop working around month two",
        paragraphs: [
          "Eighty one percent of people who set financial goals last year did not stick to them. The usual reason is not weak willpower. It is that most budgeting systems require constant categorising to stay accurate, and the moment you fall a week behind, the number on screen is wrong.",
          "Once the number is wrong, you stop trusting it, and once you stop trusting it, the whole thing is decoration. A system that survives is one that stays roughly right with very little upkeep.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The number should tell you when it is unsure",
        paragraphs: [
          "This matters more than it sounds. If a bill is missing its due date, any figure calculated from it is provisional, and you deserve to be told that rather than shown a confident number built on a guess.",
          "A tool that says this figure is preliminary because two bills have no date is far more useful than one that quietly rounds the uncertainty away.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Monthly Money Reset gives you one number for what is safe to spend this month and a rough weekly figure, and it is free. Personal Finance Companion does the same across your whole picture, subtracting protected money and upcoming obligations, showing the line by line explanation of how it reached the figure, and telling you plainly when a missing due date makes it preliminary. Start with the free one if you are not sure.",
      },
    ],
  },

  {
    slug: "how-to-find-every-subscription-you-are-paying-for",
    title: "How to find every subscription you are still paying for",
    dek: "A systematic sweep for the recurring payments you have forgotten, including the annual ones that are hardest to spot.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The subscriptions costing you the most are not the ones you think about. They are the ones you forgot, which is precisely why they are still running.",
          "Finding them takes about half an hour and needs one thing most people skip: a full twelve months of statements, not three. Annual subscriptions are the expensive ones and they are invisible in a quarterly view.",
        ],
      },
      {
        kind: "list",
        heading: "The sweep",
        ordered: true,
        items: [
          "Download twelve months of statements for every current account and credit card.",
          "Sort by merchant rather than by date, so repeats group together.",
          "Mark anything that appears more than twice at a similar amount.",
          "Separately scan for single larger charges around the same date each year, which is where annual renewals hide.",
          "Check app store subscriptions on every phone in the household, since these do not always appear as recognisable names.",
          "Search your email for renewal, receipt, subscription and your card's last four digits.",
        ],
      },
      {
        kind: "table",
        heading: "Where forgotten subscriptions usually hide",
        columns: ["Where", "Why it gets missed"],
        rows: [
          ["Annual renewals", "Appears once a year, never in a three month view"],
          ["App store billing", "Shows as the store, not the service"],
          ["Free trials that converted", "The first charge arrives long after you signed up"],
          ["Old cards still on file", "Charges continue on a card you replaced"],
          ["Services bundled with something else", "One line covers several products"],
          ["A partner's account", "Two people each paying for the same thing"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Decide with the annual figure, not the monthly one",
        paragraphs: [
          "Nine ninety nine a month is easy to keep. A hundred and twenty pounds a year is a decision. Same money, different question, and the annual figure is the one that tells you the truth about whether you want it.",
          "Multiply everything by twelve before you decide anything, and look at the total across all of them. That number is usually a surprise.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Cancelling is the easy part. Noticing is not",
        paragraphs: [
          "Nothing about this is difficult once you have found them. The reason people pay for years is not that cancelling is hard, it is that nothing ever brings the charge to their attention at a moment when they are thinking about it.",
          "Which is why doing this once is worth much less than having somewhere the list actually lives afterwards.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion holds your subscriptions alongside your bills and accounts, with what each costs annually rather than just monthly, and counts them against what is genuinely safe to spend. You can import a statement rather than typing them in. It will not cancel anything for you, and it will not let a renewal be the first time you remember one exists.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 2
  // Ten more, all of which scored a clean fit in the guide-to-product
  // verification, so none needed reframing. Several cross-link back to
  // batch 1 rather than restating it, which is what the inline link
  // support in the block model was added for.

  {
    slug: "how-often-home-systems-need-servicing",
    title: "How often things in your house actually need servicing",
    dek: "A reference table of real service intervals for the systems and appliances in a normal home, plus the jobs that belong to a season rather than a date.",
    readingTime: "9 min read",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most maintenance advice online is either a vague seasonal checklist or a manufacturer telling you to service something twice as often as it needs. What follows is the practical middle: how often things genuinely need attention in a normal house.",
          "Two rules before the table. Your own manual always wins, because a specific model may differ. And a job you have never done on a twenty year old system may need doing sooner than the interval suggests, because the interval assumes it was kept up.",
        ],
      },
      {
        kind: "table",
        heading: "Heating, cooling and water",
        intro: "The systems where neglect is most expensive, and where a missed service usually shows up in the coldest or hottest week of the year.",
        columns: ["Job", "Interval", "Why this interval"],
        rows: [
          ["Boiler or furnace service", "Annually", "Required by most warranties, and the check that catches unsafe combustion"],
          ["Replace HVAC filter", "1 to 3 months", "Depends on pets, dust and whether anyone in the house has allergies"],
          ["Flush water heater", "Annually", "Sediment builds from the first year and quietly destroys efficiency"],
          ["Water heater anode rod check", "Every 3 to 5 years", "The single cheapest way to extend a tank's life"],
          ["Bleed radiators", "Annually, before heating season", "Trapped air means cold tops and a system working harder than it should"],
          ["Service air conditioning", "Annually, before summer", "A failure in August takes far longer to fix than one in April"],
          ["Check and clean condensate drain", "Annually", "A blocked drain is a common and avoidable cause of water damage"],
        ],
      },
      {
        kind: "table",
        heading: "Structure, water ingress and safety",
        intro: "Cheap to do, expensive to skip. Nearly all water damage in homes starts with something on this list.",
        columns: ["Job", "Interval", "Why this interval"],
        rows: [
          ["Clear gutters and downpipes", "Twice a year", "Autumn after leaf fall, and spring after winter debris"],
          ["Inspect roof and flashing", "Annually", "Most roof failures start at a joint, not in the middle of a slope"],
          ["Reseal grout and caulk", "1 to 2 years", "Failed sealant lets water behind tile, where it is invisible for months"],
          ["Test smoke and CO alarms", "Monthly", "The only job here where the cost of skipping is not measured in money"],
          ["Replace smoke alarm units", "Every 10 years", "Sensors degrade whether or not the battery is fine"],
          ["Check for leaks under sinks", "Twice a year", "A slow leak rots a cabinet base long before anyone notices"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The jobs that belong to a month, not an interval",
        paragraphs: [
          "About a third of outdoor maintenance is seasonal rather than periodic. Winterising outdoor taps belongs before the first freeze, not three hundred and sixty five days after you happened to write it down. Blowing out an irrigation system belongs in autumn regardless of when it was last done.",
          "This is why generic reminder apps get ignored. Anything that tells you to winterise in July has told you something useless, and after the second or third useless reminder people stop reading them entirely.",
        ],
      },
      {
        kind: "list",
        heading: "Seasonal jobs, by when they belong",
        items: [
          "Before first freeze: shut off and drain outdoor taps, disconnect hoses, winterise irrigation.",
          "Autumn: clear gutters after leaf fall, service heating before you need it, check draughts.",
          "Spring: service cooling before summer, inspect the roof after winter, clear gutters again.",
          "Summer: exterior paint and timber, fencing, anything needing dry weather.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Start from the last done date, not from today",
        paragraphs: [
          "The most common mistake when setting up any maintenance schedule is to start every interval from the day you wrote the list. That schedules a boiler service twelve months from an arbitrary Tuesday rather than twelve months from the last actual service.",
          "If you know roughly when something was last done, use that. If you genuinely do not know, treat it as due, because for most of this list an unnecessary check costs an hour and a missed one costs considerably more. There is more on which of these bite hardest in [the maintenance you skip that costs the most](/guides/home-maintenance-you-skip-that-costs-the-most).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base already knows these intervals for well over a hundred common jobs, and knows which of them belong to a season instead. It works out what is worth doing now from when you last did it, rates each job by what happens if you skip it, and stays quiet about the rest. Snoozing something genuinely changes what it asks you about again.",
      },
    ],
  },

  {
    slug: "what-to-record-about-an-appliance-before-you-need-it",
    title: "What to write down about an appliance before something goes wrong",
    dek: "Five fields, recorded once while you can actually see the machine, that make every future repair faster and cheaper.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The worst moment to look for a model number is when the thing has already broken, usually in the dark, usually with a phone torch, usually behind something heavy.",
          "Five fields, written down once while the appliance is working and accessible, remove that moment permanently. It takes about two minutes per item and it is the highest return household admin there is.",
        ],
      },
      {
        kind: "list",
        heading: "The five fields",
        ordered: true,
        items: [
          "Make and model. The exact model, not the marketing name on the front.",
          "Serial number, where there is one. Warranty claims usually need it.",
          "When it was installed or bought.",
          "When the warranty ends.",
          "When it was last serviced, and by whom.",
        ],
      },
      {
        kind: "table",
        heading: "Where the model number usually hides",
        intro: "The single most common reason people give up on cataloguing a house is not finding this. It is almost always in one of these places.",
        columns: ["Appliance", "Usually found"],
        rows: [
          ["Fridge or freezer", "Inside, on the side wall near the salad drawer, or behind the bottom grille"],
          ["Washing machine", "Around the inside of the door opening, or on the back panel"],
          ["Dishwasher", "On the edge of the door, visible only when the door is open"],
          ["Oven or cooker", "On the frame behind the door, or on a drawer runner underneath"],
          ["Boiler or furnace", "Inside the front cover, often on a sticker facing you when it is opened"],
          ["Water heater", "On the outer casing, usually a large label near the top"],
          ["Air conditioning unit", "On the outdoor condenser, on a plate facing the wall"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the serial number matters more than you expect",
        paragraphs: [
          "A model number tells a supplier which part fits. A serial number tells a manufacturer which production run yours came from, which matters for warranty claims and for recalls.",
          "Recalls are the underrated one. Manufacturers issue them regularly and reach owners through registration, which most people skip. If you have the serial number written down somewhere findable, you can check it against a recall list in a minute.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Photograph the plate rather than transcribing it",
        paragraphs: [
          "Model numbers are long, and they mix letters and digits in ways that are easy to get wrong in bad light. A photograph of the plate takes a second and is always right.",
          "Keep the photograph, but also type the model number somewhere searchable, because a photo buried in three years of camera roll is not findable when you need it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The best moment to do this is a move",
        paragraphs: [
          "Every fact about a house passes through your hands in the fortnight around moving in, and almost none of it gets written down. Meter readings, which utility is with whom, where the stopcock is, what came with the property.",
          "A year later the boiler needs servicing and nobody remembers who installed it. Recording it while it is in front of you takes minutes and saves an afternoon.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base asks for exactly these fields, and asks for the right ones per type of thing rather than the same form for a boiler and a lawnmower. It keeps the service history alongside them, so the next repair starts with facts. It stores what a document is and where you keep it, never the document itself, because no product on Draftpace accepts an upload.",
      },
    ],
  },

  {
    slug: "where-to-look-for-a-will",
    title: "Where to look for a will when you cannot find one",
    dek: "A search order for finding a will, what to do if there genuinely is not one, and why the executor matters before anything else.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Start with the places people actually keep wills, which are duller than you expect: a home filing box, a bedroom drawer, a safe, or with the solicitor who drafted it.",
          "Work through the list below in order. Most wills are found in the first three places, and the later entries exist because occasionally they are not.",
        ],
      },
      {
        kind: "list",
        heading: "The search order",
        ordered: true,
        items: [
          "The obvious places at home: filing box, desk, bedside drawer, safe, or a folder marked with anything official sounding.",
          "With a solicitor. Many firms store the original and issue the family a copy, so a copy at home may mean the original is elsewhere.",
          "A bank safe deposit box, if they had one. Access after a death usually requires the death certificate and proof of your authority.",
          "A national or regional will register, where one exists. Some countries maintain a central record of where wills are lodged.",
          "With the executor. If a family member was named, they may already hold it and not have mentioned it.",
          "Their accountant or financial adviser, who often knows whether a will exists even if they do not hold it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Read the executor clause before anything else",
        paragraphs: [
          "When you find it, the first thing to look for is not who inherits. It is who is named as executor, because that person has the legal authority to act and everybody else does not.",
          "If it is not you, several of the things you were about to do are not yours to do. That is usually a relief rather than a slight, and it saves a great deal of duplicated effort. There is more on what that role involves in [being named executor](/guides/named-executor-what-you-agreed-to).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you find more than one",
        paragraphs: [
          "Generally the most recent valid will is the one that counts, and a later will usually revokes earlier ones explicitly. Do not destroy the earlier versions. They can matter if the newest is challenged or turns out to be invalid.",
          "If two wills appear close together in date, or one is unsigned or unwitnessed, that is the point to get advice rather than to decide yourself.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If there genuinely is not one",
        paragraphs: [
          "Then the estate is distributed according to the intestacy rules where they lived, which are fixed and do not care what anybody intended. That often surprises families, because the rules rarely match what people assume, particularly for unmarried partners and stepchildren.",
          "This is also the moment most people realise how much of the picture was never written down anywhere, which is a separate and larger problem covered in [how to find someone's accounts](/guides/how-to-find-someones-accounts-after-they-die).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records where a will is kept, who drafted it, and who is named as executor, so this search never has to happen. It holds the location and the reference, never the document itself. It also produces a printed book, which is the format that actually survives the situation where somebody cannot get into an account.",
      },
    ],
  },

  {
    slug: "named-executor-what-you-agreed-to",
    title: "You have been named executor. Here is what you actually agreed to",
    dek: "What the role involves, how long it really takes, what you are personally liable for, and whether you can say no.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Being an executor means you are legally responsible for gathering everything somebody owned, paying what they owed, and distributing the rest according to their will. It is an administrative job with legal weight, and it usually takes many months.",
          "Most people find out they were named at the worst possible moment and have no idea what the role involves. Here is the honest version.",
        ],
      },
      {
        kind: "list",
        heading: "What the job actually involves",
        ordered: true,
        items: [
          "Find and secure everything: property, accounts, pensions, policies, possessions.",
          "Value the estate as at the date of death, which often needs professional valuations for property.",
          "Apply for the legal authority to act, called probate or its local equivalent.",
          "Settle debts and taxes before anybody inherits anything.",
          "Distribute what remains according to the will.",
          "Keep records of all of it, because beneficiaries are entitled to see the accounts.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "How long it really takes",
        paragraphs: [
          "Simple estates commonly take six to twelve months. Anything involving property, a business, overseas assets or a disagreement between beneficiaries takes considerably longer, and two years is not unusual.",
          "The slow parts are rarely the ones people expect. Waiting for probate, waiting for a property to sell, and waiting for tax clearance take far longer than any of the tasks you actually perform.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part worth taking seriously",
        paragraphs: [
          "Executors can be held personally liable for mistakes. Distributing the estate before debts are settled is the classic one: if a creditor appears afterwards, the shortfall can land on you rather than on the beneficiaries who already spent it.",
          "This is why the order matters, and why the standard advice is to wait out the statutory creditor notice period before distributing anything. It is also why executors of anything complicated usually involve a solicitor, paid from the estate rather than from their own pocket.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "You can say no",
        paragraphs: [
          "Being named does not oblige you to serve. You can decline, formally, provided you have not already started acting as executor. Once you have begun dealing with the estate, stepping back becomes much harder.",
          "Declining is not a betrayal. Somebody named you years ago, possibly before they had a business or a property abroad, and possibly before your own life got complicated. If you cannot give it the time, saying so at the start is far better than stalling for a year.",
        ],
      },
      {
        kind: "list",
        heading: "What to ask for immediately if you are acting",
        items: [
          "Certified copies of the death certificate, more than you think you need.",
          "The original will, not a copy.",
          "Twelve months of bank statements, which is the fastest way to find accounts and policies nobody mentioned.",
          "Details of any funeral plan already paid for.",
          "Contact details for their accountant, solicitor or adviser.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion exists so the person you would name never leaves you doing the search half of this job. It records what exists, where it is kept, and who should be told, and prints as a book somebody could follow. If you are currently executing an estate and finding out how little was written down, that is the argument for doing it for your own.",
      },
    ],
  },

  {
    slug: "the-if-something-happens-to-me-file",
    title: "The \"if something happens to me\" file, and what goes in it",
    dek: "What to leave behind so nobody has to reconstruct your life from the outside, and why it is not the same thing as a will.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A will says who gets what. It does not say which bank, which pension, where the deeds are, who your accountant is, or that there is a policy nobody knows about.",
          "That gap is what leaves families searching for months. The fix is a plain record of what exists and where it is kept, which takes a couple of evenings and is entirely separate from any legal document.",
          "More than half of adults have no estate documents at all. If that is you, this file is a far better place to start than a will, because it is useful immediately and requires nobody's signature.",
        ],
      },
      {
        kind: "list",
        heading: "What goes in it",
        intro: "Locations and references, not the documents themselves. This is a map, not a vault.",
        items: [
          "Where the will is, who drafted it, and who is named executor.",
          "Every bank and building society, with which accounts are where. Not passwords.",
          "Pensions, including old ones from former employers, which are the most commonly lost.",
          "Insurance policies: life, home, car, health, and anything bought through an employer.",
          "Property: where the deeds are, mortgage lender, and any leasehold details.",
          "Debts, including anything guaranteed for somebody else.",
          "Digital: which email is the recovery address for everything, and where the password manager is, without the master password.",
          "People: accountant, solicitor, adviser, and anybody who should be told.",
          "Anything that would surprise somebody, which is the most valuable line in the whole file.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What must not go in it",
        paragraphs: [
          "Passwords, PINs and full account numbers do not belong here, because this document is deliberately findable and that is the whole point of it.",
          "Record where the password manager is and who has recovery access, and stop there. A file that is safe to leave in a drawer is worth far more than a perfect one locked somewhere nobody can reach.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to keep it, and who should know",
        paragraphs: [
          "At least two people should know it exists and where it is. A perfect record nobody can find is the same as no record, and this happens more often than you would think.",
          "Paper is genuinely better here than a file on a laptop, because the laptop needs a password, the password is in the password manager, and the password manager is the thing they cannot get into.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do it in passes, not in one sitting",
        paragraphs: [
          "The reason this never gets done is that people treat it as a single overwhelming project. It is not. Bank accounts on one evening, pensions another, digital on a third.",
          "Any one of those passes on its own makes things meaningfully easier for whoever comes after. There is no version of this where a partial file is worthless.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "This file is what Personal Life Affairs Companion produces. It sequences the job so it has a beginning instead of being a folder of blank forms, works out which parts are even relevant to you, and prints a book somebody could follow. It records where things are kept and never the things themselves, because it cannot accept an upload at all.",
      },
    ],
  },

  {
    slug: "hotel-cannot-find-your-reservation",
    title: "The hotel cannot find your reservation. What to say",
    dek: "What to have open before you reach the desk, why the booking is usually there under something else, and how to keep the conversation short.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Nine times out of ten the reservation exists and is filed under something you did not expect: a different surname, the name of whoever paid, a third party booking site's own reference rather than the hotel's, or a slightly different spelling.",
          "So the goal at the desk is not to argue. It is to give them enough different ways to look it up that one of them works.",
        ],
      },
      {
        kind: "list",
        heading: "Have these open before you speak",
        intro: "On screen, not in an inbox you are still searching while somebody waits.",
        items: [
          "The confirmation reference, and separately the booking site's reference if you booked through one.",
          "The exact name it was booked under, which may not be yours.",
          "The dates, and the card used to pay.",
          "The confirmation email itself, which is the thing that ends most disputes.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "An opening that works",
        paragraphs: [
          "Something plain does the job: hello, I have a reservation with you and you are not able to find it. Can I give you a few ways to look it up.",
          "That sentence does two useful things. It states the problem without accusing anybody, and it moves straight to the thing that actually resolves it, which is alternative search terms. Change any of it. The point is having a first sentence at all, so the opening is not the hardest part.",
        ],
      },
      {
        kind: "list",
        heading: "Ways to ask them to search",
        intro: "Offer these one at a time. Front desk systems search differently from how you would expect.",
        ordered: true,
        items: [
          "The hotel's own confirmation number.",
          "The third party booking reference, which is often a completely different format.",
          "The surname of whoever paid, rather than whoever is staying.",
          "The card's last four digits.",
          "The dates alone, which often surfaces it when a name is misspelled.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If it genuinely is not there",
        paragraphs: [
          "Show the confirmation email, and ask what they can do tonight rather than what went wrong. The cause matters tomorrow. Where you sleep matters now.",
          "If they are full, ask them to find you a room at a comparable hotel, which is standard practice when a booking cannot be honoured. Get the name of who you spoke to and a reference before you leave the desk, because whoever you deal with next will not know any of this.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Then check what else this affects",
        paragraphs: [
          "If your stay moves, anything you booked around it may need a look. A dinner reservation, a transfer to the airport, a tour with a pickup at the hotel.",
          "This is the part that catches people the next morning rather than that night, and it is covered properly in [working out what else your trip depends on](/guides/what-else-your-trip-depends-on-when-something-changes).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion keeps every reference, provider and booking name in one place, so this conversation starts with facts rather than a search through six inboxes. It walks you through the exchange itself, including an opening line you can edit or replace, and it never tells you what to accept or settle for. Afterwards it shows you what else that change touched.",
      },
    ],
  },

  {
    slug: "what-goes-in-a-homeschool-portfolio",
    title: "What actually goes in a homeschool portfolio",
    dek: "What to include, what evaluators are really looking for, and how to build it through the year instead of in a panic in April.",
    readingTime: "8 min read",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A portfolio is a record that your child was educated. It is not a scrapbook of best work, and it is not a performance. Evaluators are generally checking that something coherent happened across the year, not judging whether it was excellent.",
          "Six jurisdictions make portfolios mandatory: Pennsylvania, Maryland, Ohio, South Carolina, Florida and the District of Columbia. Requirements differ, so check yours in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state) and with your state association.",
        ],
      },
      {
        kind: "list",
        heading: "The core contents",
        intro: "Most requirements are satisfied by these five things.",
        ordered: true,
        items: [
          "A log of educational activities, with reading materials named by title.",
          "Samples of work across the year, dated, from several points rather than one good week.",
          "A list of subjects covered and the materials or curriculum used.",
          "Attendance or days schooled, where your state counts them.",
          "Test results or an evaluator's written report, where required.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Include ordinary work, not only the best",
        paragraphs: [
          "The instinct is to include only the pieces you are proud of. Resist it. A portfolio of nothing but finished, perfect work tells an evaluator very little, and can even read as curated rather than representative.",
          "Include something from October and something from March on the same subject. Progress across a year is the single most persuasive thing a portfolio can show, and it is invisible if everything came from the same fortnight.",
        ],
      },
      {
        kind: "table",
        heading: "What to keep per subject",
        intro: "A rough guide. Adjust to what your state asks for.",
        columns: ["Subject", "Worth keeping", "How often"],
        rows: [
          ["Maths", "Worked problems showing method, not just answers", "A few pieces per term"],
          ["Writing", "A first draft and the final version of the same piece", "Two or three per year"],
          ["Reading", "A running list of books, finished and abandoned", "Ongoing"],
          ["Science", "Photographs of experiments, plus what was concluded", "Per topic"],
          ["History and humanities", "Anything with a date and an argument in it", "Per topic"],
          ["Art and practical", "Photographs, since the work itself rarely fits in a folder", "As produced"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Abandoned books belong on the reading list",
        paragraphs: [
          "A reading log that only contains finished books is a less honest record and, oddly, a less impressive one. A child who is allowed to stop reading something is a child who keeps starting things.",
          "Note what was abandoned and roughly why. It shows judgement developing, which is a more interesting thing to evidence than volume.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Build it as you go, or it will not exist",
        paragraphs: [
          "The failure mode is universal: nothing is kept until spring, and then a weekend disappears into reconstructing a year from undated worksheets and memory.",
          "A folder per child and a habit of dropping things in as they happen is enough. It does not need a system. It needs to take under a minute so it survives a bad week.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion keeps the log as you go and prints a record per child when you need one. It accepts backdated entries, because nobody logs every day on the day. It also includes short checks you can run at home to find out honestly whether something stuck, with four possible answers including not enough to say, which is the honest result more often than most tools admit.",
      },
    ],
  },

  {
    slug: "why-to-do-lists-make-it-worse",
    title: "Why to-do lists make things worse, and what helps instead",
    dek: "A list is a memory aid. The problem was never memory. Here is what the difficulty actually is and what works better.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The premise of a to-do list is that the hard part is remembering. For a great many people that is exactly backwards. The thing has been remembered constantly, at volume, for three weeks. Writing it down again adds nothing.",
          "What a list does add is a visible tally of everything not yet done, sorted by nothing, all equally urgent looking. So the tool intended to reduce the load becomes a daily reminder of the size of it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Three ways lists make it harder",
        paragraphs: [
          "First, they flatten. A two minute email and a four hour form appear as identical rows, so choosing between them costs energy every single time you look.",
          "Second, they accumulate. Anything genuinely difficult stays on the list while easier items pass through it, so over time the list becomes a concentrated record of what you have avoided.",
          "Third, they say nothing about starting. A row reading chase the refund tells you what the outcome should be and gives you no idea what the first physical action is, which is the only part that was ever difficult.",
        ],
      },
      {
        kind: "list",
        heading: "What actually helps",
        ordered: true,
        items: [
          "Show one thing, not everything. Almost nobody needs the full list at nine in the morning.",
          "Write the next physical action, as a verb. Call the number on the letter. Not chase the refund.",
          "Attach a real date, or none at all. Everything being due today means nothing is.",
          "Hold the context. What it is about, what you want, the two facts you will need, all visible while you do it.",
          "Let quiet be an answer. Some days genuinely need nothing from you, and a tool that cannot say so will invent work.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The streak is the worst part",
        paragraphs: [
          "Completion percentages, streaks and productivity scores all rest on the same assumption: that you will do more if you can see how much you are failing.",
          "For anybody already carrying a background hum of being behind, this is precisely wrong. It converts a neutral pile of admin into a running record of personal failure, and the reliable outcome is that the app gets deleted, along with the only record of what actually needed doing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The real question is not what, it is how to start",
        paragraphs: [
          "For most stuck tasks you already know exactly what needs doing. What you cannot do is hold the purpose, the outcome, and the details all at once while a stranger talks at you.",
          "Which is a working memory problem rather than a motivation problem, and it responds to having those things written down in front of you, not to being reminded again. That is worked through properly in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion shows what deserves attention now, derived from dates you set yourself, and says plainly when nothing does. It walks you through the things that are hardest to start, holding the context on screen. There is no streak, no completion percentage, and no counter of what you did not get to. Something you close halfway records nothing at all.",
      },
    ],
  },

  {
    slug: "why-your-available-balance-is-lying-to-you",
    title: "Why your available balance is lying to you",
    dek: "What banks mean by available, what they leave out, and why the number in the app is almost never the number you can spend.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Available balance in a banking app is a technical term. It means cleared funds, plus any overdraft you have, minus transactions that have already settled. It does not mean money that is free for you to use.",
          "The gap between those two ideas is where most unexpected shortfalls live, and it is entirely predictable once you know what the number leaves out.",
        ],
      },
      {
        kind: "table",
        heading: "What the number does and does not know",
        columns: ["Your bank knows", "Your bank does not know"],
        rows: [
          ["Money that has left the account", "That your car insurance renews on the eighteenth"],
          ["Payments that have settled", "That four hundred of this is set aside for tax"],
          ["Your arranged overdraft, added in", "That you agreed to cover a shared bill this month"],
          ["Standing orders it can see scheduled", "Annual subscriptions that will not appear for months"],
          ["The balance right now", "That a pending card payment has not landed yet"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The overdraft problem",
        paragraphs: [
          "Many banks include an arranged overdraft inside the available figure. That means the number can be several hundred higher than the money you actually have, and nothing on screen distinguishes the two.",
          "It is worth finding out once whether yours does this. It changes how you should read every balance you have looked at for years.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Pending transactions cut both ways",
        paragraphs: [
          "A card payment can sit pending for days. Some banks subtract it from available immediately, some do not, and hotel or car hire pre-authorisations can hold amounts far larger than the final charge.",
          "So the balance can be pessimistic and optimistic at once: reserving money that will be released, while ignoring a direct debit due on Friday.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The number worth having instead",
        paragraphs: [
          "What you actually want is balance, minus protected money, minus everything committed before your next payday. That is usually a lot smaller than the app's figure, and it is the only one you can spend against without a background hum of worry.",
          "The method for working it out is in [how much of your money is actually safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A good figure admits when it is unsure",
        paragraphs: [
          "If a bill has no due date recorded, any figure built on it is provisional, and you should be told that rather than shown a confident number resting on a guess.",
          "This is the difference between a tool you can act on and a tool you check and then second guess. Being told a figure is preliminary because two bills are missing dates is far more useful than having the uncertainty quietly rounded away.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion works out what is genuinely available by subtracting protected accounts and upcoming obligations from your real balances, then shows the line by line explanation of how it got there. When a bill is missing a due date it says the figure is preliminary rather than pretending otherwise. Monthly Money Reset does a simpler version of the same thing, free, if you want to start there.",
      },
    ],
  },

  {
    slug: "why-budgeting-apps-stop-working-after-two-months",
    title: "Why budgeting apps stop working after about two months",
    dek: "Eighty one percent of people abandon their financial goals. The reason is usually the tool's design, not the person using it.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Around eighty one percent of people who set financial goals last year did not stick to them. That number is usually presented as a discipline problem. It is mostly a design problem.",
          "Almost every budgeting tool requires continuous manual upkeep to stay accurate. Miss a week of categorising and the figures on screen are wrong. Once they are wrong you stop trusting them, and once you stop trusting them the app is decoration.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The maintenance burden is the whole problem",
        paragraphs: [
          "The setup is genuinely enjoyable. Categories, budgets per category, a clean dashboard. That is the part that gets designed carefully, because it is what people see when deciding to sign up.",
          "Week six is not designed for at all. Week six is a fortnight of uncategorised transactions, three splits you never finished, and a dashboard confidently reporting a number you know is nonsense. Nothing in the product acknowledges that this is the normal state of things.",
        ],
      },
      {
        kind: "list",
        heading: "Four ways they break",
        ordered: true,
        items: [
          "They require categorising every transaction, which is a chore with no visible reward.",
          "They treat a missed week as a data problem for you to repair rather than a normal thing that happens.",
          "They present precise figures built on incomplete data, without ever saying so.",
          "They add streaks and scores, so falling behind becomes a judgement rather than a gap.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Rigid budgets fail for a separate reason",
        paragraphs: [
          "Envelope style budgets assume a stable month. Most months are not stable, and one unexpected cost breaks several categories at once. Repairing that takes more effort than the budget was saving.",
          "More than half of people who budget say the main reason is simply making sure essentials are covered. That is a much smaller question than a full category system, and it can be answered with far less upkeep.",
        ],
      },
      {
        kind: "list",
        heading: "What survives past month two",
        items: [
          "Answers one question well rather than modelling everything.",
          "Stays roughly right with very little input.",
          "Says plainly when its own figure is incomplete.",
          "Has no streak, no score, and no way to be behind.",
          "Is still useful the week you ignore it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ask what happens when you stop paying attention",
        paragraphs: [
          "Whatever you use, this is the question worth asking before you invest a weekend in setup. Some tools degrade gracefully and are still broadly correct after a neglected fortnight. Others become actively misleading and then demand an hour of repair before they are any use again.",
          "Only the first kind is still installed a year later.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Monthly Money Reset answers one question, what is safe to spend this month, and is free. Personal Finance Companion holds the whole picture and tells you when its own figure is preliminary rather than presenting a confident number built on a gap. Neither contains a streak, a score, or a screen that tells you that you are behind, because that is the mechanism that gets these things deleted.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 3
  // The remaining tier one topics plus the strongest tier two. The two
  // cross-cutting pieces, life admin and why productivity tools fail at
  // it, are deliberately not here: they belong to the whole series
  // rather than to one area, which the Guide model cannot express yet
  // without calling them orphans, and an orphan means no product rather
  // than every product. That is a small model change to make on purpose
  // rather than to bodge around now.

  {
    slug: "the-task-that-has-been-on-your-mind-for-a-month",
    title: "The task has been on your mind for a month and still is not done",
    dek: "Why constant remembering does not turn into doing, and the specific thing that makes a stuck task start moving.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "You have not forgotten it. That is the confusing part. It arrives at eleven at night, in the shower, in the middle of something else, and it has been doing that for weeks.",
          "So the problem is not memory, and every tool built on the assumption that it is memory has failed you. Writing it down again does nothing, because it was never off the list.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The gap is between knowing and starting",
        paragraphs: [
          "Starting almost anything administrative requires holding several things at once: what this is about, what you want to happen, the two facts you will need, and enough spare capacity to think while somebody talks at you.",
          "That is a working memory load, and it is heaviest at exactly the moments you tend to attempt these things, which is late, tired, and already carrying the day. The task is not hard. Assembling the conditions to begin it is.",
        ],
      },
      {
        kind: "list",
        heading: "The two questions that unstick most things",
        ordered: true,
        items: [
          "What is the next physical action? Not the outcome. Call the number on the letter, find the reference in the email, open the form. If you cannot name a physical action, that is why it has not moved.",
          "What would have to be in front of me to do that? Usually a reference number, a date, and a decision about what you want. Get those into one place and the task shrinks to something you can actually attempt.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The thing gets heavier the longer it sits, but not for the reason you think",
        paragraphs: [
          "The task itself does not change. What changes is that it acquires a story: that you have avoided it for a month, that this says something about you, that starting now means admitting to the delay.",
          "That accumulated weight is not part of the job. It is worth naming, because it is usually the larger of the two things stopping you, and it is the one that disappears the moment you do anything at all.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Aim for a smaller thing than finishing",
        paragraphs: [
          "Finding the reference number is progress. Getting through the opening sentence of a call is progress. Neither finishes anything and both remove the part that was actually blocking you.",
          "If the thing is a call you have been dreading specifically, the preparation that helps is set out in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built for this gap rather than for remembering. You put the thing down once, it brings it back when it actually matters, and when you are ready it walks you through it, holding the purpose and the outcome on screen so you are not carrying them. Nothing in it counts how long something sat.",
      },
    ],
  },

  {
    slug: "task-paralysis-what-to-do-in-the-next-ten-minutes",
    title: "Task paralysis: what to do in the next ten minutes",
    dek: "When you cannot start anything at all, the useful move is smaller than a plan. A short way out that does not require motivation.",
    readingTime: "5 min read",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Task paralysis is the state where you know exactly what needs doing, you have time to do it, and you cannot begin any of it. It is not the same as procrastination, because there is no pleasant alternative you are choosing instead. You are frozen between options, usually doing nothing you enjoy either.",
          "The way out is not a better plan. Planning is more deciding, and deciding is the thing that has jammed. What helps is making the next action so small that it does not require a decision.",
        ],
      },
      {
        kind: "list",
        heading: "The next ten minutes",
        ordered: true,
        items: [
          "Pick anything, badly. Which task you choose matters far less than choosing one. Two roughly equal options usually are roughly equal.",
          "Cut it until it is almost insultingly small. Not do the taxes. Open the folder. Not call the landlord. Find the number.",
          "Do that, and only that. If momentum arrives, use it. If it does not, you have still moved.",
          "Write down where you stopped, in one line, so returning does not mean reconstructing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why choosing is the hard part",
        paragraphs: [
          "When several things are all somewhat urgent and none has an obvious first step, every one of them costs energy to evaluate. Look at a list of nine of those and you can spend twenty minutes deciding and finish with nothing done and less capacity than you started with.",
          "This is why a long list makes paralysis worse rather than better. The fix is to look at one thing, not to see everything more clearly.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Lower the bar rather than raising the pressure",
        paragraphs: [
          "The instinct is to increase stakes: promise yourself a deadline, imagine the consequences. That reliably raises the wall rather than lowering it, because the problem was never that you did not care enough.",
          "Making the first action smaller works. Making the consequences larger does not, and usually adds dread to a task that already had plenty.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If nothing moves today",
        paragraphs: [
          "Then nothing moved today, and the tasks are exactly where they were, indifferent to it. What matters is that tomorrow does not start from zero, which is entirely about whether you left yourself a note about where you stopped.",
          "More on that in [picking something back up after abandoning it](/guides/picking-something-back-up-after-abandoning-it).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion has a procedure for exactly this, for when something is too big to start. It breaks a thing down into a first action you can actually do, and shows one thing at a time rather than a list to evaluate. If you get partway and stop, it records nothing at all about the attempt.",
      },
    ],
  },

  {
    slug: "just-bought-a-house-what-to-record-in-week-one",
    title: "You just bought a house. What to record in the first week",
    dek: "Everything about a home passes through your hands once, during the move. Here is what to capture before it disappears.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is a short window, roughly the fortnight around moving in, when every fact about a house is either in front of you or one phone call away. The previous owner is still reachable. The surveyor's report is still open on your laptop. The boiler manual is still in a drawer rather than lost.",
          "After that window, each of those facts costs an afternoon to recover, and some are gone permanently. This is the highest return hour of admin in the whole process.",
        ],
      },
      {
        kind: "list",
        heading: "Day one, before anything else",
        intro: "These are time sensitive in a way the rest are not.",
        ordered: true,
        items: [
          "Meter readings for gas, electricity and water, photographed with the date visible.",
          "Where the stopcock, fuse box, thermostat and gas shut off are. Find them now, not during an emergency.",
          "Which utility supplier is on each service, and the account number if there is paperwork.",
          "Whether the alarm has a code, and who holds it.",
          "Test every smoke and carbon monoxide alarm, and note when the units expire.",
        ],
      },
      {
        kind: "list",
        heading: "Week one, while it is still accessible",
        items: [
          "Make, model and serial for the boiler, water heater, and every appliance that came with the house.",
          "When the boiler was last serviced, which is usually in a logbook near it or on a sticker.",
          "The age of the roof, windows and any major system, from the survey or the previous owner.",
          "Warranty end dates for anything recent, especially appliances left behind.",
          "Any tradesperson the previous owner recommends. This is worth more than it sounds and expires the moment you lose contact.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Read the survey once more, as a to-do list",
        paragraphs: [
          "The survey was read as a buying decision. Read it again now as a maintenance plan, because it is the only document that has systematically inspected the house and it usually names things that are fine now and will not be in three years.",
          "Pull out anything with a timescale attached and give it a date. That is a maintenance schedule somebody else already did the hard part of.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The insurance detail people miss",
        paragraphs: [
          "If the property will be empty for a stretch between completion and moving in, check what your policy says about unoccupancy. Many lapse or reduce cover after thirty days empty, and the period around a move is exactly when that bites.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What this saves you later",
        paragraphs: [
          "A year on, the boiler needs servicing and you know when it was last done and by whom. Something fails under warranty and you have the serial number. An engineer asks how old the system is and you have an answer.",
          "Which fields matter for each kind of thing, and where model plates hide, is covered in [what to record about an appliance](/guides/what-to-record-about-an-appliance-before-you-need-it).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base is built for exactly this capture, and asks for the right fields per type of thing rather than one form for a boiler and a lawnmower. It then works out what needs doing and when, from real service intervals, and stays quiet about the rest. You can import a list rather than typing everything in.",
      },
    ],
  },

  {
    slug: "seasonal-home-maintenance-without-the-pointless-jobs",
    title: "Seasonal home maintenance, minus the jobs that do not matter",
    dek: "A shorter seasonal list than most, built around what actually causes damage, and why generic reminders get ignored.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most seasonal checklists are padded. They read well, they run to forty items, and by item twelve most people have stopped. A shorter list that gets done beats a complete one that does not.",
          "What follows is the subset where timing genuinely matters, meaning the job belongs to a season rather than to a rolling interval, and skipping it in that season causes a real problem.",
        ],
      },
      {
        kind: "table",
        heading: "The jobs that actually belong to a season",
        columns: ["Season", "Job", "Why now specifically"],
        rows: [
          ["Before first freeze", "Shut off and drain outdoor taps, disconnect hoses", "A burst pipe inside a wall is the most expensive item on any home list"],
          ["Before first freeze", "Blow out or drain irrigation", "Water left in lines splits them, and you find out in spring"],
          ["Autumn", "Clear gutters after leaf fall", "Doing it before the leaves drop achieves very little"],
          ["Autumn", "Service heating", "Engineers are available in October and booked solid in January"],
          ["Autumn", "Check draughts and seals", "Cheapest possible efficiency work, and only findable when it is cold outside"],
          ["Spring", "Service air conditioning", "Same reason as heating, in reverse"],
          ["Spring", "Inspect roof and flashing", "After winter has done its worst, before summer storms"],
          ["Spring", "Clear gutters again", "Winter debris, plus whatever autumn missed"],
          ["Summer", "Exterior timber, paint, fencing", "The only window with reliably dry weather"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Everything else is an interval, not a season",
        paragraphs: [
          "Boiler servicing, water heater flushing, filter changes, grout and sealant, alarm testing. None of these care what month it is. They care how long since the last time.",
          "Treating them as seasonal is what produces the checklist telling you to flush a water heater every spring when it was done in November. Their real intervals are in [how often things actually need servicing](/guides/how-often-home-systems-need-servicing).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why generic reminders get ignored",
        paragraphs: [
          "Any system that tells you to winterise in July has told you something useless, and after two or three useless prompts people stop reading all of them, including the ones that mattered.",
          "The credibility of a reminder is the whole product. One well timed prompt a month beats twenty generic ones, and the difference is entirely whether the tool understands that a third of outdoor work belongs to a month rather than a countdown.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to skip without guilt",
        paragraphs: [
          "Most of the padding on published seasonal lists is either cosmetic, or so infrequent that treating it as annual is silly. Deep cleaning a dryer vent matters. Rearranging a garage does not, whatever the list says.",
          "If a job has no plausible failure attached to skipping it, it is a preference rather than maintenance, and it does not belong on the same list as the ones that flood a kitchen.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base already knows which jobs belong to a month and which belong to an interval, and works out what is worth doing now from when you last did it rather than from when you happened to add it. Each job carries a rating for what happens if you skip it, so a short list stays short and honest.",
      },
    ],
  },

  {
    slug: "beneficiary-forms-override-your-will",
    title: "Your beneficiary forms quietly override your will",
    dek: "Pensions and life insurance usually pass by nomination, not by will. The form you filled in on your first day at an old job may still decide who gets it.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most people assume a will decides everything. For a large share of what they own, it does not.",
          "Pensions, life insurance, and various other accounts pass to whoever is named on the plan's own beneficiary nomination. That nomination usually sits outside the estate entirely, which means the will never gets a say, no matter how recently it was written or how clearly it says otherwise.",
          "This is the single most common way somebody's intentions quietly fail to happen.",
        ],
      },
      {
        kind: "table",
        heading: "What passes how",
        intro: "Generalised, and details vary by country and provider, but the shape holds almost everywhere.",
        columns: ["Asset", "Usually passes by", "Does the will control it"],
        rows: [
          ["Workplace or private pension", "Beneficiary nomination, often at trustee discretion", "Usually not"],
          ["Life insurance policy", "Named beneficiary on the policy", "Usually not"],
          ["Jointly owned property", "Survivorship, depending on how it is held", "Often not"],
          ["Joint bank account", "Survivorship", "Usually not"],
          ["Sole bank accounts and possessions", "The estate", "Yes"],
          ["Anything held in trust", "The trust's own terms", "No"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why this goes wrong so often",
        paragraphs: [
          "Beneficiary forms are filled in once, usually during onboarding at a job, and then never looked at again. People marry, separate, have children and change jobs, and the form stays exactly as it was.",
          "The result is entirely predictable and still surprises everybody: a pension from a job somebody left fifteen years ago still names an ex-partner, or a parent who has since died, or nobody at all.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If the nomination is blank or out of date",
        paragraphs: [
          "A blank nomination usually means the provider decides, often using its own rules or trustee discretion, and the outcome may not be what anybody expected.",
          "Naming somebody who has died can push the money into the estate, which sounds fine until you remember that estates can be slower, may face different tax treatment, and are exposed to creditors in ways a direct nomination is not.",
        ],
      },
      {
        kind: "list",
        heading: "What to actually do",
        intro: "This is a short afternoon of work and it is close to the highest value hour in personal admin.",
        ordered: true,
        items: [
          "List every pension you have ever had, including from old employers. Most people underestimate this number.",
          "List every life insurance policy, including any provided through work.",
          "Ask each provider who is currently nominated. They will tell you.",
          "Update anything that is wrong, blank, or names somebody who has died.",
          "Write down where each nomination sits, so the next review takes ten minutes rather than an afternoon.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Then check it again after anything changes",
        paragraphs: [
          "Marriage, separation, a new child, a new job, a death in the family. Each of those is a moment when a nomination may now say the wrong thing, and none of them updates anything automatically.",
          "Nothing here is legal advice, and the rules genuinely differ by country and by scheme. What is universal is that you should know what your forms currently say, and most people do not.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records every pension and policy you have, where each one sits, and who is currently nominated on it, so the answer is somewhere findable rather than in a form you last saw in 2011. It records what exists and where it is kept, never the documents themselves, and it does not give advice on what any nomination should say.",
      },
    ],
  },

  {
    slug: "homeschool-records-when-you-have-kept-nothing-since-october",
    title: "It is March and you have recorded nothing since October",
    dek: "How to reconstruct a homeschool year honestly, what is genuinely recoverable, and how to make the rest of the year different.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "This happens to most homeschooling families at least once, and almost nobody writes about it, because published advice is aimed at the version of you who kept up.",
          "The good news is that more is recoverable than it feels like right now. The rest of it you can be honest about, which is a genuinely acceptable outcome.",
        ],
      },
      {
        kind: "list",
        heading: "What is actually recoverable",
        intro: "Work through these in order. Most families recover a usable picture of the year in an afternoon.",
        ordered: true,
        items: [
          "The physical work. Undated worksheets still tell you what was covered, and page numbers in a workbook tell you roughly how far you got.",
          "Where you are in each curriculum right now. Working backwards from your current position reconstructs the term with reasonable accuracy.",
          "Library records and reading history, which give you dated reading material without any effort.",
          "Photographs on your phone, which are dated, and which capture projects, trips and experiments better than any log would.",
          "Purchases. Receipts for books and materials date when a topic started.",
          "Your calendar, for co-op sessions, classes, trips and anything with a time attached.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Reconstruct honestly, do not invent",
        paragraphs: [
          "Write approximate dates as approximate. October to December, rather than a made up Tuesday. A record that says roughly when something happened is credible. A record with invented precision is not, and if anybody ever checks, the precision is what damages you.",
          "Evaluators and reviewers are, in general, looking for evidence that education happened. They are not forensic auditors, and a clearly reconstructed term marked as reconstructed is a normal thing to receive.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check what your state actually requires first",
        paragraphs: [
          "Before spending a weekend on this, find out what you genuinely need. Several states require nothing at all, in which case this is for your own use and can be as rough as you like.",
          "If you are in one of the six that mandate a portfolio, the requirements are specific and worth reading properly. Both are covered in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why it stopped in October",
        paragraphs: [
          "It is worth knowing, because otherwise it happens again in the second week of next term. Almost always the system was too heavy: a spreadsheet with nine columns, or a plan to write a paragraph a day about each child.",
          "Anything that takes more than about a minute does not survive a bad week, and every year contains several bad weeks. The version that lasts records three things: the date, the subject and roughly what part of it, and one word about how it went.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not backfill the whole year before restarting",
        paragraphs: [
          "The common failure now is deciding to reconstruct everything perfectly before recording anything new, and then doing neither.",
          "Start recording today, and reconstruct backwards in odd half hours. Today onwards is the part you can be accurate about, and it is the part that stops this happening again.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion accepts backdated entries, because nobody logs every day on the day, and it is built so that recording a day takes well under a minute. It has no completion percentage and no screen that tells you how many days you missed, which is the feature that makes people abandon record keeping in the first place.",
      },
    ],
  },

  {
    slug: "how-to-tell-whether-something-actually-stuck",
    title: "How to tell whether something actually stuck",
    dek: "Covering a topic and learning it are different. A low effort way to find out which happened, without turning your house into a school.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "You covered fractions in October. It is March. Do they know fractions? Most homeschooling parents genuinely cannot answer that, and the not knowing is more uncomfortable than any actual gap would be.",
          "Finding out does not require testing in the formal sense. It requires asking a small number of questions, some time after the teaching, and being willing to accept the answer.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ask later, not at the end of the lesson",
        paragraphs: [
          "Checking understanding immediately after teaching measures short term recall, which is nearly always good and tells you very little. The useful check happens weeks later, when whatever was going to fade has faded.",
          "This feels counterintuitive, because a check straight after a lesson produces flattering results. That is exactly why it is not worth running.",
        ],
      },
      {
        kind: "list",
        heading: "What a useful check looks like",
        items: [
          "Short. Six to eight questions is plenty, and more produces fatigue rather than information.",
          "Mixed. Some recall, some application, and at least one that asks them to explain rather than to produce an answer.",
          "Unannounced in tone. Not a test event, just a few questions over breakfast.",
          "Written down. What you learn is worth nothing in three weeks if you did not record it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Four honest results, not two",
        paragraphs: [
          "The temptation is to conclude either that they know it or they do not. There are really four outcomes, and the fourth is the one most systems refuse to report.",
          "It looked solid, so move on. It is worth another look, so revisit it. It is mixed, which usually means more practice rather than reteaching. Or there is not enough to say, because they answered two questions and you cannot conclude anything from two.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Not enough to say is a real answer",
        paragraphs: [
          "If a child answers three questions and gets two right, that is not sixty seven percent understanding. It is a sample too small to mean anything, and reporting it as a score invents confidence that does not exist.",
          "Any tool that turns three answers into a percentage is lying to you politely. The honest response is that you do not know yet, which is genuinely useful information because it tells you to ask again rather than to act.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The questions that ask them to explain matter most",
        paragraphs: [
          "A child can produce a correct number without understanding anything, particularly in maths, where a memorised procedure gets the right answer for a while and then collapses.",
          "The questions worth including are the ones where they have to say why. There is no single right wording for those, which is exactly why no answer key can mark them and why you are the only person who can judge it.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion includes short checks you can run at home, and reports one of four standings including not enough to say when too few questions were answered to conclude anything. It records the result against the topic so you can see it again later, and it never produces a score, a percentage or a comparison between children.",
      },
    ],
  },

  {
    slug: "organising-a-multi-stop-trip-without-a-spreadsheet",
    title: "Organising a multi-stop trip without a spreadsheet",
    dek: "Six in ten people spend over ten hours planning one trip. Most of that is spent rebuilding a picture that keeps falling apart.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "More than six in ten people spend over ten hours planning a single trip, and roughly two thirds end up dissatisfied with the result anyway. The hours do not mostly go into deciding where to go. They go into rebuilding the shape of the trip every time one detail changes.",
          "A spreadsheet is the usual answer and it half works. It holds the facts and knows nothing about how they relate, so when the flight moves it tells you nothing about what else just became wrong.",
        ],
      },
      {
        kind: "list",
        heading: "Record these four things per booking",
        intro: "This is the whole method. Everything else is detail.",
        ordered: true,
        items: [
          "What it is, with its provider and confirmation reference.",
          "When it starts, and when it ends if it spans time, such as a stay or a car hire.",
          "Which destination it belongs to.",
          "What it was booked around, if anything. This is the one everybody skips and the one that matters.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The fourth one is the whole point",
        paragraphs: [
          "A transfer is not merely a thing at two in the afternoon. It is a thing that exists because of a flight landing at one. A hotel check-in is not just a time, it is downstream of the transfer.",
          "Write that relationship down once, when you book, and you never have to reconstruct it. Skip it, and every disruption starts with working out from memory what was connected to what, usually in an airport. The method is set out in [what else your trip depends on](/guides/what-else-your-trip-depends-on-when-something-changes).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not build a full itinerary",
        paragraphs: [
          "An hour by hour plan for a two week trip is a document that is wrong by day three, and rewriting it is where most of those ten hours go.",
          "Record the fixed points, which are the things with a booking reference attached, and leave the rest genuinely open. The fixed points are the only part that breaks expensively when something moves.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "One place, not six inboxes",
        paragraphs: [
          "Confirmations arrive across several email accounts, a couple of apps and occasionally a screenshot. That is fine while nothing goes wrong and useless at six in the morning at a desk.",
          "The references are what you actually need under pressure, and they need to be somewhere you can read them in three seconds without searching.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Assume one thing will change",
        paragraphs: [
          "Something will move on almost every trip with more than three moving parts. Planning for that is not pessimism, it is the difference between an inconvenience and a ruined day.",
          "The practical version of planning for it is simply having recorded what depends on what, before you needed to know.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion holds the whole trip in one place, including what each booking was built on top of. When something moves you record the change once and it shows you exactly what was downstream of it, unchanged, so you decide. It also prints as a blank book you can carry, for when the phone is the thing that failed.",
      },
    ],
  },

  {
    slug: "travel-documents-for-a-family",
    title: "Travel documents for a family: what to carry and where to keep it",
    dek: "What each traveller needs, what to check months before you go, and why a photograph of a passport is not a backup plan.",
    readingTime: "7 min read",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Travelling with other people means being responsible for documents that are not yours, usually including at least one person who cannot be responsible for their own.",
          "Two categories matter. What has to be checked well in advance, because it cannot be fixed at an airport, and what has to be findable on the day.",
        ],
      },
      {
        kind: "list",
        heading: "Check these months ahead",
        intro: "Every one of these has ended trips at check-in desks.",
        ordered: true,
        items: [
          "Passport expiry for every traveller. Many countries require six months validity beyond your return date, so an in-date passport can still be refused.",
          "Blank pages, which some countries require and which nobody thinks about.",
          "Visa or travel authorisation requirements, including electronic ones that are quick but not instant.",
          "Whether a child travelling with one parent, or with neither, needs documented consent. Rules vary and are enforced unevenly, which is worse than being enforced consistently.",
          "Name mismatches between passport and booking, which cause more problems than anything else on this list.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Passport validity catches people every year",
        paragraphs: [
          "The rule that surprises people is that many destinations require your passport to remain valid for six months after you arrive or leave. A passport expiring in four months is in date and still refused.",
          "Check every traveller, not just the adults. Children's passports are usually valid for fewer years and expire at unhelpful moments precisely because nobody is watching them.",
        ],
      },
      {
        kind: "list",
        heading: "What to have findable on the day",
        items: [
          "Passports, obviously, and it is worth agreeing who is physically carrying which.",
          "Booking references for flights, stays and transfers, readable without hunting through email.",
          "Travel insurance policy number and the emergency assistance phone number, which is the detail people have never once memorised.",
          "Any medication documentation, especially for anything that would raise questions at a border.",
          "One phone number per booking that a human will actually answer.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A photo of a passport is not a backup",
        paragraphs: [
          "It is useful for filling in forms and for proving to yourself what the number was. It is not a travel document, and it will not get anybody onto a plane.",
          "The genuinely useful record is knowing what exists and where it is right now. Whose passport is in which bag. Whether the insurance is under one person's name. Which parent is carrying which child's documents. That is the information that resolves a problem at a desk, and it is the part nobody writes down.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep something on paper",
        paragraphs: [
          "A phone at four percent in a taxi is a normal situation, not a rare one. Passport numbers, the insurance line and the key references on one printed page cost nothing and work when nothing else does.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion records what documents exist, whose they are, and where each one is kept, and can flag the ones worth showing in the trip summary. It never accepts an upload, because no product on Draftpace stores files, and passport scans are the single most sensitive thing any of them would hold if they did. It prints the lot as a blank book you can carry.",
      },
    ],
  },

  {
    slug: "you-missed-a-payment-what-to-do-next",
    title: "You missed a payment. What to do in the next 48 hours",
    dek: "What actually happens when a payment is missed, what to do first, and how to talk to a provider without it becoming a whole thing.",
    readingTime: "6 min read",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "One missed payment is usually a small problem treated as a large one. The consequences are mostly recoverable, and acting within a few days is what keeps them that way.",
          "Nothing here is financial advice, and if payments are being missed regularly rather than occasionally, that is a different situation where free debt advice services are genuinely the right call and are worth contacting early rather than late.",
        ],
      },
      {
        kind: "list",
        heading: "The first 48 hours",
        ordered: true,
        items: [
          "Confirm it actually failed. A payment can show as pending, be retried automatically, or have gone out of a different account than you think.",
          "Pay it now if you can. A payment a few days late is materially different from one a month late, and most reporting thresholds are measured in months rather than days.",
          "Check whether anything else is due before your next payday, so you are not solving one and creating another on Friday.",
          "Call them if you cannot pay it. Providers have far more discretion before an account defaults than after, and almost none of that discretion is offered to people who did not get in touch.",
          "Write down who you spoke to and what was agreed. This matters if a different person tells you something different next week.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What actually happens, roughly",
        paragraphs: [
          "A few days late usually means a failed payment fee and nothing else. Around a month late is generally when it starts being reported. Several months is where genuine credit consequences and default processes begin.",
          "The exact thresholds vary by country, provider and product type. The useful general point is that the gap between a few days and a month is enormous, and it is entirely within your control.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Calling them is the part people avoid",
        paragraphs: [
          "It is also the single most effective thing available, because providers have options before an account goes into arrears that they lose afterwards: payment holidays, revised dates, splitting a payment.",
          "If that call is the thing you have been putting off for a week, that is an extremely normal response to it, and the preparation that makes it easier is in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why it usually happens",
        paragraphs: [
          "Very rarely because somebody decided not to pay. Almost always because the balance looked fine on the day, and a payment that had already been committed had not left the account yet.",
          "That gap between what your balance says and what is genuinely yours is the actual cause, and it is explained in [why your available balance is lying to you](/guides/why-your-available-balance-is-lying-to-you).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion holds your bills with their due dates and counts them against what is genuinely available, so the number you are looking at already accounts for what has not left yet. When a bill is missing a due date it says so rather than quietly leaving it out of the figure. Monthly Money Reset does a simpler version, free.",
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
