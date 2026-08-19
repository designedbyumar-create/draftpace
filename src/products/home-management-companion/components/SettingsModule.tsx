import EmptyState from "@/design-system/EmptyState";
import { Settings } from "@/design-system/Icon";

/** Placeholder — notification preferences and home details ship in a later phase. */
export default function SettingsModule() {
  return (
    <EmptyState
      icon={Settings}
      title="Settings are not built yet"
      description="Notification preferences and home details will live here."
    />
  );
}
