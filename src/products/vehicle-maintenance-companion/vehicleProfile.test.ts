import { describe, expect, it } from "vitest";
import { MAINTENANCE_TEMPLATES } from "./vehicleKnowledge";
import { FUEL_LABEL, HIGH_MILEAGE, OLDER_AT_YEARS, profileJobsToAdd, profileList } from "./vehicleProfile";
import { FUEL_TYPES } from "./state";

const NOW = new Date(2026, 8, 21);
const car = (over: Partial<Parameters<typeof profileList>[0]> = {}) => ({ fuelType: "petrol" as const, year: 2022, currentMileage: 20_000, hardUse: false, ...over });
const ids = (over = {}) => profileList(car(over), NOW)!.jobs.map((j) => j.template.id);

describe("profileList", () => {
  it("guesses nothing: no fuel type, no list", () => {
    expect(profileList(car({ fuelType: null }), NOW)).toBeNull();
  });

  it("gives an electric vehicle no engine oil, spark plugs or gearbox fluid, and a charging check", () => {
    const list = ids({ fuelType: "electric" });
    expect(list).not.toContain("oil-change");
    expect(list).not.toContain("spark-plugs");
    expect(list).not.toContain("transmission-fluid");
    expect(list).not.toContain("engine-air-filter");
    expect(list).toContain("charging-check");
    expect(list).toContain("tire-rotation");
  });

  it("gives a diesel a fuel filter and no spark plugs, and a petrol the reverse", () => {
    expect(ids({ fuelType: "diesel" })).toContain("fuel-filter");
    expect(ids({ fuelType: "diesel" })).not.toContain("spark-plugs");
    expect(ids({ fuelType: "petrol" })).toContain("spark-plugs");
    expect(ids({ fuelType: "petrol" })).not.toContain("fuel-filter");
  });

  it("keeps the engine jobs for a hybrid, and adds the charging check for a plug-in", () => {
    expect(ids({ fuelType: "hybrid" })).toContain("oil-change");
    expect(ids({ fuelType: "hybrid" })).not.toContain("charging-check");
    expect(ids({ fuelType: "plugin-hybrid" })).toContain("charging-check");
    expect(ids({ fuelType: "plugin-hybrid" })).toContain("oil-change");
  });

  it("adds a few jobs for age or for mileage, and a timing belt only where there is an engine", () => {
    expect(ids({ year: 2022 })).not.toContain("hoses-belts");
    expect(ids({ year: 2026 - OLDER_AT_YEARS })).toContain("hoses-belts");
    expect(ids({ year: 2026 - OLDER_AT_YEARS + 1 })).not.toContain("hoses-belts");
    expect(ids({ currentMileage: HIGH_MILEAGE })).toContain("suspension-check");
    expect(ids({ currentMileage: HIGH_MILEAGE - 1 })).not.toContain("suspension-check");
    expect(ids({ year: 2010, fuelType: "petrol" })).toContain("timing-belt");
    expect(ids({ year: 2010, fuelType: "electric" })).not.toContain("timing-belt");
  });

  it("says why a few more were added, and only when they were", () => {
    expect(profileList(car(), NOW)!.blurb).not.toContain("a few more");
    expect(profileList(car({ year: 2010, currentMileage: 120_000 }), NOW)!.blurb).toContain("a few more for its age and its mileage");
    expect(profileList(car({ year: null, currentMileage: null }), NOW)!.jobs.map((j) => j.template.id)).not.toContain("hoses-belts");
  });

  it("starts only the jobs that care how it is driven with severe duty on, and only when it is hard-used", () => {
    const hard = profileList(car({ hardUse: true }), NOW)!;
    const severe = hard.jobs.filter((j) => j.severeDuty).map((j) => j.template.id);
    expect(severe).toContain("oil-change");
    expect(severe).not.toContain("wiper-blades");
    expect(severe).not.toContain("cabin-air-filter");
    expect(profileList(car(), NOW)!.jobs.some((j) => j.severeDuty)).toBe(false);
  });

  it("only names templates that exist, with no repeats, for every fuel type and age", () => {
    const known = new Set(MAINTENANCE_TEMPLATES.map((t) => t.id));
    for (const fuel of FUEL_TYPES) {
      for (const year of [2024, 2005]) {
        const list = profileList(car({ fuelType: fuel, year }), NOW)!;
        const listed = list.jobs.map((j) => j.template.id);
        expect(new Set(listed).size, `${fuel} ${year} repeats a job`).toBe(listed.length);
        for (const id of listed) expect(known.has(id), id).toBe(true);
      }
      expect(FUEL_LABEL[fuel].length).toBeGreaterThan(0);
    }
  });
});

describe("profileJobsToAdd", () => {
  const list = profileList(car({ fuelType: "electric" }), NOW)!;

  it("offers everything on a vehicle with nothing, and nothing the second time", () => {
    expect(profileJobsToAdd(list, [])).toHaveLength(list.jobs.length);
    const tracked = list.jobs.map((j) => ({ templateId: j.template.id, taskName: j.template.taskName }));
    expect(profileJobsToAdd(list, tracked)).toEqual([]);
  });

  it("skips a job already tracked by template or by a name somebody typed", () => {
    const left = profileJobsToAdd(list, [{ templateId: "battery-check", taskName: "Battery test" }, { templateId: null, taskName: " wiper blade replacement" }]);
    const listed = left.map((j) => j.template.id);
    expect(listed).not.toContain("battery-check");
    expect(listed).not.toContain("wiper-blades");
    expect(left).toHaveLength(list.jobs.length - 2);
  });
});
