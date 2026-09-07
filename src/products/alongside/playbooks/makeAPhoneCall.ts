import type { Playbook } from "../playbook";

/**
 * Make a phone call.
 *
 * The first playbook, and the one the founder brief uses to explain the
 * whole product. It exists in Phase 1 to prove the engine end to end;
 * the other seven are authored once the engine is proven, so the content
 * is not written twice against a shape that turns out wrong.
 *
 * WHAT THIS PLAYBOOK IS FOR
 *
 * Not because the user does not know how to make a phone call. Because
 * holding the purpose, the desired outcome, the reference number, the
 * two things you must not forget, and the conversation itself, all at
 * once, in real time, while a stranger is talking, is a working memory
 * problem that has nothing to do with capability.
 *
 * Everything here externalises that load and nothing here explains how
 * to talk to people.
 *
 * THE WORDING RULE
 *
 * The suggested openings are openings. They get somebody past the first
 * fifteen seconds, which is the part people rehearse and dread. They
 * never suggest what to claim, what to accept, what to threaten, or what
 * a fair outcome would be. That is the user's call and they are the only
 * one with the facts.
 */
export const makeAPhoneCall: Playbook = {
  key: "make-a-phone-call",
  title: "Make a phone call",
  situation: "There is a call to make and it has been sitting there",
  opensFor: ["commitment", "thread", "waiting"],
  steps: [
    {
      key: "purpose",
      kind: "choose",
      prompt: "What is the call about?",
      why: "It decides what is worth having in front of you, so the rest of this only shows what applies.",
      choices: [
        { value: "information", label: "Getting information" },
        { value: "book", label: "Booking something" },
        { value: "cancel", label: "Cancelling something" },
        { value: "problem", label: "Fixing a problem" },
        { value: "chase", label: "Chasing something up" },
        { value: "complaint", label: "Making a complaint" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "who",
      kind: "write",
      prompt: "Who are you calling?",
      placeholder: "The energy company",
    },
    {
      key: "outcome",
      kind: "write",
      prompt: "What would a good result look like?",
      why: "Worth deciding before the call rather than during it. If the conversation wanders you have something to come back to.",
      placeholder: "A date for someone to come out",
      hint: "One line is enough.",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having in front of you",
      why: "Not a list to memorise. Put these where you can see them while you talk.",
      items: [
        { text: "Your account or reference number, if there is one" },
        { text: "A pen and something to write on, or this screen" },
        { text: "The dates involved", askIf: { step: "purpose", equals: ["problem", "chase", "complaint"] } },
        { text: "What you were told last time, and by whom", askIf: { step: "purpose", equals: ["chase", "complaint"] } },
        { text: "Any reference from a previous call", askIf: { step: "purpose", equals: ["chase", "complaint"] } },
        { text: "The dates that would work for you", askIf: { step: "purpose", equals: ["book"] } },
        { text: "When you want it to stop", askIf: { step: "purpose", equals: ["cancel"] } },
        { text: "Your address, if they will ask to confirm it" },
      ],
    },
    {
      key: "must-not-forget",
      kind: "write",
      prompt: "Is there anything you must not forget to say?",
      why: "This is the thing people remember in the car afterwards. Putting it here means it is on the screen while you talk.",
      optional: true,
      hint: "Skip this if there is nothing.",
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "The first fifteen seconds are the part people rehearse. Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hi, I am calling to ask about something. Is this the right team for that?",
          askIf: { step: "purpose", equals: ["information", "other"] },
        },
        {
          text: "Hi, I would like to book an appointment. Are you the right person for that?",
          askIf: { step: "purpose", equals: ["book"] },
        },
        {
          text: "Hi, I would like to cancel. Can you tell me what you need from me to do that?",
          askIf: { step: "purpose", equals: ["cancel"] },
        },
        {
          text: "Hi, I am having a problem and I am hoping you can help me sort it out. Can I explain what has happened?",
          askIf: { step: "purpose", equals: ["problem"] },
        },
        {
          text: "Hi, I called about this before and I am ringing to find out where it has got to. Can you look it up for me?",
          askIf: { step: "purpose", equals: ["chase"] },
        },
        {
          text: "Hi, I would like to make a complaint. Can you tell me how that works here, and who I need to speak to?",
          askIf: { step: "purpose", equals: ["complaint"] },
        },
      ],
    },
    {
      key: "ready",
      kind: "ready",
      prompt: "Ready to call?",
      why: "Calling now while it is fresh, or naming one exact time today. Either is a real answer.",
    },
    {
      key: "during",
      kind: "during",
      prompt: "While you are on the call",
      why: "Short on purpose. Anything longer is unreadable while somebody is talking to you.",
      askIf: { step: "ready", equals: ["call-now"] },
      items: [
        { text: "Say what you need" },
        { text: "Ask your main question" },
        { text: "Ask what happens next" },
        { text: "Ask when you should expect to hear" },
        { text: "Ask what they need from you" },
        { text: "Get a reference number for the call", askIf: { step: "purpose", equals: ["problem", "chase", "complaint", "cancel"] } },
        { text: "Get the name of who you spoke to", askIf: { step: "purpose", equals: ["problem", "chase", "complaint"] } },
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
