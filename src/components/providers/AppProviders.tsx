"use client";

import { ThemeProvider } from "@/design-system/theme/ThemeProvider";
import { AccessibilityProvider } from "@/design-system/theme/AccessibilityProvider";
import PWARegister from "./PWARegister";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <PWARegister />
        {children}
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
