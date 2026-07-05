"use client";

import { ThemeProvider } from "./ThemeProvider";
import PWARegister from "./PWARegister";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PWARegister />
      {children}
    </ThemeProvider>
  );
}
