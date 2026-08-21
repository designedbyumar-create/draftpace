/**
 * What the companion actually asks, one question at a time.
 *
 * WHY THIS IS NOT A FORM
 *
 * The binders and apps this product competes with open with a page
 * headed "Primary Contact" and eleven labelled boxes. People close them.
 * The reviews say so in almost those words. So nothing here is ever
 * shown as a form: each prompt is a single question, asked in the second
 * person, and the next one is chosen after the answer arrives.
 *
 * The rule every spec below is held to: what is the smallest amount of
 * information that makes this useful to somebody holding the printed
 * copy? Four prompts is the practical ceiling and most have two or
 * three. A prompt that only serves tidiness does not earn its place.
 *
 * WHY IT LIVES BESIDE affairsKnowledge RATHER THAN INSIDE IT
 *
 * That file holds what belongs on the list, why, how urgent, and what
 * depends on what. This file holds the script for one conversation.
 * They change for different reasons and by different kinds of edit.
 * affairsKnowledge.test.ts asserts that every establish step has a spec
 * here and no action step does, so they cannot silently drift.
 *
 * WHAT MAY NOT BE ASKED
 *
 * No prompt in this file may request a password, a master password, a
 * PIN, an account number, a security answer, or a full identity number.
 * Where a person's instinct would be to write one down, the prompt asks
 * where the access instructions are kept instead. There is a test that
 * greps every prompt string in this file for those words.
 */

/**
 * The answer that means the person genuinely does not know yet.
 *
 * Not the same as no, and it must never be recorded as one. It leaves
 * the record standing as incomplete, which the printed copy prints
 * honestly and which the companion may return to later without nagging.
 */
export const UNSURE = "I'm not sure";

export interface CapturePrompt {
  /**
   * Where the answer goes. Five names are reserved and write to real
   * columns because every kind of record has them and other code reads
   * them without knowing the kind: label, whereabouts, personName,
   * personContact, notes. Any other name goes into the record's open
   * fields bag.
   */
  field: string;
  /** The question, as the companion would say it out loud. */
  prompt: string;
  /** One short line under the question. Used for reassurance, never for instructions. */
  hint?: string;
  placeholder?: string;
  multiline?: boolean;
  /** Skippable. The companion moves on without comment and never returns to it unprompted. */
  optional?: boolean;
  /** Turns the prompt into a pick one rather than a text box. */
  choices?: string[];
  /**
   * Ask this only when an earlier answer in the same capture allows it.
   * With `equals`, only for those answers; without, for any answer at
   * all. This is how "where is it kept" never gets asked of somebody who
   * just said they do not have one.
   */
  askIf?: { field: string; equals?: string[] };
}

export interface CaptureSpec {
  /** Open validated string. The shape of the record, not its subject. */
  itemKind: string;
  prompts: CapturePrompt[];
  /** Which answer becomes the record's name. */
  labelFrom?: string;
  /** For singletons, where asking the person to name the record would be bureaucratic. */
  labelFixed?: string;
  /** Whether a person can hold several of these. Banks, pensions, pets, professionals. */
  multiple?: boolean;
  addAnotherLabel?: string;
  /**
   * The line shown once it is saved, with {label} replaced by the
   * record's name. Deterministic template, never generated: there is no
   * model provider anywhere in this repository and there will not be.
   */
  acknowledgement: string;
}

const CONTACT_HINT = "A phone number or an email. Nothing else is needed.";

