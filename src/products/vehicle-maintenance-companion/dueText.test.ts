import { describe, expect, it } from "vitest";
import { describeInterval, describeRemaining, plural } from "./dueText";
import { item } from "./testFixtures";

describe("plural", () => {
  it("says one of a thing in the singular, and groups thousands", () => {
    expect(plural(1, "day")).toBe("1 day");
    expect(plural(2, "day")).toBe("2 days");
    expect(plural(1800, "mile")).toBe("1,800 miles");
  });
});

describe("describeRemaining", () => {
  it("leads with whichever dimension is past due, and never says 1 days", () => {
    expect(describeRemaining({ milesRemaining: 1800, daysRemaining: -1 })).toBe("1 day past due, 1,800 miles left");
    expect(describeRemaining({ milesRemaining: -500, daysRemaining: 42 })).toBe("500 miles past due, 42 days left");
  });

  it("keeps both when both are past, and both when neither is", () => {
    expect(describeRemaining({ milesRemaining: -500, daysRemaining: -42 })).toBe("500 miles past due, 42 days past due");
    expect(describeRemaining({ milesRemaining: 1600, daysRemaining: 14 })).toBe("1,600 miles left, 14 days left");
  });

  it("handles a job tracked by only one thing, and a job due today", () => {
    expect(describeRemaining({ milesRemaining: null, daysRemaining: 1 })).toBe("1 day left");
    expect(describeRemaining({ milesRemaining: 1, daysRemaining: null })).toBe("1 mile left");
    expect(describeRemaining({ milesRemaining: null, daysRemaining: 0 })).toBe("due today");
  });
});

describe("describeInterval", () => {
  it("names the interval the job really uses, halved for severe duty", () => {
    expect(describeInterval(item())).toBe("every 5,000 miles, every 6 months");
    expect(describeInterval(item({ severeDuty: true }))).toBe("every 2,500 miles, every 3 months");
    expect(describeInterval(item({ intervalMiles: null, intervalMonths: 12 }))).toBe("every 12 months");
    expect(describeInterval(item({ intervalMiles: null, intervalMonths: 1 }))).toBe("every 1 month");
  });
});
