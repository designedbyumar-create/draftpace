/**
 * Conservative, deterministic duplicate detection, Home Base's own
 * parallel to PFC's duplicateDetection.ts. Never auto-merges. Home Base's
 * three record types have no shared "amount" field the way PFC's do, so
 * this compares by normalized name alone against a caller-supplied list of
 * the user's existing live records of the matching type (the caller picks
 * the right list per candidate type; this function has no database access
 * of its own).
 */

export interface ComparableRecord {
  id: string;
  name: string;
}

export interface DuplicateMatch {
  existingRecordId: string;
  existingRecordName: string;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Null when no existing record shares a normalized name with the candidate. */
export function detectDuplicateByName(candidateName: string, existing: ComparableRecord[]): DuplicateMatch | null {
  const normalizedCandidate = normalizeName(candidateName);
  const match = existing.find((record) => normalizeName(record.name) === normalizedCandidate);
  if (!match) return null;
  return { existingRecordId: match.id, existingRecordName: match.name };
}
