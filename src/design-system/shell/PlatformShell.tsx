"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellRinging,
  CaretDown,
  CaretLineLeft,
  CaretLineRight,
  CreditCard,
  type DraftpaceIcon,
  Globe,
  Home,
  Key,
  LifeBuoy,
  LogOut,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
  WifiOff,
} from "@/design-system/Icon";
import ThemeToggle from "@/design-system/theme/ThemeToggle";
import { useSession } from "@/design-system/shell/SessionProvider";
import { LogoMark } from "@/design-system/Logo";
import Avatar from "@/design-system/Avatar";
import AccountMenu from "@/components/account/AccountMenu";
import Tooltip from "@/design-system/Tooltip";
import CommandPalette, { type PaletteProduct } from "@/design-system/shell/CommandPalette";
import { appAccountMenuItems } from "@/components/account/accountMenuItems";
import { signOutAndRedirect } from "@/lib/supabase/signOut";
import { useInstallPrompt, useStandaloneMode, isIosDevice } from "@/lib/pwa/hooks";
import { hasDismissedInstallPrompt, dismissInstallPrompt } from "@/lib/pwa/deviceOnboarding";
import { hasUnhandledUpdates } from "@/product-framework/updates";
import { resolveAvatarSeed } from "@/product-framework/avatarSeed";
import { listMyEntitlements } from "@/product-framework/entitlements";
import { listMyProductInstances } from "@/product-framework/instances";
import { deriveOwnedProducts } from "@/product-framework/deriveOwnedProducts";
import { iconForProduct } from "@/product-framework/productIcons";
import { ensureProductsRegistered } from "@/products/manifest";

const primaryNav = [{ label: "Home", href: "/app", Icon: Home }];

