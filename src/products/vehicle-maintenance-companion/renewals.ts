import type { Renewal, RenewalKind, Vehicle } from "./state";

/**
 * Dates that belong to a vehicle rather than a job: registration,
 * insurance, an inspection, a warranty ending. The product records the date
 * and where the paper is kept, and does one thing with it: says plainly how
 * far away it is. It never states what any place requires, what a renewal
 * costs, or that anything is late in a legal sense.
 */

export const RENEWAL_INFO: Record<RenewalKind, { label: string; kept: string }> = {
  registration: { label: "Registration", kept: "Where the registration paper or card is" },
  insurance: { label: "Insurance", kept: "Where the policy paper or card is" },
  inspection: { label: "Inspection", kept: "Where the last inspection result is" },
  warranty: { label: "Warranty", kept: "Where the warranty paperwork is" },
  other: { label: "Other date", kept: "Where the paperwork is" },
};

/** A date this close, or already past, is shown on Due as well as here. */
export const RENEWAL_SOON_DAYS = 45;

export function renewalTitle(renewal: Pick<Renewal, "kind" | "label">): string {
  if (renewal.kind === "other") return renewal.label?.trim() || RENEWAL_INFO.other.label;
  return RENEWAL_INFO[renewal.kind].label;
}

const DAY_MS = 86_400_000;

function parseIso(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole calendar days from `todayIso` to `dueOn`. Negative once the date has passed. */
export function daysUntil(todayIso: string, dueOn: string): number {
  return Math.round((parseIso(dueOn) - parseIso(todayIso)) / DAY_MS);
}

export function describeRenewalTiming(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`;
}

export type RenewalState = "pastDate" | "soon" | "later";

export interface RenewalEntry {
  renewal: Renewal;
  vehicle: Vehicle;
  days: number;
  state: RenewalState;
}

export function evaluateRenewal(renewal: Renewal, vehicle: Vehicle, todayIso: string): RenewalEntry {
  const days = daysUntil(todayIso, renewal.dueOn);
  return { renewal, vehicle, days, state: days < 0 ? "pastDate" : days <= RENEWAL_SOON_DAYS ? "soon" : "later" };
}

export interface RenewalsView {
  /** The date has passed, most recent first. */
  pastDate: RenewalEntry[];
  /** Within RENEWAL_SOON_DAYS, soonest first. */
  soon: RenewalEntry[];
  later: RenewalEntry[];
}

/** Active renewals on active vehicles, sorted into what needs seeing now and what does not. */
export function deriveRenewalsView(vehicles: Vehicle[], renewals: Renewal[], todayIso: string): RenewalsView {
  const byId = new Map(vehicles.filter((v) => v.status === "active").map((v) => [v.id, v]));
  const entries: RenewalEntry[] = [];
  for (const renewal of renewals) {
    if (renewal.status !== "active") continue;
    const vehicle = byId.get(renewal.vehicleId);
    if (vehicle) entries.push(evaluateRenewal(renewal, vehicle, todayIso));
  }
  return {
    pastDate: entries.filter((e) => e.state === "pastDate").sort((a, b) => b.days - a.days),
    soon: entries.filter((e) => e.state === "soon").sort((a, b) => a.days - b.days),
    later: entries.filter((e) => e.state === "later").sort((a, b) => a.days - b.days),
  };
}
