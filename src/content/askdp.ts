/**
 * Ask DP's knowledge base.
 *
 * THE RULE THIS FILE IS WRITTEN UNDER
 *
 * Every fact here was checked against a real source at the time it was
 * written, not recalled from training and phrased confidently. Where two
 * sources disagreed during research, the primary one won and the other
 * was discarded rather than averaged. `verifiedAt` is the date that
 * checking happened, and a surface reading this data has to show it,
 * the same discipline `Guide.updatedAt` already holds guides to.
 *
 * Two answer shapes exist because two different kinds of question exist.
 * A RULE has one correct answer for a given jurisdiction, backed by a
 * statute or an official body: a security deposit limit, a filing
 * deadline, a contribution cap. A RANGE has no single correct answer,
 * only a bound and what moves it: a typical cost, a typical timeline.
 * Rendering both the same way is what makes a range sound like a
 * promise, so the type system keeps them apart rather than trusting
 * a component to remember to.
 *
 * WHAT THIS FILE DOES NOT DO
 *
 * It does not cover every state, province, or nation of the UK for
 * every question. Where research did not reach a jurisdiction, that
 * jurisdiction is left out rather than filled with a guess extrapolated
 * from a neighbour. `entriesFor()` and the UI both have to treat "no
 * entry" as a real, displayable answer: a real, honest, "not covered
 * yet", not a silent gap.
 */

export type Country = "us" | "uk" | "ca";

/**
 * A jurisdiction narrower than country, only where research showed the
 * answer actually depends on it. Most entries don't need this: the
 * default is that a country-level answer holds everywhere in it. It is
 * declared, loudly, only where that's false, mirroring the existing
 * Guide.locale? contract in content/guides.ts.
 */
export type Jurisdiction =
  | { country: "us"; state?: string }
  | { country: "uk"; nation?: "england" | "wales" | "scotland" | "northern-ireland" }
  | { country: "ca"; province?: string };

export const COUNTRY_LABEL: Record<Country, string> = {
  us: "United States",
  uk: "United Kingdom",
  ca: "Canada",
};

/** The nine areas Ask DP is organised by. Distinct from LIFE_AREAS: this
 *  taxonomy is what a person searches by, not what a Companion is built
 *  around, and four of these (legal, work, documents, cars) don't map to
 *  an existing life area at all yet. */
export type AskTopic =
  | "money"
  | "home"
  | "legal"
  | "personal-affairs"
  | "travel"
  | "work"
  | "documents"
  | "cars"
  | "family";

export const ASK_TOPICS: { slug: AskTopic; label: string }[] = [
  { slug: "money", label: "Money & Finance" },
  { slug: "home", label: "Home & Household" },
  { slug: "legal", label: "Legal & Administrative" },
  { slug: "personal-affairs", label: "Personal Affairs" },
  { slug: "travel", label: "Travel" },
  { slug: "work", label: "Work & Career" },
  { slug: "documents", label: "Documents & Records" },
  { slug: "cars", label: "Cars & Ownership" },
  { slug: "family", label: "Family & Life" },
];

type EntryBase = {
  slug: string;
  /** The question in the words a person actually searches, shown as a
   *  clickable chip under its topic and matched against free-typed text. */
  question: string;
  topic: AskTopic;
  /** A second guide slug this can hand a reader on to, if one exists. */
  relatedGuideSlug?: string;
  /** A real, verified post on Wealth Drafts (wealthdrafts.com), Draftpace's
   *  own personal-finance site, when one covers the same ground in more
   *  depth. Kept separate from `source`: `source` is the legal/regulatory
   *  authority behind a fact, this is further reading from a sister
   *  property, and the two should never be blurred into one citation. */
  wealthdrafts?: { title: string; url: string };
  /** The product handoff. Rendered visually separate from the answer,
   *  never blended into it, same rule the guide-to-Companion handover
   *  in content/guides.ts already follows. */
  relatedProductSlug?: string;
  source: { name: string; url: string };
  verifiedAt: string;
  /** Set only when the rule itself is mid-change: a passed law not yet
   *  in force, a threshold about to move. Rendered as a visible notice,
   *  not folded into the answer text. */
  changing?: string;
};

export type RuleEntry = EntryBase & {
  kind: "rule";
  jurisdiction: Jurisdiction | "universal";
  answer: string;
};

export type RangeEntry = EntryBase & {
  kind: "range";
  jurisdiction: Jurisdiction | "universal";
  low: string;
  high: string;
  unit: string;
  variesBy: string[];
};

export type AskEntry = RuleEntry | RangeEntry;

/**
 * A question about Ask DP itself, not about a law or a rule: "what are
 * you," "can I trust this," "do you save what I type." These have no
 * jurisdiction and nothing to cite, so they deliberately don't extend
 * EntryBase or carry a `source`. They're matched by the same free-text
 * search as everything else, just never shown as a tenth topic chip: a
 * "what are you?" chip sitting next to "Cars & Ownership" would read as
 * filler, not as a real research area. They surface instead as a small
 * set of suggestions next to the search box.
 */
export type MetaEntry = {
  slug: string;
  /** The canonical phrasing, shown as the question once answered. */
  question: string;
  /** Other real ways someone might type the same question, matched to
   *  this same entry without duplicating the answer. */
  aliases: string[];
  answer: string;
};

