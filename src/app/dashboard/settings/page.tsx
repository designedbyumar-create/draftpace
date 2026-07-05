"use client";

import { useEffect, useState } from "react";
import { Bell, CreditCard, Download, LogOut, Moon, Shield, Smartphone, Trash2, type DraftpaceIcon } from "@/components/ui/Icon";
import AppShell, { AppCard, InstallPromptCard } from "@/components/app/AppShell";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { supabase } from "@/lib/supabase";

type LocalProfile = {
  reminderTime?: string;
  goal?: string;
  focus?: string[];
};

function readProfile(): LocalProfile {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("draftpace-profile") || "{}");
  } catch {
    return {};
  }
}

function saveProfile(profile: LocalProfile) {
  window.localStorage.setItem("draftpace-profile", JSON.stringify(profile));
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<LocalProfile>({});
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [savingBilling, setSavingBilling] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
    if (!("Notification" in window)) setPermission("unsupported");
    else setPermission(Notification.permission);
  }, []);

  const updateReminder = (time: string) => {
    const next = { ...profile, reminderTime: time };
    setProfile(next);
    saveProfile(next);
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const next = await Notification.requestPermission();
    setPermission(next);

    if (next === "granted") {
      new Notification("Draftpace reminders enabled", {
        body: `We'll keep reminders calm and useful around ${profile.reminderTime || "9:00 AM"}.`,
        icon: "/logo/dp-monogram-indigo.svg",
      });
      await registerPushSubscription();
    }
  };

  const registerPushSubscription = async () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });
  };

  const openBilling = async () => {
    setSavingBilling(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        window.alert("Please sign in before opening billing.");
        return;
      }
      const response = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (payload.url) window.location.href = payload.url;
      else window.alert(payload.error || "Billing is not configured yet.");
    } finally {
      setSavingBilling(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <AppShell title="Settings" subtitle="Theme, reminders, billing, and app preferences.">
      <div className="space-y-4">
        <InstallPromptCard />

        <AppCard className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Moon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-[var(--text)]">App mood</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Light for clarity, Calm for pastel softness, Calm Dark for low-glare planning.
              </p>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </AppCard>

        <AppCard className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Bell size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-[var(--text)]">Notifications</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Streak nudges should feel useful, not noisy. Pick a reminder time and enable this device when ready.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["7:30 AM", "9:00 AM", "6:00 PM", "8:30 PM"].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => updateReminder(time)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-black ${
                      (profile.reminderTime || "9:00 AM") === time
                        ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={requestNotifications}
                className="mt-3 w-full rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-[var(--primary-contrast)]"
              >
                {permission === "granted"
                  ? "Notifications enabled"
                  : permission === "denied"
                    ? "Notifications blocked by browser"
                    : permission === "unsupported"
                      ? "Notifications unsupported"
                      : "Enable reminders on this device"}
              </button>
            </div>
          </div>
        </AppCard>

        <SettingsRow
          Icon={CreditCard}
          title="Manage billing"
          body="Secure Stripe billing portal. Requires Stripe env vars in production."
          action={savingBilling ? "Opening..." : "Open"}
          onClick={openBilling}
        />
        <SettingsRow
          Icon={Smartphone}
          title="PWA app"
          body="Draftpace starts at the dashboard when installed from your home screen."
          action="Ready"
        />
        <SettingsRow
          Icon={Download}
          title="Offline sync"
          body="Planner entries save locally first, then sync when the backend is connected."
          action="Queued"
        />
        <SettingsRow
          Icon={Shield}
          title="Privacy"
          body="Your planner entries should remain private to your Supabase user."
          action="View"
          onClick={() => window.open("/privacy", "_blank")}
        />
        <SettingsRow
          Icon={Trash2}
          title="Delete account"
          body="Requires a server-side Supabase admin function before enabling."
          action="Locked"
        />
        <SettingsRow Icon={LogOut} title="Sign out" body="Your local planner cache stays on this device." action="Sign out" onClick={signOut} />
      </div>
    </AppShell>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function SettingsRow({
  Icon,
  title,
  body,
  action,
  onClick,
}: {
  Icon: DraftpaceIcon;
  title: string;
  body: string;
  action: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 text-left disabled:cursor-default"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--primary)]">
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-[var(--text)]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{body}</p>
      </div>
      <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-[11px] font-black text-[var(--muted)]">
        {action}
      </span>
    </button>
  );
}
