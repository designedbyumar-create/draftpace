import AdminEmptyPage from "@/components/admin/AdminEmptyPage";
import { ShieldCheck } from "@/design-system/Icon";

export default function AdminAuditPage() {
  return (
    <AdminEmptyPage
      title="Audit history"
      icon={ShieldCheck}
      description="Every admin action — entitlement grants, broad notifications, flag changes, migrations — with actor, reason, and before/after state. Requires the audit_events table."
    />
  );
}
