import type { CandidateDraft, CandidatePayload } from "./types";

/**
 * Deterministic, regex-based extraction, Home Base's own parallel to
 * PFC's extractFromText.ts. NOT AI, for the identical reasons that file
 * documents: no model provider is configured anywhere in this repository,
 * this is plain pattern matching, and it is presented to the user as
 * exactly that ("Draftpace looked for patterns", never "AI found"). It
 * runs entirely client-side on the user's own already-authenticated text,
 * so there is no prompt-injection surface: an unmatched line just becomes
 * an "unsupported" candidate like any other.
 *
 * One candidate per line. A line that doesn't confidently match a known
 * shape becomes an "unsupported" candidate carrying the raw text, rather
 * than being dropped or forced into the nearest type.
 */

const CADENCE_UNIT_DAYS: Record<string, number> = {
  day: 1,
  days: 1,
  week: 7,
  weeks: 7,
  month: 30,
  months: 30,
  year: 365,
  years: 365,
};

const EMAIL = /^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i;

interface LineMatcher {
  candidateType: CandidateDraft["candidateType"];
  test: (line: string) => CandidateDraft | null;
}

const matchers: LineMatcher[] = [
  // "Joe's Plumbing - 555-123-4567" / "Ace HVAC, ace@hvac.com"
  {
    candidateType: "serviceProvider",
    test: (line) => {
      const m = line.match(/^(.+?)\s*[-,]\s*(.+)$/);
      if (!m) return null;
      const name = m[1].trim();
      const contact = m[2].trim();
      if (!name || !contact) return null;

      const isEmail = EMAIL.test(contact);
      const digitCount = (contact.match(/\d/g) ?? []).length;
      const isPhone = !isEmail && digitCount >= 7 && /^[\d\s().+-]+$/.test(contact);
      if (!isEmail && !isPhone) return null;

      return {
        candidateType: "serviceProvider",
        payload: { name, phone: isPhone ? contact : undefined, email: isEmail ? contact : undefined },
        confidence: "high",
        missingFields: [],
        ambiguityNotes: [],
        sourceReference: line,
      };
    },
  },
  // "Change furnace filter every 90 days" / "HVAC service every 6 months"
  {
    candidateType: "maintenanceTask",
    test: (line) => {
      const m = line.match(/^(.+?)\s+every\s+(\d+)\s*(day|days|week|weeks|month|months|year|years)$/i);
      if (!m) return null;
      const name = m[1].trim();
      const count = Number(m[2]);
      const unit = m[3].toLowerCase();
      const cadenceDays = count * CADENCE_UNIT_DAYS[unit];
      return {
        candidateType: "maintenanceTask",
        payload: { name, cadenceDays },
        confidence: "high",
        missingFields: [],
        ambiguityNotes: [],
        sourceReference: line,
      };
    },
  },
  // Checked before the plain "warranty until" matcher below: without this
  // order, "Water heater purchased 2023-01-15, warranty until 2026-01-15"
  // would match the plainer pattern first and swallow the purchase date
  // into the thing's name instead of its own field.
  // "Water heater purchased 2023-01-15, warranty until 2026-01-15" / "Water heater purchased 2023-01-15"
  {
    candidateType: "thing",
    test: (line) => {
      const m = line.match(/^(.+?)\s+purchased\s+(\d{4}-\d{2}-\d{2})(?:,?\s*warranty\s+(?:until|expires)\s+(\d{4}-\d{2}-\d{2}))?$/i);
      if (!m) return null;
      return {
        candidateType: "thing",
        payload: { name: m[1].trim(), purchaseDate: m[2], warrantyExpiresAt: m[3] ?? undefined },
        confidence: "high",
        missingFields: [],
        ambiguityNotes: [],
        sourceReference: line,
      };
    },
  },
  // "Refrigerator, warranty until 2027-03-01" / "Refrigerator warranty expires 2027-03-01"
  {
    candidateType: "thing",
    test: (line) => {
      const m = line.match(/^(.+?),?\s+warranty\s+(?:until|expires)\s+(\d{4}-\d{2}-\d{2})$/i);
      if (!m) return null;
      return {
        candidateType: "thing",
        payload: { name: m[1].trim(), warrantyExpiresAt: m[2] },
        confidence: "high",
        missingFields: [],
        ambiguityNotes: [],
        sourceReference: line,
      };
    },
  },
  // "Furnace installed 2021-09-10"
  {
    candidateType: "thing",
    test: (line) => {
      const m = line.match(/^(.+?)\s+installed\s+(\d{4}-\d{2}-\d{2})$/i);
      if (!m) return null;
      return {
        candidateType: "thing",
        payload: { name: m[1].trim(), installDate: m[2] },
        confidence: "high",
        missingFields: [],
        ambiguityNotes: [],
        sourceReference: line,
      };
    },
  },
];

/** Extracts one candidate draft per non-empty line. Never AI, never hides an unmatched line. */
export function extractCandidatesFromText(text: string): CandidateDraft[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const drafts: CandidateDraft[] = [];
  for (const line of lines) {
    let matched: CandidateDraft | null = null;
    for (const matcher of matchers) {
      matched = matcher.test(line);
      if (matched) break;
    }
    if (matched) {
      drafts.push(matched);
    } else {
      const payload: CandidatePayload = { rawText: line };
      drafts.push({
        candidateType: "unsupported",
        payload,
        confidence: "low",
        missingFields: [],
        ambiguityNotes: ["Draftpace didn't recognize a pattern in this line."],
        sourceReference: line,
      });
    }
  }
  return drafts;
}
