/**
 * Everything the printed handbook says.
 *
 * Separated from the layout so the writing can be reviewed as writing,
 * in a pull request, without anybody reading past a wall of StyleSheet
 * calls to find it. Same reason captures.ts sits beside
 * affairsKnowledge.ts in the Personal Life Affairs Companion.
 *
 * WHAT THIS DOCUMENT IS ALLOWED TO SAY
 *
 * Method, not standards. How to run a week, what to write down, how to
 * keep records, how to read a check honestly. It never says what a child
 * should know, never names a year or a grade as a target, and never
 * implies a family is behind. That was a founder decision and it is the
 * line this file is written against.
 *
 * The check sheets are the exception that proves it: they are questions,
 * not expectations, they are labelled with the topic they cover and not
 * with an age, and every one of them says the parent decides what a
 * right answer looks like.
 */

export interface Chapter {
  number: string;
  title: string;
  standfirst: string;
  sections: { heading: string; paragraphs: string[]; list?: string[] }[];
}

export const METHOD: Chapter[] = [
  {
    number: "01",
    title: "A week that survives a bad Tuesday",
    standfirst:
      "Most homeschool weeks do not fail because of a bad plan. They fail because the plan had no room in it for an ordinary bad day, and one missed morning turned into a fortnight of feeling behind.",
    sections: [
      {
        heading: "Plan four days, not five",
        paragraphs: [
          "Whatever your week looks like, leave one day of it unplanned. Not as a day off: as the day the dentist appointment goes, or the day you repeat Tuesday because Tuesday did not happen.",
          "A family that plans five days and manages four has failed at something every single week. A family that plans four and manages four has not. The work done is identical. Only one of them still wants to be doing this in March.",
        ],
      },
      {
        heading: "Put the hard thing first",
        paragraphs: [
          "Whatever the subject is that causes tears, resistance or a long silence, do it in the first hour. Not because it is the most important, but because it is the one that will not happen at four in the afternoon.",
          "This is worth being unsentimental about. The subject you keep meaning to get to is the subject you are avoiding, and moving it to the front of the day is the only reliable fix.",
        ],
      },
      {
        heading: "Decide in advance what a short day looks like",
        paragraphs: [
          "There will be days with an hour in them instead of four. Deciding now what you would do with that hour means you will actually use it, rather than writing the day off at nine in the morning.",
          "For most families the honest answer is reading and one piece of maths. Write yours down here so you are not deciding it while somebody is being sick.",
        ],
        list: [
          "On a short day we always do:",
          "On a very short day we always do:",
          "The thing we drop first is:",
        ],
      },
    ],
  },
  {
    number: "02",
    title: "What to write down, and what to leave alone",
    standfirst:
      "Record keeping goes wrong in two directions. Some families write nothing and cannot account for a year. Others build a system so heavy they abandon it by October and then have nothing either.",
    sections: [
      {
        heading: "The three things worth recording every time",
        paragraphs: [
          "Almost everything useful about a homeschool year fits into three facts, recorded as they happen and never reconstructed afterwards.",
        ],
        list: [
          "The date. Which day this actually was.",
          "The subject, and roughly what part of it. Not a lesson plan: Unit 3, Lesson 12 is enough.",
          "Whether it landed. One word. Easy, about right, or difficult.",
        ],
      },
      {
        heading: "The fourth thing, when it is worth it",
        paragraphs: [
          "Once in a while something happens that no log will capture. She finally understood fractions. He reads better lying on the floor than at a desk. A bad week turned out to be a cold and not a problem.",
          "Write those down the day they happen, in a sentence, in your own words. In three years they will be the only part of this you would not want to lose, and by next month you will have forgotten every one of them.",
        ],
      },
      {
        heading: "What not to record",
        paragraphs: [
          "Do not grade your own child. A percentage on a piece of work you set, marked by the person who taught it, measured against nothing, is not information. It is anxiety with a number attached.",
          "Do not record what you meant to do. A plan is not a record. A record is what happened, and its whole value is that it is true.",
        ],
      },
    ],
  },
  {
    number: "03",
    title: "Records somebody else may ask for",
    standfirst:
      "What you are required to keep depends entirely on where you live, and it changes. This is not legal advice and cannot be. What follows is the shape most requirements take, so that you are keeping the right kind of thing.",
    sections: [
      {
        heading: "Find out once, properly",
        paragraphs: [
          "Requirements vary enormously between countries, and between states or regions within them. Some ask for nothing at all. Some ask for attendance, some for a portfolio, some for annual assessment by a named person.",
          "Find your actual local requirement once, write it on the facing page, and stop guessing. Second hand advice from another family in another jurisdiction is the most common reason a family is caught out.",
        ],
        list: [
          "Where we live, we are required to:",
          "We must keep this for how long:",
          "Who we would show it to:",
          "When we checked this, and where:",
        ],
      },
      {
        heading: "The four kinds of thing usually asked for",
        paragraphs: ["Whatever the specific rule, requests tend to be for one of four things."],
        list: [
          "Attendance. Which days you schooled. The days schooled page at the back covers this.",
          "Subjects covered. What you taught, over what period.",
          "Work samples. A few pieces per subject, dated, kept as they were.",
          "Some form of annual review. Sometimes a test, often just a conversation.",
        ],
      },
      {
        heading: "Keep work as it was",
        paragraphs: [
          "Date every piece you keep, at the time, on the page. A folder of undated work is nearly worthless to anybody assessing a year, including you.",
          "Three or four pieces per subject per term is plenty for almost any purpose. Keeping everything is how a portfolio becomes a box in a cupboard nobody opens.",
        ],
      },
    ],
  },
  {
    number: "04",
    title: "Telling whether something landed",
    standfirst:
      "The hardest part of teaching your own child is that you are too close to see it. You know what they meant. You filled in the gap in their sentence without noticing. This is a chapter about getting an honest answer.",
    sections: [
      {
        heading: "Wait a week",
        paragraphs: [
          "Almost anything looks learned on the day. The only interesting question is whether it is still there a week later, and the only way to find out is to ask a week later.",
          "This is why the check sheets in this book are undated and reusable. Run the same one twice, a fortnight apart, and the second result tells you something the first could not.",
        ],
      },
      {
        heading: "Ask them to explain it, not to do it",
        paragraphs: [
          "A child can often perform a procedure they do not understand. Ask them to teach it back to you, or to say why the answer is what it is, and the difference shows up immediately.",
          "You are not looking for the words a textbook would use. You are looking for whether the shape of the thing is in their head.",
        ],
      },
      {
        heading: "Four questions is the floor",
        paragraphs: [
          "One question tells you nothing. Two tells you nothing. Somewhere around four questions on the same topic you can start to see a pattern, and even then you are seeing a pattern in four questions on one day.",
          "Below that, the honest conclusion is that you do not know yet, and saying so is a better answer than a guess dressed up as a result.",
        ],
      },
    ],
  },
  {
    number: "05",
    title: "Reading a check honestly",
    standfirst:
      "A short check you ran at your own kitchen table is a useful thing. It is not a test, not a measurement, and not a verdict on a child. Here is how to get the value out of it without taking more than it can give.",
    sections: [
      {
        heading: "What a result can tell you",
        paragraphs: ["Three honest conclusions, and a fourth that matters more than the others."],
        list: [
          "Looked solid. Most of it came back right. Worth moving on when you are ready.",
          "Mixed. Some of it is there and some is not. Usually means more practice, not going back.",
          "Worth another look. Most of it was missed. Go over it again before building on it.",
          "Not enough to say. Fewer than four questions on the topic. This is not a failure to conclude, it is the correct conclusion.",
        ],
      },
      {
        heading: "What it cannot tell you",
        paragraphs: [
          "It cannot tell you whether your child is behind. Behind what? Every publisher sequences differently, and the family down the road doing fractions in March is not evidence about anything.",
          "It cannot tell you whether they are gifted, struggling, or average. Eight questions on one morning is not that kind of instrument, and no honest one is that cheap.",
          "It cannot tell you whether you are doing a good job. That question is real, and this is not the thing that answers it.",
        ],
      },
      {
        heading: "Two results are worth four times one",
        paragraphs: [
          "The same topic checked twice, a few weeks apart, tells you the direction of travel. That is genuinely useful information and it is the main reason to keep these at all.",
          "One check is a snapshot. Two is a line. Nobody needs more than two to know what to do next.",
        ],
      },
    ],
  },
  {
    number: "06",
    title: "When it is not working",
    standfirst:
      "Every homeschooling family hits a stretch where a subject stops moving. Most of the time the problem is not the child and not the parent. Here is the order worth trying things in.",
    sections: [
      {
        heading: "Change the time before you change anything else",
        paragraphs: [
          "A subject that fails at two in the afternoon often works at nine in the morning with the same child, the same material and the same parent. Try this first because it costs nothing and works surprisingly often.",
        ],
      },
      {
        heading: "Then change the amount",
        paragraphs: [
          "Twenty minutes of maths that happens beats forty minutes that turns into an argument. Shortening a session is not lowering your standards, it is the standard being met.",
        ],
      },
      {
        heading: "Then go back one step",
        paragraphs: [
          "Almost every stuck topic is stuck because something underneath it is not solid. Fractions fail when division is shaky. Comprehension fails when reading is still effortful.",
          "Going back a step is not going backwards. It is usually the fastest route forwards, and it is the single most common fix.",
        ],
      },
      {
        heading: "Only then consider the material",
        paragraphs: [
          "If the same topic has come back twice, at a good time of day, in short sessions, with the thing underneath it solid, it may genuinely be that this explanation does not suit this child.",
          "Changing curriculum is expensive in money and in momentum, and it is the right answer far less often than the internet suggests. Try the first three things properly first.",
        ],
      },
    ],
  },
];

