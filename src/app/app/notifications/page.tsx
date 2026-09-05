"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import SettingsRow from "@/components/platform/SettingsRow";
import Toggle from "@/design-system/Toggle";
import Alert from "@/design-system/Alert";
import Badge from "@/design-system/Badge";
import { Bell, WarningCircle } from "@/design-system/Icon";
import { listMyUpdates, markUpdateHandled, type UpdateRow } from "@/product-framework/updates";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

type PermissionState = NotificationPermission | "unsupported" | "checking";

/**
 * "Updates", not "Notifications" — this is the honest, always-true surface
 * behind Draftpace's actual promise ("stay updated without the hassle of
 * notifications"): web push opt-in is rare, so most people's only real
 * record of what a product told them lives here, not in a browser
 * permission they never granted. URL is unchanged on purpose; this is a
 * content/title change to the same route, not a new one.
 */
export default function NotificationsPage() {
  const [permission, setPermission] = useState<PermissionState>("checking");
  const [quietHours, setQuietHours] = useState(true);
  const [rows, setRows] = useState<UpdateRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    let cancelled = false;
    listMyUpdates().then((result) => {
      if (cancelled) return;
      if (result.status === "error") {
        setLoadError(result.message);
        setRows(null);
        return;
      }
      setLoadError(null);
      setRows(result.rows);
    });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const handleAcknowledge = async (id: string) => {
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, acknowledgedAt: new Date().toISOString() } : row)) ?? current);
    await markUpdateHandled(id);
  };

  return (
    <PlatformShell title="Updates" subtitle="What each product actually told you, in one place">
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Updates</h2>
          {rows === null && !loadError ? (
            <p className="text-[13px] text-[var(--muted)]">Loading…</p>
          ) : loadError ? (
            <EmptyState
              icon={WarningCircle}
              title="Couldn't load your updates"
              description="This was just a read failure, check your connection and try again."
              action={
                <Button size="md" onClick={() => setRetryToken((t) => t + 1)}>
                  Try again
                </Button>
              }
            />
          ) : rows && rows.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nothing yet"
              description="When a product has something worth telling you, it shows up here — nothing is fabricated in the meantime."
            />
          ) : (
            <Surface padded={false}>
              <div className="divide-y divide-[var(--border)] px-5">
                {rows!.map((row) => (
                  <UpdateRowView key={row.id} row={row} onAcknowledge={handleAcknowledge} />
                ))}
              </div>
            </Surface>
          )}
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

/** One recorded update: what a product said, when, and a way to see it and clear it. */
function UpdateRowView({ row, onAcknowledge }: { row: UpdateRow; onAcknowledge: (id: string) => void }) {
  const handled = row.acknowledgedAt !== null;
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold text-[var(--text)]">{row.title}</p>
          {!handled && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />}
        </div>
        <p className="mt-1 text-[12.5px] leading-5 text-[var(--muted)]">{row.body}</p>
        <div className="mt-2 flex items-center gap-3">
          <p className="text-[12px] text-[var(--faint)]">{formatRelativeTime(row.createdAt)}</p>
          <Link href={row.url} className="text-[12px] font-semibold text-[var(--primary)] hover:underline">
            Open
          </Link>
        </div>
      </div>
      {!handled && (
        <button
          type="button"
          onClick={() => onAcknowledge(row.id)}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
        >
          Mark as handled
        </button>
      )}
    </div>
  );
}
