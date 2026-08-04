"use client";

import { motion } from "framer-motion";
import type { ThemeMode } from "@/design-system/theme/ThemeProvider";
import { Check, Desktop, Moon, Sun } from "@/design-system/Icon";
import { SPRING, useCombinedReducedMotion } from "./motion";

const THEME_OPTIONS: { value: ThemeMode; label: string; desc: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", desc: "Matches your device automatically.", Icon: Desktop },
  { value: "light", label: "Light", desc: "A bright, crisp workspace.", Icon: Sun },
  { value: "dark", label: "Dark", desc: "Dark and easy on the eyes.", Icon: Moon },
];

export default function WelcomeStep({
  name,
  theme,
  onSelectTheme,
}: {
  name: string;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}) {
  const reduceMotion = useCombinedReducedMotion();

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Welcome to Draftpace</p>
      <h1 className="mt-3 font-serif text-[28px] font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[32px]">
        Good to see you, {name}.
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
        Pick how this should look. It changes right now, not after you finish.
      </p>

      <div role="group" aria-label="Theme" className="mt-6 grid gap-2">
        {THEME_OPTIONS.map(({ value, label, desc, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectTheme(value)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary)]">
                <Icon size={18} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[var(--text)]">{label}</p>
                <p className="text-[12.5px] leading-5 text-[var(--muted)]">{desc}</p>
              </div>
              {active && (
                <motion.span
                  initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]"
                >
                  <Check size={13} aria-hidden />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
