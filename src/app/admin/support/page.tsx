import AdminEmptyPage from "@/components/admin/AdminEmptyPage";
import { LifeBuoy } from "@/design-system/Icon";

export default function AdminSupportPage() {
  return (
    <AdminEmptyPage
      title="Support"
      icon={LifeBuoy}
      description="Support-case timeline, diagnostics, and resolution tools. Support requests are currently handled by email at support@draftpace.com, outside this admin."
    />
  );
}
