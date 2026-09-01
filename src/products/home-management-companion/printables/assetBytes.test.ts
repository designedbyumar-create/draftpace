import { describe, expect, it } from "vitest";
import { getPrintableAssetBytes } from "./assetBytes";

describe("The Home Survey's asset bytes", () => {
  it("returns null for an unknown asset id", () => {
    expect(getPrintableAssetBytes("not-a-real-asset")).toBeNull();
  });

  // Byte length is a sanity range rather than an exact number: the book is
  // regenerated from homeKnowledge.ts, so the count legitimately moves
  // whenever a care template or an item type is added.
  for (const [id, mediaWidth] of [
    ["letter", 612],
    ["a4", 595],
  ] as const) {
    it(`returns the real ${id} PDF, with the right page size`, () => {
      const bytes = getPrintableAssetBytes(id);
      expect(bytes).not.toBeNull();
      expect(bytes!.byteLength).toBeGreaterThan(100_000);
      expect(bytes!.subarray(0, 5).toString("ascii")).toBe("%PDF-");

      // Guards the one mistake that would be invisible until somebody
      // printed it: shipping the same page size under both asset ids.
      const boxes = bytes!.toString("latin1").match(/\/MediaBox \[0 0 (\d+)/g) ?? [];
      expect(boxes.length).toBeGreaterThan(0);
      for (const box of boxes) {
        expect(box).toContain(`/MediaBox [0 0 ${mediaWidth}`);
      }
    });
  }

  // Page content is compressed, so only the document strings are readable
  // here. Those are still worth asserting: the title is what a reader sees
  // in their PDF viewer's window and in the file's properties. The Info
  // dictionary stores them as indirect references, so the literals are
  // matched rather than the /Title key itself.
  it("is titled and attributed in its document metadata", () => {
    const info = getPrintableAssetBytes("letter")!.toString("latin1");
    expect(info).toContain("(The Home Survey)");
    expect(info).toContain("(Draftpace)");
  });
});