export const META_ENTRIES: MetaEntry[] = [
  {
    slug: "meta-what-are-you",
    question: "What are you?",
    aliases: ["who are you", "what is ask dp", "what is this"],
    answer:
      "I'm Ask DP, Draftpace's own question library. Think of it as a librarian, not a chatbot: nothing here generates an answer or guesses. Ask something, and it looks for a matching entry that was already researched and sourced ahead of time, then shows you exactly that, with where it came from. If nothing in the library covers what you asked, it says so plainly instead of making something up.",
  },
  {
    slug: "meta-are-you-ai",
    question: "Are you an AI, like ChatGPT?",
    aliases: ["are you chatgpt", "are you a chatbot", "is this ai", "are you an ai"],
    answer:
      "Not the kind that writes answers on the fly, and that's deliberate: nothing here is composed, so nothing here can be wrong in a fluent-sounding way. What's actually running is a matching system. It reads what you typed, finds the closest hand-written entry in the library, and shows it to you word for word, unedited. The only part doing any real work is how it matches your question, not how it writes the answer, because it never writes one.",
  },
  {
    slug: "meta-legal-advice",
    question: "Can you give me legal or financial advice?",
    aliases: ["is this legal advice", "is this financial advice", "should i trust this instead of a lawyer"],
    answer:
      "No, and nothing here should be treated that way. Every answer is general information sourced from a real statute, government body, or official guidance, current as of the date shown under it. Your specific situation can turn on a detail a general answer can't see, so for anything with real money or legal weight riding on it, use this to get oriented, then check with a licensed professional for your exact case.",
  },
  {
    slug: "meta-accuracy",
    question: "How do you know this is accurate?",
    aliases: ["where does this information come from", "how accurate is this", "who checks this", "can i trust this"],
    answer:
      "Every entry is checked against a real source before it goes in: legislation, an official regulator, or a body like the IRS, GOV.UK, or the CRA, linked right under the answer so you can check it yourself. Each entry also carries a \"Verified\" date, the day that checking actually happened. Nothing here is written from memory and left unchecked, and where two sources disagreed during research, the primary one won and the other was set aside rather than quietly blended in.",
  },
  {
    slug: "meta-privacy",
    question: "Do you save or remember what I ask?",
    aliases: ["do you save my questions", "is this private", "do you track what i type", "do you store my questions"],
    answer:
      "What you type stays on your screen. No account is needed to use this, nothing you type is sent to a server or logged anywhere, and Draftpace doesn't run analytics tracking on this page. Close the tab and it's gone, same as if you'd never asked.",
  },
  {
    slug: "meta-no-match",
    question: "What happens if you don't know the answer?",
    aliases: ["what if you dont know", "what if there is no answer", "can you answer anything", "do you know everything"],
    answer:
      "You get told, honestly. If nothing in the library matches what you asked, that shows up plainly instead of a guess dressed up to sound confident. That's a real limit, not a bug: the library only covers what's been properly researched so far, a working set of topics across the US, UK and Canada that grows over time rather than pretending to be finished on day one.",
  },
  {
    slug: "meta-countries",
    question: "Which countries do you cover?",
    aliases: ["what countries", "do you cover my country", "is this just for the us", "do you cover the uk"],
    answer:
      "The United States, the United Kingdom and Canada, for now. Where a country's own regions genuinely change the answer, like Scotland's different homeschooling consent rule or Quebec's much heavier one, that's built into the answer itself rather than flattened into one national line. More countries are a matter of when the research gets done properly, not a promise with a date attached to it.",
  },
  {
    slug: "meta-free",
    question: "Is this free? Do I need an account?",
    aliases: ["do i need to sign up", "is this free to use", "do i need an account", "do i have to pay"],
    answer:
      "Free, and no account needed. Ask a question, browse a category, that's the whole interaction. Some answers point to a Draftpace product that goes further on that specific problem, and that's always marked as a separate, optional step, never folded into the answer itself.",
  },
  {
    slug: "meta-freshness",
    question: "How often is this updated?",
    aliases: ["is this up to date", "how current is this information", "when was this last checked", "are these laws current"],
    answer:
      "Every entry shows exactly when it was last verified, so you're never guessing how fresh it is. Laws and thresholds do change, and where something is genuinely mid-change, a passed law not yet in force, a number about to move, that's called out in its own notice rather than buried in the answer text. This isn't a live feed updating itself: it's reviewed and rechecked by hand, which is slower but means every date shown is real.",
  },
  {
    slug: "meta-scope",
    question: "Can you help with things outside these categories?",
    aliases: ["what can you not help with", "do you cover everything", "what dont you know", "what dont you cover"],
    answer:
      "Not yet, and that's worth saying plainly rather than stretching to cover it. The library is organised into nine areas, and right now some have real depth while others are still just a plan with nothing written. Ask something outside all of them, or inside one that's still empty, and you'll get the honest \"nothing here yet\" answer rather than a stretch. Draftpace's guides library and its Companion products cover more ground where this doesn't reach.",
  },
];

/** Exact canonical-question lookup, used once free-text matching (which
 *  also checks aliases) has already resolved to the canonical phrasing. */
export function findMetaEntry(question: string): MetaEntry | undefined {
  return META_ENTRIES.find((m) => m.question === question);
}

/**
 * A real, frequently-expressed everyday problem, researched from actual
 * language people use (forums, support threads), not a legal fact and not
 * a question about the tool. "I don't know where my money is going" has
 * no statute behind it, so it gets no `source`/`verifiedAt`: what it gets
 * instead is an honest acknowledgement and a real redirect to whichever
 * Draftpace guide or product actually addresses it. `topic` is kept, same
 * as on AskEntry, but purely for two internal jobs: guessing a fallback
 * source when nothing matches a typed question, and surfacing a few other
 * real entries to "keep exploring" after an answer. Neither job means
 * this ever renders as a browsable category again: see the file-level
 * decision to run Ask DP as one flat hub, not nine sections.
 */
export type ProblemEntry = {
  slug: string;
  topic: AskTopic;
  /** The canonical phrasing, shown as the question once resolved. */
  phrase: string;
  /** Real phrasings pulled from actual research, not invented paraphrases. */
  aliases: string[];
  /** Acknowledge the problem honestly, then redirect. Never a source
   *  citation: there's nothing to cite for "you're not alone in this." */
  response: string;
  relatedGuideSlugs?: string[];
  relatedProductSlug?: string;
};

