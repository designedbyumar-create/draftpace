/**
 * Everything the printed book says.
 *
 * Separated from the layout so the writing can be reviewed as writing,
 * same reasoning as Homeschooling Companion's own handbookContent.ts.
 *
 * WHAT THIS BOOK IS ALLOWED TO SAY
 *
 * Method, not itinerary. How to travel with less held in your head, how
 * one change touches the next thing, and what to do on the day
 * something goes wrong. It never invents a schedule, never tells you
 * what your trip should include, and never implies a trip is being done
 * wrong. Nothing here was generated: every sentence was written by a
 * person, and there is no model involved anywhere in this product.
 */

export interface BookSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface Chapter {
  number: string;
  title: string;
  standfirst: string;
  sections: BookSection[];
}

export const METHOD: Chapter[] = [
  {
    number: "01",
    title: "Why one page still matters",
    standfirst:
      "A phone is the best travel tool ever built, until it is at four percent in a taxi with no charger, or the network drops the second you land, or someone hands it to a two year old for eleven minutes. None of that is rare. It is Tuesday.",
    sections: [
      {
        heading: "Paper does not need permission from anything",
        paragraphs: [
          "It does not need signal, battery, a login, or roaming to be switched back on. It works exactly the same in a taxi, a queue, and a hotel lobby with a password nobody wrote down. That is the entire case for it, and it is enough on its own.",
          "This is not an argument against the app. It is an argument for having both, so the trip does not depend on one device staying charged, connected, and in your hand for two weeks straight.",
        ],
      },
      {
        heading: "What belongs on paper, specifically",
        paragraphs: [
          "Not everything. The things worth writing down here are the ones you would actually need if your phone died at the worst possible moment: confirmation numbers, the name a booking was made under, who is travelling with you and what they need, and where the important documents actually are.",
        ],
        list: [
          "A confirmation number you can read to a stranger over a bad phone line.",
          "The name a booking is under, if it differs from how you think of it.",
          "Where a document actually is, not a photo of it, the physical thing.",
          "One phone number per booking that a human will actually answer.",
        ],
      },
      {
        heading: "This book is not a planner",
        paragraphs: [
          "A planner tells you what to do and when. This book has almost no opinions about your trip. It has opinions about how to hold the information you already have, so the trip is easier to run once it starts, whatever it turns out to involve.",
        ],
      },
    ],
  },
  {
    number: "02",
    title: "The chain reaction",
    standfirst:
      "Most trip problems are not the first thing that goes wrong. They are the second and third things, the ones that only exist because the first thing moved and nobody worked out what it touched.",
    sections: [
      {
        heading: "Nothing in a trip stands alone",
        paragraphs: [
          "A flight moves, and the transfer booked for the old arrival time is now wrong. The transfer is wrong, and the hotel check-in you told the front desk about is now inaccurate too. None of this is unusual. It is what a trip does the moment one piece of it changes, and it is completely predictable if you already know which things depend on which.",
          "The skill worth having is not preventing changes. Changes happen to every trip, including the ones that are planned perfectly. The skill is knowing, the moment one thing moves, exactly what else needs a look.",
        ],
      },
      {
        heading: "Draw the chain before you need it",
        paragraphs: [
          "For each booking, ask one question: if this changes, what is the very next thing that depends on it being right? A flight's next thing is usually a transfer or a check-in. A transfer's next thing is usually a check-in. A check-in's next thing is usually a dinner reservation or a plan for the evening.",
          "You do not need a diagram. You need one line per booking: this depends on that. Write it once, and every time something changes, you already know where to look next instead of working it out from scratch while standing in an airport.",
        ],
        list: [
          "What does this depend on, if anything?",
          "What depends on this, if anything?",
          "If this one thing changes today, what is the one thing I check first?",
        ],
      },
      {
        heading: "One thing at a time, not the whole trip at once",
        paragraphs: [
          "When something does change, resist dealing with everything downstream in one panicked pass. Handle the thing that changed first, decide the new fact, then move to whatever depended on it, one booking at a time. A trip rearranged calmly, one link at a time, ends up in the same place as one rearranged in a panic, and only one of those is a good afternoon.",
        ],
      },
    ],
  },
  {
    number: "03",
    title: "What is worth planning, and what is not",
    standfirst:
      "Over-planning and under-planning fail the same way: both leave you holding a plan that does not match the trip you are actually on. The useful middle is smaller than most people think.",
    sections: [
      {
        heading: "Plan the things with a real cost to being wrong",
        paragraphs: [
          "A flight, a hotel, a visa, a booking that sells out: these are worth planning properly, because getting them wrong costs money, time, or the trip itself. A plan for what to eat on Thursday is not in this category. If it goes wrong, you eat something else.",
          "The test is simple. Ask what actually happens if this is not planned at all. If the answer is nothing much, it does not need a page in this book.",
        ],
      },
      {
        heading: "Leave one day genuinely empty",
        paragraphs: [
          "Every trip has a day that goes sideways: a delay, an illness, weather, or simply a day nobody has the energy for the plan. A trip with no slack anywhere turns that one ordinary day into a crisis. A trip with one deliberately unplanned day just absorbs it and keeps going.",
        ],
      },
      {
        heading: "Decide your defaults before you need them",
        paragraphs: [
          "When a plan falls through, most of the stress is not the fallen-through plan, it is deciding what to do instead while everyone is standing around waiting. Decide now what a fallback afternoon looks like for this trip, and write it down. You will use it, and you will be glad it was already decided.",
        ],
      },
    ],
  },
  {
    number: "04",
    title: "The day something goes wrong",
    standfirst:
      "Not if. Almost every trip has one of these days. What makes it a manageable afternoon instead of a ruined day is usually not luck, it is having a shape for it decided in advance.",
    sections: [
      {
        heading: "Say what happened, once, in order",
        paragraphs: [
          "Whoever you end up talking to, whether it is an airline desk, a hotel manager, or a transport company, they can only help with the actual sequence of events. Work out what happened and say it once, cleanly, before you say what you want done about it. Leading with the ask before the facts almost always makes the conversation longer, not shorter.",
        ],
      },
      {
        heading: "Know what you need before you ask for it",
        paragraphs: [
          "Decide, before you speak to anyone, what would actually fix this for you. A seat on the next flight. A room for tonight. A refund. Confirmation in writing. Vague requests get vague answers, and a specific, reasonable ask is the fastest route through almost any desk.",
        ],
        list: [
          "What happened, in one or two sentences, in order.",
          "What you need to happen next, specifically.",
          "Your reference number, if you have one, before you're asked for it.",
        ],
      },
      {
        heading: "Get a name and a reference for everything",
        paragraphs: [
          "Before you hang up, walk away, or end the conversation, get the name of who you spoke to and a reference for the conversation itself. This is not about assigning blame later. It is the single fastest way to pick a problem back up where you left it if it is not finished by whoever comes after.",
        ],
      },
    ],
  },
  {
    number: "05",
    title: "A record worth having later",
    standfirst:
      "Almost everything worth remembering about a trip fits into a few facts, written down as they happen. Anything heavier than that gets abandoned by day three and helps nobody.",
    sections: [
      {
        heading: "Write it the day it happens",
        paragraphs: [
          "A note written the same day is a fact. A note written from memory a week later is a story, and stories drift. This matters less for what you had for dinner and much more for the things you will actually want later: what a document cost you in time to sort out, what a place was actually like to get to, whether a booking was worth what you paid for it.",
        ],
      },
      {
        heading: "The one line that is worth more than the rest",
        paragraphs: [
          "Somewhere in most trips there is a single sentence worth more than a page of logistics: the thing that went better than expected, the thing you would tell a friend planning the same trip, the mistake you will not make again. Write that one down every time you notice it. It is the part of this book you will actually reread.",
        ],
      },
      {
        heading: "What not to bother recording",
        paragraphs: [
          "Anything you would not want to know in a year is not worth the ink now. This is not a diary and it does not need to account for every hour. Three true, specific lines beat thirty vague ones, every time.",
        ],
      },
    ],
  },
  {
    number: "06",
    title: "Coming home",
    standfirst:
      "A trip is not finished when the last flight lands. The last useful thing you can do with it is close the loop, so the next trip, or the next trip to the same place, starts ahead rather than from zero.",
    sections: [
      {
        heading: "Write the lessons down while they are still obvious",
        paragraphs: [
          "The thing you will absolutely remember to book earlier next time is, in practice, exactly the thing you will forget by the time it matters again. Write it down in the week you get back, not eventually. A future trip to the same place, even years away, deserves to start with what this one already learned.",
        ],
      },
      {
        heading: "Decide what is worth keeping, and let the rest go",
        paragraphs: [
          "Not every document, receipt or confirmation needs to survive past the trip. Decide, honestly, what you would actually reach for again, and be comfortable letting the rest go once the trip is over.",
        ],
      },
    ],
  },
];

export const BOOK_TITLE = "My Trip Book";
export const BOOK_SUBTITLE =
  "A place to hold what you have booked, what changed, and what is worth knowing next time. Undated, so it works for any trip.";

/**
 * The working-page categories, matching trv_preparation's own check
 * constraint, so a blank template's checklist and a filled one's real
 * data never drift into different vocabularies.
 */
export const PREPARATION_CATEGORY_LABELS: Record<string, string> = {
  documents: "Documents",
  packing: "Packing",
  transport: "Transport",
  money: "Money",
  home: "Home",
  people: "People",
  bookings: "Bookings",
};

export const BOOKING_KIND_LABELS: Record<string, string> = {
  flight: "Flights",
  train: "Trains",
  car: "Car hire",
  transfer: "Transfers",
  hotel: "Stays",
  rental: "Rentals",
  activity: "Activities",
  restaurant: "Restaurants",
  event: "Events",
  other: "Other bookings",
};
