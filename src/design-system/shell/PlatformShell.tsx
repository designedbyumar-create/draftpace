"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CreditCard,
  type DraftpaceIcon,
  Home,
  LifeBuoy,
  LogOut,
  Settings,
  Sparkles,
  User,
  Wifi,
  WifiOff,
  X,
} from "@/design-system/Icon";
import { supabase } from "@/lib/supabase/client";
import ThemeToggle from "@/design-system/theme/ThemeToggle";
import { useSession } from "@/design-system/shell/SessionProvider";

const primaryNav = [
  { label: "Home", href: "/app", Icon: Home },
  { label: "Library", href: "/app/library", Icon: BookOpen },
];

const accountNav = [
  { label: "Notifications", href: "/app/notifications", Icon: Bell },
  { label: "Account", href: "/app/account", Icon: User },
  { label: "Settings", href: "/app/settings", Icon: Settings },
  { label: "Billing", href: "/app/billing", Icon: CreditCard },
  { label: "Support", href: "/app/support", Icon: LifeBuoy },
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
  const user = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
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
    const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "there";
    return String(name).split(" ")[0];
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text)]">
      {/* Desktop rail */}
      <aside className="hidden w-[220px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-3 py-4 lg:flex lg:flex-col xl:w-[248px] xl:px-4 xl:py-5">
        <Link href="/app" className="flex items-center gap-3 px-2">
          <Image
            src="/logo/draftpace-brand-logo.svg"
            alt="Draftpace"
            width={144}
            height={45}
            priority
          />
        </Link>

        <nav aria-label="Platform" className="mt-7 space-y-0.5">
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <p className="mb-1.5 mt-6 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
          Account
        </p>
        <nav aria-label="Account" className="space-y-0.5">
          {accountNav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
        >
          <LogOut size={17} aria-hidden />
          Sign out
        </button>
      </aside>

      {/* Mobile overflow sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-[var(--surface)] p-4 pb-[max(env(safe-area-inset-bottom),16px)] shadow-[var(--shadow-md)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-bold text-[var(--text)]">{user.email}</p>
              <button
                type="button"
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)]"
                onClick={() => setMenuOpen(false)}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <nav aria-label="Account" className="space-y-0.5">
              {accountNav.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href} onClick={() => setMenuOpen(false)} />
              ))}
            </nav>
            <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2.5">
              <span className="text-[13px] font-semibold text-[var(--muted)]">Theme</span>
              <ThemeToggle compact />
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]"
            >
              <LogOut size={17} aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col bg-[var(--app-bg)]">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-2.5 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
                {online ? "Draftpace" : "Draftpace — offline"}
              </p>
              <h1 className="mt-0.5 truncate text-[18px] font-semibold tracking-tight text-[var(--text)]">
                {title || `Good ${getDayPart()}, ${firstName}`}
              </h1>
              {subtitle && <p className="mt-1 truncate text-[12px] leading-4 text-[var(--muted)]">{subtitle}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:block">
                <ThemeToggle compact />
              </div>
              <div className="hidden h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 text-[12px] font-semibold text-[var(--muted)] sm:flex">
                {online ? <Wifi size={14} aria-hidden /> : <WifiOff size={14} aria-hidden />}
                {online ? "Online" : "Offline"}
              </div>
              {action}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">{children}</div>
      </main>

      {/* Mobile bottom nav — kept to the primary destinations plus one
          overflow trigger, per docs/DESIGN-SYSTEM.md's "don't overcrowd
          mobile navigation" rule. */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/96 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-3 gap-1">
          {primaryNav.map((item) => (
            <BottomNavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Account menu"
            className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold ${
              accountNav.some((item) => item.href === pathname)
                ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                : "text-[var(--faint)]"
            }`}
          >
            <User size={18} aria-hidden />
            Account
          </button>
        </div>
      </nav>
    </div>
  );
}

type NavItem = { label: string; href: string; Icon: DraftpaceIcon };

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
      }`}
    >
      <item.Icon size={18} aria-hidden />
      {item.label}
    </Link>
  );
}

function BottomNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold ${
        active ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--faint)]"
      }`}
    >
      <item.Icon size={18} aria-hidden />
      {item.label}
    </Link>
  );
}

function getDayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
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
    <section className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
        <Sparkles size={17} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[var(--text)]">Install Draftpace</p>
        <p className="text-[12px] leading-5 text-[var(--muted)]">Open straight into the platform like a real app.</p>
      </div>
      <button
        onClick={install}
        className="shrink-0 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-[12px] font-semibold text-[var(--primary-contrast)]"
      >
        Install
      </button>
    </section>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};
