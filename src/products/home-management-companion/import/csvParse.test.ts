import { describe, expect, it } from "vitest";
import { parseCsv, looksLikeFormulaInjection } from "./csvParse";

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
