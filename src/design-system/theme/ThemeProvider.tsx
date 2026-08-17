"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "draftpace-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "system" || stored === "light" || stored === "dark") return stored;
  return "system";
}

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

function resolveTheme(theme: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Must start at the same value the server rendered ("system"/false),
  // not a lazily-read localStorage value: the server has no localStorage,
  // so a client-only initial value here would mismatch the server-rendered
  // HTML on the very first hydration pass, breaking any descendant that
  // renders differently per theme (e.g. ThemeToggle's aria-checked). The
  // blocking inline script in app/layout.tsx already sets the *visual*
  // data-theme attribute on <html> before paint - this effect only needs
  // to bring React's own state in sync afterward, which happens in a
  // single extra client-only render immediately after hydration and is
  // never visible (the DOM already looked right for that whole time).
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  useEffect(() => {
    setThemeState(getInitialTheme());
    setSystemPrefersDark(getSystemPrefersDark());

    const media = window.matchMedia(DARK_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = useMemo(
    () => resolveTheme(theme, systemPrefersDark),
    [theme, systemPrefersDark]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = resolvedTheme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
