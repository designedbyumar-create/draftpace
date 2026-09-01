import AdminEmptyPage from "@/components/admin/AdminEmptyPage";
import { ChartBar } from "@/design-system/Icon";

export default function AdminAnalyticsPage() {
  return (
    <AdminEmptyPage
      title="Analytics"
      icon={ChartBar}
      description="Activation, first value, retention, and completion metrics. No event pipeline exists yet — nothing here is fabricated in the meantime."
    />
  );
}
