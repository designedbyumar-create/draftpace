import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/supabase/client", () => ({ supabase: {} }));

import { ManualJobsForm, ProfilePanel, VehicleForm } from "./VehicleForms";
import { profileList } from "../vehicleProfile";
import { item, vehicle } from "../testFixtures";

const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'");
const noop = () => {};

describe("adding a vehicle is one short screen", () => {
  const html = renderToStaticMarkup(<VehicleForm instanceId="i" onSaved={noop} onCancel={noop} />);

  it("asks a name, the kind, and the mileage, and nothing else up front", () => {
    const t = text(html);
    expect(t).toContain("What do you call it");
    for (const fuel of ["petrol", "diesel", "hybrid", "plug-in hybrid", "electric"]) expect(t.toLowerCase()).toContain(fuel);
    expect(t).toContain("Mileage (optional)");
    expect(t).toContain("Add vehicle");
  });

  it("keeps year, make and model out of the way, and does not ask about service history", () => {
    expect(html).toContain("<details");
    expect(text(html)).toContain("Year, make and model (optional)");
    expect(text(html)).not.toContain("service history");
  });

  it("offers the kind as chips that say whether they are pressed", () => {
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(5);
  });

  it("asks about service history only when changing a vehicle that exists, and shows what it already is", () => {
    const changing = renderToStaticMarkup(<VehicleForm instanceId="i" vehicle={vehicle({ fuelType: "diesel", hardUse: true, historyKnown: false })} onSaved={noop} onCancel={noop} />);
    expect(text(changing)).toContain("Do you know this vehicle's service history?");
    expect(changing).toContain('aria-pressed="true"');
    expect(text(changing)).toContain("Save changes");
    expect(text(changing)).not.toContain("Mileage (optional)");
  });
});

describe("the step after adding", () => {
  const panel = (v: ReturnType<typeof vehicle>, tracked: ReturnType<typeof item>[] = []) =>
    text(renderToStaticMarkup(<ProfilePanel instanceId="i" vehicle={v} tracked={tracked} onAdded={noop} onManual={noop} onStarter={noop} onDone={noop} />));

  it("offers the usual jobs for this kind of vehicle in one button, with how many and which", () => {
    const v = vehicle({ fuelType: "electric", year: 2023, currentMileage: 10_000 });
    const list = profileList(v)!;
    const t = panel(v);
    expect(t).toContain(`Add these ${list.jobs.length} jobs`);
    expect(t).toContain(list.jobs[0].template.taskName);
    expect(t).toContain("Type them from my manual");
    expect(t).toContain("Not now");
    expect(t).toContain("your manual is the real source");
  });

  it("does not guess when it has not been said what kind of vehicle it is", () => {
    const t = panel(vehicle({ fuelType: null }));
    expect(t).not.toContain("Add these");
    expect(t).toContain("Say what kind of vehicle it is");
    expect(t).toContain("Start from a list");
  });

  it("says so, instead of offering nothing, when everything usual is already there", () => {
    const v = vehicle({ fuelType: "electric", year: 2023, currentMileage: 10_000 });
    const tracked = profileList(v)!.jobs.map((j, i) => item({ id: `t${i}`, templateId: j.template.id, taskName: j.template.taskName }));
    expect(panel(v, tracked)).toContain("Everything usual for this vehicle is already on it.");
  });
});

describe("the manual table", () => {
  it("is a table of job, miles and months with spare rows, and a way to add another", () => {
    const t = text(renderToStaticMarkup(<ManualJobsForm instanceId="i" vehicle={vehicle()} onAdded={noop} onCancel={noop} />));
    expect(t).toContain("From your manual");
    for (const head of ["Job", "Miles", "Months"]) expect(t).toContain(head);
    expect(t).toContain("Add a row");
    expect(t).toContain("Add these jobs");
  });
});
