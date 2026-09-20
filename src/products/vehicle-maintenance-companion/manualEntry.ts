export interface ManualRow {
  taskName: string;
  miles: string;
  months: string;
}

export interface ManualJob {
  taskName: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
}

export type ManualResult = { ok: true; jobs: ManualJob[] } | { ok: false; message: string };

const wholeAbove0 = (text: string): number | null => {
  const cleaned = text.replace(/[,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return value > 0 ? value : null;
};

/**
 * Jobs typed straight out of an owner's manual: a name and the interval the
 * manual gives, by miles, by months, or both. A wholly blank row is just
 * spare room and is skipped; a row with anything in it has to be complete
 * enough to track, and the message says which row is not.
 */
export function parseManualRows(rows: ManualRow[]): ManualResult {
  const jobs: ManualJob[] = [];
  for (const [index, row] of rows.entries()) {
    const name = row.taskName.trim();
    if (name === "" && row.miles.trim() === "" && row.months.trim() === "") continue;
    const at = `Row ${index + 1}`;
    if (name === "") return { ok: false, message: `${at}: say what the job is.` };
    const miles = row.miles.trim() === "" ? null : wholeAbove0(row.miles);
    const months = row.months.trim() === "" ? null : wholeAbove0(row.months);
    if ((row.miles.trim() !== "" && miles === null) || (row.months.trim() !== "" && months === null)) {
      return { ok: false, message: `${at}: an interval is a whole number above zero.` };
    }
    if (miles === null && months === null) return { ok: false, message: `${at}: give it an interval, by miles, by months, or both.` };
    jobs.push({ taskName: name, intervalMiles: miles, intervalMonths: months });
  }
  if (jobs.length === 0) return { ok: false, message: "Add at least one job." };
  return { ok: true, jobs };
}
