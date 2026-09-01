import AdminEmptyPage from "@/components/admin/AdminEmptyPage";
import { Bell } from "@/design-system/Icon";

export default function AdminCommunicationsPage() {
  return (
    <AdminEmptyPage
      title="Communications"
      icon={Bell}
      description="Notification templates, schedules, delivery, and suppression. No notification sender exists yet — see /app/notifications for the customer-facing scaffold."
    />
  );
}
