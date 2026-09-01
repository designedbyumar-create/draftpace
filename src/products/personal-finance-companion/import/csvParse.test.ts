import { describe, expect, it } from "vitest";
import { parseCsv, parseCsvMoneyToMinorUnits, looksLikeFormulaInjection } from "./csvParse";

describe("parseCsv", () => {
  it("parses a simple CSV with headers", () => {
    const result = parseCsv("Date,Description,Amount\n2026-08-01,Groceries,-45.00\n2026-08-02,Salary,3200.00");
    expect(result.headers).toEqual(["Date", "Description", "Amount"]);
    expect(result.rows).toEqual([
      ["2026-08-01", "Groceries", "-45.00"],
      ["2026-08-02", "Salary", "3200.00"],
    ]);
    expect(result.rowErrors).toEqual([]);
  });

  it("handles quoted fields containing commas", () => {
    const result = parseCsv('Date,Description,Amount\n2026-08-01,"Groceries, weekly",-45.00');
    expect(result.rows[0]).toEqual(["2026-08-01", "Groceries, weekly", "-45.00"]);
  });

  it("handles escaped double quotes inside a quoted field", () => {
    const result = parseCsv('Date,Description,Amount\n2026-08-01,"Bob\'s ""Diner""",-12.00');
    expect(result.rows[0][1]).toBe('Bob\'s "Diner"');
  });

  it("handles CRLF line endings", () => {
    const result = parseCsv("Date,Amount\r\n2026-08-01,-45.00\r\n");
    expect(result.rows).toEqual([["2026-08-01", "-45.00"]]);
  });

  it("reports an empty file as an error rather than throwing", () => {
    const result = parseCsv("");
    expect(result.rowErrors[0].message).toMatch(/empty/i);
  });

  it("reports a malformed row (wrong column count) without dropping the rest of the file", () => {
    const result = parseCsv("Date,Description,Amount\n2026-08-01,Groceries\n2026-08-02,Salary,3200.00");
    expect(result.rowErrors).toHaveLength(1);
    expect(result.rows).toEqual([["2026-08-02", "Salary", "3200.00"]]);
  });
});

describe("parseCsvMoneyToMinorUnits", () => {
  it("parses a plain decimal amount", () => {
    expect(parseCsvMoneyToMinorUnits("45.00")).toBe(4500);
  });

  it("strips a dollar sign and thousands commas", () => {
    expect(parseCsvMoneyToMinorUnits("$1,234.56")).toBe(123456);
  });

  it("parses a negative amount", () => {
    expect(parseCsvMoneyToMinorUnits("-45.00")).toBe(-4500);
  });

  it("treats a parenthesized amount as negative (accounting convention)", () => {
    expect(parseCsvMoneyToMinorUnits("(45.00)")).toBe(-4500);
  });

  it("returns null for a blank cell rather than 0", () => {
    expect(parseCsvMoneyToMinorUnits("")).toBeNull();
    expect(parseCsvMoneyToMinorUnits("   ")).toBeNull();
  });

  it("returns null for a malformed value rather than guessing", () => {
    expect(parseCsvMoneyToMinorUnits("N/A")).toBeNull();
    expect(parseCsvMoneyToMinorUnits("45.00.00")).toBeNull();
    expect(parseCsvMoneyToMinorUnits("forty five dollars")).toBeNull();
  });

  it("never produces a binary-float rounding artifact for common cents values", () => {
    expect(parseCsvMoneyToMinorUnits("19.99")).toBe(1999);
    expect(parseCsvMoneyToMinorUnits("0.10")).toBe(10);
  });
});

describe("looksLikeFormulaInjection", () => {
  it("flags cells starting with =, +, -, or @", () => {
    expect(looksLikeFormulaInjection("=SUM(A1:A2)")).toBe(true);
    expect(looksLikeFormulaInjection("+1234")).toBe(true);
    expect(looksLikeFormulaInjection("-1234")).toBe(true);
    expect(looksLikeFormulaInjection("@example")).toBe(true);
  });

  it("does not flag ordinary text or numbers", () => {
    expect(looksLikeFormulaInjection("Groceries")).toBe(false);
    expect(looksLikeFormulaInjection("45.00")).toBe(false);
  });
});
