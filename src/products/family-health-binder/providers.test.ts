import { describe, expect, it } from "vitest";
import { careTeam, pharmacyFor, primaryDoctor } from "./providers";
import { provider } from "./testFixtures";

describe("care team", () => {
  const list = [
    provider({ id: "ph", kind: "pharmacy", name: "Corner Pharmacy" }),
    provider({ id: "sp", kind: "specialist", name: "Dr. Kim", createdAt: "2026-09-08T00:00:00.000Z" }),
    provider({ id: "d2", kind: "doctor", name: "Dr. Later", createdAt: "2026-09-09T00:00:00.000Z" }),
    provider({ id: "d1", kind: "doctor", name: "Dr. Patel" }),
    provider({ id: "x", kind: "dentist", familyMemberId: "m2" }),
    provider({ id: "gone", status: "archived" }),
  ];

  it("lists one person's providers, doctors first, then specialists, dentist, pharmacy", () => {
    expect(careTeam(list, "m1").map((p) => p.id)).toEqual(["d1", "d2", "sp", "ph"]);
  });

  it("takes the first doctor entered as the primary one, and skips removed ones", () => {
    expect(primaryDoctor(list, "m1")?.name).toBe("Dr. Patel");
    expect(primaryDoctor(list, "m3")).toBeNull();
    expect(primaryDoctor([provider({ status: "archived" })], "m1")).toBeNull();
  });

  it("finds a pharmacy only when one was entered", () => {
    expect(pharmacyFor(list, "m1")?.name).toBe("Corner Pharmacy");
    expect(pharmacyFor(list, "m2")).toBeNull();
  });
});
