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
  // Emptied by the content collapse: every objection was answered a
  // second time in faqs, and the Shop page rendered both a few hundred
  // pixels apart. All of them now live in `questions`, answered once
  // each and tagged with the moment they matter.
  objections: [],
  // Emptied by the content collapse: four of these five restated a
  // problemsSolved solution nearly word for word. The one that said
  // something new is now paired with the problem it answers.
  outcomes: [],
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
    {
      problem: "The portal that holds your child's records is not something you can reach at 2am on your phone.",
      solution: "Your own account, on whatever device is in your hand, holding the facts you put there yourself.",
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
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters. Five
   * objections and seven faqs collapsed to seven questions: each
   * objection had a near-identical faq beneath it (the medical-device
   * pair, the symptom-timeline pair, the child-account pair, the
   * private-fact pair, the HIPAA pair), and the Shop page rendered both.
   */
  questions: [
    {
      question: "Does this give medical advice or a diagnosis?",
      answer:
        "No, and it never claims to. It keeps facts your family already knows, in a structured, dated form. It never interprets a symptom, never suggests a diagnosis, and there is no model or AI anywhere in it. What any of it means stays with your family and your clinician.",
      stage: ["deciding", "owning"],
    },
    {
      question: "What makes this different from a notes app or a symptom tracker with one text box?",
      answer:
        "Onset, duration and severity are real, structured fields, filled in as it happens rather than reconstructed later. That structure is what makes a pattern across weeks something you can see, instead of something you piece together at an intake desk while tired and worried.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does my child need their own account?",
      answer:
        "No, and they cannot have one. Every family member, adult or child, is a row under your own account. Nobody this product tracks gets a separate login, a separate entitlement, or a separate anything.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Can I keep some facts off the printed page?",
      answer:
        "Any fact and any symptom event can be marked private. It stays fully usable in your own account and is simply left off the Intake Summary. You decide, per fact, what leaves the house.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does this replace HIPAA protections or my clinic's own records?",
      answer:
        "No, and this listing will not pretend otherwise. Draftpace is not a HIPAA-covered entity. Where the FTC Health Breach Notification Rule or an applicable state health-privacy law covers information you store here, Draftpace follows it. The Intake Summary supplements your clinic's own paperwork; it never stands in for it.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it remind me to take or give a medication?",
      answer:
        "No, and it does not pretend to. Nothing is sent to you. This is a record you consult, not a schedule that chases you.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this a one-time purchase, and do I need an account?",
      answer:
        "One time, and yes. The account is the point: it is what makes a fact you added on a laptop reachable on your phone at an urgent care desk.",
      stage: ["deciding"],
    },
  ],

  /**
   * How people describe this before they know a product like this exists.
   * There were no PROBLEM_ENTRIES or guides for family health when this
   * was written, so these come from research done for it rather than
   * from the existing knowledge layer: the documented recall failure at
   * intake (people who cannot name a medication are told to bring the
   * bottle or a photo), and the clinical advice that a useful symptom
   * note records when it started, how it changed and what helped, in the
   * same small set of fields each time. Every answer describes only what
   * the product actually does.
   */
  searchedProblems: [
    {
      phrase: "I can never remember my child's medications at the doctor",
      answer:
        "They are written down per person, with dosage and frequency, on whatever device is in your hand at the desk.",
    },
    {
      phrase: "What should I bring to a doctor's appointment",
      answer:
        "A dated one-page Intake Summary for that person: medications, allergies, family history and recent symptoms, minus anything you marked private.",
    },
    {
      phrase: "How do I keep a symptom diary before an appointment",
      answer:
        "The same small set of fields each time: what it was, when it started, how long it lasted, how severe, and what helped. Short factual entries, not an essay.",
    },
    {
      phrase: "She's been sick on and off for weeks and I can't tell if it's a pattern",
      answer:
        "Dated events with real fields make a pattern visible rather than remembered, so the question has an answer you can point at.",
    },
    {
      phrase: "Where do I keep everyone's allergies and reactions",
      answer:
        "Per person, with the reaction recorded alongside, in one place you can reach without a clinic portal login.",
    },
    {
      phrase: "I'm looking after my kids and my parent and it's all in my head",
      answer:
        "Everyone is a row under your one account, adults and children alike, each with their own facts and their own timeline.",
    },
  ],

  /**
   * What an owner opens the manual to do, each row linking to the screen
   * it happens on.
   */
  tasks: [
    {
      label: "See everyone at a glance",
      answer: "Overview shows each person, what is recorded for them, and the most recent symptom across the family.",
      destination: "workspace",
    },
    {
      label: "Add somebody to the binder",
      answer: "A name, their relationship to you, and a date of birth if you want it. No account is created for them.",
      destination: "members",
    },
    {
      label: "Record a medication or an allergy",
      answer: "Dosage and frequency for a medication, the reaction for an allergy, kept against that person.",
      destination: "members",
    },
    {
      label: "Log a symptom as it happens",
      answer: "What it is, when it started, how long, how severe, and what helped. The same fields every time.",
      destination: "timeline",
    },
    {
      label: "Keep something off the printed page",
      answer: "Mark it private. It stays usable in your account and is excluded from every Intake Summary.",
      destination: "members",
    },
    {
      label: "Print a summary for an appointment",
      answer: "A dated one-page Intake Summary for one person, meant to go alongside a clinic's own paperwork.",
      destination: "printables",
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