export const PROBLEM_ENTRIES: ProblemEntry[] = [
  {
    slug: "problem-money-scattered",
    topic: "money",
    phrase: "I don't know where my money is going",
    aliases: [
      "my finances are scattered across multiple tools",
      "i have no idea where my money went",
      "i use too many apps for money",
      "i keep everything in spreadsheets for money",
      "my money system is a mess",
      "i have no system for tracking money",
      "too many apps for finances",
    ],
    response:
      "That's less a willpower problem than a visibility one: when money moves through six different places, no single view of it ever quite adds up. Start with what the number on your banking app actually means before building anything more complicated on top of it, then a real way to check whether you can afford something before you spend, not after.",
    relatedGuideSlugs: ["available-balance-vs-current-balance", "can-you-afford-it-before-you-buy-it"],
    relatedProductSlug: "personal-finance-companion",
  },
  {
    slug: "problem-subscriptions-forgotten",
    topic: "money",
    phrase: "I forgot to cancel a subscription and got charged",
    aliases: [
      "how do you track subscriptions",
      "i keep getting charged for subscriptions i forgot",
      "i forgot about a free trial",
      "i forgot a renewal",
      "how do i track subscriptions",
      "i have too many subscriptions to track",
      "i forgot to cancel a free trial",
    ],
    response:
      "The usual failure point isn't forgetting you signed up, it's forgetting the renewal date exists at all until the charge does. The fix is a single list of what's actually recurring and when it renews, not a better memory.",
    relatedGuideSlugs: ["how-to-find-every-subscription-you-are-paying-for"],
    relatedProductSlug: "personal-finance-companion",
  },
  {
    slug: "problem-budgeting-apps-fail",
    topic: "money",
    phrase: "Why do budgeting apps stop working for me?",
    aliases: [
      "i hate budgeting",
      "budgeting is overwhelming",
      "i've tried everything for budgeting",
      "ynab is too expensive",
      "ynab is too complex",
      "i tried ynab but gave up",
      "i tried mint but gave up",
      "mint shut down",
      "i don't know how to budget",
    ],
    response:
      "Usually not a you problem, a format problem: most budgeting apps ask for daily categorised logging, and that habit quietly dies around week six or seven for almost everyone, not just you. A system built to survive a missed week, rather than demand a perfect one, tends to hold up longer.",
    relatedGuideSlugs: ["why-budgeting-apps-stop-working-after-two-months"],
    relatedProductSlug: "monthly-money-reset",
  },
  {
    slug: "problem-home-maintenance-overwhelm",
    topic: "home",
    phrase: "I'm overwhelmed by home maintenance",
    aliases: [
      "i keep forgetting home maintenance",
      "i don't know what needs maintenance",
      "homeownership feels like a full time job",
      "i have no idea what needs maintenance",
      "how do you track home maintenance",
      "i keep forgetting maintenance tasks",
    ],
    response:
      "Most of it genuinely isn't urgent, which is exactly why it's easy to lose track of: nothing fails immediately when you skip it, until the one time it does and it's expensive. A short list of what actually matters, and when, beats a vague sense that you're behind on everything.",
    relatedGuideSlugs: ["home-maintenance-you-skip-that-costs-the-most", "home-maintenance-checklist-by-month"],
    relatedProductSlug: "home-management-companion",
  },
  {
    slug: "problem-first-time-homeowner",
    topic: "home",
    phrase: "I'm a first-time homeowner and don't know what to do",
    aliases: ["just bought a house what now", "first time homeowner", "new homeowner what should i do"],
    response:
      "The first few weeks matter more than people expect: a handful of things are cheap or free to sort out right after closing, and expensive to fix later if you don't. Worth getting that order right before anything else.",
    relatedGuideSlugs: ["first-week-after-buying-a-house"],
    relatedProductSlug: "home-management-companion",
  },
  {
    slug: "problem-documents-chaos",
    topic: "documents",
    phrase: "I can't find my important documents when I need them",
    aliases: [
      "i have too much paper",
      "my documents are a mess",
      "how do you organize important documents",
      "i lost my warranty",
      "i lost a receipt",
      "i lost a manual",
      "how do you organize digital files",
      "i keep a home binder",
    ],
    response:
      "Most people don't actually have a documents problem, they have a which-of-these-matters problem: most paper coming into a house can be shredded, and the few things worth keeping need one dedicated place, not a better filing system for everything.",
    relatedGuideSlugs: ["which-documents-to-keep-and-where-to-put-them", "what-to-record-when-you-buy-an-appliance"],
    relatedProductSlug: "home-management-companion",
  },
  {
    slug: "problem-mental-load",
    topic: "personal-affairs",
    phrase: "I keep everything in my head and it's exhausting",
    aliases: [
      "i'm drowning",
      "i can't keep up",
      "i'm overwhelmed",
      "life admin is too much",
      "i'm drowning in admin",
      "adulting is hard",
      "there has to be a better way",
      "i need a system",
      "i need a better way",
      "i wish there was a simpler way",
      "i have no mental space left",
      "i'm burned out from little things",
      "i built my own system in notion",
    ],
    response:
      "That exhaustion is real, not a personal failing: holding an ever-growing list of half-remembered tasks in your head is genuinely tiring, whether or not any single item on it is actually hard. The fix usually isn't a better to-do list, most of those make it worse. It's somewhere outside your head that actually holds it for you.",
    relatedGuideSlugs: [
      "why-to-do-lists-make-it-worse",
      "life-admin-the-work-nobody-teaches-you",
      "why-productivity-tools-fail-at-life-admin",
    ],
    relatedProductSlug: "alongside",
  },
  {
    slug: "problem-renewals-warranties-tracking",
    topic: "documents",
    phrase: "How do you keep track of renewal dates and warranties?",
    aliases: [
      "how do you remember renewal dates",
      "how do you remember recurring tasks",
      "appliance warranty tracking",
      "how often do home systems need servicing",
      "i use my calendar for every reminder",
    ],
    response:
      "A warranty or a service interval is only useful if you can find it again months later, which is exactly when most people can't. Worth recording it once, right when you buy or install the thing, rather than reconstructing it from memory the day something breaks.",
    relatedGuideSlugs: [
      "appliance-warranties-what-to-track",
      "how-often-home-systems-need-servicing",
      "how-to-find-the-model-number-on-any-appliance",
    ],
    relatedProductSlug: "home-management-companion",
  },
];

export function findProblemEntry(phrase: string): ProblemEntry | undefined {
  return PROBLEM_ENTRIES.find((p) => p.phrase === phrase);
}

// ---------------------------------------------------------------------
// Homeschooling (under Family & Life)
// ---------------------------------------------------------------------

const HOMESCHOOL_PERMISSION: RuleEntry[] = [
  {
    slug: "homeschool-permission-us",
    kind: "rule",
    question: "Do I need permission to homeschool my child?",
    topic: "family",
    jurisdiction: { country: "us" },
    answer:
      "No state requires advance permission, but most require notice. Requirements range from nothing filed at all (Alaska, Idaho, Illinois, Michigan among others) to a notice of intent plus ongoing reporting (nine states, including New York, Pennsylvania and Massachusetts). It is set entirely by your state, not federal law.",
    relatedGuideSlug: "homeschool-record-keeping-requirements-by-state",
    relatedProductSlug: "homeschooling-companion",
    source: { name: "Compiled from state education codes", url: "https://www.ecs.org/homeschooling/" },
    verifiedAt: "2026-09-02",
  },
  {
    slug: "homeschool-permission-uk",
    kind: "rule",
    question: "Do I need permission to homeschool my child?",
    topic: "family",
    jurisdiction: { country: "uk" },
    answer:
      "In England, Wales and Northern Ireland, no permission is needed to home educate a child who has never been enrolled at a school. If your child is currently enrolled and you want to withdraw them, the school removes them from its roll on request in England and Wales, no consent required. Scotland is the exception: if your child already attends a state school, you must get your local council's consent before you can withdraw them, under the Education (Scotland) Act 1980.",
    source: {
      name: "Education Act 1996 s.7 (England & Wales); Education (Scotland) Act 1980 ss.30,35,37",
      url: "https://en.wikipedia.org/wiki/Home_education_in_the_United_Kingdom",
    },
    verifiedAt: "2026-09-02",
    changing:
      "The Children's Wellbeing and Schools Act 2026 introduces a national home-education register in England. It is not yet in force.",
  },
  {
    slug: "homeschool-permission-ca",
    kind: "rule",
    question: "Do I need permission to homeschool my child?",
    topic: "family",
    jurisdiction: { country: "ca" },
    answer:
      "Education is provincial, so this depends entirely on where you live. Ontario asks for a letter of notification to your school board, no approval required. British Columbia requires registration with a school by September 30 each year. Quebec is the most involved: a written notice of intent to the Ministère de l'Éducation by July 1, followed by a learning-project document implemented by September 30, two progress reports and a status report over the year, and a monitoring meeting.",
    source: { name: "Gouvernement du Québec, homeschooling process and steps", url: "https://www.quebec.ca/en/education/preschool-elementary-and-secondary-schools/programs-training-evaluation/homeschooling/process-steps" },
    verifiedAt: "2026-09-02",
  },
];

