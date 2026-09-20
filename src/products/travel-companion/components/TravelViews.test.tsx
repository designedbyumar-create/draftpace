import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import ItineraryView, { dayLabel, type ItineraryViewProps } from "./ItineraryView";
import TodayView, { type TodayViewProps } from "./TodayView";
import { travelCompanionDefinition as definition } from "../definition";

const stop = (over: Record<string, unknown> = {}) => ({
  id: "s",
  time: "09:40",
  title: "Train to Porto",
  note: null,
  location: "Lisboa Santa Apolónia",
  awaiting: false,
  ...over,
});

const itinerary = (over: Partial<ItineraryViewProps> = {}) =>
  renderToStaticMarkup(
    <ItineraryView
      tripTitle="LISBON AND PORTO"
      rangeLabel="12 Oct to 14 Oct"
      days={[
        { date: "2026-10-12", label: "Mon 12 Oct", place: "Lisbon", stops: [stop()] },
        { date: "2026-10-13", label: "Tue 13 Oct", place: null, stops: [] },
      ]}
      undated={[{ id: "u", title: "Travel insurance", kindLabel: "Other" }]}
      compact={false}
      onAdd={() => {}}
      actions={<button type="button">Save as PDF</button>}
      {...over}
    />,
  );

const today = (over: Partial<TodayViewProps> = {}) =>
  renderToStaticMarkup(
    <TodayView
      tripTitle="LISBON AND PORTO"
      where="Lisbon"
      quiet={false}
      closingNote={null}
      today={[stop({ awaiting: true })]}
      important={[]}
      later={[{ label: "Tomorrow", stops: [stop({ id: "t", title: "Rental car", note: "Pickup begins" })] }]}
      waiting={[{ id: "w", title: "Rebooking the Faro transfer" }]}
      help={<span>help</span>}
      {...over}
    />,
  );

const visible = (html: string) => html.replace(/<[^>]*>/g, " ").toLowerCase();
const source = (name: string) => readFileSync(join(__dirname, name), "utf8");

describe("the whole trip, on a line", () => {
  it("sets every day under its own date, with where the person is and what is on it", () => {
    const html = itinerary();
    expect(html).toContain("12 Oct");
    expect(html).toContain("Lisbon");
    expect(html).toContain("Train to Porto");
    expect(html).toContain("09:40");
  });

  it("says plainly when a day has nothing recorded, and offers to add something to any day", () => {
    const html = itinerary();
    expect(html).toContain("Nothing recorded for this day.");
    expect(html).toContain('aria-label="Add something on Tue 13 Oct"');
    expect(html).toContain('aria-label="Add something on Mon 12 Oct"');
  });

  it("keeps a booking with no time in its own place instead of giving it a day", () => {
    expect(itinerary()).toContain("Not on a day yet");
    expect(itinerary()).toContain("Travel insurance");
    expect(itinerary({ undated: [] })).not.toContain("Not on a day yet");
  });

  it("explains a long trip's missing days, and says how to start when there are none", () => {
    expect(itinerary({ compact: true })).toContain("days with nothing recorded are not shown");
    expect(itinerary({ days: [], undated: [], rangeLabel: null })).toContain("laid out here day by day");
  });

  it("formats a day from the date as typed, not from the reader's timezone", () => {
    expect(dayLabel("2026-10-12")).toBe("Mon 12 Oct");
    expect(dayLabel("2026-12-31")).toBe("Thu 31 Dec");
  });

  it("never counts down, scores, suggests, or says anything is late", () => {
    for (const html of [itinerary(), itinerary({ compact: true }), itinerary({ days: [], undated: [] }), today()]) {
      expect(visible(html)).not.toMatch(/countdown|days to go|days left|sleeps|overdue|late\b|missed|don't forget|you should|we recommend|top pick|must[- ]see/);
    }
  });
});

describe("Today, on the same line", () => {
  it("sets today's stops on the line with their real times, and marks one that is awaiting confirmation", () => {
    const html = today();
    expect(html).toContain("09:40");
    expect(html).toContain("Awaiting confirmation");
    expect(html).toContain('aria-label="The day, in order"');
  });

  it("puts later days and what is being waited on under their own headings", () => {
    const html = today();
    expect(html).toContain("Tomorrow");
    expect(html).toContain("Pickup begins");
    expect(html).toContain("Waiting");
    expect(html).toContain("Rebooking the Faro transfer");
  });

  it("draws no line at all when nothing is recorded, only the honest sentence", () => {
    const html = today({ today: [], later: [], waiting: [], quiet: true });
    expect(html).toContain("Nothing scheduled for today, right now.");
    expect(html).not.toContain("The day, in order");
  });
});

describe("where the new views are wired", () => {
  it("the product has an Itinerary destination in its bar, after Today and before Trip", () => {
    expect(definition.primaryNavigation).toEqual(["workspace", "itinerary", "trip", "people"]);
    expect(definition.destinationLabels?.itinerary).toBe("Itinerary");
  });

  it("with no trip, both Today and Itinerary open on the one-screen start, and finishing it lands on the itinerary", () => {
    expect(source("TodayModule.tsx")).toContain("<TripStart");
    expect(source("ItineraryModule.tsx")).toContain("<TripStart");
    expect(source("TripStart.tsx")).toContain("/itinerary");
    expect(source("TripStart.tsx")).toContain("Where are you going?");
  });

  it("never puts an /opacity on a var() colour, which Tailwind 3 silently drops", () => {
    for (const file of ["TodayView.tsx", "ItineraryView.tsx", "TripStart.tsx"]) {
      expect([...source(file).matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0]), file).toEqual([]);
    }
  });

  it("spends the deep accent only on calls to action and the active tab: never on a ticket, a stub or a day header", () => {
    for (const file of ["TodayView.tsx", "ItineraryView.tsx"]) {
      const src = source(file);
      expect(src, `${file} puts the accent on a surface or text`).not.toMatch(/(?:bg|text|border|ring)-\[var\(--primary(?:-[a-z]+)?\)\]/);
    }
  });

  it("sets every stop as a ticket: the time on a stub, a perforation, then the booking", () => {
    const html = today();
    expect(html).toContain("border-dashed");
    expect(html).toMatch(/tabular-nums[^>]*>09:40</);
    expect(html).toContain("var(--product-wash)");
  });

  it("is sans throughout: the boarding pass is the object, and a serif headline on a ticket reads as an invitation", () => {
    for (const file of ["TodayView.tsx", "ItineraryView.tsx", "TripStart.tsx"]) {
      expect(source(file), file).not.toContain("--product-narrative-font");
    }
    expect(definition.theme?.narrativeFont).toBeUndefined();
  });
});
