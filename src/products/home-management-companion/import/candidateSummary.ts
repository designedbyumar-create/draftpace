import { describeElapsed, daysBetween } from "../homeVoice";
import type {
  ThingCandidatePayload,
  ExtractionCandidate,
  MaintenanceTaskCandidatePayload,
  ServiceProviderCandidatePayload,
  ProblemCandidatePayload,
  PastEventCandidatePayload,
  UnsupportedCandidatePayload,
} from "./types";

/**
 * Human-language rendering for a candidate card, Home Base's own parallel
 * to PFC's candidateSummary.ts. Never a raw JSON dump. One function per
 * type, all pure and testable.
 */

/**
 * What each kind is called in front of a person. Written as the thing
 * itself rather than as a record type, so a card reads "Add to your
 * home" rather than "Confirm thing".
 */
export const CANDIDATE_TYPE_LABEL: Record<ExtractionCandidate["candidateType"], string> = {
  thing: "something in your home",
  maintenanceTask: "a bit of upkeep",
  serviceProvider: "someone you use",
  problem: "something wrong",
  pastEvent: "something already done",
  unsupported: "not sure",
};

/** Reads naturally after a number, e.g. "2 things", "1 person". */
const CANDIDATE_COUNT_NOUN: Record<ExtractionCandidate["candidateType"], [string, string]> = {
  thing: ["thing", "things"],
  maintenanceTask: ["job", "jobs"],
  serviceProvider: ["person", "people"],
  problem: ["problem", "problems"],
  pastEvent: ["already done", "already done"],
  unsupported: ["unsure", "unsure"],
};

export function describeCandidateCount(type: ExtractionCandidate["candidateType"], count: number): string {
  const [one, many] = CANDIDATE_COUNT_NOUN[type];
  return `${count} ${count === 1 ? one : many}`;
}

/** The verb on a card's confirm button, so it says what will happen rather than "Confirm". */
export const CANDIDATE_CONFIRM_LABEL: Record<ExtractionCandidate["candidateType"], string> = {
  thing: "Add to your home",
  maintenanceTask: "Add this upkeep",
  serviceProvider: "Save this person",
  problem: "Log this problem",
  pastEvent: "Add to history",
  unsupported: "Keep as a note",
};

function cadenceLabel(days: number): string {
  if (days % 365 === 0) {
    const years = days / 365;
    return `Every ${years} ${years === 1 ? "year" : "years"}`;
  }
  if (days % 30 === 0) {
    const months = days / 30;
    return `Every ${months} ${months === 1 ? "month" : "months"}`;
  }
  return `Every ${days} ${days === 1 ? "day" : "days"}`;
}

export interface CandidateSummaryLine {
  title: string;
  lines: string[];
}

export function summarizeCandidate(candidate: ExtractionCandidate): CandidateSummaryLine {
  switch (candidate.candidateType) {
    case "thing": {
      const p = candidate.payload as ThingCandidatePayload;
      const lines: string[] = [];
      lines.push(p.warrantyExpiresAt ? `Warranty expires ${p.warrantyExpiresAt}` : "No warranty date found");
      if (p.purchaseDate) lines.push(`Purchased ${p.purchaseDate}`);
      if (p.brand) lines.push(p.brand);
      return { title: p.name, lines };
    }
    case "maintenanceTask": {
      const p = candidate.payload as MaintenanceTaskCandidatePayload;
      return {
        title: p.name,
        lines: [p.cadenceDays !== undefined ? cadenceLabel(p.cadenceDays) : "No repeat schedule found"],
      };
    }
    case "serviceProvider": {
      const p = candidate.payload as ServiceProviderCandidatePayload;
      const lines: string[] = [];
      if (p.phone) lines.push(p.phone);
      if (p.email) lines.push(p.email);
      if (lines.length === 0) lines.push("No phone or email found");
      return { title: p.name, lines };
    }
    case "problem": {
      const p = candidate.payload as ProblemCandidatePayload;
      const severity = p.severity === "urgent" ? "Sounds urgent" : p.severity === "minor" ? "Sounds minor" : "Worth sorting";
      return { title: p.title, lines: [severity] };
    }
    case "pastEvent": {
      const p = candidate.payload as PastEventCandidatePayload;
      const lines = [describeElapsed(daysBetween(p.performedAt, new Date()))];
      if (p.providerName) lines.push(`by ${p.providerName}`);
      return { title: p.description, lines };
    }
    case "unsupported": {
      const p = candidate.payload as UnsupportedCandidatePayload;
      // Never "Not recognized". The line is shown as what it is, the
      // person's own words. The card's own note explains the rest, so
      // there is nothing to add here.
      return { title: p.rawText, lines: [] };
    }
  }
}