const HOMESCHOOL_RECORDS: RuleEntry[] = [
  {
    slug: "homeschool-records-us",
    kind: "rule",
    question: "What records am I actually required to keep?",
    topic: "family",
    jurisdiction: { country: "us" },
    answer:
      "It depends on your state's regulation level. Six states make a portfolio mandatory (Pennsylvania, Maryland, Ohio, South Carolina, Florida, and the District of Columbia). Most others ask for nothing beyond attendance, or nothing filed at all. Check your specific state rather than a general answer here.",
    relatedGuideSlug: "homeschool-record-keeping-requirements-by-state",
    relatedProductSlug: "homeschooling-companion",
    source: { name: "Compiled from state education codes", url: "https://www.ecs.org/homeschooling/" },
    verifiedAt: "2026-09-02",
  },
  {
    slug: "homeschool-records-ca-quebec",
    kind: "rule",
    question: "What records am I actually required to keep?",
    topic: "family",
    jurisdiction: { country: "ca", province: "Quebec" },
    answer:
      "More than any other Canadian province: a learning project submitted before you start, two progress reports and a status report each year, evidence your child is meeting the province's learning requirements, and attendance at a monitoring meeting with the Direction de l'enseignement à la maison.",
    relatedProductSlug: "homeschooling-companion",
    source: { name: "Ministère de l'Éducation et de l'Enseignement supérieur, Québec", url: "http://www.education.gouv.qc.ca/en/school-boards/support-and-assistance/homeschooling/legal-framework/" },
    verifiedAt: "2026-09-02",
  },
  {
    slug: "homeschool-records-ca-ontario",
    kind: "rule",
    question: "What records am I actually required to keep?",
    topic: "family",
    jurisdiction: { country: "ca", province: "Ontario" },
    answer:
      "A letter of notification sent to your school board by the start of the school year is the only filing requirement. Ontario does not mandate a portfolio, testing, or ongoing reporting.",
    relatedProductSlug: "homeschooling-companion",
    source: { name: "Ontario Education Act s.21(2)(a)", url: "https://www.ontario.ca/laws/statute/90e02" },
    verifiedAt: "2026-09-02",
  },
];

const HOMESCHOOL_CURRICULUM: RuleEntry[] = [
  {
    slug: "homeschool-curriculum-uk",
    kind: "rule",
    question: "Do I have to follow the national curriculum?",
    topic: "family",
    jurisdiction: { country: "uk" },
    answer:
      "No. Home educators in England, Wales, Scotland and Northern Ireland are not required to follow the national curriculum, teach specific subjects in a specific order, or hold formal qualifications to teach. The legal standard is broader: an education suitable to the child's age, ability and aptitude.",
    source: { name: "Education Act 1996 s.7, via GOV.UK guidance", url: "https://www.gov.uk/home-education" },
    verifiedAt: "2026-09-02",
  },
];

// ---------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------

const BUDGETING_RULE: RuleEntry[] = [
  {
    slug: "budgeting-50-30-20-rule",
    kind: "rule",
    question: "What is the 50/30/20 budgeting rule?",
    topic: "money",
    jurisdiction: "universal",
    answer:
      "Split take-home pay three ways: 50% to needs (rent, groceries, utilities, minimum debt payments), 30% to wants, and 20% to savings and extra debt payoff. It is a starting split, not a fixed law: in a genuinely tight month, the honest move is to lower the wants percentage rather than declare the whole system a failure.",
    source: {
      name: "Wealth Drafts, The 50/30/20 Budget Rule, Explained Simply",
      url: "https://wealthdrafts.com/budgeting/50-30-20-budget-rule/",
    },
    verifiedAt: "2026-09-03",
  },
];

const COUPLES_FINANCES: RuleEntry[] = [
  {
    slug: "couples-shared-finances",
    kind: "rule",
    question: "How do couples manage shared finances?",
    topic: "money",
    jurisdiction: "universal",
    answer:
      "There's no single right setup. Only around 38% of couples keep everything fully joint; the rest mix in some separation, 36% blend joint and separate accounts and 26% keep finances entirely separate. The most common working model is a hybrid: personal accounts stay separate, and one joint account covers shared costs like rent, utilities and groceries, funded by a set contribution from each person, either split evenly or in proportion to income. What actually predicts fewer money arguments isn't which structure a couple picks, it's having at least one clearly shared account and talking about it openly rather than avoiding the subject.",
    source: { name: "Bankrate, 2026 couples and finances survey", url: "https://www.bankrate.com/banking/reasons-for-married-couples-to-consider-separate-bank-accounts/" },
    verifiedAt: "2026-09-03",
  },
];

