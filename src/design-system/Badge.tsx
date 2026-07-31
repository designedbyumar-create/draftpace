export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-[var(--surface-muted)] text-[var(--muted)]",
  primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
};

/**
 * Status label only — not a decorative element. Use sparingly (product
 * status, entitlement state, lifecycle) rather than as a UI accent.
 */
export default function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
