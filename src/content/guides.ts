import { LIFE_AREAS } from "./areas";
import { blockStrings } from "./guideText";

/**
 * Guides: the layer between the marketing site and the app.
 *
 * WHY A TYPED BLOCK MODEL RATHER THAN MDX
 *
 * The obvious answer for long-form articles is MDX, and it was the first
 * recommendation made here. It is the wrong fit for this repo. There is
 * no markdown tooling installed, next.config.ts is deliberately almost
 * empty, and the established pattern for long content is already a typed
 * module: affairsKnowledge.ts is 720 lines, handbookContent.ts is 360,
 * and both are covered by structural tests, including one that checks
 * the voice of the writing. A typed model keeps guides inside that same
 * discipline, so the no-exclamation-mark and no-em-dash rules stay
 * enforceable by test rather than by memory.
 *
 * The previous model supported headings and paragraphs and nothing else.
 * That is survivable for two guides and not for fifty five: almost every
 * planned article needs lists, and the state-by-state homeschool anchor
 * needs a table.
 *
 * INLINE LINKS
 *
 * Paragraphs are plain strings that additionally accept [text](/href)
 * inline. That is the only markup permitted, parsed by a small renderer
 * in GuideBody.tsx, so a guide can cite another guide or a product page
 * without opening the door to arbitrary HTML in content.
 */

/**
 * INTERACTIVE BLOCKS
 *
 * Four of these render as something the reader can operate rather than
 * only read. That is a deliberate correction: the guides layer shipped
 * as one component and no interaction at all, while the rest of the site
 * had twelve bespoke components, and it read as a different and much
 * duller website.
 *
 * The rule applied when choosing which blocks became interactive: the
 * interaction has to carry meaning the prose cannot. A checklist tracks
 * a sweep you are genuinely part way through. A timeline shows that an
 * order is a sequence rather than a set. A comparison holds two sides
 * against each other on a phone, where they cannot sit side by side.
 * Nothing here animates for the sake of it, and nothing claims to
 * remember anything: checklist state is per visit and the copy says so,
 * because a guide is a page, not an account.
 */
export type GuideBlock =
  | { kind: "paragraphs"; heading?: string; paragraphs: string[] }
  | {
      kind: "list";
      heading?: string;
      intro?: string;
      ordered?: boolean;
      /**
       * Renders with tick boxes and a live count. Only for lists of
       * things a reader actually does, never for lists of facts: a
       * checkbox next to a fact invites a reader to tick it, which
       * teaches them the control means nothing.
       */
      checkable?: boolean;
      items: string[];
    }
  | { kind: "table"; heading?: string; intro?: string; columns: string[]; rows: string[][] }
  | {
      kind: "timeline";
      heading?: string;
      intro?: string;
      /** `when` is the marker on the spine, `what` is the step itself. */
      steps: { when: string; what: string }[];
    }
  | {
      kind: "compare";
      heading?: string;
      intro?: string;
      left: { label: string; items: string[] };
      right: { label: string; items: string[] };
    }
  | {
      kind: "scripts";
      heading?: string;
      intro?: string;
      /** `situation` is what the reader picks, `line` is what they say. */
      items: { situation: string; line: string }[];
    }
  | { kind: "callout"; label: string; body: string };

export type Guide = {
  slug: string;
  title: string;
  dek: string;
  publishedAt: string;
  /** Set when the writing changes materially. Reference pages live or die on this. */
  updatedAt?: string;
  /**
   * Where this guide belongs, which resolves its hub, its sibling
   * guides, and what it hands over to. Three possible values:
   *
   *   a life area slug   the usual case, hands over to that Companion
   *   SERIES             belongs to the whole shelf rather than one area
   *   null               an orphan, meaning no product behind it at all
   *
   * SERIES exists because two guides genuinely describe the category
   * rather than a domain, and forcing them into an arbitrary area would
   * be dishonest while marking them orphans would be wrong: an orphan is
   * no product, and these are every product. They hand over to the
   * series rather than to one Companion.
   *
   * Null is deliberately visible rather than convenient. guides.test.ts
   * asserts orphans do not accumulate, so a guide that earns traffic it
   * cannot convert cannot pile up quietly the way the empty need pages
   * did.
   */
  areaSlug: string | typeof SERIES | null;
  /**
   * Which country's procedure this describes, where that matters.
   *
   * Undeclared means the guidance holds anywhere: how to make a phone
   * call you have been avoiding does not change at a border. Declared
   * means it does, and the page says so loudly at the top.
   *
   * This exists because six affairs guides shipped describing UK
   * probate, using "register office" and "solicitor", with nothing
   * saying so. An American reading them was being told to do something
   * that does not exist where they live. Search bears the problem out:
   * people put the country in the query, and "what to do when a parent
   * dies uk" and "what to do when a parent dies in florida" are both
   * things people type.
   */
  locale?: "us" | "uk";
  body: GuideBlock[];
};

/** Guides whose procedure is specific to one country. */
export function localeLabel(locale: "us" | "uk"): string {
  return locale === "us" ? "United States" : "United Kingdom";
}

/**
 * The same guide written for the other country, if it exists.
 *
 * Paired guides share everything but the procedure, so each one links to
 * its counterpart rather than leaving a reader to work out that the page
 * they want is elsewhere.
 */
export function localeCounterpart(guide: Guide): Guide | undefined {
  if (!guide.locale) return undefined;

  // The primary market keeps the unsuffixed slug, because that is the
  // URL the head term deserves and the United States is the larger
  // audience. So a pair is "slug" and "slug-uk", not "slug-us" and
  // "slug-uk", and the lookup has to work in both directions.
  const stem = guide.slug.replace(/-(uk|us)$/, "");
  const other = guide.locale === "uk" ? "us" : "uk";
  return GUIDES.find(
    (candidate) =>
      candidate.locale === other &&
      (candidate.slug === `${stem}-${other}` || candidate.slug === stem)
  );
}

/** A guide belonging to the whole Companion Series rather than one life area. */
export const SERIES = "series" as const;

/** Guides that describe the category rather than a single domain. */
export function seriesGuides(): Guide[] {
  return GUIDES.filter((guide) => guide.areaSlug === SERIES);
}

