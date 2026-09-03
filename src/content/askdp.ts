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
    relatedProductSlug: "personal-finance-companion",
    source: { name: "TransUnion Canada; Ontario Limitations Act, 2002", url: "https://www.transunion.ca/" },
    verifiedAt: "2026-09-02",
  },
];

export const ASK_ENTRIES: AskEntry[] = [
  ...HOMESCHOOL_PERMISSION,
  ...HOMESCHOOL_RECORDS,
  ...HOMESCHOOL_CURRICULUM,
  ...RETIREMENT_LIMITS,
  ...CREDIT_REPORT_LENGTH,
];

/** Every distinct question, grouped by topic, for the browse-by-category
 *  chips. One card per question even where several jurisdictions answer
 *  it differently: the country is resolved after the question is picked. */
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
