import EmptyState from "@/design-system/EmptyState";
import { Home } from "@/design-system/Icon";

/** Placeholder — the real multi-step setup wizard ships in a later phase. */
export default function SetupModule() {
  return (
    <EmptyState
      icon={Home}
      title="Setup is not built yet"
      description="Adding your home, appliances, and recurring maintenance will happen here."
    />
  );
}
