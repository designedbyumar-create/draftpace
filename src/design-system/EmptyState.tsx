import type { DraftpaceIcon } from "@/design-system/Icon";

/**
 * The honest-state primitive. Use this instead of fabricating data, fake
 * charts, or placeholder content — every "nothing here yet" surface in the
 * platform should render through this, not a bespoke one-off.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: DraftpaceIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border-strong)] px-6 py-12 text-center">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)]">
          <Icon size={18} aria-hidden />
        </div>
      )}
      <div>
        <p className="text-[14px] font-semibold text-[var(--text)]">{title}</p>
        {description && <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-5 text-[var(--muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
