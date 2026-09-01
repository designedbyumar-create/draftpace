import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * SetupModule can't be rendered in this test environment (no jsdom, same
 * constraint noted throughout this codebase's other structural checks), so
 * the shared Select wiring is verified by source inspection: every field
 * that used to be a raw <select> (currency, spending-group kind, weekly
 * check-in day) must now go through the shared Select component, and none
 * of the old raw markup should remain.
 */
describe("SetupModule: shared Select wiring", () => {
  const source = readFileSync(new URL("./SetupModule.tsx", import.meta.url), "utf-8");

  it("imports the shared Select component", () => {
    expect(source).toContain('import Select from "@/design-system/Select"');
  });

  it("uses <Select for currency, spending-group kind, and check-in day, with no raw <select> left", () => {
    expect(source).not.toContain("<select");
    const selectUsageCount = (source.match(/<Select\b/g) ?? []).length;
    expect(selectUsageCount).toBe(3);
  });
});
