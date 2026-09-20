import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DueScreen, { type DueScreenProps } from "./DueScreen";
import { deriveDueView } from "../dueStatus";
import { deriveRenewalsView } from "../renewals";
import { vehicleLamps } from "../fleet";
import { item, renewal, vehicle } from "../testFixtures";

const NOW = new Date("2026-09-21T12:00:00Z");
const TODAY = "2026-09-21";

function render(over: Partial<DueScreenProps> & { items?: ReturnType<typeof item>[]; vehicles?: ReturnType<typeof vehicle>[] } = {}) {
  const vehicles = over.vehicles ?? [vehicle({ currentMileage: 50_000 })];
  const items = over.items ?? [];
  const props: DueScreenProps = {
    view: deriveDueView(vehicles, items, NOW),
    vehicles,
    lamps: [],
    filterId: null,
    onFilter: () => {},
    renewals: [],
    mileageNotices: [],
    openItemId: null,
    onOpen: () => {},
    renderForm: (entry) => `FORM:${entry.item.id}`,
    openMileageId: null,
    onOpenMileage: () => {},
    renderMileageForm: (v) => `MILEAGE:${v.id}`,
    actionError: null,
    ...over,
  };
  return renderToStaticMarkup(<DueScreen {...props} />).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'");
}

const oilDue = item({ id: "oil", taskName: "Oil and filter change", lastDoneAt: "2026-02-10", lastDoneMileage: 44_500 });
const rotationSoon = item({ id: "rot", taskName: "Tire rotation", intervalMiles: 6000, intervalMonths: 6, lastDoneAt: "2026-03-20", lastDoneMileage: 44_500 });
const unknown = item({ id: "bat", taskName: "Battery test", intervalMiles: null, intervalMonths: 12, lastDoneAt: null, lastDoneMileage: null });

describe("Due: the banner", () => {
  const html = (over: Parameters<typeof render>[0] = {}) => {
    const vehicles = over.vehicles ?? [vehicle({ currentMileage: 50_400, mileageUpdatedAt: "2026-08-01", plate: "7ABC123" })];
    return renderToStaticMarkup(
      <DueScreen view={deriveDueView(vehicles, over.items ?? [], NOW)} vehicles={vehicles} lamps={[]} filterId={null} onFilter={() => {}} renewals={[]} mileageNotices={[]} openItemId={over.openItemId ?? null} onOpen={() => {}} renderForm={() => "FORM"} openMileageId={null} onOpenMileage={() => {}} renderMileageForm={() => null} actionError={null} />
    );
  };

  it("shows the vehicle's own plate and odometer, and the job that is due, lit", () => {
    const out = html({ items: [oilDue] });
    expect(out).toContain("7ABC123");
    expect(out).toContain('aria-label="50,400 miles"');
    expect(out).toContain("as of 1 Aug");
    expect(out).toMatch(/>Due<\/div>|Due<\/div>/);
  });

  it("names the vehicle by its label when no plate is recorded, and shows plate with year, make and model when there is one", () => {
    expect(html({ vehicles: [vehicle({ plate: null })], items: [oilDue] })).not.toContain("7ABC");
    expect(html({ items: [oilDue] })).toContain(">2018 Honda Civic<");
  });

  it("says there is no mileage, rather than drawing an odometer of zeros", () => {
    const out = html({ vehicles: [vehicle({ currentMileage: null, plate: null })], items: [rotationSoon] });
    expect(out).toContain("No mileage yet");
    expect(out).not.toContain("miles\"");
  });

  it("is honest on a quiet day: no lit lamp, and it says all clear", () => {
    const out = html({ items: [] });
    expect(out).toContain("All clear");
    expect(out).toContain("Nothing is due right now.");
    expect(out).not.toContain("I had this done");
  });

  it("puts the form under the banner, and takes the button away while it is open", () => {
    const open = html({ items: [oilDue], openItemId: "oil" });
    expect(open).toContain("FORM");
    expect(open).not.toContain("I had this done");
    expect(html({ items: [oilDue] })).not.toContain("FORM");
  });
});

