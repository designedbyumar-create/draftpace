"use client";

import { RotateCcw } from "@/components/ui/Icon";
import { SystemBlueprint } from "@/lib/systems";

export default function RecoveryPrompt({
  blueprint,
  onActivate,
}: {
  blueprint: SystemBlueprint;
  onActivate: () => void;
}) {
  return (
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--primary)]">
          <RotateCcw size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[var(--text)]">{blueprint.recoveryBehavior.title}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{blueprint.recoveryBehavior.minimumAction}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onActivate}
        className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-black text-[var(--text)]"
      >
        Use Recovery
      </button>
    </section>
  );
}
