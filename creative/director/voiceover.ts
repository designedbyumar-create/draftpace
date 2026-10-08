/**
 * Voice-over to visuals. You bring the words (a script, and if you have
 * them a recording and its caption file); this cuts real visuals to them.
 *
 * The words on screen are yours, as captions, exactly as written. The
 * pictures are the engine's and stay real: the product's captured
 * screens, its live components, a guide's own checklist, the name and the
 * end card. Nothing is drawn to illustrate a sentence.
 *
 * Timing, best first:
 *   srt     your caption file's cue times (CapCut, Descript and most editors export one): exact
 *   audio   your recording's length, shared out across the lines by how many words each has
 *   length  the length you chose, shared out the same way, so you can record to the picture
 *
 * Each line gets the visual whose words best match it. A line longer than
 * a shot can hold is split into shots at caption breaks, each with its
 * own visual, so a long voice-over never sits on one picture.
 */
import { PLATFORMS, type PlatformId } from "./platforms";
import type { Dossier, ScreenAsset } from "./dossier";
import type { Film, Scene, Copy, Ground, FilmTransition, SfxCue } from "./film";
import { MOTIF_LANGUAGE, TRANSITION_SFX, LIVE_ABOUT, relevance, screenAbout, breakLines, rng } from "./direct";

export type VoiceoverInput = {
  /** Folder name under voiceover/, and the film's id. */
  id: string;
  product: string;
  /** Optional: a guide whose checklists may be shown, and whose link the film ends on. */
  guide?: string;
  /** The canvas and safe areas. The length is yours, not the placement's. */
  platform: PlatformId;
  /** The script, one sentence (or spoken phrase) per line. Ignored when `srt` is given. */
  lines: string[];
  /** Cue times from a caption file, seconds. When present these are the lines. */
  srt?: { start: number; end: number; text: string }[];
  /** The recording: a path under public/ and its measured length in seconds. */
  audio?: { src: string; seconds: number };
  /** The length you chose, seconds, when there is no recording. */
  seconds?: number;
  /** No music bed: for a recording you will mix yourself later. */
  noMusic?: boolean;
};

export const LENGTHS = [15, 30, 45, 60, 90, 120, 180] as const;
export const MIN_SECONDS = 10;
export const MAX_SECONDS = 180;

const SEC = 30;
/** A natural speaking pace, words a second. */
const SPEAK = 2.5;
/** The longest one picture holds under a voice before it cuts to the next. */
const MAX_SHOT = 6;
/** The shortest picture worth cutting to: shorter splits read as flicker. */
const MIN_SHOT = 2.4;
const OVER = 8;
/** Below this word overlap, a visual is B-roll, and the shot list says so rather than claiming a match. */
const WEAK = 0.08;

const wordsIn = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const clean = (t: string) => t.replace(/\s+/g, " ").trim();

/** The script's lines: the caption file's cues if there is one, else the script. */
export function scriptLines(v: VoiceoverInput): string[] {
  return v.srt?.length ? v.srt.map((c) => clean(c.text)) : v.lines.map(clean).filter(Boolean);
}

/** What a vo: source says: a whole line ("vo:<id>#3") or a caption cut from it ("vo:<id>#3@12-40"). */
export function resolveVoSource(v: VoiceoverInput, source: string): string | undefined {
  const m = source.match(/^vo:([a-z0-9-]+)#(\d+)(?:@(\d+)-(\d+))?$/);
  if (!m || m[1] !== v.id) return undefined;
  const line = scriptLines(v)[Number(m[2])];
  if (line === undefined) return undefined;
  return m[3] === undefined ? line : line.slice(Number(m[3]), Number(m[4])).trim();
}

/** Parse an SRT file: cue numbers, "00:00:01,200 --> 00:00:03,900", text. */
export function parseSrt(text: string): { start: number; end: number; text: string }[] {
  const t = (s: string) => {
    const m = s.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
    if (!m) throw new Error(`not an SRT time: "${s}"`);
    return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, "0").slice(0, 3)) / 1000;
  };
  return text.replace(/\r/g, "").split(/\n\s*\n/).map((block) => {
    const rows = block.trim().split("\n");
    const at = rows.findIndex((r) => r.includes("-->"));
    if (at < 0) return null;
    const [a, b] = rows[at].split("-->");
    return { start: t(a), end: t(b), text: clean(rows.slice(at + 1).join(" ").replace(/<[^>]+>/g, "")) };
  }).filter((x): x is { start: number; end: number; text: string } => !!x && !!x.text);
}