describe("Due", () => {
  it("leads with the most urgent job, in words that agree with each other", () => {
    const text = render({ items: [oilDue] });
    expect(text).toContain("Oil and filter change");
    expect(text).toContain("500 miles past due, 42 days past due (every 5,000 miles, every 6 months)");
    expect(text).not.toMatch(/\b1 days\b/);
  });

  it("offers to record that it was done, with a real date and mileage, not a stamp of today", () => {
    const text = render({ items: [oilDue, rotationSoon] });
    expect(text).toContain("I had this done");
    expect(text).not.toContain("Mark done today");
  });

  it("puts the job's form in place once it is open", () => {
    expect(render({ items: [oilDue], openItemId: "oil" })).toContain("FORM:oil");
    expect(render({ items: [oilDue] })).not.toContain("FORM:oil");
  });

  it("gives a job with nothing recorded a way to record it, instead of a dead end", () => {
    const text = render({ items: [unknown] });
    expect(text).toContain("Nothing to judge yet");
    expect(text).toContain("Record when it was last done");
  });

  it("opens the form for a job with nothing recorded, and for one further down the list", () => {
    expect(render({ items: [unknown], openItemId: "bat" })).toContain("FORM:bat");
    expect(render({ items: [oilDue, rotationSoon], openItemId: "rot" })).toContain("FORM:rot");
  });

  it("says nothing is due, honestly, when nothing is", () => {
    expect(render({ items: [] })).toContain("Nothing is due right now.");
  });

  it("lists paperwork with how far away it is, and where to look", () => {
    const v = vehicle();
    const view = deriveRenewalsView([v], [renewal({ id: "a", dueOn: "2026-10-03" }), renewal({ id: "b", kind: "insurance", dueOn: "2026-09-09" })], TODAY);
    const html = renderToStaticMarkup(
      <DueScreen view={deriveDueView([v], [], NOW)} vehicles={[v]} lamps={[]} filterId={null} onFilter={() => {}} renewals={[...view.pastDate, ...view.soon]} mileageNotices={[]} openItemId={null} onOpen={() => {}} renderForm={() => null} openMileageId={null} onOpenMileage={() => {}} renderMileageForm={() => null} actionError={null} />
    );
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(text).toContain("Insurance Civic 12 days ago, 2026-09-09");
    expect(text).toContain("Registration Civic In 12 days, 2026-10-03");
    expect(html).toContain('href="/app/products/vehicle-maintenance-companion/paperwork"');
  });

  it("says when a distance is being worked out from an old reading, or from no reading at all", () => {
    const v = vehicle();
    const stale = render({ mileageNotices: [{ vehicle: v, kind: "stale", freshness: { state: "stale", asOf: "2026-07-01", days: 82 } }] });
    expect(stale).toContain("Civic's mileage was last updated 82 days ago. Distances below are worked out from it.");
    expect(stale).toContain("Update mileage");
    const none = render({ mileageNotices: [{ vehicle: v, kind: "none", freshness: { state: "none" } }] });
    expect(none).toContain("Civic has jobs tracked by distance but no mileage yet, so they cannot be judged.");
    expect(render({ mileageNotices: [{ vehicle: v, kind: "stale", freshness: { state: "stale", asOf: null, days: null } }] })).toContain("Civic's mileage has no date on it.");
  });

  it("opens the mileage form in place, and shows a failed save", () => {
    const v = vehicle();
    const text = render({ mileageNotices: [{ vehicle: v, kind: "stale", freshness: { state: "stale", asOf: "2026-07-01", days: 82 } }], openMileageId: "v1", actionError: "The service is saved, but the vehicle's mileage could not be updated." });
    expect(text).toContain("MILEAGE:v1");
    expect(text).toContain("The service is saved, but the vehicle's mileage could not be updated.");
  });
});

describe("Due: several vehicles", () => {
  const cars = [vehicle({ id: "a", label: "Civic", plate: "7ABC123" }), vehicle({ id: "b", label: "Van", plate: null }), vehicle({ id: "c", label: "Bike", plate: null })];
  const oil = item({ id: "oil", vehicleId: "a", lastDoneAt: "2026-02-10", lastDoneMileage: 44_500 });
  const view = deriveDueView(cars, [oil], NOW);
  const strip = (filterId: string | null = null, vs = cars) =>
    renderToStaticMarkup(
      <DueScreen view={deriveDueView(vs, [oil], NOW)} vehicles={vs} lamps={vehicleLamps(vs, view, [])} filterId={filterId} onFilter={() => {}} renewals={[]} mileageNotices={[]} openItemId={null} onOpen={() => {}} renderForm={() => null} openMileageId={null} onOpenMileage={() => {}} renderMileageForm={() => null} actionError={null} />
    );

  it("shows one chip per vehicle, by plate or by name, and All, once there is more than one", () => {
    const out = strip();
    const t = out.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(t).toContain("ALL");
    expect(t).toContain("7ABC123");
    expect(t).toContain("Van");
    expect(t).toContain("Bike");
    expect(out.match(/aria-pressed="/g)).toHaveLength(4);
  });

  it("marks the chosen chip as pressed, and All when none is chosen", () => {
    expect(strip(null).match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(strip("b").match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(strip("b")).not.toBe(strip(null));
  });

  it("has no strip at all for a single vehicle", () => {
    expect(strip(null, [cars[0]])).not.toContain('aria-label="Vehicle"');
  });

  it("keeps the banner on the chosen vehicle even when nothing is due on it", () => {
    const only = renderToStaticMarkup(
      <DueScreen view={{ due: [], dueSoon: [], noBaseline: [], quiet: true }} vehicles={cars} lamps={vehicleLamps(cars, view, [])} filterId="b" onFilter={() => {}} renewals={[]} mileageNotices={[]} openItemId={null} onOpen={() => {}} renderForm={() => null} openMileageId={null} onOpenMileage={() => {}} renderMileageForm={() => null} actionError={null} />
    );
    expect(only).toContain("All clear");
    expect(only).toMatch(/border-white\/30[^>]*>Van</);
    expect(only).not.toMatch(/border-white\/30[^>]*>7ABC123</);
  });
});
