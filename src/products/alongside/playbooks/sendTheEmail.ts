import type { Playbook } from "../playbook";

/**
 * Send the email.
 *
 * The hard part of an unwritten email is almost never the writing. It is
 * the first line, and then the sending. This walks somebody from a blank
 * screen to a sent message without ever suggesting what to say about the
 * substance.
 *
 * No during step, deliberately. Writing an email is not a live event, so
 * a list of things to do while it happens would be filler. The check
 * before sending does that work instead, and the difference is the
 * engine handling a genuinely different shape rather than every playbook
 * being the same seven steps in a different order.
 */
export const sendTheEmail: Playbook = {
  key: "send-the-email",
  title: "Send the email",
  situation: "There is an email that needs writing and it has not been written",
  opensFor: ["commitment", "thread", "waiting"],
  steps: [
    {
      key: "purpose",
      kind: "choose",
      prompt: "What is the email for?",
      choices: [
        { value: "asking", label: "Asking for something" },
        { value: "replying", label: "Replying to something" },
        { value: "saying-no", label: "Saying no" },
        { value: "chasing", label: "Chasing something up" },
        { value: "problem", label: "Explaining a problem" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "who",
      kind: "write",
      prompt: "Who is it to?",
      placeholder: "The letting agent",
    },
    {
      key: "needed",
      kind: "write",
      prompt: "What needs to happen because of it?",
      why: "An email that does not say what it wants gets answered slowly, or not at all.",
      placeholder: "Someone to come and look at the boiler",
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your first line",
      why: "The rest is usually easier once this exists. Change it, or write your own.",
      suggestedWording: [
        {
          text: "Hello, I am hoping you can help me with something.",
          askIf: { step: "purpose", equals: ["asking", "other"] },
        },
        {
          text: "Hello, thank you for getting back to me. To answer your question:",
          askIf: { step: "purpose", equals: ["replying"] },
        },
        {
          text: "Hello, thank you for asking me. I am not going to be able to do it this time.",
          askIf: { step: "purpose", equals: ["saying-no"] },
        },
        {
          text: "Hello, I got in touch about this a little while ago and I have not heard back yet. Could you let me know where it has got to?",
          askIf: { step: "purpose", equals: ["chasing"] },
        },
        {
          text: "Hello, I am having a problem and I would like to explain what has happened so it can be sorted out.",
          askIf: { step: "purpose", equals: ["problem"] },
        },
      ],
    },
    {
      key: "check",
      kind: "prepare",
      prompt: "Before you send it",
      why: "Read it once against these, then send it. Reading it a fourth time does not make it better.",
      items: [
        { text: "What you want is in the first three lines" },
        { text: "The date, if there is one, is in there" },
        { text: "Anything you meant to attach is attached" },
        { text: "It is short enough to read on a phone" },
        { text: "What you were told before is in there", askIf: { step: "purpose", equals: ["chasing", "problem"] } },
        { text: "You have not apologised more than once", askIf: { step: "purpose", equals: ["saying-no", "chasing"] } },
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
