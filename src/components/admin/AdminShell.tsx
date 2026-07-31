"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Article,
  Bell,
  ChartBar,
  Check,
  CreditCard,
  Flag,
  Landmark,
  LifeBuoy,
  ShieldCheck,
  SquaresFour,
  User,
} from "@/design-system/Icon";
import ThemeToggle from "@/design-system/theme/ThemeToggle";

const NAV = [
  { href: "/admin", label: "Overview", Icon: SquaresFour },
  { href: "/admin/products", label: "Products", Icon: Article },
  { href: "/admin/product-families", label: "Product families", Icon: Flag },
  { href: "/admin/customers", label: "Customers", Icon: User },
  { href: "/admin/entitlements", label: "Entitlements", Icon: Check },
  { href: "/admin/commerce", label: "Commerce events", Icon: CreditCard },
  { href: "/admin/communications", label: "Communications", Icon: Bell },
  { href: "/admin/support", label: "Support", Icon: LifeBuoy },
  { href: "/admin/analytics", label: "Analytics", Icon: ChartBar },
  { href: "/admin/operations", label: "Operations", Icon: Landmark },
  { href: "/admin/audit", label: "Audit history", Icon: ShieldCheck },
];

/**
 * Denser, more operational than the customer platform shell — per the
 * Phase 2 brief. Still visually related (same tokens, same primitives).
 */
export default function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <aside className="hidden w-[224px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-3 py-4 lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center gap-2 px-2">
          <Image src="/logo/dp-mono.svg" alt="Draftpace" width={20} height={20} />
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Admin</span>
        </Link>
        <nav aria-label="Admin" className="mt-6 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] font-semibold transition ${
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                }`}
              >
                <item.Icon size={15} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-4">
          <Link href="/app" className="block px-2.5 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
            ← Back to platform
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-6">
          <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
          <ThemeToggle compact />
        </header>
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
