import { BookOpen, CreditCard, Globe, Home, LifeBuoy, LogOut, Settings, User } from "@/design-system/Icon";
import type { AccountMenuItem } from "./AccountMenu";

/**
 * The two account-menu configurations used across the app, pure data, no
 * component duplication. "Visit Draftpace website" and "Open Draftpace" are
 * both plain internal links (/ and /app); neither touches the session, so
 * routing between them never signs anyone out.
 */
export function appAccountMenuItems(onSignOut: () => void): AccountMenuItem[] {
  return [
    { key: "account", label: "Account", href: "/app/account", icon: User },
    { key: "settings", label: "Settings", href: "/app/settings", icon: Settings },
    { key: "billing", label: "Billing", href: "/app/billing", icon: CreditCard },
    { key: "support", label: "Support", href: "/app/support", icon: LifeBuoy },
    { key: "visit-site", label: "Visit Draftpace website", href: "/", icon: Globe },
    { key: "sign-out", label: "Sign out", onSelect: onSignOut, icon: LogOut, tone: "danger" },
  ];
}

export function publicSignedInAccountMenuItems(onSignOut: () => void): AccountMenuItem[] {
  return [
    { key: "open-app", label: "Open Draftpace", href: "/app", icon: Home },
    { key: "library", label: "Library", href: "/app/library", icon: BookOpen },
    { key: "account", label: "Account", href: "/app/account", icon: User },
    { key: "sign-out", label: "Sign out", onSelect: onSignOut, icon: LogOut, tone: "danger" },
  ];
}
