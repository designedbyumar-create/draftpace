"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type TextScale = "default" | "large" | "larger";

type AccessibilityContextValue = {
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const TEXT_SCALE_KEY = "draftpace-text-scale";
const REDUCE_MOTION_KEY = "draftpace-reduce-motion";

function readTextScale(): TextScale {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(TEXT_SCALE_KEY);
  if (stored === "default" || stored === "large" || stored === "larger") return stored;
  return "default";
}

function readReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(REDUCE_MOTION_KEY) === "true";
}

/**
 * A real, working accessibility preference — not just passive support for
 * the OS-level prefers-reduced-motion / browser zoom. Explicit overrides a
 * user can set regardless of their device defaults.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [textScale, setTextScaleState] = useState<TextScale>("default");
  const [reduceMotion, setReduceMotionState] = useState(false);

  useEffect(() => {
    setTextScaleState(readTextScale());
    setReduceMotionState(readReduceMotion());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.textScale = textScale;
    window.localStorage.setItem(TEXT_SCALE_KEY, textScale);
  }, [textScale]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
    window.localStorage.setItem(REDUCE_MOTION_KEY, String(reduceMotion));
  }, [reduceMotion]);

  const value = useMemo(
    () => ({
      textScale,
      setTextScale: setTextScaleState,
      reduceMotion,
      setReduceMotion: setReduceMotionState,
    }),
    [textScale, reduceMotion]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used inside AccessibilityProvider");
  return context;
}
