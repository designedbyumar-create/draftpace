"use client";

import { useEffect, useState } from "react";
import Surface from "@/design-system/Surface";
import Toggle from "@/design-system/Toggle";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import { NOTIFICATION_CATEGORY_LABEL, defaultNotificationPreferences, type NotificationCategory } from "../../notificationPreferences";
import { saveNotificationPreferences } from "../../domain/notificationPreferences";
import { subscribeToPush } from "@/lib/notifications/pushClient";
import { useStandaloneMode, isIosDevice } from "@/lib/pwa/hooks";

const OFFERED_CATEGORIES: NotificationCategory[] = ["billsAndObligations", "subscriptionRenewals", "expectedIncome", "debtDates"];

/**
 * Contextual, one-time notification consent (launch spec Stage C §16,
 * extended Stage F) — shown only after Companion has genuinely collected
 * dates worth remembering, never on first entry. Saves the preference
 * record first (always succeeds regardless of what happens next), then —
 * only because the user just deliberately clicked "Set my reminders" —
 * requests real OS/browser Push permission. If permission is denied or
 * push isn't supported, the preferences are still saved; there's simply
 * nothing to deliver to on this device yet — that outcome is shown, not
 * swallowed, so the choice this device just made is never a silent no-op.
 * On iOS Safari before it's added to the Home Screen, push permission
 * can't be requested at all, so this skips straight to that explanation
 * instead of attempting (and silently failing) a subscribe. "Not now"
 * stays a first-class, equally-sized choice, not a dismiss-X, and never
 * requests permission.
 */
export default function ReminderConsentPrompt({ instanceId, onDone }: { instanceId: string; onDone: () => void }) {
  const [selected, setSelected] = useState<Set<NotificationCategory>>(new Set(["billsAndObligations", "subscriptionRenewals", "debtDates"]));
  const [saving, setSaving] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const standalone = useStandaloneMode();
  const [iosNotInstalled, setIosNotInstalled] = useState(false);

  useEffect(() => {
    setIosNotInstalled(isIosDevice() && !standalone);
  }, [standalone]);

  function toggle(category: NotificationCategory) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  async function setReminders() {
    setSaving(true);
    setPushMessage(null);
    const prefs = defaultNotificationPreferences();
    for (const category of selected) prefs.categories[category] = true;
    await saveNotificationPreferences(instanceId, prefs);

    if (!iosNotInstalled) {
      const result = await subscribeToPush().catch(() => ({ ok: false as const, reason: "network" as const }));
      if (!result.ok && result.reason === "permission-denied") {
        setPushMessage(
          "Your reminders are saved. Notifications are blocked in this browser, so nothing will pop up here until you allow them in your browser's site settings."
        );
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onDone();
  }

  return (
    <Surface elevated className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Remembering dates</p>
        <h2 className="mt-1 text-[17px] font-semibold text-[var(--text)]">
          You&apos;ve given Draftpace some dates that matter. Should Personal Finance Companion remember them with you?
        </h2>
        <p className="mt-1.5 text-[12px] text-[var(--muted)]">Nothing is sent unless you choose it here. You can change this anytime in Settings.</p>
      </div>

      <div className="flex flex-col gap-2">
        {OFFERED_CATEGORIES.map((category) => (
          <div key={category} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
            <span className="text-[13px] font-medium text-[var(--text)]">{NOTIFICATION_CATEGORY_LABEL[category]}</span>
            <Toggle checked={selected.has(category)} onChange={() => toggle(category)} label={NOTIFICATION_CATEGORY_LABEL[category]} />
          </div>
        ))}
      </div>

      {iosNotInstalled && (
        <Alert tone="info">
          Add Draftpace to your Home Screen first (tap Share, then &quot;Add to Home Screen&quot;) to receive these
          as real notifications. Your reminder choices are saved either way.
        </Alert>
      )}

      {pushMessage && <Alert tone="warning">{pushMessage}</Alert>}

      <div className="flex flex-wrap gap-2.5">
        <Button size="md" variant="secondary" onClick={onDone} disabled={saving}>
          Not now
        </Button>
        <Button size="md" onClick={setReminders} disabled={saving}>
          {saving ? "Saving…" : "Set my reminders"}
        </Button>
      </div>
    </Surface>
  );
}
