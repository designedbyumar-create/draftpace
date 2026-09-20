"use client";

import Alert from "@/design-system/Alert";
import Button from "@/design-system/Button";
import Select from "@/design-system/Select";
import Toggle from "@/design-system/Toggle";
import type { PushCapability } from "@/lib/notifications/pushClient";
import type { ReminderPreferences } from "../reminders";

/**
 * Settings, which is reminders and nothing else.
 *
 * Every control on this screen does something real. The two that only make
 * sense once reminders are on are not shown until then, and the toggle
 * itself refuses honestly when this device cannot receive a notification,
 * rather than looking on and doing nothing.
 *
 * Presentational only. Saving, and asking the browser for permission, stay
 * in SettingsModule.
 */

export interface SettingsViewProps {
  prefs: ReminderPreferences;
  capability: PushCapability | "checking";
  busy: boolean;
  message: string | null;
  onRemindersChange: (on: boolean) => void;
  onDetailChange: (on: boolean) => void;
  onQuietChange: (startHour: number, endHour: number) => void;
  onTest: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** 21 to "21:00". Twenty-four hour, so nobody has to work out whether "9" means morning. */
function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export default function SettingsView({
  prefs,
  capability,
  busy,
  message,
  onRemindersChange,
  onDetailChange,
  onQuietChange,
  onTest,
}: SettingsViewProps) {
  const blocked = capability === "denied" || capability === "unsupported";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Settings</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          Reminders
        </h1>
        <p className="mt-2 max-w-[52ch] text-[14px] leading-6 text-[var(--muted)]">
          Off unless you switch it on. When it is on, this only ever reminds you about a date you chose yourself.
          Nothing else here sends anything.
        </p>
      </header>

      <section className="flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[15px] font-medium text-[var(--text)]">Remind me on the date I chose</p>
            <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
              One notification on this device, once, when the day comes.
            </p>
          </div>
          <Toggle
            checked={prefs.remindersEnabled}
            onChange={onRemindersChange}
            label="Remind me on the date I chose"
            disabled={busy || (blocked && !prefs.remindersEnabled)}
          />
        </div>

        {capability === "denied" && (
          <Alert tone="warning">
            Notifications are blocked in this browser&apos;s site settings. Allow them there, reload, and this will
            switch on.
          </Alert>
        )}
        {capability === "unsupported" && (
          <Alert tone="info">
            This browser cannot receive notifications, so reminders are not available here. Everything else works.
          </Alert>
        )}

        {prefs.remindersEnabled && (
          <>
            <div className="flex items-start justify-between gap-4 border-t border-[var(--border)] pt-5">
              <div>
                <p className="text-[15px] font-medium text-[var(--text)]">Say what it is about</p>
                <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
                  Off, the notification only says you have a reminder. On, it shows the thing itself, which anyone
                  looking at your lock screen can read.
                </p>
              </div>
              <Toggle
                checked={prefs.showDetail}
                onChange={onDetailChange}
                label="Say what it is about"
                disabled={busy}
              />
            </div>

            <div className="border-t border-[var(--border)] pt-5">
              <p className="text-[15px] font-medium text-[var(--text)]">Quiet hours</p>
              <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
                Nothing is sent in this window. A reminder that arrives during it goes out afterwards.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Select
                  label="From"
                  value={prefs.quietStartHour}
                  disabled={busy}
                  onChange={(event) => onQuietChange(Number(event.target.value), prefs.quietEndHour)}
                >
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hourLabel(hour)}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Until"
                  value={prefs.quietEndHour}
                  disabled={busy}
                  onChange={(event) => onQuietChange(prefs.quietStartHour, Number(event.target.value))}
                >
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hourLabel(hour)}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="mt-2 text-[12px] text-[var(--faint)]">Times are in {prefs.timezone}.</p>
            </div>

            {capability === "subscribed" && (
              <div className="border-t border-[var(--border)] pt-5">
                <Button size="sm" variant="secondary" onClick={onTest} disabled={busy}>
                  Send a test notification
                </Button>
              </div>
            )}
          </>
        )}

        {message && (
          <p role="status" className="text-[13px] text-[var(--muted)]">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
