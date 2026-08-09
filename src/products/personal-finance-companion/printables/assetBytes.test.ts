import { describe, expect, it } from "vitest";
import { getPrintableAssetBytes } from "./assetBytes";

describe("getPrintableAssetBytes", () => {
  it("returns null for an unknown asset id", () => {
    expect(getPrintableAssetBytes("not-a-real-asset")).toBeNull();
  });

  it("returns the real Letter PDF's bytes, starting with the PDF magic number", () => {
    const bytes = getPrintableAssetBytes("letter");
    expect(bytes).not.toBeNull();
    expect(bytes!.byteLength).toBe(203486);
    expect(bytes!.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });

  it("returns the real A4 PDF's bytes, starting with the PDF magic number", () => {
    const bytes = getPrintableAssetBytes("a4");
    expect(bytes).not.toBeNull();
    expect(bytes!.byteLength).toBe(206924);
    expect(bytes!.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });
});
