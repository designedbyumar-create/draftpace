/**
 * Studio's own state: reviews, the schedule and render history. In local
 * mode it is one JSON file (studio/.data/state.json, gitignored), written
 * atomically. Hosted Studio moves these to Supabase with the same shapes
 * (studio/supabase/schema.sql), so pages never change when it does.
 */
import fs from "node:fs";
import path from "node:path";
import type { PlatformId } from "@engine/director/platforms";

export type ReviewStatus = "approved" | "changes" | "rejected";
export type Review = { status: ReviewStatus; note: string; at: string };

export type ScheduleItem = {
  id: string;
  filmId: string;
  platform: PlatformId;
  /** YYYY-MM-DD, the day it goes out. */
  date: string;
  /** HH:MM local, optional. */
  time: string;
  caption: string;
  link: string;
  status: "scheduled" | "posted";
  createdAt: string;
};

export type JobRecord = {
  id: string;
  filmId: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "done" | "failed";
  progress: number;
  message: string;
};

export type StudioState = {
  reviews: Record<string, Review>;
  schedule: ScheduleItem[];
  jobs: JobRecord[];
};

const EMPTY: StudioState = { reviews: {}, schedule: [], jobs: [] };

export function stateFile(): string {
  return process.env.STUDIO_DATA_FILE ?? path.join(process.cwd(), process.cwd().endsWith("studio") ? "" : "studio", ".data", "state.json");
}

export function readState(): StudioState {
  try {
    const raw = JSON.parse(fs.readFileSync(stateFile(), "utf8")) as Partial<StudioState>;
    return { ...EMPTY, ...raw, reviews: raw.reviews ?? {}, schedule: raw.schedule ?? [], jobs: raw.jobs ?? [] };
  } catch {
    return structuredClone(EMPTY);
  }
}

export function writeState(next: StudioState) {
  const file = stateFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2));
  fs.renameSync(tmp, file);
}

export function update(fn: (s: StudioState) => void): StudioState {
  const s = readState();
  fn(s);
  writeState(s);
  return s;
}

export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
