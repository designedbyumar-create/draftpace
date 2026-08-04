import type { SinceLastHere as SinceLastHereFacts } from "../sinceLastHere";

/**
 * One restrained fact-only surface above the Workspace hero. Never a second
 * dashboard: no numbers to act on here, just what changed since the last
 * confirmed check-in. computeSinceLastHere() already decides whether this
 * renders at all — returning null suppresses it entirely.
 */
const TONE: Record<"fresh" | "aging" | "stale", { container: string; eyebrow: string }> = {
  fresh: { container: "border-[var(--border)]", eyebrow: "text-[var(--faint)]" },
  aging: { container: "border-[var(--border-strong)] bg-[var(--surface-muted)]", eyebrow: "text-[var(--muted)]" },
  stale: { container: "border-[var(--warning)]/50 bg-[var(--warning-soft)]", eyebrow: "text-[var(--warning)]" },
};

export default function SinceLastHere({ data }: { data: SinceLastHereFacts }) {
  // Negative Safe-to-Spend may raise this surface's visual weight one notch
  // — never past what the tier's own facts justify, and never a second
  // "needs attention" message competing with NextActionCard.
  const visualTier = data.elevated && data.tier === "fresh" ? "aging" : data.tier;
  const tone = TONE[visualTier];

  return (
    <div id="mmr-tour-since-last-here" className={`mb-4 rounded-xl border px-4 py-3 ${tone.container}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${tone.eyebrow}`}>Since you were last here</p>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{data.facts.join(" ")}</p>
    </div>
  );
}
