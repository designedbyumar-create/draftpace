import { describe, expect, it } from "vitest";
import { dateKey, deriveToday, describeTask, runsToday, type TaskEvent, type TodayInputs } from "./today";
import type { Child, Curriculum, PlanEntry, Position } from "./learning";

const MONDAY = new Date("2026-08-24T09:00:00");
const SATURDAY = new Date("2026-08-29T09:00:00");

const emma: Child = {
  id: "emma",
  name: "Emma",
  age: 9,
  schoolingType: "homeschool",
  notes: null,
  nameVisibility: "shareable",
  ageVisibility: "private",
  notesVisibility: "private",
  status: "active",
  createdAt: "2026-08-01T00:00:00Z",
};
const noah: Child = { ...emma, id: "noah", name: "Noah", age: 7 };

const plan = (childId: string, subject: string, daysPerWeek = 5): PlanEntry => ({
  id: `${childId}-${subject}`,
  childId,
  subject,
  daysPerWeek,
  active: true,
  minutesPerSession: null,
  origin: "parent",
});
const abeka: Curriculum = {
  id: "abeka-math",
  childId: "emma",
  source: "publisher",
  title: "Abeka Grade 4",
  publisher: null,
  subject: "Math",
  visibility: "private",
  status: "active",
};
const at = (label: string): Position => ({
  id: "p1",
  childId: "emma",
  curriculumId: "abeka-math",
  nodeId: null,
  label,
  movedAt: "2026-08-01T00:00:00Z",
});
const event = (over: Partial<TaskEvent> = {}): TaskEvent => ({
  childId: "emma",
  subject: "Math",
  onDate: "2026-08-21",
  state: "done",
  difficulty: "about-right",
  helpNeeded: null,
  ...over,
});

const inputs = (over: Partial<TodayInputs> = {}): TodayInputs => ({
  children: [emma],
  plan: [plan("emma", "Math")],
  curricula: [abeka],
  positions: [at("Unit 3, Lesson 12")],
  events: [],
  ...over,
});

describe("what is on today", () => {
  it("produces one task per scheduled subject, and no more", () => {
    const view = deriveToday(inputs({ plan: [plan("emma", "Math"), plan("emma", "Reading")] }), MONDAY);
    expect(view.days[0].tasks).toHaveLength(2);
    expect(view.days[0].tasks.map((t) => t.subject).sort()).toEqual(["Math", "Reading"]);
  });

  it("says where it came from on every task, without exception", () => {
    const view = deriveToday(inputs({ plan: [plan("emma", "Math"), plan("emma", "Art")] }), MONDAY);
    for (const task of view.days[0].tasks) expect(task.source).toBeTruthy();
    expect(view.days[0].tasks.find((t) => t.subject === "Math")!.source).toBe("publisher");
    // No curriculum for Art, so it is the parent's own plan and says so.
    expect(view.days[0].tasks.find((t) => t.subject === "Art")!.source).toBe("parent");
  });

  it("carries the parent's own position rather than a lesson it worked out", () => {
    const view = deriveToday(inputs(), MONDAY);
    expect(view.days[0].tasks[0].positionLabel).toBe("Unit 3, Lesson 12");
    expect(describeTask(view.days[0].tasks[0])).toBe("Abeka Grade 4, Unit 3, Lesson 12");
  });

  it("falls back to the subject when there is nothing else true to say", () => {
    const view = deriveToday(inputs({ curricula: [], positions: [] }), MONDAY);
    expect(describeTask(view.days[0].tasks[0])).toBe("Math");
  });

  it("drops a subject already recorded today rather than asking twice", () => {
    const view = deriveToday(inputs({ events: [event({ onDate: dateKey(MONDAY) })] }), MONDAY);
    expect(view.days[0].tasks).toHaveLength(0);
    expect(view.days[0].recorded).toHaveLength(1);
  });
});

/**
 * The rule that closes the loop. A session that went badly changes what
 * comes next, and the product says why in terms of what was recorded
 * rather than what it concluded about a child.
 */
