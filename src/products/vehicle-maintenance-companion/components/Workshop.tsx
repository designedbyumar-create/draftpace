import type { ReactNode } from "react";

/**
 * This product's own visual vocabulary, so its screens read as an
 * instrument panel and a workshop bench rather than as a stack of cards.
 *
 * Small square corners (the shape token), hairline panels whose rows are
 * divided by dashed rules like a service sheet, and one monospaced face for
 * everything that is measured: labels, mileages, dates. Amber appears only
 * where something is lit or actionable.
 */

export const MONO = "font-[family-name:var(--font-space-mono)] tabular-nums";

/** A bordered panel of rows. Squared off by the shape token, no shadow. */
export const PANEL = "overflow-hidden rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)]";

/** Put on each row of a panel to divide it from the one before with a dashed rule. */
export const ROW_RULE = "[&:not(:first-child)]:border-t [&:not(:first-child)]:border-dashed [&:not(:first-child)]:border-[var(--border-strong)]";

/** A section label as it would be stamped on a control panel: a short amber tick, then small monospaced capitals. */
export function Label({ children, meta }: { children: ReactNode; meta?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className={`${MONO} flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]`}>
        <span aria-hidden className="h-[2px] w-3 bg-[var(--primary)]" />
        {children}
      </p>
      {meta && <span className={`${MONO} text-[11px] text-[var(--faint)]`}>{meta}</span>}
    </div>
  );
}

/** A screen's heading: what it is in one line, and the question it answers above it. */
export function ScreenHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header>
      <p className={`${MONO} text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]`}>{kicker}</p>
      <h1 className="mt-1 text-[30px] font-bold leading-none tracking-[-0.02em] text-[var(--text)]">{title}</h1>
    </header>
  );
}

/** A number plate as a chip, or the vehicle's name when it has no plate. */
export function Plate({ children, tone = "surface" }: { children: ReactNode; tone?: "surface" | "hero" }) {
  return (
    <span
      className={`${MONO} inline-block rounded-[var(--radius-sm)] border px-2 py-[3px] text-[12px] font-bold tracking-[0.12em] ${
        tone === "hero" ? "border-white/30 bg-white/10" : "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text)]"
      }`}
    >
      {children}
    </span>
  );
}

/** A row of choices as stamped chips, one of them active. Used for choosing a vehicle wherever there is more than one. */
export function ChipRow({
  label,
  items,
  activeId,
  onPick,
}: {
  label: string;
  items: { id: string | null; text: string; lamp?: ReactNode }[];
  activeId: string | null;
  onPick: (id: string | null) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id ?? "all"}
            type="button"
            aria-pressed={active}
            onClick={() => onPick(active && item.id !== null ? null : item.id)}
            className={`${MONO} flex items-center gap-2 rounded-[var(--radius-sm)] border px-2.5 py-[7px] text-[12px] font-bold tracking-[0.08em] ${
              active ? "border-[var(--text)] bg-[var(--text)] text-[var(--surface)]" : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)]"
            }`}
          >
            {item.lamp}
            {item.text}
          </button>
        );
      })}
    </div>
  );
}
