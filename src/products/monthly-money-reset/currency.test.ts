import { describe, expect, it } from "vitest";
import { formatCurrency, fromMinorUnits, getMinorUnitDigits, toMinorUnits } from "./currency";

describe("getMinorUnitDigits", () => {
  it("returns 2 for USD, GBP, and EUR", () => {
    for (const code of ["USD", "GBP", "EUR"]) {
      expect(getMinorUnitDigits(code)).toBe(2);
    }
  });

  it("reflects the runtime's own currency display convention rather than assuming 2 everywhere (e.g. PKR)", () => {
    // Intl's own resolvedOptions() is the source of truth here, not a
    // hardcoded assumption — this just proves getMinorUnitDigits() defers
    // to it rather than silently always returning 2.
    const expected = new Intl.NumberFormat("en-US", { style: "currency", currency: "PKR" }).resolvedOptions()
      .maximumFractionDigits;
    expect(getMinorUnitDigits("PKR")).toBe(expected);
  });

  it("falls back to 2 for an invalid code rather than throwing", () => {
    expect(getMinorUnitDigits("NOTREAL")).toBe(2);
  });
});

describe("toMinorUnits / fromMinorUnits", () => {
  it("round-trips a decimal amount through minor units exactly", () => {
    expect(toMinorUnits(19.99, "USD")).toBe(1999);
    expect(fromMinorUnits(1999, "USD")).toBeCloseTo(19.99);
  });

  it("handles zero and whole numbers", () => {
    expect(toMinorUnits(0, "USD")).toBe(0);
    expect(toMinorUnits(500, "USD")).toBe(50000);
  });
});

describe("formatCurrency", () => {
  it("formats minor units as a localized currency string per currency code", () => {
    expect(formatCurrency(197000, "USD")).toContain("1,970");
    expect(formatCurrency(0, "USD")).toMatch(/0(\.00)?/);
  });

  it("formats a non-USD currency using its own symbol/format", () => {
    const formatted = formatCurrency(150000, "EUR");
    expect(formatted).toContain("1,500");
  });
});
