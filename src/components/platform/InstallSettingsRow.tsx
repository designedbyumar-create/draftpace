"use client";

import { useEffect, useState } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import SettingsRow from "./SettingsRow";
import { useInstallPrompt, useStandaloneMode, isIosDevice } from "@/lib/pwa/hooks";
import { dismissInstallPrompt } from "@/lib/pwa/deviceOnboarding";

/**
 * Durable recovery surface for install, independent of the Platform Home
 * card's dismissal state — reflects this device's real status, always.
 */
export default function InstallSettingsRow() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const standalone = useStandaloneMode();
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setIos(isIosDevice());
  }, []);

  if (standalone) {
    return (
      <SettingsRow label="Install" description="Draftpace is installed on this device.">
        <Badge tone="success">Installed</Badge>
      </SettingsRow>
    );
  }

  if (ios && !canInstall) {
    return (
      <SettingsRow label="Install" description='On this device: tap Share, then "Add to Home Screen", then "Add".' />
    );
  }

  const install = async () => {
    const outcome = await promptInstall();
    if (outcome) dismissInstallPrompt();
  };

  return (
    <SettingsRow label="Install" description="Open Draftpace straight from your Home Screen on this device.">
      <Button size="sm" variant="secondary" onClick={install} disabled={!canInstall}>
        {canInstall ? "Install Draftpace" : "Not available on this browser"}
      </Button>
    </SettingsRow>
  );
}
