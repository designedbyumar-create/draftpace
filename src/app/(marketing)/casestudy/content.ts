/**
 * The case study's text, kept out of the page component so the writing can
 * be read and edited as writing rather than picked out of markup.
 *
 * HONESTY RULES THIS FILE IS WRITTEN UNDER
 *
 * Three kinds of statement appear here and they are not allowed to blur
 * into each other:
 *
 *   - what was researched or observed before building
 *   - what was decided, and on what basis
 *   - what has actually been checked with people outside the project
 *
 * The last category is currently empty, and the page says so in its own
 * words rather than leaving a reader to assume otherwise. Anything
 * reconstructed after the fact carries a visible note saying so.
 */

export interface Section {
  id: string;
  label: string;
  /** Shown as the section heading. */
  heading: string;
  /** Optional standfirst, one or two lines, set larger than the body. */
  standfirst?: string;
  /** Body paragraphs. */
  body?: string[];
  /** An aside the reader should be able to tell apart from the narrative. */
  note?: { kind: "reconstructed" | "unverified" | "decision"; text: string };
  /** A pulled-out list, used sparingly. */
  list?: { head: string; text: string }[];
  /** A short quotation from the project's own written record. */
  quote?: { text: string; source: string };
}

export const INTRO = {
  eyebrow: "Case study",
  title: "I spent six years designing other people's products. Then I built my own.",
  standfirst:
    "Draftpace is seven products for the parts of life that are hard to keep track of. I did the thinking, the design, the writing and the build. This is the honest account of how it happened, including the parts I got wrong and the question I still cannot answer.",
  meta: [
    { label: "Role", value: "Product Designer and Creator. Sole owner of the work." },
    { label: "Timeline", value: "May to September 2026" },
    { label: "Status", value: "MVP frozen. Not yet sold to anyone." },
    { label: "Scope", value: "Strategy, product design, writing, visual system, build" },
  ],
};

