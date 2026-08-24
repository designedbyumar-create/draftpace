import type { Playbook } from "../playbook";

/**
 * Sort out a billing problem.
 *
 * THE BOUNDARY, WHICH THIS PLAYBOOK IS THE MOST LIKELY OF THE EIGHT TO
 * BREAK
 *
 * Personal Finance and Personal Life Affairs own money. They hold the
 * account, the provider, the sum, the direct debit. This playbook holds
 * none of that and asks for none of it: no amount, no account number, no
 * card, no statement figure. It asks who the charge is from because you
 * cannot ring somebody without knowing who they are, and it asks what
 * would sort it because that is the thing people lose hold of halfway
 * through the conversation.
 *
 * If a later version of this needs a field for the amount, the right
 * answer is that it belongs in a different product.
 *
 * The one thing it is unusually firm about is the reference number.
 * Billing disputes are lost by not having one, and asking for it is the
 * difference between "I called about this in March" and a record the
 * company can look up.
 */
export const resolveABillingProblem: Playbook = {
  key: "resolve-a-billing-problem",
  title: "Sort out a billing problem",
  situation: "Something has been charged wrongly and it needs sorting",
  opensFor: ["commitment", "thread", "waiting"],
  steps: [
    {
      key: "problem",
      kind: "choose",
      prompt: "What has happened?",
      choices: [
        { value: "twice", label: "Charged twice for the same thing" },
        { value: "wrong-amount", label: "Charged the wrong amount" },
        { value: "after-cancelling", label: "Charged after cancelling" },
        { value: "no-refund", label: "A refund has not arrived" },
        { value: "unrecognised", label: "A charge I do not recognise" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "who",
      kind: "write",
      prompt: "Who is the charge from?",
      placeholder: "The broadband company",
    },
    {
      key: "before",
      kind: "choose",
      prompt: "Have you contacted them about it already?",
      why: "It changes what is worth having ready, and how the call starts.",
      choices: [
        { value: "not-yet", label: "Not yet" },
        { value: "once", label: "Once" },
        { value: "more-than-once", label: "More than once" },
      ],
    },
    {
      key: "wanted",
      kind: "write",
      prompt: "What would sort it?",
      why: "Worth deciding before the call. It is the thing that gets lost halfway through explaining what happened.",
      placeholder: "The second charge refunded",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having in front of you",
      why: "Not to memorise. Where you can see it while you talk.",
      items: [
        { text: "The statement or the email showing the charge" },
        { text: "The date it happened" },
        { text: "Your account or customer reference, if there is one" },
        { text: "Something to write on" },
        { text: "The reference from when you called before", askIf: { step: "before", equals: ["once", "more-than-once"] } },
        { text: "What you were told last time, and by whom", askIf: { step: "before", equals: ["more-than-once"] } },
      ],
    },
    {
      key: "opening",
      kind: "wording",
      prompt: "Your opening",
      why: "Change any of this, or write your own.",
      suggestedWording: [
        {
          text: "Hello, I have been charged twice for the same thing and I would like to get it put right. Can you look at the account for me?",
          askIf: { step: "problem", equals: ["twice"] },
        },
        {
          text: "Hello, the amount I have been charged is not what I was expecting. Can you tell me what it is for?",
          askIf: { step: "problem", equals: ["wrong-amount"] },
        },
        {
          text: "Hello, I cancelled this and I have been charged since. Can you check when the cancellation was recorded?",
          askIf: { step: "problem", equals: ["after-cancelling"] },
        },
        {
          text: "Hello, I am waiting on a refund that has not arrived. Can you tell me whether it has been sent, and when?",
          askIf: { step: "problem", equals: ["no-refund"] },
        },
        {
          text: "Hello, there is a charge on my account that I do not recognise. Can you tell me what it is?",
          askIf: { step: "problem", equals: ["unrecognised"] },
        },
        {
          text: "Hello, there is a problem with my bill and I am hoping you can help me sort it out. Can I explain what has happened?",
          askIf: { step: "problem", equals: ["other"] },
        },
      ],
    },
    {
      key: "during",
      kind: "during",
      prompt: "While you are on the call",
      why: "The reference number is the one that matters. Without it the next call starts from nothing.",
      items: [
        { text: "Say what happened once, in order" },
        { text: "Say what you would like done about it" },
        { text: "Ask for a reference number for this call" },
        { text: "Ask when it will be resolved" },
        { text: "Ask what happens if it is not" },
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
