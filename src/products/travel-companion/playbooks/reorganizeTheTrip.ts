import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Reorganize the trip.
 *
 * No wording step and no during step: there is nobody to call, only a
 * decision to think through. The shape this borrows from is Alongside's
 * own "break something down", not its phone call playbooks, because the
 * difficulty here is the same one: too many moving parts to hold at
 * once, not a conversation to prepare for.
 */
export const reorganizeTheTrip: Playbook = {
  key: "reorganize-the-trip",
  title: "Reorganize part of the trip",
  situation: "Something needs re-planning, not just one call",
  steps: [
    {
      key: "kind",
      kind: "choose",
      prompt: "What kind of change is this?",
      why: "It decides what is worth checking, so the rest of this only shows what applies.",
      choices: [
        { value: "skip", label: "Skipping somewhere" },
        { value: "add-time", label: "Adding time somewhere" },
        { value: "swap", label: "Swapping one thing for another" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "change",
      kind: "write",
      prompt: "What are you changing it to?",
      why: "One line is enough. This is what you will see when you come back to it.",
      placeholder: "Two nights in Osaka instead of one",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth checking before you commit to it",
      why: "Not a list to act on immediately. Just what is worth having in mind first.",
      items: [
        { text: "What this does to the dates either side of it" },
        { text: "Any booking that assumed the old plan" },
        { text: "Anyone who needs to know before you change anything" },
        { text: "Whether anything already booked can even be changed", askIf: { step: "kind", equals: ["skip", "swap"] } },
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
