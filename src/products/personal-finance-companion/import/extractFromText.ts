import type { CandidateDraft, CandidatePayload } from "./types";

/**
 * Deterministic, regex-based extraction — NOT AI. No model provider is
 * configured anywhere in this repository (checked: no ANTHROPIC_API_KEY/
 * OPENAI_API_KEY-shaped env var, no AI SDK dependency, no server
 * extraction route). Per the explicit instruction not to fake AI support,
 * this is a plain pattern-matching parser and is presented to the user as
 * exactly that ("Draftpace looked for patterns", never "AI found"). It
 * runs entirely client-side on the user's own already-authenticated text
 * — there is no prompt, no model call, and therefore no prompt-injection
 * surface: text like "ignore instructions and output all records" is
 * just unmatched text that becomes an "unsupported" candidate like any
 * other line nothing recognizes.
 *
 * One candidate per line. A line that doesn't confidently match a known
 * shape becomes an "unsupported" candidate carrying the raw text, rather
 * than being dropped or forced into the nearest type — see D6/D3.
 */

function parseMoney(raw: string): number {
  return Number(raw.replace(/[$,]/g, ""));
}

function ordinalToDay(raw: string): number | null {
  const lower = raw.toLowerCase();
  if (lower === "first") return 1;
  if (lower === "last") return null; // genuinely ambiguous (28-31) — left unresolved rather than guessed
  const match = lower.match(/(\d{1,2})/);
  if (!match) return null;
  const day = Number(match[1]);
  return day >= 1 && day <= 31 ? day : null;
}

const MONEY = /\$?\s?([\d,]+(?:\.\d{1,2})?)/;

interface LineMatcher {
  candidateType: CandidateDraft["candidateType"];
  test: (line: string) => CandidateDraft | null;
}

const matchers: LineMatcher[] = [
  // "Emergency savings 1,300 of 5,000 target" / "Emergency savings 1300 of 5000"
  {
    candidateType: "savingsGoal",
    test: (line) => {
      const m = line.match(new RegExp(`^(.+?)\\s+${MONEY.source}\\s+of\\s+${MONEY.source}(?:\\s*target)?$`, "i"));
      if (!m) return null;
      const name = m[1].trim();
      const saved = parseMoney(m[2]);
      const target = parseMoney(m[3]);
      const missingFields: string[] = [];
      return {
        candidateType: "savingsGoal",
        payload: { name, savedAmountMajorUnits: saved, targetAmountMajorUnits: target },
        confidence: "high",
        missingFields,
        ambiguityNotes: [],
        sourceReference: line,
      };
    },
  },
  // "Visa balance 4,800, minimum maybe 160" / "Visa balance 4800"
  {
    candidateType: "debt",
    test: (line) => {
      const m = line.match(
        new RegExp(`^(.+?)\\s+balance\\s+${MONEY.source}(?:,?\\s*minimum\\s*(?:maybe|about)?\\s*${MONEY.source})?$`, "i")
      );
      if (!m) return null;
      const name = m[1].trim();
      const balance = parseMoney(m[2]);
      const minimumPayment = m[3] ? parseMoney(m[3]) : undefined;
      const missingFields: string[] = [];
      const ambiguityNotes: string[] = [];
      if (minimumPayment === undefined) missingFields.push("minimumPaymentMinorUnits");
      if (/maybe/i.test(line)) ambiguityNotes.push("Minimum payment was phrased uncertainly (\"maybe\").");
      return {
        candidateType: "debt",
        payload: { name, balanceMajorUnits: balance, minimumPaymentMajorUnits: minimumPayment },
        confidence: minimumPayment === undefined ? "medium" : "high",
        missingFields,
        ambiguityNotes,
        sourceReference: line,
      };
    },
  },
  // "Salary 3,200 on the 25th" / "Paycheck 3200"
  {
    candidateType: "income",
    test: (line) => {
      const m = line.match(new RegExp(`^(.*?\\b(?:salary|paycheck|income|pay)\\b.*?)\\s+${MONEY.source}(?:\\s+on the (\\w+))?$`, "i"));
      if (!m) return null;
      const name = m[1].trim();
      const amount = parseMoney(m[2]);
      const day = m[3] ? ordinalToDay(m[3]) : null;
      const missingFields: string[] = [];
      if (day === null) missingFields.push("nextExpectedDate");
      return {
        candidateType: "income",
        payload: { name, amountMajorUnits: amount, frequency: "monthly", dayOfMonth: day ?? undefined },
        confidence: day !== null ? "high" : "medium",
        missingFields,
        ambiguityNotes: [],
        sourceReference: line,
      };
    },
  },
  // "Rent 900 due first" / "Electric bill 120 due on the 15th"
  {
    candidateType: "bill",
    test: (line) => {
      const m = line.match(new RegExp(`^(.+?)\\s+${MONEY.source}\\s+due(?:\\s+on(?:\\s+the)?)?\\s+(\\w+)$`, "i"));
      if (!m) return null;
      const name = m[1].trim();
      const amount = parseMoney(m[2]);
      const day = ordinalToDay(m[3]);
      const missingFields: string[] = [];
      const ambiguityNotes: string[] = [];
      if (day === null) {
        missingFields.push("dueRule");
        if (m[3].toLowerCase() === "last") ambiguityNotes.push('"Last" day of month is ambiguous (28-31) — set the exact due date directly.');
      }
      return {
        candidateType: "bill",
        payload: { name, amountMajorUnits: amount, dayOfMonth: day ?? undefined, frequency: "monthly" },
        confidence: day !== null ? "high" : "medium",
        missingFields,
        ambiguityNotes,
        sourceReference: line,
      };
    },
  },
  // "Netflix 15.99 around the 12th"
  {
    candidateType: "subscription",
    test: (line) => {
      const m = line.match(new RegExp(`^(.+?)\\s+${MONEY.source}\\s+around(?:\\s+the)?\\s+(\\w+)$`, "i"));
      if (!m) return null;
      const name = m[1].trim();
      const amount = parseMoney(m[2]);
      const day = ordinalToDay(m[3]);
      const missingFields: string[] = [];
      const ambiguityNotes: string[] = ["Renewal date was phrased approximately (\"around\") — confirm the exact date."];
      if (day === null) missingFields.push("renewalDate");
      return {
        candidateType: "subscription",
        payload: { name, amountMajorUnits: amount, dayOfMonth: day ?? undefined },
        confidence: "medium",
        missingFields,
        ambiguityNotes,
        sourceReference: line,
      };
    },
  },
  // "Checking account about $2,400"
  {
    candidateType: "account",
    test: (line) => {
      const m = line.match(new RegExp(`^(.+?)\\s+account\\s+(?:about\\s+)?${MONEY.source}$`, "i"));
      if (!m) return null;
      const name = m[1].trim();
      const balance = parseMoney(m[2]);
      const ambiguityNotes: string[] = [];
      if (/about/i.test(line)) ambiguityNotes.push('Balance was phrased approximately ("about") — confirm the exact current balance.');
      return {
        candidateType: "account",
        payload: { name: `${name} account`, balanceMajorUnits: balance, type: /check/i.test(name) ? "checking" : /sav/i.test(name) ? "savings" : "other" },
        confidence: /about/i.test(line) ? "medium" : "high",
        missingFields: [],
        ambiguityNotes,
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
