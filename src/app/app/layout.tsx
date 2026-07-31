import type { Metadata } from "next";
import AuthGate from "@/design-system/shell/AuthGate";
import { registerDevFixtures } from "@/product-framework/fixtures";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Registers the internal development fixtures (no-op outside dev/beta with
// fixtures enabled — see docs/DATA-BOUNDARIES.md) before any /app route,
// including nested /app/products/[productSlug]/*, can read the registry.
registerDevFixtures();

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
