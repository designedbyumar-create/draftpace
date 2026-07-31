import type { Metadata } from "next";
import AuthGate from "@/design-system/shell/AuthGate";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Architecture scaffolding only (docs/ADMIN-AND-OPERATIONS.md). Reachability
 * is already gated in middleware.ts via isAdminEnabled() — this layout adds
 * the same session requirement as the customer platform, with no role model
 * yet. requireOnboarding is off: admin access isn't part of the customer
 * onboarding flow.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate requireOnboarding={false}>{children}</AuthGate>;
}
