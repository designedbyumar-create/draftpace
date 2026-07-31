import type { Metadata } from "next";
import AuthGate from "@/design-system/shell/AuthGate";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
