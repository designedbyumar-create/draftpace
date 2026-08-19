import type { ShopProductInput } from "../definition";

/**
 * Home Base's real public Shop listing, same "creating this file is the
 * release gate" pattern as personal-finance-companion.ts. Scope here is
 * deliberately narrower than the incumbents it competes with (no camera
 * scan, no document upload, no full room inventory, no multi-property
 * support) and this listing never claims a capability that isn't actually
 * built yet: CSV/paste-notes import (plan Phase 5) hasn't shipped, so it is
 * not mentioned below, only appliances, maintenance, service providers,
 * Attention, and reminders, which are all real and live.
 *
 * price is deliberately omitted (TODO_SET_REAL_PRICE), same convention as
 * PFC: formatPrice() renders "Price not yet set" rather than a fabricated
 * $0.00, and GetAction renders "Checkout opens soon" until
 * LEMON_SQUEEZY_HMC_CHECKOUT_URL is set.
 */
export const homeManagementCompanionShopProduct: ShopProductInput = {
  id: "home-management-companion",
  slug: "home-management-companion",
  publicationStatus: "published",
  title: "Home Base",
  promise:
    "One always-current picture of your home's appliances, maintenance, and warranties, with exactly one useful next move at a time.",
  problem:
    "Warranty dates, filter changes, and who fixed the water heater last time live in your memory, a drawer of receipts, or nowhere at all. Nothing tells you, in one place, what's actually due soon or what quietly slipped past its warranty. A note on your phone only knows what you remembered to write down.",
  audience: [
    "You own or manage a home with more than a couple of appliances and want their warranties and service history tracked in one real place, not a shoebox of receipts.",
    "You want a next step handed to you, a filter that's overdue, a warranty about to lapse, not a dashboard you have to interpret yourself every time.",
    "You are fine entering what you know in exchange for a picture that is always current, not a guess.",
  ],
  audienceExclusions: [
    "You want to photograph every model number and warranty card and have it read automatically. Everything here is entered by you, on purpose; there is no camera scan or document upload.",
    "You want a full room-by-room home inventory for insurance purposes. This tracks what needs upkeep, not everything you own.",
    "You manage more than one property. Home Base is built around a single home for now.",
  ],
  objections: [
    {
      worry: "Worried it becomes another app you stop opening?",
      answer:
        "It leads with exactly one dominant next action, derived from what is actually due or expiring, never a to-do list demanding a full review every time you open it.",
    },
    {
      worry: "Think tracking every appliance sounds like a lot of setup?",
      answer: "Add what you have, skip the rest, and come back later from Settings. Nothing requires a full inventory before it is useful.",
    },
    {
      worry: "Not sure a reminder is trustworthy if you did not set a real date?",
      answer:
        "Every reminder traces back to a date you entered: a warranty expiration, or a last-serviced date plus your own cadence. Never an inferred guess.",
    },
  ],
  outcomes: [
    "One real Attention inbox: only genuine gaps, like a filter overdue or a warranty about to expire, never a fabricated task.",
    "A record of every appliance you own, its warranty date, and who serviced it last, in one place instead of a drawer of receipts.",
    "Recurring maintenance tracked on your own schedule, with a full history of what you actually did and when.",
    "Reminders that reach you before something becomes expensive, not a to-do list you have to remember to check.",
  ],
  howItWorks: [
    "Add what you have: your appliances, a few recurring tasks, and who you would call for each. Skip anything you do not have yet.",
    "The guided setup asks about your home a step at a time, never a giant form up front.",
    "Today shows exactly what needs attention right now, and nothing else when there is nothing due.",
    "Attention surfaces only real gaps: an overdue filter, a warranty expiring soon. Mark it done and it clears itself.",
    "Come back anytime. Home Base resumes exactly where you left off, and reminds you before something slips past its date.",
  ],
  access: "paid",
  // TODO_SET_REAL_PRICE: no price object yet, see the file doc comment.
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "Appliances, maintenance tasks, and service providers, all in one place",
    "A guided setup that asks about your home a step at a time",
    "A real Attention inbox derived from your own records, never fabricated",
    "Recurring maintenance reminders with a full history of what has been done",
    "Notification reminders so nothing slips past its date unnoticed",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "Your appliances, with warranty dates when you have them",
    "Recurring maintenance tasks and how often they are due",
    "Service providers you would call for each task",
    "When a task is actually done, so the next one calculates correctly",
  ],
  expectedOutputs: [
    "One dominant next action at a time",
    "A real Attention inbox of genuine gaps",
    "A complete, always-current picture of your home's appliances and maintenance",
    "A history log of everything you have done, and when",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so it is there if you come back on something else.",
  privacyNotes:
    "Your home records are private to your account. Draftpace does not sell your data or use it for advertising. This is a tracking aid, not a substitute for your appliance manuals or a professional inspection.",
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, the same way every paid product on Draftpace works unless a listing says otherwise.",
    },
    {
      question: "Does it scan receipts or warranty cards automatically?",
      answer: "No. You add the details yourself, on purpose. There is no camera scan or document upload in this product.",
    },
    {
      question: "Can I track more than one property?",
      answer: "Not yet. Home Base is built around a single home for now.",
    },
    {
      question: "What happens if I only track a few appliances at first?",
      answer: "Nothing is required. Add what you have, and add more later from Settings whenever it is relevant.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your home records save privately and follow you across devices.",
    },
  ],
  relatedGuideSlugs: [],
  relatedProductSlugs: ["personal-finance-companion"],
  needGroups: ["getting-organized"],
  seo: {
    title: "Home Base: track your home's appliances, maintenance, and warranties",
    description:
      "Appliances, maintenance tasks, service providers, and warranties, in one always-current picture with exactly one useful next move at a time.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
