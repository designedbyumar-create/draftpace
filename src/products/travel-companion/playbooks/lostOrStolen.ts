import type { Playbook } from "@/components/product-shell/companion/steps";

/**
 * Something lost or stolen.
 *
 * The moment somebody most needs a calm head and has the least of one: a
 * passport, a wallet, a phone or a bag has gone, in a place where they may
 * not speak the language. This walks them through what to have in front of
 * them and what to say, for one thing at a time.
 *
 * A general situation, like "something went wrong": it is opened from Today
 * and not from a particular booking, because what was lost rarely belongs
 * to one.
 *
 * NEVER MAKES A CLAIM ABOUT WHAT HAPPENS NEXT
 *
 * What a person has to do after losing a passport, who to tell, what it
 * costs and how long it takes depends on the country, on what was lost and
 * on the law there, none of which this product knows or should guess at,
 * and every one of which changes. So it prepares somebody to ask the
 * people who decide, and says so. There is no timeline, no fee, no right
 * and no "you will".
 *
 * NOT AN EMERGENCY SERVICE
 *
 * The first line says so, before anything else, because a screen about
 * paperwork must never be the reason somebody in danger read it instead of
 * calling for help.
 */
export const lostOrStolen: Playbook = {
  key: "lost-or-stolen",
  title: "Deal with something lost or stolen",
  situation: "A passport, wallet, phone, bag or tickets have been lost or stolen",
  steps: [
    {
      key: "what",
      kind: "choose",
      prompt: "What has been lost or stolen?",
      why: "If anyone is in danger or hurt, contact local emergency services first. This is only for the calls and paperwork afterwards, and it does not know what the rules are where you are.",
      choices: [
        { value: "passport", label: "A passport or ID" },
        { value: "cards", label: "Bank cards or a wallet" },
        { value: "phone", label: "A phone" },
        { value: "bag", label: "A bag or luggage" },
        { value: "tickets", label: "Tickets or booking confirmations" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "when",
      kind: "write",
      prompt: "When and where do you think it happened?",
      why: "Worth writing down now, while it is fresh. Everyone you speak to will ask.",
      placeholder: "Somewhere between the hotel and the station, around 5pm",
      optional: true,
      hint: "Skip this if you do not know.",
    },
    {
      key: "wanted",
      kind: "write",
      prompt: "What do you need to happen first?",
      why: "One thing. It is what gets lost when you are being passed between people.",
      placeholder: "Stop the card being used",
    },
    {
      key: "prepare",
      kind: "prepare",
      prompt: "Worth having in front of you",
      why: "Not a list to memorise. What the right steps are depends on the country and on what was lost, so this is to help you ask the people who decide.",
      items: [
        { text: "A photo or copy of the passport, if you have one", askIf: { step: "what", equals: ["passport"] } },
        { text: "Where you are staying, and your onward and return travel details", askIf: { step: "what", equals: ["passport"] } },
        { text: "The card issuer's number, from their website or a saved copy", askIf: { step: "what", equals: ["cards"] } },
        { text: "Where each card was last used, and any recent transactions you can see", askIf: { step: "what", equals: ["cards"] } },
        { text: "Another phone or number where you can be reached today", askIf: { step: "what", equals: ["phone"] } },
        { text: "The phone's make and number", askIf: { step: "what", equals: ["phone"] } },
        { text: "A description of the bag and what was in it", askIf: { step: "what", equals: ["bag"] } },
        { text: "Where you last had it, and any tag or tracking number", askIf: { step: "what", equals: ["bag"] } },
        { text: "Your booking references", askIf: { step: "what", equals: ["tickets"] } },
        { text: "The email address the booking was made with", askIf: { step: "what", equals: ["tickets"] } },
        { text: "Your booking references and where you are staying", askIf: { step: "what", equals: ["cards", "phone", "bag", "other"] } },
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
          text: "Hello, my passport has been lost while I am travelling. Can you tell me what I need to do next?",
          askIf: { step: "what", equals: ["passport"] },
        },
        {
          text: "Hello, I need to report a card as lost and stop it being used. Can you help me with that now?",
          askIf: { step: "what", equals: ["cards"] },
        },
        {
          text: "Hello, my phone has been lost. Can you tell me what I can do with my account from here?",
          askIf: { step: "what", equals: ["phone"] },
        },
        {
          text: "Hello, I have lost a bag and want to report it. Can you tell me where I do that?",
          askIf: { step: "what", equals: ["bag"] },
        },
        {
          text: "Hello, I have lost my tickets. Can you look at the booking and tell me what my options are?",
          askIf: { step: "what", equals: ["tickets"] },
        },
        {
          text: "Hello, I have lost something and I am hoping you can point me to who deals with it. Can I explain what happened?",
          askIf: { step: "what", equals: ["other"] },
        },
      ],
    },
    {
      key: "during",
      kind: "during",
      prompt: "While you are talking to them",
      why: "Short on purpose. Anything longer is unreadable in a queue or on hold.",
      items: [
        { text: "Say what has been lost, and when you noticed" },
        { text: "Ask what they need from you" },
        { text: "Ask what happens next" },
        { text: "Ask for a reference number for the report" },
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
