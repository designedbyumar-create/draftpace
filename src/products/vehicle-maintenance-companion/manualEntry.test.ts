import { describe, expect, it } from "vitest";
import { parseManualRows } from "./manualEntry";

const row = (taskName = "", miles = "", months = "") => ({ taskName, miles, months });

describe("parseManualRows", () => {
  it("turns filled rows into jobs, with commas allowed in a distance, and skips spare blank rows", () => {
    expect(parseManualRows([row("Oil change", "7,500", "12"), row(), row("Cabin filter", "", "24"), row()])).toEqual({
      ok: true,
      jobs: [
        { taskName: "Oil change", intervalMiles: 7500, intervalMonths: 12 },
        { taskName: "Cabin filter", intervalMiles: null, intervalMonths: 24 },
      ],
    });
  });

  it("names the row that is not complete enough to track", () => {
    expect(parseManualRows([row("Oil change", "5000"), row("Coolant")])).toEqual({ ok: false, message: "Row 2: give it an interval, by miles, by months, or both." });
    expect(parseManualRows([row("Oil change", "5000"), row("", "60000", "")])).toEqual({ ok: false, message: "Row 2: say what the job is." });
  });

  it("holds an interval to a whole number above zero", () => {
    for (const bad of [["Oil", "5k", ""], ["Oil", "", "0"], ["Oil", "-3", ""], ["Oil", "5.5", ""]]) {
      expect(parseManualRows([row(...(bad as [string, string, string]))]).ok, bad.join("|")).toBe(false);
    }
  });

  it("needs at least one job", () => {
    expect(parseManualRows([row(), row()])).toEqual({ ok: false, message: "Add at least one job." });
    expect(parseManualRows([])).toEqual({ ok: false, message: "Add at least one job." });
  });
});
