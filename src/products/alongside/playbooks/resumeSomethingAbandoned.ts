import type { Playbook } from "../playbook";

/**
 * Pick something back up.
 *
 * The playbook for the thread shape, and the only one of the eight whose
 * subject is the person's own half finished work rather than somebody
 * else's process.
 *
 * WHAT IT REFUSES TO ASK
 *
 * Why you stopped. That question has one honest answer for most people
 * most of the time, it is not a useful one, and asking it turns picking
 * something up into an account of why it was put down. What it asks
 * instead is whether anything was missing, which is the same information
 * in the form that can actually be acted on: a password nobody could
 * find, a document that never arrived, a decision somebody else had to
 * make first.
 *
 * The state question exists to be answered once. Written down here, it
 * is what the item shows next time, so the fortnight after this the
 * reconstruction does not have to happen again.
 */
export const resumeSomethingAbandoned: Playbook = {
  key: "resume-something-abandoned",
  title: "Pick something back up",
  situation: "Something was started a while ago and never finished",
  opensFor: ["thread", "commitment"],
  steps: [
    {
      key: "how-long",
      kind: "choose",
      prompt: "How long has it been?",
      why: "Only so this asks the right amount. Nothing here counts it against you.",
      choices: [
        { value: "weeks", label: "A week or two" },
        { value: "months", label: "A month or so" },
        { value: "longer", label: "Longer than that" },
        { value: "no-idea", label: "I have no idea" },
      ],
    },
    {
      key: "state",
      kind: "write",
      prompt: "Where did you get to?",
      why: "Written here, this is what you will see next time instead of having to work it out again.",
      placeholder: "Two of the four rooms are done",
    },
    {
      key: "missing",
      kind: "write",
      prompt: "Was anything missing last time?",
      why: "A password nobody could find, a document that never came, a decision somebody else had to make. If that thing is still missing, it is the actual next step.",
      optional: true,
      hint: "Skip this if there was nothing.",
    },
    {
      key: "smallest",
      kind: "write",
      prompt: "What is the smallest piece you could do next?",
      why: "Small enough that starting it is not a decision.",
      placeholder: "Find the paperwork and put it on the desk",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Before you start",
      items: [
        { text: "Everything from last time, out and in front of you" },
        { text: "The smallest piece, and nothing past it" },
        { text: "Somewhere to note what you find, so next time starts here", askIf: { step: "how-long", equals: ["months", "longer", "no-idea"] } },
        { text: "A look at whether it still needs doing at all", askIf: { step: "how-long", equals: ["longer", "no-idea"] } },
      ],
    },
    {
      key: "result",
      kind: "outcome",
      prompt: "How did that go?",
      why: "Whatever you pick, this is the last thing it will ask.",
    },
  ],
};
