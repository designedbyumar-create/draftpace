/**
 * A small, safe CSV parser — handles quoted fields (commas and escaped
 * `""` quotes inside them), CRLF/LF, and reports malformed rows as errors
 * rather than throwing or silently dropping data. No third-party CSV
 * library dependency was added for this; the format handled here (RFC
 * 4180-ish, what spreadsheet exports actually produce) is small enough to
 * implement directly and review completely.
 *
 * Money handling: parseCsvMoneyToMinorUnits is the one function that
 * turns a raw CSV cell into an integer minor-units value. It rejects
 * anything it can't parse cleanly rather than guessing — a canonical
 * transaction must never be created from a value nobody actually
 * confirmed was right.
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

/** True for a cell whose leading character would be interpreted as a formula by a spreadsheet application (=, +, -, @) — flagged for display safety, never silently stripped from the underlying value. */
export function looksLikeFormulaInjection(cell: string): boolean {
  return /^[=+\-@]/.test(cell.trim());
}

/** Rejects anything it can't parse cleanly rather than guessing — a blank, malformed, or ambiguous cell returns null, never 0 or a best-effort number. */
export function parseCsvMoneyToMinorUnits(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  // Parenthesized amounts are a common accounting convention for negatives, e.g. "(45.00)".
  const isParenthesizedNegative = /^\(.*\)$/.test(trimmed);
  const unwrapped = isParenthesizedNegative ? trimmed.slice(1, -1) : trimmed;

  const cleaned = unwrapped.replace(/[$,\s]/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const majorUnits = Number(cleaned);
  if (Number.isNaN(majorUnits)) return null;

  const minorUnits = Math.round(majorUnits * 100);
  return isParenthesizedNegative ? -Math.abs(minorUnits) : minorUnits;
}
