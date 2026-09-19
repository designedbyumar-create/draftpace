import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { TodayDays, TodayHeader } from "./TodayView";
import { SOURCE_LABEL, type Child } from "../learning";
import type { ChildDay, TaskEvent, TodayTask, TodayView } from "../today";

const child = (id: string, name: string): Child => ({
  id,
  name,
  age: 8,
  schoolingType: null,
  notes: null,
  nameVisibility: "private",
  ageVisibility: "private",
  notesVisibility: "private",
  status: "active",
  createdAt: "2026-08-01T00:00:00Z",
});

const task = (childId: string, subject: string, extra: Partial<TodayTask> = {}): TodayTask => ({
  childId,
  subject,
  source: "parent",
  curriculumTitle: null,
  curriculumId: null,
  positionLabel: null,
  kind: "work",
  reason: null,
  ...extra,
});

const event = (childId: string, subject: string, state: TaskEvent["state"] = "done"): TaskEvent => ({
  childId,
  subject,
  onDate: "2026-09-22",
  state,
  difficulty: null,
  helpNeeded: null,
});

const view = (days: ChildDay[]): TodayView => ({
  days,
  nothingOutstanding: days.every((d) => d.tasks.length === 0),
  nothingPlanned: false,
});

const noop = () => {};

function render(v: TodayView, asking: TodayTask | null = null) {
  return renderToStaticMarkup(
    <TodayDays
      view={v}
      childHref={(id) => `/kids/${id}`}
      pendingKey={null}
      asking={asking}
      justRecordedKey={null}
      onDone={noop}
      onNotCompleted={noop}
      onDifficulty={noop}
      onSkipAsking={noop}
    />
  );
}

const maya: ChildDay = {
  child: child("maya", "Maya"),
  restDay: false,
  tasks: [
    task("maya", "Math", { source: "publisher", curriculumTitle: "Singapore Math 3A", positionLabel: "Unit 4" }),
    task("maya", "Writing", { kind: "review", reason: "Last time you said this was difficult." }),
  ],
  recorded: [event("maya", "Reading"), event("maya", "Science", "not-completed")],
};
const leo: ChildDay = {
  child: child("leo", "Leo"),
  restDay: false,
  tasks: [task("leo", "Reading", { source: "draftpace" })],
  recorded: [],
};

describe("The Day Sheet", () => {
  it("names where every task came from, on every row, every time", () => {
    const html = render(view([maya, leo]));
    expect(html).toContain(SOURCE_LABEL.publisher);
    expect(html).toContain(SOURCE_LABEL.parent);
    expect(html).toContain(SOURCE_LABEL.draftpace);
  });

  it("gives each subject its own labelled tap and its own way to say it was not done", () => {
    const html = render(view([maya]));
    expect(html).toContain('aria-label="Mark Math done"');
    expect(html).toContain('aria-label="Mark Writing done"');
    expect(html.match(/Did not get to it/g)).toHaveLength(2);
  });

  it("states the fact behind a review, never a bare nudge", () => {
    const html = render(view([maya]));
    expect(html).toContain("Worth going over again.");
    expect(html).toContain("Last time you said this was difficult.");
  });

  it("keeps children grouped, one labelled sheet each, in order", () => {
    const html = render(view([maya, leo]));
    expect(html).toContain('aria-label="Today for Maya"');
    expect(html).toContain('aria-label="Today for Leo"');
    expect(html.indexOf("Today for Maya")).toBeLessThan(html.indexOf("Today for Leo"));
  });

  it("counts what is recorded against what was scheduled, and calls a skipped subject not finished", () => {
    const html = render(view([maya]));
    expect(html).toContain("2 of 4 recorded");
    expect(html).toContain("Not finished");
  });

  it("says a day off is a normal day", () => {
    const html = render(view([{ child: child("maya", "Maya"), tasks: [], recorded: [], restDay: true }]));
    expect(html).toContain("Nothing scheduled today.");
  });

  it("says when everything is done", () => {
    const html = render(view([{ ...maya, tasks: [] }]));
    expect(html).toContain("That is everything for today.");
  });

  it("asks how it went only under the child it was recorded for", () => {
    const html = render(view([maya, leo]), task("leo", "Reading"));
    expect(html).toContain("How did Reading go?");
    expect(html.indexOf("How did Reading go?")).toBeGreaterThan(html.indexOf("Today for Leo"));
    expect(html.match(/How did/g)).toHaveLength(1);
    for (const label of ["Easy", "About right", "Difficult", "Skip"]) expect(html).toContain(label);
  });

  it("shows the date beside the heading", () => {
    const html = renderToStaticMarkup(<TodayHeader heading="What we are doing today." dateLabel="Tuesday, September 22" />);
    expect(html).toContain("Tuesday, September 22");
    expect(html).toContain("What we are doing today.");
  });

  // Tailwind 3 silently drops `/NN` on a var() colour.
  it("never puts an /opacity on a var() colour", () => {
    const source = readFileSync(join(__dirname, "TodayView.tsx"), "utf8");
    expect([...source.matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0])).toEqual([]);
  });
});
