import type { DuplicateStatus } from "./types";

/**
 * Conservative, deterministic duplicate detection (launch spec D9) — never
 * auto-merges. Compares a candidate's name and amount against a caller-
 * supplied list of the user's existing live records of the matching type
 * (the caller is responsible for choosing the right list per
 * candidate_type; this function has no database access of its own).
 */

export interface ComparableRecord {
  id: string;
  name: string;
  amountMajorUnits: number | null;
}

export interface DuplicateMatch {
  status: Exclude<DuplicateStatus, "none" | "transferPair" | "refundMatch">;
  existingRecordId: string;
  existingRecordName: string;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const AMOUNT_TOLERANCE_MAJOR_UNITS = 0.01;

/** Null when no existing record shares a normalized name with the candidate. */
export function detectDuplicate(candidateName: string, candidateAmountMajorUnits: number | null, existing: ComparableRecord[]): DuplicateMatch | null {
  const normalizedCandidate = normalizeName(candidateName);
  const nameMatch = existing.find((record) => normalizeName(record.name) === normalizedCandidate);
  if (!nameMatch) return null;

  if (candidateAmountMajorUnits === null || nameMatch.amountMajorUnits === null) {
    return { status: "likelyDuplicate", existingRecordId: nameMatch.id, existingRecordName: nameMatch.name };
  }

  const amountsMatch = Math.abs(candidateAmountMajorUnits - nameMatch.amountMajorUnits) <= AMOUNT_TOLERANCE_MAJOR_UNITS;
  if (amountsMatch) {
    return { status: "exactDuplicate", existingRecordId: nameMatch.id, existingRecordName: nameMatch.name };
  }
  return { status: "possibleDuplicate", existingRecordId: nameMatch.id, existingRecordName: nameMatch.name };
}
