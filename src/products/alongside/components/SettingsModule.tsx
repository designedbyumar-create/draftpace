"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import { Settings } from "@/design-system/Icon";
import {
  detectPushCapability,
  sendTestPush,
  subscribeToPush,
  type PushCapability,
} from "@/lib/notifications/pushClient";
import { describeResultError } from "@/product-framework/result";
import { DEFAULT_REMINDER_PREFERENCES, type ReminderPreferences } from "../reminders";
import { deviceTimezone, loadReminderPreferences, saveReminderPreferences } from "../domain/reminderPreferences";
import SettingsView from "./SettingsView";
import { useAlongside } from "./useAlongside";

/**
 * Settings. Reminders are opt-in: nothing is sent until somebody switches
 * them on here, and switching on is also the one deliberate moment the
 * browser is asked for permission, never on page load.
 */
export default function SettingsModule() {
  const { status, errorMessage, instanceId } = useAlongside();
  const [prefs, setPrefs] = useState<ReminderPreferences>({
    ...DEFAULT_REMINDER_PREFERENCES,
    timezone: deviceTimezone(),
  });
  const [loaded, setLoaded] = useState(false);
  const [capability, setCapability] = useState<PushCapability | "checking">("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    detectPushCapability().then(setCapability);
  }, []);

  useEffect(() => {
    if (!instanceId) return;
    let cancelled = false;
    loadReminderPreferences(instanceId).then((result) => {
      if (cancelled) return;
      if (result.ok) setPrefs(result.data);
      else setMessage(describeResultError(result.error));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [instanceId]);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState
        icon={Settings}
        title="Nothing to show yet"
        description="This product has not been set up on your account."
      />
    );
  }
  if (status === "error") {
    return <EmptyState icon={Settings} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId || !loaded) return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;

  async function save(next: ReminderPreferences): Promise<boolean> {
    setBusy(true);
    const result = await saveReminderPreferences(instanceId as string, next);
    setBusy(false);
    if (!result.ok) {
      setMessage(describeResultError(result.error));
      return false;
    }
    setPrefs(result.data);
    return true;
  }

  async function changeReminders(on: boolean) {
    setMessage(null);
    if (!on) {
      if (await save({ ...prefs, remindersEnabled: false })) setMessage("Reminders are off. Nothing will be sent.");
      return;
    }
    // Switching on is the deliberate moment to ask this device for permission.
    if (capability !== "subscribed") {
      setBusy(true);
      const result = await subscribeToPush();
      setBusy(false);
      if (!result.ok) {
        if (result.reason === "permission-denied") setCapability("denied");
        setMessage(
          result.reason === "unsupported"
            ? "This browser cannot receive notifications."
            : result.reason === "permission-denied"
              ? "Permission was not given, so reminders stay off."
              : result.reason === "no-public-key"
                ? "Notifications are not set up on this deployment yet, so reminders stay off."
                : "Could not switch notifications on. Try again.",
        );
        return;
      }
      setCapability("subscribed");
    }
    if (await save({ ...prefs, remindersEnabled: true, timezone: deviceTimezone() })) {
      setMessage("Reminders are on. You will only hear about dates you chose.");
    }
  }

  async function test() {
    setBusy(true);
    setMessage(null);
    const result = await sendTestPush();
    setBusy(false);
    setMessage(result.message);
  }

  return (
    <SettingsView
      prefs={prefs}
      capability={capability}
      busy={busy}
      message={message}
      onRemindersChange={changeReminders}
      onDetailChange={(on) => void save({ ...prefs, showDetail: on })}
      onQuietChange={(quietStartHour, quietEndHour) => void save({ ...prefs, quietStartHour, quietEndHour })}
      onTest={test}
    />
  );
}
