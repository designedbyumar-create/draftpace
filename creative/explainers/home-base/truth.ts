/**
 * What the Home Base explainer shows, computed by Home Base's own code.
 *
 * Six real care jobs from homeKnowledge.ts, set up the way a person
 * would have them (each done last season), are run through the real
 * deriveAttentionItems on the dates the film visits. The rack in the
 * film is that function's answer, in its order; a token's height is the
 * score the function ranks by, worked out from the same factors; and the
 * line under each job is the product's own detail line. Nothing here is
 * typed by hand except which jobs, and when the person did them.
 */
import { HOME_ITEM_TYPES, findCareTemplate, type CareTemplate } from "@/products/home-management-companion/homeKnowledge";
import { deriveAttentionItems, scoreAttentionUrgency, HOME_BAND_LIMIT, type AttentionItem } from "@/products/home-management-companion/attention";
import type { MaintenanceTask } from "@/products/home-management-companion/state";

/** The jobs, in the drum's lanes from left to right. */
export const JOB_IDS = ["chimney.sweep", "furnace.tune-up", "irrigation.blowout", "hose-bib.winterize", "humidifier.pad", "gutter.clean"] as const;
export type JobId = (typeof JOB_IDS)[number];

/** When each job was last done before the film starts: last season, so each comes due in its month. */
const LAST_DONE: Record<JobId, string> = {
  "chimney.sweep": "2025-09-20",
  "furnace.tune-up": "2025-10-04",
  "irrigation.blowout": "2025-10-12",
  "hose-bib.winterize": "2025-11-08",
  "humidifier.pad": "2025-10-18",
  "gutter.clean": "2026-04-25",
};

/** What the person does during the film, and when. */
export const DONE_IN_FILM: { date: string; jobs: JobId[] }[] = [
  { date: "2026-10-20", jobs: ["chimney.sweep", "irrigation.blowout"] },
  { date: "2026-11-14", jobs: ["hose-bib.winterize", "furnace.tune-up", "gutter.clean", "humidifier.pad"] },
];

/** The days the film stops on and asks Home what needs doing. */
export const VISITS = ["2026-09-02", "2026-10-02", "2026-10-21", "2026-11-02", "2026-12-01"] as const;

export type Job = { id: JobId; lane: number; item: string; task: string; months: number[]; consequence: number; effort: number; intervalDays: number };
export type Shown = { id: JobId; score: number; urgency: AttentionItem["urgency"]; title: string; detail: string };
export type Visit = { date: string; month: number; due: Shown[]; onHome: Shown[]; behindShowAll: Shown[] };

function job(id: JobId, lane: number): Job {
  const template = findCareTemplate(id) as CareTemplate | null;
  const type = HOME_ITEM_TYPES.find((t) => t.care.some((c) => c.id === id));
  if (!template || !type) throw new Error(`no care template ${id} in homeKnowledge.ts`);
  return { id, lane, item: type.label, task: template.taskName, months: template.months ?? [], consequence: template.consequence, effort: template.effort, intervalDays: template.intervalDays };
}

function taskFor(j: Job, lastDoneAt: string): MaintenanceTask {
  return {
    id: j.id, applianceId: null, name: j.task, cadenceDays: j.intervalDays, lastDoneAt, documentLink: null, notes: null, snoozedUntil: null,
    careTemplateId: j.id, status: "active", needsReviewReason: null, source: "manual", importSessionId: null, createdAt: "2025-01-10T00:00:00Z", updatedAt: "2025-01-10T00:00:00Z",
  } as MaintenanceTask;
}

/** The score deriveAttentionItems ranks by: consequence × 2.5 + intervals late (at most 2) − effort × 0.5. Maintenance carries no cost. */
function scoreOf(j: Job, item: AttentionItem, now: Date, due: string): number {
  const days = Math.round((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.parse(`${due}T00:00:00Z`)) / 86_400_000);
  const late = Math.min(Math.max(days / j.intervalDays, 0), 2);
  const score = j.consequence * 2.5 + late - j.effort * 0.5;
  // The urgency the product gave this row must be the one this score gives, or the token would be lying.
  const urgency = scoreAttentionUrgency({ intervalsLate: late, consequence: j.consequence as 0 | 1 | 2, effort: j.effort as 0 | 1 | 2, cost: 0 });
  if (urgency !== item.urgency) throw new Error(`${j.id}: score ${score} gives ${urgency}, Home said ${item.urgency}`);
  return score;
}

function lastDoneOn(date: string): Record<JobId, string> {
  const out = { ...LAST_DONE };
  for (const d of DONE_IN_FILM) if (d.date < date) for (const id of d.jobs) out[id] = d.date;
  return out;
}

export function homeBaseTruth() {
  const jobs = JOB_IDS.map(job);
  const byId = new Map(jobs.map((j) => [j.id, j]));
  const visits: Visit[] = VISITS.map((date) => {
    const now = new Date(`${date}T09:00:00Z`);
    const done = lastDoneOn(date);
    const tasks = jobs.map((j) => taskFor(j, done[j.id]));
    const items = deriveAttentionItems({ homeItems: [], maintenanceTasks: tasks, problems: [] }, now);
    const due: Shown[] = items.map((item) => {
      const j = byId.get(item.entityId as JobId)!;
      const dueIso = dueDate(j, done[j.id]);
      return { id: j.id, score: Math.round(scoreOf(j, item, now, dueIso) * 100) / 100, urgency: item.urgency, title: item.title, detail: item.detail };
    });
    for (let i = 1; i < due.length; i++) if (due[i].score > due[i - 1].score) throw new Error(`${date}: Home's order is not by score`);
    return { date, month: now.getUTCMonth() + 1, due, onHome: due.slice(0, HOME_BAND_LIMIT), behindShowAll: due.slice(HOME_BAND_LIMIT) };
  });
  // When each job first comes due in the film: the date its token rises.
  const due = Object.fromEntries(jobs.map((j) => [j.id, dueDate(j, LAST_DONE[j.id])])) as Record<JobId, string>;
  return { jobs, visits, due, bandLimit: HOME_BAND_LIMIT, doneInFilm: DONE_IN_FILM };
}

/** The first of the first listed month after the last time it was done: nextSeasonalDueIso's rule, for the score's lateness. */
function dueDate(j: Job, lastDoneAt: string): string {
  const anchor = new Date(`${lastDoneAt}T00:00:00Z`);
  for (let ahead = 0; ahead <= 24; ahead++) {
    const c = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + ahead, 1));
    if (c.getTime() > anchor.getTime() && j.months.includes(c.getUTCMonth() + 1)) return c.toISOString().slice(0, 10);
  }
  return lastDoneAt;
}
