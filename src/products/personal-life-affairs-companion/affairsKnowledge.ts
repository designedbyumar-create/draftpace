/**
 * What In Order knows about getting your affairs in order, without being
 * told.
 *
 * A curated rules layer, deliberately a plain TypeScript file rather than
 * a table: reviewable in a pull request, diffable, and identical for
 * every person. Same never-AI discipline as the rest of this repository.
 * No model provider is configured anywhere here, and none should be.
 *
 * FOUR JOBS
 *
 * 1. Know what belongs on the list. Most people do not, which is the
 *    product. 43% of people without a will say they simply never got
 *    around to it, and a list they have to invent themselves is exactly
 *    what they never get around to.
 *
 * 2. Sequence it. Steps have prerequisites, which is the structural
 *    difference from Home Base's knowledge base: you cannot name a
 *    backup executor before naming an executor. Home Base ranks
 *    independent jobs; this orders dependent ones.
 *
 * 3. Silence what does not apply. Every step can declare the profile
 *    answers it needs. No children means guardianship is never
 *    mentioned, not greyed out. An Etsy reviewer's complaint about a
 *    75-page binder was "a lot of repeating pages", and that is what
 *    irrelevance feels like on paper.
 *
 * 4. Know when to ask again. confirmEveryMonths is what makes this a
 *    companion rather than a form. A binder cannot ask whether your
 *    executor is still the right person.
 *
 * TWO WORDS ARE BANNED from every string in this file. "Estate" and
 * "assets": 40% of people without a will say they do not have enough
 * assets to need one, so that language confirms their belief and loses
 * them. Say what the person would recognise instead.
 *
 * DELIBERATELY ABSENT: anything that reads as legal advice, any dollar
 * figure, and any instruction to create a document. This product records
 * where things are and prompts you to check them. It never drafts, and
 * it refers out when a real lawyer is the answer.
 */

/** Whether finishing a step creates knowledge, or records something done in the world. */
export type AffairStepKind = "establish" | "action";

/** How much it costs the people you leave behind to skip this. 0 tidy, 1 real cost or delay, 2 serious. */
export type AffairConsequence = 0 | 1 | 2;

/** The profile answers a step can depend on. Absent means the step always applies. */
export type AffairGate =
  | "hasChildren"
  | "hasDependantsWithExtraNeeds"
  | "partnered"
  | "ownsHome"
  | "hasEmployerRetirement"
  | "hasBusiness"
  | "hasPets"
  | "hasLifeInsurance";

/** Sections, used for grouping in the printed copy and nowhere else in the UI. */
export type AffairArea =
  | "people"
  | "paperwork"
  | "money"
  | "home"
  | "dependants"
  | "digital"
  | "wishes"
  | "business";

export const AFFAIR_AREA_LABEL: Record<AffairArea, string> = {
  people: "Who decides, and who to call",
  paperwork: "Where the paperwork is",
  money: "Money coming in and going out",
  home: "Where you live",
  dependants: "People and animals who rely on you",
  digital: "Accounts and devices",
  wishes: "What you would want",
  business: "The business",
};

/**
 * The same areas, named as a person would refer to them.
 *
 * Two label sets on purpose. The printed book gets a sentence, because
 * its reader is somebody else looking for a thing and a heading that
 * reads "Who decides, and who to call" tells them where to look. The app
 * gets a noun, because a person scanning what has been recorded about
 * their life wants a name, not a sentence to read. Forcing one label to
 * do both would make one of the two worse.
 */
export const AFFAIR_DOMAIN_LABEL: Record<AffairArea, string> = {
  people: "People",
  home: "Home",
  money: "Money",
  dependants: "Pets and dependants",
  digital: "Digital life",
  paperwork: "Important documents",
  wishes: "Important instructions",
  business: "Business",
};

/**
 * The order domains appear in, wherever they are listed together. People
 * first because everything else assumes somebody knows who to call.
 */
export const AFFAIR_AREA_ORDER: AffairArea[] = [
  "people",
  "paperwork",
  "money",
  "home",
  "dependants",
  "digital",
  "business",
  "wishes",
];

