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
 *   2. A replacement for a clinic's, school's or camp's own paperwork.
 *      Every printed page is explicitly a supplement, stated as such on
 *      the page itself. It never fills in or submits a form.
 *   3. A HIPAA-covered record, or a bare "HIPAA doesn't apply" claim
 *      with nothing further said. The product's own privacy note names
 *      the FTC Health Breach Notification Rule and applicable state law
 *      instead.
 *   4. A separate account or login for a child. Every family member is
 *      a row scoped under the one signed-in account.
 *   5. Notifications of any kind. The product's own definition declares
 *      notifications: { supported: false }.
 *   6. A vaccine schedule, a dose check, an interaction check, or any
 *      statement of what is "due" or "recommended". Vaccines are a list of
 *      what was typed in. Nothing here reads a doctor, portal or insurer.
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
    "The answers every form asks, entered once for everyone in your family: allergies, medications, doctors, who to call, insurance, vaccines. It prints as the page school, camp, a sitter or a new doctor wants.",
  problem:
    "School, camp and sports forms, a new specialist's intake packet, a babysitter, an urgent care desk: every one asks for the same handful of facts about the same people, and every time you rebuild them from memory, a kitchen drawer of printouts and a portal you cannot open at 2am. The blank binder printables on Pinterest give you forty empty pages to fill in by hand and copy out again whenever something changes.",
  audience: [
    "You are the one who fills in every form, and everyone's allergies, medications and insurance number live only in your head.",
    "You have more than one child, or a child and an aging parent, whose facts you are both responsible for.",
    "You have ever stood at an intake desk trying to remember exactly when a symptom started.",
    "Your kids are staying with a grandparent or a sitter and you want one page that says what to avoid and who to call.",
    "You want this reachable from your phone, not locked to one laptop or one binder on a shelf.",
  ],
  audienceExclusions: [
    "You want a diagnosis, a triage tool, or medical advice. This product records facts you already know; it has no opinion about what they mean.",
    "You want it to tell you which vaccines are due. Schedules differ by state, school and doctor, and this product does not know them. It keeps the dates you type in.",
    "You want it to check doses or drug interactions. It never does, and never will.",
    "You want it to replace your clinic's forms or a medical ID. The pages it prints supplement the paperwork a clinic, school or camp gives you.",
    "You want it to read your records from a doctor's portal or insurer. It has no connection to any of them; every fact is one you typed.",
    "You want a general health-tracking app with steps, sleep or fitness data.",
    "You want reminders about medications or appointments. It sends none, and does not pretend to.",
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
      problem: "Every form asks for the same answers, and you rebuild them from memory each time.",
      solution: "One card per person holds them, and the Forms sheet prints them in the order forms ask, with anything missing said plainly.",
    },
    {
      problem: "A sitter or grandparent needs to know what to avoid and who to call, and a text message is not enough.",
      solution: "A Caregiver sheet: allergies first and largest, what is taken, who to call, and your own notes about the child.",
    },
    {
      problem: "At an intake desk, you're reconstructing when a symptom started from memory, under pressure.",
      solution: "A structured symptom timeline: onset, duration and severity as real fields, recorded as it happens.",
    },
    {
      problem: "The questions you meant to ask the doctor vanish the moment you sit down.",
      solution: "Write them down before the visit, with what was said after it, and print a Visit page with a box to tick each question.",
    },
    {
      problem: "A medication that was stopped in the spring is still on the list you hand over in the fall.",
      solution: "Mark it stopped. It stays in the record and leaves every printed page. The list also says when you last checked it.",
    },
    {
      problem: "Not everything belongs on a page you hand to a stranger.",
      solution: "A private choice on every allergy, medication, symptom, vaccine and visit. Each printed page says how many records it left off.",
    },
  ],
  howItWorks: [
    "Add each person in your family with just a name. Add a birth date, and their relationship to you (child, partner, parent), whenever you like. No separate account or login is created for anyone.",
    "Fill in their card: allergies with what happens, conditions, medications with dose and how often, and family history. Every record can be changed, and a medication can be marked stopped.",
    "Type in their vaccines with the dates, picking a name from a list of common ones. It keeps what you enter and never says what is due.",
    "Add their doctors and pharmacy, an emergency contact and their insurance, so the forms that ask for them are answered.",
    "Record a symptom as it happens, and write down the questions for the next appointment. Afterwards, note what was said.",
    "Mark anything private and it stays in your account and off every printed page.",
    "Make the page the moment needs: a Forms sheet, a Caregiver sheet, an Emergency card, a Visit page, or an Intake summary. Each is dated, on US Letter, and says how many private records it left off.",
  ],
  access: "paid",
  // Priced as a lifetime licence at a standing 50% off the list price.
  // The list price is what the product is worth to somebody who needs it;
  // the discount is the launch position, not a countdown. These two
  // numbers must match the Lemon Squeezy variant exactly, or a customer
  // reads one figure and is charged another.
  price: { amount: 34, currency: "USD" },
  compareAtPrice: { amount: 69, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "Overview: everyone in the binder as a card, with what each one's forms sheet is still missing",
    "Family: a card per person, with allergies, conditions, medications, family history, vaccines, doctors, an emergency contact and insurance",
    "Edit and remove on every record, a stopped date on a medication, and a note of when the medication list was last checked",
    "Symptoms: a structured timeline per person, onset, duration and severity as real fields, never a single text box",
    "Visits: the questions to ask before an appointment, and what was said after it",
    "A private choice on every record, honoured on every printed page, with a count of what was left off",
    "Five printable pages on US Letter: a Forms sheet, a Caregiver sheet, an Emergency card, a Visit page and an Intake summary",
    "Adults and children alike, including a parent you look after, with no separate login for anyone",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "Each person's name, and a birth date and relationship if you want them",
    "Allergies with what happens, conditions, medications with dose and frequency, family history",
    "Vaccines with the dates given",
    "Doctors, a pharmacy, an emergency contact and insurance details",
    "Symptoms as they happen, and questions for an appointment",
  ],
  expectedOutputs: [
    "One card per person, and an overview of everyone",
    "A Forms sheet with the answers school, camp, sports and new-patient forms ask for",
    "A Caregiver sheet for a sitter, grandparent or respite carer",
    "An Emergency card the size of a wallet card",
    "A Visit page with your questions, what is taken now and recent symptoms",
    "A dated Intake summary with allergies, medications, conditions, family history and recent symptoms",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so a fact you add on a laptop is there on your phone at an appointment. Removing a person or a record takes it out of view rather than erasing it.",
  privacyNotes:
    "Your family's facts are private to your account. Draftpace does not sell your data or use it for advertising, and nothing here is read by an AI model: there is no model provider anywhere in this product. It has no connection to any doctor, portal, insurer or pharmacy, and every fact in it is one you typed. Draftpace is not a covered entity under HIPAA; where the FTC Health Breach Notification Rule or an applicable state health-privacy law applies to information you store here, Draftpace follows it. Anything marked private stays in your account and is never printed.",
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters.
   */
  questions: [
    {
      question: "Does this give medical advice or a diagnosis?",
      answer:
        "No, and it never claims to. It keeps facts your family already knows, in a structured, dated form. It never interprets a symptom, never checks a dose or an interaction, and there is no model or AI anywhere in it. What any of it means stays with your family and your clinician.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it tell me which vaccines my child needs?",
      answer:
        "No. Schedules differ by state, school and doctor, and this product does not know them. It keeps the vaccines and dates you type in, and prints them on the Forms sheet. Your pediatrician or your school is the source for what is required.",
      stage: ["deciding", "owning"],
    },
    {
      question: "How is this different from a printable medical binder?",
      answer:
        "A printable binder is a stack of blank pages you fill in by hand, and copy out again whenever something changes. Here you enter each answer once, and every page is made fresh from it: the same allergies and doctor appear on the forms sheet, the sitter sheet and the visit page, and a change in one place is a change in all of them.",
      stage: ["deciding"],
    },
    {
      question: "Does my child need their own account?",
      answer:
        "No, and they cannot have one. Every family member, adult or child, is a row under your own account. Nobody this product tracks gets a separate login, a separate entitlement, or a separate anything.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Can I keep some things off the printed pages?",
      answer:
        "Any allergy, medication, symptom, vaccine or visit can be marked private. It stays fully usable in your own account and is left off every printed page, and each page says how many records it left off so it never looks more complete than it is.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it fill in the school or camp form for me?",
      answer:
        "No. It prints a Forms sheet with the answers those forms ask for, in the order they ask, to sit beside the form while you fill it in. A missing answer is printed as not recorded, never left blank or guessed.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does this replace HIPAA protections or my clinic's own records?",
      answer:
        "No, and this listing will not pretend otherwise. Draftpace is not a HIPAA-covered entity. Where the FTC Health Breach Notification Rule or an applicable state health-privacy law covers information you store here, Draftpace follows it. The pages it prints supplement your clinic's, school's or camp's own paperwork; they never stand in for it.",
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
   * Every answer describes only what the product actually does.
   */
  searchedProblems: [
    {
      phrase: "I can never remember my child's medications at the doctor",
      answer: "They are written down per person, with dose and how often, on whatever device is in your hand at the desk, and stopped ones leave the list.",
    },
    {
      phrase: "What should I bring to a doctor's appointment",
      answer: "A Visit page for that person: your questions with a box to tick each, what is taken now, recent symptoms, and room for notes.",
    },
    {
      phrase: "Camp and school health forms every year",
      answer: "A Forms sheet with the answers those forms ask for, in the order they ask, so you copy from one page instead of finding each fact again.",
    },
    {
      phrase: "What does a babysitter or grandparent need to know about my child",
      answer: "A Caregiver sheet: allergies first, what is taken, who to call, and your own notes about bedtime, comforts and fears.",
    },
    {
      phrase: "Where do I keep everyone's allergies and reactions",
      answer: "Per person, with what happens recorded alongside, in one place you can reach without a clinic portal login.",
    },
    {
      phrase: "I'm looking after my kids and my parent and it's all in my head",
      answer: "Everyone is a row under your one account, adults and children alike, each with their own card, vaccines, doctors and timeline.",
    },
  ],

  /**
   * What an owner opens the manual to do, each row linking to the screen
   * it happens on.
   */
  tasks: [
    {
      label: "See everyone at a glance",
      answer: "Overview shows each person as a card, their next visit, and what their forms sheet is still missing.",
      destination: "workspace",
    },
    {
      label: "Add somebody to the binder",
      answer: "A name is enough. Add a birth date and their relationship to you when you like. No account is created for them.",
      destination: "members",
    },
    {
      label: "Record a medication or an allergy",
      answer: "Dose and how often for a medication, what happens for an allergy, kept against that person and changeable at any time.",
      destination: "members",
    },
    {
      label: "Add their doctor, insurance and emergency contact",
      answer: "On the Care team tab of their card: the answers most forms start with.",
      destination: "members",
    },
    {
      label: "Log a symptom as it happens",
      answer: "What it is, when it started, how long, how severe, and what helped. The same fields every time.",
      destination: "timeline",
    },
    {
      label: "Write down questions for an appointment",
      answer: "Plan the visit, list the questions one per line, and add what was said afterwards.",
      destination: "visits",
    },
    {
      label: "Keep something off the printed page",
      answer: "Mark it private. It stays usable in your account and is left off every printed page.",
      destination: "members",
    },
    {
      label: "Print a page for school, a sitter or an appointment",
      answer: "A Forms sheet, Caregiver sheet, Emergency card, Visit page or Intake summary for one person, each dated.",
      destination: "printables",
    },
  ],

  relatedGuideSlugs: [],
  relatedProductSlugs: ["home-management-companion", "personal-life-affairs-companion"],
  needGroups: ["getting-organized"],
  seo: {
    title: "Family Health Binder: the answers every form asks, entered once for your family",
    description:
      "Keep allergies, medications, doctors, insurance and vaccines for everyone in your family, and print the page school, camp, a sitter or a new doctor wants. No diagnoses, no AI, no child accounts.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
