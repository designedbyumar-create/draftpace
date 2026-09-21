import { describeDay } from "./dates";
import type { Visit } from "./state";

export interface SplitVisits {
  /** Today and later, soonest first. */
  upcoming: Visit[];
  /** Before today, most recent first. */
  past: Visit[];
}

export function splitVisits(visits: Visit[], memberId: string | null, today: string): SplitVisits {
  const mine = visits.filter((v) => v.status === "active" && (memberId === null || v.familyMemberId === memberId));
  return {
    upcoming: mine.filter((v) => v.visitOn >= today).sort((a, b) => (a.visitOn < b.visitOn ? -1 : 1)),
    past: mine.filter((v) => v.visitOn < today).sort((a, b) => (a.visitOn < b.visitOn ? 1 : -1)),
  };
}

/** The next visit for one person, or null. */
export function nextVisit(visits: Visit[], memberId: string, today: string): Visit | null {
  return splitVisits(visits, memberId, today).upcoming[0] ?? null;
}

/** One question per non-empty line, trimmed. */
export function parseQuestions(text: string | null): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/** "Yearly checkup with Dr. Patel", or just the reason. */
export function describeVisit(visit: Visit): string {
  return visit.withWhom ? `${visit.reason} with ${visit.withWhom}` : visit.reason;
}

export function describeVisitTiming(visit: Visit, today: string): string {
  return describeDay(visit.visitOn, today);
}
