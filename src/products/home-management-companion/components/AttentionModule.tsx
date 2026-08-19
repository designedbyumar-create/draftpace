import EmptyState from "@/design-system/EmptyState";
import { Bell } from "@/design-system/Icon";

/** Placeholder — the real attention inbox ships in a later phase. */
export default function AttentionModule() {
  return (
    <EmptyState
      icon={Bell}
      title="Attention is not built yet"
      description="Overdue maintenance and expiring warranties will surface here."
    />
  );
}
