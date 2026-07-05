"use client";

import { Moon, Sparkles, Sun } from "@/components/ui/Icon";
import { ThemeMode, useTheme } from "@/components/providers/ThemeProvider";

const OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "calm", label: "Calm", Icon: Sparkles },
  { value: "calm-dark", label: "Dark", Icon: Moon },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-soft)]">
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            className={`flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-[12px] font-semibold transition-all ${
              active
                ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Icon size={14} />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
