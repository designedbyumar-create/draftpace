import EmptyState from "@/design-system/EmptyState";
import { Layers3 } from "@/design-system/Icon";

/** Placeholder — the real Appliances/Maintenance/Service-Providers hub ships in a later phase. */
export default function RecordsModule() {
  return (
    <EmptyState
      icon={Layers3}
      title="Records are not built yet"
      description="Appliances, maintenance tasks, and service providers will live here."
    />
  );
}