describe("when last time went badly", () => {
  it("offers a review after a difficult session", () => {
    const view = deriveToday(inputs({ events: [event({ difficulty: "difficult" })] }), MONDAY);
    const task = view.days[0].tasks[0];
    expect(task.kind).toBe("review");
    expect(task.reason).toBe("Last time you said this was difficult.");
  });

  it("offers a review after something was not finished", () => {
    const view = deriveToday(inputs({ events: [event({ state: "not-completed", difficulty: null })] }), MONDAY);
    expect(view.days[0].tasks[0].kind).toBe("review");
    expect(view.days[0].tasks[0].reason).toBe("Last time this was not finished.");
  });

  it("does not review after a session that went fine", () => {
    for (const difficulty of ["easy", "about-right"] as const) {
      const view = deriveToday(inputs({ events: [event({ difficulty })] }), MONDAY);
      expect(view.days[0].tasks[0].kind, difficulty).toBe("work");
      expect(view.days[0].tasks[0].reason).toBeNull();
    }
  });

  it("does not review on the strength of a session the parent did not describe", () => {
    const view = deriveToday(inputs({ events: [event({ difficulty: null })] }), MONDAY);
    expect(view.days[0].tasks[0].kind).toBe("work");
  });

  it("states only what was recorded, never a claim about the child", () => {
    const view = deriveToday(inputs({ events: [event({ difficulty: "difficult" })] }), MONDAY);
    const reason = view.days[0].tasks[0].reason!.toLowerCase();
    for (const word of ["behind", "struggling", "weak", "failed", "cannot"]) {
      expect(reason).not.toContain(word);
    }
  });

  it("never moves anybody forward, because position belongs to the parent", () => {
    const view = deriveToday(inputs({ events: [event()] }), MONDAY);
    // The label is exactly what the parent set, however well it went.
    expect(view.days[0].tasks[0].positionLabel).toBe("Unit 3, Lesson 12");
  });
});

/**
 * The rule that matters most. A product that always has something on it
 * is a product whose something nobody believes.
 */
describe("a day with nothing on it", () => {
  it("schedules nothing on a Saturday for a five day subject", () => {
    const view = deriveToday(inputs(), SATURDAY);
    expect(view.days[0].tasks).toHaveLength(0);
    expect(view.days[0].restDay).toBe(true);
    expect(view.nothingOutstanding).toBe(true);
  });

  it("tells a day off apart from having no plan at all", () => {
    const off = deriveToday(inputs(), SATURDAY);
    expect(off.nothingPlanned).toBe(false);
    const unplanned = deriveToday(inputs({ plan: [] }), MONDAY);
    expect(unplanned.nothingPlanned).toBe(true);
    expect(unplanned.days[0].restDay).toBe(false);
  });

  it("invents nothing for a child with no plan", () => {
    const view = deriveToday(inputs({ plan: [] }), MONDAY);
    expect(view.days[0].tasks).toHaveLength(0);
  });

  it("puts a subject on the days a person would expect", () => {
    // Monday the 24th through Sunday the 30th of August 2026.
    const week = [24, 25, 26, 27, 28, 29, 30].map((d) => new Date(`2026-08-${d}T09:00:00`));
    const runs = (n: number) => week.filter((d) => runsToday(n, d)).length;
    expect(runs(5)).toBe(5);
    expect(runs(3)).toBe(3);
    expect(runs(1)).toBe(1);
    expect(runs(7)).toBe(7);
    expect(runs(0)).toBe(0);
    // Three days a week is Monday, Wednesday, Friday, not every 2.33 days.
    expect(runsToday(3, week[0])).toBe(true);
    expect(runsToday(3, week[1])).toBe(false);
    expect(runsToday(3, week[2])).toBe(true);
  });
});

describe("two children", () => {
  const two = inputs({
    children: [emma, noah],
    plan: [plan("emma", "Math"), plan("noah", "Reading")],
  });

  it("keeps each child's day to their own", () => {
    const view = deriveToday(two, MONDAY);
    expect(view.days).toHaveLength(2);
    expect(view.days[0].tasks.every((t) => t.childId === "emma")).toBe(true);
    expect(view.days[1].tasks.every((t) => t.childId === "noah")).toBe(true);
  });

  it("never lets one child's history change another child's day", () => {
    const view = deriveToday({ ...two, events: [event({ childId: "emma", difficulty: "difficult" })] }, MONDAY);
    expect(view.days.find((d) => d.child.id === "noah")!.tasks[0].kind).toBe("work");
  });

  it("is only settled when every child is", () => {
    const view = deriveToday(two, MONDAY);
    expect(view.nothingOutstanding).toBe(false);
  });
});

describe("dates are the family's own", () => {
  it("uses the local day and not an instant, so late evenings do not slip", () => {
    expect(dateKey(new Date("2026-08-24T23:30:00"))).toBe("2026-08-24");
    expect(dateKey(new Date("2026-08-24T00:10:00"))).toBe("2026-08-24");
  });
});
