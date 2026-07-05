"use client";

import { ArrowRight, Check, Compass } from "@/components/ui/Icon";
import { SystemBlueprint } from "@/lib/systems";

export default function PathSelector({
  blueprint,
  selectedPathId,
  onSelect,
  onBack,
}: {
  blueprint: SystemBlueprint;
  selectedPathId?: string;
  onSelect: (pathId: string) => void;
  onBack: () => void;
}) {
  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
        <Compass size={21} />
      </div>
      <h2 className="mt-5 text-[30px] font-black leading-tight tracking-tight text-[var(--text)]">Choose your path.</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        A Draftpace System can move through different modes. Pick the one that matches the job you need this product to do now.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {blueprint.paths.map((path) => {
          const active = selectedPathId === path.id;
          return (
            <button
              key={path.id}
              type="button"
              onClick={() => onSelect(path.id)}
              className={`min-h-36 rounded-[24px] border p-4 text-left transition ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--primary)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
                    {path.modeLabel || "Path"}
                    {path.recommended ? " · Recommended" : ""}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-[var(--text)]">{path.name}</h3>
                </div>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: active ? blueprint.visualTheme.accent : "var(--surface)",
                    color: active ? "white" : "var(--muted)",
                  }}
                >
                  {active ? <Check size={16} /> : <ArrowRight size={15} />}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{path.description}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--muted)]"
      >
        Back to entry
      </button>
    </section>
  );
}