export interface CheckSheet {
  topicKey: string;
  subject: string;
  title: string;
  note: string;
  questions: string[];
  /** Answers are on the parent's page, never on the child's. */
  answers?: string[];
}

/**
 * The check sheets.
 *
 * Draftpace-authored questions, and the only educational content in this
 * whole product. Each one names the topic it covers and never an age,
 * because the same eight questions are right for a seven year old who is
 * ahead of a sequence and a ten year old who came to it late, and
 * printing a year on the page would tell one of them something untrue.
 *
 * Every sheet has eight questions because four is the floor for saying
 * anything and eight leaves room for two to be skipped.
 */
export const CHECK_SHEETS: CheckSheet[] = [
  {
    topicKey: "math.multiplication",
    subject: "Math",
    title: "Multiplication",
    note: "Ask for the answer out loud where you can. It is faster and you hear the hesitation.",
    questions: [
      "What is 6 times 7?",
      "What is 8 times 4?",
      "What is 9 times 6?",
      "A box holds 12 pencils. How many pencils in 5 boxes?",
      "What is 7 times 7?",
      "What is 11 times 3?",
      "If 4 times 6 is 24, what is 4 times 60?",
      "Explain how you would work out 15 times 4 without writing it down.",
    ],
    answers: ["42", "32", "54", "60", "49", "33", "240", "Parent decides. Look for a method, not a number."],
  },
  {
    topicKey: "math.fractions-equivalent",
    subject: "Math",
    title: "Equivalent fractions",
    note: "The last two matter most. A child can match fractions by rule without seeing why they are the same.",
    questions: [
      "Write a fraction that is the same as one half.",
      "Is 2/4 the same as 1/2?",
      "Is 3/9 the same as 1/3?",
      "Fill in the gap: 1/4 is the same as 2 over what?",
      "Which is bigger, 2/3 or 3/4?",
      "Write 6/8 in its simplest form.",
      "Draw two shapes that show 1/2 and 2/4 are the same amount.",
      "Explain why 5/10 is the same as 1/2.",
    ],
    answers: ["Any of 2/4, 3/6, 4/8", "Yes", "Yes", "8", "3/4", "3/4", "Parent decides", "Parent decides. Look for the idea of the same amount split differently."],
  },
  {
    topicKey: "math.place-value",
    subject: "Math",
    title: "Place value",
    note: "Place value is underneath almost all later arithmetic. It is worth checking again even when it looks settled.",
    questions: [
      "In the number 472, what does the 7 stand for?",
      "Write the number that is one hundred more than 350.",
      "Which is larger, 1,205 or 1,052?",
      "Write four thousand and sixty in figures.",
      "In 8,394, which digit is in the hundreds place?",
      "What is 10 less than 604?",
      "Put these in order, smallest first: 890, 809, 980, 908.",
      "Explain what changes when you put a zero on the end of 45.",
    ],
    answers: ["7 tens, or 70", "450", "1,205", "4,060", "3", "594", "809, 890, 908, 980", "Parent decides. Look for every digit moving up one place."],
  },
  {
    topicKey: "reading.comprehension-inference",
    subject: "Reading",
    title: "Working out what is implied",
    note: "Read the passage aloud together, then take the book away before asking. Inference is the part most often assumed rather than checked.",
    questions: [
      "Read a page of whatever they are reading now, then close the book.",
      "What had just happened before this page started?",
      "How was the character feeling? What in the writing made you think that?",
      "Was there anything the writer did not say outright but wanted you to know?",
      "What do you think happens next, and why?",
      "Was there a word you were not sure of? What do you think it meant?",
      "Who is telling this story? How do you know?",
      "If you had to tell somebody what this page was about in one sentence, what would you say?",
    ],
  },
  {
    topicKey: "writing.punctuation",
    subject: "Writing",
    title: "Punctuation",
    note: "Have them write the answers rather than say them. Punctuation is a written skill and hearing it proves nothing.",
    questions: [
      "Write this sentence with the right punctuation: what time is it",
      "Write this sentence with the right punctuation: i went to the shop with sam",
      "Where does the full stop go: The dog barked loudly at the postman",
      "Add the missing commas: I bought apples pears bread and milk.",
      "Write a sentence that needs a question mark.",
      "Write a sentence that needs an exclamation mark.",
      "What is wrong with this: she said i am going home",
      "Explain when you would use a capital letter in the middle of a sentence.",
    ],
    answers: ["What time is it?", "I went to the shop with Sam.", "After postman", "apples, pears, bread and milk", "Parent decides", "Parent decides", "Missing speech marks and a capital", "Parent decides. Names and places."],
  },
  {
    topicKey: "science.observation",
    subject: "Science",
    title: "Observing and describing",
    note: "This one has no right answers on purpose. You are checking whether they look carefully and say what they see rather than what they expect.",
    questions: [
      "Take any ordinary object outside. Describe it without naming it.",
      "What can you notice about it that you did not notice at first?",
      "How would you measure it? What would you use?",
      "What would you expect to happen if you left it in water?",
      "What makes you expect that?",
      "Is there anything about it you cannot explain?",
      "How is it different from the one we looked at last time?",
      "What would you want to find out about it if you had a whole day?",
    ],
  },
];

export const HANDBOOK_TITLE = "The Homeschool Year";
export const HANDBOOK_SUBTITLE = "A handbook and a set of working pages, for keeping track of what you actually do.";
