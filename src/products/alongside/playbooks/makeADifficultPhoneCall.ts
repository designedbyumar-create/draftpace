import type { Playbook } from "../playbook";

/**
 * Make a difficult phone call.
 *
 * Its sibling handles calls that are hard to start. This one handles
 * calls that are hard to have: telling somebody something they will not
 * want to hear, saying no, money, or a person who has been difficult
 * before.
 *
 * WHAT THIS IS NOT
 *
 * Not negotiation coaching, not assertiveness training, and not therapy.
 * It never says what to accept, what to refuse, or what a reasonable
 * outcome would be, because the person on this end is the only one who
 * knows. What it does is take the four things somebody is trying to hold
 * at once, the purpose, the line they will not cross, the words to open
 * with, and permission to end the call, and put them on a screen.
 *
 * The one addition over the ordinary version is the step that asks what
 * they are not willing to agree to. Deciding that beforehand is the
 * difference between holding a position and improvising one while
 * somebody waits on the line.
 */
export const makeADifficultPhoneCall: Playbook = {
  key: "make-a-difficult-phone-call",
  title: "Make a difficult phone call",
  situation: "There is a call to make and it is not a straightforward one",
  opensFor: ["commitment", "thread", "waiting"],
  steps: [
    {
      key: "difficulty",
      kind: "choose",
      prompt: "What makes this one hard?",
      why: "It only changes what is worth having ready.",
      choices: [
        { value: "bad-news", label: "Telling them something they will not want to hear" },
        { value: "saying-no", label: "Saying no to something" },
        { value: "money", label: "Money is involved" },
        { value: "personal", label: "It is personal" },
        { value: "difficult-before", label: "They have been difficult about this before" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "who",
      kind: "write",
      prompt: "Who are you calling?",
    },
    {
      key: "outcome-wanted",
      kind: "write",
      prompt: "What do you want to be true when you put the phone down?",
      why: "The call may not go the way you expect. This is the thing to come back to if it wanders.",
      hint: "One line is enough.",
    },
    {
      key: "line",
      kind: "write",
      prompt: "Is there anything you are not willing to agree to?",
      why: "Deciding this now means you are not deciding it while somebody waits on the line.",
      optional: true,
      hint: "Skip this if there is nothing.",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having ready",
      why: "Put these where you can reach them before you dial.",
      items: [
        { text: "What you want to be true, written where you can see it" },
        { text: "A glass of water within reach" },
        { text: "Somewhere you will not be overheard", askIf: { step: "difficulty", equals: ["personal", "money", "bad-news"] } },
        { text: "What you were told before, and by whom", askIf: { step: "difficulty", equals: ["difficult-before", "money"] } },
        { text: "Two times you could call back, if now turns out to be wrong" },
      ],
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Getting the first sentence out is most of it. Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hi, it is me. There is something I need to tell you and it is not good news. Is now an all right time?",
          askIf: { step: "difficulty", equals: ["bad-news"] },
        },
        {
          text: "Hi, I have thought about it and I am not going to be able to do it. I wanted to tell you rather than leave you waiting.",
          askIf: { step: "difficulty", equals: ["saying-no"] },
        },
        {
          text: "Hi, I need to talk to you about money, which I would rather do directly than by email. Have you got a few minutes?",
          askIf: { step: "difficulty", equals: ["money"] },
        },
        {
          text: "Hi, there is something I would like to talk to you about. Is now a good time, or shall I call back?",
          askIf: { step: "difficulty", equals: ["personal", "other"] },
        },
        {
          text: "Hi, I am calling about this again. I would like to get it sorted today if we can. Can you look at what has happened so far?",
          askIf: { step: "difficulty", equals: ["difficult-before"] },
        },
      ],
    },
    {
      key: "during",
      kind: "during",
      prompt: "While you are on the call",
      why: "Short on purpose. Anything longer is unreadable while somebody is talking to you.",
      items: [
        { text: "Say the thing you came to say" },
        { text: "You are allowed to ask for a minute to think" },
        { text: "You are allowed to say you will call back" },
        { text: "Ask what happens next" },
        { text: "Write down anything that was agreed" },
        { text: "Get the name of who you spoke to", askIf: { step: "difficulty", equals: ["money", "difficult-before"] } },
      ],
    },
    {
      key: "result",
      kind: "outcome",
      prompt: "How did it go?",
      why: "Whatever you pick, this is the last thing it will ask.",
    },
  ],
};
