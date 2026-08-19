import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";

/** Placeholder — the real completed-maintenance log ships in a later phase. */
export default function HistoryModule() {
  return (
    <EmptyState
      icon={Clock}
      title="History is not built yet"
      description="A log of completed maintenance will live here."
    />
  );
}