export interface AffairStep {
  /**
   * Stable key, stored on pla_steps.step_key. Never rename or reuse one:
   * a confirmation recorded two years ago still points at it.
   */
  key: string;
  area: AffairArea;
  /** The hero line. An instruction, specific, in the second person. */
  instruction: string;
  /** Why it matters, in one sentence. Answers "why bother" before it is asked. */
  why: string;
  /** Honest estimate. Directly attacks the people who never start. */
  minutes: number;
  consequence: AffairConsequence;
  /** Step keys that must be confirmed first. The sequencing graph. */
  requires?: string[];
  /** Profile answers that must all be true for this step to exist at all. */
  needs?: AffairGate[];
  /** How often to ask whether this is still true. Undefined means never re-ask. */
  confirmEveryMonths?: number;
  /**
   * What kind of step this is, and therefore what finishing it means.
   *
   * "establish" steps create knowledge. The person answers questions and
   * a Life Affairs record comes out. They cannot be dismissed with a
   * bare "done", because a done with no answer behind it is exactly the
   * defect this distinction exists to prevent: it printed a date into a
   * document that was supposed to tell somebody where things are.
   *
   * "action" steps are done in the world, not in here. Telling your
   * executor you have chosen them, or checking the name on a pension
   * form, happens elsewhere and the honest record is that the person
   * says they did it. These may legitimately be confirmed outright.
   *
   * Every establish step must have an entry in CAPTURE_SPECS, and no
   * action step may have one. Enforced in affairsKnowledge.test.ts, so
   * the two files cannot drift apart.
   */
  kind: AffairStepKind;
  /** Set when the honest answer is "talk to a professional". Shown as such, never disguised as advice. */
  referOut?: string;
}

/**
 * The list. Ordered roughly by the sequence a person should meet them,
 * though real ordering is computed from prerequisites and consequence,
 * not from this array's index.
 */
