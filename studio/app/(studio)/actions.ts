"use server";

import { revalidatePath } from "next/cache";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { update, newId, type ReviewStatus } from "~/lib/server/store";
import { enqueueRender } from "~/lib/server/jobs";
import { planFilm, saveBrief, planVoiceoverDraft, saveVoiceover, deleteVoiceover, getFilm, CREATIVE_DIR, type PlanRequest, type VoiceoverDraft } from "~/lib/server/engine";
import { trackedLink } from "~/lib/publish";
import { parseSrt, splitScript, MIN_SECONDS, MAX_SECONDS } from "@engine/director/voiceover";
import type { PlatformId } from "@engine/director/platforms";
import type { Film } from "@engine/director/film";

// ------------------------------------------------------------------ review

export async function setReview(filmId: string, status: ReviewStatus | null, note = "") {
  update((s) => {
    if (status) s.reviews[filmId] = { status, note: note.trim(), at: new Date().toISOString() };
    else delete s.reviews[filmId];
  });
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------ render

export async function renderFilm(filmId: string) {
  if (!getFilm(filmId)) throw new Error("No such film");
  enqueueRender(filmId);
}

// ------------------------------------------------------------------ schedule

export async function scheduleFilm(input: { filmId: string; date: string; time: string; caption: string }) {
  const entry = getFilm(input.filmId);
  if (!entry) throw new Error("No such film");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Pick a date");
  update((s) => {
    s.schedule.push({
      id: newId("post"), filmId: input.filmId, platform: entry.film.platform as PlatformId, date: input.date, time: input.time,
      caption: input.caption, link: trackedLink(entry.film, entry.film.platform), status: "scheduled", createdAt: new Date().toISOString(),
    });
    s.schedule.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  });
  revalidatePath("/", "layout");
}

export async function setPostStatus(id: string, status: "scheduled" | "posted") {
  update((s) => { const p = s.schedule.find((x) => x.id === id); if (p) p.status = status; });
  revalidatePath("/", "layout");
}

export async function unschedule(id: string) {
  update((s) => { s.schedule = s.schedule.filter((x) => x.id !== id); });
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------ make

export async function planAction(req: PlanRequest): Promise<{ film: Film; doc: string; exists: boolean } | { error: string }> {
  try {
    return planFilm(req);
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function saveAction(req: PlanRequest): Promise<{ id: string } | { error: string }> {
  try {
    const id = saveBrief(req);
    revalidatePath("/", "layout");
    return { id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ------------------------------------------------------------------ voice-over

export type VoiceoverForm = {
  id: string; product: string; guide?: string; platform: PlatformId; seconds?: number; script: string; srt?: string; noMusic?: boolean;
  /** Length of an already-saved recording, kept when the form is re-planned without a new upload. */
  audio?: { src: string; seconds: number };
};

function draftOf(f: VoiceoverForm): VoiceoverDraft {
  const srt = f.srt?.trim() ? parseSrt(f.srt) : undefined;
  const seconds = f.audio || srt?.length ? undefined : Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Number(f.seconds) || 30));
  return {
    id: f.id || "draft", product: f.product, ...(f.guide ? { guide: f.guide } : {}), platform: f.platform,
    lines: splitScript(f.script), ...(srt?.length ? { srt } : {}), ...(f.audio ? { audio: f.audio } : {}), ...(seconds ? { seconds } : {}),
    ...(f.noMusic ? { noMusic: true } : {}),
  };
}

export async function planVoiceoverAction(f: VoiceoverForm): Promise<{ film: Film; doc: string } | { error: string }> {
  try {
    const d = draftOf(f);
    if (!d.lines.length && !d.srt?.length) return { error: "Write or paste your script first." };
    return planVoiceoverDraft(d);
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** The recording's length in seconds, read by the engine's own ffmpeg (creative/scripts/audio-length.mjs, on any OS). */
function audioSeconds(file: string): number {
  const r = spawnSync(process.execPath, [path.join("scripts", "audio-length.mjs"), file], { cwd: CREATIVE_DIR, encoding: "utf8" });
  const s = Number(r.stdout.trim());
  if (r.status !== 0 || !Number.isFinite(s) || s <= 0) throw new Error("Could not read the recording's length. Is it an mp3, wav, m4a or aac file?");
  return s;
}

export async function saveVoiceoverAction(form: FormData): Promise<{ id: string } | { error: string }> {
  try {
    const f = JSON.parse(String(form.get("form"))) as VoiceoverForm;
    if (!/^[a-z0-9-]+$/.test(f.id)) return { error: "Name it with lowercase letters, numbers and dashes, like money-reset-explainer." };
    const upload = form.get("audio");
    let audio: { name: string; data: Buffer; seconds: number } | undefined;
    if (upload instanceof File && upload.size > 0) {
      if (!/\.(mp3|wav|m4a|aac)$/i.test(upload.name)) return { error: "The recording must be an mp3, wav, m4a or aac file." };
      const data = Buffer.from(await upload.arrayBuffer());
      const tmp = path.join(os.tmpdir(), `studio-${Date.now()}${path.extname(upload.name)}`);
      fs.writeFileSync(tmp, data);
      try { audio = { name: upload.name, data, seconds: audioSeconds(tmp) }; } finally { fs.rmSync(tmp, { force: true }); }
      if (audio.seconds > MAX_SECONDS) return { error: `The recording is ${Math.round(audio.seconds)}s; Studio makes films up to ${MAX_SECONDS}s.` };
      if (audio.seconds < MIN_SECONDS) return { error: `The recording is ${audio.seconds.toFixed(1)}s; Studio makes films of ${MIN_SECONDS}s or more.` };
    }
    const id = saveVoiceover(draftOf(f), { srt: f.srt?.trim() || undefined, audio });
    revalidatePath("/", "layout");
    return { id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteVoiceoverAction(id: string) {
  deleteVoiceover(id);
  revalidatePath("/", "layout");
}
