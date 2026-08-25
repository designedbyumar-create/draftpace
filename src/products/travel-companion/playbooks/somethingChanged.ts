import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Something changed.
 *
 * No wording step and no during step, on purpose, the same reasoning
 * Alongside's own send-the-email playbook used: processing news of a
 * change is not a live conversation with anybody, so a script for one
 * would be filler.
 *
 * WHAT THIS DOES NOT DO YET
 *
 * It does not walk the dependency tree and show what else the change
 * might touch. That is the change-impact model (a later phase, built on
 * depends_on_booking_id), a structured feature rather than a
 * conversation. This playbook is the conversational half: helping
 * somebody record what changed and think through what it touches,
 * before that walk exists to do the finding for them.
 */
export const somethingChanged: Playbook = {
  key: "something-changed",
  title: "Deal with something that changed",
  situation: "A time, a place, or a plan moved on you",
  opensFor: ["flight", "train", "car", "transfer", "hotel", "rental", "activity", "restaurant", "event", "other"],
  steps: [
    {
      key: "kind",
      kind: "choose",
      prompt: "What changed?",
      why: "It decides what is worth thinking through, so the rest of this only shows what applies.",
      choices: [
        { value: "time", label: "The time or date moved" },
        { value: "cancelled", label: "It was cancelled outright" },
        { value: "location", label: "The place or provider changed" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "detail",
      kind: "write",
      prompt: "What is it now?",
      why: "Written down here, this is what you will see when you come back to it, instead of having to remember which email said what.",
      placeholder: "Moved from 18:30 to 23:10",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth thinking through",
      why: "Not a list to act on immediately. Just what is worth having in mind before you decide what to do next.",
      items: [
        { text: "Anything else booked around the old time" },
        { text: "Anyone counting on the old plan" },
        { text: "Whether the new time still works for you at all" },
        { text: "What you would need instead, if it doesn't", askIf: { step: "kind", equals: ["cancelled"] } },
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
