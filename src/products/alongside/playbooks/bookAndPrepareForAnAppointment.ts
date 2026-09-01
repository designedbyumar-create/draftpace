import type { Playbook } from "../playbook";

/**
 * Book an appointment and be ready for it.
 *
 * Two problems in one, which is why it is one playbook and not two. The
 * appointment that never gets booked and the appointment that gets
 * booked and then attended with none of the right things are the same
 * difficulty at different ends of a week.
 *
 * The wording step is gated at the step level rather than the suggestion
 * level: somebody whose appointment is already booked never sees it at
 * all. That is the step-level condition earning its place rather than
 * showing an empty screen with a Next button on it.
 */
export const bookAndPrepareForAnAppointment: Playbook = {
  key: "book-and-prepare-for-an-appointment",
  title: "Book an appointment and be ready for it",
  situation: "An appointment needs making, or one is coming and needs preparing for",
  opensFor: ["commitment", "thread"],
  steps: [
    {
      key: "kind",
      kind: "choose",
      prompt: "What sort of appointment?",
      choices: [
        { value: "health", label: "Doctor, dentist or similar" },
        { value: "repair", label: "Something being repaired or serviced" },
        { value: "official", label: "Something official" },
        { value: "meeting", label: "A meeting with somebody" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "who",
      kind: "write",
      prompt: "Who with?",
    },
    {
      key: "booked",
      kind: "choose",
      prompt: "Is it booked yet?",
      choices: [
        { value: "not-yet", label: "Not yet" },
        { value: "booked", label: "It is booked" },
      ],
    },
    {
      key: "when-suits",
      kind: "write",
      prompt: "When would work for you?",
      why: "Being asked this on the phone with no answer ready is how people end up with an appointment they cannot make.",
      askIf: { step: "booked", equals: ["not-yet"] },
      placeholder: "Any morning except Thursday",
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Change this, or write your own.",
      askIf: { step: "booked", equals: ["not-yet"] },
      suggestedWording: [
        {
          text: "Hello, I would like to make an appointment. What have you got available?",
          askIf: { step: "kind", equals: ["health", "official", "other"] },
        },
        {
          text: "Hello, I need to book somebody to come out and look at something. Can you tell me what the next available date is?",
          askIf: { step: "kind", equals: ["repair"] },
        },
        {
          text: "Hello, I would like to arrange a time to talk. When would suit you?",
          askIf: { step: "kind", equals: ["meeting"] },
        },
      ],
    },
    {
      key: "ask",
      kind: "write",
      prompt: "What do you want to come away with?",
      why: "Written down now, it is still there on the day, when remembering it is harder.",
      placeholder: "A referral, or an explanation of what the pain is",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "For the day itself",
      why: "Put this somewhere you will see it that morning.",
      items: [
        { text: "What you want to come away with, written down" },
        { text: "The time, and how long it takes to get there" },
        { text: "Any letter or reference number they sent you" },
        { text: "A list of what has been happening and since when", askIf: { step: "kind", equals: ["health"] } },
        { text: "Any medication you are taking", askIf: { step: "kind", equals: ["health"] } },
        { text: "Access to the thing being looked at", askIf: { step: "kind", equals: ["repair"] } },
        { text: "Any documents they asked you to bring", askIf: { step: "kind", equals: ["official"] } },
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
