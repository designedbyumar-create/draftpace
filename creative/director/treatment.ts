/**
 * The director's treatment: a film's analysis, decisions and full
 * frame-by-frame script as a document a person can read, question and
 * approve before (or after) anything is rendered.
 */
import type { Film } from "./film";
import { PLATFORMS } from "./platforms";

const tc = (frames: number, fps: number) => {
  const s = frames / fps;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;
};
const esc = (t: string) => t.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function treatment(film: Film): string {
  const p = PLATFORMS[film.platform];
  const lines: string[] = [];
  lines.push(`# ${film.id}`);
  lines.push("");
  lines.push(`**${p.label}** · ${film.goal} · ${film.width}×${film.height} · ${(film.durationInFrames / film.fps).toFixed(1)}s · structure: **${film.structure}**`);
  lines.push("");
  lines.push(`> Angle: "${film.angle.text}" — \`${film.angle.source}\``);
  lines.push("");
  lines.push("## Analysis and decisions");
  lines.push("");
  lines.push("| | Decision | Because |");
  lines.push("|---|---|---|");
  for (const r of film.reasoning) lines.push(`| **${r.topic}** | ${esc(r.decision)} | ${esc(r.because)} |`);
  lines.push("");
  lines.push(`Treatment: voice \`${film.treatment.voice}\`, camera \`${film.treatment.camera}\`, motif \`${film.treatment.motif}\`, transitions ${film.treatment.transitions.map((t) => `\`${t}\``).join(" → ")}, music bed at ${film.music.level} (${film.music.energy} energy).`);
  lines.push("");
  lines.push("## Script, scene by scene");
  lines.push("");
  for (const [i, s] of film.scenes.entries()) {
    lines.push(`### ${i + 1}. ${s.id} — ${tc(s.from, film.fps)} to ${tc(s.from + s.dur, film.fps)} (frames ${s.from}–${s.from + s.dur}, ${(s.dur / film.fps).toFixed(1)}s)`);
    lines.push("");
    lines.push(`- **Shot:** ${s.kind} / ${s.variant} on a ${s.ground} ground, in by \`${s.transition}\``);
    if (s.eyebrow) lines.push(`- **Eyebrow:** "${s.eyebrow.text}" — \`${s.eyebrow.source}\``);
    for (const c of s.copy) lines.push(`- **On screen:** "${c.text}" — \`${c.source}\``);
    if (s.lines) lines.push(`- **Set as:** ${s.lines.map((l) => l.map((x) => `\`${x}\``).join(" / ")).join(" · ")}${s.emphasis?.length ? ` (accent on "${s.emphasis.join(", ")}")` : ""}`);
    if (s.screen) {
      const f = s.screen.focus;
      lines.push(`- **Real UI:** \`${s.screen.src}\`${s.screen.also ? ` with \`${s.screen.also}\`` : ""}, pose \`${s.screen.pose}\`${f ? `, focus "${f.region}" (y ${f.y}, h ${f.h}) at ${Math.round(f.at * 100)}%` : ""}`);
    }
    if (s.live) lines.push(`- **Real UI:** live \`${s.live}\` computing the demo month`);
    if (s.caption) lines.push(`- **Caption:** "${s.caption.text}" — \`${s.caption.source}\``);
    if (s.sfx.length) lines.push(`- **Sound:** ${s.sfx.map((x) => `${x.cue} @${x.at >= 0 ? "+" : ""}${x.at}f (${x.volume.toFixed(2)})`).join(", ")}`);
    lines.push(`- **Why:** ${s.why}`);
    lines.push("");
  }
  return lines.join("\n");
}
