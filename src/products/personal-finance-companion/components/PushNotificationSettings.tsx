"use client";

import { useEffect, useState } from "react";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Badge from "@/design-system/Badge";
import Alert from "@/design-system/Alert";
import { detectPushCapability, subscribeToPush, unsubscribeFromPush, sendTestPush, type PushCapability } from "@/lib/notifications/pushClient";

/**
 * Real capability detection and controls (Stage F §26) — every state
 * shown here reflects genuine browser/permission/subscription state,
 * never a hardcoded "supported" claim. Permission is only ever requested
 * from the explicit "Enable" click below, never on page load.
 */
export default function PushNotificationSettings() {
  const [capability, setCapability] = useState<PushCapability | "checking">("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    detectPushCapability().then(setCapability);
  }, []);

  async function handleEnable() {
    setBusy(true);
    setMessage(null);
    const result = await subscribeToPush();
    setBusy(false);
    if (result.ok) {
      setCapability("subscribed");
      setMessage("Notifications are enabled on this device.");
      return;
    }
    if (result.reason === "permission-denied") setCapability("denied");
    setMessage(
      result.reason === "unsupported"
        ? "Push notifications aren't supported in this browser."
        : result.reason === "permission-denied"
          ? "Permission was denied. Re-enable notifications from your browser's site settings to try again."
          : result.reason === "no-public-key"
            ? "Push isn't configured on this deployment yet."
            : "Couldn't enable notifications. Try again."
    );
  }

  async function handleDisable() {
    setBusy(true);
    await unsubscribeFromPush();
    setBusy(false);
    setCapability("granted-not-subscribed");
    setMessage("Notifications turned off on this device.");
  }

  async function handleTest() {
    setBusy(true);
    setMessage(null);
    const result = await sendTestPush();
    setBusy(false);
    setMessage(result.message);
  }

  return (
    <Surface className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Push notifications on this device</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">Draftpace only sends what your categories below allow, at the privacy level you chose.</p>
        </div>
        {capability === "subscribed" && <Badge tone="success">On</Badge>}
        {capability === "denied" && <Badge tone="danger">Blocked</Badge>}
        {capability === "unsupported" && <Badge tone="neutral">Unavailable</Badge>}
      </div>

      {capability === "checking" && <p className="text-[13px] text-[var(--muted)]">Checking this browser…</p>}

      {capability === "unsupported" && <Alert tone="info">Notifications aren&apos;t supported in this browser. Everything else in Draftpace still works.</Alert>}

      {capability === "denied" && (
        <Alert tone="warning">Notifications are blocked in this browser&apos;s site settings. Re-enable them there, then reload this page.</Alert>
      )}

      {(capability === "default" || capability === "granted-not-subscribed") && (
        <Button size="sm" onClick={handleEnable} disabled={busy}>
          {busy ? "Enabling…" : "Enable on this device"}
        </Button>
      )}

      {capability === "subscribed" && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleTest} disabled={busy}>
            {busy ? "Sending…" : "Send a test notification"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDisable} disabled={busy}>
            Turn off on this device
          </Button>
        </div>
      )}

      {message && <p className="text-[12px] text-[var(--muted)]">{message}</p>}
    </Surface>
  );
}
