"use client";

import { Settings } from "@/design-system/Icon";
import PhaseZeroModule from "./PhaseZeroModule";

/** Settings. Secondary throughout: the loop never needs it. */
export default function SettingsModule() {
  return (
    <PhaseZeroModule
      eyebrow="Settings"
      title="How this product behaves."
      icon={Settings}
      description="Privacy and what appears in the printed record are decided here. There is nothing to change until you have added a child."
    />
  );
}
