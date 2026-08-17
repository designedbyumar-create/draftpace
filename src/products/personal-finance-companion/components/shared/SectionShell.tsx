"use client";

import type { DraftpaceIcon } from "@/design-system/Icon";
import Button from "@/design-system/Button";
import { Plus } from "@/design-system/Icon";

/**
 * The shared shell every one of the seven direct financial sections is
 * built from: header + purpose line, a summary stat row, one dominant next
 * action, an add control, then the record list. This is the interaction
 * grammar the launch spec's section 11 asks every section to share — not a
 * forced identical visual card grid, since the summary/list content is
 * always entity-specific and passed in as children.
 */
export default function SectionShell({
  icon: Icon,
  title,
  purpose,
  summary,
  dominantAction,
  onAdd,
  addLabel,
  children,
}: {
  icon: DraftpaceIcon;
  title: string;
  purpose: string;
  summary: React.ReactNode;
  /** The one rule-based next action, or null when nothing is currently more useful than "look around" — never a rotating tip. */
  dominantAction: React.ReactNode | null;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    // pb-20 reserves room at the end of the section so the mobile-only
    // fixed Add bar below never covers the last record row; lg:pb-0 since
    // that bar doesn't render at that breakpoint.
    <div className="pb-20 lg:pb-0">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon size={19} aria-hidden />
        </span>
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--text)]">{title}</h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">{purpose}</p>
        </div>
      </div>

      <div className="mt-5">{summary}</div>

      {dominantAction && (
        <div className="mt-4 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] p-4">{dominantAction}</div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Records</p>
        {/* Desktop only here - on mobile this same action moves to a
            bottom-anchored bar within thumb reach, below. */}
        <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={onAdd} className="hidden lg:inline-flex">
          {addLabel}
        </Button>
      </div>

      <div className="mt-3">{children}</div>

      {/* Mobile-only primary action, bottom-anchored within thumb reach -
          "Add X" is the single most common action on this screen; the top
          button required a reach-up gesture on every visit. */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)]/96 px-4 pt-3 backdrop-blur lg:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
      >
        <Button fullWidth iconLeft={<Plus size={15} aria-hidden />} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
