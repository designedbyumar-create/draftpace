#!/usr/bin/env node
/**
 * Voice-over to visuals: cut real Draftpace visuals to your own script.
 *
 * Put your words in a folder under voiceover/:
 *
 *   voiceover/<name>/script.txt      your script; each sentence becomes a line (needed unless you have captions.srt)
 *   voiceover/<name>/captions.srt    optional: your editor's caption file, for exact timing
 *   voiceover/<name>/voice.mp3       optional: your recording (.mp3, .wav, .m4a or .aac)
 *
 * then run
 *
 *   node scripts/voiceover.mjs <name> --product <product-slug> [--seconds 60] [--platform youtube-short] [--guide <guide-slug>] [--no-music]
 *   node scripts/voiceover.mjs <name> --guide <guide-slug>          the product is the one the guide hands over to
 *   node scripts/voiceover.mjs                                       re-plan every voice-over (after changing a script)
 *
 * --seconds is the length you want when there is no recording: 15, 30, 45,
 * 60, 90, 120 or 180 (anything from 10 to 180 works). With a recording the
 * film runs as long as the recording. Settings are saved to
 * voiceover/<name>/voiceover.json, so later runs only need the name.
 *
 * Writes shots/voiceover/<name>/<platform>.film.json and a shot list (.md)
 * with the timecode of every line, then render it with
 *
 *   node scripts/render-direct.mjs Film-vo-<name>
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { createServer } from "vite";
import { ffmpeg } from "./master-audio.mjs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const name = args[0] && !args[0].startsWith("--") ? args[0] : undefined;

const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom",
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.resolve("../src") } },
});
const run = await vite.ssrLoadModule(path.resolve("director/run.ts"));
const vo = await vite.ssrLoadModule(path.resolve("director/voiceover.ts"));
const { productForGuide } = await vite.ssrLoadModule(path.resolve("director/guide.ts"));
const { SHOP_LISTINGS } = await vite.ssrLoadModule(path.resolve("src/shop-listings.ts"));
const { PLATFORMS } = await vite.ssrLoadModule(path.resolve("director/platforms.ts"));
const { filmPath } = await vite.ssrLoadModule(path.resolve("director/film.ts"));

function fail(msg) {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
}

/** The recording's length in seconds, read by the ffmpeg that ships with Remotion. */
function audioSeconds(file) {
  const { bin, env } = ffmpeg();
  const out = spawnSync(bin, ["-hide_banner", "-i", file], { env, encoding: "utf8" }).stderr;
  const m = out.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) fail(`could not read the length of ${file}`);
  return Math.round((Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])) * 100) / 100;
}

if (name) {
  if (!/^[a-z0-9-]+$/.test(name)) fail(`"${name}": use lowercase letters, numbers and dashes for the folder name`);
  const dir = path.join("voiceover", name);
  if (!existsSync(dir)) fail(`no folder ${dir}/ — create it and put your script.txt (or captions.srt) in it`);
  const saved = existsSync(path.join(dir, "voiceover.json")) ? JSON.parse(readFileSync(path.join(dir, "voiceover.json"), "utf8")) : {};

  const guide = flag("guide") ?? saved.guide;
  const product = flag("product") ?? saved.product ?? (guide ? productForGuide(guide).product : undefined);
  if (!product) fail(`which product? add --product with one of: ${Object.keys(SHOP_LISTINGS).join(", ")}`);
  if (!SHOP_LISTINGS[product]) fail(`no product "${product}"; one of: ${Object.keys(SHOP_LISTINGS).join(", ")}`);
  const platform = flag("platform") ?? saved.platform ?? "youtube-short";
  if (!PLATFORMS[platform]) fail(`no platform "${platform}"; one of: ${Object.keys(PLATFORMS).join(", ")}`);

  const scriptFile = path.join(dir, "script.txt");
  const srtFile = path.join(dir, "captions.srt");
  const lines = existsSync(scriptFile) ? vo.splitScript(readFileSync(scriptFile, "utf8")) : [];
  const srt = existsSync(srtFile) ? vo.parseSrt(readFileSync(srtFile, "utf8")) : undefined;
  if (!lines.length && !srt?.length) fail(`${dir}/ needs a script.txt or a captions.srt`);

  // The recording, copied where the renderer can play it.
  const voice = readdirSync(dir).find((f) => /^voice\.(mp3|wav|m4a|aac)$/i.test(f));
  let audio;
  if (voice) {
    const ext = path.extname(voice).toLowerCase();
    mkdirSync("public/voiceover", { recursive: true });
    copyFileSync(path.join(dir, voice), `public/voiceover/${name}${ext}`);
    audio = { src: `voiceover/${name}${ext}`, seconds: audioSeconds(path.join(dir, voice)) };
  }

  const secondsArg = flag("seconds") ? Number(flag("seconds")) : undefined;
  if (secondsArg !== undefined && !(secondsArg >= vo.MIN_SECONDS && secondsArg <= vo.MAX_SECONDS)) fail(`--seconds must be between ${vo.MIN_SECONDS} and ${vo.MAX_SECONDS} (try ${vo.LENGTHS.join(", ")})`);
  if (audio && secondsArg) console.log(`  Note: the recording sets the length (${audio.seconds}s); --seconds ${secondsArg} is ignored.`);
  const words = lines.reduce((s, l) => s + l.split(/\s+/).length, 0);
  const seconds = audio || srt ? undefined : secondsArg ?? saved.seconds ?? Math.max(vo.MIN_SECONDS, Math.min(vo.MAX_SECONDS, Math.round(words / 2.5 + lines.length * 0.35 + 1.5)));

  const input = {
    id: name, product, ...(guide ? { guide } : {}), platform, lines,
    ...(srt ? { srt } : {}), ...(audio ? { audio } : {}), ...(seconds ? { seconds } : {}),
    ...(args.includes("--no-music") || saved.noMusic ? { noMusic: true } : {}),
  };
  writeFileSync(path.join(dir, "voiceover.json"), JSON.stringify(input, null, 2) + "\n");
}

// Plan every voice-over, so the generated list always matches voiceover/.
let results;
try {
  results = run.runVoiceovers();
} catch (e) {
  fail(e.message);
}
await vite.close();

rmSync("shots/voiceover", { recursive: true, force: true });
const imports = [];
for (const [i, { film, doc }] of results.entries()) {
  const base = path.join("shots", filmPath(film));
  mkdirSync(path.dirname(base), { recursive: true });
  writeFileSync(`${base}.film.json`, JSON.stringify(film, null, 2) + "\n");
  writeFileSync(`${base}.md`, doc + "\n");
  imports.push({ name: `v${i}`, file: `../${base}.film.json` });
  if (!name || film.voiceover.script === name) {
    console.log(`\n${film.id}: ${(film.durationInFrames / film.fps).toFixed(1)}s, ${film.scenes.length} shots → ${base}.md`);
    for (const r of film.reasoning.filter((x) => ["Timing", "Visuals"].includes(x.topic))) console.log(`  ${r.topic}: ${r.decision}. ${r.because}`);
    console.log(`  Render: node scripts/render-direct.mjs Film-${film.id}`);
  }
}
writeFileSync("src/voiceover-films.generated.ts",
  `// Generated by scripts/voiceover.mjs from voiceover/. Do not edit.\nimport type { Film } from "../director/film";\n` +
  imports.map((x) => `import ${x.name} from "${x.file}";`).join("\n") +
  `\n\nexport const VOICEOVER_FILMS = [${imports.map((x) => x.name).join(", ")}] as unknown as Film[];\n`);
process.exit(0);