export const CAPTURE_SPECS: Record<string, CaptureSpec> = {
  // ---------------------------------------------------------------- people
  "people.emergency-contact": {
    itemKind: "person",
    labelFrom: "personName",
    acknowledgement: "Recorded. {label} is who someone would start with.",
    prompts: [
      { field: "personName", prompt: "Who should someone contact first?", hint: "A name is enough to begin with." },
      { field: "relationship", prompt: "What are they to you?", placeholder: "Partner, sister, close friend" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
      {
        field: "notes",
        prompt: "Is there anything they should know?",
        placeholder: "She knows where everything is kept.",
        multiline: true,
        optional: true,
      },
    ],
  },
  "people.executor": {
    itemKind: "person",
    labelFrom: "personName",
    acknowledgement: "Recorded. {label} is the person who would sort things out.",
    prompts: [
      { field: "personName", prompt: "Who would you want to sort things out?" },
      { field: "relationship", prompt: "What are they to you?", placeholder: "Partner, brother, oldest friend" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
      {
        field: "notes",
        prompt: "Is there anything they would need to know to start?",
        placeholder: "He has a key and knows about the folder in the study.",
        multiline: true,
        optional: true,
      },
    ],
  },
  "people.executor-backup": {
    itemKind: "person",
    labelFrom: "personName",
    acknowledgement: "Recorded. {label} would step in if the first person could not.",
    prompts: [
      { field: "personName", prompt: "Who would step in if they could not?" },
      { field: "relationship", prompt: "What are they to you?" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
    ],
  },
  "people.health-decisions": {
    itemKind: "person",
    labelFrom: "personName",
    acknowledgement: "Recorded. {label} would be asked about your medical care.",
    prompts: [
      { field: "personName", prompt: "Who should speak for you about medical care?" },
      { field: "relationship", prompt: "What are they to you?" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
      {
        field: "discussed",
        prompt: "Have you talked to them about what you would want?",
        choices: ["Yes, we have talked about it", "Not yet", UNSURE],
      },
    ],
  },
  "people.professionals": {
    itemKind: "person",
    labelFrom: "personName",
    multiple: true,
    addAnotherLabel: "Add another professional",
    acknowledgement: "Recorded. {label} is on the list of people who already know something.",
    prompts: [
      { field: "personName", prompt: "Who is the professional?", hint: "A person or a firm, whichever is easier to find." },
      { field: "role", prompt: "What do they do for you?", placeholder: "Accountant, solicitor, financial adviser" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
      {
        field: "notes",
        prompt: "What do they already know about?",
        placeholder: "He has done my tax return for nine years.",
        multiline: true,
        optional: true,
      },
    ],
  },

  // ------------------------------------------------------------- paperwork
  "paperwork.will-exists": {
    itemKind: "document",
    labelFixed: "Your will",
    acknowledgement: "Recorded.",
    prompts: [
      { field: "exists", prompt: "Do you have a will?", choices: ["Yes", "No", UNSURE] },
      {
        field: "whereabouts",
        prompt: "Where is it kept?",
        hint: "In your own words. A will nobody can find does nothing at all.",
        askIf: { field: "exists", equals: ["Yes"] },
      },
      {
        field: "copyHeldBy",
        prompt: "Does anyone else have a copy, or know where it is?",
        optional: true,
        askIf: { field: "exists", equals: ["Yes"] },
      },
    ],
  },
  "paperwork.id-documents": {
    itemKind: "location",
    labelFixed: "Identity documents",
    acknowledgement: "Recorded. Someone would know where to look.",
    prompts: [
      {
        field: "whereabouts",
        prompt: "Where are your birth certificate, passport and ID kept?",
        hint: "Almost every formal process asks for at least one of these.",
      },
      {
        field: "notes",
        prompt: "Is anything kept somewhere different?",
        placeholder: "The passport is in the bedroom drawer, everything else is in the study.",
        multiline: true,
        optional: true,
      },
    ],
  },
  "paperwork.marriage-divorce": {
    itemKind: "location",
    labelFixed: "Marriage or divorce papers",
    acknowledgement: "Recorded.",
    prompts: [{ field: "whereabouts", prompt: "Where are your marriage or divorce papers kept?" }],
  },
  "paperwork.safe-deposit": {
    itemKind: "location",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another",
    acknowledgement: "Recorded. {label}, and who can open it.",
    prompts: [
      { field: "label", prompt: "What is it?", placeholder: "Home safe, deposit box at the bank" },
      { field: "whereabouts", prompt: "Where is it?" },
      {
        field: "openableBy",
        prompt: "Who is able to open it?",
        hint: "A name, not a code. Never record the combination here.",
        optional: true,
      },
      {
        field: "notes",
        prompt: "Where would someone find out how to open it?",
        hint: "Where the instructions are kept, not the instructions themselves.",
        placeholder: "My solicitor holds the details.",
        optional: true,
      },
    ],
  },
  "paperwork.tax-records": {
    itemKind: "location",
    labelFixed: "Tax records",
    acknowledgement: "Recorded.",
    prompts: [
      { field: "whereabouts", prompt: "Where are your recent tax records kept?", placeholder: "Filing cabinet in the study, and online with my accountant" },
    ],
  },

  // ----------------------------------------------------------------- money
  "money.current-accounts": {
    itemKind: "account",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another bank",
    acknowledgement: "Recorded. {label} is on the list.",
    prompts: [
      {
        field: "label",
        prompt: "Which bank?",
        hint: "The bank's name only. Never an account number.",
        placeholder: "Barclays",
      },
      {
        field: "purpose",
        prompt: "What is this account for?",
        placeholder: "Everyday spending, joint account, savings",
        optional: true,
      },
      {
        field: "notes",
        prompt: "Is there anything unusual about it?",
        placeholder: "It is a joint account with my brother.",
        multiline: true,
        optional: true,
      },
    ],
  },
  "money.income-sources": {
    itemKind: "obligation",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another",
    acknowledgement: "Recorded. {label}.",
    prompts: [
      { field: "label", prompt: "Where does money come in from?", placeholder: "My salary, the rent from the flat, a state pension" },
      { field: "notes", prompt: "Anything someone would need to know about it?", multiline: true, optional: true },
    ],
  },
  "money.pensions": {
    itemKind: "policy",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another pension",
    acknowledgement: "Recorded. {label} is on the list.",
    prompts: [
      { field: "label", prompt: "Which pension is this?", placeholder: "The one from Barclays, my current workplace scheme" },
      { field: "provider", prompt: "Who runs it?", optional: true },
      {
        field: "whereabouts",
        prompt: "Where would someone find the paperwork?",
        placeholder: "Statements come by post and go in the study folder.",
        optional: true,
      },
      {
        field: "namedToReceive",
        prompt: "Who is named to receive it?",
        hint: "This form usually overrides a will, which is why it is worth knowing.",
        optional: true,
      },
    ],
  },
  "money.life-cover": {
    itemKind: "policy",
    labelFrom: "provider",
    acknowledgement: "Recorded. Cover with {label}.",
    prompts: [
      { field: "provider", prompt: "Who is your life cover with?" },
      { field: "whereabouts", prompt: "Where is the policy paperwork?", optional: true },
      {
        field: "namedToReceive",
        prompt: "Who is named to receive it?",
        hint: "Policies go unclaimed because nobody knew they existed.",
        optional: true,
      },
    ],
  },
  "money.debts": {
    itemKind: "obligation",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another",
    acknowledgement: "Recorded. {label}.",
    prompts: [
      {
        field: "label",
        prompt: "What do you owe, and to whom?",
        hint: "Roughly is fine. Nobody needs a figure to the penny.",
        placeholder: "Car finance with Santander, a credit card",
      },
      { field: "notes", prompt: "Anything someone would need to know?", multiline: true, optional: true },
    ],
  },
  "money.regular-payments": {
    itemKind: "obligation",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another",
    acknowledgement: "Recorded. {label}.",
    prompts: [
      { field: "label", prompt: "What leaves your account automatically?", placeholder: "Council tax, the gym, a storage unit" },
      { field: "notes", prompt: "Should it be stopped, or kept going?", choices: ["Stop it", "Keep it going", UNSURE] },
    ],
  },
  "money.business-continuity": {
    itemKind: "person",
    labelFrom: "personName",
    acknowledgement: "Recorded. {label} could take it on.",
    prompts: [
      { field: "personName", prompt: "Who could keep the business running, or wind it down?" },
      { field: "relationship", prompt: "What is their part in it?", placeholder: "Business partner, my accountant, my deputy" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
      {
        field: "notes",
        prompt: "What would they need to know first?",
        placeholder: "Payroll runs on the 28th and only I have approved it so far.",
        multiline: true,
        optional: true,
      },
    ],
  },

  // -------------------------------------------------------------- business
  "business.paperwork": {
    itemKind: "location",
    labelFixed: "The business paperwork",
    acknowledgement: "Recorded.",
    prompts: [
      {
        field: "whereabouts",
        prompt: "Where is the business paperwork kept?",
        hint: "Accounts, contracts, insurance. Whatever somebody would have to find first.",
        placeholder: "The blue folders in the office, and the accounts are with my accountant.",
        multiline: true,
      },
      {
        field: "notes",
        prompt: "Is there anything they would need to know to make sense of it?",
        multiline: true,
        optional: true,
      },
    ],
  },

  // ------------------------------------------------------------------ home
  "home.where-you-live": {
    itemKind: "property",
    labelFixed: "Where you live",
    acknowledgement: "Recorded.",
    prompts: [
      { field: "tenure", prompt: "Do you own or rent?", choices: ["I own it", "I rent it", "Something else"] },
      {
        field: "whereabouts",
        prompt: "Where is the paperwork kept?",
        placeholder: "The deeds are with the solicitor, the rest is in the study.",
      },
      { field: "notes", prompt: "Anything unusual about the arrangement?", multiline: true, optional: true },
    ],
  },
  "home.mortgage": {
    itemKind: "obligation",
    labelFrom: "provider",
    acknowledgement: "Recorded. The mortgage is with {label}.",
    prompts: [
      { field: "provider", prompt: "Who is your mortgage with?", hint: "The lender's name. Never the account number." },
      { field: "whereabouts", prompt: "Where is the paperwork?", optional: true },
    ],
  },
  "home.insurance": {
    itemKind: "policy",
    labelFrom: "provider",
    acknowledgement: "Recorded. Insured with {label}.",
    prompts: [
      { field: "provider", prompt: "Who insures the house or its contents?" },
      { field: "renewalMonth", prompt: "Roughly when does it renew?", placeholder: "March", optional: true },
      { field: "whereabouts", prompt: "Where is the policy kept?", optional: true },
    ],
  },
  "home.utilities": {
    itemKind: "obligation",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another provider",
    acknowledgement: "Recorded. {label}.",
    prompts: [
      { field: "label", prompt: "Which provider?", placeholder: "Electricity with Octopus, water with Thames" },
      { field: "notes", prompt: "Anything worth knowing?", multiline: true, optional: true },
    ],
  },
  "home.keys": {
    itemKind: "person",
    labelFrom: "personName",
    multiple: true,
    addAnotherLabel: "Add another person",
    acknowledgement: "Recorded. {label} could get in.",
    prompts: [
      { field: "personName", prompt: "Who has a spare key?" },
      { field: "relationship", prompt: "What are they to you?", placeholder: "Neighbour, sister, the letting agent" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
    ],
  },
  "home.vehicle": {
    itemKind: "property",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another vehicle",
    acknowledgement: "Recorded. {label}.",
    prompts: [
      { field: "label", prompt: "Which vehicle?", placeholder: "The blue Volvo" },
      { field: "whereabouts", prompt: "Where are its documents kept?", optional: true },
      { field: "provider", prompt: "Who is it insured with?", optional: true },
    ],
  },

  // ------------------------------------------------------------ dependants
  "dependants.guardian": {
    itemKind: "person",
    labelFrom: "personName",
    acknowledgement: "Recorded. {label} is who you would want.",
    prompts: [
      { field: "personName", prompt: "Who would you want to raise your children?" },
      { field: "relationship", prompt: "What are they to you?" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
      {
        field: "notes",
        prompt: "Why them?",
        hint: "This is the one line a court or a family member is most likely to read.",
        multiline: true,
        optional: true,
      },
    ],
  },
  "dependants.guardian-backup": {
    itemKind: "person",
    labelFrom: "personName",
    acknowledgement: "Recorded. {label} is your second choice.",
    prompts: [
      { field: "personName", prompt: "Who would be your second choice?" },
      { field: "relationship", prompt: "What are they to you?" },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
    ],
  },
  "dependants.children-practical": {
    itemKind: "instruction",
    labelFixed: "The practical details",
    acknowledgement: "Recorded. Somebody could pick up the week without asking.",
    prompts: [
      {
        field: "notes",
        prompt: "What would somebody need to know to get through a normal week?",
        hint: "School, the doctor, who collects them, what happens on which day.",
        multiline: true,
      },
      { field: "whereabouts", prompt: "Where would they find the paperwork for any of that?", optional: true },
    ],
  },
  "dependants.extra-needs": {
    itemKind: "instruction",
    labelFixed: "Care arrangements",
    acknowledgement: "Recorded.",
    prompts: [
      { field: "personName", prompt: "Who is it that depends on you?" },
      {
        field: "notes",
        prompt: "What does the arrangement look like day to day?",
        hint: "Care can be disrupted within days, so plain detail helps more than anything formal.",
        multiline: true,
      },
      { field: "otherCarers", prompt: "Is there anyone else involved in their care?", optional: true },
    ],
  },
  "dependants.pets": {
    itemKind: "person",
    labelFrom: "personName",
    multiple: true,
    addAnotherLabel: "Add another animal",
    acknowledgement: "Recorded. {label} would take them.",
    prompts: [
      { field: "personName", prompt: "Who would take your pets?" },
      { field: "animals", prompt: "Which animals?", placeholder: "Two cats", optional: true },
      { field: "personContact", prompt: "How would someone reach them?", hint: CONTACT_HINT, optional: true },
      {
        field: "notes",
        prompt: "What do they need?",
        placeholder: "The older one is on medication from the vet on the high street.",
        multiline: true,
        optional: true,
      },
    ],
  },

  // --------------------------------------------------------------- digital
  "digital.email": {
    itemKind: "account",
    labelFixed: "Your main email address",
    acknowledgement: "Recorded.",
    prompts: [
      {
        field: "label",
        prompt: "Which email address is everything registered to?",
        hint: "The address only. Never the password.",
      },
      {
        field: "notes",
        prompt: "Is anything important registered to a different one?",
        multiline: true,
        optional: true,
      },
    ],
  },
  "digital.password-manager": {
    itemKind: "instruction",
    labelFixed: "Getting into your accounts",
    acknowledgement: "Recorded. Somebody would know where to start, without you having written anything down here.",
    prompts: [
      { field: "usesOne", prompt: "Do you use a password manager?", choices: ["Yes", "No", UNSURE] },
      {
        field: "provider",
        prompt: "Which one?",
        askIf: { field: "usesOne", equals: ["Yes"] },
      },
      {
        field: "notes",
        prompt: "Where are the recovery instructions kept?",
        hint: "Where somebody would find out how to get in. Never the master password, and never write it here.",
        placeholder: "The recovery kit is in the safe. My brother knows the safe is there.",
        multiline: true,
      },
    ],
  },
  "digital.accounts-that-cost": {
    itemKind: "obligation",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another",
    acknowledgement: "Recorded. {label}.",
    prompts: [
      { field: "label", prompt: "Which account charges money?", placeholder: "A domain name, cloud storage, a subscription" },
      { field: "notes", prompt: "Should it be stopped, or kept going?", choices: ["Stop it", "Keep it going", UNSURE] },
    ],
  },
  "digital.photos": {
    itemKind: "location",
    labelFixed: "Your photographs",
    acknowledgement: "Recorded. This is the one people say they wish they had known.",
    prompts: [
      {
        field: "whereabouts",
        prompt: "Where do your photographs actually live?",
        placeholder: "On my phone, backed up to Google Photos, and the old ones are in boxes in the loft.",
        multiline: true,
      },
      { field: "notes", prompt: "Is there anything you would want kept?", multiline: true, optional: true },
    ],
  },

  // ---------------------------------------------------------------- wishes
  "wishes.medical-preferences": {
    itemKind: "preference",
    labelFixed: "About medical treatment",
    acknowledgement: "Recorded. This is now written down in your own words.",
    prompts: [
      {
        field: "notes",
        prompt: "What would you want the people deciding for you to know?",
        hint: "Your own words are worth more here than any form. There is no right answer.",
        multiline: true,
      },
      {
        field: "whereabouts",
        prompt: "Have you put any of this in a formal document, and where is it?",
        optional: true,
      },
    ],
  },
  "wishes.arrangements": {
    itemKind: "preference",
    labelFixed: "What you would want arranged",
    acknowledgement: "Recorded. Nobody will have to guess.",
    prompts: [
      {
        field: "notes",
        prompt: "What would you want arranged?",
        hint: "In plain terms. People find this decision hardest when they are guessing.",
        multiline: true,
      },
      { field: "prepaid", prompt: "Is anything already paid for or arranged?", choices: ["Yes", "No", UNSURE] },
      { field: "whereabouts", prompt: "Where is that paperwork?", askIf: { field: "prepaid", equals: ["Yes"] } },
    ],
  },
  "wishes.belongings": {
    itemKind: "preference",
    labelFrom: "label",
    multiple: true,
    addAnotherLabel: "Add another",
    acknowledgement: "Recorded. {label}.",
    prompts: [
      {
        field: "label",
        prompt: "What is it?",
        hint: "Something whose meaning is not obvious from what it is worth.",
        placeholder: "My father's watch",
      },
      { field: "shouldGoTo", prompt: "Who should have it?", optional: true },
      { field: "notes", prompt: "Why?", multiline: true, optional: true },
    ],
  },
  "wishes.letters": {
    itemKind: "location",
    labelFixed: "Anything you have written",
    acknowledgement: "Recorded. Somebody would find it.",
    prompts: [
      {
        field: "whereabouts",
        prompt: "If you have written anything for someone, where is it kept?",
        hint: "In Order does not hold the letter. It records where to look for it.",
      },
      { field: "writtenFor", prompt: "Who is it for?", optional: true },
    ],
  },
};
