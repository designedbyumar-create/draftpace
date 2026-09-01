"use client";

import { useEffect, useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Surface from "@/design-system/Surface";
import SettingsRow from "@/components/platform/SettingsRow";
import Toggle from "@/design-system/Toggle";
import Alert from "@/design-system/Alert";
import Badge from "@/design-system/Badge";
import { Bell } from "@/design-system/Icon";

type PermissionState = NotificationPermission | "unsupported" | "checking";

export default function NotificationsPage() {
  const [permission, setPermission] = useState<PermissionState>("checking");
  const [quietHours, setQuietHours] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <PlatformShell title="Notifications" subtitle="Control and review product communication">
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Inbox</h2>
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="Once a product sends you something, it appears here — nothing is fabricated in the meantime."
          />
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Permission</h2>
          <Surface>
            {permission === "checking" ? (
              <p className="text-[13px] text-[var(--muted)]">Checking browser support…</p>
            ) : permission === "unsupported" ? (
              <Alert tone="warning">Push notifications aren&apos;t supported in this browser.</Alert>
            ) : permission === "granted" ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] text-[var(--text)]">Browser notifications are enabled.</p>
                <Badge tone="success">Granted</Badge>
              </div>
            ) : permission === "denied" ? (
              <Alert tone="danger">
                Notifications are blocked in your browser settings. Re-enable them from your browser&apos;s site
                permissions to receive reminders.
              </Alert>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-[var(--text)]">Enable browser notifications</p>
                  <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                    We ask only when you choose to — never before you&apos;ve seen why it&apos;s useful.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestPermission}
                  className="shrink-0 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-[12px] font-semibold text-[var(--primary-contrast)]"
                >
                  Enable
                </button>
              </div>
            )}
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Preferences</h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Quiet hours" description="No pushes between 9 PM and 8 AM, your local time.">
                <Toggle checked={quietHours} onChange={setQuietHours} label="Quiet hours" />
              </SettingsRow>
              <SettingsRow label="Channels" description="Push, email, and in-app — configured per product." unavailable />
              <SettingsRow label="Per-product controls" description="Mute or adjust reminders for a specific product." unavailable />
            </div>
          </Surface>
        </section>
      </div>
    </PlatformShell>
  );
}
