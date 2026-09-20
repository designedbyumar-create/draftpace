import type { HomeItem, MaintenanceTask } from "./state";
import { careTemplateFor, nextDueIsoFor } from "./attention";

/**
 * Seasons: the same care jobs as Home, read as a calendar instead of a
 * ranking. Home answers "what needs me today"; this answers "what is
 * coming this season, and what can I get ahead of".
 *
 * Nothing here is stored or invented. A job is placed by the date the
 * app already works out for it (nextDueIsoFor, the rule Home uses), so
 * Seasons and Home can never disagree about when something is due.
 *
 * Seasons are the northern hemisphere's, the same assumption the care
 * templates make when they say a job belongs in October. There is no
 * region in the product yet; when there is, this is where it goes.
 */

export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export const SEASON_ORDER: SeasonId[] = ["spring", "summer", "autumn", "winter"];

/** Calendar months, 1 to 12. Winter is the one that crosses the new year. */
const SEASON_MONTHS: Record<SeasonId, number[]> = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10, 11],
  winter: [12, 1, 2],
};

const SEASON_LABEL: Record<SeasonId, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Fall",
  winter: "Winter",
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface SeasonJob {
  /** The task this job is, so the person can record it. */
  taskId: string;
  title: string;
  /** What it is for, in the person's own words. */
  about: string;
  /** The month it belongs under, as a name. */
  monthLabel: string;
  /** Sortable, "2026-10". */
  monthKey: string;
  /** When it comes round, ISO date. */
  dueIso: string;
  /** True for a seasonal job whose month has already come. It stays in this season until it is done. */
  dueNow: boolean;
}

export interface SeasonSummary {
  id: SeasonId;
  label: string;
  /** "September to November". */
  span: string;
  jobs: SeasonJob[];
}

export interface SeasonsInputs {
  homeItems: HomeItem[];
  maintenanceTasks: MaintenanceTask[];
}

export function seasonOfMonth(month: number): SeasonId {
  for (const id of SEASON_ORDER) if (SEASON_MONTHS[id].includes(month)) return id;
  return "winter";
}

export function seasonSpan(id: SeasonId): string {
  const months = SEASON_MONTHS[id];
  return `${MONTH_NAMES[months[0] - 1]} to ${MONTH_NAMES[months[months.length - 1] - 1]}`;
}

function isoOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * The stretch of calendar a season means right now: this one if it is
 * under way (from today to its last day), otherwise the next time round.
 */
function windowFor(id: SeasonId, now: Date): { start: string; end: string } {
  const today = isoOf(now);
  const months = SEASON_MONTHS[id];
  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];
  const thisYear = now.getUTCFullYear();

  for (const startYear of [thisYear - 1, thisYear, thisYear + 1]) {
    const start = isoOf(new Date(Date.UTC(startYear, firstMonth - 1, 1)));
    const endYear = lastMonth < firstMonth ? startYear + 1 : startYear;
    const end = isoOf(new Date(Date.UTC(endYear, lastMonth, 0)));
    if (end >= today) return { start: start < today ? today : start, end };
  }
  return { start: today, end: today };
}

export function currentSeasonId(now: Date): SeasonId {
  return seasonOfMonth(now.getUTCMonth() + 1);
}

export function deriveSeasons(inputs: SeasonsInputs, now: Date = new Date()): SeasonSummary[] {
  const today = isoOf(now);
  const current = currentSeasonId(now);
  const itemsById = new Map(inputs.homeItems.map((item) => [item.id, item]));
  const windows = new Map(SEASON_ORDER.map((id) => [id, windowFor(id, now)]));
  const buckets = new Map<SeasonId, SeasonJob[]>(SEASON_ORDER.map((id) => [id, []]));

  for (const task of inputs.maintenanceTasks) {
    if (task.status === "archived") continue;
    const template = careTemplateFor(task);
    const seasonal = Boolean(template?.months?.length);
    // A job that has never been logged and is not tied to a month is due
    // now, not "in" any season. It belongs on Home.
    if (!seasonal && !task.lastDoneAt) continue;

    const dueIso = nextDueIsoFor(task, template);
    const dueNow = seasonal && dueIso <= today;
    const item = task.applianceId ? itemsById.get(task.applianceId) : undefined;
    const about = item ? [item.name, item.location].filter(Boolean).join(", ") : "Around the house";

    for (const id of SEASON_ORDER) {
      const window = windows.get(id)!;
      const inWindow = dueIso >= window.start && dueIso <= window.end;
      // A seasonal job already overdue stays in the season it belongs to
      // (the current one) until somebody does it. A routine job that is
      // overdue is Home's to show, not a season's.
      if (!(inWindow || (id === current && dueNow))) continue;

      const placedOn = dueNow ? today : dueIso;
      const month = Number(placedOn.slice(5, 7));
      buckets.get(id)!.push({
        taskId: task.id,
        title: task.name,
        about,
        monthLabel: MONTH_NAMES[month - 1],
        monthKey: placedOn.slice(0, 7),
        dueIso,
        dueNow,
      });
    }
  }

  return SEASON_ORDER.map((id) => ({
    id,
    label: SEASON_LABEL[id],
    span: seasonSpan(id),
    jobs: (buckets.get(id) ?? []).sort((a, b) => a.monthKey.localeCompare(b.monthKey) || a.dueIso.localeCompare(b.dueIso) || a.title.localeCompare(b.title)),
  }));
}
