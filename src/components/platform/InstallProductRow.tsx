"use client";

import { useEffect, useState } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import SettingsRow from "./SettingsRow";
import { useInstallPrompt, useStandaloneMode, isIosDevice } from "@/lib/pwa/hooks";
import { dismissInstallPrompt } from "@/lib/pwa/deviceOnboarding";

/**
 * Install *this product* as its own app.
 *
 * WHY THIS EXISTS SEPARATELY FROM InstallSettingsRow
 *
 * Every product already serves its own manifest, scoped to
 * /app/products/<slug>/ with its own name, theme colour and icon (see
 * manifest.webmanifest/route.ts). A browser installs whatever manifest is
 * linked from the page it is on, so installing from inside a product
 * installs that Companion, and installing from /app/settings installs
 * Draftpace. Both are correct and they are different things.
 *
 * The gap this closes: the per-product manifests worked, and nothing
 * anywhere told a customer they could use them. The only install control
 * in the product lived in platform settings, outside every product's
 * scope, so the feature was effectively unreachable.
 *
 * iOS is the reason the copy is worded per-platform rather than shown as
 * one button. Safari never fires `beforeinstallprompt`, so there is no
 * prompt to offer; it installs from the Share sheet, reading the current
 * page's meta tags. The instruction is the real control there, not a
 * consolation for a missing one.
 */
export default function InstallProductRow({ productTitle }: { productTitle: string }) {
  const { canInstall, promptInstall } = useInstallPrompt();
  const standalone = useStandaloneMode();
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setIos(isIosDevice());
  }, []);

  if (standalone) {
    return (
      <SettingsRow label="On this device" description={`${productTitle} is installed and opens from your Home Screen.`}>
        <Badge tone="success">Installed</Badge>
      </SettingsRow>
    );
  }

  if (ios && !canInstall) {
    return (
      <SettingsRow
        label="Add to your Home Screen"
        description={`Tap Share, then "Add to Home Screen", then "Add". ${productTitle} then opens in its own window, with its own icon.`}
      />
    );
  }

  const install = async () => {
    const outcome = await promptInstall();
    if (outcome) dismissInstallPrompt();
  };

  return (
    <SettingsRow
      label="Install this Companion"
      description={`${productTitle} gets its own icon and opens in its own window, separate from the rest of Draftpace.`}
    >
      <Button size="sm" variant="action" onClick={install} disabled={!canInstall}>
        {canInstall ? `Install ${productTitle}` : "Not available on this browser"}
      </Button>
    </SettingsRow>
  );
}