export const AFFAIR_STEPS: AffairStep[] = [
  // ---------------------------------------------------------------- people
  {
    key: "people.emergency-contact",
    area: "people",
    instruction: "Write down who should be called first.",
    why: "Everything else assumes somebody knows to look. If nobody knows to call, nothing else on this list is ever found.",
    minutes: 2,
    consequence: 2,
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "people.executor",
    area: "people",
    instruction: "Choose the person who would sort things out.",
    why: "Someone has to do the practical work. Choosing them yourself means it is not decided by a court or by whoever volunteers.",
    minutes: 5,
    consequence: 2,
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "people.executor-backup",
    area: "people",
    instruction: "Name a second person, in case the first cannot do it.",
    why: "Most people stop at one. If that person is unwell, abroad, or has died, a court chooses instead of you.",
    minutes: 3,
    consequence: 1,
    requires: ["people.executor"],
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "people.executor-told",
    kind: "action",
    area: "people",
    instruction: "Tell them you have chosen them.",
    why: "People find out at the worst possible moment and sometimes refuse. A short conversation now avoids that entirely.",
    minutes: 10,
    consequence: 1,
    requires: ["people.executor"],
  },
  {
    key: "people.health-decisions",
    area: "people",
    instruction: "Decide who should speak for you about medical care.",
    why: "This matters while you are alive. If you cannot speak for yourself, someone will be asked, and without a name it may not be who you would have chosen.",
    minutes: 5,
    consequence: 2,
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "people.professionals",
    area: "people",
    instruction: "List the professionals who already know your situation.",
    why: "An accountant, a solicitor or a financial adviser can answer in an afternoon what would otherwise take months to reconstruct.",
    minutes: 5,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 24,
  },

  // ------------------------------------------------------------- paperwork
  {
    key: "paperwork.will-exists",
    area: "paperwork",
    instruction: "Record whether you have a will, and where it is.",
    why: "A will nobody can find does nothing at all. Where it is matters as much as having one.",
    minutes: 3,
    consequence: 2,
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "paperwork.will-make-one",
    kind: "action",
    area: "paperwork",
    instruction: "Consider making a will if you do not have one.",
    why: "Without one, the law decides who gets what, and it may not match what you would have chosen.",
    minutes: 5,
    consequence: 2,
    requires: ["paperwork.will-exists"],
    referOut:
      "Making a will is a job for a solicitor or a reputable will service. In Order records where yours is; it does not write one.",
  },
  {
    key: "paperwork.id-documents",
    area: "paperwork",
    instruction: "Note where your birth certificate, passport and national ID are kept.",
    why: "Almost every formal process asks for at least one of these, and hunting for them adds weeks.",
    minutes: 5,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 36,
  },
  {
    key: "paperwork.marriage-divorce",
    area: "paperwork",
    instruction: "Note where your marriage or divorce papers are.",
    why: "These decide entitlements, and a missing decree can stall things for months.",
    minutes: 3,
    consequence: 1,
    needs: ["partnered"],
    kind: "establish",
    confirmEveryMonths: 36,
  },
  {
    key: "paperwork.safe-deposit",
    area: "paperwork",
    instruction: "Record any safe, lockbox or deposit box, and who can open it.",
    why: "A box nobody can open is a box that stays closed. The key and the authority both need naming.",
    minutes: 3,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "paperwork.tax-records",
    area: "paperwork",
    instruction: "Note where your recent tax records are kept.",
    why: "A final return usually has to be filed, and whoever does it starts by looking for last year's.",
    minutes: 3,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 12,
  },

  // ------------------------------------------------------------------ money
  {
    key: "money.current-accounts",
    area: "money",
    instruction: "List the banks you hold accounts with.",
    why: "Not the numbers, just which banks. Nobody can close or claim an account they never knew existed.",
    minutes: 5,
    consequence: 2,
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "money.income-sources",
    area: "money",
    instruction: "Note where your money comes in from.",
    why: "Employers, pensions and benefits all need telling, and each one that is missed becomes a letter or an overpayment later.",
    minutes: 5,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "money.pensions",
    area: "money",
    instruction: "List every pension you have ever paid into.",
    why: "Old workplace pensions are the single most commonly lost thing, because people forget schemes from jobs they left decades ago.",
    minutes: 10,
    consequence: 2,
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "money.beneficiary-check",
    kind: "action",
    area: "money",
    instruction: "Check who is currently named on your pension and life cover.",
    why: "These are paid to whoever is named on the form, and that overrides your will. A form filled in years ago at a previous job quietly wins.",
    minutes: 15,
    consequence: 2,
    requires: ["money.pensions"],
    confirmEveryMonths: 12,
  },
  {
    key: "money.beneficiary-after-change",
    kind: "action",
    area: "money",
    instruction: "Update the named person if your situation has changed.",
    why: "Separation and divorce do not automatically remove a former partner from these forms. It has to be done by hand.",
    minutes: 20,
    consequence: 2,
    requires: ["money.beneficiary-check"],
  },
  {
    key: "money.retirement-employer",
    kind: "action",
    area: "money",
    instruction: "Check the named person on your workplace retirement plan.",
    why: "This is the form most often left as it was on your first day, sometimes naming someone you have not spoken to in years.",
    minutes: 10,
    consequence: 2,
    needs: ["hasEmployerRetirement"],
    confirmEveryMonths: 12,
  },
  {
    key: "money.life-cover",
    area: "money",
    instruction: "Record who your life cover is with and roughly what it covers.",
    why: "Policies go unclaimed constantly, because nobody knew they existed.",
    minutes: 5,
    consequence: 2,
    needs: ["hasLifeInsurance"],
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "money.debts",
    area: "money",
    instruction: "Note what you owe and to whom.",
    why: "Debts do not disappear quietly. Knowing about them early prevents the people sorting things out being surprised by a demand.",
    minutes: 8,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "money.regular-payments",
    area: "money",
    instruction: "List what leaves your account automatically.",
    why: "Subscriptions and direct debits keep taking money long after they should. This is the list that stops that.",
    minutes: 10,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 12,
  },

  // ------------------------------------------------------------------- home
  {
    key: "home.where-you-live",
    area: "home",
    instruction: "Record whether you own or rent, and where the paperwork is.",
    why: "The deed or the tenancy decides what happens to the roof over everyone's head, and it is the first thing asked for.",
    minutes: 5,
    consequence: 2,
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "home.mortgage",
    area: "home",
    instruction: "Note who your mortgage is with.",
    why: "Payments continue regardless. Whoever steps in needs to know who to contact before arrears build up.",
    minutes: 3,
    consequence: 2,
    needs: ["ownsHome"],
    requires: ["home.where-you-live"],
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "home.insurance",
    area: "home",
    instruction: "Record your home or contents insurance.",
    why: "Cover can lapse when a policy holder changes, and an empty property is often uninsured by default.",
    minutes: 3,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "home.utilities",
    area: "home",
    instruction: "List your utility providers.",
    why: "Each one needs telling separately, and each one that is missed keeps billing.",
    minutes: 5,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "home.keys",
    kind: "establish",
    area: "home",
    instruction: "Note where spare keys are and who has one.",
    why: "Someone will need to get in, and a locksmith at short notice is the expensive version of this answer.",
    minutes: 2,
    consequence: 1,
    confirmEveryMonths: 24,
  },
  {
    key: "home.vehicle",
    area: "home",
    instruction: "Record any vehicle and where its documents are.",
    why: "A vehicle cannot be sold or transferred without its paperwork, and it keeps costing money in the meantime.",
    minutes: 4,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 24,
  },

  // ------------------------------------------------------------- dependants
  {
    key: "dependants.guardian",
    area: "dependants",
    instruction: "Decide who would raise your children.",
    why: "If nobody is named, a court decides. This is the single most common reason people finally sit down and do any of this.",
    minutes: 10,
    consequence: 2,
    needs: ["hasChildren"],
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "dependants.guardian-asked",
    kind: "action",
    area: "dependants",
    instruction: "Ask them first.",
    why: "Naming someone who would say no is worse than naming nobody, because it looks settled when it is not.",
    minutes: 15,
    consequence: 2,
    needs: ["hasChildren"],
    requires: ["dependants.guardian"],
  },
  {
    key: "dependants.guardian-backup",
    area: "dependants",
    instruction: "Name a second choice.",
    why: "Circumstances change. A backup means the decision still holds if the first person cannot.",
    minutes: 5,
    consequence: 1,
    needs: ["hasChildren"],
    requires: ["dependants.guardian"],
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "dependants.children-practical",
    kind: "establish",
    area: "dependants",
    instruction: "Write down the practical details of your children's lives.",
    why: "School, doctor, allergies, routines. Whoever steps in is doing it on the worst day of their life and should not also be guessing.",
    minutes: 15,
    consequence: 1,
    needs: ["hasChildren"],
    confirmEveryMonths: 12,
  },
  {
    key: "dependants.extra-needs",
    kind: "establish",
    area: "dependants",
    instruction: "Record the care arrangements for anyone who depends on you.",
    why: "Ongoing care can be disrupted within days. Naming who provides it and how it is funded keeps it running.",
    minutes: 20,
    consequence: 2,
    needs: ["hasDependantsWithExtraNeeds"],
    confirmEveryMonths: 12,
    referOut:
      "Long-term care funding for a dependant is worth specialist advice. In Order records the arrangement; it does not plan it.",
  },
  {
    key: "dependants.pets",
    area: "dependants",
    instruction: "Say who would take your pets, and what they need.",
    why: "Animals end up in shelters after exactly this gap. It takes two minutes to prevent.",
    minutes: 4,
    consequence: 1,
    needs: ["hasPets"],
    kind: "establish",
    confirmEveryMonths: 24,
  },

  // ---------------------------------------------------------------- digital
  {
    key: "digital.phone-access",
    kind: "action",
    area: "digital",
    instruction: "Make sure someone can unlock your phone.",
    why: "Two-factor codes, photographs and half your accounts live behind it. Without access, most of the rest becomes much harder.",
    minutes: 5,
    consequence: 2,
    confirmEveryMonths: 12,
  },
  {
    key: "digital.email",
    area: "digital",
    instruction: "Note which email address everything is registered to.",
    why: "It is the recovery route for nearly every other account. Knowing which one it is saves days.",
    minutes: 2,
    consequence: 2,
    kind: "establish",
    confirmEveryMonths: 24,
  },
  {
    key: "digital.password-manager",
    kind: "establish",
    area: "digital",
    instruction: "Record whether you use a password manager, and how access is recovered.",
    why: "A password manager nobody can open locks away everything it was protecting.",
    minutes: 5,
    consequence: 2,
    confirmEveryMonths: 12,
  },
  {
    key: "digital.accounts-that-cost",
    area: "digital",
    instruction: "List the online accounts that charge money.",
    why: "These keep billing quietly for years, and each provider has to be contacted separately.",
    minutes: 8,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 12,
  },
  {
    key: "digital.legacy-contacts",
    kind: "action",
    area: "digital",
    instruction: "Set a legacy contact where your accounts offer one.",
    why: "Several major providers let you nominate someone in advance. Almost nobody does, and afterwards it is far harder.",
    minutes: 15,
    consequence: 1,
    requires: ["digital.email"],
    confirmEveryMonths: 24,
  },
  {
    key: "digital.photos",
    area: "digital",
    instruction: "Note where your photographs actually live.",
    why: "This is the thing families say they most wanted and most often lost, and cloud accounts close after inactivity.",
    minutes: 5,
    consequence: 1,
    kind: "establish",
    confirmEveryMonths: 24,
  },

  // ----------------------------------------------------------------- wishes
  {
    key: "wishes.medical-preferences",
    kind: "establish",
    area: "wishes",
    instruction: "Write down your preferences about medical treatment.",
    why: "This spares the person making decisions from guessing, and from carrying the doubt afterwards.",
    minutes: 15,
    consequence: 2,
    requires: ["people.health-decisions"],
    confirmEveryMonths: 24,
  },
  {
    key: "wishes.arrangements",
    kind: "establish",
    area: "wishes",
    instruction: "Say what you would want arranged, in plain terms.",
    why: "Families disagree most when nobody knows what was wanted. A few lines settles it.",
    minutes: 10,
    consequence: 1,
    confirmEveryMonths: 36,
  },
  {
    key: "wishes.belongings",
    kind: "establish",
    area: "wishes",
    instruction: "Note anything with meaning that is not obvious from its value.",
    why: "The arguments are almost never about the valuable things. They are about the ring nobody knew was promised.",
    minutes: 10,
    consequence: 1,
    confirmEveryMonths: 24,
  },
  {
    key: "wishes.letters",
    kind: "establish",
    area: "wishes",
    instruction: "Write anything you would want said.",
    why: "Nothing else on this list is remembered the way this is. It is also the only part nobody else can do for you.",
    minutes: 20,
    consequence: 0,
  },

  // --------------------------------------------------------------- business
  {
    key: "business.paperwork",
    area: "business",
    kind: "establish",
    instruction: "Note where the business paperwork is kept.",
    why: "Somebody stepping in has to find the accounts, the contracts and the insurance before they can do anything at all, and none of it is usually where the household paperwork is.",
    minutes: 4,
    consequence: 1,
    needs: ["hasBusiness"],
    confirmEveryMonths: 24,
  },
  {
    key: "money.business-continuity",
    area: "business",
    instruction: "Record who could keep your business running, or wind it down.",
    why: "A business without a named person can stall within a week, and staff and customers are affected first.",
    minutes: 20,
    consequence: 2,
    needs: ["hasBusiness"],
    kind: "establish",
    confirmEveryMonths: 12,
    referOut:
      "Business succession usually needs an accountant or solicitor who knows the structure. In Order records who to call.",
  },
];

export const AFFAIR_STEP_BY_KEY: Record<string, AffairStep> = Object.fromEntries(
  AFFAIR_STEPS.map((step) => [step.key, step])
);
