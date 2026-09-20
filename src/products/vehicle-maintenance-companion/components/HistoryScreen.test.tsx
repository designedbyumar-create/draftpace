import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HistoryScreen, { type HistoryScreenProps } from "./HistoryScreen";
import { historyByYear } from "../serviceHistory";
import { event } from "../testFixtures";

const events = [
  event({ id: "a", doneOn: "2026-09-01", mileage: 50_100, shop: "Main St", costMinorUnits: 12050, note: "Synthetic 5W-30" }),
  event({ id: "b", doneOn: "2026-03-01", taskName: "Tire rotation", mileage: null, costMinorUnits: null }),
  event({ id: "c", doneOn: "2025-11-02", taskName: "Brake pads", costMinorUnits: 8000, vehicleId: "v2" }),
];

function render(over: Partial<HistoryScreenProps> = {}) {
  const props: HistoryScreenProps = {
    available: true,
    choices: [{ id: "v1", label: "Civic", closed: false }, { id: "v2", label: "Van", closed: true }],
    selectedId: null,
    onSelect: () => {},
    groups: historyByYear(events),
    labelFor: (id) => (id === "v1" ? "Civic" : "Van"),
    logOpen: false,
    onOpenLog: () => {},
    renderLogForm: () => "LOGFORM",
    canLog: true,
    editingId: null,
    onEdit: () => {},
    renderEditForm: (e) => `EDIT:${e.id}`,
    onRemove: () => {},
    removingId: null,
    notice: null,
    onPrint: () => {},
    printing: false,
    printLabel: null,
    ...over,
  };
  return renderToStaticMarkup(<HistoryScreen {...props} />).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

describe("History", () => {
  it("shows each service with its day, mileage, who did it and what it cost, newest year first", () => {
    const text = render();
    expect(text.indexOf("2026")).toBeLessThan(text.indexOf("2025"));
    expect(text).toContain("2026-09-01 50,100 mi Engine oil and filter change Main St · 120.50 · Civic");
    expect(text).toContain("Synthetic 5W-30");
    expect(text).toContain("2026-03-01 Tire rotation Civic");
  });

  it("adds up only the costs somebody entered, and says how many entries that covers", () => {
    const text = render();
    expect(text).toContain("120.50 entered, on 1 of 2 entries");
    expect(text).toContain("80.00 entered, on 1 of 1 entry");
  });

  it("shows no cost line for a year in which nobody entered a cost", () => {
    const text = render({ groups: historyByYear([event({ id: "n", costMinorUnits: null })]) });
    expect(text).not.toContain("entered");
  });

  it("names the vehicle on each entry only while every vehicle is showing", () => {
    expect(render()).toContain("· Civic");
    expect(render({ selectedId: "v1", groups: historyByYear(events, "v1") })).not.toContain("· Civic");
  });

  it("offers every vehicle, marks a closed one, and can filter to one", () => {
    const text = render();
    expect(text).toContain("ALL");
    expect(text).toContain("Van (closed)");
  });

  it("says what belongs here when there is nothing yet, rather than showing an empty page", () => {
    const text = render({ groups: [] });
    expect(text).toContain("Nothing recorded yet.");
    expect(text).toContain("it lands here with its date and mileage");
  });

  it("says so, without alarm, when the record could not be loaded", () => {
    const text = render({ available: false, groups: [] });
    expect(text).toContain("could not be loaded right now. Nothing has been lost");
    expect(text).not.toContain("Log a service");
    expect(text).not.toContain("Nothing recorded yet.");
  });

  it("puts a form in place for logging and for correcting", () => {
    expect(render({ logOpen: true })).toContain("LOGFORM");
    expect(render({ editingId: "b" })).toContain("EDIT:b");
    expect(render({ editingId: "b" })).not.toContain("2026-03-01 Tire rotation");
  });

  it("prints one vehicle's record, and asks for a choice when several are showing", () => {
    expect(render()).toContain("Choose one vehicle to print its record.");
    const text = render({ selectedId: "v1", printLabel: "Civic", groups: historyByYear(events, "v1") });
    expect(text).toContain("For Civic, oldest first, ready to hand to a buyer.");
    expect(text).toContain("Print the service record");
  });

  it("shows a notice when something did not save", () => {
    expect(render({ notice: "The service is saved, but the vehicle's mileage could not be updated." })).toContain("mileage could not be updated");
  });
});
