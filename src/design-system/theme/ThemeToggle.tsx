"use client";

import { Desktop, Moon, Sun } from "@/design-system/Icon";
import { ThemeMode, useTheme } from "@/design-system/theme/ThemeProvider";

const OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Desktop },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-soft)]"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={`flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-[12px] font-semibold transition-all ${
              active
                ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Icon size={14} aria-hidden />
            {!compact && <span>{label}</span>}
            {compact && <span className="sr-only">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
