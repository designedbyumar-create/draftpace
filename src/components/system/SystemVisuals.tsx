"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { SystemVisualKind } from "@/lib/systems";

export function SystemPattern({
  accent,
  secondary,
  className = "",
}: {
  accent: string;
  secondary: string;
  className?: string;
}) {
  const id = useId();

  return (
    <svg className={className} viewBox="0 0 420 240" aria-hidden="true">
      <defs>
        <pattern id={`${id}-grid`} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeOpacity="0.12" />
        </pattern>
        <linearGradient id={`${id}-sweep`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="56%" stopColor={secondary} stopOpacity="0.1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" fill={`url(#${id}-grid)`} />
      <motion.path
        d="M28 184 C98 102 148 204 228 108 C286 38 330 88 394 44"
        fill="none"
        stroke={`url(#${id}-sweep)`}
        strokeWidth="42"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

export function SystemBook({
  visualKind,
  accent,
  secondary,
  title,
}: {
  visualKind: SystemVisualKind;
  accent: string;
  secondary: string;
  title: string;
}) {
  return (
    <div className="relative min-h-[230px] overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
      <SystemPattern accent={accent} secondary={secondary} className="absolute inset-0 h-full w-full text-[var(--text)]" />
      <motion.div
        className="absolute inset-x-6 bottom-5 top-7 rounded-[24px] border border-white/25 shadow-[0_28px_70px_rgba(15,23,42,0.22)]"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${secondary})`,
          transformOrigin: "left center",
        }}
        initial={{ rotateY: -8, x: -8, opacity: 0.86 }}
        animate={{ rotateY: 0, x: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <div className="absolute inset-y-0 left-7 w-px bg-white/30" />
        <div className="absolute inset-y-0 left-10 w-6 bg-black/10" />
        <div className="flex h-full flex-col justify-between p-5 text-white">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Draftpace System</p>
            <p className="mt-3 max-w-[12rem] text-[26px] font-black leading-none tracking-tight">{title}</p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <SystemMonogram visualKind={visualKind} />
            <div className="h-16 w-16 rounded-full border border-white/35 bg-white/10" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function SystemMonogram({
  visualKind,
  className = "h-16 w-16",
}: {
  visualKind: SystemVisualKind;
  className?: string;
}) {
  if (visualKind === "savings") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <rect x="9" y="16" width="46" height="33" rx="7" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M11 22 L32 36 L53 22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <motion.path
          d="M22 44 H42"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.45, duration: 0.45 }}
        />
      </svg>
    );
  }

  if (visualKind === "focus") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
        <motion.path
          d="M32 16 V8 M32 56 V48 M48 32 H56 M8 32 H16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.35, duration: 0.55 }}
        />
      </svg>
    );
  }

  if (visualKind === "health") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path
          d="M32 52 C22 43 14 36 14 26 C14 18 20 14 27 18 C29 19 31 21 32 23 C33 21 35 19 37 18 C44 14 50 18 50 26 C50 36 42 43 32 52Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <motion.path
          d="M24 32 H30 L33 26 L37 38 L40 32 H46"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.35, duration: 0.55 }}
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="12" y="10" width="40" height="44" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M22 24 H42 M22 34 H34 M22 44 H39" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <motion.path
        d="M39 33 L44 38 L36 46"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.45, duration: 0.55 }}
      />
    </svg>
  );
}

export function MomentumRing({
  value,
  accent,
  label = "Momentum",
}: {
  value: number;
  accent: string;
  label?: string;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full rotate-[-90deg]" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-strong)" strokeWidth="10" />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={accent}
          strokeLinecap="round"
          strokeWidth="10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: safeValue / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-black leading-none text-[var(--text)]">{safeValue}</span>
        <span className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--faint)]">{label}</span>
      </div>
    </div>
  );
}

export function SavingsMapVisual({
  completed,
  total,
  accent,
}: {
  completed: number;
  total: number;
  accent: string;
}) {
  const cells = Array.from({ length: total }, (_, index) => index);

  return (
    <div className="grid grid-cols-5 gap-2">
      {cells.map((cell) => {
        const active = cell < completed;
        const next = cell === completed;
        return (
          <motion.div
            key={cell}
            className="relative aspect-[1.18] overflow-hidden rounded-xl border"
            style={{
              borderColor: active || next ? accent : "var(--border)",
              background: active ? accent : "var(--surface-muted)",
            }}
            initial={false}
            animate={{ scale: next ? [1, 1.04, 1] : 1 }}
            transition={{ duration: 0.7 }}
          >
            <svg viewBox="0 0 46 38" className="h-full w-full" aria-hidden="true">
              <path
                d="M5 12 L23 24 L41 12"
                fill="none"
                stroke={active ? "rgba(255,255,255,0.72)" : "var(--faint)"}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {active && (
                <motion.path
                  d="M15 20 L21 26 L32 14"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35 }}
                />
              )}
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}

export function BudgetMapVisual({
  completed,
  total,
  accent,
  secondary,
}: {
  completed: number;
  total: number;
  accent: string;
  secondary: string;
}) {
  const bars = [0.42, 0.68, 0.54, 0.78, 0.36, 0.61];
  const progress = Math.min(1, completed / Math.max(total, 1));

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <svg viewBox="0 0 320 150" className="h-40 w-full" aria-hidden="true">
        <path d="M22 120 H298" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
        {bars.map((bar, index) => {
          const height = 88 * bar;
          const filled = index / bars.length <= progress;
          return (
            <motion.rect
              key={index}
              x={34 + index * 45}
              y={120 - height}
              width="24"
              height={height}
              rx="8"
              fill={filled ? accent : "var(--surface-strong)"}
              initial={{ scaleY: 0.35, transformOrigin: "bottom" }}
              animate={{ scaleY: filled ? 1 : 0.72 }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
            />
          );
        })}
        <motion.path
          d="M44 82 C86 58 116 98 154 70 S226 44 276 63"
          fill="none"
          stroke={secondary}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.2, progress) }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

export function DaySeal({
  label,
  accent,
}: {
  label: string;
  accent: string;
}) {
  return (
    <motion.div
      className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 bg-[var(--surface)]"
      style={{ borderColor: accent, color: accent }}
      initial={{ scale: 0.78, rotate: -8, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <svg viewBox="0 0 112 112" className="absolute inset-2" aria-hidden="true">
        <motion.circle
          cx="56"
          cy="56"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 7"
          strokeWidth="2"
          initial={{ rotate: -30 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.65 }}
        />
      </svg>
      <span className="max-w-[72px] text-center text-[11px] font-black uppercase leading-4 tracking-[0.12em]">
        {label}
      </span>
    </motion.div>
  );
}
