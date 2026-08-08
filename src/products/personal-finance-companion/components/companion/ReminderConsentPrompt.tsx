"use client";

import { useState } from "react";
import Surface from "@/design-system/Surface";
import Toggle from "@/design-system/Toggle";
import Button from "@/design-system/Button";
import { NOTIFICATION_CATEGORY_LABEL, defaultNotificationPreferences, type NotificationCategory } from "../../notificationPreferences";
import { saveNotificationPreferences } from "../../domain/notificationPreferences";

const OFFERED_CATEGORIES: NotificationCategory[] = ["billsAndObligations", "subscriptionRenewals", "expectedIncome", "debtDates"];

/**
 * Contextual, one-time notification consent (launch spec Stage C §16) —
 * shown only after Companion has genuinely collected dates worth
 * remembering, never on first entry. Saves a preference record; does not
 * request OS/browser Push permission, since no real push transport exists
 * yet (see notifications.ts) — there is nothing honest to ask permission
 * for. "Not now" is a first-class, equally-sized choice, not a dismiss-X.
 */
export default function ReminderConsentPrompt({ instanceId, onDone }: { instanceId: string; onDone: () => void }) {
  const [selected, setSelected] = useState<Set<NotificationCategory>>(new Set(["billsAndObligations", "subscriptionRenewals", "debtDates"]));
  const [saving, setSaving] = useState(false);

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
    const prefs = defaultNotificationPreferences();
    for (const category of selected) prefs.categories[category] = true;
    await saveNotificationPreferences(instanceId, prefs);
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
