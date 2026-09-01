import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/design-system/EmptyState";
import type { DraftpaceIcon } from "@/design-system/Icon";

/**
 * Shared shape for an admin section that structurally exists (real route,
 * real nav entry, real gate) but has no backend behind it yet. Never
 * fabricate customers, orders, or metrics here — see docs/DECISIONS.md.
 */
export default function AdminEmptyPage({
  title,
  icon,
  description,
}: {
  title: string;
  icon: DraftpaceIcon;
  description: string;
}) {
  return (
    <AdminShell title={title}>
      <EmptyState icon={icon} title="Not built yet" description={description} />
    </AdminShell>
  );
}
