import EmptyState from "@/design-system/EmptyState";
import { Home } from "@/design-system/Icon";

/** Placeholder — the real "Today" snapshot ships in a later phase. */
export default function WorkspaceModule() {
  return (
    <EmptyState
      icon={Home}
      title="Today is not built yet"
      description="A snapshot of what needs attention around your home will live here."
    />
  );
}
