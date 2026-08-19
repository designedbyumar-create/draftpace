import type {
  ApplianceCandidatePayload,
  ExtractionCandidate,
  MaintenanceTaskCandidatePayload,
  ServiceProviderCandidatePayload,
  UnsupportedCandidatePayload,
} from "./types";

/**
 * Human-language rendering for a candidate card, Home Base's own parallel
 * to PFC's candidateSummary.ts. Never a raw JSON dump. One function per
 * type, all pure and testable.
 */

export const CANDIDATE_TYPE_LABEL: Record<ExtractionCandidate["candidateType"], string> = {
  appliance: "appliance",
  maintenanceTask: "maintenance task",
  serviceProvider: "service provider",
  unsupported: "unrecognized entry",
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
    case "appliance": {
      const p = candidate.payload as ApplianceCandidatePayload;
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
    case "unsupported": {
      const p = candidate.payload as UnsupportedCandidatePayload;
      return { title: "Not recognized", lines: [p.rawText] };
    }
  }
}
