import type { Playbook } from "../playbook";

/**
 * Follow something up.
 *
 * The playbook the waiting shape exists to feed. Somebody said they
 * would come back to you, they have not, and chasing feels rude in a way
 * that waiting silently does not.
 *
 * It gives one thing the other playbooks do not: a reason to be
 * chasing that is about the thing rather than about the person. "Could
 * you give me a date" is a different conversation from "any update", and
 * the first one usually ends the waiting.
 */
export const followUpWithSomeone: Playbook = {
  key: "follow-up-with-someone",
  title: "Follow something up",
  situation: "Somebody has not come back to you and it needs chasing",
  opensFor: ["waiting", "commitment", "thread"],
  steps: [
    {
      key: "chasing",
      kind: "choose",
      prompt: "What are you chasing?",
      choices: [
        { value: "reply", label: "A reply" },
        { value: "decision", label: "A decision" },
        { value: "money", label: "Money owed to you" },
        { value: "fix", label: "Something being fixed" },
        { value: "document", label: "A document or a form" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "who",
      kind: "write",
      prompt: "Who are you chasing?",
    },
    {
      key: "how",
      kind: "choose",
      prompt: "How did you last get in touch?",
      why: "Chasing by the same route that already went unanswered is usually the slower option.",
      choices: [
        { value: "phone", label: "Phone" },
        { value: "email", label: "Email or a message" },
        { value: "in-person", label: "In person" },
        { value: "cannot-remember", label: "I cannot remember" },
      ],
    },
    {
      key: "needed",
      kind: "write",
      prompt: "What do you need from them now?",
      why: "Asking for a date works better than asking for an update. An update can be nothing.",
      placeholder: "A date when the part will arrive",
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hello, I got in touch a little while ago about this and I have not heard back. Could you tell me where it has got to?",
          askIf: { step: "chasing", equals: ["reply", "other"] },
        },
        {
          text: "Hello, I am following up on this because I need to know either way. When do you think you will be able to tell me?",
          askIf: { step: "chasing", equals: ["decision"] },
        },
        {
          text: "Hello, I am following up on this because it is still outstanding. Can you tell me when it will be dealt with?",
          askIf: { step: "chasing", equals: ["money"] },
        },
        {
          text: "Hello, I am checking in on this because it has not been sorted yet. Can you tell me what is happening and when?",
          askIf: { step: "chasing", equals: ["fix"] },
        },
        {
          text: "Hello, I am still waiting on this. Could you tell me when I can expect it, or what you need from me first?",
          askIf: { step: "chasing", equals: ["document"] },
        },
      ],
    },
    {
      key: "during",
      kind: "during",
      prompt: "Worth doing while you have them",
      items: [
        { text: "Say when you last got in touch" },
        { text: "Ask for a date rather than an update" },
        { text: "Ask what they need from you, if anything" },
        { text: "Ask who else could help if they cannot" },
        { text: "Get a name" },
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
