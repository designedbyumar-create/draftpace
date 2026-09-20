/** The section's headline figures as one panel with hairlines between them, not a row of separate cards. */
export function StatRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)] [&>*]:border-[var(--border)] [&>*:nth-child(n+3)]:border-t [&>*:nth-child(even)]:border-l sm:grid-cols-4 sm:[&>*]:border-l sm:[&>*]:border-t-0 sm:[&>*:first-child]:border-l-0">
      {children}
    </div>
  );
}

export function StatTile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "muted" }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[12.5px] text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-[19px] font-semibold leading-tight tracking-[-0.01em] tabular-nums ${tone === "muted" ? "text-[var(--muted)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}
