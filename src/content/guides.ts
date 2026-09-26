import { LIFE_AREAS } from "./areas";
import { HOMESCHOOL_STATE_REQUIREMENTS } from "@/lib/homeschoolStateRequirements";
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
  /**
   * The on-page H1, the browser tab, the search result title and the
   * schema headline. 30 to 60 characters, the phrase a person would type,
   * in sentence case. guideMeta.ts and guideMeta.test.ts hold the limits.
   */
  title: string;
  /** The subheading under the title and, unless metaDescription is set, the search snippet. 110 to 155 characters. */
  dek: string;
  /**
   * A shorter title for search results only, for the rare guide whose best
   * H1 is longer than 60 characters. Leave it out otherwise.
   */
  seoTitle?: string;
  /** A search snippet, only when the best subheading is longer than 155 characters. */
  metaDescription?: string;
  /**
   * The exact lowercase phrase this guide is written to win, two to seven
   * words, unique across guides. It is what the guide is measured against
   * and what stops two guides from competing for the same search.
   */
  primaryQuery?: string;
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
    title: "What to do when a parent dies: the first two weeks (US)",
    dek: "The few things that cannot wait, the many that can, and why to order extra death certificates. Steps in order, for a grieving week.",
    primaryQuery: "what to do when a parent dies",
    publishedAt: "2026-08-30",
    updatedAt: "2026-08-31",
    areaSlug: "affairs-and-endings",
    locale: "us",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a parent dies only a few things genuinely need doing in the first week, and many others feel urgent and are not. The difference matters, because you are being asked to do administration at the exact moment you are least able to.",
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
            what: "Ask the funeral home for certified copies of the death certificate, more than you think you need. Many institutions want their own and most will not take a photocopy.",
          },
          {
            when: "Check first",
            what: "Ask whether a prepaid funeral plan or burial policy already exists before arranging anything. Many people have one and never mention it.",
          },
          {
            when: "Within thirty days",
            what: "Secure the property. Lock it, forward the mail, and check the homeowners policy, because many insurers restrict cover once a house has been vacant for a set number of days.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why you need so many death certificates",
        paragraphs: [
          "Banks, brokerages, insurers, pension administrators, the Social Security Administration, the DMV and the county recorder will each want a certified copy, and most will not accept a scan or a photocopy. Some return them and some keep them.",
          "Ordering several through the funeral home at the outset is usually quicker than ordering them one at a time from vital records later.",
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
          "Clearing the house can wait too, and rushing it can mean throwing out papers you still need. It is fine if a closet stays full until spring.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part nobody warns you about",
        paragraphs: [
          "The hardest thing about these two weeks is rarely any single task. It is that you are reconstructing somebody's entire administrative life from the outside, without a map, while grieving. Which bank. Which 401(k). Whether there was life insurance. Whether the utilities were in their name. Who the attorney was.",
          "Families often find some of it and not the rest. Money sits unclaimed with state treasurers, subscriptions keep taking payments for years, and somebody spends a Sunday going through paper looking for a policy number that may not exist.",
          "It is worth saying plainly, because it is the thing you will think about later: this is not something you can fix now, for the person who has died. It is something you can fix for the next person, which is usually you.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion is built for the other side of this. It walks you through recording what exists and where it is kept, so nobody has to reconstruct it from the outside. It has no upload, only a place to note where a document is. It may be worth having for your own affairs, later.",
      },
    ],
  },

  {
    slug: "what-to-do-when-a-parent-dies-uk",
    title: "What to do when a parent dies: the first fortnight (UK)",
    dek: "Registering the death, getting certificates and telling the right people, in the order it is done. Rules differ across the four UK nations.",
    primaryQuery: "what to do when a parent dies uk",
    publishedAt: "2026-08-30",
    updatedAt: "2026-08-31",
    areaSlug: "affairs-and-endings",
    locale: "uk",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a parent dies only a few things genuinely need doing in the first week, and many others feel urgent and are not. The difference matters, because you are being asked to do administration at the exact moment you are least able to.",
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
            what: "Register the death with your local register office. The deadline is five days in England, Wales and Northern Ireland, and eight in Scotland.",
          },
          {
            when: "At the same appointment",
            what: "Order certified copies of the death certificate. Order more than feels sensible, because several organisations will want their own certified copy.",
          },
          {
            when: "Once it is registered",
            what: "Contact a funeral director, or check whether a plan was already paid for. Many people have one and never mention it.",
          },
          {
            when: "Within thirty days",
            what: "Secure the property. Lock it, redirect post, and if it is now empty, check what the home insurance says about unoccupied buildings, because many policies limit cover once a property has been empty for a set number of days.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why you need so many death certificates",
        paragraphs: [
          "Banks, pension providers, insurers, utilities and government departments will each want to see a certified copy, and most will not accept a photocopy or a scan. Some return them and some do not. Ordering several at registration is usually quicker than going back for more later.",
          "It is easier to have them in hand than to ask again.",
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
          "The government department handling benefits, tax and state pension, which in England, Scotland and Wales has a single service, Tell Us Once, that notifies several government departments at once. The registrar will explain it.",
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
          "Clearing the house can wait too, and rushing it can mean throwing out papers you still need. It is fine if a wardrobe stays full until spring.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part nobody warns you about",
        paragraphs: [
          "The hardest thing about this fortnight is rarely any single task. It is that you are trying to reconstruct somebody's entire administrative life from the outside, without a map, while grieving. Which bank. Which pension. Whether there was insurance. Whether the utilities were in their name. Who the solicitor was.",
          "Families often find some of it and not the rest. Money sits unclaimed, subscriptions keep taking payments for years, and somebody spends a Sunday going through paper looking for a policy number that may not exist.",
          "It is worth saying plainly, because it is the thing you will think about later: this is not something you can fix now, for the person who has died. It is something you can fix for the next person, which is usually you.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion is built for the other side of this. It walks you through recording what exists and where it is kept, so nobody has to reconstruct it from the outside. It has no upload, only a place to note where a document is. It may be worth having for your own affairs, later.",
      },
    ],
  },

  {
    slug: "how-to-find-someones-accounts-after-they-die",
    title: "How to find someone's accounts after they die",
    dek: "A search order for tracing bank accounts, pensions, policies and subscriptions when nothing was written down, starting with twelve months of statements.",
    primaryQuery: "how to find someone's accounts after they die",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is no single register you can search to find everything somebody owned. That is the honest answer, and it is why this task often takes months rather than an afternoon.",
          "What works instead is a systematic sweep of four sources: their post, their bank statements, their email, and the official tracing services that exist for pensions and unclaimed assets. Between them you have the best chance of finding it.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Start with twelve months of bank statements",
        intro: "This is one of the most useful hours you will spend, because a great deal leaves a trace here.",
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
          "A pension tracing service, where your country runs one, which can find schemes from former employers.",
          "Official unclaimed property or unclaimed money databases, where your state or country has one, which hold dormant accounts and lost policies.",
          "Their accountant, attorney or solicitor, who often knows more than the family does.",
          "The loft, the filing box, and the drawer nobody has opened, which sound like jokes and are where a great deal of this is actually found.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What you will need before anybody talks to you",
        paragraphs: [
          "Almost every institution will want a certified copy of the death certificate, proof of your own identity, and evidence of your authority to act, which usually means the will naming you as executor plus the court document appointing you, called letters testamentary in most of the United States and a grant of probate in the United Kingdom.",
          "It is worth assembling that set once and keeping it together, because you will be asked for the same three things again and again.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Accept that you will not find everything",
        paragraphs: [
          "Some accounts and pensions are never traced, often because the only person who knew about them has died. A thorough search may not find everything, and at some point continuing to look may cost more than it recovers.",
          "That is not a failure on your part. It is the predictable result of a system where the information lived in one person's head.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records the names of your banks, your pensions, your life cover and any online accounts that charge money, and where the paperwork for each is kept, so this search never has to happen to your family. It has no upload and never asks for account numbers or passwords, and it produces a printed book somebody could follow if they had to.",
      },
    ],
  },

  {
    slug: "homeschool-record-keeping-requirements-by-state",
    title: "Homeschool requirements by state: what records to keep",
    dek: "A filterable table of all 50 states and DC in four levels, from nothing filed to portfolio or formal assessment. Confirm yours at the source.",
    primaryQuery: "homeschool requirements by state",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Homeschool record requirements vary enormously between states. Some ask for nothing at all. Some want attendance only. A handful require a portfolio of work that an evaluator will actually look at.",
          "The practical takeaway is that you should know which of four levels your state falls into, and then keep slightly more than it asks for, because the cost of keeping records is small and the cost of not having them when asked is not.",
          "Laws change. Always confirm with your state homeschool association or department of education before relying on any summary, including this one.",
        ],
      },
      {
        kind: "table",
        heading: "Every state, and what it asks you to keep",
        intro: "Use the filter to find yours. The level is how much the state involves itself, not how hard homeschooling is there. Confirm against your state before relying on it, because these change.",
        columns: ["State", "Level", "What you are asked to keep"],
        // Derived, not duplicated: the Homeschooling Companion product
        // reads the same array for its own setup, and this used to be a
        // second hand-typed copy of it. One correction landed here while
        // moving it: two entries used British spelling that had slipped
        // past the locale pass already done on the rest of this layer.
        rows: HOMESCHOOL_STATE_REQUIREMENTS.map((entry) => [entry.state, entry.level, entry.note]),
      },
      {
        kind: "paragraphs",
        heading: "Which states require a portfolio",
        paragraphs: [
          "Nine jurisdictions sit in the high group: the District of Columbia, Florida, Maryland, Massachusetts, New York, Ohio, Pennsylvania, South Carolina and Vermont. In our summary, those are the states that ask for a portfolio, a formal annual assessment or prior approval of your plan. A portfolio or work samples appear in six of the nine (the District of Columbia, Florida, Maryland, Ohio, Pennsylvania and South Carolina) and in four Moderate states (Louisiana, Maine, Missouri and New Hampshire). In Louisiana, Maine and Ohio a portfolio can stand in for a test.",
          "If your state asks for a portfolio, someone may read it, and building it in April from memory is far harder than adding to it as you go.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What a portfolio usually contains",
        paragraphs: [
          "A log of what was covered, samples of work from across the year rather than only the good pieces, attendance where your state counts it, and test results or an evaluator's report where those are required.",
          "If you are in one of the nine high-regulation jurisdictions, the detail matters, and it is set out in [what actually goes in a homeschool portfolio](/guides/what-goes-in-a-homeschool-portfolio).",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to keep even where nothing is required",
        intro: "Three things are worth recording regardless of your state, because they are the ones you will most want later.",
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
        body: "Homeschooling Companion keeps the record as you go and prints it when you need it. Entries are always dated the day you make them, so it records forward from the day you start. It also lets you run short checks at home, with questions you choose, to find out honestly whether something stuck. There is no completion percentage anywhere in it, and no screen that tells you that you are behind.",
      },
    ],
  },

  {
    slug: "home-maintenance-you-skip-that-costs-the-most",
    title: "Most important home maintenance tasks: eight not to skip",
    dek: "Gutters, heating, water heater, filters, roof, alarms, grout and outdoor taps: how often each is due and what a missed one turns into.",
    primaryQuery: "most important home maintenance tasks",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Almost every house has a job that has been put off, and most have several. That is not carelessness. It is what happens when a lot of small facts and dates live nowhere except somebody's memory.",
          "The problem is that deferred maintenance does not stay the same price. A small job put off tends to turn into a bigger one. The jobs below are the ones where that is most likely.",
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
          ["Winterize outdoor taps", "Once, before first freeze", "A burst pipe inside a wall, which can be the most expensive item here"],
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
          "Treating everything as an interval is how a reminder ends up telling you to winterize in July.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base knows how often 148 common care jobs usually come round, rates each by what happens if you skip it and how much effort it takes, and understands which jobs belong to a season rather than a rolling date. It records the brand, model and service history of everything you add, so the next repair starts with facts instead of a torch and a phone camera behind the fridge.",
      },
    ],
  },

  {
    slug: "flight-changed-what-else-is-affected",
    title: "Flight schedule changed? What else in your trip to check",
    dek: "A new departure time can break your transfer, hotel check-in and dinner booking. How to find what was built on the flight and check each in order.",
    primaryQuery: "flight schedule change what else to check",
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
          "The instinct when four things are wrong is to deal with all four at once, usually by opening four browser tabs and phoning somebody while reading an email. That is how the wrong booking gets canceled.",
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
    title: "Flight delayed with a connection: what to do first",
    dek: "A delay and a connection to catch. The first twenty minutes, what to say at the desk, and what to have in hand before you reach it.",
    primaryQuery: "flight delayed missed connection what to do",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Delays are ordinary. If you have a connection, act quickly, because the other passengers on your flight will reach the same conclusion you have.",
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
          "It is worth looking into compensation afterwards.",
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
        body: "Travel Companion holds your references, your onward bookings and what depends on what, so a delay does not begin with searching six inboxes. It walks you through the call itself, including an opening line you can use or replace, and if you record the flight's new time, it shows what else was booked around it. It also prints as a blank book you fill in by hand, for when the phone is the thing that failed.",
      },
    ],
  },

  {
    slug: "how-to-make-a-phone-call-you-have-been-avoiding",
    title: "How to make a phone call you keep avoiding",
    dek: "A call is several jobs at once, which is why it stalls. Prepare five things on paper, write the first sentence out, and know when you can stop.",
    primaryQuery: "make a phone call you are avoiding",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The call is not hard because you do not know what to say. It is hard because making it requires holding several things at once: why you are calling, what outcome you want, the two facts you must not forget, and the ability to think while a stranger talks at you.",
          "Many people describe this as a problem of holding too much at once rather than a lack of motivation, which may be why telling yourself to just do it has not worked for three weeks.",
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
        body: "ADHD Life Companion walks you through calls like this one, step by step, holding the purpose and the outcome on screen so you do not have to. It gives you an opening line you can use or replace with your own, and it never tells you what to accept or settle for, because you are the one with the facts. If you close it halfway through, it picks up on the exact question you left, and stopping early changes nothing on the item.",
      },
    ],
  },

  {
    slug: "how-to-restart-a-project-you-gave-up-on",
    title: "How to restart a project you gave up on",
    dek: "Coming back costs more than starting did, mostly the rebuilding of where you got to. What to leave behind when you stop, and how to resume from there.",
    primaryQuery: "restart a project you gave up on",
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
        body: "ADHD Life Companion is built so that leaving something is not a failure. Close a run halfway through and it changes nothing on the item, then returns you to the exact question you left rather than to the beginning. Everything you had already answered is still there. There is no streak, no completion percentage, and nothing anywhere that counts what you did not get to.",
      },
    ],
  },

  {
    slug: "how-much-of-your-money-is-actually-safe-to-spend",
    title: "How much money is safe to spend after your bills?",
    dek: "Your balance is not what you can spend. Take off the bills still due and the money you are holding back, in five steps, and one number is left.",
    primaryQuery: "how much money is safe to spend",
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
          "Available balance in a banking app usually means your balance after holds and pending items, not after your upcoming bills. Those are very different things, and the gap between them is where many unexpected shortfalls come from.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why budgeting apps get dropped",
        paragraphs: [
          "Budgets often get dropped, and the usual reason is not weak willpower. It is that many budgeting systems require constant categorizing to stay accurate, and the moment you fall a week behind, the number on screen is wrong.",
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
        body: "Monthly Money Reset gives you one number for what is safe to spend this month, holds back the bills you have not paid yet, and shows a rough weekly figure for the rest of the month. It is free. Personal Finance Companion covers your whole picture with a month-level estimate, Available Money, that subtracts protected accounts and a full month of bills, subscriptions and debt minimums, shows its working, and marks itself Preliminary when a bill has no due date. Start with the free one if you are not sure.",
      },
    ],
  },

  {
    slug: "how-to-find-every-subscription-you-are-paying-for",
    title: "How to find all your subscriptions, including annual ones",
    dek: "A twelve month statement sweep in six steps, the six places forgotten charges hide, and why to compare the yearly cost, not the monthly one.",
    primaryQuery: "how to find all my subscriptions",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The subscriptions costing you the most are not the ones you think about. They are the ones you forgot, which is precisely why they are still running.",
          "Finding them takes about half an hour and needs one thing that is easy to skip: a full twelve months of statements, not three. Annual subscriptions are often the expensive ones, and they are invisible in a quarterly view.",
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
          "Nine ninety nine a month is easy to keep. A hundred and twenty dollars a year is a decision. Same money, different question, and the annual figure is the one that tells you the truth about whether you want it.",
          "Multiply everything by twelve before you decide anything, and look at the total across all of them. That number can be a surprise.",
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
        body: "Personal Finance Companion holds your subscriptions alongside your bills, with a monthly total and a decision on each one: keep, still deciding, planned to cancel. A kept annual subscription shows up in Attention when it is within 14 days of renewing, when you open the app. It does not show an annual total and it will not cancel anything for you.",
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
    title: "Home maintenance schedule: how often to service each system",
    dek: "Service intervals for heating, cooling, water, structure and safety, plus the jobs tied to a season, not a date. Your own manual wins over any table.",
    primaryQuery: "home maintenance schedule",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Maintenance advice online is often a vague seasonal checklist. What follows is more specific: how often things typically need attention in a normal house.",
          "Two rules before the table. Your own manual always wins, because a specific model may differ. And a job you have never done on a twenty year old system may need doing sooner than the interval suggests, because the interval assumes it was kept up.",
        ],
      },
      {
        kind: "table",
        heading: "Heating, cooling and water",
        intro: "The systems where neglect is most expensive, and where a missed service usually shows up in the coldest or hottest week of the year.",
        columns: ["Job", "Interval", "Why this interval"],
        rows: [
          ["Boiler or furnace service", "Annually", "Often required by warranties, and the check that catches unsafe combustion"],
          ["Replace HVAC filter", "1 to 3 months", "Depends on pets, dust and whether anyone in the house has allergies"],
          ["Flush water heater", "Annually", "Sediment builds up over time and quietly lowers efficiency"],
          ["Water heater anode rod check", "Every 3 to 5 years", "A cheap way to extend a tank's life"],
          ["Bleed radiators", "Annually, before heating season", "Trapped air means cold tops and a system working harder than it should"],
          ["Service air conditioning", "Annually, before summer", "A failure in August takes far longer to fix than one in April"],
          ["Check and clean condensate drain", "Annually", "A blocked drain is a common and avoidable cause of water damage"],
        ],
      },
      {
        kind: "table",
        heading: "Structure, water ingress and safety",
        intro: "Cheap to do, expensive to skip. A lot of water damage starts with something on this list.",
        columns: ["Job", "Interval", "Why this interval"],
        rows: [
          ["Clear gutters and downpipes", "Twice a year", "Autumn after leaf fall, and spring after winter debris"],
          ["Inspect roof and flashing", "Annually", "Roof leaks often start at a joint, not in the middle of a slope"],
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
          "A good deal of outdoor maintenance is seasonal rather than periodic. Winterizing outdoor taps belongs before the first freeze, not three hundred and sixty five days after you happened to write it down. Blowing out an irrigation system belongs in fall regardless of when it was last done.",
          "Anything that tells you to winterize in July has told you something useless, and useless reminders teach people to stop reading the useful ones.",
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
          "A common mistake when setting up a maintenance schedule is to start every interval from the day you wrote the list. That schedules a boiler service twelve months from an arbitrary Tuesday rather than twelve months from the last actual service.",
          "If you know roughly when something was last done, use that. If you genuinely do not know, treat it as due, because for most of this list an unnecessary check costs an hour and a missed one costs considerably more. There is more on which of these bite hardest in [the maintenance you skip that costs the most](/guides/home-maintenance-you-skip-that-costs-the-most).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base already knows how often 148 common care jobs usually come round, and which of them belong to a season instead. It works out what is worth doing now from when you last did it, rates each job by what happens if you skip it, and stays quiet about the rest. Snooze puts a job off for seven days.",
      },
    ],
  },

  {
    slug: "what-to-record-when-you-buy-an-appliance",
    title: "What to write down when you buy an appliance",
    dek: "Brand, model, serial number, purchase date and warranty end: five facts to write once, while the machine is in front of you, before its first repair.",
    primaryQuery: "appliance information to record",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The worst moment to look for a model number is when the thing has already broken, usually in the dark, usually with a phone torch, usually behind something heavy.",
          "Five fields, written down once while the appliance is working and accessible, remove that moment permanently. It takes a couple of minutes per item.",
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
        kind: "paragraphs",
        heading: "Where the model number usually hides",
        paragraphs: [
          "It is almost never on the front. Fridges hide it inside near the salad drawer, washing machines around the door opening, dishwashers on the edge of the door where you only see it with the door open.",
          "The full list by appliance type, including what to do when the label has worn away, is in [how to find the model number on any appliance](/guides/how-to-find-the-model-number-on-any-appliance).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the serial number matters more than you expect",
        paragraphs: [
          "A model number tells a supplier which part fits. A serial number tells a manufacturer which production run yours came from, which matters for warranty claims and for recalls.",
          "Recalls are the underrated one. Manufacturers issue them regularly and reach owners through registration, which many people skip. If you have the serial number written down somewhere findable, you can check it against a recall list in a minute.",
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
          "Many facts about a house pass through your hands in the weeks around moving in, and few of them get written down. Meter readings, which utility is with whom, where the shutoff valve is, what came with the property.",
          "A year later the boiler needs servicing and nobody remembers who installed it. Recording it while it is in front of you takes minutes and saves an afternoon.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base has fields for brand, model, purchase and install dates and warranty end, and a Notes field where a serial number can go. It shows the right fields per type of thing rather than the same form for a boiler and a lawnmower, and keeps the service history alongside them. It stores a link to where a document lives, never the document itself.",
      },
    ],
  },

  {
    slug: "where-to-look-for-a-will",
    title: "How to find a will after someone dies",
    dek: "Where wills are usually kept, in the order to search, what to do if several turn up, and what applies when there is no will at all.",
    primaryQuery: "how to find a will after someone dies",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Start with the places people actually keep wills, which are duller than you expect: a home filing box, a bedroom drawer, a safe, or with the attorney or solicitor who drafted it.",
          "Work through the list below in order. The later entries are less likely, and they exist because sometimes the will is not where anyone would expect.",
        ],
      },
      {
        kind: "timeline",
        heading: "The search order",
        intro: "Work down it rather than across it. Each place is more effort than the one before.",
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
        body: "Personal Life Affairs Companion records whether you have a will, where it is kept, who else knows, and who you would name to sort things out, so this search never has to happen. It holds the location, and it has no upload for the document itself. It also produces a printed book, which is the format that actually survives the situation where somebody cannot get into an account.",
      },
    ],
  },

  {
    slug: "named-executor-what-you-agreed-to",
    title: "Named executor of a will: what you agreed to (US)",
    dek: "What an executor does, how long it takes, where you can be personally liable, and how to say no if you cannot take the role on.",
    primaryQuery: "named executor what to do",
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
          "Even a simple estate takes many months. Anything involving real property, a business, out of state assets or a disagreement between beneficiaries takes considerably longer, and two years is not unusual.",
          "The slow parts are rarely the ones people expect. Waiting for probate, waiting for a property to sell, and waiting for tax clearance take far longer than any of the tasks you actually perform.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part worth taking seriously",
        paragraphs: [
          "Executors can be held personally liable for mistakes. Distributing the estate before debts are settled is the classic one: if a creditor appears afterwards, the shortfall can land on you rather than on the beneficiaries who already spent it.",
          "This is why the order matters, and why you wait out your state creditor claim period before distributing anything. That window is set by state law, so ask the probate court or an attorney how long it is where your parent lived. Executors of anything complicated usually involve a probate attorney, paid from the estate rather than from their own pocket.",
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
        body: "Personal Life Affairs Companion is for the other side of this: recording what exists and where it is kept, in a printed book somebody could follow. If you are doing this now, it may be worth doing your own later.",
      },
    ],
  },

  {    slug: "named-executor-what-you-agreed-to-uk",
    title: "Named as an executor: what you agreed to (UK)",
    dek: "What an executor does in the UK, how long probate takes, where you can be personally liable, and how to step aside before you start.",
    primaryQuery: "named as executor uk what to do",
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
          "Even a simple estate takes many months. Anything involving property, a business, overseas assets or a disagreement between beneficiaries takes considerably longer, and two years is not unusual.",
          "The slow parts are rarely the ones people expect. Waiting for probate, waiting for a property to sell, and waiting for tax clearance take far longer than any of the tasks you actually perform.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The part worth taking seriously",
        paragraphs: [
          "Executors can be held personally liable for mistakes. Distributing the estate before debts are settled is the classic one: if a creditor appears afterwards, the shortfall can land on you rather than on the beneficiaries who already spent it.",
          "This is why the order matters, and why the standard advice is to look for creditors before distributing anything. It is also why executors of anything complicated usually involve a solicitor, paid from the estate rather than from their own pocket. In England and Wales, a notice under section 27 of the Trustee Act 1925 gives protection against claims you did not know about. Scotland and Northern Ireland have their own rules.",
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
        body: "Personal Life Affairs Companion is for the other side of this: recording what exists and where it is kept, in a printed book somebody could follow. If you are doing this now, it may be worth doing your own later.",
      },
    ],
  },

  {
    slug: "the-if-something-happens-to-me-file",
    title: "The if-something-happens-to-me file: what goes in it",
    dek: "A plain record of what exists and where it is kept, so no one has to rebuild your life from outside. It is not a will, and it is done in passes.",
    primaryQuery: "if something happens to me file",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A will says who gets what. It does not say which bank, which pension, where the deeds are, who your accountant is, or that there is a policy nobody knows about.",
          "That gap is what leaves families searching for months. The fix is a plain record of what exists and where it is kept, which can be built in a few short sittings and is entirely separate from any legal document.",
          "If you have no estate documents yet, this file is a far better place to start than a will, because it is useful immediately and requires nobody's signature.",
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
          "Anything that would surprise somebody, which is often the most useful line in the file.",
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
        body: "Personal Life Affairs Companion covers much of this file. It sequences the job so it has a beginning instead of being a folder of blank forms, works out which parts are even relevant to you, and prints a book somebody could follow. It asks where things are kept, not for the things themselves, and it has no upload.",
      },
    ],
  },

  {
    slug: "hotel-cannot-find-your-reservation",
    title: "Hotel can't find your reservation: what to say",
    dek: "The desk says there is no booking. Which references and names to try, what to ask for tonight, and a two-sentence opening to use at the counter.",
    primaryQuery: "hotel can't find my reservation",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Often the reservation exists and is filed under something you did not expect: a different surname, the name of whoever paid, a third party booking site's own reference rather than the hotel's, or a slightly different spelling.",
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
          "If they are full, ask whether they can find you a room at a comparable hotel. Get the name of who you spoke to and a reference before you leave the desk, because whoever you deal with next will not know any of this.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Then check what else this affects",
        paragraphs: [
          "If your stay moves, anything you booked around it may need a look. A dinner reservation, a transfer to the airport, a tour with a pickup at the hotel.",
          "This is the part that catches people the next morning rather than that night, and it is covered properly in [working out what else your trip depends on](/guides/flight-changed-what-else-is-affected).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion keeps the confirmation reference and title of each booking in one place, so this conversation starts with facts rather than a search through six inboxes. It walks you through the exchange itself, including an opening line you can edit or replace, and it never tells you what to accept or settle for. If the stay's time changes and you record it, it shows what else was booked around it.",
      },
    ],
  },

  {
    slug: "homeschool-record-keeping-template",
    title: "Homeschool record keeping template: four columns to copy",
    dek: "Date, subject and part, one word on how it went, and an occasional note. What to leave off, and how to choose paper, a spreadsheet or an app.",
    primaryQuery: "homeschool record keeping template",
    publishedAt: "2026-08-31",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Search for a homeschool record keeping template and you will find hundreds. Most of them are beautiful, most of them ask for eight fields per child per day, and most of them are abandoned somewhere around October.",
          "The template is not the hard part. Keeping it is. So what follows is the smallest structure that still shows what happened, and the reasoning for why each column earns its place.",
        ],
      },
      {
        kind: "table",
        heading: "The four columns that earn their place",
        intro: "Copy this into whatever you already open every day. A notebook is fine. The format matters far less than whether it gets filled in.",
        columns: ["Column", "Example", "Why it is there"],
        rows: [
          ["Date", "14 Oct", "Requirements that count days or ask for a log are anchored to dates. Without them you have anecdotes."],
          ["Subject", "Maths", "Evaluators and states ask what was covered, by subject, not by activity."],
          ["What part", "Unit 3, Lesson 12", "Turns a year into a sequence somebody can follow. This is the column that helps show progress."],
          ["How it went", "Difficult", "One word. It is the only column that helps you rather than an evaluator, and it is the one you will be glad of in March."],
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to leave off, and why",
        paragraphs: [
          "Hours, unless your state counts them. Most do not, and logging time turns a thirty second job into a two minute one.",
          "Color coding. It is a pleasure to design and a chore to maintain, and it is a common reason a system gets dropped.",
          "Anything requiring a written paragraph per child per day. Nobody sustains that past October, and the version you abandon in October is worth less than the crude one you keep all year.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to add occasionally, not daily",
        intro: "These are the things that make a record persuasive rather than merely complete. Once a term is plenty.",
        items: [
          "A dated sample of work per subject, ordinary rather than the best one.",
          "The curriculum or materials you are using, and any change of them mid year.",
          "A photograph of anything three dimensional, which is better evidence than the object itself.",
          "One sentence about something that happened. She finally understood fractions.",
          "Test or evaluation results, if your state requires them.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Paper, spreadsheet or app",
        paragraphs: [
          "All three work. The question is which one is open when the lesson finishes, because a record made an hour later is a record made from memory.",
          "Paper wins on friction and loses on searching. A spreadsheet wins on totals and loses because it usually lives on a computer rather than in your hand. Whatever you pick, the test is whether you can complete an entry in under thirty seconds.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check what your state asks before you design anything",
        paragraphs: [
          "Eight jurisdictions file nothing with the state, and nine sit in our top level, where a portfolio, a formal assessment or prior approval of your plan is part of the picture. Building for the strictest standard when you live in Texas wastes a weekend.",
          "The full position is in [homeschool record keeping requirements, state by state](/guides/homeschool-record-keeping-requirements-by-state), and what a portfolio needs is in [what actually goes in a homeschool portfolio](/guides/what-goes-in-a-homeschool-portfolio).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion is these four fields and nothing else, with the date filled in for you. The date is always the day you record, so it records forward from the day you start, and it prints a record per child covering what was done and when. There is no tally of days missed and no score, because a record that judges you is a record that gets avoided.",
      },
    ],
  },

  {
    slug: "what-goes-in-a-homeschool-portfolio",
    title: "What to include in a homeschool portfolio, by subject",
    dek: "The five core contents, what to keep per subject, and why October and March samples say more than a highlight reel. Check your state's rules.",
    primaryQuery: "what to include in a homeschool portfolio",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A portfolio is a record that your child was educated. It is not a scrapbook of best work, and it is not a performance. Evaluators are generally checking that something coherent happened across the year, not judging whether it was excellent.",
          "In our summary of state requirements, a portfolio or work samples appear in ten jurisdictions: the District of Columbia, Florida, Louisiana, Maine, Maryland, Missouri, New Hampshire, Ohio, Pennsylvania and South Carolina. In Louisiana, Maine and Ohio a portfolio can stand in for a test. Requirements differ, so check yours in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state) and with your state association.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The core contents",
        intro: "A typical portfolio holds these five things.",
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
          "Include something from October and something from March on the same subject. Progress across a year is one of the clearest things a portfolio can show, and it is invisible if everything came from the same two weeks.",
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
          "A reading log that only contains finished books is a less honest record and, oddly, a less impressive one. A child who is allowed to stop reading something may well keep starting things.",
          "Note what was abandoned and roughly why. It shows judgement developing, which is a more interesting thing to evidence than volume.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Build it as you go, or it will not exist",
        paragraphs: [
          "The usual failure mode is this: nothing is kept until spring, and then a weekend disappears into reconstructing a year from undated worksheets and memory.",
          "A folder per child and a habit of dropping things in as they happen is enough. It does not need a system. It needs to take under a minute so it survives a bad week.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion keeps the log as you go and prints a record per child when you need one. Entries are always dated the day you make them. It also lets you run short checks at home, with questions you choose, to find out honestly whether something stuck, with four possible answers including not enough to say.",
      },
    ],
  },

  {
    slug: "why-to-do-lists-make-it-worse",
    title: "Why to-do lists do not work when starting is the problem",
    dek: "A list assumes remembering is the hard part. When you have remembered for weeks, starting is what stalls. Three ways lists get in the way, and what helps.",
    primaryQuery: "why to-do lists do not work",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The premise of a to-do list is that the hard part is remembering. For many people it is not the hard part. The thing has been remembered constantly, at volume, for three weeks. Writing it down again adds nothing.",
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
          "For anybody already carrying a background hum of being behind, this can backfire. It converts a neutral pile of admin into a running record of personal failure, and a common outcome is that the app gets deleted, along with the only record of what actually needed doing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The real question is not what, it is how to start",
        paragraphs: [
          "For most stuck tasks you already know exactly what needs doing. What you cannot do is hold the purpose, the outcome, and the details all at once while a stranger talks at you.",
          "Many people find this is less about motivation and more about holding too much at once, and that it helps to have those things written down in front of you rather than being reminded again. That is worked through properly in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion shows what deserves attention now, based on dates you chose, things you are waiting on, and things you left off, and says plainly when nothing does. It walks you through the things that are hardest to start, holding the context on screen. There is no streak, no completion percentage, and no counter of what you did not get to. Something you close halfway changes nothing on the item.",
      },
    ],
  },

  {
    slug: "available-balance-vs-current-balance",
    title: "Available vs current balance: which one can you spend?",
    dek: "Current balance counts what has posted. Available balance also subtracts holds and pending items. Neither one knows about the bills still coming.",
    primaryQuery: "available balance vs current balance",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Available balance in a banking app is a technical term. It means your current balance minus holds and pending debits, plus any overdraft line your bank includes. It does not mean money that is free for you to use.",
          "The gap between those two ideas is where many unexpected shortfalls come from, and it is predictable once you know what the number leaves out.",
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
            "Any overdraft line your bank adds in.",
            "Most holds and pending card purchases.",
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
            "An autopay due on Friday that has not been taken yet.",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "The overdraft problem",
        paragraphs: [
          "Some banks include an overdraft line inside the available figure. That means the number can be several hundred higher than the money you actually have, and nothing on screen distinguishes the two.",
          "It is worth finding out once whether yours does this. It changes how you should read every balance you have looked at for years.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Pending transactions cut both ways",
        paragraphs: [
          "A card payment can sit pending for days. Some banks subtract it from available immediately, some do not, and hotel or rental car pre-authorizations can hold amounts far larger than the final charge.",
          "So the balance can be pessimistic and optimistic at once: reserving money that will be released, while ignoring an autopay due on Friday.",
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
        body: "Personal Finance Companion shows Available Money, a month-level estimate: your balances, minus protected accounts, minus a full month of bills, subscriptions and debt minimums, with the working shown. It marks the figure Preliminary when a bill has no due date. Monthly Money Reset, which is free, subtracts only the protected bills you have not yet paid.",
      },
    ],
  },

  {
    slug: "why-budgeting-apps-stop-working-after-two-months",
    title: "Why budgets get dropped, and what one that lasts needs",
    dek: "Upkeep piles up and the number goes wrong. Four ways budgeting tools break, and five traits of one still in use after month two.",
    primaryQuery: "why do budgets fail",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Budgets often get dropped, and that is usually presented as a discipline problem. It is mostly a design problem.",
          "Many budgeting tools require continuous manual upkeep to stay accurate. Miss a week of categorizing and the figures on screen are wrong. Once they are wrong you stop trusting them, and once you stop trusting them the app is decoration.",
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
          "Envelope style budgets assume a stable month. Many months are not stable, and one unexpected cost breaks several categories at once. Repairing that takes more effort than the budget was saving.",
          "Many people who budget are doing it to make sure the essentials are covered, nothing more ambitious than that. That is a much smaller question than a full category system, and it can be answered with far less upkeep.",
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
          "Choose the first kind.",
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
    slug: "why-you-keep-thinking-about-a-task-and-not-doing-it",
    title: "Why you keep thinking about a task and not doing it",
    dek: "You have not forgotten it, so writing it down again changes nothing. The gap is between knowing and starting, and two questions that help close it.",
    primaryQuery: "keep thinking about a task",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "You have not forgotten it. That is the confusing part. It arrives at eleven at night, in the shower, in the middle of something else, and it has been doing that for weeks.",
          "So the problem may not be memory, and a tool built only around remembering may not help. Writing it down again does nothing, because it was never off the list.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The gap is between knowing and starting",
        paragraphs: [
          "Starting almost anything administrative requires holding several things at once: what this is about, what you want to happen, the two facts you will need, and enough spare capacity to think while somebody talks at you.",
          "Many people find that is a lot to hold, and it feels heaviest at the moments you tend to attempt these things, which is late, tired, and already carrying the day. The task may not be hard. Assembling the conditions to begin it often is.",
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
        body: "ADHD Life Companion is built for this gap rather than for remembering. You put the thing down once, it shows it on the day you chose, and when you are ready it walks you through it, holding the purpose and the outcome on screen so you are not carrying them. Nothing in it counts how long something sat.",
      },
    ],
  },

  {
    slug: "task-paralysis-what-to-do-in-the-next-ten-minutes",
    title: "ADHD task paralysis: what to do in the next ten minutes",
    dek: "You know what needs doing and cannot begin. A ten minute way out that shrinks the first step until it needs no decision and no motivation.",
    primaryQuery: "adhd task paralysis",
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
          "More on that in [picking something back up after abandoning it](/guides/how-to-restart-a-project-you-gave-up-on).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion has a procedure for exactly this, for when something is too big to start. It breaks a thing down into a first action you can actually do, and shows one thing at a time rather than a list to evaluate. If you get partway and stop, it changes nothing on the item.",
      },
    ],
  },

  {
    slug: "first-week-after-buying-a-house",
    title: "New house checklist: what to do in the first week",
    dek: "Shutoffs, meter readings, alarms, appliance labels and the inspection report: what to capture in the first week, while it is all in front of you.",
    primaryQuery: "new house checklist",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is a short window, roughly the two weeks around moving in, when every fact about a house is either in front of you or one phone call away. The previous owner is still reachable. The surveyor's report is still open on your laptop. The boiler manual is still in a drawer rather than lost.",
          "After that window, each of those facts costs an afternoon to recover, and some are gone permanently. This is time well spent.",
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
          "If the property will be empty for a stretch between completion and moving in, check what your policy says about unoccupancy. Many policies lapse or reduce cover after a set number of days empty, and the period around a move is exactly when that bites.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What this saves you later",
        paragraphs: [
          "A year on, the boiler needs servicing and you know when it was last done and by whom. Something fails under warranty and you have the serial number. An engineer asks how old the system is and you have an answer.",
          "Which fields matter for each kind of thing, and where model plates hide, is covered in [what to record about an appliance](/guides/what-to-record-when-you-buy-an-appliance).",
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
    slug: "home-maintenance-checklist-by-month",
    title: "Home maintenance checklist: the jobs that belong to a season",
    dek: "Nine jobs that really belong to a season, which ones run on an interval instead, and what to skip without guilt. Written for US homes.",
    primaryQuery: "seasonal home maintenance checklist",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many seasonal checklists are long. They read well, but a long list is easy to abandon. A shorter list that gets done beats a complete one that does not.",
          "What follows is the subset where timing genuinely matters, meaning the job belongs to a season rather than to a rolling interval, and skipping it in that season causes a real problem.",
        ],
      },
      {
        kind: "table",
        heading: "The jobs that actually belong to a season",
        columns: ["Season", "Job", "Why now specifically"],
        rows: [
          ["Before first freeze", "Shut off and drain outdoor taps, disconnect hoses", "A burst pipe inside a wall can be the most expensive item on a home list"],
          ["Before first freeze", "Blow out or drain irrigation", "Water left in lines splits them, and you find out in spring"],
          ["Autumn", "Clear gutters after leaf fall", "Doing it before the leaves drop achieves very little"],
          ["Fall", "Service heating", "Technicians are easier to book in October than in the first cold week"],
          ["Fall", "Check drafts and seals", "Inexpensive efficiency work, and easiest to find when it is cold outside"],
          ["Spring", "Service air conditioning", "Same reason as heating, in reverse"],
          ["Spring", "Inspect roof and flashing", "After winter has done its worst, before summer storms"],
          ["Spring", "Clear gutters again", "Winter debris, plus whatever autumn missed"],
          ["Summer", "Exterior timber, paint, fencing", "A stretch of dry weather makes the work easier"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Everything else is an interval, not a season",
        paragraphs: [
          "Water heater flushing, filter changes, grout and sealant, alarm testing. None of these care what month it is. They care how long since the last time.",
          "Treating them as seasonal is what produces the checklist telling you to flush a water heater every spring when it was done in November. Their real intervals are in [how often things actually need servicing](/guides/how-often-home-systems-need-servicing).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why generic reminders get ignored",
        paragraphs: [
          "Any system that tells you to winterize in July has told you something useless, and useless prompts teach people to stop reading the ones that mattered.",
          "A reminder is only as useful as its timing. One well timed prompt beats twenty generic ones, and the difference is whether the tool understands that some outdoor work belongs to a month rather than a countdown.",
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
    title: "Beneficiary vs will: which one decides who gets it?",
    dek: "Pensions, retirement accounts and life insurance go to the person named on the form, not the person in your will. What passes how, and how to check.",
    primaryQuery: "beneficiary vs will",
    publishedAt: "2026-08-30",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most people assume a will decides everything. For some of what they own, it does not.",
          "Pensions, life insurance, and various other accounts pass to whoever is named on the plan's own beneficiary nomination. That nomination usually sits outside the estate entirely, which means the will never gets a say, no matter how recently it was written or how clearly it says otherwise.",
          "This is one common way somebody's intentions quietly fail to happen.",
        ],
      },
      {
        kind: "table",
        heading: "What passes how",
        intro: "Generalized, and details vary by country and provider, but the shape is similar in many places.",
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
          "The result is predictable and still surprises people: a pension from a job somebody left fifteen years ago still names an ex-partner, or a parent who has since died, or nobody at all.",
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
        intro: "This is a short afternoon of work, and worth doing.",
        items: [
          "List every pension you have ever had, including from old employers.",
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
          "Nothing here is legal advice, and the rules genuinely differ by country and by scheme. What matters everywhere is knowing what your forms currently say.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion records your pensions and your life cover, where the paperwork for each is kept, and who is named to receive it, so the answer is somewhere findable rather than in a form you last saw in 2011. It has no upload, and it does not give advice on what any nomination should say.",
      },
    ],
  },

  {
    slug: "how-to-catch-up-on-homeschool-records",
    title: "How to catch up on homeschool records you did not keep",
    dek: "Kept nothing since October? What you can rebuild from workbooks, photos, receipts and library history, and how to mark it as reconstructed.",
    primaryQuery: "catch up on homeschool records",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "This happens to many homeschooling families, and published advice is often aimed at the version of you who kept up.",
          "The good news is that more is recoverable than it feels like right now. The rest of it you can be honest about, which is a genuinely acceptable outcome.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What is actually recoverable",
        intro: "Work through these in order. A usable picture of the year is often recoverable.",
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
          "Before spending a weekend on this, find out what you genuinely need. Several states require nothing to be filed, in which case this is for your own use and can be as rough as you like.",
          "If your state asks for a portfolio or an evaluation, the requirements are specific and worth reading properly. Both are covered in [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why it stopped in October",
        paragraphs: [
          "It is worth knowing, because otherwise it happens again in the second week of next term. Often the system was too heavy: a spreadsheet with nine columns, or a plan to write a paragraph a day about each child.",
          "Anything that takes much more than a minute is hard to keep up through a bad week, and most years contain a few. The version that lasts records three things: the date, the subject and roughly what part of it, and one word about how it went.",
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
        body: "Homeschooling Companion dates every entry with the day you make it, so it cannot fill in past weeks. Reconstruct those on paper and record forward from today, which takes well under a minute a day. It has no completion percentage and no screen that tells you how many days you missed.",
      },
    ],
  },

  {
    slug: "how-to-check-if-your-child-learned-something",
    title: "How to tell if your homeschooler actually learned it",
    dek: "Covered is not learned. Ask four questions a week or more later, write the answers down, and know when a result is not enough to say.",
    primaryQuery: "is my homeschooler learning",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "You covered fractions in October. It is March. Do they know fractions? Many homeschooling parents cannot say for sure, and the not knowing is uncomfortable.",
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
          "Short. Four answered questions on one topic is the fewest that tells you anything, and much more tends to produce fatigue rather than information.",
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
        body: "Homeschooling Companion lets you run short checks at home, with questions you choose or write, and reports one of four standings including not enough to say when too few questions were answered to conclude anything. It keeps the result with the topic and says so if the same result comes up twice, and it never produces a score, a percentage or a comparison between children.",
      },
    ],
  },

  {
    slug: "organising-a-multi-stop-trip-without-a-spreadsheet",
    title: "Multi-stop trip planner: organize it without a spreadsheet",
    dek: "Many stops mean many bookings that rest on each other. Record four things per booking and skip the rebuild after every change.",
    primaryQuery: "multi stop trip planner",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Planning a trip takes many hours, and they do not mostly go into deciding where to go. They go into rebuilding the shape of the trip every time one detail changes.",
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
          "Write that relationship down once, when you book, and you never have to reconstruct it. Skip it, and every disruption starts with working out from memory what was connected to what, usually in an airport. The method is set out in [what else your trip depends on](/guides/flight-changed-what-else-is-affected).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not build a full itinerary",
        paragraphs: [
          "An hour by hour plan for a two week trip is a document that is wrong by day three, and rewriting it is where much of the time goes.",
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
          "Something may well move on a trip with many moving parts. Planning for that is not pessimism, it is the difference between an inconvenience and a ruined day.",
          "The practical version of planning for it is simply having recorded what depends on what, before you needed to know.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion holds the whole trip in one place, including what each booking was built on top of. When something moves you record the change once and it shows you exactly what was downstream of it, unchanged, so you decide. It also prints as a blank book you fill in by hand and carry, for when the phone is the thing that failed.",
      },
    ],
  },

  {
    slug: "travel-document-checklist",
    title: "Travel document checklist: what to carry and where",
    dek: "What each traveler needs, what to check months ahead, and how to note where every document is kept, because a phone photo is not a backup.",
    primaryQuery: "travel document checklist",
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
        intro: "Each of these can end a trip at a check-in desk.",
        items: [
          "Passport expiry for every traveler. Some countries require several months of validity beyond your return date, so an in-date passport can still be refused. Check the official entry page.",
          "Blank pages, which some countries require and which nobody thinks about.",
          "Visa or travel authorisation requirements, including electronic ones that are quick but not instant.",
          "Whether a child travelling with one parent, or with neither, needs documented consent. Rules vary and are enforced unevenly, which is worse than being enforced consistently.",
          "Name mismatches between passport and booking, which can stop you at check-in.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Passport validity catches people every year",
        paragraphs: [
          "Some destinations require your passport to remain valid for a set time after you arrive or leave, often several months. A passport that is in date can still be refused.",
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
          "Travel insurance policy number and the emergency assistance phone number.",
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
        body: "Travel Companion records what documents exist, whose they are, and where each one is kept, and can flag the ones worth showing in the trip summary. It never accepts an upload, because no product on Draftpace stores files, and passport scans are the single most sensitive thing any of them would hold if they did. It also prints My Trip Book, which is blank paper you fill in by hand.",
      },
    ],
  },

  {
    slug: "you-missed-a-payment-what-to-do-next",
    title: "You missed a payment. What to do in the next 48 hours",
    dek: "A five step plan for the first 48 hours, what usually happens at a few days late versus a month late, and what to say when you call.",
    primaryQuery: "missed a payment what to do",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "One missed payment is usually a small problem treated as a large one. The consequences are mostly recoverable, and acting within a few days is what keeps them that way.",
          "Nothing here is financial advice, and if payments are being missed regularly rather than occasionally, that is a different situation where free nonprofit credit counseling is the right call and worth contacting early rather than late.",
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
            what: "Call them. Providers often have more flexibility before an account defaults than after, and it is easier to use when you get in touch first.",
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
          "A few days late usually means a failed payment fee and nothing else. Around a month late is generally when it starts being reported. Several months late is where accounts are more likely to be sent to default or collections.",
          "The exact thresholds vary by country, provider and product type. The useful general point is that the gap between a few days and a month is enormous, and it is entirely within your control.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Calling them is the part people avoid",
        paragraphs: [
          "It is also the single most effective thing available, because providers have options before an account goes into arrears that they lose afterwards: deferrals, revised dates, splitting a payment.",
          "If that call is the thing you have been putting off for a week, that is an extremely normal response to it, and the preparation that makes it easier is in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "How it often happens",
        paragraphs: [
          "Often not because somebody decided not to pay, but because the balance looked fine on the day and a payment that had already been committed had not left the account yet.",
          "That gap between what your balance says and what is genuinely yours is a common cause, and it is explained in [available balance vs current balance](/guides/available-balance-vs-current-balance).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion holds your bills with their due dates and shows what is left to pay this month once you tick bills paid. Its Available Money is a month-level estimate that counts a full month of bills whether or not they are paid, and it marks the figure Preliminary when a bill has no due date. Monthly Money Reset, which is free, holds back only the bills you have not paid yet.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 4

  {
    slug: "what-to-write-down-in-case-something-happens-to-you",
    title: "What to write down in case something happens to me",
    dek: "The short list of things that exist only in your head, framed as two weeks away, and how to keep it findable, dull and current.",
    primaryQuery: "what to write down in case something happens to me",
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
          "Where the car keys and spare house keys are, and where the alarm code is written down.",
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
    title: "Digital accounts after a death: what can be recovered",
    dek: "Photos, email, subscriptions and social accounts. What providers tend to release, what they do not, and what to set up now.",
    primaryQuery: "digital accounts after death",
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
        body: "Personal Life Affairs Companion has six digital steps: getting into your phone, the main email address, recovering access to a password manager, online accounts that charge money, setting a legacy contact, and where your photographs live. It asks where things are, never for the credentials themselves.",
      },
    ],
  },

  {
    slug: "which-documents-to-keep-and-where-to-put-them",
    title: "Which documents to keep, shred or store, and for how long",
    dek: "A rough retention guide for household paperwork, what to shred, and a three-part filing approach based on how fast you would need each thing.",
    primaryQuery: "how long to keep documents",
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
        body: "Personal Life Affairs Companion records where key papers are kept, such as identity documents, tax records, the will and any safe or deposit box, so the question becomes a lookup rather than a search through a box. It has no upload, which is deliberate: a note of where things are is far less risky to hold than the documents themselves.",
      },
    ],
  },

  {
    slug: "what-to-keep-after-a-home-repair",
    title: "What to keep after a home repair, besides the invoice",
    dek: "The invoice shows the price. Write down the diagnosis, the part replaced and what the technician says comes next, before they drive away.",
    primaryQuery: "home repair record",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many people keep the invoice and forget everything else. The invoice tells you what you paid. It rarely tells you what was actually wrong, what was replaced, or what the engineer said would need doing next.",
          "That second set is what makes the next repair faster, and it exists only in your memory, which fades fast.",
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
          "Technicians often mention that something else is nearing the end of its life, and that remark is rarely written down. Six months later the thing fails and nobody remembers being warned.",
          "That one line is among the most useful things from the visit, because it is a heads-up about your own house.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep a note of who to call again",
        paragraphs: [
          "Finding a good tradesperson can be harder than any of the admin around it, and the number is easy to lose in a text message.",
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
    title: "How to keep track of appliance warranties",
    dek: "What to record at purchase, the service condition that catches people out, and when to check the expiry date before you pay for a repair.",
    primaryQuery: "appliance warranty tracking",
    publishedAt: "2026-08-30",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Warranty claims often fail for administrative reasons. No proof of purchase, no serial number, no record of the annual service the warranty required, or a claim made two weeks after expiry.",
          "All four are avoidable with about two minutes of recording at the point of purchase.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "What to record when something is installed",
        items: [
          "Date of purchase and date of installation, which are often different, and the warranty says which one starts the clock.",
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
          "This is small print that can cost a lot, and the fix is knowing the condition exists and having the service dates recorded.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Registering matters more than it should",
        paragraphs: [
          "With some manufacturers, registration extends a warranty, and it is a form many people skip because it looks like marketing.",
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
        heading: "Think before buying an extended warranty",
        paragraphs: [
          "Extended warranties are sold at a profit, so read what they cover and what they cost before agreeing at the counter, and check whether the standard warranty already covers the likely failures.",
          "Cover can be worth weighing where a single failure would be very costly relative to the item's price. That is a judgment, not a rule, and it should be made with the expiry dates in front of you rather than at a counter.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base records warranty end dates alongside the brand and model of everything you add, with a serial number going in Notes, and shows a warranty on Now 30 days before it ends. Reminders are off unless you turn on the warranty one. What to capture per type of thing is in [what to record about an appliance](/guides/what-to-record-when-you-buy-an-appliance).",
      },
    ],
  },

  {
    slug: "scripts-for-the-admin-calls-everyone-dreads",
    title: "What to say on admin calls: opening lines and scripts",
    dek: "Opening lines for billing problems, chasing, canceling, complaints and asking for help, plus four things to get before you hang up on any call.",
    primaryQuery: "admin phone call scripts",
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
          "A great deal of advice about difficult calls is really advice about being assertive, which assumes the problem is that you are too soft. Often the problem is capacity, not confidence.",
          "Being polite and specific usually works well with call centers, because the person answering has a fixed set of options and is deciding which to offer. Clarity about what you want moves that further than firmness does.",
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
        body: "ADHD Life Companion has authored procedures for these exact situations, including a billing problem, a follow up and a difficult call. It suggests an opening you can use or replace with your own, holds what you want on screen while you talk, and never tells you what to accept or settle for, because you are the one with the facts. The suggested wording is not saved, but wording you type yourself is.",
      },
    ],
  },

  {
    slug: "how-to-deal-with-something-you-have-put-off",
    title: "How to deal with something you have put off for months",
    dek: "When the delay feels like the problem, name it in one sentence and move on to the practical question. Three lines to use, and what not to explain.",
    primaryQuery: "deal with something you have put off",
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
          "Whoever you have to contact deals with delayed matters constantly. Call centers, landlords, city offices, accountants and clinics all have processes for exactly this, because a lot of what reaches them is late.",
          "The version of the conversation you have rehearsed, where somebody is shocked or annoyed, is often not the one that happens. Often they just ask for a reference number and move on.",
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
          "Some things do get worse for having been avoided. Debts accrue interest and deadlines pass, and both are real, but the dread is often larger than the actual position.",
          "The way in is usually a phone call, and the preparation for that is in [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built so that nothing counts how long something sat. There is no streak, no overdue tally, and closing something you did not get to changes nothing on the item and adds nothing to its history, because a history of your own admin should not read as a list of failures.",
      },
    ],
  },

  {
    slug: "preparing-for-a-homeschool-evaluation",
    title: "Homeschool evaluation: what to bring and how to prepare",
    dek: "What an evaluator looks for, a six-item folder list, and how to get ready in one evening. Ask your own evaluator or state what it requires.",
    primaryQuery: "homeschool evaluation what to bring",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "An evaluation is generally a check that education is happening, not an inspection of whether you are doing it well. Who does the evaluating depends on your state, so ask yours what it wants to see.",
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
        heading: "Progress across the year is worth showing",
        paragraphs: [
          "One of the clearest things in any portfolio is the same subject at two points in the year. October and March writing samples side by side can say more than a quantity of finished work from one week.",
          "It is also the easiest thing to provide, and the thing most people accidentally leave out by only keeping the pieces they were proud of.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Be honest about what did not go well",
        paragraphs: [
          "Saying that maths was difficult until January, that you changed curriculum, and that it improved afterwards is a stronger position than implying everything went smoothly.",
          "It shows that you were paying attention and adjusting. A portfolio with no difficulties in it reads as curated rather than complete.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you are behind on records",
        paragraphs: [
          "Reconstruct honestly, mark approximate dates as approximate, and do not invent precision. A clearly reconstructed term is a normal thing to hand over.",
          "The full recovery method is in [when you have kept nothing since October](/guides/how-to-catch-up-on-homeschool-records).",
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
        body: "Homeschooling Companion prints a record per child covering what was done, when, and what you noticed, which gives an evaluator a record to read alongside your work samples. Entries are always dated the day you make them, and its short checks report an honest standing, including not enough to say, rather than a score you would then have to explain.",
      },
    ],
  },

  {
    slug: "how-to-plan-a-group-trip",
    title: "How to plan a group trip (without being the organizer)",
    dek: "Group trips go wrong when one person holds everything in their head. Decide who books what, who is on each booking and where the answers live.",
    primaryQuery: "how to plan a group trip",
    publishedAt: "2026-08-30",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Coordinating schedules is one of the hardest parts of planning a group trip.",
          "The reason is that one person ends up holding the whole thing in their head, and that person is answering the same four questions repeatedly for two weeks.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Decide these three things first",
        intro: "Much of the friction on a group trip comes from leaving these implicit.",
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
          "Knowing what depends on what is the same skill as in any trip, covered in [what else your trip depends on](/guides/flight-changed-what-else-is-affected). The group version simply adds the question of who is affected.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion records travelers, links them to the bookings they are actually on, and holds what each person needs. When something changes it shows what was built on top of it, so working out who to tell starts from what is recorded rather than from memory. It is one person's record, not a shared one. To hand the shape of the trip to somebody else, send the itinerary PDF or the one-page trip card.",
      },
    ],
  },

  {
    slug: "sort-out-your-finances-after-a-life-change",
    title: "Sort out your finances after a job change, move or divorce",
    dek: "A five step order for putting your money back together, plus the traps in each event: the old retirement plan, address changes, joint accounts.",
    primaryQuery: "finances after a life change",
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
          "Two things catch people. A change in payday can leave a longer gap than usual between salaries, and automatic payments do not care that this month is five weeks. Checking the dates before that gap arrives prevents a missed payment for no reason other than timing.",
          "The other is the old workplace retirement plan or pension, which does not disappear and does not follow you. It becomes a separate pot that is easy to lose track of.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Moving: the address is on more things than you think",
        paragraphs: [
          "Bank, insurers, retirement plan providers, voter registration, your driver's license, subscriptions with a delivery address, and anything that posts an annual statement. That last category matters most, because an annual statement sent to an old address is how people lose track of accounts entirely.",
          "Utility meter readings on the day, both leaving and arriving, can head off billing disputes.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Separation: untangle joint things deliberately",
        paragraphs: [
          "Joint accounts, joint bills and anything one person guaranteed for the other all need explicit attention, and shared accounts and debts can keep two people financially linked long after the relationship ends.",
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
        body: "Personal Finance Companion holds accounts, income, bills, subscriptions and debts in one place, so after a life change you are editing a picture rather than reconstructing one. Personal Life Affairs Companion records the paperwork side of the same events, including any pension from the job you just left and who is named to receive it.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 5

  {
    slug: "talking-to-your-parents-about-their-affairs",
    title: "How to talk to your parents about their will and finances",
    dek: "What to open with, what not to ask for, how to start with your own affairs, and scripts for a conversation that takes several tries.",
    primaryQuery: "how to talk to your parents about their will",
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
        heading: "Openings worth trying",
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
          "One of the most effective moves is doing your own first and mentioning it. It removes any suggestion that this is about their age or their health, and it gives you something concrete to show.",
          "It also means you are asking them to join something rather than to submit to it, which is a materially different request.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ask for locations, not contents",
        paragraphs: [
          "Where the will is, not what it says. Which bank, not the balance. Who the lawyer is, not what was discussed.",
          "Many people are more comfortable sharing locations than contents, and locations are what actually prevent the months of searching later.",
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
    slug: "inherited-a-house-where-to-start",
    title: "Inherited a house with no records? Where to start",
    dek: "No manuals, no service history, no idea how old the furnace is. How to date what you have, typical service lives, and what to check first.",
    primaryQuery: "inherited house maintenance",
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
          "Water heater: the label often carries a manufacture date, sometimes coded in the serial number, which tells you its age even if nothing else does.",
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
          "Many major appliances encode their manufacture date somewhere on the plate, sometimes in the serial number itself. A quick search for the model plus how to read the serial usually decodes it.",
          "That gives you the one thing that matters most: how far through its life something is. A fifteen year old water heater is a different planning problem from a three year old one, regardless of whether either is misbehaving today.",
        ],
      },
      {
        kind: "table",
        heading: "Typical service lives",
        intro: "Rough ranges from general guidance, not predictions, and not something Home Base tracks. Climate, use and upkeep change them a lot.",
        columns: ["System", "Typical life", "What to do if yours is near it"],
        rows: [
          ["Boiler or furnace", "Often 15 years or more", "Get it serviced and ask directly about remaining life"],
          ["Water heater", "Roughly a decade for a tank", "Budget for replacement rather than waiting for the failure"],
          ["Air conditioning", "Often around a decade or more", "Service before summer, ask about refrigerant type"],
          ["Roof covering", "Two decades or more, depending on material", "Get an inspection rather than guessing from the ground"],
          ["Electrical panel", "Several decades", "Have it inspected, particularly if it looks original"],
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
    dek: "Where the data plate hides on a fridge, washer, dryer, dishwasher, oven and water heater, and what to do when the label has worn away.",
    primaryQuery: "how to find appliance model number",
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
          "What else is worth capturing at the same time is in [what to record about an appliance](/guides/what-to-record-when-you-buy-an-appliance).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base has Brand and Model fields on each item, and a Notes field where a serial number can go, and keeps them alongside the service history, so the next technician visit or parts order starts with a number rather than a flashlight. It asks only for the fields that make sense for that kind of thing.",
      },
    ],
  },

  {
    slug: "homeschool-attendance-what-to-track",
    title: "Homeschool attendance records: what counts as a school day",
    dek: "What counts as a homeschool day, the lightest three-part record, and which attendance habits are pointless. Check your state's rule at the source.",
    primaryQuery: "homeschool attendance record",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Some states require a specific number of instructional days or hours. Others require nothing at all. Before building any tracking habit, find out which applies to you, because tracking attendance you will never be asked for is pure overhead.",
          "Where it is required, the record needed is often lighter than people assume. A count of days, not a timetable.",
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
        intro: "If your state counts days, this is often enough.",
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
          "Reconstructing a year of attendance from memory is hard, and unlike subject records there is little physical to work backwards from, although a calendar and dated photos help. A pile of undated worksheets does not show how many days you taught.",
          "A grid you tick takes seconds a day. It is the one part of homeschool record keeping where doing it live is not merely better but effectively the only option.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What is pointless",
        paragraphs: [
          "Logging start and finish times, unless your state specifically requires hours. Recording which parent taught. Breaking a day into subject-by-subject minutes.",
          "None of that is usually asked for, and every additional column is a reason the habit dies by half term.",
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
        body: "Homeschooling Companion records the day alongside what was covered, so one entry serves as both a day count and part of the record rather than being two separate chores. It does not track hours and has no attendance counter.",
      },
    ],
  },

  {
    slug: "simple-homeschool-record-keeping-system",
    title: "A simple homeschool record keeping system you will keep",
    dek: "Three things per entry in under a minute, a plan for the bad week, and the occasional fourth note worth writing down. Notebook or app.",
    primaryQuery: "simple homeschool record keeping system",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many homeschooling families build a record system in September and let it lapse within weeks. The system is rarely the problem in principle. It is that it was designed on a good day, for a version of the week that does not happen often.",
          "The version that survives is the one that still gets done on the bad Tuesday, and that means it has to take well under a minute.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Three things, every time",
        paragraphs: [
          "The date. The subject and roughly which part of it, where Unit 3, Lesson 12 is plenty. And one word about how it went: easy, about right, or difficult.",
          "That third field is often the one people leave out, and it can be the most useful in March, because it tells you where to look when something has not stuck.",
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
        heading: "Plan four days and record what happened",
        paragraphs: [
          "A family that plans five days and manages four has failed at something every single week. A family that plans four and manages four has not. The work done is identical.",
          "Recording is the same. If the habit assumes a perfect week, every ordinary week produces a gap, and gaps are a common reason people stop.",
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
          "That is the normal case rather than the exception, and more is recoverable than it feels like. The method is in [when you have kept nothing since October](/guides/how-to-catch-up-on-homeschool-records).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion is built around an entry that takes seconds and is always dated the day you make it. It contains no completion percentage, no streak, and no count of days missed.",
      },
    ],
  },

  {
    slug: "life-admin-with-brain-fog",
    title: "Life admin with brain fog: long covid, illness, grief",
    dek: "When holding a plan in your head has become unreliable, build for the bad day. Adjustments that do not depend on knowing why, or on trying harder.",
    primaryQuery: "life admin with brain fog",
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
          "Calls demand real-time processing, memory and speech at once, which many people find harder when their thinking is affected. It is common for a call that would once have been trivial to be the single hardest thing in a week.",
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
          "You do not need a label to need this. The difficulty is the same whatever produced it, and none of the practical adjustments depend on knowing why. This is admin help, not medical guidance.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built for the difficulty rather than the diagnosis, and asks nothing about medical history because it does not need to. It holds the details on screen while you deal with something, returns you to the exact question you left if you stop, and stopping early changes nothing on the item.",
      },
    ],
  },

  {
    slug: "executive-dysfunction-is-not-procrastination",
    title: "Executive dysfunction vs procrastination: the difference",
    dek: "They look identical from outside. Why raising the stakes fails when starting is the barrier, and what lowers the cost of starting instead.",
    primaryQuery: "executive dysfunction vs procrastination",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "From the outside they are indistinguishable. Something needed doing, time was available, and it did not happen.",
          "From the inside they are not similar at all, and the difference decides which strategies do anything. Procrastination usually involves choosing something more pleasant. Executive dysfunction is often described as choosing nothing, sometimes while doing something you are not enjoying either.",
        ],
      },
      {
        kind: "table",
        heading: "The difference in practice",
        columns: ["", "Procrastination", "Executive dysfunction"],
        rows: [
          ["What you are doing instead", "Something more appealing", "Often nothing, or something you are not enjoying"],
          ["How it feels", "Avoidance, with some relief", "Stuck, with no relief"],
          ["Does knowing the stakes help", "Sometimes", "Often less, and pressure can make it worse"],
          ["Does breaking it down help", "A little", "Often, if broken small enough"],
          ["What is actually missing", "Willingness to start now", "Often the ability to get started"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the standard advice misfires",
        paragraphs: [
          "Most productivity advice assumes procrastination, so it raises stakes: set a deadline, picture the consequences, promise yourself a reward. That works when the barrier is willingness.",
          "When the barrier is initiation, raising stakes adds pressure to a system that is already stalled, and a common result is more distress and the same amount of nothing done.",
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
          "Mostly because of what people conclude about themselves. If you believe you have been choosing comfort over responsibility for years, you draw one conclusion about your character. If you understand that starting itself was the barrier, you draw a different and probably fairer one.",
          "That second conclusion also happens to lead to strategies that work.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built around initiation rather than motivation. It shows one thing rather than a list to evaluate, breaks down anything too big into a first action, and holds the context on screen so starting does not require assembling it. It contains no streak and no score, because pressure tends to make this harder for many people.",
      },
    ],
  },

  {
    slug: "what-to-keep-on-paper-when-you-travel",
    title: "What to print before you travel: a one-page paper list",
    dek: "Phones die at the wrong moment. The one page worth printing, including your hotel address in the local language, and why two copies beat one.",
    primaryQuery: "what to print before you travel",
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
        body: "Travel Companion prints My Trip Book, a blank structured planner covering bookings, travelers, documents, daily pages and the connection pages that are the point of the product. It has a fixed set of pages, and you print the ones you want. It also makes a one-page trip card from what you recorded, which carries no references, documents or notes, so write those beside it in pen.",
      },
    ],
  },

  {
    slug: "what-to-check-before-each-direct-debit-date",
    title: "What to check before your bills come out each month",
    dek: "A two minute check before your busiest payment date: which account each bill leaves from, what changed, and why to bunch dates near payday.",
    primaryQuery: "what to check before bills come out",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many failed payments are not caused by having no money. They are caused by having money that was already committed, in an account the payment was not coming from, or on a day the timing did not work.",
          "Two minutes before the busiest date in your month prevents much of it.",
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
          "Many providers will move a payment date on request, often with a short call or a setting.",
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
        body: "Personal Finance Companion holds your bills and subscriptions with their due dates, and its Coming up list shows what is due in the next 14 days. Its Available Money is a month-level estimate that counts a full month of bills, paid or not, and it marks the figure Preliminary when a bill has no due date.",
      },
    ],
  },

  {
    slug: "can-you-afford-it-before-you-buy-it",
    title: "How to know if you can afford something before you buy it",
    dek: "Balance minus the bills still coming, divided by the weeks to payday: a thirty second check, and why annual bills and installments skew it.",
    primaryQuery: "how to know if you can afford something",
    publishedAt: "2026-08-30",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The question is almost never whether you have the money today. It is whether spending it today causes a problem later in the month, and that is a harder thing to answer standing in a shop.",
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
        body: "Monthly Money Reset gives you a safe-to-spend figure and a rough weekly guide for the rest of the month, free, and previews what a purchase would change. Personal Finance Companion has no weekly figure. Its Available Money is a month-level estimate across accounts, bills, subscriptions and debts, with the working shown and a Preliminary flag when a bill has no due date.",
      },
    ],
  },

  // ---------------------------------------------------------------- batch 6
  // The last four. Two finish their areas, and two are the cross-cutting
  // pieces that needed the SERIES value added above, because they
  // describe the category rather than a domain.

  {
    slug: "how-long-to-keep-homeschool-records",
    title: "How long to keep homeschool records, and what to throw away",
    dek: "Which papers to keep, what to photograph and what to recycle. Florida and New Hampshire name two years for a portfolio; the rest is advice.",
    primaryQuery: "how long to keep homeschool records",
    publishedAt: "2026-08-30",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "By March many homeschooling families have more paper than shelf. The instinct is to keep all of it, because throwing away a child's work feels like throwing away the year.",
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
          ["Evaluator reports", "Keep permanently", "Proof the year was reviewed"],
          ["Your own log", "Keep permanently", "A record that ties everything together"],
          ["Large projects and models", "Photograph, then recycle", "They prove nothing in a box in a loft"],
          ["Daily worksheets and drills", "Keep a handful, recycle the rest", "Fifty identical sheets say nothing fifty times"],
          ["Curriculum you have finished with", "Sell or pass on", "Another family may want it"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Photograph the things that cannot be filed",
        paragraphs: [
          "Models, posters, science experiments, anything three dimensional. A dated photograph is genuinely better evidence than the object, because it can go in a portfolio and the object cannot.",
          "It also solves the thing nobody says out loud, which is that the object was probably going to be thrown away eventually anyway.",
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
          "Some states name a retention period. In our summary, Florida and New Hampshire list a portfolio kept two years. Anything longer in the table above is advice, not law.",
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
        body: "Homeschooling Companion keeps a log of what was done and when, alongside the paper you keep. It prints as a per-child record covering what was done and when, so the paper you keep can be a genuine sample rather than the whole year.",
      },
    ],
  },

  {
    slug: "diagnosed-with-adhd-as-an-adult",
    title: "Diagnosed with ADHD as an adult: the admin that follows",
    dek: "What changes after an adult diagnosis, what does not, and the admin that comes next: appointments, records and the backlog you already had.",
    primaryQuery: "diagnosed with adhd as an adult",
    publishedAt: "2026-08-30",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Some adults receive an ADHD diagnosis in adulthood rather than as a child. It is not an unusual situation, though it can feel like one at the time.",
          "Two things tend to arrive together afterwards. A great deal of retrospective reinterpretation, and an unexpected pile of administration.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The reinterpretation comes first",
        paragraphs: [
          "Many people spend the following months revisiting the past: jobs that went wrong, a degree that took longer, relationships where the same argument kept happening, the persistent sense of underperforming relative to effort.",
          "That process is worth having and it is not the subject of this guide. The subject is the far less discussed part, which is that a diagnosis creates work.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "The admin that follows",
        intro: "Very little of this gets mentioned in the appointment. This is admin help, not medical advice; your prescriber and local rules decide the details.",
        items: [
          "Follow-up appointments and repeat prescriptions, if you are prescribed medication. Your prescriber sets the schedule.",
          "Pharmacy logistics, which for some prescriptions can mean a specific pharmacy, a limited window, and supply problems.",
          "Employer conversations, if you choose to have them, plus any adjustments process.",
          "Insurance and, in some countries, a disclosure question you now have to answer differently.",
          "Driving or licensing rules in some places. Check your local rules.",
          "Records from a private assessment needing to reach a public system, or vice versa, which is rarely automatic.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The irony is not lost on anybody",
        paragraphs: [
          "Many people notice the irony: getting through a diagnosis involves administration on a recurring schedule, with real consequences for missing a step.",
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
          "What tends to change is the approach: less trying harder, more building around the difficulty. The starting point for the things that have sat longest is in [when something has been left so long it is embarrassing](/guides/how-to-deal-with-something-you-have-put-off).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion holds the things you are carrying and shows them on the day you chose. A repeating date, like a monthly refill, has to be set again each time. It never asks about a diagnosis, medication or symptoms, because it is built for how this feels rather than for why, and it does not track any of it.",
      },
    ],
  },

  {
    slug: "life-admin-the-work-nobody-teaches-you",
    title: "What is life admin, and why does it feel so hard?",
    dek: "Life admin is the unscheduled work of keeping an adult life running. Three traits that make it awkward, what it needs, and who ends up carrying it.",
    primaryQuery: "what is life admin",
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
          "It is connected. Almost nothing sits alone. A flight moves and three bookings become wrong. An address changes and many organizations need telling. A person dies and many small facts turn out to have lived in one head.",
          "It arrives at bad moments. Bereavement, illness, moving, separation, a new baby. The administrative load tends to be heaviest when the capacity to handle it is lowest.",
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
        intro: "Tick whatever you already have somewhere. You may find you have the first and none of the rest.",
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
          "In many households one person carries most of this, usually without it being discussed. It is often described as being organized, which frames a workload as a personality trait.",
          "It is worth naming for that reason alone. Work that has no name is difficult to divide, difficult to hand over, and easy to assume somebody is simply better suited to.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The competence trap",
        paragraphs: [
          "People conclude they are bad at admin. Usually what has happened is that the amount is genuinely large, the tools are genuinely poor, and holding that many connected facts in a human memory was never a realistic expectation.",
          "The productivity industry has spent decades selling harder trying as the solution. More on why that keeps failing in [why productivity tools fail at life admin](/guides/why-productivity-tools-fail-at-life-admin).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion Series",
        body: "Draftpace makes a Companion for each area of this work: money, home, mind and focus, family and learning, affairs and endings, travel, vehicles and family health. Each holds the state and the connections for one domain, works out what genuinely needs you now, and stays quiet when nothing does. None of them has a streak, a score, or a screen that tells you that you are behind.",
      },
    ],
  },

  {
    slug: "why-productivity-tools-fail-at-life-admin",
    title: "Why to-do lists and productivity apps fail at life admin",
    dek: "Life admin is a web of connected details, not a list of separate tasks. Four mismatches with productivity tools, and five things a better tool must do.",
    primaryQuery: "why productivity apps fail at life admin",
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
          "A board of tasks treats every card as a separate thing. Life admin is a web: change your address and a long list of things becomes wrong, move a flight and several bookings need looking at, and a death makes many facts urgent at once.",
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
          "The likely outcome is deletion, which takes the only record of what actually needed doing with it.",
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

  // ------------------------------------------------- Monthly Money Reset set
  // Seven guides written for the free product's Pinterest pins. Each one
  // answers a search a person actually types, uses the free Monthly Money
  // Reset as its worked example, and stays inside what that product does:
  // one month at a time, typed numbers, no bank connection.

  {
    slug: "how-to-budget-for-beginners",
    title: "How to make a monthly budget for the first time",
    dek: "Skip the forty categories. Gather four things, find one number with a worked $1,850 example, and keep it with a five minute weekly check-in.",
    primaryQuery: "how to make a monthly budget",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many first budgets fail for the same reason: they ask for too much. Every purchase logged, every category balanced, every day. That works for a week and then it stops, and a budget that has stopped is worse than none because it now shows a number you no longer believe.",
          "A first budget only needs to answer one question: how much of this month's money is actually safe to spend. Everything below is in service of that number and nothing else.",
        ],
      },
      {
        kind: "list",
        heading: "Gather these four things",
        intro: "Ten minutes, your banking app and last month's bills. You do not need a spreadsheet.",
        checkable: true,
        items: [
          "The money you have available today, across the accounts you spend from.",
          "The money you expect to come in this month, and on which day.",
          "The bills that must be paid, with their amounts and due dates.",
          "A small amount you would like to keep out of your spending, if any.",
        ],
      },
      {
        kind: "timeline",
        heading: "Set it up in this order",
        intro: "The order matters, because each step changes what the next one means.",
        steps: [
          { when: "This month", what: "Start from what you have today, not from what you had at the start of the month." },
          { when: "Money coming in", what: "Add what you expect and the day you expect it. Expected money does not count until it arrives." },
          { when: "Protect what must be paid", what: "Add each bill with its due date and mark it protected, so it comes out of your number before you can spend it." },
          { when: "Your spending view", what: "Group the rest into three broad buckets. Keep it rough." },
          { when: "Review", what: "Read the number back. If it looks wrong, one of the earlier steps is missing something." },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Protect the bills first",
        paragraphs: [
          "The single most useful habit in budgeting is treating a bill you have not paid yet as money you no longer have. Your balance still shows it, which is why a balance feels comfortable right up until the day the rent leaves.",
          "Say you have $1,850 available, $900 in bills still to pay and $350 you want to keep untouched. The number you can actually spend is $600. Not $1,850. Once you have seen the sum written out, it is hard to go back to trusting a balance.",
        ],
      },
      {
        kind: "table",
        heading: "A rough spending view, not forty categories",
        intro: "Three groups are enough to see where a month is going. Each can carry a guide amount, which is a rough target and not a hard limit.",
        columns: ["Group", "What goes in it", "Examples"],
        rows: [
          ["Essentials", "Things you need every month that are not fixed bills", "Groceries, fuel, transit"],
          ["Flexible", "Things that can stretch or shrink", "Eating out, entertainment, clothing"],
          ["Personal", "Money that is simply yours to spend", "Hobbies, gifts, small treats"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The weekly check-in",
        paragraphs: [
          "Once a week, spend five minutes asking four questions. Has any income come in or changed? Has a bill changed or been paid? Is there spending you have not added? Does your reserve need adjusting? If the answer to any of them is yes, add it. If all four are no, you are finished.",
          "That is the entire routine. It is deliberately small, because the budgets that survive are the ones that ask for very little. If you fall behind, [start from today rather than catching up](/guides/how-to-start-over-after-budget-failure).",
        ],
      },
      {
        kind: "callout",
        label: "Try it free",
        body: "Monthly Money Reset walks through exactly these steps in a few minutes and shows a live number as you go. It is free and complete, with no card and no bank connection. It covers one month at a time, and when you want a wider picture across accounts, bills and debt, Personal Finance Companion is the next step.",
      },
    ],
  },

  {
    slug: "how-to-budget-with-irregular-income",
    title: "How to budget with irregular income: count what has landed",
    dek: "Pay that swings breaks percentage budgets. Plan only from money that has arrived, hold back the bills and find your tightest day, with a $1,850 example.",
    primaryQuery: "how to budget with irregular income",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "If you freelance, work tips, take gig shifts or earn commission, most budgeting advice is quietly written for someone else. It assumes the same pay on the same day, so you can divide it into tidy percentages. Your pay does not do that, and a plan built on an average is wrong in exactly the months you can least afford it.",
          "The fix is not a cleverer formula. It is a smaller promise: only plan from money that has actually landed.",
        ],
      },
      {
        kind: "compare",
        heading: "Two ways to plan the same month",
        left: {
          label: "Planning from expected pay",
          items: [
            "Counts a payment before it arrives",
            "Feels generous early in the month",
            "Breaks the moment a client pays late",
            "Leaves you short with bills already committed",
          ],
        },
        right: {
          label: "Planning from received pay",
          items: [
            "Counts only money in your account",
            "Feels tighter early, then holds steady",
            "A late payment changes nothing you planned",
            "Bills are held back before anything is spent",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "Count only what has arrived",
        paragraphs: [
          "Keep expected income visible, because it is useful to know it is coming, but keep it out of the number you spend from. When it lands, mark it received and the number rises. Not before.",
          "A worked month. You have $1,850 available. You still owe $900 in bills and want to keep $350 untouched. Your safe number is $600, even though you are expecting a $600 client payment on the thirtieth. The day that payment lands, your number becomes $1,200. Until then, you have not spent it, which is the point.",
        ],
      },
      {
        kind: "list",
        heading: "Do these four things before you plan a month",
        checkable: true,
        items: [
          "Count only money that has arrived, not money you are owed.",
          "List the bills that cannot slip: rent, utilities, phone, insurance.",
          "Find the tightest day of the month, the day your balance will be lowest.",
          "Keep a small reserve for the slow month that will eventually come.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Find the tightest day",
        paragraphs: [
          "An average month can hide a very bad week. If rent leaves on the first and your client pays on the twentieth, the middle of the month is where you are actually exposed, even if the total looks fine.",
          "Walk the balance forward day by day using only the bills and income that have dates. The lowest point is your tightest day. Knowing it in advance turns a surprise into a plan: you can move a bill, hold off a purchase, or chase an invoice before you need to.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A reserve is what makes a slow month survivable",
        paragraphs: [
          "The purpose of a reserve in an uneven income is not a savings goal. It is a buffer that turns a bad month into an ordinary one. Even a modest amount held back, and kept out of the number you spend from, changes how a low month feels. There is more on building one in [how to build your first $1,000 emergency fund](/guides/how-to-build-a-first-1000-emergency-fund).",
        ],
      },
      {
        kind: "callout",
        label: "Try it free",
        body: "Monthly Money Reset is built around this rule. Income you are expecting does not count until you mark it received, it shows the weekly figure for the rest of the month, and it flags your tightest day when there really is a dip ahead. It is free, needs no bank connection, and covers one month at a time.",
      },
    ],
  },

  {
    slug: "how-to-build-a-first-1000-emergency-fund",
    title: "How to build your first $1,000 emergency fund",
    dek: "A $1,000 starter fund will not cover everything, but it keeps small surprises off a card. A four step pace, where to keep it, when to use it.",
    primaryQuery: "$1,000 emergency fund",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A full emergency fund of several months of expenses can feel out of reach, and that feeling is often the reason people never start. A first fund of one thousand dollars is a different kind of goal. It is small enough to reach, and it covers the things that most often go wrong: a car repair, a vet bill, a phone that stops working, a dentist visit.",
          "It is not the finish line. It is the first step that keeps a small problem from becoming a credit card balance.",
        ],
      },
      {
        kind: "timeline",
        heading: "A pace you can keep",
        intro: "Example only. Pick an amount that leaves your month intact, even if it looks small.",
        steps: [
          { when: "Month 1", what: "Set aside $250. Keep it out of the number you spend from." },
          { when: "Month 2", what: "Set aside another $250, if the month allows it. If it does not, set aside less and carry on." },
          { when: "Month 3", what: "Same again. Check your tightest day so you know the amount is not squeezing a bill." },
          { when: "Month 4", what: "You reach $1,000. Keep it where it is and decide what comes next." },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where it lives",
        paragraphs: [
          "Keep it somewhere you can reach quickly but will not spend by accident. For many people that means a separate savings account. The specific account and its interest rate matter less than the separation: money that sits in the same account you spend from tends to get spent.",
          "If you cannot open a separate account yet, you can still hold the amount out of your spending. That is the idea behind a reserve: an amount you tell yourself is not available.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Hold it back before you spend",
        paragraphs: [
          "The reliable way to save is to set the money aside first and spend what is left, rather than spending first and saving whatever survives. In practice that means the reserve comes out of your number at the start of the month.",
          "If you have $1,850 available, $900 in bills to pay and a $350 reserve, your safe number is $600. The $350 is not gone. It is simply not part of what you are allowed to spend from.",
        ],
      },
      {
        kind: "compare",
        heading: "What counts as an emergency",
        left: {
          label: "Counts",
          items: [
            "A repair you need to keep working or driving",
            "An unexpected medical or vet bill",
            "A lost or stolen essential item",
            "A gap when income stops for a while",
          ],
        },
        right: {
          label: "Does not count",
          items: [
            "A sale on something you were planning to buy",
            "A holiday that came up",
            "A gift you had not budgeted for",
            "A bill you knew was coming",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "When you dip into it",
        paragraphs: [
          "You will, at some point. That is what it is for, and using it is not failing at saving. The only rule is to put it back when you can, and to notice that the fund worked: the emergency happened, and it did not land on a card.",
          "Once you have reached the first thousand, you can decide whether to keep building. Until then, keep it simple. If the month is tight, look at [how to save money this month without a big life change](/guides/how-to-save-money-fast).",
        ],
      },
      {
        kind: "callout",
        label: "Try it free",
        body: "Monthly Money Reset lets you add a reserve, an amount you do not want to spend, and takes it out of your safe-to-spend number. It does not move money for you or track a savings goal, so the actual saving still happens in your account. What it does is make sure the reserve is never counted as spending money. It is free and needs no bank connection.",
      },
    ],
  },

  {
    slug: "how-to-save-money-fast",
    title: "How to save money this month without a big life change",
    dek: "Four small moves that free up cash within a single month, ranked by effort, plus the popular cuts that are not worth the trouble.",
    primaryQuery: "how to save money this month",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Fast saving advice tends to fall into two camps: give up the things you enjoy, or find a side income. Neither is a plan for a normal month. What works far more often is smaller and duller: find money that is leaving without you noticing, and stop it.",
          "This is about one month. Not a year, not a lifestyle. The goal is to end this month with more than you would have.",
        ],
      },
      {
        kind: "list",
        heading: "Four moves, in order of effort",
        checkable: true,
        items: [
          "Check every recurring charge, including the annual ones you have forgotten.",
          "Move a small amount into savings first, before you spend anything else.",
          "Trim one flexible group by a modest amount, and only one.",
          "Check your tightest day so you know how much room the month really has.",
        ],
      },
      {
        kind: "table",
        heading: "Where a month's savings usually come from",
        columns: ["Where to look", "What to look for", "Effort"],
        rows: [
          ["Recurring charges", "Subscriptions you no longer use, plans you could downgrade", "Low"],
          ["Bills", "Phone or internet plans that have crept up since you signed", "Medium"],
          ["Flexible spending", "The one group that has grown most this month", "Medium"],
          ["Fees", "Bank or card fees you could avoid with a small change", "Low"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Start with what recurs",
        paragraphs: [
          "A recurring charge is the best kind of saving, because you make the decision once and it keeps paying you back. Go through your statements for anything that repeats. If you have not looked in a while, [finding every subscription you are paying for](/guides/how-to-find-every-subscription-you-are-paying-for) walks through it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Move a small amount first",
        paragraphs: [
          "Saving what is left over rarely works, because there is rarely anything left. Set a small amount aside at the start of the month, even if it feels too small to matter, and treat the rest as your spending money. Fifty dollars set aside on day one beats two hundred you meant to set aside on day thirty.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check the tightest day before you commit",
        paragraphs: [
          "Before you set money aside, check the lowest point your balance will reach this month. If saving another fifty dollars would leave you short the day rent leaves, it is not a saving, it is a loan from your future self. Knowing the tightest day tells you how much room is real.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What is not worth the effort",
        paragraphs: [
          "Cutting small treats you enjoy usually saves very little and costs you a lot of goodwill toward the whole plan. Chasing a few dollars of cashback or tracking every coffee tends to take more attention than it returns. If a saving is going to cost you more in effort than it earns, leave it.",
        ],
      },
      {
        kind: "callout",
        label: "Try it free",
        body: "Monthly Money Reset shows what is safe to spend once your bills and reserve are held back, gives you a rough weekly figure, and points out your tightest day. It is free, needs no bank connection, and takes a few minutes to set up. If you want somewhere to keep recurring charges as well, that is what Personal Finance Companion is for.",
      },
    ],
  },

  {
    slug: "how-to-start-over-after-budget-failure",
    title: "You fell off your budget: how to restart this month",
    dek: "You do not need to catch up on six weeks of receipts. You need today's balance, the bills still coming, and one clear number.",
    primaryQuery: "how to restart a budget",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "You had a budget. Then a busy week turned into three, and now the numbers on screen are weeks out of date. The natural instinct is to catch up: dig out old receipts, reconcile everything, and get back to where you were. That instinct is a common reason budgets end here.",
          "Catching up is the hardest way to restart, and it is unnecessary. A budget does not need a perfect history. It needs to be true from today.",
        ],
      },
      {
        kind: "compare",
        heading: "Two ways back",
        left: {
          label: "Catching up",
          items: [
            "Rebuild weeks of old spending",
            "Reconcile every account",
            "Feel behind until you finish",
            "Easy to abandon halfway",
          ],
        },
        right: {
          label: "Starting from today",
          items: [
            "Enter today's real balance",
            "Add the bills still to come",
            "Have a working number in minutes",
            "Nothing old to be wrong about",
          ],
        },
      },
      {
        kind: "list",
        heading: "The restart, in four steps",
        checkable: true,
        items: [
          "Forget last month. It has already happened and cannot be fixed by logging it late.",
          "Enter today's balance, the amount that is really in the account right now.",
          "Add the bills still coming, only the ones ahead of you, with their due dates. Include any card balance you owe.",
          "Ignore the rest. Old spending from this account is already reflected in its balance.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why today's balance is enough",
        paragraphs: [
          "Your account balance already reflects every purchase you paid for from it while you were not tracking. It is the summary of that spending, so you do not need the history to know where you stand. Card purchases are the exception: they show up as a balance you owe, so add that to the bills still coming. Take the balance, subtract the bills that are still coming, and you have the honest number for the rest of the month.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Your first check-in back",
        paragraphs: [
          "When you open your budget after time away, the useful question is what changed since you were last here. Has your safe number gone up or down? How long since you confirmed it? Which bills were paid? Start there, add anything missing, and close it.",
          "Then keep the routine small. A five minute weekly check-in is easier to keep than a daily habit. If you are unsure how to build one, [the four question weekly check-in](/guides/how-to-budget-for-beginners) explains it.",
        ],
      },
      {
        kind: "callout",
        label: "Try it free",
        body: "Monthly Money Reset is built for exactly this. Open it after a gap and it shows what changed since you were last here, how old your figures are, and one next move. You can reset a month in a few minutes from today's balance, with no old receipts and no bank connection. It is free.",
      },
    ],
  },

  {
    slug: "end-of-month-money-review",
    title: "End of month money review: a ten minute checklist",
    dek: "Note where the month ended, check every bill, choose what carries into next month, and start clean without turning it into a lecture.",
    primaryQuery: "end of month budget review",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "An end of month review sounds like homework, which is why many people skip it. Done well, it is short and it changes the next month: you see what happened, you keep what worked, and you start with a number you trust.",
          "The aim is a look, not a verdict. If you finish feeling worse than you started, the review has gone wrong.",
        ],
      },
      {
        kind: "list",
        heading: "The ten minute review",
        checkable: true,
        items: [
          "Note the number you ended on, the last safe-to-spend figure for the month.",
          "Check that every bill was paid or deliberately skipped.",
          "Glance at each spending group against its rough guide, without judging it.",
          "Decide what carries into next month and what stays behind.",
          "Choose next month's starting balance.",
        ],
      },
      {
        kind: "table",
        heading: "What carries into next month, and what does not",
        intro: "Recurring things return. One-off things do not, so a new month starts as a fresh picture and not a copy of the old one.",
        columns: ["Item", "Carries?", "Why"],
        rows: [
          ["Recurring income", "Yes", "It will come again, so it returns as expected"],
          ["Recurring bills", "Yes", "They come back as upcoming"],
          ["Spending groups", "Yes", "So you do not rebuild your setup each month"],
          ["Reserve preference", "Yes", "The amount you keep out of your spending"],
          ["One-off spending", "No", "It belongs to the month it happened in"],
          ["Old activity", "No", "It stays in your history, not your new number"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Choosing a starting balance",
        paragraphs: [
          "You have a few honest options. You can start from what is really in your account right now, which is usually the most accurate. You can enter a different starting amount if some of it is spoken for elsewhere. Or you can begin at zero, on purpose, if you want a clean slate. The one you should avoid is guessing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep it a look, not a verdict",
        paragraphs: [
          "A reflection is optional and it should be short. One line about what worked and one about what to change is plenty. There is no score to beat and no streak to protect. A month that went badly is still useful information, and a month that went well does not need celebrating with a spreadsheet.",
          "If you have fallen behind and the review feels heavy, [start from today instead](/guides/how-to-start-over-after-budget-failure).",
        ],
      },
      {
        kind: "callout",
        label: "Try it free",
        body: "Monthly Money Reset closes a month for you. It shows a closing summary, lets you choose what carries forward with a toggle for each item, and starts the next month with your recurring bills and income already in place. Past months stay in your history. It is free and needs no bank connection.",
      },
    ],
  },

  {
    slug: "how-to-cancel-subscriptions",
    title: "How to cancel a subscription that is hard to cancel",
    dek: "Where cancel buttons hide, what to say when the company pushes back, and how to confirm the charge really stopped. Includes four scripts.",
    primaryQuery: "hard to cancel subscription",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Some subscriptions take a single click to start and a phone call to stop. That is common, and it is worth knowing before you try, so that the friction does not talk you into keeping something you do not want.",
          "Finding the subscription is one job, covered in [how to find every subscription you are paying for](/guides/how-to-find-every-subscription-you-are-paying-for). This guide is about the next one: actually ending it.",
        ],
      },
      {
        kind: "table",
        heading: "Where the cancel option usually hides",
        columns: ["Where you signed up", "Where to look"],
        rows: [
          ["Directly on the company's site", "Account, then Billing or Membership, then Cancel or Manage plan"],
          ["Through Apple", "Settings, your name, Subscriptions"],
          ["Through Google Play", "Play Store, your profile, Payments and subscriptions"],
          ["Through a streaming or app bundle", "The bundle provider's account page, not the individual service"],
          ["Through a phone or internet provider", "The provider's account page or a customer service call"],
        ],
      },
      {
        kind: "scripts",
        heading: "What to say when they push back",
        intro: "Pick the situation you are in. Keep it short and polite, and say the same thing again if you need to.",
        items: [
          {
            situation: "They offer a discount",
            line: "Thank you, but I would like to cancel today. Please confirm the cancellation and the date it takes effect.",
          },
          {
            situation: "They say call us",
            line: "I would like to cancel my subscription. Can you tell me what you need from me to do that today?",
          },
          {
            situation: "Only chat is available",
            line: "I want to cancel my subscription. Please cancel it and send me written confirmation.",
          },
          {
            situation: "They refuse to cancel",
            line: "I have asked to cancel and I would like a reference number for this request. I will also check with my card provider about the charge.",
          },
        ],
      },
      {
        kind: "list",
        heading: "Check that it actually ended",
        checkable: true,
        items: [
          "Get a confirmation, by email or on screen, and keep it.",
          "Note the date the cancellation takes effect. Some run to the end of the period you paid for.",
          "Look for the next scheduled charge and confirm it is gone.",
          "Check your statements a month later to make sure no charge came through.",
          "Remove the card from the service if it lets you.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Cancel one thing today",
        paragraphs: [
          "If you have found several subscriptions, do not try to cancel them all in one sitting. Pick the one that costs the most for the least use and end that today. The rest can follow, and one cancelled charge is worth more than a list of intentions.",
          "Use the annual figure to choose. Fourteen ninety nine a month sounds small. It is more than one hundred and seventy nine dollars a year, which is a different question.",
        ],
      },
      {
        kind: "callout",
        label: "Keeping the list",
        body: "Personal Finance Companion keeps your subscriptions alongside your bills, with a monthly total, a decision on each one (keep, still deciding, planned to cancel), and Attention shows a kept annual subscription within 14 days of renewing. It tracks the decision and will not cancel anything for you. If you only want to see what a canceled charge frees up, Monthly Money Reset, which is free, will show your safe-to-spend number rise once the bill is removed.",
      },
    ],
  },

  // ------------------------------------------------------- Home Base set
  // Seven guides written for the Home Base Pinterest pins. Each answers a
  // search a homeowner or renter actually types, and each stays inside what
  // Home Base does: you type everything, nothing is scanned or uploaded,
  // there is no valuation and no lifespan forecast, and reminders are a
  // setting you turn on.

  {
    slug: "fall-home-maintenance-checklist",
    title: "Fall home maintenance checklist by month",
    dek: "September, October and November in order: heating tune-up, freeze jobs, then gutters. Short on purpose, built around jobs that prevent damage.",
    primaryQuery: "fall home maintenance checklist",
    publishedAt: "2026-09-26",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Fall is when a house asks for the most in the least time. The heating comes on for the first time in months, the outdoor water has to be dealt with before the first hard frost, and the gutters fill up right when you would like to be doing something else.",
          "Most fall lists are a wall of forty items. This one is short on purpose: the jobs that prevent damage, in the month they belong to. For the other seasons, see [the by-month checklist](/guides/home-maintenance-checklist-by-month).",
        ],
      },
      {
        kind: "timeline",
        heading: "The fall list, month by month",
        intro: "Do these in order. Each one is easier if the one before it is finished.",
        steps: [
          { when: "September", what: "Book the professional heating tune-up before everyone else does. Seal the gaps mice use to get in before the cold sends them looking." },
          { when: "October", what: "Shut off and drain the outdoor faucet. Blow out the irrigation lines if you have them. Replace the humidifier pad. Take the window air conditioner out and store it. Service the snow blower and the mower's winter fuel before you need them." },
          { when: "November", what: "Clear the gutters once the leaves are down, not before." },
        ],
      },
      {
        kind: "table",
        heading: "What each job protects against",
        columns: ["Job", "When", "What it prevents"],
        rows: [
          ["Heating tune-up", "September", "A breakdown in the first cold week, when every technician is booked"],
          ["Seal entry points", "September", "Mice moving in for the winter"],
          ["Drain the outdoor faucet", "October", "A frozen line that splits and floods a wall later"],
          ["Blow out irrigation lines", "October", "Cracked pipes and sprinkler heads"],
          ["Replace the humidifier pad", "October", "A humidifier working harder for less"],
          ["Store the window air conditioner", "October", "Drafts and a damaged unit"],
          ["Clear the gutters", "November", "Water overflowing at the fascia and the foundation"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why fall reminders fail",
        paragraphs: [
          "A reminder that repeats every 365 days is the wrong shape for a freeze job. The deadline is not a date, it is the weather. If you drained the faucet on the twenty-eighth of October last year and the first frost arrives on the fifteenth this year, an interval reminder is late.",
          "That is why these jobs belong to a month, not a timer. Put them where you will see them in September, and treat the first forecast of freezing temperatures as the real deadline. There is more on this in [winterize your house: the jobs to finish before the first freeze](/guides/winterize-your-house-checklist).",
        ],
      },
      {
        kind: "list",
        heading: "A quick check before you start",
        checkable: true,
        items: [
          "Do you know where your outdoor faucet shutoff is, if it has one inside the house?",
          "Is the ladder safe, and is someone home while you use it?",
          "Do you have the heating filter size written down where you can find it?",
          "Have you booked the tune-up, not just planned to?",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base puts each of these in the month it belongs to. Its Seasons page shows the fall jobs for the things in your house, so a home with no irrigation system does not see the irrigation job. Jobs you have not logged yet read \"Not logged yet, usually October\". Seasons follow the northern hemisphere. Reminders are off until you turn them on, and you type in what you did, nothing is scanned.",
      },
    ],
  },

  {
    slug: "winterize-your-house-checklist",
    title: "Winterize your house: jobs to finish before the first freeze",
    dek: "Freeze jobs have a deadline, and the weather sets it. What to do, in what order, and what to write down so next year takes five minutes.",
    primaryQuery: "winterize house checklist",
    publishedAt: "2026-09-26",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most home maintenance runs on an interval: change the filter every three months, flush the water heater every year. Winterizing does not. It runs on a date that you do not choose, which is the first night the temperature drops below freezing.",
          "The good news is that the list is short. Five jobs cover a lot of what goes wrong. Most of them are not difficult. All of them are easier in a dry afternoon in October than in a cold snap in January.",
        ],
      },
      {
        kind: "list",
        heading: "The winterizing list",
        intro: "Tick them off as you go. This list lives on the page for this visit only.",
        checkable: true,
        items: [
          "Shut off and drain the outdoor faucet before the freeze, and disconnect the hose.",
          "Blow out the irrigation lines before the freeze, or book someone who has the compressor.",
          "Take out the window air conditioner and store it for winter.",
          "Replace the humidifier pad.",
          "Seal entry points before the cold, especially around pipes and the garage door.",
        ],
      },
      {
        kind: "compare",
        heading: "Date jobs and interval jobs",
        left: {
          label: "Interval jobs",
          items: [
            "Replace the furnace filter every three months",
            "Test the smoke alarm every month",
            "Flush the water heater every year",
            "Fine to do a few days late",
          ],
        },
        right: {
          label: "Date jobs",
          items: [
            "Drain the outdoor faucet before the first freeze",
            "Blow out the irrigation lines before the freeze",
            "Store the window air conditioner for winter",
            "Not fine to do a few days late",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "Outside water first",
        paragraphs: [
          "The outdoor faucet is a common freeze failure. Water left in the pipe between the shutoff and the tap freezes, expands and can split the pipe inside the wall, where you will not see it until the thaw. Disconnect the hose, shut the water off to that line if there is a valve for it inside the house, and let the tap run until it stops.",
          "If your faucet has no interior shutoff or you are not sure how it is plumbed, that is a good question to ask a plumber once. This guide gives general information and is not a substitute for looking at your own plumbing. If you want to know where your main shutoff is before you need it, read [do you know where your main water shutoff is](/guides/where-is-my-water-shutoff).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The quiet jobs that still matter",
        paragraphs: [
          "The humidifier pad and the mice are the two jobs people forget because nothing visibly breaks. A worn pad means the humidifier works harder for less. Small gaps around pipes and the garage door are how mice come in as soon as the weather turns.",
          "Snow blowers and mowers belong on this list too if you own them. Service the blower before the first snow, and put winter fuel or a stabilizer in the mower.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write down the date you did it",
        paragraphs: [
          "The cheapest thing you can do for next year is note the date. \"Drained faucet, October 21\" is enough. Next October you will know whether you were early or late, and you will know it is a job you have done before.",
          "For the wider list of what falls due in the fall, see [the fall checklist by month](/guides/fall-home-maintenance-checklist).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base keeps the freeze jobs in the months they belong to and flags a seasonal job as due now once its month has come and it has not been logged. You record what you did and who did it, and the note stays with the item. It does not know your weather, and it does not send reminders unless you turn them on, so treat the first frost forecast as the deadline.",
      },
    ],
  },

  {
    slug: "home-maintenance-log-template",
    title: "Home maintenance log template: what to write each time",
    dek: "A home maintenance log is four fields and one note: date, what was done, who did it and what it cost. Example entries show how much to write.",
    primaryQuery: "home maintenance log",
    publishedAt: "2026-09-26",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many home maintenance logs stop being kept early. They ask for too much: model numbers, part costs, photos, reference codes. Every extra field is a reason to put it off until tomorrow.",
          "A log that survives asks for very little. It is there to answer three questions later: when did we last do this, who did it, and what did it cost. Everything else is optional.",
        ],
      },
      {
        kind: "table",
        heading: "What to write each time",
        columns: ["Field", "Example", "Why it matters"],
        rows: [
          ["Date", "Aug 14", "Tells you when the clock started for the next one"],
          ["What was done", "Flushed the water heater tank", "Says what changed, in plain words"],
          ["Who did it", "Ace Plumbing, or you", "Gets you a phone number next time, not a search"],
          ["What it cost", "$180.00", "Lets you compare quotes and spot a price that is off"],
          ["One note", "Anode rod is due next time", "The one line that saves the next visit"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The note that saves money",
        paragraphs: [
          "The most valuable field is the last one. When a technician tells you what is coming next, write it down. \"Belt is wearing.\" \"Other spring will go soon.\" \"Filter size is different from what the old one said.\" That sentence is the difference between a routine visit and an emergency, because you will remember to raise it when you book.",
          "If a repair needed a diagnosis, write that down too. The diagnosis matters more than the invoice, which is covered in [what to keep after a home repair](/guides/what-to-keep-after-a-home-repair).",
        ],
      },
      {
        kind: "list",
        heading: "Make it easy to keep",
        checkable: true,
        items: [
          "Write it the same day, while you can still remember the detail.",
          "Keep one log for the whole house, not one per room.",
          "Write the cost even if it is a rough figure.",
          "Add the phone number the first time you use someone new.",
          "Skip the fields you will never look at.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Paper or app",
        paragraphs: [
          "Either works. A single page in a binder is fine if the binder lives somewhere you can reach it. The Home Survey, a printable book from Draftpace, has a page laid out much like this for the home's memory, and the app version does the same job on your phone.",
          "The point is not the format. It is that the answer is in one place when the water heater fails and someone asks how old the anode rod is.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base has an Action button on every job. Tap it and it asks when, who did it, what it cost, and whether there is anything worth remembering. Saving writes a line to the home's History and resets the clock. It stores what you type, not receipts or files, so keep the paperwork where it already lives and link to it if you like.",
      },
    ],
  },

  {
    slug: "how-often-change-furnace-filter",
    title: "How often to change a furnace filter (and the size to note)",
    dek: "Every three months is the working default; change it sooner with pets or dust. How to read the size numbers and where to write them once.",
    primaryQuery: "how often to change furnace filter",
    publishedAt: "2026-09-26",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The furnace filter is the cheapest job in the house and one of the easiest to lose track of. It does not fail loudly. A clogged one just makes the system work harder, week after week, until something else gives.",
          "Three months is a sensible default for a normal one inch filter in a normal house. The rest of this page is about when to shorten that, and how to stop doing the store-aisle guess.",
        ],
      },
      {
        kind: "table",
        heading: "When to change it sooner",
        intro: "These are ordinary rules of thumb. Your manual and your system's maker have the final say.",
        columns: ["Situation", "What tends to happen", "A sensible change"],
        rows: [
          ["Pets that shed", "The filter clogs with hair and dander faster", "Check monthly, change as needed"],
          ["Someone with allergies", "You want the filter working at its best", "Check monthly"],
          ["Renovation or heavy dust", "It can fill in days", "Check after the work, change if grey"],
          ["An empty or seldom-used house", "It loads slowly", "Three months is usually plenty"],
          ["Heating or cooling all season", "It works most of the year", "Every one to three months"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "How to read the size",
        paragraphs: [
          "The three numbers on the edge of the filter are its length, width and depth in inches. A filter marked 16x25x1 is about sixteen inches by twenty-five inches, and one inch thick. Sizes are usually nominal, so the real dimensions can be a fraction of an inch smaller, which is why you buy by the printed number and not by measuring.",
          "Write down the size on the day you change it. Also note the direction of the airflow arrow, and whether the filter slides in from the side or the front. These are the two things you will forget by the next change.",
        ],
      },
      {
        kind: "list",
        heading: "Write these down once",
        checkable: true,
        items: [
          "The size printed on the current filter's frame.",
          "The thickness, in case you have a deeper filter than the store shelf assumes.",
          "Where the filter lives: return grille, furnace door, or air handler.",
          "The date you changed it.",
          "The next date you want to check it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to keep it",
        paragraphs: [
          "The best place is somewhere you will be standing when you need it: on a strip of tape on the furnace, on your phone, or on a card you keep in your wallet. The same goes for the bulb type, the part number for the humidifier pad, and any other fact you look up every time.",
          "For the wider habit, see [how often things in your house actually need servicing](/guides/how-often-home-systems-need-servicing), and for finding a model number on an appliance, [how to find the model number on any appliance](/guides/how-to-find-the-model-number-on-any-appliance).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base has a What to buy field on every item. Put 16x25x1 filter there and it sits with the furnace, and it prints on the item's one-page Item Card, which you can take to the hardware store on paper or on your phone. Home Base uses three months for the furnace filter job by default. It does not know your household, so if you have pets or dust, change the filter sooner and log it when you do.",
      },
    ],
  },

  {
    slug: "where-is-my-water-shutoff",
    title: "Where is your main water shutoff? Find it before you need it",
    dek: "Where the main valve usually is, the two valve types, how to tell if it is stuck, and the one page to write it on so anyone can find it.",
    primaryQuery: "where is my main water shutoff",
    publishedAt: "2026-09-26",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a pipe fails, the fastest way to limit the damage is to stop the water at the source. That only works if you already know where the main shutoff is, everyone in the house knows too, and the valve turns.",
          "Finding it takes about ten minutes on an ordinary afternoon. Few people do it, which is exactly why it is worth doing. This page is general information, not a repair guide. If water is actively coming through a ceiling or a wall, or you smell gas or see sparks, treat that as an emergency and call the right professional.",
        ],
      },
      {
        kind: "table",
        heading: "Where the main shutoff usually is",
        columns: ["Where to look", "What you are looking for"],
        rows: [
          ["Near the water meter", "A valve on the pipe just before or after the meter"],
          ["Where the line enters the house", "A valve where the pipe comes through the foundation or the floor"],
          ["Basement or crawlspace", "Often on the wall closest to the street"],
          ["An outside box", "A ground-level box near the street or the foundation, sometimes with a curb valve inside"],
        ],
      },
      {
        kind: "compare",
        heading: "Two kinds of valve",
        left: {
          label: "Wheel or round handle",
          items: [
            "Usually a gate valve",
            "Turns several times",
            "Often stiff if unused for years",
            "May need gentle, steady effort",
          ],
        },
        right: {
          label: "Lever handle",
          items: [
            "Usually a ball valve",
            "Turns a quarter turn",
            "Closed when the lever sits across the pipe",
            "Easier to check at a glance",
          ],
        },
      },
      {
        kind: "list",
        heading: "The ten minute check",
        checkable: true,
        items: [
          "Find the valve and note where it is.",
          "Work out which way it turns, and write that down.",
          "Note any tool it needs, such as a wrench for a meter box.",
          "Check that it moves without forcing it. A valve that will not turn is worth asking a plumber about.",
          "Show everyone else in the house.",
          "Draw the location on a page where it will be found in an emergency.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep it turning",
        paragraphs: [
          "A valve you never touch can seize. Some people turn the main shutoff off and on once a year, gently, to keep it free. Home Base has a yearly job for exactly this, called Turn the valve to keep it free. If yours does not move, stop and ask a plumber, because forcing it can break it.",
          "Also note the smaller shutoffs: the ones under the sinks and behind the toilets. Those are a quick way to stop a single leak without shutting off the whole house.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write it where anyone can find it",
        paragraphs: [
          "The most useful page in a home binder is the one titled if something goes wrong tonight: where the water, gas and electricity shut off, which way each turns, and who to call first. Fill in the water line today. For the gas and the electrical panel, note where they are and leave the operating to a qualified person. If you are starting a binder, see [what goes in a home binder](/guides/how-to-make-a-home-binder).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base holds where things are and what they need, including a yearly job to keep the main shutoff turning. The Home Survey that comes with it has a page for exactly this, with boxes for water, gas and electricity. It does not detect leaks, and when you report something dangerous it keeps your note and tells you it sounds urgent, but it does not tell you what to do. Call a professional for that.",
      },
    ],
  },

  {
    slug: "how-to-make-a-home-binder",
    title: "How to make a home binder: what goes in and what stays out",
    dek: "Five sections cover almost everything a home binder needs, and one category of thing should never go in. You can build one in an afternoon.",
    primaryQuery: "how to make a home binder",
    publishedAt: "2026-09-26",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A home binder answers a single question at the worst possible moment: what do I need to know right now? It is not a filing cabinet and it is not a scrapbook. Anything that does not help you act quickly can live somewhere else.",
          "A binder can fail in two ways. It can be so ambitious that nobody finishes it, or so thin that it helps with nothing. Five sections is enough to be useful.",
        ],
      },
      {
        kind: "timeline",
        heading: "The five sections, in the order to fill them in",
        intro: "Start with the first and stop whenever you like. Each one is useful on its own.",
        steps: [
          { when: "If something goes wrong", what: "Where the water, gas and electricity shut off, which way each turns, and who to call first. Ten minutes. Do this one tonight." },
          { when: "Numbers you look up", what: "Filter sizes, bulb types, paint colors, meter numbers, trash and recycling days." },
          { when: "Who to call", what: "Plumber, electrician, heating and cooling, roofer, and their phone numbers, plus anyone you would use again." },
          { when: "What has been done", what: "A running log: date, what was done, on what, by whom and what it cost." },
          { when: "Dates that cost money", what: "Warranty expiry dates, the insurance renewal, and, if you rent, the lease and the deposit." },
        ],
      },
      {
        kind: "table",
        heading: "What belongs, and where it comes from",
        columns: ["Goes in", "Why", "How to get it"],
        rows: [
          ["Shutoff locations", "Speed in an emergency", "A walk of the house with a flashlight"],
          ["Filter and bulb sizes", "No more guessing in the store", "Read them off the item once"],
          ["Contacts", "A lookup, not a search", "Write each name and number the first time you use them"],
          ["The log", "Answers when it last happened", "Fill in after each job"],
          ["Warranty dates", "Claims fail on missed dates", "Copy from the paperwork"],
        ],
      },
      {
        kind: "callout",
        label: "What never goes in",
        body: "Passwords, alarm codes, the code to the garage keypad, and anything else that opens the house or your accounts. A binder gets lent to a house sitter, photographed for a repair quote and left on the counter. Write where things are and who to call. Never write the codes and passwords themselves.",
      },
      {
        kind: "list",
        heading: "Making one in an afternoon",
        checkable: true,
        items: [
          "Take a flashlight and a pen and walk the house once, kitchen first, then utility, basement, attic and outside.",
          "Fill in the emergency page before anything else.",
          "Write down what you find without organizing it yet.",
          "Put the pages in the binder in the order above.",
          "Set a date to add one thing a week, not to finish it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Paper and app together",
        paragraphs: [
          "A paper binder is easy to hand to someone, and it works when the power is out. It is also easy to lose track of, and it does not tell you when the filter is due. An app is the opposite. The two together are the best of both: paper for the emergency page and the numbers, an app for what falls due.",
          "If you have just moved in, [the first week after buying a house](/guides/first-week-after-buying-a-house) is the best time to start, because you can still see every label. For the log itself, see [a home maintenance log that actually gets used](/guides/home-maintenance-log-template).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "The Home Survey is a printable book that comes with Home Base: 36 pages on US Letter paper, with a page for the shutoffs, twelve areas of a house, every job and how often, a year plan, a page for who to call and a log. You fill it in on paper. Home Base keeps what falls due and what was done. It stores what you type, not the files, and it is not a place for passwords.",
      },
    ],
  },

  {
    slug: "moving-into-a-rental-what-to-document",
    title: "Moving into a rental: what to document on day one",
    dek: "Dated photos, lease dates, the deposit and a log of what you report. Four records made on day one settle most deposit arguments later.",
    primaryQuery: "rental move in checklist",
    publishedAt: "2026-09-26",
    areaSlug: "home",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When you leave a rental, the landlord compares the place to how it was. If nobody wrote down how it was, that comparison is one person's memory against another's. Photographs and dates turn it into a record.",
          "This guide is about habit, not law. Rules about deposits, notice and repairs differ from place to place, and this is not legal advice. Check your own lease and local rules for the specifics.",
        ],
      },
      {
        kind: "list",
        heading: "The day one list",
        intro: "Do this before you unpack, while every room is still empty.",
        checkable: true,
        items: [
          "Photograph every room, every wall, the floors, the windows and the inside of the appliances, with the date visible or recorded.",
          "Write down the lease start date, the renewal date, and the date by which you have to give notice.",
          "Record the deposit amount, who holds it, and when it is due back.",
          "Note anything that is already damaged, and send it to the landlord in writing.",
          "Keep a log of everything you report, with the date and the answer.",
        ],
      },
      {
        kind: "table",
        heading: "The four records",
        columns: ["Record", "What to write", "Why it helps later"],
        rows: [
          ["Photos", "Room, date, the problem if any", "Shows the condition on day one"],
          ["Lease dates", "Started, renews on, notice by", "The dates that cost money to miss"],
          ["Deposit", "Amount, held by, returned in", "You know what to ask for and when"],
          ["What you reported", "Date, what, the answer", "A trail if a problem comes back"],
        ],
      },
      {
        kind: "compare",
        heading: "What you look after, and what the landlord does",
        left: {
          label: "Usually yours",
          items: [
            "Keeping the place clean",
            "Changing smoke alarm batteries, if your lease says so",
            "Reporting problems promptly",
            "Renters insurance, if you have it",
          ],
        },
        right: {
          label: "Usually the landlord's",
          items: [
            "The roof and structure",
            "Major systems like heating and plumbing",
            "Repairs that are not your fault",
            "Deciding what happens with the deposit",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "Report in writing, and log it",
        paragraphs: [
          "When something breaks, tell the landlord in writing and keep a copy. A message is better than a phone call because it has a date. Add a line to your log with the date, what you said and what they answered. If the same problem comes back, that log is your record that you flagged it.",
          "Renters do not have to write down the roof, the gutters or the furnace. The list that matters is short: the lease, the deposit, the smoke alarm, and what you reported.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The photos, done properly",
        paragraphs: [
          "Take wide shots of each room, then close shots of anything that is scratched, stained or worn. Photograph the inside of the oven and the refrigerator, and the floor near the door. Keep the photos where you cannot lose them, and record the date you took them. The point is a set that anyone can look at and understand in a minute.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Home Base has a renter setup that stops asking about the roof and gutters and asks about the things above: the lease, the deposit, and what you have reported to the landlord and when. Its lease job, Decide before the notice deadline, is a yearly job to look at your notice date. It stores what you type, not photos or documents, so keep your photos in your own phone. It is not legal advice.",
      },
    ],
  },

  // ---------------------------------------------- Personal Finance Companion set
  // Eleven guides written for the Personal Finance Companion Pinterest pins.
  // Each answers a search someone actually types and stays inside what the
  // Companion does: everything is typed, pasted or imported and reviewed, there
  // is no bank connection, no PDF or scan import, no annual subscription
  // total, no reminders to rely on, and USD only. Available Money is a
  // month-level estimate, never a safe-until-payday figure.

  {
    slug: "debt-snowball-vs-avalanche",
    title: "Debt snowball vs avalanche: which costs less, which sticks",
    dek: "A three-debt example with real interest totals, why the two orders often finish close, and how to pick the one you will keep.",
    primaryQuery: "debt snowball vs avalanche",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "If you owe money on more than one thing, you have to decide where any extra money goes first. Every debt still gets its minimum. The question is which one gets the rest.",
          "There are two well-known answers. They differ less than the internet arguments suggest, and the honest answer to which is better is that it depends on your numbers and on what you will keep doing for the next few years.",
        ],
      },
      {
        kind: "compare",
        heading: "The two orders",
        left: {
          label: "Snowball: smallest balance first",
          items: [
            "Puts the extra on the smallest balance",
            "Clears a debt sooner, which feels like progress",
            "Frees up that minimum to roll into the next debt",
            "Can cost a little more interest",
          ],
        },
        right: {
          label: "Avalanche: highest rate first",
          items: [
            "Puts the extra on the highest interest rate",
            "Usually costs the least interest",
            "May take longer to clear the first debt",
            "Frees up minimums later",
          ],
        },
      },
      {
        kind: "table",
        heading: "A worked example",
        intro: "Three debts, $200 a month extra, starting September 2026. Interest is added each month at the yearly rate divided by twelve, and every debt gets its minimum.",
        columns: ["Debt", "Balance", "Rate", "Minimum"],
        rows: [
          ["Store card", "$1,200", "19.9%", "$40"],
          ["Visa", "$9,000", "24.9%", "$270"],
          ["Car loan", "$14,000", "7.5%", "$320"],
        ],
      },
      {
        kind: "table",
        heading: "What the two orders do with those numbers",
        columns: ["", "Snowball", "Avalanche"],
        rows: [
          ["First debt cleared", "Store card, March 2027", "Visa, October 2028"],
          ["Debt-free", "September 2029", "September 2029"],
          ["Interest along the way", "$5,109.78", "$4,995.84"],
          ["Difference", "", "$113.94 less"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the gap is often small",
        paragraphs: [
          "In this example both orders finish in the same month. The difference is the interest, and it is small compared with the total. That is common when the extra is modest and the rates are not wildly apart.",
          "There is also a case where the two do not differ at all. If the smallest balance is also the highest rate, both methods choose the same debt first. With no extra money there is less to direct, so the gap can shrink, though it does not always vanish, because a cleared debt's minimum rolls on to the next one. In the example above, paying only the minimums happens to give the same result under both methods: debt-free in March 2031 and $9,232.57 in interest. The extra dollars matter more than the method.",
        ],
      },
      {
        kind: "list",
        heading: "Write these down for each debt first",
        checkable: true,
        items: [
          "The balance you owe today.",
          "The interest rate. If you do not know it yet, find the statement or ask the lender.",
          "The minimum payment.",
          "The date the payment is due each month.",
          "Whether the rate is promotional and when it ends.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What a simple model leaves out",
        paragraphs: [
          "Every plan like this assumes a constant rate, so a promotional rate that ends is not captured. It assumes the minimum stays the same, though on many cards it shrinks as the balance falls. And it assumes you add no new charges. Treat the dates and totals as a way to compare two orders on the same numbers, not as a forecast of what will happen.",
          "Then choose the order you will keep. A method you abandon after six months costs more than either one. If you are also trying to understand what a minimum-only path looks like, see [how long paying only the minimum takes](/guides/credit-card-minimum-payments-how-long).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion has a payoff plan. You enter each debt's balance, rate and minimum, add an extra amount for each month, and switch between smallest balance first and highest rate first. It shows the month each debt clears, the interest along the way, and, when two or more debts are in the plan, which order costs less. A debt with no rate is left out and named, not guessed. It is a model from your own numbers, not advice, and it does not change what you pay. It is $49 once.",
      },
    ],
  },

  {
    slug: "monthly-bills-list",
    title: "Monthly bills list: include the bills that are not monthly",
    dek: "A six column list, plus the math for turning quarterly and annual bills into a monthly amount: $612 every three months is $204 a month.",
    primaryQuery: "monthly bills list",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A bills list feels like the simplest possible piece of organizing, and it usually fails at the same point: it lists what arrives every month and forgets everything else. The bills that surprise you are often not the monthly ones.",
          "A useful list has a small number of columns and includes the quarterly and annual bills from the start. It takes about half an hour to build the first time, and a few minutes a month to keep.",
        ],
      },
      {
        kind: "table",
        heading: "The columns",
        columns: ["Column", "What to write", "Why it matters"],
        rows: [
          ["Name", "Rent, electric, car insurance", "You will scan for it by name"],
          ["Amount", "A number, or a low and a high", "Some bills move; be honest about it"],
          ["Due day", "The day of the month, or a specific date", "A bill with no date cannot be planned around"],
          ["How often", "Monthly, quarterly, annual", "Tells you what a month really costs"],
          ["Essential", "Yes or no", "What has to be paid before anything else"],
          ["Shared", "Who pays part, and what share", "Stops you paying for someone else's half"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Turn every bill into a monthly amount",
        paragraphs: [
          "To see what a normal month costs, convert every bill to a monthly equivalent. A monthly bill is itself. A quarterly bill divided by three. An annual bill divided by twelve.",
          "For example, car insurance of $612 every three months is $204 a month. A $96 annual renewal is $8 a month. Add those to the monthly bills and you have a more honest figure for what leaves in a month than the bills you can see in your banking app.",
        ],
      },
      {
        kind: "list",
        heading: "Build it in four passes",
        checkable: true,
        items: [
          "Pull the last three months of statements and list everything that repeated.",
          "Add anything that comes less often: quarterly, twice a year, annual.",
          "Write a due day or date against each one, and mark the ones you cannot find.",
          "Mark which bills are essential, then note the ones that vary.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Bills that move around",
        paragraphs: [
          "Electric, water and phone bills change. Write a low and a high, and plan toward the high. There is a longer method in [how to budget for bills that change every month](/guides/budget-for-variable-bills).",
          "For the non-monthly ones, a small monthly amount set aside for each is the quieter alternative to scrambling when they arrive. That idea has its own guide: [sinking funds](/guides/sinking-funds-explained).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion has a Bills screen with all of these fields, including frequency (monthly, quarterly, annual, custom), an amount that can vary, and a due day or date. It shows a monthly total and what is left to pay this month, lets you tick a bill paid, and flags any bill with no due date. You type the bills in, or paste them and review each one. It does not read your bank, and it counts a full month of bills toward Available Money whether or not you have ticked them paid. It is $49 once.",
      },
    ],
  },

  {
    slug: "organize-your-finances-from-scratch",
    title: "How to organize your finances when everything is scattered",
    dek: "Bank apps, statements, a notes file and a lot in your head. A ten minute, six step starting path that works without every statement to hand.",
    primaryQuery: "how to organize your finances",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most advice about organizing money starts with gathering every statement, every login and every bill. That is exactly what makes it hard to start. The picture you can build in ten minutes from what you already know is more useful than the perfect one you never begin.",
          "This is a starting path, not a system. It is meant to be finished the same day, and improved later.",
        ],
      },
      {
        kind: "timeline",
        heading: "The ten minute starting path",
        steps: [
          { when: "Gather", what: "Write down where your money information lives: bank apps, a statement folder, notes, a spreadsheet, or your head." },
          { when: "Write what you know", what: "Accounts and roughly what is in them. What comes in and when. The bills you can name. The debts you owe." },
          { when: "Mark what you do not", what: "Beside anything you are unsure of, write a question mark. Do not guess." },
          { when: "Find one number", what: "Pick the single figure you most want: what is actually free to spend, or when the debt is gone." },
          { when: "Fix one thing", what: "Choose the one gap that matters most and close it, such as a missing due date." },
          { when: "Set a rhythm", what: "Choose a small, regular time to update it, weekly or monthly." },
        ],
      },
      {
        kind: "list",
        heading: "Six areas to cover",
        checkable: true,
        items: [
          "Accounts: where your money sits, and roughly how much.",
          "Income: what comes in, how sure you are of it, and when.",
          "Bills: what is due on a schedule, including the ones that are not monthly.",
          "Subscriptions: what renews on its own.",
          "Debts: what you owe, the rate and the minimum.",
          "Goals: what you are saving toward, and by when.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The gaps are useful",
        paragraphs: [
          "A gap is not a failure. A bill with no due date, a debt with no interest rate and an account you have not checked in a month are all things you now know to find. A picture that says where it is unsure is more trustworthy than one that quietly fills the blanks.",
          "If you want the simplest possible version to start with, [how much of your money is actually safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend) gives you one number from three inputs.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Paper, notes or an app",
        paragraphs: [
          "Any of them works for the first pass. The thing that matters is that you can update it in a few minutes, because a picture that is two months old is worse than none. If you like paper, a printable workbook is a good way to gather. There is more on that in [how to make a financial binder](/guides/financial-binder-what-to-include).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion starts by asking where your financial information is right now: mostly in your head, in notes, in a text file, in a spreadsheet, or already known. It then goes one area at a time, and nothing is required. You type it in, paste it, or import a CSV, and you review anything imported before it counts. Missing information is shown, not hidden, and the app suggests one next move at a time. It is $49 once.",
      },
    ],
  },

  {
    slug: "split-bills-with-a-partner-or-roommate",
    title: "How to split bills with a partner or roommate: 3 methods",
    dek: "Equal, by income or by item: what each one assumes, four things to agree first, and a one page record so the question stays settled.",
    primaryQuery: "how to split bills with a partner",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Sharing a home or a life means sharing costs, and most arguments about it are not about the money. They are about not being able to remember who paid what. A little structure fixes most of that.",
          "This guide is neutral about the answer. It describes three common ways to split, what each one assumes, and how to keep a record.",
        ],
      },
      {
        kind: "table",
        heading: "Three ways to split",
        columns: ["Approach", "How it works", "It assumes"],
        rows: [
          ["Equal", "Every bill is split in half", "Similar income and similar use"],
          ["By income", "Each person pays a share matching what they earn", "You are comfortable sharing income"],
          ["By item", "Each person takes certain bills", "The bills are of similar size"],
        ],
      },
      {
        kind: "list",
        heading: "Agree these four things first",
        checkable: true,
        items: [
          "Which bills count as shared, and which do not.",
          "What each person's share is, as a percentage.",
          "How often you settle: monthly, or when it adds up.",
          "Where you write it down, so both of you can see it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write down what is settled and what is owed",
        paragraphs: [
          "The simplest habit is a running record: each shared bill, the amount, each person's share, and a mark when it is settled. When someone asks whether rent was paid, the answer is on the page.",
          "A one-page statement of what is still owed, and what has already been settled, is often all you need to send. It turns a memory dispute into arithmetic.",
        ],
      },
      {
        kind: "compare",
        heading: "When a joint account helps, and when it does not",
        left: {
          label: "A joint account suits",
          items: [
            "Long-term partners who share most costs",
            "Bills that are always the same amount",
            "Two people who check in regularly",
          ],
        },
        right: {
          label: "Tracking separately suits",
          items: [
            "Roommates and short-term arrangements",
            "Costs that are only partly shared",
            "Anyone who wants to keep the rest private",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "Keep it plain",
        paragraphs: [
          "Avoid turning it into a ledger of every coffee. Agree the shared bills once, review them when something changes, and write down settlements as they happen. If your bills are a mix of monthly and non-monthly, [a monthly bills list](/guides/monthly-bills-list) is a good base to share from.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Personal Finance Companion, any bill or subscription can be marked Shared Responsibility with your share as a percentage. The row shows your share and their share, you tick it settled, and you can download a one-page PDF of what is still owed and what is already settled. The other person needs no account. It is manual: it does not send money, request payment or track who paid. It is $49 once.",
      },
    ],
  },

  {
    slug: "subscription-tracker-what-to-track",
    title: "Subscription tracker: the six fields that catch renewals",
    dek: "The renewal date beats the price. What to write down for each subscription, the annual charge trap and a five minute monthly check.",
    primaryQuery: "subscription tracker",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Finding your subscriptions is a one-time job, covered in [how to find every subscription you are paying for](/guides/how-to-find-every-subscription-you-are-paying-for). Keeping track of them is the ongoing one, and it needs far less than most trackers ask for.",
          "The single most useful thing to record is not the price. It is the date it renews, because that is the last moment you can do anything about it.",
        ],
      },
      {
        kind: "table",
        heading: "The six fields",
        columns: ["Field", "What to write", "Why"],
        rows: [
          ["Name", "The service", "So you can find it again"],
          ["Charge", "What it costs each cycle", "The number that leaves your account"],
          ["Cycle", "Monthly, annual, or something else", "Annual charges are the easy ones to miss"],
          ["Renewal date", "The date it next charges", "The date you can act on"],
          ["Your decision", "Keep, still deciding, or planned to cancel", "Turns a vague worry into a status"],
          ["Who shares it", "If someone else pays part", "Stops two people paying for the same thing"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The annual trap",
        paragraphs: [
          "A charge you pay once a year is invisible for eleven months and then lands all at once. It is also the charge most likely to renew because you forgot. If you keep only one habit, make it a heads-up about two weeks before any annual renewal, so there is time to decide.",
        ],
      },
      {
        kind: "list",
        heading: "A five minute monthly check",
        checkable: true,
        items: [
          "Look at anything renewing in the next two weeks.",
          "For each one, keep it, decide, or plan to cancel it.",
          "Look at anything marked still deciding and settle at least one.",
          "Add any new subscription you started this month.",
          "Remove anything you have already canceled.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Canceling is the easy part after you decide",
        paragraphs: [
          "Once a subscription is marked planned to cancel, the last step is to actually do it, which some services make harder than it should be. That is covered in [how to cancel a subscription that is hard to cancel](/guides/how-to-cancel-subscriptions).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion tracks subscriptions with a decision on each one: keep, still deciding, planned to cancel, or already canceled. It shows a monthly total, and it puts a kept annual subscription in Attention when it is within 14 days of renewing. It tracks the decision and will not cancel anything for you. It does not show an annual total. It is $49 once.",
      },
    ],
  },

  {
    slug: "bank-statement-csv-to-budget",
    title: "How to import a bank statement CSV: check the file first",
    dek: "Download the file, check its shape, map the columns and catch duplicate rows, plus what a list of past transactions cannot tell you.",
    primaryQuery: "import bank statement csv",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most banks let you download a transaction history as a CSV, a plain text file of rows and columns. It is the simplest way to work with your own spending data without connecting an account to anything. It is also full of small traps.",
          "This guide walks through the process, and is honest about what a list of transactions can and cannot tell you.",
        ],
      },
      {
        kind: "list",
        heading: "Check the file before you use it",
        checkable: true,
        items: [
          "Open it and confirm there is a header row naming each column.",
          "Check whether spending is negative or shown as a positive number.",
          "Check whether there is one amount column, or separate debit and credit columns.",
          "Check the date format: month first or day first.",
          "Scan for duplicate rows, the same date, amount and description twice.",
        ],
      },
      {
        kind: "timeline",
        heading: "The process",
        steps: [
          { when: "Download", what: "Export the period you want from your bank, as a CSV." },
          { when: "Look", what: "Open it and check the shape using the list above." },
          { when: "Map", what: "Tell whatever tool you are using which column is the date, the description and the amount." },
          { when: "Review", what: "Look for duplicates and anything that looks wrong before it counts." },
          { when: "Categorize", what: "Give each transaction a category, or skip the ones that do not matter." },
        ],
      },
      {
        kind: "paragraphs",
        heading: "What a CSV cannot tell you",
        paragraphs: [
          "A transaction list tells you what happened. It does not tell you what is coming: the bill due Friday, the subscription renewing next week, the balance you need to keep. It also does not know which of your accounts you meant to keep out of your spending.",
          "That is why a list of transactions alone gives you a description of the past, not a plan. To plan, you need your bills, your income and your balances, alongside it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Watch for the double count",
        paragraphs: [
          "Two things commonly go wrong. A file that overlaps with one you imported before will duplicate rows. And a transfer between your own accounts can appear as both spending in one and income in the other. Look at anything that shows up twice with the same date and amount before you trust a total.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "No bank login needed",
        paragraphs: [
          "Downloading a file yourself means you never give a third party access to your account. The trade-off is that it is a snapshot you have to refresh. For a monthly habit, that is often exactly enough. If you want a simpler starting point, see [how to make a monthly budget for the first time](/guides/how-to-budget-for-beginners).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion imports a transaction CSV up to 2 MB. You map the columns yourself: date, description, and either one amount column or separate debit and credit columns. Rows it cannot read are skipped and counted, ambiguous cells are rejected rather than guessed, and an exact duplicate is flagged. Nothing is saved until you review it. It imports transactions only, not accounts or bills, and imported transactions do not change your Available Money. It has no PDF or scan import and no bank connection. It is $49 once.",
      },
    ],
  },

  {
    slug: "financial-binder-what-to-include",
    title: "Financial binder: what to include and how often to update",
    dek: "Seven sections cover most of a financial binder. What each holds, how sure to be about each entry, and a short routine to keep it current.",
    primaryQuery: "financial binder what to include",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A financial binder is a private place to gather what you know about your money: what you have, what comes in, what is due, and what you owe. It does not replace your bank or your records. It is where you put the picture together so you can see it.",
          "The most useful binders are short. Seven sections is enough, and none of them needs to be finished before the next one is useful.",
        ],
      },
      {
        kind: "timeline",
        heading: "The seven sections, in the order to fill them",
        steps: [
          { when: "01 Accounts", what: "Each account, its type, roughly what is in it, and the date you last checked." },
          { when: "02 Income", what: "Each source, how sure you are of the amount, and when it arrives." },
          { when: "03 Bills", what: "Everything due on a schedule, with amounts and due days." },
          { when: "04 Subscriptions", what: "What renews on its own, the date, and your decision on each." },
          { when: "05 Debt", what: "Each debt, its balance, rate and minimum." },
          { when: "06 Savings goals", what: "What you are saving toward, the target and the date." },
          { when: "07 A written summary", what: "A few lines in plain words on where you stand, and what you will do next." },
        ],
      },
      {
        kind: "table",
        heading: "How confident to be in each entry",
        intro: "Marking how sure you are is what stops a binder from becoming a source of false confidence.",
        columns: ["Label", "Meaning"],
        rows: [
          ["Confirmed", "You checked it against a statement or a bill"],
          ["Estimated", "A reasonable guess, with a range if you have one"],
          ["Unresolved", "You know it matters and have not found it yet"],
          ["Missing", "You have not entered it at all"],
          ["Stale", "It was right once and has not been checked recently"],
        ],
      },
      {
        kind: "list",
        heading: "Keeping it current",
        checkable: true,
        items: [
          "Set one small, regular time to update it, weekly or monthly.",
          "Update balances and anything that changed, not everything.",
          "Add a short note about what you decided and why.",
          "Keep the binder somewhere private, since it holds sensitive information.",
          "Do not write passwords, full account numbers or security answers in it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Paper and an app together",
        paragraphs: [
          "Paper is good for gathering. It is easy to hand over, and it does not need power. It will not tell you what is due next week. An app is the opposite. Using the two together means neither has to do everything. If you are just starting, [how to organize your finances when everything is scattered](/guides/organize-your-finances-from-scratch) is the shorter path.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion comes with an 81-page printable workbook in US Letter and A4. It has the sections above, a page to compare two debt payoff methods, a variable bills worksheet, twelve monthly review spreads and a quick reference card with a ten minute starting path. It is a private paper workbook for gathering and preparing your money, and the app keeps it current. Net worth is a handwritten page in the workbook, not something the app calculates. It is $49 once.",
      },
    ],
  },

  {
    slug: "sinking-funds-explained",
    title: "Sinking funds explained: save for costs you can see coming",
    dek: "The formula for a monthly amount, with a $600 example: subtract what is saved, divide by months left. Where to keep it and five costs to start with.",
    primaryQuery: "sinking funds explained",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Some of the biggest costs in a year are not surprises. They are just infrequent: car registration, an insurance premium paid twice a year, a holiday, a run of birthdays. Because they arrive once in a while, they feel like emergencies when they land.",
          "A sinking fund is a small amount set aside each month for a cost that is coming on a known date. It turns a large, occasional bill into a small, regular one.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The formula",
        paragraphs: [
          "Take what you still need, subtract what you have already saved, and divide by the whole months left until the date. For example, if you need $600 by the end of the year and have $150 saved with four months left, set aside $112.50 a month.",
          "If the date is less than a month away, or you do not have a date, there is no sensible monthly figure. That is a sign to pick a date.",
        ],
      },
      {
        kind: "table",
        heading: "Costs worth a sinking fund",
        columns: ["Cost", "When it lands", "Why it ambushes a month"],
        rows: [
          ["Car registration", "Once a year", "One large charge"],
          ["Insurance", "Every three or six months", "Easy to forget between payments"],
          ["Holidays and gifts", "The same weeks each year", "Predictable but rarely planned"],
          ["Annual subscriptions", "Once a year", "A charge you were not watching"],
          ["Medical and dental", "A few times a year", "Small amounts that add up"],
        ],
      },
      {
        kind: "list",
        heading: "Setting one up",
        checkable: true,
        items: [
          "List the costs you can name and the month each one lands.",
          "Work out a target and a date for each.",
          "Divide to find the monthly amount, then add them up.",
          "Check the total against what you can set aside without squeezing a bill.",
          "Keep the money somewhere you will not spend it by accident.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the money lives",
        paragraphs: [
          "The best place is somewhere separate from the account you spend from, such as a savings account, so it is out of sight. If you cannot open a separate account, at least keep it out of your spending number. The first step for many people is a small reserve, covered in [how to build your first $1,000 emergency fund](/guides/how-to-build-a-first-1000-emergency-fund).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The annual bill should not be a surprise",
        paragraphs: [
          "An annual bill is a small monthly amount you did not set aside. If a $600 charge arrives in twelve months, that is $50 a month starting today. Divide what remains by the months left, and the number becomes ordinary.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion has savings goals with a type that includes sinking fund. You enter the target, what you have saved so far and a target date, and it shows the monthly amount needed. The progress is what you record: it does not read your bank account and it does not move money. It is $49 once.",
      },
    ],
  },

  {
    slug: "50-30-20-rule-where-it-breaks",
    title: "The 50/30/20 rule: who it fits and where it breaks",
    dek: "Half to needs, thirty percent to wants, twenty to savings and debt. Test it against your own month in five steps, and what to do at 60 percent needs.",
    primaryQuery: "50/30/20 rule",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The 50/30/20 rule splits your after-tax income three ways: fifty for needs, thirty for wants and twenty for savings and debt repayment. It is popular because it is easy to remember. It is a starting point, not a law, and for many budgets it does not fit.",
          "This guide is about testing it against your own numbers rather than accepting it or dismissing it.",
        ],
      },
      {
        kind: "table",
        heading: "The rule",
        columns: ["Share", "Goes to", "Examples"],
        rows: [
          ["50", "Needs", "Rent, utilities, groceries, minimum debt payments, insurance"],
          ["30", "Wants", "Eating out, entertainment, hobbies, subscriptions you could drop"],
          ["20", "Savings and extra debt payments", "Emergency fund, extra toward debt, goals"],
        ],
      },
      {
        kind: "compare",
        heading: "Where it fits, and where it breaks",
        left: {
          label: "It tends to fit when",
          items: [
            "Income is steady and mid-range",
            "Housing costs are moderate",
            "Debt payments are small",
          ],
        },
        right: {
          label: "It tends to break when",
          items: [
            "Rent alone is close to half of income",
            "Pay changes from month to month",
            "Debt minimums are large",
          ],
        },
      },
      {
        kind: "list",
        heading: "Test it on your own month",
        checkable: true,
        items: [
          "Write down your monthly after-tax income, using only what is reliable.",
          "Add up your needs, including the monthly equivalent of quarterly and annual bills.",
          "Add up what you set aside and what you pay toward debt beyond the minimum.",
          "Whatever is left is your wants.",
          "Compare each to the rule and note where you differ, without judging it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Adjust it, do not abandon it",
        paragraphs: [
          "If your needs come to sixty percent, the rule is telling you something true: this is a tight month. You can adjust the split to fit, perhaps sixty, twenty and twenty, and still have a useful picture. The value of the rule is in making the three groups visible, not in the specific numbers.",
          "Watch for the bills that are not monthly. A rule applied to twelve regular bills will be off if a quarterly premium and an annual renewal are missing. [A monthly bills list](/guides/monthly-bills-list) fixes that. If your income varies, start from [how to budget when your income is different every month](/guides/how-to-budget-with-irregular-income).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion does not have a built-in 50/30/20 view, so treat this as a method with a manual check. What it does show is a typical month: what comes in, what goes out (bills, subscriptions and debt minimums, as monthly equivalents), what you are setting aside for goals, and what is left. Irregular income and bills with no amount are named, not counted. You can use those figures to test the rule. It is $49 once.",
      },
    ],
  },

  {
    slug: "budget-for-variable-bills",
    title: "How to budget for bills that change every month",
    dek: "Electric, water and phone bills move. Pull twelve months, find the low and the high, and plan toward the high so the spike month is no surprise.",
    primaryQuery: "budget for variable bills",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A fixed bill is easy to plan for. A bill that changes every month is not, and the usual response is to guess, then be surprised in the months the guess was low.",
          "The fix is to stop treating a moving bill as a single number. It is a range, and it is much easier to plan around a range you have looked at than a figure you have imagined.",
        ],
      },
      {
        kind: "timeline",
        heading: "The method",
        steps: [
          { when: "Pull twelve months", what: "Find the last twelve statements or bills for the one you are planning." },
          { when: "Find the low and the high", what: "Note the smallest and the largest amount in that year." },
          { when: "Plan toward the high", what: "Use the high, or something close to it, in your budget." },
          { when: "Set the gap aside", what: "In the months the bill is low, keep the difference for the spike." },
          { when: "Check again", what: "Once a season, look at whether the range has moved." },
        ],
      },
      {
        kind: "table",
        heading: "An example",
        intro: "An illustration only. Use your own twelve months.",
        columns: ["", "Amount"],
        rows: [
          ["Lowest month", "$60"],
          ["Highest month", "$122"],
          ["Midpoint", "$91"],
          ["Plan toward", "$122"],
          ["Set aside in a low month", "$62"],
        ],
      },
      {
        kind: "list",
        heading: "Bills that usually move",
        checkable: true,
        items: [
          "Electric and gas, which follow the seasons.",
          "Water, which rises with use.",
          "Phone and internet, if you pay for data or usage.",
          "Anything billed by consumption rather than a fixed plan.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The spike month",
        paragraphs: [
          "The month the bill is highest is the month it hurts. Setting the difference aside in the cheaper months is a small sinking fund for exactly that. There is a fuller version of the idea in [sinking funds explained](/guides/sinking-funds-explained). For the wider list of what falls due, see [how to make a monthly bills list](/guides/monthly-bills-list).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Personal Finance Companion, a bill can be marked as varying, with a low and a high estimate, and the monthly total uses the midpoint of the range. It is an estimate you enter, not something it tracks from your actual bills each month. The workbook that comes with it has a variable bills worksheet for your twelve months. It is $49 once.",
      },
    ],
  },

  {
    slug: "credit-card-minimum-payments-how-long",
    title: "How long paying only the minimum takes on credit card debt",
    dek: "Interest at 2 percent a month eats most of a small payment. A $3,000 example at 24 percent, then a three debt comparison of minimums versus extra.",
    primaryQuery: "credit card minimum payment payoff time",
    publishedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Paying the minimum on a credit card keeps the account in good standing. It is also slow, because most of a small payment goes to the interest added that month.",
          "It helps to see what that looks like once, with a real number.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "How the interest works each month",
        paragraphs: [
          "A rate quoted as a yearly percentage is usually applied monthly at one twelfth of that. On a $3,000 balance at 24 percent, the monthly rate is 2 percent, so about $60 of interest is added in the first month. If your minimum payment is $90, only about $30 of it reduces what you owe.",
          "Next month the balance is a little lower, so the interest is a little lower, and slightly more of the payment goes to the balance. The process repeats, slowly, which is why the total time is often longer than people expect.",
        ],
      },
      {
        kind: "table",
        heading: "What an extra amount does",
        intro: "Three debts, from the worked example in the snowball and avalanche guide. Starting September 2026, with a constant rate and constant minimums, and any extra going to the highest rate first. With $50 extra, the same debts clear in August 2030 with $7,491.15 in interest.",
        columns: ["Extra each month", "Debt-free", "Interest along the way"],
        rows: [
          ["$0, minimums only", "March 2031", "$9,232.57"],
          ["$200", "September 2029", "$4,995.84"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Read this as a comparison, not a forecast",
        paragraphs: [
          "Those figures assume a constant rate and a constant minimum. On many cards the minimum shrinks as the balance falls, which stretches the real timeline out. New charges make it longer again. So the interest and dates above are a way to compare two paths on the same numbers, and real life on a card is usually slower.",
          "The useful takeaway is not the exact dates. It is that a modest extra amount, paid consistently, cuts the time and the interest by a lot. If you have more than one debt, the order matters less than the extra, as shown in [debt snowball vs avalanche](/guides/debt-snowball-vs-avalanche).",
        ],
      },
      {
        kind: "list",
        heading: "What to do with this",
        checkable: true,
        items: [
          "Find the balance, the interest rate and the minimum for each card.",
          "Work out roughly what one month of interest is, using the rate divided by twelve.",
          "See how much of your minimum actually reduces the balance.",
          "Pick an extra amount you can keep up, even a small one.",
          "Do not add new charges to the card while you are paying it down.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion's payoff plan has an Extra each month input where leaving it at zero shows the minimums only. It shows the month each debt clears and the interest along the way. It assumes a constant rate and constant minimums, and a debt with no rate is left out and named. It is a model from your own numbers, not advice, and it does not change what you pay. It is $49 once.",
      },
    ],
  },

  // ------------------------------------------------ ADHD Life Companion set
  // Nine guides written for the ADHD Life Companion Pinterest pins. They are
  // practical admin guidance, not treatment: none says the product treats,
  // manages or improves ADHD, and each says plainly that it is not medical
  // advice. Each stays inside what the product does: one thing on Now, Life in
  // four shapes, eight authored playbooks, six outcomes (where "Did not get to
  // it" changes nothing on the item), opt-in web push reminders for dates you
  // chose, and no bill amounts, documents, streaks or scores.

  {
    slug: "how-to-start-when-everything-is-overdue",
    title: "Everything is overdue: how to pick the first thing",
    dek: "When the calls, forms and bills are all past their date, do not rank them. Sort by who is waiting, pick one first step, and stop for tonight.",
    primaryQuery: "everything is overdue where to start",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "There is a particular kind of week when the calls, the forms, the replies and the bills have all gone past the day you meant to deal with them. Looking at the whole pile is what makes it unbearable, because everything looks equally urgent and equally guilty.",
          "This guide is practical admin help, not medical advice. It is about making the first choice smaller than the pile.",
        ],
      },
      {
        kind: "list",
        heading: "Sort by who is waiting",
        intro: "Do not rank everything. Put each thing in one of three piles.",
        checkable: true,
        items: [
          "A person is waiting on you: someone has asked, or will notice.",
          "A date is attached: there is a real day it has to happen by.",
          "Nobody is waiting: it matters, but nothing changes this week.",
        ],
      },
      {
        kind: "timeline",
        heading: "The two minute triage",
        steps: [
          { when: "Write it down", what: "List only the things where a person or a date is involved. Leave the rest for later." },
          { when: "Pick one", what: "Choose the one that is smallest or most likely to change something for somebody." },
          { when: "Name the first step", what: "Write the first physical thing you would do: a call, a message, opening a form." },
          { when: "Put the rest away", what: "Out of sight is not lost. Write them down somewhere and stop looking at them tonight." },
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to do with everything else",
        paragraphs: [
          "The things you are not doing today are not gone. They are somewhere safe, and you know where. The relief comes from not carrying them in your head, not from finishing them.",
          "If you need to contact people about the delay, you do not have to explain at length. A short, plain message is enough, and there are lines for it in [how to deal with something you have put off](/guides/how-to-deal-with-something-you-have-put-off).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Leave the pile alone tonight",
        paragraphs: [
          "Once you have picked one thing and named its first step, you are allowed to stop. Sorting is not a reason to keep going until midnight. If the first step is smaller than you can face, [task paralysis: what to do in the next ten minutes](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes) is the next place to look.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion shows one thing on its Now screen, and when nothing needs you, it says so and stops. Everything else you put down lives in Life, in four shapes: something to do, waiting on someone, something ongoing, and worth having to hand. Nothing in Life is marked late and nothing is counted. When something feels too big, the Break something down walkthrough asks for the first physical step and which one could happen today. It is a web app, not a treatment or medical advice. It is $49 once.",
      },
    ],
  },

  {
    slug: "paperwork-pile-where-to-start",
    title: "Paperwork pile you are avoiding: where to start",
    dek: "Unopened mail gets scarier every week. A ten minute way to make the pile smaller by opening and sorting, without deciding anything in a hurry.",
    primaryQuery: "paperwork pile where to start",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The longer an envelope sits, the more it seems to contain. Most of the fear is about not knowing. The first job is not to deal with the pile. It is to find out what is in it.",
          "This is practical guidance, not medical advice, and it works for anyone with a stack of mail they have been putting off.",
        ],
      },
      {
        kind: "timeline",
        heading: "A ten minute version",
        steps: [
          { when: "Set a limit", what: "Ten minutes, one box or one shelf. Stop when the time is up, even if the pile is not finished." },
          { when: "Open, do not decide", what: "Open each item and put it in a pile. Do not act on anything yet." },
          { when: "Sort by who is waiting", what: "A person is waiting, a date is attached, or nobody is waiting." },
          { when: "Write down the reference numbers", what: "Any claim, case or account number goes in one place, not left on the letter." },
          { when: "Choose the smallest piece", what: "Pick one thing from the first pile and write the first physical step." },
        ],
      },
      {
        kind: "compare",
        heading: "Two ways to face a pile",
        left: {
          label: "Trying to finish it",
          items: [
            "Starts with the hardest letter",
            "Needs a whole free day",
            "Ends when you run out of energy",
            "Feels like failure if it is not done",
          ],
        },
        right: {
          label: "Making it smaller",
          items: [
            "Starts with opening, not deciding",
            "Fits into ten minutes",
            "Ends when the time is up",
            "Counts as done if the pile is smaller",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "The is-this-still-needed check",
        paragraphs: [
          "Some of what is in an old pile has already been dealt with, has expired, or was never urgent. Before you act on something old, ask whether it still needs doing at all. That question alone often shrinks the pile.",
          "What to keep on paper, and where to put it, is a separate question with its own guide: [which documents to keep and where to put them](/guides/which-documents-to-keep-and-where-to-put-them).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Start with one envelope",
        paragraphs: [
          "You do not have to do the whole pile. You have to start it. If ten minutes is too much, open one envelope. That is a real start, and it is more than the pile has had for weeks.",
          "If the thing you are avoiding is a phone call that the paperwork points to, [how to make a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding) picks up from here.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion has a Pick something back up walkthrough that asks where you got to, whether anything was missing last time, and what the smallest piece is, and it keeps your answers so next time you see them instead of working it out again. A reference number you will need for one specific thing can go under Worth having to hand. It stores what you type, not documents, photos or scans. It is a web app, not a treatment or medical advice. It is $49 once.",
      },
    ],
  },

  {
    slug: "how-to-say-no-or-give-bad-news-on-the-phone",
    title: "How to say no, or give bad news, on the phone",
    dek: "Some calls are hard because of what you have to say. Decide what you will not agree to before dialing, have an opening ready, and ask for a minute.",
    primaryQuery: "give bad news on the phone",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A call where you have to say no, or tell someone something they will not want to hear, is harder than a call where you have to ask for something. The difficulty is not the phone. It is that you are about to disappoint someone and you have not decided how.",
          "This guide is about the practical parts: what to decide, what to have ready, and what to say first. It is not therapy, negotiation coaching or advice about what you should agree to.",
        ],
      },
      {
        kind: "list",
        heading: "What makes this one hard?",
        intro: "Naming it tells you what is worth having ready.",
        checkable: true,
        items: [
          "You are telling them something they will not want to hear.",
          "You are saying no to something.",
          "Money is involved.",
          "It is personal.",
          "They have been difficult about this before.",
        ],
      },
      {
        kind: "timeline",
        heading: "Before you dial",
        steps: [
          { when: "Say what you want", what: "One line: what you want to be true when you put the phone down." },
          { when: "Decide what you will not agree to", what: "Deciding now means you are not deciding it while somebody waits on the line." },
          { when: "Set the room", what: "A glass of water within reach, and somewhere you will not be overheard." },
          { when: "Name two call-back times", what: "In case now turns out to be the wrong moment." },
          { when: "Get the first sentence ready", what: "Getting the first sentence out is most of it." },
        ],
      },
      {
        kind: "scripts",
        heading: "An opening to start from",
        intro: "Pick the situation. Use it, or change it to sound like you.",
        items: [
          { situation: "Bad news", line: "Hi, it is me. There is something I need to tell you and it is not good news. Is now an all right time?" },
          { situation: "Saying no", line: "Hi, I have thought about it and I am not going to be able to do it. I wanted to tell you rather than leave you waiting." },
          { situation: "Money", line: "Hi, I need to talk to you about money, which I would rather do directly than by email. Do you have a few minutes?" },
          { situation: "Difficult before", line: "Hi, I am calling about this again. I would like to get it sorted today if we can. Can you look at what has happened so far?" },
        ],
      },
      {
        kind: "paragraphs",
        heading: "You are allowed to ask for a minute",
        paragraphs: [
          "During the call, you are allowed to ask for a minute to think, and you are allowed to say you will call back. Neither is a failure. Write down anything that was agreed, and, if it matters, the name of who you spoke to.",
          "For everyday admin calls, there are scripts in [scripts for the admin calls everyone dreads](/guides/scripts-for-the-admin-calls-everyone-dreads).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion has a Make a difficult phone call walkthrough. It asks what makes this one hard, who you are calling, what you want to be true, and whether there is anything you are not willing to agree to. It shows what is worth having ready, suggests an opening you can use or replace with your own, and keeps your own words on screen during the call. It never tells you what to accept or refuse. What you type in your own opening is saved. It is a web app, not therapy or medical advice. It is $49 once.",
      },
    ],
  },

  {
    slug: "the-email-you-keep-not-sending-and-how-to-chase-a-reply",
    title: "The email you keep not sending: first lines and follow-ups",
    dek: "An email that does not say what it wants gets answered slowly. Decide three things, write the first line, and know what to do when no one replies.",
    primaryQuery: "email you keep not sending",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The email you keep not sending is rarely hard to write. It is hard to start. Most of the time it is waiting for a first line, and everything after that comes more easily.",
          "This guide is practical help with the parts that stall: what the email is for, the first line, and what to do afterward if nobody replies. It is not medical advice.",
        ],
      },
      {
        kind: "list",
        heading: "Decide these three things first",
        checkable: true,
        items: [
          "What the email is for: asking, replying, saying no, chasing, or explaining a problem.",
          "Who it is to.",
          "What needs to happen because of it, in one line.",
        ],
      },
      {
        kind: "scripts",
        heading: "A first line to start from",
        intro: "The rest is usually easier once this exists. Use one, or write your own.",
        items: [
          { situation: "Asking", line: "Hello, I am hoping you can help me with something." },
          { situation: "Replying", line: "Hello, thank you for getting back to me. To answer your question:" },
          { situation: "Saying no", line: "Hello, thank you for asking me. I am not going to be able to do it this time." },
          { situation: "Chasing", line: "Hello, I got in touch about this a little while ago and I have not heard back yet. Could you let me know where it stands?" },
        ],
      },
      {
        kind: "list",
        heading: "Before you send it",
        intro: "Read it once against these, then send it. Reading it a fourth time does not make it better.",
        checkable: true,
        items: [
          "What you want is in the first three lines.",
          "The date, if there is one, is in there.",
          "Anything you meant to attach is attached.",
          "It is short enough to read on a phone.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When nobody replies",
        paragraphs: [
          "Chasing by the same route that already went unanswered is usually the slower option. If you emailed, try a call, or the other way around. And ask for a date rather than an update. An update can be nothing. A date is something you can hold them to.",
          "Then note when you will check back, so the waiting has an end. If the follow-up is by phone, [scripts for the admin calls everyone dreads](/guides/scripts-for-the-admin-calls-everyone-dreads) has an opening for chasing.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion has a Send the email walkthrough that asks what the email is for, who it is to and what needs to happen, suggests a first line you can use or replace with your own, and lists the checks before you send. A Follow something up walkthrough asks how you last got in touch and what you need from them now. Something you are waiting on can be kept as a Waiting item with a check-back date. It does not send email or read your inbox. It is a web app, not a treatment or medical advice. It is $49 once.",
      },
    ],
  },

  {
    slug: "first-physical-step-20-examples",
    title: "First physical step: 20 examples for stuck admin tasks",
    dek: "A first step is something you could see happen. Twenty examples, from a call to a form to a document, and how to check your own.",
    primaryQuery: "first physical step examples",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a task feels too big to start, planning it usually makes it bigger. What helps is a first step that is physical: something somebody watching you could see happen. Not deciding, not planning, not thinking about it.",
          "This is a reference list. It is practical admin help, not medical advice. Read down it, find something like yours, and copy the shape of the step.",
        ],
      },
      {
        kind: "table",
        heading: "Twenty first steps",
        columns: ["The task", "The first physical step"],
        rows: [
          ["Book the dentist", "Look up the phone number and write it down"],
          ["Make an insurance claim", "Find the claim number or the policy letter"],
          ["Reply to the tax letter", "Put the letter on the desk and read the first paragraph"],
          ["Return a package", "Find the packing slip"],
          ["Cancel a subscription", "Open the account page and find the cancel or manage option"],
          ["Renew an ID", "Find the current one and check the expiry date"],
          ["Sort out the spare room", "Call the charity shop about collection"],
          ["Answer a difficult email", "Write only the first line"],
          ["Chase a refund", "Find the reference number from the last contact"],
          ["Fill in a form", "Open it and fill in your name and the date"],
          ["Change your address", "List the first three places that need it"],
          ["Book a repair", "Take a photo of the problem"],
          ["Sort the mail pile", "Open the top five items and do nothing else"],
          ["Ask for help", "Send one message that says what you need"],
          ["Deal with a bill dispute", "Find the statement showing the charge"],
          ["Prepare for an appointment", "Write down what you want to come away with"],
          ["Call the landlord", "Write what you will say in one line"],
          ["Apply for something", "Find out the deadline and write it on a piece of paper"],
          ["Return to an old project", "Find where you left it and put it on the desk"],
          ["Make a doctor's appointment", "Find the phone number and the times you could go"],
        ],
      },
      {
        kind: "list",
        heading: "Check your own first step",
        checkable: true,
        items: [
          "Could someone watching see it happen?",
          "Can it be done in a few minutes?",
          "Is it a real action, not deciding or planning?",
          "Is it small enough that starting is not a decision?",
        ],
      },
      {
        kind: "paragraphs",
        heading: "One, not the list",
        paragraphs: [
          "If you write two or three steps, pick one to happen today. Not the list, one. The rest are not lost. Writing the next one down is what stops the whole thing from having to be worked out again.",
          "If even the first step is too much, [task paralysis: what to do in the next ten minutes](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes) goes smaller still.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion has a Break something down walkthrough. It asks what the thing is, what would be true when it is finished, and what the first physical step is, then optionally the next two, and which of them could happen today: one of them, not the list. The steps you are not doing today go into Life so you do not carry them. It is a web app, not a treatment or medical advice. It is $49 once.",
      },
    ],
  },

  {
    slug: "a-weekly-reset-that-survives-a-bad-week",
    title: "A weekly reset that survives a bad week",
    dek: "Most resets assume a normal week. A ten minute version for the weeks that fall apart, and why a skipped week needs no catching up.",
    primaryQuery: "weekly reset for a bad week",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A weekly reset is a good idea that usually fails in the same way: it is designed for a week that went fine. The first bad week breaks it, and then there is a reset to catch up on as well.",
          "This guide is about a reset that is small enough to survive a bad week. It is practical, not medical advice.",
        ],
      },
      {
        kind: "timeline",
        heading: "The ten minute reset",
        steps: [
          { when: "Open the pile", what: "Look at what is there. Do not decide anything yet." },
          { when: "Pick one thing", what: "One, not the list. The one that matters most this week." },
          { when: "Put one date on it", what: "A day you chose. If you do not want a date, leave it empty." },
        ],
      },
      {
        kind: "compare",
        heading: "Two kinds of reset",
        left: {
          label: "A reset that needs a good week",
          items: [
            "Reviews everything that happened",
            "Builds a plan for the whole week",
            "Falls apart after a missed day",
            "Adds a catch-up task",
          ],
        },
        right: {
          label: "A reset that survives a bad one",
          items: [
            "Looks at what is in front of you",
            "Picks one thing",
            "Works the same after a missed week",
            "Adds nothing to catch up on",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "What to do with the week you skipped",
        paragraphs: [
          "Nothing. A skipped week does not need to be caught up. It does not create a debt. You do the ten minutes this week, as if the last one had not been missed, because for the purpose of the reset it has not.",
          "Some weeks the honest answer to what you got done is that you did not get to it. That is a real answer, not a failure. It changes nothing about what is in front of you now.",
        ],
      },
      {
        kind: "list",
        heading: "A floor and a ceiling",
        intro: "On a bad week, do the floor. On a good week, the ceiling is allowed.",
        checkable: true,
        items: [
          "The floor: open the pile and pick one thing.",
          "The ceiling: also put a date on it and write the first physical step.",
          "Either counts as a reset.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If the whole system has stopped working",
        paragraphs: [
          "If you stopped using a system entirely, the fix is not a better system. It is a way back that does not start with a catch-up. That is covered in [why you stop using planners, and how to come back](/guides/why-you-abandon-planners-and-how-to-come-back).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion shows one thing on Now, lets you say Not now without changing anything, and has an outcome called Did not get to it that changes nothing on the item, adds nothing to its history, and counts nothing. Nothing in it is marked late, and it has no streaks, no scores and no percentages. It does not have a weekly review or plan. It is a web app, not a treatment or medical advice. It is $49 once.",
      },
    ],
  },

  {
    slug: "why-you-abandon-planners-and-how-to-come-back",
    title: "Why you stop using planners, and how to come back",
    dek: "You did not fail the planner. Most systems assume a normal week. What breaks, how to salvage one page, and what to look for in the next one.",
    primaryQuery: "why you stop using planners",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many people have a planner they stopped using. A common story is that the person lost motivation. A more useful reading is that the system had a requirement built in that a real week could not always meet.",
          "This is practical guidance, not medical advice. For the wider pattern across tools, see [why productivity tools fail at life admin](/guides/why-productivity-tools-fail-at-life-admin).",
        ],
      },
      {
        kind: "table",
        heading: "What usually breaks",
        columns: ["What the system needs", "What happens in a hard week"],
        rows: [
          ["Daily upkeep", "One missed day leaves a gap that is hard to face"],
          ["Catching up on what you skipped", "The backlog grows and feels worse than before"],
          ["A perfect record", "A gap in the record looks like failure"],
          ["Lots of setup", "There is no energy left to maintain it"],
        ],
      },
      {
        kind: "timeline",
        heading: "How to come back without starting over",
        steps: [
          { when: "Do not reset it", what: "Do not clear the whole thing and begin again. That is the same starting cost as before." },
          { when: "Find one page", what: "Look for the single page or list that still matters and keep only that." },
          { when: "Write where you got to", what: "One sentence, so next time starts from here." },
          { when: "Pick one thing", what: "Choose a single item and note its first physical step." },
          { when: "Stop there", what: "Coming back counts on its own. You do not have to make up for the gap." },
        ],
      },
      {
        kind: "list",
        heading: "What to look for in the next one",
        checkable: true,
        items: [
          "It survives a missed week without extra work.",
          "It does not count or display what you did not do.",
          "It asks for very little to start.",
          "It can be put down halfway and picked up again.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A restart without a reset",
        paragraphs: [
          "If you are returning to something you gave up on, [how to restart a project you gave up on](/guides/how-to-restart-a-project-you-gave-up-on) covers the specific cost of coming back. And [why to-do lists make things worse](/guides/why-to-do-lists-make-it-worse) explains why the list itself is often part of the problem.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "ADHD Life Companion is built so that a missed week changes nothing. Nothing is marked late, there are no streaks or scores, and a walkthrough you close partway reopens at the exact question with your earlier answers still there. Things you have dealt with are kept under Sorted, and nothing is deleted. It is a web app, not a treatment or medical advice. It is $49 once.",
      },
    ],
  },

  {
    slug: "why-you-keep-missing-bill-due-dates",
    title: "Why you keep missing bill due dates (and a better system)",
    dek: "Missing a due date is often never reaching the moment, not forgetting. Put the date on the item, choose your reminder, and know what to do when you notice.",
    primaryQuery: "why you keep missing bill due dates",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Missing a due date is usually described as forgetting. Often it is closer to never reaching the moment: the bill was in your head, then the week happened, and the date passed without ever being in front of you.",
          "This guide is about a memory-light way to handle it. It is practical help, not medical advice, and it covers the dates, not the amounts. For what to do once one has been missed, see [you missed a payment: what to do next](/guides/you-missed-a-payment-what-to-do-next).",
        ],
      },
      {
        kind: "timeline",
        heading: "A system that does not rely on remembering",
        steps: [
          { when: "Put the date on the item", what: "Write the bill as an item with the date attached, not only in a calendar you do not open." },
          { when: "Choose the reminder yourself", what: "Pick whether you want one, and for which dates." },
          { when: "Choose quiet hours", what: "So a reminder does not arrive when you cannot act on it." },
          { when: "Keep the lock screen private", what: "A reminder that says what it is about can be read by anyone nearby." },
          { when: "Check it once a week", what: "A short look at what has a date in the next few days." },
        ],
      },
      {
        kind: "compare",
        heading: "Two ways to handle a due date",
        left: {
          label: "Relying on memory",
          items: [
            "The date lives in your head",
            "A reminder you set once and never see",
            "A calendar you rarely open",
          ],
        },
        right: {
          label: "Putting it on the item",
          items: [
            "The date lives with the thing",
            "A reminder you chose and can switch off",
            "One place to look",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "A note on automatic payment",
        paragraphs: [
          "Automatic payment can take a due date out of your head, which is a real help. It also hides the amount, and it fails quietly if a card expires or a balance is low. Whether it suits you depends on your accounts. It is worth knowing both sides before you decide.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The day you notice it is late",
        paragraphs: [
          "If you notice a payment is late, the first step is small: find the reference and contact them, without an essay of explanation. That is covered in the guide linked above. Then put the next date on the item so it does not happen again.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In ADHD Life Companion, you can keep something like Pay the water bill as an item with a day you choose. Reminders are off until you switch them on. When on, they only cover dates you chose yourself, they respect quiet hours, and the lock screen stays generic unless you turn on Say what it is about. They are web push notifications, so an iPhone needs the app on the Home Screen, and they are not guaranteed to reach every device. It holds no bill amounts, providers or account numbers. For the money side, Monthly Money Reset is free and Personal Finance Companion is $49 once. It is not a treatment or medical advice.",
      },
    ],
  },

  {
    slug: "time-blindness-planning",
    title: "ADHD time blindness: how to plan when later never comes",
    dek: "Later today is not a time. Plan with one exact time, made visible, and a buffer before a call, without needing to feel time pass.",
    primaryQuery: "adhd time blindness planning",
    publishedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many people who find it hard to feel time passing describe it as time blindness. It is a description of an experience, not a diagnosis, and this guide is practical help, not medical advice.",
          "The pattern is familiar. You mean to do something later, and later never arrives as a moment. It quietly stops being an option. The fix is to replace a vague later with a single exact time.",
        ],
      },
      {
        kind: "table",
        heading: "Vague versus exact",
        columns: ["Vague", "Exact"],
        rows: [
          ["I will call later", "I will call at 3:30"],
          ["This afternoon", "After lunch, at 2:00"],
          ["Sometime this week", "Thursday at 10:00"],
          ["When I have a minute", "Right after this meeting ends"],
        ],
      },
      {
        kind: "list",
        heading: "Three small habits",
        checkable: true,
        items: [
          "Name one exact time, not a window.",
          "Make it visible somewhere you will see it, without needing a timer.",
          "Leave a buffer before a call, so getting ready is not part of the call.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "One time, not a schedule",
        paragraphs: [
          "You do not need a full schedule. You need one exact time for the one thing that matters today. A schedule adds a lot of times to miss. A single time is easier to keep and easier to forgive when it slips.",
          "If the time passes anyway, choose a new exact time. Do not treat the missed one as a failure. It is information about how much space the task needed.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Calling now, or naming a time",
        paragraphs: [
          "For a call, there are only two honest options: call now while you are prepared, or name one exact time today. Either is a real answer. What does not work is leaving it open. For more on making a call you have been avoiding, see [how to make a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In ADHD Life Companion, the Ready to call step asks you to call now or name one exact time today. Call now runs a short countdown, and choosing a time asks What time today and holds it. If you switch reminders on, a time you chose can send one notification on the day, with quiet hours respected. It is not a timer or a scheduler and does not build a plan for your day. It is a web app, not a treatment or medical advice. It is $49 once.",
      },
    ],
  },

  {
    slug: "homeschool-weekly-plan-with-a-spare-day",
    title: "Homeschool weekly schedule with a spare day built in",
    dek: "Plan four days and leave one empty on purpose, write your short-day list ahead, and put the hard subject first. Includes fill-in lines.",
    primaryQuery: "homeschool weekly schedule",
    publishedAt: "2026-09-26",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most weekly homeschool schedules are written for a week in which nothing goes wrong. Nobody is ill, nobody has an appointment, and everybody is in a good mood at nine o'clock. Those weeks are rare, and a plan that only works in them fails by Wednesday.",
          "A plan that survives a bad day has three parts: a day left empty on purpose, a short day decided in advance, and the hardest subject placed early. None of them needs a special tool. A sheet of paper is enough.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Leave one day empty on purpose",
        paragraphs: [
          "Write Monday to Friday, then mark one day as spare and leave it blank when you plan. It is not a day off. It is the day that absorbs whatever the week throws at you: the appointment, the sick morning, the lesson that took twice as long as it should have.",
          "In a week where nothing goes wrong, the spare day becomes a lighter day, a catch-up, or a day out. In a week where something does, it is the reason one lost morning does not spill into the rest of the week.",
        ],
      },
      {
        kind: "table",
        heading: "What the week looks like",
        columns: ["Day", "Plan"],
        rows: [
          ["Monday", "The full plan"],
          ["Tuesday", "The full plan"],
          ["Wednesday", "Spare. Leave it empty when you plan."],
          ["Thursday", "The full plan"],
          ["Friday", "The full plan, or a lighter one"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Put the hard thing first",
        paragraphs: [
          "Whatever is hardest for your child, or for you, goes early in the day, while there is still something left in everyone. The rest of the day can then be shorter without being a failure, because the part that mattered most has already happened.",
          "This is also the easiest rule to keep. You do not have to rewrite anything. You only change the order.",
        ],
      },
      {
        kind: "list",
        heading: "Decide in advance what a short day looks like",
        intro: "Fill these in once, on a normal day, and keep them where you will see them. Deciding on a bad morning is much harder than following a decision you already made.",
        checkable: true,
        items: [
          "On a short day we always do: (two or three things, no more).",
          "On a very short day we always do: (one thing).",
          "The thing we drop first is: (name it now).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to record on a short day",
        paragraphs: [
          "A short day still counts, and it is still worth one line: the date, what you did, and one word about how it went. A record made up of only full days quietly tells a story that is not true, and a short day written down is more honest than a blank one.",
          "For a simple way to keep the record light enough to survive a bad week, see [the simplest homeschool record keeping system that actually lasts](/guides/simple-homeschool-record-keeping-system).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Homeschooling Companion, you choose how many days a week each subject happens, from 0 to 7, and Today shows what is planned for that day. Recording a subject is one tap, and marking Did not get to it is recorded as not finished, so it comes back next time as Last time this was not finished. It does not build a plan for you and it does not judge a short day. It has no spare-day setting: a day with nothing planned shows Nothing scheduled today. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "four-day-homeschool-week",
    title: "Four-day homeschool week: how many days each subject gets",
    dek: "Which subjects get four days and which fewer, why a spare day helps a plan hold, and what to record when the fifth day stays empty.",
    primaryQuery: "four day homeschool week",
    publishedAt: "2026-09-26",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A family that plans five days and manages four has failed at something every single week. A family that plans four and manages four has not. The work done is identical. One of them has a plan that fits the week.",
          "A four-day week is not a lesser week. It is a plan you can keep, which matters more than a plan that looks better on paper.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why four is easier to keep than five",
        paragraphs: [
          "Every homeschooling week contains interruptions: appointments, a sibling's illness, a day out that ran late, a morning that simply did not happen. A five-day plan has no room for any of them, so each one becomes a small failure.",
          "A four-day plan has a spare day. When something goes wrong, the work moves to it. When nothing does, the day is free, and a free day can make a plan easier to keep.",
        ],
      },
      {
        kind: "compare",
        heading: "Two families, the same amount of work",
        left: {
          label: "Plans five, manages four",
          items: [
            "Feels short every week",
            "The plan is never met, so it stops being looked at",
            "Records show gaps that were never really gaps",
          ],
        },
        right: {
          label: "Plans four, manages four",
          items: [
            "Meets the plan every week",
            "The plan is kept, so it keeps being used",
            "Records match what happened",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "How to spread subjects across four days",
        paragraphs: [
          "Not every subject needs to happen every day. Start by deciding how many days each one gets, then place them so no single day is overloaded.",
        ],
      },
      {
        kind: "table",
        heading: "One example, as a suggestion",
        columns: ["Subject", "Days a week"],
        rows: [
          ["Math", "4"],
          ["Reading", "4"],
          ["Writing", "3"],
          ["Science", "2"],
          ["History", "2"],
          ["Geography", "1"],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "That is only one shape. Change it to fit your child. The point is that the numbers are decided once, not renegotiated every morning.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to record",
        paragraphs: [
          "Record what actually happened: the date, the subject, and one word about how it went. A four-day week produces four days of entries and a spare day with nothing on it. That is a complete record, not an incomplete one.",
          "If your state asks for a number of days, find out what it counts, and find out early. Our guide on [homeschool attendance and what to track](/guides/homeschool-attendance-what-to-track) covers it, and the official source for your state is the one that decides.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Homeschooling Companion, each subject has its own number of days a week, from 0 to 7, and Today shows what is planned for the day. You decide the numbers. A subject set to 4 days runs Monday, Tuesday, Thursday and Friday, which leaves Wednesday free. It does not choose the numbers for you and it does not count a day with nothing planned as missed. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "homeschool-notice-of-intent-explained",
    title: "Homeschool notice of intent: what it is, how to find yours",
    dek: "Sometimes a declaration or affidavit. What a notice usually covers, whether it goes to the state or your district, and five steps to find yours.",
    primaryQuery: "homeschool notice of intent",
    publishedAt: "2026-09-26",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A notice of intent is, in plain terms, a filing that tells your state or your local school district that you are homeschooling. In some places it is called a declaration, an affidavit, or a letter of intent. The name varies, and so does what it has to contain.",
          "This guide explains what the phrase usually means and how to find out what applies to you. It is not legal advice, and it cannot tell you what your state requires. Laws change, and the official source is the one that counts.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What it usually covers",
        paragraphs: [
          "Where a notice is required, it is typically a short document. It usually names the child, gives their age or grade, and states that they will be educated at home. Some places ask for more, and some ask for less.",
          "Whether you file it once, once a year, or not at all depends on where you live. Some places require nothing to be filed. That is why the first job is finding out which kind of place yours is.",
        ],
      },
      {
        kind: "list",
        heading: "How to find yours",
        checkable: true,
        items: [
          "Go to your state department of education website and look for homeschool or home instruction.",
          "Check whether the notice goes to the state or to your local district. It varies.",
          "Note when it is due. Some places want it before you begin, and some after a set period.",
          "Note whether it has to be filed again each year.",
          "Keep a copy of what you filed, and the date you filed it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "State organizations can help you find it",
        paragraphs: [
          "Most states have a homeschool organization run by families who have already done this. They often explain the official process in plain language. Use them to orient yourself, then confirm against the official source, because organizations can be out of date too.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you are also starting out",
        paragraphs: [
          "A notice is one step in getting started, not the whole of it. For the order of everything else, see [how to start homeschooling: the first-month paperwork order](/guides/how-to-start-homeschooling-first-month-paperwork). For what states ask you to keep once you are under way, see [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion includes a summary of what each state typically asks, listed as None, Low, Moderate or High regulation. It is a summary, not the law, and every state page says Laws change. Confirm with your state before relying on this. It does not file anything for you and does not tell you whether you meet a requirement. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "do-you-have-to-count-homeschool-days-or-hours",
    title: "Do you have to count homeschool days or hours?",
    dek: "Some states count days or hours and many do not. How to find out which yours does, what to look for, and the lightest way to keep the count.",
    primaryQuery: "homeschool days or hours required",
    publishedAt: "2026-09-26",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The honest answer is that it depends on your state, and it can change. Some places ask for a number of days or hours, and some ask for nothing to be counted at all. This guide cannot tell you which applies to you. It can help you find out, and help you keep the number lightly if you need one.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Find out once, properly",
        paragraphs: [
          "Look at your state department of education website, and then at a state homeschool organization. Write down what you find in one place: whether a number of days or hours is required, what counts toward it, and whether you have to show the number to anyone.",
          "Do this once, at the start of the year. Then you are not wondering about it every few weeks.",
        ],
      },
      {
        kind: "table",
        heading: "What you are trying to find out",
        columns: ["Question", "Why it matters"],
        rows: [
          ["Does my state ask for days, hours, both or neither?", "It decides whether you need to count at all"],
          ["What counts as a day?", "Some places count a day of any instruction"],
          ["Do I have to hand the number over?", "Some places ask, some do not"],
          ["Is it checked, and by whom?", "It decides how careful the record needs to be"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you have to count",
        paragraphs: [
          "Mark a day as you go. Do not try to rebuild it later. A simple box per day schooled, ticked on the day, is more accurate than any reconstruction made in June, and it takes seconds.",
          "If you have fallen behind on the record, start from today and be honest about the earlier part. Our guide on [how to catch up on homeschool records](/guides/how-to-catch-up-on-homeschool-records) covers doing that without inventing anything.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you do not have to count",
        paragraphs: [
          "Then the number is for you, if you want it at all. A record of what was done is usually more useful than a count of days, and it is easier to keep. Our guide on [homeschool attendance: what to track](/guides/homeschool-attendance-what-to-track) explains the lighter options.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion does not track hours. Where your state page lists a log or record of instruction, it shows how many days you have logged, counted as days with any entry. It says what is recorded, not whether it is enough, and every state page says Laws change. Confirm with your state before relying on this. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "how-to-start-homeschooling-first-month-paperwork",
    title: "How to start homeschooling: what to do in the first month",
    dek: "The order to follow: find your state's rules, file what is due, start a record on day one, and what can wait. Ends with a plain first week.",
    primaryQuery: "how to start homeschooling",
    publishedAt: "2026-09-26",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The first month of homeschooling can feel like a wall of things to do at once. It is not. There is an order to it, and most of the work is smaller than it looks.",
          "You can begin before you have everything figured out. A record can start with a child's name and one subject, and the rest can be added as you go.",
        ],
      },
      {
        kind: "timeline",
        heading: "The order",
        steps: [
          {
            when: "Find your state's rules",
            what: "Once, from the official source. Your state department of education is the place to start.",
          },
          {
            when: "Note what it asks",
            what: "A notice, some records, a yearly review, or nothing at all. Write it down in one place.",
          },
          {
            when: "File anything that has to be filed",
            what: "Where a notice is required, do it early and keep a copy. See [what a notice of intent is](/guides/homeschool-notice-of-intent-explained).",
          },
          {
            when: "Start a simple record on day one",
            what: "The date, the subject and roughly what part, and one word about how it went. That is enough.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "What can wait",
        paragraphs: [
          "The curriculum does not have to be settled in the first week. The perfect schedule does not exist yet. A portfolio is built through the year, not on day one. Most of what feels urgent in the first month is not.",
          "If you are not sure what you are doing yet, that is normal. Begin with what you have and change it as you learn what works.",
        ],
      },
      {
        kind: "list",
        heading: "A first week that does not need a plan",
        checkable: true,
        items: [
          "Write your child's name and one subject on a page.",
          "Each day, note the date and what you did, in a line.",
          "At the end of the week, look at what happened and note one thing to change.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to go next",
        paragraphs: [
          "For a record that lasts past October, see [the simplest homeschool record keeping system that actually lasts](/guides/simple-homeschool-record-keeping-system). For what states usually ask you to keep, see [record keeping requirements by state](/guides/homeschool-record-keeping-requirements-by-state).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Adding a child in Homeschooling Companion asks one question: are you already following a curriculum? You can answer Yes, we have one, No, we are doing our own, or Not sure yet, and a suggested starting outline is offered by age, clearly labeled a suggestion you can change or ignore. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "homeschool-record-keeping-for-multiple-children",
    title: "Homeschool record keeping for multiple children",
    dek: "Two children, three subjects each, one shared afternoon. File everything by child, log shared lessons once per child, and keep each record apart.",
    primaryQuery: "homeschool record keeping multiple children",
    publishedAt: "2026-09-26",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Record keeping that works for one child often stops working at two. The same lesson gets logged once, or twice, or on the wrong child, and by spring nobody is sure which page belongs to whom.",
          "The fix is a simple rule: everything is filed by child. The rest follows from it.",
        ],
      },
      {
        kind: "list",
        heading: "Rules that keep it straight",
        checkable: true,
        items: [
          "One record per child. Never two children in one document.",
          "Log the shared morning once for each child, with that child's own note.",
          "Different curricula per child are fine. Each child keeps their own.",
          "A private note stays with the child it is about.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The lesson you did together",
        paragraphs: [
          "A read-aloud, a science experiment, a trip. Both children were there, and it counts for both. Write it once for each child, in a line each. It feels like doubling the work, but it takes seconds, and it means each record stands on its own if anyone ever asks to see one.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why separate records matter",
        paragraphs: [
          "Where an evaluator, a reviewer or an authority asks to see a record, it is asked for by child. A record that mixes two children has to be pulled apart at the worst possible moment. Keeping them separate from the start costs almost nothing.",
          "It also lets each child's record say what is true for them. One may find reading easier and math harder, and the other the reverse. Two records tell that story. One combined record does not.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to go next",
        paragraphs: [
          "For what belongs in each record, see [the simplest homeschool record keeping system that actually lasts](/guides/simple-homeschool-record-keeping-system) and [what goes in a homeschool portfolio](/guides/what-goes-in-a-homeschool-portfolio).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion keeps a separate page for each child, and Today groups what is planned by child, so a shared morning is two taps, one for each. The printed record is one child at a time and never combines two in a document. A private note stays private unless you choose to print it. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "homeschool-reading-log",
    title: "Homeschool reading log: three columns, quit books included",
    dek: "What goes in each column, why a book your child stopped still belongs on the list, and how the log fits into a portfolio or review.",
    primaryQuery: "homeschool reading log",
    publishedAt: "2026-09-26",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A reading log is a useful, low-effort record for a homeschooling family. It is evidence that reading happened and a memory aid when you look back over the year.",
          "It does not need to be elaborate. Three columns are enough: the book, when it was started, and when it was finished or stopped.",
        ],
      },
      {
        kind: "table",
        heading: "The three columns",
        columns: ["Column", "What goes in it"],
        rows: [
          ["Book", "The title, and the author if you like"],
          ["Started", "A date, roughly is fine"],
          ["Finished or stopped", "A date, and either word"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Every book, finished or abandoned",
        paragraphs: [
          "Abandoned books belong on the list. A child who is allowed to stop may well keep starting. If stopping a book counts as a failure, a child may stop picking books that might be hard, or push through books they dislike.",
          "A list with only finished books also tells a slightly false story. The real story includes the books that did not work, and that is valuable information about what your child likes.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Let the child fill it in",
        paragraphs: [
          "Once a child can write, the log is theirs to keep. It is a small job with a clear result, and the handwriting counts as writing practice. Younger children can tell you, and you write it down.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "How it fits a portfolio",
        paragraphs: [
          "Where a portfolio or a review is part of your picture, a reading log is one of the easiest things to include. It shows breadth without any extra work. See [what goes in a homeschool portfolio](/guides/what-goes-in-a-homeschool-portfolio) for the rest of it, and always confirm what your own evaluator or state wants.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What a log cannot tell you",
        paragraphs: [
          "A log says what was read, not how well it was understood. To find out whether something landed, ask your child to explain it a week later. See [how to check if your child learned something](/guides/how-to-check-if-your-child-learned-something).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Homeschooling Companion records reading as a subject like any other: you tap it on Today and add a short note if it is worth one. It has no separate book list screen. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "homeschool-subject-not-working-what-to-change-first",
    title: "Homeschool subject not working? What to change first",
    dek: "Change the time, then the amount, then go back a step, and only then look at the material. A cheapest-first order for a stalled subject.",
    primaryQuery: "homeschool subject not working",
    publishedAt: "2026-09-26",
    areaSlug: "family-and-learning",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a subject is not working, the instinct is to change the curriculum. It is also often the most expensive change, and a cheaper order is worth trying first.",
          "The idea is simple: change one thing at a time, starting with the smallest, and only move down the list when the smaller change has not helped.",
        ],
      },
      {
        kind: "timeline",
        heading: "The order",
        steps: [
          {
            when: "Change the time",
            what: "Earlier in the day, later, or shorter. Some problems are about when, not what.",
          },
          {
            when: "Then change the amount",
            what: "Less of it, for now. A smaller amount done well beats a full amount done with resistance.",
          },
          {
            when: "Then go back one step",
            what: "Find the step before the one that is not working, and check whether that one is solid.",
          },
          {
            when: "Only then consider the material",
            what: "If the time, the amount and the step are all right, the material may be the problem.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Going back one step",
        paragraphs: [
          "A skill usually rests on the one before it. If long division keeps going wrong, the trouble may be in multiplication. Ask a few short questions about the step before, and see whether it is solid. If it is not, that is where to start, and it is not a step backward. It is the way forward.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Notice how a hard session felt",
        paragraphs: [
          "A single hard day means little. A pattern across a few weeks means something. One word after each session, easy, about right or difficult, is enough to show the pattern without turning it into a project.",
          "For a way to check what has landed, see [how to check if your child learned something](/guides/how-to-check-if-your-child-learned-something).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "You are allowed to stop",
        paragraphs: [
          "Putting something down for a while is a real option. Coming back to it in a month often works better than pushing through today. It is not giving up. It is choosing when.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Homeschooling Companion, a session you mark difficult comes back on Today as Worth going over again, with the reason: Last time you said this was difficult. You can tick the topics you are actually teaching and run a short check you write or choose yourself, and results can say Not enough to say. It states what came back. It does not change your material or tell you what is wrong. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "life-admin-binder-what-goes-in-it",
    title: "Life admin binder: what to include, in 8 sections",
    dek: "Eight sections for a binder that says where things are, what to leave out, and why a short finished one beats a long half-filled one.",
    primaryQuery: "life admin binder",
    publishedAt: "2026-09-26",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A life admin binder is a single place that tells somebody else where things are and who to speak to. It might be called an emergency binder, an in case of emergency binder, or an if something happens to me file. The names differ. The job is the same.",
          "Many binders fail for the same reason: they start as a hundred blank pages, and nobody finishes a hundred blank pages. A short binder you finish is worth far more than a long one you abandon in the second section.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A map, not a vault",
        paragraphs: [
          "The most useful rule is to write down where something is, not what it says. \"With Smith and Co, top drawer\" is the useful answer. The document itself should stay where it is.",
          "This also keeps the binder safe to hand over. A page that lists account numbers and passwords is exactly the wrong thing to leave in a drawer. A page that says where things are and who to call is useful to the right person, and much less harmful in the wrong hands. Keep it somewhere private either way.",
        ],
      },
      {
        kind: "list",
        heading: "Eight sections",
        intro: "Not every section applies to every household. Skip what does not.",
        checkable: true,
        items: [
          "Who decides, and who to call. The first person to contact, a person to sort things out, and someone to speak about medical care.",
          "Where the paperwork is. The will, identity documents, tax records, any safe or deposit box.",
          "Money coming in and going out. Banks by name only, pensions and retirement plans, what leaves your account automatically.",
          "Where you live. Whether you own or rent, insurance, utilities, who has a spare key.",
          "People and animals who rely on you. Who would look after children, dependents and pets.",
          "Accounts and devices. The main email address, how somebody would get help getting into your accounts, where photographs live.",
          "What you would want. Preferences in your own words, and where any formal paperwork is kept.",
          "The business, if you have one. Who could keep it going or wind it down, and where its paperwork is.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to leave out",
        paragraphs: [
          "Leave out passwords, the master password for a password manager, full account numbers, and anything you would not want a visitor to read. If somebody would need to get in, write where the recovery instructions are kept, not the instructions themselves.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Build it in an order",
        paragraphs: [
          "Start with the one thing that matters most: who should be called first. Then the will and who knows where it is. Then the email address everything is registered to. Three pages, done in an evening, are a real start. You can add the rest over a few weeks.",
          "For what else belongs in the wider file, see [the if something happens to me file, and what goes in it](/guides/the-if-something-happens-to-me-file) and [what to write down in case something happens to you](/guides/what-to-write-down-in-case-something-happens-to-you).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion turns the binder into one step at a time. It asks eight yes or no questions, skips whatever does not apply, and shows one step on screen with no list of what is left. It never asks for a password or an account number, sends nothing to anyone, and prints a book called My Affairs that you hand over yourself. It is a web app, $49 once, and it is an organizing tool, not legal advice.",
      },
    ],
  },

  {
    slug: "hospital-for-two-weeks-what-would-someone-need-to-find",
    title: "If you were hospitalized, what would someone need to find?",
    dek: "A two-week test for your paperwork: who to contact, where the important papers are and how someone could get help with accounts and devices.",
    primaryQuery: "if i was hospitalized who will pay my bills",
    publishedAt: "2026-09-26",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most of what a household needs from you in an emergency is not dramatic. It is ordinary: bills that need paying, a landlord or employer who needs to be told, a phone somebody has to get into, a child who needs collecting.",
          "Asking what someone would need to find if you were in the hospital for two weeks is a gentler way into the same question as a will or an estate plan, and it produces most of the same list.",
        ],
      },
      {
        kind: "list",
        heading: "The questions a partner or friend would ask",
        checkable: true,
        items: [
          "Who needs to be contacted first, and how would they be reached?",
          "Where is the important paperwork, and who knows that?",
          "How would someone get help getting into your accounts and devices?",
          "Which bills or payments would fall due in the meantime, and are they automatic?",
          "Who looks after children, dependents or pets, and what do they need to know for a normal week?",
          "Who speaks to your employer or your business?",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Answer with where, not what",
        paragraphs: [
          "For each question, write down where the answer is or who has it. You do not need to copy documents or write out credentials. \"The recovery instructions are in the safe, and my brother knows the safe is there\" is a complete and useful answer.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Two weeks is a good size",
        paragraphs: [
          "Two weeks is long enough to expose the gaps and short enough not to feel morbid. It is also the shape of most real interruptions: a hospital stay, a long trip out of contact, a family emergency somewhere else. If your list works for two weeks, it is most of the way to working for anything longer.",
          "For the longer version, see [the if something happens to me file](/guides/the-if-something-happens-to-me-file), and for a shorter list to write down, see [what to write down in case something happens to you](/guides/what-to-write-down-in-case-something-happens-to-you).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion includes a Handoff Check that looks at what you have recorded the way a stranger would, by what they would be trying to do: who to contact, where the paperwork is, how to reach accounts and devices. It shows a count of what may still be unclear, never a percentage, and it is private to you. It sends nothing to anyone. It is a web app, $49 once, not legal advice.",
      },
    ],
  },

  {
    slug: "emergency-contact-and-medical-decision-maker",
    title: "How to choose a health care proxy, and record it",
    dek: "Choosing someone to speak for you about medical care, asking them, and writing down where the paperwork is. Forms and rules vary by state.",
    primaryQuery: "how to choose a health care proxy",
    publishedAt: "2026-09-26",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "If you were too ill to speak for yourself, someone would need to. Who that is, and whether they know what you would want, is worth deciding before it matters. This guide is about the practical side: choosing, asking, and recording where things are. It is not legal or medical advice.",
          "The formal documents involved, and who is allowed to speak for you if you have not chosen, vary by state. An attorney in your state, or your state's official source, is the place to confirm what applies to you.",
        ],
      },
      {
        kind: "timeline",
        heading: "The order that works",
        steps: [
          {
            when: "Choose",
            what: "Pick one person you trust, who is likely to be reachable and who would be able to stay steady under pressure. It does not have to be the person closest to you.",
          },
          {
            when: "Ask",
            what: "Ask them before you write their name down. Being named without being asked is unfair to them and unreliable for you.",
          },
          {
            when: "Talk",
            what: "Tell them what you would want. It does not have to be a long conversation. What matters most, and what would be hard for you, is a good start.",
          },
          {
            when: "Record",
            what: "Write down who they are, how to reach them, and where any formal paperwork is kept.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "A first contact is different from a decision maker",
        paragraphs: [
          "An emergency contact is the person to call first. A medical decision maker is the person who would speak about your care. They can be the same person, but they do not have to be. Write both down, and say which is which.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Name a second person",
        paragraphs: [
          "The person you choose may be traveling, unwell or unreachable on the day. A second name costs almost nothing and covers the gap.",
          "For the wider picture of what to write down, see [what to write down in case something happens to you](/guides/what-to-write-down-in-case-something-happens-to-you).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion has a step for deciding who should speak for you about medical care. It records their name, how to reach them, and whether you have talked to them about what you would want. It records the choice. It does not create a legal form, appoint anyone, or contact anyone. It is a web app, $49 once, and it is not legal or medical advice.",
      },
    ],
  },

  {
    slug: "who-would-raise-your-children-guardian-checklist",
    title: "Who would raise your children? A guardian checklist",
    dek: "A guardian who would say no is worse than none named, because it looks settled when it is not. A checklist for choosing, asking and a second choice.",
    primaryQuery: "guardian checklist for children",
    publishedAt: "2026-09-26",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "For many parents this is the hardest question on the list, and often the reason people finally sit down to plan at all. It is also one where a little clarity now matters a great deal.",
          "How a guardian is legally named, and what a court considers, varies by state. This guide covers the human side of the choice. Confirm the legal side with an attorney in your state.",
        ],
      },
      {
        kind: "list",
        heading: "The checklist",
        checkable: true,
        items: [
          "Think about values and daily life first, not only who is closest or who is wealthiest.",
          "Choose one person or couple, and ask them before you name them.",
          "Name a second choice, in case the first cannot or will not do it.",
          "Write down the practical details of a normal week: school, the doctor, who collects them, what happens on which day.",
          "Say where any formal paperwork is kept, and who knows that.",
          "Come back to it when something changes: a move, a separation, a new child.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ask them first",
        paragraphs: [
          "Naming someone who would say no is worse than naming nobody, because it looks settled when it is not. A short, honest conversation now spares everyone a surprise later. If the answer is no, that is useful information, and it costs you an hour and not a crisis.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The children's week",
        paragraphs: [
          "The written details do more than they look like they will. Whoever steps in is trying to get a child through a normal Tuesday while everyone is upset. A page that says who collects them, what the doctor is called and which days matter turns a frightening week into a manageable one.",
          "See also [what to write down in case something happens to you](/guides/what-to-write-down-in-case-something-happens-to-you).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion, if you have children under eighteen, asks who you would want to raise them, then asks you to talk to them first, then asks for a second choice and the details of a normal week. It records your choice. It does not appoint a guardian or file anything, and it sends nothing to anyone. It is a web app, $49 once, and it is not legal advice.",
      },
    ],
  },

  {
    slug: "who-to-tell-when-someone-dies",
    title: "Who to notify when someone dies, in order",
    dek: "Who to tell first, what can wait, and how to keep track as you go, so the first phone calls are not the hardest part of the week.",
    primaryQuery: "who to notify when someone dies",
    publishedAt: "2026-09-26",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When someone dies, the list of people to tell feels endless. It is not. A small number of calls matter in the first days, and most of the rest can wait until there is more energy.",
          "This guide gives an order. It cannot replace advice for your situation, and procedures vary by state. If there is an executor or a hospice or hospital team involved, they will often tell you the next step.",
        ],
      },
      {
        kind: "timeline",
        heading: "A sensible order",
        steps: [
          {
            when: "First",
            what: "Close family and the people who would want to hear it from a person, not from someone else. If there was a named first contact, start there.",
          },
          {
            when: "The first few days",
            what: "The medical or funeral professionals involved, and the person named to handle affairs, if there is one.",
          },
          {
            when: "Within the first weeks",
            what: "The employer, and the banks and insurers who will need to know. These can usually be done by phone, and many will tell you what they need.",
          },
          {
            when: "When you have the energy",
            what: "Utilities, subscriptions, social accounts and everything else. Most of it is not urgent.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write it down as you go",
        paragraphs: [
          "Keep a single page of who you told, when, and what they said they needed next. In the first days it is easy to lose track of who has been told and who has not.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The list is easier when it already exists",
        paragraphs: [
          "The hardest calls are the ones where nobody knows who to call. If nobody knows who to call, much of the rest may never be found. A page that says who to contact first, written down in advance, is one of the kindest things a person can leave.",
          "For the first two weeks in more detail, see [what to do when a parent dies](/guides/what-to-do-when-a-parent-dies), and for finding accounts nobody wrote down, see [how to find someone's accounts after they die](/guides/how-to-find-someones-accounts-after-they-die).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion is for preparing, not for the days after. Its first step asks who should be called first, and a name is enough to begin with. It does not hold a list of who to notify, and it sends nothing to anyone. It prints a book that somebody could follow. It is a web app, $49 once, and it is not legal advice.",
      },
    ],
  },

  {
    slug: "update-your-paperwork-after-a-life-change",
    title: "What to update after marriage, divorce, a move or a baby",
    dek: "Where to look again after a move, marriage, new child or divorce, named people first, and what an attorney or provider can confirm.",
    primaryQuery: "what to update after a life change",
    publishedAt: "2026-09-26",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Paperwork goes out of date all at once, not slowly. The week you move, marry, separate, have a child, change jobs or lose someone you named, several things stop being true together, and none of them announces itself.",
          "This guide is a list of where to look, not advice about what to do. For what a change means legally, an attorney or the provider in question is the place to ask.",
        ],
      },
      {
        kind: "table",
        heading: "Where to look, by event",
        columns: ["What changed", "What to look at again"],
        rows: [
          ["You moved", "Where you live, insurance, utilities, who has a spare key"],
          ["You married", "Who is named on forms, who to call first, who speaks for you about medical care"],
          ["You separated or divorced", "Who is named on forms, who would sort things out, who speaks for you about medical care"],
          ["You had or adopted a child", "Who would raise them, the details of their week, who is named on forms"],
          ["You changed jobs", "The retirement plan and life insurance from the old job, and who is named on them"],
          ["Someone you named has died", "Every place that person was the answer"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Named people first",
        paragraphs: [
          "The most consequential things to look at are the names on forms. A retirement account or life insurance policy usually goes to whoever is named on the form, and a form filled in years ago at a previous job may still be the one that counts. See [your beneficiary forms quietly override your will](/guides/beneficiary-forms-override-your-will).",
          "A separation or divorce does not necessarily change who is named on these forms by itself. Check with the plan provider and an attorney about what applies to you.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not try to fix everything in a week",
        paragraphs: [
          "Start with the names, then who to call first, then the rest as you have energy. For the money side of the same events, see [how to sort out your finances after a job change, move or divorce](/guides/sort-out-your-finances-after-a-life-change).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion has a card in Settings called Has something changed, with nine life events, such as I moved or I got married. Choose one and it finds the parts of what you recorded that are worth a second look, and brings them back one at a time as questions. Nothing is deleted and nothing is marked wrong. It is a web app, $49 once, and it is not legal advice.",
      },
    ],
  },

  {
    slug: "safe-deposit-box-and-spare-keys-who-can-open-it",
    title: "Who can open a safe deposit box or safe when you die?",
    dek: "What to write down about a safe, a deposit box and spare keys, why a name beats a code, and how to check that someone can really open them.",
    primaryQuery: "who can open a safe deposit box",
    publishedAt: "2026-09-26",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many households have a safe, a deposit box or a set of spare keys that only one person knows about. It holds the important things, and it becomes a problem the day that person is not available.",
          "The fix is small: write down that it exists, where it is, and who is able to open it. Not how.",
        ],
      },
      {
        kind: "list",
        heading: "Three things to write down",
        checkable: true,
        items: [
          "What it is: a home safe, a deposit box at a bank, a lockbox, a filing cabinet with a key.",
          "Where it is, precisely enough that a stranger could find it.",
          "Who is able to open it: a name, not a code.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Never write the combination",
        paragraphs: [
          "Do not record the combination, the PIN or the location of the key on the same page as the location of the safe. Write where somebody would find out how to open it, such as who has the key or where the instructions are kept, not the instructions themselves.",
          "This is the same rule as everything else in a life admin file: say where, not what. See [what goes in a life admin binder](/guides/life-admin-binder-what-goes-in-it).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Spare keys",
        paragraphs: [
          "Note who has a spare key to your home, and who could get one. A neighbor with a key is often the fastest route into a house in an emergency. It is worth knowing who that is, and worth telling them they are on the list.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check it works",
        paragraphs: [
          "Ask the person named whether they know where the box or safe is and how they would get access. A deposit box in your name alone may not be simple for someone else to open. The bank can tell you what its rules are, and an attorney can tell you what applies where you live.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Life Affairs Companion has a step for any safe, lockbox or deposit box. It asks what it is, where it is, who is able to open it, and where someone would find out how. The hint says to record a name, not a code, and never the combination. It also has a step for who has a spare key. It never asks for a combination and sends nothing to anyone. It is a web app, $49 once, and it is not legal advice.",
      },
    ],
  },

  {
    slug: "what-happens-to-your-pets-if-something-happens-to-you",
    title: "Who will take care of your pets if something happens to you",
    dek: "A name, what each animal needs, and where the papers are. A short note that makes a hard week easier for whoever steps in.",
    primaryQuery: "who will take care of my pets if something happens to me",
    publishedAt: "2026-09-26",
    areaSlug: "affairs-and-endings",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "If you were suddenly away, someone would need to feed the dog, let the cat out and get the rabbit to the vet. Most people do not have a plan for this, and the person who steps in usually has to guess.",
          "A short note fixes much of it. It takes a few minutes per animal, and it is one of the kindest things you can leave.",
        ],
      },
      {
        kind: "list",
        heading: "What to write",
        checkable: true,
        items: [
          "Who would take each animal, and whether you have asked them.",
          "What each animal needs: food, medication, routines, quirks.",
          "The name of the vet and where the records are.",
          "Where papers are kept: registration, insurance, microchip details.",
          "Who else could help if the first person cannot.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ask first",
        paragraphs: [
          "As with any arrangement that depends on another person, ask before you write their name down. A person who has agreed, and knows what is involved, is a plan. A name on a page is only a hope.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The vet is a useful second contact",
        paragraphs: [
          "A vet knows your animals' history and can be reached in an emergency. Tell your vet who to contact, and tell that person that they are on the list.",
          "For the wider file this belongs in, see [what goes in a life admin binder](/guides/life-admin-binder-what-goes-in-it).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "If you have pets, Personal Life Affairs Companion has a step for saying who would take them and what they need. It records the answer in your own words, and your answer prints in the book. It sends nothing to anyone and does not arrange care. It is a web app, $49 once, and it is not legal advice.",
      },
    ],
  },

  {
    slug: "how-to-write-a-one-page-trip-itinerary",
    title: "How to write a one-page trip itinerary",
    dek: "A trip itinerary that survives a change is short, in time order, with the reference beside each booking. What goes on each line and what to leave off.",
    primaryQuery: "one page trip itinerary",
    publishedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most trip itineraries fail in the same way: they try to be a guidebook. Restaurant ideas, opening hours and three backup plans crowd out the few things you actually need to find quickly, which are where you have to be, when, and which booking it is.",
          "A useful itinerary is closer to a timetable than a guidebook. It fits on one page, it is in time order, and every line answers three questions.",
        ],
      },
      {
        kind: "table",
        heading: "Three things on every line",
        columns: ["Column", "What goes in it"],
        rows: [
          ["Time", "When it starts, as it is on the booking"],
          ["Place", "Where you need to be, in a few words"],
          ["Reference", "The confirmation reference, beside the booking and not in an inbox"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "One block per day",
        paragraphs: [
          "Give each day its own block. Put the fixed things first: flights, trains, check-in, anything with a reserved time. Leave the rest of the day empty on purpose. A day with nothing on it is not a gap in the plan. It is room for the day to go the way it goes.",
        ],
      },
      {
        kind: "list",
        heading: "What to leave off",
        checkable: true,
        items: [
          "Restaurant and sightseeing ideas that are not booked. Keep them in a separate note.",
          "Opening hours you have not confirmed.",
          "Long descriptions. A name and a place are enough.",
          "Anything that would be useless if it changed. Put that in the notes.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Note what depends on what",
        paragraphs: [
          "The most useful thing you can add is which bookings rest on which. A transfer built on a flight, a check-in built on a train. When the first one moves, the rest need looking at, and the itinerary is where you will see it. See [how to work out what else in your trip is affected when a flight changes](/guides/flight-changed-what-else-is-affected).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Print it",
        paragraphs: [
          "A one-page itinerary is worth printing. It works when your phone does not, and it is the page you hand to whoever is meeting you. For what else earns a place on paper, see [what to keep on paper when you travel](/guides/what-to-keep-on-paper-when-you-travel).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Travel Companion, you name a trip and give it rough dates, and it is laid out day by day straight away. Add what you have booked from there. A day with nothing recorded says so and is never filled in for you. Each booking card shows its confirmation reference, and the itinerary saves as a PDF. It records bookings you made elsewhere. It does not book anything, track flights or suggest where to go. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "packing-list-for-a-week-away",
    title: "Packing list for a week away, by person",
    dek: "Start with what every trip needs, add what this one asks for, then split it by person. A method you can tick off as you pack.",
    primaryQuery: "packing list for a week away",
    publishedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The trouble with most packing lists is that they are either too long to use or too generic to trust. The way out is to build yours in two layers: a short list of things every trip needs, then a few additions for this particular one.",
          "No list fits every trip, so treat this as a starting point, not a rulebook. Change anything.",
        ],
      },
      {
        kind: "list",
        heading: "Layer one: the basics",
        intro: "What almost every trip needs, whatever the weather.",
        checkable: true,
        items: [
          "Passport or photo ID",
          "Bank card",
          "Copies of your bookings",
          "Some cash",
          "Phone, and something to charge it with",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Layer two: this trip",
        paragraphs: [
          "Add what the trip asks for. A beach week wants sun and swimming things. A week in a cold place wants layers and something waterproof. A city break wants comfortable shoes and a bag you can carry all day. Write down the two or three things that make this trip different, not everything you might possibly need.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Pack by person",
        paragraphs: [
          "Split the list into what is shared and what is personal. Shared items, such as a first aid kit or a charger, only need packing once. Personal items belong to one person each. Splitting it this way stops two people packing the same thing and nobody packing the other.",
          "If you are packing for children, add a short extra list for each child. See [packing and planning for a trip with kids or a baby](/guides/packing-and-planning-for-a-trip-with-kids-or-a-baby).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Tick as you pack",
        paragraphs: [
          "A packing list is only useful if you tick it. Print it, leave it by the bag, and tick things as they go in. Do the documents first, and put them where you will not have to look for them.",
          "For a shorter version, see [a carry-on only packing list](/guides/carry-on-only-packing-list).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion has eleven starting lists: the basics, beach, city break, cold weather, camping, road trip, cruise, business trip, carry-on only, children and a baby. It calls them a starting point, not a rulebook, and nothing is added until you press the button. Items are grouped under Everyone and then each person, and the list saves as a PDF with tick boxes. The lists use plain words and are for you to change. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "carry-on-only-packing-list",
    title: "Carry-on only packing list: how to fit it in one bag",
    dek: "One bag, nothing checked. Choose the bag first, then pack to the list, and check size and weight on your airline's own page before you go.",
    primaryQuery: "carry on only packing list",
    publishedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Traveling with only a carry-on comes down to one decision made in the right order: the bag first, then the list. If you choose the list first, you will always find that it does not fit.",
          "Check your airline's current rules for size and weight before you pack. They differ and they change, so the airline's own page is the only source to trust.",
        ],
      },
      {
        kind: "timeline",
        heading: "The order",
        steps: [
          {
            when: "Choose the bag",
            what: "Pick the bag you will carry, and treat its size as the limit for everything else.",
          },
          {
            when: "Write the list",
            what: "Start with the basics: passport or photo ID, a bank card, copies of your bookings, some cash. Then add clothes for the days, not for the possibilities.",
          },
          {
            when: "Pack to the list",
            what: "Pack what is on the list and nothing else. If it is not written down, it stays.",
          },
          {
            when: "Check the weight",
            what: "Weigh the bag against your airline's rule before you leave home, not at the desk.",
          },
        ],
      },
      {
        kind: "list",
        heading: "Ways to make it fit",
        checkable: true,
        items: [
          "Choose clothes that mix, so a few pieces make several outfits.",
          "Wear the heaviest shoes and the bulkiest layer.",
          "Decant liquids into small containers, and check the limits for carrying them.",
          "Leave behind what you can buy or borrow when you arrive.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What is worth keeping in reach",
        paragraphs: [
          "Keep your documents, your phone and anything you will need in transit in one easy pocket. The point of a single bag is speed, and speed disappears if you have to unpack at the gate.",
          "For the longer version of this list, see [packing list for a week away](/guides/packing-list-for-a-week-away).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion has a Carry-on only starting list, described as one bag, nothing checked. Like the others, it is a starting point that you can change, and nothing is added until you press the button. The list saves as a PDF with tick boxes. It does not know your airline's size or weight limits. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "packing-and-planning-for-a-trip-with-kids-or-a-baby",
    title: "Traveling with kids or a baby: packing and planning",
    dek: "What changes when children come along: what to pack per child, the paperwork to note for each, and how to plan a day with room for a bad one.",
    primaryQuery: "traveling with kids or a baby",
    publishedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Traveling with children changes three things: what you pack, what you need to carry on paper, and how much you can plan into a day. The first is a list. The second is a checklist. The third is a decision to make before you go.",
        ],
      },
      {
        kind: "compare",
        heading: "What changes",
        left: {
          label: "On your own",
          items: [
            "One bag of your own things",
            "Flexible timing",
            "A plan you can change on the spot",
          ],
        },
        right: {
          label: "With a child or a baby",
          items: [
            "Extras for each child, plus shared items",
            "Naps, meals and downtime set the timing",
            "A plan with room for a bad day",
          ],
        },
      },
      {
        kind: "list",
        heading: "Packing: per child",
        intro: "Start with your own basics, then add a short list for each child.",
        checkable: true,
        items: [
          "Their own documents, if the trip needs them.",
          "A change of clothes in the bag you carry, not the one you check.",
          "Anything that comforts them: a toy, a blanket, a book.",
          "For a baby, the things you would need in an unplanned extra night.",
          "Snacks and drinks that you know they will accept.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Paperwork",
        paragraphs: [
          "List each child's documents under their own name, and note where each one is kept. Requirements differ by country and by airline, and they change, so check with the official source for where you are going. Our guide on [travel documents](/guides/travel-document-checklist) covers what to record and how.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Pace",
        paragraphs: [
          "Plan fewer things, and plan them earlier in the day. Leave one gap in each day, and one day in the trip with nothing in it. A trip with children succeeds when it can absorb a bad morning.",
          "For the group side of it, see [how to plan a group trip without becoming the organizer](/guides/how-to-plan-a-group-trip).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Travel Companion, you add each person who is traveling and can mark someone as a child. Two starting packing lists, Children and A baby, add items for each child you have recorded. Nothing is added until you press the button, and you can remove or change any of it. Each person can also carry a private note of requirements. It does not share anything with anyone. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "lost-passport-wallet-or-phone-abroad-what-to-have-ready",
    title: "Lost passport, wallet or phone abroad: what to have ready",
    dek: "Passport, wallet or phone gone abroad. What to gather before you call anyone, the one person to tell first, and where the official steps live.",
    primaryQuery: "lost passport abroad",
    publishedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When a passport, wallet or phone goes missing, the first ten minutes tend to go on panic and the next hour on searching. The most useful thing you can do is slow down and have the right details in front of you before you make a call.",
          "This guide is about preparation, not procedure. The correct steps depend on what was lost, where you are and who issued it. Confirm what to do with the official source, such as the issuer of a card or your country's official travel advice.",
        ],
      },
      {
        kind: "list",
        heading: "What to have ready",
        checkable: true,
        items: [
          "What exactly was lost, and roughly when you last had it.",
          "Who issued it: the bank for a card, the carrier for a phone, the government for a passport.",
          "Where the copies or records are, if you kept any.",
          "How you can be reached now, since your usual phone may be the thing that is gone.",
          "Who else needs to know: someone with you, someone waiting to meet you, someone at home.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do one thing at a time",
        paragraphs: [
          "Start with the thing that is most urgent and hardest to undo, which is often a card or a phone that gives access to accounts. Write down who you spoke to, and when, and what they said would happen next. A page of notes is worth more than a good memory on a bad day.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Tell one person first",
        paragraphs: [
          "Tell someone you trust what has happened, in a sentence: what was lost, where you are, what you need. They can help with the calls, and you will not carry the whole thing alone. If your phone is gone, borrow one, and use a number you know by heart.",
          "Where the things were kept matters too. See [what to keep on paper when you travel](/guides/what-to-keep-on-paper-when-you-travel) for the short list of what is worth carrying in another form.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion has a set of questions for when something is lost or stolen: a passport or ID, bank cards or a wallet, a phone, a bag or luggage, or tickets or booking confirmations. It helps you gather what you need before you make the call, and a separate Let somebody know step helps you word a message. It gives no legal, embassy or police steps, and it sends nothing for you. The wording is not saved. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "first-international-trip-checklist",
    title: "First international trip checklist: what to do and when",
    dek: "Passport, entry rules, money, insurance and phone, in the order to sort them out and how early to start. Check every rule at the official source.",
    primaryQuery: "first international trip checklist",
    publishedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A first international trip feels like a lot of unknowns. Most of them are ordinary paperwork with a deadline, and the trick is to find out early which ones apply to you.",
          "This checklist says what to look into, not what the rules are. Entry rules, health requirements and documents differ by country and change, and the official source for the country you are visiting is the only one to trust.",
        ],
      },
      {
        kind: "timeline",
        heading: "In a sensible order",
        steps: [
          {
            when: "As soon as you decide",
            what: "Check that your passport exists and is valid for the trip. Find out what the country you are visiting asks of its visitors, and whether you need anything before you go.",
          },
          {
            when: "A few months out",
            what: "Note when each document expires, and whether any date falls before or during the trip. Renewals can take time.",
          },
          {
            when: "Once you have booked",
            what: "Keep confirmations in one place, with the reference beside each booking.",
          },
          {
            when: "Before you leave",
            what: "Sort out how you will pay, how you will stay in touch, and what insurance you want.",
          },
          {
            when: "The night before",
            what: "Check your documents are in the bag you carry. See [the night-before list](/guides/night-before-you-travel-checklist).",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Check each rule at the source",
        paragraphs: [
          "Look for the official government pages of the country you are visiting, and your own government's travel advice. Do not rely on a blog post, including this one, for a rule that could stop you boarding.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Record what exists and where it is",
        paragraphs: [
          "For each document, note what it is, whose it is, where it is kept and when it expires. A photograph on your phone is not a plan on its own. See [travel document checklist](/guides/travel-document-checklist).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion records documents as a registry: what exists, whose it is, where it is kept, and when it expires. If an expiry date falls before or during the trip, it appears under Dates worth a look, with a reminder that what each country asks for differs and changes, so you should check with the country you are visiting. It only compares the dates you typed and states no country rules. It stores no files. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "road-trip-planning-checklist",
    title: "Road trip planning checklist: stops, stays, car and pack",
    dek: "The few things to fix before you drive: daily distance, stays with their references, the car check, who drives when, and what stays within reach.",
    primaryQuery: "road trip planning checklist",
    publishedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A road trip is the most flexible kind of trip, which is exactly why it goes wrong when nothing is fixed. A few decisions made in advance leave the rest free.",
        ],
      },
      {
        kind: "list",
        heading: "Before you go",
        checkable: true,
        items: [
          "Decide roughly how far you will drive each day, and how many hours is too many.",
          "Book the stays you cannot do without, and keep the reference for each.",
          "Check the car: tires, fluids, and anything the vehicle's own manual recommends before a long trip.",
          "Keep documents together: license, insurance, and any rental agreement.",
          "Note who is driving, and when.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Stops",
        paragraphs: [
          "Plan a stop every couple of hours, and plan the first one before you leave. Note what is at each stop that you actually need: fuel, food, a place to stretch. Leave the rest unplanned.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Stays",
        paragraphs: [
          "Book the nights that matter, especially in busy places, and leave others open. Write the check-in time and the confirmation reference beside each stay. If a stay depends on a rental car or a ferry, note that too, so a change shows what is affected. See [how to work out what else in your trip is affected](/guides/flight-changed-what-else-is-affected).",
        ],
      },
      {
        kind: "list",
        heading: "What to pack for the car",
        intro: "On top of your own bag.",
        checkable: true,
        items: [
          "Water and snacks within reach.",
          "Chargers and a way to use your phone safely.",
          "Something to clean up with, and a bag for trash.",
          "A small bag for the night, so you do not unpack the whole car.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Travel Companion has a Road trip starting list, described as long drives and short stops. It also records bookings such as a rental car, a hotel or a campsite with their times and references, and the itinerary shows them day by day. It has no maps, directions or route planning. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "night-before-you-travel-checklist",
    title: "Night before you travel checklist: a short list",
    dek: "Six checks the evening before you go: documents, cards, phone, times and the house, so the morning is only leaving. Plus what to skip.",
    primaryQuery: "night before travel checklist",
    publishedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The night before a trip is the wrong time to find out you are missing something, and the right time to check that you are not. A short list, done in ten minutes, is enough.",
        ],
      },
      {
        kind: "list",
        heading: "The list",
        checkable: true,
        items: [
          "Passport or photo ID, in the bag you carry.",
          "Bank card, and some cash.",
          "Copies of your bookings, printed or saved where you can reach them without signal.",
          "Phone charged, and something to charge it with.",
          "Anything with a time on it tomorrow, checked once.",
          "The house: things off, windows shut, someone who knows you are away.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Look at tomorrow, and the day after",
        paragraphs: [
          "Read through the first two days of the trip once. Note what is fixed, what you are still waiting to hear back on, and anything that depends on something else. A transfer built on a flight is worth a glance if the flight has changed.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep the list short",
        paragraphs: [
          "The longer the list, the less likely you are to finish it. Put the things that matter most first, and leave the rest to the packing list you made earlier. See [packing list for a week away](/guides/packing-list-for-a-week-away).",
          "For the paper you might want in your bag, see [what to keep on paper when you travel](/guides/what-to-keep-on-paper-when-you-travel).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Travel Companion, Today shows what is happening, what is worth knowing about tomorrow, and what you are still waiting to hear back on. It looks two days ahead, no further. A preparation list has seven kinds of to-do: documents, packing, transport, money, home, people and bookings, and you can tick them off. It sends no alerts. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "what-is-due-on-my-car-right-now",
    title: "How to know what maintenance your car is due for",
    dek: "Work out what is due by miles and by months, whichever comes first, using the intervals in your owner's manual and one recorded date.",
    primaryQuery: "what maintenance is due on my car",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many people cannot say when their car last had its oil changed without digging through a glovebox or a phone. The question sounds simple, and the answer is often a guess.",
          "You can answer it in a minute if you have two things written down: when each job was last done, and how often your car wants it. The second comes from your owner's manual. The first has to come from you.",
        ],
      },
      {
        kind: "list",
        heading: "The two numbers for every job",
        checkable: true,
        items: [
          "The date it was last done, and the mileage at the time.",
          "How often it comes round, in miles, in months, or in both. Your owner's manual is the source.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Miles or months, whichever comes first",
        paragraphs: [
          "Some jobs go by distance, some by time, and many by both. When a job has both, it comes due when the first one is reached. A car that barely moves can hit the months limit long before the miles. A car that covers long distances hits the miles first.",
          "To work it out, take today's mileage and subtract the mileage when the job was last done. Then count the months since the date. Whichever is further along its limit is the one that counts.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "You need one recorded date to start",
        paragraphs: [
          "Nothing can be judged without a starting fact. If you do not know when something was last done, do not guess. Write that down honestly, and start from the next time you do it. A record that begins today is worth more than a guess that claims to begin last spring. See [what to do if you bought a used car with no service records](/guides/used-car-no-service-records-what-to-do).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep it on one page",
        paragraphs: [
          "A single page is enough: the job, the date it was last done, the mileage then, and how often it is due. For what to write on each line, see [car maintenance log: what to write down](/guides/car-maintenance-log-what-to-write-down), and for where the intervals come from, see [car maintenance by mileage: start with your owner's manual](/guides/car-maintenance-by-mileage-start-with-your-manual).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion works out what is due from the intervals you enter and the dates you record. It shows what is due across every car you own, most urgent first, and says so plainly when nothing is due, with no score or percentage. A job with no recorded date reads as nothing to judge yet, never overdue. It uses your numbers, not a factory schedule. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "what-to-tell-a-mechanic-before-work-starts",
    title: "What to tell a mechanic before the work starts",
    dek: "Say what you are asking for, the most you will approve without a call, and ask for an estimate in writing. A short script and a page to hand over.",
    primaryQuery: "what to tell a mechanic before repair",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many disagreements at a repair shop start the same way: a small job grows while you are not there, and nobody wrote down what was agreed. You cannot control what a shop finds, but you can control what you say before they start.",
          "This is a plain script, not legal advice. It will not force a shop to do anything. It makes your request clear, and clear requests are easier to keep.",
        ],
      },
      {
        kind: "timeline",
        heading: "Before you hand over the keys",
        steps: [
          {
            when: "Say what you are asking for",
            what: "Be specific about today's job. \"An oil and filter change and a tire rotation\" is a request. \"Have a look at it\" is an invitation.",
          },
          {
            when: "Say the limit",
            what: "Tell them the most you will agree to without a call. It is a simple sentence: \"Please do not go over this without calling me first.\"",
          },
          {
            when: "Ask for a call first",
            what: "If something else comes up, ask them to call you before any further work begins, and to wait for your answer.",
          },
          {
            when: "Ask for a written estimate",
            what: "For anything else they find, ask for the estimate in writing before you say yes.",
          },
        ],
      },
      {
        kind: "list",
        heading: "Optional extras",
        checkable: true,
        items: [
          "Ask them to keep any parts they replace, so you can see them.",
          "Give a number they can reach you on during the day.",
          "Note the mileage and the date on your copy.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write it down",
        paragraphs: [
          "A spoken request is easily forgotten by both of you. A page you both initial is not. It does not have to be formal: what you are requesting, the most you will agree to, and the sentence about calling you.",
          "If you keep a record of what was done, the page is also the start of the entry. See [car maintenance log: what to write down](/guides/car-maintenance-log-what-to-write-down).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion prints a page called the Service Boundary. It lists the jobs you are requesting today, states that anything not listed is not authorized, asks the shop to call before further work and to give a written estimate, and has an optional line for the most you will go without a call. It is your written request, not a contract, and the app does not check or use the amount. It is made in your browser. A web app, $34 once.",
      },
    ],
  },

  {
    slug: "used-car-no-service-records-what-to-do",
    title: "Bought a used car with no service records? What to do",
    dek: "No service history on your used car? Ask the seller, note the odometer, find the manual and start your own record from today.",
    primaryQuery: "used car no service records",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Plenty of used cars arrive with nothing on paper. That does not mean nothing was ever done to them, only that nobody wrote it down, or that the paper did not travel with the car.",
          "You cannot reconstruct what you do not know. What you can do is start a record today and be honest about the part you cannot see.",
        ],
      },
      {
        kind: "timeline",
        heading: "The first week",
        steps: [
          {
            when: "Ask the seller",
            what: "Ask what they know and whether any receipts or notes exist. Anything they remember is worth writing down, marked as what the seller said.",
          },
          {
            when: "Note today's mileage",
            what: "Read the odometer and write down the number and the date. It is your starting point.",
          },
          {
            when: "Find the manual",
            what: "Your owner's manual says how often each job comes round for your car. If it is missing, the manufacturer may have a copy online.",
          },
          {
            when: "Start a record",
            what: "Begin with today. Each time something is done, write the date, the mileage and what was done.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do not guess what was done",
        paragraphs: [
          "The temptation with an unknown history is to assume the worst and do everything at once, or the best and do nothing. Neither is based on a fact. A better approach is to treat each job as unknown until you have a real date for it, and to decide job by job whether a check now is worth it.",
          "If a mechanic looks at the car, ask what they see and write that down too. See [what to tell a mechanic before the work starts](/guides/what-to-tell-a-mechanic-before-work-starts).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Your record becomes the history",
        paragraphs: [
          "In a couple of years, you will be the one with a service history and the next owner the one who asks for it. See [selling your car with a service history](/guides/selling-your-car-with-a-service-history).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Vehicle Maintenance Companion, you can say that a vehicle's history is unknown. Nothing is then assumed done: a job waits for a real fact before it says anything is due, and shows as nothing to judge yet until you record when it was last done. Nothing reads overdue on a fact you never had. It works the same way for any job with no recorded date. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "car-maintenance-log-what-to-write-down",
    title: "Car maintenance log: what to write down",
    dek: "A car maintenance log needs three things on every line and two optional ones. What to write, what to leave off, and how to keep it up.",
    primaryQuery: "car maintenance log",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A maintenance log has one job: to say what was done to the car, and when. It does not need to be beautiful. It needs to be complete enough that you, a mechanic or a buyer could read it in a minute.",
        ],
      },
      {
        kind: "table",
        heading: "The columns",
        columns: ["Column", "What goes in it", "Needed?"],
        rows: [
          ["Date", "The day it was done", "Yes"],
          ["Miles", "The odometer reading at the time", "Yes"],
          ["What was done", "In plain words, such as an oil and filter change", "Yes"],
          ["Who did it", "A shop name, or yourself", "Optional"],
          ["Cost or note", "What it cost, or anything worth remembering", "Optional"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Record the fact, not the intention",
        paragraphs: [
          "Write what was done, not what you meant to do. A line that says \"brake pads replaced\" is a fact. A line that says \"brakes need doing\" is a reminder, and belongs somewhere else.",
        ],
      },
      {
        kind: "list",
        heading: "What to leave off",
        checkable: true,
        items: [
          "Guesses about when something was done. If you do not know, leave it out.",
          "Long descriptions. A short line and a receipt somewhere are enough.",
          "Anything that is not about the car, such as your home address or account numbers.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "One-off repairs count too",
        paragraphs: [
          "A log is not only for scheduled jobs. A repair after a breakdown belongs on it as well, with the same three fields. It is often the most interesting line for the next owner.",
          "To use the log to work out what is due, see [what is due on my car right now](/guides/what-is-due-on-my-car-right-now).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion keeps every service with its date, mileage, who did it, an optional cost and a note, grouped by year, newest first. You can also log a service that was never a tracked job, like a repair. Costs are optional and shown without a currency symbol. It is your own record. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "selling-your-car-with-a-service-history",
    title: "Selling your car: how to present your service history",
    dek: "A dated record shows a buyer how a car was looked after. What to bring, what a record you kept yourself can and cannot prove, and how to print it.",
    primaryQuery: "selling a car with service history",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When you sell a car, a buyer wants to know how it was looked after. A tidy record answers that better than a promise. It does not decide the price, and it will not make a difference to every buyer, but it removes a question.",
        ],
      },
      {
        kind: "list",
        heading: "What to bring",
        checkable: true,
        items: [
          "A list of what was done, in date order, with the mileage at each entry.",
          "The name of who did each job, where you know it.",
          "Any receipts you kept, kept separately from the list.",
          "Notes on anything unusual, such as a one-off repair.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What a record can and cannot prove",
        paragraphs: [
          "A record you kept yourself is your account of what happened. It is useful, and honest buyers know that. It is not a certificate. If you say what you can back up, and leave out what you cannot, it will read as credible.",
          "Receipts add weight to a list. A list without receipts is still better than nothing, provided it is clear that it is your own record.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Print it, keep a copy",
        paragraphs: [
          "Print the record so the buyer can read it on the spot, and keep a copy for yourself. If you are keeping it as you go, this is a five-minute job. If you are starting late, be honest about where the record begins. See [you bought a used car with no service records](/guides/used-car-no-service-records-what-to-do) for how to begin.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion prints everything recorded for one vehicle, oldest first, as a service record made in your browser. The page says plainly that it is the owner's own record, not a dealer or shop history, and that nothing was checked against a receipt. A closed vehicle's record can still be printed after you sell the car. It does not value a car or check a history. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "car-maintenance-by-mileage-start-with-your-manual",
    title: "Car maintenance schedule by mileage: check your manual",
    dek: "Charts online are averages. How to pull the mileage and month intervals for your own car out of the manual and write them down once.",
    primaryQuery: "car maintenance schedule by mileage",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Search for a car maintenance schedule and you will find dozens of charts with confident numbers. They are averages, and yours is not an average car. The only source that matches your model is the one that came with it.",
          "This guide does not give intervals, because they differ by car and by how it is used. It shows you how to find yours.",
        ],
      },
      {
        kind: "timeline",
        heading: "How to use your manual",
        steps: [
          {
            when: "Find the maintenance section",
            what: "Look for a section called maintenance, service or schedule. If you do not have the paper copy, the manufacturer may have one online for your model and year.",
          },
          {
            when: "Note miles, months, or both",
            what: "For each job, write down whether it is by distance, by time, or by both, and the number.",
          },
          {
            when: "Look for the harder conditions",
            what: "Many manuals list different intervals for towing, mostly short trips, heavy dust or extreme heat or cold. If that is how you drive, note it.",
          },
          {
            when: "Write it down once",
            what: "Put the jobs and their intervals on one page. You should not have to open the manual every time.",
          },
        ],
      },
      {
        kind: "table",
        heading: "What to write for each job",
        columns: ["Job", "Miles", "Months"],
        rows: [
          ["From your manual", "A number, or blank", "A number, or blank"],
          ["From your manual", "A number, or blank", "A number, or blank"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Harder use changes the numbers",
        paragraphs: [
          "If you tow, drive short trips or live somewhere with dust, heat or cold, look at what your manual says for those conditions. A common approach is to shorten the interval. What is right for your car is what its manual says, and if it is unclear, a mechanic you trust can tell you.",
          "Once you have the intervals, the next step is knowing what is due. See [what is due on my car right now](/guides/what-is-due-on-my-car-right-now).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Vehicle Maintenance Companion, you can type jobs from your manual in a small table: the job, the miles and the months. You can also start from typical jobs, which are a generic starting point you can change, and not a factory schedule. A severe duty toggle halves the interval you entered for one job. It does not know your car's real schedule. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "winter-car-prep-checklist",
    title: "Winter car prep checklist: what to check before frost",
    dek: "Battery, tires, wipers, washer fluid, lights and an emergency kit: six checks before the first hard frost, and what to write down.",
    primaryQuery: "winter car prep checklist",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Cold weather finds the weak points in a car. A battery that starts fine in September may not in January. A tire that is fine in the dry may be a problem on ice. The best time to look is before you need it.",
          "This checklist is what to look at, not how to fix it. Follow your owner's manual for anything specific, and see a mechanic for anything you are not sure about.",
        ],
      },
      {
        kind: "list",
        heading: "Before the first frost",
        checkable: true,
        items: [
          "Battery: have it tested.",
          "Tires: check the tread and the pressure, and swap to winter tires if you use them.",
          "Wiper blades: check they clear the glass cleanly.",
          "Washer fluid: top it up.",
          "Lights: check they all work.",
          "Emergency kit: check it is in the car and complete.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Three things the cold is hard on",
        paragraphs: [
          "Batteries lose strength in the cold, tires lose pressure as the temperature drops, and wipers work harder in winter. They are a good place to start.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write down what you find",
        paragraphs: [
          "Note the date and what you checked, even if nothing needed doing. It becomes part of your record, and it tells you when you last looked. See [car maintenance log: what to write down](/guides/car-maintenance-log-what-to-write-down).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion has a starter list called Before winter: cold is hard on batteries, tires and wipers. It adds the jobs with a typical interval you can change and nothing recorded against them, so none of it reads as overdue. It is a starting point, not advice for your car. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "two-cars-one-household-maintenance",
    title: "How to keep track of maintenance on two cars",
    dek: "Which car needs the oil change? Keep a separate record for each car, label them by plate or name, and check both together once a month.",
    primaryQuery: "keep track of maintenance on two cars",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "One car is easy to keep track of. Two cars are where things go wrong. The oil change gets logged against the wrong one, a registration date belongs to a car that is not the one you thought, and nobody is sure which of them made the noise.",
          "The fix is to keep each car's record separate and to look at both together.",
        ],
      },
      {
        kind: "list",
        heading: "Three habits",
        checkable: true,
        items: [
          "One page per car, with its own name or plate at the top.",
          "Log each job against the car it was done to, on the day.",
          "Look at both together once a month, so you can see which one needs you.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Use the plate or a name",
        paragraphs: [
          "Give each car a label you will not mix up: a plate, or a name like the work van. It sounds trivial, and it is the difference between a record you trust and one you have to double check.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep the paperwork straight too",
        paragraphs: [
          "Insurance and registration are separate for each car. Note the dates for each one, and where each paper is. See [car paperwork dates: registration, insurance, inspection](/guides/car-paperwork-dates-organizer).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion holds as many cars as you own under one account. With two or more, a strip of plates shows which one needs you, with a lamp for each: a filled dot for something due, a ring for something close, an empty ring for clear. Tap a plate to filter Due to that car. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "glove-box-checklist-what-to-keep",
    title: "What to keep in your glove box (and what to leave home)",
    dek: "The papers and numbers worth having in the car, what is better kept at home, and how to put the essentials on one card with blank lines for a pen.",
    primaryQuery: "what to keep in your glove box",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A glove box tends to collect everything: old receipts, napkins, a manual for a car you no longer own. What you need in it is much shorter.",
        ],
      },
      {
        kind: "list",
        heading: "Worth having in the car",
        checkable: true,
        items: [
          "The registration paper or card, where your state expects you to carry it. Check with your state for what applies.",
          "Your insurance card or the policy details.",
          "A roadside help number you can call.",
          "The owner's manual.",
          "A note of your tire size and the oil type your car uses.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What is better kept at home",
        paragraphs: [
          "Anything you would not want a thief to find alongside your car. Spare keys, papers that show your home address, and the title are best kept elsewhere. Keep the details, not the originals. A card that lists your VIN and policy number carries those details too, so leave those lines blank if you would rather not keep them in the car.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "One card, not a folder",
        paragraphs: [
          "A single card with the plate, the VIN, the oil, the tire size, the insurer and a roadside number is easier to find than a folder of papers. Fill it in by hand or from a record you keep. See [car paperwork dates](/guides/car-paperwork-dates-organizer) for the dates worth keeping in view.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion prints a glove box card from the details you type: registration plate, VIN, oil, insurer, policy number, roadside number and the dates you are watching. Every line is typed by you and nothing is looked up or checked. Blank lines stay blank for a pen. It is made in your browser. A web app, $34 once.",
      },
    ],
  },

  {
    slug: "car-paperwork-dates-organizer",
    title: "How to track car registration and insurance renewals",
    dek: "Note the kind of paper, the date and where it is kept, then look six weeks ahead so a renewal does not sneak up. Check your state for its rules.",
    primaryQuery: "track car registration and insurance renewals",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Cars come with a handful of dates that matter: registration, insurance, an inspection, sometimes a warranty ending. They arrive by mail, get filed somewhere, and come round again a year later.",
          "What each of these requires depends on where you live. This guide is about keeping track of the dates, not about what your state asks. For that, the official source is the one to trust.",
        ],
      },
      {
        kind: "table",
        heading: "Three things to note for each",
        columns: ["What to note", "Why"],
        rows: [
          ["The kind of paper", "Registration, insurance, inspection, warranty or something else"],
          ["The date", "The day it runs out or comes up"],
          ["Where the paper is", "A drawer, a folder, a name, so you can find it on the day"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Note the date when you renew",
        paragraphs: [
          "The best moment to record the next date is the day you renew. The new paper is in your hand and the new date is printed on it. Write it down straight away.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Look six weeks ahead",
        paragraphs: [
          "Look at your dates once a month, and act on the ones within the next six weeks. Renewal can take time, and the day before is a poor time to find that something is missing.",
          "For what to keep in the car itself, see [what to keep in your glove box](/guides/glove-box-checklist-what-to-keep).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion records a registration, insurance, inspection, warranty or other date, and where the paper is. Nothing is uploaded and it never says what any place requires. A date shows on Due from 45 days out or once past. If you switch reminders on, which are off until you do, you also get one notice two weeks ahead and one on the day, on that device. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "first-car-checklist-for-new-drivers",
    title: "First car checklist: what to do in the first week",
    dek: "Find the manual, note the mileage, locate the papers, start a record and put the essentials in the glove box, all in your first week with the car.",
    primaryQuery: "first car checklist",
    publishedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A first car brings a lot of small questions at once. Most of them can wait. A handful are worth doing in the first week, and they make everything after easier.",
        ],
      },
      {
        kind: "list",
        heading: "In the first week",
        checkable: true,
        items: [
          "Find the owner's manual. It has the maintenance intervals for your car.",
          "Note the mileage today, and the date.",
          "Find the registration and insurance papers, and the title if the car came with one, and note where they are.",
          "Start a record: a page with date, miles and what was done.",
          "Put a card in the glove box with the essentials.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Do the small things first",
        paragraphs: [
          "None of this needs a garage. It is a notebook, a pen and an hour. The first entry in your record can be as simple as the date you got the car and its mileage that day.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Learn what is due",
        paragraphs: [
          "Your manual says how often each job comes round. Once you know, you can see what is coming up. See [car maintenance by mileage: start with your owner's manual](/guides/car-maintenance-by-mileage-start-with-your-manual) and [what is due on my car right now](/guides/what-is-due-on-my-car-right-now).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Start the record today",
        paragraphs: [
          "The best time to start a car's record is the day you get it. In a few years it will be the history you hand over to the next owner. See [selling your car with a service history](/guides/selling-your-car-with-a-service-history).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Vehicle Maintenance Companion lets you name the car, log a service with its date and mileage, and see what is due from intervals you enter. Reminders are optional and off until you switch them on: one device, at most once an hour, for a job that has reached its interval or a date that is close. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "what-goes-in-a-family-health-binder",
    title: "What to put in a family medical binder",
    dek: "Eight things worth writing down for each person, what to leave out, and why one page per person keeps the wrong allergy off the wrong form.",
    primaryQuery: "what to put in a family medical binder",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Many families keep their health information in their heads, a kitchen drawer and a few patient portals. It works until a form asks for something you have to look up, or a sitter needs to know something you have not written down.",
          "A family health binder is a single place that holds the answers forms keep asking for. It is a record of what you know, not medical advice, and it supplements the paperwork a clinic gives you. It does not replace it.",
        ],
      },
      {
        kind: "list",
        heading: "Eight things worth writing down",
        checkable: true,
        items: [
          "Who they are: name, and date of birth if forms ask for it.",
          "Allergies, and what happens.",
          "Medications: the name, the dose as given to you, and how often.",
          "Conditions, in your own words.",
          "Doctors and pharmacy, with phone numbers.",
          "Health insurance: the insurer, member ID and group number.",
          "Vaccines, typed in from their record, with dates.",
          "Who to call in an emergency.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "One page per person",
        paragraphs: [
          "Keep each person's facts on their own page. Adults and children are the same kind of record. Mixing two people on one page is how the wrong allergy ends up on the wrong form.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to leave out",
        paragraphs: [
          "Leave out anything you do not need to hand over: test results you do not understand, guesses about what something means, and anything you would not want a school or a sitter to read. A binder is a working record, not an archive of everything.",
          "For what to do with the pages once you have them, see [school and camp health forms](/guides/school-and-camp-health-forms-what-to-have-ready) and [what to leave off a health page you hand over](/guides/what-to-leave-off-a-health-page-you-hand-over).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder keeps what you type in for each person on one card: allergies, medications, conditions, doctors, insurance, vaccines and who to call. It prints five pages from that: a forms sheet, a caregiver sheet, an emergency card, a visit page and an intake summary. It records what you enter and never says what anyone should do. There are no reminders, no sharing and no AI. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "school-and-camp-health-forms-what-to-have-ready",
    title: "Camp and school health forms: what to have ready",
    dek: "Camp, school and sports forms ask for the same seven things every year. Get the answers on one page before the form arrives in the mail.",
    primaryQuery: "camp health form",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "School, camp and sports forms ask for much the same things every year. The questions barely change, but the answers are scattered across a phone, a portal and a drawer.",
          "What a school or camp requires differs, so ask them what they need and follow their instructions. This guide is about having the answers ready, not about what any place requires.",
        ],
      },
      {
        kind: "list",
        heading: "What to have ready",
        checkable: true,
        items: [
          "Date of birth.",
          "An emergency contact, with a phone number.",
          "Health insurance: the insurer, member ID and group number.",
          "Their doctor, with a phone number.",
          "Allergies, and what happens.",
          "Medications, with the dose and how often as given to you.",
          "Vaccines, typed in from their record. Ask the school or camp which ones it needs to see.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The order forms ask in",
        paragraphs: [
          "Many forms start with who the child is and who to call. Then insurance and doctors. Then health: allergies, medications, anything staff should know. Then vaccines or a signed statement. If your page follows the same order, filling in the form is copying from one to the other.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep it beside the form",
        paragraphs: [
          "Print your page and put it beside the form. It is quicker than searching, and it is less likely to leave something out. For what to leave off a page you hand over, see [what to leave off a health page you hand over](/guides/what-to-leave-off-a-health-page-you-hand-over).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder prints a Forms sheet for each person: the answers school, camp, sports and new-patient forms ask for, in the order they ask, on US Letter. It sits beside the form and does not fill it in. Vaccines are names and dates you type, and the list never says what is due. Records you mark private are left off every printed page. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "babysitter-and-grandparent-info-sheet",
    title: "Babysitter information sheet: what to put on it",
    dek: "A one-page sheet for a sitter or grandparent: allergies first, what is taken now, two people to call and bedtime notes. What to leave off, too.",
    primaryQuery: "babysitter information sheet",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Handing a child to a sitter or grandparent is easier when they have the same information you would. A single page, on the fridge or in their hand, is more useful than a long conversation at the door.",
        ],
      },
      {
        kind: "list",
        heading: "What to put on it",
        checkable: true,
        items: [
          "Allergies first, in a place that is easy to see, and what happens.",
          "What is taken now, with the dose and how often as given to you.",
          "Who to call: you, a second person and the child's doctor, with numbers.",
          "What to do in an emergency, in whatever form your household uses.",
          "Bedtime, comforts and fears: the small things that make an evening go well.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Bedtime, comforts, fears",
        paragraphs: [
          "The notes that matter most to a sitter are often not medical at all. When bedtime is, what settles them, what worries them. A few plain lines are worth more than a paragraph of instructions.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to leave off",
        paragraphs: [
          "A sitter does not need your insurance member ID or your child's full vaccine record. Leave off what they will not use. See [what to leave off a health page you hand over](/guides/what-to-leave-off-a-health-page-you-hand-over).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder prints a Caregiver sheet titled with the person's name, such as All about Amina: allergies in a large box, what is taken now, who to call, and your own notes on routines and comforts. The notes print on that sheet and nowhere else. It says in an emergency to call 911. It does not send the page to anyone. You print it and hand it over. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "doctor-appointment-prep-checklist",
    title: "Doctor appointment checklist for the day before",
    dek: "Write your questions, list what is taken now, note symptoms with dates and leave room for notes. A short paperwork list for a doctor visit.",
    primaryQuery: "doctor appointment checklist",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Most appointments are short, and most of us forget half of what we meant to say. A few minutes of preparation the day before makes the visit more useful. This is a checklist for what to gather, not medical advice.",
        ],
      },
      {
        kind: "list",
        heading: "The day before",
        checkable: true,
        items: [
          "Write your questions down, one per line.",
          "List what is taken now, with the dose and how often as given to you.",
          "Note any symptoms, and when they started.",
          "Bring your insurance card.",
          "Leave room on the page for notes from the visit.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write down the question, not the answer",
        paragraphs: [
          "The doctor's job is to answer. Yours is to bring the question. \"Can she swim this week?\" is a question. \"I think it is nothing\" is a guess, and it will not help the doctor. Write what you want to know.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write down what was said",
        paragraphs: [
          "After the visit, note what was said or decided while it is fresh. It is easy to lose by the time you reach the car. For the questions page itself, see [questions to bring to the doctor, on one page](/guides/questions-to-bring-to-the-doctor).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Family Health Binder, you can plan a visit and write your questions, one per line, then add what was said afterwards. The Visit page prints your questions with tick boxes, what is taken now, recent symptom notes and room for notes from the visit. Insurance is on the Forms sheet, not here. It is a record only: it does not remind, schedule or book anything. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "questions-to-bring-to-the-doctor",
    title: "Questions to ask the doctor: how to write them down",
    dek: "One question per line, the important one first, and space for each answer. A one-page method for a short appointment, with room to tick them off.",
    primaryQuery: "how to write questions for the doctor",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The best time to think of a question is rarely when the doctor is in front of you. Write it down when it occurs to you, and bring the page.",
          "This guide is about how to write questions, not what to ask. What matters to your family is for you and your doctor to decide.",
        ],
      },
      {
        kind: "list",
        heading: "How to write a good question",
        checkable: true,
        items: [
          "One question per line, so you can tick them off.",
          "Be specific. \"Can she swim this week?\" is easier to answer than \"Is swimming okay?\"",
          "Put the most important one first.",
          "Leave a space beside each for the answer.",
          "Keep the list short enough to get through in the time you have.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Tick them off in the room",
        paragraphs: [
          "Bring the page and tick each question as it is answered. Anything not ticked when you are about to leave is what to ask before you go. It is a small habit, and it works.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write the answers down",
        paragraphs: [
          "A short note beside each question makes the page a record. See [doctor appointment prep checklist](/guides/doctor-appointment-prep-checklist) for what else to bring.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder has a Questions to ask field on each planned visit, one question per line, and prints them on the Visit page with tick boxes. It does not suggest questions or answer them. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "medication-list-what-to-write-down",
    title: "How to keep a family medication list",
    dek: "Name, dose and how often, copied exactly as the label says, plus the date the list was last right. Always follow your prescriber or pharmacist.",
    primaryQuery: "how to keep a medication list",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A medication list is one of the most useful pages a family can carry. New doctors, urgent care, schools and sitters all ask what is taken now. Having it written down is quicker and more reliable than remembering.",
          "This guide is about how to keep the list, not about any medication. It cannot tell you what to take, how much or when. For that, ask the prescriber or pharmacist and follow what they say.",
        ],
      },
      {
        kind: "table",
        heading: "The three columns",
        columns: ["Column", "What goes in it"],
        rows: [
          ["Name", "The name on the label"],
          ["Dose", "As given to you by the prescriber or on the label"],
          ["How often", "As given to you, in the same words"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write what you are given",
        paragraphs: [
          "Copy the dose and the frequency exactly as they appear on the label or in what the prescriber told you. Do not convert or round them. A list that copies the source is safer than one that paraphrases it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Note when it was last right",
        paragraphs: [
          "A list goes out of date quietly. Note the date you last checked that it was right. It tells whoever reads it how much to trust it. When something is stopped, mark it as stopped and leave it off the page you hand over.",
          "For what to bring to a visit, see [doctor appointment prep checklist](/guides/doctor-appointment-prep-checklist).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Family Health Binder, each medication has a name, a dose and how often, all typed by you and never checked. A button says the list is right today and keeps the date. A stopped medication stays in the app and leaves every printed page. It does not check doses or interactions, and it sends no reminders. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "symptom-notes-for-a-doctor-visit",
    title: "Symptom log for a doctor visit: what to write down",
    dek: "Four notes help a doctor most: when it started, how long it lasted, how bad it was and what helped. A notes page, not a symptom checker.",
    primaryQuery: "symptom log for doctor visit",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Doctors tend to ask the same questions about a symptom, and the answers are hard to give from memory. A few notes written as it happens make the visit more useful.",
          "This guide is about taking notes, not about what any symptom means. It cannot tell you whether something is serious. If you are worried, contact your doctor, and in an emergency, call 911.",
        ],
      },
      {
        kind: "list",
        heading: "Four short notes",
        checkable: true,
        items: [
          "When it started: the date, as best you know it.",
          "How long it lasted: hours, days or weeks.",
          "How bad it was: mild, moderate or severe, in your own view.",
          "What helped, in your own words.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Write it when it happens",
        paragraphs: [
          "The date is the part people lose first. A note written on the day is more accurate than a memory a week later. It only takes a line.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Notes, not answers",
        paragraphs: [
          "Write what you saw, not what you think it is. \"Started Tuesday, lasted three days, mild\" helps a doctor. \"Probably a cold\" does not. Let them decide what it means. For what else to bring, see [doctor appointment prep checklist](/guides/doctor-appointment-prep-checklist).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder lets you record a symptom with what it is, when it started, how long, how bad and what helped. It shows them as a dated list, newest first. It has no chart, no trend and no advice, and it does not tell you what a symptom means. Recent notes print on the visit page and the intake summary. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "emergency-contact-information-sheet",
    title: "Emergency contact information sheet: what to include",
    dek: "A one-page sheet with names, numbers and the few facts someone would need. What to write, and why a printed sheet is not a substitute for a medical ID.",
    primaryQuery: "emergency contact information sheet",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "An emergency information sheet is a page that tells someone who to call and what they should know. It is useful in a bag, on the fridge or in a sitter's hand. It is not medical advice, and it is not a medical ID.",
        ],
      },
      {
        kind: "list",
        heading: "What to include",
        checkable: true,
        items: [
          "The person's name and age.",
          "Allergies, in a place that is easy to see.",
          "Who to call, with a phone number.",
          "Their doctor, with a phone number.",
          "Health insurance, if you want it on the page.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A card is not a medical ID",
        paragraphs: [
          "A printed card is a note of what you typed in. It reflects only what you wrote, and it can be out of date. A medical ID is a different thing, and a card does not replace it. If a medical ID matters for your situation, ask your doctor.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep it where you can find it",
        paragraphs: [
          "A sheet nobody can find helps nobody. Decide where it lives: the fridge, a bag, a glove box. Tell whoever might need it where it is. For what to put on a sheet for a sitter, see [what to put on a babysitter or grandparent info sheet](/guides/babysitter-and-grandparent-info-sheet).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder prints an Emergency card: name, age, allergies, who to call, a doctor and insurance, on a small card you cut out of a US Letter page. It reflects only what was typed in, is not medical advice, and says it does not replace a medical ID. It is a printed paper card, not a wallet card, and it is not accessible from a locked phone. It is a web app, $34 once.",
      },
    ],
  },

  {
    slug: "new-doctor-intake-what-to-bring",
    title: "What to bring to a new doctor appointment",
    dek: "Allergies, medicines, conditions, family history and recent symptoms on one page, so a first visit starts from facts instead of memory.",
    primaryQuery: "what to bring to a new doctor appointment",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "The first visit with a new doctor often begins with a clipboard. The questions are ordinary, and answering them from memory is where mistakes creep in. A one-page summary you prepared earlier is quicker and more accurate.",
          "It supplements the paperwork the clinic gives you. It does not replace it, and it is not medical advice.",
        ],
      },
      {
        kind: "list",
        heading: "What to bring",
        checkable: true,
        items: [
          "Allergies, and what happens.",
          "Medications, with the dose and how often as given to you.",
          "Conditions, in your own words.",
          "Family history, as far as you know it.",
          "Recent symptoms, with dates.",
          "Your insurance information and a photo ID, if the clinic asks.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Several doctors, one page",
        paragraphs: [
          "When several doctors are involved, one page listing who they are and what each of them knows saves repeating it. Note the name, a phone number and a line on why you see them.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Start with the facts",
        paragraphs: [
          "Handing over a page can change how a first visit begins. Many clinics start from what you have written, and you can spend the time on questions. See [doctor appointment prep checklist](/guides/doctor-appointment-prep-checklist).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder prints an Intake summary for a new doctor: allergies, medications, conditions, family history and recent symptoms on one page. Doctors, specialists, dentists and pharmacies are kept too, but they print on the Forms sheet, not on this summary. It supplements clinic paperwork and does not replace it. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "what-to-leave-off-a-health-page-you-hand-over",
    title: "What health information to share with a sitter or school",
    dek: "A sitter, a camp and a new doctor each need different facts. Three questions to ask before you print, and what to keep on your own page.",
    primaryQuery: "what health information to share with a school",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Not everyone who needs some of your family's health information needs all of it. A sitter needs one set of facts, a camp another, a new doctor a third. Handing over everything is easy and rarely a good idea.",
          "This guide is about choosing what goes on a page you print. It is not legal advice, and what a school, camp or clinic asks for is theirs to say.",
        ],
      },
      {
        kind: "table",
        heading: "Who needs what",
        columns: ["Who", "What they usually need"],
        rows: [
          ["A sitter or grandparent", "Allergies, what is taken now, who to call, routines"],
          ["A school or camp", "What the form asks: who to call, insurance, allergies, medications"],
          ["A new doctor", "Allergies, medications, conditions, family history, recent symptoms"],
        ],
      },
      {
        kind: "list",
        heading: "Questions to ask before you print",
        checkable: true,
        items: [
          "Does this person need this fact to do what I am asking of them?",
          "Would I be comfortable if this page were left on a counter?",
          "Is it current, or has something changed since I last checked?",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keep a page for yourself",
        paragraphs: [
          "Keep the full record in one place for yourself, and make each page a selection from it. That way the fullest version is never the one that travels. See [what goes in a family health binder](/guides/what-goes-in-a-family-health-binder).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "In Family Health Binder, any allergy, medication, symptom, vaccine or visit can be marked Keep this private. It stays in the app and is left off every printed page, and each printed page says how many records it left off. That is a print filter, not a lock: you can still see the record in the app. Emergency contact, insurance, providers and caregiver notes have no private setting. It is a web app, $34 once, and it is not medical advice.",
      },
    ],
  },

  {
    slug: "caring-for-a-parent-and-kids-one-place",
    title: "Caregiver binder for a parent and kids: one page each",
    dek: "Looking after a parent and children means two sets of forms and medicines. Same headings, one page per person, printed one at a time.",
    primaryQuery: "caregiver binder for parent and kids",
    publishedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Looking after a parent and children at the same time means keeping track of two sets of appointments, two sets of medications and two sets of forms. The information ends up in different places, and you are the one who remembers where.",
          "This guide is about organizing, not about anyone's care. It is not medical advice.",
        ],
      },
      {
        kind: "list",
        heading: "A simple rule",
        checkable: true,
        items: [
          "One page per person, with their name at the top.",
          "The same headings on every page: allergies, medications, doctors, insurance, who to call.",
          "One place to keep them all.",
          "Print one person at a time, never several on one page.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Adults and children are the same kind of page",
        paragraphs: [
          "The headings are the same for a child and a parent. Keeping them the same means you always know where to look. It also means a form for either one is quick to fill in.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Note when you last checked",
        paragraphs: [
          "A parent's medication list may change more often than a child's. Note when you last checked each one. See [medication list: what to write down](/guides/medication-list-what-to-write-down), and for what to hand to whom, see [what to leave off a health page you hand over](/guides/what-to-leave-off-a-health-page-you-hand-over).",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder gives every person, child, parent, partner or you, their own card under your account, with the same sections for each. You can print a forms sheet, caregiver sheet, emergency card, visit page and intake summary for one person at a time. It has no separate accounts for children, and no way to share a binder with another person. It is a web app, $34 once, and it is not medical advice.",
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
  return Math.max(1, Math.round(guideWordCount(guide) / WORDS_PER_MINUTE));
}

/** Words in the body, headings and lists included: what reading time and the Article schema both count. */
export function guideWordCount(guide: Guide): number {
  return guide.body
    .flatMap(blockStrings)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
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
 *
 * Ranked by distance from this guide's own position in the area, not by
 * the area's publication order: a flat `slice(0, limit)` always returned
 * the same opening guides regardless of which one you were reading, which
 * meant every guide past the fourth in an area showed the identical three
 * "related" links, and the first guide in an area showed the same guide
 * here and in "next" (adjacentGuides). Immediate neighbours are pushed to
 * the back of the ranking, since adjacentGuides already surfaces those as
 * previous/next, but they still fill in when an area is too small for
 * `limit` genuinely distinct picks.
 */
export function relatedGuides(guide: Guide, limit = 3): Guide[] {
  if (!guide.areaSlug) return [];
  const siblings = guidesForArea(guide.areaSlug);
  const index = siblings.findIndex((candidate) => candidate.slug === guide.slug);
  if (index === -1) return [];

  return siblings
    .map((candidate, i) => ({ candidate, distance: Math.abs(i - index) }))
    .filter(({ distance }) => distance !== 0)
    .sort((a, b) => {
      const aAdjacent = a.distance === 1;
      const bAdjacent = b.distance === 1;
      if (aAdjacent !== bAdjacent) return aAdjacent ? 1 : -1;
      return a.distance - b.distance;
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
