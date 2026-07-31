"use client";

import { useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import { useSession } from "@/design-system/shell/SessionProvider";
import { supabase } from "@/lib/supabase/client";
import ThemeToggle from "@/design-system/theme/ThemeToggle";
import { useAccessibility, TextScale } from "@/design-system/theme/AccessibilityProvider";
import SettingsRow from "@/components/platform/SettingsRow";
import Toggle from "@/design-system/Toggle";
import Surface from "@/design-system/Surface";

const TEXT_SCALE_OPTIONS: { value: TextScale; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
  { value: "larger", label: "Larger" },
];

export default function SettingsPage() {
  const user = useSession();
  const { textScale, setTextScale, reduceMotion, setReduceMotion } = useAccessibility();
  const [reminderTime, setReminderTime] = useState(String(user.user_metadata?.reminder_time || "9:00 AM"));
  const [saving, setSaving] = useState(false);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const saveReminderTime = async (value: string) => {
    setReminderTime(value);
    setSaving(true);
    await supabase.auth.updateUser({ data: { reminder_time: value } });
    setSaving(false);
  };

  return (
    <PlatformShell title="Settings" subtitle="Preferences that apply across every product">
      <div className="space-y-8">
        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Appearance</h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Theme" description="System follows your device automatically.">
                <ThemeToggle compact />
              </SettingsRow>
              <SettingsRow label="Text size" description="Applies across the whole platform.">
                <div className="inline-flex rounded-lg border border-[var(--border-strong)] p-1">
                  {TEXT_SCALE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTextScale(option.value)}
                      aria-pressed={textScale === option.value}
                      className={`rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition ${
                        textScale === option.value
                          ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                          : "text-[var(--muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </SettingsRow>
              <SettingsRow label="Reduce motion" description="Overrides your device setting on Draftpace only.">
                <Toggle checked={reduceMotion} onChange={setReduceMotion} label="Reduce motion" />
              </SettingsRow>
            </div>
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Locale and timezone
          </h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Timezone" description={`Detected automatically as ${timezone}.`} unavailable />
              <SettingsRow label="Language and region" description="Only English is available today." unavailable />
            </div>
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Platform preferences
          </h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Reminder rhythm" description={saving ? "Saving…" : "When Draftpace should nudge you, once notifications are enabled."}>
                <select
                  value={reminderTime}
                  onChange={(event) => saveReminderTime(event.target.value)}
                  className="h-9 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[13px] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  {["7:30 AM", "9:00 AM", "12:30 PM", "6:00 PM", "8:30 PM"].map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </SettingsRow>
            </div>
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Privacy defaults
          </h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Include values in shared outcome cards" description="Off by default, per product." unavailable />
              <SettingsRow label="Product usage analytics" description="Aggregated, never sold." unavailable />
            </div>
          </Surface>
        </section>
      </div>
    </PlatformShell>
  );
}
