import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import BookSpread from "./BookSpread";
import NextStepPage from "./NextStepPage";
import BookPage from "./BookPage";
import AffairsContents from "./AffairsContents";
import { AFFAIR_STEP_BY_KEY } from "../affairsKnowledge";
import { personalLifeAffairsCompanionDefinition as definition } from "../definition";
import type { AffairItem } from "../lifeAffairs";

const item = (over: Partial<AffairItem>): AffairItem =>
  ({
    id: "x",
    kind: "person",
    area: "people",
    originStepKey: null,
    label: "Who to contact first",
    whereabouts: null,
    personName: "Jane Smith",
    personContact: "07700 900123",
    notes: null,
    fields: {},
    status: "established",
    establishedAt: "2026-08-01",
    lastConfirmedAt: "2026-09-03",
    reviewIntervalMonths: null,
    nextReviewAt: null,
    ...over,
  }) as AffairItem;

const ITEMS = [
  item({ id: "1", area: "money", label: "Main bank account", personName: null, personContact: null, whereabouts: "Statements in the blue folder" }),
  item({ id: "2", area: "people" }),
  item({ id: "3", area: "paperwork", label: "The will, and where it is", personName: null, personContact: null, whereabouts: "Top drawer, study" }),
];

const step = AFFAIR_STEP_BY_KEY["paperwork.will-exists"];
const nextPage = (over: Partial<Parameters<typeof NextStepPage>[0]> = {}) =>
  renderToStaticMarkup(
    <NextStepPage
      area={step.area}
      lead="Let us start with one thing."
      instruction={step.instruction}
      body={step.why}
      existing={[]}
      bookLabel={step.bookLabel}
      minutes={step.minutes}
      actions={<button type="button">Start</button>}
      {...over}
    />,
  );

/** What a person can read: markup and class names are not text. */
const visible = (html: string) => html.replace(/<[^>]*>/g, " ").toLowerCase();

const source = (name: string) => readFileSync(join(__dirname, name), "utf8");

describe("the next step, as a page", () => {
  it("carries the area as its running head and marks the place with a ribbon", () => {
    const html = nextPage();
    expect(html).toContain("Where the paperwork is");
    expect(html).toContain('data-testid="ribbon"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("says what the answer becomes, in the step's own book heading", () => {
    expect(nextPage()).toContain(`Goes in your book as`);
    expect(nextPage()).toContain(step.bookLabel);
    expect(nextPage()).toContain(`About ${step.minutes} minutes`);
  });

  it("shows what is already recorded before asking anything about it", () => {
    const html = nextPage({
      existing: [{ id: "a", label: "The will", detail: "Held by Hart & Co", notes: null }],
    });
    expect(html).toContain("What is recorded now");
    expect(html).toContain("Held by Hart &amp; Co");
  });

  it("has no progress bar, percentage or denominator, and no banned word", () => {
    const html = visible(nextPage());
    expect(html).not.toMatch(/progress|%|\d+ of \d+|remaining|estate|assets|overdue|in case i die|in case of death/);
  });
});

describe("the book, as an object", () => {
  const html = renderToStaticMarkup(<BookSpread lastUpdated="3 September 2026" items={ITEMS} />);

  it("has a cover with the real title, attribution and date", () => {
    expect(html).toContain("My Affairs");
    expect(html).toContain("Personal Life Affairs Companion");
    expect(html).toContain("Last updated 3 September 2026");
  });

  it("gives a tab to each area that has something in it, in the book's own order, and to no other", () => {
    const tabs = [...html.matchAll(/role="tab"[^>]*>([^<]+)</g)].map((m) => m[1]);
    expect(tabs).toEqual(["People", "Important documents", "Money"]);
    expect(html).not.toContain("Business");
    expect(html).not.toContain("Pets and dependants");
  });

  it("opens on the first tab and shows only that section", () => {
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>People</);
    expect(html).toContain("Who decides, and who to call");
    expect(html).toContain("Who to contact first");
    expect(html).not.toContain("Main bank account");
  });

  it("shows no tabs and no contents when nothing is recorded, only the cover", () => {
    const empty = renderToStaticMarkup(<BookSpread lastUpdated={null} items={[]} />);
    expect(empty).toContain("My Affairs");
    expect(empty).not.toContain("tablist");
    expect(empty).not.toContain("Last updated");
  });

  it("never counts, never scores, and never uses a banned word", () => {
    expect(visible(html)).not.toMatch(/progress|%|\d+ of \d+|estate|assets|overdue|in case i die|in case of death/);
  });

  it("takes its cover colour from the definition, not from a second copy of the hex", () => {
    expect(source("BookSpread.tsx")).toContain("personalLifeAffairsCompanionDefinition.theme?.accentScale");
    expect(source("BookSpread.tsx").match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
    expect(definition.theme?.accentScale?.base).toBe("#26374f");
  });
});

describe("the page", () => {
  it("only draws the ribbon when it is the page being written", () => {
    expect(renderToStaticMarkup(<BookPage label="x">y</BookPage>)).not.toContain("ribbon");
    expect(renderToStaticMarkup(<BookPage label="x" ribbon>y</BookPage>)).toContain("ribbon");
  });

  it("never puts an /opacity on a var() colour, which Tailwind 3 silently drops", () => {
    for (const file of ["BookPage.tsx", "NextStepPage.tsx", "BookSpread.tsx"]) {
      expect([...source(file).matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0]), file).toEqual([]);
    }
  });
});

describe("where the pages are used", () => {
  it("the Next screen sets every state on a page, and the Book screen shows the spread", () => {
    const workspace = source("WorkspaceModule.tsx");
    expect(workspace).toContain("<NextStepPage");
    expect(workspace.match(/<BookPage /g)!.length).toBeGreaterThanOrEqual(2);
    expect(source("PrintablesModule.tsx")).toContain("<BookSpread");
    expect(source("PrintablesModule.tsx")).not.toMatch(/#[0-9a-fA-F]{6}\b/);
  });

  it("the product declares the book shape and its own ground", () => {
    expect(definition.theme?.identity).toEqual({ motif: "book", shape: "sharp" });
    expect(definition.theme?.ground?.light.appBg).toBe("#efebe2");
  });
});

describe("the affairs contents", () => {
  const html = renderToStaticMarkup(
    <AffairsContents
      now={new Date("2026-09-20T10:00:00Z")}
      onOpen={() => {}}
      groups={[
        { area: "people", entries: [item({})] },
        { area: "paperwork", entries: [item({ id: "s", area: "paperwork", label: "The will", personName: null, personContact: null, whereabouts: "Top drawer", nextReviewAt: "2026-01-01" })] },
      ]}
    />,
  );

  it("lists what exists under a head for its area, in the person's own words", () => {
    expect(html).toContain("People");
    expect(html).toContain("Important documents");
    expect(html).toContain("Who to contact first");
    expect(html).toContain("Top drawer");
    expect(html).not.toContain("Money");
  });

  it("says plainly when something is worth checking again, and never that it is late", () => {
    expect(html).toContain("Worth checking again");
    expect(visible(html)).not.toMatch(/overdue|late|missed|behind/);
  });
});
