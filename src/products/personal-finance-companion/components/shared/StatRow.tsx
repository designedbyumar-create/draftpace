export function StatRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{children}</div>;
}

export function StatTile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "muted" }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">{label}</p>
      <p className={`mt-1 text-[17px] font-semibold leading-tight ${tone === "muted" ? "text-[var(--muted)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}
