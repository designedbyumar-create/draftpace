/**
 * A small, safe CSV parser, handles quoted fields (commas and escaped
 * `""` quotes inside them), CRLF/LF, and reports malformed rows as errors
 * rather than throwing or silently dropping data. No third-party CSV
 * library dependency was added for this; the format handled here (RFC
 * 4180-ish, what spreadsheet exports actually produce) is small enough to
 * implement directly and review completely.
 *
 * Home Base's own copy of PFC's identical import/csvParse.ts (products
 * don't import from one another's folders), trimmed to the two functions
 * this product actually uses: Home Base has no money field to parse from
 * a CSV cell, so parseCsvMoneyToMinorUnits was left out rather than
 * carried over unused.
 */

export interface CsvParseResult {
  headers: string[];
  rows: string[][];
  rowErrors: { rowIndex: number; message: string }[];
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

export function parseCsv(text: string): CsvParseResult {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], rowErrors: [{ rowIndex: 0, message: "The file is empty." }] };
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows: string[][] = [];
  const rowErrors: CsvParseResult["rowErrors"] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (cells.length !== headers.length) {
      rowErrors.push({ rowIndex: i, message: `Expected ${headers.length} columns, found ${cells.length}.` });
      continue;
    }
    rows.push(cells.map((c) => c.trim()));
  }

  return { headers, rows, rowErrors };
}

/** True for a cell whose leading character would be interpreted as a formula by a spreadsheet application (=, +, -, @), flagged for display safety, never silently stripped from the underlying value. */
export function looksLikeFormulaInjection(cell: string): boolean {
  return /^[=+\-@]/.test(cell.trim());
}
