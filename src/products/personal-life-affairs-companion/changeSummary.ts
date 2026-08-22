import type { AffairItem } from "./lifeAffairs";

/**
 * The sentence History shows when a record changes.
 *
 * Pure, and in its own file, because it lives or dies on its wording and
 * the module it used to sit in imports the Supabase client, which made
 * it impossible to test without a database. It is the only place the
 * product says what actually changed, and "Updated" would turn History
 * into a log of software use rather than a record of somebody's life.
 *
 * The rule it follows: name the thing that moved, and where the old
 * value still means something to a person coming back years later, say
 * what it used to be.
 */

const CHANGE_LABEL: Record<string, string> = {
  label: "the name",
  whereabouts: "where it is kept",
  personName: "who it concerns",
  personContact: "how to reach them",
  notes: "the notes",
};

/**
 * The sentence History shows. Exported so it can be tested: it is the
 * only place the product says what actually changed, and "Updated" would
 * make History a log of software use rather than of somebody's life.
 */
export function describeChange(before: AffairItem, after: AffairItem): string {
  const changes: string[] = [];
  for (const key of ["label", "whereabouts", "personName", "personContact", "notes"] as const) {
    const from = before[key];
    const to = after[key];
    if (from === to) continue;
    if (from && to && key === "personName") changes.push(`changed ${CHANGE_LABEL[key]} from ${from} to ${to}`);
    else if (!from && to) changes.push(`added ${CHANGE_LABEL[key]}`);
    else if (from && !to) changes.push(`removed ${CHANGE_LABEL[key]}`);
    else changes.push(`changed ${CHANGE_LABEL[key]}`);
  }
  for (const key of Object.keys({ ...before.fields, ...after.fields })) {
    if (before.fields[key] !== after.fields[key]) changes.push(`changed ${key}`);
  }
  if (changes.length === 0) return `Reviewed ${after.label}.`;
  const sentence = changes.join(", ");
  return `${after.label}: ${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}
