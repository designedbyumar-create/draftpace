import { describe, expect, it } from "vitest";
import { getPrintableAssetBytes } from "./assetBytes";

describe("getPrintableAssetBytes", () => {
  it("returns null for an unknown asset id", () => {
    expect(getPrintableAssetBytes("not-a-real-asset")).toBeNull();
  });

  // Byte length is checked as a sanity range, not pinned to an exact
  // number, since pdf-lib re-serializes (and typically recompresses) the
  // whole file on every edit, so the exact byte count legitimately
  // shifts each time the source PDF changes, most recently when the
  // "Activate your digital Companion" redemption page was added.
  it("returns the real Letter PDF's bytes, starting with the PDF magic number", () => {
    const bytes = getPrintableAssetBytes("letter");
    expect(bytes).not.toBeNull();
    expect(bytes!.byteLength).toBeGreaterThan(100_000);
    expect(bytes!.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });

  it("returns the real A4 PDF's bytes, starting with the PDF magic number", () => {
    const bytes = getPrintableAssetBytes("a4");
    expect(bytes).not.toBeNull();
    expect(bytes!.byteLength).toBeGreaterThan(100_000);
    expect(bytes!.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });
});
