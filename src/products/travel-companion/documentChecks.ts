import type { Person, TravelDocument, Trip } from "./trip";

/**
 * Where a document's expiry date falls against the trip, as a fact.
 *
 * This compares two dates the person recorded, and says which comes first.
 * It does not say what any country requires. Entry rules differ by country
 * and change, so a rule stated here would be wrong for somebody and look
 * current, which is exactly what a document registry must never do. The
 * screen says so, and points at the guide, where what each traveller needs
 * is kept up to date and dated.
 *
 * Three cases and no more: before the trip starts, during it, and shortly
 * after it ends (within about six months, stated as how long after, not as
 * a threshold anyone has to meet). Anything further out says nothing.
 */

export type ExpiryFlag = "before-trip" | "during-trip" | "shortly-after";

export interface DocumentCheck {
  documentId: string;
  label: string;
  personName: string | null;
  expiresOn: string;
  flag: ExpiryFlag;
  /** One plain sentence, ready to show. */
  line: string;
}

/** How far past the trip's last day an expiry is still worth mentioning. */
export const SHORTLY_AFTER_DAYS = 183;

const DAY_MS = 24 * 60 * 60 * 1000;
const day = (value: string): number => Date.parse(`${value.slice(0, 10)}T00:00:00Z`);
const isDate = (value: string | null | undefined): value is string => Boolean(value) && /^\d{4}-\d{2}-\d{2}/.test(value as string);

export function formatDate(value: string): string {
  return new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function howLongAfter(days: number): string {
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  const months = Math.round(days / 30);
  return `${months} months`;
}

const ORDER: Record<ExpiryFlag, number> = { "before-trip": 0, "during-trip": 1, "shortly-after": 2 };

export function checkDocuments(input: {
  documents: Pick<TravelDocument, "id" | "label" | "personId" | "expiresOn" | "status">[];
  people: Pick<Person, "id" | "name">[];
  trip: Pick<Trip, "startsAt" | "endsAt">;
}): DocumentCheck[] {
  const { trip } = input;
  if (!isDate(trip.startsAt) && !isDate(trip.endsAt)) return [];
  const start = day((isDate(trip.startsAt) ? trip.startsAt : trip.endsAt) as string);
  const end = day((isDate(trip.endsAt) ? trip.endsAt : trip.startsAt) as string);
  const names = new Map(input.people.map((person) => [person.id, person.name]));

  const checks: DocumentCheck[] = [];
  for (const document of input.documents) {
    if (document.status !== "active" || !isDate(document.expiresOn)) continue;
    const expires = day(document.expiresOn);
    const when = formatDate(document.expiresOn);
    let flag: ExpiryFlag | null = null;
    let line = "";
    if (expires < start) {
      flag = "before-trip";
      line = `Expires ${when}, before the trip starts.`;
    } else if (expires <= end) {
      flag = "during-trip";
      line = `Expires ${when}, during the trip.`;
    } else {
      const after = Math.round((expires - end) / DAY_MS);
      if (after <= SHORTLY_AFTER_DAYS) {
        flag = "shortly-after";
        line = `Expires ${when}, ${howLongAfter(after)} after the trip ends.`;
      }
    }
    if (!flag) continue;
    checks.push({
      documentId: document.id,
      label: document.label,
      personName: document.personId ? (names.get(document.personId) ?? null) : null,
      expiresOn: document.expiresOn.slice(0, 10),
      flag,
      line,
    });
  }
  return checks.sort((a, b) => ORDER[a.flag] - ORDER[b.flag] || a.expiresOn.localeCompare(b.expiresOn) || a.label.localeCompare(b.label));
}
