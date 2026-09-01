import type { Playbook } from "../playbook";

/**
 * Break something down.
 *
 * For the thing that is too big to start, which is a different problem
 * from the thing that is unpleasant to start. No opening line helps
 * here, because there is nobody to say it to.
 *
 * THE ONE RULE THIS PLAYBOOK ENFORCES
 *
 * The first step has to be physical. "Plan the move" is not a step,
 * it is the same problem in smaller handwriting. A phone call, an email,
 * opening a form, finding a document, measuring a room: those are steps,
 * because you can tell from the outside whether they happened.
 *
 * It asks for three and then asks which one is possible today, rather
 * than asking for a full plan. A full plan is another big thing to
 * produce, and producing it is how the afternoon goes.
 */
export const breakDownSomethingTooBig: Playbook = {
  key: "break-down-something-too-big",
  title: "Break something down",
  situation: "The whole thing is too big to start",
  opensFor: ["commitment", "thread"],
  steps: [
    {
      key: "thing",
      kind: "write",
      prompt: "What is the thing?",
      hint: "However you say it to yourself is fine.",
      placeholder: "Sort out the spare room",
    },
    {
      key: "done",
      kind: "write",
      prompt: "What would be true when it is finished?",
      why: "Big things stay big partly because nobody has said where they end.",
      placeholder: "The bed is usable and the boxes are gone",
    },
    {
      key: "first",
      kind: "write",
      prompt: "What is the first physical step?",
      why: "Physical: a phone call, an email, opening a form, finding a document. Not deciding, and not planning. Something somebody watching could see happen.",
      placeholder: "Ring the charity shop about collection",
    },
    {
      key: "second",
      kind: "write",
      prompt: "And the one after that?",
      optional: true,
      hint: "Skip this if you do not know yet. Knowing the first one is enough to start.",
    },
    {
      key: "third",
      kind: "write",
      prompt: "And after that?",
      optional: true,
      hint: "Skip this too if you would rather.",
    },
    {
      key: "today",
      kind: "choose",
      prompt: "Which of those could happen today?",
      why: "One of them. Not the list.",
      choices: [
        { value: "first", label: "The first one" },
        { value: "second", label: "The second one" },
        { value: "third", label: "The third one" },
        { value: "none", label: "None of them today" },
      ],
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "What to do with the rest",
      why: "The steps you are not doing today are not lost. Recording the next one is what stops the whole thing having to be worked out again.",
      items: [
        { text: "Keep the step you picked in front of you" },
        { text: "Put the others out of sight until that one is done" },
        { text: "The next step goes in Life at the end of this, so you do not carry it" },
        { text: "Today is a fine answer to none of them", askIf: { step: "today", equals: ["none"] } },
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