/** Split a script paragraph into lines a voice would say in one breath: its sentences. */
export function splitScript(text: string): string[] {
  return text.replace(/\r/g, "").split(/\n+/).flatMap((para) => para.split(/(?<=[.!?])\s+(?=[A-Z"“'0-9])/)).map(clean).filter(Boolean);
}

type Chunk = { text: string; a: number; b: number; words: number };

/** Words a phrase starts with, so a break just before one reads naturally. */
const OPENS = new Set("and but or so then not than that which when where while rather because before after if unless until".split(" "));
/** Words a phrase never ends on: a break just after one strands it. */
const LEANS = new Set("the a an to of your my our their his her its and or but as at in on for from with this that these those it's is are was be by not than it you we they i can will".split(" "));

/**
 * Caption-sized pieces of a line, cut where a person would pause: even in
 * length (about 7 words at most, 42 characters), breaking at punctuation
 * or before a word that opens a phrase, never just after "the" or "your".
 * The cuts are chosen together, not greedily, so no piece is left with an
 * orphan word. Each piece keeps its place in the line, so the guard can
 * check it is the script's own words.
 */
export function chunk(line: string): Chunk[] {
  const tokens = [...line.matchAll(/\S+/g)].map((m) => ({ w: m[0], a: m.index!, b: m.index! + m[0].length }));
  const N = tokens.length;
  if (N === 0) return [];
  const ideal = N / Math.ceil(N / 7);
  const bare = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");
  // best[i] = cheapest way to caption tokens[0..i), with where its last piece began.
  const best: { cost: number; from: number }[] = [{ cost: 0, from: -1 }];
  for (let j = 1; j <= N; j++) {
    best[j] = { cost: Infinity, from: -1 };
    for (let i = Math.max(0, j - 8); i < j; i++) {
      const n = j - i;
      if (tokens[j - 1].b - tokens[i].a > 42 && n > 1) continue;
      if (n === 1 && N > 1) continue;
      let cost = (n - ideal) ** 2 * 0.3;
      if (j < N) {
        if (/[,.;:?!]$/.test(tokens[j - 1].w)) cost -= 1.5;
        else if (OPENS.has(bare(tokens[j].w))) cost -= 0.8;
        // A leaning word right before a phrase opener is ending its clause ("the bills you pay from / and..."), not leaning.
        if (LEANS.has(bare(tokens[j - 1].w)) && !/[,.;:?!]$/.test(tokens[j - 1].w) && !OPENS.has(bare(tokens[j].w))) cost += 2;
      }
      const total = best[i].cost + cost + 1;
      if (total < best[j].cost) best[j] = { cost: total, from: i };
    }
  }
  const out: Chunk[] = [];
  for (let j = N; j > 0; j = best[j].from) {
    const i = best[j].from;
    const a = tokens[i].a, b = tokens[j - 1].b;
    out.unshift({ text: line.slice(a, b), a, b, words: j - i });
  }
  return out;
}

/** Split captions into n runs, cutting at the caption breaks that make the runs most even in words. */
function split(chunks: Chunk[], n: number): Chunk[][] {
  const cum = chunks.reduce<number[]>((acc, c) => [...acc, (acc.at(-1) ?? 0) + c.words], []);
  const words = cum.at(-1)!;
  const cuts: number[] = [];
  for (let k = 1; k < n; k++) {
    let best = -1;
    for (let j = (cuts.at(-1) ?? 0) + 1; j <= chunks.length - (n - k); j++) {
      if (best < 0 || Math.abs(cum[j - 1] - (words * k) / n) < Math.abs(cum[best - 1] - (words * k) / n)) best = j;
    }
    cuts.push(best);
  }
  return [0, ...cuts].map((a, k) => chunks.slice(a, cuts[k] ?? chunks.length));
}

type Visual =
  | { kind: "phone"; key: string; screen: ScreenAsset; region: ScreenAsset["regions"][number]; score: number; why: string }
  | { kind: "live"; key: string; live: NonNullable<Scene["live"]>; score: number; why: string }
  | { kind: "list"; key: string; block: NonNullable<Dossier["guide"]>["blocks"][number]; items: number[]; score: number; why: string }
  | { kind: "title"; key: string; score: number; why: string }
  | { kind: "brand"; key: string; score: number; why: string };


type Shot = { line: number; from: number; to: number; chunks: Chunk[]; whole: boolean };

export function planVoiceover(v: VoiceoverInput, d: Dossier): Film {
  const p = PLATFORMS[v.platform];
  const lines = scriptLines(v);
  if (!lines.length) throw new Error(`voice-over "${v.id}" has no script`);
  const r = rng(`vo-${v.id}`);
  const reasoning: Film["reasoning"] = [];
  const totalWords = lines.reduce((s, l) => s + wordsIn(l), 0);
  const natural = totalWords / SPEAK + lines.length * 0.35;

  // ---------------------------------------------------------------- timing
  let times: { from: number; to: number }[];
  let length: number;
  let timing: NonNullable<Film["voiceover"]>["timing"];
  if (v.srt?.length) {
    timing = "srt";
    times = v.srt.map((c) => ({ from: c.start, to: c.end }));
    length = Math.max(v.audio?.seconds ?? 0, times[times.length - 1].to + 0.8);
    reasoning.push({ topic: "Timing", decision: `${v.srt.length} cues from the caption file, exact`, because: "A caption file says when each line is spoken, so the picture cuts on the voice, not near it." });
  } else {
    length = v.audio ? v.audio.seconds + 0.5 : v.seconds ?? Math.round(natural);
    timing = v.audio ? "audio" : "length";
    const lead = 0.3, tail = v.audio ? 0.5 : 1.2;
    const span = Math.max(1, length - lead - tail);
    const weight = lines.map((l) => wordsIn(l) + 1.2);
    const sum = weight.reduce((a, b) => a + b, 0);
    let at = lead;
    times = weight.map((w) => {
      const t = { from: at, to: at + (w / sum) * span };
      at = t.to;
      return t;
    });
    const pace = totalWords / span;
    const verdict = pace > SPEAK * 1.3
      ? `fast: about ${pace.toFixed(1)} words a second against a natural ${SPEAK}. Choose about ${Math.ceil(natural / 5) * 5}s, or cut about ${Math.round(totalWords - span * SPEAK)} words`
      : pace < SPEAK * 0.6
        ? `slow: about ${pace.toFixed(1)} words a second, so pictures will hold long. About ${Math.round(natural)}s suits this script, or add lines`
        : `natural: about ${pace.toFixed(1)} words a second`;
    reasoning.push({
      topic: "Timing",
      decision: v.audio ? `Spread across the recording's ${v.audio.seconds.toFixed(1)}s by words` : `Spread across the chosen ${length}s by words`,
      because: `${lines.length} lines, ${totalWords} words, read naturally in about ${Math.round(natural)}s. At this length the pace is ${verdict}.${v.audio ? " Add the caption file for exact cuts." : " Record to the timecodes in the shot list, or add your recording and re-run."}`,
    });
  }
  if (length > MAX_SECONDS + 1 || length < MIN_SECONDS - 0.01) throw new Error(`voice-over "${v.id}" runs ${length.toFixed(1)}s; the engine makes ${MIN_SECONDS}–${MAX_SECONDS}s`);

  // ---------------------------------------------------------------- shots
  // A line becomes one shot, or several cut at caption breaks when it runs longer than one picture should hold.
  const shots: Shot[] = [];
  lines.forEach((line, i) => {
    const chunks = chunk(line);
    const { from, to } = times[i];
    const last = i === lines.length - 1;
    // The last line is the end card, held whole. Any other line is cut into as many pictures as fit, none shorter than MIN_SHOT.
    let n = last ? 1 : Math.min(chunks.length, Math.max(1, Math.ceil((to - from) / MAX_SHOT)));
    while (n > 1 && (to - from) / n < MIN_SHOT) n--;
    const words = chunks.reduce((s2, c) => s2 + c.words, 0);
    const runs = split(chunks, n);
    let t = from;
    runs.forEach((take, k) => {
      const end = k === runs.length - 1 ? to : t + (take.reduce((s2, c) => s2 + c.words, 0) / words) * (to - from);
      shots.push({ line: i, from: t, to: end, chunks: take, whole: runs.length === 1 });
      t = end;
    });
  });

  // ---------------------------------------------------------------- visuals
  const used = new Map<string, number>();
  const regionTurn = new Map<string, number>();
  const nameRe = new RegExp(`\\b${d.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  const guide = d.guide;
  const rel = relevance(d);
  const visualFor = (shot: Shot, prev: string | undefined, first: boolean): Visual => {
    const line = lines[shot.line];
    const text = shot.chunks.map((c) => c.text).join(" ");
    const about = `${text} ${line}`;
    const dur = shot.to - shot.from;
    const options: Visual[] = [];
    for (const s of d.screens) {
      const turn = regionTurn.get(s.src) ?? 0;
      const ranked = [...s.regions].sort((a, b) => rel(about, b.label) - rel(about, a.label));
      const region = ranked[turn % ranked.length];
      const fit = rel(text, screenAbout(s)) * 0.7 + rel(line, screenAbout(s)) * 0.3;
      options.push({ kind: "phone", key: `phone:${s.src}`, screen: s, region, score: 0.2 + fit, why: fit >= WEAK ? `the real "${s.heading}" screen matches its words (${fit.toFixed(2)}); focus on "${region.label}"` : `nothing in the product matches these words closely, so the least-shown real screen, "${s.heading}", focus on "${region.label}"` });
    }
    for (const live of d.liveComponents) {
      const fit = rel(text, LIVE_ABOUT[live] ?? "") * 0.7 + rel(line, LIVE_ABOUT[live] ?? "") * 0.3;
      options.push({ kind: "live", key: `live:${live}`, live: live as NonNullable<Scene["live"]>, score: 0.2 + fit * 1.2, why: fit >= WEAK ? `the live ${live} computes what it is about (${fit.toFixed(2)})` : `nothing in the product matches these words closely, so the least-shown real visual, the live ${live}` });
    }
    for (const b of guide?.blocks ?? []) {
      const items = b.items.map((u, i) => (u.words <= 9 && u.words >= 2 ? i : -1)).filter((i) => i >= 0).slice(0, 3);
      const read = items.reduce((s, i) => s + 0.5 + b.items[i].words * p.secondsPerWord, 0);
      if (items.length < 2 || read > dur || used.has(`list:${b.index}`)) continue;
      const fit = rel(about, [b.heading?.text ?? "", ...b.items.map((u) => u.text)].join(" "));
      // A list puts its own words beside yours: only when it is plainly about the same thing.
      if (fit < 0.25) continue;
      options.push({ kind: "list", key: `list:${b.index}`, block: b, items, score: 0.2 + fit, why: `the guide's own list${b.heading ? ` "${b.heading.text}"` : ""} says the same thing (${fit.toFixed(2)})` });
    }
    if (shot.whole && wordsIn(line) <= 12) {
      options.push({ kind: "title", key: `title:${shot.line}`, score: (first ? 1.2 : 0.42) + (/\?$/.test(line) ? 0.15 : 0), why: first ? "the opening line, set large: it is the hook" : "a short line, set large as type: the words are the picture" });
    }
    if (nameRe.test(line) && !used.has("brand")) options.push({ kind: "brand", key: "brand", score: 1.1, why: `it names ${d.name}, so the name is revealed as it is said` });
    for (const o of options) {
      o.score -= (used.get(o.key) ?? 0) * 0.25 + (o.key === prev ? 1 : 0) + r() * 0.01;
    }
    return options.sort((a, b) => b.score - a.score)[0];
  };

  // ---------------------------------------------------------------- scenes
  const lang = MOTIF_LANGUAGE[d.motif] ?? MOTIF_LANGUAGE.card;
  const transitions: FilmTransition[] = p.voice === "native" ? ["cut", "whip", lang.transitions[0]] : lang.transitions;
  const rhythm: Ground[] = d.temperature === "warm" ? ["light", "accent", "light", "ink"] : ["light", "ink", "light", "accent"];
  const f = (s: number) => Math.round(s * SEC);
  const total = f(length);
  const scenes: Scene[] = [];
  let prevKey: string | undefined;
  shots.forEach((shot, i) => {
    const last = i === shots.length - 1;
    const from = i === 0 ? 0 : f(shot.from);
    const next = last ? total : f(shots[i + 1].from);
    const dur = next - from + (last ? 0 : OVER);
    const line = lines[shot.line];
    const captions = (none: boolean) => none ? undefined : shot.chunks.map((c, k, all) => {
      const words = all.reduce((s, x) => s + x.words, 0);
      const before = all.slice(0, k).reduce((s, x) => s + x.words, 0);
      const span = f(shot.to) - f(shot.from);
      const at = f(shot.from) - from + Math.round((before / words) * span);
      return { text: line.slice(c.a, c.b).trim(), source: `vo:${v.id}#${shot.line}@${c.a}-${c.b}`, at, dur: Math.max(8, Math.round((c.words / words) * span)) };
    });
    const ground = rhythm[i % rhythm.length];
    const transition: FilmTransition = i === 0 ? "cut" : transitions[(i - 1) % transitions.length];
    const base = { id: `line-${shot.line + 1}${shot.whole ? "" : `-${shots.slice(0, i).filter((s) => s.line === shot.line).length + 1}`}`, from, dur, transition, sfx: [] as SfxCue[] };
    if (last) {
      const cta: Scene = guide
        ? { ...base, kind: "cta", variant: "guide", ground, copy: [{ text: d.name, source: "title" }, { text: guide.url, source: `guide:${guide.slug}/url` }], eyebrow: { text: "The full guide", source: "micro" }, captions: captions(false), why: "The last line closes on the end card: the full guide, with the product beneath it." }
        : { ...base, kind: "cta", variant: d.free ? "free" : p.close, ground, copy: [{ text: d.name, source: "title" }, { text: d.free ? "Start free." : "Available now.", source: "micro" }], captions: captions(false), why: "The last line closes on the end card, so the voice's last words land on the name and where to find it." };
      scenes.push(cta);
      return;
    }
    const vis = visualFor(shot, prevKey, i === 0);
    used.set(vis.key, (used.get(vis.key) ?? 0) + 1);
    prevKey = vis.key;
    const why = `"${shot.chunks.map((c) => c.text).join(" ")}": ${vis.why}.`;
    switch (vis.kind) {
      case "phone": {
        regionTurn.set(vis.screen.src, (regionTurn.get(vis.screen.src) ?? 0) + 1);
        const tall = vis.screen.height / vis.screen.width > 2.6;
        const poses = ["float", "tiltLeft", "flat", "tiltRight"] as const;
        scenes.push({ ...base, kind: "phone", variant: "proof", ground: "light", copy: [], captions: captions(false), screen: { src: vis.screen.src, pose: poses[i % poses.length], focus: { at: 0.4, y: vis.region.y, h: vis.region.h, region: vis.region.id }, scroll: tall ? undefined : [] }, why });
        break;
      }
      case "live":
        scenes.push({ ...base, kind: "live", variant: "after", ground: "light", copy: [], live: vis.live, captions: captions(false), why });
        break;
      case "list":
        scenes.push({ ...base, kind: "list", variant: "checklist", ground, copy: vis.items.map((k) => ({ text: vis.block.items[k].text, source: vis.block.items[k].source })), eyebrow: vis.block.heading && vis.block.heading.text.length <= 44 ? { text: vis.block.heading.text, source: vis.block.heading.source } : undefined, captions: captions(false), why });
        break;
      case "brand":
        scenes.push({ ...base, kind: "brand", variant: "lockup", ground: ground === "light" ? "accent" : ground, copy: [{ text: d.name, source: "title" }], captions: captions(false), why });
        break;
      case "title": {
        const copy: Copy = { text: line, source: `vo:${v.id}#${shot.line}` };
        scenes.push({ ...base, kind: "title", variant: p.voice === "native" ? "native" : "editorial", ground: i === 0 ? "light" : ground, copy: [copy], lines: [breakLines(line, p.width >= 1080 ? 20 : 18)], captions: captions(true), why });
        break;
      }
    }
  });

  // ---------------------------------------------------------------- sound: under a voice, quieter and fewer
  const k = v.audio ? 0.45 : 0.6;
  for (const s of scenes) {
    const t = TRANSITION_SFX[s.transition];
    if (t && s.from > 0) s.sfx.push({ at: 0, cue: t, volume: (t === "tick" ? 0.5 : 0.28) * k });
    if (s.kind === "phone" || s.kind === "live") s.sfx.push({ at: 10, cue: "pop", volume: 0.35 * k });
    if (s.kind === "brand") s.sfx.push({ at: 4, cue: "shimmer", volume: 0.3 * k });
    if (s.kind === "cta") s.sfx.push({ at: 8, cue: "settle", volume: 0.45 * k });
  }

  const visuals = scenes.slice(0, -1).map((s) => s.kind);
  const count = (kind: string) => visuals.filter((x) => x === kind).length;
  reasoning.unshift(
    { topic: "Canvas", decision: `${p.label}, ${p.width}×${p.height}, ${length.toFixed(1)}s`, because: `Your length, not the placement's. ${p.label}'s safe areas keep captions clear of its buttons.` },
    { topic: "Product", decision: `${d.name}${guide ? `, with the guide "${guide.title}"` : ""}`, because: `${d.screens.length} real screens${d.liveComponents.length ? `, live ${d.liveComponents.join(", ")}` : ""}${guide ? `, ${guide.blocks.length} guide lists` : ""} to cut to.` },
  );
  reasoning.push({
    topic: "Visuals",
    decision: `${scenes.length} shots for ${lines.length} lines: ${count("phone")} real screens, ${count("live")} live, ${count("list")} guide lists, ${count("title")} lines set as type, ${count("brand")} name reveal, then the end card`,
    because: `Each shot shows the visual whose words best match what is being said, never the same one twice in a row; a line over ${MAX_SHOT}s is split at a caption break into two pictures.${d.screens.length < 4 && length > 60 ? ` ${d.name} has ${d.screens.length} captured screens, so a ${Math.round(length)}s film revisits them; capturing more screens gives it more to cut to.` : ""}`,
  });
  reasoning.push({ topic: "Captions", decision: "Your words, burned in, a phrase at a time", because: "Most people watch muted; each caption is cut from your script at a natural break and shown while it is said." });

  return {
    id: `vo-${v.id}--${p.id}`, product: d.slug, ...(guide ? { guide: guide.slug } : {}),
    voiceover: { script: v.id, ...(v.audio ? { audio: v.audio.src } : {}), timing },
    runtime: { min: total / SEC - 0.05, max: total / SEC + 0.05 },
    platform: p.id, goal: "consideration",
    width: p.width, height: p.height, fps: SEC, durationInFrames: total,
    structure: "voiceover",
    angle: { text: lines[0], source: `vo:${v.id}#0` },
    treatment: { voice: p.voice, camera: "float", transitions, motif: d.motif, grounds: rhythm, pace: 1 },
    music: { bed: "audio/bed-relaxation-05.mp3", level: v.noMusic ? 0 : v.audio ? 0.07 : 0.12, energy: "low" },
    scenes, reasoning,
  };
}
