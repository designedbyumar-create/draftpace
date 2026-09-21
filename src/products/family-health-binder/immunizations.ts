import { usDate } from "./dates";
import type { Immunization } from "./state";

/**
 * Common US vaccine names, so a person can pick one instead of typing it.
 * Names only. Nothing here says which vaccines a person needs or when: those
 * schedules change and differ by state, school and doctor, and this product
 * does not know them. A person can always type a name that is not on the list.
 */
export const VACCINE_NAMES = [
  "DTaP",
  "Tdap",
  "Td",
  "Hepatitis A",
  "Hepatitis B",
  "Hib",
  "Polio (IPV)",
  "Pneumococcal (PCV)",
  "Rotavirus",
  "MMR",
  "Varicella (chickenpox)",
  "Influenza (flu)",
  "COVID-19",
  "HPV",
  "Meningococcal (MenACWY)",
  "Meningococcal B",
  "RSV",
  "Shingles",
] as const;

export interface ImmunizationGroup {
  vaccine: string;
  /** Dates given, oldest first, as typed. */
  dates: string[];
  records: Immunization[];
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** One group per vaccine, so a series of doses reads as one line. Sorted by the first dose. Archived records are left out. */
export function groupImmunizations(list: Immunization[], memberId: string, opts: { summaryOnly?: boolean } = {}): ImmunizationGroup[] {
  const groups: ImmunizationGroup[] = [];
  const mine = list
    .filter((i) => i.familyMemberId === memberId && i.status === "active" && (!opts.summaryOnly || i.visibility === "summary"))
    .sort((a, b) => (a.givenOn < b.givenOn ? -1 : a.givenOn > b.givenOn ? 1 : 0));
  for (const record of mine) {
    const group = groups.find((g) => same(g.vaccine, record.vaccine));
    if (group) {
      group.dates.push(record.givenOn);
      group.records.push(record);
    } else {
      groups.push({ vaccine: record.vaccine.trim(), dates: [record.givenOn], records: [record] });
    }
  }
  return groups.sort((a, b) => (a.dates[0] < b.dates[0] ? -1 : a.dates[0] > b.dates[0] ? 1 : 0));
}

/** "MMR" and "05/01/2019, 06/02/2023", for a printed line. */
export function immunizationLine(group: ImmunizationGroup): { label: string; detail: string } {
  return { label: group.vaccine, detail: group.dates.map(usDate).join(", ") };
}
