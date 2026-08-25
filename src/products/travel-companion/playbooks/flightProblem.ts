import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Flight problem.
 *
 * Different from a booking problem on purpose: booking-problem is about
 * the reservation record being wrong or missing; this one is about the
 * flight itself going wrong once it exists, correctly, on the record.
 * A delayed flight is not a booking that needs finding, it is a flight
 * that needs dealing with, and the two situations ask for different
 * things in front of you and different opening lines.
 *
 * NEVER MAKES A CLAIM ABOUT COMPENSATION OR RIGHTS
 *
 * What a traveller is owed for a delay or a cancellation depends on the
 * airline, the route, and the law where they are, none of which this
 * product knows or should guess at. This playbook prepares somebody to
 * ask the airline directly rather than telling them what to expect.
 */
export const flightProblem: Playbook = {
  key: "flight-problem",
  title: "Deal with a flight problem",
  situation: "A flight is delayed, cancelled, or something about it has gone wrong",
  opensFor: ["flight"],
  steps: [
    {
      key: "problem",
      kind: "choose",
      prompt: "What's happened?",
      why: "It decides what is worth having in front of you, so the rest of this only shows what applies.",
      choices: [
        { value: "delayed", label: "Delayed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "missed-connection", label: "Going to miss the connection" },
        { value: "baggage", label: "A baggage problem" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "wanted",
      kind: "write",
      prompt: "What do you need to happen?",
      why: "Worth deciding before you reach the desk or the phone line. It is the thing that gets lost in a long queue.",
      placeholder: "A seat on the next flight to the same place",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having in front of you",
      why: "Not a list to memorise. Put these where you can see them while you talk.",
      items: [
        { text: "Your booking reference" },
        { text: "Your boarding pass, printed or on your phone" },
        { text: "The connecting flight's details", askIf: { step: "problem", equals: ["missed-connection"] } },
        { text: "A description and any tag number for the bag", askIf: { step: "problem", equals: ["baggage"] } },
        { text: "Where you can be reached today" },
      ],
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hello, my flight is delayed and I need to know what my options are. Can you help me with that?",
          askIf: { step: "problem", equals: ["delayed"] },
        },
        {
          text: "Hello, my flight has been cancelled and I need to get rebooked. Can you tell me what is available?",
          askIf: { step: "problem", equals: ["cancelled"] },
        },
        {
          text: "Hello, this flight is running late and I am going to miss my connection. Can you help me sort out the next leg?",
          askIf: { step: "problem", equals: ["missed-connection"] },
        },
        {
          text: "Hello, my bag has not arrived. Can I report it and find out what happens next?",
          askIf: { step: "problem", equals: ["baggage"] },
        },
        {
          text: "Hello, there is a problem with my flight and I am hoping you can help me sort it out. Can I explain what has happened?",
          askIf: { step: "problem", equals: ["other"] },
        },
      ],
    },
    {
      key: "during",
      kind: "during",
      prompt: "While you are talking to them",
      why: "Short on purpose. Anything longer is unreadable in a queue or on hold.",
      items: [
        { text: "Say what you need" },
        { text: "Ask what your options actually are, before choosing one" },
        { text: "Ask where you will be able to sleep or wait, if it comes to that" },
        { text: "Ask for anything in writing that confirms what was agreed" },
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
