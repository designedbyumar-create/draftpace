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