const RETIREMENT_LIMITS: RuleEntry[] = [
  {
    slug: "retirement-limit-us-401k",
    kind: "rule",
    question: "How much can I contribute to my retirement account this year?",
    topic: "money",
    jurisdiction: { country: "us" },
    answer:
      "For 2026, the 401(k) employee elective-deferral limit is $24,500, up from $23,500 in 2025. The catch-up for age 50+ is $8,000; for those turning 60–63 in 2026, SECURE 2.0 raises it to $11,250. The IRA limit is $7,500.",
    relatedProductSlug: "personal-finance-companion",
    source: { name: "Internal Revenue Service", url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits" },
    verifiedAt: "2026-09-02",
  },
  {
    slug: "retirement-limit-uk-isa",
    kind: "rule",
    question: "How much can I contribute to my retirement account this year?",
    topic: "money",
    jurisdiction: { country: "uk" },
    answer:
      "The ISA allowance for 2026/27 is £20,000 total, split however you like across Cash, Stocks & Shares, Innovative Finance and Lifetime ISAs. Separately, workplace pension auto-enrolment requires a minimum combined 8% of qualifying earnings (£6,240–£50,270): at least 3% from your employer, the rest from you.",
    relatedProductSlug: "personal-finance-companion",
    source: { name: "HM Revenue & Customs / MoneyHelper", url: "https://www.gov.uk/individual-savings-accounts" },
    verifiedAt: "2026-09-02",
    changing: "The Cash ISA portion of this allowance drops to £12,000 for under-65s from 6 April 2027.",
  },
  {
    slug: "retirement-limit-ca",
    kind: "rule",
    question: "How much can I contribute to my retirement account this year?",
    topic: "money",
    jurisdiction: { country: "ca" },
    answer:
      "For 2026, the RRSP limit is $33,810 or 18% of your 2025 earned income, whichever is lower, plus any unused room carried forward from prior years. The TFSA limit is $7,000, the same for everyone regardless of income, also with unused room carried forward.",
    relatedProductSlug: "personal-finance-companion",
    source: { name: "Canada Revenue Agency", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/contributing-a-rrsp-prpp/contribution-limit.html" },
    verifiedAt: "2026-09-02",
  },
];

const CREDIT_REPORT_LENGTH: RuleEntry[] = [
  {
    slug: "credit-report-length-us",
    kind: "rule",
    question: "How long does an unpaid debt stay on my credit report?",
    topic: "money",
    jurisdiction: { country: "us" },
    answer:
      "Seven years from the original delinquency date, regardless of your state's statute of limitations on being sued over it. That's a separate clock: most states give a creditor 3–6 years to sue you for an unpaid debt, but the debt itself doesn't disappear after that, and it can still show on your report during and after that period.",
    relatedGuideSlug: "you-missed-a-payment-what-to-do-next",
    wealthdrafts: {
      title: "Does Paying Off Debt Raise Your Credit Score? What Actually Moves It",
      url: "https://wealthdrafts.com/debt-payoff/does-paying-off-debt-raise-credit-score/",
    },
    relatedProductSlug: "personal-finance-companion",
    source: { name: "Consumer Financial Protection Bureau", url: "https://www.consumerfinance.gov/ask-cfpb/can-debt-collectors-collect-a-debt-thats-several-years-old-en-1423/" },
    verifiedAt: "2026-09-02",
  },
  {
    slug: "credit-report-length-uk",
    kind: "rule",
    question: "How long does an unpaid debt stay on my credit report?",
    topic: "money",
    jurisdiction: { country: "uk" },
    answer:
      "Six years from the date of default, after which it's removed automatically, whether or not it was paid. Separately, most unsecured debts become \"statute barred\" after six years of no payment or acknowledgement, under the Limitation Act 1980: the creditor can no longer sue you for it, though the debt technically still exists.",
    relatedGuideSlug: "you-missed-a-payment-what-to-do-next",
    wealthdrafts: {
      title: "Does Paying Off Debt Raise Your Credit Score? What Actually Moves It",
      url: "https://wealthdrafts.com/debt-payoff/does-paying-off-debt-raise-credit-score/",
    },
    relatedProductSlug: "personal-finance-companion",
    source: { name: "Limitation Act 1980; MoneyHelper", url: "https://www.moneyhelper.org.uk/en/money-troubles/dealing-with-debt/statute-barred-debt" },
    verifiedAt: "2026-09-02",
  },
  {
    slug: "credit-report-length-ca",
    kind: "rule",
    question: "How long does an unpaid debt stay on my credit report?",
    topic: "money",
    jurisdiction: { country: "ca" },
    answer:
      "Six to seven years depending on your province and credit bureau. Separately, and this is the part worth knowing: the limitation period for a creditor to sue you is provincial, not federal, and much shorter than most people assume, for example two years in Ontario. It resets to zero the moment you make a payment or acknowledge the debt in writing, which is the most common way people accidentally restart a clock they were waiting out.",
    relatedGuideSlug: "you-missed-a-payment-what-to-do-next",
    wealthdrafts: {
      title: "Does Paying Off Debt Raise Your Credit Score? What Actually Moves It",
      url: "https://wealthdrafts.com/debt-payoff/does-paying-off-debt-raise-credit-score/",
    },
    relatedProductSlug: "personal-finance-companion",
    source: { name: "TransUnion Canada; Ontario Limitations Act, 2002", url: "https://www.transunion.ca/" },
    verifiedAt: "2026-09-02",
  },
];

// ---------------------------------------------------------------------
// Home & Household
// ---------------------------------------------------------------------

const SECURITY_DEPOSIT_LIMIT: RuleEntry[] = [
  {
    slug: "security-deposit-limit-us",
    kind: "rule",
    question: "Is there a legal limit on how much my landlord can charge for a security deposit?",
    topic: "home",
    jurisdiction: { country: "us" },
    answer:
      "No federal limit. Most states cap it, usually at one to three months' rent, but a real number of states set no cap at all and leave the amount to the lease. Every state does set a deadline for returning it after you move out, typically 21 to 30 days, sometimes up to 60, so check your specific state rather than assume a national rule.",
    source: { name: "Compiled from state landlord-tenant statutes", url: "https://www.consumerfinance.gov/consumer-tools/renting/" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "security-deposit-limit-uk",
    kind: "rule",
    question: "Is there a legal limit on how much my landlord can charge for a security deposit?",
    topic: "home",
    jurisdiction: { country: "uk" },
    answer:
      "Yes: five weeks' rent for tenancies where the annual rent is under £50,000, or six weeks' rent above that, under the Tenant Fees Act 2019. It applies to assured shorthold tenancies from 1 June 2019 onward, and a landlord protecting a joint tenancy still can't charge that full amount to each tenant separately.",
    source: { name: "Tenant Fees Act 2019, via GOV.UK guidance", url: "https://www.gov.uk/government/publications/tenant-fees-act-amended-by-the-renters-rights-act-2025/tenant-fees-act-2019-statutory-guidance-for-enforcement-authorities" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "security-deposit-limit-ca",
    kind: "rule",
    question: "Is there a legal limit on how much my landlord can charge for a security deposit?",
    topic: "home",
    jurisdiction: { country: "ca" },
    answer:
      "It depends entirely on your province, and the rules aren't just about the amount. Ontario doesn't allow a damage or security deposit at all, only a last month's rent deposit capped at one month's rent that can't be used for damage. British Columbia allows a separate security deposit, capped at half a month's rent.",
    source: { name: "Residential Tenancies Act, 2006 (Ontario); Residential Tenancy Act (BC)", url: "https://www.ontario.ca/laws/statute/06r17" },
    verifiedAt: "2026-09-03",
  },
];

// ---------------------------------------------------------------------
// Legal & Administrative
// ---------------------------------------------------------------------

const WILL_LAWYER_REQUIRED: RuleEntry[] = [
  {
    slug: "will-lawyer-required-us",
    kind: "rule",
    question: "Do I need a lawyer to write a valid will?",
    topic: "legal",
    jurisdiction: { country: "us" },
    answer:
      "No. A standard will needs your signature and, in most states, two witnesses present at signing. About half the states, including Texas and California, also recognise a holographic will: entirely in your own handwriting and signed, with no witnesses needed. A handful of states, Delaware among them, don't allow that shortcut and still require witnesses even for a handwritten will.",
    relatedGuideSlug: "where-to-look-for-a-will",
    relatedProductSlug: "personal-life-affairs-companion",
    source: { name: "Compiled from state probate codes", url: "https://www.law.cornell.edu/wex/holographic_will" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "will-lawyer-required-uk",
    kind: "rule",
    question: "Do I need a lawyer to write a valid will?",
    topic: "legal",
    jurisdiction: { country: "uk" },
    answer:
      "No, but it must be in writing, signed by you, and witnessed by two people at least 18 years old, present at the same time, who each then sign it too. A will with only one witness is invalid outright. If a witness (or their spouse) is also a beneficiary, the will still stands but that person's gift under it is void.",
    relatedGuideSlug: "where-to-look-for-a-will",
    relatedProductSlug: "personal-life-affairs-companion",
    source: { name: "Wills Act 1837, s.9", url: "https://www.legislation.gov.uk/ukpga/Will4and1Vict/7/26" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "will-lawyer-required-ca",
    kind: "rule",
    question: "Do I need a lawyer to write a valid will?",
    topic: "legal",
    jurisdiction: { country: "ca" },
    answer:
      "No, and it depends on your province which shortcuts exist. A wholly handwritten, signed will needs no witnesses in Alberta, Ontario, Manitoba, Quebec, New Brunswick, Newfoundland and Saskatchewan. British Columbia and Prince Edward Island don't recognise that: there, a will (other than one made by military personnel) needs two witnesses regardless of whether it's typed or handwritten.",
    relatedGuideSlug: "where-to-look-for-a-will",
    relatedProductSlug: "personal-life-affairs-companion",
    source: { name: "Compiled from provincial wills legislation", url: "https://www.canlii.org/en/" },
    verifiedAt: "2026-09-03",
  },
];

// ---------------------------------------------------------------------
// Personal Affairs
// ---------------------------------------------------------------------

const NAME_CHANGE_PROCESS: RuleEntry[] = [
  {
    slug: "name-change-process-us",
    kind: "rule",
    question: "How do I legally change my name?",
    topic: "personal-affairs",
    jurisdiction: { country: "us" },
    answer:
      "File a petition with your local court, usually in the county you live in, along with proof of identity and the filing fee (or a fee-waiver request). You'll attend a short hearing where a judge reviews it, then receive a certified court order as your legal proof. The whole process typically takes one to three months; exact forms, fees and any publication requirement are set by your state, not a national rule.",
    source: { name: "USAGov", url: "https://www.usa.gov/name-change" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "name-change-process-uk",
    kind: "rule",
    question: "How do I legally change my name?",
    topic: "personal-affairs",
    jurisdiction: { country: "uk" },
    answer:
      "From age 16, it's your own decision: you can make a basic deed poll yourself for free, or pay to enrol one through the High Court for extra proof. Your witness must be 18 or older, unrelated to you, and not living at your address. For a child under 16, everyone with parental responsibility for them has to consent.",
    source: { name: "UK Deed Poll Service", url: "https://www.deedpoll.org.uk/who-can-apply-for-a-deed-poll/" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "name-change-process-ca",
    kind: "rule",
    question: "How do I legally change my name?",
    topic: "personal-affairs",
    jurisdiction: { country: "ca" },
    answer:
      "There's no single national process: you apply through the Vital Statistics office of the province you currently live in, not where you were born. Expect a residency requirement (commonly around three months), a fee in the $85 to $120 range, and six to ten weeks of processing. Some provinces publish approved changes in the official Gazette, though most allow you to request non-publication for safety or privacy reasons.",
    source: { name: "Compiled from provincial Change of Name legislation", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizens/proof-citizenship/legal-name-change.html" },
    verifiedAt: "2026-09-03",
  },
];

// ---------------------------------------------------------------------
// Travel
// ---------------------------------------------------------------------

const LUGGAGE_COMPENSATION: RuleEntry[] = [
  {
    slug: "luggage-compensation",
    kind: "rule",
    question: "How much compensation am I owed if an airline damages, delays, or loses my luggage?",
    topic: "travel",
    jurisdiction: "universal",
    answer:
      "On an international itinerary, the Montreal Convention caps airline liability at 1,519 Special Drawing Rights per passenger, roughly $2,000 to $2,150 depending on the exchange rate that day, since the limit itself is fixed in SDRs, not dollars. That's per passenger, not per bag or per booking. You generally have 7 days to report damage and 21 days to report a delay; after 21 days a bag is treated as lost. Canada's Air Passenger Protection Regulations extend an equivalent liability level to domestic flights too, and require airlines to refund baggage fees on any bag that was lost or damaged.",
    relatedProductSlug: "travel-companion",
    source: { name: "US Department of Transportation; Canadian Transportation Agency", url: "https://www.transportation.gov/lost-delayed-or-damaged-baggage" },
    verifiedAt: "2026-09-03",
  },
];

// ---------------------------------------------------------------------
// Work & Career
// ---------------------------------------------------------------------

const LAYOFF_NOTICE_SEVERANCE: RuleEntry[] = [
  {
    slug: "layoff-notice-severance-us",
    kind: "rule",
    question: "Am I entitled to notice or severance pay if I'm laid off?",
    topic: "work",
    jurisdiction: { country: "us" },
    answer:
      "For an individual layoff, generally no: there's no federal law requiring notice or severance pay for at-will employees. The one federal trigger is the WARN Act, which requires 60 days' advance notice, not pay, and only from employers with 100+ employees carrying out a mass layoff or plant closing affecting 50 or more workers at one site. Some states run their own \"mini-WARN\" laws with lower thresholds, and a few, New Jersey among them, add a real severance requirement on top.",
    relatedGuideSlug: "sort-out-your-finances-after-a-life-change",
    source: { name: "US Department of Labor", url: "https://www.dol.gov/general/topic/termination/plantclosings" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "layoff-notice-severance-uk",
    kind: "rule",
    question: "Am I entitled to notice or severance pay if I'm laid off?",
    topic: "work",
    jurisdiction: { country: "uk" },
    answer:
      "Yes, once you've worked there two years continuously: statutory redundancy pay is half a week's pay per full year under 22, a full week's pay per full year aged 22 to 40, and one and a half weeks' pay per full year 41 or over, capped at 20 years of service. Weekly pay itself is capped too, at £751 from 6 April 2026 (£783 in Northern Ireland), making £22,530 the maximum statutory payout.",
    relatedGuideSlug: "sort-out-your-finances-after-a-life-change",
    source: { name: "GOV.UK", url: "https://www.gov.uk/redundancy-your-rights/redundancy-pay" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "layoff-notice-severance-ca-ontario",
    kind: "rule",
    question: "Am I entitled to notice or severance pay if I'm laid off?",
    topic: "work",
    jurisdiction: { country: "ca", province: "Ontario" },
    answer:
      "Notice under the Employment Standards Act is one week per year of service, capped at 8 weeks, with none owed under 3 months' service. Severance is separate and narrower: it only applies with 5+ years of service at an employer with a $2.5 million+ payroll (or a 50+ person layoff within 6 months), at one week per year up to 26 weeks. This is a floor, not a ceiling: many dismissed employees are owed considerably more under common-law \"reasonable notice,\" which isn't capped the same way.",
    relatedGuideSlug: "sort-out-your-finances-after-a-life-change",
    source: { name: "Ontario Employment Standards Act, 2000", url: "https://www.ontario.ca/document/your-guide-employment-standards-act-0/termination-employment" },
    verifiedAt: "2026-09-03",
  },
];

// ---------------------------------------------------------------------
// Documents & Records
// ---------------------------------------------------------------------

const TAX_RECORD_RETENTION: RuleEntry[] = [
  {
    slug: "tax-record-retention-us",
    kind: "rule",
    question: "How long do I need to keep my tax records?",
    topic: "documents",
    jurisdiction: { country: "us" },
    answer:
      "Three years after filing is the general rule, matching how long the IRS normally has to audit that return. Keep records six years if you understated income by more than 25%, seven years if you're claiming a loss from bad debt or worthless securities, and indefinitely if you never filed a return for that year at all. Many preparers simply recommend seven years across the board to cover every case without checking which one applies.",
    relatedGuideSlug: "which-documents-to-keep-and-where-to-put-them",
    source: { name: "Internal Revenue Service", url: "https://www.irs.gov/taxtopics/tc305" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "tax-record-retention-uk",
    kind: "rule",
    question: "How long do I need to keep my tax records?",
    topic: "documents",
    jurisdiction: { country: "uk" },
    answer:
      "If you're self-employed, at least five years after the 31 January filing deadline for that tax year. If your return only covers personal income like PAYE employment, 22 months after the end of the tax year is enough. Filed late, or under HMRC enquiry, and the clock resets or extends until that's resolved.",
    relatedGuideSlug: "which-documents-to-keep-and-where-to-put-them",
    source: { name: "HM Revenue & Customs", url: "https://www.gov.uk/self-assessment-tax-returns/keeping-your-pay-and-tax-records" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "tax-record-retention-ca",
    kind: "rule",
    question: "How long do I need to keep my tax records?",
    topic: "documents",
    jurisdiction: { country: "ca" },
    answer:
      "Six years from the end of the tax year they relate to, not from when you filed. Filing late or amending a return restarts that six-year clock from the new filing date, and anything under active CRA audit has to be kept until the audit fully closes, however long that takes. Records for property you still own, like real estate or investments, should be kept for as long as you hold it, plus six more years after you sell.",
    relatedGuideSlug: "which-documents-to-keep-and-where-to-put-them",
    source: { name: "Canada Revenue Agency", url: "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc188/keeping-records.html" },
    verifiedAt: "2026-09-03",
  },
];

// ---------------------------------------------------------------------
// Cars & Ownership
// ---------------------------------------------------------------------

const CAR_INSURANCE_REQUIRED: RuleEntry[] = [
  {
    slug: "car-insurance-required-us",
    kind: "rule",
    question: "Do I legally need car insurance, and what's the minimum coverage?",
    topic: "cars",
    jurisdiction: { country: "us" },
    answer:
      "Yes, in every state except New Hampshire, which allows proving financial responsibility another way instead. Minimum liability limits are set state by state and vary widely, so there's no single national number. Thirteen states, including Florida, Michigan and New York, also require no-fault Personal Injury Protection on top of liability coverage.",
    source: { name: "Compiled from state financial-responsibility laws", url: "https://www.iii.org/article/state-compulsory-auto-insurance-and-financial-responsibility-laws" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "car-insurance-required-uk",
    kind: "rule",
    question: "Do I legally need car insurance, and what's the minimum coverage?",
    topic: "cars",
    jurisdiction: { country: "uk" },
    answer:
      "Yes, at least third-party cover is a legal requirement to drive, under the Road Traffic Act 1988, and driving without it is a criminal offence. It's stricter than that in one way people don't expect: under Continuous Insurance Enforcement, a car has to stay insured even parked and unused, unless you've formally declared it off the road with a SORN.",
    source: { name: "Road Traffic Act 1988, via GOV.UK", url: "https://www.gov.uk/vehicle-insurance" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "car-insurance-required-ca",
    kind: "rule",
    question: "Do I legally need car insurance, and what's the minimum coverage?",
    topic: "cars",
    jurisdiction: { country: "ca" },
    answer:
      "Yes, in every province, but the minimum third-party liability differs: $200,000 in Ontario, British Columbia and Atlantic Canada, $500,000 in Manitoba, and $50,000 in Quebec. British Columbia, Saskatchewan and Manitoba each run mandatory coverage through a government insurer, ICBC, SGI and MPI respectively, rather than a private market.",
    source: { name: "Insurance Bureau of Canada", url: "https://www.ibc.ca/insurance-basics/auto/types-of-auto-coverage/mandatory-auto-insurance-requirements" },
    verifiedAt: "2026-09-03",
  },
];

// ---------------------------------------------------------------------
// Family & Life
// ---------------------------------------------------------------------

const DIVORCE_WAITING_PERIOD: RuleEntry[] = [
  {
    slug: "divorce-waiting-period-us",
    kind: "rule",
    question: "How long do I have to wait to get a divorce?",
    topic: "family",
    jurisdiction: { country: "us" },
    answer:
      "Entirely state by state, with no federal rule. Some states, Washington DC among them, have no waiting period or separation requirement at all. Others require a period of separation before you can even file, commonly a full year, in states including North Carolina, South Carolina and Virginia. Where neither applies, most states still set a minimum window, often 60 to 90 days, between filing and a final decree once it's uncontested.",
    relatedGuideSlug: "sort-out-your-finances-after-a-life-change",
    source: { name: "Compiled from state family-law codes", url: "https://www.findlaw.com/state/family-laws/details-on-state-requirements-for-divorce.html" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "divorce-waiting-period-uk",
    kind: "rule",
    question: "How long do I have to wait to get a divorce?",
    topic: "family",
    jurisdiction: { country: "uk" },
    answer:
      "At minimum around 26 weeks, even fully uncontested: a mandatory 20-week reflection period after applying, which can't be shortened for any reason, before you can apply for the conditional order, then a further six weeks and one day before the final order that actually ends the marriage. Court backlogs mean the real average in 2026 is running closer to 40 weeks.",
    relatedGuideSlug: "sort-out-your-finances-after-a-life-change",
    source: { name: "GOV.UK", url: "https://www.gov.uk/divorce/how-long-it-takes" },
    verifiedAt: "2026-09-03",
  },
  {
    slug: "divorce-waiting-period-ca",
    kind: "rule",
    question: "How long do I have to wait to get a divorce?",
    topic: "family",
    jurisdiction: { country: "ca" },
    answer:
      "There's no filing-to-decree waiting period as such, but the standard no-fault ground requires you to have already lived separate and apart for one full year before a court will grant the divorce, so the wait mostly happens before you file. That's the ground behind roughly 95% of Canadian divorces. You're allowed up to 90 days back together to attempt reconciliation without resetting that year.",
    relatedGuideSlug: "sort-out-your-finances-after-a-life-change",
    source: { name: "Divorce Act, via Justice Canada", url: "https://www.justice.gc.ca/eng/fl-df/divorce/index.html" },
    verifiedAt: "2026-09-03",
  },
];

export const ASK_ENTRIES: AskEntry[] = [
  ...HOMESCHOOL_PERMISSION,
  ...HOMESCHOOL_RECORDS,
  ...HOMESCHOOL_CURRICULUM,
  ...DIVORCE_WAITING_PERIOD,
  // Government/regulator-sourced money entries come before the two
  // editorial/survey-sourced ones (BUDGETING_RULE, COUPLES_FINANCES) on
  // purpose: fallbackSourcesForTopic() picks the first two distinct
  // sources it finds per topic, and a tax or contribution-limit miss
  // should surface the IRS/GOV.UK/CRA before it surfaces a blog post.
  ...RETIREMENT_LIMITS,
  ...CREDIT_REPORT_LENGTH,
  ...BUDGETING_RULE,
  ...COUPLES_FINANCES,
  ...SECURITY_DEPOSIT_LIMIT,
  ...WILL_LAWYER_REQUIRED,
  ...NAME_CHANGE_PROCESS,
  ...LUGGAGE_COMPENSATION,
  ...LAYOFF_NOTICE_SEVERANCE,
  ...TAX_RECORD_RETENTION,
  ...CAR_INSURANCE_REQUIRED,
];

/** Every distinct question for one topic. Not a browse-by-category chip
 *  list any more (Ask DP runs as one flat hub, see the file-level note
 *  above PROBLEM_ENTRIES): this now only powers relatedQuestions() below.
 *  One entry per question even where several jurisdictions answer it
 *  differently, since the country is resolved after the question is picked. */
export function questionsForTopic(topic: AskTopic): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of ASK_ENTRIES) {
    if (entry.topic !== topic) continue;
    if (seen.has(entry.question)) continue;
    seen.add(entry.question);
    out.push(entry.question);
  }
  return out;
}

/** All entries answering a given question, across every jurisdiction
 *  covered. Empty means genuinely uncovered, not a bug: callers render
 *  that as the honest no-match state, never as an error. */
export function entriesForQuestion(question: string): AskEntry[] {
  return ASK_ENTRIES.filter((e) => e.question === question);
}

/** Whether a question needs a country before it can be answered: true
 *  the moment more than one jurisdiction-specific entry answers it, or
 *  a single entry is tied to a specific (non-universal) jurisdiction. */
export function needsCountry(question: string): boolean {
  const matches = entriesForQuestion(question);
  if (matches.length === 0) return false;
  if (matches.length > 1) return true;
  return matches[0].jurisdiction !== "universal";
}

export function entryForQuestionAndCountry(question: string, country: Country): AskEntry | undefined {
  return entriesForQuestion(question).find(
    (e) => e.jurisdiction !== "universal" && e.jurisdiction.country === country
  );
}

/**
 * When nothing in the library matches a typed question, this is the
 * honest middle ground between the bare "nothing here" state and
 * inventing a new citation on the spot: point toward the same official
 * bodies already trusted and cited elsewhere in this topic. It never
 * introduces a source that hasn't already been verified and used on a
 * real entry, so this can't drift out of sync with what's actually been
 * checked. Deduplicated by source name, capped at two so it reads as a
 * pointer, not a second answer.
 */
export function fallbackSourcesForTopic(topic: AskTopic): { name: string; url: string }[] {
  const seen = new Set<string>();
  const out: { name: string; url: string }[] = [];
  for (const entry of ASK_ENTRIES) {
    if (entry.topic !== topic) continue;
    if (seen.has(entry.source.name)) continue;
    seen.add(entry.source.name);
    out.push(entry.source);
    if (out.length >= 2) break;
  }
  return out;
}

/**
 * Best-guess topic for a typed question that matched nothing exactly,
 * scored the same way matchQuestion() scores a question match, just run
 * against every entry's own topic instead of a specific question. Used
 * only to pick a fallback source; a weak guess still isn't the same as
 * pretending to answer, so callers should keep the honest empty state
 * front and center and treat this as a footnote, not a hidden answer.
 */
export function guessTopic(input: string): AskTopic | null {
  const words = input
    .toLowerCase()
    .replace(/[?.,!]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  if (words.length === 0) return null;
  const scores = new Map<AskTopic, number>();
  const corpus = [
    ...ASK_ENTRIES.map((e) => ({ topic: e.topic, text: e.question })),
    ...PROBLEM_ENTRIES.flatMap((p) => [
      { topic: p.topic, text: p.phrase },
      ...p.aliases.map((a) => ({ topic: p.topic, text: a })),
    ]),
  ];
  for (const { topic, text } of corpus) {
    const textWords = text
      .toLowerCase()
      .replace(/[?.,!]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const hits = textWords.filter((w) => words.some((typed) => typed.includes(w) || w.includes(typed))).length;
    if (hits > 0) scores.set(topic, (scores.get(topic) ?? 0) + hits);
  }
  let best: AskTopic | null = null;
  let bestScore = 0;
  for (const [topic, score] of scores) {
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best;
}

/** A few other real entries from the same topic, for "keep exploring"
 *  after an answer. Always real library entries, in a fixed, explainable
 *  order (ASK_ENTRIES first, then PROBLEM_ENTRIES), never composed. */
export function relatedQuestions(topic: AskTopic, exclude: string, limit = 3): string[] {
  const out: string[] = [];
  const seen = new Set<string>([exclude]);
  for (const q of questionsForTopic(topic)) {
    if (seen.has(q)) continue;
    seen.add(q);
    out.push(q);
    if (out.length >= limit) return out;
  }
  for (const p of PROBLEM_ENTRIES) {
    if (p.topic !== topic || seen.has(p.phrase)) continue;
    seen.add(p.phrase);
    out.push(p.phrase);
    if (out.length >= limit) return out;
  }
  return out;
}

/** A small, cross-topic set of real questions and real problems, shown as
 *  quick-start chips. Deliberately not grouped or labelled by topic: Ask
 *  DP is one hub, not nine sections, so what earns a spot here is how
 *  often it comes up in real life, not which category it happens to sit
 *  in behind the scenes. */
export const FEATURED_QUESTIONS: string[] = [
  "I don't know where my money is going",
  "I forgot to cancel a subscription and got charged",
  "I'm overwhelmed by home maintenance",
  "How do couples manage shared finances?",
  "Do I need a lawyer to write a valid will?",
  "I keep everything in my head and it's exhausting",
];

/** A wider rotation for the search box's own placeholder text: real
 *  questions and real problems, cycling so an empty box still shows what
 *  this actually covers instead of a single static hint. */
export const SEARCH_PLACEHOLDER_EXAMPLES: string[] = [
  "Ask a question, or pick one below",
  "I don't know where my money is going",
  "How long does an unpaid debt stay on my credit report?",
  "I'm overwhelmed by home maintenance",
  "Do I need a lawyer to write a valid will?",
  "I forgot to cancel a subscription and got charged",
  "How do couples manage shared finances?",
  "What records am I actually required to keep?",
  "I keep everything in my head and it's exhausting",
  "Is there a legal limit on how much my landlord can charge for a security deposit?",
];
