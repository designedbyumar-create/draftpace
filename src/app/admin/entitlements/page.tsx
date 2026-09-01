import AdminEmptyPage from "@/components/admin/AdminEmptyPage";
import { Check } from "@/design-system/Icon";

export default function AdminEntitlementsPage() {
  return (
    <AdminEmptyPage
      title="Entitlements"
      icon={Check}
      description="Grant, extend, revoke, or correct product access with a reason and audit trail. Requires the entitlements table — none exists yet."
    />
  );
}
