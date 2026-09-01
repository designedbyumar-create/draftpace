import Badge from "@/design-system/Badge";

/**
 * One row in a settings-style list: label + description + either a real
 * control (children) or an honest "not available yet" marker. Never
 * fabricate a working control for backend functionality that doesn't
 * exist — see docs/DECISIONS.md.
 */
export default function SettingsRow({
  label,
  description,
  children,
  unavailable,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
  unavailable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[var(--text)]">{label}</p>
        {description && <p className="mt-0.5 text-[12px] leading-5 text-[var(--muted)]">{description}</p>}
      </div>
      <div className="shrink-0">{unavailable ? <Badge tone="neutral">Not available yet</Badge> : children}</div>
    </div>
  );
}
