import type { ShopProductInput } from "../definition";

/**
 * Family Health Binder's real public Shop listing, same "creating this
 * file is the release gate" pattern as its siblings.
 *
 * WHAT THE LISTING IS ALLOWED TO CLAIM
 *
 * This product's own definition.ts is load-bearing here, not background
 * reading. This listing must never imply any of the following, because
 * none of them exist:
 *
 *   1. Medical advice, diagnosis, or a substitute for a clinician. This
 *      product records facts a family already knows; it never
 *      interprets them.
 *   2. A replacement for a clinic's own intake paperwork. The Intake
 *      Summary is explicitly a supplement, stated as such on the page
 *      itself.
 *   3. A HIPAA-covered record, or a bare "HIPAA doesn't apply" claim
 *      with nothing further said. The product's own privacy note names
 *      the FTC Health Breach Notification Rule and applicable state law
 *      instead.
 *   4. A separate account or login for a child. Every family member is
 *      a row scoped under the one signed-in account.
 *   5. Notifications of any kind. The product's own definition declares
 *      notifications: { supported: false }.
 *
 * $18 launch price, $23 regular, the same tier as Travel Companion and
 * Vehicle Maintenance Companion, two other single-purpose Companions of
 * comparable scope.
 */
export const familyHealthBinderShopProduct: ShopProductInput = {
  id: "family-health-binder",
  slug: "family-health-binder",
  publicationStatus: "published",
  title: "Family Health Binder",
  promise:
    "Who's in your family, what they take, what they're allergic to, and a real record of symptoms as they happened, reachable from any device the moment it actually matters.",
  problem:
    "A family's real health picture lives across a kitchen drawer of pharmacy printouts, a pediatrician's own portal you cannot access at 2am, and a parent's memory of \"she's been sick on and off for a couple of weeks.\" At an urgent care intake desk, that memory is what you have, and it is worse at exactly the moment it matters most: tired, worried, and trying to reconstruct dates and doses from nothing.",
  audience: [
    "You are the one who remembers everyone's medications and allergies, and it lives only in your head.",
    "You have more than one child, or a child and an aging parent, whose facts you are both responsible for.",
    "You have ever stood at an intake desk trying to remember exactly when a symptom started.",
    "You want a real record of a recurring issue, not a vague sense that it \"keeps coming back.\"",
    "You want this reachable from your phone, not locked to one laptop at home.",
  ],
  audienceExclusions: [
    "You want a diagnosis, a triage tool, or medical advice. This product records facts you already know; it has no opinion about what they mean.",
    "You want it to replace your clinic's intake forms. The Intake Summary is built to supplement what a clinic already asks for, not stand in for it.",
    "You want a general health-tracking app with steps, sleep or fitness data. This is specifically medications, allergies, family history and symptom events, nothing else.",
    "You want to sync your child's own device to their own account here. There is no separate account or login for anyone this product tracks.",
    "You want push notifications for medication reminders. It does not send them yet, and does not pretend to.",
  ],
  objections: [
    {
      worry: "Worried this is trying to be a medical device?",
      answer:
        "It is not, and never claims to be. It is a place to keep facts your family already knows, in a structured, dated form. It has no opinion about what a symptom means and makes no diagnosis. That judgment stays with your family and your clinician, always.",
    },
    {
      worry: "Skeptical of a vague 'symptom tracker' with a single text box?",
      answer:
        "Onset, duration and severity are real, structured fields here, not one free-text box you fill in from memory later. That is the one design decision the research behind this product treats as non-negotiable: a pattern across weeks should be something you can actually see, not something you reconstruct under pressure.",
    },
    {
      worry: "Worried about a child having their own account or login?",
      answer:
        "There is not one. Every family member, adult or child, is a row kept under your own account. Nobody this product tracks has a separate login, a separate entitlement, or a separate anything.",
    },
    {
      worry: "Not everything about your family should print on a page you hand to a stranger?",
      answer:
        "Every fact and every symptom event can be marked private. It stays fully usable in your own account; it is simply left off the printed Intake Summary. You decide, per fact, what leaves the house.",
    },
    {
      worry: "Concerned about privacy law and health data?",
      answer:
        "Draftpace is not a HIPAA-covered entity, and this listing will not pretend that means nothing applies. Where the FTC Health Breach Notification Rule or an applicable state health-privacy law covers information you store here, Draftpace follows it. Nothing here is sold, and nothing here is read by an AI model.",
    },
  ],
  outcomes: [
    "One place that holds every family member's medications, allergies and family history, reachable from any device.",
    "A structured symptom timeline: onset, duration and severity as real fields, so a pattern is visible, not remembered.",
    "A dated, one-page Intake Summary per person, ready to hand to a clinic alongside their own paperwork.",
    "A private, per-fact choice about what leaves the house on a printed page, and what stays in the account only.",
    "No separate account for a child: everyone in the family is kept under the one account you already have.",
  ],
  problemsSolved: [
    {
      problem: "A family's medications and allergies live only in one parent's memory.",
      solution: "One place that holds every family member's facts, reachable from any device.",
    },
    {
      problem: "At an intake desk, you're reconstructing when a symptom started from memory, under pressure.",
      solution: "A structured symptom timeline: onset, duration and severity as real fields, recorded as it happens.",
    },
    {
      problem: "You can't tell if something \"keeps coming back\" or if that's just how it feels.",
      solution: "A real, dated record of symptom events, so a pattern is something you can actually see.",
    },
    {
      problem: "Not everything belongs on a page you hand to a stranger at a desk.",
      solution: "A private, per-fact choice about what's included on the printed Intake Summary.",
    },
  ],
  howItWorks: [
    "Add each person in your family: a name, their relationship to you, and a date of birth if you want it. No separate account or login is created for anyone.",
    "Record what you already know for each person: medications with dosage and frequency, allergies with their reaction, and anything worth knowing from family history.",
    "When a symptom shows up, record it as it happens: what it is, when it started, how long it lasted, and how severe it was, plus what helped if anything did.",
    "Mark any fact or symptom private if it should stay in the account only, off any printed page.",
    "Overview shows every family member and what's recorded for them at a glance, including the most recently logged symptom across the family.",
    "Generate an Intake Summary for one person whenever you need it: a dated, one-page document with their medications, allergies, family history and recent symptoms, excluding anything marked private.",
  ],
  access: "paid",
  price: { amount: 18, currency: "USD" },
  compareAtPrice: { amount: 23, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "Overview: every family member and what's recorded for them, at a glance",
    "Family: medications, allergies and family history, per person, with dosage and reaction detail where it applies",
    "Symptoms: a structured timeline per person, onset, duration and severity as real fields, never a single text box",
    "A private, per-fact and per-symptom visibility choice, honoured on every printed page",
    "The Intake Summary: a dated, one-page printable per person, meant to supplement a clinic's own paperwork",
    "No separate account or login for any family member, child included",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "Each family member's name, relationship to you, and date of birth if you want it",
    "Medications, with dosage and frequency where relevant",
    "Allergies, with the reaction",
    "Family history notes worth having on hand",
    "Symptom events as they happen: what, when, how long, how severe, and what helped",
  ],
  expectedOutputs: [
    "An at-a-glance overview of every family member and what's recorded for them",
    "A structured, dated symptom history per person",
    "A one-page, dated Intake Summary ready to print or hand over at a clinic",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so a fact you add on a laptop is there on your phone at an appointment. Nothing is ever silently deleted; removing a person or a fact archives it rather than erasing the record.",
  privacyNotes:
    "Your family's facts are private to your account. Draftpace does not sell your data or use it for advertising, and nothing here is read by an AI model: there is no model provider anywhere in this product. Draftpace is not a covered entity under HIPAA; where the FTC Health Breach Notification Rule or an applicable state health-privacy law applies to information you store here, Draftpace follows it. Anything marked private stays in your account and is never included on a generated Intake Summary.",
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, the same way every paid product on Draftpace works.",
    },
    {
      question: "Does this give medical advice or a diagnosis?",
      answer:
        "No. It records facts your family already knows, in a structured, dated form. It never interprets a symptom, never suggests a diagnosis, and has no model or AI involved anywhere in it. Judgment about what any of it means stays with your family and your clinician.",
    },
    {
      question: "Does my child need their own account?",
      answer:
        "No. Every family member, adult or child, is a row kept under your own account. There is no separate login or entitlement for anyone this product tracks.",
    },
    {
      question: "What makes the symptom timeline different from a notes app?",
      answer:
        "Onset, duration and severity are real, structured fields, not one open text box. That structure is what makes a pattern across weeks visible later, rather than something you have to piece back together from memory.",
    },
    {
      question: "Can I keep some facts off the printed page?",
      answer:
        "Yes. Any medical fact or symptom event can be marked private. It stays fully usable in your account; it is simply excluded the next time you generate an Intake Summary.",
    },
    {
      question: "Does this replace HIPAA protections or my clinic's own records?",
      answer:
        "No, and this listing will not claim it does. Draftpace is not a HIPAA-covered entity. Where the FTC Health Breach Notification Rule or an applicable state health-privacy law covers information you store here, Draftpace follows it. The Intake Summary is meant to supplement your clinic's own intake paperwork, never replace it.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your family's facts save privately and follow you across devices.",
    },
  ],
  relatedGuideSlugs: [],
  relatedProductSlugs: ["home-management-companion", "personal-life-affairs-companion"],
  needGroups: ["getting-organized"],
  seo: {
    title: "Family Health Binder: medications, allergies and a real symptom timeline for your family",
    description:
      "Keep medications, allergies, family history and a structured symptom timeline for everyone in your family, reachable from any device, plus a dated Intake Summary to hand to a clinic. No diagnoses, no AI, no child accounts.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
