/**
 * Render jobs. Local mode runs the engine's own renderer
 * (creative/scripts/render-direct.mjs) as a child process, one film at a
 * time, and reads its progress lines ("rendered 300/895"). Hosted Studio
 * swaps this for a render worker with the same JobRecord shape.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { CREATIVE_DIR } from "@engine/director/write";
import { update, readState, newId, type JobRecord } from "./store";

type Running = { record: JobRecord; total: number };
const g = globalThis as unknown as { __studioJobs?: { running: Running | null; queue: string[] } };
const jobs = (g.__studioJobs ??= { running: null, queue: [] });

function save(record: JobRecord) {
  update((s) => {
    const i = s.jobs.findIndex((j) => j.id === record.id);
    if (i >= 0) s.jobs[i] = record;
    else s.jobs.unshift(record);
    s.jobs = s.jobs.slice(0, 200);
  });
}

function next() {
  if (jobs.running || !jobs.queue.length) return;
  const filmId = jobs.queue.shift()!;
  const record: JobRecord = { id: newId("job"), filmId, startedAt: new Date().toISOString(), status: "running", progress: 0, message: "Bundling the engine" };
  jobs.running = { record, total: 0 };
  save(record);
  const child = spawn(process.execPath, [path.join("scripts", "render-direct.mjs"), `Film-${filmId}`], { cwd: CREATIVE_DIR, env: process.env });
  const onLine = (line: string) => {
    const m = line.match(/rendered (\d+)\/(\d+)/);
    if (m) {
      record.progress = Math.round((Number(m[1]) / Number(m[2])) * 95);
      record.message = `Rendering frame ${m[1]} of ${m[2]}`;
    } else if (/selecting composition/.test(line)) record.message = "Preparing the film";
    else if (/master/i.test(line)) { record.progress = 97; record.message = "Mastering the sound"; }
    else if (/FAILED|Error/.test(line)) record.message = line.slice(0, 300);
    save(record);
  };
  let buf = "";
  const feed = (d: Buffer) => {
    buf += d.toString();
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    lines.forEach(onLine);
  };
  child.stdout.on("data", feed);
  child.stderr.on("data", feed);
  child.on("close", (code) => {
    record.finishedAt = new Date().toISOString();
    record.status = code === 0 ? "done" : "failed";
    record.progress = code === 0 ? 100 : record.progress;
    record.message = code === 0 ? "Rendered and mastered" : record.message || `Renderer exited with ${code}`;
    save(record);
    jobs.running = null;
    next();
  });
}

export function enqueueRender(filmId: string) {
  if (jobs.running?.record.filmId === filmId || jobs.queue.includes(filmId)) return;
  jobs.queue.push(filmId);
  next();
}

export function jobStatus(filmId?: string) {
  const s = readState();
  const list = filmId ? s.jobs.filter((j) => j.filmId === filmId) : s.jobs;
  return { running: jobs.running?.record ?? null, queue: [...jobs.queue], latest: list[0] ?? null, history: list.slice(0, 20) };
}
