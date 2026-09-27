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
  | { kind: "callout"; label: string; body: string }
  | {
      kind: "faq";
      /** The section heading. Defaults to "Questions people ask" where rendered. */
      heading?: string;
      /**
       * Three to six real questions in the words people use, each answered
       * in 30 to 90 words. The question is a heading and the answer sits
       * directly under it, visible: that shape is what wins People Also Ask
       * and paragraph snippets, and it is why this is a block and not a
       * list. Answers take the same inline links as a paragraph.
       */
      items: { q: string; a: string }[];
    }
  | {
      kind: "figure";
      /** A path under /guides/img/. The export script in the pins folder writes these. */
      src: string;
      /**
       * What the image shows, in one plain sentence, not "screenshot of".
       * It is the only description a screen reader and an image search
       * get, so it has to stand on its own.
       */
      alt: string;
      /** Visible caption. A product screen is captioned as a sample. */
      caption?: string;
      /** The file's real pixel size: reserved so the page does not jump when it loads. */
      width: number;
      height: number;
      /** aside floats beside the text on a wide screen; inline sits in the column. */
      layout?: "inline" | "aside";
      /** What kind of picture, so tests can hold "screens only in the handover, always a sample". */
      source: "card" | "printable" | "product-screen" | "diagram";
    };

/** A named primary source behind a rule, a number or a deadline the guide states. */
export type GuideSource = {
  name: string;
  url: string;
  /** The day it was checked, YYYY-MM-DD: a source is only as good as when somebody last looked. */
  retrieved: string;
  /** What in the guide this backs, when it is not obvious. */
  note?: string;
};

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
  /**
   * Primary sources for any rule, deadline, threshold, cost or medical
   * fact the guide states. Shown at the foot of the article with the date
   * each was checked. A guide that states none of those needs none.
   */
  sources?: GuideSource[];
  /**
   * Hand-picked related guides, best first, each with the reason a reader
   * would click. Written by a person because the reason is what makes an
   * internal link convincing. Same area only; the rest come from
   * relatedGuides' word-overlap ranking.
   */
  related?: { slug: string; reason: string }[];
  /** The single "do this next" guide, with why. Shown first in the next-step block. */
  next?: { slug: string; reason: string };
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
    next: { slug: "who-to-tell-when-someone-dies", reason: "Once the first days are handled, this gives the full order of who to notify and how to keep track as you go." },
    related: [
      { slug: "what-to-do-when-a-parent-dies-uk", reason: "If the death happened in England, Wales, Scotland or Northern Ireland, this is the UK version with registration and Tell Us Once." },
      { slug: "how-to-find-someones-accounts-after-they-die", reason: "When nothing was written down, this is the search order for finding bank accounts, pensions and policies." },
      { slug: "where-to-look-for-a-will", reason: "To find out whether a will exists and where it is kept, this covers the usual places and the order to check them." },
    ],
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
    next: { slug: "named-executor-what-you-agreed-to-uk", reason: "If you have been named executor, this explains what the role involves, how long probate takes and how to step aside." },
    related: [
      { slug: "what-to-do-when-a-parent-dies", reason: "Dealing with a death in the United States? This twin covers death certificates and the steps that apply there." },
      { slug: "who-to-tell-when-someone-dies", reason: "For a tracked list of who needs to hear and in what order, this notification guide is written to be worked through." },
      { slug: "how-to-find-someones-accounts-after-they-die", reason: "If accounts, pensions or policies are missing from the paperwork, this sets out where to search and in what order." },
    ],
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
    next: { slug: "digital-accounts-after-a-death", reason: "Once the money is traced, this covers photos, email and subscriptions, and what providers will and will not release." },
    related: [
      { slug: "who-to-tell-when-someone-dies", reason: "When you find an account, this tells you who else to notify next and in what order." },
      { slug: "where-to-look-for-a-will", reason: "A will often lists the assets you are searching for, so this shows where to look for one." },
      { slug: "what-to-do-when-a-parent-dies", reason: "For everything else in the first two weeks around the search, this gives the whole order of tasks." },
    ],
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
    next: { slug: "homeschool-notice-of-intent-explained", reason: "Once you know your level, this explains what a notice of intent is and how to find the form your state wants." },
    related: [
      { slug: "do-you-have-to-count-homeschool-days-or-hours", reason: "Some states count days or hours and many do not. This shows how to check which yours does." },
      { slug: "homeschool-attendance-what-to-track", reason: "If your state wants attendance, this covers what counts as a school day and the lightest way to record it." },
      { slug: "how-to-start-homeschooling-first-month-paperwork", reason: "Starting from scratch? Follow the order for the first month: what to file, what to record, what can wait." },
    ],
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
    next: { slug: "how-often-home-systems-need-servicing", reason: "Once you know which eight jobs matter most, this gives the service interval for every system in the house." },
    related: [
      { slug: "home-maintenance-checklist-by-month", reason: "To place those jobs on the calendar, this sorts them by the season each one belongs to." },
      { slug: "how-often-change-furnace-filter", reason: "The filter is the cheapest job on your list, and this says how often to change it and what size to buy." },
      { slug: "fall-home-maintenance-checklist", reason: "Gutters and heating come first in fall, and this puts them in order across September to November." },
    ],
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
    next: { slug: "hotel-cannot-find-your-reservation", reason: "Once you know which bookings hang off the flight, this covers what to do when the hotel desk has no record of yours." },
    related: [
      { slug: "flight-delayed-with-a-connection-what-to-do-first", reason: "If the change is a delay with a connection to catch, this covers the first twenty minutes and what to say at the desk." },
      { slug: "how-to-write-a-one-page-trip-itinerary", reason: "A short itinerary with a reference beside each booking makes it quick to see what a new departure time knocks over." },
      { slug: "organising-a-multi-stop-trip-without-a-spreadsheet", reason: "With many stops, every booking rests on another, so this shows how to record what depends on what." },
    ],
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
    next: { slug: "flight-changed-what-else-is-affected", reason: "After the delay, this walks through the transfer, hotel check-in and dinner booking that were built on the flight." },
    related: [
      { slug: "hotel-cannot-find-your-reservation", reason: "If the delay means arriving late, this covers what to say when the hotel has given the room away or lost the booking." },
      { slug: "lost-passport-wallet-or-phone-abroad-what-to-have-ready", reason: "Bags, cards or a passport went missing in the scramble? This lists what to gather and who to tell first." },
      { slug: "what-to-keep-on-paper-when-you-travel", reason: "A dead phone in the queue is the real risk, so keep references on paper as this one-page list shows." },
    ],
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
    next: { slug: "scripts-for-the-admin-calls-everyone-dreads", reason: "Once you can dial, this has opening lines for billing problems, chasing, canceling and complaints, plus what to get before you hang up." },
    related: [
      { slug: "how-to-say-no-or-give-bad-news-on-the-phone", reason: "If the hard part of the call is what you have to say, not dialing, this covers refusals and bad news." },
      { slug: "time-blindness-planning", reason: "Later today is not a time. Pick one exact time for the call and add a buffer, so it stops sliding." },
      { slug: "task-paralysis-what-to-do-in-the-next-ten-minutes", reason: "When even picking up the phone will not start, this ten minute way out shrinks the first step until it needs no motivation." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Write five things on paper before you dial: what the call is about, the result you want, your reference number, two facts, and your first sentence word for word. Then dial, read the first sentence, and follow the short list below. Before you hang up, ask for a reference number and a name.",
          "This is for the call you've had on your list for days or weeks: a billing problem, a booking, a cancellation, a chase. It can't tell you why calls are hard for you in particular, and if dread of the phone is getting in the way of work or health, a clinician is the right person to ask. This is admin help, not medical advice.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why a call stalls when the task is small",
        paragraphs: [
          "You have the number. You've had it for three weeks. Nothing stops you from dialing except that a call asks you to do several things at the same moment: remember why you're calling, listen to someone you can't see, keep your main point in mind, answer their questions, write down the reference, and sound like a person who does this every day. There is no warm-up, and you can't pause it or read it back.",
          "Many people describe this as too many things held at once, not a lack of caring, which may be why telling yourself to just get it over with hasn't worked. No one has proven a cure for the stall. What coaches and clinicians often suggest, and what is worth trying, is to take every one of those jobs out of your head except the talking. That is what the five things are for.",
        ],
      },
      {
        kind: "table",
        heading: "Example: the five things, filled in",
        intro: "An illustration, not a real account. Say a phone company charged you $45 twice on the same day and you want one of them back.",
        columns: ["The thing", "What's on the page"],
        rows: [
          ["What it's about", "The double charge on my phone bill."],
          ["The result I want", "The second $45 charge refunded to my card."],
          ["Reference", "Account ending 4471. Statement dated the 3rd."],
          [
            "Two facts",
            "Both charges posted on the 3rd. I called once before, on the 9th, and spoke to someone named Dana.",
          ],
          [
            "First sentence",
            "Hi, I've been charged twice for the same thing on my bill and I'd like to get it put right. Can I explain what happened?",
          ],
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "How to write each of the five",
        intro: "Paper is best, because you can't lose it behind another window. A note on your phone works if it's the only thing open.",
        items: [
          "What it's about, in one line. Write it the way you'd say it to a friend: \"the double charge on my phone bill.\" If it takes two lines, it's really two calls. Pick the one that comes first and put the other on a separate page.",
          "The result you want, in one line. Decide it now, because it's the thing that slips away halfway through explaining how you got here. A refund, a new date, a cancellation confirmed in writing. If the call wanders, this line is where you come back to.",
          "The reference. Account number, order number, booking code, or the name and address the account is under. Put it where you can read it, not where you could find it. Hunting through an app while a stranger waits is the moment many calls come apart.",
          "Two facts. A date and an amount, or a name and a date. Two, not ten. Anything more lives on the statement or email you've put next to the page.",
          "The first sentence, word for word. A full sentence, written out. Leaving it as \"I'll work out how to begin\" is how the number stays in your phone another week.",
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Set up the room",
        intro: "Two minutes, and only the ones that apply to you.",
        items: [
          "The five things are on one page, in front of you.",
          "A pen, and space on the page to write the reference they give you.",
          "You've checked when the line is open, and picked one exact time inside those hours.",
          "You're somewhere you can talk without being overheard, if the call is personal.",
          "Speakerphone or earbuds are ready, if having both hands free helps you write.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Pick the time now",
        paragraphs: [
          "Later today isn't a time. Choose one exact time, add ten minutes of buffer before it, and treat the buffer as the moment you read your page once. If you'd rather call right now while everything is fresh, that's the other good answer. The one that doesn't work is leaving it open. [Planning when you cannot feel time pass](/guides/time-blindness-planning) has more on naming a time so it stops sliding.",
        ],
      },
      {
        kind: "scripts",
        heading: "The first sentence, by kind of call",
        intro: "Take the closest one and change any of it. Yours can be shorter or clumsier. It only has to get you through the first fifteen seconds, and you can read it. Say it out loud once before you dial.",
        items: [
          {
            situation: "A problem with an order",
            line: "Hi, I have a problem with my account and I'm hoping you can help me sort it out. Can I explain what happened?",
          },
          {
            situation: "You were charged wrongly",
            line: "Hi, I've been charged twice for the same thing and I'd like to get it put right. Can you look at the account for me?",
          },
          {
            situation: "Booking an appointment",
            line: "Hi, I'd like to book an appointment. Are you the right person for that?",
          },
          {
            situation: "Canceling",
            line: "Hi, I'd like to cancel. Can you tell me what you need from me to do that?",
          },
          {
            situation: "Chasing a request",
            line: "Hi, I contacted you about this on the 9th and I'm calling to find out where it stands. Can you look it up for me?",
          },
          {
            situation: "Making a complaint",
            line: "Hi, I'd like to make a complaint. Can you tell me how that works here, and who I need to speak to?",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "If the call is a harder one, like telling someone no or giving bad news, the opening lines are different. That's covered in [how to say no or give bad news on the phone](/guides/how-to-say-no-or-give-bad-news-on-the-phone), and there are more openings for billing, chasing and canceling in [scripts for the admin calls everyone dreads](/guides/scripts-for-the-admin-calls-everyone-dreads).",
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "During the call",
        intro: "Short on purpose. Anything longer is unreadable while someone is talking to you.",
        items: [
          "Read your first sentence. Then say the result you want, in your own words or straight off the page.",
          "Answer their questions from the page. If they ask for something you don't have, say so and ask what else would do.",
          "Write down what they tell you as they say it: names, dates, anything they promise.",
          "Ask what happens next, and by when.",
          "Before you hang up, ask for a reference number for this call and the name of the person you spoke to.",
        ],
      },
      {
        kind: "scripts",
        heading: "Lines to have ready mid-call",
        intro: "Put these at the bottom of the page. You're allowed to use every one of them.",
        items: [
          {
            situation: "You need a moment",
            line: "Can you give me a moment? I want to find that so I give you the right answer.",
          },
          {
            situation: "You lost your place",
            line: "Sorry, let me check my notes. I'm calling about the double charge on my bill.",
          },
          {
            situation: "They talked fast",
            line: "Could you say that again, more slowly? I'm writing it down.",
          },
          {
            situation: "They want to transfer you",
            line: "Before you transfer me, can I have your name and a reference for this call, in case we get cut off?",
          },
          {
            situation: "Wrapping up",
            line: "So to confirm, you're going to refund the second charge and I should see it within five business days. Can I have a reference number for this call?",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you get voicemail or a hold queue",
        paragraphs: [
          "A voicemail is a smaller version of the same call, and you can rehearse it on the page. Leave your name, one line about why you're calling, your number said slowly, then said again, and a time you'll be free. Then write down that you left it and when. That counts as making the call, and it gives them the next move.",
          "On hold, keep the page in front of you and put the phone on speaker. Decide before you dial how long you'll wait. Twenty minutes is a fair limit if you have nothing else in the day. When it's up, hang up, write the time you called, and pick your next time. If they offer a callback, take it. Some menus route you to a person if you press 0 or say \"representative\". It's worth a try, and it doesn't always work.",
        ],
      },
      {
        kind: "scripts",
        items: [
          {
            situation: "Leaving a voicemail",
            line: "Hi, this is Sam Rivera, calling about a double charge on my phone bill. My number is 555 0142, again, 555 0142. I'm free between two and four today. Thank you.",
          },
          {
            situation: "A menu with no right option",
            line: "Representative. (Or press 0.)",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "If it goes badly",
        paragraphs: [
          "You might freeze, lose the thread, get someone unhelpful, or feel your voice go. None of that ruins the call. What you need out of it is still the same: a name, a reference, and what happens next. If you get those, you can stop, and the next call starts from where this one ended.",
          "If you're being pushed to agree to something, you don't have to answer on the spot. You're allowed to ask for a minute. You're allowed to say you'll call back.",
        ],
      },
      {
        kind: "scripts",
        items: [
          {
            situation: "You froze",
            line: "Sorry, I lost my place. Can I have a second?",
          },
          {
            situation: "You're upset or shaky",
            line: "Give me a moment, I'm finding this stressful. I'll be right with you.",
          },
          {
            situation: "They say they can't help",
            line: "Is there someone who can? Can I have their name, or the name of the department?",
          },
          {
            situation: "They press you to agree",
            line: "I'd like to think about that. Can you send it to me in writing, and I'll call back?",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "When you hang up, write four lines under your five things while it's fresh: the date and time, who you spoke to, the reference, and what they said would happen by when. That page is the first sentence of your next call, and it is the reason a call that didn't resolve wasn't wasted. Then decide whether you're done, waiting, or need to call again, and put an exact time on it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If you can't get yourself to dial",
        paragraphs: [
          "Writing the five things is already the hardest step for many people, so if that's all you did today, keep the page. It will still be there tomorrow, and starting again from nothing is what makes the second attempt feel heavier than the first. If even the page won't start, [what to do in the next ten minutes](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes) shrinks the first move until it needs no push, and [the first physical step, with examples](/guides/first-physical-step-20-examples) shows what that looks like for calls.",
        ],
      },
      {
        kind: "timeline",
        heading: "A ladder, if the real call is too big",
        intro: "Coaches often suggest working up from easier calls. It's worth trying, not proven, and you can skip any rung.",
        steps: [
          {
            when: "Rung 1: the page",
            what: "Write the five things. Stop there if you need to.",
          },
          {
            when: "Rung 2: no one to answer",
            what: "Call after hours and leave the voicemail, or listen to the recorded greeting.",
          },
          {
            when: "Rung 3: an easy call",
            what: "Ask something with no stakes, like opening hours or whether they can help with your kind of problem.",
          },
          {
            when: "Rung 4: the call",
            what: "Dial with the page in front of you and read the first sentence.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "When a phone call isn't the only route",
        paragraphs: [
          "Check whether the company takes the same request by email, online chat or a form. For a billing problem or a cancellation, writing also leaves you a record. If you'd rather write, [the email you keep not sending](/guides/the-email-you-keep-not-sending-and-how-to-chase-a-reply) works the same way, with your first line written out. Some things do need a voice, like proving who you are, or something urgent, and it's fine to do those with someone sitting in the room while you dial. They don't have to do anything.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When preparing turns into stalling",
        paragraphs: [
          "It happens. The page gets tidier and the phone stays where it is. Give yourself ten minutes to write the five things, and if you find yourself rewriting the first sentence a fourth time, dial. A slightly clumsy opening that you actually say beats a perfect one you never do. If the number has been on your mind for months and the guilt is the heavy part, [how to deal with something you have put off](/guides/how-to-deal-with-something-you-have-put-off) starts from there.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Why is it so hard to make a phone call?",
            a: "A call has no warm-up. You have to remember why you're calling, listen live, answer questions and hold your main point in mind, all at once, and you can't pause or reread. Plenty of people find that heavier than the same task by email. Some link it to ADHD or anxiety, but only a clinician can say whether that applies to you.",
          },
          {
            q: "How do I start a phone call when I'm nervous?",
            a: "Write the first sentence out and read it. If they ask for your name, give it, and then say the sentence as written. It's fine to say you're a bit nervous or that you need a second. The first fifteen seconds are the part you can prepare completely, and the conversation usually carries itself after that.",
          },
          {
            q: "What do I say if I get voicemail?",
            a: "Say your name, one line about why you're calling, your phone number slowly, then the number again, and a time you'll be free. Keep it under twenty seconds. Then write down that you left the message and when. If you haven't heard back in a few days, that note tells you it's time to call again.",
          },
          {
            q: "How long should I wait on hold?",
            a: "There's no rule. Decide before you dial, based on your day. Twenty minutes is a fair limit if you have nothing else scheduled. When it's up, hang up, write down when you called, and pick your next exact time. If they offer a callback, take it and keep your phone free.",
          },
          {
            q: "Can someone else make the call for me?",
            a: "Sometimes. Many companies will only talk to the account holder, or will talk to someone else only after you've given permission. That usually means you're on the line briefly to say so. Ask the company what it requires. A friend sitting beside you while you make the call is always an option.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "The Make a phone call walkthrough in [ADHD Life Companion](/shop/alongside) asks these questions one at a time: what the call is about, who you're calling, what a good result looks like, what's worth having in front of you, and anything you must not forget to say. It then offers an opening line to use, or you can write your own, and asks whether to call now or name one exact time today. During the call it shows your own words back to you. If you close it halfway, it reopens at the question you left. It doesn't ask for account numbers or amounts, and it isn't a diagnosis or a treatment. It's the five things on a screen, in order.",
        ],
      },
    ],
  },

  {
    slug: "how-to-restart-a-project-you-gave-up-on",
    title: "How to restart a project you gave up on",
    dek: "Coming back costs more than starting did, mostly the rebuilding of where you got to. What to write down, and how to resume without re-reading everything.",
    primaryQuery: "restart a project you gave up on",
    next: { slug: "why-you-abandon-planners-and-how-to-come-back", reason: "If the project stalled because the system around it broke, this shows what usually fails and how to keep one page of it." },
    related: [
      { slug: "a-weekly-reset-that-survives-a-bad-week", reason: "A ten minute weekly check-in is a light way to keep a restarted project moving, even after a bad week." },
      { slug: "first-physical-step-20-examples", reason: "Twenty examples of a first step you could see happen, useful for the small move that gets a stopped project going again." },
      { slug: "how-to-deal-with-something-you-have-put-off", reason: "If the shame of the gap is what keeps you away, this gives three lines to name the delay and get to the practical question." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Don't start over. Find the last thing you finished, write one line saying where you got to, name the smallest piece that comes next, and do only that piece. Re-reading everything first feels responsible and mostly delays you.",
          "This is for the half-finished form, claim, application or clear-out, the admin kind of project. It can't tell you whether the thing deserves finishing, but step three below helps you decide that quickly.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the second start is harder than the first",
        paragraphs: [
          "On day one you had a task. Six weeks later you have the task, plus the job of working out what you already did, plus a feeling about having stopped. You may spend twenty minutes finding out whether you sent the email, which pages are filled in, and where the reference number went. That job is dull, and a part of you knows it's waiting, which can be enough to keep the folder shut.",
          "So the aim of a restart is small: get the reconstruction down to one written line and one next piece. Nothing more ambitious than that.",
        ],
      },
      {
        kind: "table",
        heading: "Example: a restart note, filled in",
        intro: "An illustration, not a real case. Say you started a warranty claim on a dishwasher six weeks ago and stopped.",
        columns: ["Question", "What the note says"],
        rows: [
          [
            "Where did I get to?",
            "Form filled in to page 2. Receipt photographed but not attached.",
          ],
          [
            "Was anything missing?",
            "The serial number. It's on a sticker inside the door.",
          ],
          [
            "Smallest next piece",
            "Open the door and photograph the serial number sticker.",
          ],
          ["Still needed?", "Yes. The claim window closes on the 30th."],
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "How to restart, in order",
        intro: "Twenty minutes is plenty for the first sitting. You can stop earlier.",
        items: [
          "Put out what you already have. The form, the emails, the receipt, whatever you did last time, all where you can see it. Don't read it yet.",
          "Write where you got to, in one line. Where you stopped inside the task, not what the task is. If you can't tell, look for the newest thing you produced: the last email sent, the last page filled in.",
          "Check whether it still needs doing. Ask three questions: is anyone waiting on it, does it have a date that has passed or is coming, and would you be glad to have it done? If all three are no, letting it go is a decision, so write \"dropped on [date], because [reason]\" and close it.",
          "Look for what was missing last time. A password, a document that never arrived, an answer someone else owed you. If it's still missing, getting it is your real next step, and it's often a short call or email. See [first physical step: 20 examples](/guides/first-physical-step-20-examples) for wording that step.",
          "Name the smallest piece and do only that. Small enough that starting it isn't a decision: find the paperwork and put it on the desk, photograph one sticker, write the first line of the email.",
          "Before you stop, leave the note for next time: where you got to, the next piece, and anything you learned that isn't written elsewhere, such as who you spoke to.",
        ],
      },
      {
        kind: "table",
        heading: "How long it has been changes the first step",
        columns: ["Time away", "What to add"],
        rows: [
          ["A week or two", "Read your last note and go straight to the next piece."],
          [
            "A month or so",
            "As above, and leave yourself a note at the end of the sitting so next time starts from it.",
          ],
          [
            "Longer than that",
            "Do the still-needed check before you spend any effort. Dates may have passed.",
          ],
          [
            "No idea",
            "Look for the newest date on any paper or email. Treat it as a month, then follow that row.",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "When it doesn't work",
        paragraphs: [
          "The most common snag is choosing a piece that is too big. \"Finish the form\" is a project. \"Find the serial number\" is a piece. If you sit down and nothing happens, shrink it, or try [what to do in the next ten minutes when you're stuck](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes).",
          "The second snag is a passed date. Some things do get harder after a delay: a claim window closes, a form expires. Nothing here can reopen one. The move is to contact whoever runs the process and ask what's still possible, and [how to deal with something you have put off](/guides/how-to-deal-with-something-you-have-put-off) has lines for that.",
          "The third is that the project stopped because the system around it broke, not the task. If your planner or list went quiet at the same time, see [why you abandon planners and how to come back](/guides/why-you-abandon-planners-and-how-to-come-back), and if the pile is many things, start with [how to start when everything is overdue](/guides/how-to-start-when-everything-is-overdue).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How do I restart something I stopped halfway?",
            a: "Write one line about where you got to, name the smallest piece that comes next, and do only that. Skip re-reading from the beginning, because you'll find out within a minute if you needed the background. Then leave a note for next time so the restart isn't repeated.",
          },
          {
            q: "Why is it so hard to go back to something I abandoned?",
            a: "Returning means facing the task, rebuilding where you stood, and any feeling you attached to stopping. That rebuilding can be tedious enough to keep you away. A written note of where you got to removes most of it, which is why the steps above start there.",
          },
          {
            q: "Should I start over or continue where I left off?",
            a: "Continue, unless what you did is now wrong. Starting over makes the whole thing feel larger than it is. Check the parts you finished only if a date or fact may have changed, such as an amount or a deadline, and leave the rest alone.",
          },
          {
            q: "How do I know whether to give up on it instead?",
            a: "Ask if anyone is waiting on it, whether it has a date, and whether you'd be glad to have it done. Three no answers mean you can close it on purpose. Write down what you decided and why, so it stops nagging as an open question.",
          },
          {
            q: "How do I stop leaving things half done?",
            a: "You won't stop entirely, and that's fine. What you can change is what you leave behind: where you got to and the next piece, in one or two lines. A [weekly reset](/guides/a-weekly-reset-that-survives-a-bad-week) is a light way to look at what's stalled.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where a Companion can hold this for you",
        paragraphs: [
          "[Alongside](/shop/alongside), the ADHD Life Companion, has a walkthrough called Pick something back up. It asks how long it has been, where you got to, whether anything was missing last time, and what the smallest piece is. Then it shows a short list of what to have out before you start. Your answers are kept, so next time you see them instead of working it out again. If you leave halfway, reopening the item puts you back at the exact question with earlier answers intact. It holds your own notes only, not documents or photos.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Leaving a run halfway does not change the item, add anything to its history, or count anything. Alongside is a web app for admin, not a treatment.",
      },
    ],
  },

  {
    slug: "how-much-of-your-money-is-actually-safe-to-spend",
    title: "How much money is safe to spend after your bills?",
    dek: "Your balance is not what you can spend. Take off the bills still due and the money you are holding back, in five steps, and one number is left.",
    primaryQuery: "how much money is safe to spend",
    next: { slug: "can-you-afford-it-before-you-buy-it", reason: "Once you have your safe number, use it to test one specific purchase before you commit to it." },
    related: [
      { slug: "available-balance-vs-current-balance", reason: "If your app shows two different balances, this explains posted, pending and held money and which figure to start from." },
      { slug: "monthly-bills-list", reason: "List every bill still due, including the quarterly and annual ones, so the number you subtract is complete." },
      { slug: "what-to-check-before-each-direct-debit-date", reason: "Check which account each bill leaves from and when, so the money you set aside is in the right place." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "Consumer Financial Protection Circular 2022-06: Unanticipated overdraft fee assessment practices (CFPB)",
        url: "https://www.consumerfinance.gov/compliance/circulars/consumer-financial-protection-circular-2022-06-unanticipated-overdraft-fee-assessment-practices/",
        retrieved: "2026-09-26",
        note: "Defines available balance as ledger balance plus made-available deposits less pending debits, and shows how later-settling items can overdraw an account that looked positive.",
      },
      {
        name: "Available balance vs. current balance (Bankrate)",
        url: "https://www.bankrate.com/banking/checking/what-is-your-available-balance/",
        retrieved: "2026-09-26",
        note: "Available balance reflects pending items and holds but not upcoming bills you haven't paid yet.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "When you open your banking app and see $2,340, the money you can spend is that balance minus every bill and payment due before your next payday, minus anything you're holding back on purpose, minus anything you've promised but haven't paid yet. What's left is your safe-to-spend number, and it's usually much smaller than the balance.",
          "This is for anyone paid on a steady rhythm who wants one number before a purchase. It only knows what you type in, so it's as current as your last look, and it can't predict groceries, fuel or a surprise repair. It isn't financial advice.",
        ],
      },
      {
        kind: "table",
        heading: "An example, line by line",
        intro: "Say it's the 12th, payday is the 28th, and your checking account shows $2,340.00 available. These figures are an illustration, not anyone's real month.",
        columns: ["Line", "Amount", "What it is"],
        rows: [
          ["Available balance", "$2,340.00", "Checking only, after pending items"],
          ["Car insurance, the 15th", "- $128.00", "Due before payday"],
          ["Phone, the 18th", "- $62.00", "Due before payday"],
          [
            "Credit card payment, the 20th",
            "- $210.00",
            "You pay this card in full each month",
          ],
          ["Electric, the 22nd", "- $94.00", "Due before payday"],
          ["Streaming, the 25th", "- $15.00", "Due before payday"],
          [
            "Held back on purpose",
            "- $300.00",
            "Tax money you set aside, not for spending",
          ],
          ["Promised, not paid", "- $120.00", "A repair deposit you've agreed to"],
          ["Safe to spend", "$1,411.00", "Until the 28th"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "What the $1,411 tells you",
        paragraphs: [
          "The balance said $2,340. The number you can act on is $1,411, which is $929 less. Rent isn't in the sum because it comes out on the 1st, after payday, and the 28th paycheck is what covers it.",
          "If you want a weekly figure, divide by the weeks left. From the 12th to the 28th is a little over two weeks, so $1,411 works out to roughly $600 a week. Treat that as arithmetic, not a forecast. Then, when you're deciding on a specific purchase, [test it against this number](/guides/can-you-afford-it-before-you-buy-it).",
        ],
      },
      {
        kind: "list",
        heading: "Work out your own number in five steps",
        ordered: true,
        items: [
          "Open the account you pay bills from and write down the available balance, not the current one. If the two differ, [this explains which to trust](/guides/available-balance-vs-current-balance). Add other accounts only if you'd really spend from them. Leave savings out.",
          "Write down your next payday, then list every bill, subscription and card payment that leaves before it. Include the quarterly and annual ones. [A bills list that includes them](/guides/monthly-bills-list) makes this a two minute job later.",
          "Subtract them. If you pay a credit card in full, that card's balance is a bill too. If you carry a balance, subtract the payment you'll actually make.",
          "Subtract what you're holding back: tax money, a deposit, the cushion you don't want to touch. Then subtract anything you've committed to but not paid, like a booking or a repair.",
          "Write the result at the top of a note and date it. If you want a weekly figure, divide by the weeks left. Next time you're about to spend, look at that number first, then look at the balance.",
        ],
      },
      {
        kind: "list",
        heading: "When the number is wrong or misleading",
        intro: "Six ways this sum goes off, and what to do about each.",
        items: [
          "It comes out negative. Don't round it up to zero. It means the bills due before payday are bigger than the money you have, and you have days to move something: a payment date, a transfer, or a call to the biller.",
          "Money is coming but hasn't landed. Leave it out until it's in the account. A paycheck that's a day late shouldn't turn a plan into an overdraft.",
          "You forgot a bill. Annual and quarterly charges are the usual culprits. A charge from twelve months ago on your statement will show you which ones.",
          "The balance moved since you looked. A pending charge or a bill you paid after writing the number down makes it stale. Redo the sum after any big change.",
          "Different bills leave different accounts. Do the sum per account, or the money in one will hide a shortfall in the other.",
          "You stopped checking it. A number you wrote three weeks ago is a guess. Date it, and treat anything over a week old as suspect.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Is safe to spend the same as disposable income?",
            a: "Not quite. Disposable income usually means your pay after taxes, measured over a period. Safe to spend is a snapshot for today: the money in your account minus what's already spoken for before your next payday. Two people with the same disposable income can have very different safe-to-spend numbers on the 12th, depending on when their bills land.",
          },
          {
            q: "Should I count my savings account?",
            a: "Only if you'd truly spend it. If it's your emergency fund or money for a known cost, leave it out of the starting balance. Counting it makes the number bigger and less useful, because you'll end up spending money you'd already given a job.",
          },
          {
            q: "Do I subtract my credit card balance?",
            a: "If you pay the card in full, yes. Charges you've already made are money owed, so treat the payment as a bill due on its date. If you carry a balance, subtract the payment you'll make before payday. Either way, don't count the card's available credit as money you have.",
          },
          {
            q: "How much cash should I keep as a buffer?",
            a: "That's your call, and it's worth choosing a number rather than leaving it vague. Some people hold back the cost of a week of groceries, others a flat $100. Subtract it as its own line so it's visible, and adjust it when your month gets tighter or looser.",
          },
          {
            q: "Why doesn't my banking app show this number?",
            a: "Available balance in a banking app reflects pending items and holds that are already in the system. Bankrate notes it doesn't account for upcoming bills you haven't paid yet. Your bank can't know your insurance renews on the 15th, so the subtraction is yours to do.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the free Monthly Money Reset fits",
        paragraphs: [
          "[Monthly Money Reset](/free) does this sum for you from numbers you type. You enter the money you have right now, your income once it arrives, your bills and any savings you're protecting, and it shows one safe-to-spend figure with a receipt of every line, plus a rough weekly amount. It works on the month rather than to payday, and it can go negative and says so. It's only as current as your last update, and it doesn't connect to your bank.",
          "If you want your whole picture rather than one month, [Personal Finance Companion](/shop/personal-finance-companion) keeps your accounts, bills, subscriptions and debt minimums together and shows an Available Money estimate with its working. It's a month-level estimate that subtracts a full month of bills, not an until-payday figure like the one above, so use the sum on this page for today's decision.",
        ],
      },
    ],
  },

  {
    slug: "how-to-find-every-subscription-you-are-paying-for",
    title: "How to find all your subscriptions, including annual ones",
    dek: "A twelve month statement sweep, plus the places charges hide: Apple and Google lists, PayPal, old cards and free trials that turned into paid plans.",
    primaryQuery: "how to find all my subscriptions",
    next: { slug: "subscription-tracker-what-to-track", reason: "Found them all? Write down six fields for each one so the next renewal date never catches you out." },
    related: [
      { slug: "how-to-cancel-subscriptions", reason: "Spotted one you no longer use, and it is hard to stop? Here are the cancel steps and scripts." },
      { slug: "how-to-save-money-fast", reason: "Cutting a forgotten charge is one of the quickest ways to free up cash this month, ranked against other small moves." },
      { slug: "bank-statement-csv-to-budget", reason: "If your bank lets you download a file, this shows how to check it and sort charges without retyping." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "Apple Support: See, change or cancel your subscriptions",
        url: "https://support.apple.com/en-us/118428",
        retrieved: "2026-09-26",
        note: "iPhone steps, receipts search, other Apple Accounts not listed",
      },
      {
        name: "Google Play Help: Cancel, pause or change a subscription on Google Play",
        url: "https://support.google.com/googleplay/answer/7018481",
        retrieved: "2026-09-26",
        note: "Android path to Manage subscriptions; check other Google accounts",
      },
      {
        name: "PayPal Help: Automatic payments",
        url: "https://www.paypal.com/us/cshelp/article/what-is-an-automatic-payment-and-how-do-i-update-or-cancel-one-help240",
        retrieved: "2026-09-26",
        note: "PayPal Settings, Payments path; cancel or change backup method",
      },
      {
        name: "FTC Consumer Advice: Getting in and out of free trials, auto-renewals and negative option subscriptions",
        url: "https://consumer.ftc.gov/articles/getting-and-out-free-trials-auto-renewals-and-negative-option-subscriptions",
        retrieved: "2026-09-26",
        note: "check statements, trial deadlines, dispute with card company",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "To find every subscription you pay for, pull twelve months of statements for each card and account, then look for the same merchant at the same amount, plus single charges that land once a year. Next, check the places a statement can't explain: your Apple or Google subscription list, PayPal automatic payments and your email receipts.",
          "This is for anyone who suspects they pay for more than they remember. It can't find charges on a card or account you don't have statements for, cash payments, or a subscription billed to someone else's Apple or Google account.",
        ],
      },
      {
        kind: "table",
        heading: "An example sweep, with the yearly cost of each",
        intro: "Example only, not real data. Say a year of statements turns up six repeating charges. The monthly figures look small. The yearly column is the one to decide on.",
        columns: ["Charge", "How often", "What you see", "Cost per year"],
        rows: [
          ["Video streaming", "Monthly", "$15.49", "$185.88"],
          ["Music streaming", "Monthly", "$10.99", "$131.88"],
          ["Cloud storage", "Monthly", "$2.99", "$35.88"],
          ["Photo editing app", "Monthly", "$4.99", "$59.88"],
          ["Fitness app", "Once a year", "$79.99", "$79.99"],
          ["Antivirus", "Once a year", "$59.99", "$59.99"],
          ["Total", "", "", "$553.50"],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Nothing in that list is outrageous, and that's the point. The total is about $46 a month, and you'd only see the two annual charges by looking back a full year. Three months of statements would have missed both.",
        ],
      },
      {
        kind: "list",
        heading: "How to run the sweep",
        ordered: true,
        intro: "Set aside an hour. Use a spreadsheet or a sheet of paper with four columns: name, amount, how often, where it's billed.",
        items: [
          "Download twelve months of statements for every credit card, debit card and checking account you've used. Most banks let you pick a date range or download a CSV. If yours only keeps a few months online, ask for older statements.",
          "Search or scan each statement for repeats. Sorting by merchant name puts the same company next to itself. Write down anything that appears two or more times at the same or a similar amount.",
          "Scan again for one-off charges that look like a subscription: a round-ish amount with a service name, in the same month as a year earlier. These are your annual renewals. If you have only twelve months, a charge that appears once is a candidate. Note it and cross-check it against the app store lists below.",
          "Open your Apple subscription list. On iPhone, go to Settings, tap your name, then Subscriptions. Apple's own guidance is that subscriptions bought with a different Apple Account won't appear there, so repeat this on any other account you've used.",
          "On Android, go to Settings, Google, your name, Manage your Google Account, then Payments and subscriptions, then Manage subscriptions. Switch Google accounts and look again if you use more than one.",
          "Log in to PayPal on the website and go to Settings, then Payments, then Subscriptions and saved businesses (some accounts label it Automatic payments). Every merchant allowed to bill you appears there.",
          "Search your email for the words receipt, invoice, renewal, subscription, trial, and your billing email address. Look at the last twelve months and note any sender you haven't written down yet.",
          "Add up the yearly cost of each one. Monthly charges times twelve, annual charges as they are. Then mark each as keep, unsure or cancel.",
        ],
      },
      {
        kind: "table",
        heading: "What the line on your statement usually means",
        intro: "Statement wording varies by bank and merchant, so treat these as patterns to look for, not exact strings.",
        columns: ["What the line looks like", "What it usually is", "Where to look next"],
        rows: [
          [
            "Apple.com/bill",
            "Apple billing for an App Store subscription, iCloud or Apple services",
            "Settings, your name, Subscriptions, or search email for receipts from Apple",
          ],
          [
            "Google followed by a service name",
            "A Google Play or Google service subscription",
            "Google Account, Payments and subscriptions",
          ],
          [
            "PayPal followed by a company name",
            "A merchant billing you through PayPal",
            "PayPal, Settings, Payments, automatic payments",
          ],
          [
            "Amazon or AMZN with Digital, Prime or a code",
            "Prime, a digital purchase or an Amazon channel",
            "Your Amazon account, then the memberships and subscriptions page",
          ],
          [
            "A name you don't recognize",
            "Often the parent company or a payment processor",
            "Search the exact text, then check your email for that date",
          ],
          [
            "The same round amount every month",
            "Almost always a subscription",
            "Match it to a receipt in your email",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Charges that show the store and not the service",
        paragraphs: [
          "If a charge shows the store and not the service, the receipt is the fastest fix. Apple says to search your email for a receipt or invoice from Apple to see which account and which subscription it belongs to. If you find a receipt but the subscription isn't in your list, the company on the receipt may bill you directly, so contact that company.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What can go wrong",
        paragraphs: [
          "A free trial that turned into a paid plan looks like a normal charge on the first billing date, weeks after you signed up. The FTC advises checking your card statements and marking your calendar for a trial's deadline, because once it passes you may be paying. If you find one, check the date of the first charge against your email from the sign-up.",
          "Old cards are the other trap. If you replaced a card, some merchants keep charging the new one and some don't. Go through the statements for the card you stopped using, not only the current one.",
          "Shared households add a third. If your partner or a family member holds the Apple or Google account, their list has subscriptions yours doesn't. Sit down together and compare, because two people can pay for the same thing without knowing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Limits of the method",
        paragraphs: [
          "A statement sweep is only as good as the accounts you include. If you can't get to twelve months, do the months you can and set a reminder to repeat it when the older ones come around. When you find something you don't want, the steps for ending it are in [how to cancel a subscription that is hard to cancel](/guides/how-to-cancel-subscriptions), including scripts for when the company pushes back.",
          "If you can download a file from your bank, [turning a bank statement CSV into a budget](/guides/bank-statement-csv-to-budget) shows how to check it and sort charges without retyping them.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How do I find all my subscriptions?",
            a: "Gather twelve months of statements for every card and account, look for repeating merchants and once-a-year charges, then check Apple, Google Play, PayPal and your email receipts. Write each one down with its amount, how often it bills and where it's billed. It takes about an hour.",
          },
          {
            q: "How do I find hidden subscriptions on my bank statement?",
            a: "Sort by merchant so repeats sit together, then look for identical or near-identical amounts each month. Also look for one charge a year with a service name. Lines that show Apple.com/bill, Google or PayPal are billing platforms, so you'll need to check those accounts to see the actual service.",
          },
          {
            q: "How do I see my subscriptions on my iPhone?",
            a: "Open Settings, tap your name, then tap Subscriptions. Tap any item to see its renewal date and price. Subscriptions bought with a different Apple Account won't show, and you can't manage a family member's, so sign in with the account that made the purchase.",
          },
          {
            q: "How do I find subscriptions on Android?",
            a: "Go to Settings, Google, your name, Manage your Google Account, then Payments and subscriptions and Manage subscriptions. If one is missing, it may be on a different Google account, so switch accounts and check again. Subscriptions billed through PayPal or directly by a company won't be listed there.",
          },
          {
            q: "How do I find subscriptions charged through PayPal?",
            a: "On the PayPal website, go to Settings, then Payments, then Subscriptions and saved businesses, or Automatic payments. Select a merchant to see its details. You can cancel the automatic payment or change the backup payment method from that page.",
          },
          {
            q: "What if I find a charge I don't recognize?",
            a: "Search the exact text from the statement, then check your email for a receipt around that date. If it still isn't yours, contact the merchant first. The FTC advises that if you were charged without consent and they won't refund you, you can dispute the charge with your card company.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Keeping the list after the sweep",
        paragraphs: [
          "Once you have the list, the hard part is keeping it current. In Personal Finance Companion, each subscription gets its own record: amount, whether it bills monthly, annually or on a custom cycle, the renewal date, and a decision (keep, reviewing, planned cancellation or canceled). The Subscriptions area shows a monthly total, with annual charges divided by 12, and a kept annual subscription appears in Attention when it's within 14 days of renewing and you open the app.",
          "It doesn't find subscriptions for you. You can paste your list as notes and review each line before it's saved, but a bank CSV imports transactions and doesn't turn them into subscriptions, so you enter those yourself. [Personal Finance Companion](/shop/personal-finance-companion) is where the list lives after the sweep. If you only want to know what's safe to spend this month, the free [Monthly Money Reset](/free) does that without a subscriptions area. Once you have the list, [what to write down for every subscription](/guides/subscription-tracker-what-to-track) covers the fields worth keeping.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Personal Finance Companion keeps each subscription with its amount, renewal date and a decision, and shows a monthly total. It doesn't find subscriptions from your statements, show an annual total or cancel anything for you.",
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
    next: { slug: "home-maintenance-checklist-by-month", reason: "After the intervals, this turns them into a checklist of jobs that belong to a season rather than a date." },
    related: [
      { slug: "home-maintenance-you-skip-that-costs-the-most", reason: "If you only have time for a few jobs, this ranks the eight that cost the most when skipped." },
      { slug: "how-often-change-furnace-filter", reason: "Filters have the shortest interval on the schedule, so this covers changing them and noting the size." },
      { slug: "home-maintenance-log-template", reason: "Once a job is done, this shows what to write in the log so the next due date is easy to find." },
    ],
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
    next: { slug: "how-to-find-the-model-number-on-any-appliance", reason: "Before you can write the model down, you have to find it, and this shows where the data plate hides." },
    related: [
      { slug: "appliance-warranties-what-to-track", reason: "With the purchase details written, this explains how to track the warranty end and the service condition." },
      { slug: "how-to-make-a-home-binder", reason: "The appliance sheet is one page of a home binder, and this shows what else goes alongside it." },
      { slug: "what-to-keep-after-a-home-repair", reason: "When the machine first breaks, this covers what to write down at the repair visit." },
    ],
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
    next: { slug: "named-executor-what-you-agreed-to", reason: "If the will names you, this explains what an executor does and where you could be personally liable." },
    related: [
      { slug: "how-to-find-someones-accounts-after-they-die", reason: "A will rarely lists every account, so this gives the search order for tracing money and policies." },
      { slug: "what-to-do-when-a-parent-dies", reason: "For the wider order of tasks after a parent dies, this puts the search for a will in context." },
      { slug: "safe-deposit-box-and-spare-keys-who-can-open-it", reason: "If the original may be in a deposit box or home safe, this covers who can open one and how." },
    ],
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
    next: { slug: "how-to-find-someones-accounts-after-they-die", reason: "Serving as executor means finding every asset, and this shows the order to search for accounts and policies." },
    related: [
      { slug: "named-executor-what-you-agreed-to-uk", reason: "In England, Wales, Scotland or Northern Ireland the role and the court process differ, and this is the UK version." },
      { slug: "where-to-look-for-a-will", reason: "Before you can act, you need the original will, and this covers where it is usually kept." },
      { slug: "who-to-tell-when-someone-dies", reason: "An executor has to notify banks, agencies and providers, and this lists who to tell and when." },
    ],
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
    next: { slug: "where-to-look-for-a-will", reason: "If you cannot yet find the original, this covers where wills are kept and what to do if several turn up." },
    related: [
      { slug: "named-executor-what-you-agreed-to", reason: "This is the US version for readers outside the UK, where executors and the court process work differently." },
      { slug: "what-to-do-when-a-parent-dies-uk", reason: "To see the registration and certificate steps that come with the role, use the UK first-fortnight guide." },
      { slug: "how-to-find-someones-accounts-after-they-die", reason: "To trace accounts, pensions and policies for the estate, this gives a search order that works when little is written down." },
    ],
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
    next: { slug: "what-to-write-down-in-case-something-happens-to-you", reason: "For the short list of details that live only in your head, start here and keep it findable." },
    related: [
      { slug: "life-admin-binder-what-goes-in-it", reason: "To hold the finished file in one physical place, this sets out eight sections and what to leave out." },
      { slug: "hospital-for-two-weeks-what-would-someone-need-to-find", reason: "To test whether the file works, this asks what someone would need to find if you were hospitalized for two weeks." },
      { slug: "emergency-contact-and-medical-decision-maker", reason: "Once you know who would speak for you, this covers choosing a health care proxy and recording where the forms are." },
    ],
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
    next: { slug: "flight-delayed-with-a-connection-what-to-do-first", reason: "If the reason you are late is the flight, start here for what to ask the airline before you reach the desk." },
    related: [
      { slug: "flight-changed-what-else-is-affected", reason: "When a changed flight moved your arrival, this finds every booking that was built on it so none is left behind." },
      { slug: "travel-document-checklist", reason: "Passport names and booking names often differ, so this shows which details to note beside each document." },
      { slug: "what-to-keep-on-paper-when-you-travel", reason: "Screenshots fail at the counter, so this covers printing the confirmation and the hotel address in the local language." },
    ],
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
    next: { slug: "simple-homeschool-record-keeping-system", reason: "For the habit behind the columns, this covers keeping entries under a minute and what to do after a bad week." },
    related: [
      { slug: "homeschool-record-keeping-for-multiple-children", reason: "With more than one child, this shows how to file by child and log shared lessons once per child." },
      { slug: "homeschool-reading-log", reason: "Books need their own list. This gives the three-column reading log, including books your child quit." },
      { slug: "homeschool-record-keeping-requirements-by-state", reason: "Check what your state expects you to keep before you settle on a format, with all 50 states and DC in one table." },
    ],
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
    next: { slug: "preparing-for-a-homeschool-evaluation", reason: "When the portfolio is going to an evaluator, this covers what to bring and how to get ready in one evening." },
    related: [
      { slug: "homeschool-reading-log", reason: "The reading list is one of the five portfolio contents. This shows what to write in it." },
      { slug: "how-long-to-keep-homeschool-records", reason: "Wondering how long a portfolio needs to stay in the drawer? This covers what to keep, photograph or recycle." },
      { slug: "homeschool-record-keeping-requirements-by-state", reason: "Some states ask for a portfolio and some do not. This table shows which level yours falls in." },
    ],
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
    dek: "A long list makes you choose every time you look, and its rows never say where to start. A nine-row example cut to one first step, and how to do it yours.",
    primaryQuery: "why to-do lists do not work",
    next: { slug: "why-you-abandon-planners-and-how-to-come-back", reason: "Lists are one kind of system that breaks. This explains why planners fail the same way and how to come back without starting over." },
    related: [
      { slug: "task-paralysis-what-to-do-in-the-next-ten-minutes", reason: "When the list is not the problem and starting is, this ten minute way out shrinks the first step until it needs no decision." },
      { slug: "a-weekly-reset-that-survives-a-bad-week", reason: "Instead of a longer list, a ten minute weekly reset picks one thing and lets a skipped week go." },
      { slug: "why-you-keep-thinking-about-a-task-and-not-doing-it", reason: "If you keep rewriting the task without doing it, this explains the gap between knowing and starting and offers two questions." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    sources: [
      {
        name: "Getting Things Done: What is GTD",
        url: "https://gettingthingsdone.com/what-is-gtd/",
        retrieved: "2026-09-26",
        note: "The clarify step: decide the next action for each actionable item instead of leaving it vague.",
      },
      {
        name: "ADDitude: ADD To-Do Lists",
        url: "https://www.additudemag.com/add-to-do-lists/",
        retrieved: "2026-09-26",
        note: "Two-minute tasks done immediately and kept off the list; specific task wording; large projects kept off the daily list.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A to-do list stops working when it gets long enough that every look means choosing between rows, and when its rows name an outcome instead of a first move. Cut it to one physical first step for today, a date only where a real one exists, and park the rest out of sight.",
          "This is for anyone whose list has become something to avoid, with ADHD or without. It can't tell you why your attention works the way it does, and it isn't medical advice.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Example: one Tuesday list, before and after",
        paragraphs: [
          "Say you open your list at 9 a.m. and it says: Taxes. Dentist. Car. Mom's birthday. Spare room. Airline refund. Email Priya. Insurance. Laundry. Nine rows, no order, and you have known about most of them for weeks.",
          "Here is the same list rewritten. The middle column is the only thing that changed about the words. The right column is what changed about where each one lives.",
        ],
      },
      {
        kind: "table",
        columns: ["On the list now", "Rewritten as a first step", "Where it goes"],
        rows: [
          [
            "Airline refund",
            "Open the airline's email and copy the booking reference onto one line",
            "Today. This is the one thing.",
          ],
          [
            "Email Priya",
            "Send: \"Can you confirm the 12th still works?\"",
            "Two minutes. Do it now, then it's gone.",
          ],
          [
            "Mom's birthday",
            "Order a card by Friday",
            "Friday is a real date, so it gets one.",
          ],
          [
            "Dentist",
            "Call the office and ask for the first opening after the 15th",
            "Parked. Pick a day to come back to it.",
          ],
          ["Car", "Find the renewal notice and put it on the desk", "Parked, no date."],
          [
            "Spare room",
            "Carry the boxes by the door out to the hall",
            "Parked, no date. It's ongoing, not one task.",
          ],
          [
            "Insurance",
            "Write the claim number on one line where you can find it",
            "Reference. It's a detail to keep, not a task.",
          ],
          ["Taxes", "Open the folder and find last year's return", "Parked, no date."],
          ["Laundry", "Nothing. It's a habit, not a list item.", "Off the list."],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "After ten minutes, what you look at tomorrow morning is two lines: copy the booking reference, and order the card by Friday. The other seven still exist. They just aren't asking you to choose among them every time you look.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why a long list stops working",
        paragraphs: [
          "A list shows a two-minute email and a four-hour form as the same kind of row, so picking between them costs effort every time. The hard rows also stay while the easy ones pass through, which means an old list slowly becomes a record of what you keep avoiding.",
          "And a row like \"Airline refund\" says what you want to be true, not what to do first. The first physical move is the part that was hard all along, and the list leaves it blank.",
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "How to cut a long list down in ten minutes",
        intro: "Do this on one page or one screen, with a timer set for ten minutes.",
        items: [
          "Copy everything onto one page, in whatever order it comes. Don't sort yet.",
          "Cross out what isn't a task: habits you do anyway, things you've decided against, things already done.",
          "Do anything that takes two minutes or less right now, and cross it out. ADDitude's list advice makes the same call: those never need to sit on a list.",
          "Rewrite each remaining row as a first step someone watching could see you do. Call, open, find, carry, send. This is the \"next action\" idea from Getting Things Done, and it's the whole trick. There are 20 examples in [the first physical step](/guides/first-physical-step-20-examples).",
          "Pick one for today. Put its first step where you will see it, not at the bottom of the page.",
          "Give a date to the rows that have a real one: a deadline, an appointment, something you told someone. Leave the rest with no date at all.",
          "Move everything else to a second page. Tomorrow you'll only open it after today's one thing is done.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When this doesn't work",
        paragraphs: [
          "The parked page can turn into a second pile. If you open it every day to check, you've rebuilt the long list. Look at it once a week instead, as in [a weekly reset that survives a bad week](/guides/a-weekly-reset-that-survives-a-bad-week).",
          "Another common snag is that rewriting the list becomes today's task. If it takes more than ten minutes, stop, and just do the first step of the item you most dread. And if you pick your one thing and still can't start it, the step is too big. [Task paralysis: what to do in the next ten minutes](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes) shrinks it further.",
          "If everything on the page is late and every row feels urgent, start with [how to start when everything is overdue](/guides/how-to-start-when-everything-is-overdue). If the whole system fell apart weeks ago, that is a different problem, and [why you stop using planners](/guides/why-you-abandon-planners-and-how-to-come-back) covers how to come back to one.",
          "One limit, said once: a short list is not a cure. If you already have a list that works, keep it. This is for the one you've stopped opening.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Why don't to-do lists work for ADHD?",
            a: "There isn't one reason, and this guide can't speak to a diagnosis. What people commonly describe is that a long list makes every row look equally urgent, hard items sit there for weeks, and rows say what should happen but not what to do first. The fix is the same either way: fewer rows in view, a physical first step, and dates only where they're real.",
          },
          {
            q: "Why does my to-do list make me anxious?",
            a: "A long list is a visible tally of everything undone, and the rows you've avoided longest are still on it every time you look. Cutting what you see to one thing for today, with the rest parked on another page, removes the daily tally without losing anything. If the anxiety is broader than your list, that is worth raising with a professional.",
          },
          {
            q: "How many things should be on a to-do list for one day?",
            a: "There is no proven number. We'd start with one thing, plus anything with a real date that day, as in the example above. If you finish the one, you can pick another. Starting with five usually rebuilds the same list you were trying to escape.",
          },
          {
            q: "Is a paper list or an app better?",
            a: "Neither wins by itself. What helps is how much you see at once and whether each row starts with something physical. A paper page with one line on it can beat an app showing forty rows, and an app that shows one item can beat a crowded notebook. Use whichever you'll actually open tomorrow.",
          },
          {
            q: "What do I do with a to-do list that already has 50 items?",
            a: "Don't rewrite all 50. Cross out what isn't a task, then pick the five you'd least like to be asked about and rewrite only those as first steps. Choose one for today and move the other 45 to a second page you open weekly. You can bring rows back as you get to them.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "The steps above work on paper. [ADHD Life Companion](/shop/alongside) does two of them for you. Now shows one thing at a time, chosen from what you already told it: a date you set, something you're waiting on, or something ongoing you left 14 or more days ago. When none of those applies, it says \"Nothing needs you right now\" and stops.",
          "Life holds everything else in four separate groups: Something to do, Waiting on someone, Something ongoing, and Worth having to hand. Nothing is marked late and nothing is counted. Its \"Break something down\" walkthrough asks what the thing is, what would be true when it's finished, and the first physical step, then asks which could happen today, with the note \"One of them. Not the list.\" It is a web app, not a list manager, so it doesn't hold everything, and it isn't treatment or medical advice.",
        ],
      },
    ],
  },

  {
    slug: "available-balance-vs-current-balance",
    title: "Available vs current balance: which one can you spend?",
    dek: "Current balance counts what has posted. Available balance also subtracts holds and pending items. Neither one knows about the bills still coming.",
    primaryQuery: "available balance vs current balance",
    next: { slug: "how-much-of-your-money-is-actually-safe-to-spend", reason: "Once you know which balance is real, subtract the bills still due to find what is safe to spend." },
    related: [
      { slug: "can-you-afford-it-before-you-buy-it", reason: "Turn the balance into a yes or no on a specific purchase, working out what is left until payday." },
      { slug: "what-to-check-before-each-direct-debit-date", reason: "See why a payment can fail even when the balance looks fine, and what to check before each bill leaves." },
      { slug: "you-missed-a-payment-what-to-do-next", reason: "A held or pending item can cause a missed payment, and this lays out the first 48 hours after one." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "CFPB: How long can a bank or credit union hold funds I deposited?",
        url: "https://www.consumerfinance.gov/ask-cfpb/how-long-can-a-bank-or-credit-union-hold-funds-i-deposited-en-1023/",
        retrieved: "2026-09-26",
        note: "Reasons a bank may extend a deposit hold: new accounts under 30 days, repeated overdrafts, large checks; deposit notice.",
      },
      {
        name: "Federal Reserve: A Guide to Regulation CC Compliance",
        url: "https://www.federalreserve.gov/supervisionreg/guide-regulation-cc-compliance.htm",
        retrieved: "2026-09-26",
        note: "Exception hold categories and the duty to notify the customer of a longer hold. Dollar thresholds deliberately left out because they are inflation-adjusted.",
      },
      {
        name: "CFPB: How can I avoid debit card overdrafts?",
        url: "https://www.consumerfinance.gov/ask-cfpb/how-can-i-avoid-debit-card-overdrafts-en-1035/",
        retrieved: "2026-09-26",
        note: "Deposits may not be immediately available, so check funds after recent deposits.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Current balance is the total of everything that has posted to your account. Available balance is what your bank will let you spend right now: the current balance minus pending card purchases and holds, plus any overdraft line some banks add. Use available to judge whether a payment will go through, and current to match a statement.",
          "This is for anyone whose banking app shows two numbers and who wants to know which one to trust. It can't tell you what your bank does with your own account, because the rules on holds and overdraft lines are set in your account agreement.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "An example with a hold and pending charges",
        paragraphs: [
          "Say your checking account starts the day at $1,240.00 posted. Over two days you do three things, and your app updates like this.",
        ],
      },
      {
        kind: "table",
        intro: "Example figures only. Your bank may order or label these differently.",
        columns: ["What happened", "Current balance", "Available balance"],
        rows: [
          ["Start of the day, everything posted", "$1,240.00", "$1,240.00"],
          [
            "Grocery purchase on your debit card, still pending: $86.40",
            "$1,240.00",
            "$1,153.60",
          ],
          ["Gas pump places a hold: $100.00", "$1,240.00", "$1,053.60"],
          [
            "You deposit a $500.00 check and the bank holds it until Thursday",
            "$1,740.00 at some banks, $1,240.00 at others",
            "$1,053.60",
          ],
          [
            "A $180.00 autopay is due Friday but has not been taken yet",
            "unchanged",
            "$1,053.60",
          ],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Notice what neither column does. The autopay isn't in either figure, so the money that is really yours before Friday is $873.60, not $1,053.60. And when the pump finishes at $42.15, the $100.00 hold drops off and your available balance rises by $57.85, without you doing anything.",
          "That last part is why an available balance can go up on its own. Nothing arrived. A hold was replaced by the smaller real charge.",
        ],
      },
      {
        kind: "table",
        heading: "The terms your bank uses",
        columns: ["Term", "What it means", "Where you see it"],
        rows: [
          [
            "Current balance",
            "Everything that has posted, and nothing pending. Also called posted or ledger balance.",
            "Statements, and the top line of many apps",
          ],
          [
            "Available balance",
            "What you can spend now: current minus holds and pending debits, plus any overdraft line your bank includes.",
            "ATM screens, and whatever your card is approved against",
          ],
          [
            "Pending",
            "A purchase the merchant has authorized but not yet settled. It can change amount before it posts.",
            "Your recent activity list",
          ],
          [
            "Authorization hold",
            "Money set aside at gas pumps, hotels and rental cars until the final charge arrives. It can be larger than the final charge.",
            "Your available balance only",
          ],
          [
            "Deposit hold",
            "Part of a deposit your bank has not yet released for spending.",
            "Your available balance, with a release date in the deposit notice",
          ],
          [
            "Overdraft line",
            "Coverage some banks add to the available figure. You can spend it, but it isn't your money.",
            "Sometimes folded into available with no label",
          ],
        ],
      },
      {
        kind: "list",
        heading: "How to read your two numbers today",
        ordered: true,
        items: [
          "Open the account and find both figures. If your app shows only one, look for a label such as \"available\" or \"posted\", or check the ATM receipt.",
          "Look at the pending list and add up anything marked as a hold or pre-authorization, especially fuel, hotels and rental cars.",
          "Check your recent deposits. If any is a check, find the date your bank says the money is released. The notice you got when you deposited it lists that date.",
          "Read your account agreement or ask the bank once whether the available figure includes an overdraft line. It changes how you read every balance afterward.",
          "Subtract what is due before payday from the available figure. The method is in [how much of your money is actually safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When the numbers mislead you",
        paragraphs: [
          "Deposit holds are set partly by federal rule. Banks must make cash and electronic deposits available quickly, but they can extend holds on checks, on large deposits, on accounts under 30 days old and on accounts with repeated overdrafts. Your deposit notice is where the bank has to tell you when it is holding money longer.",
          "Debit card overdrafts are their own trap. Whether a purchase can overdraw your account depends on whether you opted in to that coverage, and a purchase can be approved against a balance that later shrinks. Before a bill leaves, look at [what to check before each direct debit date](/guides/what-to-check-before-each-direct-debit-date). If a payment has already failed, [you missed a payment](/guides/you-missed-a-payment-what-to-do-next) covers the first 48 hours.",
        ],
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "Which balance is my real balance?",
            a: "Neither one is the amount that is free to spend. Current shows what has posted, and available shows what the bank will approve today. Your real number is available minus what you owe before payday, such as autopays, rent and any set-aside money. That last step is up to you, because the bank can't see your bills.",
          },
          {
            q: "Is available balance the same as what I can spend?",
            a: "Only in the narrow sense that your card will probably be approved up to that amount. Some banks add an overdraft line to it, and it ignores bills that haven't been taken yet. Treat it as the ceiling for one purchase, not as spare money.",
          },
          {
            q: "Why is my available balance higher than my current balance?",
            a: "It usually means the bank is including something extra, most often an overdraft line or a credit that hasn't posted yet, such as a deposit it is letting you use early. Check your account agreement or ask the bank which one applies. Don't assume the difference is yours.",
          },
          {
            q: "Why is my available balance lower than my current balance?",
            a: "Something is holding money back. Common causes are pending card purchases, a gas pump or hotel authorization hold, and a deposit the bank hasn't released yet. Look for the item in your pending list. Most holds fall away by themselves once the merchant settles the final charge.",
          },
          {
            q: "Which balance should I use to pay a bill?",
            a: "Use available to see whether the payment will go through today, then subtract other bills due before payday so it doesn't cause a failed payment later. Use current when you are matching your records to a statement, because pending items can still change.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where a Companion fits",
        paragraphs: [
          "Your bank shows you two balances and leaves out your bills. In [Personal Finance Companion](/shop/personal-finance-companion) you type in each account's balance yourself, mark which accounts are available for spending and which are protected, and add your bills. It then shows what is left with the working written out line by line. It doesn't connect to your bank, so it only knows the balance you typed, and it works from a month of bills rather than counting down to payday. The free [Monthly Money Reset](/free) is the shorter version: it takes the money you have now and subtracts the protected bills you haven't paid yet.",
        ],
      },
    ],
  },

  {
    slug: "why-budgeting-apps-stop-working-after-two-months",
    title: "Why budgets get dropped, and what one that lasts needs",
    dek: "Upkeep piles up and the number goes wrong. Four ways budgeting tools break, and five traits of one still in use after month two.",
    primaryQuery: "why do budgets fail",
    next: { slug: "how-to-start-over-after-budget-failure", reason: "Already stopped keeping up with yours? Restart with today's balance and one clear number instead of catching up." },
    related: [
      { slug: "how-to-budget-for-beginners", reason: "Build a first budget from four things and a five minute weekly check that keeps it in use." },
      { slug: "end-of-month-money-review", reason: "A short monthly review is how a budget stays in use without turning into a chore." },
      { slug: "50-30-20-rule-where-it-breaks", reason: "A fixed split can be the reason a budget fails, so test it against your own month here." },
    ],
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
    dek: "You haven't forgotten it, so writing it down again changes nothing. The gap is between knowing and starting, and two questions that help close it.",
    primaryQuery: "keep thinking about a task",
    next: { slug: "task-paralysis-what-to-do-in-the-next-ten-minutes", reason: "When thinking about it has turned into being stuck, this is the main guide to getting unstuck in ten minutes." },
    related: [
      { slug: "first-physical-step-20-examples", reason: "Twenty examples of a first step you could see happen, to replace the vague thought with something you can do." },
      { slug: "executive-dysfunction-is-not-procrastination", reason: "If this looks like laziness from outside, this explains the difference between not starting and not caring." },
      { slug: "why-to-do-lists-make-it-worse", reason: "If the task lives on a list you keep rewriting, this explains three ways lists get in the way of starting." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Attach one physical action to the thought, and one thing you need in front of you to do it. Two questions do that: what is the next physical action, and what would have to be on the table for me to do it? Then do the action, or give it a day and a time.",
          "This is for one task that keeps coming back at eleven at night. It can't tell you why it loops for you, and if the worrying is constant and about everything, a clinician is the right person to ask.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Thinking about it is not starting it",
        paragraphs: [
          "Picture it. You've thought about the insurance renewal in the shower, in the car, and again in bed. Each time it arrives as the whole task: sort out the insurance. That phrase has no first move in it, so the thought has nowhere to go and comes round again. You haven't forgotten it, which is why a fresh list entry changes nothing. It was never off the list.",
          "Starting also asks you to hold several things at once: what this is about, what you want to happen, two facts you'll need, and enough spare attention to think while someone talks to you. That's a lot to assemble at a bad hour. Many people find that gathering those conditions is the hard part, more than the task itself.",
        ],
      },
      {
        kind: "compare",
        heading: "How to tell circling from moving",
        left: {
          label: "Circling",
          items: [
            "You rehearse how they'll react",
            "You reword the task on your list",
            "The task is named by its outcome: sort out, deal with",
            "Nothing you could photograph has happened",
          ],
        },
        right: {
          label: "Moving",
          items: [
            "You can name a verb: find, open, write, call",
            "You know what paper or fact you need",
            "It has a day, or you're doing it now",
            "Someone watching could see it happen",
          ],
        },
      },
      {
        kind: "table",
        heading: "Example: three looping thoughts, worked through",
        intro: "Illustrations, not real cases.",
        columns: ["The thought", "Next physical action", "What needs to be in front of me"],
        rows: [
          [
            "Sort out the insurance",
            "Find the renewal letter and read the date on it",
            "The letter and this year's quote",
          ],
          [
            "I need to reply to Sam",
            "Open the email and write: Sorry for the slow reply.",
            "A decision: yes or no to Saturday",
          ],
          [
            "Book the dentist",
            "Look up the number and stick it by the phone",
            "Two days that work for me",
          ],
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "The two questions, step by step",
        items: [
          "Say the thought as a task, out loud or on paper, in your own words. \"The insurance thing\" is fine.",
          "Ask: what is the next physical action? A phone call, opening a form, finding a document. Not deciding and not planning. If you can't name one, that is why it hasn't moved. [First physical step: 20 examples](/guides/first-physical-step-20-examples) has models to borrow.",
          "Ask: what would have to be in front of me to do that? Usually a reference number, a date, and a decision about what you want. Put them in one place, next to the action.",
          "Choose: now, or a specific day and time. If it's a day, write it where you'll see it that morning. \"Sometime this week\" leaves the thought looping.",
          "Then stop thinking about the rest. Finding the letter counts. You don't need to finish the renewal to have moved it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What can go wrong",
        paragraphs: [
          "Sometimes the action is still too heavy to begin. That's a different problem from circling, and [task paralysis: what to do in the next ten minutes](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes) is the guide for it. If the action is a call, [how to make a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding) covers the five things to write out first.",
          "Sometimes the thought has picked up weight from how long it has waited, and starting feels like admitting the delay. [How to deal with something you have put off](/guides/how-to-deal-with-something-you-have-put-off) has one-sentence lines for that. And if the thing lives on a list you keep rewriting, see [why to-do lists make it worse](/guides/why-to-do-lists-make-it-worse).",
          "One more limit. If the same thoughts keep you awake most nights, or spread to everything, tell a doctor or therapist. This guide covers admin that keeps coming to mind, and nothing beyond that.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Tell one person",
        paragraphs: [
          "If the step needs a decision, saying it aloud to a friend can speed it up: \"I need to choose between the two plans by Friday.\" You're not asking them to fix it. Tonight, write the action on a sticky note and put it on the thing you'll touch first tomorrow.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Why do I keep thinking about a task but not do it?",
            a: "One common reason is that the thought has no first move attached. \"Sort out the insurance\" gives your mind nothing to act on, so it circles. Naming one physical action and what you need to hand often ends the loop. Persistent, wide-ranging worry is a question for a clinician.",
          },
          {
            q: "Why can't I start a task I know I need to do?",
            a: "Starting can mean holding the purpose, the outcome, some facts and spare attention all at once. That's a lot at the moment you try. Get the facts into one place and pick a first action small enough that starting isn't a decision, like opening the file.",
          },
          {
            q: "Is this the same as task paralysis?",
            a: "They overlap but feel different. Here you keep thinking about one task. In paralysis you may not be able to begin anything at all. The fixes overlap too: shrink the first step. The [task paralysis guide](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes) covers the second case.",
          },
          {
            q: "Does writing the task down help?",
            a: "Only if the entry has a physical action in it. \"Insurance\" on a list is the same thought in a new place. \"Find the renewal letter\" is something you can do. Write the verb, not the topic, and note where the paper is.",
          },
          {
            q: "When is it worth talking to a professional?",
            a: "If the thoughts are constant, affect your sleep or work, or spread across everything, mention it to a doctor or therapist. A guide can help with the single stuck task. It can't work out why your mind behaves the way it does.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where a Companion can hold this for you",
        paragraphs: [
          "[Alongside](/shop/alongside), the ADHD Life Companion, has a walkthrough called Break something down. It asks what the thing is, what would be true when it's finished, and what the first physical step is, plus optionally the next two. Then it asks which of them could happen today: one of them, not the list. The steps you aren't doing today go into Life, so you're not carrying them in your head. If you give an item a date, it appears on the day you chose with the line \"You said you would come back to this.\"",
        ],
      },
    ],
  },

  {
    slug: "task-paralysis-what-to-do-in-the-next-ten-minutes",
    title: "ADHD task paralysis: what to do in the next ten minutes",
    dek: "You know what needs doing and cannot begin. A ten minute way out that shrinks the first step until it needs no decision and no motivation.",
    primaryQuery: "adhd task paralysis",
    next: { slug: "first-physical-step-20-examples", reason: "Stuck on what the first step even looks like? Twenty worked examples show how to shrink a task to something you could see happen." },
    related: [
      { slug: "executive-dysfunction-is-not-procrastination", reason: "If you wonder why willpower and deadlines do not help, this separates executive dysfunction from procrastination." },
      { slug: "why-you-keep-thinking-about-a-task-and-not-doing-it", reason: "When you keep circling the same task in your head, this covers the gap between knowing and starting." },
      { slug: "how-to-start-when-everything-is-overdue", reason: "If it is not one task but many, all past their dates, this shows how to pick the first thing and stop for tonight." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    sources: [
      {
        name: "Child Mind Institute: What Is ADHD Paralysis?",
        url: "https://childmind.org/article/what-is-adhd-paralysis/",
        retrieved: "2026-09-26",
        note: "Description of the frozen feeling, that it is not an official ADHD symptom, and the basic needs, body doubling and chunking strategies.",
      },
      {
        name: "CDC: About ADHD",
        url: "https://www.cdc.gov/adhd/about/index.html",
        retrieved: "2026-09-26",
        note: "First step is to talk with a healthcare provider; no single test for ADHD.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Pick one task and shrink it until the first step is something a person watching could see you do, like opening a folder or finding a phone number. Do only that, for up to ten minutes, then write one line about where you stopped. Below is the sequence minute by minute, with worked examples.",
          "This is for the moment when you know what needs doing, you have the time, and you still can't begin. It's practical admin help, not medical advice, and it can't tell you why you're stuck. If it's affecting your work or health, a clinician is the right person to ask.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What it looks like from the inside",
        paragraphs: [
          "You've opened the same tab four times. The letter is on the desk, face down, and you've moved it twice to wipe the table. You could have made the call in the time you've spent deciding whether to make it, and you know that, which makes it worse.",
          "Child Mind Institute describes this stall, usually called ADHD paralysis, as a frozen feeling when you face a task or decision and can't act however much you want to. It also says it isn't an official ADHD symptom, though it's common in people who have ADHD. We're not going to tell you what yours is. The sequence below doesn't depend on a label, and it's built around one idea: the start is the problem, so shrink the start.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Example: the same task, shrunk three times",
        paragraphs: [
          "This is an illustration, not a case. Say the task is \"sort out the insurance claim\". Here is what happens as you cut it down.",
          "Version one: \"Sort out the insurance claim.\" There's no visible first move in that. You'd have to decide where to look, who to call and what to say, all before doing anything. That's the wall.",
          "Version two: \"Call the insurer.\" Better, but a call needs a number, a claim reference, the dates and ten free minutes. Still several decisions in a trench coat.",
          "Version three: \"Find the letter with the claim number on it and put it next to the phone.\" That's it. You can see it happen. It takes two minutes. It needs no motivation, because nothing in it can go wrong, and no one on the other end can say no.",
        ],
      },
      {
        kind: "timeline",
        heading: "The next ten minutes, minute by minute",
        intro: "Set a timer for ten minutes. It's a ceiling, not a target. You're allowed to stop early.",
        steps: [
          {
            when: "Minute 0 to 1: choose",
            what: "Pick one task. Not the most important, just the one you keep looking at. If two are close, take the one whose paper or screen is nearer. Choosing well isn't the point. Choosing is.",
          },
          {
            when: "Minute 1 to 2: say where it ends",
            what: "Finish this sentence in a few words: \"It's done when...\". For the claim, that might be \"the insurer has my claim number and knows I called\". A task with no end feels endless, and that's part of the weight.",
          },
          {
            when: "Minute 2 to 4: find the first step",
            what: "Write the first physical step on paper or a note. Physical means someone watching could see it. Find the letter. Open the form. Write the first line. If you wrote \"think about\", \"plan\" or \"decide\", cross it out and try again.",
          },
          {
            when: "Minute 4 to 5: check the size",
            what: "Ask whether you could do it right now, in under three minutes, without deciding anything. If yes, go. If not, shrink it again. The section below covers what to do when it still feels too big.",
          },
          {
            when: "Minute 5 to 9: do only that",
            what: "Do the step and nothing past it. If you find the letter, you may stop there. If momentum shows up, keep going. If it doesn't, you've still moved a task that was stuck.",
          },
          {
            when: "Minute 9 to 10: leave a note",
            what: "Write one line where you'll see it: what you did and what the next step is. \"Found the letter, it's by the phone. Next: call, number is on page 2.\" Then stop, even if you feel you should keep going.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the smaller step works, and what we'd skip",
        paragraphs: [
          "A big task asks you to choose a route, hold the goal in mind, and act, all at once. Shrinking the first step takes the choosing and the holding out of it. What's left is one action with no decision in it.",
          "We'd skip the pep talk and the consequences. Telling yourself what happens if you don't do it adds dread to a task that already had plenty. It tends to raise the wall rather than lower it. A smaller step doesn't need you to feel ready, which is the only thing you can't order up on demand.",
        ],
      },
      {
        kind: "table",
        heading: "More first steps, from vague to visible",
        intro: "Examples of the same move on different tasks. For twenty more, see [the first physical step: examples for admin you are stuck on](/guides/first-physical-step-20-examples).",
        columns: ["The stuck task", "What it feels like", "The first physical step"],
        rows: [
          [
            "The spare room",
            "Too much, no starting point",
            "Take one photo of the room from the doorway",
          ],
          [
            "A form for work",
            "Dreading the first box",
            "Open it and type your name and the date",
          ],
          [
            "The email you owe someone",
            "Every opening line sounds wrong",
            "Write \"Hi [name],\" and one true sentence, even a bad one",
          ],
          [
            "A bill you don't understand",
            "Afraid of what it says",
            "Put it on the desk and read only the total",
          ],
          [
            "Booking an appointment",
            "Too many choices of day",
            "Find the phone number and write down two days you could go",
          ],
          [
            "A project you dropped",
            "Guilt about the gap",
            "Find the file or box and put it where you'll see it",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "If the first step still feels too big",
        paragraphs: [
          "It happens, and it doesn't mean you're doing it wrong. Usually one of three things is going on. Try them in this order.",
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "Three ways to go smaller",
        items: [
          "Shrink the step again. \"Find the letter\" too big? Try \"walk to the room where the letter is\". \"Open the form\" too big? Try \"put the laptop on the desk\". This sounds silly. That's the point: a step so small there's nothing to refuse.",
          "Change one thing about the setting before you touch the task. Stand up, move to another room, get a glass of water, eat something if you haven't. Child Mind Institute suggests checking basic needs like hunger, tiredness or the need for a change of scene. Then try the step you already picked.",
          "Ask someone to be nearby. Working next to another person, even in silence, helps some people begin. Child Mind Institute lists it as a strategy, called body doubling. It's worth trying, not proven for everyone. A text to a friend saying \"I'm going to open the form now, can you stay on with me\" is enough.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What can go wrong",
        paragraphs: [
          "You might do the step and feel nothing. Fine. The step counted, and the task isn't where it was. You might pick a new task every ten minutes and finish none. If that's happening, stay with one task for the whole ten minutes, and write it in your note so you meet it first tomorrow.",
          "If you keep circling the same task in your head without starting, that's a slightly different problem, covered in [why you keep thinking about a task and not doing it](/guides/why-you-keep-thinking-about-a-task-and-not-doing-it). If it's not one task but a whole pile, all late, use [how to pick the first thing when everything is late](/guides/how-to-start-when-everything-is-overdue) instead of this page.",
          "Ten minutes won't fix a pattern. If starting things is a constant, painful struggle, or it's getting in the way of your job, your health or your relationships, that's worth taking to a doctor or other clinician, who can look at the whole picture. The CDC says the first step is to talk with a healthcare provider, since there's no single test for ADHD. For what comes after, see [diagnosed with ADHD as an adult: what happens next](/guides/diagnosed-with-adhd-as-an-adult).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If nothing moves today",
        paragraphs: [
          "Then nothing moved today. The tasks are where they were, and the only thing you can protect is tomorrow's start. Leave a note that says what the first step would have been and where the paper is. Tomorrow you begin from that line, not from zero. For more on returning to something you dropped, see [how to restart a project you gave up on](/guides/how-to-restart-a-project-you-gave-up-on).",
          "Tonight, do one physical thing: put the paper or the laptop where you'll see it first thing.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "What is task paralysis?",
            a: "It's a stuck feeling where you want to do something, know roughly what it is, and can't begin. Child Mind Institute describes ADHD paralysis as a powerful feeling of being frozen. It isn't an official symptom or a diagnosis by itself. It's a description of an experience, and different things can cause it, so this page sticks to what you can do about it.",
          },
          {
            q: "How do you snap out of task paralysis?",
            a: "Don't try to snap out of it. Shrink the task until the first step needs no decision. Pick one task, write the first physical step, and do only that for a few minutes. Opening the folder counts. If that's still too big, go smaller, change rooms, or ask someone to stay nearby while you start.",
          },
          {
            q: "Is task paralysis the same as procrastination?",
            a: "Not quite, though they overlap. Procrastination usually means choosing something more pleasant. Task paralysis tends to feel like being frozen with no pleasant alternative, and the delay is miserable. The fix differs too: pressure and deadlines can make the freeze worse, while a smaller first step often helps. See [executive dysfunction is not procrastination](/guides/executive-dysfunction-is-not-procrastination).",
          },
          {
            q: "Why can't I start even simple tasks?",
            a: "A simple-looking task can hide several decisions: where to look, what to say, when to do it. A stall often sits in those hidden decisions, not in the effort. Writing the actual first move, such as finding the number, removes most of them. If it happens a lot and hurts your daily life, a clinician can help work out why.",
          },
          {
            q: "How long should I work on a task when I'm stuck?",
            a: "Up to ten minutes is a good ceiling, and you can stop earlier. The timer is there to make the start feel finite, not to make you finish. If you get going, keep going. If you don't, write one line about where you stopped and leave it for another day.",
          },
          {
            q: "Is a to-do list good for task paralysis?",
            a: "Usually not on its own. A long list makes you choose between rows every time you look, and a row like \"sort insurance\" gives no first move. One task with a written first step works better. More on that in [why to-do lists make it worse](/guides/why-to-do-lists-make-it-worse).",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where a Companion can hold this for you",
        paragraphs: [
          "[Alongside](/shop/alongside), the ADHD Life Companion, has a walkthrough for this exact situation, called Break something down. It asks what the thing is, what would be true when it's finished, and what the first physical step is, then optionally the next two, and which of them could happen today. One of them, not the list. The steps you aren't doing today go into Life, so you don't have to carry them in your head. It shows one thing at a time, and if you stop partway it changes nothing on the item.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Alongside is a web app for admin, not a treatment, and it doesn't send anything unless you choose a date for a reminder. It won't do the step for you, but it keeps the step where you can see it.",
      },
    ],
  },

  {
    slug: "first-week-after-buying-a-house",
    title: "New house checklist: what to do in the first week",
    dek: "Shutoffs, meter readings, alarms, appliance labels and the inspection report: what to capture in the first week, while it is all in front of you.",
    primaryQuery: "new house checklist",
    next: { slug: "where-is-my-water-shutoff", reason: "Of everything to find in week one, the main water shutoff matters most in an emergency, and this shows how to locate it." },
    related: [
      { slug: "what-to-record-when-you-buy-an-appliance", reason: "Each appliance label you photograph needs a home, and this is the one-page record to copy it into." },
      { slug: "inherited-a-house-where-to-start", reason: "If the sellers left no records at all, this covers dating what you have and checking it first." },
      { slug: "moving-into-a-rental-what-to-document", reason: "Renting rather than buying, you need a different day-one list, and this covers deposit photos and lease dates." },
    ],
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
    next: { slug: "fall-home-maintenance-checklist", reason: "Autumn has the most jobs of any season, and this lays out September to November in order." },
    related: [
      { slug: "how-often-home-systems-need-servicing", reason: "For jobs that run on an interval rather than a season, this gives how often each system needs service." },
      { slug: "winterize-your-house-checklist", reason: "Freeze jobs have a hard deadline, and this covers what to finish before the first hard frost." },
      { slug: "home-maintenance-log-template", reason: "Checking jobs off is only half of it, so this shows the four fields to write each time." },
    ],
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
    next: { slug: "update-your-paperwork-after-a-life-change", reason: "Beneficiary forms go stale after a divorce, marriage or birth, and this lists what to review by event." },
    related: [
      { slug: "the-if-something-happens-to-me-file", reason: "To record which accounts have named beneficiaries and where the forms are, use this file." },
      { slug: "who-would-raise-your-children-guardian-checklist", reason: "If you have children, a guardian named in your will is another choice worth checking against your forms." },
      { slug: "talking-to-your-parents-about-their-affairs", reason: "If a parent's forms are a mystery, this offers scripts for asking about their will and finances without it going badly." },
    ],
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
    next: { slug: "simple-homeschool-record-keeping-system", reason: "After the rebuild, set up something you will keep. Three things per entry, under a minute." },
    related: [
      { slug: "homeschool-record-keeping-template", reason: "Rebuilding on a fresh page? Four columns to copy make the reconstruction quick to write up." },
      { slug: "preparing-for-a-homeschool-evaluation", reason: "An evaluation coming up before you are caught up? This lists what to bring and how to get ready fast." },
      { slug: "homeschool-attendance-what-to-track", reason: "Attendance is the record most often rebuilt last. This shows what counts as a school day and how to log it." },
    ],
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
    next: { slug: "homeschool-subject-not-working-what-to-change-first", reason: "If the check shows something did not stick, this gives the cheapest-first order for changing a stalled subject." },
    related: [
      { slug: "homeschool-reading-log", reason: "A reading log gives you something to ask about later. This shows the three columns and why quit books stay on it." },
      { slug: "what-goes-in-a-homeschool-portfolio", reason: "Write-ups of what your child can do belong in a portfolio. This covers what to keep for each subject." },
      { slug: "homeschool-weekly-plan-with-a-spare-day", reason: "Checks a week later need slack in the schedule. This weekly plan leaves a spare day on purpose." },
    ],
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
    next: { slug: "how-to-write-a-one-page-trip-itinerary", reason: "Once the bookings are recorded, this turns them into one page in time order that you can carry." },
    related: [
      { slug: "flight-changed-what-else-is-affected", reason: "When one leg moves, this explains how to walk down the chain and check each booking that rests on it." },
      { slug: "how-to-plan-a-group-trip", reason: "Several people on different legs? This covers who is on which booking and where the answers live." },
      { slug: "travel-document-checklist", reason: "Each stop may need its own documents, so this covers what to carry and where to note it." },
    ],
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
    next: { slug: "what-to-keep-on-paper-when-you-travel", reason: "Now that you know what to carry, this shows which pages to print, and why two copies beat one." },
    related: [
      { slug: "first-international-trip-checklist", reason: "New to crossing borders? This puts passport, entry rules, money and insurance in the order to sort them and how early." },
      { slug: "lost-passport-wallet-or-phone-abroad-what-to-have-ready", reason: "If a document goes missing on the road, this lists what to have ready and the one person to tell first." },
      { slug: "packing-and-planning-for-a-trip-with-kids-or-a-baby", reason: "Children need their own paperwork, so this covers what to note for each child and what to pack." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "travel",
    sources: [
      {
        name: "TSA: Identification",
        url: "https://www.tsa.gov/travel/security-screening/identification",
        retrieved: "2026-09-26",
        note: "Adult ID at the checkpoint, REAL ID enforcement from May 7, 2025, children under 18, $45 ConfirmID fee.",
      },
      {
        name: "TSA: REAL ID",
        url: "https://www.tsa.gov/real-id",
        retrieved: "2026-09-26",
        note: "How to tell a compliant license (star, flag, Enhanced).",
      },
      {
        name: "USAGov: International travel documents for children",
        url: "https://www.usa.gov/travel-documents-children",
        retrieved: "2026-09-26",
        note: "Consent letter guidance for children traveling with one parent or other adults; check the destination embassy.",
      },
      {
        name: "U.S. Department of State: Get Your Processing Time",
        url: "https://travel.state.gov/content/travel/en/passports/how-apply/processing-times.html",
        retrieved: "2026-09-26",
        note: "Routine and expedited passport timing. The fetch tool got a 403; the figures come from a search summary of this page, so verify before publishing.",
      },
      {
        name: "CBP: Six-Month Validity Update",
        url: "https://www.cbp.gov/document/bulletins/six-month-validity-update",
        retrieved: "2026-09-26",
        note: "Background only: shows six-month validity rules are country-specific. It concerns visitors entering the U.S., not U.S. citizens leaving.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "For an international trip, a U.S. traveler needs a passport that meets the destination's validity rule, any visa or entry authorization, booking references, and insurance details. For a domestic flight, an adult needs a REAL ID-compliant license or a passport. Check every traveler, children included, before you book anything nonrefundable.",
          "This is written for U.S. citizens flying out of the United States. It can't tell you what a particular country demands, because those rules differ and change. The destination's official entry page, and the State Department's country information for it, are the only place to confirm them.",
        ],
      },
      {
        kind: "table",
        heading: "Example: four people, one folder",
        intro: "An illustration, not a real family. One row per document, so a question at a desk has a three second answer. Notice the row that a plain checklist would miss: Sam's passport expires in November.",
        columns: ["Document", "Whose", "Expires", "Where kept", "Carried by"],
        rows: [
          ["Passport", "Dana", "Mar 2029", "Zip pocket, carry-on", "Dana"],
          ["Passport", "Sam", "Nov 2026", "Desk drawer, top left", "Sam"],
          ["Passport", "Ines (age 10)", "Jun 2028", "Same folder as Dana's", "Dana"],
          [
            "Insurance card and phone line",
            "Whole family",
            "Trip end",
            "Folder, plus paper page",
            "Sam",
          ],
          ["Child consent letter", "Ines", "n/a", "Folder", "Dana"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The column that does the work",
        paragraphs: [
          "A checklist that says \"passport: yes\" would pass Sam. The table catches him, because it has a date beside each name. If the trip is in December and the destination wants three or six months left after you go home, Sam has a problem, and it's a much cheaper problem to have in the spring than at check-in.",
        ],
      },
      {
        kind: "list",
        heading: "Check these before you buy anything",
        ordered: true,
        items: [
          "Open each passport to the photo page and write down the expiry date beside the person's name. Do this for every traveler, including children.",
          "Look up the destination's entry page and note two things: how long the passport must stay valid after you arrive or leave, and how many blank pages it wants. Some destinations want three or six months beyond your trip, and some ask for one or two empty pages. Others only need it valid for your stay. Write the rule down in one line so you're not re-reading a website next month.",
          "Check whether you need a visa or an electronic authorization. Some are quick online, but quick is not instant, so start early.",
          "For children traveling with one parent or with other adults, decide about a consent letter. Guidance on the usa.gov page for children's travel documents is that a child traveling with one parent should have a letter from the other parent, and one traveling with someone else should have one signed by both parents, in English and notarized when possible. The destination's embassy can tell you whether it asks for more.",
          "Make sure the name on each ticket matches the passport exactly. A mismatch is easy to fix when you book and awkward to fix at the desk.",
          "Decide who physically carries which passport, and write it in the last column of the table.",
        ],
      },
      {
        kind: "timeline",
        heading: "When to do it",
        intro: "Passport processing has been running about 4 to 6 weeks for routine service and 2 to 3 weeks for expedited, according to the State Department. Check the current figure on its site, because it moves.",
        steps: [
          {
            when: "6 months before",
            what: "Read each passport's expiry. Look up entry rules.",
          },
          {
            when: "3 months before",
            what: "Start any renewal, visa or authorization.",
          },
          {
            when: "1 month before",
            what: "Confirm names on tickets. Sort consent letters.",
          },
          {
            when: "Night before",
            what: "Print the page. Check passports are in the bag.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Domestic flights need ID too",
        paragraphs: [
          "Don't stop at the international documents. Since May 7, 2025, TSA no longer accepts a state license or ID that isn't REAL ID compliant. A compliant card carries a star, a flag symbol or an \"Enhanced\" marking. A U.S. passport works instead, and so do a few other federal IDs. If your license isn't compliant and you have nothing else, TSA says you can pay a $45 fee to use its ConfirmID process, which is a poor way to start a holiday.",
          "TSA doesn't require children under 18 to show ID on domestic flights, but airlines can set their own rule, so check the one you're flying.",
        ],
      },
      {
        kind: "list",
        heading: "What to have findable on the day",
        intro: "These are the things you'll be asked for while people are waiting behind you.",
        checkable: true,
        items: [
          "Driver's license or passport for every adult, one of them REAL ID compliant.",
          "Booking references for flights, stays and transfers, readable without hunting through email.",
          "Insurance policy number and the emergency assistance line.",
          "Prescriptions in their original packaging, plus a note of what they are, if anything might raise a question at a border. Ask your prescriber or the destination's embassy about specifics.",
          "A phone number per booking that a person actually answers.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A photo of a passport is not a backup",
        paragraphs: [
          "It won't board you and it won't clear a border. What it's good for is filling in forms and knowing what a number was. The thing that resolves a problem at a desk is knowing what exists and where it is right now: whose passport is in which bag, whether the insurance is under one person's name, which parent has the child's letter.",
          "We'd still keep a photo of each passport's photo page on your phone, and a printed copy in a different bag from the passport itself. If a passport is lost, the copy speeds up what comes next, which [this guide on lost passports, wallets and phones abroad](/guides/lost-passport-wallet-or-phone-abroad-what-to-have-ready) covers. For what to print, see [what to keep on paper when you travel](/guides/what-to-keep-on-paper-when-you-travel).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What goes wrong with more than one traveler",
        paragraphs: [
          "Two people can hold the same fact and both be wrong. Both of you assume the other renewed the passport. Each assumes the other packed the child's letter. The fix isn't more vigilance, it's one page that names the person responsible for each item. If you're sorting this for a whole group, [how to plan a group trip](/guides/how-to-plan-a-group-trip) covers who's on which booking. If you're bringing children, the [kids and baby guide](/guides/packing-and-planning-for-a-trip-with-kids-or-a-baby) covers what to note for each child.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What the Companion does with this",
        paragraphs: [
          "Travel Companion has a Documents section where you record the kind (passport, visa, insurance, ticket), a label, whose it is, where it's kept and an optional expiry date. It never accepts an upload. Anything with an expiry that falls before or during the trip, or up to about six months after it ends, shows up under \"Dates worth a look\". It only compares dates you entered and says so: it doesn't know any country's rules, so the entry page is still yours to read. The printed My Trip Book is blank, with a number column you fill in by hand. Details are on the [Travel Companion page](/shop/travel-companion).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How many months should my passport be valid for international travel?",
            a: "It depends on the destination. Some ask for six months beyond your arrival or departure, some for three months beyond departure, and some only that it's valid for your stay. Check the entry page for each country on the route, including any you only connect through, and write the answer beside the expiry date.",
          },
          {
            q: "How many blank pages do I need in my passport?",
            a: "Some countries want one blank page, some want two, and a few care about which pages are blank. The number isn't the same everywhere and it changes, so don't rely on a rule of thumb. Look at the destination's official entry information, and if your passport is nearly full, renew it before you book.",
          },
          {
            q: "Do I need a passport for a domestic flight in the U.S.?",
            a: "No. Adults need an acceptable photo ID, and since May 7, 2025 that means a REAL ID-compliant license or another accepted document such as a passport. Children under 18 don't need ID for TSA, though the airline may ask.",
          },
          {
            q: "Does a child need a notarized letter to travel?",
            a: "Guidance on usa.gov says a child traveling with one parent should carry a letter from the other parent, and a child traveling with someone else should have one signed by both parents, in English and notarized where possible. It also says entry and exit rules vary, so ask the destination's embassy.",
          },
          {
            q: "How long does it take to renew a passport?",
            a: "The State Department has listed about 4 to 6 weeks for routine service and 2 to 3 weeks for expedited service, not counting mailing. Those figures change, so read the current ones on travel.state.gov before you plan around them, and start earlier than feels necessary.",
          },
        ],
      },
      {
        kind: "callout",
        label: "Not a travel document",
        body: "A photo or scan of a passport helps with forms and with reporting a loss. It will not get you onto a plane or across a border, so the original always comes first.",
      },
    ],
  },

  {
    slug: "you-missed-a-payment-what-to-do-next",
    title: "You missed a payment. What to do in the next 48 hours",
    dek: "A five step plan for the first 48 hours, what usually happens at a few days late versus a month late, and what to say when you call.",
    primaryQuery: "missed a payment what to do",
    next: { slug: "what-to-check-before-each-direct-debit-date", reason: "Stop it happening again with a two minute check before the busiest payment date each month." },
    related: [
      { slug: "monthly-bills-list", reason: "Put every bill, with its real due date, on one list so none is left to memory." },
      { slug: "how-to-build-a-first-1000-emergency-fund", reason: "A small cash cushion is what keeps a late bill from becoming a late fee, and this shows how to build one." },
      { slug: "credit-card-minimum-payments-how-long", reason: "If the missed payment was a credit card minimum, see how long minimums take to clear a balance and what extra changes." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "CFPB: How long does information stay on my credit report?",
        url: "https://www.consumerfinance.gov/ask-cfpb/how-long-does-information-stay-on-my-credit-report-en-323/",
        retrieved: "2026-09-26",
        note: "Negative information can generally be reported for seven years.",
      },
      {
        name: "Equifax: When late credit card payments post",
        url: "https://www.equifax.com/personal/education/credit-cards/articles/-/learn/when-late-credit-card-payments-post/",
        retrieved: "2026-09-26",
        note: "Late payments generally aren't on reports for at least 30 days; late fees can come sooner; partial payments still reported.",
      },
      {
        name: "CFPB: If I can't pay my mortgage loan, what are my options?",
        url: "https://www.consumerfinance.gov/ask-cfpb/if-i-cant-pay-my-mortgage-loan-what-are-my-options-en-268/",
        retrieved: "2026-09-26",
        note: "Call the servicer first, HUD-approved counselors, HOPE Hotline, no need to pay for foreclosure help.",
      },
      {
        name: "Chase: Recovering from a late credit card payment",
        url: "https://www.chase.com/personal/credit-cards/education/basics/recovering-from-a-late-credit-card-payment",
        retrieved: "2026-09-26",
        note: "Contact the creditor, pay before 30 days, goodwill letter.",
      },
      {
        name: "CFPB: What is a grace period for a credit card?",
        url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-grace-period-for-a-credit-card-en-51/",
        retrieved: "2026-09-26",
        note: "Grace period is about avoiding interest on new purchases.",
      },
      {
        name: "CFPB: Credit Card Penalty Fees Final Rule",
        url: "https://www.consumerfinance.gov/rules-policy/final-rules/credit-card-penalty-fees-final-rule/",
        retrieved: "2026-09-26",
        note: "Checked for late fee rule status; guide does not state a fee cap.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Check that the payment actually failed, then pay the full amount today if you can. Most lenders don't report a late payment to Equifax, Experian and TransUnion until it's 30 days past due, so paying inside that window usually costs a late fee, not a mark on your report. If you can't pay, call before day 30.",
          "This is written for one missed bill, not a pile of them, and for US accounts. It can't tell you what your lender's late fee or grace period is, because that sits in your own agreement, and it isn't legal or financial advice. If you're missing payments regularly, skip to the section on when this isn't enough.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "An example: a card minimum due on the 12th",
        paragraphs: [
          "Say your card minimum of $35 was due on the 12th and it's now the 14th. Here is how the next weeks could play out, as an illustration and not a forecast.",
          "Day 1 to 29: a late fee can be added, and interest keeps running on the balance. Day 30: the lender can report the payment as 30 days late. Day 60 or more: some card agreements let the lender raise your rate on the existing balance. The CFPB's own materials note that a penalty rate can apply if you're more than 60 days late.",
          "Pay the $35 plus any late fee on the 14th and you're in the first bucket. Wait until the 45th day and you're in the second. The money owed is the same. What changes is what gets written on your report, and a reported late payment can stay there for seven years, according to the CFPB.",
        ],
      },
      {
        kind: "timeline",
        heading: "The first 48 hours, in order",
        steps: [
          {
            when: "Right now",
            what: "Confirm it failed. Log in and look for a payment marked pending, a retry, or a payment that left a different account than you expected. Screenshot the status. Some banks show a balance that hasn't caught up with what already left, which is covered in [available balance vs current balance](/guides/available-balance-vs-current-balance).",
          },
          {
            when: "Within the hour",
            what: "If you have the money, pay the full past-due amount, plus the late fee if it has been added. A partial payment inside the 30 days can still be reported as late, according to Equifax.",
          },
          {
            when: "Same sitting",
            what: "Look at every bill due before your next payday, so fixing this one doesn't cause a second miss on Friday. A single list helps, see [the monthly bills list](/guides/monthly-bills-list).",
          },
          {
            when: "Day 1, if you can't pay",
            what: "Call the lender. Use the script below. Ask what they can do before the account reaches 30 days.",
          },
          {
            when: "Right after the call",
            what: "Write down the date, the name or ID of the person, and exactly what was agreed. Ask for it in writing or by email.",
          },
          {
            when: "Day 2",
            what: "Log in again. Check the payment posted, the fee is what they said, and autopay is on or the due date is in your calendar.",
          },
        ],
      },
      {
        kind: "scripts",
        heading: "What to say when you call the lender",
        intro: "Use the number on your statement or the back of the card. Have your account number and the date of the missed payment in front of you.",
        items: [
          {
            situation: "Opening",
            line: "Hi, I missed my payment that was due on the 12th. I'd like to make it now and see what I can do about the late fee.",
          },
          {
            situation: "If you can pay today",
            line: "I can pay the full past-due amount today. Can you confirm the total, including any fee, and that this won't be reported as late?",
          },
          {
            situation: "Asking for the fee waiver",
            line: "This is the first time I've missed a payment. Would you waive the late fee as a one-time courtesy?",
          },
          {
            situation: "If you can't pay all of it",
            line: "I can pay $X today and the rest on the [date]. Is there a hardship program, a payment plan, or a date change I can use so this doesn't reach 30 days late?",
          },
          {
            situation: "If they say no",
            line: "Is there a supervisor or a retention team who can review this? I'd like to note on the account that I asked.",
          },
          {
            situation: "Closing",
            line: "Can you read back what we agreed, and can you send it to me in writing? Could I have your name or ID number?",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "If the call is the part you're avoiding",
        paragraphs: [
          "Most of the fear is in the first sentence. Say it from the script above, word for word, and the rest follows the lender's questions. If you freeze, [making a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding) is a short plan for getting it done. A lender can only offer options while the account is still open and current enough to fix, which is why this call comes before day 30, not after.",
        ],
      },
      {
        kind: "table",
        heading: "What happens by bill type",
        intro: "This is the general pattern. Your agreement or the notice on the bill is the final word.",
        columns: ["Bill", "In the first days", "At 30 days past due"],
        rows: [
          [
            "Credit card",
            "Late fee possible, interest keeps running",
            "Lender can report it late to the bureaus",
          ],
          [
            "Mortgage",
            "Late fee after the grace period in your loan terms",
            "Can be reported late. Call your servicer before it gets that far",
          ],
          ["Auto loan or personal loan", "Late fee and reminders", "Can be reported late"],
          [
            "Rent",
            "Late fee per your lease, notice from the landlord",
            "Depends on the lease. Ask what the landlord does after the fee date",
          ],
          [
            "Utilities",
            "Late fee or a disconnection notice",
            "Often handled with notices and a payment plan first. Ask the company",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "A grace period is not the same as forgiveness",
        paragraphs: [
          "On a credit card, the grace period is about interest: you skip interest on new purchases if you pay the whole balance by the due date, the CFPB explains. It doesn't give you extra days to pay without a fee. A late fee grace period, when there is one, is a separate number of days in your agreement, and mortgages and leases often include one. Look for it in the paperwork before you assume it exists.",
        ],
      },
      {
        kind: "list",
        heading: "When this isn't enough",
        ordered: false,
        items: [
          "You're already past 30 days. Pay what you can, then ask the lender for a goodwill adjustment in writing, mentioning that this is your first miss and your record before it. Chase describes this as a goodwill letter, and there is no guarantee they'll agree.",
          "You can't pay this month or next. For a mortgage, the CFPB says to call your servicer first and to contact a HUD-approved housing counselor (the HOPE Hotline is 888-995-4673) for free help. You don't have to pay anyone to help you avoid foreclosure.",
          "It's happened three times this year. Then the fix isn't a call, it's a change in how bills get tracked, and [why you keep missing bill due dates](/guides/why-you-keep-missing-bill-due-dates) walks through that.",
          "You see an error on your report. You can dispute it for free with the bureau and the lender under the Fair Credit Reporting Act.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask after a missed payment",
        items: [
          {
            q: "How many days late before it hurts my credit?",
            a: "For most accounts, a payment is reported to Equifax, Experian and TransUnion once it is 30 days past due. Before that, you can still get a late fee and interest, but Equifax says a late payment generally won't reach your reports for at least 30 days. After it's reported, later marks can follow at 60 and 90 days, so don't stop at the first one.",
          },
          {
            q: "Will one missed payment ruin my credit?",
            a: "It won't ruin it by itself, but it does count. If it's reported, the CFPB says a credit reporting company can generally keep negative information for seven years. The impact tends to fade as newer, on-time payments build up behind it. Paying before day 30 is what keeps it off the report in the first place.",
          },
          {
            q: "Can I get a late fee waived?",
            a: "You can ask, and the best time is when you call to make the payment. Lenders decide case by case. It helps if it's your first miss, and if you're paying it now. Ask once, politely, and note the answer. A fee they refuse today can sometimes be reviewed later if you keep paying on time.",
          },
          {
            q: "What if I paid but it still shows as missed?",
            a: "Check whether the payment is pending or was sent to the wrong account, then ask the lender to confirm it in writing. If a late mark is reported when you paid on time, you can dispute it for free with the credit bureau and the lender. Keep the confirmation email, bank statement line or screenshot.",
          },
          {
            q: "Should I pay the whole bill or just some of it?",
            a: "If you can, pay the full past-due amount, because Equifax notes partial payments inside the 30 days can still be reported as late. If you can't, pay what you can and call at the same time to arrange the rest. Getting the agreement in writing counts for more than the exact figure.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where Draftpace fits",
        paragraphs: [
          "A lot of missed payments come from a due date that was never written down where it would be seen. Monthly Money Reset, which is [free](/free), lets you list the bills you still owe this month and holds that money back from your safe-to-spend number. [Personal Finance Companion](/shop/personal-finance-companion) keeps each bill with its due date, lets you tick it paid, and shows what falls due in the next 14 days when you open it. It doesn't send payments or contact your lender for you.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- batch 4

  {
    slug: "what-to-write-down-in-case-something-happens-to-you",
    title: "What to write down in case something happens to me",
    dek: "The short list of things that exist only in your head, framed as two weeks away, and how to keep it findable, dull and current.",
    primaryQuery: "what to write down in case something happens to me",
    next: { slug: "the-if-something-happens-to-me-file", reason: "Once you have the short list, this shows the full file and where each item is kept." },
    related: [
      { slug: "hospital-for-two-weeks-what-would-someone-need-to-find", reason: "To check the list holds up, imagine two weeks in the hospital and see what someone could actually find." },
      { slug: "life-admin-binder-what-goes-in-it", reason: "If you prefer paper, this shows how to gather the same information into a binder with eight sections." },
      { slug: "digital-accounts-after-a-death", reason: "Passwords, photos and email are the items most often forgotten, and this covers what can be recovered." },
    ],
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
    next: { slug: "what-to-write-down-in-case-something-happens-to-you", reason: "To leave a usable record of logins and devices, start with this short list of what to write down." },
    related: [
      { slug: "how-to-find-someones-accounts-after-they-die", reason: "For money rather than photos, this shows how to trace accounts, pensions and policies." },
      { slug: "who-to-tell-when-someone-dies", reason: "Closing accounts is part of notifying, and this gives the order of who to tell." },
      { slug: "the-if-something-happens-to-me-file", reason: "To store the setup somewhere a trusted person can find it, use this file." },
    ],
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
    next: { slug: "life-admin-binder-what-goes-in-it", reason: "Once you know what to keep, this shows how to lay it out in eight sections." },
    related: [
      { slug: "the-if-something-happens-to-me-file", reason: "To record where each kept document lives, this file gives someone else a way to find it." },
      { slug: "safe-deposit-box-and-spare-keys-who-can-open-it", reason: "For the originals worth keeping outside the house, this covers deposit boxes, safes and spare keys." },
      { slug: "update-your-paperwork-after-a-life-change", reason: "After a move, marriage or new baby, some papers are out of date, and this lists where to look again." },
    ],
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
    next: { slug: "home-maintenance-log-template", reason: "Repair notes are more useful in one running place, and this sets up a home log to hold them." },
    related: [
      { slug: "appliance-warranties-what-to-track", reason: "A repair may be covered, so this shows when to check the warranty before you pay the bill." },
      { slug: "what-to-record-when-you-buy-an-appliance", reason: "The model and purchase date on your appliance record make the technician's diagnosis easier to use later." },
      { slug: "home-maintenance-you-skip-that-costs-the-most", reason: "To avoid repairs in the first place, this ranks the eight maintenance jobs that cost most when skipped." },
    ],
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
    next: { slug: "what-to-record-when-you-buy-an-appliance", reason: "Warranty dates only help if you wrote them down at purchase, and this lists the facts to record." },
    related: [
      { slug: "how-to-find-the-model-number-on-any-appliance", reason: "Warranty claims need the model number, and this shows where to find it on each type of appliance." },
      { slug: "what-to-keep-after-a-home-repair", reason: "When a repair is under way, this covers what to keep from the visit alongside the warranty paperwork." },
      { slug: "how-to-make-a-home-binder", reason: "Warranty papers belong with your other home records, and this shows how to sort them into a binder." },
    ],
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
    next: { slug: "how-to-make-a-phone-call-you-have-been-avoiding", reason: "If the call itself is what you keep avoiding, start with the full walkthrough: five things on paper and a first sentence." },
    related: [
      { slug: "how-to-say-no-or-give-bad-news-on-the-phone", reason: "For calls where you must refuse or deliver bad news, this has the opening and what to decide before you dial." },
      { slug: "the-email-you-keep-not-sending-and-how-to-chase-a-reply", reason: "When a call is too much, a written first line and a follow-up plan for silence can do the same job." },
      { slug: "first-physical-step-20-examples", reason: "Twenty examples of a first step, including the call, for admin you are stuck on." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    sources: [
      {
        name: "Consumer Financial Protection Bureau: How do I dispute a charge on my credit card bill?",
        url: "https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-a-charge-on-my-credit-card-bill-en-61/",
        retrieved: "2026-09-26",
        note: "Written billing error notice within 60 calendar days; a call alone does not preserve those rights.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Open with the problem, say what happened once, in order, then say what you want done. End your first sentence with a question so the other person has the next move. Before you hang up, get a reference number, a name, what happens next, and by when.",
          "This is for customer service, billing and account calls in the US. It can't tell you what a company owes you, and it isn't legal advice. If the call itself is what you keep avoiding, start with [how to make a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding), which covers what to write down first.",
        ],
      },
      {
        kind: "table",
        heading: "Example: a whole call in five lines",
        intro: "An illustration, not a real call. Say a refund promised two weeks ago hasn't arrived.",
        columns: ["Stage", "What you say"],
        rows: [
          [
            "Open",
            "Hi, I'm waiting on a refund that hasn't arrived. Can you tell me whether it's been sent, and when?",
          ],
          [
            "Facts, once",
            "It's $45, for the order on the 3rd. Your colleague Dana said it would take five business days on the 9th.",
          ],
          ["The ask", "I'd like the refund sent today, or a date I can rely on."],
          [
            "Read back",
            "So the refund goes out by Friday. Can I have a reference number for this call?",
          ],
          ["Close", "And your name, please? Thank you."],
        ],
      },
      {
        kind: "scripts",
        heading: "Opening lines for the common calls",
        intro: "Each opens with the problem, not an apology, and ends with a question. Change the wording until it sounds like you.",
        items: [
          {
            situation: "Wrong amount charged",
            line: "Hi, the amount I've been charged isn't what I was expecting. Can you tell me what it's for?",
          },
          {
            situation: "Charged twice",
            line: "Hi, I've been charged twice for the same thing and I'd like to get it put right. Can you look at the account for me?",
          },
          {
            situation: "Charged after canceling",
            line: "Hi, I canceled this and I've been charged since. Can you check when the cancellation was recorded?",
          },
          {
            situation: "Charge you don't recognize",
            line: "Hi, there's a charge on my account I don't recognize. Can you tell me what it is?",
          },
          {
            situation: "Refund hasn't arrived",
            line: "Hi, I'm waiting on a refund that hasn't arrived. Can you tell me whether it's been sent, and when?",
          },
          {
            situation: "Chasing something",
            line: "Hi, I got in touch about this before and I'm calling to find out where it stands. Can you look it up for me?",
          },
          {
            situation: "Canceling",
            line: "Hi, I'd like to cancel. Can you tell me what you need from me to do that?",
          },
          {
            situation: "Making a complaint",
            line: "Hi, I'd like to make a complaint. Can you tell me how that works here, and who I need to speak to?",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Say what happened, once, in order",
        paragraphs: [
          "Whoever answers can only help with the actual sequence of events. Give it once, cleanly, then say what you'd like to happen. Two or three sentences is usually enough: what happened, when, and what you want now. Leading with the ask before the facts tends to make the call longer, because they have to stop you and ask for the facts anyway.",
        ],
      },
      {
        kind: "scripts",
        heading: "When the answer is no, or you're passed along",
        intro: "Polite and specific works better than firm. Keep these at the bottom of the page.",
        items: [
          {
            situation: "They say they can't help",
            line: "I understand that's the policy. What options do I have from here?",
          },
          {
            situation: "Asking for a supervisor",
            line: "Is there someone with more authority to change this that I can speak to? I'll hold.",
          },
          {
            situation: "You're being transferred",
            line: "Before you transfer me, can I have your name and a reference for this call, in case we're cut off?",
          },
          {
            situation: "You're told to call back",
            line: "Can you note on the account that I called today and what I asked for? Then I'll say so when I call again.",
          },
          {
            situation: "You need a minute",
            line: "Can you give me a moment? I want to find that so I give you the right answer.",
          },
          {
            situation: "Nothing gets settled",
            line: "Can you tell me in writing what you've told me today? Which email or address should I expect it from?",
          },
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "Four things to get before you hang up",
        intro: "This is the part that saves the second call.",
        items: [
          "Ask them to read back what has been agreed. If you've written it down, read it to them and ask if that's right.",
          "Get a reference number for the call itself. Without it the next call starts from nothing.",
          "Get the name of who you spoke to.",
          "Ask what happens next, and by when. Ask for a date, not \"soon\".",
        ],
      },
      {
        kind: "list",
        heading: "A note to write straight after the call",
        intro: "Two minutes. It's the note you'll want if you have to call again.",
        items: [
          "Date and time of the call, and the number you dialed.",
          "Name of the person, and the reference number.",
          "What was agreed, in their words if you can.",
          "What they said happens next, and the date you'll check if it hasn't.",
          "Anything you need to send or do, with a day.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Voicemail, and when a call isn't enough",
        paragraphs: [
          "A voicemail is a small version of the same call. Say your name, one line on why you're calling, your number slowly, then your number again, and when you're free. Then write down that you left it and when. For a longer chase, an email after the call, with the reference number and what was agreed, gives you something written. [The email you keep not sending](/guides/the-email-you-keep-not-sending-and-how-to-chase-a-reply) covers that.",
          "One US-specific limit. For a wrong charge on a credit card, the Consumer Financial Protection Bureau says a phone call alone doesn't protect your rights: you send a written billing error notice to the card company within 60 calendar days after the charge appeared on your statement. Call first if you like, and then put it in writing. If it's an overdue bill you're calling about, see [you missed a payment: what to do next](/guides/you-missed-a-payment-what-to-do-next).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Being polite is enough",
        paragraphs: [
          "A lot of advice about hard calls is really about being assertive, which assumes you're too soft. You may not be. On a billing call the person answering usually has a fixed set of options and is choosing which to offer, so being clear about what you want and having the facts ready tends to help more than a harder tone. For calls where you need to refuse or give bad news, see [how to say no or give bad news on the phone](/guides/how-to-say-no-or-give-bad-news-on-the-phone).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "What do I say when I call customer service?",
            a: "Open with the problem in one sentence, end with a question, and give the facts once in order: what happened, when, and what you want. For example: \"Hi, I've been charged twice for the same thing and I'd like to get it put right. Can you look at the account?\"",
          },
          {
            q: "How do I ask for a supervisor politely?",
            a: "Ask after they've said they can't help, and frame it as needing someone who can change the outcome: \"Is there someone with more authority to change this that I can speak to?\" Stay polite, get the agent's name and a call reference first, and be ready to wait.",
          },
          {
            q: "What should I get before I hang up?",
            a: "Four things: a read-back of what was agreed, a reference number for the call, the name of the person, and what happens next with a date. Write them on the page as you hear them. It saves you from starting over next time.",
          },
          {
            q: "What do I say when I want to cancel something?",
            a: "\"Hi, I'd like to cancel. Can you tell me what you need from me to do that?\" Then ask for a confirmation number and whether a written confirmation will come. If they offer a discount to stay and you don't want it, say no once, plainly, and repeat that you want to cancel.",
          },
          {
            q: "Should I follow up a call in writing?",
            a: "For anything with money or a promise in it, yes. A short email with the date, the name, the reference number and what was agreed gives you a record. For a disputed credit card charge in the US, the written notice is what protects your rights.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where a Companion can hold this for you",
        paragraphs: [
          "[Alongside](/shop/alongside), the ADHD Life Companion, has walkthroughs for Make a phone call, Sort out a billing problem and Follow something up. Each asks a few short questions, such as what would sort it and what you have in front of you, then shows a suggested opening for your situation. You use it or write your own. During the call it shows a short list, including the reference number, the name, and what happens next. It holds no account numbers or amounts by design, only who the charge is from and how it went, in your words.",
        ],
      },
    ],
  },

  {
    slug: "how-to-deal-with-something-you-have-put-off",
    title: "How to deal with something you have put off for months",
    dek: "When the delay feels like the problem, name it in one sentence and move on to the practical question. Three lines to use, and what not to explain.",
    primaryQuery: "deal with something you have put off",
    next: { slug: "paperwork-pile-where-to-start", reason: "If part of what you have avoided is unopened mail, this shows a ten minute way to open and sort without deciding anything." },
    related: [
      { slug: "how-to-start-when-everything-is-overdue", reason: "When several things have gone past their date, this shows how to sort by who is waiting and pick one first step." },
      { slug: "task-paralysis-what-to-do-in-the-next-ten-minutes", reason: "If naming the delay does not get you moving, this ten minute way out makes the first step small enough to start." },
      { slug: "scripts-for-the-admin-calls-everyone-dreads", reason: "When the thing you put off is a call, these opening lines cover billing, chasing, canceling and complaints." },
    ],
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
    next: { slug: "what-goes-in-a-homeschool-portfolio", reason: "Most of the folder is the portfolio. This covers the five contents and why October and March samples work." },
    related: [
      { slug: "how-to-catch-up-on-homeschool-records", reason: "Behind on records with a review coming? This shows what you can rebuild and how to mark it as reconstructed." },
      { slug: "how-long-to-keep-homeschool-records", reason: "After the meeting, decide what stays in the folder. This covers how long to keep records and what to recycle." },
      { slug: "homeschool-attendance-what-to-track", reason: "Evaluators often ask about days. This shows what counts as a school day and the lightest record." },
    ],
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
    next: { slug: "how-to-write-a-one-page-trip-itinerary", reason: "After deciding who books what, this shows how to write the one page you hand to everyone else." },
    related: [
      { slug: "organising-a-multi-stop-trip-without-a-spreadsheet", reason: "When the group splits across stops, this shows how to record which bookings depend on which." },
      { slug: "packing-and-planning-for-a-trip-with-kids-or-a-baby", reason: "If some of the group are children, this covers what to pack per child and how to plan a day with slack." },
      { slug: "what-to-keep-on-paper-when-you-travel", reason: "Not everyone will open a phone app, so this covers the paper page worth handing out." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Before anyone books, settle four things in writing: who is in, who books each thing, what's fixed versus optional, and where the answers live. Then keep one list of bookings with a name beside each and the people attached. That list ends most of the messages that start with \"what time are we leaving\".",
          "This is for the person who ends up running a trip for four to twelve people, whether or not they wanted the job. It doesn't cover picking a destination by vote or splitting the money, which are separate problems that need their own tools.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The 14 messages",
        paragraphs: [
          "Say you open your phone and there are 14 unread messages in the group chat. Three of them ask what time you're leaving Thursday. One asks whether Lee is on the rental car. One is a photo of a menu. You know the answers, and so does the person who asked last week. The trouble is that the answers live in your head and in six email threads, so every question comes to you.",
        ],
      },
      {
        kind: "table",
        heading: "Example: the one page that stops the questions",
        intro: "An illustration for a group of six. Every row answers two questions at once: whose job is it, and who does it involve. The dinner row is the one that saves an argument, because Tom knew he was skipping it and nobody else did.",
        columns: ["Booking", "Booked by", "Who's on it", "Reference"],
        rows: [
          ["Flights out, Thu 9:15", "Priya", "All six", "Priya's email"],
          ["Cabin, 3 nights", "Marcus", "All six", "Marcus, ref on his page"],
          ["Rental car", "Tom", "Tom, Priya, Lee", "Tom's email"],
          ["Dinner Friday, 7:30", "Lee", "Five, not Tom", "Restaurant, Lee"],
        ],
      },
      {
        kind: "list",
        heading: "The method",
        ordered: true,
        items: [
          "List everyone who is definitely in, and everyone who is a maybe with a date you'll stop waiting. A maybe with no deadline holds up every booking.",
          "List what needs booking: transport, lodging, anything with a reserved time. For each, name one person who makes the booking. Not who pays, who makes it.",
          "Mark each item fixed or optional. Flights and lodging are usually fixed. Everything else should be optional in plain words, so nobody feels obliged to join the museum.",
          "Write down who is on each booking. Four on the flight, three in the car, five at the dinner. This is the step people skip, and it's the one that stops someone discovering at the airport that they were never on a booking.",
          "Note what each person needs once: meals, a seat, mobility, medication that changes timing. Recorded against the person, it's there when a booking is made, not remembered afterward.",
          "Put the answers on one page and send that page, not a link to a chat. See [how to write a one-page trip itinerary](/guides/how-to-write-a-one-page-trip-itinerary) for the layout.",
        ],
      },
      {
        kind: "scripts",
        heading: "Three messages worth having ready",
        intro: "Use them as written or change the words. The point is to say what you'll do and by when.",
        items: [
          {
            situation: "A deadline on a maybe",
            line: "I'm booking the cabin Sunday night. If you're in, tell me by then. If I haven't heard, I'll book for the people who've said yes.",
          },
          {
            situation: "When someone drops out",
            line: "Thanks for telling me early. I'll take you off the flight and the cabin list today. If you need anything from the booking, ask me now.",
          },
          {
            situation: "When a shared booking moves",
            line: "The flight moved to 11:40. That affects everyone on it, and I'm checking what else it touches before I tell you about the car.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "When something moves, it moves for some of you",
        paragraphs: [
          "The hard part comes when something moves. A delayed flight affects the four people on it, not the two who came separately, and working out who to tell is a job of its own. Look up what depends on what, the way [what else your trip depends on](/guides/flight-changed-what-else-is-affected) does, then add one question: which of these people are on it? If the group splits across stops, [organising a multi-stop trip without a spreadsheet](/guides/organising-a-multi-stop-trip-without-a-spreadsheet) helps with the dependencies.",
        ],
      },
      {
        kind: "list",
        heading: "What can go wrong",
        items: [
          "One person books everything and everyone assumes they know the details. Spread the booking, but keep the page in one place.",
          "Optional things drift into being mandatory. Say \"optional\" out loud.",
          "Someone isn't on a booking they thought they were. Check the who's-on-it column before the week of travel.",
          "Half the group never opens the shared document. Print or send the page, and see [what to keep on paper when you travel](/guides/what-to-keep-on-paper-when-you-travel).",
          "Money. Nothing here settles who owes whom, and we'd settle that before deposits go down, in writing.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What the Companion does with this",
        paragraphs: [
          "Travel Companion holds one traveler list, links each booking to the people actually on it, and keeps each person's requirements, such as meals or a seat. When you record a change to one booking, it shows what was built on top of it, so working out who to tell starts from what's recorded. It's one person's record, not a shared one: travelers don't get accounts, and there's no share link. To hand the shape of the trip to the others, send the itinerary PDF or the one-page trip card. It also doesn't split costs. See the [Travel Companion page](/shop/travel-companion).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How do you plan a group trip without being the organizer?",
            a: "You can't fully avoid the job, but you can shrink it. Give each booking to a named person, put the answers on one page anyone can read, and mark what's optional. The organizer's load drops when questions become lookups instead of decisions.",
          },
          {
            q: "What is the best way to keep a group trip organized?",
            a: "One page with each booking, who made it, who's on it and the reference. Everything else is detail. Send that page rather than pointing people at a chat thread, and update it whenever something changes.",
          },
          {
            q: "How far ahead should you plan a group trip?",
            a: "Book the fixed things, flights and lodging, as soon as the group is settled and you've put a deadline on the maybes. Leave optional things loose. Prices and availability change, so we'd avoid giving a fixed number of months.",
          },
          {
            q: "How do you handle someone dropping out of a group trip?",
            a: "Ask them to tell you early, take them off each booking they were on, and check whether any of those bookings has a per-person price or minimum. Then tell the rest of the group what changed, not only who left.",
          },
          {
            q: "What should a group itinerary include?",
            a: "Time, place and reference for each fixed item, with the names of the people on it. Leave off unbooked ideas and unconfirmed hours. Keep those in a separate note so the page stays short enough to be read.",
          },
        ],
      },
    ],
  },

  {
    slug: "sort-out-your-finances-after-a-life-change",
    title: "Sort out your finances after a job change, move or divorce",
    dek: "A five step order for putting your money back together, plus the traps in each event: the old retirement plan, address changes, joint accounts.",
    primaryQuery: "finances after a life change",
    next: { slug: "organize-your-finances-from-scratch", reason: "When accounts, cards and papers are scattered after the change, this gives a ten minute starting path." },
    related: [
      { slug: "financial-binder-what-to-include", reason: "Keep the new addresses, accounts and contacts together in one binder and update it on a schedule." },
      { slug: "split-bills-with-a-partner-or-roommate", reason: "Moved in with someone, or split up? See how to divide shared bills fairly and write the agreement down." },
      { slug: "monthly-bills-list", reason: "Rebuild your bill list from scratch after the move so nothing is still going to the old account." },
    ],
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
    next: { slug: "emergency-contact-and-medical-decision-maker", reason: "A useful first question to raise is who would speak for a parent about their medical care." },
    related: [
      { slug: "where-to-look-for-a-will", reason: "Knowing where a parent keeps the will is one of the simplest things to ask, and this covers where wills usually are." },
      { slug: "beneficiary-forms-override-your-will", reason: "Which form decides who gets a pension or policy is a good topic to raise, and this explains it." },
      { slug: "what-to-do-when-a-parent-dies", reason: "To see what happens if the conversation never occurs, this gives the order of tasks after a parent dies." },
    ],
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
    next: { slug: "how-often-home-systems-need-servicing", reason: "With no service history to go on, a schedule of typical intervals tells you which systems to look at first." },
    related: [
      { slug: "first-week-after-buying-a-house", reason: "Handing over the keys is the same moment as a new purchase, so this checklist covers the first week." },
      { slug: "what-to-record-when-you-buy-an-appliance", reason: "Start writing things down now with this one-page appliance record so the next owner is not guessing." },
      { slug: "home-maintenance-you-skip-that-costs-the-most", reason: "To decide where the first repair money goes, this ranks the eight jobs that cost most when skipped." },
    ],
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
    next: { slug: "what-to-record-when-you-buy-an-appliance", reason: "Once you have the model number, this lists what else to write down beside it while the machine is in front of you." },
    related: [
      { slug: "appliance-warranties-what-to-track", reason: "A model number is what a warranty claim asks for first, and this explains how to track the expiry." },
      { slug: "how-often-change-furnace-filter", reason: "Another number worth writing down is the furnace filter size, and this explains how to read it." },
      { slug: "inherited-a-house-where-to-start", reason: "When an old house has no manuals, this covers dating each appliance and knowing its typical life." },
    ],
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
    next: { slug: "do-you-have-to-count-homeschool-days-or-hours", reason: "Before you log every day, check whether your state counts days or hours at all with this guide." },
    related: [
      { slug: "homeschool-record-keeping-requirements-by-state", reason: "Attendance rules vary by state. This table shows which level yours sits in and where to confirm it." },
      { slug: "homeschool-record-keeping-template", reason: "Attendance can be one column among four. This template shows how to keep it inside the daily record." },
      { slug: "simple-homeschool-record-keeping-system", reason: "Attendance works best inside a habit you keep. This covers a system with three things per entry." },
    ],
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
    next: { slug: "homeschool-record-keeping-template", reason: "Ready for the paper or spreadsheet version? Copy the four columns and see what to leave off." },
    related: [
      { slug: "homeschool-record-keeping-for-multiple-children", reason: "Two or more children make one system easy to muddle. This shows how to file by child." },
      { slug: "how-to-catch-up-on-homeschool-records", reason: "Fell off the habit already? This covers how to rebuild what you did not write down." },
      { slug: "homeschool-record-keeping-requirements-by-state", reason: "Not sure how much your state wants you to keep? This table sets the level for all 50 states and DC." },
    ],
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
    next: { slug: "a-weekly-reset-that-survives-a-bad-week", reason: "For days when planning falls apart, a ten minute weekly reset that needs no catching up fits a bad week." },
    related: [
      { slug: "executive-dysfunction-is-not-procrastination", reason: "If starting is the barrier whatever the cause, this explains executive dysfunction and how to lower the cost of starting." },
      { slug: "first-physical-step-20-examples", reason: "Concrete first steps you can copy on a day when holding a plan in your head is unreliable." },
      { slug: "diagnosed-with-adhd-as-an-adult", reason: "If an ADHD diagnosis is part of your picture, this covers the appointments, records and backlog that follow it." },
    ],
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
    dek: "They can look identical from outside, and they can overlap. How to tell which one you're in today, and what lowers the cost of starting.",
    primaryQuery: "executive dysfunction vs procrastination",
    next: { slug: "task-paralysis-what-to-do-in-the-next-ten-minutes", reason: "To act on this rather than just understand it, this is the ten minute way out when you cannot begin." },
    related: [
      { slug: "why-you-keep-thinking-about-a-task-and-not-doing-it", reason: "If you keep thinking about the task without starting, this looks at that gap and two questions that help." },
      { slug: "first-physical-step-20-examples", reason: "Examples of first steps that lower the cost of starting, for calls, forms and documents." },
      { slug: "diagnosed-with-adhd-as-an-adult", reason: "If this sounds familiar and you have just been diagnosed, this covers the admin that follows." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    sources: [
      {
        name: "Center on the Developing Child, Harvard University: InBrief, Executive Function",
        url: "https://developingchild.harvard.edu/resources/inbrief-executive-function-skills-for-life-and-learning/",
        retrieved: "2026-09-26",
        note: "Plain description of executive function skills (focus, holding information, filtering distractions, switching); air traffic control comparison.",
      },
      {
        name: "ADDA: Executive Function Disorder and ADHD",
        url: "https://add.org/executive-function-disorder/",
        retrieved: "2026-09-26",
        note: "Executive dysfunction is not a medical diagnosis; list of associated conditions; task paralysis description.",
      },
      {
        name: "Steel, P. (2007). The nature of procrastination. Psychological Bulletin 133(1), 65-94 (University of Calgary record)",
        url: "https://ucalgary.scholaris.ca/items/d0dea740-4751-4e9a-84da-2d8ad446830d",
        retrieved: "2026-09-26",
        note: "691 correlations; strongest predictors task aversiveness, delay, self-efficacy, impulsiveness, self-control and organization.",
      },
      {
        name: "NIMH: Attention-Deficit/Hyperactivity Disorder",
        url: "https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd",
        retrieved: "2026-09-26",
        note: "ADHD inattention described as trouble staying on task or organized, often continuing into adulthood; symptoms can interfere with daily life.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Procrastination is putting something off even though you expect the delay to cost you, usually because something else feels better right now. Executive dysfunction is a plain-language label for trouble with skills like starting, planning and holding several steps in mind. The two overlap, and you can do both in one afternoon.",
          "This is for anyone who keeps not starting things they do want done. It can't tell you why it happens or whether you have a condition, and it isn't medical advice.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "An example: the same form, two different Tuesdays",
        paragraphs: [
          "Say a parking permit renewal is due Friday. It's a one-page form and you know where it is. On the first Tuesday you think about it, decide the game on your phone sounds better, play for an hour, and feel a small hit of relief followed by a small hit of guilt. That's what most people mean by procrastination: a choice, made with your eyes open, to trade later for now.",
          "On the second Tuesday the form is on the desk. You sit down with it and nothing happens. You aren't enjoying anything else. You look at the first field, look at your phone, look at the form again, and forty minutes later you feel worse than when you sat down. Outside, the two Tuesdays look the same: the form wasn't touched. Inside, the second one is the kind of stuck that people often describe as executive dysfunction. This is an illustration, not a case.",
        ],
      },
      {
        kind: "table",
        heading: "How the two often differ",
        intro: "These are tendencies, not tests. Plenty of people land in the middle, and one person can be in either column on different days.",
        columns: ["", "Procrastination", "Executive dysfunction"],
        rows: [
          [
            "What you do instead",
            "Something more appealing, on purpose",
            "Often nothing, or something you aren't enjoying",
          ],
          [
            "How it feels",
            "Avoidance, with some relief",
            "Stuck, with little or no relief",
          ],
          [
            "Do the stakes help",
            "Often, when the deadline gets close",
            "Often not, and for many people more pressure adds distress",
          ],
          [
            "Does breaking it down help",
            "A little",
            "Often a lot, if the first piece is small enough to see",
          ],
          [
            "Where the trouble sits",
            "Wanting to do it now",
            "Getting started, holding the steps, or sequencing them",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the difference is not always clean",
        paragraphs: [
          "Executive function is the set of mental skills that let you plan, focus, hold information in mind, filter distractions and switch tasks. The Center on the Developing Child at Harvard compares it to an air traffic control system. Trouble with those skills is called executive dysfunction, but it is a description of a pattern, not a diagnosis of its own. ADDA says so directly, and lists ADHD, autism, depression, brain injury and several other conditions as common companions.",
          "Procrastination research points in a similar direction from the other side. Piers Steel's 2007 review of 691 correlations found that the strongest predictors were how unpleasant the task is, how long the payoff is delayed, how confident you feel about doing it, impulsiveness, and organization and self-control. In other words, a task that is boring, unclear and far from any reward is easy to put off, and so is a task you don't feel able to organize. The same afternoon can contain both.",
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "Five questions to ask yourself about today",
        intro: "You're not trying to name a condition. You're picking which kind of help to try first.",
        items: [
          "Is there something you'd rather be doing? If yes, you're probably choosing. If you're doing nothing, or something you don't enjoy, starting itself may be the wall.",
          "Could you say the first physical action out loud, such as open the form or find the account number? If you can't, the task hasn't been broken down yet. Try [twenty examples of a first step](/guides/first-physical-step-20-examples).",
          "Would a deadline in an hour get you moving? If it would, delay is more likely. If you'd sit there looking at it anyway, more pressure probably isn't the missing piece.",
          "Is it one task, or a pile? A pile is usually a sorting problem before it's a starting problem. [How to start when everything is overdue](/guides/how-to-start-when-everything-is-overdue) covers that.",
          "Are you also short on sleep, ill, grieving or flat? Those change how much capacity you have on any given day, and a smaller first step is a fair response to all of them.",
        ],
      },
      {
        kind: "compare",
        heading: "What to try for each",
        left: {
          label: "If you're choosing something nicer",
          items: [
            "Take away the nicer option for twenty minutes: phone in another room, tab closed.",
            "Make the unpleasant part shorter. Decide you'll do only the first field.",
            "Attach a small, real reward you'll actually give yourself afterward.",
            "Say the deadline to someone who will ask how it went.",
          ],
        },
        right: {
          label: "If starting itself is the wall",
          items: [
            "Shrink the first step until it's something a person watching could see: pick up the form, put it on top of the keys.",
            "Put what you need in front of you first: the reference number, the date, the letter.",
            "Remove decisions. Choose today's one thing and leave the rest out of sight.",
            "Stop when the small step is done. Doing more is allowed, not required.",
          ],
        },
      },
      {
        kind: "paragraphs",
        heading: "When this doesn't work, and what to do about it",
        paragraphs: [
          "A smaller first step won't fix everything. If a task is stuck because you're afraid of what it will say, or because you're exhausted, you may need to deal with the fear or the exhaustion first, and the step may need to be a text to someone rather than the task itself. Shame also builds. The longer a thing sits, the more it feels like it says something about you, and that weight is real even when the task is small. Naming it once, then doing one tiny thing, usually costs less than waiting for the feeling to pass. [Task paralysis: what to do in the next ten minutes](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes) walks through it.",
          "If starting things has been this hard for months, is affecting your work, money or health, and isn't explained by a bad stretch, it's worth raising with a doctor or a mental health professional. They can look at what's behind it, which a guide can't. If you already have a diagnosis or suspect one, [diagnosed with ADHD as an adult](/guides/diagnosed-with-adhd-as-an-adult) covers the paperwork side.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Is executive dysfunction just an excuse for procrastinating?",
            a: "No, but they can look the same and can happen together. Procrastination is a choice to delay something you expect to regret delaying. Executive dysfunction describes trouble with skills like starting and organizing. Either way, the useful question is what would lower the cost of starting today, not who is to blame.",
          },
          {
            q: "Is executive dysfunction a real diagnosis?",
            a: "Not on its own. Organizations such as ADDA describe it as a set of symptoms, not a medical diagnosis, and it shows up with ADHD, autism, depression, brain injury and other conditions. If you're worried about what's behind it, a doctor or mental health professional can assess that. This guide can't.",
          },
          {
            q: "How do I know if I'm procrastinating or can't start?",
            a: "Ask whether you'd rather be doing something else. If you're choosing something more pleasant, that leans toward procrastination. If you're doing nothing, or something you don't enjoy, and a deadline wouldn't move you, starting itself may be the barrier. It can be both, and it can change by day.",
          },
          {
            q: "Why can't I start a task even when I know it's important?",
            a: "Knowing it's important isn't the same as being able to begin. Starting takes holding the purpose, the first step and the materials in mind at once, and that is hard when you're tired, stressed or short on capacity. Many people find a tiny, visible first step easier than more urgency.",
          },
          {
            q: "What helps when I can't get started?",
            a: "Shrink the first step until it's something you could see happen, like finding the letter or opening the form. Put what you need in front of you, pick one thing rather than a list, and let yourself stop after it. If it's constant and hurting your life, talk to a professional.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "If the second Tuesday sounds familiar, [ADHD Life Companion](/shop/alongside) does the shrinking with you. You keep the thing once, and Now shows one card instead of a list. Choose Do this with me, and its Break something down walkthrough asks what the first physical step is, then asks which one could happen today, with the note that it's one of them, not the list. It doesn't diagnose anything, ask about symptoms or medication, or time you, and stopping partway leaves the item as it was.",
        ],
      },
    ],
  },

  {
    slug: "what-to-keep-on-paper-when-you-travel",
    title: "What to print before you travel: a one-page paper list",
    dek: "Phones die at the wrong moment. The one page worth printing, including your hotel address in the local language, and why two copies beat one.",
    primaryQuery: "what to print before you travel",
    next: { slug: "travel-document-checklist", reason: "For the full list of what each traveler needs and where each document is kept, read this next." },
    related: [
      { slug: "how-to-write-a-one-page-trip-itinerary", reason: "The printed page works best as a short timetable, and this shows what goes on each line." },
      { slug: "lost-passport-wallet-or-phone-abroad-what-to-have-ready", reason: "If the paper copy is all you have left, this covers what to gather and who to tell first." },
      { slug: "night-before-you-travel-checklist", reason: "Do the printing the evening before with this short list of six checks that leave the morning free." },
    ],
    publishedAt: "2026-08-30",
    updatedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Print one page: where you're staying, with the address in the local language if you don't read it; a booking reference and phone number for each flight, stay and transfer; your insurance policy number and assistance line; one contact at home; and a copy of each passport's photo page, kept away from the passport. Print two copies and put them in different bags.",
          "This is for anyone traveling with a phone that will, at some point, be at 4 percent, in a taxi, in a city where you can't read the signs. It won't replace your passport or a boarding pass, and it can't help if you forget to print it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The taxi at midnight",
        paragraphs: [
          "You've landed. There's no signal yet, or roaming hasn't switched on. The driver asks where you're going, and the address is in your booking email, which is on a phone that won't load it. A printed page with the address written the way the driver reads it is the cheapest fix in this whole guide.",
        ],
      },
      {
        kind: "table",
        heading: "Example: what the page looks like",
        intro: "An illustration with invented details. The whole page fits on one side, or it doesn't get printed. Write phone numbers that a person answers, not a general help line you'd need a code to reach.",
        columns: ["Line", "What to write", "Example"],
        rows: [
          [
            "Staying",
            "Name, and address as written locally",
            "Hotel Aurora, Rua das Flores 12, 1200-195 Lisboa",
          ],
          ["Flights", "Reference and airline phone", "Ref K7QD2M, airline desk 555-0100"],
          ["Transfer", "Company, reference, phone", "Airport shuttle, ref 8841, 555-0142"],
          [
            "Insurance",
            "Policy number, assistance line",
            "Policy 4471, 24-hour line 555-0177",
          ],
          ["At home", "One person who knows your plans", "Jo, 555-0123"],
          ["Passports", "Photo page copies, kept apart", "In the second bag"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The address in the local language",
        paragraphs: [
          "It earns its place more often than anything else on the page and almost no one adds it. A driver who doesn't read your alphabet can read the address as it's written locally. It costs nothing, and it fixes the moment when you're tired, in the wrong place and can't explain where you need to be. Copy it from your booking, or from the property's own website, exactly as it's written there.",
        ],
      },
      {
        kind: "list",
        heading: "What to leave off",
        items: [
          "Card numbers, passwords, and anything that would hurt if the page were lost. The page is meant to be carried around, so treat it as something that could go missing.",
          "Full passport numbers are a judgment call. They help when reporting a loss, but a photo-page copy kept in a separate bag does the same job, and we'd choose that.",
          "Anything you'd have to update every day. If it changes, it belongs on the phone.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Two copies, in different bags",
        paragraphs: [
          "Put one copy in your hand luggage and one in a different bag, or with another traveler. The thing you're guarding against includes losing a bag, and a single copy in the lost bag helps no one. For a family, give each adult a copy.",
        ],
      },
      {
        kind: "list",
        heading: "Paper and phone should agree",
        items: [
          "Save the same information offline on your phone as a screenshot or a downloaded file. A page you have to load won't open without signal.",
          "Send it to one person at home, so someone can read it to you if everything else fails.",
          "Keep your itinerary in the same form: see [how to write a one-page trip itinerary](/guides/how-to-write-a-one-page-trip-itinerary).",
          "Do the printing the evening before, with the [night-before list](/guides/night-before-you-travel-checklist).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What paper can't do",
        paragraphs: [
          "A printed page isn't a travel document. It doesn't replace a passport, a visa, a boarding pass or a ticket you're required to show, and the airline or border officer decides what they accept. For the documents themselves, see the [travel document checklist](/guides/travel-document-checklist). If the worst has happened and the paper is what you have left, [what to have ready if you lose your passport, wallet or phone](/guides/lost-passport-wallet-or-phone-abroad-what-to-have-ready) says who to tell first.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What the Companion does with this",
        paragraphs: [
          "Travel Companion makes a one-page trip card from what you've recorded: who's going, where, how you're getting there and where you're staying, with children marked. It leaves out booking references, documents and notes on purpose, so you write those beside it in pen. It also prints My Trip Book, a blank planner of roughly 70 pages by default, in Letter or A4, and you print only the pages you want. Nothing you enter is copied into the book. See the [Travel Companion page](/shop/travel-companion).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Should I print my travel documents?",
            a: "Print the ones you'd need if the phone failed: booking references, addresses, insurance details and a copy of each passport's photo page. Printing doesn't replace the originals. Carry the paper in a different bag from the passport, so one loss doesn't take both.",
          },
          {
            q: "Should I carry a photocopy of my passport?",
            a: "We'd carry a copy of the photo page, kept apart from the passport. It's not a travel document and it won't get you across a border, but it makes reporting a loss quicker. Keep an offline copy on your phone as well.",
          },
          {
            q: "What should I print before an international trip?",
            a: "One page: the address of where you're staying in the local language, references and phone numbers for each booking, insurance details, a contact at home, and any consent letter for a child. Add your itinerary if it's short enough for one page.",
          },
          {
            q: "Do I need a printed hotel address in the local language?",
            a: "It isn't required, but it helps when a driver or passerby doesn't read your alphabet. Copy the address exactly as the property writes it, and print it large enough to read in a moving car.",
          },
          {
            q: "Is it enough to screenshot my bookings?",
            a: "A screenshot works with no signal, but it depends on the phone still having battery and working. It's a good second copy, not a first one. Paper keeps working when the phone doesn't.",
          },
        ],
      },
    ],
  },

  {
    slug: "what-to-check-before-each-direct-debit-date",
    title: "What to check before your bills come out each month",
    dek: "A two minute check before your busiest payment date: which account each bill leaves from, what changed, and why to bunch dates near payday.",
    primaryQuery: "what to check before bills come out",
    next: { slug: "monthly-bills-list", reason: "Build the full list of what leaves your account, including the bills that are not monthly." },
    related: [
      { slug: "you-missed-a-payment-what-to-do-next", reason: "When a payment has already failed, this covers what to do in the first 48 hours." },
      { slug: "how-much-of-your-money-is-actually-safe-to-spend", reason: "Take the bills due before payday off your balance to see what is really yours to spend." },
      { slug: "budget-for-variable-bills", reason: "For bills that change amount every month, this sets a planning figure so the check has a number to compare with." },
    ],
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
    next: { slug: "how-much-of-your-money-is-actually-safe-to-spend", reason: "See the full five step method behind this quick check, with a worked example and the negative number case." },
    related: [
      { slug: "available-balance-vs-current-balance", reason: "If the balance in your app looks higher than the money you have, learn the difference between posted and available." },
      { slug: "sinking-funds-explained", reason: "Annual and quarterly bills skew a purchase check, and a sinking fund is how you save for them in advance." },
      { slug: "how-to-save-money-fast", reason: "Decided you cannot afford it yet? These small moves free up cash within a single month." },
    ],
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
    next: { slug: "what-goes-in-a-homeschool-portfolio", reason: "To know what belongs in the keep pile first, see the five portfolio contents and per-subject samples." },
    related: [
      { slug: "preparing-for-a-homeschool-evaluation", reason: "If an evaluator may ask to see last year's work, this covers what to bring." },
      { slug: "how-to-catch-up-on-homeschool-records", reason: "Threw something out too soon, or never kept it? This shows how to reconstruct the record." },
      { slug: "homeschool-record-keeping-requirements-by-state", reason: "Retention depends on your state. Look up your level in this table and confirm at the source." },
    ],
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
    next: { slug: "paperwork-pile-where-to-start", reason: "After a diagnosis comes paperwork; this shows how to open and sort a pile without deciding anything in a hurry." },
    related: [
      { slug: "executive-dysfunction-is-not-procrastination", reason: "To understand why starting is hard, this explains executive dysfunction and how it differs from procrastination." },
      { slug: "why-you-keep-missing-bill-due-dates", reason: "Missed due dates are a common cost of stalled admin; this sets up a system that does not rely on remembering." },
      { slug: "life-admin-with-brain-fog", reason: "If illness or grief is also in the picture, this builds life admin around the bad day, not the good one." },
    ],
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
    next: { slug: "why-productivity-tools-fail-at-life-admin", reason: "Now that you know what life admin is, see why to-do lists and productivity apps handle it badly and what a better tool must do." },
    related: [
    ],
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
    next: { slug: "life-admin-the-work-nobody-teaches-you", reason: "If the mismatch is new to you, start with what life admin is, its three traits and who ends up carrying it." },
    related: [
    ],
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
    dek: "Take-home pay, every bill, real spending from your statements, then subtract. A $3,240 example month, a fix for a negative number, a weekly check.",
    primaryQuery: "how to make a monthly budget",
    next: { slug: "how-much-of-your-money-is-actually-safe-to-spend", reason: "Take the one number from your first budget and turn it into what you can spend today." },
    related: [
      { slug: "organize-your-finances-from-scratch", reason: "If the four things you need are spread across apps and notes, start here to pull them together." },
      { slug: "50-30-20-rule-where-it-breaks", reason: "Compare your first budget with the 50/30/20 split and see where a fixed rule stops fitting." },
      { slug: "why-budgeting-apps-stop-working-after-two-months", reason: "Wondering why first budgets get dropped? See four ways they break and what one that lasts needs." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "CFPB: Budgeting, how to create a budget and stick with it",
        url: "https://www.consumerfinance.gov/archive/blog/budgeting-how-to-create-a-budget-and-stick-with-it/",
        retrieved: "2026-09-26",
        note: "The four steps to build a budget (income, spending, bill due dates, working budget) and reviewing it each month.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Write down your take-home pay, list every bill with its due date, estimate everyday spending from your last two or three months of statements, and subtract. Put a savings line in before the extras. What's left over is your number for the month, and it should be zero or more.",
          "This is for one person or household with mostly regular pay, in US dollars. If your pay swings from month to month, start with [how to budget with irregular income](/guides/how-to-budget-with-irregular-income). A budget can't tell you what you should spend, only what you do spend and what's left.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Say you're paid $1,495 every two weeks. Multiply by 26 paychecks and divide by 12 and you get about $3,240 a month, which is the figure to budget from. In the two months a year with a third paycheck, treat the extra one as a bonus and leave it out of the plan.",
          "Here is the whole month, line by line. It's an example, so swap in your own numbers.",
        ],
        heading: "An example: $3,240 a month, one line at a time",
      },
      {
        kind: "table",
        columns: ["Line", "Amount", "Where the number comes from"],
        rows: [
          ["Take-home pay", "$3,240", "$1,495 x 26 paychecks / 12 months"],
          [
            "Fixed bills",
            "$1,828",
            "Rent $1,450, utilities $145, phone $55, internet $60, car insurance $118",
          ],
          [
            "Groceries and getting around",
            "$580",
            "Groceries $420, fuel $160, from the last three statements",
          ],
          ["Card minimum", "$45", "The minimum due on the statement"],
          ["Savings", "$150", "Set first, before the extras"],
          [
            "Everyday extras",
            "$540",
            "Eating out $190, entertainment $90, household and clothes $140, personal $120",
          ],
          ["Left over", "$97", "$3,240 minus everything above"],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Two things to notice. Savings sits above the extras, so it gets paid before the flexible money is spent, not from whatever survives. And $97 is left over on purpose: a first budget that lands at exactly zero breaks the first time a grocery run comes in $30 high.",
        ],
      },
      {
        kind: "list",
        items: [
          "Find your take-home pay. Use what lands in your account after tax and deductions, not your salary. Paid every two weeks, multiply one paycheck by 26 and divide by 12. Paid weekly, multiply by 52 and divide by 12.",
          "List every bill with its due date. Open last month's statements and write down rent, utilities, phone, insurance, loan payments and card minimums. Anything that bills once or twice a year gets divided by 12; [sinking funds explained](/guides/sinking-funds-explained) shows how. The [monthly bills list](/guides/monthly-bills-list) has a layout to copy.",
          "Estimate the rest from real statements. Add up groceries, fuel and eating out for each of the last two or three months and use the average, not what you think you spend. A guess almost always runs low.",
          "Put savings and debt payments in before the extras. Even $25 a paycheck counts. With no cushion yet, [a first $1,000](/guides/how-to-build-a-first-1000-emergency-fund) is where to send it.",
          "Subtract. Income minus every line above. Zero or more is a working budget. Below zero, use the next section.",
          "Pick one weekday for a check-in and put it in your calendar today.",
        ],
        heading: "How to build yours in about an hour",
        ordered: true,
      },
      {
        kind: "list",
        items: [
          "Has any income come in or changed?",
          "Has a bill changed or been paid?",
          "Is there spending you haven't added?",
          "Does your savings or cushion need adjusting?",
        ],
        heading: "The five minute weekly check-in",
        intro: "Once a week, ask these four. Update the line for any yes. If all four are no, you're finished for the week.",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "If you fall behind for a few weeks, don't rebuild the gap. [Start from today's balance](/guides/how-to-start-over-after-budget-failure) and go forward. At the end of each month, [a short review](/guides/end-of-month-money-review) tells you which lines to change for the next one.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Say the same month adds up to $3,410 against $3,240 of pay. You're $170 short. Before you cut anything, check the line you guessed. Pull the statements for your biggest estimated line, usually groceries or eating out, and see whether the estimate was low.",
          "Then change one bill first, because it repeats every month: phone, internet and insurance are the usual candidates. Trim one flexible line after that, not all of them. If it's still short, the gap comes from income, and no trimming will close it, which is better to know in week one than in month three. [How to find $200 this month](/guides/how-to-save-money-fast) lists specific moves, and [the 50/30/20 rule](/guides/50-30-20-rule-where-it-breaks) shows why a fixed percentage split can fail in a tight month.",
          "If you use a credit card, budget its purchases in the month you make them and don't count the card payment as a second expense.",
        ],
        heading: "If your number comes out below zero",
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "What is the easiest way to make a budget for the first time?",
            a: "Subtract your bills and your average spending from your take-home pay and see what's left. You don't need more than a few lines: bills, groceries and transit, extras and savings. The CFPB's steps are the same four: list income, look at spending, map bill due dates, then build a working budget you review every month.",
          },
          {
            q: "How much should I put toward savings in a first budget?",
            a: "Whatever you can keep up for three months, even $25 a paycheck. A rule like 20 percent is a starting point that can break in a tight month. Set the amount so the month still works at its lowest, then raise it once you've watched a month close with money to spare.",
          },
          {
            q: "Do I have to track every purchase?",
            a: "No. A first budget needs a look at last month's statements to set the numbers, then a weekly check on the few lines that move. Logging every purchase is the part that's easiest to drop, and the weekly check does most of the same work in five minutes.",
          },
          {
            q: "How often should I check my budget?",
            a: "Once a week for about five minutes, on a fixed day, plus a longer look at month end when you set the next month's numbers. A fixed day means it happens without a decision. Daily checking tends to turn into a chore you skip.",
          },
          {
            q: "What if my income is different every month?",
            a: "Budget from your lowest recent months rather than the average, and treat anything above that as extra. [How to budget with irregular income](/guides/how-to-budget-with-irregular-income) walks through it with a holding account and a steady monthly pay for yourself.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "[Monthly Money Reset](/free) takes the same inputs: what's in your account now, the income you expect and when, the bills you want held back, and any reserve. You type them in over five short steps and it shows one figure, what's safe to spend, with the working written out beneath it. It doesn't set category limits, so it isn't a full plan like the example above. It is the fastest way to see this month's number, and its four-question weekly check-in is the routine in this guide.",
          "If your money is spread over several accounts, bills, subscriptions and debts, [Personal Finance Companion](/shop/personal-finance-companion) keeps them in one place and shows a typical month: what comes in, what goes out, what's set aside for goals and what's left over. You enter the numbers yourself; neither product connects to your bank.",
        ],
        heading: "Where Companion products fit",
      },
      {
        kind: "callout",
        label: "Before you start",
        body: "Open last month's bank and card statements first. Every number in your budget should come from them, not from memory.",
      },
    ],
  },

  {
    slug: "how-to-budget-with-irregular-income",
    title: "How to budget with irregular income: count what has landed",
    dek: "Budget from your lowest months, not your average. Pay yourself a steady amount from a holding account, set tax aside, and count only money that has landed.",
    primaryQuery: "how to budget with irregular income",
    next: { slug: "how-to-build-a-first-1000-emergency-fund", reason: "With pay that swings, a starter cushion covers the low months without reaching for a card." },
    related: [
      { slug: "how-much-of-your-money-is-actually-safe-to-spend", reason: "Apply the same take-off method to the money that has landed so far this month." },
      { slug: "sinking-funds-explained", reason: "Set money aside monthly for the bills that arrive quarterly or yearly, even when income moves." },
      { slug: "budget-for-variable-bills", reason: "Bills that change in size add to the swing, and this sets a planning figure for each one." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "IRS: Estimated taxes",
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/estimated-taxes",
        retrieved: "2026-09-26",
        note: "Estimated payments generally due if you expect to owe $1,000 or more; four payment periods.",
      },
      {
        name: "IRS: Self-employed individuals tax center",
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center",
        retrieved: "2026-09-26",
        note: "Self-employment tax is Social Security and Medicare tax, separate from income tax.",
      },
      {
        name: "IRS: About Form 1040-ES",
        url: "https://www.irs.gov/forms-pubs/about-form-1040-es",
        retrieved: "2026-09-26",
        note: "Estimated tax covers income without withholding, such as self-employment; Tax Withholding Estimator.",
      },
      {
        name: "CFPB: Budgeting, how to create a budget and stick with it",
        url: "https://www.consumerfinance.gov/archive/blog/budgeting-how-to-create-a-budget-and-stick-with-it/",
        retrieved: "2026-09-26",
        note: "Budgets start from all income sources, including self-employment, and bill due dates.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Budget from your lowest recent months, not your average. Send every deposit to a holding account, then pay yourself the same amount on the same days, like a salary. Count only money that has actually arrived, and hold back bills before anything else. The holding account absorbs the gap between good and slow months.",
          "This is for freelance, gig, tip, seasonal and commission income in US dollars. It can't set your tax rate, and it works best with a few months of history. With none, start with [a first $1,000 cushion](/guides/how-to-build-a-first-1000-emergency-fund).",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Say you freelance, and over six months $2,900, $1,850, $4,100, $2,300, $3,350 and $2,700 land in your account after you've moved your tax share aside. That's $17,200, or about $2,867 a month. Three of those six months came in under that average, so a budget built on it would have been wrong half the time.",
          "Instead, average your three lowest months: ($1,850 + $2,300 + $2,700) / 3 is about $2,283. Round to $2,300 and pay yourself that every month from a holding account that started with $900. This is an example, not a forecast.",
        ],
        heading: "An example: six months of deposits",
      },
      {
        kind: "table",
        columns: ["Month", "Deposits", "You pay yourself", "Holding account after"],
        rows: [
          ["Jan", "$2,900", "$2,300", "$1,500"],
          ["Feb", "$1,850", "$2,300", "$1,050"],
          ["Mar", "$4,100", "$2,300", "$2,850"],
          ["Apr", "$2,300", "$2,300", "$2,850"],
          ["May", "$3,350", "$2,300", "$3,900"],
          ["Jun", "$2,700", "$2,300", "$4,300"],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "In February you earned $450 less than your pay and nothing changed in checking. The holding account covered it and still held $1,050. By June it holds $4,300, which is your cue to raise your pay a little or start a fund for slow seasons. Six good months won't predict the next six, so keep the quarterly check in the steps below.",
        ],
      },
      {
        kind: "list",
        items: [
          "Pull 6 to 12 months of deposits. Total what actually landed each month. With less history, use what you have and expect to adjust.",
          "Set your pay near your low, not your average. Average the three lowest months, then check that it covers your bills with something left. If it doesn't, the bills need work first: see [budgeting for variable bills](/guides/budget-for-variable-bills) and the [monthly bills list](/guides/monthly-bills-list).",
          "Move your tax share aside the day a deposit lands. If you're self-employed in the US, nobody withholds for you. The IRS says you generally need to make estimated tax payments if you expect to owe $1,000 or more when you file, spread over four payment periods, and self-employment tax comes on top of income tax. A tax professional or the IRS Tax Withholding Estimator can give you your share. This guide can't.",
          "Open a holding account and send every deposit there. A second account at the same bank works. Nothing gets spent from it directly.",
          "Pay yourself on a schedule. Move your pay into checking in two transfers, say the 1st and the 15th, so checking never holds a full month you could spend early. Bills come out of checking.",
          "Review once a quarter. If the holding account holds more than a month of your pay, raise your pay a little. If it has shrunk three months in a row, lower it.",
        ],
        heading: "Set it up in six steps",
        ordered: true,
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Between deposits, the risk is spending money that's coming but isn't here. An invoice you've sent isn't income until it clears. Keep it on a list so you know it's on the way, and keep it out of the number you spend from. When it lands, move the tax share, put the rest in the holding account, and only then does your month change. A client who pays late then costs you nothing you'd planned around.",
          "Also find your tightest day. If your pay transfers land on the 1st and 15th but rent leaves on the 3rd, the low point is the 4th. Walk your checking balance forward day by day using only dated bills and transfers, and move a bill or a transfer date before the dip, not after.",
        ],
        heading: "Count only what has landed",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Use a big month in this order: tax share first, then top up the holding account until it holds one month of your pay, then set money aside for [annual bills](/guides/sinking-funds-explained), then debt or savings, and extras last. Don't raise your pay after one good month. Wait for the quarterly review.",
        ],
        heading: "What to do with a big month",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "It fails when your lowest month doesn't cover your bills, or when a slow spell lasts longer than the holding account can bridge. You then have two levers: cut fixed bills or raise the floor of your income. Neither is a budgeting trick, and no method makes up that gap. With a thin holding account, your first target is one month of pay.",
        ],
        heading: "When this doesn't work",
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "How do you budget when your income changes every month?",
            a: "Base the budget on your lowest recent months, not your average. Send deposits to a holding account and pay yourself a fixed amount from it on set dates. Pay bills from checking, and count only money that has already arrived. A good month tops up the holding account and a slow month draws it down.",
          },
          {
            q: "Should I budget from my average income or my lowest month?",
            a: "Your lowest months, or the average of the lowest three as in the example above. The average includes big months you can't count on. Budgeting near the low means most months finish above plan, and a month that beats your plan is the kind of surprise to have.",
          },
          {
            q: "How much should a freelancer set aside for taxes?",
            a: "There isn't one percentage that fits, because it depends on your income, deductions and state. The IRS says estimated payments are generally due if you expect to owe $1,000 or more, and self-employment tax applies too. Ask a tax professional or use the IRS estimator, then move that share aside the day each deposit lands.",
          },
          {
            q: "How big should the holding account be?",
            a: "Aim for one month of your pay first, then work toward three. Until you get there, keep your pay near your lowest months so the account grows in ordinary months. If you have nothing saved, a [first $1,000](/guides/how-to-build-a-first-1000-emergency-fund) comes before anything else.",
          },
          {
            q: "What if a client pays late?",
            a: "Nothing changes if you're paying yourself from the holding account and haven't counted the invoice as money. A late payment shows up as a smaller top-up later, not a missed bill. If it happens often, keep a list of open invoices and follow up a few days before each due date.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "[Monthly Money Reset](/free) is built on the received-only rule. Income you're expecting sits on the list and doesn't count until you mark it received, so the safe-to-spend figure only rises when money lands. You add bills with due dates and it holds them back. You can add your tax share and holding-account top-up as a reserve so they come out of the number too. It also shows about how much you have per week for the rest of the month, and names your tightest day when a real dip lies ahead.",
          "It covers one month at a time and doesn't connect to your bank, so you type deposits in as they arrive.",
        ],
        heading: "Where Monthly Money Reset fits",
      },
      {
        kind: "callout",
        label: "One rule to keep",
        body: "Nothing you're owed is income until it's in your account. Write invoices down, but spend only from what has landed.",
      },
    ],
  },

  {
    slug: "how-to-build-a-first-1000-emergency-fund",
    title: "How to build your first $1,000 emergency fund",
    dek: "A $1,000 starter fund keeps small surprises off a card. Pick a weekly amount, find the first deposit, choose where to keep it and know when to use it.",
    primaryQuery: "$1,000 emergency fund",
    next: { slug: "sinking-funds-explained", reason: "Next, save monthly for predictable costs such as car repairs or annual fees so they do not tap this fund." },
    related: [
      { slug: "debt-snowball-vs-avalanche", reason: "Carrying card debt as well as building a cushion? Compare snowball and avalanche orders to see which costs less." },
      { slug: "how-to-save-money-fast", reason: "Need the first deposit? Four small moves free up cash within a single month." },
      { slug: "how-to-budget-with-irregular-income", reason: "If your pay changes month to month, see how to plan only from money that has arrived." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "CFPB: An essential guide to building an emergency fund",
        url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
        retrieved: "2026-09-26",
        note: "Size a fund on past surprises; tax refunds, automatic transfers, paycheck splitting; account types; use it when needed and rebuild.",
      },
      {
        name: "FDIC: National rates and rate caps",
        url: "https://www.fdic.gov/national-rates-and-rate-caps",
        retrieved: "2026-09-26",
        note: "National average savings account rate of 0.37% in the latest posting.",
      },
      {
        name: "FDIC: Deposit insurance",
        url: "https://www.fdic.gov/deposit-insurance",
        retrieved: "2026-09-26",
        note: "$250,000 per depositor per insured bank.",
      },
      {
        name: "Federal Reserve: Economic Well-Being of US Households in 2024, Savings and Investments",
        url: "https://www.federalreserve.gov/publications/2025-economic-well-being-of-us-households-in-2024-savings-and-investments.htm",
        retrieved: "2026-09-26",
        note: "63 percent of adults could cover a $400 expense with cash or its equivalent.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Open a separate savings account, then move a fixed amount into it every payday until it reaches $1,000. At $50 a week that takes 20 weeks, at $25 a week, 40. Start with a tax refund or something you sell if you can. Use it only for costs that are unexpected, necessary and can't wait.",
          "This is a first cushion in US dollars, not a full emergency fund, which is usually sized in months of expenses. It can't tell you the right number for you. The CFPB suggests sizing a fund on the surprises you've actually had, so if a car or dependents make yours bigger, aim higher.",
        ],
      },
      {
        kind: "table",
        columns: ["You save", "How often", "Time to $1,000"],
        rows: [
          ["$25", "Every week", "40 weeks"],
          ["$50", "Every week", "20 weeks"],
          ["$100", "Every two weeks", "20 weeks (10 paychecks)"],
          ["$200", "Every month", "5 months"],
          ["$400", "Every month", "3 months (the third deposit can be $200)"],
        ],
        heading: "How long $1,000 takes at different amounts",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "You don't have to build all of it from paychecks. Say you get a $410 tax refund and sell a bike for $180. That's $590 on day one. At $35 a week, the last $410 takes 12 weeks. Same $1,000, about a quarter of a year, and most of it never came out of your monthly budget. The numbers are an example; use your own.",
        ],
        heading: "An example: a refund and one sale",
      },
      {
        kind: "list",
        items: [
          "Open a separate savings account at an FDIC-insured bank. Skip the linked debit card if you can. A little friction is the point.",
          "Choose an amount from the table. Pick the one that leaves your month intact, even if it looks small. A small amount you keep up beats a big one you drop after six weeks.",
          "Automate it. Set a recurring transfer for the day after payday, or ask your employer to split your direct deposit. The CFPB lists both.",
          "Find the first chunk. A tax refund, a bonus or a gift, something you sell, or one month of trims from [how to find $200 this month](/guides/how-to-save-money-fast).",
          "Check your tightest day before the first transfer, so it doesn't pull checking under a bill. [How much of your money is safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend) shows the check.",
        ],
        heading: "Set it up in five steps",
        ordered: true,
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Keep it in an account that's separate from the one you spend from, insured, and reachable within a day or two. The FDIC insures deposits up to $250,000 per depositor per insured bank. Interest is minor at this size: the FDIC publishes a national average savings rate, 0.37% in its latest posting, which is $3.70 a year on $1,000. An account paying ten times that would earn $37. Rates vary by bank, so look at what yours pays, but don't hold up opening the account while you compare.",
        ],
        heading: "Where to keep it",
      },
      {
        kind: "table",
        columns: ["Situation", "Use the fund?", "Why"],
        rows: [
          [
            "Car repair that keeps you getting to work",
            "Yes",
            "Unexpected, necessary, can't wait",
          ],
          ["Urgent vet or medical bill", "Yes", "Unexpected and can't wait"],
          ["A slow week of lost hours", "Yes", "It replaces income you counted on"],
          [
            "Annual car insurance premium",
            "No",
            "You knew it was coming: use [a sinking fund](/guides/sinking-funds-explained)",
          ],
          ["A sale on a laptop", "No", "A want with a deadline set by the store"],
          ["A friend's wedding trip", "No", "Predictable, so plan and save for it"],
        ],
        heading: "What counts as an emergency",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "We'd build the $1,000 first even if you're carrying card debt. Without it, the next surprise goes on the card and undoes your payments. Once it's in place, send extra toward the debt; [snowball vs avalanche](/guides/debt-snowball-vs-avalanche) compares the orders.",
          "The limits are plain. $1,000 won't cover a job loss or a large medical bill. A lost job is a different size of problem. When you spend from it, refill it, then aim for one month of bills, then three.",
        ],
        heading: "Debt first, or the fund first?",
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "How long does it take to save $1,000?",
            a: "It depends on the amount you move each payday. $50 a week takes 20 weeks, $100 every two weeks also takes 20, and $200 a month takes 5 months. A tax refund or a one-time sale can cut that by months, so start with those if you have them.",
          },
          {
            q: "Is $1,000 enough for an emergency fund?",
            a: "It covers small surprises such as a car repair, a vet visit or a broken phone. It won't cover a job loss or a large medical bill, and full emergency funds are usually sized in months of expenses. Treat $1,000 as the first step, then build toward one month of bills and then three.",
          },
          {
            q: "Should I pay off debt or build an emergency fund first?",
            a: "We'd build the $1,000 first. Without a cushion, a surprise goes back on the card and undoes the payments you made. After the $1,000 is in place, put extra toward the debt, and refill the cushion whenever you use it.",
          },
          {
            q: "Where should I keep my emergency fund?",
            a: "In a savings account at an FDIC-insured bank, separate from your everyday account. It should be easy to reach within a day or two but not sitting next to your debit card. The CFPB also lists a credit union, a prepaid card or cash, though cash can be lost or stolen.",
          },
          {
            q: "What counts as an emergency?",
            a: "Something unexpected, necessary and unable to wait: an urgent repair, a medical or vet bill, or lost income. A sale, a trip or a bill you knew was coming doesn't count. Bills you can see coming belong in a [sinking fund](/guides/sinking-funds-explained), so the cushion stays for surprises.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "[Personal Finance Companion](/shop/personal-finance-companion) has a savings goal type called Emergency fund. You type in the target, what you've saved so far and, if you want a monthly figure, a target date. It then works out the monthly amount needed and shows progress on the Today screen. Progress is what you type: it doesn't connect to your bank or move money, and it flags a goal that has no target date.",
          "If you only want to keep the cash out of reach, [Monthly Money Reset](/free) lets you hold an amount in reserve, so it comes out of your safe-to-spend figure. It doesn't track a goal or move money.",
        ],
        heading: "Where Companion products fit",
      },
      {
        kind: "callout",
        label: "Keep it simple",
        body: "Automate one transfer and leave the account alone. The day you use it, write down the amount so refilling it is already on your list.",
      },
    ],
  },

  {
    slug: "how-to-save-money-fast",
    title: "How to find $200 this month without a big life change",
    dek: "Seven specific moves with rough dollar amounts, worked into an example month that adds up to $200, plus scripts for the calls.",
    primaryQuery: "how to save money this month",
    next: { slug: "how-to-build-a-first-1000-emergency-fund", reason: "Give the cash you free up somewhere to go, with a four step pace for a first $1,000." },
    related: [
      { slug: "how-to-find-every-subscription-you-are-paying-for", reason: "Hunt down forgotten charges with a twelve month statement sweep before cutting anything else." },
      { slug: "how-to-cancel-subscriptions", reason: "Found a service to drop but the company pushes back? These scripts and steps help you get out." },
      { slug: "budget-for-variable-bills", reason: "Bills that swing can hide easy savings, and this shows how to plan toward the high month." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "CFPB: Budgeting, how to create a budget and stick with it",
        url: "https://www.consumerfinance.gov/archive/blog/budgeting-how-to-create-a-budget-and-stick-with-it/",
        retrieved: "2026-09-26",
        note: "Tracking spending is the easiest way to look for places to cut back; map bill due dates.",
      },
      {
        name: "CFPB: An essential guide to building an emergency fund",
        url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
        retrieved: "2026-09-26",
        note: "Automatic transfers, tax refunds and other windfalls as ways to start saving.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "To find $200 this month, cancel what you forgot you pay for, call your phone, internet and insurance providers and ask for a lower rate, waive one bank fee, plan one lean week of food, and sell one thing you don't use. Most of it repeats, so it keeps paying after the month ends.",
          "This is for US households with a normal budget and one month to improve, not for a shortfall bigger than $200 a month. The amounts below are an example, not a promise. Your bills decide what's there to find.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Here is one month that adds up to exactly $200. Your list will look different, so use it as a menu.",
        ],
        heading: "An example: seven moves, $200",
      },
      {
        kind: "table",
        columns: ["Move", "Saves", "Repeats?"],
        rows: [
          [
            "Cancel a $15.99 streaming plan and a $9.99 app you've stopped using",
            "$26",
            "Every month",
          ],
          ["Ask for a lower phone rate, from $85 to $55", "$30", "Every month"],
          [
            "Ask the internet provider for its lowest price for existing customers",
            "$15",
            "Until the price changes",
          ],
          ["Get two quotes and move car insurance", "$22", "Every month"],
          [
            "Drop a $12 monthly account fee, by changing account type or banks",
            "$12",
            "Every month",
          ],
          ["One week of meals from the pantry and freezer", "$45", "This month only"],
          ["Sell one thing you no longer use", "$50", "Once"],
          ["Total", "$200", ""],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "$105 of that repeats every month, which is $1,260 over a year. The other $95 is a boost for this month only. That's why we'd start at the top of the table, not the bottom.",
        ],
      },
      {
        kind: "list",
        items: [
          "Pull last month's bank and card statements and highlight every charge that repeats. The CFPB's budgeting guide calls tracking your spending the easiest way to look for places to cut back. For the full sweep, including annual charges, see [how to find every subscription you're paying for](/guides/how-to-find-every-subscription-you-are-paying-for).",
          "Cancel first, then call. [How to cancel subscriptions](/guides/how-to-cancel-subscriptions) has the steps if a company pushes back. Note the date the cancellation takes effect: a plan canceled on the 20th may still bill on the 28th.",
          "Call your phone, internet and car insurance providers with the script below.",
          "Search your statements for the word fee. Ask about each one. Some can be waived, and some come from an account type you can change.",
          "Plan one lean week of food, not a lean month. A single week is easy to finish.",
          "Pick one thing to sell and list it today.",
          "Move the money the day you free it. Send the amount to savings on payday, since the CFPB lists automatic transfers as a way to make saving stick.",
        ],
        heading: "Work through it in this order",
        ordered: true,
      },
      {
        kind: "scripts",
        items: [
          {
            situation: "Phone plan",
            line: "I've been with you a while and I'm paying $85 a month. I'd like to stay. What's the lowest rate you can give me on my current line?",
          },
          {
            situation: "Internet",
            line: "My price has gone up since I signed. What offers do you have for existing customers? I'd rather not switch, so what's the lowest monthly price for the same speed?",
          },
          {
            situation: "Car insurance",
            line: "I have a quote that's $22 a month lower for the same coverage. Can you match it, or tell me which discounts I'm missing?",
          },
          {
            situation: "Bank fee",
            line: "I see a $12 monthly maintenance fee. What would it take to waive it, or is there an account without one?",
          },
        ],
        heading: "What to say on the calls",
        intro: "Have your account number and your current monthly rate in front of you. If the first person can't help, ask for the retention or loyalty team.",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Savings show up next month, not this one. A canceled plan usually stops at the next renewal and a new insurance rate starts with the new policy. For this month, the sale and the lean week are what you'll see in your account, which is $95 in the example.",
          "A lower rate can also end, so ask when the price changes and note the date. Cutting small treats or chasing cashback saves little and costs attention, so leave them. And if your bills already exceed your income by more than $200, this list won't close the gap. Build [a first budget](/guides/how-to-budget-for-beginners) and look at the largest fixed bills.",
          "Before you send the $200 to savings, check the lowest day your checking balance will reach this month, so you don't take out the rent. [How much of your money is safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend) walks through it.",
        ],
        heading: "What can go wrong",
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "How can I save $200 in a month?",
            a: "Combine a few of the moves above: cancel unused subscriptions, ask your phone, internet and insurance providers for lower rates, drop a bank fee, plan one lean week of food and sell one thing. No single move gets to $200 for most households, but seven small ones can.",
          },
          {
            q: "What is the fastest way to save money?",
            a: "Cancel recurring charges you no longer use and sell something you don't need. Both can work within a week. Calls to providers take an hour but repeat every month. Cutting food or fun saves money too, and it's the hardest to keep up.",
          },
          {
            q: "Is it worth calling to lower my bills?",
            a: "It costs about an hour and the worst answer is no. Ask for a specific price, ask what offers exist for existing customers, and say you're comparing options. Results vary by provider and nothing is guaranteed, but a lower rate repeats every month once you have it.",
          },
          {
            q: "Where should I put the $200 I save?",
            a: "If you have no cushion, send it toward a first $1,000. [How to build your first $1,000 emergency fund](/guides/how-to-build-a-first-1000-emergency-fund) covers pace and where to keep it. If you carry card debt, a small cushion first still keeps the next surprise off the card.",
          },
          {
            q: "What if I can't find $200?",
            a: "Then find what you can. $60 a month that repeats is $720 in a year. If your bills are larger than your income, the answer lies in the big fixed lines such as rent, insurance and debt payments, not in small cuts.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "[Personal Finance Companion](/shop/personal-finance-companion) has a subscriptions area. You add each one with its amount, how often it bills and its renewal date, then mark a decision: Keep, Reviewing, Planned cancellation or Cancelled. It shows a monthly total, with annual charges divided by 12, and flags a planned cancellation or a kept annual renewal 14 days ahead. It doesn't cancel anything or read your bank, so you type them in.",
          "To stop the freed money from disappearing into spending, [Monthly Money Reset](/free) lets you add it as a reserve, which takes it out of your safe-to-spend figure.",
        ],
        heading: "Where Companion products fit",
      },
      {
        kind: "callout",
        label: "Try this today",
        body: "Before you close this page, pick the one charge you're most sure you don't use and cancel it. Write down the date its next bill would have landed.",
      },
    ],
  },

  {
    slug: "how-to-start-over-after-budget-failure",
    title: "You fell off your budget: how to restart this month",
    dek: "You do not need to catch up on six weeks of receipts. You need today's balance, the bills still coming, and one clear number.",
    primaryQuery: "how to restart a budget",
    next: { slug: "how-much-of-your-money-is-actually-safe-to-spend", reason: "Calculate the one number you need today from your balance and the bills still coming." },
    related: [
      { slug: "how-to-budget-for-beginners", reason: "Prefer a fresh start with a proper first budget? This walks through it from four inputs." },
      { slug: "end-of-month-money-review", reason: "Set up a ten minute month end review so the next slip gets caught in weeks, not months." },
      { slug: "why-budgeting-apps-stop-working-after-two-months", reason: "See the four ways budgets break, and what one needs to still be in use after month two." },
    ],
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
    next: { slug: "what-to-check-before-each-direct-debit-date", reason: "Before next month begins, run the two minute check on each bill and the account it leaves from." },
    related: [
      { slug: "how-to-start-over-after-budget-failure", reason: "Month ended badly and you want to reset? This restarts a budget from today's balance." },
      { slug: "sinking-funds-explained", reason: "Choose what carries over by putting money toward big costs you can already see coming." },
      { slug: "subscription-tracker-what-to-track", reason: "Add a five minute renewal check to your month end review with these six subscription fields." },
    ],
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
    next: { slug: "subscription-tracker-what-to-track", reason: "After you cancel, keep a tracker of six fields so the next renewal cannot slip by unnoticed." },
    related: [
      { slug: "how-to-find-every-subscription-you-are-paying-for", reason: "Not sure everything you pay for is on your list yet? Sweep twelve months of statements first." },
      { slug: "how-to-save-money-fast", reason: "Cancelling frees money right away, and these small moves show what else is worth cutting this month." },
      { slug: "end-of-month-money-review", reason: "Use the month end review to confirm the charge really stopped and spot new ones." },
    ],
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
    next: { slug: "winterize-your-house-checklist", reason: "When the first frost is close, this narrows the season down to the freeze jobs with a deadline." },
    related: [
      { slug: "home-maintenance-checklist-by-month", reason: "To see the same jobs across the whole year, this spreads them month by month." },
      { slug: "how-often-change-furnace-filter", reason: "Changing the furnace filter is part of heating prep, and this says how often and which size." },
      { slug: "where-is-my-water-shutoff", reason: "Frozen pipes are the costly fall risk, so know where the main valve is with this guide." },
    ],
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
    next: { slug: "home-maintenance-log-template", reason: "After the freeze jobs are finished, this shows what to write down so next year takes five minutes." },
    related: [
      { slug: "fall-home-maintenance-checklist", reason: "For the longer view of September to November, this puts the whole fall in order." },
      { slug: "where-is-my-water-shutoff", reason: "Burst pipes are what you are guarding against, and this shows where to shut the water off if one goes." },
      { slug: "how-often-home-systems-need-servicing", reason: "Heating service is one of the jobs on this interval table, so you can see when it next falls due." },
    ],
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
    next: { slug: "what-to-keep-after-a-home-repair", reason: "A log entry is only as good as the notes, and this covers what to write after a technician visits." },
    related: [
      { slug: "how-often-home-systems-need-servicing", reason: "To know when the next entry is due, this gives the interval for each system in the house." },
      { slug: "how-to-make-a-home-binder", reason: "The log is one section of a binder, and this shows the others and what should stay out." },
      { slug: "moving-into-a-rental-what-to-document", reason: "In a rental, a dated record helps at move-out, and this covers what to document on day one." },
    ],
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
    next: { slug: "how-often-home-systems-need-servicing", reason: "Filters are one line on a longer list, and this gives the interval for every other system." },
    related: [
      { slug: "home-maintenance-log-template", reason: "Write each change in a running log, and this shows how to keep one that you will use." },
      { slug: "home-maintenance-you-skip-that-costs-the-most", reason: "Filters and gutters lead the jobs people skip, and this ranks eight that cost most later." },
      { slug: "fall-home-maintenance-checklist", reason: "Heating prep in fall starts with the filter, and this puts the other jobs in order." },
    ],
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
    next: { slug: "how-to-make-a-home-binder", reason: "Put the shutoff location on the page where anyone can find it, and this shows how to build that binder." },
    related: [
      { slug: "winterize-your-house-checklist", reason: "Turning off outdoor taps and draining lines comes with freeze prep, and this covers the full job list." },
      { slug: "first-week-after-buying-a-house", reason: "Finding the shutoff is one item on the first-week list, and this covers the others to check." },
      { slug: "inherited-a-house-where-to-start", reason: "If you inherited a house, locating shutoffs is the first task, and this covers what else to check." },
    ],
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
    next: { slug: "what-to-record-when-you-buy-an-appliance", reason: "The appliance sheet is the page most binders lack, and this shows exactly what to write on it." },
    related: [
      { slug: "home-maintenance-log-template", reason: "A binder needs a maintenance section, and this shows what to write in the log each time." },
      { slug: "where-is-my-water-shutoff", reason: "A binder is only useful if the shutoff is on a page, and this explains how to find the valve." },
      { slug: "appliance-warranties-what-to-track", reason: "Warranty paperwork has a place in the binder, and this covers what to track on each one." },
    ],
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
    next: { slug: "where-is-my-water-shutoff", reason: "Even as a renter, you should know the main shutoff, so this shows how to find it and check it turns." },
    related: [
      { slug: "first-week-after-buying-a-house", reason: "If you later buy a place, this covers what to capture in the first week." },
      { slug: "home-maintenance-log-template", reason: "Keep a dated list of what you report to the landlord, and this shows a simple log format." },
      { slug: "how-to-make-a-home-binder", reason: "To keep the lease and photos in one place, this shows how to make a binder for the home." },
    ],
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
    next: { slug: "credit-card-minimum-payments-how-long", reason: "See what only paying the minimum costs in months and interest, then what an extra amount changes." },
    related: [
      { slug: "how-to-build-a-first-1000-emergency-fund", reason: "Keep a small cushion beside the payoff plan so one surprise does not put you back on the card." },
      { slug: "you-missed-a-payment-what-to-do-next", reason: "If you slipped and missed a debt payment, here are the first steps and what to say when you call." },
      { slug: "50-30-20-rule-where-it-breaks", reason: "Decide how much of your month can go to debt at all by testing the 50/30/20 rule against your numbers." },
    ],
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
    next: { slug: "budget-for-variable-bills", reason: "For any bill that changes each month, use twelve months of history to pick a planning amount." },
    related: [
      { slug: "sinking-funds-explained", reason: "Turn the quarterly and annual bills on your list into a saved monthly amount with a simple formula." },
      { slug: "what-to-check-before-each-direct-debit-date", reason: "With your list done, check which account each bill leaves from and when before payday." },
      { slug: "split-bills-with-a-partner-or-roommate", reason: "Sharing rent and utilities? See how to divide each line on the list fairly between two or more people." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A monthly bills list has six columns: name, amount, due day, how often, essential or not, and shared or not. Write every bill on it, including the quarterly and annual ones, and divide those into a monthly amount so you can see what a normal month really costs. It takes about half an hour to build.",
          "This is for anyone paying bills from one or two accounts who wants the whole picture on one page. It can't tell you what a changing bill will be next month, only how to plan for the high end, and it leaves out subscriptions, which have [their own tracker](/guides/subscription-tracker-what-to-track).",
        ],
      },
      {
        kind: "table",
        heading: "An example list: eight bills and one normal month",
        intro: "Example only, not real data. The Shared column is left off because none of these bills are split. The last column is the one you add up.",
        columns: ["Bill", "Amount", "Due", "How often", "Essential", "Per month"],
        rows: [
          ["Rent", "$1,450", "1st", "Monthly", "Yes", "$1,450"],
          ["Electric", "$70 to $120", "18th", "Monthly", "Yes", "$120"],
          ["Internet", "$45", "26th", "Monthly", "Yes", "$45"],
          ["Phone", "$38", "9th", "Monthly", "Yes", "$38"],
          ["Car insurance", "$612", "Jan, Apr, Jul, Oct 15", "Quarterly", "Yes", "$204"],
          ["Car registration", "$132", "Aug 30", "Annual", "Yes", "$11"],
          ["Streaming", "$15", "5th", "Monthly", "No", "$15"],
          ["Gym membership", "$96", "Nov 12", "Annual", "No", "$8"],
          ["Total", "", "", "", "", "$1,891"],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Add the five bills that land every month and you get $1,668. The real figure is $1,891. The $223 gap is car insurance, registration and the gym membership, and none of them shows up in a typical month of banking activity until the day it lands. Electric is counted at $120, the high end of its range, so a cheap month leaves you ahead instead of short.",
        ],
      },
      {
        kind: "list",
        heading: "Build it in four passes",
        ordered: true,
        items: [
          "Open three months of statements and pull out every charge that repeated, with its amount. Three months catches everything monthly. It won't catch the rest, which is what the next pass is for.",
          "Add the bills that don't come monthly. Look through last year's statements, search your email for the words renewal and invoice, and go through the checklist below. If you can't find one, write it down anyway with a question mark.",
          "Write a due day against every row: the day of the month for monthly bills, a real date for the others. Anything you can't date goes on a short second list titled find the date, because a bill with no date can't be planned around.",
          "Mark which bills are essential, fill in the Shared column for anything you split, then do the monthly math in the next table.",
        ],
      },
      {
        kind: "table",
        heading: "Turn every bill into a monthly amount",
        intro: "Multiplying a weekly bill by four undercounts it, because a year has 52 weeks and not 48. Every two weeks has the same trap: it's 26 payments a year, not 24.",
        columns: ["How often", "Do this", "Example"],
        rows: [
          ["Weekly", "Multiply by 52, divide by 12", "$20 a week is $86.67 a month"],
          [
            "Every two weeks",
            "Multiply by 26, divide by 12",
            "$50 every two weeks is $108.33 a month",
          ],
          ["Twice a month", "Multiply by 2", "$40 twice a month is $80"],
          ["Monthly", "Use it as it is", "$45 stays $45"],
          ["Quarterly", "Divide by 3", "$612 every three months is $204"],
          ["Every six months", "Divide by 6", "$300 twice a year is $50"],
          ["Annual", "Divide by 12", "$96 a year is $8"],
        ],
      },
      {
        kind: "list",
        heading: "Bills that tend to be missing from the list",
        intro: "Tick the ones you pay. Each is easy to leave off because it doesn't land every month.",
        ordered: false,
        checkable: true,
        items: [
          "Renters or home insurance, if it's billed once or twice a year",
          "Car registration and inspection",
          "Property tax, if it isn't paid through your mortgage",
          "HOA or condo fees, if they're billed quarterly",
          "Professional license or union dues",
          "Annual memberships and domain renewals",
          "Tax preparation fees or software",
          "Dental, vision or pet insurance billed yearly",
          "School or activity fees paid by term",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Bills that change, and bills that don't come monthly",
        paragraphs: [
          "Electric, water and phone bills move around. Write a low and a high in the Amount column and count the high. If you have twelve months of history, [how to budget for bills that change every month](/guides/budget-for-variable-bills) shows how to pick a planning figure.",
          "For the non-monthly bills, putting a small amount aside each month is what keeps a $612 bill from feeling like an emergency. That's covered in [sinking funds](/guides/sinking-funds-explained). Today, pick the largest bill that isn't monthly and work out its monthly amount.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When the list doesn't work",
        paragraphs: [
          "A list only helps while its dates are true. Three things break it. It gets built once and never checked. It has amounts but no dates, so it can't tell you what falls due before payday. Or it mixes what you owe with what you'd like to spend, and the total stops meaning anything.",
          "Check it against your statement once a quarter, when the quarterly bills land. If you keep missing due dates even with a list in front of you, [why you keep missing bill due dates](/guides/why-you-keep-missing-bill-due-dates) is about the habit side, and [what to check before each direct debit date](/guides/what-to-check-before-each-direct-debit-date) covers which account each bill leaves from. A list shows what leaves your account. It doesn't tell you which bills can be negotiated or skipped, and it isn't advice on either.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions about a monthly bills list",
        items: [
          {
            q: "What should be on a monthly bills list?",
            a: "Every payment you owe on a schedule: rent or mortgage, utilities, insurance, phone, internet, loan and card minimums, plus the quarterly and annual bills. For each one write the amount, the due day, how often it comes and whether it's essential. Subscriptions can share the page or have their own list, as long as they're written down somewhere.",
          },
          {
            q: "How do I list bills that aren't monthly?",
            a: "Put them on the same list with their real due date and how often they come, then add a per-month column. Divide a quarterly bill by three, a six-monthly one by six and an annual one by twelve. A $612 quarterly insurance bill becomes $204 a month. The date tells you when to pay it, and the monthly figure tells you what to set aside.",
          },
          {
            q: "Should I sort my bills by due date or by amount?",
            a: "Sort by due date. The list's job is to show what falls due next, and date order shows the crowded weeks, such as three bills landing between the 1st and the 5th. If you get paid on a fixed schedule, you can add a column for which paycheck covers each bill.",
          },
          {
            q: "Is a bills list the same as a budget?",
            a: "No. A bills list covers only what you owe on a schedule, and its total is what a normal month costs before any spending. A budget adds income and everything else. Doing the list first gives a budget its firmest number, and [how to budget for beginners](/guides/how-to-budget-for-beginners) picks up from there.",
          },
          {
            q: "How often should I update my bills list?",
            a: "Update it when a bill changes, when you start or end a service, and once a quarter against your statements. Five minutes at the end of each month is usually enough, and the [end of month money review](/guides/end-of-month-money-review) has a place for it.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where Draftpace fits",
        paragraphs: [
          "[Personal Finance Companion](/shop/personal-finance-companion) has a Bills screen with these fields: name, amount (blank if it varies, or a low and a high), frequency (monthly, quarterly, annual or custom), due day or date, essential, and a shared percentage. You type the bills in, or paste them from notes or a file and review each one before it counts. It shows the monthly total, what's left to pay this month as you tick bills off, and a note on any bill with no due date.",
          "One thing to know before you rely on it: its Available Money figure subtracts a full month of bills whether or not you've ticked them paid, so read it as a month-level estimate. It doesn't read your bank. If you want the lighter route, [Monthly Money Reset](/free) is free and holds back the bills you still owe this month from a safe-to-spend figure.",
        ],
      },
      {
        kind: "callout",
        label: "Do this today",
        body: "Find the one bill on your list with no due date and look it up. Write the date next to it before you close this page.",
      },
    ],
  },

  {
    slug: "organize-your-finances-from-scratch",
    title: "How to organize your finances when everything is scattered",
    dek: "Bank apps, statements, a notes file and a lot in your head: a ten minute starting page you can fill in from memory, with the gaps marked.",
    primaryQuery: "how to organize your finances",
    next: { slug: "how-to-budget-for-beginners", reason: "Ready to turn the pile into a plan? Build a monthly budget from four things and a worked example." },
    related: [
      { slug: "financial-binder-what-to-include", reason: "Once the pieces are found, give them a permanent home in a seven section binder." },
      { slug: "bank-statement-csv-to-budget", reason: "If a bank statement is the only record you have, see how to turn a downloaded file into usable rows." },
      { slug: "monthly-bills-list", reason: "Write down every bill with its due date, the first thing worth pulling out of the mess." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "IRS: How long should I keep records?",
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records",
        retrieved: "2026-09-26",
        note: "Three years from filing as the standard period, longer in some cases, check creditor and insurer requirements.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "To organize scattered finances, take ten minutes and write down what you already know in six areas: accounts, income, bills, subscriptions, debts and goals. Put a question mark next to anything you're unsure of instead of guessing. Then pick one number to find first, close one gap, and set a day to look at the page again.",
          "This is for the moment when your money information is spread across bank apps, a notes file, a drawer and your memory, and you couldn't say what's due next week. You don't need any statements to start. It won't find accounts you've forgotten exist, and it isn't tax or legal advice.",
        ],
      },
      {
        kind: "table",
        heading: "An example page, filled in from memory",
        intro: "Example only. Say it's a Sunday evening and this is everything you can write in five minutes with no logging in. The question marks are the useful part.",
        columns: ["Area", "What you write", "Gap to close"],
        rows: [
          [
            "Accounts",
            "Checking at the credit union, about $1,900. Savings, about $4,000?",
            "Log in and confirm both balances",
          ],
          [
            "Income",
            "Paycheck, about $2,600 every two weeks, next one Friday",
            "Check the amount after taxes",
          ],
          [
            "Bills",
            "Rent $1,450 on the 1st. Electric ?. Car insurance ?, date ?",
            "Find the electric range and the insurance date",
          ],
          [
            "Subscriptions",
            "Streaming, phone backup, gym?",
            "Search your email for receipt and renewal",
          ],
          [
            "Debts",
            "Visa about $2,600, rate ?. Student loan, payment about $120",
            "Find the Visa's interest rate",
          ],
          ["Goals", "Emergency fund, $5,000, by next summer", "None yet"],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Every question mark on that page is a specific errand: log in, look up a date, find a rate. A page that says where it's unsure is more use than one that fills the blanks with guesses, because you can see which numbers not to plan around yet.",
        ],
      },
      {
        kind: "timeline",
        heading: "The ten minutes, in order",
        steps: [
          {
            when: "Minutes 0 to 2",
            what: "List where your money information lives: bank apps, a statements folder, notes, a spreadsheet, a drawer, your head. Don't open any of them yet.",
          },
          {
            when: "Minutes 2 to 6",
            what: "Fill in the six areas from memory. Round numbers are fine. Write a question mark next to anything you'd be guessing.",
          },
          {
            when: "Minute 7",
            what: "Circle the number you most want: either what's free to spend, or when a debt ends. That decides which question mark you chase first.",
          },
          {
            when: "Minutes 7 to 9",
            what: "Close one gap. A good first one is a bill with no due date, since a missed date is what costs a fee.",
          },
          {
            when: "Minute 10",
            what: "Pick a day to look at the page again: weekly if you're catching up, monthly once things are steady. Put it in your calendar, with the page's location.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why start from memory, not from a pile of statements",
        paragraphs: [
          "The usual advice is to collect every statement and login before you do anything. We'd skip that. When you already feel behind, the gathering is where it stalls: the folder is enormous, half the logins are lost and nothing has been decided yet. A page from memory is wrong in places, but it shows you which places, and it takes ten minutes instead of a weekend. Do the gathering afterward, one question mark at a time.",
        ],
      },
      {
        kind: "list",
        heading: "Where to go next, by the number you picked",
        ordered: false,
        items: [
          "You want to know what's free to spend: [how much of your money is actually safe to spend](/guides/how-much-of-your-money-is-actually-safe-to-spend) works from three numbers off your page.",
          "You keep missing due dates: build [a monthly bills list](/guides/monthly-bills-list), which turns the Bills line into a schedule.",
          "You suspect subscriptions: [find every subscription you pay for](/guides/how-to-find-every-subscription-you-are-paying-for).",
          "You only have a downloaded bank file: [how to use a bank statement CSV](/guides/bank-statement-csv-to-budget).",
          "You want a monthly plan: [how to budget for beginners](/guides/how-to-budget-for-beginners).",
          "Everything already feels overdue: [how to start when everything is overdue](/guides/how-to-start-when-everything-is-overdue).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What to keep, and how long",
        paragraphs: [
          "Once the page exists, the papers need a home. For tax records, the IRS says to keep them for three years from the date you file in the usual case, with longer periods in some situations, and to check whether creditors or insurers want theirs kept longer. That's a general rule for the United States and not advice on your return. A [financial binder](/guides/financial-binder-what-to-include) gives the papers a place. The page is what you update.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When it doesn't work",
        paragraphs: [
          "Three things break this. You skip the question marks and guess, so the page looks finished and is wrong. It lives somewhere you won't open, such as a note buried in an app you never use, so put it where you already look. Or you build it once and never set the day, and by spring it's out of date. An old page can mislead you worse than having none.",
          "If the gaps are mostly accounts or bills you're afraid to open, that's a different starting point, and the overdue guide above is the place for it.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions about getting organized",
        items: [
          {
            q: "Where do I start when my finances are a mess?",
            a: "Start with a page written from memory: accounts, income, bills, subscriptions, debts and goals, with a question mark wherever you're unsure. It takes ten minutes and shows you what's missing. Then close one gap, like a bill's due date, and set a day to look at the page again. Don't begin with a pile of statements.",
          },
          {
            q: "What financial documents should I keep?",
            a: "For taxes, the IRS says to keep records three years from filing in the usual case, and longer in some situations. Beyond that, a sensible default is loan and insurance paperwork for as long as the account is open, but check with each lender or insurer. The [financial binder guide](/guides/financial-binder-what-to-include) lists seven sections to sort them into.",
          },
          {
            q: "How do I organize my finances without a spreadsheet?",
            a: "A sheet of paper is enough for the first pass: six headings and a few lines under each. What counts is that you can update it in a few minutes, so choose the place you'll actually open. Paper, a notes app, a spreadsheet or the Companion all work. The one to avoid is a page that's two months old.",
          },
          {
            q: "How often should I review my finances?",
            a: "Weekly if you're catching up, monthly once things are steady. A ten minute check on the same day each time is easier to keep than a long session you have to plan. The [end of month money review](/guides/end-of-month-money-review) is a ten minute routine for the monthly version.",
          },
          {
            q: "What if I don't know how much I owe?",
            a: "Write the debt down with a question mark, then find three numbers for it from the lender's website or your latest statement: the balance, the interest rate and the minimum payment. That's the whole errand. You don't need a payoff plan yet, and [debt snowball vs avalanche](/guides/debt-snowball-vs-avalanche) is there when you do.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where Draftpace fits",
        paragraphs: [
          "[Personal Finance Companion](/shop/personal-finance-companion) opens with the question this page starts from: where is your financial information right now? You choose mostly in your head, notes, a text file, a spreadsheet or CSV, or already known, and it goes one area at a time: accounts, income, bills, subscriptions, debts and savings. Nothing is required. You type things in, paste notes or upload a file, and anything imported is reviewed before it counts. Missing pieces, like a bill with no due date, show in its Attention list when you open it. It doesn't read your bank.",
          "If you only want the one number, [Monthly Money Reset](/free) is free and takes a few minutes.",
        ],
      },
      {
        kind: "callout",
        label: "If you have ten minutes now",
        body: "Write the six headings on paper and fill in what you know. Put a question mark next to the rest and stop there.",
      },
    ],
  },

  {
    slug: "split-bills-with-a-partner-or-roommate",
    title: "How to split bills with a partner or roommate: 3 methods",
    dek: "Equal, by income or by room: the formula with a worked example, what to agree before the first payment, and what to say when you bring it up.",
    primaryQuery: "how to split bills with a partner",
    next: { slug: "monthly-bills-list", reason: "List every shared bill with its amount and due date before you decide how to split the total." },
    related: [
      { slug: "50-30-20-rule-where-it-breaks", reason: "See how a percentage rule such as 50/30/20 can help set a fair share when incomes differ." },
      { slug: "sort-out-your-finances-after-a-life-change", reason: "Moving in together, moving out or splitting up? Here is the order for sorting shared money." },
      { slug: "what-to-check-before-each-direct-debit-date", reason: "Agree which account each shared bill leaves from and check it before each date." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "ClearCash: How to split bills based on income",
        url: "https://clearcash.app/blog/how-to-split-bills-based-on-income",
        retrieved: "2026-09-26",
        note: "Income ratio formula and the gross versus net discussion. A commercial site, used for the method only; the worked numbers are our own arithmetic.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Split bills by income if your earnings differ a lot, and 50/50 if they're close. To find the share, add both incomes, divide each by the total, and apply that percentage to every shared bill. At $4,200 and $2,100 a month, that's two thirds and one third, so an $1,800 rent is $1,200 and $600.",
          "This is for couples and roommates who want a split they can explain in one sentence. It can't tell you what's fair in your situation, only how each method works. A private split doesn't change your lease, which is a separate agreement with the landlord, and this isn't legal advice.",
        ],
      },
      {
        kind: "table",
        heading: "An example: two incomes, four shared bills",
        intro: "Example only. Take-home pay is $4,200 a month for you and $2,100 for them, which is 67 and 33 percent.",
        columns: ["Bill", "Total", "You (two thirds)", "Them (one third)"],
        rows: [
          ["Rent", "$1,800", "$1,200.00", "$600.00"],
          ["Electric", "$110", "$73.33", "$36.67"],
          ["Internet", "$60", "$40.00", "$20.00"],
          ["Renters insurance", "$22", "$14.67", "$7.33"],
          ["Total", "$1,992", "$1,328.00", "$664.00"],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Under 50/50 each of you would pay $996. That is 24 percent of the higher take-home pay and 47 percent of the lower one. Under the income split, both pay about 32 percent of their own pay toward shared bills. That is the whole case for splitting by income, and the case against it is that it needs both of you to share how much you earn.",
        ],
      },
      {
        kind: "list",
        heading: "How to work out the share",
        ordered: true,
        items: [
          "Pick one basis for both people, take-home or gross. We'd use take-home, because it's what each of you actually has to spend. Gross is simpler when one of you has pay that swings from retirement contributions or pre-tax benefits. Either works if you both use the same one.",
          "Add the monthly incomes. With three or more people, add all of them.",
          "Divide each income by the total: $2,100 divided by $6,300 is 0.33.",
          "Multiply each share by the total of the shared bills.",
          "Round to percentages you can both remember, such as 67 and 33, and write them down where you'll both see them.",
        ],
      },
      {
        kind: "table",
        heading: "Three ways to split, and what each assumes",
        columns: ["Method", "How it works", "Suits", "Watch for"],
        rows: [
          [
            "Equal",
            "Every shared bill is halved",
            "Incomes that are close",
            "The lower earner pays a bigger share of their pay",
          ],
          [
            "By income",
            "Each pays a percentage matching earnings",
            "Incomes that differ, one household",
            "Needs both to share income figures",
          ],
          [
            "By item",
            "Each person owns certain bills",
            "Bills of similar size",
            "Utilities swing while rent stays put, so the totals drift apart",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Roommates: splitting rent by room",
        paragraphs: [
          "Roommates don't always share income, and rooms are rarely the same size. A common method is to split rent by room size. Say a three bedroom rents for $2,700 and the rooms are 200, 150 and 150 square feet, 500 in all. Those are 40, 30 and 30 percent, so $1,080, $810 and $810. A private bathroom or a parking space is a reason to move one person's share up, and the final number is whatever the group agrees to. Utilities are often split evenly, since use doesn't follow room size. Agree all of it before the first payment.",
        ],
      },
      {
        kind: "list",
        heading: "Agree these before the first payment",
        ordered: false,
        checkable: true,
        items: [
          "Which bills count as shared, written as a list.",
          "Which method: equal, income or room size, and net or gross if by income.",
          "Each person's share as a percentage.",
          "The settling day and how, for example the day after payday by transfer, or into a shared account.",
          "What triggers a re-run: a raise, a job loss, a move.",
          "How one-off costs work: anything over an amount you pick gets agreed before it's bought.",
          "Where the record lives, and who can see it.",
        ],
      },
      {
        kind: "scripts",
        heading: "What to say when you bring it up",
        intro: "Pick the line that fits, and say it before the first bill is due.",
        items: [
          {
            situation: "Opening",
            line: "Can we agree how we split the shared bills? I'd like to write it down once so neither of us has to remember it.",
          },
          {
            situation: "If incomes differ a lot",
            line: "Would a split by income work? We add up our take-home pay, and each of us pays that percentage of every shared bill.",
          },
          {
            situation: "If they'd rather not share",
            line: "We could split it equal, or each take certain bills. Which of those feels better to you?",
          },
          {
            situation: "If it stops feeling fair",
            line: "Can we run the numbers again? My pay changed, so the percentages have.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "When incomes change, and one-off costs",
        paragraphs: [
          "Say one of you loses income for three months. Under an income split you re-run the same formula with the new figure, and you do it the day it happens, not after the first missed transfer. Decide together whether a drop is temporary and whether the difference is paid back later. Either answer works if it's written down.",
          "For a couch or a vet bill, decide before you buy who pays and who keeps it if you split up. If you'd rather not share income figures at all, an income split can't work. Equal or by item is the fallback, and that's a fair thing to ask for.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Joint account or separate, and the record",
        paragraphs: [
          "A joint account suits partners who share most costs, bills that are always the same amount, and two people who check in regularly. A middle route is for each person to transfer their share to a shared account on payday and pay everything from there. Separate tracking suits roommates and short arrangements, or anyone who wants the rest of their money private.",
          "The record is the part that stops arguments. For each shared bill write the date, the amount, each share, and a mark when it's settled. When someone asks whether the rent was paid, the answer is on the page. If your bills mix monthly and non-monthly ones, [a monthly bills list](/guides/monthly-bills-list) is a good base to share from, and after a move or a split [sort out your finances after a life change](/guides/sort-out-your-finances-after-a-life-change) gives the order.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions about splitting bills",
        items: [
          {
            q: "Should couples split bills 50/50 or by income?",
            a: "There's no rule. 50/50 is simplest and works when incomes are close. When they differ a lot, it takes a bigger share of the lower earner's pay, which is why many couples split by income instead. Try both on your real bills, look at each person's share of their own pay, and pick the one you can both live with.",
          },
          {
            q: "How do you split bills based on income?",
            a: "Add both take-home incomes, divide each by the total, and apply those percentages to every shared bill. At $4,200 and $2,100, the shares are two thirds and one third, so a $2,000 bill is $1,333 and $667. Use the same basis for both people, either all take-home or all gross.",
          },
          {
            q: "Should I use gross or net income to split bills?",
            a: "Sources disagree. Take-home pay reflects what each person can spend. Gross is one figure you both know and doesn't shift with retirement contributions or benefits. Pick one and use it for everyone. We'd use take-home, unless one of you has large pre-tax deductions that would skew the split.",
          },
          {
            q: "How do roommates split rent when rooms are different sizes?",
            a: "A common method is square footage. Divide each room's size by the total of all the bedrooms, then apply that percentage to the rent. A 200 square foot room in a 500 square foot total pays 40 percent. Adjust for a private bathroom or parking if everyone agrees, and write the final numbers down.",
          },
          {
            q: "How often should we settle up?",
            a: "Monthly, a day or two after payday, is easy to remember. If you use a shared account, each person's transfer on payday replaces the settling. If you track separately, tick each bill as settled on the day the money moves.",
          },
          {
            q: "What if one of us can't pay our share this month?",
            a: "Talk on the day you know, and re-run the split on the new income if it will last. For a one-off shortfall, agree whether the difference is paid back and by when, and write it down. Your lease or lender still decides what each of you owes them.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where Draftpace fits",
        paragraphs: [
          "[Personal Finance Companion](/shop/personal-finance-companion) has a Shared Responsibility toggle on any bill or subscription. You enter your share as a percentage from 1 to 99, so 67 for the example above, and the row shows your share and their share. Tick a bill settled once the money has moved, and download a one page PDF of what's still owed to you and what's already settled. The other person doesn't need an account or login. It's a record only: it doesn't send money, request payment or track who paid, and the statement shows only what's owed to you.",
        ],
      },
      {
        kind: "callout",
        label: "Before you close this page",
        body: "Add up your two incomes and work out the percentages on paper. Send your partner or roommate one message with the numbers.",
      },
    ],
  },

  {
    slug: "subscription-tracker-what-to-track",
    title: "Subscription tracker: the six fields that catch renewals",
    dek: "The renewal date beats the price. What to write down for each subscription, the annual charge trap and a five minute monthly check.",
    primaryQuery: "subscription tracker",
    next: { slug: "how-to-cancel-subscriptions", reason: "When a renewal comes up that you want to stop, follow these steps and scripts to cancel." },
    related: [
      { slug: "how-to-find-every-subscription-you-are-paying-for", reason: "Starting from nothing? Sweep twelve months of statements to fill in the first version of your tracker." },
      { slug: "how-to-save-money-fast", reason: "Trimming subscriptions is one of the quickest wins, ranked here alongside other small money moves." },
      { slug: "end-of-month-money-review", reason: "Fold the renewal check into a ten minute month end routine that covers every bill." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "money",
    sources: [
      {
        name: "FTC: Getting In and Out of Free Trials, Auto-Renewals, and Negative Option Subscriptions",
        url: "https://consumer.ftc.gov/articles/getting-and-out-free-trials-auto-renewals-and-negative-option-subscriptions",
        retrieved: "2026-09-26",
        note: "Calendar note for trial end dates, likelihood of being charged after a trial, and keeping records when canceling.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Track six things for every subscription: the name as it appears on your statement, the charge, the billing cycle, the next renewal date, your decision (keep, still deciding, planned to cancel) and who shares it. The renewal date is the field to protect, because it is the last day you can act before you pay again.",
          "This is for keeping a list of subscriptions you've already found. It can't find the ones you don't know about, so for that start with [how to find every subscription you are paying for](/guides/how-to-find-every-subscription-you-are-paying-for), and it doesn't cancel anything for you.",
        ],
      },
      {
        kind: "table",
        heading: "An example tracker with five rows",
        intro: "Example only, not real data.",
        columns: ["Name", "Charge", "Cycle", "Renews", "Decision", "Shared"],
        rows: [
          ["Video streaming", "$15.49", "Monthly", "5th", "Keep", "No"],
          ["Fitness app", "$79.99", "Annual", "Nov 14", "Planned to cancel", "No"],
          ["Antivirus", "$59.99", "Annual", "Jan 9", "Still deciding", "No"],
          ["Cloud storage", "$2.99", "Monthly", "21st", "Keep", "No"],
          ["Family music plan", "$16.99", "Monthly", "12th", "Keep", "Yes, 50%"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why the renewal date beats the price",
        paragraphs: [
          "Two of the five rows are annual, and they're the two with a decision waiting. The monthly ones renew without any drama. The annual ones sit for months and then charge $79.99 or $59.99 in one go. For the fitness app, the heads-up date is October 31, two weeks before it renews on November 14, which leaves time to decide and cancel.",
        ],
      },
      {
        kind: "table",
        heading: "What to write in each field",
        columns: ["Field", "What to write", "Tip"],
        rows: [
          [
            "Name",
            "The service",
            "Write it as it appears on your statement, since that's what you'll search for. It can differ from the app's name.",
          ],
          [
            "Charge",
            "What it costs each cycle",
            "Update it when a charge lands at a different amount, because a price can change at renewal.",
          ],
          ["Cycle", "Monthly, annual or other", "Mark annual ones so they stand out."],
          [
            "Renewal date",
            "The date it next charges",
            "If you don't know it, take the last charge date and add one cycle, then confirm it in the account page.",
          ],
          [
            "Decision",
            "Keep, still deciding or planned to cancel",
            "Still deciding needs a date to decide by, or it sits there for good.",
          ],
          [
            "Who shares it",
            "Anyone who pays part",
            "Write their percentage, so two people don't both pay for one plan.",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Free trials go on the list too",
        paragraphs: [
          "The FTC's consumer advice on free trials is plain: many trials ask for a card up front, and if you don't cancel in time you'll probably be charged. Its tip is to make a note on your calendar to cancel before the trial ends. Treat a trial as a subscription from day one. Add it with the day the trial ends, and mark the decision planned to cancel unless you already know you want it.",
        ],
      },
      {
        kind: "list",
        heading: "A five minute monthly check",
        ordered: false,
        checkable: true,
        items: [
          "Look at anything renewing in the next two weeks.",
          "For each one, choose keep or planned to cancel.",
          "Open anything marked still deciding and settle at least one.",
          "Add any subscription you started this month, including trials.",
          "Remove anything you've already canceled and check the charge stopped.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When it doesn't work",
        paragraphs: [
          "Trackers fail in three ways. The renewal dates are guessed, so confirm them once in each account page. The list isn't updated when you sign up for something, so make adding it the last step of signing up. And the tracker sits in a file you never open, which is why the two week heads-up belongs in your calendar, where it finds you.",
          "It also won't catch a subscription billed to someone else's account. Once a row says planned to cancel, the last step is doing it, and the FTC advises keeping a copy of your cancellation request and notes on any conversation. [How to cancel a subscription that is hard to cancel](/guides/how-to-cancel-subscriptions) has the steps and scripts. Trimming subscriptions is also one of the quicker wins in [how to save money fast](/guides/how-to-save-money-fast).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions about tracking subscriptions",
        items: [
          {
            q: "What should a subscription tracker include?",
            a: "Six fields are enough: the name as it appears on your statement, what each charge costs, how often it bills, the next renewal date, your decision on it, and who shares the cost. If you keep only one field current, make it the renewal date, because that's the last day you can cancel without paying for another cycle.",
          },
          {
            q: "Can I use a spreadsheet to track subscriptions?",
            a: "Yes. Six columns and a row per subscription is all you need, and paper works the same way. What makes it useful is a calendar note two weeks before each annual renewal, because a spreadsheet only helps when you open it. The calendar note comes to you.",
          },
          {
            q: "How do I remember to cancel a free trial?",
            a: "Put the end date on your calendar the day you sign up, as the FTC suggests, and add the trial to your tracker with the decision planned to cancel. Set the reminder for a day or two before the end, since some services process cancellations only during set hours or take a day.",
          },
          {
            q: "How often should I review my subscriptions?",
            a: "A five minute check once a month is enough for most lists: look at anything renewing in the next two weeks, settle one that's still deciding, and add anything new. Folding it into your [end of month money review](/guides/end-of-month-money-review) means you don't need a separate habit.",
          },
          {
            q: "What's the difference between a subscription and a bill?",
            a: "A bill is owed on a schedule, such as rent or electric. A subscription renews on its own until you stop it, so the action is yours to take before the date. That's why they're worth tracking apart, and why [a monthly bills list](/guides/monthly-bills-list) is the companion to this one.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where Draftpace fits",
        paragraphs: [
          "[Personal Finance Companion](/shop/personal-finance-companion) has a Subscriptions screen built on these fields: name, amount, monthly, annual or custom frequency, an optional renewal date, and a decision of keep, still deciding, planned to cancel or already canceled. A subscription can be marked shared with your percentage. It shows a monthly total and marks annual ones with a badge. When you open it, its Attention list flags a planned cancellation within 14 days of renewal and a kept annual subscription within 14 days, and Coming up lists renewals in the next 14 days. It doesn't show an annual total, it doesn't cancel anything, and it doesn't read your bank.",
        ],
      },
      {
        kind: "callout",
        label: "The two week rule",
        body: "Set a calendar note two weeks before each annual renewal. If you already have the list, add the earliest one now.",
      },
    ],
  },

  {
    slug: "bank-statement-csv-to-budget",
    title: "How to import a bank statement CSV: check the file first",
    dek: "Download the file, check its shape, map the columns and catch duplicate rows, plus what a list of past transactions cannot tell you.",
    primaryQuery: "import bank statement csv",
    next: { slug: "how-much-of-your-money-is-actually-safe-to-spend", reason: "A file of past transactions cannot show what is still due, so subtract the bills that are coming to find your number." },
    related: [
      { slug: "organize-your-finances-from-scratch", reason: "If the statement is only one of many scattered records, start with a ten minute path to gather all of it." },
      { slug: "how-to-find-every-subscription-you-are-paying-for", reason: "Use the same twelve months of data to find every recurring charge and subscription." },
      { slug: "how-to-budget-for-beginners", reason: "Turn the sorted transactions into a first monthly budget with four inputs and a worked example." },
    ],
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
    next: { slug: "monthly-bills-list", reason: "The bills section is easier to fill in with a full monthly list that includes the annual ones." },
    related: [
      { slug: "organize-your-finances-from-scratch", reason: "Pulling documents together for the first time? This path works even without every statement to hand." },
      { slug: "sort-out-your-finances-after-a-life-change", reason: "Update the binder after a job change, move or divorce, and see which accounts and plans need attention." },
      { slug: "subscription-tracker-what-to-track", reason: "Give subscriptions their own page in the binder, with the six fields that catch renewals." },
    ],
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
    next: { slug: "budget-for-variable-bills", reason: "When a bill is not fixed, plan toward the high month and let a fund cover the spike." },
    related: [
      { slug: "monthly-bills-list", reason: "Get the whole list of quarterly and annual bills into one place, with the monthly math done for you." },
      { slug: "how-to-build-a-first-1000-emergency-fund", reason: "Start with a $1,000 starter fund before you divide money among specific costs." },
      { slug: "how-to-budget-with-irregular-income", reason: "If pay swings, learn to plan only from what has landed and still keep these funds moving." },
    ],
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
    next: { slug: "how-to-budget-for-beginners", reason: "If the percentage split does not fit, build your own monthly budget from four things instead." },
    related: [
      { slug: "how-to-budget-with-irregular-income", reason: "Percentages break when pay swings, and this plans only from money that has arrived." },
      { slug: "monthly-bills-list", reason: "Count your real needs by listing every bill, including the ones that are not monthly." },
      { slug: "split-bills-with-a-partner-or-roommate", reason: "Sharing costs with someone? Compare equal, income-based and item-by-item splits." },
    ],
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
    next: { slug: "sinking-funds-explained", reason: "Save a set amount each month for the costs you can see coming, using the formula and a $600 example." },
    related: [
      { slug: "monthly-bills-list", reason: "Add the changing bills to a full list with a column for the planning amount." },
      { slug: "what-to-check-before-each-direct-debit-date", reason: "On the bill date, check what changed and which account it leaves from." },
      { slug: "how-to-budget-with-irregular-income", reason: "When your pay moves as well as your bills, plan only from what has already landed." },
    ],
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
    next: { slug: "debt-snowball-vs-avalanche", reason: "Compare the snowball and avalanche orders and pick the payoff method you will keep." },
    related: [
      { slug: "how-to-build-a-first-1000-emergency-fund", reason: "Building a small fund means a surprise expense stays off the card and the balance stops growing." },
      { slug: "you-missed-a-payment-what-to-do-next", reason: "If you have skipped a minimum, here is what to do in the first 48 hours." },
      { slug: "how-to-save-money-fast", reason: "Find extra cash for the balance this month with small moves and no big life change." },
    ],
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
    next: { slug: "first-physical-step-20-examples", reason: "After you pick the first thing, this has twenty examples of a first step you could see happen." },
    related: [
      { slug: "paperwork-pile-where-to-start", reason: "If a good part of the backlog is unopened mail, this shows how to open and sort it in ten minutes." },
      { slug: "task-paralysis-what-to-do-in-the-next-ten-minutes", reason: "When even the first pick will not start, this ten minute way out shrinks the step until it needs no decision." },
      { slug: "how-to-deal-with-something-you-have-put-off", reason: "If shame about how long it has waited is in the way, this gives three lines to name it and move on." },
    ],
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
    next: { slug: "how-to-start-when-everything-is-overdue", reason: "When the pile is calls, forms and bills as well as mail, this shows how to sort by who is waiting." },
    related: [
      { slug: "how-to-deal-with-something-you-have-put-off", reason: "If you are dreading what the letters say, this covers how to name the delay and get to the practical question." },
      { slug: "first-physical-step-20-examples", reason: "For the items that need a call or form, twenty examples of a first step you could see happen." },
      { slug: "why-you-keep-missing-bill-due-dates", reason: "For bills found in the pile, this shows how to keep due dates from slipping again." },
    ],
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
    dek: "Some calls are hard because of what you have to say. Decide what you won't agree to, put the news in your first two sentences, and ask for a minute.",
    primaryQuery: "give bad news on the phone",
    next: { slug: "how-to-make-a-phone-call-you-have-been-avoiding", reason: "For the general case of a call you keep avoiding, this walks through five things to prepare and a first sentence." },
    related: [
      { slug: "scripts-for-the-admin-calls-everyone-dreads", reason: "Opening lines for billing problems, chasing, canceling and complaints, plus four things to get before you hang up." },
      { slug: "the-email-you-keep-not-sending-and-how-to-chase-a-reply", reason: "If you would rather refuse or chase in writing, this covers three decisions, a first line and the follow-up." },
      { slug: "time-blindness-planning", reason: "Name one exact time to make a hard call, with a buffer before it, so it does not float." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Decide what you will not agree to, write one line for what you want to be true when the call ends, and put the news in your first two sentences. Say it, then stop talking and let them answer. Before you hang up, say back what was agreed.",
          "This is for refusals, bad news and money conversations. It can't tell you what you should accept or refuse, and it isn't therapy or negotiation coaching. It's practical preparation for a conversation you'd rather not have.",
        ],
      },
      {
        kind: "table",
        heading: "Example: saying no to a favor",
        intro: "An illustration, not a real account. Say your sister has asked you to host the family weekend in March, and you can't do it. This is what goes on the page before you dial.",
        columns: ["The thing", "What's on the page"],
        rows: [
          [
            "What I want to be true",
            "She knows today that I can't host, so she has time to ask someone else.",
          ],
          [
            "What I won't agree to",
            "Hosting even part of it. Being talked into a smaller version of the same thing.",
          ],
          ["Who to name if it gets heated", "No one. I'll say I'll call back."],
          [
            "First sentence",
            "Hi, I've thought about it and I can't host in March. I wanted to tell you now rather than leave you waiting.",
          ],
          ["Two call-back times", "6:30 tonight, or Saturday at 10."],
        ],
      },
      {
        kind: "list",
        heading: "What makes this one hard?",
        intro: "Pick the closest, because it changes what's worth having ready. More than one can be true.",
        items: [
          "You're telling them something they won't want to hear.",
          "You're saying no to something.",
          "Money is involved.",
          "It's personal.",
          "They've been difficult about this before.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "The pattern is the same in each. A call where you ask for something has a clear end: you get it or you don't. A call where you refuse or deliver bad news has no end until the other person has reacted, and you can't control the reaction. That's why the preparation is about the parts you can control: your position, your first sentence, and how you'll pause if it goes somewhere you didn't expect.",
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "Before you dial",
        items: [
          "Write what you want to be true when you put the phone down, in one line. This is the thing to come back to if the conversation wanders.",
          "Write what you won't agree to. Deciding this now means you aren't deciding it while someone waits on the line. If there is nothing, write nothing.",
          "If money is involved or they've been difficult before, put what you were told last time, and by whom, on the same page. A date and a name is enough.",
          "Set the room. A glass of water within reach, and somewhere you won't be overheard if the news is personal.",
          "Write two times you could call back, in case now turns out to be the wrong moment for them or for you.",
          "Write your first sentence out in full, and say it aloud once.",
        ],
      },
      {
        kind: "scripts",
        heading: "The first two sentences",
        intro: "Lead with the news. A long lead-in makes people brace, and it makes the news sound worse when it arrives. Use the closest one, or change it until it sounds like you.",
        items: [
          {
            situation: "Bad news",
            line: "Hi, it's me. There's something I need to tell you and it's not good news. Is now an all right time?",
          },
          {
            situation: "Saying no",
            line: "Hi, I've thought about it and I'm not going to be able to do it. I wanted to tell you rather than leave you waiting.",
          },
          {
            situation: "Money",
            line: "Hi, I need to talk to you about money, which I'd rather do directly than by email. Do you have a few minutes?",
          },
          {
            situation: "It's happened before",
            line: "Hi, I'm calling about this again. I'd like to get it sorted today if we can. Can you look at what's happened so far?",
          },
          {
            situation: "Something personal",
            line: "Hi, there's something I'd like to talk to you about. Is now a good time, or shall I call back?",
          },
        ],
      },
      {
        kind: "scripts",
        heading: "A call, start to finish",
        intro: "An example of how the middle can go when you've decided your position first. Your words will differ. The order is the point.",
        items: [
          {
            situation: "1. Say it",
            line: "I can't host in March. I know that's a lot to ask you to plan around, and I'm sorry to give you the news by phone.",
          },
          {
            situation: "2. Stop and let them react",
            line: "(Say nothing more. A pause of a few seconds feels long and isn't.)",
          },
          {
            situation: "3. They push back",
            line: "I understand it's disappointing. I've thought about it and my answer is still no.",
          },
          {
            situation: "4. They ask why",
            line: "I'd rather not go into all of it. It's just not something I can do this time.",
          },
          {
            situation: "5. You need a moment",
            line: "Can I have a minute to think about that? I'd like to call you back tonight.",
          },
          {
            situation: "6. End it",
            line: "So we're agreed I'm not hosting, and you'll ask Dan. Thanks for hearing me out. Talk soon.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "During the call",
        paragraphs: [
          "You don't owe a full explanation. A short reason is kind, and a long one gives the other person more to argue with. If they push, repeat your answer in fewer words rather than defending it in more.",
        ],
      },
      {
        kind: "list",
        ordered: true,
        items: [
          "Say the thing you came to say, in your first two sentences.",
          "Stop. Let them answer. You don't have to fill the silence.",
          "You're allowed to ask for a minute to think. You're allowed to say you'll call back.",
          "Ask what happens next, if there is a next step.",
          "Write down anything that was agreed, and, for money or a repeat problem, the name of who you spoke to.",
          "Say back what was agreed in one sentence before you hang up.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "After the call",
        paragraphs: [
          "If they'd rather have it in writing, or you want a record, a short message afterward works. Something like: \"Thanks for talking today. To confirm, I can't host in March, and you'll ask Dan.\" [The email you keep not sending](/guides/the-email-you-keep-not-sending-and-how-to-chase-a-reply) covers writing that first line.",
        ],
      },
      {
        kind: "list",
        heading: "What can go wrong",
        intro: "None of these ruin the call. Each has a plain fix.",
        items: [
          "You say yes to end the discomfort. If you hear yourself starting to agree to something on your list, say \"Let me get back to you on that\" and hang up. A yes you regret is harder to undo than a pause.",
          "You over-explain. Every extra reason is another thing to argue with. Say the short version again.",
          "They get angry or upset. You can be kind and still not change your answer. If it's too much, say you'll call back when you've both had a break, and name a time.",
          "You lose your place. Look at the line on your page. Say \"Sorry, I lost my thread\" and read it.",
          "They don't pick up. Leave a short voicemail asking for a call back at one of your two times, without the news in it.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How do you give bad news over the phone?",
            a: "Say it in your first two sentences, after a short check that it's a good moment. Skip the long lead-in, because it makes people brace. Then stop and let them react. Say what happens next, and write down anything that's agreed. If it's urgent or emotional, a call is usually kinder than a message.",
          },
          {
            q: "How do you say no on the phone politely?",
            a: "Thank them for asking, give your answer in one clear sentence, and offer a short reason if you want to. Don't apologize more than once. If they push, repeat your answer in fewer words. Polite and firm are compatible. A soft no that leaves room for doubt often prompts a second ask.",
          },
          {
            q: "What if I freeze on the call?",
            a: "Say so. \"Sorry, I lost my place, can I have a second?\" is an ordinary sentence and people hear it often. Look at the first line on your page, read it, and continue. If you can't, ask to call back at one of the two times you wrote down.",
          },
          {
            q: "Is it better to email or call to give bad news?",
            a: "It depends on the news and the person. Bad news that affects someone's plans, feelings or money is usually kinder in a voice. A refusal that is routine, or that you want on record, can go in writing. Many people call first, then send a short written confirmation afterward.",
          },
          {
            q: "Can I ask them to call me back?",
            a: "Yes. If now is the wrong moment, offer one of the two times you wrote down: \"I'd rather do this properly. Could I call you at six?\" Then do it. A named time is a plan. \"Later\" tends to become another week of avoiding it.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "The Make a difficult phone call walkthrough in [ADHD Life Companion](/shop/alongside) asks what makes this one hard, who you're calling, what you want to be true when you put the phone down, and whether there's anything you're not willing to agree to. It shows what's worth having ready, suggests an opening for you to use or replace with your own, and asks whether to call now or name one exact time today. During the call it shows your own words back to you, including the line about what you won't agree to. It never tells you what to accept or refuse, and it isn't therapy or medical advice.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "For calls that are hard because you've been putting them off, not because of what you'll say, [how to make a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding) starts from the first sentence. To fix a time so the call stops floating, [planning when you cannot feel time pass](/guides/time-blindness-planning) has the method.",
        ],
      },
    ],
  },

  {
    slug: "the-email-you-keep-not-sending-and-how-to-chase-a-reply",
    title: "The email you keep not sending: first lines and follow-ups",
    dek: "An email that doesn't say what it wants gets answered slowly. Decide three things, write the first line, and know how to chase when no one replies.",
    primaryQuery: "email you keep not sending",
    next: { slug: "how-to-say-no-or-give-bad-news-on-the-phone", reason: "If the message is a refusal or bad news, this covers what to decide first and asking for a minute." },
    related: [
      { slug: "scripts-for-the-admin-calls-everyone-dreads", reason: "When an email gets no answer, these opening lines and things to get before hanging up help on the phone instead." },
      { slug: "how-to-make-a-phone-call-you-have-been-avoiding", reason: "If the follow-up needs to be a call, this covers what to prepare and how to write the first sentence." },
      { slug: "first-physical-step-20-examples", reason: "Twenty examples of a first step, including drafting one line, for admin you are stuck on." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Write one line saying what needs to happen because of this email, put it in the first three lines, read the draft once against a short check, and send it. If no one answers, wait a set number of days, then chase by a different route and ask for a date, not an update.",
          "This is for the email that's been sitting in your drafts, or in your head, for days: a landlord, a school, a company, a relative. It can't tell you what to say about anything legal or medical, and it isn't advice on how you should feel about an email. It's practical help with the first line and the follow-up.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "You know who it's to. You know roughly what it's about. What's missing is a way to begin, so you open a blank message, write \"Hi,\", and close it again. The draft grows a paragraph of background, then an apology, then a second apology, and by then it's a bigger job than the one you started with.",
          "A blank draft is the whole problem, so don't start blank",
        ],
      },
      {
        kind: "table",
        heading: "Example: an email that's been avoided for a week",
        intro: "An illustration, not a real account. Say your boiler has been making a noise for two weeks and you need the letting agent to send someone. Here is what goes on the page before you write a word of the email.",
        columns: ["The decision", "What's on the page"],
        rows: [
          ["What it's for", "Asking for something."],
          ["Who it's to", "The letting agent, Riverside Lettings."],
          ["What needs to happen", "Someone comes to look at the boiler this week."],
          [
            "First line",
            "Hello, I'm hoping you can help me with something. The boiler in flat 3 has been making a loud noise for two weeks and I'd like someone to come and look at it.",
          ],
          ["Subject line", "Boiler noise in flat 3: can someone visit this week?"],
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "How to write it",
        items: [
          "Say what the email is for: asking, replying, saying no, chasing, or explaining a problem. If it's two of those, it's two emails.",
          "Say who it's to, by name if you have one. It stops you writing to a crowd.",
          "Write what needs to happen because of it, in one line, with a date if there is one. An email that doesn't say what it wants is answered slowly, or not at all.",
          "Write your first line from the list below. Change it, or write your own. The rest is usually easier once this exists.",
          "Add only what they need to act: the dates, the reference number, the one thing you already tried. Leave the history for later if they ask.",
          "Write a subject line that says the ask, not just the topic.",
        ],
      },
      {
        kind: "scripts",
        heading: "A first line to start from",
        intro: "Pick the closest. Getting this one sentence down is most of the work.",
        items: [
          {
            situation: "Asking",
            line: "Hello, I'm hoping you can help me with something.",
          },
          {
            situation: "Replying",
            line: "Hello, thank you for getting back to me. To answer your question:",
          },
          {
            situation: "Saying no",
            line: "Hello, thank you for asking me. I'm not going to be able to do it this time.",
          },
          {
            situation: "Chasing",
            line: "Hello, I got in touch about this a little while ago and I haven't heard back yet. Could you let me know where it stands?",
          },
          {
            situation: "Explaining a problem",
            line: "Hello, I'm having a problem and I'd like to explain what's happened so it can be sorted out.",
          },
        ],
      },
      {
        kind: "table",
        heading: "Subject lines that get opened",
        intro: "Say the ask in the subject. Vague ones are easy to leave for later.",
        columns: ["Instead of", "Try"],
        rows: [
          ["Question", "Question about my March invoice: can you confirm the amount?"],
          ["Following up", "Reply needed by Friday: lease renewal form"],
          ["Problem", "Boiler noise in flat 3: can someone visit this week?"],
          ["Hi", "Can't host in March: telling you now so you have time"],
        ],
      },
      {
        kind: "list",
        checkable: true,
        heading: "Before you send it",
        intro: "Read it once against these, then send it. Reading it a fourth time doesn't make it better.",
        items: [
          "What you want is in the first three lines.",
          "The date, if there is one, is in there.",
          "Anything you meant to attach is attached.",
          "It's short enough to read on a phone.",
          "What you were told before is in there, if you're chasing or explaining a problem.",
          "You've apologized no more than once, if you're saying no or chasing.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "The moment you press send, the job changes from writing to waiting, and waiting needs its own plan. Without one, the email drops out of your head and you find out three weeks later that nothing happened.",
          "When no one replies",
        ],
      },
      {
        kind: "timeline",
        heading: "A chase plan (example)",
        intro: "The days are a suggestion we'd use for something that isn't an emergency. Shorten them if a deadline is close. Write the check-back date down the day you send.",
        steps: [
          {
            when: "Day 0: you send",
            what: "Note the date, who it went to, and what you asked for.",
          },
          {
            when: "Day 5: nothing yet",
            what: "Chase by a different route, such as a call if you emailed. Ask for a date.",
          },
          {
            when: "Day 10: still nothing",
            what: "Write again to the same person and add a second person or a general address.",
          },
          {
            when: "Day 15: still nothing",
            what: "Decide whether it needs escalating, or whether you can let it go.",
          },
        ],
      },
      {
        kind: "scripts",
        heading: "Chase lines, by what you're waiting on",
        intro: "Ask for a date rather than an update, because an update can be nothing. A date is something you can hold them to.",
        items: [
          {
            situation: "A reply",
            line: "Hello, I got in touch a little while ago about this and I haven't heard back. Could you tell me where it stands?",
          },
          {
            situation: "A decision",
            line: "Hello, I'm following up because I need to know either way. When do you think you'll be able to tell me?",
          },
          {
            situation: "Money owed to you",
            line: "Hello, I'm following up because it's still outstanding. Can you tell me when it will be dealt with?",
          },
          {
            situation: "Something being fixed",
            line: "Hello, I'm checking in because it hasn't been sorted yet. Can you tell me what's happening and when?",
          },
          {
            situation: "A document or form",
            line: "Hello, I'm still waiting on this. Could you tell me when I can expect it, or what you need from me first?",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Chasing by the same route that already went unanswered is usually the slower option. If you emailed, try a phone call, or the other way around. [How to make a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding) covers the preparation, and [scripts for the admin calls everyone dreads](/guides/scripts-for-the-admin-calls-everyone-dreads) has an opening for chasing.",
        ],
      },
      {
        kind: "list",
        heading: "What can go wrong",
        items: [
          "You keep editing. If you've changed the first line four times, send the fourth one. A slightly plain email you sent beats a polished one that's still in drafts.",
          "You write everything at once. If the email is more than about ten lines, cut the background and offer to send it on request.",
          "You chase too soon and feel rude. Waiting until your check-back date is the fix, so the date decides, not the feeling.",
          "You chase in the same channel, again. A second unread email tends to get the same result as the first.",
          "The email is really a refusal or bad news. For those, a call may be kinder. [How to say no or give bad news on the phone](/guides/how-to-say-no-or-give-bad-news-on-the-phone) covers it.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How do I start an email I keep putting off?",
            a: "Start with one line saying what you want, not with a greeting and background. Pick a first line that fits: asking, replying, saying no, chasing, or explaining a problem. Once that sentence exists the rest tends to follow. If you're stuck, write only the first line and save the draft. That counts as a start.",
          },
          {
            q: "How long should I wait before following up on an email?",
            a: "There's no fixed rule. For something that isn't urgent, many people wait somewhere around a week. If a deadline is close, wait two or three days. Whatever you choose, write the date down when you send, so the check-back is a plan, not a feeling.",
          },
          {
            q: "How do I follow up politely when no one replied?",
            a: "Keep it short and specific. Say when you last got in touch, then ask for a date rather than an update: \"Could you let me know when I can expect this?\" Avoid apologizing more than once. If the first message went by email, try a call this time.",
          },
          {
            q: "Why do I dread replying to emails?",
            a: "Emails can feel like open-ended obligations, and a first line is the hardest part to produce. Some people also find it uncomfortable to disappoint or ask. If dread of messages is getting in the way of work or health, a clinician is the right person to talk to. Practically, a fixed first line and a short check make the task smaller.",
          },
          {
            q: "What if I still get no reply?",
            a: "Change the route, then the person. Try a phone call, or write to a second contact or a general address, and mention that you've written before. Note each attempt with the date. If it involves money or a deadline, ask for a named person and a date.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "The Send the email walkthrough in [ADHD Life Companion](/shop/alongside) asks what the email is for, who it's to, and what needs to happen because of it, then offers a first line you can use or replace with your own and lists the checks to read before you send. A Follow something up walkthrough asks how you last got in touch and what you need from them now. When you say you're waiting on someone, it keeps the item as Waiting with a check-back date ten days out, and lets you keep a note of who. It doesn't send email or read your inbox, and it isn't a treatment or medical advice.",
        ],
      },
    ],
  },

  {
    slug: "first-physical-step-20-examples",
    title: "First physical step: 20 examples for stuck admin tasks",
    dek: "A first step is something you could see happen. Thirty examples, from a call to a form to a document, and how to check your own.",
    primaryQuery: "first physical step examples",
    next: { slug: "how-to-make-a-phone-call-you-have-been-avoiding", reason: "The most common first step is a call; this walks through five things to prepare and how to know when you can stop." },
    related: [
      { slug: "task-paralysis-what-to-do-in-the-next-ten-minutes", reason: "If a first step still feels too big, this ten minute way out shrinks it until it needs no decision." },
      { slug: "why-you-keep-thinking-about-a-task-and-not-doing-it", reason: "For a task you keep thinking about, this explains why writing it down again changes nothing." },
      { slug: "paperwork-pile-where-to-start", reason: "A concrete example of a first step: opening and sorting a paperwork pile in ten minutes." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "mind-and-focus",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A first physical step is something a person watching you could see happen, such as finding a phone number, opening a form or putting a letter on the desk. It isn't deciding, planning or thinking it over. Pick the task, then find the example below closest to it and copy its shape.",
          "This is a reference list of thirty first steps for stuck admin: calls, forms, messages, mail and home jobs. It can't choose your task or tell you how urgent it is, and it isn't a substitute for professional support if being unable to start is affecting your health or work.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "The task feels too big to start, so you plan it. The plan has eight steps and the second one is \"decide about the insurance.\" You look at it, feel worse, and go and do something else. Planning felt like progress and made the task heavier. A physical first step does the opposite: it costs a minute and it can't be done wrongly.",
          "Why physical, and why the first step only",
        ],
      },
      {
        kind: "table",
        heading: "Example: the same task, three ways",
        intro: "An illustration. Say the task is an insurance claim for a cracked phone screen. Only the last row is a first physical step.",
        columns: ["What you write", "Is it a first step?"],
        rows: [
          [
            "Sort out the insurance",
            "No. It's the whole task. There is nothing to see happen.",
          ],
          [
            "Decide what to do about the claim",
            "No. Deciding is invisible, and it's the thing you're stuck on.",
          ],
          [
            "Find the policy letter and put it on the desk",
            "Yes. Someone watching sees it happen, and it takes a few minutes.",
          ],
        ],
      },
      {
        kind: "table",
        heading: "Calls",
        intro: "The most common first step is not the call itself. It's the piece of information the call will ask for.",
        columns: ["The task", "The first physical step"],
        rows: [
          ["Book the dentist", "Look up the phone number and write it down"],
          [
            "Make a doctor's appointment",
            "Find the phone number and the times you could go",
          ],
          ["Call the landlord", "Write what you'll say in one line"],
          ["Chase a refund", "Find the reference number from the last contact"],
          ["Deal with a bill dispute", "Find the statement showing the charge"],
          [
            "Cancel a subscription",
            "Open the account page and find the cancel or manage option",
          ],
          ["Book a repair", "Take a photo of the problem"],
          [
            "Call the school office",
            "Write your question on one line and put it next to the phone",
          ],
        ],
      },
      {
        kind: "table",
        heading: "Paperwork and forms",
        intro: "Start with the thing the paperwork asks for first: a date, a number, a name.",
        columns: ["The task", "The first physical step"],
        rows: [
          ["Make an insurance claim", "Find the claim number or the policy letter"],
          [
            "Reply to the tax letter",
            "Put the letter on the desk and read the first paragraph",
          ],
          ["Renew an ID", "Find the current one and check the expiry date"],
          [
            "Renew a car registration",
            "Find the renewal notice, or write the plate number on paper",
          ],
          ["Fill in a form", "Open it and fill in your name and the date"],
          ["Change your address", "List the first three places that need it"],
          ["Apply for something", "Find the deadline and write it on a piece of paper"],
          ["Return a package", "Find the packing slip"],
          [
            "Sign up for something with a cutoff",
            "Write the cutoff date on a sticky note where you'll see it",
          ],
        ],
      },
      {
        kind: "table",
        heading: "Messages and replies",
        intro: "Writing the first line or one word is a real action. The polish comes later.",
        columns: ["The task", "The first physical step"],
        rows: [
          ["Answer a difficult email", "Write only the first line"],
          ["Ask for help", "Send one message that says what you need"],
          ["Reply to an invitation", "Type the one word, yes or no, in the reply box"],
          [
            "Chase an email nobody answered",
            "Open the old message and note the date you sent it",
          ],
          [
            "Thank someone you never thanked",
            "Write one sentence saying what they did",
          ],
        ],
      },
      {
        kind: "table",
        heading: "Home and clutter",
        intro: "Set up the job so the next step is obvious, before doing any of it.",
        columns: ["The task", "The first physical step"],
        rows: [
          ["Sort out the spare room", "Call the charity shop about collection"],
          ["Sort the mail pile", "Open the top five items and do nothing else"],
          ["Return to an old project", "Find where you left it and put it on the desk"],
          ["Clear the kitchen counter", "Put one bin bag by the door"],
          [
            "Fix a dripping tap",
            "Take a photo of the tap and find the brand name on it",
          ],
        ],
      },
      {
        kind: "table",
        heading: "Health admin and appointments",
        intro: "Admin only: finding numbers and writing down what you want to ask.",
        columns: ["The task", "The first physical step"],
        rows: [
          ["Prepare for an appointment", "Write down what you want to come away with"],
          [
            "Order a repeat prescription",
            "Find the pharmacy's phone number or website",
          ],
          ["Find a new dentist", "Open three practice websites in separate tabs"],
        ],
      },
      {
        kind: "list",
        heading: "Check your own first step",
        intro: "Run your step past these. If it fails one, shrink it.",
        checkable: true,
        items: [
          "Could someone watching see it happen?",
          "Can it be done in a few minutes?",
          "Is it a real action, not deciding or planning?",
          "Is it small enough that starting is not a decision?",
          "Do you already have everything it needs?",
        ],
      },
      {
        kind: "list",
        ordered: true,
        heading: "How to turn any task into a first step",
        items: [
          "Say the task the way you'd say it to yourself, however rough. \"The spare room.\"",
          "Say what would be true when it's finished. \"The bed is usable and the boxes are gone.\" Big things stay big partly because no one has said where they end.",
          "Ask what the first action is that involves a phone, a screen, a form or a piece of paper. Not deciding, not planning.",
          "If it's still fuzzy, ask what you'd need to find. Finding a document or a number is nearly always a valid first step.",
          "Write the step as a verb plus an object: \"Find the policy letter.\"",
          "Optionally write the second and third, but choose one to happen today.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "One, not the list",
        paragraphs: [
          "If you write two or three steps, pick one to happen today. Not the list, one. The rest aren't lost, and writing the next one down is what stops the whole thing from having to be worked out again. Put the others out of sight until the first one is done.",
        ],
      },
      {
        kind: "list",
        heading: "When the first step still won't happen",
        items: [
          "Make it smaller. \"Find the policy letter\" becomes \"open the drawer where it might be.\"",
          "Change the place, not the plan. Take the paper to a table you don't usually use.",
          "Set a short window, such as ten minutes, and stop when it ends. You're allowed to stop.",
          "Check that the step doesn't depend on something you don't have, such as a password or a decision someone else owes you. If it does, that missing thing is the real first step.",
          "If nothing feels possible, [task paralysis: what to do in the next ten minutes](/guides/task-paralysis-what-to-do-in-the-next-ten-minutes) goes smaller still.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "What is a first physical step?",
            a: "It's the first action that could be seen by someone watching, like finding a number, opening a form or putting a letter on the desk. It excludes deciding, planning and thinking. The point is that it needs no motivation and can't be done wrongly, so starting stops being a decision.",
          },
          {
            q: "How do you break down a task when you can't start?",
            a: "Say what finished looks like, then ask what the first visible action is. Write it as a verb and an object, such as \"find the policy letter.\" Write the next one or two if you can, then choose one for today. Leave the rest written down and out of sight.",
          },
          {
            q: "How small should the first step be?",
            a: "Small enough that it takes a few minutes and starting it is not a decision. If you keep not doing it, it's still too big. Shrink it: instead of \"call the dentist,\" try \"look up the number and write it down.\" A step you do beats a better step you don't.",
          },
          {
            q: "Is finding a document really a first step?",
            a: "Yes, and it's often the best one. Many stuck tasks are waiting on a number, a date or a piece of paper. Finding it is visible, quick and finishable, and it makes the next step possible. It also shows you whether the task needs a call, a form or nothing at all.",
          },
          {
            q: "What if I do the first step and stop there?",
            a: "That's a legitimate outcome. Write down where you got to and what the next step is, so it doesn't have to be worked out again. Returning to a task with a written next step is much easier than returning to a vague one.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "The Break something down walkthrough in [ADHD Life Companion](/shop/alongside) asks what the thing is, what would be true when it's finished, and what the first physical step is. It then optionally asks for the next two and which of them could happen today, with the note \"One of them. Not the list.\" The steps you're not doing today go into Life, so you don't have to carry them. It's a web app, not a list manager, so it doesn't hold everything, and it isn't treatment or medical advice.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "If the first step is a call, [how to make a phone call you have been avoiding](/guides/how-to-make-a-phone-call-you-have-been-avoiding) walks through what to put on the page. If the first step is opening the mail, [paperwork pile: where to start](/guides/paperwork-pile-where-to-start) has ten minutes' worth.",
        ],
      },
    ],
  },

  {
    slug: "a-weekly-reset-that-survives-a-bad-week",
    title: "A weekly reset that survives a bad week",
    dek: "Most resets assume a normal week. A ten minute version for the weeks that fall apart, and why a skipped week needs no catching up.",
    primaryQuery: "weekly reset for a bad week",
    next: { slug: "why-you-abandon-planners-and-how-to-come-back", reason: "If your resets keep collapsing, this explains why planners fail and how to salvage one page." },
    related: [
      { slug: "why-to-do-lists-make-it-worse", reason: "If a growing list is what wore you out, this explains why lists stall when starting is the problem." },
      { slug: "why-you-keep-missing-bill-due-dates", reason: "A weekly check is a good place to put bill dates; this shows a system that does not rely on remembering." },
      { slug: "how-to-restart-a-project-you-gave-up-on", reason: "For the project that stalled during a bad week, this shows what to leave behind and how to resume." },
    ],
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
    next: { slug: "a-weekly-reset-that-survives-a-bad-week", reason: "For the habit you keep in place of the planner, a ten minute weekly reset that survives a bad week." },
    related: [
      { slug: "why-to-do-lists-make-it-worse", reason: "To see why lists in particular stop working when starting is the problem, read these three ways they get in the way." },
      { slug: "how-to-restart-a-project-you-gave-up-on", reason: "If a project went quiet along with the planner, this shows how to resume from where you got to." },
      { slug: "life-admin-with-brain-fog", reason: "If a hard stretch of illness or grief is what broke the planner, this builds admin that works on the bad days." },
    ],
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
    next: { slug: "time-blindness-planning", reason: "Putting a date on the item helps only if you reach that day; this plans around time you cannot feel pass." },
    related: [
      { slug: "paperwork-pile-where-to-start", reason: "Missed bills often start in unopened mail, so this shows a ten minute way to open and sort it." },
      { slug: "a-weekly-reset-that-survives-a-bad-week", reason: "A short weekly reset is one way to check due dates even when the week falls apart." },
      { slug: "how-to-start-when-everything-is-overdue", reason: "If several bills are already late, this shows how to sort by who is waiting and pick one first step." },
    ],
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
    next: { slug: "why-you-abandon-planners-and-how-to-come-back", reason: "If your planner failed because time never felt real, this explains why systems break and how to come back." },
    related: [
      { slug: "why-you-keep-missing-bill-due-dates", reason: "A concrete use of one exact time: putting the date on the item so a bill does not slip past." },
      { slug: "how-to-make-a-phone-call-you-have-been-avoiding", reason: "Booking one exact time for a call and a buffer before it is easy to try with this walkthrough." },
      { slug: "a-weekly-reset-that-survives-a-bad-week", reason: "A ten minute weekly reset gives you one place to set the times you plan." },
    ],
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
    next: { slug: "four-day-homeschool-week", reason: "This shows how many days each subject gets across a four-day week and what to record when the fifth stays empty." },
    related: [
      { slug: "homeschool-subject-not-working-what-to-change-first", reason: "When the plan holds and one subject still stalls, change the time, then the amount, then go back a step." },
      { slug: "homeschool-record-keeping-for-multiple-children", reason: "Planning around more than one child? See how to keep each child's record apart and log shared lessons." },
      { slug: "how-to-start-homeschooling-first-month-paperwork", reason: "New to all this? Here is the order to set things up in the first month, ending with a plain first week." },
    ],
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
    next: { slug: "homeschool-weekly-plan-with-a-spare-day", reason: "Fill-in lines and a short-day list are in this weekly plan, built around one deliberately empty day." },
    related: [
      { slug: "do-you-have-to-count-homeschool-days-or-hours", reason: "Does a four-day week meet your state's count? This shows how to find out whether yours counts days or hours." },
      { slug: "how-to-check-if-your-child-learned-something", reason: "Fewer days on a subject raises the question of retention. This gives four questions to ask a week later." },
      { slug: "homeschool-subject-not-working-what-to-change-first", reason: "If a subject gets four days and still is not moving, start here for the cheapest fix first." },
    ],
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
    next: { slug: "do-you-have-to-count-homeschool-days-or-hours", reason: "After the notice is filed, find out whether your state also wants a count of days or hours." },
    related: [
      { slug: "homeschool-record-keeping-requirements-by-state", reason: "To see what your state asks beyond the notice, look up your level in the state table." },
      { slug: "how-to-start-homeschooling-first-month-paperwork", reason: "Filing is one step of several. This orders the first month, from rules to a first week." },
      { slug: "how-to-catch-up-on-homeschool-records", reason: "Missed a filing or a record from the start? This covers how to rebuild what you can and label it." },
    ],
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
    next: { slug: "homeschool-notice-of-intent-explained", reason: "Counting is one duty, filing is another. This explains the notice of intent and how to find yours." },
    related: [
      { slug: "homeschool-record-keeping-requirements-by-state", reason: "Look up your own state's level and the source to confirm it in this table of all 50 states and DC." },
      { slug: "homeschool-attendance-what-to-track", reason: "If you do need to count, this defines what counts as a school day and the lightest three-part record." },
      { slug: "four-day-homeschool-week", reason: "Counting days? See how a four-day week gets subjects spread across the days you actually teach." },
    ],
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
    next: { slug: "homeschool-notice-of-intent-explained", reason: "The first thing due in many states. This explains what a notice covers and five steps to find yours." },
    related: [
      { slug: "homeschool-record-keeping-requirements-by-state", reason: "Find your state's level and the official source in this table before you file anything." },
      { slug: "simple-homeschool-record-keeping-system", reason: "Start a record on day one with three things per entry, in a notebook or an app." },
      { slug: "homeschool-weekly-plan-with-a-spare-day", reason: "Ready to plan the week? This one leaves a spare day and a short-day list built in." },
    ],
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
    next: { slug: "homeschool-record-keeping-template", reason: "Copy four columns for each child, and see what to leave off the page." },
    related: [
      { slug: "simple-homeschool-record-keeping-system", reason: "For the habit that holds it together across children, see three things per entry and a plan for the bad week." },
      { slug: "what-goes-in-a-homeschool-portfolio", reason: "Each child needs their own portfolio. This covers the five contents and what to keep per subject." },
      { slug: "homeschool-reading-log", reason: "Shared read-alouds need logging once per child. This shows the three-column reading log." },
    ],
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
    next: { slug: "what-goes-in-a-homeschool-portfolio", reason: "To turn the list into portfolio evidence, this covers the contents and what to keep per subject." },
    related: [
      { slug: "homeschool-record-keeping-template", reason: "Books are one column of the wider record. Here are four columns for the daily entries." },
      { slug: "how-to-check-if-your-child-learned-something", reason: "A book list invites the next question. This gives four ways to check what your child kept." },
      { slug: "homeschool-subject-not-working-what-to-change-first", reason: "Reading stalled? This gives the cheapest-first order for changing a subject that is not working." },
    ],
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
    next: { slug: "how-to-check-if-your-child-learned-something", reason: "Not sure it is not working? First check what actually stuck, with four questions asked a week or more later." },
    related: [
      { slug: "homeschool-weekly-plan-with-a-spare-day", reason: "Changing the time of day is the first fix. This plan puts the hard subject first and leaves a spare day." },
      { slug: "homeschool-reading-log", reason: "For comprehension trouble, a reading log shows what your child finishes and what they quit." },
      { slug: "four-day-homeschool-week", reason: "Reducing the amount is the second fix. This shows how many days each subject gets in a four-day week." },
    ],
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
    next: { slug: "the-if-something-happens-to-me-file", reason: "For what to actually record before you buy a binder, this gives the file and how to build it in passes." },
    related: [
      { slug: "which-documents-to-keep-and-where-to-put-them", reason: "To decide what belongs in the binder and what to shred, use this retention guide." },
      { slug: "safe-deposit-box-and-spare-keys-who-can-open-it", reason: "Papers you cannot keep at home go in a box or safe, and this covers who can open them." },
      { slug: "what-to-write-down-in-case-something-happens-to-you", reason: "For the details that are not on paper anywhere yet, this is the short list to write first." },
    ],
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
    next: { slug: "the-if-something-happens-to-me-file", reason: "Once you have seen the gaps, the full file shows what to record and in what order." },
    related: [
      { slug: "what-to-write-down-in-case-something-happens-to-you", reason: "For the short list of items that exist only in your head, use this writing prompt." },
      { slug: "emergency-contact-and-medical-decision-maker", reason: "If a hospital needs someone to decide for you, this covers how to choose and record a health care proxy." },
      { slug: "what-happens-to-your-pets-if-something-happens-to-you", reason: "If animals would need feeding while you were away, this covers naming someone and writing down what each needs." },
    ],
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
    next: { slug: "hospital-for-two-weeks-what-would-someone-need-to-find", reason: "To see what someone would need to find in a hospital stay, this two-week test covers the rest of the paperwork." },
    related: [
      { slug: "the-if-something-happens-to-me-file", reason: "To record the proxy's name and where the forms are kept, this file gives you a place for it." },
      { slug: "talking-to-your-parents-about-their-affairs", reason: "Asking a parent who speaks for them is delicate, and this offers scripts for that conversation." },
      { slug: "who-would-raise-your-children-guardian-checklist", reason: "If you have children, naming who would raise them is the companion decision, with a checklist." },
    ],
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
    next: { slug: "emergency-contact-and-medical-decision-maker", reason: "After naming a guardian, this covers naming the person who would speak for your medical care." },
    related: [
      { slug: "update-your-paperwork-after-a-life-change", reason: "A new child is a common reason to revisit your paperwork, and this lists what to look at again." },
      { slug: "beneficiary-forms-override-your-will", reason: "To make sure money reaches the right people as well, this compares beneficiary forms and your will." },
      { slug: "what-happens-to-your-pets-if-something-happens-to-you", reason: "If your household includes animals, this covers naming someone to take them in and what to write down." },
    ],
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
    next: { slug: "how-to-find-someones-accounts-after-they-die", reason: "When a bank or policy turns up unexpectedly, this covers how to trace accounts, pensions and policies." },
    related: [
      { slug: "what-to-do-when-a-parent-dies", reason: "For the whole first two weeks in order, including certificates and funeral choices, use this US guide." },
      { slug: "digital-accounts-after-a-death", reason: "Email, phone and social accounts also need handling, and this covers what providers will release." },
      { slug: "named-executor-what-you-agreed-to", reason: "If you are the executor, this explains what the role includes and where you could be liable." },
    ],
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
    next: { slug: "beneficiary-forms-override-your-will", reason: "After a life change, the first form to check is your beneficiary designation, and this explains which one wins." },
    related: [
      { slug: "who-would-raise-your-children-guardian-checklist", reason: "A new baby means naming a guardian, and this checklist covers choosing and asking someone." },
      { slug: "emergency-contact-and-medical-decision-maker", reason: "Marriage or divorce can change who should speak for your medical care, and this explains the choice." },
      { slug: "the-if-something-happens-to-me-file", reason: "To keep the updated details in one place, this file records what exists and where it is kept." },
    ],
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
    next: { slug: "where-to-look-for-a-will", reason: "If a will may be in a box or safe, this covers where wills are kept and how to search." },
    related: [
      { slug: "life-admin-binder-what-goes-in-it", reason: "For papers kept at home, this shows how to organize them into a binder someone could open." },
      { slug: "the-if-something-happens-to-me-file", reason: "To record who can open the box and where the keys are, this file gives you a place to note it." },
      { slug: "which-documents-to-keep-and-where-to-put-them", reason: "Deciding what deserves a box versus a shredder starts with this retention guide." },
    ],
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
    next: { slug: "who-would-raise-your-children-guardian-checklist", reason: "If you also have children, this checklist covers choosing someone who would say yes." },
    related: [
      { slug: "the-if-something-happens-to-me-file", reason: "To store the note about your animals where someone will look, use this file." },
      { slug: "what-to-write-down-in-case-something-happens-to-you", reason: "For the short list of everything else that lives only in your head, use this prompt." },
      { slug: "hospital-for-two-weeks-what-would-someone-need-to-find", reason: "A hospital stay is the most likely reason someone needs to step in, and this test shows what they would need." },
    ],
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
    dek: "A trip itinerary that survives a change is short, in time order, with the reference beside each booking. A worked example and what to leave off.",
    primaryQuery: "one page trip itinerary",
    next: { slug: "what-to-keep-on-paper-when-you-travel", reason: "With the itinerary written, this covers what else belongs on paper and why to print two copies." },
    related: [
      { slug: "organising-a-multi-stop-trip-without-a-spreadsheet", reason: "For a trip with many bookings resting on each other, this shows how to record them without a spreadsheet." },
      { slug: "how-to-plan-a-group-trip", reason: "A one-page itinerary is also what you send the group, and this covers who books what and who is on it." },
      { slug: "flight-changed-what-else-is-affected", reason: "When a departure time moves, this shows which lines on the itinerary need checking first." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "travel",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A one-page trip itinerary is a timetable, not a guidebook: one line per booking, in time order, with the time, the place and the confirmation reference. Group the lines by day, leave unbooked ideas off, and print it. If a line changes, you can see what it touches.",
          "This is for trips with several bookings, alone or with others. It won't plan the trip for you and it doesn't suggest what to do, because it only records what's already booked.",
        ],
      },
      {
        kind: "table",
        heading: "Example: three days of a longer trip, on one page",
        intro: "An illustration with invented bookings. Each line answers three questions: when, where and which booking. Note the Wednesday flight lands at 07:55 but hotel check-in is 15:00. That gap is visible on the page, which is the point.",
        columns: ["Time", "Place", "Reference"],
        rows: [
          ["Tue 14 Oct, 18:40 (New York)", "Flight to Lisbon, terminal 1", "Ref K7QD2M"],
          ["Wed 15 Oct, 07:55 (Lisbon)", "Land. Shuttle to hotel", "Shuttle ref 8841"],
          ["Wed 15 Oct, 15:00", "Hotel check-in, Rua das Flores 12", "Hotel ref 30291"],
          ["Thu 16 Oct, 09:30", "Tram tour, Praca do Comercio", "Ticket ref T-5520"],
          ["Fri 17 Oct, 12:10", "Train to Porto", "Train ref P4471"],
          ["Sun 19 Oct, 10:45", "Flight home", "Ref K7QD2M"],
        ],
      },
      {
        kind: "list",
        heading: "How to write it",
        ordered: true,
        items: [
          "Collect every confirmation in one sitting. You want the time, the place and the reference for each.",
          "Write one line per booking, with the time exactly as it appears on the booking. If you cross time zones, write local time and say so, as in \"18:40 (New York)\". The line for a landing is in the destination's time, not yours.",
          "Put the lines in time order and give each day its own block. Fixed things first: flights, trains, check-in, anything with a reserved time.",
          "Write the place in a few words. A name and a town are enough. Leave the address for the paper page described in [what to keep on paper when you travel](/guides/what-to-keep-on-paper-when-you-travel).",
          "Copy the confirmation reference beside the line, not in an inbox.",
          "Mark what depends on what. A shuttle built on a flight, a check-in built on a train. When the first moves, the rest need a look, which is the subject of [what else in your trip is affected when a flight changes](/guides/flight-changed-what-else-is-affected).",
          "Leave the rest of each day empty on purpose. An empty afternoon isn't a hole in the plan, it's slack.",
        ],
      },
      {
        kind: "list",
        heading: "What to leave off",
        checkable: true,
        items: [
          "Restaurant and sightseeing ideas that aren't booked. Keep them in a separate note.",
          "Opening hours you haven't confirmed.",
          "Long descriptions.",
          "Anything that would be useless if it changed. Put that in your notes instead.",
          "Cost. This page is about timing, not money.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "When it doesn't work",
        paragraphs: [
          "A page that runs to two sheets is usually a guidebook in disguise. If you can't fit it on one side, move the unbooked material to a separate note and look again. If the trip is genuinely long with many stops, do one page per stop and a summary page on top, and see [organising a multi-stop trip](/guides/organising-a-multi-stop-trip-without-a-spreadsheet). If several people are traveling, add a name to each line, the way [how to plan a group trip](/guides/how-to-plan-a-group-trip) does.",
          "The other failure is stale paper. An itinerary printed a month ago and never updated is worse than none, because you'll trust it. Change the page when a booking changes, and reprint the night before, per the [night-before list](/guides/night-before-you-travel-checklist).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What the Companion does with this",
        paragraphs: [
          "In Travel Companion you name the trip and give it rough dates, and it's laid out day by day at once. You add each booking with its reference, its time and, if it rests on something else, what it depends on. Add the upstream booking first, because the dependency has to be picked when the booking is created. A day with nothing recorded says so and isn't filled in for you. Save as PDF makes the itinerary, and a separate button makes a one-page trip card. Dates print like \"Wed 8 Oct\" and times as \"15:00\", so a 3 p.m. check-in shows as 15:00. It records bookings you made elsewhere by hand. It doesn't book anything, track flights or suggest places. See the [Travel Companion page](/shop/travel-companion).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "What should a trip itinerary include?",
            a: "For each booking: the time, the place and the confirmation reference. For a group, add who's on it. Everything else, such as opening hours, ideas or long descriptions, belongs in a separate note. If you can't tell at a glance where to be, the page has too much on it.",
          },
          {
            q: "How detailed should an itinerary be?",
            a: "Detailed enough to act on, short enough to fit on one side. One line per booking is plenty. Leave the empty spaces in each day empty. If you find yourself adding descriptions, you're writing a guidebook.",
          },
          {
            q: "How do I handle time zones on an itinerary?",
            a: "Write the local time of each event and label the place, for example 18:40 (New York) for a departure and 07:55 (Lisbon) for the arrival. Don't convert to your home time. The booking shows local times, so the page should match it.",
          },
          {
            q: "Should I print my itinerary?",
            a: "Yes. A printed page works when the phone doesn't, and you can hand it to whoever is meeting you. Print two copies and keep them in different bags. Reprint if anything changes.",
          },
          {
            q: "How do I share a group itinerary?",
            a: "Send the page itself, as a file or a printout, rather than a link to a chat. Add the names of the people on each line, so everyone can see which items are theirs.",
          },
        ],
      },
    ],
  },

  {
    slug: "packing-list-for-a-week-away",
    title: "Packing list for a week away, by person",
    dek: "Start with what every trip needs, add what this one asks for, then split it by person. A method you can tick off as you pack.",
    primaryQuery: "packing list for a week away",
    next: { slug: "carry-on-only-packing-list", reason: "If the whole week must fit in one bag, this covers choosing the bag first and packing to the list." },
    related: [
      { slug: "packing-and-planning-for-a-trip-with-kids-or-a-baby", reason: "Packing for children too? This adds per-child lists and the paperwork to note for each." },
      { slug: "night-before-you-travel-checklist", reason: "The evening before you leave, this six-check list confirms the bag holds what matters." },
      { slug: "road-trip-planning-checklist", reason: "Packing for a drive instead of a flight? This adds the stops, stays, car check and who drives when." },
    ],
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
    next: { slug: "night-before-you-travel-checklist", reason: "With the bag packed and closed, this covers the last checks on documents, cards, phone and times." },
    related: [
      { slug: "packing-list-for-a-week-away", reason: "For a longer per-person list split into shared and personal items, start with this week-away guide." },
      { slug: "first-international-trip-checklist", reason: "A first trip abroad has rules a carry-on cannot fix, so this lists what to sort and how early." },
      { slug: "packing-and-planning-for-a-trip-with-kids-or-a-baby", reason: "Flying with children changes what fits in one bag, and this covers what to pack for each child." },
    ],
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
    next: { slug: "packing-list-for-a-week-away", reason: "For the full per-person packing method that the child lists build on, start with this guide." },
    related: [
      { slug: "travel-document-checklist", reason: "Each child has papers to note, and this shows what to carry and where to keep it." },
      { slug: "carry-on-only-packing-list", reason: "If you are trying to travel light with a child, this covers picking the bag first and packing to a list." },
      { slug: "road-trip-planning-checklist", reason: "Driving with children means planning stops around them, and this covers daily distance, stays and the car check." },
    ],
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
    next: { slug: "travel-document-checklist", reason: "Before anything goes missing, this shows how to note where each document is kept so you can say what is gone." },
    related: [
      { slug: "what-to-keep-on-paper-when-you-travel", reason: "Paper copies and the hotel address in the local language help when a phone is the thing you lost." },
      { slug: "hotel-cannot-find-your-reservation", reason: "If the loss leaves you without a card or booking, this covers what to say at the hotel desk tonight." },
      { slug: "first-international-trip-checklist", reason: "For a first trip abroad, this covers sorting money, insurance and phone before you leave, so a loss hurts less." },
    ],
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
    next: { slug: "travel-document-checklist", reason: "Once the rules are checked, this covers the documents each traveler carries and where to note each one." },
    related: [
      { slug: "night-before-you-travel-checklist", reason: "On the last evening, this six-check list confirms nothing from the timeline was missed." },
      { slug: "lost-passport-wallet-or-phone-abroad-what-to-have-ready", reason: "Know who to tell and what to gather if a passport, wallet or phone disappears abroad." },
      { slug: "packing-list-for-a-week-away", reason: "After the paperwork, this shows how to build a packing list by person that you can tick off." },
    ],
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
    next: { slug: "night-before-you-travel-checklist", reason: "Before you set off, this short evening list covers the documents, phone and house checks the route does not." },
    related: [
      { slug: "packing-list-for-a-week-away", reason: "For the pack itself, this shows how to build a list by person with shared items marked." },
      { slug: "how-to-plan-a-group-trip", reason: "Sharing the drive with others? This covers who books what, who is on each booking and where answers live." },
      { slug: "how-to-write-a-one-page-trip-itinerary", reason: "Turn the stops and stays into a single page in time order with a reference beside each booking." },
    ],
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
    next: { slug: "what-to-keep-on-paper-when-you-travel", reason: "If you have not printed yet, this covers the one page worth printing and why to keep two copies." },
    related: [
      { slug: "travel-document-checklist", reason: "For a fuller check of what each traveler needs and where it is kept, use this documents guide." },
      { slug: "carry-on-only-packing-list", reason: "To check the bag itself, this covers packing one carry-on to a list, with size and weight checked on the airline page." },
      { slug: "flight-delayed-with-a-connection-what-to-do-first", reason: "If the morning goes wrong at the airport, this covers the first twenty minutes of a delay with a connection." },
    ],
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
    next: { slug: "car-maintenance-by-mileage-start-with-your-manual", reason: "Once you know what is due, this shows how to pull the mileage and month intervals for your own car from the manual." },
    related: [
      { slug: "car-maintenance-log-what-to-write-down", reason: "Keep the dates and odometer readings this answer depends on in a running log, one line per job." },
      { slug: "winter-car-prep-checklist", reason: "Heading into cold weather, this lists the battery, tire and wiper checks worth doing before the first frost." },
      { slug: "car-paperwork-dates-organizer", reason: "Registration and insurance have due dates too, and this shows how to track them alongside the service jobs." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "A job is due when you reach its mileage or its months, whichever comes first. Take today's odometer reading, subtract the reading when the job was last done, count the months since that date, and compare both to the intervals in your owner's manual. The one that's closer to its limit decides.",
          "This is for a car you drive in miles, with a manual or a maker's schedule to hand. It can't tell you what your car's intervals are, and it can't judge a job that has no date behind it. For that, start with a recorded date, even a rough one you label as rough.",
        ],
      },
      {
        kind: "table",
        heading: "An example: four jobs on one car",
        intro: "Say it's August 20, the odometer reads 52,300, and these are the intervals and last-done facts. They're an illustration, not your car's schedule.",
        columns: ["Job", "Interval", "Last done", "Since then", "What decides"],
        rows: [
          [
            "Engine oil and filter",
            "5,000 mi or 6 mo",
            "Mar 3, at 48,100",
            "4,200 mi, 5.6 mo",
            "Months: due about Sep 3",
          ],
          ["Tire rotation", "7,500 mi", "Jan 15, at 44,900", "7,400 mi", "Miles: about 100 left"],
          [
            "Cabin air filter",
            "15,000 mi or 12 mo",
            "Sep 10 last year, at 39,000",
            "13,300 mi, 11.3 mo",
            "Months: due about Sep 10",
          ],
          ["Brake fluid", "24 mo", "Not recorded", "Unknown", "Nothing to judge yet"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Reading the example",
        paragraphs: [
          "Look at the oil line. Only 4,200 of 5,000 miles are used, so it feels early. But 5.6 of 6 months are gone, so the months limit is the one that's about to be reached. A car that sits in a driveway most of the week hits the months first. A car that does a long commute hits the miles first.",
          "The brake fluid row is the one to notice. No date means no answer, and a guessed date would give a false one. Leave it blank and say so, then find out the real date or start the clock from the next time it's done.",
        ],
      },
      {
        kind: "list",
        heading: "The method, five steps",
        ordered: true,
        items: [
          "Find the intervals. Your owner's manual lists each job by miles, by months, or both. Many manuals also have a second, shorter schedule for severe driving, such as towing, mostly short trips, heavy dust or extreme heat or cold. If that's how you drive, use the shorter one. [This guide shows where to look in the manual](/guides/car-maintenance-by-mileage-start-with-your-manual).",
          "Write down when each job was last done and the odometer reading at the time. A receipt, a sticker on the windshield or a shop's records can supply it. If you did it yourself, your own note does.",
          "Read the odometer today. Write the number down beside the date, because the answer is only as good as this reading.",
          "Subtract. Today's miles minus the last-done miles is the distance since. Count the months from the last-done date to today.",
          "Compare each to its interval. Whichever is further along its limit is the one that decides, and it tells you how much is left. If both are past, it's due now.",
          "If the manual gives only miles or only months for a job, use the one it gives. Don't invent the other.",
        ],
      },
      {
        kind: "list",
        heading: "When the answer is wrong",
        items: [
          "The odometer reading is stale. If you last looked three weeks ago and you drive a lot, every miles figure is low. Look again before you decide anything.",
          "There's no last-done date. Don't fill it in from memory of \"about last spring\". Mark the job as unknown, and either check with the shop that did it or treat the next service as day one. [If you bought the car without records, this covers where to look](/guides/used-car-no-service-records-what-to-do).",
          "You drive in hard conditions and used the normal schedule. The severe-duty schedule usually comes round sooner, so the job you think is fine may be due.",
          "The manual and the shop disagree. Shops sometimes suggest sooner intervals than the maker does. You can ask them to show you why for your car, and it's your call. What's due by the maker's schedule and what a shop recommends are two different questions, so keep them apart in your notes.",
          "You have more than one car. The sum is the same, but the notes get mixed. [Keeping each car's jobs on its own line](/guides/two-cars-one-household-maintenance) avoids doing the arithmetic on the wrong odometer.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How do I know when my car is due for service?",
            a: "Compare two numbers for each job: the miles driven since it was last done and the months elapsed since then. Check both against the intervals in your owner's manual. The job is due when either limit is reached. If you have no record of when it was last done, you can't tell yet.",
          },
          {
            q: "Is it miles or months, whichever comes first?",
            a: "When a manual gives both, yes. The job comes due at whichever limit you reach first. Someone who drives little may reach the months limit while the odometer has barely moved, and a heavy driver reaches the miles first. If the manual gives only one, use that one.",
          },
          {
            q: "What if I don't know when something was last done?",
            a: "Don't guess a date. Write down that it's unknown. Then either ask the shop that serviced it, look for a receipt, or treat your next service as the starting point. A job with no date can't be called overdue, because there's nothing to measure from.",
          },
          {
            q: "Where do I find my car's maintenance schedule?",
            a: "In the owner's manual, usually in a section on maintenance or service. Most makers also post manuals on their owner websites, searchable by year and model. If you drive under severe conditions, look for a separate schedule for that.",
          },
          {
            q: "How often should I check what's due?",
            a: "Whenever you fill the tank is too often for most jobs, but every month or two is reasonable, and always right after the odometer passes a round number. A shorter habit is to check when you record a new job, since the reading is already fresh in your mind.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "[Vehicle Maintenance Companion](/shop/vehicle-maintenance-companion) does the subtraction from the numbers you enter. You type each job's interval in miles, months or both, and when it was last done, and its Due view lists what's due across every car you own, most urgent first. It says so plainly when nothing is due. A job with no recorded date shows as nothing to judge yet, never as overdue. It works in miles only, and it uses your intervals, not a factory schedule. It also asks you to update the mileage once it's more than 30 days old, because the answer depends on it.",
        ],
      },
      {
        kind: "callout",
        label: "Before you go",
        body: "Update the odometer reading first, every time. Then the rest of the sum is only subtraction.",
      },
    ],
  },

  {
    slug: "what-to-tell-a-mechanic-before-work-starts",
    title: "What to tell a mechanic before the work starts",
    dek: "Say what you are asking for, the most you will approve without a call, and ask for an estimate in writing. Scripts to say and a page to hand over.",
    primaryQuery: "what to tell a mechanic before repair",
    next: { slug: "car-maintenance-log-what-to-write-down", reason: "After the work is done, write it down with date and mileage so the next shop or buyer can see it." },
    related: [
      { slug: "what-is-due-on-my-car-right-now", reason: "Before you book the shop, check which jobs are actually due so you ask for the right work." },
      { slug: "glove-box-checklist-what-to-keep", reason: "Keep the shop estimate and a pen card with your essential numbers where you can reach them." },
      { slug: "two-cars-one-household-maintenance", reason: "If two cars go to the same shop, this keeps each job filed against the right vehicle." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "vehicles",
    sources: [
      {
        name: "Auto Repair Basics (FTC Consumer Advice)",
        url: "https://consumer.ftc.gov/articles/auto-repair-basics",
        retrieved: "2026-09-26",
        note: "Written estimate contents, approval past a limit, old parts, dispute steps.",
      },
      {
        name: "Maintenance and repairs (California Bureau of Automotive Repair)",
        url: "https://www.bar.ca.gov/auto-repairs",
        retrieved: "2026-09-26",
        note: "California example: estimate, authorization in written, oral or electronic form, extra work, returned parts.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Before the keys change hands, say three things: what you're asking for today, the most you'll approve without a call, and that you want any other work described and priced in writing before it starts. Then get that in a text or on paper, because a spoken request is easy to lose.",
          "This is for a car going in for scheduled work or a repair in the United States. It can't make a shop do anything, and the rules on estimates and approval differ by state, so it's not legal advice. It makes your request clear, and a clear request is easier for a shop to follow and easier to point to later.",
        ],
      },
      {
        kind: "scripts",
        heading: "What to say, by moment",
        intro: "Say these in your own words. The point is that each one names something the shop can act on.",
        items: [
          {
            situation: "At drop-off",
            line: "I'm asking for an oil and filter change and a tire rotation, and nothing else today. If you find anything else, please call me before you do any of it.",
          },
          {
            situation: "Setting a limit",
            line: "Please don't go over $250 without calling me first, and wait for my answer.",
          },
          {
            situation: "A problem, not a job",
            line: "The brakes squeal when I slow down. Please find out why and give me an estimate in writing before you fix anything.",
          },
          {
            situation: "When they call about more",
            line: "What exactly did you find, what does it cost with parts and labor, and can you text me that so I have it in writing?",
          },
          {
            situation: "If you can't decide yet",
            line: "Thanks for telling me. Please don't do that part today. I'll call you back by this afternoon.",
          },
          {
            situation: "About the old parts",
            line: "Please keep the parts you replace so I can see them when I pick up.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "An example of how the call goes",
        paragraphs: [
          "Say it's Tuesday and you drop off a car for an oil change. Your written request is one line. At noon the shop calls: the brake pads are thin and the job is $480. You didn't have a limit, so it's a live decision made over a phone in the middle of your workday.",
          "With the sentence already said, the shop knows to wait. You can say \"text me that\", read it at your own pace, and answer yes, no or not today. That's the whole value of saying it first: the decision happens when you're ready, not when they are.",
        ],
      },
      {
        kind: "list",
        heading: "The short version, in order",
        ordered: true,
        items: [
          "Say what you're asking for in specific terms. \"An oil and filter change and a tire rotation\" is a request. \"Have a look at it\" gives the shop room to decide what's needed.",
          "Give a limit if you have one, and a number to reach you on during the day.",
          "Ask what a diagnosis costs before it starts. A shop can charge to find a problem, and whether that fee comes off the repair is worth knowing first.",
          "Ask that any further work be estimated in writing, by text or email if you can, so you have a record with a date.",
          "Note the odometer reading and the date on your own copy, and take a photo of the dash.",
          "When the work is done, compare the final bill to the approved estimate line by line before you pay.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What the rules say, and where they stop",
        paragraphs: [
          "The FTC's advice is that a written estimate should describe the problem, the parts and the expected labor, and should say the shop will contact you for approval before going past a set amount of time or money. It also says shops should give you back replaced parts, and that state law may require it.",
          "Some states go further. California's Bureau of Automotive Repair, for example, says a shop must give an estimate before starting and must contact you and get your approval for extra work, and it accepts your approval in written, oral or electronic form. Your state's attorney general or the agency that licenses repair shops will tell you what applies where you live.",
        ],
      },
      {
        kind: "list",
        heading: "When it goes wrong",
        items: [
          "The bill is higher than the estimate and you didn't approve the difference. Ask the shop to show where the approval came from. Keep your text or your copy of the request.",
          "Something was done that you didn't ask for. Ask the manager, in writing if you can, what authorized it. The FTC suggests speaking with the shop manager or owner first, then contacting your state attorney general or a local consumer protection agency, and it lists small claims court as an option that doesn't need a lawyer.",
          "You're tempted to refuse the bill or take the car. Before you do, call your state's consumer office, because what a shop can do with a car and an unpaid bill depends on the state.",
          "It's an emergency tow. You may have to say yes on the spot. Ask for the price before they hook up, and do the paper afterward.",
          "You did everything right and the shop still went ahead. A written request is your evidence, not a guarantee. Keep it, along with the invoice and the dates.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Can a mechanic charge more than the estimate?",
            a: "In many states a shop needs your approval before going past the estimate, but the details depend on where you live. California's Bureau of Automotive Repair, for example, says the shop must contact you for approval of extra work. Check your state attorney general's consumer page for the rule that applies to you.",
          },
          {
            q: "Do I need a written estimate before a repair?",
            a: "The FTC advises getting one, listing the problem, parts and labor. Some states require it. If you can't get it on paper, ask for it by text or email so there's a dated record. Then keep it with the final invoice.",
          },
          {
            q: "Should I tell the mechanic my budget?",
            a: "Giving a limit isn't required, but it's useful. A sentence like \"call me before you go past $250\" tells the shop when to stop and ask, rather than deciding for you.",
          },
          {
            q: "Can I ask for my old parts back?",
            a: "Yes, you can ask. The FTC says shops should return replaced parts, and some states require it. It's best to ask before the work starts, not at pickup, and California's Bureau of Automotive Repair notes you can request them before authorizing.",
          },
          {
            q: "What do I do if I was charged for work I didn't approve?",
            a: "Keep every record, then talk to the shop manager or owner. If that fails, the FTC suggests your state attorney general or a local consumer protection agency, and small claims court is an option. Don't stop there if the shop is licensed, because a licensing agency may take complaints too.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "[Vehicle Maintenance Companion](/shop/vehicle-maintenance-companion) prints a page called the Service Boundary from the jobs you're tracking. It lists what you're requesting today with the date and mileage, says that anything not listed is not authorized, asks the shop to call before further work and to give a written estimate, and has an optional line for the most you'll go without a call. There are lines for you and the shop to initial. It's a written request, not a contract, and the app doesn't check or use the amount. It's made in your browser when you click.",
        ],
      },
      {
        kind: "list",
        heading: "Before you hand over the keys",
        checkable: true,
        items: [
          "Say what you're asking for, and nothing more.",
          "Say the most you'll approve without a call.",
          "Get every extra in writing before you say yes.",
          "Keep the request, the estimate and the invoice together.",
        ],
      },
      {
        kind: "callout",
        label: "Next step",
        body: "After the work is done, write the date, mileage and what was done into your record. [Here's what to write down](/guides/car-maintenance-log-what-to-write-down).",
      },
    ],
  },

  {
    slug: "used-car-no-service-records-what-to-do",
    title: "Bought a used car with no service records? What to do",
    dek: "No service records on your used car? Ask the seller, read the odometer, get an independent inspection and start your own record from today.",
    primaryQuery: "used car no service records",
    next: { slug: "car-maintenance-log-what-to-write-down", reason: "Start your own record today: this lays out the columns and what to write on each line." },
    related: [
      { slug: "car-maintenance-by-mileage-start-with-your-manual", reason: "With no history to go on, find your manual's intervals and write them down using this guide." },
      { slug: "what-is-due-on-my-car-right-now", reason: "Work out what is probably due now, working from the miles and the date you bought the car." },
      { slug: "first-car-checklist-for-new-drivers", reason: "Use the first-week checklist to get the manual, papers and glove box sorted in one pass." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "vehicles",
    sources: [
      {
        name: "Buying a Used Car From a Dealer (FTC Consumer Advice)",
        url: "https://consumer.ftc.gov/articles/buying-used-car-dealer",
        retrieved: "2026-09-26",
        note: "History report does not show mechanical issues; independent inspection, even for certified cars; written report with cost estimates and VIN.",
      },
      {
        name: "Check for Recalls (NHTSA)",
        url: "https://www.nhtsa.gov/recalls",
        retrieved: "2026-09-26",
        note: "VIN recall lookup, free repair of open recalls. Page blocked automated fetch; content confirmed from search results only.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Start with the seller: ask what they remember and whether any receipts exist, then read the odometer and write it down with today's date. Next, have an independent mechanic look the car over, check it for open recalls by VIN, and start your own record from today. Don't assume it was serviced, and don't assume it wasn't.",
          "This is for someone in the United States who already owns a used car with no paperwork, or is about to. It can't tell you what was done to the car, and nothing here is a mechanical diagnosis.",
        ],
      },
      {
        kind: "scripts",
        heading: "What to ask the seller",
        intro: "If you haven't bought yet, ask before you pay. If you have, ask anyway, in a text so the answer is in writing.",
        items: [
          {
            situation: "Any records at all",
            line: "Do you have receipts, an invoice folder or notes on anything done to it, even oil changes?",
          },
          {
            situation: "Where it was serviced",
            line: "Which shop or dealership did you use? I'd like to ask them what they have on file.",
          },
          {
            situation: "The last big jobs",
            line: "Do you remember when the brakes, tires or timing belt were last done, even roughly?",
          },
          {
            situation: "Who owned it before",
            line: "Did it come with anything from the previous owner, or do you know who they were?",
          },
          {
            situation: "Anything odd",
            line: "Is there anything you know about that I should watch for?",
          },
        ],
      },
      {
        kind: "table",
        heading: "Where a service history can turn up",
        intro: "None of these is certain. Each is worth one phone call or one lookup.",
        columns: ["Where", "What it can give you", "What it can't"],
        rows: [
          [
            "The seller",
            "Receipts, a folder, a remembered date, a shop name",
            "Anything they can't remember",
          ],
          [
            "The shop they name",
            "Work they did, if they'll look it up by the car",
            "Work done anywhere else",
          ],
          [
            "A dealer for the brand",
            "Some can look up a VIN for warranty and recall work",
            "Work done by independent shops",
          ],
          [
            "A vehicle history report",
            "Title, salvage and insurance loss records, sometimes accidents",
            "Whether the oil was ever changed",
          ],
          ["NHTSA recall lookup", "Open safety recalls, by VIN", "Routine maintenance"],
          ["Your own inspection", "What the car looks like today", "What happened before"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "The lookups worth doing",
        paragraphs: [
          "The FTC is plain about the middle of that table: a vehicle history report won't identify mechanical problems, so it advises paying an independent mechanic to inspect the car, even when a dealer calls it certified, and asking for a written report with cost estimates and the VIN on it. NHTSA offers a free recall lookup by VIN at its recalls page, and an open recall is repaired at no cost.",
          "If you're still deciding whether to buy, do these before the sale. If you've bought, they still apply, and the inspection is now your baseline.",
        ],
      },
      {
        kind: "list",
        heading: "The first week, in order",
        ordered: true,
        items: [
          "Read the odometer and write down the number and the date. That's day one.",
          "Record what the seller said, marked as what they said: \"Seller says timing belt done around 90,000 miles, no receipt.\" A receipt you've seen is a different kind of fact. Keep the two labeled differently.",
          "Look up the VIN for open recalls and run any history report you want.",
          "Get the owner's manual. If it's missing, the maker's owner website usually has a copy by year and model. It tells you how often each job comes round. [Here's how to read it](/guides/car-maintenance-by-mileage-start-with-your-manual).",
          "Take it to an independent mechanic and ask what they see: tires, brakes, fluids, belts, leaks. Write down what they say, and what it costs if they quote a job. [What to tell them first](/guides/what-to-tell-a-mechanic-before-work-starts).",
          "Decide job by job. For oil and filter, coolant, brake fluid, tires and belts, choose one of three: do it now, check it now, or wait for a real date. You're allowed to do nothing about a job, as long as you write down that you chose to.",
          "Start your log with these lines and add to it whenever something's done. [Here's the format](/guides/car-maintenance-log-what-to-write-down).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "An example first entry, invented for illustration",
        paragraphs: [
          "Say the odometer is 84,000 and the seller has no records. You write: \"Bought Sep 12, 84,000 mi. Seller says oil changed 'regularly', no receipts. Timing belt: unknown.\" You get a $200 inspection and the mechanic reports the tires are at the wear limit and the fluid is dark. You write those down, decide to change the oil and coolant now, and leave the belt as unknown until you can check the interval in the manual.",
          "That entry is small, but it's dated and it says what you knew. In two years it's the start of the history you wished you'd been handed.",
        ],
      },
      {
        kind: "list",
        heading: "What can go wrong",
        items: [
          "Assuming the worst and paying for a full service of everything at once. You may be replacing fluid that was changed last month.",
          "Assuming the best and doing nothing. A car with no paper is a car you can't see into, and the risk is yours.",
          "Writing down a date you don't have. \"About two years ago\" isn't a fact. Write \"unknown\" and move on.",
          "Treating a history report as a service log. It records title and insurance events, not oil changes.",
          "Doing all of this months later. The seller's memory fades fast, and the shop may stop answering.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Is a car with no service history bad?",
            a: "Not by itself. Plenty of well-kept cars have no paper, because nobody wrote it down. It does mean you can't see what was done, so an independent inspection matters more, and the price should reflect that risk. It's a reason to look harder, not to walk away automatically.",
          },
          {
            q: "How do I find a used car's service history?",
            a: "Ask the seller for receipts and the names of shops they used, then ask those shops what they have on file. A dealer for the brand may be able to look up warranty and recall work by VIN. A history report shows title events, not routine maintenance.",
          },
          {
            q: "What should I do first after buying a used car with no records?",
            a: "Record the odometer and date, check the VIN for open recalls, and get an independent mechanic's look. Then decide job by job whether to do it now or wait, and start your own log so the next owner has something.",
          },
          {
            q: "Should I change everything right away?",
            a: "Not automatically. Decide each job separately: oil and filter, brake fluid, coolant, tires, belts. Some are cheap enough that doing them now makes sense. Others are better checked than replaced. Ask the mechanic what they see.",
          },
          {
            q: "Can I check a used car for recalls?",
            a: "Yes. NHTSA has a free lookup on its recalls page: enter the 17-character VIN, found on the lower left of the windshield or inside the driver-side door. An open recall is repaired at no cost by a dealer for that brand.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "[Vehicle Maintenance Companion](/shop/vehicle-maintenance-companion) lets you mark a vehicle's history as unknown from the change screen for that vehicle. After that, no job reads as overdue on a fact you never had. Each job waits at nothing to judge yet until you record when it was last done, and the same is true of any job with no date, on any car. Once you have real dates from the shop, the seller or your own next service, you enter them and the Due view starts working from them.",
        ],
      },
      {
        kind: "callout",
        label: "Also useful",
        body: "Bought the car from someone who died, or inherited it? The paperwork side is its own job, and [the car paperwork guide](/guides/car-paperwork-dates-organizer) covers the dates. Then come back here for the mechanical side.",
      },
    ],
  },

  {
    slug: "car-maintenance-log-what-to-write-down",
    title: "Car maintenance log: what to write down",
    dek: "What a car maintenance log needs on every line, what to leave off, and a filled-in example you can copy into a notebook or a spreadsheet.",
    primaryQuery: "car maintenance log",
    next: { slug: "what-is-due-on-my-car-right-now", reason: "With a log in hand, this shows how to read it against your intervals and see what is due now." },
    related: [
      { slug: "car-maintenance-by-mileage-start-with-your-manual", reason: "Pull the intervals from your owner's manual so each log line has a date and mileage to aim for." },
      { slug: "selling-your-car-with-a-service-history", reason: "When the car changes hands, this turns your log into a service history a buyer can read." },
      { slug: "used-car-no-service-records-what-to-do", reason: "If the car came with no paperwork, this explains how to begin a record from the day you get it." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "vehicles",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Every line of a car maintenance log needs three things: the date, the odometer reading in miles, and what was done in plain words. Who did it and what it cost are worth adding but optional. A line like \"Mar 3, 48,100 mi, oil and filter change\" is a complete entry.",
          "This is for a car you want to keep a record of, in a notebook, a spreadsheet or an app. It can't fill in the past for you, and it isn't a schedule: the log says what happened, and your owner's manual says how often it should.",
        ],
      },
      {
        kind: "table",
        heading: "An example log",
        intro: "A filled-in sample with made-up entries, so you can see what a good line looks like.",
        columns: ["Date", "Miles", "What was done", "Who", "Cost / note"],
        rows: [
          [
            "Mar 3",
            "48,100",
            "Oil and filter change",
            "Main Street Garage",
            "$74. 0W-20, filter part on receipt",
          ],
          ["Mar 3", "48,100", "Tire rotation", "Main Street Garage", "Included"],
          [
            "Jun 21",
            "50,600",
            "Replaced rear brake pads",
            "Kwik Brakes",
            "$310. Rotors measured fine",
          ],
          ["Jul 9", "51,400", "Replaced wiper blades", "Me", "$26. Both front"],
          [
            "Aug 2",
            "52,000",
            "Battery replaced after a slow start",
            "Main Street Garage",
            "$165. Old one was 5 years old",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why those columns",
        paragraphs: [
          "The dates and miles are what make it useful. Everything in the last two columns is a bonus, and you can leave them out when you're in a hurry. A line with a date, a mileage and three words beats a beautiful log you stopped keeping.",
        ],
      },
      {
        kind: "list",
        heading: "What goes on each line",
        ordered: true,
        items: [
          "Date. The day the work was done, not the day you got the bill.",
          "Miles. The odometer at the time. If you forget to look, use the number on the receipt, which shops usually print.",
          "What was done. Plain words: \"replaced front brake pads\", not \"brakes\". If a part matters, name it.",
          "Who did it. A shop name or \"me\". It helps when you have a question later.",
          "Cost or note. What it cost, or anything you'd want to remember, like an oil grade or a part number. Costs are optional and you can leave them out.",
        ],
      },
      {
        kind: "list",
        heading: "What else is worth writing",
        items: [
          "Repairs, not just scheduled jobs. A brake job after a squeal or a battery after a bad morning is often the line a next owner reads first.",
          "Jobs you did yourself, with the same three facts.",
          "Tire changes and rotations, since they're easy to forget when you last did them.",
          "What a mechanic found, even if you didn't act on it: \"Rear tires near wear limit, told to watch.\" It's a dated fact.",
          "Oil grade and filter part number in the note, if you'll want to buy the same one again.",
        ],
      },
      {
        kind: "list",
        heading: "What to leave off",
        items: [
          "A guess about the past. \"About last year\" isn't a date. Leave the job blank and start from the next one you do.",
          "Things you meant to do. \"Brakes need doing\" is a reminder, and belongs somewhere else. The log records what happened.",
          "A gap you'd rather hide. If something was done and it doesn't look great, leave it in. A buyer reads gaps, and a full log with a repair on it is easier to trust than a tidy one.",
          "Anything about you: your address, account numbers, your VIN plate. The car's record doesn't need them.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where to keep it",
        paragraphs: [
          "Keep the receipts, and photograph each one the day you get it. A photo in a folder titled with the car's name is enough. The log is the summary, and the receipt is the proof.",
          "A notebook works if it lives in the glove box. A spreadsheet works if you open it. What doesn't work is a log in two places, because one of them goes stale. Pick one, and update it the same day as the job. Ten seconds at the counter beats an evening of reconstruction.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "What should be in a car maintenance log?",
            a: "A date, the odometer reading in miles and a plain description of what was done on every line. Who did the work and what it cost are worth adding but optional. Repairs and one-off jobs belong alongside scheduled ones, since a log is a record of what happened.",
          },
          {
            q: "How do I start a log for a car I already own?",
            a: "Start with today: the odometer, the date and anything you know for certain. For older work, add only what you have a receipt or a reliable date for. Mark everything else unknown, and don't backfill guesses. [If the car came without records, this helps](/guides/used-car-no-service-records-what-to-do).",
          },
          {
            q: "Is a paper log or an app better?",
            a: "Whichever you'll update the same day. A notebook in the glove box is fine, and so is a spreadsheet. What matters is one place and the habit, not the tool. Keep photos of receipts wherever you keep the log.",
          },
          {
            q: "Do I need to log oil changes and tire rotations?",
            a: "Yes. They're the most common jobs and the easiest to lose track of. Each takes one line. The date and mileage are what let you work out [what's due next](/guides/what-is-due-on-my-car-right-now).",
          },
          {
            q: "Does a log help when I sell the car?",
            a: "A dated log lets a buyer see how the car was looked after, though it's your own record and not proof. Receipts stapled to it help. [Here's how to present it](/guides/selling-your-car-with-a-service-history).",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "[Vehicle Maintenance Companion](/shop/vehicle-maintenance-companion) keeps each service with its date, mileage, who did it, an optional cost and a note, grouped by year with the newest first. You can log a service that was never a tracked job, such as a repair. Draftpace doesn't sell a blank log template: the Service record printout is made from what you've entered, and there's no export or photo upload, so keep the receipts wherever you already do.",
        ],
      },
    ],
  },

  {
    slug: "selling-your-car-with-a-service-history",
    title: "Selling your car: how to present your service history",
    dek: "A dated record shows a buyer how a car was looked after. What to bring, what a record you kept yourself can and cannot prove, and how to print it.",
    primaryQuery: "selling a car with service history",
    next: { slug: "car-maintenance-log-what-to-write-down", reason: "Before you hand anything over, this shows how to keep the record complete: date, miles and what was done." },
    related: [
      { slug: "car-paperwork-dates-organizer", reason: "Gather the registration, insurance and inspection papers a buyer will ask to see at the same time." },
      { slug: "used-car-no-service-records-what-to-do", reason: "Buying rather than selling, this covers what to do when the car arrives without any service history." },
      { slug: "glove-box-checklist-what-to-keep", reason: "Clear out the glove box before the handover and decide which papers stay with the car." },
    ],
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
    next: { slug: "what-is-due-on-my-car-right-now", reason: "After you have your intervals, this turns them into a clear answer on what is due right now." },
    related: [
      { slug: "car-maintenance-log-what-to-write-down", reason: "Record each interval and the last date it was done in a log so the manual numbers stay useful." },
      { slug: "first-car-checklist-for-new-drivers", reason: "New to the car, this first-week checklist puts finding the manual at the top of the list." },
      { slug: "two-cars-one-household-maintenance", reason: "If you run two cars, this shows how to keep each one's intervals and dates apart." },
    ],
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
    next: { slug: "what-is-due-on-my-car-right-now", reason: "Alongside the cold-weather checks, see what else is due by miles or months before the season starts." },
    related: [
      { slug: "car-maintenance-by-mileage-start-with-your-manual", reason: "For fluids and other jobs with intervals, look up your manual's figures with this guide." },
      { slug: "car-maintenance-log-what-to-write-down", reason: "Write down the battery, tire and wiper checks you do so next winter starts from facts." },
      { slug: "what-to-tell-a-mechanic-before-work-starts", reason: "If a check turns up a worn part, this covers what to say to the shop before the repair starts." },
    ],
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
    next: { slug: "car-maintenance-log-what-to-write-down", reason: "Give each car its own record, and this shows the columns and what to write on every line." },
    related: [
      { slug: "car-paperwork-dates-organizer", reason: "Two cars means two sets of renewals, and this shows how to track each registration and insurance date." },
      { slug: "what-is-due-on-my-car-right-now", reason: "Check what is due on each car in turn with this method, one after the other." },
      { slug: "car-maintenance-by-mileage-start-with-your-manual", reason: "Each car has its own intervals, and this shows where to find them in each manual." },
    ],
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
    dek: "The papers and numbers worth keeping in your glove box, what belongs at home instead, and how to put the essentials on one card.",
    primaryQuery: "what to keep in your glove box",
    next: { slug: "car-paperwork-dates-organizer", reason: "Before you stock the glove box, this shows how to track the dates on the papers you keep in it." },
    related: [
      { slug: "first-car-checklist-for-new-drivers", reason: "Set up the glove box as one step in the first-week list for a car new to you." },
      { slug: "what-to-tell-a-mechanic-before-work-starts", reason: "A card with your numbers helps at the shop counter, and this covers what to say before work starts." },
      { slug: "winter-car-prep-checklist", reason: "Winter adds items like a scraper and kit, and this lists the checks to make before frost." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "vehicles",
    sources: [
      {
        name: "LegalClarity, Which states allow electronic proof of insurance",
        url: "https://www.legalclarity.org/which-states-allow-electronic-proof-of-insurance/",
        retrieved: "2026-09-26",
        note: "Electronic proof accepted nationwide with exceptions; officer discretion; paper backup",
      },
      {
        name: "AARP, What to do after a car accident",
        url: "https://www.aarp.org/auto/driver-safety/what-to-do-after-car-accident/",
        retrieved: "2026-09-26",
        note: "What to exchange and record after a collision",
      },
      {
        name: "USA.gov, State motor vehicle services",
        url: "https://www.usa.gov/motor-vehicle-services",
        retrieved: "2026-09-26",
        note: "Links to each state's motor vehicle agency for registration rules",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Keep your registration, proof of insurance, a roadside help number, the owner's manual and a card with your tire size and oil type in the glove box. Leave the title, spare keys and anything you would not want a stranger to read at home. Bulky safety gear goes in the trunk.",
          "This is for a car you drive every day in the US. It can't tell you what your state requires you to carry, because that changes by state, and it isn't legal advice. Your state motor vehicle agency is the source for that one item.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Example: one card instead of a folder",
        paragraphs: [
          "Here is a filled card, made up from start to finish. The plate, the numbers and the insurer are invented, and two lines are left blank on purpose. A card like this replaces a folder of papers when you need a number fast: at the shop counter, on the phone with your insurer, or on the shoulder waiting for a tow.",
          "Fill yours by hand, or from a record you already keep.",
        ],
      },
      {
        kind: "table",
        heading: "A glove box card, filled in (example, not real numbers)",
        columns: ["Line on the card", "Example entry"],
        rows: [
          ["Registration plate", "7ABC123"],
          ["VIN", "Blank (see the trade-off below)"],
          ["Tire size", "205/55 R16"],
          ["Oil", "5W-30"],
          ["Mileage, with the date", "48,200 on Sep 1"],
          ["Insurer", "Example Mutual"],
          ["Policy number", "Blank, or written in"],
          ["Roadside help number", "800-555-0142"],
        ],
      },
      {
        kind: "table",
        heading: "What is worth having in the car, and why",
        intro: "Ask of each item: would I be stuck without it in the next ten minutes, on the side of a road? If yes, it earns the space.",
        columns: ["Item", "Why it earns the space", "Also keep"],
        rows: [
          [
            "Registration",
            "You may be asked to show it at a stop. Many states expect it in the car.",
            "Photo of it on your phone",
          ],
          [
            "Proof of insurance",
            "Needed at a stop and after a collision.",
            "App or PDF copy on your phone",
          ],
          [
            "Roadside help number",
            "Easier to read off a card than to search for with a dead battery.",
            "Saved in your phone",
          ],
          [
            "Owner's manual",
            "Has the oil type, tire pressure and what the dashboard lights mean.",
            "The PDF, from the maker's site",
          ],
          [
            "Tire size and oil type",
            "The two facts a tire shop or quick-lube counter asks for.",
            "On the card",
          ],
          [
            "Pen and small notepad",
            "For names, plates and numbers after a collision.",
            "Phone notes app",
          ],
          [
            "Tire pressure gauge",
            "Pressure is easy to check once a month if the gauge is in reach.",
            "Nothing else needed",
          ],
        ],
      },
      {
        kind: "list",
        heading: "What is better kept at home",
        intro: "Keep the details, not the originals. Your registration may already show your address, and where your state expects it in the car you carry it. The rule is not to add to it.",
        items: [
          "The title. It is the paper that proves you own the car, and it is the one a thief most wants.",
          "Spare keys. A thief who finds one in the car has the car.",
          "Bills or letters that show your home address, beyond what your registration already shows.",
          "Extra ID or a passport. Carry the ID you drive with, and leave the rest at home.",
          "Old cards, expired policies and receipts you no longer need. They bury the current ones.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "The VIN and policy number question",
        paragraphs: [
          "A card that lists your VIN and policy number is handy, and it is also a small piece of paper in a car that can be broken into. That is a trade-off, and it's yours to make. We'd write the plate, tire size, oil and roadside number on the card and leave the VIN and policy number lines blank unless you'd rather have them at hand. Your insurance card and registration already carry those numbers, so a thief gains little from a card that repeats them, and you lose little by leaving them off.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Paper or phone for insurance",
        paragraphs: [
          "Nearly every state now accepts electronic proof of insurance at a traffic stop, according to a state-by-state summary from LegalClarity. A few sources name a handful of exceptions, and they don't all agree on which, so check your own state's motor vehicle site instead of relying on a list.",
          "Even where it's accepted, a phone can die or lose signal, and an officer has some discretion. That is the reason to keep a paper card as well as a screenshot. Rules are different at some borders, and a digital card may not be taken at a motor vehicle office counter, so a paper copy earns its place there too. Keep the paper and the screenshot both current, and swap them the day a new policy card arrives.",
        ],
      },
      {
        kind: "list",
        heading: "A pen card for after a collision",
        intro: "This is the one thing most glove boxes lack. The AARP's after-a-crash checklist lists what to exchange and record, and a short version fits on the back of your card.",
        items: [
          "Your name, phone number and insurer, and the other driver's.",
          "Both policy numbers, and both plates.",
          "Make, model and VIN of each car, if the other driver is willing to share it.",
          "The officer's name and badge number, if police come, so you can ask for the report.",
          "Photos of every car, the damage and the scene, taken before anything is moved if it's safe.",
          "Direction each car was going, the lanes, and any signals or signs. Write it while it's fresh.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What goes wrong",
        paragraphs: [
          "The usual failure is a glove box that has become a drawer. An expired insurance card sits on top of the current one, and you hand the wrong one to an officer. A manual for a car you sold is still in there. A stack of receipts hides the pen and the gauge.",
          "A second one: papers that are current but cannot be found in the dark. The fix for both is a ten minute clear out on the day a renewal arrives. Put the new paper in and take the old one out in the same motion. There's more on tracking those dates in [how to track car registration and insurance renewals](/guides/car-paperwork-dates-organizer).",
          "Things that move around in the glove box (a jack handle, a heavy flashlight) belong in the trunk instead. Winter adds a scraper and a small kit, listed in the [winter car prep checklist](/guides/winter-car-prep-checklist).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Do I have to keep my registration in the glove box?",
            a: "It depends on your state. Many states expect you to be able to show registration when asked, and some accept an electronic copy. Check your state's motor vehicle site through USA.gov, which links to each one. Until you know, keep the paper copy in the car, and keep your title at home.",
          },
          {
            q: "Can I show proof of insurance on my phone?",
            a: "In nearly every state, yes, according to LegalClarity's state summary, though sources differ on a few exceptions. Officers have some discretion, a phone can die, and some places may not accept it. Keep a paper card as a backup, and hold your phone yourself instead of handing it over.",
          },
          {
            q: "Should I keep my car title in the glove box?",
            a: "No. The title proves ownership, and a thief who has your car and your title has a much easier time selling it. Keep it at home with other important papers, and keep a photo of it if you like. Carry the details, not the original.",
          },
          {
            q: "What else should I keep in the glove box?",
            a: "A pen, a small notepad, a tire pressure gauge and your roadside help number cover most needs. Keep bulky items like jumper cables, a flashlight and a first aid kit in the trunk, where they can't slide around or be hard to reach.",
          },
          {
            q: "How often should I clean out my glove box?",
            a: "Whenever a renewal arrives, because that is the day an old card should leave. Beyond that, a quick look every few months for expired cards and papers for a car you no longer own is enough.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Making the card",
        paragraphs: [
          "[Vehicle Maintenance Companion](/shop/vehicle-maintenance-companion) prints a glove box card from the details you type in: registration plate, VIN, tire size, oil, mileage, insurer, policy number, roadside help number, and the dates you're watching. Every line comes from you, nothing is looked up or checked, and any line you leave blank stays blank for a pen. The card is made in your browser as a PDF, sized for A4 paper, so on a US printer choose fit to page. It labels tire size as Tyre size.",
        ],
      },
    ],
  },

  {
    slug: "car-paperwork-dates-organizer",
    title: "How to track car registration and insurance renewals",
    dek: "Note the kind of paper, the date and where it is kept, then look six weeks ahead so a renewal does not sneak up. Check your state for its rules.",
    primaryQuery: "track car registration and insurance renewals",
    next: { slug: "glove-box-checklist-what-to-keep", reason: "Once the dates are tracked, this shows which papers to carry in the car and which to keep at home." },
    related: [
      { slug: "two-cars-one-household-maintenance", reason: "Running two cars doubles the renewals, and this keeps them from getting mixed up." },
      { slug: "selling-your-car-with-a-service-history", reason: "When it is time to sell, this shows how to present the papers and service history to a buyer." },
      { slug: "what-is-due-on-my-car-right-now", reason: "Renewals sit beside service jobs, and this shows how to see what is due by miles and months." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "vehicles",
    sources: [
      {
        name: "USA.gov, State motor vehicle services",
        url: "https://www.usa.gov/motor-vehicle-services",
        retrieved: "2026-09-26",
        note: "Where to find your state's registration and inspection rules",
      },
      {
        name: "LegalClarity, Which states allow electronic proof of insurance",
        url: "https://www.legalclarity.org/which-states-allow-electronic-proof-of-insurance/",
        retrieved: "2026-09-26",
        note: "Digital insurance cards and where paper still helps",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "For each car, write down four things on the day a new paper arrives: what it is, the date it runs out, where the paper is, and how it renews. Look at the list once a month and act on anything inside six weeks. That covers registration, insurance, inspection and a warranty.",
          "This is for US drivers who want the dates in one place. It can't tell you what your state requires, how much a renewal costs, or when a lapse becomes a violation. Those live with your state motor vehicle agency and your insurer, and this isn't legal advice.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Example: two cars, six papers",
        paragraphs: [
          "Say a household has two cars. This is what the list looks like the week the newest paper comes in. Every date and name is made up. The right column is the date to act by: six weeks before the date, so a mailed form, a payment or an inspection appointment has room.",
        ],
      },
      {
        kind: "table",
        heading: "A filled tracker (example, made-up dates)",
        columns: ["Car and paper", "Runs out", "Where the paper is", "Act by"],
        rows: [
          ["Civic, registration", "Nov 30", "Glove box and folder", "Oct 19"],
          ["Civic, insurance", "Jan 14", "Folder, and app on phone", "Dec 3"],
          ["Civic, inspection", "Feb 28", "Sticker, report in folder", "Jan 17"],
          ["Van, registration", "Mar 15", "Glove box", "Feb 1"],
          ["Van, insurance", "Jan 14", "Folder", "Dec 3"],
          ["Van, warranty", "Apr 1 or 60,000 mi", "Folder", "Feb 18"],
        ],
      },
      {
        kind: "list",
        heading: "How to set it up",
        ordered: true,
        items: [
          "Put the paper in front of you: registration card or renewal, insurance policy or card, any inspection report, the warranty booklet.",
          "For each one, copy the end date printed on it. For insurance, that's the end of the policy term, not the date the bill is due.",
          "Write where the paper lives, in words you'd understand in a hurry ('kitchen drawer, blue folder').",
          "Write how it renews: mailed notice, online at your state's site, or automatic. Note the card on file if it's automatic.",
          "Subtract six weeks from each date and put that in your calendar or on the list as the act-by date.",
          "When a renewal comes through, write the next date that day, while the new paper is in your hand.",
        ],
      },
      {
        kind: "timeline",
        heading: "One renewal, week by week",
        intro: "Six weeks is our rule of thumb, not a legal one. Some renewals take a day and some take a month.",
        steps: [
          {
            when: "Six weeks out",
            what: "Look for the notice. If none has come, find out why: an old address, a different insurer, an email in spam.",
          },
          {
            when: "Four weeks out",
            what: "Start the renewal. Book an inspection if your state needs one.",
          },
          {
            when: "Two weeks out",
            what: "Renewal should be paid or in the mail. If not, treat it as urgent.",
          },
          {
            when: "The day it runs out",
            what: "Check the new paper is in hand. Put the old one in the recycling.",
          },
          {
            when: "The same day",
            what: "Write the next date on the tracker.",
          },
        ],
      },
      {
        kind: "table",
        heading: "Which dates go on the list",
        columns: ["Paper", "What the date is", "Watch for"],
        rows: [
          [
            "Registration",
            "The expiry on the card or the sticker",
            "A renewal notice sent to an old address",
          ],
          [
            "Insurance",
            "The end of the policy term, often six or twelve months",
            "A bill due date that is not the term date",
          ],
          [
            "Inspection",
            "The date on the sticker or report, if your state has one",
            "Some states ask for none. Check yours.",
          ],
          [
            "Warranty",
            "Years or miles, whichever comes first",
            "The miles, which move as you drive",
          ],
          [
            "Anything else",
            "A parking permit, a toll tag, a roadside plan",
            "One-off dates that nobody else is tracking",
          ],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where this goes wrong",
        paragraphs: [
          "Most renewals slip for boring reasons. A move means the mailed notice goes to your old address, so update your address with your state's motor vehicle agency and your insurer at the same time. A switched insurer means a new term date, so change the tracker the day you switch. An automatic renewal fails when the card on file expires. Two cars with dates in the same month get treated as one job and one of them gets missed.",
          "Insurance and registration are also linked in many places, and a lapse in one can cause trouble with the other. How that works differs from state to state, so look it up in yours instead of assuming. For the wider habit of catching yearly bills before they arrive, see [why you keep missing bill due dates](/guides/why-you-keep-missing-bill-due-dates).",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Related lists",
        paragraphs: [
          "Service jobs are on a different clock, by miles and months, and belong beside these dates. [What is due on my car right now](/guides/what-is-due-on-my-car-right-now) shows how to read them. Once the dates are tracked, [what to keep in your glove box](/guides/glove-box-checklist-what-to-keep) covers which papers ride in the car. With two cars, [two cars, one household](/guides/two-cars-one-household-maintenance) helps keep the sets apart, and a buyer will ask to see current papers, as [selling your car with a service history](/guides/selling-your-car-with-a-service-history) explains.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How far ahead should I renew my car registration?",
            a: "There's no single rule, and your state may have its own window. We'd start looking six weeks before the date, because a mailed notice, an inspection or a fee can each take time. Your state's motor vehicle site, found through USA.gov, says when renewal opens and what it needs.",
          },
          {
            q: "Where do I find my car insurance renewal date?",
            a: "On your policy declarations page or your insurer's app, as the end of the policy term. That can differ from your bill due date. Your insurer usually sends a renewal notice before the term ends, so if none arrives, call and ask.",
          },
          {
            q: "Do I need to keep track of both registration and insurance?",
            a: "Yes. They come round on different dates, are handled by different offices, and can affect each other. Put each on its own line with its own date, and write where each paper lives.",
          },
          {
            q: "Can my state send me a renewal reminder?",
            a: "Many states offer email or text reminders, and most mail a notice. Sign up on your state's motor vehicle site if it offers one. Don't rely on it alone, since notices go to old addresses and spam folders.",
          },
          {
            q: "What if I just moved?",
            a: "Update your address with your state's motor vehicle agency and your insurer, since a renewal notice goes to whatever address is on file. Rules on how soon you must change it differ by state, so check yours. Then update the tracker's 'where the paper is' line.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Doing it in the Companion",
        paragraphs: [
          "[Vehicle Maintenance Companion](/shop/vehicle-maintenance-companion) has a Paperwork screen for this. You pick registration, insurance, inspection, warranty or another date, type the date, and note where the paper is. Nothing is uploaded, and it never says what any place requires. A date shows on the Due screen from 45 days out, or once it has passed. Reminders are off until you switch them on. If you do, you get one notice two weeks ahead and one on the day, on that device. A date already past is not reminded.",
        ],
      },
    ],
  },

  {
    slug: "first-car-checklist-for-new-drivers",
    title: "First car checklist: what to do in the first week",
    dek: "Find the manual, note the mileage, locate the papers, start a record and put the essentials in the glove box, all in your first week with the car.",
    primaryQuery: "first car checklist",
    next: { slug: "car-maintenance-by-mileage-start-with-your-manual", reason: "Start with the manual: this shows how to pull your car's intervals from it and write them down." },
    related: [
      { slug: "car-maintenance-log-what-to-write-down", reason: "Turn the first-week notes into a proper record using this guide to the columns and habits." },
      { slug: "glove-box-checklist-what-to-keep", reason: "Put the essentials on one card for the glove box, with blank lines for a pen." },
      { slug: "car-paperwork-dates-organizer", reason: "Find and calendar the registration, insurance and inspection dates so none slip by." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "vehicles",
    sources: [
      {
        name: "FTC, Buying a used car from a dealer",
        url: "https://consumer.ftc.gov/articles/buying-used-car-dealer",
        retrieved: "2026-09-26",
        note: "Vehicle history report is not a substitute for an independent inspection; Buyers Guide",
      },
      {
        name: "USA.gov, State motor vehicle services",
        url: "https://www.usa.gov/motor-vehicle-services",
        retrieved: "2026-09-26",
        note: "Find your state's title and registration rules",
      },
      {
        name: "NHTSA, Tire safety and inflation",
        url: "https://www.nhtsa.gov/vehicle-safety/tires",
        retrieved: "2026-09-26",
        note: "Check cold pressure monthly; use the door placard, not the sidewall (seen in NHTSA search results, page itself blocked to fetch)",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Before you drive it home, have insurance in place. In the first week, match the VIN to the paperwork, sort out title and registration, find the owner's manual and both keys, check the tire pressure, note the mileage and start a record. Do those and you've done the parts that are hard to fix later.",
          "This is for someone getting the keys to a car in the US, new or used. Deadlines and paperwork rules vary by state, so it points you to your state's motor vehicle agency and doesn't say what yours requires. It isn't legal or mechanical advice.",
        ],
      },
      {
        kind: "timeline",
        heading: "The first week, in order",
        intro: "Insurance comes first because it has to be in place before you drive. The rest is roughly ordered by what is hardest to fix later.",
        steps: [
          {
            when: "Before you drive it home",
            what: "Call your insurer. Ask if the car is covered from the moment you own it, and what they need.",
          },
          {
            when: "Day 1",
            what: "Match the VIN, count the keys, look at the dash warning lights, find the manual.",
          },
          {
            when: "Days 2 and 3",
            what: "Handle title and registration. Ask the seller or dealer who is doing it.",
          },
          {
            when: "Days 4 to 7",
            what: "Write the first record entry, check tire pressure, set up the glove box.",
          },
          {
            when: "Within the month",
            what: "Look up what is due, and book anything overdue.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Example: a private sale on a Saturday",
        paragraphs: [
          "Say you buy a 2014 hatchback from a private seller on a Saturday. On the way home you call your insurer, who tells you what they need to cover it. On Sunday you sit in the driveway with the title, the registration papers and a phone. The VIN on the dashboard, seen through the windshield, and the VIN on the driver's door jamb should match the VIN on the title. If they don't, you stop and ask before anything else. That is a five minute check, and it's the most useful five minutes of the week.",
          "For a dealer purchase, the dealer usually handles title and registration paperwork. With a private seller, you handle it yourself at your state's motor vehicle agency. Ask which one applies, and how long you have, on day one instead of finding out at day thirty.",
        ],
      },
      {
        kind: "table",
        heading: "The first page of a record (example)",
        intro: "This is the first entry in a car's history. It costs an hour and a pen, and it's what you'll be glad of at the next oil change and at resale.",
        columns: ["Baseline page", "Example entry (made up)"],
        rows: [
          ["Date you got it", "Sat, Sep 12"],
          ["Mileage that day", "62,410"],
          ["VIN matches the title?", "Yes, all three places"],
          ["Keys", "One key, no spare yet"],
          ["Front and rear tire pressure", "Door sticker says 35 psi, gauge reads 31"],
          ["Last oil change", "Unknown"],
          [
            "Papers, and where they are",
            "Title in the folder at home, registration in the glove box",
          ],
        ],
      },
      {
        kind: "list",
        heading: "What to check on day one",
        checkable: true,
        items: [
          "Match the VIN in three places: the dashboard by the windshield, the driver's door jamb, and the title. A mismatch is a reason to pause the purchase.",
          "Count the keys. Ask the seller for the second key today. Replacing one later can cost far more than asking now.",
          "Turn the key and watch the dashboard. Warning lights come on for a moment and go out. One that stays on is something to look up in the manual.",
          "Check tire pressure against the sticker on the driver's door jamb, not the number on the tire sidewall. NHTSA says to check when tires are cold, at least once a month.",
          "Find the jack and spare, if the car has them. Some cars have a sealant kit instead.",
          "Find the owner's manual. If it's gone, the maker's site usually has a PDF for your model and year.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "If the car is used",
        paragraphs: [
          "A vehicle history report can show accidents and flood damage, but it typically won't show mechanical problems, and the FTC says it is not a substitute for an independent inspection. If you bought before getting one, you can still ask a mechanic to look the car over this week. A used car with no service records is a common start: [used car, no service records](/guides/used-car-no-service-records-what-to-do) covers what to do. If a shop starts quoting jobs, [what to tell a mechanic before work starts](/guides/what-to-tell-a-mechanic-before-work-starts) gives you words for it.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What can go wrong",
        paragraphs: [
          "Insurance that isn't in place before you drive is the costly one, and the seller's word that the car is fine is not a check. The others are quieter: a title that names someone else, a single key, an oil change you assume was done, a warning light you decide to ignore. Each is cheap to sort out in week one and annoying in month six.",
          "Don't try to fix the whole car in a week. Note what you don't know, write it down, and put it on the list. Getting the papers right is the job of the first week, and the car's history is the job of the first year.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "After week one",
        paragraphs: [
          "Your manual has intervals for oil, tires, filters and more. [Car maintenance by mileage](/guides/car-maintenance-by-mileage-start-with-your-manual) shows how to pull them out, and [what is due on my car right now](/guides/what-is-due-on-my-car-right-now) shows how to read them against your mileage and date. Keep the record going with [the car maintenance log](/guides/car-maintenance-log-what-to-write-down), and put the essentials on a card with [what to keep in your glove box](/guides/glove-box-checklist-what-to-keep). Date the paperwork with [how to track car registration and insurance renewals](/guides/car-paperwork-dates-organizer). Years from now, that record is what you'll hand over in [selling your car with a service history](/guides/selling-your-car-with-a-service-history).",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "What should I do first after buying a car?",
            a: "Get insurance in place before you drive it, since many dealers ask for proof and your existing policy may cover a new car only for a limited time. Then match the VIN on the car to the title, and sort out title and registration. Everything else can follow in the first week.",
          },
          {
            q: "How soon do I have to register a car after buying it?",
            a: "It depends on your state, and the window can be days or weeks. A dealer usually handles it. With a private seller, you do it yourself. Look up your state's rule on day one, through USA.gov's link to your motor vehicle agency, and put the deadline on the calendar.",
          },
          {
            q: "Where do I find my car's VIN?",
            a: "Usually on the dashboard, seen through the windshield on the driver's side, and on the sticker inside the driver's door jamb. It's also on the title, registration and insurance card. Check that these agree before you go further.",
          },
          {
            q: "How often should I check my tire pressure?",
            a: "At least once a month, when the tires are cold, according to NHTSA. Use the number on the placard in the driver's door jamb or the owner's manual. The pressure printed on the tire sidewall is the maximum, not what your car wants.",
          },
          {
            q: "Do I need a service history for a first car?",
            a: "Not to start, but begin one now. A used car may have none, and that's fine. Write the date and mileage you got it, then log each job from here on. It becomes the history the next owner asks for.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Companion fits",
        paragraphs: [
          "[Vehicle Maintenance Companion](/shop/vehicle-maintenance-companion) lets you name the car, log a service with its date and mileage, and see what is due from intervals you enter. When you add a car, it offers the usual jobs for that kind of vehicle as a starting point, with intervals you can change, and your manual stays the real source. Paperwork holds your registration and insurance dates. Reminders are off until you switch them on. If you'd rather use a notebook, the steps above are the same.",
        ],
      },
    ],
  },

  {
    slug: "what-goes-in-a-family-health-binder",
    title: "What to put in a family medical binder",
    dek: "Eight things to write down for each person, a filled example page, and what belongs in a paper folder instead. One page per person.",
    primaryQuery: "what to put in a family medical binder",
    next: { slug: "medication-list-what-to-write-down", reason: "Once each person has a page, the medicine list is the section that goes stale fastest, and this shows how to write it." },
    related: [
      { slug: "school-and-camp-health-forms-what-to-have-ready", reason: "When a camp or school form arrives asking for the same details, this shows how to pull them from your binder page." },
      { slug: "babysitter-and-grandparent-info-sheet", reason: "To hand part of the binder to a sitter or grandparent, this covers the one-page version and what goes on it." },
      { slug: "caring-for-a-parent-and-kids-one-place", reason: "If you also look after a parent, this sets up the same binder with one page per person across both generations." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "family-health",
    sources: [
      {
        name: "CDC: Keeping track of childhood vaccine records",
        url: "https://www.cdc.gov/vaccines-children/records/index.html",
        retrieved: "2026-09-26",
        note: "Vaccine record advice; the CDC does not hold records; records come from the clinic, state registry or school.",
      },
      {
        name: "CDC: Contacts for IIS immunization records",
        url: "https://www.cdc.gov/iis/contacts-locate-records/index.html",
        retrieved: "2026-09-26",
        note: "Where to ask for a copy of a vaccine record (state immunization information system, provider, state health department).",
      },
      {
        name: "MedlinePlus: Making the most of your doctor visit",
        url: "https://medlineplus.gov/ency/patientinstructions/000860.htm",
        retrieved: "2026-09-26",
        note: "Writing down all medicines, vitamins and supplements including over-the-counter, and bringing an insurance card.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Give each person one page with eight things on it: date of birth, allergies and what happens, current medications with the dose and how often, conditions in your own words, doctors and pharmacy with phone numbers, insurance member and group numbers, vaccine names and dates, and who to call. Print it or keep it where you can open it fast.",
          "This is for anyone who ends up answering health questions for a household: kids, a partner, a parent. It can't tell you what any entry means or what anyone should do about it, and it doesn't replace the paperwork a clinic, school or camp gives you. It's paperwork help, not medical advice.",
        ],
      },
      {
        kind: "table",
        heading: "An example: one filled page",
        intro: "Say Amina is eight and you've been handed a clipboard at a new dentist. This is the page you'd want in your bag. Every name, number and date here is made up for the example.",
        columns: ["What", "What's written", "Where the answer comes from"],
        rows: [
          ["Date of birth", "04/02/2018", "Any form you've filled in before"],
          [
            "Allergies",
            "Peanuts (hives). Penicillin (rash).",
            "Her doctor's office, or the label of anything she reacted to",
          ],
          ["Conditions", "Asthma", "Her doctor, in the words they used"],
          [
            "Medications now",
            "Cetirizine, 5 mg, once a day, started 09/01/2026",
            "The label on the bottle or box",
          ],
          [
            "Doctors and pharmacy",
            "Dr. Patel, pediatrics, (555) 010-0100. Corner Pharmacy, (555) 010-0177.",
            "Your phone contacts, the pharmacy receipt",
          ],
          [
            "Insurance",
            "Acme Health. Member ID XYZ123456. Group G77.",
            "The card, front and back",
          ],
          ["Vaccines", "MMR 05/01/2019, 06/02/2023", "Her vaccine record, copied exactly"],
          ["Who to call", "Sam (dad), (555) 010-0142", "You decide, then tell them"],
        ],
      },
      {
        kind: "paragraphs",
        heading: "Why one page per person",
        paragraphs: [
          "Keep each person on their own page, with the same eight headings every time. Adults and children are the same kind of record. When two people share a page, the wrong allergy ends up on the wrong form, and it happens at exactly the moment you're rushing.",
          "Same headings also means you always know where to look. If you're also looking after a parent, [one place for a parent and kids](/guides/caring-for-a-parent-and-kids-one-place) shows how to run both generations the same way.",
        ],
      },
      {
        kind: "list",
        heading: "Filling in the answers you don't have",
        intro: "Most pages get filled in over a week, not in one sitting. Here's the order that takes the least effort.",
        ordered: true,
        items: [
          "Start with what's in your wallet: the insurance card gives you the insurer, the member ID and the group number. Copy it exactly, letters and zeros included.",
          "Pull the medicine names from the labels, not from memory. Write the name, the dose as printed, and how often. Include over-the-counter medicines, vitamins and supplements, because MedlinePlus lists them among the things to have written down before a visit. [The medication list guide](/guides/medication-list-what-to-write-down) covers the details.",
          "Ask the doctor's office and the pharmacy for their phone numbers if you don't have them saved, and write down which one is which.",
          "For vaccines, ask the clinic that gave them for a copy of the record, then type the names and dates in as written. If a clinic is gone, the CDC says it doesn't hold vaccination records itself, and points you to your state's immunization information system, your provider or your state health department.",
          "Add allergies last, and add what happens as well as what they're allergic to. \"Peanuts\" is a fact. \"Peanuts (hives)\" is something a sitter can use.",
          "Choose who to call in an emergency, ask them, and put their number down. A name with no number isn't much help at 2 a.m.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "What belongs in a paper folder instead",
        paragraphs: [
          "A binder page is a list of answers. It isn't the place for test results, scanned insurance cards, discharge papers or signed forms. Those live better in a paper folder or in the clinic's own portal, and you copy the answers out of them onto the page.",
          "Advance directives and the question of who speaks for you if you can't are a different job with its own paperwork. [Who would speak for you about medical care](/guides/emergency-contact-and-medical-decision-maker) covers choosing that person and noting where the documents are kept. Rules vary by state.",
        ],
      },
      {
        kind: "compare",
        heading: "Paper binder or a screen",
        intro: "Both work. They fail in different ways.",
        left: {
          label: "Paper binder",
          items: [
            "Nothing to sign in to at the front desk",
            "Every change means recopying the page",
            "A page can be handed over as it is",
          ],
        },
        right: {
          label: "On a screen",
          items: [
            "Change it once and every printout is current",
            "Needs a phone or laptop and a sign-in",
            "One place holds everyone, so nobody gets a stale copy of their own page",
          ],
        },
      },
      {
        kind: "timeline",
        heading: "Keeping it current",
        intro: "A page goes stale in a few predictable places. Update it at these moments and it stays useful.",
        steps: [
          {
            when: "After any visit",
            what: "Add what changed: a new medicine, a stopped one, a new allergy.",
          },
          {
            when: "When a medicine starts or stops",
            what: "Change the line the same day, while the label is in your hand. Keep the stop date.",
          },
          {
            when: "Each August and each spring",
            what: "Check dates of birth, insurance and phone numbers before school and camp forms arrive.",
          },
          {
            when: "When insurance changes",
            what: "Replace the member and group numbers. An old card is worse than none.",
          },
          {
            when: "Before a sitter or a trip",
            what: "Reprint the pages you're handing over, and leave off what they don't need.",
          },
        ],
      },
      {
        kind: "list",
        heading: "What goes wrong with these pages",
        items: [
          "A stopped medicine stays on the page. Someone reads it as current. Mark the stop date or take it off.",
          "Insurance is last year's. Forms get refused or the wrong ID gets copied over.",
          "Vaccine dates were typed from memory. Copy them from the record, or leave the line and ask for one.",
          "The full page goes everywhere. A sitter doesn't need your insurance ID, and a school doesn't need every note. [What to leave off a page you hand over](/guides/what-to-leave-off-a-health-page-you-hand-over) has the rule of thumb.",
          "Nobody knows the page exists. Tell the one other adult where it lives.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "What is the difference between a medical binder and a medical ID?",
            a: "A binder is a set of pages you print or open and hand over. A medical ID is something worn or carried so it's found without you. A printed emergency card from your binder doesn't replace a medical ID, and the binder can't make anything appear on a locked phone.",
          },
          {
            q: "How often should I update a family medical binder?",
            a: "Update it when something changes, not on a schedule alone: a new or stopped medicine, a new allergy, a new insurance card, a change of doctor. Then do one sweep before school and camp forms arrive each year, checking every line against the card, label or record it came from.",
          },
          {
            q: "Do I need a separate binder for each child?",
            a: "One binder, one page per person, is easier to carry and keep current. The page is what stays separate, so a form for one child never picks up another child's allergy. If your children share a doctor, the phone number simply appears on each page.",
          },
          {
            q: "Should I put a photo of my insurance card in the binder?",
            a: "Copy the insurer, member ID and group number onto the page and keep the physical card in your wallet. A photo of a card is a document, and documents belong in your paper folder or wherever you already keep them. The page only needs the numbers a form asks for.",
          },
          {
            q: "What should I leave out of a family medical binder?",
            a: "Leave out guesses about what something means and anything you wouldn't want a sitter or school to read on a printout. Keep test results and signed papers in a folder, and copy only the answers forms ask for onto the page. Ask the clinic when you're unsure what a result says.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "[Family Health Binder](/shop/family-health-binder) is the version of this page that you type in once. Each person gets a card with allergies, conditions, medications, vaccines, doctors, insurance and an emergency contact, and it prints from that card as a forms sheet, a caregiver sheet, an emergency card, a visit page and an intake summary. Anything you mark private stays in the app and is left off every printed page. It only records what you enter: it doesn't check a dose, say what's due or send a reminder, and it holds no documents, so the paper folder stays.",
        ],
      },
      {
        kind: "callout",
        label: "The Companion for this",
        body: "Family Health Binder is a web app you sign in to, and it can't share a page with anyone: you download a PDF and print or hand it over. It records what you type and isn't medical advice.",
      },
    ],
  },

  {
    slug: "school-and-camp-health-forms-what-to-have-ready",
    title: "Camp and school health forms: what to have ready",
    dek: "Camp, school and sports forms ask for the same seven things every year. Get the answers on one page before the form arrives in the mail.",
    primaryQuery: "camp health form",
    next: { slug: "what-to-leave-off-a-health-page-you-hand-over", reason: "Before you copy anything onto a form, check which health details a school or camp actually needs from you." },
    related: [
      { slug: "what-goes-in-a-family-health-binder", reason: "To keep the answers these forms ask for in one place all year, start with the family medical binder." },
      { slug: "babysitter-and-grandparent-info-sheet", reason: "When the form is for a sitter or grandparent rather than a camp, this is the shorter sheet to fill in." },
      { slug: "emergency-contact-information-sheet", reason: "Most forms want two people to call, and this shows how to write that emergency contact page clearly." },
    ],
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
    next: { slug: "emergency-contact-information-sheet", reason: "For the names, numbers and few facts someone needs in a hurry, this covers the emergency sheet to keep beside it." },
    related: [
      { slug: "what-to-leave-off-a-health-page-you-hand-over", reason: "Not everything about your child belongs in a sitter's hands, and this helps you decide what stays off the page." },
      { slug: "medication-list-what-to-write-down", reason: "If your child takes something regularly, this shows how to write the medicine line so a sitter can read it." },
      { slug: "school-and-camp-health-forms-what-to-have-ready", reason: "For the longer forms a camp or school sends, this lists what to have ready before they arrive." },
    ],
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
    next: { slug: "questions-to-bring-to-the-doctor", reason: "With the paperwork gathered, turn to the questions themselves and how to write them so the important one comes first." },
    related: [
      { slug: "medication-list-what-to-write-down", reason: "Doctors ask what is taken now, and this shows how to write the medication list so it matches the labels." },
      { slug: "symptom-notes-for-a-doctor-visit", reason: "If the visit is about something that comes and goes, this covers noting when it started and what helped." },
      { slug: "new-doctor-intake-what-to-bring", reason: "When the doctor is someone new, this covers the extra history worth bringing to a first visit." },
    ],
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
    next: { slug: "symptom-notes-for-a-doctor-visit", reason: "Your questions land better with dated notes behind them, and this shows what to write about a symptom." },
    related: [
      { slug: "doctor-appointment-prep-checklist", reason: "For everything else to gather the day before, the appointment checklist covers the whole paperwork list." },
      { slug: "new-doctor-intake-what-to-bring", reason: "If you are seeing a doctor for the first time, this lists what a first visit tends to ask you for." },
      { slug: "medication-list-what-to-write-down", reason: "Bring the current medicine list alongside your questions, and this explains how to write one." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "family-health",
    sources: [
      {
        name: "Institute for Healthcare Improvement: Ask Me 3",
        url: "https://www.ihi.org/library/tools/ask-me-3-good-questions-your-good-health",
        retrieved: "2026-09-26",
        note: "The three Ask Me 3 questions and what the program is.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Write each question as one line, put the one you can't leave without first, and leave a gap under each for the answer. Bring the page and tick lines off as they're answered. Keep the list to what a short visit can hold.",
          "This is for anyone heading into an appointment for themselves or a child. It covers how to write questions, not what to ask about anyone's health, and it can't tell you whether a question is worth asking. Your doctor can.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Say you've been keeping a note on your phone about Amina, 8, and the appointment is tomorrow. The note is a pile: her cough, swimming, something about the pharmacy, the camp form. Left like that, you'll get to the door with the pile still in your pocket. Here it is turned into lines you can read out.",
        ],
        heading: "A worked example: from a pile to a page",
      },
      {
        kind: "table",
        columns: ["What the note says", "The question line"],
        rows: [
          ["her cough again", "Cough, two weeks: what now?"],
          ["swimming?", "Can she swim this week?"],
          ["pharmacy gave something different", "Is the new brand the same drug?"],
          ["camp form", "Can you sign the camp form?"],
        ],
        intro: "An example, not a list to copy. Each line is short enough to say in one breath, and each one can be answered in a sentence or two.",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Now put them in order. The cough goes first, because it's the reason for the visit. The camp form goes last, because it can be handled at the desk if time runs out. If a question would still nag you on the drive home, it belongs near the top.",
        ],
      },
      {
        kind: "list",
        items: [
          "Empty your head onto one page the day before, or the moment a question occurs to you. Don't sort yet.",
          "Turn each item into a question that ends in a question mark. \"Swimming?\" becomes \"Can she swim this week?\"",
          "Make it specific. A question with a name, a date or a number in it gets a shorter answer than a vague one.",
          "Put the one you can't leave without at the top. Number the rest.",
          "Cut to what fits. If you have nine and the visit is short, keep the top four or five and say so at the start.",
          "Leave two blank lines under each question for the answer.",
          "Bring the page, a pen, and the medicine list if the visit involves anything Amina takes.",
        ],
        heading: "How to write the list",
        ordered: true,
      },
      {
        kind: "list",
        items: [
          "\"What is my main problem?\"",
          "\"What do I need to do?\"",
          "\"Why is it important for me to do this?\"",
        ],
        heading: "If you don't know what to ask",
        intro: "The Institute for Healthcare Improvement runs a program called Ask Me 3, built around three questions for any health visit:",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "We'd copy those three onto the bottom of every question page. They cost three lines, and they still work on a day when your own questions fail you. They're about understanding an answer, so they sit beside your own specific questions rather than replacing them.",
        ],
      },
      {
        kind: "scripts",
        items: [
          {
            situation: "The doctor is short on time",
            line: "I've got three questions. The first is the one I most need answered.",
          },
          {
            situation: "You didn't follow an answer",
            line: "Can I say that back to you, to make sure I've got it right?",
          },
          {
            situation: "Something needs spelling",
            line: "Could you write the name of that down for me?",
          },
          {
            situation: "You're about to leave",
            line: "Before we finish, I've got two questions left on my page.",
          },
        ],
        heading: "In the room, in your own words",
        intro: "You don't need to be polished. Reading from a page is a normal way to run a visit. These lines are here for the moments when you feel rushed.",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Write the answer under the question, in the words you heard, not the words you'd have chosen. \"Call back if it's still there Friday\" is a note you can act on. \"She said it's fine\" isn't. Before you leave, look at the page: any line still blank is what you ask now, at the desk or the door.",
        ],
        heading: "After each answer",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "A long list can crowd out the one question you came for, which is why the order matters. Some visits are booked for one problem only, so if you have five, mention it when you book and ask what fits. If you hear an answer you can't follow, a second question is fine, and saying it back is a good way to check. And if you think of something after you leave, ask the clinic how to send a question in. This page can't tell you whether a question is urgent. If you're worried, call the clinic, and in an emergency call 911.",
        ],
        heading: "When the list doesn't work",
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "What questions should I ask my doctor?",
            a: "It depends on the visit, and that's for you and the doctor to decide. If you're stuck, the three Ask Me 3 questions are a place to start: what is my main problem, what do I need to do, and why is it important to do it. Then add the specific ones only you know, like what changed and when.",
          },
          {
            q: "How many questions should I bring?",
            a: "As many as you'll get through, ranked. If you have more than four or five, tell the clinic when you book and ask how long the visit is. Put the one you can't leave without at the top, so that if time runs out you've already asked it.",
          },
          {
            q: "Is it okay to read my questions from a list?",
            a: "Yes. A page is the easiest way to keep the important question from getting lost when you're nervous or the room is busy. Hold it where you can see it, and tick each line off as it's answered so you both know what's left.",
          },
          {
            q: "What if I forget to ask something?",
            a: "Ask the clinic how to send a question after the visit, such as a phone call or a message through their patient portal, if they have one. Write the question on your page anyway, so it's ready the next time or when you call.",
          },
          {
            q: "Should I write down the doctor's answers?",
            a: "Yes, briefly, under each question and in the words you heard. It turns the page into a record you can read later or hand to another caregiver. Some people take a second person to the visit partly for this.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Family Health Binder has a \"Questions to ask\" field on each planned visit. You type one per line, and the Visit page prints them with a tick box each, next to allergies, what the person takes now, their last five symptoms and ruled lines for notes. After the visit you can add what was said or decided. It doesn't suggest questions or answer them, and it doesn't send a reminder about the visit. It's a record you [print and carry](/shop/family-health-binder).",
        ],
        heading: "Where the page comes from",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "For the rest of the day before, see the [doctor appointment prep checklist](/guides/doctor-appointment-prep-checklist). Your questions land better with dated notes behind them, so read [symptom notes for a doctor visit](/guides/symptom-notes-for-a-doctor-visit) next, and bring the [medication list](/guides/medication-list-what-to-write-down) alongside. Next step: open a note, write down every question you have right now, and put a star by the first.",
        ],
        heading: "What to do next",
      },
    ],
  },

  {
    slug: "medication-list-what-to-write-down",
    title: "How to keep a family medication list",
    dek: "Name, dose and how often, copied exactly as the label says, plus the date the list was last right. Always follow your prescriber or pharmacist.",
    primaryQuery: "how to keep a medication list",
    next: { slug: "doctor-appointment-prep-checklist", reason: "Once the list is right, this shows what else to gather the day before a doctor visit." },
    related: [
      { slug: "symptom-notes-for-a-doctor-visit", reason: "Alongside the medicines, dated notes about how someone has been feeling give the appointment more to work from." },
      { slug: "emergency-contact-information-sheet", reason: "The same medicine facts can go on an emergency sheet, and this covers what else belongs there." },
      { slug: "new-doctor-intake-what-to-bring", reason: "For a first visit with a new doctor, this shows where the medication list fits among the other papers." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "family-health",
    sources: [
      {
        name: "U.S. Food and Drug Administration: Create and Keep a Medication List for Your Health",
        url: "https://www.fda.gov/consumers/consumer-updates/create-and-keep-medication-list-your-health",
        retrieved: "2026-09-26",
        note: "Four things per medicine, include OTC and supplements, update often, carry a copy as a photo, app or printout.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Write down every medicine the person takes, prescription or not: the name and strength, what it's for, and when and how much, copied from the label. Add vitamins and supplements. Date the list, and change it the day anything does.",
          "This is for whoever keeps track for a household. It's a record of what the labels say, not advice about doses, and your prescriber or pharmacist is the one to ask when a label and your list disagree.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "You're at a desk with a form that says \"current medications\" and a pen that's running out. You know the little white one is for blood pressure, or possibly cholesterol. A list you wrote last week takes that guess away. The U.S. Food and Drug Administration says a medicine list should have four things for each medicine: its name, its strength, what you take it for, and instructions for when, how and how much.",
        ],
        heading: "The list, filled in",
      },
      {
        kind: "table",
        columns: ["Medicine and strength", "What it's for", "How and when", "Started"],
        rows: [
          ["Metformin 500 mg", "Blood sugar", "Breakfast and dinner", "03/2022"],
          ["Atorvastatin 20 mg", "Cholesterol", "Once, at night", "03/2022"],
          ["Aspirin 81 mg", "Heart", "Once a day", "11/2023"],
          ["Fish oil capsule", "Supplement", "Once a day", "01/2025"],
        ],
        intro: "An example for a made-up person, Grandpa Joe, not a suggestion for anyone to take anything. Above it, in bigger type: \"Allergy: penicillin (rash). Checked against the bottles 09/20/2026.\"",
      },
      {
        kind: "list",
        items: [
          "Line up everything the person takes: prescriptions, inhalers, eye drops, creams, patches, over-the-counter pills, vitamins and herbal products. The FDA says to include the ones used only some of the time.",
          "Copy the name and strength from the label, letter for letter. If the label says \"500 mg,\" write 500 mg.",
          "Copy the directions the same way. Don't shorten \"with food\" to nothing.",
          "Write what it's for in the prescriber's or pharmacist's words. If you don't know, ask them at the next visit and leave the space empty until then.",
          "Put allergies at the top, and say what the reaction was.",
          "Write today's date on the page, and the words \"checked against the bottles\" if you did.",
          "When something stops, move it to a separate line marked \"stopped\" with the date, and take it off the list you hand over.",
        ],
        heading: "How to write it",
        ordered: true,
      },
      {
        kind: "timeline",
        steps: [
          {
            when: "The day something changes",
            what: "New prescription, new dose or a stop: update the page that day.",
          },
          {
            when: "Before any visit or form",
            what: "Look at the bottles and correct the list.",
          },
          {
            when: "Every few months",
            what: "Read it against the bottles, even if nothing changed.",
          },
          {
            when: "When a list is replaced",
            what: "Recycle the old copy so two versions don't exist.",
          },
        ],
        heading: "When to update it",
        intro: "A list goes out of date without telling you, and an old list at a desk is worse than no list because it looks right. The FDA's advice is to review and update it often, including when a medicine is stopped or a dose changes. The schedule below is ours.",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Copy, don't paraphrase. A list that repeats the label is easier to check than one you've rewritten from memory, and a child's liquid medicine is where this counts most: copy the amount and the unit exactly as printed, and don't convert it. If a label and your list ever disagree, the label and your prescriber win. Call the pharmacy and ask.",
          "Don't keep two lists. One in the drawer and one on the phone will drift within a month. Pick one home, and take a photo or printout of it for the bag. The FDA suggests carrying a copy, whether a photo on your phone, an app or a printout, alongside your insurance card.",
        ],
        heading: "What goes wrong",
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "What should be on a medication list?",
            a: "For each medicine: its name, strength, what it's for, and when, how and how much you take. The FDA also suggests adding allergies and emergency contacts. Include over-the-counter medicines, vitamins and supplements, not just prescriptions.",
          },
          {
            q: "Do I include vitamins and over-the-counter medicines?",
            a: "Yes. The FDA says to list them, including any you use only some of the time. A doctor or pharmacist can only look at the whole picture if the whole picture is on the page.",
          },
          {
            q: "How often should I update my medication list?",
            a: "The day anything changes, and again before any visit. The FDA says to review and update it often. Our own habit would be to also read it against the bottles every few months, so a quiet change doesn't slip by.",
          },
          {
            q: "Should I keep the list on paper or on my phone?",
            a: "Either works. The FDA suggests a photo on your phone, an app or a printout carried with your insurance card. The point is one current copy you can reach quickly. Whichever you pick, put the date on it.",
          },
          {
            q: "Who should I show my medication list to?",
            a: "Doctors, pharmacists and anyone else who treats you, at every visit, according to the FDA. A sitter or grandparent minding a child who takes something regularly needs it too, in a shorter form.",
          },
          {
            q: "What if the label and my list don't match?",
            a: "Trust the label and ask your pharmacist or prescriber which is right. Then fix the list. This guide can't tell you which dose is correct; it only helps you keep what the labels say.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Family Health Binder gives each person a medication list with name, dose, how often and a start date. \"Stopped taking it\" moves a medicine into a Stopped fold and takes it off every printed page. \"This list is right today\" stamps the date you last checked it against the bottles. The list prints on the forms sheet, sitter sheet, emergency card, visit page and intake summary. There's no \"what it's for\" field, so add that to the name if you want it. It doesn't remind you, or check doses or interactions. See the [Family Health Binder](/shop/family-health-binder).",
        ],
        heading: "What the Companion does with the list",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Once the list is right, read [what to bring to a new doctor appointment](/guides/new-doctor-intake-what-to-bring) or the [doctor appointment prep checklist](/guides/doctor-appointment-prep-checklist). The same facts go on an [emergency contact sheet](/guides/emergency-contact-information-sheet). For dated notes about how someone has been feeling, see [symptom notes for a doctor visit](/guides/symptom-notes-for-a-doctor-visit). Next step: gather the bottles onto one table tonight and write the first line.",
        ],
        heading: "What to do next",
      },
    ],
  },

  {
    slug: "symptom-notes-for-a-doctor-visit",
    title: "Symptom log for a doctor visit: what to write down",
    dek: "Four notes help a doctor most: when it started, how long it lasted, how bad it was and what helped. A notes page, not a symptom checker.",
    primaryQuery: "symptom log for doctor visit",
    next: { slug: "questions-to-bring-to-the-doctor", reason: "After you have the notes, turn them into short written questions to ask before time runs out." },
    related: [
      { slug: "doctor-appointment-prep-checklist", reason: "To fit the symptom page into a full visit routine, use the checklist for the day before." },
      { slug: "new-doctor-intake-what-to-bring", reason: "A new doctor has none of your history, and this shows how to bring symptoms and background on one page." },
      { slug: "medication-list-what-to-write-down", reason: "Doctors often ask what has been taken as well, so this shows how to keep the medicine list current." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "family-health",
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Write one line each time: what it is, the date it started, how long it lasted, how bad it was in your own words, and what helped. Do it the day it happens, not the night before the visit. Bring the page.",
          "This is for anyone keeping notes on themselves or a child before an appointment. It can't tell you what a symptom means or whether to wait. Your clinic can, and in an emergency call 911.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "The doctor asks, \"When did this start?\" and you both look at the ceiling. It was after the weekend. Or before. A note with a date on it ends that conversation in one second. Here's a log for Amina, 8, with three lines in it.",
        ],
        heading: "What a few days of notes look like",
      },
      {
        kind: "table",
        columns: ["Date", "What", "How long", "How bad", "What helped"],
        rows: [
          ["09/14", "Fever, warm to touch", "1 day", "Moderate", "Rest and fluids"],
          ["09/15", "Cough at night", "All night", "Mild", "Sat up in bed"],
          ["09/18", "Cough at night", "2 hours", "Mild", "Nothing yet"],
        ],
        intro: "An example, not a real record. Nothing in it is a suggestion for what to do about a symptom.",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Notice what the lines don't say. There's no guess at a cause and no \"probably a cold.\" Only what you saw, when, for how long, and how it went. The doctor decides what it means.",
        ],
      },
      {
        kind: "list",
        items: [
          "What it is, in a few plain words: \"Cough at night,\" \"stomach pain after lunch.\"",
          "The date it started, as close as you know. Write the day, not \"last week.\"",
          "How long it lasted: hours, days or weeks.",
          "How bad it was: mild, moderate or severe, your own view.",
          "What helped, in your own words. If nothing did, write that.",
          "Anything else that stood out: time of day, what was going on, whether it came with something else.",
        ],
        heading: "What to write each time",
        ordered: true,
      },
      {
        kind: "list",
        items: [
          "If you take a temperature, write the number, the time, and how you took it.",
          "If it comes and goes, write each time as its own line rather than one long note.",
          "If it follows a medicine, note the medicine and when it was taken, copied from the label.",
        ],
        heading: "Extra detail for the fuller picture",
      },
      {
        kind: "scripts",
        items: [
          {
            situation: "Opening the visit",
            line: "It started on the 14th. It comes and goes, and it's worst at night.",
          },
          {
            situation: "When asked how bad",
            line: "I'd say mild most nights, moderate the first day. I've got it written down.",
          },
          {
            situation: "When asked what helped",
            line: "Sitting up seemed to help. Nothing else made a difference.",
          },
        ],
        heading: "Reading it out",
        intro: "A page doesn't replace the conversation. It gives you the first sentence.",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "A log fails when it becomes a chore. Keep it to a line, and skip a day if nothing happened. It also fails when it turns into a diary of worry, with each line a little longer than the last. If you notice that, stop writing and call the clinic. A page can't decide anything for you, and it can't tell you when to wait. Say the ordinary limit out loud: if you don't know whether something needs attention, your clinic can tell you, and in an emergency, call 911.",
          "A child who can't describe it yet needs you to write what you can see, and the words they use, in quotation marks. Keep one page per person, so two children's coughs don't end up on the same page.",
        ],
        heading: "When it doesn't work",
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "How do I describe my symptoms to a doctor?",
            a: "Say what it is, when it started, how long it lasts, how bad it is and what helps or doesn't. Reading from a written page is fine. The date is the part memory loses first, so write it down the day it happens.",
          },
          {
            q: "What should I write in a symptom log?",
            a: "One line each time: the date, what it is, how long it lasted, how bad it was, and what helped. Add the time of day or what you were doing if it stood out. Write what you saw, not what you think it is.",
          },
          {
            q: "How long should I keep a symptom log?",
            a: "From the first day until the visit. There's no set length. What matters to a doctor is the dates and how things went, so a few dated lines beat a long page written from memory the night before.",
          },
          {
            q: "Should I write down what I think is wrong?",
            a: "No, or keep it apart from the notes. \"Started Tuesday, lasted three days, mild\" gives the doctor something to work with. A guess like \"probably a cold\" can point the conversation the wrong way. Leave the meaning to them.",
          },
          {
            q: "Can I keep symptom notes on my phone?",
            a: "Yes. What counts is that each note has a date and can be shown at the visit. A note on your phone is easy to add to in the moment. A printed page is easier to hand over. Many people keep both.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Family Health Binder has a symptom form with four fields: what it is, when it started, how long (hours, days or weeks) and how bad (mild, moderate, severe), plus what helped. Records show as a dated list, newest first. There's no chart, no trend and no advice, and it can't tell you what anything means. Put extra detail, like time of day, into the \"What is it?\" line. The last five print on the visit page and the last eight on the intake summary. See the [Family Health Binder](/shop/family-health-binder).",
        ],
        heading: "What the Companion does with your notes",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Turn the notes into [questions to bring to the doctor](/guides/questions-to-bring-to-the-doctor), and put the [medication list](/guides/medication-list-what-to-write-down) beside them. For a first visit, see [what to bring to a new doctor appointment](/guides/new-doctor-intake-what-to-bring), and for the rest of the day before, the [doctor appointment prep checklist](/guides/doctor-appointment-prep-checklist). Next step: write today's date and one line about how it is right now.",
        ],
        heading: "What to do next",
      },
    ],
  },

  {
    slug: "emergency-contact-information-sheet",
    title: "Emergency contact information sheet: what to include",
    dek: "A one-page sheet with names, numbers and the few facts someone would need. What to write, and why a printed sheet is not a substitute for a medical ID.",
    primaryQuery: "emergency contact information sheet",
    next: { slug: "babysitter-and-grandparent-info-sheet", reason: "When someone else is minding the children, this shows how to turn these facts into a sitter sheet." },
    related: [
      { slug: "medication-list-what-to-write-down", reason: "The medicines someone would need to know about belong on the sheet, and this shows how to write them down." },
      { slug: "what-to-leave-off-a-health-page-you-hand-over", reason: "Deciding how much to put on a printed page others will see is easier with these three questions." },
      { slug: "caring-for-a-parent-and-kids-one-place", reason: "If a parent lives with you or relies on you, this shows how to keep one page each for everyone." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "family-health",
    sources: [
      {
        name: "Poison Control (poison.org): Poison Help line",
        url: "https://www.poison.org/",
        retrieved: "2026-09-26",
        note: "Poison Help number 1-800-222-1222, described as free, expert and confidential, and the 911 note for collapse or trouble breathing.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "An emergency sheet is one page with who to call, the person's allergies, what they take, their doctor and their insurer. Put allergies near the top, write every number with its area code, and keep the sheet where someone else could find it in a minute.",
          "This is for US households, where the emergency number is 911. It's a page of what you typed, not medical advice, and it isn't a medical ID.",
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Someone is standing in your kitchen, a grandparent or a sitter, and something has happened. They don't know your daughter's allergy or which of your two phone numbers is the one that picks up. A page on the fridge answers both. Here's what one looks like, filled in for Amina, 8.",
        ],
        heading: "A filled sheet",
      },
      {
        kind: "table",
        columns: ["Field", "Example"],
        rows: [
          ["In an emergency", "In an emergency, call 911"],
          ["Name and age", "Amina, 8"],
          ["Allergies", "Allergy: peanuts (hives)"],
          ["Takes now", "Albuterol inhaler, as the label says"],
          ["Call first", "Call: Sam (555) 010-0142"],
          ["Call second", "Aunt Priya (555) 010-0177"],
          ["Doctor", "Doctor: Dr. Patel (555) 010-0100"],
          ["Poison help", "Poison Help 1-800-222-1222"],
          ["Home address", "12 Alder Street, so anyone can say it on the phone"],
        ],
        intro: "An example with made-up names and numbers.",
      },
      {
        kind: "list",
        items: [
          "Put \"In an emergency, call 911\" at the top, so nobody has to think.",
          "Write the person's name and age, and their date of birth if a form would want it.",
          "Write allergies in the biggest type, with what the reaction is. \"Peanuts (hives)\" says more than \"peanuts.\"",
          "List what they take now, copied from the labels: [the medication list](/guides/medication-list-what-to-write-down) is the source, and this is a short copy of it.",
          "Add two people to call, and a way to tell them apart: \"Sam, cell\" and \"Aunt Priya, in a different town.\" Two numbers in the same place aren't much use in a power cut.",
          "Add the doctor's name and number, and the pharmacy if you like.",
          "Add the Poison Help number, 1-800-222-1222. It's free and confidential, and it's a US number.",
          "Write your home address. Someone calling from your kitchen may not know it.",
          "Date the sheet at the bottom, so the next person knows how old it is.",
        ],
        heading: "What goes on it, in order",
        ordered: true,
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "A medical ID is a different thing from this page. It's meant to be worn or built into a phone so it can be found on the person, without anyone needing a key to your kitchen. Whether you want one is a question for your doctor. A printed sheet is only what you typed, on a day you typed it, and it can be out of date by spring.",
        ],
        heading: "A sheet is not a medical ID",
      },
      {
        kind: "list",
        items: [
          "Fridge: one copy, at eye level.",
          "Bag or glove box: a copy with the insurance line filled in.",
          "Anyone minding the children: a copy handed over, plus a word about where the other is.",
        ],
        heading: "Where the copies live",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "A fridge sheet is visible to anyone who comes into your house, so leave the insurance member ID off it and put it on the bag copy. For the sitter version, with bedtime and the green cup, see the [babysitter and grandparent info sheet](/guides/babysitter-and-grandparent-info-sheet). To choose what stays off a page you hand over, read [what to leave off a health page you hand over](/guides/what-to-leave-off-a-health-page-you-hand-over).",
        ],
        heading: "What to leave off the fridge copy",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "The sheet fails in three ways. The numbers change and nobody updates it. It holds so much that the allergy gets lost. Or it's in a drawer nobody else knows about. Check the numbers when you change phones, and reread it whenever a medicine changes.",
        ],
        heading: "What goes wrong",
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "What information goes on an emergency contact sheet?",
            a: "Who to call, allergies, what the person takes now, their doctor, insurance, and your home address. Put \"call 911\" at the top. Keep it to one page, so the allergy line can't get lost among the rest.",
          },
          {
            q: "How many emergency contacts should I list?",
            a: "Two is a good working number, and better if they live in different places or carry different phones. Write how to tell them apart, such as \"cell\" and \"in another town.\" Say beside each name who they are to the person.",
          },
          {
            q: "Is an emergency sheet the same as a medical ID?",
            a: "No. A medical ID is worn or built into a phone so it can be found on the person. A printed sheet is a record of what you typed, and it can go out of date. Ask your doctor whether a medical ID makes sense for you.",
          },
          {
            q: "Where should I keep it?",
            a: "Where someone else could find it fast: the fridge, a bag, a glove box. Tell the sitter, grandparent or neighbor where it is. A sheet in a drawer helps only the person who filed it.",
          },
          {
            q: "What is the poison control number?",
            a: "In the US it's 1-800-222-1222. The Poison Help line describes itself as free, expert and confidential. In a life-threatening case, such as someone who has collapsed or can't breathe, call 911 instead.",
          },
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Family Health Binder prints an Emergency card from what you've entered: name, age, allergies, conditions, medications, who to call, their doctor and insurance. You cut it out along the dashed line, and it says what it is: it reflects only what was typed in, isn't medical advice and doesn't replace a medical ID. It's paper, wider than a wallet card, and it can't be opened from a locked phone. The sitter version, the Caregiver sheet, carries \"In an emergency, call 911.\" Emergency contact and insurance always print, so leave out what you don't want on paper. See the [Family Health Binder](/shop/family-health-binder).",
        ],
        heading: "What the Companion prints",
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "If you also want to write down who would speak for you about medical care, that's a separate job, covered in [who would speak for you about medical care](/guides/emergency-contact-and-medical-decision-maker). Next step: fill the top three lines, allergies, first contact and doctor, and put the page on the fridge tonight.",
        ],
        heading: "What to do next",
      },
    ],
  },

  {
    slug: "new-doctor-intake-what-to-bring",
    title: "What to bring to a new doctor appointment",
    dek: "Allergies, medicines, conditions, family history and recent symptoms on one page, so a first visit starts from facts instead of memory.",
    primaryQuery: "what to bring to a new doctor appointment",
    next: { slug: "medication-list-what-to-write-down", reason: "The medicine list is the item a new doctor asks for first, so write it out before you go." },
    related: [
      { slug: "doctor-appointment-prep-checklist", reason: "For the rest of the paperwork to gather before any visit, use the appointment checklist." },
      { slug: "symptom-notes-for-a-doctor-visit", reason: "If the reason for the visit is a symptom, this shows how to write it down with dates." },
      { slug: "caring-for-a-parent-and-kids-one-place", reason: "When the new patient is your parent, this covers keeping their information next to your children's." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "family-health",
    sources: [
      {
        name: "Please bring ALL your medicines to your next appointment (AHRQ fact sheet)",
        url: "https://www.ahrq.gov/sites/default/files/wysiwyg/professionals/quality-patient-safety/patient-family-engagement/pfeprimarycare/medmanage-ptfactsheet.pdf",
        retrieved: "2026-09-26",
        note: "Advice to bring all medicines, prescription and non-prescription, to an appointment and to carry a medicine list to a new appointment.",
      },
      {
        name: "Getting Your Affairs in Order (National Institute on Aging)",
        url: "https://www.nia.nih.gov/health/advance-care-planning/getting-your-affairs-order-checklist-documents-prepare-future",
        retrieved: "2026-09-26",
        note: "Medical files list every doctor and every medicine, vitamin, herbal remedy, over-the-counter drug and supplement.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "For a first visit with a new doctor, bring a photo ID, your insurance card, every medicine you take (a written list, or the bottles), your allergies, your conditions and past surgeries, family history, and a few dated lines on why you're coming. Records from your old doctor help, and the new clinic can tell you how to get them.",
          "This is for an adult or a parent booking for a child. It can't tell you what your clinic requires, so call and ask. It isn't medical advice.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Example: one page for a first visit",
        paragraphs: [
          "Say you booked the appointment three weeks ago. This morning the clinic's form arrives with a box that says \"List all current medications,\" and you are standing in the kitchen trying to remember whether the allergy pill is 5 or 10 milligrams. Below is the page that would have saved you that minute, filled in for an invented eight-year-old.",
        ],
      },
      {
        kind: "table",
        intro: "This is an example. The child and every detail are made up.",
        columns: ["Section", "What the page says"],
        rows: [
          ["Name and birth date", "Amina, 04/02/2018"],
          ["Allergies", "Peanuts (hives)"],
          [
            "Medicines now",
            "Cetirizine 5 mg, once a day, as labeled. Inhaler, 2 puffs when needed, as labeled.",
          ],
          ["Conditions", "Asthma. Tonsils removed, 2023."],
          ["Family history", "Asthma runs in the family."],
          ["Recent symptoms", "Night cough since 09/14, mild. Rest and fluids helped."],
          ["Why we're coming", "New pediatrician after a move. Yearly checkup."],
        ],
      },
      {
        kind: "paragraphs",
        paragraphs: [
          "Notice what is not on it: the doctor's own name, the insurance number, the vaccine dates. Those belong on a separate sheet, because a new clinic asks for them at a different moment, usually at the front desk rather than in the exam room.",
        ],
      },
      {
        kind: "list",
        heading: "Gather it in this order",
        ordered: true,
        intro: "Do this the week before, not the night before.",
        items: [
          "Call the clinic and ask two things: what to bring, and whether new-patient forms come ahead of time. Some clinics send them by email or through a portal, and filling them in at home beats a clipboard in the waiting room.",
          "Write the medicine list from the labels, not from memory. Name, dose and how often, exactly as printed. Include the ones you don't think of as medicine: over-the-counter pills, vitamins, supplements and herbal products. The [medication list guide](/guides/medication-list-what-to-write-down) shows the layout.",
          "Put the bottles in a bag as well. The Agency for Healthcare Research and Quality's advice is to bring all your medicines, prescription and non-prescription, to the appointment. We'd bring the list and the bottles, and if they disagree, show the bottle.",
          "Write allergies with what happens, in your words: \"peanuts, hives\" says more than \"nut allergy.\"",
          "List conditions and past surgeries or hospital stays with the year. Roughly right is fine. Family history goes below it, as far as you know it.",
          "Add the reason for the visit and any symptom with the date it started. If it's a symptom visit, [symptom notes for a doctor visit](/guides/symptom-notes-for-a-doctor-visit) has a four-line format.",
          "Ask your old office how to transfer records and vaccine history, and start that now. See the next section.",
          "Pack photo ID and your insurance card, and read the clinic's paperwork when it arrives instead of relying on this page.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Records from the old doctor",
        paragraphs: [
          "A written summary can't hold a lab result, a scan or a discharge paper. If your new doctor will want those, they come from the office or hospital that made them. Ask that office how it sends records to a new clinic. Many want a signed release, and some take days or longer, which is why the request belongs in week one.",
          "For a child, vaccine history is the record clinics and schools ask for most. If you don't have it, your old clinic is the first place to ask. Write on your page where the record came from and the date.",
        ],
      },
      {
        kind: "timeline",
        heading: "A schedule that works backwards from the visit",
        steps: [
          {
            when: "A week before",
            what: "Call the clinic. Ask what to bring and whether forms come first.",
          },
          {
            when: "Six days before",
            what: "Ask the old office how to send records. Start the release if one is needed.",
          },
          {
            when: "Three days before",
            what: "Write the medicine list from the labels. Add allergies and conditions.",
          },
          {
            when: "The night before",
            what: "Print the page. Put it, the bottles, ID and insurance card in one bag.",
          },
          {
            when: "At the desk",
            what: "Hand over the page. Ask them to check it against their form.",
          },
          {
            when: "After the visit",
            what: "Fix anything the doctor changed, and date the page.",
          },
        ],
      },
      {
        kind: "list",
        heading: "What can go wrong",
        items: [
          "The page and the clinic's form disagree. The clinic's form is the record they keep, so fix your page to match what you actually take, and tell the front desk.",
          "Several doctors are involved. A summary of your health doesn't list them, so keep a separate line with each doctor's name, phone number and why you see them.",
          "You're going for a parent. Bring the same things, plus whatever permission their clinic wants before it talks to you. [Caring for a parent and kids in one place](/guides/caring-for-a-parent-and-kids-one-place) covers that part.",
          "The page is old. A list that was right in March is a guess in September. Write \"checked\" and the date at the top each time.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "Do I bring my pill bottles to a new doctor?",
            a: "It's worth doing. The Agency for Healthcare Research and Quality advises bringing all your medicines, including non-prescription ones like aspirin or antacids. A written list saves time, and the bottles settle any doubt about a dose or a name. If you can't bring bottles, photograph the labels.",
          },
          {
            q: "What is a new patient packet?",
            a: "It's the set of forms a clinic gives a first-time patient: contact details, insurance, medical history, medicines and consent forms. Some clinics send it ahead by email or portal. Ask when you book, and fill in what you can at home from your own page.",
          },
          {
            q: "How do I get my records sent to a new doctor?",
            a: "Ask the office that holds them how it transfers records. Many require a signed release form naming the new clinic, and some take days. Ask for immunization history at the same time. Start before the appointment, not after it.",
          },
          {
            q: "Should I bring a list of my past surgeries?",
            a: "Yes, with the year and, if you know it, the hospital. Exact dates are less important than getting the procedure and rough timing right. If a surgery was long ago and you're unsure, say so on the page instead of guessing.",
          },
          {
            q: "What should I write for family history?",
            a: "Write what you know, in plain words: which relative, and what condition, such as \"my mother, asthma.\" If you don't know a side of the family, write \"unknown.\" A short honest note is more use to a clinic than a long guess.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Family Health Binder fits",
        paragraphs: [
          "[Family Health Binder](/shop/family-health-binder) keeps the answers this page needs for each person, and its Intake summary prints them for a new doctor: allergies, current medicines, conditions, family history and the latest symptoms, with the person's name and birth date at the top. Doctors, dentists, pharmacies and insurance are kept too, but they print on its separate Forms sheet, not on the Intake summary. It only holds what you type in, it doesn't hold records or scans, and it doesn't fill in the clinic's own form. You can mark a record private so it stays off the printed page, and the page says how many it left off.",
        ],
      },
    ],
  },

  {
    slug: "what-to-leave-off-a-health-page-you-hand-over",
    title: "What health information to share with a sitter or school",
    dek: "A sitter, a camp and a new doctor each need different facts. Three questions to ask before you print, and what to keep on your own page.",
    primaryQuery: "what health information to share with a school",
    next: { slug: "emergency-contact-information-sheet", reason: "Once you know what to share, this shows how to set out the emergency page that everyone can see." },
    related: [
      { slug: "babysitter-and-grandparent-info-sheet", reason: "For the actual sitter or grandparent sheet, this lists what goes on it and how to order it." },
      { slug: "school-and-camp-health-forms-what-to-have-ready", reason: "Schools and camps ask for a fixed set of details, and this lists what to have ready." },
      { slug: "what-goes-in-a-family-health-binder", reason: "To keep the full set of private details in one place, start with the family medical binder." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "family-health",
    sources: [
      {
        name: "Training for Babysitters and Caregivers (Kids With Food Allergies)",
        url: "https://kidswithfoodallergies.org/living-with-food-allergies/planning-for-school/training-for-babysitters-and-caregivers/",
        retrieved: "2026-09-26",
        note: "Parents should give a sitter a written emergency plan, meet ahead of time, and practice with an auto-injector trainer.",
      },
      {
        name: "Poison Control (America's Poison Centers)",
        url: "https://www.poison.org/",
        retrieved: "2026-09-26",
        note: "Poison Help line 1-800-222-1222 is free and confidential; call 911 if the person collapses, has a seizure or trouble breathing.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "Give a sitter what they would need to act on in the next four hours: allergies and what a reaction looks like, what is taken and when, who to call, and the routines. Give a school or camp what its form asks for, no more. Keep the rest on your own page.",
          "This is for a parent deciding what to print. Once a page is on paper you can't control who reads it, and what a school, camp or clinic is required to ask for is theirs to say. It isn't legal or medical advice.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Ten minutes before the sitter rings the bell",
        paragraphs: [
          "It's 6:20 and the sitter arrives at 6:30. You have the full history open: every allergy, every past symptom, the note about last winter, the family history, the insurance member ID. The fastest thing to do is print all of it. The better thing is to pick.",
        ],
      },
      {
        kind: "table",
        heading: "Example: one child, three pages",
        intro: "An invented child, Amina, and what each reader gets. The right column stays on your own page.",
        columns: ["Reader", "Goes on their page", "Stays on yours"],
        rows: [
          [
            "Sitter",
            "Peanut allergy and hives, what is taken tonight, your cell, bedtime is 8, the green cup",
            "Family history, insurance ID, old symptoms, conditions the sitter can't act on",
          ],
          [
            "Camp form",
            "What the form asks: birth date, who to call, allergy, medicines, doctor",
            "Anything the form doesn't ask, including symptom notes",
          ],
          [
            "New doctor",
            "Allergies, medicines, conditions, family history, recent symptoms",
            "Home routines, the sitter's bedtime notes",
          ],
        ],
      },
      {
        kind: "list",
        heading: "Three questions before you print",
        ordered: true,
        items: [
          "Does this person need this fact to do what I'm asking of them? A sitter who will give a bedtime snack needs the allergy. A sitter probably doesn't need the family history.",
          "Would I be fine if this page were left on a counter, photographed, or found by another parent? If not, take the line off.",
          "Is it current? A wrong medicine on a sitter's page is worse than a missing one. Check the date on your list before you print.",
        ],
      },
      {
        kind: "list",
        heading: "What a sitter sheet needs, and what we'd skip",
        intro: "A page for a sitter, grandparent or neighbor. We'd skip insurance numbers here, because the first thing a sitter needs is your phone, not a member ID.",
        checkable: true,
        items: [
          "Your child's name, and the allergies with what happens: \"peanuts, hives.\"",
          "What is taken now, with dose and when, as labeled.",
          "Where the inhaler, auto-injector or other supplies are kept, if there are any.",
          "Two people to call, with numbers, and the address of the house.",
          "The Poison Help number, 1-800-222-1222, which is free in the United States.",
          "In an emergency, call 911. Say it in writing.",
          "Routines and comforts: bedtime, the cup, the fear of dogs.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "A page is not a handover",
        paragraphs: [
          "A parent's own advice isn't the same as a plan for a child's allergy. If your child has a food allergy, Kids With Food Allergies suggests going through a written emergency plan with the sitter and showing them how to use any auto-injector trainer, not just leaving a page. A sheet can hold the facts. It can't teach someone to act on them, and the person who prescribed the medicine or wrote the plan is the one to ask about that.",
        ],
      },
      {
        kind: "scripts",
        heading: "When a form asks for more than seems needed",
        intro: "You can ask before you answer.",
        items: [
          {
            situation: "Field you don't understand",
            line: "Is this field required, and who sees the form?",
          },
          {
            situation: "Broad history request",
            line: "Can I list only what affects the program, or do you need the full history?",
          },
          {
            situation: "Sitter asks about it",
            line: "Here's what to do if it comes up tonight. The rest isn't needed.",
          },
          {
            situation: "Copies of the form",
            line: "Where is this kept, and can I take my copy back at the end?",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "What happens once it is printed",
        paragraphs: [
          "Paper is easy to copy and hard to recall. A form handed to a camp may go to a nurse, a director and a counselor. A sheet left at the house may be seen by anyone who comes in. That is the reason to hand over a selection, and to keep the full record in one place of your own. The full version should never be the one that travels.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "How much medical information should I give a babysitter?",
            a: "Enough to act on for the hours they are with your child: allergies and what a reaction looks like, medicines taken and when, who to call, and where any supplies are. Skip history they can't act on. Walk through the important parts in person, since a page doesn't replace a conversation.",
          },
          {
            q: "What health information does a school need?",
            a: "That is the school's and your state's decision, and it varies. Start from the form the school gives you. Common items are who to call, allergies and medicines taken at school. If a field seems unrelated, ask why it is needed before you fill it in.",
          },
          {
            q: "Should I list every medicine on a sitter sheet?",
            a: "List what could come up while the sitter is there: what is taken tonight, and anything the sitter might need to give or watch for. A medicine taken only at home, in the morning, may not need to be on it. When in doubt, write it in the way it appears on the label.",
          },
          {
            q: "Is it safe to put insurance information on a babysitter sheet?",
            a: "We'd leave it off. A sitter's first call is you, then the second contact. Insurance numbers are easy to copy from a page left on a counter. If a sitter has to take a child to urgent care, you can give the details by phone or leave the card.",
          },
          {
            q: "How do I keep a private record but still share what a form needs?",
            a: "Keep your full record in one place and treat every printed page as a selection from it. Choose per reader, using the three questions above. If your tool has a print filter, use it, but remember that once a page is printed, the filter can't take it back.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Family Health Binder fits",
        paragraphs: [
          "In [Family Health Binder](/shop/family-health-binder), each allergy, medicine, symptom, vaccine or visit can be marked Keep this private. That record stays in the app and is left off every printed page, and each printed page says how many records it left off, so a page never looks complete when it isn't. It is a print filter, not a lock: you still see the record in the app. The emergency contact, insurance, doctors and caregiver notes have no private setting and print wherever they are used. Nothing is shared with the sitter, school or camp except the PDF you print and hand over.",
        ],
      },
    ],
  },

  {
    slug: "caring-for-a-parent-and-kids-one-place",
    title: "Caregiver binder for a parent and kids: one page each",
    dek: "Looking after a parent and children means two sets of forms and medicines. Same headings, one page per person, printed one at a time.",
    primaryQuery: "caregiver binder for parent and kids",
    next: { slug: "what-goes-in-a-family-health-binder", reason: "For the basic setup of one health page per person, start with the family medical binder." },
    related: [
      { slug: "medication-list-what-to-write-down", reason: "Two generations means two medicine lists, and this shows how to keep each one exactly as labeled." },
      { slug: "emergency-contact-information-sheet", reason: "Anyone might need to reach the right person fast, and this covers an emergency sheet for each household member." },
      { slug: "what-to-leave-off-a-health-page-you-hand-over", reason: "When a sibling or helper needs some but not all of the information, this helps you choose what to share." },
    ],
    publishedAt: "2026-09-26",
    updatedAt: "2026-09-26",
    areaSlug: "family-health",
    sources: [
      {
        name: "Getting Your Affairs in Order checklist (National Institute on Aging)",
        url: "https://www.nia.nih.gov/health/advance-care-planning/getting-your-affairs-order-checklist-documents-prepare-future",
        retrieved: "2026-09-26",
        note: "Medical files list every doctor and every medicine, vitamin, herbal remedy, over-the-counter drug and supplement with dose and schedule.",
      },
      {
        name: "Getting Started With Caregiving (National Institute on Aging)",
        url: "https://www.nia.nih.gov/health/caregiving/getting-started-caregiving",
        retrieved: "2026-09-26",
        note: "A caregiving notebook of medical care and contacts, paper or electronic, kept in a central place.",
      },
      {
        name: "Taking Someone to a Doctor's Appointment: Tips for Caregivers (National Institute on Aging)",
        url: "https://www.nia.nih.gov/health/medical-care-and-appointments/taking-someone-doctors-appointment-tips-caregivers",
        retrieved: "2026-09-26",
        note: "Giving permission in advance for a doctor to talk with a caregiver.",
      },
    ],
    body: [
      {
        kind: "paragraphs",
        paragraphs: [
          "To keep a parent's and your children's health information in one place, give each person their own page with the same headings: allergies, medicines, doctors, insurance and who to call. Keep the pages together, note the date each was last checked, and print one person at a time.",
          "This is for an adult looking after both generations in the United States. It covers paperwork, not care, and it can't tell you what a clinic will let you do on a parent's behalf. It isn't medical or legal advice.",
        ],
      },
      {
        kind: "paragraphs",
        heading: "Two phone calls in one morning",
        paragraphs: [
          "Say it's a Tuesday. At 8:15 the pediatric office wants your daughter's insurance group number for a school form. At 8:40 your mother's cardiologist calls back and asks which blood thinner she is on now. You know both answers exist somewhere. They are on two different paper stacks, and a third is in your head.",
        ],
      },
      {
        kind: "table",
        heading: "Example: same headings, two people",
        intro: "An invented child and an invented parent. Every heading is identical, so you always know where to look.",
        columns: ["Heading", "Amina, 8", "Mom, 74"],
        rows: [
          ["Allergies", "Peanuts, hives", "Penicillin, rash"],
          [
            "Medicines",
            "Cetirizine 5 mg, once a day, as labeled",
            "Six on the list, checked 09/20",
          ],
          ["Doctors", "Pediatrician, dentist", "Cardiologist, primary doctor, pharmacy"],
          ["Insurance", "Through your plan", "Medicare card, plus a supplement"],
          ["Who to call", "You, then Dad", "You, then your brother"],
          ["How often it changes", "A few times a year", "Every appointment"],
        ],
      },
      {
        kind: "list",
        heading: "Set it up in an evening",
        ordered: true,
        items: [
          "Write each person's name at the top of a separate page. Don't put two people on one page. A form for one should never carry the other's allergy.",
          "Use the same headings on every page: allergies, medicines, doctors, insurance, who to call. The [family medical binder guide](/guides/what-goes-in-a-family-health-binder) lists what goes under each.",
          "For your parent, copy the medicine list from the labels, including over-the-counter pills, vitamins and supplements. The National Institute on Aging's advice for caregivers is to list every medicine, vitamin, herbal remedy and supplement, with dose and schedule.",
          "Add every doctor your parent sees, with phone number and why. Their list is longer than a child's. Write the pharmacy, too.",
          "Put the insurance details for each person on their own page, copied from the card.",
          "Write a checked date beside each medicine list. A parent's list changes at every appointment, and a date tells you how far to trust it.",
          "Keep all the pages in one place you can reach fast, and tell one other person where that is.",
        ],
      },
      {
        kind: "scripts",
        heading: "Asking your parent",
        intro: "Some parents hear \"can I keep your information\" as \"I'm taking over.\" Say what it's for.",
        items: [
          {
            situation: "Starting the conversation",
            line: "When you see the cardiologist, I'd like the medicine list right in my hand, so you don't have to remember it.",
          },
          {
            situation: "Worried about privacy",
            line: "It's only what you tell me. You can tell me to take anything off.",
          },
          {
            situation: "About the clinic",
            line: "Would you sign the form that lets their office talk to me, or would you rather I ask them what it needs?",
          },
          {
            situation: "Handing it back",
            line: "Here's what I have. Is anything wrong or out of date?",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Permission, and the legal papers",
        paragraphs: [
          "A clinic may not discuss your parent's care with you unless your parent has given permission, and each clinic has its own form for that. Ask the office what it uses, and have your parent sign it while they can. The National Institute on Aging advises giving that permission in advance so a doctor can talk with a caregiver when needed.",
          "Advance directives, powers of attorney and who speaks for your parent about medical care are legal documents. A health page can note who the person is and where the papers are kept, but it doesn't replace them. [Who speaks for you about medical care](/guides/emergency-contact-and-medical-decision-maker) explains the roles, and [talking to your parents about their affairs](/guides/talking-to-your-parents-about-their-affairs) covers starting the conversation.",
        ],
      },
      {
        kind: "list",
        heading: "What can go wrong",
        items: [
          "The list drifts. A parent's medicines change more than a child's. If the checked date is old, treat the list as a draft and check the bottles.",
          "Your siblings can't see it. The pages live under your account, and your parent has no access to them. Print a page and hand it over when a brother or a neighbor needs one, and say the date on it.",
          "You print the wrong person. Two people on one page is how the wrong allergy lands on the wrong form. Print one person at a time and read the name at the top.",
          "Your parent doesn't want it written down. Then keep only what they've agreed to, and the phone numbers. A partial page with the date is still more useful than none.",
        ],
      },
      {
        kind: "faq",
        heading: "Questions people ask",
        items: [
          {
            q: "What should be in a caregiver binder for an elderly parent?",
            a: "Start with a medicine list (including over-the-counter pills and supplements), every doctor with a phone number, allergies, insurance details, emergency contacts and a note on where legal papers are kept. The National Institute on Aging also suggests a notebook of medical care, contacts and other details, on paper or electronic, kept in a central place.",
          },
          {
            q: "Do I need my parent's permission to talk to their doctor?",
            a: "Often, yes, in the form of a signed authorization the clinic keeps on file. Each clinic has its own form. Ask the front desk what it needs, and have your parent sign it ahead of time. If your parent is unable to sign, ask the clinic what it accepts.",
          },
          {
            q: "How do I keep my parent's and my kids' medical information separate?",
            a: "One page per person, with the person's name at the top, and printed one at a time. Use the same headings on each page so a form for either is quick to fill in. Don't combine pages just to save paper.",
          },
          {
            q: "Can my siblings see the same binder?",
            a: "That depends on where you keep it. With a paper binder, whoever holds it can read it. In Family Health Binder, the pages sit under one account and can't be shared, so you print a page for a sibling. Agree on who updates it, so two copies don't disagree.",
          },
          {
            q: "Where do I keep power of attorney and advance directive papers?",
            a: "Keep the originals with your other important papers, and tell your family where. Write the location on your parent's page instead of copying the document. If you're not sure which roles your parent has named, the guide linked above explains them.",
          },
        ],
      },
      {
        kind: "paragraphs",
        heading: "Where the Family Health Binder fits",
        paragraphs: [
          "In [Family Health Binder](/shop/family-health-binder), every person you look after gets their own card under your account: a child, a parent, a partner or you. You choose \"Parent\" or \"Child\" under Who are they to you, and each card has the same sections: allergies, conditions, medicines, vaccines, doctors, insurance and caregiver notes. You can print a Forms sheet, Caregiver sheet, Emergency card, Visit page and Intake summary for one person at a time, and each medicine list can be stamped with the date it was last checked. It has no separate accounts for children, no way to share the binder with a sibling, no upload of legal papers, and it sends no reminders. It only shows what you type in.",
        ],
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
 * Words that carry no topic: dropped before two guides are compared, so
 * that "what to do when a" cannot make a guide about a parent's death
 * look like one about a phone call.
 */
const TOPIC_STOPWORDS = new Set(
  (
    "a an and are as at be but by can do does for from has have how if in into is it its more not of on or so than that the their them then there these they this to up was what when where which who why will with you your yours about after before between over most many some any all one two three four five own out off just only also very too your".split(" ")
  ),
);

/** The topic words of a guide: what its title, description and target query are about. */
function topicWords(guide: Guide): Set<string> {
  const text = `${guide.title} ${guide.dek} ${guide.primaryQuery ?? ""} ${guide.primaryQuery ?? ""}`.toLowerCase();
  const words = text.match(/[a-z]+/g) ?? [];
  // Trailing "s" stripped so "subscription" and "subscriptions" agree.
  return new Set(words.filter((w) => w.length > 2 && !TOPIC_STOPWORDS.has(w)).map((w) => (w.length > 4 ? w.replace(/s$/, "") : w)));
}

/** Shared topic words over all topic words either guide uses. 0 for unrelated, 1 for identical. */
export function topicOverlap(a: Guide, b: Guide): number {
  const wa = topicWords(a);
  const wb = topicWords(b);
  let shared = 0;
  for (const w of wa) if (wb.has(w)) shared += 1;
  const union = wa.size + wb.size - shared;
  return union === 0 ? 0 : shared / union;
}

/** Below this, two guides in one area share a subject only by accident. */
const RELATED_MIN_OVERLAP = 0.09;

/**
 * Up to `limit` guides a reader who just finished this one would want
 * next, each with the reason to click.
 *
 * Curated picks come first, because a person wrote the reason and knew
 * why the two belong together. After that, same-area guides ranked by how
 * much of their topic they share with this one. It returns fewer than
 * `limit` rather than filling the gap with unrelated guides: the old
 * version ranked by distance in the list, so 86 percent of what it
 * showed had nothing to do with the guide it sat under.
 */
export function relatedPicks(guide: Guide, limit = 3): { guide: Guide; reason: string }[] {
  if (!guide.areaSlug) return [];
  const siblings = guidesForArea(guide.areaSlug).filter((candidate) => candidate.slug !== guide.slug);
  const picks: { guide: Guide; reason: string }[] = [];
  const taken = new Set<string>([guide.slug]);

  for (const curated of guide.related ?? []) {
    const other = siblings.find((candidate) => candidate.slug === curated.slug);
    if (other && !taken.has(other.slug)) {
      picks.push({ guide: other, reason: curated.reason });
      taken.add(other.slug);
    }
  }

  const ranked = siblings
    .filter((candidate) => !taken.has(candidate.slug))
    .map((candidate) => ({ candidate, score: topicOverlap(guide, candidate) }))
    .filter(({ score }) => score >= RELATED_MIN_OVERLAP)
    .sort((x, y) => y.score - x.score || x.candidate.slug.localeCompare(y.candidate.slug));

  for (const { candidate } of ranked) {
    if (picks.length >= limit) break;
    picks.push({ guide: candidate, reason: candidate.dek });
  }

  return picks.slice(0, limit);
}

export function relatedGuides(guide: Guide, limit = 3): Guide[] {
  return relatedPicks(guide, limit).map((pick) => pick.guide);
}