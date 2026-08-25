import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Transport problem.
 *
 * Trains, rental cars and transfers, which fail in their own ways: a
 * missed departure, a no-show driver, a rental car that turns out
 * damaged or wrong. Grouped as one playbook rather than three, unlike
 * flight and hotel, because these three genuinely share a shape (a
 * provider, a booking, a person or vehicle that did not show up or was
 * not as agreed) in a way a flight and a hotel do not.
 */
export const transportProblem: Playbook = {
  key: "transport-problem",
  title: "Sort out a transport problem",
  situation: "A train, transfer or rental car has gone wrong",
  opensFor: ["train", "car", "transfer", "rental"],
  steps: [
    {
      key: "problem",
      kind: "choose",
      prompt: "What's happened?",
      why: "It decides what is worth having in front of you, so the rest of this only shows what applies.",
      choices: [
        { value: "no-show", label: "It didn't show up" },
        { value: "missed", label: "You missed it" },
        { value: "wrong-vehicle", label: "The car isn't what was booked" },
        { value: "damage-dispute", label: "A dispute about damage" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "wanted",
      kind: "write",
      prompt: "What do you need to happen?",
      why: "Worth deciding before you call. It is the thing that gets lost once the conversation starts.",
      placeholder: "A replacement transfer within the hour",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having in front of you",
      why: "Not a list to memorise. Put these where you can see them while you talk.",
      items: [
        { text: "Your booking reference" },
        { text: "Where you are right now" },
        { text: "The time it was meant to happen" },
        { text: "Photos of the vehicle, if you have them", askIf: { step: "problem", equals: ["wrong-vehicle", "damage-dispute"] } },
        { text: "The rental agreement", askIf: { step: "problem", equals: ["wrong-vehicle", "damage-dispute"] } },
      ],
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hello, I was expecting to be collected and nobody has arrived. Can you tell me what is happening?",
          askIf: { step: "problem", equals: ["no-show"] },
        },
        {
          text: "Hello, I missed this one. Can you tell me what my options are now?",
          askIf: { step: "problem", equals: ["missed"] },
        },
        {
          text: "Hello, the vehicle I have is not what I booked. Can you help me sort that out?",
          askIf: { step: "problem", equals: ["wrong-vehicle"] },
        },
        {
          text: "Hello, I would like to talk about some damage that is being raised. Can I explain what I know?",
          askIf: { step: "problem", equals: ["damage-dispute"] },
        },
        {
          text: "Hello, there is a problem and I am hoping you can help me sort it out. Can I explain what has happened?",
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
        { text: "Say what happened, once, in order" },
        { text: "Say what you need" },
        { text: "Ask for a reference number for this call" },
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
