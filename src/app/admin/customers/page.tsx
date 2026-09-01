import AdminEmptyPage from "@/components/admin/AdminEmptyPage";
import { User } from "@/design-system/Icon";

export default function AdminCustomersPage() {
  return (
    <AdminEmptyPage
      title="Customers"
      icon={User}
      description="Account metadata, entitlements, devices, consent, and support timeline per customer. Requires the entitlement and support-case data model."
    />
  );
}
