"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NEEDS } from "@/content/needs";
import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";
import {
  CalendarCheck,
  Check,
  Compass,
  GraduationCap,
  RotateCcw,
  SquaresFour,
  TrendingUp,
  type DraftpaceIcon,
} from "@/design-system/Icon";
import { EASE_OUT, SPRING, useCombinedReducedMotion } from "./motion";

const NEED_ICONS: Record<string, DraftpaceIcon> = {
  "getting-organized": SquaresFour,
  "planning-something-important": CalendarCheck,
  "keeping-something-moving": TrendingUp,
  "making-a-difficult-decision": Compass,
  "getting-back-on-track": RotateCcw,
  "learning-step-by-step": GraduationCap,
};

export default function NeedStep({
  selectedNeed,
  onSelect,
  onMatchChange,
}: {
  selectedNeed: string | null;
  onSelect: (slug: string) => void;
  onMatchChange: (match: { title: string; href: string } | null) => void;
}) {
  const reduceMotion = useCombinedReducedMotion();

  useEffect(() => {
    registerRealShopProducts();
  }, []);

  const active = useMemo(() => NEEDS.find((need) => need.slug === selectedNeed) ?? null, [selectedNeed]);

  const matchedProduct = useMemo(() => {
    if (!selectedNeed) return null;
    return (
      shopRegistry
        .listPublished()
        .find(
          (product) =>
            product.needGroups.includes(selectedNeed) &&
            product.access === "free" &&
            product.availability === "available" &&
            product.purchaseAction
        ) ?? null
    );
  }, [selectedNeed]);

  useEffect(() => {
    onMatchChange(
      matchedProduct && matchedProduct.purchaseAction
        ? { title: matchedProduct.title, href: matchedProduct.purchaseAction.href }
        : null
    );
    // onMatchChange is a stable setter from the parent, intentionally excluded to avoid re-running on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedProduct]);

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">One thing first</p>
      <h1 className="mt-3 font-serif text-[26px] font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[28px]">
        What brings you here?
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
        Pick the one that&apos;s closest. You can explore the rest anytime from the Store.
      </p>

      <div role="radiogroup" aria-label="What brings you here" className="mt-6 grid grid-cols-2 gap-2">
        {NEEDS.map((need) => {
          const Icon = NEED_ICONS[need.slug] ?? SquaresFour;
          const isActive = need.slug === selectedNeed;
          return (
            <button
              key={need.slug}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(need.slug)}
              className={`relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                isActive
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isActive ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "bg-[var(--surface-muted)] text-[var(--primary)]"
                }`}
              >
                <Icon size={16} aria-hidden />
              </span>
              <span className="text-[13px] font-semibold leading-tight text-[var(--text)]">{need.label}</span>
              {isActive && (
                <motion.span
                  initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                  className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]"
                >
                  <Check size={11} aria-hidden />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="rounded-lg bg-[var(--surface-muted)] p-3.5"
            >
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">{active.situation}</p>
              {matchedProduct && (
                <motion.p
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.13, ease: EASE_OUT }}
                  className="mt-2 text-[13px] font-semibold text-[var(--primary)]"
                >
                  There&apos;s a free product for exactly this: {matchedProduct.title}.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