export const SECTIONS: Section[] = [
  {
    id: "short-version",
    label: "The short version",
    heading: "The short version",
    standfirst: "If you only read one part, read this.",
    list: [
      {
        head: "I was designing screens when I wanted to be solving problems",
        text: "Six years of product design for other companies. The part I was good at was working out what to build. The part I was paid for was making it look right.",
      },
      {
        head: "Getting ill gave me the time to ask whether I wanted to keep doing it",
        text: "I left my job and spent months recovering. The answer was no, and the follow-up question was what was actually stopping me.",
      },
      {
        head: "I looked at the market before I built anything",
        text: "People were buying planners and templates in real numbers, and a lot of them were quietly disappointed afterwards. That gap was the opportunity.",
      },
      {
        head: "My first answer was better documents. I deleted it.",
        text: "It was a reasonable idea and it is still a good business, but it was not the answer to the problem I actually cared about.",
      },
      {
        head: "The second answer was products that do the remembering for you",
        text: "Seven of them, covering money, home, focus, family, personal affairs and travel.",
      },
      {
        head: "I built seven to test one thing",
        text: "Not seven ideas. One question: can a single foundation carry parts of life that have nothing in common? It can.",
      },
      {
        head: "The thing I have not proven is the important one",
        text: "Nobody outside this project has used it or paid for it. I can tell you the product works. I cannot yet tell you anyone wants it.",
      },
    ],
  },

  {
    id: "before",
    label: "Before any of this",
    heading: "Before any of this",
    body: [
      "I spent about six years designing products for other people. I was fine at it. But the part of the job I actually cared about was never the screens.",
      "What I liked was the bit before that. Working out what the real problem was. Deciding what should exist and what should not. Arguing about which of three ideas was worth building. By the time it reached the point where I was choosing spacing and states, most of the interesting thinking had already happened, usually in a meeting I was in but did not own.",
      "So I got good at the last stretch of a process whose beginning belonged to somebody else.",
    ],
  },

  {
    id: "question",
    label: "The question that started it",
    heading: "The question that started it",
    body: [
      "Then I got sick. I left my job and spent months recovering.",
      "A long enough gap makes you ask blunt questions, and the one I could not get away from was whether this was what I wanted to keep doing for the rest of my life. The answer came back as a flat no.",
      "The second question was more useful. If I can design products and work out problems, what is actually stopping me from building something of my own?",
      "I could not find an answer. That is the whole reason Draftpace exists.",
    ],
    note: {
      kind: "reconstructed",
      text: "This period sits in a four week gap in the project's history, between the first version going quiet in July and the rebuild starting on the first of August. The gap is visible in the record. The reasoning behind it is mine, told here for the first time.",
    },
  },

  {
    id: "market",
    label: "What I found in the market",
    heading: "What I found when I looked at the market properly",
    body: [
      "Before I built anything, I went and looked. Not at a report. At the actual places where these things are bought and sold.",
      "I read listings. I read the reviews under them, which is where people stop performing and say what actually happened. I read long forum threads where somebody describes the planner they bought in January and what state it was in by March. I went through competitor sites and the comments under their products.",
      "Two things were true at the same time, and the tension between them is the whole opportunity. A very large number of people were buying these things. A very large number of them were quietly disappointed a few weeks later.",
      "The disappointment had a shape. The upkeep was a second job. The thing did not fit the specific mess they actually had. And when they fell behind, the product turned into a record of failure, which is the point most people quietly close the file for good.",
    ],
    note: {
      kind: "reconstructed",
      text: "This research happened before the product was designed. I did not write it up at the time, which was a mistake. What you are reading is reconstructed from the decisions it produced and from my own memory of it, not from notes taken on the day.",
    },
  },

  {
    id: "first-answer",
    label: "My first answer",
    heading: "My first answer, and the business it became",
    body: [
      "My first conclusion was that the products were simply not good enough, and that the opening was to make far better ones. Carefully designed. Built around one specific situation instead of being a blank grid you have to fill in yourself.",
      "I still think that is true, and I still do it. That work continues under a separate name, WealthDrafts, which makes focused solutions for specific problems, including printables and small tools.",
      "But while I was thinking about my own life, I hit something that idea could not solve.",
    ],
  },

  {
    id: "turn",
    label: "The thing that changed my mind",
    heading: "The thing that changed my mind",
    standfirst: "A document can help you organise your life. It can also sit unopened.",
    body: [
      "You can forget to open it. You can forget to update it. You can forget which file you put the thing in. The system you bought to carry the load becomes one more thing you have to stay on top of.",
      "I want to be careful here, because the easy version of this story is that documents are bad, and that is not what I think. A document is an excellent answer to a problem with edges. A trip you are taking next month. A form you have to fill in once. A thing you want on paper.",
      "Different problems deserve different solutions. That is the actual principle, and it is why I kept both.",
      "The problems I had been circling did not have edges. Money does not finish. A house does not finish. The paperwork a family needs if something goes wrong does not finish. Those are not documents. They are ongoing, and they need something that keeps going with them.",
    ],
  },

  {
    id: "companions",
    label: "What I built instead",
    heading: "So I designed something that stays",
    body: [
      "The idea is not complicated. What if the product did the remembering?",
      "It holds your situation. It works out what actually needs you now. It tells you the one next thing rather than showing you a wall of everything. And when nothing needs you, it says so and stays quiet.",
      "There is one rule underneath all of it that I care about more than any feature. It never tells you that you are behind. There is no streak in any of these products, no completion percentage, and no screen that counts what you did not get to. If you disappear for a month, nothing punishes you when you come back.",
      "That came straight out of the reviews. Falling behind was the moment people quit. So I made falling behind cost nothing.",
    ],
    quote: {
      text: "It never tells you that you are behind.",
      source: "This is a promise the automated test suite actually enforces, not just a line of copy.",
    },
  },

  {
    id: "deleted",
    label: "Deleting the first version",
    heading: "Then I deleted the first version of my own product",
    body: [
      "By this point I had already built a working version of the old idea. A storefront, a catalogue, a checkout, marketing pages, the lot. It had shipped as a coming soon page.",
      "On the first of August I deleted almost all of it.",
      "I kept the pieces that were not tied to the old direction, the sign in, the legal pages, the theme switch, and rebuilt everything else. I wrote the rule down at the time so I could not argue with myself about it later.",
      "It is the decision I am most confident about. The old version was not bad work. It was work aimed at a problem I had stopped believing in, and keeping it would only have slowed down the thing I did believe in.",
    ],
    quote: {
      text: "Nothing was preserved because of sunk effort.",
      source: "Written into the project's decision record on the day of the rebuild.",
    },
  },

  {
    id: "how",
    label: "How I actually designed it",
    heading: "How I actually designed this, which is not how you are supposed to",
    standfirst: "There are no Figma files. There are no wireframes. I should be straight about that.",
    body: [
      "I designed by building the real thing and then living with it.",
      "I would decide what a product needed to do, build a working version, use it myself, and then go through it looking for what was wrong. Not what was ugly. What was wrong. Then I would fix that and go again. The written record of this project is mostly a record of those rounds.",
      "This has a real advantage. You cannot fool yourself with a picture of a product. A drawing of a screen always works, because nothing in it has to load, fail, be empty, or hold somebody's actual messy information. The moment you use the real thing, the problems introduce themselves.",
      "It also has a real cost, and I would rather name it than have somebody else point it out. Reviewing your own working product tells you a great deal about what you made and nothing at all about whether anybody else wants it. I got very good information about the thing and no information about the market.",
      "So: strong on judgement, weak on evidence. That is an accurate summary of this project's method.",
    ],
    note: {
      kind: "decision",
      text: "This was a choice, not an accident. Working alone, a drawing is a detour. Every hour spent drawing a screen is an hour not spent finding out how it behaves when the data is real.",
    },
  },

  {
    id: "seven-on-purpose",
    label: "Seven, on purpose",
    heading: "Why there are seven products and not one",
    body: [
      "This is the decision people will question most, so let me be exact about it.",
      "Building one product and calling the result a platform proves nothing. The whole bet was that one shared foundation could carry parts of life that have almost nothing to do with each other. Money is numbers and dates. A house is objects and seasons. Personal affairs is documents and people. Travel is a chain of things that fall over when one of them moves.",
      "If the same foundation could carry all of those without being bent out of shape each time, the idea was sound. If it could not, better to find out at product three than after spending a year on one.",
      "It held. The later products took less time than the earlier ones, which is the only honest measure of whether a foundation is real.",
    ],
    note: {
      kind: "unverified",
      text: "This tested whether the system could support different parts of life. It did not test whether anyone wants seven products, or which of them matters most. Those remain open.",
    },
  },

  {
    id: "wrong",
    label: "What I got wrong",
    heading: "Four things the product taught me I had wrong",
    standfirst: "These are the useful part. A case study where everything worked is not a case study, it is an advert.",
    list: [
      {
        head: "My own filing system did not survive contact with the products",
        text: "I had sorted everything by the need a person had, and built a whole page around it. Once seven products existed, six of them fell into one bucket and three buckets were empty. The categories were tidy in my head and useless in practice. I threw them out and sorted by area of life instead, which is how people describe their own problems anyway.",
      },
      {
        head: "I killed the best writing on the site because it was arguing the wrong point",
        text: "The homepage opened by explaining why one of my products beats a document. It was well written and I was fond of it. It was also the weakest thing I could lead with, because every piece of software claims to remember you, and because it measured us against a file rather than against a real competitor. Worse, it pushed the actual products most of the way down the page. I cut it and led with the parts of life instead.",
      },
      {
        head: "One of my favourite words already belonged to somebody else",
        text: "I had used a particular soothing adjective all over the product. Then I noticed it is also the name of a very large meditation company. It was both a collision and, on reflection, a slightly lazy word. It is now banned in the codebase and the tests fail if it comes back.",
      },
      {
        head: "I rejected my own first version of a product after building it",
        text: "The first version of the home product was a tracker for appliances and maintenance. Correct, and lifeless. I threw out the shape and rebuilt it around how somebody actually talks about their house, including letting them say what is wrong in their own words instead of picking a category.",
      },
    ],
  },

  {
    id: "system",
    label: "Designing it once",
    heading: "Designing it once instead of seven times",
    body: [
      "The thing I am proudest of is not a screen. It is that the sixth product was faster to build than the second.",
      "Every product shares the same spine. The same way of signing in and owning things. The same shell around the outside. The same set of places a product can have, so that moving between two of them does not feel like moving between two companies. One set of colours, spacing and type, with room for each product to have its own character on top.",
      "Halfway through the sixth product I noticed I was about to copy the guided walkthrough engine from an earlier one. That is the moment a system either forms or quietly rots. So I stopped, pulled the shared part out into one place, and rebuilt both products on top of it. Nothing a user could see changed. Everything after that got cheaper.",
      "The rules are enforced by tests rather than by discipline. If somebody uses a colour that is not in the set, or writes a banned word into public text, the build fails. I did that because I knew I would be the one to break the rules at two in the morning.",
    ],
  },

  {
    id: "ai",
    label: "Where AI fitted",
    heading: "Where AI fitted, since you will wonder",
    body: [
      "I used AI heavily as a build partner, and the project's own history records it on almost every change, so there is no point being coy about it.",
      "What that actually looked like: I decided what to build and why. I set the constraints and locked the decisions. I reviewed the working product and said what was wrong with it. The AI did a large amount of the writing of code against those decisions, and it was fast at it.",
      "The division shows up plainly in the record. The history is full of entries that say the founder rejected this scope, or corrected this after seeing it built, or overrode this decision after using the product. That is what my job was on this project. Judgement applied to a working thing.",
      "I do not think this makes the design work less mine. It made it possible to do at all, alone, at this size. But I would rather state it accurately than let somebody discover it and wonder what else was oversold.",
    ],
  },

  {
    id: "honest",
    label: "What I know and what I do not",
    heading: "What I actually know, and what I only believe",
    standfirst: "This is the section I would want to read first if somebody sent me a case study.",
    list: [
      {
        head: "Known: the system holds",
        text: "Seven products, six areas of life, one foundation. Later products cost less to build than earlier ones. This is demonstrated, not claimed.",
      },
      {
        head: "Known: it behaves correctly",
        text: "Close to two thousand automated checks run on every change, covering the product rules, the design system and the public writing.",
      },
      {
        head: "Believed: the market gap is real",
        text: "Based on reading listings, reviews and forum threads before building. Real research, informally done, and never turned into a documented study.",
      },
      {
        head: "Believed: people want this shape of product",
        text: "This is a hypothesis. It comes from the pattern in those reviews. Nobody has confirmed it by choosing this over the alternative.",
      },
      {
        head: "Unverified: the price",
        text: "Products sit at eighteen or twenty eight dollars. That came from my sense of how much is in each one and what the surrounding market looks like. There was no pricing research and no willingness to pay testing. It is a starting number, not a finding.",
      },
      {
        head: "Unverified: everything about real use",
        text: "No usability testing. No interviews. No customers. The people in my written descriptions of buyers are reasoned constructions, not real people I spoke to, and I have not pretended otherwise anywhere in this project.",
      },
    ],
  },

  {
    id: "next",
    label: "What happens next",
    heading: "What happens next, and why the MVP is frozen",
    body: [
      "I have frozen it deliberately, because the next question is not one more feature can answer.",
      "For four months the open question was whether I could design and build this. That question is closed. Seven products exist, they work, and they share one foundation.",
      "The open question now is whether real people want it, use it, and pay for it. Nothing I can add to the codebase will answer that. Only putting it in front of people will.",
      "So the next work is not product work. It is getting it in front of actual buyers, watching what they do with it, and being willing to be wrong about which of the seven matters. I expect to learn that one or two of them carry the whole thing and the rest were me proving a point to myself.",
    ],
  },

  {
    id: "state",
    label: "Where it stands today",
    heading: "Where it stands today",
    body: [
      "The MVP is frozen. Seven products, six areas of life, one free and six paid. A public site with a shop, a guides library, and the pages a real company needs. A signed in application with its own shell, notifications, and a place for everything somebody owns.",
      "It is a real product, built and shipped by one person over about four months, and it has not yet met a single customer.",
      "Both halves of that sentence are the point.",
    ],
  },
];
