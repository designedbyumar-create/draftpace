"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CreditCard,
  type DraftpaceIcon,
  Globe,
  Home,
  LifeBuoy,
  LogOut,
  Settings,
  Sparkles,
  User,
  Wifi,
  WifiOff,
} from "@/design-system/Icon";
import ThemeToggle from "@/design-system/theme/ThemeToggle";
import { useSession } from "@/design-system/shell/SessionProvider";
import { Logo } from "@/design-system/Logo";
import Avatar from "@/design-system/Avatar";
import AccountMenu from "@/components/account/AccountMenu";
import { appAccountMenuItems } from "@/components/account/accountMenuItems";
import { signOutAndRedirect } from "@/lib/supabase/signOut";

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

/**
 * The mobile bottom navigation's three direct-link slots, exported so its
 * route configuration is a real, independently testable data structure
 * rather than something only checkable by reading JSX. The fourth slot
 * (Account) isn't a plain link, it opens AccountMenu's sheet, see the JSX
 * below for that binding.
 */
export const BOTTOM_NAV_LINKS = [
  { label: "Home", href: "/app", Icon: Home },
  { label: "Library", href: "/app/library", Icon: BookOpen },
  { label: "Notifications", href: "/app/notifications", Icon: Bell },
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

  const accountLabel = user.user_metadata?.display_name || user.email || "Account";
  const accountItems = useMemo(() => appAccountMenuItems(() => signOutAndRedirect("/")), []);
  const accountActive = accountNav.some((item) => item.href === pathname);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text)]">
      {/* Desktop rail */}
      <aside className="hidden w-[220px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-3 py-4 lg:flex lg:flex-col xl:w-[248px] xl:px-4 xl:py-5">
        <Link href="/app" className="flex items-center gap-3 px-2">
          <Logo height={44} />
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

        <div className="mt-auto space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
          >
            <Globe size={17} aria-hidden />
            Visit Draftpace website
          </Link>
          <button
            type="button"
            onClick={() => signOutAndRedirect("/")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
          >
            <LogOut size={17} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[var(--app-bg)]">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-2.5 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
                {online ? "Draftpace" : "Draftpace, offline"}
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
              <div className="lg:hidden">
                <AccountMenu items={accountItems} label={accountLabel} only="mobile" />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">{children}</div>
      </main>

      {/* Mobile bottom nav: the four platform destinations. Product
          destinations (This Month/Progress/History, etc.) live entirely
          inside ProductShell and never merge into this bar. */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/96 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-4 gap-1">
          {BOTTOM_NAV_LINKS.map((item) => (
            <BottomNavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
          <AccountMenu
            items={accountItems}
            label={accountLabel}
            only="mobile"
            renderMobileTrigger={({ onClick, ref }) => (
              <button
                ref={ref}
                type="button"
                onClick={onClick}
                aria-label="Account menu"
                className={`flex h-14 w-full flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold ${
                  accountActive ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--faint)]"
                }`}
              >
                {accountActive ? <Avatar label={accountLabel} size="sm" className="h-[18px] w-[18px] text-[8px]" /> : <User size={18} aria-hidden />}
                Account
              </button>
            )}
          />
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