const exploreCompanions = { label: "Explore Companions", href: "/shop", Icon: Plus };

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
  exploreCompanions,
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
  const [hasUpdates, setHasUpdates] = useState(false);
  // Deliberately starts null (not the real day part) so the server's render
  // matches the client's first render regardless of timezone — the server
  // (Vercel, a fixed region) and the visitor's browser can genuinely
  // disagree on "morning vs afternoon vs evening" for the same instant,
  // which was producing a real hydration mismatch (React error #418) on
  // every authenticated Platform Home load. Filled in client-side only,
  // same pattern as `online` above.
  const [dayPart, setDayPart] = useState<string | null>(null);
  const [ownedProducts, setOwnedProducts] = useState<PaletteProduct[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Device-local, like the install-prompt dismissal in deviceOnboarding.ts —
  // a rail width belongs to this browser, not the account, so it never
  // syncs across devices and a fresh session always starts expanded.
  const [collapsed, setCollapsed] = useState(false);
  // Starts open so nobody with a product or two ever sees a click-to-reveal
  // where a plain list used to be — this is purely a decluttering option
  // for an account approaching the whole series, not persisted anywhere.
  const [companionsOpen, setCompanionsOpen] = useState(true);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem("dp_sidebar_collapsed") === "1");
    } catch {
      // Storage unavailable — stay expanded, the safe default.
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem("dp_sidebar_collapsed", next ? "1" : "0");
      } catch {
        // Storage unavailable — the toggle still works for this load.
      }
      return next;
    });
  };

  // Fetched once per shell mount, not on every navigation: the sidebar's
  // product list and the command palette both read from this, so a newly
  // redeemed or bought product shows up on the next full load rather than
  // needing a live subscription neither surface has ever had.
  useEffect(() => {
    ensureProductsRegistered();
    let cancelled = false;
    Promise.all([listMyEntitlements(), listMyProductInstances()]).then(([entitlementsResult, instancesResult]) => {
      if (cancelled || entitlementsResult.status === "error") return;
      const rows = deriveOwnedProducts(entitlementsResult.rows, instancesResult);
      const products = rows
        .filter((row): row is Extract<typeof row, { kind: "ready" }> => row.kind === "ready")
        .map((row) => ({
          slug: row.definition.slug,
          title: row.definition.title,
          // Always the product's own companion page, never straight into
          // the tool: one click picks the product, a second (from that
          // page's own ownership bar) actually opens it. See
          // src/app/app/companions/[productSlug]/page.tsx.
          href: `/app/companions/${row.definition.slug}`,
          Icon: iconForProduct(row.definition.slug),
        }));
      setOwnedProducts(products);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The global Cmd/Ctrl+K binding — works from anywhere under the shell,
  // not just while a search field happens to be focused.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  useEffect(() => {
    setDayPart(getDayPart());
  }, []);

  // Drives the header's floating-to-docked transition on mobile: resting at
  // the very top of a page it reads as part of the page, then lifts into a
  // distinct card the moment there's content underneath it to float over.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A glyph swap, not a badge or dot — this shell's nav explicitly never
  // shows counts/badges/progress/notification dots, and an overlaid dot
  // would contradict that even coming from a different file. Refetched on
  // every route change so leaving the Updates page clears it once read.
  useEffect(() => {
    let cancelled = false;
    hasUnhandledUpdates().then((result) => {
      if (!cancelled) setHasUpdates(result);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const firstName = useMemo(() => {
    const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "there";
    return String(name).split(" ")[0];
  }, [user]);

  const accountLabel = user.user_metadata?.display_name || user.email || "Account";
  const accountSeed = resolveAvatarSeed(user);
  const accountItems = useMemo(() => appAccountMenuItems(() => signOutAndRedirect("/")), []);
  // Excludes Notifications: it's in accountNav for the desktop sidebar's
  // "Account" group, but on mobile it already has its own direct slot in
  // BOTTOM_NAV_LINKS, so counting it here would light up both tabs at once.
  const accountActive = accountNav.some((item) => item.href !== "/app/notifications" && item.href === pathname);

  // No overflow property here, on purpose: setting even one axis (e.g.
  // overflow-x-hidden) forces the browser to compute the other axis as
  // auto, which breaks position:sticky for every descendant (the header
  // included). The horizontal-scroll guard lives on html/body in
  // globals.css instead, the actual scrolling box, where it's free of
  // that side effect.
  return (
    <div className="flex min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      {/* Desktop rail. A three-region flex column, not one long scroll:
          the logo/search up top and the account actions at the bottom
          stay put no matter how many companions are owned — only the
          middle (nav + companions) scrolls. Scrolling a 9-row companion
          list used to carry "Visit Draftpace website" and "Sign out"
          away with it. */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] py-4 transition-[width] duration-[var(--dur)] ease-[var(--ease-out)] lg:flex xl:py-5 ${
          collapsed ? "w-[68px] xl:w-[68px]" : "w-[220px] xl:w-[248px]"
        }`}
      >
        <div className="shrink-0 px-3 xl:px-4">
          <div className={`flex items-center px-2 ${collapsed ? "justify-center" : "justify-between"}`}>
            <Link href="/app" className="flex items-center gap-2.5">
              <LogoMark size={32} />
              {!collapsed && <span className="text-body font-bold tracking-tight text-[var(--text)]">Draftpace</span>}
            </Link>
          </div>

          {collapsed ? (
            <Tooltip label="Search">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Search products and pages"
                className="mx-auto mt-5 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--faint)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
              >
                <Search size={15} aria-hidden />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="mt-5 flex w-full items-center gap-2.5 rounded-lg border border-[var(--border)] px-3 py-2 text-left text-body-sm text-[var(--faint)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
            >
              <Search size={15} aria-hidden />
              <span className="flex-1">Search</span>
              <kbd className="rounded border border-[var(--border-strong)] px-1 py-0.5 text-[10px] font-semibold">⌘K</kbd>
            </button>
          )}
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 xl:px-4">
          <nav aria-label="Platform" className="space-y-0.5">
            {primaryNav.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} />
            ))}
          </nav>

          {ownedProducts.length > 0 && (
            <>
              {collapsed ? (
                <div className="mt-6" />
              ) : (
                <button
                  type="button"
                  onClick={() => setCompanionsOpen((open) => !open)}
                  aria-expanded={companionsOpen}
                  className="mb-1.5 mt-6 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1 text-eyebrow font-bold uppercase text-[var(--faint)] transition-colors hover:text-[var(--text)]"
                >
                  My Companions
                  <CaretDown
                    size={12}
                    aria-hidden
                    className={`shrink-0 transition-transform duration-[var(--dur)] ease-[var(--ease-out)] ${companionsOpen ? "" : "-rotate-90"}`}
                  />
                </button>
              )}
              {(collapsed || companionsOpen) && (
                <nav aria-label="My Companions" className="space-y-0.5">
                  {ownedProducts.map((product) => (
                    <NavLink
                      key={product.slug}
                      item={{ label: product.title, href: product.href, Icon: product.Icon }}
                      active={
                        pathname.startsWith(`/app/companions/${product.slug}`) ||
                        pathname.startsWith(`/app/products/${product.slug}`)
                      }
                      collapsed={collapsed}
                    />
                  ))}
                </nav>
              )}
            </>
          )}

          <div className={collapsed ? "mt-6" : "mt-6 border-t border-[var(--border)] pt-5"}>
            <NavLink item={exploreCompanions} active={pathname === exploreCompanions.href} collapsed={collapsed} />
          </div>

          {!collapsed && (
            <p className="mb-1.5 mt-6 px-3 text-eyebrow font-bold uppercase text-[var(--faint)]">
              Account
            </p>
          )}
          <nav aria-label="Account" className={`space-y-0.5 ${collapsed ? "mt-6" : ""}`}>
            {accountNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href}
                icon={item.href === "/app/notifications" && hasUpdates ? BellRinging : undefined}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </div>

        <div className="shrink-0 space-y-0.5 border-t border-[var(--border)] px-3 pt-3 xl:px-4">
          {collapsed ? (
            <Tooltip label="Visit Draftpace website">
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              >
                <Globe size={17} aria-hidden />
                <span className="sr-only">Visit Draftpace website</span>
              </Link>
            </Tooltip>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-body-sm font-semibold text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
            >
              <Globe size={17} aria-hidden />
              Visit Draftpace website
            </Link>
          )}
          {collapsed ? (
            <Tooltip label="Sign out">
              <button
                type="button"
                onClick={() => signOutAndRedirect("/")}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
              >
                <LogOut size={17} aria-hidden />
                <span className="sr-only">Sign out</span>
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => signOutAndRedirect("/")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-body-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
            >
              <LogOut size={17} aria-hidden />
              Sign out
            </button>
          )}

          {collapsed ? (
            <Tooltip label="Expand sidebar">
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                className="flex h-9 w-9 items-center justify-center rounded-lg px-0 text-left text-body-sm font-semibold text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              >
                <CaretLineRight size={17} aria-hidden />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-body-sm font-semibold text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
            >
              <CaretLineLeft size={17} aria-hidden />
              Collapse
            </button>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[var(--app-bg)]">
        {/*
          Mobile: a floating card, not a docked bar — margin on every side so
          page background shows around it, rounded, blurred, shadowed once
          there's something to float over (the `scrolled` lift). This is the
          native-app register: the screen's own title carries identity, so
          no repeated "Draftpace" wordmark here, the way no iOS app prints
          its own name above every screen.
          Desktop (lg+): reverts to a conventional docked web-app bar —
          full-bleed, flat, bottom border — since the sidebar already owns
          the brand and a floating card reads as a mobile idiom, not a
          laptop one.
        */}
        <header className="sticky top-0 z-30 px-3 pt-3 pb-2 sm:px-4 lg:border-b lg:border-[var(--border)] lg:bg-[var(--surface)]/95 lg:px-8 lg:py-2.5 lg:backdrop-blur">
          <div
            className={`mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-[box-shadow,background-color,border-color,backdrop-filter] duration-[var(--dur)] ease-[var(--ease-out)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none ${
              scrolled
                ? "border border-[var(--border)] bg-[var(--surface)]/92 shadow-[shadow:var(--shadow-soft)] backdrop-blur-xl"
                : "border border-[var(--border)]/70 bg-[var(--surface)]/75 backdrop-blur-md"
            }`}
          >
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-heading-sm font-semibold tracking-tight text-[var(--text)]">
                {title || `Good ${dayPart ?? "day"}, ${firstName}`}
              </h1>
              {subtitle && <p className="mt-1 truncate text-caption leading-4 text-[var(--muted)]">{subtitle}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Search products and pages"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--faint)] transition active:scale-90 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] lg:rounded-lg lg:hidden"
              >
                <Search size={17} aria-hidden />
              </button>
              <div className="hidden sm:block">
                <ThemeToggle compact />
              </div>
              {/* Quiet by default, same rule the rest of the platform
                  follows: this used to show "Online" permanently, on
                  every page, which is chrome nobody asked to see and
                  breaks the site's own "stays silent until something is
                  genuinely worth raising" promise. It now only exists
                  the moment there's actually something to raise: you
                  went offline. Shown at every breakpoint once true,
                  since that's worth knowing on a phone as much as a
                  desktop. */}
              {!online && (
                <div className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--warning)] bg-[var(--warning-soft)] px-2.5 text-caption font-semibold text-[var(--warning)] lg:rounded-lg">
                  <WifiOff size={14} aria-hidden />
                  Offline
                </div>
              )}
              {action}
              <div className="lg:hidden">
                <AccountMenu items={accountItems} label={accountLabel} seed={accountSeed} only="mobile" />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">{children}</div>
      </main>

      {/* Mobile bottom nav: the four platform destinations, as a floating
          dock rather than a bar flush with the screen edge — separated
          from the content with real air and elevation instead of a flat
          divider line. Product destinations (This Month/Progress/History,
          etc.) live entirely inside ProductShell and never merge into
          this bar. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),12px)] z-40 lg:hidden"
      >
        <div className="mx-auto flex max-w-sm items-stretch gap-0.5 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/94 p-1.5 shadow-[shadow:var(--shadow-md)] backdrop-blur-xl">
          {BOTTOM_NAV_LINKS.map((item) => (
            <BottomNavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              icon={item.href === "/app/notifications" && hasUpdates ? BellRinging : undefined}
              // "Explore Companions" is the right label in the sidebar and
              // the command palette, where there's room for it — here it
              // only needs to fit a one-line tab next to Home/Notifications/
              // Account, and the two-line wrap was pushing its icon out of
              // line with the others.
              label={item.href === "/shop" ? "Explore" : undefined}
            />
          ))}
          <AccountMenu
            items={accountItems}
            label={accountLabel}
            seed={accountSeed}
            only="mobile"
            renderMobileTrigger={({ onClick, ref }) => (
              <button
                ref={ref}
                type="button"
                onClick={onClick}
                aria-label="Account menu"
                className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition-all duration-200 active:scale-[0.94] ${
                  accountActive ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--faint)]"
                }`}
              >
                {accountActive ? (
                  <Avatar label={accountLabel} seed={accountSeed} size="sm" className="h-5 w-5" />
                ) : (
                  <User size={20} aria-hidden />
                )}
                Account
              </button>
            )}
          />
        </div>
      </nav>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        products={ownedProducts}
        pages={[
          { label: "Home", href: "/app", Icon: Home },
          exploreCompanions,
          { label: "Redeem a code", href: "/app/redeem", Icon: Key },
          ...accountNav,
        ]}
      />
    </div>
  );
}

type NavItem = { label: string; href: string; Icon: DraftpaceIcon };

function NavLink({
  item,
  active,
  onClick,
  icon: IconOverride,
  collapsed = false,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
  icon?: DraftpaceIcon;
  collapsed?: boolean;
}) {
  const ItemIcon = IconOverride ?? item.Icon;
  const link = (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg text-body-sm font-semibold transition active:scale-[0.98] ${
        collapsed ? "h-9 w-9 justify-center" : "px-3 py-2.5"
      } ${
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
      }`}
    >
      <ItemIcon size={18} aria-hidden />
      {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
    </Link>
  );
  return collapsed ? <Tooltip label={item.label}>{link}</Tooltip> : link;
}

function BottomNavLink({
  item,
  active,
  icon: IconOverride,
  label,
}: {
  item: NavItem;
  active: boolean;
  icon?: DraftpaceIcon;
  /** Overrides item.label for this one tab, when the full label doesn't fit a single line here. */
  label?: string;
}) {
  const ItemIcon = IconOverride ?? item.Icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition-all duration-200 active:scale-[0.94] ${
        active ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--faint)] active:text-[var(--primary)]"
      }`}
    >
      <ItemIcon size={20} active={active} aria-hidden />
      {label ?? item.label}
    </Link>
  );
}

function getDayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/**
 * Device-level, cross-product install nudge shown on Platform Home — never
 * repeats after an explicit choice (accept, native dismiss, or "Not now"),
 * tracked in localStorage (src/lib/pwa/deviceOnboarding.ts), and hides
 * itself the moment this device is actually running standalone. On
 * Chromium it drives the real `beforeinstallprompt`/`userChoice` flow via
 * useInstallPrompt(); on iOS, which never fires that event, it falls back
 * to an instructional Add to Home Screen guide instead of a dead button.
 * Settings (src/app/app/settings/page.tsx) is the durable recovery surface
 * once this card has been dismissed.
 */
export function InstallPromptCard() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const standalone = useStandaloneMode();
  const [dismissed, setDismissed] = useState(true);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setDismissed(hasDismissedInstallPrompt());
    setIos(isIosDevice());
  }, []);

  const skip = () => {
    dismissInstallPrompt();
    setDismissed(true);
  };

  const install = async () => {
    const outcome = await promptInstall();
    if (outcome) dismissInstallPrompt();
  };

  if (standalone || dismissed) return null;
  if (!canInstall && !ios) return null;

  return (
    <section className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
        <Sparkles size={17} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold text-[var(--text)]">Keep Draftpace on your phone</p>
        <p className="text-caption leading-5 text-[var(--muted)]">
          {ios && !canInstall
            ? 'Tap Share, then "Add to Home Screen", then "Add".'
            : "Open straight into the platform like a real app."}
        </p>
      </div>
      {!(ios && !canInstall) && (
        <button
          onClick={install}
          className="shrink-0 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-caption font-semibold text-[var(--primary-contrast)]"
        >
          Install Draftpace
        </button>
      )}
      <button
        onClick={skip}
        className="shrink-0 rounded-lg px-2.5 py-2 text-caption font-semibold text-[var(--muted)] hover:text-[var(--text)]"
      >
        Not now
      </button>
    </section>
  );
}
