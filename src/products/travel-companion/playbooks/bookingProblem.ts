import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Booking problem.
 *
 * The flagship, and the founder's own example: "They can't find my
 * hotel reservation." This is the first Travel Companion situation
 * built, chosen to prove the shared engine against a second real
 * product, per the founder's own locked Phase 0 decision.
 *
 * CONTEXT PULL, NOT RE-ASKING
 *
 * This playbook never asks which booking it is about. Opening the
 * Companion from a specific booking passes that booking's own title,
 * provider and reference into the run's context label, which is what
 * the proposal's own "ask only for missing information" rule means in
 * practice: the engine already knows, so the content never asks again.
 *
 * NEVER INVENTS FACTS, NEVER PRETENDS TO CONTACT ANYONE
 *
 * Same rule as every playbook on this engine. Suggested wording gets a
 * traveller past the first sentence of an awkward phone call; it never
 * tells them what to accept, threaten, or settle for, because they are
 * the only one with the facts.
 */
export const bookingProblem: Playbook = {
  key: "booking-problem",
  title: "Sort out a booking problem",
  situation: "A booking isn't right, or they can't find it",
  // Any kind of booking can be missing, wrong, or wrongly charged.
  opensFor: ["flight", "train", "car", "transfer", "hotel", "rental", "activity", "restaurant", "event", "other"],
  steps: [
    {
      key: "problem",
      kind: "choose",
      prompt: "What's wrong?",
      why: "It decides what is worth having in front of you, so the rest of this only shows what applies.",
      choices: [
        { value: "not-found", label: "They can't find the reservation" },
        { value: "wrong-details", label: "The dates or details are wrong" },
        { value: "charged-wrongly", label: "Been charged incorrectly" },
        { value: "not-confirmed", label: "It hasn't been confirmed" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "wanted",
      kind: "write",
      prompt: "What would sort it?",
      why: "Worth deciding before the call. It is the thing that gets lost halfway through explaining what happened.",
      placeholder: "The booking found under the right name",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having in front of you",
      why: "Not a list to memorise. Put these where you can see them while you talk.",
      items: [
        { text: "Your confirmation number or reference, if you have one" },
        { text: "The dates of the booking" },
        { text: "The name it was booked under" },
        { text: "The email or card used to book, if you have it", askIf: { step: "problem", equals: ["not-found", "charged-wrongly"] } },
        { text: "What you were told before, and by whom", askIf: { step: "problem", equals: ["not-confirmed"] } },
      ],
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hello, I have a reservation with you and you are not able to find it. Can I give you a few ways to look it up?",
          askIf: { step: "problem", equals: ["not-found"] },
        },
        {
          text: "Hello, I have a booking with you and some of the details are not right. Can you pull it up so I can go through it with you?",
          askIf: { step: "problem", equals: ["wrong-details"] },
        },
        {
          text: "Hello, I have been charged for a booking and the amount is not what I was expecting. Can you look into it for me?",
          askIf: { step: "problem", equals: ["charged-wrongly"] },
        },
        {
          text: "Hello, I made a booking with you and I have not had confirmation. Can you tell me whether it went through?",
          askIf: { step: "problem", equals: ["not-confirmed"] },
        },
        {
          text: "Hello, I have a problem with a booking and I am hoping you can help me sort it out. Can I explain what has happened?",
          askIf: { step: "problem", equals: ["other"] },
        },
      ],
    },
    {
      key: "during",
      kind: "during",
      prompt: "While you are on the call",
      why: "Short on purpose. Anything longer is unreadable while somebody is talking to you.",
      items: [
        { text: "Say what you need" },
        { text: "Ask them to read the details back to you once it is found" },
        { text: "Ask for a reference number for this call" },
        { text: "Get the name of who you spoke to" },
        { text: "Ask what happens next, and by when" },
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
