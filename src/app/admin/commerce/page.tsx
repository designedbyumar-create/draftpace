import AdminEmptyPage from "@/components/admin/AdminEmptyPage";
import { CreditCard } from "@/design-system/Icon";

export default function AdminCommercePage() {
  return (
    <AdminEmptyPage
      title="Commerce events"
      icon={CreditCard}
      description="Orders, providers, webhook events, refunds, and activation attempts. The checkout/webhook routes are stubs today — see docs/MIGRATION-PLAN.md."
    />
  );
}