export const GUIDES: Guide[] = [
  // ---------------------------------------------------------------- batch 1
  // The ten highest-priority guides from the content plan. Two of them,
  // the parent-dies pair, were flagged in the fit verification as
  // aftermath topics against a preparation product. They are written here
  // as the honest bridge rather than the rescue: they help with the weeks
  // in front of the reader, and hand over on prevention, which is what
  // Personal Life Affairs Companion actually does.

  {
    slug: "what-to-do-when-a-parent-dies",
    title: "What to do when a parent dies: a clear order for the first two weeks",
    dek: "The practical steps in the order they actually need doing, written for somebody who is grieving and cannot hold a list in their head.",
    publishedAt: "2026-08-30",
    updatedAt: "2026-08-31",
    areaSlug: "affairs-and-endings",
    locale: "us",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a parent dies there are perhaps six things that genuinely need doing in the first week, and several dozen that feel urgent and are not. The difference matters, because you are being asked to do administration at the exact moment you are least able to.",
          "This is the order that works. Get certified copies of the death certificate, because almost nothing else can start without them. Find the will. Tell the small number of organizations that actually need telling now. Secure the property. Then stop, because the rest can genuinely wait, and most of it will take months anyway.",
          "Nothing here is legal advice. Probate and creditor rules are set by state and sometimes by county, and the funeral director and the probate clerk where your parent lived will tell you what applies.",
        ],
      },
      {
        kind: "timeline",
        heading: "The first 48 hours",
        steps: [
          {
            when: "Straight away",
            what: "Get the death pronounced. In a hospital, hospice or nursing facility, staff handle it. At home with hospice involved, call the hospice line rather than 911. At home unexpectedly, call 911.",
          },
          {
            when: "Same day",
            what: "Choose a funeral home. In most states they file the death certificate with the county or state vital records office on your behalf, which is why this step gates the next one.",
          },
          {
            when: "When you order",
            what: "Ask the funeral home for certified copies of the death certificate. Ten is normal. Each institution wants its own and most will not take a photocopy.",
          },
          {
            when: "Check first",
            what: "Ask whether a prepaid funeral plan or burial policy already exists before arranging anything. Many people have one and never mention it.",
          },
          {
            when: "Within thirty days",
            what: "Secure the property. Lock it, forward the mail, and check the homeowners policy, because most insurers restrict cover once a house has been vacant for thirty or sixty days.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why you need so many death certificates",
        paragraphs: [
          "Banks, brokerages, insurers, pension administrators, the Social Security Administration, the DMV and the county recorder will each want a certified copy, and most will not accept a scan or a photocopy. Some return them and some keep them.",
          "Ordering ten through the funeral home at the outset is far cheaper and faster than ordering them one at a time from vital records over the following six months. This is the single most common thing people wish they had known.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Who to tell in the first two weeks",
        intro: "Not everybody. Just the ones where delay causes a real problem.",
        items: [
          "Social Security, which the funeral home often reports for you. Confirm it was done, because benefits paid for the month of death usually have to be returned.",
          "Their bank and any credit union, so accounts can be frozen and automatic payments stopped.",
          "Their employer or pension administrator, because overpaid pension is reclaimed and stopping it is easier than repaying it.",
          "Medicare, Medicaid or the VA, if any applied.",
          "Home and auto insurers, particularly if a property is now unoccupied or a vehicle is being kept.",
          "The three credit bureaus, to place a deceased alert and reduce the risk of identity theft.",
          "Their landlord or mortgage servicer.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to look for the will",
        paragraphs: [
          "Start with the obvious places, because that is usually where it is: a home safe, a filing box, a bedside drawer. Then the less obvious. Many people leave the original with the attorney who drafted it, and some counties allow a will to be deposited with the probate court during life.",
          "If you find one, read who is named as executor before doing anything else. That person petitions the probate court for the authority to act, and if it is not you, several of the steps above become theirs rather than yours.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What can genuinely wait",
        paragraphs: [
          "Probate runs for months in most states, and there is no version of this where you finish it in two weeks. Closing accounts, valuing the estate, filing the final tax return and distributing anything are all downstream of steps you have not yet completed.",
          "Clearing the house can wait too, and most people who rush it regret it. Nothing bad happens if a closet stays full until spring.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part nobody warns you about",
        paragraphs: [
          "The hardest thing about these two weeks is rarely any single task. It is that you are reconstructing somebody's entire administrative life from the outside, without a map, while grieving. Which bank. Which 401(k). Whether there was life insurance. Whether the utilities were in their name. Who the attorney was.",
          "Most families find some of it and never find the rest. Money sits unclaimed with state treasurers, subscriptions keep taking payments for years, and somebody spends a Sunday going through paper looking for a policy number that may not exist.",
          "It is worth saying plainly, because it is the thing you will think about later: this is not something you can fix now, for the person who has died. It is something you can fix for the next person, which is usually you.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion is built for the other side of this. It walks you through recording what exists, where it is kept, and who should be told, so nobody has to reconstruct it from the outside. It never asks you to upload a document, only to record where one is. If these two weeks have shown you how hard the search is, that is exactly the problem it exists to prevent.",
      },
    ],
  },

  {
    slug: "what-to-do-when-a-parent-dies-uk",
    title: "What to do when a parent dies in the UK: the first two weeks",
    dek: "Registering the death, ordering certificates and telling the right people, in the order they need doing, for England, Wales, Scotland and Northern Ireland.",
    publishedAt: "2026-08-30",
    updatedAt: "2026-08-31",
    areaSlug: "affairs-and-endings",
    locale: "uk",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a parent dies there are perhaps six things that genuinely need doing in the first week, and several dozen that feel urgent and are not. The difference matters, because you are being asked to do administration at the exact moment you are least able to.",
          "This is the order that works. Register the death and get certified copies of the certificate, because almost nothing else can start without them. Find the will if there is one. Tell the small number of organisations that actually need telling now. Secure the property. Then stop, because the rest can genuinely wait, and most of it will take months anyway.",
          "Nothing below is legal advice. Requirements differ by country and sometimes by region, and the registrar you speak to will tell you what applies where you are.",
        ],
      },
      {
        kind: "timeline",
        heading: "The first 48 hours",
        steps: [
          {
            when: "Straight away",
            what: "Get the medical certificate of cause of death. If your parent died in hospital or a care home, staff arrange this. If they died at home unexpectedly, call emergency services first.",
          },
          {
            when: "Within a few days",
            what: "Register the death with your local register office. Most places require this within a few days.",
          },
          {
            when: "At the same appointment",
            what: "Order certified copies of the death certificate. Order more than feels sensible, because ten is normal and each organisation wants its own.",
          },
          {
            when: "Once it is registered",
            what: "Contact a funeral director, or check whether a plan was already paid for. Many people have one and never mention it.",
          },
          {
            when: "Within thirty days",
            what: "Secure the property. Lock it, redirect post, and if it is now empty, check what the home insurance says about unoccupied buildings, because many policies lapse after thirty days.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why you need so many death certificates",
        paragraphs: [
          "Banks, pension providers, insurers, utilities and government departments will each want to see a certified copy, and most will not accept a photocopy or a scan. Some return them and some do not. Ordering ten at registration is far cheaper and faster than ordering them one at a time over the following six months.",
          "This is the single most common thing people wish they had known, and it costs nothing to get right.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Who to tell in the first two weeks",
        intro: "Not everybody. Just the ones where delay causes a real problem.",
        items: [
          "Their bank and any building society, so accounts can be frozen and direct debits stopped.",
          "Their pension provider or employer, because overpaid pension is usually reclaimed and it is easier to stop it than repay it.",
          "The government department handling benefits, tax and state pension, which in many countries has a single service that notifies several at once.",
          "Home and car insurers, particularly if a property is now unoccupied.",
          "Their landlord or mortgage lender.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to look for the will",
        paragraphs: [
          "Start with the obvious places, because that is usually where it is: a home safe, a filing box, a bedside drawer. Then the less obvious. Many people leave a will with the solicitor who drafted it, and some countries have a central will register worth searching.",
          "If you find a will, look for who is named as executor before you do anything else. That person has the legal authority to act, and if it is not you, several of the steps above become theirs rather than yours.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What can genuinely wait",
        paragraphs: [
          "Probate takes months in most places, and there is no version of this where you finish it in a fortnight. Closing accounts, valuing the estate, dealing with tax and distributing anything are all downstream of steps you have not yet completed.",
          "Clearing the house can wait too, and most people who rush it regret it. Nothing bad happens if a wardrobe stays full until spring.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part nobody warns you about",
        paragraphs: [
          "The hardest thing about this fortnight is rarely any single task. It is that you are trying to reconstruct somebody's entire administrative life from the outside, without a map, while grieving. Which bank. Which pension. Whether there was insurance. Whether the utilities were in their name. Who the solicitor was.",
          "Most families find some of it and never find the rest. Money sits unclaimed, subscriptions keep taking payments for years, and somebody spends a Sunday going through paper looking for a policy number that may not exist.",
          "It is worth saying plainly, because it is the thing you will think about later: this is not something you can fix now, for the person who has died. It is something you can fix for the next person, which is usually you.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion is built for the other side of this. It walks you through recording what exists, where it is kept, and who should be told, so nobody has to reconstruct it from the outside. It never asks you to upload a document, only to record where one is. If this fortnight has shown you how hard the search is, that is exactly the problem it exists to prevent.",
      },
    ],
  },

  {
    slug: "how-to-find-someones-accounts-after-they-die",
    title: "How to find someone's bank accounts, pensions and policies after they die",
    dek: "A practical search order for tracing accounts, pensions, insurance and subscriptions when nobody wrote any of it down.",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is no single register you can search to find everything somebody owned. That is the honest answer, and it is why this task takes most families months rather than an afternoon.",
          "What works instead is a systematic sweep of four sources: their post, their bank statements, their email, and the official tracing services that exist for pensions and unclaimed assets. Between them you will usually find the great majority of it.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Start with twelve months of bank statements",
        intro: "This is the highest-yield hour you will spend, because almost everything leaves a trace here.",
        items: [
          "Regular outgoings reveal insurance policies, subscriptions, service contracts and standing orders.",
          "Regular incomings reveal pensions, annuities, benefits and rental income.",
          "Annual payments are easy to miss, so look across a full twelve months rather than three.",
          "Small recurring amounts are often the ones nobody knows about, and they keep taking money long after a death if nobody stops them.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep the post for at least a year",
        paragraphs: [
          "Annual statements are the single best source for accounts nobody knew about. A pension the person had from a job in the 1980s will usually announce itself once a year and never otherwise.",
          "This is why redirecting post matters so much, and why clearing a house too quickly causes problems. If post stops arriving and nobody kept the last year of it, the trail goes cold.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Where else to look",
        items: [
          "Their email, searched for words like statement, policy, renewal, premium and pension.",
          "Their phone, for banking and authenticator apps that name institutions.",
          "The pension tracing service most countries run, which finds schemes from former employers.",
          "Unclaimed asset registers, which hold dormant accounts and lost policies.",
          "Their accountant, attorney or solicitor, who often knows more than the family does.",
          "The loft, the filing box, and the drawer nobody has opened, which sound like jokes and are where a great deal of this is actually found.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What you will need before anybody talks to you",
        paragraphs: [
          "Almost every institution will want a certified copy of the death certificate, proof of your own identity, and evidence of your authority to act, which usually means the will naming you as executor plus the court document appointing you, called letters testamentary in most of the United States and a grant of probate in the United Kingdom.",
          "It is worth assembling that set once and keeping it together, because you will be asked for exactly the same three things perhaps twenty times.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Accept that you will not find everything",
        paragraphs: [
          "Billions sit in dormant accounts and untraced pensions, mostly because the only person who knew about them died. A thorough search finds most of it and almost never all of it, and at some point continuing to look costs more than it recovers.",
          "That is not a failure on your part. It is the predictable result of a system where the information lived in one person's head.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records what exists and where it is kept, so this search never has to happen to your family. It holds accounts, pensions, policies and digital services as a registry, never as uploaded files, and produces a printed book somebody could follow if they had to. It is the difference between two weeks of searching and an afternoon of reading.",
      },
    ],
  },

  {
    slug: "homeschool-record-keeping-requirements-by-state",
    title: "Homeschool record keeping requirements, state by state",
    dek: "What each state actually asks you to keep, which states require a portfolio, and the records worth keeping even where nothing is required.",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Homeschool record requirements vary enormously between states. Some ask for nothing at all. Some want attendance only. A handful require a portfolio of work that an evaluator will actually look at.",
          "The practical takeaway is that you should know which of three groups your state falls into, and then keep slightly more than it asks for, because the cost of keeping records is small and the cost of not having them when asked is not.",
          "Laws change. Always confirm with your state homeschool association or department of education before relying on any summary, including this one.",
        ],
      },
      {
        kind: "table",
        heading: "Every state, and what it asks you to keep",
        intro: "Use the filter to find yours. The level is how much the state involves itself, not how hard homeschooling is there. Confirm against your state before relying on it, because these change.",
        columns: ["State", "Level", "What you are asked to keep"],
        rows: [
          ["Alabama", "Low", "Notice through a church or private school; attendance records"],
          ["Alaska", "None", "Nothing filed; records for your own use"],
          ["Arizona", "Low", "Notice of intent; keep your own records"],
          ["Arkansas", "Moderate", "Notice of intent each year; records of instruction"],
          ["California", "Moderate", "Private school affidavit; attendance register and course list"],
          ["Colorado", "Moderate", "Notice; attendance, immunisation and test or evaluation every other year"],
          ["Connecticut", "None", "Nothing required; portfolio only if you opt into review"],
          ["Delaware", "Low", "Enrolment and attendance reported annually"],
          ["District of Columbia", "High", "Notice; portfolio available for review; annual reporting"],
          ["Florida", "High", "Notice; portfolio of work and log kept two years; annual evaluation"],
          ["Georgia", "Moderate", "Declaration of intent; attendance; annual progress reports kept"],
          ["Hawaii", "Moderate", "Notice; record of curriculum; annual progress report"],
          ["Idaho", "None", "Nothing filed; records for your own use"],
          ["Illinois", "None", "Nothing filed; records for your own use"],
          ["Indiana", "Low", "Attendance records, produced on request"],
          ["Iowa", "Low", "Options range from none to reporting; depends on the route chosen"],
          ["Kansas", "Low", "Register as a non-accredited private school; keep attendance"],
          ["Kentucky", "Low", "Notice; attendance and scholarship records"],
          ["Louisiana", "Moderate", "Application or notice; portfolio or test results annually"],
          ["Maine", "Moderate", "Notice; annual assessment by test or portfolio review"],
          ["Maryland", "High", "Notice; portfolio reviewed by the district up to three times a year"],
          ["Massachusetts", "High", "Prior approval of your plan; progress reports as agreed"],
          ["Michigan", "None", "Nothing filed under the home education route"],
          ["Minnesota", "Moderate", "Notice; annual testing; records of subjects and attendance"],
          ["Mississippi", "Low", "Certificate of enrolment filed annually"],
          ["Missouri", "Moderate", "No notice, but a log of hours, samples of work and evaluations kept"],
          ["Montana", "Low", "Notice; attendance and immunisation records kept"],
          ["Nebraska", "Moderate", "Notice and information filed annually; attendance records"],
          ["Nevada", "Low", "Notice of intent filed once; records for your own use"],
          ["New Hampshire", "Moderate", "Notice; portfolio kept two years; annual evaluation"],
          ["New Jersey", "None", "Nothing filed; records for your own use"],
          ["New Mexico", "Low", "Notice filed annually; immunisation records"],
          ["New York", "High", "Notice; individualised plan; quarterly reports; annual assessment"],
          ["North Carolina", "Moderate", "Notice; attendance and immunisation; annual standardised test kept"],
          ["North Dakota", "Moderate", "Notice; annual testing in certain grades; records kept"],
          ["Ohio", "High", "Notice; annual academic assessment by test or portfolio review"],
          ["Oklahoma", "None", "Nothing filed; records for your own use"],
          ["Oregon", "Moderate", "Notice on starting; testing at certain grades, results kept"],
          ["Pennsylvania", "High", "Affidavit; log, portfolio, and annual evaluator review"],
          ["Rhode Island", "Moderate", "District approval; attendance and progress as the district requires"],
          ["South Carolina", "High", "Association or district option; portfolio, log and progress records"],
          ["South Dakota", "Low", "Notice; testing at certain grades"],
          ["Tennessee", "Moderate", "Notice; attendance; testing at certain grades depending on route"],
          ["Texas", "None", "Nothing filed; keep curriculum evidence for your own use"],
          ["Utah", "Low", "One-time affidavit; records for your own use"],
          ["Vermont", "High", "Enrolment filed annually; assessment and progress report"],
          ["Virginia", "Moderate", "Notice; annual evidence of progress by test or evaluation"],
          ["Washington", "Moderate", "Declaration of intent; annual test or assessment, results kept"],
          ["West Virginia", "Moderate", "Notice; annual academic assessment kept"],
          ["Wisconsin", "Low", "Annual enrolment report filed"],
          ["Wyoming", "Low", "Curriculum submitted annually to the local board"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Which states require a portfolio",
        paragraphs: [
          "Nine jurisdictions sit in the high group: the District of Columbia, Florida, Maryland, Massachusetts, New York, Ohio, Pennsylvania, South Carolina and Vermont. In those, a portfolio or a formal annual assessment is part of the law rather than a good habit.",
          "If you are in one of those, the portfolio is not a formality. Someone reads it, and building it in April from memory is far harder than adding to it as you go.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What a portfolio usually contains",
        intro: "The specifics vary, but this set covers most requirements.",
        items: [
          "A log of educational activities, with reading materials named by title.",
          "Samples of work across the year, not just the best pieces.",
          "Attendance or days schooled, where your state counts them.",
          "Standardised test results or an evaluator's written report, where required.",
          "A list of subjects covered and the materials used.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to keep even where nothing is required",
        intro: "Three things are worth recording regardless of your state, because they are the ones you will want later and cannot reconstruct.",
        items: [
          "The date, the subject, and roughly what part of it. Unit 3, Lesson 12 is enough.",
          "Whether it landed. One word does it: easy, about right, or difficult.",
          "The occasional sentence about something that happened. She finally understood fractions. He reads better on the floor than at a desk.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why most record keeping fails",
        paragraphs: [
          "It fails in one of two directions. Either nothing gets kept at all and a year cannot be accounted for, or somebody builds a system so heavy that it is abandoned by half term and the result is the same.",
          "The version that survives is the one that takes under a minute a day and does not require you to feel behind when you miss a week.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion keeps the record as you go and prints it when you need it. It accepts backdated entries, because nobody logs every day on the day, and it includes short checks you can run at home to find out honestly whether something stuck. There is no completion percentage anywhere in it, and no screen that tells you that you are behind.",
      },
    ],
  },

  {
    slug: "home-maintenance-you-skip-that-costs-the-most",
    title: "The home maintenance you skip that costs the most later",
    dek: "Which deferred jobs actually turn into expensive damage, roughly how often each needs doing, and what to record so the next one is cheaper.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Almost every house has a job that has been put off, and most have several. That is not carelessness. It is what happens when three hundred small facts and dates live nowhere except somebody's memory.",
          "The problem is that deferred maintenance does not stay the same price. Industry analysis puts the average deferred repair at over five thousand dollars by the time it is finally done, and every dollar of work put off can cost four or more later. The jobs below are the ones where that multiplier is real.",
        ],
      },
      {
        kind: "table",
        heading: "The jobs where delay actually costs",
        intro: "Intervals are typical rather than universal. Your manual wins over any table.",
        columns: ["Job", "Roughly how often", "What it turns into"],
        rows: [
          ["Clear gutters", "Twice a year", "Water against the wall, then damp, then the fascia and sometimes the foundation"],
          ["Service the boiler or furnace", "Annually", "Failure in the coldest week, when call-out rates are highest and parts are slowest"],
          ["Flush the water heater", "Annually", "Sediment, lost efficiency, then a tank that fails years early"],
          ["Replace HVAC filters", "Every 1 to 3 months", "Strained system, higher bills, shortened compressor life"],
          ["Check roof and flashing", "Annually", "Small leak becomes decking, insulation and ceiling"],
          ["Test smoke and CO alarms", "Monthly", "The only item on this list where the cost is not money"],
          ["Reseal grout and caulk", "Every 1 to 2 years", "Water behind tile, which is invisible until the wall is opened"],
          ["Winterise outdoor taps", "Once, before first freeze", "A burst pipe inside a wall, which is the most expensive item here"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the reminder always arrives too late",
        paragraphs: [
          "Nobody forgets to service a boiler because they do not care. They forget because there is no natural moment to remember, and the reminder that finally arrives is a cold house or a stain on a ceiling.",
          "The fix is not discipline. It is writing down when something was last done, so the next date is a fact rather than a guess.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to record about anything in your house",
        intro: "Five fields, once, when you can actually see the appliance. This is the part that makes every future repair cheaper.",
        items: [
          "Make and model, which is usually on a plate inside a door, behind a kick panel, or on the back.",
          "When it was installed or bought.",
          "When the warranty ends.",
          "When it was last serviced, and by whom.",
          "Anything odd about it that a future engineer would want to know.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Seasonal jobs are not interval jobs",
        paragraphs: [
          "A good deal of outdoor maintenance belongs to a month rather than to a rolling interval. Blowing out an irrigation system belongs in autumn, not three hundred and sixty five days after you happened to write it down.",
          "Treating everything as an interval is why generic maintenance apps end up telling people to winterise in July, and why they get ignored.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base knows the service intervals for well over a hundred common jobs, rates each by what happens if you skip it and how much effort it takes, and understands which jobs belong to a season rather than a rolling date. It records the make, model and service history of everything in your house, so the next repair starts with facts instead of a torch and a phone camera behind the fridge.",
      },
    ],
  },

  {
    slug: "what-else-your-trip-depends-on-when-something-changes",
    title: "One thing moved. Here is how to work out what else your trip depends on",
    dek: "A flight changes and three other bookings quietly become wrong. A method for finding them before they find you.",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most trip disasters are not the first thing that goes wrong. They are the second and third things, which only became problems because the first thing moved and nobody worked out what it touched.",
          "A flight shifts three hours. The airport transfer booked for the old arrival time is now wrong. The hotel you told about a late check-in is now wrong too. The restaurant that evening may be fine or may not. None of that is unusual, and all of it is predictable if you already know which parts of your trip were built on top of which.",
        ],
      },
      {
        kind: "list",
        heading: "The three questions, per booking",
        intro: "Ask these once, when you book, and the answer is there when you need it at six in the morning in an airport.",
        ordered: true,
        items: [
          "What does this depend on? A transfer usually depends on a flight. A check-in usually depends on a transfer.",
          "What depends on this? The same relationship read the other way, which is the one that matters during a disruption.",
          "If this moves by three hours, what is the first thing I check?",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Only walk downward",
        paragraphs: [
          "This is the part people get wrong under pressure. When a flight moves, everything booked after it is potentially affected. Nothing booked before it is.",
          "A hotel check-in changing does not mean your flight changed. The direction runs one way, because later things depend on earlier things and not the reverse, and remembering that halves the number of things you have to think about.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Handle them one at a time",
        paragraphs: [
          "The instinct when four things are wrong is to deal with all four at once, usually by opening four browser tabs and phoning somebody while reading an email. That is how people end up cancelling the wrong booking.",
          "Change the thing that moved first. Write down the new fact. Then go to whatever depended on it, one booking at a time, and decide whether it actually needs anything. Often two of the four turn out to be fine.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to have in front of you before you call anybody",
        items: [
          "The booking reference and the name it was booked under, which are sometimes different.",
          "The old time and the new time, stated plainly.",
          "What you actually want to happen, decided before you dial.",
          "Somewhere to write the name of who you spoke to and the reference for the call.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not let anything change itself",
        paragraphs: [
          "Whatever you use to track this, it should never quietly rewrite your other bookings when one thing moves. Being shown what might be affected is useful. Having four bookings silently altered on your behalf is considerably worse than having none of them altered, because now you do not know what is true.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion is built around exactly this. You say once what a booking depends on, and when you record a change it walks down the chain and shows every booking that was built on top of it, with its current time, marked as unchanged so far. It edits nothing for you. Then it helps you work through them one at a time.",
      },
    ],
  },

  {
    slug: "flight-delayed-with-a-connection-what-to-do-first",
    title: "Your flight is delayed and you have a connection. What to do first",
    dek: "The order that actually helps in the twenty minutes after a delay is announced, and what to have ready before you reach a desk.",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Long delays are ordinary rather than rare. If you have a connection, the useful window is the first twenty minutes, before several hundred other people reach the same conclusion you have.",
          "The order is: work out whether the connection is genuinely gone, get in a queue and on the phone at the same time, and know what you are asking for before anyone speaks to you.",
        ],
      },
      {
        kind: "timeline",
        heading: "The first twenty minutes",
        steps: [
          {
            when: "Before anything else",
            what: "Check the actual arrival time against your connection time, not the delay figure. A ninety minute delay on a three hour layover is not a problem.",
          },
          {
            when: "If it is tight",
            what: "Join the transfer or service desk queue immediately. You can always leave a queue.",
          },
          {
            when: "While you stand in it",
            what: "Call the airline. The phone queue and the physical queue run in parallel, and whichever answers first wins.",
          },
          {
            when: "At the same time",
            what: "Check the airline app. Rebooking is sometimes available there before an agent offers it.",
          },
          {
            when: "Before you reach the desk",
            what: "Decide what you want: the next flight, a different routing, or an overnight with a hotel. Vague requests get vague answers.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Say what happened, once, in order",
        paragraphs: [
          "Whoever you reach can only help with the actual sequence of events. Give it once, cleanly, then say what you need. Leading with the ask before the facts almost always makes the conversation longer.",
          "Keep it to two sentences. Your inbound flight is delayed, you will miss a connection at a named time, and you would like to be rebooked.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Before you walk away, get two things",
        paragraphs: [
          "The name of who you spoke to, and a reference for the conversation. Not to complain later, though it helps with that. The real reason is that if this is not resolved by whoever comes after them, you can pick it up where you left off instead of starting again.",
          "This is the single most useful habit in travel disruption and it takes ten seconds.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What about compensation",
        paragraphs: [
          "A great many people never claim for a disruption, usually because nobody told them they could. It is worth looking into afterwards.",
          "It is deliberately not part of this guide, because what you are owed depends on where you flew from, which carrier, and sometimes which fare, and a confident wrong answer at a desk puts you in a worse position than no answer. Sort out the travel first. Look up entitlement later, when you are sitting down and not at a desk.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to have ready",
        items: [
          "Booking reference and the name the booking is under.",
          "Your onward flight number and its scheduled time.",
          "What is waiting at the other end, because a transfer or a check-in may also need moving.",
          "Somewhere to write the new details down that is not a phone at eleven percent.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion holds your references, your onward bookings and what depends on what, so a delay does not begin with searching six inboxes. It walks you through the call itself, including an opening line you can use or replace, and afterwards it shows you what else that delay touched. It also prints as a blank book, for when the phone is the thing that failed.",
      },
    ],
  },

  {
    slug: "how-to-make-a-phone-call-you-have-been-avoiding",
    title: "How to make a phone call you have been avoiding for weeks",
    dek: "Why the call is hard, and a way through it that does not require you to suddenly become a different person.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The call is not hard because you do not know what to say. It is hard because making it requires holding several things at once: why you are calling, what outcome you want, the two facts you must not forget, and the ability to think while a stranger talks at you.",
          "That is a working memory problem, not a motivation problem, which is why telling yourself to just do it has not worked for three weeks.",
          "What helps is taking those things out of your head and putting them somewhere you can see them, so the call only requires the part you can actually do.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Five minutes before you dial",
        intro: "Write these down. On paper, on a screen, anywhere you can see them while talking.",
        items: [
          "What this is about, in one line.",
          "What you want to happen. Decide it now, because this is the thing that gets lost halfway through explaining what went wrong.",
          "Your account or reference number.",
          "Two facts you will need: a date, an amount, a name.",
          "Your first sentence, written out.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write the first sentence out",
        paragraphs: [
          "The first fifteen seconds are the part almost everybody rehearses and dreads, and they are also the part you can prepare completely. Once you are through them, the conversation usually carries itself.",
          "Something as plain as this works: hello, I have a problem with my account and I am hoping you can help me sort it out. Can I explain what has happened. You are not performing. You are getting past the opening.",
        ],
      },
      {
        kind: "list",
        heading: "While you are on the call",
        intro: "Short, because anything longer is unreadable while somebody is speaking to you.",
        items: [
          "Say what you need.",
          "Ask them to read the details back once they have found it.",
          "Ask what happens next, and by when.",
          "Get a reference for the call, and the name of who you spoke to.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you get through it and nothing is resolved",
        paragraphs: [
          "That is a normal outcome and not a failed call. Plenty of calls end with somebody else needing to look into it. What matters is that you now have a reference and a name, which means the next call starts from where this one stopped rather than from the beginning.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you do not manage it today",
        paragraphs: [
          "Then you do not manage it today. Nothing has got worse, and adding guilt to the pile has never once made the next attempt easier.",
          "The thing worth protecting is that the preparation you did is still there tomorrow. Starting over from nothing is what makes the second attempt harder than the first, and it is entirely avoidable.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion walks you through calls like this one, step by step, holding the purpose and the outcome on screen so you do not have to. It gives you an opening line you can edit or ignore, and it never tells you what to accept or settle for, because you are the one with the facts. If you close it halfway through, it picks up on the exact question you left, and it records nothing at all about the attempt you did not finish.",
      },
    ],
  },

  {
    slug: "picking-something-back-up-after-abandoning-it",
    title: "How to pick something back up after you abandoned it halfway",
    dek: "Restarting is harder than starting, for a specific reason. Here is what actually reduces the cost of coming back.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Coming back to something you abandoned is harder than starting it was, and the reason is worth knowing. You are not just facing the task again. You are facing the task, plus the work of reconstructing where you got to, plus whatever you have decided your abandoning it says about you.",
          "Only one of those three is actually the task. The other two are what make the second attempt feel heavier than the first, and both can be reduced.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The reconstruction is the real cost",
        paragraphs: [
          "Most of the resistance to picking something up is not laziness. It is the accurate expectation that you will spend twenty minutes working out what you already did before you can do anything new.",
          "Which forms were filled in. Whether you sent the email. What the person said. Where the reference number went. That work is genuinely tedious, your brain knows it is coming, and it is a large part of why the thing has sat for a month.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to leave behind when you stop",
        intro: "Three lines when you put something down, which turn a twenty minute restart into a two minute one.",
        items: [
          "Where you got to. Not what the task is, where you stopped inside it.",
          "The next physical action, written as a verb. Call the number on the letter. Not chase the refund.",
          "Anything you learned that is not written anywhere else, such as a reference number or the name of who you spoke to.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not restart from the beginning",
        paragraphs: [
          "The instinct on returning is to go back to the start and re-read everything, which feels responsible and is usually a way of not resuming. It also makes the whole thing feel larger than it is.",
          "Go straight to the next action instead. If it turns out you needed context, you will find that out in about a minute, which is much cheaper than reviewing everything first.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The story about yourself is optional",
        paragraphs: [
          "There is a version of this where abandoning something becomes evidence about what sort of person you are, and that version makes returning much harder, because now picking it up means admitting to something.",
          "Nothing was lost by stopping. The task is exactly where you left it, indifferent to how long it sat. A month of not doing something is not a month of failing at it, whatever a productivity app with a streak counter has implied.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built so that leaving something is not a failure. Close a run halfway through and it records nothing at all, then returns you to the exact question you left rather than to the beginning. Everything you had already answered is still there. There is no streak, no completion percentage, and nothing anywhere that counts what you did not get to.",
      },
    ],
  },

  {
    slug: "how-much-of-your-money-is-actually-safe-to-spend",
    title: "How much of your money is actually safe to spend",
    dek: "Your balance is not the answer. A method for working out the number that is genuinely yours, and why banking apps will not tell you.",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The number in your banking app is not what you can spend. It is what is sitting there right now, before everything that has already been committed and has not left yet.",
          "The figure you actually want is your balance, minus money that is protected or spoken for, minus what is due before your next payday. That number is usually much smaller than the balance, and knowing it is the difference between spending confidently and spending with a low background hum of worry.",
        ],
      },
      {
        kind: "timeline",
        heading: "Working it out",
        steps: [
          {
            when: "Start with",
            what: "Every current account balance added up. Not savings, unless you genuinely would spend them.",
          },
          {
            when: "Take out",
            what: "Anything protected: money set aside for tax, a deposit being held, an emergency fund you will not touch.",
          },
          {
            when: "Take out",
            what: "Every bill and subscription due before your next payday.",
          },
          {
            when: "Take out",
            what: "Anything you have committed to but not yet paid, such as a booking or a repair.",
          },
          {
            when: "What is left",
            what: "That is the honest number. Divide it by the weeks remaining if you want a weekly figure.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why your banking app will not do this",
        paragraphs: [
          "Your bank knows what has left your account. It does not know that your car insurance renews on the eighteenth, that you promised to cover a shared bill, or that four hundred of that balance is quietly earmarked for tax.",
          "Available balance in a banking app usually means cleared funds, not uncommitted funds. Those are very different things, and the gap between them is where most unexpected shortfalls live.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why budgeting apps stop working around month two",
        paragraphs: [
          "Most people who set a financial goal do not stick to it. The usual reason is not weak willpower. It is that most budgeting systems require constant categorising to stay accurate, and the moment you fall a week behind, the number on screen is wrong.",
          "Once the number is wrong, you stop trusting it, and once you stop trusting it, the whole thing is decoration. A system that survives is one that stays roughly right with very little upkeep.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The number should tell you when it is unsure",
        paragraphs: [
          "This matters more than it sounds. If a bill is missing its due date, any figure calculated from it is provisional, and you deserve to be told that rather than shown a confident number built on a guess.",
          "A tool that says this figure is preliminary because two bills have no date is far more useful than one that quietly rounds the uncertainty away.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Monthly Money Reset gives you one number for what is safe to spend this month and a rough weekly figure, and it is free. Personal Finance Companion does the same across your whole picture, subtracting protected money and upcoming obligations, showing the line by line explanation of how it reached the figure, and telling you plainly when a missing due date makes it preliminary. Start with the free one if you are not sure.",
      },
    ],
  },

  {
    slug: "how-to-find-every-subscription-you-are-paying-for",
    title: "How to find every subscription you are still paying for",
    dek: "A systematic sweep for the recurring payments you have forgotten, including the annual ones that are hardest to spot.",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The subscriptions costing you the most are not the ones you think about. They are the ones you forgot, which is precisely why they are still running.",
          "Finding them takes about half an hour and needs one thing most people skip: a full twelve months of statements, not three. Annual subscriptions are the expensive ones and they are invisible in a quarterly view.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The sweep",
        items: [
          "Download twelve months of statements for every current account and credit card.",
          "Sort by merchant rather than by date, so repeats group together.",
          "Mark anything that appears more than twice at a similar amount.",
          "Separately scan for single larger charges around the same date each year, which is where annual renewals hide.",
          "Check app store subscriptions on every phone in the household, since these do not always appear as recognisable names.",
          "Search your email for renewal, receipt, subscription and your card's last four digits.",
        ],
      },
      {
        kind: "table",
        heading: "Where forgotten subscriptions usually hide",
        columns: ["Where", "Why it gets missed"],
        rows: [
          ["Annual renewals", "Appears once a year, never in a three month view"],
          ["App store billing", "Shows as the store, not the service"],
          ["Free trials that converted", "The first charge arrives long after you signed up"],
          ["Old cards still on file", "Charges continue on a card you replaced"],
          ["Services bundled with something else", "One line covers several products"],
          ["A partner's account", "Two people each paying for the same thing"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Decide with the annual figure, not the monthly one",
        paragraphs: [
          "Nine ninety nine a month is easy to keep. A hundred and twenty pounds a year is a decision. Same money, different question, and the annual figure is the one that tells you the truth about whether you want it.",
          "Multiply everything by twelve before you decide anything, and look at the total across all of them. That number is usually a surprise.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Cancelling is the easy part. Noticing is not",
        paragraphs: [
          "Nothing about this is difficult once you have found them. The reason people pay for years is not that cancelling is hard, it is that nothing ever brings the charge to their attention at a moment when they are thinking about it.",
          "Which is why doing this once is worth much less than having somewhere the list actually lives afterwards.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion holds your subscriptions alongside your bills and accounts, with what each costs annually rather than just monthly, and counts them against what is genuinely safe to spend. You can import a statement rather than typing them in. It will not cancel anything for you, and it will not let a renewal be the first time you remember one exists.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 2
  // Ten more, all of which scored a clean fit in the guide-to-product
  // verification, so none needed reframing. Several cross-link back to
  // batch 1 rather than restating it, which is what the inline link
  // support in the block model was added for.

  {
    slug: "how-often-home-systems-need-servicing",
    title: "How often things in your house actually need servicing",
    dek: "A reference table of real service intervals for the systems and appliances in a normal home, plus the jobs that belong to a season rather than a date.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most maintenance advice online is either a vague seasonal checklist or a manufacturer telling you to service something twice as often as it needs. What follows is the practical middle: how often things genuinely need attention in a normal house.",
          "Two rules before the table. Your own manual always wins, because a specific model may differ. And a job you have never done on a twenty year old system may need doing sooner than the interval suggests, because the interval assumes it was kept up.",
        ],
      },
      {
        kind: "table",
        heading: "Heating, cooling and water",
        intro: "The systems where neglect is most expensive, and where a missed service usually shows up in the coldest or hottest week of the year.",
        columns: ["Job", "Interval", "Why this interval"],
        rows: [
          ["Boiler or furnace service", "Annually", "Required by most warranties, and the check that catches unsafe combustion"],
          ["Replace HVAC filter", "1 to 3 months", "Depends on pets, dust and whether anyone in the house has allergies"],
          ["Flush water heater", "Annually", "Sediment builds from the first year and quietly destroys efficiency"],
          ["Water heater anode rod check", "Every 3 to 5 years", "The single cheapest way to extend a tank's life"],
          ["Bleed radiators", "Annually, before heating season", "Trapped air means cold tops and a system working harder than it should"],
          ["Service air conditioning", "Annually, before summer", "A failure in August takes far longer to fix than one in April"],
          ["Check and clean condensate drain", "Annually", "A blocked drain is a common and avoidable cause of water damage"],
        ],
      },
      {
        kind: "table",
        heading: "Structure, water ingress and safety",
        intro: "Cheap to do, expensive to skip. Nearly all water damage in homes starts with something on this list.",
        columns: ["Job", "Interval", "Why this interval"],
        rows: [
          ["Clear gutters and downpipes", "Twice a year", "Autumn after leaf fall, and spring after winter debris"],
          ["Inspect roof and flashing", "Annually", "Most roof failures start at a joint, not in the middle of a slope"],
          ["Reseal grout and caulk", "1 to 2 years", "Failed sealant lets water behind tile, where it is invisible for months"],
          ["Test smoke and CO alarms", "Monthly", "The only job here where the cost of skipping is not measured in money"],
          ["Replace smoke alarm units", "Every 10 years", "Sensors degrade whether or not the battery is fine"],
          ["Check for leaks under sinks", "Twice a year", "A slow leak rots a cabinet base long before anyone notices"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The jobs that belong to a month, not an interval",
        paragraphs: [
          "About a third of outdoor maintenance is seasonal rather than periodic. Winterising outdoor taps belongs before the first freeze, not three hundred and sixty five days after you happened to write it down. Blowing out an irrigation system belongs in autumn regardless of when it was last done.",
          "This is why generic reminder apps get ignored. Anything that tells you to winterise in July has told you something useless, and after the second or third useless reminder people stop reading them entirely.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Seasonal jobs, by when they belong",
        items: [
          "Before first freeze: shut off and drain outdoor taps, disconnect hoses, winterise irrigation.",
          "Autumn: clear gutters after leaf fall, service heating before you need it, check draughts.",
          "Spring: service cooling before summer, inspect the roof after winter, clear gutters again.",
          "Summer: exterior paint and timber, fencing, anything needing dry weather.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Start from the last done date, not from today",
        paragraphs: [
          "The most common mistake when setting up any maintenance schedule is to start every interval from the day you wrote the list. That schedules a boiler service twelve months from an arbitrary Tuesday rather than twelve months from the last actual service.",
          "If you know roughly when something was last done, use that. If you genuinely do not know, treat it as due, because for most of this list an unnecessary check costs an hour and a missed one costs considerably more. There is more on which of these bite hardest in [the maintenance you skip that costs the most](/guides/home-maintenance-you-skip-that-costs-the-most).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base already knows these intervals for well over a hundred common jobs, and knows which of them belong to a season instead. It works out what is worth doing now from when you last did it, rates each job by what happens if you skip it, and stays quiet about the rest. Snoozing something genuinely changes what it asks you about again.",
      },
    ],
  },

  {
    slug: "what-to-record-about-an-appliance-before-you-need-it",
    title: "What to write down about an appliance before something goes wrong",
    dek: "Five fields, recorded once while you can actually see the machine, that make every future repair faster and cheaper.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The worst moment to look for a model number is when the thing has already broken, usually in the dark, usually with a phone torch, usually behind something heavy.",
          "Five fields, written down once while the appliance is working and accessible, remove that moment permanently. It takes about two minutes per item and it is the highest return household admin there is.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The five fields",
        items: [
          "Make and model. The exact model, not the marketing name on the front.",
          "Serial number, where there is one. Warranty claims usually need it.",
          "When it was installed or bought.",
          "When the warranty ends.",
          "When it was last serviced, and by whom.",
        ],
      },
      {
        kind: "table",
        heading: "Where the model number usually hides",
        intro: "The single most common reason people give up on cataloguing a house is not finding this. It is almost always in one of these places.",
        columns: ["Appliance", "Usually found"],
        rows: [
          ["Fridge or freezer", "Inside, on the side wall near the salad drawer, or behind the bottom grille"],
          ["Washing machine", "Around the inside of the door opening, or on the back panel"],
          ["Dishwasher", "On the edge of the door, visible only when the door is open"],
          ["Oven or cooker", "On the frame behind the door, or on a drawer runner underneath"],
          ["Boiler or furnace", "Inside the front cover, often on a sticker facing you when it is opened"],
          ["Water heater", "On the outer casing, usually a large label near the top"],
          ["Air conditioning unit", "On the outdoor condenser, on a plate facing the wall"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the serial number matters more than you expect",
        paragraphs: [
          "A model number tells a supplier which part fits. A serial number tells a manufacturer which production run yours came from, which matters for warranty claims and for recalls.",
          "Recalls are the underrated one. Manufacturers issue them regularly and reach owners through registration, which most people skip. If you have the serial number written down somewhere findable, you can check it against a recall list in a minute.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Photograph the plate rather than transcribing it",
        paragraphs: [
          "Model numbers are long, and they mix letters and digits in ways that are easy to get wrong in bad light. A photograph of the plate takes a second and is always right.",
          "Keep the photograph, but also type the model number somewhere searchable, because a photo buried in three years of camera roll is not findable when you need it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The best moment to do this is a move",
        paragraphs: [
          "Every fact about a house passes through your hands in the two weeks around moving in, and almost none of it gets written down. Meter readings, which utility is with whom, where the stopcock is, what came with the property.",
          "A year later the boiler needs servicing and nobody remembers who installed it. Recording it while it is in front of you takes minutes and saves an afternoon.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base asks for exactly these fields, and asks for the right ones per type of thing rather than the same form for a boiler and a lawnmower. It keeps the service history alongside them, so the next repair starts with facts. It stores what a document is and where you keep it, never the document itself, because no product on Draftpace accepts an upload.",
      },
    ],
  },

  {
    slug: "where-to-look-for-a-will",
    title: "Where to look for a will when you cannot find one",
    dek: "A search order for finding a will, what to do if there genuinely is not one, and why the executor matters before anything else.",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Start with the places people actually keep wills, which are duller than you expect: a home filing box, a bedroom drawer, a safe, or with the attorney or solicitor who drafted it.",
          "Work through the list below in order. Most wills are found in the first three places, and the later entries exist because occasionally they are not.",
        ],
      },
      {
        kind: "timeline",
        heading: "The search order",
        intro: "Work down it rather than across it. Each place is more effort than the one before, and most wills are found in the first two.",
        steps: [
          {
            when: "At home",
            what: "The obvious places: filing box, desk, bedside drawer, safe, or a folder marked with anything official sounding.",
          },
          {
            when: "The lawyer",
            what: "Many firms store the original and issue the family a copy, so a copy at home may mean the original is elsewhere.",
          },
          {
            when: "A safe deposit box",
            what: "If they had one. Access after a death usually requires the death certificate and proof of your authority.",
          },
          {
            when: "A will register",
            what: "Where one exists. Some countries maintain a central record of where wills are lodged.",
          },
          {
            when: "The executor",
            what: "If a family member was named, they may already hold it and not have mentioned it.",
          },
          {
            when: "Their adviser",
            what: "Their accountant or financial adviser, who often knows whether a will exists even if they do not hold it.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Read the executor clause before anything else",
        paragraphs: [
          "When you find it, the first thing to look for is not who inherits. It is who is named as executor, because that person has the legal authority to act and everybody else does not.",
          "If it is not you, several of the things you were about to do are not yours to do. That is usually a relief rather than a slight, and it saves a great deal of duplicated effort. There is more on what that role involves in [being named executor](/guides/named-executor-what-you-agreed-to).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you find more than one",
        paragraphs: [
          "Generally the most recent valid will is the one that counts, and a later will usually revokes earlier ones explicitly. Do not destroy the earlier versions. They can matter if the newest is challenged or turns out to be invalid.",
          "If two wills appear close together in date, or one is unsigned or unwitnessed, that is the point to get advice rather than to decide yourself.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If there genuinely is not one",
        paragraphs: [
          "Then the estate is distributed according to the intestacy rules where they lived, which are fixed and do not care what anybody intended. That often surprises families, because the rules rarely match what people assume, particularly for unmarried partners and stepchildren.",
          "This is also the moment most people realise how much of the picture was never written down anywhere, which is a separate and larger problem covered in [how to find someone's accounts](/guides/how-to-find-someones-accounts-after-they-die).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records where a will is kept, who drafted it, and who is named as executor, so this search never has to happen. It holds the location and the reference, never the document itself. It also produces a printed book, which is the format that actually survives the situation where somebody cannot get into an account.",
      },
    ],
  },

  {
    slug: "named-executor-what-you-agreed-to",
    title: "You have been named executor. Here is what you actually agreed to",
    dek: "What the role involves, how long it really takes, what you are personally liable for, and whether you can say no.",
    publishedAt: "2026-08-30",
    updatedAt: "2026-08-31",
    areaSlug: "affairs-and-endings",
    locale: "us",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Being an executor means you are legally responsible for gathering everything somebody owned, paying what they owed, and distributing the rest according to their will. It is an administrative job with legal weight, and it usually takes many months.",
          "Most people find out they were named at the worst possible moment and have no idea what the role involves. Here is the honest version.",
        ],
      },
      {
        kind: "timeline",
        heading: "What the job actually involves",
        intro: "Six stages, in this order, and you cannot skip to the last one.",
        steps: [
          {
            when: "Find",
            what: "Locate and secure everything: property, accounts, pensions, policies, possessions.",
          },
          {
            when: "Value",
            what: "Value the estate as at the date of death, which often needs professional valuations for property.",
          },
          {
            when: "Apply",
            what: "Petition the probate court in the county where they lived. What it issues is usually called letters testamentary, and it is the document banks will ask to see.",
          },
          {
            when: "Settle",
            what: "Settle debts and taxes before anybody inherits anything.",
          },
          {
            when: "Distribute",
            what: "Distribute what remains according to the will.",
          },
          {
            when: "Account",
            what: "Keep records of all of it, because beneficiaries are entitled to see the accounts.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "How long it really takes",
        paragraphs: [
          "Simple estates commonly take six to twelve months. Anything involving real property, a business, out of state assets or a disagreement between beneficiaries takes considerably longer, and two years is not unusual.",
          "The slow parts are rarely the ones people expect. Waiting for probate, waiting for a property to sell, and waiting for tax clearance take far longer than any of the tasks you actually perform.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part worth taking seriously",
        paragraphs: [
          "Executors can be held personally liable for mistakes. Distributing the estate before debts are settled is the classic one: if a creditor appears afterwards, the shortfall can land on you rather than on the beneficiaries who already spent it.",
          "This is why the order matters, and why you wait out your state creditor claim period before distributing anything. That window is set by state law and commonly runs three to six months from the notice to creditors. Executors of anything complicated usually involve a probate attorney, paid from the estate rather than from their own pocket.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "You can say no",
        paragraphs: [
          "Being named does not oblige you to serve. You can decline, formally, provided you have not already started acting as executor. Once you have begun dealing with the estate, stepping back becomes much harder.",
          "Declining is not a betrayal. Somebody named you years ago, possibly before they had a business or a property abroad, and possibly before your own life got complicated. If you cannot give it the time, saying so at the start is far better than stalling for a year.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to ask for immediately if you are acting",
        items: [
          "Certified copies of the death certificate, more than you think you need.",
          "The original will, not a copy.",
          "Twelve months of bank statements, which is the fastest way to find accounts and policies nobody mentioned.",
          "The most recent federal tax return, which lists income sources you may not know about.",
          "Details of any funeral plan already paid for.",
          "Contact details for their accountant, attorney or financial adviser.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion exists so the person you would name never leaves you doing the search half of this job. It records what exists, where it is kept, and who should be told, and prints as a book somebody could follow. If you are currently executing an estate and finding out how little was written down, that is the argument for doing it for your own.",
      },
    ],
  },

  {    slug: "named-executor-what-you-agreed-to-uk",
    title: "Named as executor in the UK: what you actually agreed to",
    dek: "What the role involves, how long it really takes, what you are personally liable for, and whether you can say no.",
    publishedAt: "2026-08-30",
    updatedAt: "2026-08-31",
    areaSlug: "affairs-and-endings",
    locale: "uk",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Being an executor means you are legally responsible for gathering everything somebody owned, paying what they owed, and distributing the rest according to their will. It is an administrative job with legal weight, and it usually takes many months.",
          "Most people find out they were named at the worst possible moment and have no idea what the role involves. Here is the honest version.",
        ],
      },
      {
        kind: "timeline",
        heading: "What the job actually involves",
        intro: "Six stages, in this order, and you cannot skip to the last one.",
        steps: [
          {
            when: "Find",
            what: "Locate and secure everything: property, accounts, pensions, policies, possessions.",
          },
          {
            when: "Value",
            what: "Value the estate as at the date of death, which often needs professional valuations for property.",
          },
          {
            when: "Apply",
            what: "Apply for the grant of probate, or confirmation in Scotland, which is the legal authority to act.",
          },
          {
            when: "Settle",
            what: "Settle debts and taxes before anybody inherits anything.",
          },
          {
            when: "Distribute",
            what: "Distribute what remains according to the will.",
          },
          {
            when: "Account",
            what: "Keep records of all of it, because beneficiaries are entitled to see the accounts.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "How long it really takes",
        paragraphs: [
          "Simple estates commonly take six to twelve months. Anything involving property, a business, overseas assets or a disagreement between beneficiaries takes considerably longer, and two years is not unusual.",
          "The slow parts are rarely the ones people expect. Waiting for probate, waiting for a property to sell, and waiting for tax clearance take far longer than any of the tasks you actually perform.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part worth taking seriously",
        paragraphs: [
          "Executors can be held personally liable for mistakes. Distributing the estate before debts are settled is the classic one: if a creditor appears afterwards, the shortfall can land on you rather than on the beneficiaries who already spent it.",
          "This is why the order matters, and why the standard advice is to wait out the statutory creditor notice period before distributing anything. It is also why executors of anything complicated usually involve a solicitor, paid from the estate rather than from their own pocket. Placing a statutory advertisement under section 27 of the Trustee Act is the standard protection against unknown creditors.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "You can say no",
        paragraphs: [
          "Being named does not oblige you to serve. You can decline, formally, provided you have not already started acting as executor. Once you have begun dealing with the estate, stepping back becomes much harder.",
          "Declining is not a betrayal. Somebody named you years ago, possibly before they had a business or a property abroad, and possibly before your own life got complicated. If you cannot give it the time, saying so at the start is far better than stalling for a year.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to ask for immediately if you are acting",
        items: [
          "Certified copies of the death certificate, more than you think you need.",
          "The original will, not a copy.",
          "Twelve months of bank statements, which is the fastest way to find accounts and policies nobody mentioned.",
          "Details of any funeral plan already paid for.",
          "Contact details for their accountant, solicitor or adviser.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion exists so the person you would name never leaves you doing the search half of this job. It records what exists, where it is kept, and who should be told, and prints as a book somebody could follow. If you are currently executing an estate and finding out how little was written down, that is the argument for doing it for your own.",
      },
    ],
  },

  {
    slug: "the-if-something-happens-to-me-file",
    title: "The \"if something happens to me\" file, and what goes in it",
    dek: "What to leave behind so nobody has to reconstruct your life from the outside, and why it is not the same thing as a will.",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A will says who gets what. It does not say which bank, which pension, where the deeds are, who your accountant is, or that there is a policy nobody knows about.",
          "That gap is what leaves families searching for months. The fix is a plain record of what exists and where it is kept, which takes a couple of evenings and is entirely separate from any legal document.",
          "A large share of adults have no estate documents at all. If that is you, this file is a far better place to start than a will, because it is useful immediately and requires nobody's signature.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What goes in it",
        intro: "Locations and references, not the documents themselves. This is a map, not a vault.",
        items: [
          "Where the will is, who drafted it, and who is named executor.",
          "Every bank, credit union and building society, with which accounts are where. Not passwords.",
          "Pensions, including old ones from former employers, which are the most commonly lost.",
          "Insurance policies: life, home, car, health, and anything bought through an employer.",
          "Property: where the deeds are, mortgage lender, and any leasehold details.",
          "Debts, including anything guaranteed for somebody else.",
          "Digital: which email is the recovery address for everything, and where the password manager is, without the master password.",
          "People: accountant, lawyer, adviser, and anybody who should be told.",
          "Anything that would surprise somebody, which is the most valuable line in the whole file.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What must not go in it",
        paragraphs: [
          "Passwords, PINs and full account numbers do not belong here, because this document is deliberately findable and that is the whole point of it.",
          "Record where the password manager is and who has recovery access, and stop there. A file that is safe to leave in a drawer is worth far more than a perfect one locked somewhere nobody can reach.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to keep it, and who should know",
        paragraphs: [
          "At least two people should know it exists and where it is. A perfect record nobody can find is the same as no record, and this happens more often than you would think.",
          "Paper is genuinely better here than a file on a laptop, because the laptop needs a password, the password is in the password manager, and the password manager is the thing they cannot get into.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do it in passes, not in one sitting",
        paragraphs: [
          "The reason this never gets done is that people treat it as a single overwhelming project. It is not. Bank accounts on one evening, pensions another, digital on a third.",
          "Any one of those passes on its own makes things meaningfully easier for whoever comes after. There is no version of this where a partial file is worthless.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "This file is what Personal Life Affairs Companion produces. It sequences the job so it has a beginning instead of being a folder of blank forms, works out which parts are even relevant to you, and prints a book somebody could follow. It records where things are kept and never the things themselves, because it cannot accept an upload at all.",
      },
    ],
  },

  {
    slug: "hotel-cannot-find-your-reservation",
    title: "The hotel cannot find your reservation. What to say",
    dek: "What to have open before you reach the desk, why the booking is usually there under something else, and how to keep the conversation short.",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Nine times out of ten the reservation exists and is filed under something you did not expect: a different surname, the name of whoever paid, a third party booking site's own reference rather than the hotel's, or a slightly different spelling.",
          "So the goal at the desk is not to argue. It is to give them enough different ways to look it up that one of them works.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Have these open before you speak",
        intro: "On screen, not in an inbox you are still searching while somebody waits.",
        items: [
          "The confirmation reference, and separately the booking site's reference if you booked through one.",
          "The exact name it was booked under, which may not be yours.",
          "The dates, and the card used to pay.",
          "The confirmation email itself, which is the thing that ends most disputes.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "An opening that works",
        paragraphs: [
          "Something plain does the job: hello, I have a reservation with you and you are not able to find it. Can I give you a few ways to look it up.",
          "That sentence does two useful things. It states the problem without accusing anybody, and it moves straight to the thing that actually resolves it, which is alternative search terms. Change any of it. The point is having a first sentence at all, so the opening is not the hardest part.",
        ],
      },
      {
        kind: "list",
        heading: "Ways to ask them to search",
        intro: "Offer these one at a time. Front desk systems search differently from how you would expect.",
        ordered: true,
        items: [
          "The hotel's own confirmation number.",
          "The third party booking reference, which is often a completely different format.",
          "The surname of whoever paid, rather than whoever is staying.",
          "The card's last four digits.",
          "The dates alone, which often surfaces it when a name is misspelled.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If it genuinely is not there",
        paragraphs: [
          "Show the confirmation email, and ask what they can do tonight rather than what went wrong. The cause matters tomorrow. Where you sleep matters now.",
          "If they are full, ask them to find you a room at a comparable hotel, which is standard practice when a booking cannot be honoured. Get the name of who you spoke to and a reference before you leave the desk, because whoever you deal with next will not know any of this.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Then check what else this affects",
        paragraphs: [
          "If your stay moves, anything you booked around it may need a look. A dinner reservation, a transfer to the airport, a tour with a pickup at the hotel.",
          "This is the part that catches people the next morning rather than that night, and it is covered properly in [working out what else your trip depends on](/guides/what-else-your-trip-depends-on-when-something-changes).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion keeps every reference, provider and booking name in one place, so this conversation starts with facts rather than a search through six inboxes. It walks you through the exchange itself, including an opening line you can edit or replace, and it never tells you what to accept or settle for. Afterwards it shows you what else that change touched.",
      },
    ],
  },

  {
    slug: "what-goes-in-a-homeschool-portfolio",
    title: "What actually goes in a homeschool portfolio",
    dek: "What to include, what evaluators are really looking for, and how to build it through the year instead of in a panic in April.",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A portfolio is a record that your child was educated. It is not a scrapbook of best work, and it is not a performance. Evaluators are generally checking that something coherent happened across the year, not judging whether it was excellent.",
          "Six jurisdictions make portfolios mandatory: Pennsylvania, Maryland, Ohio, South Carolina, Florida and the District of Columbia. Requirements differ, so check yours in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state) and with your state association.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The core contents",
        intro: "Most requirements are satisfied by these five things.",
        items: [
          "A log of educational activities, with reading materials named by title.",
          "Samples of work across the year, dated, from several points rather than one good week.",
          "A list of subjects covered and the materials or curriculum used.",
          "Attendance or days schooled, where your state counts them.",
          "Test results or an evaluator's written report, where required.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Include ordinary work, not only the best",
        paragraphs: [
          "The instinct is to include only the pieces you are proud of. Resist it. A portfolio of nothing but finished, perfect work tells an evaluator very little, and can even read as curated rather than representative.",
          "Include something from October and something from March on the same subject. Progress across a year is the single most persuasive thing a portfolio can show, and it is invisible if everything came from the same two weeks.",
        ],
      },
      {
        kind: "table",
        heading: "What to keep per subject",
        intro: "A rough guide. Adjust to what your state asks for.",
        columns: ["Subject", "Worth keeping", "How often"],
        rows: [
          ["Maths", "Worked problems showing method, not just answers", "A few pieces per term"],
          ["Writing", "A first draft and the final version of the same piece", "Two or three per year"],
          ["Reading", "A running list of books, finished and abandoned", "Ongoing"],
          ["Science", "Photographs of experiments, plus what was concluded", "Per topic"],
          ["History and humanities", "Anything with a date and an argument in it", "Per topic"],
          ["Art and practical", "Photographs, since the work itself rarely fits in a folder", "As produced"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Abandoned books belong on the reading list",
        paragraphs: [
          "A reading log that only contains finished books is a less honest record and, oddly, a less impressive one. A child who is allowed to stop reading something is a child who keeps starting things.",
          "Note what was abandoned and roughly why. It shows judgement developing, which is a more interesting thing to evidence than volume.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Build it as you go, or it will not exist",
        paragraphs: [
          "The failure mode is universal: nothing is kept until spring, and then a weekend disappears into reconstructing a year from undated worksheets and memory.",
          "A folder per child and a habit of dropping things in as they happen is enough. It does not need a system. It needs to take under a minute so it survives a bad week.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion keeps the log as you go and prints a record per child when you need one. It accepts backdated entries, because nobody logs every day on the day. It also includes short checks you can run at home to find out honestly whether something stuck, with four possible answers including not enough to say, which is the honest result more often than most tools admit.",
      },
    ],
  },

  {
    slug: "why-to-do-lists-make-it-worse",
    title: "Why to-do lists make things worse, and what helps instead",
    dek: "A list is a memory aid. The problem was never memory. Here is what the difficulty actually is and what works better.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The premise of a to-do list is that the hard part is remembering. For a great many people that is exactly backwards. The thing has been remembered constantly, at volume, for three weeks. Writing it down again adds nothing.",
          "What a list does add is a visible tally of everything not yet done, sorted by nothing, all equally urgent looking. So the tool intended to reduce the load becomes a daily reminder of the size of it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Three ways lists make it harder",
        paragraphs: [
          "First, they flatten. A two minute email and a four hour form appear as identical rows, so choosing between them costs energy every single time you look.",
          "Second, they accumulate. Anything genuinely difficult stays on the list while easier items pass through it, so over time the list becomes a concentrated record of what you have avoided.",
          "Third, they say nothing about starting. A row reading chase the refund tells you what the outcome should be and gives you no idea what the first physical action is, which is the only part that was ever difficult.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What actually helps",
        intro: "Tick whichever your current setup already does. The ones you cannot tick are usually where it keeps failing you.",
        items: [
          "Show one thing, not everything. Almost nobody needs the full list at nine in the morning.",
          "Write the next physical action, as a verb. Call the number on the letter. Not chase the refund.",
          "Attach a real date, or none at all. Everything being due today means nothing is.",
          "Hold the context. What it is about, what you want, the two facts you will need, all visible while you do it.",
          "Let quiet be an answer. Some days genuinely need nothing from you, and a tool that cannot say so will invent work.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The streak is the worst part",
        paragraphs: [
          "Completion percentages, streaks and productivity scores all rest on the same assumption: that you will do more if you can see how much you are failing.",
          "For anybody already carrying a background hum of being behind, this is precisely wrong. It converts a neutral pile of admin into a running record of personal failure, and the reliable outcome is that the app gets deleted, along with the only record of what actually needed doing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The real question is not what, it is how to start",
        paragraphs: [
          "For most stuck tasks you already know exactly what needs doing. What you cannot do is hold the purpose, the outcome, and the details all at once while a stranger talks at you.",
          "Which is a working memory problem rather than a motivation problem, and it responds to having those things written down in front of you, not to being reminded again. That is worked through properly in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion shows what deserves attention now, derived from dates you set yourself, and says plainly when nothing does. It walks you through the things that are hardest to start, holding the context on screen. There is no streak, no completion percentage, and no counter of what you did not get to. Something you close halfway records nothing at all.",
      },
    ],
  },

  {
    slug: "why-your-available-balance-is-lying-to-you",
    title: "Why your available balance is lying to you",
    dek: "What banks mean by available, what they leave out, and why the number in the app is almost never the number you can spend.",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Available balance in a banking app is a technical term. It means cleared funds, plus any overdraft you have, minus transactions that have already settled. It does not mean money that is free for you to use.",
          "The gap between those two ideas is where most unexpected shortfalls live, and it is entirely predictable once you know what the number leaves out.",
        ],
      },
      {
        kind: "compare",
        heading: "What the number does and does not know",
        left: {
          label: "Your bank knows",
          items: [
            "Money that has left the account.",
            "Payments that have settled.",
            "Your arranged overdraft, added in.",
            "Standing orders it can see scheduled.",
            "The balance right now.",
          ],
        },
        right: {
          label: "Your bank does not know",
          items: [
            "That your car insurance renews on the eighteenth.",
            "That four hundred of this is set aside for tax.",
            "That you agreed to cover a shared bill this month.",
            "Annual subscriptions that will not appear for months.",
            "That a pending card payment has not landed yet.",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "The overdraft problem",
        paragraphs: [
          "Many banks include an arranged overdraft inside the available figure. That means the number can be several hundred higher than the money you actually have, and nothing on screen distinguishes the two.",
          "It is worth finding out once whether yours does this. It changes how you should read every balance you have looked at for years.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Pending transactions cut both ways",
        paragraphs: [
          "A card payment can sit pending for days. Some banks subtract it from available immediately, some do not, and hotel or car hire pre-authorisations can hold amounts far larger than the final charge.",
          "So the balance can be pessimistic and optimistic at once: reserving money that will be released, while ignoring a direct debit due on Friday.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The number worth having instead",
        paragraphs: [
          "What you actually want is balance, minus protected money, minus everything committed before your next payday. That is usually a lot smaller than the app's figure, and it is the only one you can spend against without a background hum of worry.",
          "The method for working it out is in [how much of your money is actually safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A good figure admits when it is unsure",
        paragraphs: [
          "If a bill has no due date recorded, any figure built on it is provisional, and you should be told that rather than shown a confident number resting on a guess.",
          "This is the difference between a tool you can act on and a tool you check and then second guess. Being told a figure is preliminary because two bills are missing dates is far more useful than having the uncertainty quietly rounded away.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion works out what is genuinely available by subtracting protected accounts and upcoming obligations from your real balances, then shows the line by line explanation of how it got there. When a bill is missing a due date it says the figure is preliminary rather than pretending otherwise. Monthly Money Reset does a simpler version of the same thing, free, if you want to start there.",
      },
    ],
  },

  {
    slug: "why-budgeting-apps-stop-working-after-two-months",
    title: "Why budgeting apps stop working after about two months",
    dek: "Eighty one percent of people abandon their financial goals. The reason is usually the tool's design, not the person using it.",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most people who set a financial goal do not stick to it. That number is usually presented as a discipline problem. It is mostly a design problem.",
          "Almost every budgeting tool requires continuous manual upkeep to stay accurate. Miss a week of categorising and the figures on screen are wrong. Once they are wrong you stop trusting them, and once you stop trusting them the app is decoration.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The maintenance burden is the whole problem",
        paragraphs: [
          "The setup is genuinely enjoyable. Categories, budgets per category, a clean dashboard. That is the part that gets designed carefully, because it is what people see when deciding to sign up.",
          "Week six is not designed for at all. Week six is two weeks of uncategorised transactions, three splits you never finished, and a dashboard confidently reporting a number you know is nonsense. Nothing in the product acknowledges that this is the normal state of things.",
        ],
      },
      {
        kind: "list",
        heading: "Four ways they break",
        ordered: true,
        items: [
          "They require categorising every transaction, which is a chore with no visible reward.",
          "They treat a missed week as a data problem for you to repair rather than a normal thing that happens.",
          "They present precise figures built on incomplete data, without ever saying so.",
          "They add streaks and scores, so falling behind becomes a judgement rather than a gap.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Rigid budgets fail for a separate reason",
        paragraphs: [
          "Envelope style budgets assume a stable month. Most months are not stable, and one unexpected cost breaks several categories at once. Repairing that takes more effort than the budget was saving.",
          "Most people who budget are doing it to make sure the essentials are covered, nothing more ambitious than that. That is a much smaller question than a full category system, and it can be answered with far less upkeep.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What survives past month two",
        intro: "Tick the ones the app you are using actually does. Anything left unticked is a reason it will be deleted by March.",
        items: [
          "Answers one question well rather than modelling everything.",
          "Stays roughly right with very little input.",
          "Says plainly when its own figure is incomplete.",
          "Has no streak, no score, and no way to be behind.",
          "Is still useful the week you ignore it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ask what happens when you stop paying attention",
        paragraphs: [
          "Whatever you use, this is the question worth asking before you invest a weekend in setup. Some tools degrade gracefully and are still broadly correct after a neglected two weeks. Others become actively misleading and then demand an hour of repair before they are any use again.",
          "Only the first kind is still installed a year later.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Monthly Money Reset answers one question, what is safe to spend this month, and is free. Personal Finance Companion holds the whole picture and tells you when its own figure is preliminary rather than presenting a confident number built on a gap. Neither contains a streak, a score, or a screen that tells you that you are behind, because that is the mechanism that gets these things deleted.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 3
  // The remaining tier one topics plus the strongest tier two. The two
  // cross-cutting pieces, life admin and why productivity tools fail at
  // it, are deliberately not here: they belong to the whole series
  // rather than to one area, which the Guide model cannot express yet
  // without calling them orphans, and an orphan means no product rather
  // than every product. That is a small model change to make on purpose
  // rather than to bodge around now.

  {
    slug: "the-task-that-has-been-on-your-mind-for-a-month",
    title: "The task has been on your mind for a month and still is not done",
    dek: "Why constant remembering does not turn into doing, and the specific thing that makes a stuck task start moving.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "You have not forgotten it. That is the confusing part. It arrives at eleven at night, in the shower, in the middle of something else, and it has been doing that for weeks.",
          "So the problem is not memory, and every tool built on the assumption that it is memory has failed you. Writing it down again does nothing, because it was never off the list.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The gap is between knowing and starting",
        paragraphs: [
          "Starting almost anything administrative requires holding several things at once: what this is about, what you want to happen, the two facts you will need, and enough spare capacity to think while somebody talks at you.",
          "That is a working memory load, and it is heaviest at exactly the moments you tend to attempt these things, which is late, tired, and already carrying the day. The task is not hard. Assembling the conditions to begin it is.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The two questions that unstick most things",
        items: [
          "What is the next physical action? Not the outcome. Call the number on the letter, find the reference in the email, open the form. If you cannot name a physical action, that is why it has not moved.",
          "What would have to be in front of me to do that? Usually a reference number, a date, and a decision about what you want. Get those into one place and the task shrinks to something you can actually attempt.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The thing gets heavier the longer it sits, but not for the reason you think",
        paragraphs: [
          "The task itself does not change. What changes is that it acquires a story: that you have avoided it for a month, that this says something about you, that starting now means admitting to the delay.",
          "That accumulated weight is not part of the job. It is worth naming, because it is usually the larger of the two things stopping you, and it is the one that disappears the moment you do anything at all.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Aim for a smaller thing than finishing",
        paragraphs: [
          "Finding the reference number is progress. Getting through the opening sentence of a call is progress. Neither finishes anything and both remove the part that was actually blocking you.",
          "If the thing is a call you have been dreading specifically, the preparation that helps is set out in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built for this gap rather than for remembering. You put the thing down once, it brings it back when it actually matters, and when you are ready it walks you through it, holding the purpose and the outcome on screen so you are not carrying them. Nothing in it counts how long something sat.",
      },
    ],
  },

  {
    slug: "task-paralysis-what-to-do-in-the-next-ten-minutes",
    title: "Task paralysis: what to do in the next ten minutes",
    dek: "When you cannot start anything at all, the useful move is smaller than a plan. A short way out that does not require motivation.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Task paralysis is the state where you know exactly what needs doing, you have time to do it, and you cannot begin any of it. It is not the same as procrastination, because there is no pleasant alternative you are choosing instead. You are frozen between options, usually doing nothing you enjoy either.",
          "The way out is not a better plan. Planning is more deciding, and deciding is the thing that has jammed. What helps is making the next action so small that it does not require a decision.",
        ],
      },
      {
        kind: "timeline",
        heading: "The next ten minutes",
        steps: [
          {
            when: "Choose",
            what: "Pick anything, badly. Which task you choose matters far less than choosing one. Two roughly equal options usually are roughly equal.",
          },
          {
            when: "Cut it down",
            what: "Cut it until it is almost insultingly small. Not do the taxes. Open the folder. Not call the landlord. Find the number.",
          },
          {
            when: "Do only that",
            what: "If momentum arrives, use it. If it does not, you have still moved.",
          },
          {
            when: "Before you stop",
            what: "Write down where you stopped, in one line, so returning does not mean reconstructing.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why choosing is the hard part",
        paragraphs: [
          "When several things are all somewhat urgent and none has an obvious first step, every one of them costs energy to evaluate. Look at a list of nine of those and you can spend twenty minutes deciding and finish with nothing done and less capacity than you started with.",
          "This is why a long list makes paralysis worse rather than better. The fix is to look at one thing, not to see everything more clearly.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Lower the bar rather than raising the pressure",
        paragraphs: [
          "The instinct is to increase stakes: promise yourself a deadline, imagine the consequences. That reliably raises the wall rather than lowering it, because the problem was never that you did not care enough.",
          "Making the first action smaller works. Making the consequences larger does not, and usually adds dread to a task that already had plenty.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If nothing moves today",
        paragraphs: [
          "Then nothing moved today, and the tasks are exactly where they were, indifferent to it. What matters is that tomorrow does not start from zero, which is entirely about whether you left yourself a note about where you stopped.",
          "More on that in [picking something back up after abandoning it](/guides/picking-something-back-up-after-abandoning-it).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion has a procedure for exactly this, for when something is too big to start. It breaks a thing down into a first action you can actually do, and shows one thing at a time rather than a list to evaluate. If you get partway and stop, it records nothing at all about the attempt.",
      },
    ],
  },

  {
    slug: "just-bought-a-house-what-to-record-in-week-one",
    title: "You just bought a house. What to record in the first week",
    dek: "Everything about a home passes through your hands once, during the move. Here is what to capture before it disappears.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is a short window, roughly the two weeks around moving in, when every fact about a house is either in front of you or one phone call away. The previous owner is still reachable. The surveyor's report is still open on your laptop. The boiler manual is still in a drawer rather than lost.",
          "After that window, each of those facts costs an afternoon to recover, and some are gone permanently. This is the highest return hour of admin in the whole process.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Day one, before anything else",
        intro: "These are time sensitive in a way the rest are not.",
        items: [
          "Meter readings for gas, electricity and water, photographed with the date visible.",
          "Where the stopcock, fuse box, thermostat and gas shut off are. Find them now, not during an emergency.",
          "Which utility supplier is on each service, and the account number if there is paperwork.",
          "Whether the alarm has a code, and who holds it.",
          "Test every smoke and carbon monoxide alarm, and note when the units expire.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Week one, while it is still accessible",
        items: [
          "Make, model and serial for the boiler, water heater, and every appliance that came with the house.",
          "When the boiler was last serviced, which is usually in a logbook near it or on a sticker.",
          "The age of the roof, windows and any major system, from the survey or the previous owner.",
          "Warranty end dates for anything recent, especially appliances left behind.",
          "Any tradesperson the previous owner recommends. This is worth more than it sounds and expires the moment you lose contact.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Read the survey once more, as a to-do list",
        paragraphs: [
          "The survey was read as a buying decision. Read it again now as a maintenance plan, because it is the only document that has systematically inspected the house and it usually names things that are fine now and will not be in three years.",
          "Pull out anything with a timescale attached and give it a date. That is a maintenance schedule somebody else already did the hard part of.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The insurance detail people miss",
        paragraphs: [
          "If the property will be empty for a stretch between completion and moving in, check what your policy says about unoccupancy. Many lapse or reduce cover after thirty days empty, and the period around a move is exactly when that bites.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What this saves you later",
        paragraphs: [
          "A year on, the boiler needs servicing and you know when it was last done and by whom. Something fails under warranty and you have the serial number. An engineer asks how old the system is and you have an answer.",
          "Which fields matter for each kind of thing, and where model plates hide, is covered in [what to record about an appliance](/guides/what-to-record-about-an-appliance-before-you-need-it).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base is built for exactly this capture, and asks for the right fields per type of thing rather than one form for a boiler and a lawnmower. It then works out what needs doing and when, from real service intervals, and stays quiet about the rest. You can import a list rather than typing everything in.",
      },
    ],
  },

  {
    slug: "seasonal-home-maintenance-without-the-pointless-jobs",
    title: "Seasonal home maintenance, minus the jobs that do not matter",
    dek: "A shorter seasonal list than most, built around what actually causes damage, and why generic reminders get ignored.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most seasonal checklists are padded. They read well, they run to forty items, and by item twelve most people have stopped. A shorter list that gets done beats a complete one that does not.",
          "What follows is the subset where timing genuinely matters, meaning the job belongs to a season rather than to a rolling interval, and skipping it in that season causes a real problem.",
        ],
      },
      {
        kind: "table",
        heading: "The jobs that actually belong to a season",
        columns: ["Season", "Job", "Why now specifically"],
        rows: [
          ["Before first freeze", "Shut off and drain outdoor taps, disconnect hoses", "A burst pipe inside a wall is the most expensive item on any home list"],
          ["Before first freeze", "Blow out or drain irrigation", "Water left in lines splits them, and you find out in spring"],
          ["Autumn", "Clear gutters after leaf fall", "Doing it before the leaves drop achieves very little"],
          ["Autumn", "Service heating", "Engineers are available in October and booked solid in January"],
          ["Autumn", "Check draughts and seals", "Cheapest possible efficiency work, and only findable when it is cold outside"],
          ["Spring", "Service air conditioning", "Same reason as heating, in reverse"],
          ["Spring", "Inspect roof and flashing", "After winter has done its worst, before summer storms"],
          ["Spring", "Clear gutters again", "Winter debris, plus whatever autumn missed"],
          ["Summer", "Exterior timber, paint, fencing", "The only window with reliably dry weather"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Everything else is an interval, not a season",
        paragraphs: [
          "Boiler servicing, water heater flushing, filter changes, grout and sealant, alarm testing. None of these care what month it is. They care how long since the last time.",
          "Treating them as seasonal is what produces the checklist telling you to flush a water heater every spring when it was done in November. Their real intervals are in [how often things actually need servicing](/guides/how-often-home-systems-need-servicing).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why generic reminders get ignored",
        paragraphs: [
          "Any system that tells you to winterise in July has told you something useless, and after two or three useless prompts people stop reading all of them, including the ones that mattered.",
          "The credibility of a reminder is the whole product. One well timed prompt a month beats twenty generic ones, and the difference is entirely whether the tool understands that a third of outdoor work belongs to a month rather than a countdown.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to skip without guilt",
        paragraphs: [
          "Most of the padding on published seasonal lists is either cosmetic, or so infrequent that treating it as annual is silly. Deep cleaning a dryer vent matters. Rearranging a garage does not, whatever the list says.",
          "If a job has no plausible failure attached to skipping it, it is a preference rather than maintenance, and it does not belong on the same list as the ones that flood a kitchen.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base already knows which jobs belong to a month and which belong to an interval, and works out what is worth doing now from when you last did it rather than from when you happened to add it. Each job carries a rating for what happens if you skip it, so a short list stays short and honest.",
      },
    ],
  },

  {
    slug: "beneficiary-forms-override-your-will",
    title: "Your beneficiary forms quietly override your will",
    dek: "Pensions and life insurance usually pass by nomination, not by will. The form you filled in on your first day at an old job may still decide who gets it.",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most people assume a will decides everything. For a large share of what they own, it does not.",
          "Pensions, life insurance, and various other accounts pass to whoever is named on the plan's own beneficiary nomination. That nomination usually sits outside the estate entirely, which means the will never gets a say, no matter how recently it was written or how clearly it says otherwise.",
          "This is the single most common way somebody's intentions quietly fail to happen.",
        ],
      },
      {
        kind: "table",
        heading: "What passes how",
        intro: "Generalised, and details vary by country and provider, but the shape holds almost everywhere.",
        columns: ["Asset", "Usually passes by", "Does the will control it"],
        rows: [
          ["Workplace or private pension", "Beneficiary nomination, often at trustee discretion", "Usually not"],
          ["Life insurance policy", "Named beneficiary on the policy", "Usually not"],
          ["Jointly owned property", "Survivorship, depending on how it is held", "Often not"],
          ["Joint bank account", "Survivorship", "Usually not"],
          ["Sole bank accounts and possessions", "The estate", "Yes"],
          ["Anything held in trust", "The trust's own terms", "No"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why this goes wrong so often",
        paragraphs: [
          "Beneficiary forms are filled in once, usually during onboarding at a job, and then never looked at again. People marry, separate, have children and change jobs, and the form stays exactly as it was.",
          "The result is entirely predictable and still surprises everybody: a pension from a job somebody left fifteen years ago still names an ex-partner, or a parent who has since died, or nobody at all.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If the nomination is blank or out of date",
        paragraphs: [
          "A blank nomination usually means the provider decides, often using its own rules or trustee discretion, and the outcome may not be what anybody expected.",
          "Naming somebody who has died can push the money into the estate, which sounds fine until you remember that estates can be slower, may face different tax treatment, and are exposed to creditors in ways a direct nomination is not.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to actually do",
        intro: "This is a short afternoon of work and it is close to the highest value hour in personal admin.",
        items: [
          "List every pension you have ever had, including from old employers. Most people underestimate this number.",
          "List every life insurance policy, including any provided through work.",
          "Ask each provider who is currently nominated. They will tell you.",
          "Update anything that is wrong, blank, or names somebody who has died.",
          "Write down where each nomination sits, so the next review takes ten minutes rather than an afternoon.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Then check it again after anything changes",
        paragraphs: [
          "Marriage, separation, a new child, a new job, a death in the family. Each of those is a moment when a nomination may now say the wrong thing, and none of them updates anything automatically.",
          "Nothing here is legal advice, and the rules genuinely differ by country and by scheme. What is universal is that you should know what your forms currently say, and most people do not.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records every pension and policy you have, where each one sits, and who is currently nominated on it, so the answer is somewhere findable rather than in a form you last saw in 2011. It records what exists and where it is kept, never the documents themselves, and it does not give advice on what any nomination should say.",
      },
    ],
  },

  {
    slug: "homeschool-records-when-you-have-kept-nothing-since-october",
    title: "It is March and you have recorded nothing since October",
    dek: "How to reconstruct a homeschool year honestly, what is genuinely recoverable, and how to make the rest of the year different.",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "This happens to most homeschooling families at least once, and almost nobody writes about it, because published advice is aimed at the version of you who kept up.",
          "The good news is that more is recoverable than it feels like right now. The rest of it you can be honest about, which is a genuinely acceptable outcome.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What is actually recoverable",
        intro: "Work through these in order. Most families recover a usable picture of the year in an afternoon.",
        items: [
          "The physical work. Undated worksheets still tell you what was covered, and page numbers in a workbook tell you roughly how far you got.",
          "Where you are in each curriculum right now. Working backwards from your current position reconstructs the term with reasonable accuracy.",
          "Library records and reading history, which give you dated reading material without any effort.",
          "Photographs on your phone, which are dated, and which capture projects, trips and experiments better than any log would.",
          "Purchases. Receipts for books and materials date when a topic started.",
          "Your calendar, for co-op sessions, classes, trips and anything with a time attached.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Reconstruct honestly, do not invent",
        paragraphs: [
          "Write approximate dates as approximate. October to December, rather than a made up Tuesday. A record that says roughly when something happened is credible. A record with invented precision is not, and if anybody ever checks, the precision is what damages you.",
          "Evaluators and reviewers are, in general, looking for evidence that education happened. They are not forensic auditors, and a clearly reconstructed term marked as reconstructed is a normal thing to receive.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check what your state actually requires first",
        paragraphs: [
          "Before spending a weekend on this, find out what you genuinely need. Several states require nothing at all, in which case this is for your own use and can be as rough as you like.",
          "If you are in one of the six that mandate a portfolio, the requirements are specific and worth reading properly. Both are covered in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why it stopped in October",
        paragraphs: [
          "It is worth knowing, because otherwise it happens again in the second week of next term. Almost always the system was too heavy: a spreadsheet with nine columns, or a plan to write a paragraph a day about each child.",
          "Anything that takes more than about a minute does not survive a bad week, and every year contains several bad weeks. The version that lasts records three things: the date, the subject and roughly what part of it, and one word about how it went.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not backfill the whole year before restarting",
        paragraphs: [
          "The common failure now is deciding to reconstruct everything perfectly before recording anything new, and then doing neither.",
          "Start recording today, and reconstruct backwards in odd half hours. Today onwards is the part you can be accurate about, and it is the part that stops this happening again.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion accepts backdated entries, because nobody logs every day on the day, and it is built so that recording a day takes well under a minute. It has no completion percentage and no screen that tells you how many days you missed, which is the feature that makes people abandon record keeping in the first place.",
      },
    ],
  },

  {
    slug: "how-to-tell-whether-something-actually-stuck",
    title: "How to tell whether something actually stuck",
    dek: "Covering a topic and learning it are different. A low effort way to find out which happened, without turning your house into a school.",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "You covered fractions in October. It is March. Do they know fractions? Most homeschooling parents genuinely cannot answer that, and the not knowing is more uncomfortable than any actual gap would be.",
          "Finding out does not require testing in the formal sense. It requires asking a small number of questions, some time after the teaching, and being willing to accept the answer.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ask later, not at the end of the lesson",
        paragraphs: [
          "Checking understanding immediately after teaching measures short term recall, which is nearly always good and tells you very little. The useful check happens weeks later, when whatever was going to fade has faded.",
          "This feels counterintuitive, because a check straight after a lesson produces flattering results. That is exactly why it is not worth running.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What a useful check looks like",
        items: [
          "Short. Six to eight questions is plenty, and more produces fatigue rather than information.",
          "Mixed. Some recall, some application, and at least one that asks them to explain rather than to produce an answer.",
          "Unannounced in tone. Not a test event, just a few questions over breakfast.",
          "Written down. What you learn is worth nothing in three weeks if you did not record it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Four honest results, not two",
        paragraphs: [
          "The temptation is to conclude either that they know it or they do not. There are really four outcomes, and the fourth is the one most systems refuse to report.",
          "It looked solid, so move on. It is worth another look, so revisit it. It is mixed, which usually means more practice rather than reteaching. Or there is not enough to say, because they answered two questions and you cannot conclude anything from two.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Not enough to say is a real answer",
        paragraphs: [
          "If a child answers three questions and gets two right, that is not sixty seven percent understanding. It is a sample too small to mean anything, and reporting it as a score invents confidence that does not exist.",
          "Any tool that turns three answers into a percentage is lying to you politely. The honest response is that you do not know yet, which is genuinely useful information because it tells you to ask again rather than to act.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The questions that ask them to explain matter most",
        paragraphs: [
          "A child can produce a correct number without understanding anything, particularly in maths, where a memorised procedure gets the right answer for a while and then collapses.",
          "The questions worth including are the ones where they have to say why. There is no single right wording for those, which is exactly why no answer key can mark them and why you are the only person who can judge it.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion includes short checks you can run at home, and reports one of four standings including not enough to say when too few questions were answered to conclude anything. It records the result against the topic so you can see it again later, and it never produces a score, a percentage or a comparison between children.",
      },
    ],
  },

  {
    slug: "organising-a-multi-stop-trip-without-a-spreadsheet",
    title: "Organising a multi-stop trip without a spreadsheet",
    dek: "Six in ten people spend over ten hours planning one trip. Most of that is spent rebuilding a picture that keeps falling apart.",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Planning one trip routinely runs to ten hours or more, and a good share of that time produces something the traveller is not happy with anyway. The hours do not mostly go into deciding where to go. They go into rebuilding the shape of the trip every time one detail changes.",
          "A spreadsheet is the usual answer and it half works. It holds the facts and knows nothing about how they relate, so when the flight moves it tells you nothing about what else just became wrong.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Record these four things per booking",
        intro: "This is the whole method. Everything else is detail.",
        items: [
          "What it is, with its provider and confirmation reference.",
          "When it starts, and when it ends if it spans time, such as a stay or a car hire.",
          "Which destination it belongs to.",
          "What it was booked around, if anything. This is the one everybody skips and the one that matters.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The fourth one is the whole point",
        paragraphs: [
          "A transfer is not merely a thing at two in the afternoon. It is a thing that exists because of a flight landing at one. A hotel check-in is not just a time, it is downstream of the transfer.",
          "Write that relationship down once, when you book, and you never have to reconstruct it. Skip it, and every disruption starts with working out from memory what was connected to what, usually in an airport. The method is set out in [what else your trip depends on](/guides/what-else-your-trip-depends-on-when-something-changes).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not build a full itinerary",
        paragraphs: [
          "An hour by hour plan for a two week trip is a document that is wrong by day three, and rewriting it is where most of those ten hours go.",
          "Record the fixed points, which are the things with a booking reference attached, and leave the rest genuinely open. The fixed points are the only part that breaks expensively when something moves.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "One place, not six inboxes",
        paragraphs: [
          "Confirmations arrive across several email accounts, a couple of apps and occasionally a screenshot. That is fine while nothing goes wrong and useless at six in the morning at a desk.",
          "The references are what you actually need under pressure, and they need to be somewhere you can read them in three seconds without searching.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Assume one thing will change",
        paragraphs: [
          "Something will move on almost every trip with more than three moving parts. Planning for that is not pessimism, it is the difference between an inconvenience and a ruined day.",
          "The practical version of planning for it is simply having recorded what depends on what, before you needed to know.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion holds the whole trip in one place, including what each booking was built on top of. When something moves you record the change once and it shows you exactly what was downstream of it, unchanged, so you decide. It also prints as a blank book you can carry, for when the phone is the thing that failed.",
      },
    ],
  },

  {
    slug: "travel-documents-for-a-family",
    title: "Travel documents for a family: what to carry and where to keep it",
    dek: "What each traveller needs, what to check months before you go, and why a photograph of a passport is not a backup plan.",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Travelling with other people means being responsible for documents that are not yours, usually including at least one person who cannot be responsible for their own.",
          "Two categories matter. What has to be checked well in advance, because it cannot be fixed at an airport, and what has to be findable on the day.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Check these months ahead",
        intro: "Every one of these has ended trips at check-in desks.",
        items: [
          "Passport expiry for every traveller. Many countries require six months validity beyond your return date, so an in-date passport can still be refused.",
          "Blank pages, which some countries require and which nobody thinks about.",
          "Visa or travel authorisation requirements, including electronic ones that are quick but not instant.",
          "Whether a child travelling with one parent, or with neither, needs documented consent. Rules vary and are enforced unevenly, which is worse than being enforced consistently.",
          "Name mismatches between passport and booking, which cause more problems than anything else on this list.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Passport validity catches people every year",
        paragraphs: [
          "The rule that surprises people is that many destinations require your passport to remain valid for six months after you arrive or leave. A passport expiring in four months is in date and still refused.",
          "Check every traveller, not just the adults. Children's passports are usually valid for fewer years and expire at unhelpful moments precisely because nobody is watching them.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to have findable on the day",
        items: [
          "Passports, obviously, and it is worth agreeing who is physically carrying which.",
          "Booking references for flights, stays and transfers, readable without hunting through email.",
          "Travel insurance policy number and the emergency assistance phone number, which is the detail people have never once memorised.",
          "Any medication documentation, especially for anything that would raise questions at a border.",
          "One phone number per booking that a human will actually answer.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A photo of a passport is not a backup",
        paragraphs: [
          "It is useful for filling in forms and for proving to yourself what the number was. It is not a travel document, and it will not get anybody onto a plane.",
          "The genuinely useful record is knowing what exists and where it is right now. Whose passport is in which bag. Whether the insurance is under one person's name. Which parent is carrying which child's documents. That is the information that resolves a problem at a desk, and it is the part nobody writes down.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep something on paper",
        paragraphs: [
          "A phone at four percent in a taxi is a normal situation, not a rare one. Passport numbers, the insurance line and the key references on one printed page cost nothing and work when nothing else does.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion records what documents exist, whose they are, and where each one is kept, and can flag the ones worth showing in the trip summary. It never accepts an upload, because no product on Draftpace stores files, and passport scans are the single most sensitive thing any of them would hold if they did. It prints the lot as a blank book you can carry.",
      },
    ],
  },

  {
    slug: "you-missed-a-payment-what-to-do-next",
    title: "You missed a payment. What to do in the next 48 hours",
    dek: "What actually happens when a payment is missed, what to do first, and how to talk to a provider without it becoming a whole thing.",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "One missed payment is usually a small problem treated as a large one. The consequences are mostly recoverable, and acting within a few days is what keeps them that way.",
          "Nothing here is financial advice, and if payments are being missed regularly rather than occasionally, that is a different situation where free debt advice services are genuinely the right call and are worth contacting early rather than late.",
        ],
      },
      {
        kind: "timeline",
        heading: "The first 48 hours",
        steps: [
          {
            when: "First",
            what: "Confirm it actually failed. A payment can show as pending, be retried automatically, or have gone out of a different account than you think.",
          },
          {
            when: "If you can pay it",
            what: "Pay it now. A payment a few days late is materially different from one a month late, and most reporting thresholds are measured in months rather than days.",
          },
          {
            when: "Same sitting",
            what: "Check whether anything else is due before your next payday, so you are not solving one and creating another on Friday.",
          },
          {
            when: "If you cannot pay it",
            what: "Call them. Providers have far more discretion before an account defaults than after, and almost none of that discretion is offered to people who did not get in touch.",
          },
          {
            when: "Before you hang up",
            what: "Write down who you spoke to and what was agreed. This matters if a different person tells you something different next week.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "What actually happens, roughly",
        paragraphs: [
          "A few days late usually means a failed payment fee and nothing else. Around a month late is generally when it starts being reported. Several months is where genuine credit consequences and default processes begin.",
          "The exact thresholds vary by country, provider and product type. The useful general point is that the gap between a few days and a month is enormous, and it is entirely within your control.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Calling them is the part people avoid",
        paragraphs: [
          "It is also the single most effective thing available, because providers have options before an account goes into arrears that they lose afterwards: payment holidays, revised dates, splitting a payment.",
          "If that call is the thing you have been putting off for a week, that is an extremely normal response to it, and the preparation that makes it easier is in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why it usually happens",
        paragraphs: [
          "Very rarely because somebody decided not to pay. Almost always because the balance looked fine on the day, and a payment that had already been committed had not left the account yet.",
          "That gap between what your balance says and what is genuinely yours is the actual cause, and it is explained in [why your available balance is lying to you](/guides/why-your-available-balance-is-lying-to-you).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion holds your bills with their due dates and counts them against what is genuinely available, so the number you are looking at already accounts for what has not left yet. When a bill is missing a due date it says so rather than quietly leaving it out of the figure. Monthly Money Reset does a simpler version, free.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 4

  {
    slug: "what-your-family-would-need-to-know-tomorrow",
    title: "What your family would need to know tomorrow",
    dek: "Not a will, and not morbid. The short list of things that only exist in your head, and what happens when nobody can find them.",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Imagine somebody has to run your life from tomorrow morning, with no warning and no access to your phone. Not forever. Just for two weeks.",
          "Most of what they would need is not secret and not complicated. It is simply undocumented, because it has always lived in one head, and it turns out that is a single point of failure.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The two week list",
        intro: "What somebody would actually hit in the first two weeks, in roughly the order they would hit it.",
        items: [
          "Which bank the household money is in, and whether anything is due out this week.",
          "Where the mortgage or rent is paid from, and when.",
          "Which utilities are on which accounts, and whether any are on a fixed term ending soon.",
          "Whether anyone is expecting you: work, appointments, a standing commitment, somebody you care for.",
          "Where the car keys, spare house keys and any alarm codes are.",
          "Whether a pet needs something specific that only you know.",
          "Who to call. Not next of kin. The person who could actually help with a specific thing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Two weeks is the useful frame",
        paragraphs: [
          "Thinking about this as estate planning makes it enormous, and enormous things do not get done. Thinking about it as two weeks makes it a short list you can write in one sitting.",
          "It is also the frame that covers the far more likely scenarios. Illness, an accident, being abroad and unreachable, or being in hospital for a week are all far more probable than the version everyone avoids thinking about, and the same list solves all of them.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The thing that blocks everything is the password manager",
        paragraphs: [
          "Almost every modern household has a single point of failure that nobody has tested: the recovery email, whose password is in the password manager, whose master password exists only in one person's memory.",
          "You do not need to write the master password down. You need somebody to have recovery access, or a sealed copy somewhere trusted, and to know that mechanism exists. Otherwise everything else on your list is behind a door nobody can open.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep it findable, which means keep it dull",
        paragraphs: [
          "This document should be safe to leave in a drawer, which means it holds locations and references rather than credentials. Where the pension paperwork is, not the login for it.",
          "A perfect record nobody can reach is the same as no record. The fuller version of what belongs in it is in [the if something happens to me file](/guides/the-if-something-happens-to-me-file).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion works out which parts of this are even relevant to you, sequences them so the job has a beginning, and records where things are kept rather than the things themselves. It prints as a book, which is the format that still works when the problem is that nobody can get into a device.",
      },
    ],
  },

  {
    slug: "digital-accounts-after-a-death",
    title: "Digital accounts after a death: what can and cannot be recovered",
    dek: "Photos, email, subscriptions and social accounts. What providers will actually release, what they will not, and what to set up now.",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The short version is that access to somebody's digital accounts after they die is much harder than people expect, and in many cases impossible regardless of documentation.",
          "Providers are bound by their own terms and by privacy law, and a death certificate plus proof of executorship does not automatically grant access to an account. Some will memorialise. Some will close. Very few will simply hand over the contents.",
        ],
      },
      {
        kind: "table",
        heading: "Roughly what to expect",
        intro: "Policies change and vary by country, so treat this as a starting point rather than a rule.",
        columns: ["Account type", "Usual outcome", "What helps"],
        rows: [
          ["Email", "Rarely released. Sometimes closed on request.", "A legacy contact set up in advance"],
          ["Photo storage", "Sometimes released to a designated contact", "A legacy or inactive account contact"],
          ["Social media", "Memorialised or deleted, contents rarely released", "A legacy contact, or clear instructions"],
          ["Subscriptions", "Cancelled on request with a death certificate", "Knowing they exist at all"],
          ["Cloud storage", "Varies, and often refused", "Shared folders set up while alive"],
          ["Domain names and websites", "Transferable, but registrar dependent", "Registrar details written down"],
          ["Cryptocurrency", "Unrecoverable without the keys", "Nothing after the fact. Only preparation"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Legacy contacts are the thing that actually works",
        paragraphs: [
          "Several large providers let you nominate somebody in advance who can request access after your death. It takes minutes, it is free, and it is the single most effective step available.",
          "It works because you granted permission while alive, which is a completely different legal situation from somebody requesting access afterwards. That distinction is why preparation succeeds where paperwork later usually fails.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The subscriptions keep running",
        paragraphs: [
          "This is the practical problem families hit first. Payments continue for months or years because nobody knows the subscriptions exist, and they are only discoverable through bank statements.",
          "Twelve months of statements is the way to find them, for the same reason it is the way to find accounts and policies generally, which is covered in [how to find someone's accounts](/guides/how-to-find-someones-accounts-after-they-die).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to do now, for yourself",
        paragraphs: [
          "Set legacy contacts where they are offered. Write down which email address is the recovery address for everything, because that account is the key to most of the others. Make sure somebody can get into the password manager, through its own recovery mechanism rather than through a written master password.",
          "And write down what would be a real loss. Photographs are what families grieve twice over, and they are usually the most recoverable thing if a designated contact exists.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion covers the digital side more thoroughly than any other area, because it is the part that is genuinely unrecoverable if nobody wrote it down. It records which accounts exist, which email is the recovery address, and where the password manager lives, never the credentials themselves.",
      },
    ],
  },

  {
    slug: "which-documents-to-keep-and-where-to-put-them",
    title: "Which documents to keep, which to shred, and where the rest should live",
    dek: "A retention guide for household paperwork, and a filing approach that survives contact with real life.",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most households keep either everything or nothing. Everything means a box nobody can search. Nothing means an afternoon lost the one time a document is needed.",
          "The workable middle is a short list of things worth keeping permanently, a shorter list worth keeping for a few years, and permission to shred the rest.",
        ],
      },
      {
        kind: "table",
        heading: "Roughly how long to keep things",
        intro: "General guidance. Tax retention rules in particular vary by country, so check yours.",
        columns: ["Document", "Keep for", "Why"],
        rows: [
          ["Birth, marriage, death certificates", "Permanently", "Originals are slow and costly to replace"],
          ["Wills and powers of attorney", "Permanently, current version", "Superseded versions still matter if challenged"],
          ["Property deeds and mortgage records", "Permanently, or until well after sale", "Boundary and ownership disputes surface late"],
          ["Pension and investment statements", "Permanently for the annual summary", "Old schemes are the most commonly lost asset"],
          ["Tax records", "Several years, per local rules", "Audit windows differ by country"],
          ["Home improvement receipts", "As long as you own the property", "Can matter for warranty and for tax on sale"],
          ["Appliance receipts and manuals", "While you own the item", "Warranty claims need proof of purchase"],
          ["Utility bills and bank statements", "About a year, unless needed for tax", "Superseded quickly, and available from providers"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Sort by how urgently you would need it",
        paragraphs: [
          "Filing by category is how filing systems die, because a document usually fits two categories and choosing costs a moment every time.",
          "Sorting by urgency works better. One thin folder for things somebody might need in an emergency, one for active paperwork, one box for archive. Three destinations means no decision, which means things actually get filed.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What actually needs to be paper",
        paragraphs: [
          "Certificates, deeds, signed wills and anything with a wet signature or a seal. For most of the rest, a clear scan is fine and a great deal easier to find.",
          "The exception worth respecting is anything somebody else would need in a hurry. Paper does not need a password, a battery, or a device somebody cannot get into.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Shred rather than bin",
        paragraphs: [
          "Anything with an account number, a signature, a date of birth or a full address is worth shredding. That is most of what you are throwing away.",
          "It is a small habit that removes a real and boring risk, and it makes the decision to discard something much easier, which is the actual barrier for most people.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records what documents exist and where each one is kept, so the question becomes a lookup rather than a search through a box. It never accepts an upload, which is deliberate: a registry of locations is far less dangerous to hold than the documents themselves.",
      },
    ],
  },

  {
    slug: "what-to-log-after-a-repair",
    title: "What to write down after every repair, so the next one is cheaper",
    dek: "Five minutes after an engineer leaves is worth an hour next time. What to capture, and why the diagnosis matters more than the invoice.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Almost everybody keeps the invoice and forgets everything else. The invoice tells you what you paid. It rarely tells you what was actually wrong, what was replaced, or what the engineer said would need doing next.",
          "That second set is what makes the next repair faster, and it exists only in your memory for about two weeks.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Write these down the same day",
        items: [
          "What the symptom was, in your own words, before anybody diagnosed it.",
          "What they said was actually wrong.",
          "What was replaced or adjusted, including any part number.",
          "What they said to watch for, or what would need doing next and roughly when.",
          "Who came, which company, and whether you would have them back.",
          "What it cost, and whether any of it was under warranty.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The diagnosis is worth more than the invoice",
        paragraphs: [
          "When the same appliance misbehaves in two years, the single most useful sentence is what an engineer concluded last time. It shortens the next visit, and it sometimes prevents one entirely because you recognise the symptom.",
          "It also protects you. An engineer telling you a part was replaced eighteen months ago is a very different conversation from one where nobody can remember.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Record what they said would come next",
        paragraphs: [
          "Engineers routinely mention that something else is nearing the end of its life, and that remark is almost never written down. Six months later the thing fails and nobody remembers being warned.",
          "That one line is the most valuable thing in the whole visit, because it is the only genuinely predictive information you will get about your own house.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep a note of who to call again",
        paragraphs: [
          "Finding a good tradesperson is harder than any of the admin around it, and most people rediscover this every few years because the number was in a text message that got lost.",
          "Recording who came, alongside the thing they worked on, means the next problem starts with a phone number rather than a search.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "This is also what makes maintenance schedules real",
        paragraphs: [
          "A service interval only means something if you know when the last service happened. Without that, every schedule starts from an arbitrary date and drifts.",
          "The intervals themselves are in [how often things actually need servicing](/guides/how-often-home-systems-need-servicing).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base keeps a service history against each thing in your house, including who did the work, so the next repair starts with facts rather than memory. Because it knows when something was last done, its idea of what is due next is based on reality rather than on when you happened to add the item.",
      },
    ],
  },

  {
    slug: "appliance-warranties-what-to-track",
    title: "Appliance warranties: what to track, and when they actually pay out",
    dek: "Most warranty claims fail for boring reasons. What to record at purchase, and the dates worth knowing before something breaks.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Warranty claims mostly fail for administrative reasons rather than because a manufacturer refused. No proof of purchase, no serial number, no record of the annual service the warranty required, or a claim made two weeks after expiry.",
          "All four are avoidable with about two minutes of recording at the point of purchase.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to record when something is installed",
        items: [
          "Date of purchase and date of installation, which are often different and it is usually installation that starts the clock.",
          "Serial number, which is what a manufacturer will ask for first.",
          "Where the proof of purchase is.",
          "The warranty length, and whether it was extended or registered.",
          "Any condition attached, most commonly an annual service requirement.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The service condition is the one that catches people",
        paragraphs: [
          "Many boiler and heating warranties require a documented annual service. Miss one, and the warranty can be void for the rest of its term, which people usually discover at the exact moment they try to use it.",
          "This is the single most expensive small print in a normal household, and the fix is knowing the condition exists and having the service dates recorded.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Registering matters more than it should",
        paragraphs: [
          "Registration is often what extends a warranty from one year to five, and it is a form most people skip because it looks like marketing.",
          "It is also how manufacturers reach owners about recalls. A recall notice you never receive is worth remembering when deciding whether the form is worth two minutes.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check the expiry before you pay for a repair",
        paragraphs: [
          "The obvious step that gets skipped under pressure. Something breaks, you want it fixed today, and nobody checks whether it is still covered until after the invoice.",
          "Knowing your expiry dates in advance converts this from a discovery into a decision.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Extended warranties are usually not worth it",
        paragraphs: [
          "As a general rule the ones sold at the till are poor value, because they are priced to be profitable and most appliances either fail early, within the standard warranty, or last well beyond the extension.",
          "The exception is anything where a single failure is catastrophic relative to the item's cost. That is a judgement, not a rule, and it should be made with the expiry dates in front of you rather than at a counter.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base records warranty end dates alongside the make, model and serial for everything in your house, and raises one when it is genuinely approaching rather than burying it in a list. What to capture per type of thing is in [what to record about an appliance](/guides/what-to-record-about-an-appliance-before-you-need-it).",
      },
    ],
  },

  {
    slug: "scripts-for-the-admin-calls-everyone-dreads",
    title: "Scripts for the admin calls everyone dreads",
    dek: "Opening lines for the five calls people put off longest, and the four things to do before hanging up on any of them.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The first fifteen seconds are the part almost everybody rehearses and dreads. Once you are through them the conversation generally carries itself, because the other person starts asking questions and you only have to answer.",
          "So the useful preparation is not a full script. It is a first sentence, and knowing what you want before you dial.",
        ],
      },
      {
        kind: "scripts",
        heading: "Openings that work",
        intro: "Every one of these opens with the problem rather than an apology, and ends with a question, which hands them the next move.",
        items: [
          {
            situation: "Billing problem",
            line: "Hello, I have been charged for something and the amount is not what I was expecting. Can you look into it for me.",
          },
          {
            situation: "Chasing something overdue",
            line: "Hello, I am following up on something I was told would be resolved by now. Can you tell me where it has got to.",
          },
          {
            situation: "Cancelling",
            line: "Hello, I would like to cancel my account. Can you tell me what you need from me to do that.",
          },
          {
            situation: "Complaining",
            line: "Hello, something has gone wrong and I would like to explain what happened. Can I go through it with you.",
          },
          {
            situation: "Asking for help",
            line: "Hello, I am trying to sort something out and I am not sure I am doing it right. Can you point me in the right direction.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Say what happened, once, in order",
        paragraphs: [
          "Whoever answers can only help with the actual sequence of events. Give it once, cleanly, then say what you need. Leading with the ask before the facts almost always makes the call longer.",
          "Two sentences is usually enough. What happened, and what you would like to happen now.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Four things before you hang up",
        intro: "This is the part that saves the second call.",
        items: [
          "Ask them to read back what has been agreed.",
          "Get a reference number for the call itself.",
          "Get the name of who you spoke to.",
          "Ask what happens next, and by when.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "You do not have to be firm",
        paragraphs: [
          "A great deal of advice about difficult calls is really advice about being assertive, which assumes the problem is that you are too soft. Usually the problem is capacity, not confidence.",
          "Being polite and specific works with almost every call centre, because the person answering has a fixed set of options and is deciding which to offer. Clarity about what you want moves that further than firmness does.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If the call does not resolve it",
        paragraphs: [
          "That is a normal outcome. Plenty of calls end with somebody else needing to look into it, and the reference number is what makes the next one continue rather than restart.",
          "If the barrier is getting to the call at all rather than the call itself, that is a different problem, worked through in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion has authored procedures for these exact situations, including a billing problem, a follow up and a difficult call. It suggests an opening you can edit or replace, holds what you want on screen while you talk, and never tells you what to accept or settle for, because you are the one with the facts. Suggested wording is never saved once you have used it.",
      },
    ],
  },

  {
    slug: "when-something-has-been-left-so-long-it-is-embarrassing",
    title: "When something has been left so long it is embarrassing",
    dek: "The shame is doing more work than the task now. How to deal with the delay itself, including what to say about it.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is a point where a task stops being a task and becomes evidence. The unopened letters. The email from four months ago. The thing you said you would sort out and then avoided so long that dealing with it now means admitting how long it has been.",
          "At that point you are not avoiding the work. You are avoiding the conversation about why it did not happen sooner, which is a completely different problem and considerably heavier.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The delay is almost always less interesting to them than to you",
        paragraphs: [
          "Whoever you have to contact deals with delayed matters constantly. Call centres, landlords, councils, accountants and clinics all have processes for exactly this, because most of what reaches them is late.",
          "The version of the conversation you have rehearsed, where somebody is shocked or annoyed, is very rarely the one that happens. Usually they ask for a reference number and move on.",
        ],
      },
      {
        kind: "scripts",
        heading: "What to say about the gap",
        intro: "One sentence, no story. Pick whichever sits closest to how you actually feel about it and use that.",
        items: [
          {
            situation: "Keep it brief",
            line: "I know this has been outstanding for a while, and I would like to get it sorted now.",
          },
          {
            situation: "Name it plainly",
            line: "This is later than it should be. What do you need from me.",
          },
          {
            situation: "Ask where it stands",
            line: "I have not dealt with this until now. Can you tell me where it stands.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not explain unless they ask",
        paragraphs: [
          "The instinct is to justify: an illness, a bereavement, a hard year. If a reason is relevant to what they can offer you, give it. Otherwise it usually makes the exchange longer and more uncomfortable, mostly for you.",
          "Acknowledge and move to the practical question. Almost every organisation is set up to answer the practical question and has nothing to do with the other one.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Open the letters before deciding it is bad",
        paragraphs: [
          "A pile of unopened post grows in the imagination at a rate the contents rarely justify. Often several are duplicates, a couple are marketing, and the actual problem is one item smaller than feared.",
          "Opening them without doing anything is a legitimate first step. You are converting an unknown into a known, and the unknown is what has been costing you.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Late is a state, not a verdict",
        paragraphs: [
          "Almost nothing on a typical list gets worse for having been avoided, in the way the dread implies. Debts accrue interest and deadlines pass, and both are real, but the imagined catastrophe is nearly always larger than the actual position.",
          "The way in is usually a phone call, and the preparation for that is in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built so that nothing counts how long something sat. There is no streak, no overdue tally, and closing something you did not get to records nothing at all, not even a timestamp, because a history of your own admin should not read as a list of failures.",
      },
    ],
  },

  {
    slug: "preparing-for-a-homeschool-evaluation",
    title: "Preparing for a homeschool evaluation or review",
    dek: "What evaluators actually look for, what to bring, and how to prepare in an evening rather than two weeks.",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "An evaluation is generally a check that education is happening, not an inspection of whether you are doing it well. Evaluators are usually experienced homeschoolers or teachers, and most of them want the meeting to go fine.",
          "The preparation that helps is assembling evidence that something coherent happened across the year, which is a smaller job than most people fear, particularly if anything at all was recorded as you went.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to bring",
        items: [
          "The log of what was covered, with dates, even if approximate.",
          "Work samples across the year, not from one strong two week stretch.",
          "A list of curricula and materials used.",
          "Attendance or days schooled, if your state counts them.",
          "Test results, if required where you are.",
          "A short note per subject on where you started and where you got to.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Progress is what they are looking for",
        paragraphs: [
          "The single most persuasive thing in any portfolio is the same subject at two points in the year. October and March writing samples side by side say more than any quantity of finished work from one week.",
          "It is also the easiest thing to provide, and the thing most people accidentally leave out by only keeping the pieces they were proud of.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Be honest about what did not go well",
        paragraphs: [
          "Saying that maths was difficult until January, that you changed curriculum, and that it improved afterwards is a stronger position than implying everything went smoothly.",
          "It demonstrates that you were paying attention and adjusting, which is exactly what an evaluator wants to see. A portfolio with no difficulties in it reads as curated rather than complete.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you are behind on records",
        paragraphs: [
          "Reconstruct honestly, mark approximate dates as approximate, and do not invent precision. A clearly reconstructed term is a normal thing to hand over.",
          "The full recovery method is in [when you have kept nothing since October](/guides/homeschool-records-when-you-have-kept-nothing-since-october).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check what your state actually requires",
        paragraphs: [
          "Requirements differ enormously, and preparing for a stricter standard than yours wastes a weekend. The state-by-state position is in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion prints a record per child covering what was done, when, and what you noticed, which is most of what an evaluation asks for. It accepts backdated entries, and its short checks report an honest standing, including not enough to say, rather than a score you would then have to explain.",
      },
    ],
  },

  {
    slug: "group-trip-coordination-without-becoming-the-admin",
    title: "Group trips: coordinating people without becoming the group admin",
    dek: "Coordinating schedules is the top stressor in group travel. A way to share the shape of a trip without owning everybody's decisions.",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Nearly two thirds of people planning group travel name coordinating schedules as their leading stressor, ahead of budgets and ahead of comparing options.",
          "The reason is that one person ends up holding the whole thing in their head, and that person is answering the same four questions repeatedly for two weeks.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Decide these three things first",
        intro: "Almost all group travel friction comes from leaving these implicit.",
        items: [
          "Who is booking what. Not who is paying, who is actually making each booking.",
          "What is fixed and what is optional. Flights and stays are usually fixed. Everything else should be explicitly optional so nobody feels obliged to attend a museum.",
          "Where the answers live. One place everybody can read without asking you.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The four questions you will be asked repeatedly",
        paragraphs: [
          "What time are we leaving. Where are we staying. What is happening on Thursday. Am I on that booking.",
          "Every one of those is a lookup rather than a decision. If the answers are readable somewhere, the questions mostly stop, and the ones that remain are genuine decisions worth your attention.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Record who is on what",
        paragraphs: [
          "In a group, a booking is not simply an event. It is an event with a subset of people attached, and that subset is rarely everybody.",
          "Four people on the flight, two on the car hire, three at the restaurant. Writing that down once answers a large share of the questions above and prevents the specific problem of somebody discovering at the airport that they were never on a booking.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Note what each person needs",
        paragraphs: [
          "Dietary requirements, mobility needs, a seat preference, medication that affects timing. In a group these live in several heads and surface at inconvenient moments.",
          "Recorded once against the person, they are available when a booking is made rather than remembered afterwards.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When something moves, it moves for a subset",
        paragraphs: [
          "This is where group trips get genuinely difficult. A delayed flight affects the four people on it and not the two who travelled separately, and working out who needs telling is its own task.",
          "Knowing what depends on what is the same skill as in any trip, covered in [what else your trip depends on](/guides/what-else-your-trip-depends-on-when-something-changes). The group version simply adds the question of who is affected.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion records travellers, links them to the bookings they are actually on, and holds what each person needs. When something changes it shows what was built on top of it, so working out who to tell starts from what is recorded rather than from memory. It also prints the whole trip as a book, which is a genuinely practical way to hand the shape of it to somebody else.",
      },
    ],
  },

  {
    slug: "untangling-money-after-a-life-change",
    title: "Untangling your money after a job change, move or separation",
    dek: "Life events break the assumptions your finances were built on. A practical order for putting the picture back together.",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A new job, a move, or a separation each break several assumptions at once. Income changes shape or timing, outgoings move, and a number of things that were on autopilot are now pointed at the wrong place.",
          "The work is not complicated. It is just spread across a dozen places, and it arrives at a moment when you have a great deal else happening.",
        ],
      },
      {
        kind: "timeline",
        heading: "The order that works",
        intro: "Each stage depends on the one above it, which is why doing them out of order tends to mean doing them twice.",
        steps: [
          {
            when: "Income",
            what: "What is arriving, when, and whether the payday has moved. Everything else depends on this.",
          },
          {
            when: "Fixed outgoings",
            what: "What leaves automatically, from which account, and on what dates.",
          },
          {
            when: "Anything now wrong",
            what: "An address, a name on a bill, a payment coming from an account that is about to close.",
          },
          {
            when: "The forgotten ones",
            what: "The things nobody remembers, which are pensions from the old employer and insurance bought through it.",
          },
          {
            when: "Then recalculate",
            what: "Work out what is safe to spend again, because the old number is no longer true.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Job change: the gap and the pension",
        paragraphs: [
          "Two things catch people. A change in payday can leave a longer gap than usual between salaries, and direct debits do not care that this month is five weeks. Checking the dates before that gap arrives prevents a missed payment for no reason other than timing.",
          "The other is the old workplace pension, which does not disappear and does not follow you. It becomes a separate pot that most people lose track of, and untraced pensions are among the most commonly lost assets there are.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Moving: the address is on more things than you think",
        paragraphs: [
          "Bank, insurers, pension providers, the electoral roll, your driving licence, subscriptions with a delivery address, and anything that posts an annual statement. That last category matters most, because an annual statement sent to an old address is how people lose track of accounts entirely.",
          "Meter readings on the day, both leaving and arriving, prevent the most common billing dispute there is.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Separation: untangle joint things deliberately",
        paragraphs: [
          "Joint accounts, joint bills and anything one person guaranteed for the other all need explicit attention, and a financial association between two people can persist long after the relationship does.",
          "This is the one on the list where getting advice is genuinely worth it rather than optional, particularly where property or children are involved. Nothing here is advice, and the order above is only about getting the picture visible.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Recalculate the number afterwards",
        paragraphs: [
          "The figure you had in your head for what is safe to spend was built on the old shape of things and is now wrong, usually in a direction nobody enjoys discovering at a till.",
          "Rebuilding it is quick once income and outgoings are visible, and the method is in [how much of your money is actually safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion holds accounts, income, bills, subscriptions and debts in one place, so after a life change you are editing a picture rather than reconstructing one. Personal Life Affairs Companion covers the paperwork half of the same events, including the pension from the job you just left.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 5

  {
    slug: "talking-to-your-parents-about-their-affairs",
    title: "How to talk to your parents about their affairs without it going badly",
    dek: "The conversation almost everybody postpones. What to open with, what not to ask for, and how to make it about logistics rather than mortality.",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The conversation goes wrong when it sounds like a conversation about dying, or worse, about money. It goes fine when it sounds like a conversation about where things are kept.",
          "That is not a trick. It is genuinely the useful part. You do not need to know what anybody is worth or who inherits. You need to know where the will is, which pension is with whom, and who to call.",
        ],
      },
      {
        kind: "scripts",
        heading: "Openings that tend to work",
        intro: "Each of these makes the conversation about logistics rather than about them dying, which is the difference between a conversation and an argument.",
        items: [
          {
            situation: "Start with yourself",
            line: "I have been sorting out my own paperwork and realised nobody would know where anything of mine is. Have you done yours.",
          },
          {
            situation: "Use a what if",
            line: "If you were both in hospital for two weeks, I would not know how to keep things running. Can we write the basics down.",
          },
          {
            situation: "Use somebody else's story",
            line: "A friend has just been through this for their parent and it took months, mostly because nothing was written down.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Start with yourself",
        paragraphs: [
          "The single most effective move is doing your own first and mentioning it. It removes any suggestion that this is about their age or their health, and it gives you something concrete to show.",
          "It also means you are asking them to join something rather than to submit to it, which is a materially different request.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ask for locations, not contents",
        paragraphs: [
          "Where the will is, not what it says. Which bank, not the balance. Who the lawyer is, not what was discussed.",
          "Almost everybody is comfortable sharing locations and uncomfortable sharing contents, and locations are what actually prevent the months of searching later.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Expect it to take several conversations",
        paragraphs: [
          "Trying to complete this in one sitting is how it becomes a confrontation. Getting the will's location this month and the pensions next month is a completely normal pace and considerably more likely to finish.",
          "If somebody shuts it down, that is information rather than a refusal. Try a different entry point later, or a different person: parents will often tell a sibling something they will not tell you, for no reason either of you could explain.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write it down at the time",
        paragraphs: [
          "The most common failure is having the conversation, feeling relieved, and recording nothing. Six months later you remember there was a lawyer and not which one.",
          "What to capture is in [the if something happens to me file](/guides/the-if-something-happens-to-me-file).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion is designed to be worked through gradually rather than in one sitting, and it records where things are kept rather than what they contain, which is exactly the boundary that makes this conversation possible. Doing your own is also the easiest way to start the conversation at all.",
      },
    ],
  },

  {
    slug: "inheriting-a-house-nobody-documented",
    title: "Inheriting or buying a house nobody documented",
    dek: "No manuals, no service history, no idea how old the boiler is. How to work out what you have and what needs attention first.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Sometimes you end up responsible for a house with no paperwork at all. An inherited property, a probate sale, or a purchase where the previous owner handed over keys and nothing else.",
          "You are not starting from nothing. The house itself carries most of the information, and an afternoon with a torch and a phone camera recovers a surprising amount of it.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The walk round",
        intro: "Photograph every plate you find. Transcribing model numbers by hand in bad light produces errors.",
        items: [
          "Boiler or furnace: model, serial, and any service sticker, which often lists dates and the engineer.",
          "Water heater: the label usually includes a manufacture date, which tells you its age even if nothing else does.",
          "Consumer unit or breaker panel: often carries an installation or inspection certificate date.",
          "Every major appliance: make, model, serial.",
          "Meters: readings and serial numbers, plus which supplier the meter suggests.",
          "Loft, cellar and cupboards, where manuals and paperwork usually survive when nothing else has.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Manufacture dates tell you most of what you need",
        paragraphs: [
          "Nearly every major appliance encodes its manufacture date somewhere on the plate, sometimes in the serial number itself. A quick search for the model plus how to read the serial usually decodes it.",
          "That gives you the one thing that matters most: how far through its life something is. A fifteen year old water heater is a different planning problem from a three year old one, regardless of whether either is misbehaving today.",
        ],
      },
      {
        kind: "table",
        heading: "Typical service lives",
        intro: "Rough figures for planning, not predictions. Maintenance affects these considerably.",
        columns: ["System", "Typical life", "What to do if yours is near it"],
        rows: [
          ["Boiler or furnace", "15 to 20 years", "Get it serviced and ask directly about remaining life"],
          ["Water heater", "8 to 12 years", "Budget for replacement rather than waiting for the failure"],
          ["Air conditioning", "10 to 15 years", "Service before summer, ask about refrigerant type"],
          ["Roof covering", "20 to 30 years", "Get an inspection rather than guessing from the ground"],
          ["Consumer unit or panel", "25 to 40 years", "Have it inspected, particularly if it looks original"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Book one inspection rather than five",
        paragraphs: [
          "If the house is genuinely undocumented, a single competent visit from a heating engineer or a general surveyor gives you more than weeks of guessing, and it produces a written record you now own.",
          "The value is not only the findings. It is that you now have a dated starting point, which is what every future service interval will be measured from.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Treat unknowns as due",
        paragraphs: [
          "Where you genuinely cannot find out when something was last done, assume it is due. For most of the maintenance list an unnecessary check costs an hour and a missed one costs a great deal more.",
          "Once you have done it, you have a date, and the guessing stops permanently. The intervals to work from are in [how often things actually need servicing](/guides/how-often-home-systems-need-servicing).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base is designed to be filled in from exactly this kind of walk round, asking for the right fields per type of thing, and it will work from what you know rather than demanding a complete history. Once a date exists it takes over the arithmetic of what is due when.",
      },
    ],
  },

  {
    slug: "how-to-find-the-model-number-on-any-appliance",
    title: "How to find the model number on any appliance",
    dek: "Where each type of appliance hides its plate, how to read a serial number, and what to do when the label has worn away.",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The model number is the thing every parts supplier, engineer and warranty claim asks for first, and it is almost never on the front of the appliance where the brand name is.",
          "It is on a data plate, usually somewhere you have to open, tilt or crouch to see. Below is where each type keeps it.",
        ],
      },
      {
        kind: "table",
        heading: "Where to look, by appliance",
        columns: ["Appliance", "Where the plate usually is"],
        rows: [
          ["Fridge or freezer", "Inside, on the side wall near the salad drawer, or behind the lower grille"],
          ["Washing machine", "Around the inside rim of the door opening, or on the rear panel"],
          ["Tumble dryer", "Inside the door opening, or behind the lint filter housing"],
          ["Dishwasher", "On the edge of the door, visible only with the door open"],
          ["Oven or cooker", "On the frame behind the door, or under a warming drawer"],
          ["Microwave", "On the back, or inside the door frame"],
          ["Boiler or furnace", "Inside the front cover, usually facing you once opened"],
          ["Water heater", "A large label on the outer casing near the top"],
          ["Air conditioning", "On the outdoor unit, on a plate often facing the wall"],
          ["Extractor hood", "Under the filters, which lift out"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Model, serial and product number are different things",
        paragraphs: [
          "The plate usually carries several codes and they do different jobs. The model number identifies which product it is, and is what a parts supplier needs. The serial number identifies your specific unit, and is what a manufacturer needs for warranty and recalls.",
          "Some brands also print a product or E number, which is what their own service system searches on. If in doubt, photograph the whole plate rather than choosing which code to write down.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Reading the age out of a serial number",
        paragraphs: [
          "Many manufacturers encode the manufacture date into the serial, often as a week and year. The format differs by brand, and searching for the brand plus how to read the serial number usually finds it.",
          "This is worth doing once, because knowing an appliance is twelve years old changes how you think about repairing it versus replacing it.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "When the label is gone",
        intro: "Worn, painted over, or peeled off. Several fallbacks usually work.",
        items: [
          "The original receipt or order confirmation email, searched for the brand name.",
          "The manual, if it survived, which usually lists the model on the cover.",
          "A previous repair invoice, which almost always records the model.",
          "A photograph of the appliance sent to the manufacturer's support, who can often identify it by sight.",
          "The installation certificate, for boilers and electrical work, which records the equipment fitted.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Photograph it now rather than later",
        paragraphs: [
          "The moment to do this is while the appliance is working and accessible, not when it has failed and been pulled out into the middle of a kitchen.",
          "What else is worth capturing at the same time is in [what to record about an appliance](/guides/what-to-record-about-an-appliance-before-you-need-it).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base asks for make, model and serial per item and keeps them alongside the service history, so the next engineer visit or parts order starts with a number rather than a torch. It asks only for the fields that make sense for that kind of thing.",
      },
    ],
  },

  {
    slug: "homeschool-attendance-what-to-track",
    title: "Homeschool attendance: what to track and what is pointless",
    dek: "Which states count days, what actually counts as a school day, and the lightest record that satisfies a requirement.",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Some states require a specific number of instructional days or hours. Others require nothing at all. Before building any tracking habit, find out which applies to you, because tracking attendance you will never be asked for is pure overhead.",
          "Where it is required, the record needed is usually far lighter than people assume. A count of days, not a timetable.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What counts as a school day",
        paragraphs: [
          "More than people expect. A museum visit, a long piece of reading, a project afternoon, a cooking session that was genuinely maths, and a day spent on one subject all generally count.",
          "Requirements are usually expressed as days of instruction or hours of instruction, not as days that resembled a classroom. Learning that happened outside a table and a workbook still happened.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The lightest record that works",
        intro: "If your state counts days, this is enough.",
        items: [
          "A date.",
          "A tick, or a rough hours figure if your state counts hours.",
          "One or two words on what was covered, which turns an attendance record into something also useful for a portfolio.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Count as you go, because June reconstruction does not work",
        paragraphs: [
          "Reconstructing a year of attendance from memory is genuinely impossible, and unlike subject records there is nothing physical to work backwards from. There is no pile of undated worksheets that proves you did one hundred and eighty days.",
          "A grid you tick takes seconds a day. It is the one part of homeschool record keeping where doing it live is not merely better but effectively the only option.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What is pointless",
        paragraphs: [
          "Logging start and finish times, unless your state specifically requires hours. Recording which parent taught. Breaking a day into subject-by-subject minutes.",
          "None of that is asked for anywhere, and every additional column is a reason the habit dies by half term.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to check what applies to you",
        paragraphs: [
          "State requirements vary widely and change, so confirm with your state association or department of education. The overall picture is in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion records the day alongside what was covered, so one entry serves both attendance and the portfolio rather than being two separate chores. Its printed handbook includes a days-schooled page you can tick by hand, for anyone who would rather not open an app to record a tick.",
      },
    ],
  },

  {
    slug: "homeschool-records-without-a-system-you-abandon",
    title: "Keeping homeschool records without building a system you abandon",
    dek: "Why elaborate tracking dies by half term, and what the version that survives a bad week actually looks like.",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Almost every homeschooling family builds a record system in September and abandons it by half term. The system is rarely the problem in principle. It is that it was designed on a good day, for a version of the week that does not happen often.",
          "The version that survives is the one that still gets done on the bad Tuesday, and that means it has to take well under a minute.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Three things, every time",
        paragraphs: [
          "The date. The subject and roughly which part of it, where Unit 3, Lesson 12 is plenty. And one word about how it went: easy, about right, or difficult.",
          "That third field is the one people leave out and the one that turns out to be most useful in March, because it tells you where to look when something has not stuck.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What kills a system",
        intro: "Every one of these looks reasonable in September. Tick anything your current system asks of you.",
        items: [
          "More than about four fields per entry.",
          "Anything requiring a paragraph of writing per child per day.",
          "A spreadsheet that has to be opened on a computer rather than whatever is in your hand.",
          "Colour coding, which is a pleasure to design and a chore to maintain.",
          "Any tally of days missed, which converts a record into a judgement and gets the whole thing avoided.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Plan four days and record five",
        paragraphs: [
          "A family that plans five days and manages four has failed at something every single week. A family that plans four and manages four has not. The work done is identical.",
          "Recording is the same. If the habit assumes a perfect week, every ordinary week produces a gap, and gaps are what make people stop.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The fourth thing, occasionally",
        paragraphs: [
          "Once in a while something happens that no log captures. She finally understood fractions. He reads better lying on the floor. A bad two weeks turned out to be a cold rather than a problem.",
          "Write those down the day they happen, in a sentence. In three years they are the only part of this you would not want to lose, and by next month you will have forgotten every one of them.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If it already collapsed this year",
        paragraphs: [
          "That is the normal case rather than the exception, and more is recoverable than it feels like. The method is in [when you have kept nothing since October](/guides/homeschool-records-when-you-have-kept-nothing-since-october).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion is built around an entry that takes seconds and accepts backdated dates, because nobody logs every day on the day. It contains no completion percentage, no streak, and no count of days missed, which are the three features that reliably get record keeping abandoned.",
      },
    ],
  },

  {
    slug: "life-admin-with-brain-fog",
    title: "Life admin with brain fog: long covid, chronic illness, grief",
    dek: "When holding a plan in your head has stopped being reliable, the useful adjustments are not about trying harder.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Long covid, a concussion, chronic illness, grief, new parenthood, menopause and depression are very different experiences that produce one shared administrative problem: holding a plan in your head has stopped being reliable, and it used to be.",
          "That last part matters. Advice written for people who have always worked this way often misses how disorienting it is when a capability you depended on becomes intermittent.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Intermittent is harder to plan around than absent",
        paragraphs: [
          "If capacity were simply lower, you would adjust once. The difficulty is that it varies, often without warning, so a plan made on a good day assumes a version of you that may not be available on Thursday.",
          "The practical response is to build for the bad day rather than the good one, and to treat a good day as a bonus rather than as the baseline you plan against.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What actually helps",
        items: [
          "Externalise everything. Not as a list of tasks, but as the details you would otherwise hold: reference numbers, what you already tried, who you spoke to.",
          "Write the next physical action, not the goal. On a low-capacity day, call the number on the letter is achievable and sort out the insurance is not.",
          "Record where you stopped, always. Reconstruction is the most expensive part and the easiest to avoid.",
          "Do the thing that needs clarity when you have clarity, and keep low-demand tasks available for when you do not.",
          "Expect to repeat yourself to institutions, and keep notes accordingly, because you will be asked the same questions by four different people.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Phone calls are disproportionately hard",
        paragraphs: [
          "Calls demand real-time processing, memory and speech at once, which is exactly the combination that degrades. It is normal for a call that would once have been trivial to be the single hardest thing in a week.",
          "Preparation helps more here than anywhere else, because it converts a live cognitive task into reading. What to write down first is in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not let a system add a second job",
        paragraphs: [
          "Anything requiring daily maintenance to stay accurate will fail during exactly the period you needed it most, and then present you with a repair task on top of everything else.",
          "The test worth applying is what happens after you ignore it for three weeks. Some tools are still broadly right and still useful. Others become misleading and demand an hour before they help again.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Nothing here needs a diagnosis",
        paragraphs: [
          "You do not need a label to need this. The difficulty is the same whatever produced it, and none of the practical adjustments depend on knowing why.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built for the difficulty rather than the diagnosis, and asks nothing about medical history because it does not need to. It holds the details on screen while you deal with something, returns you to the exact question you left if you stop, and records nothing at all about an attempt you did not finish.",
      },
    ],
  },

  {
    slug: "executive-dysfunction-is-not-procrastination",
    title: "Executive dysfunction is not procrastination",
    dek: "They look identical from outside and are different from inside. Why the distinction changes which strategies work.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "From the outside they are indistinguishable. Something needed doing, time was available, and it did not happen.",
          "From the inside they are not similar at all, and the difference decides which strategies do anything. Procrastination involves choosing something more pleasant. Executive dysfunction involves choosing nothing, often while doing something you are not enjoying either.",
        ],
      },
      {
        kind: "table",
        heading: "The difference in practice",
        columns: ["", "Procrastination", "Executive dysfunction"],
        rows: [
          ["What you are doing instead", "Something more appealing", "Often nothing, or something you are not enjoying"],
          ["How it feels", "Avoidance, with some relief", "Stuck, with no relief"],
          ["Does knowing the stakes help", "Sometimes", "Rarely, and pressure often makes it worse"],
          ["Does breaking it down help", "A little", "Considerably, if broken small enough"],
          ["What is actually missing", "Willingness to start now", "The ability to initiate at all"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the standard advice misfires",
        paragraphs: [
          "Most productivity advice assumes procrastination, so it raises stakes: set a deadline, picture the consequences, promise yourself a reward. That works when the barrier is willingness.",
          "When the barrier is initiation, raising stakes adds pressure to a system that is already stalled, and the reliable result is more distress and the same amount of nothing done.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What works instead",
        paragraphs: [
          "Lowering the entry cost rather than raising the stakes. Making the first action physically tiny. Removing decisions rather than adding motivation. Putting the context in front of you so starting does not require assembling anything.",
          "The concrete version of that is in [task paralysis, what to do in the next ten minutes](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "This is a description, not a diagnosis",
        paragraphs: [
          "Executive function difficulties appear in ADHD, and also in depression, anxiety, long covid, concussion, chronic illness, grief and ordinary exhaustion. Recognising the pattern does not tell you what caused it.",
          "If it is persistent and affecting your life, that is worth raising with somebody qualified. Nothing here is medical advice, and it does not need to be for the practical adjustments to help.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the distinction is worth making at all",
        paragraphs: [
          "Mostly because of what people conclude about themselves. If you believe you have been choosing comfort over responsibility for years, you draw one conclusion about your character. If you understand that the starting mechanism itself was not firing, you draw a different and more accurate one.",
          "That second conclusion also happens to lead to strategies that work.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built around initiation rather than motivation. It shows one thing rather than a list to evaluate, breaks down anything too big into a first action, and holds the context on screen so starting does not require assembling it. It contains no streak and no score, because pressure is the thing that makes this worse.",
      },
    ],
  },

  {
    slug: "what-to-keep-on-paper-when-you-travel",
    title: "What to keep on paper when you travel",
    dek: "Your phone is a single point of failure. The short list worth printing, and why it is shorter than you think.",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A phone at four percent in a taxi with no charger is not a rare event. Neither is no signal on landing, roaming that has not activated, or handing the phone to a child for eleven minutes.",
          "None of that is an argument against using a phone. It is an argument for one page of paper that works when the phone does not.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What goes on the page",
        intro: "Short enough to fit on one side, or it will not get printed.",
        items: [
          "Where you are staying, with the address in the local language if that is not yours.",
          "Confirmation references for flights, stays and transfers.",
          "One phone number per booking that a human will actually answer.",
          "Travel insurance policy number and its emergency assistance line.",
          "Passport numbers for everybody travelling.",
          "One contact at home who could help, and who knows your plans.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The address in the local language",
        paragraphs: [
          "This is the item that earns its place most often, and the one almost nobody thinks of. A taxi driver who does not read your alphabet can read the address as written locally.",
          "It costs nothing to include and resolves the specific situation where you are tired, in the wrong place, and cannot explain where you need to be.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What not to put on it",
        paragraphs: [
          "Card numbers, passwords, and anything that would be genuinely damaging if the page were lost. This document is deliberately carried around, which means it should be safe to lose.",
          "Passport numbers are a judgement call. They are useful for reporting a loss and are worth carrying separately from the passports themselves rather than in the same pocket.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Two copies, in different bags",
        paragraphs: [
          "One in hand luggage, one in a different bag or with a different traveller. The failure mode you are protecting against includes losing a bag, and a single copy in the lost bag helps nobody.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "It is also useful when nothing has gone wrong",
        paragraphs: [
          "Handing somebody the page is faster than reading a reference aloud from a screen, and it means the person at the desk can read it themselves. Small, but it is the everyday case rather than the emergency one.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion prints My Trip Book, a blank structured planner covering bookings, travellers, documents, daily pages and the connection pages that are the point of the product. It is modular, so a trip with three destinations prints three destination pages rather than forcing a fixed planner on you, and it works with a pen and nothing else.",
      },
    ],
  },

  {
    slug: "what-to-check-before-each-direct-debit-date",
    title: "What to check before each direct debit date",
    dek: "A two minute habit that prevents the most common cause of a failed payment, which is almost never a lack of money.",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most failed payments are not caused by having no money. They are caused by having money that was already committed, in an account the payment was not coming from, or on a day the timing did not work.",
          "Two minutes before the busiest date in your month prevents nearly all of it.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The check",
        items: [
          "What is due between now and your next payday, not just tomorrow.",
          "Which account each one comes from, because the money being somewhere is not the same as it being in the right place.",
          "Whether anything has changed amount. Annual increases arrive without announcement more often than they should.",
          "Whether this month has an unusual gap, which happens when a payday falls awkwardly or a month is five weeks.",
          "Whether anything you committed to recently has not gone out yet.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Cluster the dates rather than spreading them",
        paragraphs: [
          "Most providers will move a payment date on request, and it is usually a two minute call or a setting.",
          "Getting the majority of them within a few days of payday means one moment of exposure per month instead of a slow drip of small risks across four weeks. It also makes the check above take one look instead of several.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Annual payments are the ones that catch people",
        paragraphs: [
          "A yearly insurance renewal or subscription is invisible in a monthly view and lands as a single large amount in a month you had planned normally.",
          "Knowing which month each annual payment falls in is worth more than tracking any monthly one, because those are the months where a routine plan is quietly wrong.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If one has already failed",
        paragraphs: [
          "Acting within a few days keeps it a minor matter, and the steps are in [you missed a payment](/guides/you-missed-a-payment-what-to-do-next).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion holds your bills and subscriptions with their due dates and accounts, and counts them against what is genuinely available rather than against your balance. When a bill has no due date recorded it says the figure is preliminary instead of quietly leaving it out.",
      },
    ],
  },

  {
    slug: "can-you-afford-it-before-you-buy-it",
    title: "Working out whether you can afford it, before you buy it",
    dek: "A quick way to answer the question at the moment it matters, without a spreadsheet and without guessing.",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The question is almost never whether you have the money today. It is whether spending it today causes a problem in eleven days, and that is a harder thing to answer standing in a shop.",
          "The useful version takes about thirty seconds and needs one number you should already have.",
        ],
      },
      {
        kind: "timeline",
        heading: "The thirty second version",
        steps: [
          {
            when: "Start with",
            what: "What is genuinely available, which is your balance minus protected money minus everything committed before your next payday.",
          },
          { when: "Subtract", what: "The cost of the thing." },
          { when: "Divide", what: "What remains by the number of weeks until payday." },
          {
            when: "Then ask",
            what: "Whether you could live on that weekly figure. That is the actual question.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Weekly is the frame that works",
        paragraphs: [
          "A remaining balance of four hundred sounds fine and means very different things depending on whether payday is Friday or three weeks away.",
          "Converting to a weekly figure removes that ambiguity and is the single most useful thing you can do with a spending decision, because you already have an instinct for what a normal week costs you.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Watch for the annual ones",
        paragraphs: [
          "The most common way this goes wrong is a large annual payment landing in the same period. Insurance, a subscription renewal, a tax bill.",
          "If your available figure does not account for those, it is optimistic in exactly the months you can least afford it to be.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Instalments are not free",
        paragraphs: [
          "Splitting a payment reduces today's impact and adds a fixed commitment to the next several months, which reduces every future version of the number you just calculated.",
          "That can be a perfectly reasonable trade. It is only a problem when the decision is made against today's balance without noticing that future months got smaller.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the number comes from",
        paragraphs: [
          "All of this depends on having a trustworthy available figure, which your banking app does not provide. The method for building one is in [how much of your money is actually safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Monthly Money Reset gives you a safe-to-spend figure and a rough weekly guide, free. Personal Finance Companion does the same across accounts, bills, subscriptions and debts, shows how it reached the number, and tells you when a missing due date makes it preliminary rather than presenting false precision.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 6
  // The last four. Two finish their areas, and two are the cross-cutting
  // pieces that needed the SERIES value added above, because they
  // describe the category rather than a domain.

  {
    slug: "homeschool-records-what-to-keep-and-what-to-bin",
    title: "Homeschool records: what to keep, and what you can safely throw away",
    dek: "You cannot keep everything and you do not need to. What is worth archiving, what to photograph, and what to recycle without guilt.",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "By March most homeschooling families have more paper than shelf. The instinct is to keep all of it, because throwing away a child's work feels like throwing away the year.",
          "It is not. A representative sample proves a year far better than a complete archive, and it is the version you might actually be able to find something in.",
        ],
      },
      {
        kind: "table",
        heading: "What to do with what",
        columns: ["Item", "What to do", "Why"],
        rows: [
          ["Dated work showing progress", "Keep", "Two points in a year is the most persuasive evidence there is"],
          ["Standardised test results", "Keep permanently", "Slow to replace and sometimes needed years later"],
          ["Evaluator reports", "Keep permanently", "Proof the year was reviewed and accepted"],
          ["Your own log", "Keep permanently", "The only record that ties everything together"],
          ["Large projects and models", "Photograph, then recycle", "They prove nothing in a box in a loft"],
          ["Daily worksheets and drills", "Keep a handful, recycle the rest", "Fifty identical sheets say nothing fifty times"],
          ["Curriculum you have finished with", "Sell or pass on", "Worth real money to another family"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Photograph the things that cannot be filed",
        paragraphs: [
          "Models, posters, science experiments, anything three dimensional. A dated photograph is genuinely better evidence than the object, because it can go in a portfolio and the object cannot.",
          "It also solves the thing nobody says out loud, which is that the object was going to be thrown away in eighteen months anyway, quietly, when nobody was looking.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep a spread, not a highlight reel",
        paragraphs: [
          "Three pieces from across the year beats twelve from one strong two week stretch. Keep something ordinary alongside something good, and keep at least one thing that was difficult.",
          "A file of only polished work reads as curated, and it hides the thing that is actually impressive, which is the distance travelled between October and March.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check your state before discarding anything",
        paragraphs: [
          "A few states have specific retention expectations, and portfolio states in particular may want material available for a set period after the year ends.",
          "The overall position is in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The sentimental pile is allowed",
        paragraphs: [
          "Keep the first story they wrote and the drawing that made you laugh. That is a different pile with a different purpose, and it should not be confused with the compliance one.",
          "Mixing them is what produces a box nobody can search, containing both a legal record and a birthday card.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion keeps the log that ties everything together, which is the one record you cannot reconstruct from a box of paper. It prints as a per-child record covering what was done and when, so the paper you keep can be a genuine sample rather than the whole year.",
      },
    ],
  },

  {
    slug: "diagnosed-at-forty-the-admin-nobody-warned-you-about",
    title: "Diagnosed at forty: the admin nobody warned you about",
    dek: "Most adults with ADHD were diagnosed as adults. What changes afterwards, what does not, and the paperwork nobody mentions.",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A great many adults with an ADHD diagnosis received it in adulthood rather than as a child. It is no longer an unusual situation, though it can feel like one at the time.",
          "Two things tend to arrive together afterwards. A great deal of retrospective reinterpretation, and an unexpected pile of administration.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The reinterpretation comes first",
        paragraphs: [
          "Most people spend the following months revisiting the past: jobs that went wrong, a degree that took longer, relationships where the same argument kept happening, the persistent sense of underperforming relative to effort.",
          "That process is worth having and it is not the subject of this guide. The subject is the far less discussed part, which is that a diagnosis creates work.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The admin that follows",
        intro: "Very little of this gets mentioned in the appointment.",
        items: [
          "Titration, if you are medicating, which means repeat appointments and often repeat prescriptions on a short cycle.",
          "Pharmacy logistics, which for controlled medication can mean a specific pharmacy, a limited window, and supply problems.",
          "Employer conversations, if you choose to have them, plus any adjustments process.",
          "Insurance and, in some countries, a disclosure question you now have to answer differently.",
          "Driving authorities in some jurisdictions, depending on medication.",
          "Records from a private assessment needing to reach a public system, or vice versa, which is rarely automatic.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The irony is not lost on anybody",
        paragraphs: [
          "A condition characterised by difficulty with sustained administration is diagnosed, and the treatment pathway is administration on a recurring schedule with real consequences for missing a step.",
          "Naming that is genuinely useful, because people tend to interpret struggling with it as evidence they are handling the diagnosis badly. It is not. It is the single least accommodating part of the process.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What helps with this specifically",
        paragraphs: [
          "Treat the repeat prescription cycle as a recurring appointment rather than as a task, because it has a date and a consequence and does not respond to being remembered vaguely.",
          "Keep the reference numbers together: clinic, prescription, pharmacy. You will be asked for them repeatedly by people who cannot see each other's systems.",
          "And expect to repeat your own history to several different professionals. Written down once, it stops being a thing you have to reconstruct while sitting in front of somebody.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The backlog does not clear itself",
        paragraphs: [
          "Diagnosis explains the pile. It does not remove it, and there is often a period of disappointment when that becomes clear.",
          "What tends to change is the approach: less trying harder, more building around the difficulty. The starting point for the things that have sat longest is in [when something has been left so long it is embarrassing](/guides/when-something-has-been-left-so-long-it-is-embarrassing).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion holds the things you are carrying and brings them back when they actually matter, including the recurring ones with a date attached. It never asks about a diagnosis, medication or symptoms, because it is built for how this feels rather than for why, and it holds no medical information at all.",
      },
    ],
  },

  {
    slug: "life-admin-the-work-nobody-teaches-you",
    title: "Life admin: the work nobody teaches you and everybody has",
    dek: "Nobody is trained for it, it is invisible when done, and it is most of what makes an adult life run. A name for the category.",
    publishedAt: "2026-08-30",
    areaSlug: SERIES,
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is a category of work that nobody teaches, nobody schedules, and nobody notices until it goes wrong. Renewing things. Chasing things. Knowing where documents are. Remembering that the boiler needs servicing and that a pension exists from a job you left in 2014.",
          "It has no agreed name, which is part of why it stays invisible. Life admin is the closest thing we have.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Three properties that make it uniquely awkward",
        paragraphs: [
          "It is invisible when it goes right. Nobody notices the insurance that renewed correctly, so there is no feedback and no credit, only the absence of a problem.",
          "It is connected. Almost nothing sits alone. A flight moves and three bookings become wrong. An address changes and eleven organisations need telling. A person dies and a hundred small facts turn out to have lived in one head.",
          "It arrives at bad moments. Bereavement, illness, moving, separation, a new baby. The administrative load and the capacity to handle it are almost perfectly inversely correlated.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why generic tools do not help",
        paragraphs: [
          "A to-do list assumes the difficulty is remembering. For most of this it is not. The thing has been remembered constantly for weeks.",
          "A calendar wants a date you do not have yet. A note-taking app holds text and knows nothing about how any of it relates. A spreadsheet holds facts and cannot tell you that changing one makes three others wrong.",
          "The gap in all of them is the same: they store, and this work needs something that understands connection.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What this work actually needs",
        intro: "Tick whatever you already have somewhere. Most people find they have the first and none of the rest.",
        items: [
          "Somewhere to put a detail so it is not held in your head.",
          "Something that knows how the details relate, so one change surfaces what else it touches.",
          "A short honest answer to what needs attention now, derived from real dates rather than invented urgency.",
          "Help at the hard moment itself, which is usually a call or a form rather than the deciding.",
          "Quiet when there is nothing, because most weeks genuinely need very little.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "It is unevenly distributed",
        paragraphs: [
          "In most households one person carries the majority of this, usually without it being discussed. It is often described as being organised, which frames a workload as a personality trait.",
          "It is worth naming for that reason alone. Work that has no name is difficult to divide, difficult to hand over, and easy to assume somebody is simply better suited to.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The competence trap",
        paragraphs: [
          "People conclude they are bad at admin. Usually what has happened is that the amount is genuinely large, the tools are genuinely poor, and holding several hundred connected facts in a human memory was never a realistic expectation.",
          "The productivity industry has spent decades selling harder trying as the solution. More on why that keeps failing in [why productivity tools fail at life admin](/guides/why-productivity-tools-fail-at-life-admin).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion Series",
        body: "Draftpace makes one Companion per area of this work: money, home, mind and focus, family and learning, affairs and endings, and travel. Each holds the state and the connections for one domain, works out what genuinely needs you now, and stays quiet when nothing does. None of them has a streak, a score, or a screen that tells you that you are behind.",
      },
    ],
  },

  {
    slug: "why-productivity-tools-fail-at-life-admin",
    title: "Why productivity tools fail at life admin specifically",
    dek: "They were designed for knowledge work, and life admin has different properties. Four mismatches that explain the abandoned apps.",
    publishedAt: "2026-08-30",
    areaSlug: SERIES,
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most productivity tools were designed around knowledge work: projects with owners, tasks with estimates, boards that move left to right. Applied to a job, they work reasonably well.",
          "Applied to renewing a passport, chasing a refund and remembering the boiler service, they fall apart. Not because they are badly made, but because life admin has four properties the design never accounted for.",
        ],
      },
      {
        kind: "compare",
        heading: "The four mismatches",
        left: {
          label: "Knowledge work assumes",
          items: [
            "Tasks are independent.",
            "The problem is remembering.",
            "Work happens in sessions.",
            "More visibility helps.",
          ],
        },
        right: {
          label: "Life admin actually is",
          items: [
            "Almost everything is connected to something else.",
            "You have remembered it constantly for three weeks.",
            "It arrives in interruptions, often at the worst moment.",
            "Seeing all of it at once is the thing that stops you.",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "Independence is the big one",
        paragraphs: [
          "A board of tasks treats every card as a separate thing. Life admin is a web: change your address and eleven things become wrong, move a flight and three bookings need looking at, and a death makes a hundred facts urgent at once.",
          "No general purpose tool models that, because modelling it requires knowing what kind of thing each item is. A tool that does not know a transfer was booked around a flight cannot tell you anything useful when the flight moves.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The maintenance tax",
        paragraphs: [
          "Every general tool needs feeding. Categorise the transactions, update the board, tidy the tags. That upkeep is tolerable at work, where it is part of the job and happens in working hours.",
          "For personal admin it is a second job with no deadline and no colleague noticing, so it stops. And once the data is stale the tool is worse than nothing, because now it is confidently wrong.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Scores and streaks make it actively worse",
        paragraphs: [
          "Gamification assumes you need motivating. For work that arrives during bereavement, illness and moving, a counter of how many days you have failed is not a motivator. It is a reason to close the app.",
          "The reliable outcome is deletion, which takes the only record of what actually needed doing with it.",
        ],
      },
      {
        kind: "list",
        heading: "What a tool for this has to do differently",
        ordered: true,
        items: [
          "Know what kind of thing each item is, so it can understand relationships instead of storing rows.",
          "Derive what matters from stored facts rather than asking you to prioritise a list.",
          "Stay roughly right when ignored for a month, because it will be.",
          "Say plainly when nothing needs you, and mean it.",
          "Never score the person using it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Which is why these are separate products",
        paragraphs: [
          "Understanding that a transfer depends on a flight, or that a warranty requires an annual service, or that a pension nomination overrides a will, requires knowing the domain. A single tool covering everything would have to know all of it, which is how you end up with something that stores rows and understands nothing.",
          "The wider case for the category is in [life admin, the work nobody teaches you](/guides/life-admin-the-work-nobody-teaches-you).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion Series",
        body: "Each Draftpace Companion covers one area and knows what the things in it are, which is what lets it tell you that one change affects three others. None requires daily upkeep to stay useful, none contains a streak or a score, and each says plainly when nothing needs you.",
      },
    ],
  },
];

/**
 * Words per minute used for reading time.
 *
 * 225 is the middle of the usual adult silent-reading range for
 * non-technical prose. The exact figure matters less than the fact that
 * it is applied consistently and derived rather than typed.
 */
const WORDS_PER_MINUTE = 225;

/**
 * Reading time, counted from the guide's own words.
 *
 * These used to be hand-typed strings and every one of the fifty four
 * was wrong, most by about three times: a 545 word article carried a
 * "10 min read" label. That is a false statement rendered on every
 * article header and every index card, so the number is now computed
 * and there is nowhere left to type a wrong one.
 */
export function readingMinutes(guide: Guide): number {
  const words = guide.body
    .flatMap(blockStrings)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** The same figure, phrased for display. */
export function readingTimeLabel(guide: Guide): string {
  return `${readingMinutes(guide)} min read`;
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

/** Guides belonging to a life area, in publication order. */
export function guidesForArea(areaSlug: string): Guide[] {
  return GUIDES.filter((guide) => guide.areaSlug === areaSlug);
}

/** Areas that currently have at least one guide, so an empty hub is never linked. */
export function areasWithGuides() {
  return LIFE_AREAS.filter((area) => guidesForArea(area.slug).length > 0);
}

/**
 * The guide before and after this one within its own area.
 *
 * Reading order inside an area is publication order, which is the order
 * the hub lists them in, so previous and next agree with what the
 * reader just saw. An orphan has no neighbours by definition.
 */
export function adjacentGuides(guide: Guide): { previous?: Guide; next?: Guide } {
  if (!guide.areaSlug) return {};
  const siblings = guidesForArea(guide.areaSlug);
  const index = siblings.findIndex((candidate) => candidate.slug === guide.slug);
  if (index === -1) return {};
  return { previous: siblings[index - 1], next: siblings[index + 1] };
}

/**
 * A published date a person would write, from the stored ISO date.
 *
 * Built from the UTC parts rather than through the local calendar,
 * which is the same discipline the products use for stored dates: a
 * reader in Auckland should not see a guide published a day earlier
 * than a reader in London.
 */
export function formatGuideDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  if (!year || !month || !day || !months[month - 1]) return iso;
  return `${day} ${months[month - 1]} ${year}`;
}

/**
 * Up to `limit` other guides from the same area, so a reader who arrived
 * on one narrow article has somewhere to go that is not the exit.
 */
export function relatedGuides(guide: Guide, limit = 3): Guide[] {
  if (!guide.areaSlug) return [];
  return guidesForArea(guide.areaSlug)
    .filter((candidate) => candidate.slug !== guide.slug)
    .slice(0, limit);
}
