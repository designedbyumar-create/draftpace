import { describe, expect, it } from "vitest";
import { detailsFromVehicle, detailsPatch, parseRenewalForm } from "./paperworkForm";
import { vehicle } from "./testFixtures";

const values = (over = {}) => ({ kind: "registration" as const, label: "", dueOn: "2026-10-15", whereKept: "", note: "", ...over });

describe("parseRenewalForm", () => {
  it("needs a real date, and accepts one in the past as well as one to come", () => {
    expect(parseRenewalForm(values({ dueOn: "" }))).toEqual({ ok: false, message: "Choose the date." });
    expect(parseRenewalForm(values({ dueOn: "2024-01-05" })).ok).toBe(true);
    expect(parseRenewalForm(values({ dueOn: "2030-01-05" })).ok).toBe(true);
  });

  it("makes somebody name an other date, and keeps a name only for an other", () => {
    expect(parseRenewalForm(values({ kind: "other" }))).toEqual({ ok: false, message: "Say what this date is for." });
    expect(parseRenewalForm(values({ kind: "other", label: " Parking permit " }))).toMatchObject({ ok: true, renewal: { label: "Parking permit" } });
    expect(parseRenewalForm(values({ kind: "insurance", label: "left over from a switch" }))).toMatchObject({ ok: true, renewal: { label: null } });
  });

  it("saves blanks as nothing and trims what was typed", () => {
    expect(parseRenewalForm(values({ whereKept: "  Glove box, blue folder ", note: "" }))).toEqual({
      ok: true,
      renewal: { kind: "registration", label: null, dueOn: "2026-10-15", whereKept: "Glove box, blue folder", note: null },
    });
  });
});

describe("details", () => {
  it("starts from what the vehicle already has, and from nothing where it has nothing", () => {
    expect(detailsFromVehicle(vehicle({ plate: "7ABC123", tyreSize: null }))).toMatchObject({ plate: "7ABC123", tyreSize: "", vin: "" });
  });

  it("saves a cleared field as nothing, so a detail can be taken back out", () => {
    const patch = detailsPatch({ ...detailsFromVehicle(vehicle({ plate: "7ABC123" })), plate: "   ", vin: " 1HGCM82633A004352 " });
    expect(patch).toMatchObject({ plate: null, vin: "1HGCM82633A004352", insurer: null });
  });
});
