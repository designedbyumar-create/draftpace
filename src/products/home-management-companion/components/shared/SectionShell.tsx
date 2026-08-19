"use client";

import type { DraftpaceIcon } from "@/design-system/Icon";
import Button from "@/design-system/Button";
import { Plus } from "@/design-system/Icon";

/**
 * The shared shell each of Home Base's three record sections is built
 * from, Home Base's own copy of PFC's identical shared/SectionShell.tsx.
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
  dominantAction: React.ReactNode | null;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
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
        <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={onAdd} className="hidden lg:inline-flex">
          {addLabel}
        </Button>
      </div>

      <div className="mt-3">{children}</div>

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
