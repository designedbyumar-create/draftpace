import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Something went wrong.
 *
 * The catch-all, same role Alongside's own "something else" situation
 * plays: for whatever does not fit the other seven. It stays deliberately
 * broad rather than trying to anticipate every possible situation, and
 * it never asks for anything medical, legal or safety-specific beyond
 * what the person volunteers, because this product has no standing to
 * give guidance on any of those.
 */
export const somethingWentWrong: Playbook = {
  key: "something-went-wrong",
  title: "Deal with something that went wrong",
  situation: "Something happened and you're not sure where it fits",
  steps: [
    {
      key: "kind",
      kind: "choose",
      prompt: "What kind of thing is this?",
      why: "It decides what is worth having in front of you, so the rest of this only shows what applies.",
      choices: [
        { value: "lost", label: "Lost something" },
        { value: "missed", label: "Missed something" },
        { value: "safety", label: "A safety concern" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "detail",
      kind: "write",
      prompt: "What happened?",
      why: "In your own words. One or two lines is enough.",
      placeholder: "Left the bag with the passports in the taxi",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having in front of you",
      why: "Not a list to memorise. Put these where you can see them while you deal with this.",
      items: [
        { text: "Any document numbers you can remember" },
        { text: "Where and roughly when this happened" },
        { text: "Your travel insurance details, if you have them" },
        { text: "The local emergency number, if this is genuinely urgent", askIf: { step: "kind", equals: ["safety"] } },
      ],
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hello, I need to report something lost. Can you help me with that?",
          askIf: { step: "kind", equals: ["lost"] },
        },
        {
          text: "Hello, I have missed something and I need to know what my options are.",
          askIf: { step: "kind", equals: ["missed"] },
        },
        {
          text: "Hello, I have something I need help with. Can I explain what has happened?",
          askIf: { step: "kind", equals: ["safety", "other"] },
        },
      ],
    },
    {
      key: "during",
      kind: "during",
      prompt: "While you are dealing with this",
      why: "Short on purpose. Anything longer is unreadable while this is happening.",
      items: [
        { text: "Say what happened, once, in order" },
        { text: "Say what you need" },
        { text: "Ask what happens next" },
        { text: "Get a reference number or a name" },
      ],
    },
    {
      key: "result",
      kind: "outcome",
      prompt: "Where does this leave things?",
      why: "Whatever you pick, this is the last thing it will ask.",
    },
  ],
};
