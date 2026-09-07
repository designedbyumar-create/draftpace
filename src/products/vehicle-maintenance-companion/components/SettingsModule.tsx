import PlaceholderModule from "../../personal-life-affairs-companion/components/PlaceholderModule";
import { Settings } from "@/design-system/Icon";

/**
 * Honest scaffolding, same as every other new product's Settings
 * destination on day one (Travel Companion's own Settings is still this
 * exact state). Nothing is switched on behind the scenes.
 */
export default function SettingsModule() {
  return (
    <PlaceholderModule
      icon={Settings}
      title="Nothing to set yet"
      description="When there is something worth choosing here, it will appear. Nothing is switched on behind the scenes."
    />
  );
}
