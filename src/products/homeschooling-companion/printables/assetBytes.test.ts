import { describe, expect, it } from "vitest";
import { getPrintableAssetBytes } from "./assetBytes";
import { homeschoolingCompanionCatalogEntry } from "../catalog";

/**
 * The bytes a customer downloads must be the exact bytes that were
 * proofed. These check that what is committed is a real, whole PDF
 * rather than a truncated paste, which is the way this goes wrong.
 */
describe("The Homeschool Year, as shipped", () => {
  for (const assetId of ["letter", "a4"]) {
    it(`serves a real PDF for ${assetId}`, () => {
      const bytes = getPrintableAssetBytes(assetId);
      expect(bytes).not.toBeNull();
      expect(bytes!.subarray(0, 5).toString()).toBe("%PDF-");
      // A truncated paste is the failure mode, and it ends without this.
      expect(bytes!.subarray(-1024).toString("latin1")).toContain("%%EOF");
    });

    it(`ships a book rather than a leaflet for ${assetId}`, () => {
      expect(getPrintableAssetBytes(assetId)!.byteLength).toBeGreaterThan(100_000);
    });
  }

  it("serves nothing for an id it does not know", () => {
    expect(getPrintableAssetBytes("../../etc/passwd")).toBeNull();
    expect(getPrintableAssetBytes("legal")).toBeNull();
  });

  it("has a registered asset for every id it can serve", () => {
    const declared = (homeschoolingCompanionCatalogEntry.printableAssets ?? []).map((a) => a.id);
    expect(declared.sort()).toEqual(["a4", "letter"]);
    for (const id of declared) expect(getPrintableAssetBytes(id), id).not.toBeNull();
  });
});
