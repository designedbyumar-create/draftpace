import { describe, expect, it } from "vitest";
import { describeElapsed, describeUpcoming, describeInterval, describeCareStatus, describeWarranty } from "./homeVoice";

const NOW = new Date("2026-06-15T12:00:00Z");

function isoDaysAgo(days: number): string {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

describe("describeElapsed", () => {
  it("speaks in units a person would use, not day counts", () => {
    expect(describeElapsed(0)).toBe("today");
    expect(describeElapsed(1)).toBe("yesterday");
    expect(describeElapsed(3)).toBe("3 days ago");
    expect(describeElapsed(9)).toBe("last week");
    expect(describeElapsed(21)).toBe("3 weeks ago");
    expect(describeElapsed(120)).toBe("4 months ago");
    expect(describeElapsed(400)).toBe("over a year ago");
    expect(describeElapsed(800)).toBe("2 years ago");
  });

  it("never returns a raw day count once something is months old", () => {
    expect(describeElapsed(131)).not.toContain("131");
  });
});

describe("describeUpcoming", () => {
  it("reads forward in the same units", () => {
    expect(describeUpcoming(0)).toBe("today");
    expect(describeUpcoming(1)).toBe("tomorrow");
    expect(describeUpcoming(5)).toBe("in 5 days");
    expect(describeUpcoming(18)).toBe("in 3 weeks");
    expect(describeUpcoming(90)).toBe("in 3 months");
  });
});

describe("describeInterval", () => {
  it("turns a day count into the phrase people actually say", () => {
    expect(describeInterval(1)).toBe("every day");
    expect(describeInterval(7)).toBe("every week");
    expect(describeInterval(14)).toBe("every 2 weeks");
    expect(describeInterval(30)).toBe("every month");
    expect(describeInterval(90)).toBe("every 3 months");
    expect(describeInterval(180)).toBe("every 6 months");
    expect(describeInterval(365)).toBe("every year");
  });
});

describe("describeCareStatus", () => {
  it("states what happened and what is usual, with no judgement", () => {
    expect(describeCareStatus(isoDaysAgo(120), 90, NOW)).toBe("Last done 4 months ago, usually every 3 months");
  });

  it("says not logged yet rather than never", () => {
    const line = describeCareStatus(null, 90, NOW);
    expect(line).toBe("Not logged yet, usually every 3 months");
    expect(line.toLowerCase()).not.toContain("never");
  });

  it("never says overdue, however late the job is", () => {
    expect(describeCareStatus(isoDaysAgo(900), 30, NOW).toLowerCase()).not.toContain("overdue");
  });
});

describe("describeWarranty", () => {
  it("stays flat whether the warranty is ending or already ended", () => {
    expect(describeWarranty(isoDaysAgo(-18), NOW)).toBe("Warranty ends in 3 weeks");
    expect(describeWarranty(isoDaysAgo(5), NOW)).toBe("Warranty ended 5 days ago");
    expect(describeWarranty(isoDaysAgo(0), NOW)).toBe("Warranty ends today");
  });
});
