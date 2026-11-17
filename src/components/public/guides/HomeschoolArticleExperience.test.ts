import { describe, expect, it } from "vitest";
import { lessonCapacity } from "./HomeschoolArticleExperience";

describe("homeschool lesson-capacity arithmetic", () => {
  it("does not silently drop the fifth day's lessons", () => {
    expect(lessonCapacity(180, 36, 4)).toEqual({ slots: 144, remaining: 36, perWeek: 5, weeksNeeded: 45 });
  });
  it("distinguishes a 144-lesson plan from a 180-lesson plan", () => {
    expect(lessonCapacity(144, 36, 4).remaining).toBe(0);
  });
  it("rounds required teaching weeks upward", () => {
    expect(lessonCapacity(145, 36, 4).weeksNeeded).toBe(37);
  });
  it("does not produce negative unplaced lessons", () => {
    expect(lessonCapacity(100, 40, 4).remaining).toBe(0);
  });
  it("keeps subject sessions separate from calendar attendance", () => {
    expect(lessonCapacity(120, 36, 2)).toEqual({ slots: 72, remaining: 48, perWeek: 120 / 36, weeksNeeded: 60 });
  });
});
