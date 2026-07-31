"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LogOut, Menu, Sparkles, Wifi, WifiOff, X } from "@/design-system/Icon";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/design-system/theme/ThemeToggle";
import { useAuthSession } from "@/design-system/shell/AuthGate";

const nav = [
  { label: "Home", href: "/app", Icon: Home },
  { label: "Library", href: "/app/library", Icon: BookOpen },
];

export default function PlatformShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const session = useAuthSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const firstName = useMemo(() => {
    const name =
      session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there";
    return String(name).split(" ")[0];
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text)]">
      <aside className="hidden w-[220px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-3 py-4 lg:flex lg:flex-col xl:w-[248px] xl:px-4 xl:py-5">
        <Link href="/app" className="flex items-center gap-3 px-2">
          <Image
            src="/logo/draftpace-brand-logo.svg"
            alt="Draftpace"
            width={152}
            height={47}
            priority
            className="h-auto w-[142px] xl:w-[152px]"
          />
        </Link>

        <nav className="mt-7 space-y-1">
          {nav.map(({ label, href, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-semibold transition ${
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                }`}
              >
                <Icon size={18} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-[13px] font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
        >
          <LogOut size={16} aria-hidden />
          Sign out
        </button>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div
            className="h-full w-[min(82vw,260px)] bg-[var(--surface)] p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Image
                src="/logo/draftpace-brand-logo.svg"
                alt="Draftpace"
                width={136}
                height={42}
                className="h-auto w-[132px]"
              />
              <button
                type="button"
                aria-label="Close menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)]"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <nav className="space-y-1">
              {nav.map(({ label, href, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-semibold transition ${
                      active
                        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    <Icon size={18} aria-hidden />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col bg-[var(--app-bg)]">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2.5 backdrop-blur sm:px-4 lg:px-6 xl:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--text)] lg:hidden"
              >
                <Menu size={18} aria-hidden />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">
                  {online ? "Draftpace" : "Draftpace — offline"}
                </p>
                <h1 className="mt-0.5 truncate text-[18px] font-black leading-tight tracking-tight text-[var(--text)]">
                  {title || `Good ${getDayPart()}, ${firstName}`}
                </h1>
                {subtitle && <p className="mt-1 truncate text-[12px] leading-4 text-[var(--muted)]">{subtitle}</p>}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:block">
                <ThemeToggle compact />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)] sm:w-auto sm:gap-2 sm:px-3 sm:text-[12px] sm:font-semibold">
                {online ? <Wifi size={15} aria-hidden /> : <WifiOff size={15} aria-hidden />}
                <span className="hidden sm:inline">{online ? "Online" : "Offline"}</span>
              </div>
              {action}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 lg:px-8 lg:pb-8">{children}</div>
      </main>

      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/96 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-2 gap-1">
          {nav.map(({ label, href, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold ${
                  active ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--faint)]"
                }`}
              >
                <Icon size={18} aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function getDayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function AppCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </section>
  );
}

export function AppBadge({
  children,
  tone = "primary",
}: {
  children: React.ReactNode;
  tone?: "primary" | "green" | "orange" | "muted";
}) {
  const styles = {
    primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    muted: "bg-[var(--surface-muted)] text-[var(--muted)]",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[tone]}`}>{children}</span>;
}

export function InstallPromptCard() {
  const [canInstall, setCanInstall] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    setPromptEvent(null);
    setCanInstall(false);
  };

  if (!canInstall) return null;

  return (
    <AppCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Sparkles size={18} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--text)]">Install Draftpace</p>
          <p className="text-xs leading-5 text-[var(--muted)]">Open straight into the platform like a real app.</p>
        </div>
        <button
          onClick={install}
          className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-contrast)]"
        >
          Install
        </button>
      </div>
    </AppCard>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};
