import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Contact someone.
 *
 * A message to a person, not a provider: a fellow traveller, somebody
 * waiting to collect you, somebody at home. The wording step exists
 * here for the same reason it exists in the provider-facing playbooks
 * (getting past the first sentence is most of it), but there is no
 * during step, the same reasoning as Alongside's own send-the-email:
 * sending a message is not a live event a checklist would help with.
 */
export const contactSomeone: Playbook = {
  key: "contact-someone",
  title: "Let somebody know",
  situation: "Somebody needs to hear about this from you",
  steps: [
    {
      key: "who",
      kind: "choose",
      prompt: "Who is this for?",
      why: "It decides what tone is worth suggesting, so the rest of this only shows what applies.",
      choices: [
        { value: "traveller", label: "Someone travelling with you" },
        { value: "waiting", label: "Someone waiting to meet you" },
        { value: "home", label: "Someone at home" },
        { value: "other", label: "Someone else" },
      ],
    },
    {
      key: "needed",
      kind: "write",
      prompt: "What do they need to know?",
      why: "One line is enough. The message step will use this to help you say it.",
      placeholder: "We're delayed and will land closer to midnight",
    },
    {
      key: "message",
      kind: "wording",
      prompt: "Your message",
      why: "Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Quick update: things have changed a bit. Wanted you to know before you plan around the old time.",
          askIf: { step: "who", equals: ["traveller"] },
        },
        {
          text: "Hi, just letting you know things have changed and I wanted you to hear it from me before you head out.",
          askIf: { step: "who", equals: ["waiting"] },
        },
        {
          text: "Hi, quick update on the trip so you're not wondering. Everything is being sorted, just later than planned.",
          askIf: { step: "who", equals: ["home", "other"] },
        },
      ],
    },
    {
      key: "result",
      kind: "outcome",
      prompt: "Did it reach them?",
      why: "Whatever you pick, this is the last thing it will ask.",
    },
  ],
};
