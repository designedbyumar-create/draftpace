/**
 * What each Companion does, as the homepage tells it: a headline in the
 * reader's own terms and four things it does, each with the fact it stands
 * on. The scenes pair the eight products two at a time, by the kind of life
 * they are for.
 *
 * Nothing here is invented. `evidence` is a phrase that must appear in the
 * product's own Shop listing, and homepagePosters.test.ts fails the build if
 * one stops being true there, so the homepage cannot promise what the
 * product page does not.
 */
export interface PosterBeat {
  lead: string;
  text: string;
  /** A phrase that must appear, word for word, in the product's own listing. */
  evidence: string;
}

export interface PosterContent {
  productSlug: string;
  areaSlug: string;
  headline: string;
  beats: [PosterBeat, PosterBeat, PosterBeat, PosterBeat];
}

export interface PosterScene {
  id: string;
  title: string;
  products: [PosterContent, PosterContent];
}

export const POSTER_SCENES: PosterScene[] = [
  {
    id: "everyday",
    title: "For the everyday.",
    products: [
      {
        productSlug: "personal-finance-companion",
        areaSlug: "money",
        headline: "How much of this is actually yours to spend?",
        beats: [
          { lead: "Every figure shows its working.", text: "Tap any number and see exactly how Draftpace got it, line by line.", evidence: "How Draftpace got this" },
          { lead: "See the month you are debt-free.", text: "A payoff plan for your debts, smallest first or highest rate first, with an extra amount you choose.", evidence: "payoff plan for your debts" },
          { lead: "Tick bills off for the month.", text: "Mark a bill paid and see what is left, with a typical month written out like a budget planner.", evidence: "Bills you can tick paid for the month" },
          { lead: "One next move, never a dashboard.", text: "An Attention inbox built only from real gaps in your own records: a bill with no due date, a stale balance.", evidence: "Attention inbox" },
        ],
      },
      {
        productSlug: "home-management-companion",
        areaSlug: "home",
        headline: "What does the house need this week?",
        beats: [
          { lead: "One sentence, not a dashboard.", text: "It answers whether anything needs you this week, in a sentence, and stays quiet the rest of the time.", evidence: "whether anything needs you this week" },
          { lead: "122 kinds of thing, written by hand.", text: "A care schedule that includes the jobs belonging to a season rather than a timer.", evidence: "122 kinds of thing" },
          { lead: "What to buy, on a card.", text: "Filter size, part number, bulb type: printed on one Item Card you take to the shop.", evidence: "what-to-buy line" },
          { lead: "Who came out, and what it cost.", text: "Service history kept against the people who did the work, and who you used last for that kind of job.", evidence: "who you last used for that category" },
        ],
      },
    ],
  },
  {
    id: "mind",
    title: "For how you think, and what you teach.",
    products: [
      {
        productSlug: "alongside",
        areaSlug: "mind-and-focus",
        headline: "The one thing to do next.",
        beats: [
          { lead: "Quiet until it matters.", text: "It surfaces what deserves your attention from dates and notes you set yourself, never invented.", evidence: "derived fresh every time from dates and notes you set yourself" },
          { lead: "Eight ways into the hard ones.", text: "Authored procedures for the situations hardest to start: a phone call, an email, chasing somebody up, a billing problem.", evidence: "eight authored procedures" },
          { lead: "Back to the exact question.", text: "Leave a run half finished and return to where you were, with no duplicate and nothing lost.", evidence: "Real resume" },
          { lead: "Words for the hard conversation.", text: "Suggested opening wording, editable in full, and never saved once you have used it.", evidence: "Suggested opening wording for the hardest conversations" },
        ],
      },
      {
        productSlug: "homeschooling-companion",
        areaSlug: "family-and-learning",
        headline: "A record for anyone who asks.",
        beats: [
          { lead: "A handbook you can hold.", text: "The Homeschool Year: a 30 page printed book in US Letter and A4, yours to print as often as you like.", evidence: "30 page printed book" },
          { lead: "Every child kept apart.", text: "Unlimited children, each with their own curriculum, subjects, plan, record and checks.", evidence: "unlimited children" },
          { lead: "Checks that keep the answers hidden.", text: "Printable check sheets of eight questions each, with the answer key at the back where the child cannot read it.", evidence: "answer key kept at the back" },
          { lead: "Your state's requirements, line by line.", text: "Set against what you have recorded, on the printed record.", evidence: "requirements, set line by line" },
        ],
      },
    ],
  },
  {
    id: "people",
    title: "For the people who depend on you.",
    products: [
      {
        productSlug: "personal-life-affairs-companion",
        areaSlug: "affairs-and-endings",
        headline: "Could anyone find it all if you couldn't?",
        beats: [
          { lead: "46 things, built by hand.", text: "Things that belong in order, across eight areas from documents to instructions.", evidence: "46 things" },
          { lead: "One question at a time.", text: "105 questions written to be answered in a sentence, and asked only where they apply to you.", evidence: "105 questions" },
          { lead: "A book to hand over.", text: "My Affairs, printed on your own device, blank to fill in or current with everything you have recorded.", evidence: "My Affairs: a printable book" },
          { lead: "Could someone else manage?", text: "A handoff check that asks by what they would be trying to do, not by how much you have finished.", evidence: "A handoff check" },
        ],
      },
      {
        productSlug: "family-health-binder",
        areaSlug: "family-health",
        headline: "Camp forms again? One page, every answer.",
        beats: [
          { lead: "Entered once, printed five ways.", text: "A Forms sheet, Caregiver sheet, Emergency card, Visit page and Intake summary, on US Letter.", evidence: "Five printable pages on US Letter" },
          { lead: "Allergies first.", text: "Each person is a card with their allergies as tags, and a note of what their forms sheet is still missing.", evidence: "what each one's forms sheet is still missing" },
          { lead: "Private means private.", text: "Mark anything private and it stays off every printed page, and each page says how many it left off.", evidence: "a count of what was left off" },
          { lead: "Questions for the doctor, written down.", text: "Plan a visit, list what to ask, and add what was said afterwards.", evidence: "the questions to ask before an appointment" },
        ],
      },
    ],
  },
  {
    id: "away",
    title: "For when you are away from it.",
    products: [
      {
        productSlug: "travel-companion",
        areaSlug: "travel",
        headline: "The flight moved. What depended on it?",
        beats: [
          { lead: "What else moves when one thing moves.", text: "Record a change and see what was built on top of it, one booking at a time.", evidence: "The change-impact walk" },
          { lead: "Nine things that can go wrong.", text: "Authored help for flight, hotel, transport and booking problems, and for something lost or stolen.", evidence: "nine authored situations" },
          { lead: "Every place on its own clock.", text: "Real time zones per place, so a booking across a date line is never wrongly called today.", evidence: "Real timezones per place" },
          { lead: "The whole trip on paper.", text: "My Trip Book: a structured printable planner covering every part of the trip, included.", evidence: "My Trip Book" },
        ],
      },
      {
        productSlug: "vehicle-maintenance-companion",
        areaSlug: "vehicles",
        headline: "Say what you'll pay before the shop starts.",
        beats: [
          { lead: "The Service Boundary.", text: "A dated, mileage-stamped page stating what is requested, the most you will agree to without a call, and that anything else is not authorized.", evidence: "Service Boundary" },
          { lead: "Every car on one strip.", text: "Add as many vehicles as you own. A strip of plates shows which one needs you.", evidence: "strip of plates" },
          { lead: "Usual jobs in one tap.", text: "Chosen from its fuel type, age, mileage and hard use, or typed in from your own manual.", evidence: "Usual jobs for a vehicle in one tap" },
          { lead: "History, paperwork, glove box.", text: "Every service kept by year, registration and insurance dates, and a one-page glove box card.", evidence: "glove box card" },
        ],
      },
    ],
  },
];
