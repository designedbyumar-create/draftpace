"use client";

import { ThemeProvider } from "@/design-system/theme/ThemeProvider";
import PWARegister from "./PWARegister";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PWARegister />
      {children}
    </ThemeProvider>
  );
}
