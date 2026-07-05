"use client";

import { Archive } from "@/components/ui/Icon";
import { CompletedSession, SystemBlueprint } from "@/lib/systems";

export default function VaultPreview({
  blueprint,
  sessions,
}: {
  blueprint: SystemBlueprint;
  sessions: CompletedSession[];
}) {
  const recent = sessions.slice(-3).reverse();

  return (
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: blueprint.visualTheme.secondary }}
        >
          <Archive size={17} />
        </div>
        <div>
          <p className="text-sm font-black text-[var(--text)]">Vault</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">History is local-only for this prototype.</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {recent.length > 0 ? (
          recent.map((session) => (
            <div key={session.id} className="rounded-2xl bg-[var(--surface-muted)] px-3 py-2">
              <p className="text-xs font-black text-[var(--text)]">{session.sessionLabel}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--muted)]">
                {new Date(session.completedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-[var(--surface-muted)] px-3 py-3 text-xs font-semibold leading-5 text-[var(--muted)]">
            Completed sessions will appear here after the first progress mark.
          </div>
        )}
      </div>
    </section>
  );
}
