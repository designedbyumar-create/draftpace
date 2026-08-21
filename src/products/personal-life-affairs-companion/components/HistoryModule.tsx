import PlaceholderModule from "./PlaceholderModule";
import { Clock } from "@/design-system/Icon";

export default function HistoryModule() {
  return (
    <PlaceholderModule
      icon={Clock}
      title="Nothing recorded yet"
      description="What you have confirmed, and when. It fills in as you go."
    />
  );
}
