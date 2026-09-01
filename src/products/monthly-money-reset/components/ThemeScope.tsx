"use client";

import { useTheme } from "@/design-system/theme/ThemeProvider";
import { monthlyMoneyResetThemeVars } from "../theme";

/**
 * Wraps every Monthly Money Reset module so its forest/sage/ivory/clay
 * palette is available as --mmr-* CSS variables, reactively following the
 * platform's own light/dark resolution (system or explicit) with no
 * separate theme toggle of its own — the product's colors change, the
 * platform's theme model doesn't gain a second mode.
 */
export default function ThemeScope({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return <div style={monthlyMoneyResetThemeVars(resolvedTheme)}>{children}</div>;
}
