import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Hotel problem.
 *
 * Different again from a booking problem: this is not about the
 * reservation record, it is about the stay itself once you are there,
 * or about to be, in person, at a desk. The opening lines here assume a
 * face rather than a phone line, and the prepare step assumes you are
 * standing in a lobby, not sitting with a folder.
 */
export const hotelProblem: Playbook = {
  key: "hotel-problem",
  title: "Sort out a hotel problem",
  situation: "Something is wrong with a stay, or at check-in",
  opensFor: ["hotel"],
  steps: [
    {
      key: "problem",
      kind: "choose",
      prompt: "What's wrong?",
      why: "It decides what is worth having in front of you, so the rest of this only shows what applies.",
      choices: [
        { value: "room-not-as-described", label: "The room isn't what was booked" },
        { value: "late-checkin", label: "Need a later check-in or check-out" },
        { value: "overbooked", label: "They say there's no room" },
        { value: "unexpected-charge", label: "An unexpected charge" },
        { value: "noise-or-cleanliness", label: "Noise or cleanliness" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "wanted",
      kind: "write",
      prompt: "What would sort it?",
      why: "Worth deciding before you go to the desk. It is the thing that gets lost once the conversation starts.",
      placeholder: "Moved to a room that matches what was booked",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having in front of you",
      why: "Not a list to memorise. Put these where you can see them while you talk.",
      items: [
        { text: "Your confirmation number or reference" },
        { text: "The dates of the stay" },
        { text: "What the listing actually said, if you can pull it up", askIf: { step: "problem", equals: ["room-not-as-described"] } },
        { text: "The new time you need", askIf: { step: "problem", equals: ["late-checkin"] } },
        { text: "The receipt or statement showing the charge", askIf: { step: "problem", equals: ["unexpected-charge"] } },
      ],
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hello, the room isn't what I booked. Can you help me sort that out?",
          askIf: { step: "problem", equals: ["room-not-as-described"] },
        },
        {
          text: "Hello, I would like to ask about a later check-in or check-out. Is that something you can do?",
          askIf: { step: "problem", equals: ["late-checkin"] },
        },
        {
          text: "Hello, I have a confirmed reservation and I am being told there is no room. Can you look into what happened?",
          askIf: { step: "problem", equals: ["overbooked"] },
        },
        {
          text: "Hello, there is a charge on my bill I was not expecting. Can you go through it with me?",
          askIf: { step: "problem", equals: ["unexpected-charge"] },
        },
        {
          text: "Hello, I would like to raise something about the room. Can I explain what has happened?",
          askIf: { step: "problem", equals: ["noise-or-cleanliness", "other"] },
        },
      ],
    },
    {
      key: "during",
      kind: "during",
      prompt: "While you are at the desk",
      why: "Short on purpose. Anything longer is unreadable while somebody is talking to you.",
      items: [
        { text: "Say what you need" },
        { text: "Ask what they can actually do about it" },
        { text: "Ask for it in writing if anything is agreed" },
        { text: "Get the name of who you spoke to" },
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
